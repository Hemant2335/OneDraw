"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomSchema = void 0;
const zod_1 = require("zod");
exports.RoomSchema = zod_1.z.object({
    name: zod_1.z.string().min(3).max(20),
    userId: zod_1.z.string()
});
