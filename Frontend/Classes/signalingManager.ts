

export class signalingManager {
    ws: WebSocket;
    roomId: string;
    private static instance : signalingManager;


    constructor(roomId : string) {
        this.roomId = roomId;
        this.ws = new WebSocket("ws://localhost:8080?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MzhjOGQwLTI3MzMtNDc4Ni05ZGMyLTAyY2Q2NjM3ZDAxZCIsImlhdCI6MTczOTc5ODQzMH0.CVCSpcQIuQ40Ya3mgCLnQyEyAaxQtH_63jNJl_8MORg");
        this.ws.onopen = () => {
            const data = JSON.stringify({
                type: "join_room",
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