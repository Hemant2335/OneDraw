import {ArrowUpLeft, Circle, Pencil, Square, Trash, Triangle, Move} from "lucide-react";
import React from "react";
import {DrawHandler} from "@/Classes/DrawHandler";
import {OfflineDrawHandler} from "@/Classes/OfflineDrawHandler";
import {BsCursor} from "react-icons/bs";

export type Tooltype = "pen" | "circle" | "rect" | "line" | "triangle" | "eraser" | "cursor" | "pan";

export const ToolBar: React.FC<{
    drawHandler: DrawHandler | OfflineDrawHandler | null;
    setTool: React.Dispatch<React.SetStateAction<Tooltype>>;
    tool: Tooltype;
}> = ({ drawHandler, setTool, tool }) => {
    const handleSelectTool = (tool: Tooltype) => {
        if (!drawHandler) return;
        setTool(tool);
        drawHandler.selectTool(tool);
    };

    const handleClear = () => {
        if (!drawHandler) return;
        drawHandler.cleanCanvas();
    };

    const tools = [
        { type: "pan", icon: <Move size={20} />, label: "Pan" },
        { type: "cursor", icon: <BsCursor size={20} />, label: "Select" },
        { type: "pen", icon: <Pencil size={20} />, label: "Pen" },
        { type: "rect", icon: <Square size={20} />, label: "Rectangle" },
        { type: "circle", icon: <Circle size={20} />, label: "Circle" },
        { type: "triangle", icon: <Triangle size={20} />, label: "Triangle" },
        { type: "line", icon: <ArrowUpLeft size={20} />, label: "Line" },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md rounded-full shadow-lg p-2 border border-gray-200">
                {tools.map(({ type, icon, label }) => (
                    <button
                        key={type}
                        onClick={() => handleSelectTool(type as Tooltype)}
                        className={`p-3 rounded-full flex flex-col items-center justify-center transition-all ${
                            tool === type
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-600 hover:bg-gray-100"
                        }`}
                        aria-label={label}
                    >
                        <div className={`${tool === type ? "scale-110" : "scale-100"}`}>
                            {icon}
                        </div>
                        <span className="text-xs mt-1">{label}</span>
                    </button>
                ))}

                <div className="h-8 w-px bg-gray-300 mx-1"></div>

                <button
                    onClick={handleClear}
                    className="p-3 rounded-full flex flex-col items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                    aria-label="Clear canvas"
                >
                    <Trash size={20} />
                    <span className="text-xs mt-1">Clear</span>
                </button>
            </div>
        </div>
    );
};