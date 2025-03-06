"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const zod_1 = require("zod");
const user_1 = require("./types/user");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const middleware_1 = require("./Middleware/middleware");
const room_1 = require("./types/room");
require('dotenv').config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    credentials: true,
    origin: ["https://monitordevices.vercel.app", "http://localhost:3000", (process.env.FRONTEND_URL || 'http://0.0.0.0:3000')],
    allowedHeaders: ["Content-Type", "authorization"],
}));
const prisma = new client_1.PrismaClient();
// Sign In Types
const signInType = zod_1.z.object({
    username: zod_1.z.string().min(3).max(20),
    password: zod_1.z.string().min(8),
});
// Sign up
app.post("/signUp", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = user_1.UserSchema.safeParse(req.body);
    if (!data.success) {
        return res.status(400).json({ error: data.error });
    }
    try {
        const user = yield prisma.user.create({
            data: {
                username: data.data.username,
                password: data.data.password,
                name: data.data.name
            }
        });
        return res.status(200).json({ message: "User Created Successfully" });
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}));
// SignIn
app.post("/signIn", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = signInType.safeParse(req.body);
    if (!data.success) {
        return res.status(400).json({ error: data.error });
    }
    try {
        const user = yield prisma.user.findFirst({
            where: {
                username: data.data.username,
                password: data.data.password
            }
        });
        if (user === null) {
            return res.status(400).json({ error: "Invalid Username or Password" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, "secret");
        return res.status(200).json({ token });
    }
    catch (e) {
        console.log("Internal Server Error : ", e);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}));
// Create Room
app.post('/createRoom', middleware_1.middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const safeData = room_1.RoomSchema.safeParse(req.body);
    if (!safeData.data) {
        return res.status(400).json({ error: safeData.error });
    }
    try {
        const room = yield prisma.room.create({
            data: {
                slug: safeData.data.name,
                adminId: req.body.userId
            }
        });
        return res.status(200).json({ room: room });
    }
    catch (e) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
}));
// Get The Messages from a Room
app.get("/getMessages/:roomId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roomId = req.params.roomId;
    try {
        const messages = yield prisma.chat.findMany({
            where: {
                roomId: parseInt(roomId)
            },
            orderBy: {
                id: 'desc'
            },
            take: 100
        });
        return res.status(200).json({ messages });
    }
    catch (e) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
}));
// Get The Room Details
app.get("/getRoom/:slug", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = req.params.slug;
    try {
        const room = yield prisma.room.findFirst({
            where: {
                slug
            }
        });
        if (room === null) {
            return res.status(404).json({ error: "Room Not Found" });
        }
        return res.status(200).json({ room });
    }
    catch (e) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
}));
app.get("/", (req, res) => {
    return res.send("Hello World");
});
app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
