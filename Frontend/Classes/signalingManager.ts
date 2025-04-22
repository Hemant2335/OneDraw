

export class signalingManager {
    private static instance : signalingManager | null;
    ws: WebSocket;
    roomId: string;

    constructor(roomId : string) {
        this.roomId = roomId;
        this.ws = new WebSocket(`ws://af2c804dfa62c414d8993b893aa3369a-1544082881.ap-south-1.elb.amazonaws.com/websocket?token=${window.localStorage.getItem("token")}`);
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

    public closeConnection(){
        if(signalingManager.instance) {
            signalingManager.instance.ws.close();
            signalingManager.instance = null;
        }

    }

}