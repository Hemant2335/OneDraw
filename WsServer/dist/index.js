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
const ws_1 = require("ws");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const wss = new ws_1.WebSocketServer({ port: 8080 });
const users = [];
const prisma = new client_1.PrismaClient();
const CheckUser = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, "secret");
        if (typeof decoded === "string") {
            return null;
        }
        if (!decoded || !decoded.Id) {
            return null;
        }
        return decoded.id;
    }
    catch (e) {
        return null;
    }
};
wss.on("connection", (ws, request) => {
    const url = request.url;
    if (!url) {
        return;
    }
    try {
        const queryParams = new URLSearchParams(url.split('?')[1]);
        const token = queryParams.get("token") || " ";
        const userId = CheckUser(token);
        if (!userId) {
            ws.close();
            return;
        }
        const newUser = {
            userId: userId,
            ws: ws,
            rooms: []
        };
        users.push(newUser);
    }
    catch (e) {
        return ws.close();
    }
    ws.on("message", (message) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        let data;
        if (typeof message != "string") {
            data = JSON.parse(message.toString());
        }
        else {
            data = JSON.parse(message);
        }
        if (data.type === "joinRoom") {
            const user = users.find((el => el.ws === ws));
            user === null || user === void 0 ? void 0 : user.rooms.push(data.roomId);
        }
        if (data.type === "leaveRoom") {
            const user = users.find((el => el.ws === ws));
            if (!user) {
                return;
            }
            user.rooms = user === null || user === void 0 ? void 0 : user.rooms.filter((el => el !== data.roomId));
        }
        if (data.type === "msg") {
            const roomId = data.roomId;
            const userId = (_a = users.find((el => el.ws === ws))) === null || _a === void 0 ? void 0 : _a.userId;
            const message = data.message;
            if (!userId) {
                return;
            }
            const chat = yield prisma.chat.create({
                data: {
                    roomId: roomId,
                    userId: userId,
                    message: message
                }
            });
            users.forEach((el) => {
                if (el.rooms.includes(data.room)) {
                    el.ws.send(JSON.stringify({
                        type: "msg",
                        message: message,
                        userId: userId
                    }));
                }
            });
        }
    }));
});
