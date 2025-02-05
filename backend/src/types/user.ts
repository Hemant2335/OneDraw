import {z} from "zod" ;

export const UserSchema = z.object({
    username : z.string().min(3).max(20),
    password : z.string().min(8),
    name : z.string().min(3).max(20),
}) ;