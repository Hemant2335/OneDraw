

export class signalingManager {
    private static instance : signalingManager;
    ws: WebSocket;
    roomId: string;

    constructor(roomId : string) {
        this.roomId = roomId;
        this.ws = new WebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET_SERVER_URL}?token=${window.localStorage.getItem("token")}`);
        this.ws.onopen = () => {
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

    public static closeConnection(){
        signalingManager.instance.ws.close();
    }

}