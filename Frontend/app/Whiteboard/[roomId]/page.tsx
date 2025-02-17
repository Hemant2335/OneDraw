"use client"

import {useRouter} from "next/navigation";
import Whiteboard from "@/Components/Whiteboard";


const WhiteboardPage = () => {

    const router = useRouter();

    return (
        <div>
            <Whiteboard roomId={"1"}/>
        </div>
    )
}


export default WhiteboardPage;