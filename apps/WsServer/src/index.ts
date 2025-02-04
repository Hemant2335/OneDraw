
import {WebSocketServer , WebSocket} from "ws"
import jwt from "jsonwebtoken";
import {prisma} from "@repo/db/src/index";

const wss = new WebSocketServer({port:8080});

interface User {
    userId : string,
    ws : WebSocket,
    rooms : string[],
}

const users : User[] = [];


const CheckUser = (token : string) =>{
    try{
        const decoded = jwt.verify(token , "secret");
        if(typeof decoded === "string"){
            return null;
        }

        if(!decoded || !decoded.Id){
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
            ws.close();
            return;
        }

        const newUser : User  = {
            userId: userId,
            ws: ws,
            rooms: []
        }
        users.push(newUser);
    }catch (e) {
        return ws.close();
    }
    ws.on("message" , async (message)=>{
        let data;
        if(typeof  message != "string"){
            data = JSON.parse(message.toString());
        }else{
            data = JSON.parse(message);
        }

        if(data.type === "joinRoom"){
           const user = users.find((el => el.ws === ws));
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
            const  roomId = data.roomId;
            const userId = users.find((el => el.ws === ws))?.userId;
            const message = data.message;
            if(!userId){
                return ;
            }
            const chat =  await prisma.chat.create({
                data : {
                    roomId: roomId,
                    userId: userId,
                    message: message
                }
            })

            users.forEach((el)=>{
                if(el.rooms.includes(data.room)){
                    el.ws.send(JSON.stringify({
                        type: "msg",
                        message: message,
                        userId: userId
                    }))
                }
            })
        }
    })


})

