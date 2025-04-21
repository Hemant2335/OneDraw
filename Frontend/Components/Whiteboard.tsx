"use client"

import {signalingManager} from "@/Classes/signalingManager";
import React, {useEffect, useRef, useState} from "react";
import {DrawHandler} from "@/Classes/DrawHandler";
import {ToolBar, Tooltype} from "@/Components/ToolBar";
import {OfflineDrawHandler} from "@/Classes/OfflineDrawHandler";

const Whiteboard: React.FC<{ roomId: string }> = ({ roomId }) => {
    const [instance, setInstance] = useState<signalingManager | null>(null);
    const [drawHandler, setDrawHandler] = useState<DrawHandler | OfflineDrawHandler | null>(null);
    const [tool, setTool] = useState<Tooltype>("rect");
    const [dimensions, setDimensions] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0
    });

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleCollaborate = () => {
        if (instance) {
            // Properly clean up existing instance
            instance.closeConnection();
            setInstance(null);
        } else {
            // Create new instance
            const newInstance = signalingManager.getInstance(roomId);
            setInstance(newInstance);
        }
    };

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle tool changes
    useEffect(() => {
        drawHandler?.selectTool(tool);
    }, [drawHandler, tool]);

    // Handle instance and draw handler changes
    useEffect(() => {
        if (!canvasRef.current) return;

        const cleanupPreviousHandler = () => {
            if (drawHandler) {
                drawHandler.clearCanvas();
                drawHandler.DeleteHandler();
            }
        };

        cleanupPreviousHandler();

        const newHandler = instance
            ? new DrawHandler(canvasRef.current, roomId, instance.ws)
            : new OfflineDrawHandler(canvasRef.current);

        setDrawHandler(newHandler);

        return () => {
            cleanupPreviousHandler();
        };
    }, [canvasRef, instance, roomId]);

    return (
        <div className="w-[100vw] h-[100vh] relative">
            <ToolBar drawHandler={drawHandler} setTool={setTool} tool={tool} />
            <button
                onClick={handleCollaborate}
                className={`absolute top-5 right-10 bg-primary px-3 py-2 rounded-md`}
            >
                {instance ? "Disconnect" : "Collaborate"}
            </button>
            <canvas
                ref={canvasRef}
                id="whiteboard"
                width={dimensions.width}
                height={dimensions.height}
            />
        </div>
    );
};

export default Whiteboard;