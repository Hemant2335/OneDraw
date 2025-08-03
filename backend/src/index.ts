import express from "express"
import cors from "cors";
import {z} from "zod";
import {UserSchema} from "./types/user";
import jsonwebtoken from "jsonwebtoken";
import {PrismaClient} from "@prisma/client";
import {middleware} from "./Middleware/middleware";

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

// Get User Details by ID
app.get("/backend/getUser/:userId", async (req, res): Promise<any> => {
    const userId = req.params.userId;
    
    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }
    
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                name: true,
                username: true,
                // Exclude password for security
            }
        });
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        return res.status(200).json({ user });
    } catch (e) {
        console.log("Error fetching user:", e);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get Multiple Users by IDs
app.post("/backend/getUsers", async (req, res): Promise<any> => {
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds)) {
        return res.status(400).json({ error: "User IDs array is required" });
    }
    
    try {
        const users = await prisma.user.findMany({
            where: {
                id: {
                    in: userIds
                }
            },
            select: {
                id: true,
                name: true,
                username: true,
                // Exclude password for security
            }
        });
        
        return res.status(200).json({ users });
    } catch (e) {
        console.log("Error fetching users:", e);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

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
        return res.status(400).json({status : false , error: data.error})
    }
    try {
        const user = await prisma.user.findFirst({
            where: {
                username: data.data.username,
                password: data.data.password
            },
            select :{
                id: true,
                name: true,
                username: true,
                Rooms : true,
            }
        })
        if(user === null){
            return res.status(400).json({status : false , error: "Invalid Username or Password"})
        }
        const token = jsonwebtoken.sign({id: user.id} , "secret")
        return res.status(200).json({status : true , token ,user})
    }catch (e) {
        console.log("Internal Server Error : " , e);
        return res.status(500).json({status : false , error: "Internal Server Error"})
    }
})

const createName = () => {
    return Math.random().toString(36).substring(7);
}


// Create Room
app.post('/backend/createRoom' , middleware , async (req , res) : Promise<any> => {

    const RoomName = createName();
    try{
        // Check if the Room with userId Already Exists
        const Checkroom = await prisma.room.findFirst({
            where: {
                adminId: req.body.userId
            }
        })
        if(Checkroom){
            return res.status(200).json({status : true , message : "Room Found" , room : Checkroom})
        }
        const room = await prisma.room.create({
            data: {
                slug: RoomName,
                adminId: req.body.userId
            }
        })
        return res.status(200).json({status : true , message : "Created New Room" , room : room})
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
                roomId: roomId
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
            return res.status(200).json({error: "Room Not Found"})
        }
        return res.status(200).json({room})
    }catch (e) {
        return res.status(500).json({error: "Internal Server Error"})
    }
})

app.get("/backend/checkIfLocked/:shapeId" , middleware , async (req , res) : Promise<any> =>{
    const shapeId = req.params.shapeId;
    try{
        const shape = await prisma.chat.findUnique({
            where: {
                id: shapeId
            }
        })
        if(shape === null){
            return res.status(200).json({error: "Shape Not Found"})
        }
        if(shape.lockedBy && shape.lockedBy != req.body.userId){
            return res.status(200).json({isLocked: true});
        }
        // If the shape is not locked by anyone then Lock the Shape
        if(!shape.lockedBy){
            await prisma.chat.update({
                where: {
                    id: shapeId
                },
                data: {
                    lockedBy: req.body.userId,
                    lockedAt: new Date(),
                    lockExpire: new Date(Date.now() + 5 * 60 * 1000) // Lock for 5 minutes
                }
            })
        }
        return  res.status(200).json({isLocked: false});
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