import express from "express"
import cors from "cors";
import {z} from "zod";
import {UserSchema} from "./types/user";
import jsonwebtoken from "jsonwebtoken";
import {PrismaClient} from "@prisma/client";
import {middleware} from "./Middleware/middleware";
import {RoomSchema} from "./types/room";

require('dotenv').config()

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    credentials: true,
    origin: ["https://monitordevices.vercel.app", "http://localhost:3000" , (process.env.FRONTEND_URL  || 'http://0.0.0.0:3000')],
    allowedHeaders: ["Content-Type", "authorization"],
}));
const prisma = new PrismaClient();
// Sign In Types
const signInType = z.object({
    username: z.string().min(3).max(20),
    password: z.string().min(8),
})


// Sign up
app.post("/backend/signUp" , async(req , res) : Promise<any> =>{
    const data = UserSchema.safeParse(req.body)
    if(!data.success){
        return res.status(400).json({error: data.error})
    }
    try {
        const user = await prisma.user.create({
            data: {
                username: data.data.username,
                password: data.data.password,
                name: data.data.name
            }
        })
        return res.status(200).json({message: "User Created Successfully"})
    }catch (e) {
        console.log(e);
        return  res.status(500).json({error: "Internal Server Error"})
    }
})


// SignIn

app.post("/backend/signIn" , async(req  , res) : Promise<any> =>{
    const data = signInType.safeParse(req.body)
    if(!data.success){
        return res.status(400).json({error: data.error})
    }
    try {
        const user = await prisma.user.findFirst({
            where: {
                username: data.data.username,
                password: data.data.password
            }
        })
        if(user === null){
            return res.status(400).json({error: "Invalid Username or Password"})
        }
        const token = jsonwebtoken.sign({id: user.id} , "secret")
        return res.status(200).json({token})
    }catch (e) {
        console.log("Internal Server Error : " , e);
        return res.status(500).json({error: "Internal Server Error"})
    }
})


// Create Room
app.post('/backend/createRoom' , middleware , async (req , res) : Promise<any> => {
    const safeData = RoomSchema.safeParse(req.body);
    if(!safeData.data){
        return res.status(400).json({error: safeData.error})
    }
    try{
        const room = await prisma.room.create({
            data: {
                slug: safeData.data.name,
                adminId: req.body.userId
            }
        })
        return res.status(200).json({room : room})
    }catch (e) {
        return res.status(500).json({error: "Internal Server Error"})
    }
})

// Get The Messages from a Room
app.get("/backend/getMessages/:roomId" , async (req ,res) : Promise<any> =>{
    const roomId = req.params.roomId;
    try{
        const messages = await prisma.chat.findMany({
            where: {
                roomId: parseInt(roomId)
            },
            orderBy : {
                id : 'desc'
            },
            take : 100
        })
        return res.status(200).json({messages})
    }catch (e) {
        return res.status(500).json({error: "Internal Server Error"})
    }
})

// Get The Room Details

app.get("/backend/getRoom/:slug" , async (req , res) : Promise<any> =>{
    const slug = req.params.slug;
    try{
        const room = await prisma.room.findFirst({
            where: {
                slug
            }
        })
        if(room === null){
            return res.status(404).json({error: "Room Not Found"})
        }
        return res.status(200).json({room})
    }catch (e) {
        return res.status(500).json({error: "Internal Server Error"})
    }
})

app.get("/backend" , (req, res) : any =>{
    return  res.send("Hello World") ;
})

app.listen(5000, () => {
    console.log("Server is running on port 5000")
})