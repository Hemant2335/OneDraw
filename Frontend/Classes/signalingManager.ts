

export class signalingManager {
    private static instance : signalingManager | null;
    roomId: string;
    ws: WebSocket;
    isConnected: boolean = false;
    onParticipantsUpdate?: (participants: any[]) => void;

    constructor(roomId : string) {
        this.roomId = roomId;
        this.ws = new WebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET_SERVER_URL}?token=${window.localStorage.getItem("token")}`);
        this.ws.onopen = () => {
            this.isConnected = true;
            const data = JSON.stringify({
                type: "joinRoom",
                roomId: roomId
            });
            this.ws.send(data);
        }

    }

    public static getInstance(roomId: string){
        if(!signalingManager.instance || signalingManager.instance.roomId !== roomId){
            signalingManager.instance = new signalingManager(roomId);

        }
        return signalingManager.instance;
    }


    public closeConnection(){
        if(signalingManager.instance) {
            signalingManager.instance.ws.close();
            signalingManager.instance = null;
        }
    }
}