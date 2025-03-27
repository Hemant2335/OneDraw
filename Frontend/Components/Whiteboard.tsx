"use client"

import {signalingManager} from "@/Classes/signalingManager";
import React, {useEffect, useRef, useState} from "react";
import {DrawHandler} from "@/Classes/DrawHandler";
import {ToolBar, Tooltype} from "@/Components/ToolBar";
import {OfflineDrawHandler} from "@/Classes/OfflineDrawHandler";


const Whiteboard : React.FC<{roomId : string}> = ({roomId}) =>{
    const [Instance, setInstance] = useState<signalingManager | null>(null);
    const [drawHandler, setDrawHandler] = useState<DrawHandler | OfflineDrawHandler | null>(null);
    const [tool, setTool] = useState<Tooltype>("rect");

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const handleCollaborate = () =>{
        console.log("Collaborate");
        if(Instance){
            signalingManager.closeConnection();
            setInstance(null);
        }else{
            setInstance(signalingManager.getInstance(roomId));
        }
    }
    
    useEffect(() => {
        console.log("Selected Tool" , roomId);
        drawHandler?.selectTool(tool);
    }, [drawHandler, tool]);

    useEffect(() => {
        if(!canvasRef.current){
            return;
        }
        if(!Instance){
            setDrawHandler(new OfflineDrawHandler(canvasRef.current));
            return;
        }
        setDrawHandler(new DrawHandler(canvasRef.current, roomId, Instance.ws));
        console.log("Draw" , roomId);
        return () => {
            drawHandler?.clearCanvas();
        }
    }, [canvasRef , Instance]);
    

    return (
        <div className="w-[100vw] h-[100vh] relative">
            <ToolBar drawHandler={drawHandler} setTool={setTool} tool={tool}/>
            <button onClick={handleCollaborate} className={`absolute top-5 right-10 bg-primary px-3 py-2 rounded-md`}>{
                Instance ? "Disconnect" : "Collaborate"
            }</button>
            <canvas ref={canvasRef} id={"whiteboard"} width={window.innerWidth} height={window.innerHeight}/>
        </div>
    )

}


export default Whiteboard;