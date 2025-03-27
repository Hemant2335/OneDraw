import {Circle, LineChart, Pencil, Square, Trash, Triangle} from "lucide-react"
import React from "react";
import {DrawHandler} from "@/Classes/DrawHandler";
import {OfflineDrawHandler} from "@/Classes/OfflineDrawHandler";

export type Tooltype ="pen" | "circle" | "rect" | "line" | "triangle" | "eraser";

export const ToolBar: React.FC<{drawHandler: DrawHandler | OfflineDrawHandler | null, setTool: React.Dispatch<React.SetStateAction<Tooltype>> , tool:Tooltype}> = ({drawHandler , setTool , tool}) => {

    const handleSelectTool = (tool : Tooltype) =>{
        if(!drawHandler) return ;
        setTool(tool);
        drawHandler.selectTool(tool);
    }

    const handleClear = () =>{
        if(!drawHandler) return ;
        drawHandler.cleanCanvas();
    }

    return (
        <div className="w-full h-[5rem] py-5 flex justify-center items-center shadow-xl  bg-white">
            <div className="w-fit flex justify-center rounded-lg items-center gap-5 bg-[#FAFAFA] shadow-xl p-3 h-full ">
                <Square onClick={()=>handleSelectTool('rect')} size={24} className={`text-black cursor-pointer ${tool == 'rect' && 'text-blue-400'}`}/>
                <Pencil onClick={()=>handleSelectTool('pen')} size={24} className={`text-black cursor-pointer ${tool == 'pen' && 'text-blue-400'}`}/>
                <Circle onClick={()=>handleSelectTool('circle')} size={24} className={`text-black cursor-pointer ${tool == 'circle' && 'text-blue-400'}`}/>
                <Triangle onClick={()=>handleSelectTool('triangle')} size={24} className={`text-black cursor-pointer ${tool == 'triangle' && 'text-blue-400'}`}/>
                <LineChart onClick={()=>handleSelectTool('line')} size={24} className={`text-black cursor-pointer ${tool == 'line' && 'text-blue-400'}`}/>
                <Trash onClick={()=>handleClear()} size={24} className="text-red-400 cursor-pointer"/>
            </div>
        </div>
    )
}