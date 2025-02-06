import getShapes from "@/utils/getShapes";

type Shape = {
    name : "circle",
    x: number,
    y: number,
    radius: number,
    color: string,
} | {
    name : "rect",
    x: number,
    y: number,
    color: string,
    Width: number
    Height: number
} | {
    name : "pen",
    x: number,
    y: number,
    color: string,
}



export class DrawHandler {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private isDrawing: boolean;
    private lastX: number;
    private lastY: number;
    private SelectedColor: string;
    private SelectedTool: "pen" | "circle" | "rect";
    private readonly roomID: string;
    private socket: WebSocket;
    private shapes: Shape[] = [];

    constructor(canvas: HTMLCanvasElement, roomID: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.SelectedColor = "black";
        this.SelectedTool = "rect";
        this.shapes = [];
        this.roomID = roomID;
        this.socket = socket;
        this.init();
        this.initHandler();
        this.initMouseEvents();
    }

    async init() : Promise<void>{
        this.shapes = await getShapes();
        this.clearCanvas();
        return ;
    }

    selectColor(color: string){
        this.SelectedColor = color;
    }

    selectTool(tool: "pen" | "circle" | "rect"){
        this.SelectedTool = tool;
    }

   initHandler(){
        this.socket.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            if(data.type === "msg"){
                this.shapes.push(data.shape);
                this.clearCanvas();
            }
        }
   }



    clearCanvas(){
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);

        this.shapes.forEach((shape)=>{
            this.draw(shape);
        })
    }

    draw(shape : Shape){
        if(shape.name === "rect"){
            this.ctx.strokeStyle = shape.color;
            this.ctx.strokeRect(shape.x,shape.y,shape.Width,shape.Height);
        }
        if(shape.name === "circle"){
            this.ctx.strokeStyle = shape.color;
            this.ctx.beginPath();
            this.ctx.arc(shape.x,shape.y,shape.radius,0,Math.PI*2);
            this.ctx.stroke();
        }
    }

    initMouseEvents(){
        this.canvas.addEventListener("mousedown", (e)=>{
            this.isDrawing = true;
            this.lastX = e.offsetX;
            this.lastY = e.offsetY;
        })

        this.canvas.addEventListener("mouseup", (e)=>{
            this.isDrawing = false;
            const width = e.clientX - this.lastX;
            const height = e.clientY - this.lastY;
            let shape : Shape
            if (this.SelectedTool == "rect") {
                shape = {
                    name: 'rect',
                    x: this.lastX,
                    y: this.lastY,
                    color: this.SelectedColor,
                    Width: width,
                    Height: height
                }
                this.shapes.push(shape);
                this.socket.send(JSON.stringify({
                    type: "msg",
                    shape: shape,
                    roomID: this.roomID
                }))
            }else if(this.SelectedTool == "circle"){
                const radius = Math.max(width,height)/2;
                shape = {
                    name: 'circle',
                    x: this.lastX + radius,
                    y: this.lastY + radius,
                    color: this.SelectedColor,
                    radius: radius
                }
                this.shapes.push(shape);
                this.socket.send(JSON.stringify({
                    type: "msg",
                    shape: shape,
                    roomID: this.roomID
                }))
            }
        })

        this.canvas.addEventListener("mousemove", (e)=>{
            if(!this.isDrawing){
                return ;
            }

            const width = e.clientX - this.lastX;
            const height = e.clientY - this.lastY;
            this.clearCanvas()
            const selectedTool = this.SelectedTool;
            if(selectedTool == "rect") {
                const shape: Shape = {
                    name: 'rect',
                    x: this.lastX,
                    y: this.lastY,
                    color: this.SelectedColor,
                    Width: width,
                    Height: height
                }
                this.draw(shape);
            }
            if(selectedTool == "circle") {
                const radius = Math.max(width, height)/2;
                const shape: Shape = {
                    name: 'circle',
                    x: this.lastX + radius,
                    y: this.lastY + radius,
                    color: this.SelectedColor,
                    radius: radius
                }
                this.draw(shape);
            }

        })
    }

}