"use client";

import {signalingManager} from "@/Classes/signalingManager";
import React, {useEffect, useRef, useState} from "react";
import {DrawHandler} from "@/Classes/DrawHandler";
import {ToolBar, Tooltype} from "@/Components/ToolBar";
import {OfflineDrawHandler} from "@/Classes/OfflineDrawHandler";
import {AlertPopup} from "@/Components/AlertPopup";
import {Download} from "lucide-react";
import toast from 'react-hot-toast';
import {DrawingPropertiesPanel} from "@/Components/ColorDrawer";

const Whiteboard: React.FC<{ roomId: string }> = ({ roomId }) => {
  const [instance, setInstance] = useState<signalingManager | null>(null);
  const [drawHandler, setDrawHandler] = useState<
    DrawHandler | OfflineDrawHandler | null
  >(null);
  const [tool, setTool] = useState<Tooltype>("rect");
  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
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
      if (newInstance.ws.readyState === WebSocket.CLOSED){
        toast.error("Connection closed");
        setInstance(null);
        return;
      }

      newInstance.ws.onclose = () => {
        toast('Disconnected from Friends!', {
          icon: '🌑',});
        setInstance(null);
      }

      setInstance(newInstance);
    }
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
    <div className="w-[100vw] overflow-auto h-[100vh] relative hideScrollbar">
      <header className="h-14 border-b bg-white flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="font-bold text-lg">CollabCanvas</h1>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {instance ? "Live" : "Offline"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <AlertPopup
            AlertMessage={
              !instance
                ? "Invite collaborators by sharing this URL:"
                : "Disconnecting will remove you from the live session"
            }
            url={!instance ? window.location.href : undefined}
            AlertTitle={!instance ? "Start Collaboration" : "End Session"}
            TriggerName={instance ? "Disconnect" : "Collaborate"}
            handleClick={handleCollaborate}
            className={` bg-[#097969] text-white font-medium px-3 py-2 rounded-md`}
          />

          <button
            className={` flex items-center bg-white border-[1px] text-gray-700 font-medium px-3 py-2 rounded-md`}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </header>
      <ToolBar drawHandler={drawHandler} setTool={setTool} tool={tool} />

      <DrawingPropertiesPanel drawHandler={drawHandler}/>
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
