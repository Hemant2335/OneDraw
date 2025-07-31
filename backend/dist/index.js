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
app.post("/backend/signUp", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
app.post("/backend/signIn", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = signInType.safeParse(req.body);
    if (!data.success) {
        return res.status(400).json({ status: false, error: data.error });
    }
    try {
        const user = yield prisma.user.findFirst({
            where: {
                username: data.data.username,
                password: data.data.password
            },
            select: {
                id: true,
                name: true,
                username: true,
                Rooms: true,
            }
        });
        if (user === null) {
            return res.status(400).json({ status: false, error: "Invalid Username or Password" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, "secret");
        return res.status(200).json({ status: true, token, user });
    }
    catch (e) {
        console.log("Internal Server Error : ", e);
        return res.status(500).json({ status: false, error: "Internal Server Error" });
    }
}));
const createName = () => {
    return Math.random().toString(36).substring(7);
};
// Create Room
app.post('/backend/createRoom', middleware_1.middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const RoomName = createName();
    try {
        // Check if the Room with userId Already Exists
        const Checkroom = yield prisma.room.findFirst({
            where: {
                adminId: req.body.userId
            }
        });
        if (Checkroom) {
            return res.status(200).json({ status: true, message: "Room Found", room: Checkroom });
        }
        const room = yield prisma.room.create({
            data: {
                slug: RoomName,
                adminId: req.body.userId
            }
        });
        return res.status(200).json({ status: true, message: "Created New Room", room: room });
    }
    catch (e) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
}));
// Get The Messages from a Room
app.get("/backend/getMessages/:roomId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roomId = req.params.roomId;
    try {
        const messages = yield prisma.chat.findMany({
            where: {
                roomId: roomId
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
app.get("/backend/getRoom/:slug", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = req.params.slug;
    try {
        const room = yield prisma.room.findFirst({
            where: {
                slug
            }
        });
        if (room === null) {
            return res.status(200).json({ error: "Room Not Found" });
        }
        return res.status(200).json({ room });
    }
    catch (e) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
}));
app.get("/backend/checkIfLocked/:shapeId", middleware_1.middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const shapeId = req.params.shapeId;
    try {
        const shape = yield prisma.chat.findUnique({
            where: {
                id: shapeId
            }
        });
        if (shape === null) {
            return res.status(200).json({ error: "Shape Not Found" });
        }
        if (shape.lockedBy && shape.lockedBy != req.body.userId) {
            return res.status(200).json({ isLocked: true });
        }
        // If the shape is not locked by anyone then Lock the Shape
        if (!shape.lockedBy) {
            yield prisma.chat.update({
                where: {
                    id: shapeId
                },
                data: {
                    lockedBy: req.body.userId,
                    lockedAt: new Date(),
                    lockExpire: new Date(Date.now() + 5 * 60 * 1000) // Lock for 5 minutes
                }
            });
        }
        return res.status(200).json({ isLocked: false });
    }
    catch (e) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
}));
app.get("/backend", (req, res) => {
    return res.send("Hello World");
});
app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
