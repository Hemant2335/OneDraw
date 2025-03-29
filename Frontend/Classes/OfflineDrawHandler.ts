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

export class OfflineDrawHandler {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isDrawing: boolean;
  private lastX: number;
  private lastY: number;
  private SelectedColor: string;
  private SelectedTool: Tooltype;
  private shapes: Shape[] = [];
  private isDragging: boolean;
  private dragStart: { x: number; y: number } | null = null;
  private currentResizeHandle: { x: number; y: number; type:string } | null = null;
  private SelectedShape: Shape | undefined = undefined;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    this.isDragging = false;
    this.SelectedColor = "black";
    this.SelectedTool = "rect";
    this.shapes = [];
    this.init();
    this.initMouseEvents();
  }

  async init(): Promise<void> {
    this.shapes = localStorage.getItem("shapes")
      ? JSON.parse(localStorage.getItem("shapes")!)
      : [];
    console.log(this.shapes, "Shapes");
    this.clearCanvas();
    return;
  }

  selectColor(color: string) {
    this.SelectedColor = color;
  }

  selectTool(tool: Tooltype) {
    this.SelectedTool = tool;
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.shapes.forEach((shape) => {
      this.draw(shape);
    });
  }

  cleanCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.shapes = [];
  }

    getHandleAtPosition(x : number, y : number) {
        if (!this.SelectedShape) return null;

        const padding = 10;
        const handleSize = 16;

        if (this.SelectedShape.name === "rect") {
            // Check all rectangle handles
            const handles = [
                // Corners
                { x: this.SelectedShape.x - padding/2, y: this.SelectedShape.y - padding/2, type: 'nw' },
                { x: this.SelectedShape.x + this.SelectedShape.Width + padding/2, y: this.SelectedShape.y - padding/2, type: 'ne' },
                { x: this.SelectedShape.x - padding/2, y: this.SelectedShape.y + this.SelectedShape.Height + padding/2, type: 'sw' },
                { x: this.SelectedShape.x + this.SelectedShape.Width + padding/2, y: this.SelectedShape.y + this.SelectedShape.Height + padding/2, type: 'se' },
                // Midpoints
                { x: this.SelectedShape.x + this.SelectedShape.Width/2, y: this.SelectedShape.y - padding/2, type: 'n' },
                { x: this.SelectedShape.x + this.SelectedShape.Width + padding/2, y: this.SelectedShape.y + this.SelectedShape.Height/2, type: 'e' },
                { x: this.SelectedShape.x + this.SelectedShape.Width/2, y: this.SelectedShape.y + this.SelectedShape.Height + padding/2, type: 's' },
                { x: this.SelectedShape.x - padding/2, y: this.SelectedShape.y + this.SelectedShape.Height/2, type: 'w' }
            ];

            for (const handle of handles) {
                console.log(x , handle.x , (handle.x - handleSize/2 ) , (handle.x + handleSize/2) , y , handle.y, (handle.y - handleSize/2), (handle.y + handleSize/2));
                if (x >= (handle.x - handleSize/2 )&& x <= (handle.x + handleSize/2) &&
                    y >= (handle.y - handleSize/2) && y <= (handle.y + handleSize/2)) {
                    return handle;
                }
            }
        }
        // Similar checks for circle and triangle...

        return null;
    }

  drawSelectionBox() {
        if (!this.SelectedShape) {
            return;
        }

        const ctx = this.ctx;
        const handleSize = 8; // Size of resize handles
        const handleColor = "blue";
        ctx.strokeStyle = "blue"; // Change color for better visibility
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]); // Dashed selection box

        const padding = 4; // Padding around selection box

        if (this.SelectedShape.name === "rect") {
            ctx.strokeRect(
                this.SelectedShape.x - padding / 2,
                this.SelectedShape.y - padding / 2,
                this.SelectedShape.Width + padding,
                this.SelectedShape.Height + padding
            );
        }
        else if (this.SelectedShape.name === "circle") {
            ctx.beginPath();
            ctx.arc(
                this.SelectedShape.x,
                this.SelectedShape.y,
                this.SelectedShape.radius + padding / 2, // Extra padding around the circle
                0,
                Math.PI * 2
            );
            ctx.stroke();
        }
        else if (this.SelectedShape.name === "triangle") {
            // Find bounding box of triangle
            const minX = Math.min(this.SelectedShape.x1, this.SelectedShape.x2, this.SelectedShape.x3);
            const minY = Math.min(this.SelectedShape.y1, this.SelectedShape.y2, this.SelectedShape.y3);
            const maxX = Math.max(this.SelectedShape.x1, this.SelectedShape.x2, this.SelectedShape.x3);
            const maxY = Math.max(this.SelectedShape.y1, this.SelectedShape.y2, this.SelectedShape.y3);

            ctx.strokeRect(
                minX - padding / 2,
                minY - padding / 2,
                maxX - minX + padding,
                maxY - minY + padding
            );
        }

        // Add the Logic to Resize the shapes

        // 1) Add a resize handle to the bottom right corner of the selection box
        ctx.fillStyle = "blue";
        if (this.SelectedShape.name === "rect") {
            // Draw selection rectangle
            ctx.strokeRect(
                this.SelectedShape.x - padding / 2,
                this.SelectedShape.y - padding / 2,
                this.SelectedShape.Width + padding,
                this.SelectedShape.Height + padding
            );

            // Draw resize handles
            ctx.fillStyle = handleColor;
            ctx.setLineDash([]);

            // Calculate handle positions (8 handles - corners and midpoints)
            const handles = [
                // Corners
                { x: this.SelectedShape.x - padding/2, y: this.SelectedShape.y - padding/2, type: 'nw' },
                { x: this.SelectedShape.x + this.SelectedShape.Width + padding/2, y: this.SelectedShape.y - padding/2, type: 'ne' },
                { x: this.SelectedShape.x - padding/2, y: this.SelectedShape.y + this.SelectedShape.Height + padding/2, type: 'sw' },
                { x: this.SelectedShape.x + this.SelectedShape.Width + padding/2, y: this.SelectedShape.y + this.SelectedShape.Height + padding/2, type: 'se' },
                // Midpoints
                { x: this.SelectedShape.x + this.SelectedShape.Width/2, y: this.SelectedShape.y - padding/2, type: 'n' },
                { x: this.SelectedShape.x + this.SelectedShape.Width + padding/2, y: this.SelectedShape.y + this.SelectedShape.Height/2, type: 'e' },
                { x: this.SelectedShape.x + this.SelectedShape.Width/2, y: this.SelectedShape.y + this.SelectedShape.Height + padding/2, type: 's' },
                { x: this.SelectedShape.x - padding/2, y: this.SelectedShape.y + this.SelectedShape.Height/2, type: 'w' }
            ];

            handles.forEach(handle => {
                ctx.fillRect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize);
            });

        }



        ctx.setLineDash([]); // Reset to solid lines
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
      this.ctx.clearRect(
        shape.x - shape.size / 2,
        shape.y - shape.size / 2,
        shape.size,
        shape.size,
      );
    }

    if (this.SelectedShape) {
      this.drawSelectionBox();
    }
  }

  SelectShape(){
      const Shape = this.shapes.find((shape) => {
          if (shape.name == "rect") {
              if (
                  this.lastX > shape.x &&
                  this.lastX < shape.x + shape.Width &&
                  this.lastY > shape.y &&
                  this.lastY < shape.y + shape.Height
              ) {
                  return true;
              }
          } else if (shape.name == "circle") {
              if (
                  Math.sqrt(
                      Math.pow(this.lastX - shape.x, 2) +
                      Math.pow(this.lastY - shape.y, 2),
                  ) < shape.radius
              ) {
                  return true;
              }
          } else if (shape.name == "triangle") {
              const area = Math.abs(
                  (shape.x2 - shape.x1) * (shape.y3 - shape.y1) -
                  (shape.x3 - shape.x1) * (shape.y2 - shape.y1),
              );
              const area1 = Math.abs(
                  (shape.x1 - this.lastX) * (shape.y2 - this.lastY) -
                  (shape.x2 - this.lastX) * (shape.y1 - this.lastY),
              );
              const area2 = Math.abs(
                  (shape.x2 - this.lastX) * (shape.y3 - this.lastY) -
                  (shape.x3 - this.lastX) * (shape.y2 - this.lastY),
              );
              const area3 = Math.abs(
                  (shape.x3 - this.lastX) * (shape.y1 - this.lastY) -
                  (shape.x1 - this.lastX) * (shape.y3 - this.lastY),
              );
              if (area == area1 + area2 + area3) {
                  return true;
              }
          }
          return false;
      });
      if (Shape) {
          this.SelectedShape = Shape;
          this.clearCanvas();
          this.shapes.forEach((shape) => {
              this.draw(shape);
          });
      } else {
          this.SelectedShape = undefined;
          this.clearCanvas();
          this.shapes.forEach((shape) => {
              this.draw(shape);
          });
          this.dragStart = null;
      }
  }

    resizeShape(mouseX : number, mouseY : number) {
        if(!this.SelectedShape || !this.currentResizeHandle) return;
        const shape = this.SelectedShape;
        const handle = this.currentResizeHandle;

        if (shape.name === "rect") {
            switch (handle.type) {
                case 'nw':
                    shape.Width += shape.x - mouseX;
                    shape.Height += shape.y - mouseY;
                    shape.x = mouseX;
                    shape.y = mouseY;
                    break;
                case 'ne':
                    shape.Width = mouseX - shape.x;
                    shape.Height += shape.y - mouseY;
                    shape.y = mouseY;
                    break;
                case 'sw':
                    shape.Width += shape.x - mouseX;
                    shape.Height = mouseY - shape.y;
                    shape.x = mouseX;
                    break;
                case 'se':
                    shape.Width = mouseX - shape.x;
                    shape.Height = mouseY - shape.y;
                    break;
            }
        }
        this.clearCanvas();
        this.shapes.forEach((shape) => {
            this.draw(shape);
        });
    }

  initMouseEvents() {
    this.canvas.addEventListener("click", (e) => {
      this.lastX = e.offsetX;
      this.lastY = e.offsetY;
      if (this.SelectedTool == "cursor") {
        // Finding the shape to drag
        this.SelectShape();
      }
    });

    this.canvas.addEventListener("mousedown", (e) => {
      this.isDrawing = true;
      this.lastX = e.offsetX;
      this.lastY = e.offsetY;
      if(this.SelectedTool == "cursor" && this.SelectedShape){
          // First check if the user is trying to resize the shape
          const mouseX = e.clientX - this.canvas.offsetLeft;
          const mouseY = e.clientY - this.canvas.offsetTop;
          console.log(mouseX , mouseY);
          const handle = this.getHandleAtPosition(mouseX, mouseY);
          console.log("Handle" , handle);
          if (handle) {
              this.currentResizeHandle = handle;
              return;
          }

            this.SelectShape();
            this.dragStart = { x: this.lastX, y: this.lastY };
            this.isDragging = true;
      }
    });

    this.canvas.addEventListener("mouseup", (e) => {
      this.isDrawing = false;
      const width = e.offsetX - this.lastX;
      const height = e.offsetY - this.lastY;
      let shape: Shape;
      if (this.isDragging) {
        this.isDragging = false;
        this.dragStart = null;
        this.SelectedShape = undefined;
        return;
      }
      if(this.currentResizeHandle){
            this.currentResizeHandle = null;
            return;
      }
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
        localStorage.setItem("shapes", JSON.stringify(this.shapes));
      }
    });

    this.canvas.addEventListener("mousemove", (e) => {
      if (!this.isDrawing) {
        return;
      }
      if(this.SelectedTool == "cursor" && this.SelectedShape && this.currentResizeHandle){
          const mouseX = e.clientX - this.canvas.offsetLeft;
          const mouseY = e.clientY - this.canvas.offsetTop;
          console.log("resizing shape");
          this.resizeShape(mouseX, mouseY);
      }
      if (this.isDragging) {
        if (!this.dragStart) {
          return;
        }
        const dx = e.offsetX - this.dragStart.x;
        const dy = e.offsetY - this.dragStart.y;
        if (this.SelectedShape) {
          if (this.SelectedShape.name == "rect") {
            this.SelectedShape.x += dx;
            this.SelectedShape.y += dy;
          } else if (this.SelectedShape.name == "circle") {
            this.SelectedShape.x += dx;
            this.SelectedShape.y += dy;
          } else if (this.SelectedShape.name == "triangle") {
            this.SelectedShape.x1 += dx;
            this.SelectedShape.x2 += dx;
            this.SelectedShape.x3 += dx;
            this.SelectedShape.y1 += dy;
            this.SelectedShape.y2 += dy;
            this.SelectedShape.y3 += dy;
          }
        }
        this.clearCanvas();
        this.shapes.forEach((shape) => {
          this.draw(shape);
        });
        localStorage.setItem("shapes", JSON.stringify(this.shapes));
        this.dragStart = { x: e.offsetX, y: e.offsetY };
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
        localStorage.setItem("shapes", JSON.stringify(this.shapes));
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
