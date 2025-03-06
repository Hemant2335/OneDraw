"use client"

import {signalingManager} from "@/Classes/signalingManager";
import React, {useEffect, useRef, useState} from "react";
import {DrawHandler} from "@/Classes/DrawHandler";
import {ToolBar, Tooltype} from "@/Components/ToolBar";


const Whiteboard : React.FC<{roomId : string}> = ({roomId}) =>{
    const [Instance, setInstance] = useState<signalingManager | null>(null);
    const [drawHandler, setDrawHandler] = useState<DrawHandler | null>(null);
    const [tool, setTool] = useState<Tooltype>("rect");

    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        console.log("I am Running" , roomId);
        setInstance(signalingManager.getInstance(roomId));

        return () => {
            signalingManager.closeConnection();
        }
    }, [roomId]);
    
    useEffect(() => {
        console.log("Selected Tool" , roomId);
        drawHandler?.selectTool(tool);
    }, [drawHandler, roomId, tool]);

    useEffect(() => {
        if(!canvasRef.current){
            return;
        }
        if(!Instance){
            return;
        }
        setDrawHandler(new DrawHandler(canvasRef.current, roomId, Instance.ws));
        console.log("Draw" , roomId);
        return () => {
            drawHandler?.clearCanvas();
        }
    }, [drawHandler , canvasRef , roomId , Instance]);
    

    return (
        <div className="w-[100vw] h-[100vh] ">
            <ToolBar drawHandler={drawHandler} setTool={setTool} tool={tool}/>
            <canvas ref={canvasRef} id={"whiteboard"} width={window.innerWidth} height={window.innerHeight}/>
        </div>
    )

}


export default Whiteboard;