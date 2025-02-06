import {signalingManager} from "@/Classes/signalingManager";
import {useEffect, useState} from "react";
import {useRouter} from "next/router";

const Whiteboard = () =>{
    const [Instance, setInstance] = useState<signalingManager | null>(null);
    const router = useRouter();

    useEffect(() => {
        const roomId = router.query.roomId as string;
        if(!roomId){
            return;
        }

        setInstance(signalingManager.getInstance(roomId));

        return () => {
            signalingManager.closeConnection();
        }
    }, [router]);

    return (
        <div>
            <h1>Whiteboard</h1>
        </div>
    )

}


export default Whiteboard;