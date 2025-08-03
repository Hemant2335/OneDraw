import {WebSocket, WebSocketServer} from "ws"
import jwt from "jsonwebtoken";
import {PrismaClient} from "@prisma/client";

const wss = new WebSocketServer({port:8080} ,()=>{
    console.log("Websocket Server Started");
});

interface User {
    userId : string,
    ws : WebSocket,
    rooms : string[],
}

const users : User[] = [];
const prisma  = new PrismaClient();

// Function to get participants in a room
const getParticipantsInRoom = (roomId: string) => {
    return users.filter(user => user.rooms.includes(roomId));
};

// Function to broadcast participants list to all users in a room
const broadcastParticipants = (roomId: string) => {
    const participants = getParticipantsInRoom(roomId);
    const participantsData = participants.map(user => ({
        userId: user.userId,
        // You can add more user details here if needed
    }));

    console.log(`Broadcasting participants for room ${roomId}:`, participantsData.map(p => p.userId));

    participants.forEach(user => {
        if (user.ws.readyState === WebSocket.OPEN) {
            user.ws.send(JSON.stringify({
                type: "participantsUpdate",
                participants: participantsData,
                roomId: roomId
            }));
        }
    });
};

const CheckUser = (token : string) =>{
    try{
        const decoded = jwt.verify(token , "secret");
        if(typeof decoded === "string"){
            return null;
        }
        if(!decoded || !decoded.id){
            return null;
        }

        return decoded.id;

    }catch (e) {
        return null;
    }

}

wss.on("connection" , (ws , request)=>{
    const url = request.url;
    if(!url){
        return;
    }
    try{
        const queryParams = new URLSearchParams(url.split('?')[1]);
        const token = queryParams.get("token") || " ";
        const userId = CheckUser(token);
        if(!userId){
            console.log("No UserId found");
            ws.close();
            return;
        }

        const newUser : User  = {
            userId: userId,
            ws: ws,
            rooms: []
        }
        console.log("Got New Connection" , userId);
        users.push(newUser);
    }catch (e) {
        console.log(e);
        return ws.close();
    }
    ws.on("message" , async (message)=>{
        let data : any;
        if(typeof  message != "string"){
            data = JSON.parse(message.toString());
        }else{
            data = JSON.parse(message);
        }

        if(data.type === "joinRoom"){
           const user = users.find((el => el.ws === ws));
           console.log("joinroom" , user , data);
           user?.rooms.push(data.roomId);
           
           // Broadcast updated participants list to all users in the room
           broadcastParticipants(data.roomId);
        }

        if(data.type === "leaveRoom"){
            const user = users.find((el => el.ws === ws));
            if(!user){
                return ;
            }
            user.rooms = user?.rooms.filter((el => el !== data.roomId));
            
            // Broadcast updated participants list to all users in the room
            broadcastParticipants(data.roomId);
        }

        if(data.type === "move"){
            const  roomId = data.roomId;
            const userId = users.find((el => el.ws === ws))?.userId;
            if(!userId || !data.shape){
                return ;
            }
            // Update the Shape in the Database
            const shape = await prisma.chat.update({
                where: {
                    id: data.shape.id
                },
                data:{
                    message: JSON.stringify(data.shape)
                }
            })

            const message = JSON.stringify(data.shape);

            users.forEach((el) => {
                if (el.rooms.includes(data.roomID)) {
                    el.ws.send(
                        JSON.stringify({
                            type: "move",
                            message: message,
                            userId: userId,
                        })
                    );
                }
            });
        }


        if (data.type === "msg") {
            const roomId = data.roomID;
            console.log("Room ID:", roomId, typeof roomId);

            if (!roomId) {
                console.log("Error: roomID is missing or invalid.");
                return;
            }

            const userId = users.find((el) => el.ws === ws)?.userId;
            const message = JSON.stringify(data.shape);

            if (!userId) {
                return;
            }

            try {
                // Check if the Room Exists
                const room = await prisma.room.findUnique({
                    where: { id: roomId.toString() },
                });
                if (!room) {
                    console.log("Room not found:", roomId);
                    return;
                }
                const chat = await prisma.chat.create({
                    data: {
                        id: data.shape.id,
                        roomId: roomId.toString(),
                        userId: userId,
                        message: message,
                    },
                });
                console.log(users, "RoomID", data.roomID);
                users.forEach((el) => {
                    if (el.rooms.includes(data.roomID)) {
                        el.ws.send(
                            JSON.stringify({
                                type: "msg",
                                message: message,
                                userId: userId,
                            })
                        );
                    }
                });
            } catch (e) {
                console.log(e);
            }
        }

        // Handle cursor movement
        if (data.type === "cursorMove") {
            const roomId = data.roomId;
            const userId = users.find((el) => el.ws === ws)?.userId;
            
            if (!roomId || !userId) {
                return;
            }

            // Broadcast cursor position to all users in the room (except sender)
            users.forEach((el) => {
                if (el.rooms.includes(roomId) && el.userId !== userId) {
                    if (el.ws.readyState === WebSocket.OPEN) {
                        el.ws.send(
                            JSON.stringify({
                                type: "cursorMove",
                                userId: userId,
                                x: data.x,
                                y: data.y,
                                roomId: roomId
                            })
                        );
                    }
                }
            });
        }
    })

    // Handle user disconnection
    ws.on("close", () => {
        const user = users.find((el) => el.ws === ws);
        if (user) {
            console.log(`User ${user.userId} disconnected from rooms:`, user.rooms);
            
            // Store the rooms the user was in before removing them
            const userRooms = [...user.rooms];
            
            // Remove user from users array FIRST
            const userIndex = users.findIndex((el) => el.ws === ws);
            if (userIndex !== -1) {
                users.splice(userIndex, 1);
                console.log(`Removed user ${user.userId} from users array. Remaining users:`, users.length);
            }
            
            // THEN broadcast participants update for all rooms the user was in
            userRooms.forEach(roomId => {
                console.log(`Broadcasting participants update for room ${roomId}`);
                broadcastParticipants(roomId);
            });
        }
    });

})

