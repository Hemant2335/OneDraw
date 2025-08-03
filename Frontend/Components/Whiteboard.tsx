"use client";

import {signalingManager} from "@/Classes/signalingManager";
import React, {useEffect, useRef, useState} from "react";
import {DrawHandler} from "@/Classes/DrawHandler";
import {ToolBar, Tooltype} from "@/Components/ToolBar";
import {OfflineDrawHandler} from "@/Classes/OfflineDrawHandler";
import {AlertPopup} from "@/Components/Popup/AlertPopup";
import {Download} from "lucide-react";
import toast from "react-hot-toast";
import {DrawingPropertiesPanel} from "@/Components/ColorDrawer";
import Participants from "@/Components/Participants";
import {useAtomValue} from "jotai";
import {userAtom} from "@/store/atoms/User";

const Whiteboard: React.FC<{ roomId: string }> = ({ roomId }) => {
  const [instance, setInstance] = useState<signalingManager | null>(null);
  const [drawHandler, setDrawHandler] = useState<
    DrawHandler | OfflineDrawHandler | null
  >(null);
  const [tool, setTool] = useState<Tooltype>("rect");
  const [participants, setParticipants] = useState<string[]>([]);
  // const [isAutoTriggered, setIsAutoTriggered] = useState(true);
  // const [CollabWarningPopupOpen, setCollabWarningPopupOpen] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  const user = useAtomValue(userAtom);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // useEffect(() => {
  //   handleSameRoom(true);
  // }, [roomId , router]);
  //
  // const handleSameRoom = (isAutoTriggered: boolean) => {
  //   console.log(user.Rooms , roomId);
  //   if (!user.Rooms.includes(roomId)) {
  //     setCollabWarningPopupOpen(true);
  //     setIsAutoTriggered(isAutoTriggered);
  //   }
  // };

  const handleCollaborate = () => {
    if (instance) {
      // Properly clean up existing instance
      instance.closeConnection();
      setInstance(null);
      // handleSameRoom(false);
    } else {
      // Create new instance
      const newInstance = signalingManager.getInstance(roomId);
      if (newInstance.ws.readyState === WebSocket.CLOSED) {
        toast.error("Connection closed");
        setInstance(null);
        return;
      }

      newInstance.ws.onclose = () => {
        toast("Disconnected from Friends!", {
          icon: "🌑",
        });
        setInstance(null);
        setParticipants([]);
      };

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

    // Set up participants callback for DrawHandler
    if (instance && newHandler instanceof DrawHandler) {
      newHandler.setParticipantsCallback((participants) => {
        console.log("Whiteboard: Received participants update", participants);
        setParticipants(participants);
      });
    }

    setDrawHandler(newHandler);

    return () => {
      cleanupPreviousHandler();
    };
  }, [canvasRef, instance, roomId]);

  return (
    <div className="w-[100vw] overflow-auto h-[100vh] relative hideScrollbar">
      <header className="h-14 border-b bg-white flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="font-bold text-lg">OneDraw</h1>
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

      <DrawingPropertiesPanel drawHandler={drawHandler} />
      
              {/* Participants Panel */}
        {instance && (
          <div className="absolute top-20 right-4 z-50">
            <Participants 
              participants={participants}
              currentUserId={user.id}
              isCollabMode={!!instance}
            />
          </div>
        )}
      
      <canvas
        ref={canvasRef}
        id="whiteboard"
        width={dimensions.width}
        height={dimensions.height}
      />
      {/*<CollabWarningPopup*/}
      {/*  handleClick={handleCollaborate}*/}
      {/*  isAutoTriggered={isAutoTriggered}*/}
      {/*  open={CollabWarningPopupOpen}*/}
      {/*  setOpen={setCollabWarningPopupOpen}*/}
      {/*/>*/}
    </div>
  );
};

export default Whiteboard;
