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
        }

        if(data.type === "leaveRoom"){
            const user = users.find((el => el.ws === ws));
            if(!user){
                return ;
            }
            user.rooms = user?.rooms.filter((el => el !== data.roomId));
        }


        if(data.type === "msg"){
            const  roomId = data.roomID;
            console.log(roomId , typeof roomId);
            const userId = users.find((el => el.ws === ws))?.userId;
            const message = JSON.stringify(data.shape);
            if(!userId){
                return ;
            }
            try{
                // Check if the Room Exists
                const room = await prisma.room.findUnique({
                    where: { id: roomId.toString() },
                });
                if (!room) {
                    console.log("Room not found:", roomId);
                    return;
                }


                const chat =  await prisma.chat.create({
                    data : {
                        roomId: roomId.toString(),
                        userId: userId,
                        message: message
                    }
                })
                console.log(users , "RoomID" , data.roomID);
                users.forEach((el)=>{
                    if(el.rooms.includes(data.roomID)){
                        el.ws.send(JSON.stringify({
                            type: "msg",
                            message: message,
                            userId: userId
                        }))
                    }
                })
            }catch (e) {
                console.log(e);
            }

        }
    })


})

