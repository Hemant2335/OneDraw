import getShapes from "@/utils/getShapes";
import {Tooltype} from "@/Components/ToolBar";

type Shape =
    | {
    name: "circle";
    x: number;
    y: number;
    radius: number;
    color: string;
}
    | {
    name: "rect";
    x: number;
    y: number;
    color: string;
    Width: number;
    Height: number;
}
    | {
    name: "pen";
    startx: number;
    starty: number;
    endx: number;
    endy: number;
    color: string;
}
    | {
    name: "line";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    color: string;
}
    | {
    name: "triangle";
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    x3: number;
    y3: number;
    color: string;
}
    | {
    name: "eraser";
    x: number;
    y: number;
    size: number; // Size of the eraser
};



export class DrawHandler {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private isDrawing: boolean;
    private lastX: number;
    private lastY: number;
    private SelectedColor: string;
    private SelectedTool: Tooltype;
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
        this.shapes = await getShapes(this.roomID);
        console.log(this.shapes , "Shapes");
        this.clearCanvas();
        return ;
    }

    selectColor(color: string){
        this.SelectedColor = color;
    }

    selectTool(tool: Tooltype){
        this.SelectedTool = tool;
    }

   initHandler(){
        this.socket.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            console.log("Message Recived" , data);
            const shape = JSON.parse(data.message);
            if(data.type === "msg"){
                this.shapes.push(shape);
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

    cleanCanvas(){
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
        this.shapes = [];
    }

    draw(shape: Shape) {
        if (shape.name === "rect") {
            this.ctx.strokeStyle = shape.color;
            this.ctx.strokeRect(shape.x, shape.y, shape.Width, shape.Height);
        } else if (shape.name === "circle") {
            this.ctx.strokeStyle = shape.color;
            this.ctx.beginPath();
            this.ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
            this.ctx.stroke();
        } else if (shape.name === "pen") {
            this.ctx.strokeStyle = shape.color;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(shape.startx, shape.starty);
            this.ctx.lineTo(shape.endx, shape.endy);
            this.ctx.stroke();
        } else if (shape.name === "line") {
            this.ctx.strokeStyle = shape.color;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(shape.startX, shape.startY);
            this.ctx.lineTo(shape.endX, shape.endY);
            this.ctx.stroke();
        } else if (shape.name === "triangle") {
            this.ctx.strokeStyle = shape.color;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(shape.x1, shape.y1);
            this.ctx.lineTo(shape.x2, shape.y2);
            this.ctx.lineTo(shape.x3, shape.y3);
            this.ctx.closePath();
            this.ctx.stroke();
        } else if (shape.name === "eraser") {
            this.ctx.clearRect(shape.x - shape.size / 2, shape.y - shape.size / 2, shape.size, shape.size);
        }
    }

    initMouseEvents() {
        this.canvas.addEventListener("mousedown", (e) => {
            this.isDrawing = true;
            this.lastX = e.offsetX;
            this.lastY = e.offsetY;
        });

        this.canvas.addEventListener("mouseup", (e) => {
            this.isDrawing = false;
            const width = e.offsetX - this.lastX;
            const height = e.offsetY - this.lastY;
            let shape: Shape;

            if (this.SelectedTool == "rect") {
                shape = {
                    name: "rect",
                    x: this.lastX,
                    y: this.lastY,
                    color: this.SelectedColor,
                    Width: width,
                    Height: height,
                };
            } else if (this.SelectedTool == "circle") {
                const radius = Math.max(width, height) / 2;
                shape = {
                    name: "circle",
                    x: this.lastX + radius,
                    y: this.lastY + radius,
                    color: this.SelectedColor,
                    radius: radius,
                };
            } else if (this.SelectedTool == "pen") {
                shape = {
                    name: "pen",
                    startx: this.lastX,
                    starty: this.lastY,
                    endx: e.offsetX,
                    endy: e.offsetY,
                    color: this.SelectedColor,
                };
            } else if (this.SelectedTool == "line") {
                shape = {
                    name: "line",
                    startX: this.lastX,
                    startY: this.lastY,
                    endX: e.offsetX,
                    endY: e.offsetY,
                    color: this.SelectedColor,
                };
            } else if (this.SelectedTool == "triangle") {
                shape = {
                    name: "triangle",
                    x1: this.lastX,
                    y1: this.lastY,
                    x2: e.offsetX,
                    y2: e.offsetY,
                    x3: this.lastX + (e.offsetX - this.lastX) / 2,
                    y3: this.lastY - (e.offsetY - this.lastY),
                    color: this.SelectedColor,
                };
            } else if (this.SelectedTool == "eraser") {
                shape = {
                    name: "eraser",
                    x: e.offsetX,
                    y: e.offsetY,
                    size: 20, // Adjust eraser size as needed
                };
            }

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            if (shape) {
                this.shapes.push(shape);
                this.socket.send(
                    JSON.stringify({
                        type: "msg",
                        shape: shape,
                        roomID: this.roomID,
                    })
                );
            }
        });

        this.canvas.addEventListener("mousemove", (e) => {
            if (!this.isDrawing) {
                return;
            }

            const width = e.offsetX - this.lastX;
            const height = e.offsetY - this.lastY;
            this.clearCanvas();
            const selectedTool = this.SelectedTool;

            if (selectedTool == "rect") {
                const shape: Shape = {
                    name: "rect",
                    x: this.lastX,
                    y: this.lastY,
                    color: this.SelectedColor,
                    Width: width,
                    Height: height,
                };
                this.draw(shape);
            } else if (selectedTool == "circle") {
                const radius = Math.max(width, height) / 2;
                const shape: Shape = {
                    name: "circle",
                    x: this.lastX + radius,
                    y: this.lastY + radius,
                    color: this.SelectedColor,
                    radius: radius,
                };
                this.draw(shape);
            } else if (selectedTool == "pen") {
                const shape: Shape = {
                    name: "pen",
                    startx: this.lastX,
                    starty: this.lastY,
                    endx: e.offsetX,
                    endy: e.offsetY,
                    color: this.SelectedColor,
                };
                this.draw(shape);
                this.shapes.push(shape);
                this.socket.send(
                    JSON.stringify({
                        type: "msg",
                        shape: shape,
                        roomID: this.roomID,
                    })
                );
                this.lastX = e.offsetX;
                this.lastY = e.offsetY;
            } else if (selectedTool == "line") {
                const shape: Shape = {
                    name: "line",
                    startX: this.lastX,
                    startY: this.lastY,
                    endX: e.offsetX,
                    endY: e.offsetY,
                    color: this.SelectedColor,
                };
                this.draw(shape);
            } else if (selectedTool == "triangle") {
                const shape: Shape = {
                    name: "triangle",
                    x1: this.lastX,
                    y1: this.lastY,
                    x2: e.offsetX,
                    y2: e.offsetY,
                    x3: this.lastX + (e.offsetX - this.lastX) / 2,
                    y3: this.lastY - (e.offsetY - this.lastY),
                    color: this.SelectedColor,
                };
                this.draw(shape);
            } else if (selectedTool == "eraser") {
                const shape: Shape = {
                    name: "eraser",
                    x: e.offsetX,
                    y: e.offsetY,
                    size: 20, // Adjust eraser size as needed
                };
                this.draw(shape);
            }
        });
    }

}