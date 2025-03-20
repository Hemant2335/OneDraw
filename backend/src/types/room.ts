import {z} from "zod";


export const RoomSchema = z.object({
    name : z.string().min(3).max(20),
}) ;