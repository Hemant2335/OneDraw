
import {NextFunction , Request , Response} from "express";
import jsonwebtoken from "jsonwebtoken";


export const middleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers["authorization"] ;
    const data = jsonwebtoken.verify(token as string , "secret") as {id: number} ;
    if(data) {
        req.body.userId = data.id ;
        next();
    }else{
        res.status(403).json({error: "Unauthorized"})
    }
}