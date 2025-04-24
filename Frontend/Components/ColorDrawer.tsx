import React, {useState} from "react";
import {Button} from "@/Components/ui/button";
import {Copy, Trash2} from "lucide-react";
import {DrawHandler} from "@/Classes/DrawHandler";
import {OfflineDrawHandler} from "@/Classes/OfflineDrawHandler";

export const DrawingPropertiesPanel: React.FC<{
    drawHandler: DrawHandler | OfflineDrawHandler | null;
}> = ({ drawHandler }) => {
    const [strokeColor, setStrokeColor] = useState("#3b82f6");
    const [lineWidth, setLineWidth] = useState(2);
    const [backgroundColor, setBackgroundColor] = useState("#ffffff");

    const strokeColors = [
        "#3b82f6", // blue
        "#ef4444", // red
        "#10b981", // green
        "#f59e0b", // yellow
        "#000000", // black
    ];

    const backgroundColors = [
        "#ffffff", // white
        "#f3f4f6", // light gray
        "#e5e7eb", // gray
        "#fef2f2", // light red
        "#ecfdf5", // light green
    ];

    const lineWidths = [1, 2, 4, 6];

    const handleStrokeColor = (color: string) => {
        drawHandler?.selectColor(color);
        setStrokeColor(color);
    };

    const handleLineWidth = (width: number) => {
        drawHandler?.selectLineWidth(width);
        setLineWidth(width);
    };

    const handleBackgroundColor = (color: string) => {
        drawHandler?.selectBackground(color);
        setBackgroundColor(color);
    };

    return (
        <div className="w-56 absolute top-1/4 left-10 p-5 border border-gray-200 rounded-xl bg-white shadow-md space-y-5 dark:bg-gray-800 dark:border-gray-700">
            <div className="mb-1">
                <h2 className="text-sm font-semibold mb-4 text-gray-800 dark:text-gray-200">Drawing Properties</h2>
            </div>

            {/* Stroke Color */}
            <div className="space-y-3">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                    Stroke Color
                </h3>
                <div className="flex gap-2 justify-between">
                    {strokeColors.map((color) => (
                        <button
                            key={color}
                            className={`w-8 h-8 rounded-full transition-all duration-200 ease-in-out ${
                                strokeColor === color
                                    ? "ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400 transform scale-110"
                                    : "hover:scale-105"
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => handleStrokeColor(color)}
                        />
                    ))}
                </div>
            </div>

            {/* Line Width */}
            <div className="space-y-3">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                    Line Width
                </h3>
                <div className="flex gap-2 justify-between">
                    {lineWidths.map((width) => (
                        <button
                            key={width}
                            className={`
                relative flex items-center justify-center w-10 h-10 rounded-lg
                transition-all duration-200 ease-in-out
                ${
                                lineWidth === width
                                    ? "bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:ring-blue-700"
                                    : "hover:bg-gray-50 dark:hover:bg-gray-700"
                            }
                active:scale-95
              `}
                            onClick={() => handleLineWidth(width)}
                        >
                            <div
                                style={{
                                    height: `${width}px`,
                                    backgroundColor: strokeColor,
                                    borderRadius: width > 3 ? "2px" : "1px",
                                    width: width > 3 ? "16px" : "20px",
                                }}
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Background Color */}
            <div className="space-y-3">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                    Background
                </h3>
                <div className="flex gap-2 justify-between">
                    {backgroundColors.map((color) => (
                        <button
                            key={color}
                            className={`w-8 h-8 rounded-full border transition-all duration-200 ease-in-out ${
                                backgroundColor === color
                                    ? "ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400 transform scale-110"
                                    : "border-gray-200 dark:border-gray-600 hover:scale-105"
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => handleBackgroundColor(color)}
                        />
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center justify-center gap-2 py-2 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                    <Copy className="w-4 h-4" />
                    Copy
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center justify-center gap-2 py-2 text-red-500 hover:bg-red-50 hover:border-red-200 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:border-red-800"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete
                </Button>
            </div>
        </div>
    );
};