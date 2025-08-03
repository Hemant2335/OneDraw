import {getShapes} from "@/utils/getShapes";
import {Tooltype} from "@/Components/ToolBar";
import {nanoid} from "nanoid";

export type Shape =
    | {
  id: string;
  name: "circle";
  x: number;
  y: number;
  radius: number;
  color: string;
  lineWidth: number;
  background: string;
}
    | {
  id: string;
  name: "rect";
  x: number;
  y: number;
  color: string;
  Width: number;
  Height: number;
  lineWidth: number;
  background: string;
}
    | {
  id: string;
  name: "pen";
  startx: number;
  starty: number;
  endx: number;
  endy: number;
  color: string;
  lineWidth: number;
}
    | {
  id: string;
  name: "line";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  lineWidth: number;
}
    | {
  id: string;
  name: "triangle";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  color: string;
  lineWidth: number;
  background: string;
}
    | {
  id: string;
  name: "eraser";
  x: number;
  y: number;
  size: number;
};

// Enhanced cursor interfaces
interface AnimatedCursor {
  userId: string;
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  lastUpdate: number;
  opacity: number;
  scale: number;
  pulsePhase: number;
  color: string;
}

interface CursorConfig {
  size: number;
  colors: string[];
  animationSpeed: number;
  showTrails: boolean;
  highContrast: boolean;
  throttleRate: number;
}

export class DrawHandler {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cursorCanvas: HTMLCanvasElement;
  private cursorCtx: CanvasRenderingContext2D;
  private isDrawing: boolean;
  private lastX: number;
  private lastY: number;
  private SelectedColor: string;
  private Participants: string[] = [];
  private SelectedTool: Tooltype;
  private SelectedLineWidth: number;
  private SelectedBackground: string;
  private readonly roomID: string;
  private socket: WebSocket;
  private shapes: Shape[] = [];
  private isDragging: boolean = false;
  private dragStart: { x: number; y: number } | null = null;
  private currentResizeHandle: { x: number; y: number; type: string } | null = null;
  private SelectedShape: Shape | undefined = undefined;
  private controller: AbortController;
  private onParticipantsChange?: (participants: string[]) => void;
  
  // Enhanced cursor system
  private animatedCursors: Map<string, AnimatedCursor> = new Map();
  private cursorConfig: CursorConfig;
  private cursorIcon: HTMLCanvasElement | null = null;
  private cursorAnimationFrame: number | null = null;
  private lastCursorSend: number = 0;
  private lastCursorPosition: { x: number; y: number } | null = null;

  constructor(canvas: HTMLCanvasElement, roomID: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    
    // Initialize cursor configuration
    this.cursorConfig = {
      size: 24,
      colors: ['#EF4444', '#3B82F6', '#10B981', '#EAB308', '#8B5CF6', '#EC4899', '#F97316', '#06D6A0'],
      animationSpeed: 200,
      showTrails: false,
      highContrast: false,
      throttleRate: 50 // 20 FPS
    };
    
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    this.SelectedColor = "black";
    this.SelectedTool = "rect";
    this.SelectedLineWidth = 2;
    this.SelectedBackground = "white";
    this.isDragging = false;
    this.shapes = [];
    this.roomID = roomID;
    this.socket = socket;
    this.controller = new AbortController();
    
    this.setupCursorCanvas();
    this.createModernCursorIcon();
    this.init();
    this.initHandler();
    this.initMouseEvents();
    this.startCursorAnimation();
  }

  // Enhanced cursor canvas setup
  private setupCursorCanvas() {
    this.cursorCanvas = document.createElement('canvas');
    this.cursorCanvas.className = 'cursor-canvas';
    this.cursorCanvas.width = this.canvas.width;
    this.cursorCanvas.height = this.canvas.height;
    
    const ctx = this.cursorCanvas.getContext("2d")!;
    
    // Optimize for crisp rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Position cursor canvas
    this.cursorCanvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 1000;
      image-rendering: auto;
    `;
    
    // Make the parent container relative positioned if it isn't already
    if (this.canvas.parentNode && this.canvas.parentNode instanceof HTMLElement) {
      const parent = this.canvas.parentNode as HTMLElement;
      if (parent.style.position !== 'relative' && parent.style.position !== 'absolute') {
        parent.style.position = 'relative';
      }
    }
    
    // Insert cursor canvas after the main canvas
    this.canvas.parentNode?.insertBefore(this.cursorCanvas, this.canvas.nextSibling);
    this.cursorCtx = ctx;
    
    // Debug: Add a test cursor to verify the canvas is working
    console.log('Cursor canvas setup complete', {
      width: this.cursorCanvas.width,
      height: this.cursorCanvas.height,
      parent: this.canvas.parentNode
    });
  }

  // Modern cursor icon creation
  private createModernCursorIcon(): void {
    const iconCanvas = document.createElement('canvas');
    iconCanvas.width = 32;
    iconCanvas.height = 32;
    const ctx = iconCanvas.getContext('2d')!;
    
    // Enable anti-aliasing for smooth curves
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Modern cursor design with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;
    
    // Main cursor body - white with subtle border
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1.5;
    
    // Draw cursor shape (refined arrow)
    ctx.beginPath();
    ctx.moveTo(4, 4);
    ctx.lineTo(20, 12);
    ctx.lineTo(14, 14);
    ctx.lineTo(16, 20);
    ctx.lineTo(12, 22);
    ctx.lineTo(10, 16);
    ctx.lineTo(4, 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Add small accent dot for modern touch
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#6B7280';
    ctx.beginPath();
    ctx.arc(6, 6, 2, 0, Math.PI * 2);
    ctx.fill();
    
    this.cursorIcon = iconCanvas;
  }

  // Method to set the participants change callback
  public setParticipantsCallback(callback: (participants: string[]) => void) {
    this.onParticipantsChange = callback;
  }

  // Method to update participants and notify callback
  private updateParticipants(participants: string[]) {
    console.log("DrawHandler: Updating participants", participants);
    this.Participants = participants;
    
    // Remove cursors for users who are no longer in the room
    this.animatedCursors.forEach((cursor, userId) => {
      if (!participants.includes(userId)) {
        this.animatedCursors.delete(userId);
      }
    });
    
    if (this.onParticipantsChange) {
      this.onParticipantsChange(participants);
    }
  }

  // Enhanced cursor position update with smooth animation
  private updateRemoteCursor(userId: string, x: number, y: number) {
    console.log('Updating remote cursor:', userId, x, y);
    
    const existing = this.animatedCursors.get(userId);
    const now = Date.now();
    
    if (existing) {
      existing.targetX = x;
      existing.targetY = y;
      existing.lastUpdate = now;
      existing.opacity = 1;
      existing.scale = 1;
    } else {
      this.animatedCursors.set(userId, {
        userId,
        currentX: x,
        currentY: y,
        targetX: x,
        targetY: y,
        lastUpdate: now,
        opacity: 1,
        scale: 1,
        pulsePhase: 0,
        color: this.getColorForUser(userId)
      });
    }
    
    // Start animation if not already running
    if (!this.cursorAnimationFrame) {
      console.log('Starting cursor animation');
      this.startCursorAnimation();
    }
  }

  // Method to remove remote cursor (when user disconnects)
  private removeRemoteCursor(userId: string) {
    this.animatedCursors.delete(userId);
  }

  // Enhanced cursor animation system
  private startCursorAnimation() {
    if (this.cursorAnimationFrame) return;
    
    console.log('Starting cursor animation loop');
    
    const animate = () => {
      let hasActiveCursors = false;
      const now = Date.now();
      
      // Clear the cursor canvas
      this.cursorCtx.clearRect(0, 0, this.cursorCanvas.width, this.cursorCanvas.height);
      
      this.animatedCursors.forEach((cursor, userId) => {
        // Remove old cursors
        if (now - cursor.lastUpdate > 5000) {
          this.animatedCursors.delete(userId);
          return;
        }
        
        hasActiveCursors = true;
        
        // Smooth interpolation for position
        const lerp = 0.15;
        cursor.currentX += (cursor.targetX - cursor.currentX) * lerp;
        cursor.currentY += (cursor.targetY - cursor.currentY) * lerp;
        
        // Fade out old cursors gradually
        if (now - cursor.lastUpdate > 2000) {
          cursor.opacity = Math.max(0, cursor.opacity - 0.02);
        }
        
        // Pulse animation for activity
        cursor.pulsePhase += 0.1;
        const pulseScale = 1 + Math.sin(cursor.pulsePhase) * 0.05;
        cursor.scale = pulseScale;
        
        this.drawModernCursor(cursor);
      });
      
      if (hasActiveCursors) {
        this.cursorAnimationFrame = requestAnimationFrame(animate);
      } else {
        console.log('No active cursors, stopping animation');
        this.cursorAnimationFrame = null;
      }
    };
    
    this.cursorAnimationFrame = requestAnimationFrame(animate);
  }

  // Modern cursor rendering
  private drawModernCursor(cursor: AnimatedCursor) {
    const ctx = this.cursorCtx;
    const { currentX: x, currentY: y, color, userId, opacity, scale } = cursor;
    
    ctx.save();
    ctx.globalAlpha = opacity;
    
    // Apply scaling for pulse effect
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.translate(-x, -y);
    
    // Draw the cursor icon if available
    if (this.cursorIcon) {
      // Draw base cursor with proper size
      ctx.drawImage(this.cursorIcon, x - 16, y - 16, 32, 32);
      
      // Add colored accent overlay
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity * 0.3;
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 4);
      ctx.lineTo(x + 20, y + 12);
      ctx.lineTo(x + 14, y + 14);
      ctx.lineTo(x + 16, y + 20);
      ctx.lineTo(x + 12, y + 22);
      ctx.lineTo(x + 10, y + 16);
      ctx.lineTo(x + 4, y + 18);
      ctx.closePath();
      ctx.fill();
      
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = opacity;
    } else {
      // Fallback cursor design
      this.drawFallbackCursor(ctx, x, y, color);
    }
    
    // Draw modern user label
    this.drawModernUserLabel(ctx, userId, x + 28, y + 8, color, opacity);
    
    ctx.restore();
  }

  // Fallback cursor design
  private drawFallbackCursor(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
    // Modern fallback design
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 4);
    ctx.lineTo(x + 20, y + 12);
    ctx.lineTo(x + 14, y + 14);
    ctx.lineTo(x + 16, y + 20);
    ctx.lineTo(x + 12, y + 22);
    ctx.lineTo(x + 10, y + 16);
    ctx.lineTo(x + 4, y + 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  // Enhanced user label with modern design
  private drawModernUserLabel(ctx: CanvasRenderingContext2D, userId: string, x: number, y: number, color: string, opacity: number) {
    const initial = userId.charAt(0).toUpperCase();
    const padding = 8;
    const fontSize = 12;
    
    ctx.globalAlpha = opacity;
    ctx.font = `600 ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    const textWidth = ctx.measureText(initial).width;
    
    // Modern pill background with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    
    ctx.fillStyle = color;
    ctx.beginPath();
    // Create rounded rectangle manually for better browser compatibility
    const rectX = x - padding;
    const rectY = y - fontSize/2 - padding/2;
    const rectWidth = textWidth + padding * 2;
    const rectHeight = fontSize + padding;
    const radius = rectHeight / 2;
    
    ctx.moveTo(rectX + radius, rectY);
    ctx.lineTo(rectX + rectWidth - radius, rectY);
    ctx.quadraticCurveTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + radius);
    ctx.lineTo(rectX + rectWidth, rectY + rectHeight - radius);
    ctx.quadraticCurveTo(rectX + rectWidth, rectY + rectHeight, rectX + rectWidth - radius, rectY + rectHeight);
    ctx.lineTo(rectX + radius, rectY + rectHeight);
    ctx.quadraticCurveTo(rectX, rectY + rectHeight, rectX, rectY + rectHeight - radius);
    ctx.lineTo(rectX, rectY + radius);
    ctx.quadraticCurveTo(rectX, rectY, rectX + radius, rectY);
    ctx.closePath();
    ctx.fill();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // White text with better typography
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initial, x + textWidth/2, y + 1);
  }

  // Optimized cursor position sending with throttling
  private sendCursorPosition(x: number, y: number) {
    const now = Date.now();
    if (now - this.lastCursorSend < this.cursorConfig.throttleRate) return;
    
    this.lastCursorSend = now;
    
    // Only send if position changed significantly (reduce network traffic)
    if (!this.lastCursorPosition || 
        Math.abs(this.lastCursorPosition.x - x) > 2 || 
        Math.abs(this.lastCursorPosition.y - y) > 2) {
      
      this.lastCursorPosition = { x, y };
      
      this.socket.send(JSON.stringify({
        type: "cursorMove",
        x: Math.round(x),
        y: Math.round(y),
        roomId: this.roomID
      }));
    }
  }

  // Get consistent color for user
  private getColorForUser(userId: string): string {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return this.cursorConfig.colors[Math.abs(hash) % this.cursorConfig.colors.length];
  }

  async init(): Promise<void> {
    this.shapes = await getShapes(this.roomID);
    console.log(this.shapes, "Shapes");
    this.clearCanvas();
    return;
  }

  selectColor(color: string) {
    this.SelectedColor = color;
  }

  selectLineWidth(width: number) {
    this.SelectedLineWidth = width;
  }

  selectBackground(color: string) {
    this.SelectedBackground = color;
  }

  selectTool(tool: Tooltype) {
    this.SelectedTool = tool;
  }

  initHandler() {
    this.socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      console.log("Message Received", data);
      
      if(data.type === "participants") {
        this.updateParticipants(data.participants);
        return;
      }
      if(data.type === "participantsUpdate") {
        this.updateParticipants(data.participants.map((p: any) => p.userId));
        return;
      }
      if(data.type === "cursorMove") {
        this.updateRemoteCursor(data.userId, data.x, data.y);
        return;
      }
      
      const shape = JSON.parse(data.message);
      if (data.type === "msg") {
        this.shapes.push(shape);
        this.clearCanvas();
      }
      if (data.type === "move") {
        this.shapes = this.shapes.map((el) => {
          if (el.name != "eraser" && el.id === shape.id) {
            return shape;
          }
          return el;
        });
        this.clearCanvas();
      }
    };
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.translate(0, 0);
    this.ctx.scale(1, 1);
    this.drawGrid(this.canvas.width, this.canvas.width);
    this.shapes.forEach((shape) => {
      this.draw(shape);
    });
  }

  public getParticipants() {
    return this.Participants;
  }

  cleanCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.shapes = [];
  }

  public DeleteHandler() {
    this.controller.abort();
    
    // Clean up cursor animation
    if (this.cursorAnimationFrame) {
      cancelAnimationFrame(this.cursorAnimationFrame);
      this.cursorAnimationFrame = null;
    }
    
    // Clear cursor data
    this.animatedCursors.clear();
    
    // Remove cursor canvas from DOM
    if (this.cursorCanvas && this.cursorCanvas.parentNode) {
      this.cursorCanvas.parentNode.removeChild(this.cursorCanvas);
    }
  }

  getHandleAtPosition(x: number, y: number) {
    if (!this.SelectedShape) return null;

    const padding = 10;
    const handleSize = 16;

    if (this.SelectedShape.name === "rect") {
      // Check all rectangle handles
      const handles = [
        // Corners
        {
          x: this.SelectedShape.x - padding / 2,
          y: this.SelectedShape.y - padding / 2,
          type: "nw",
        },
        {
          x: this.SelectedShape.x + this.SelectedShape.Width + padding / 2,
          y: this.SelectedShape.y - padding / 2,
          type: "ne",
        },
        {
          x: this.SelectedShape.x - padding / 2,
          y: this.SelectedShape.y + this.SelectedShape.Height + padding / 2,
          type: "sw",
        },
        {
          x: this.SelectedShape.x + this.SelectedShape.Width + padding / 2,
          y: this.SelectedShape.y + this.SelectedShape.Height + padding / 2,
          type: "se",
        },
        // Midpoints
        {
          x: this.SelectedShape.x + this.SelectedShape.Width / 2,
          y: this.SelectedShape.y - padding / 2,
          type: "n",
        },
        {
          x: this.SelectedShape.x + this.SelectedShape.Width + padding / 2,
          y: this.SelectedShape.y + this.SelectedShape.Height / 2,
          type: "e",
        },
        {
          x: this.SelectedShape.x + this.SelectedShape.Width / 2,
          y: this.SelectedShape.y + this.SelectedShape.Height + padding / 2,
          type: "s",
        },
        {
          x: this.SelectedShape.x - padding / 2,
          y: this.SelectedShape.y + this.SelectedShape.Height / 2,
          type: "w",
        },
      ];

      for (const handle of handles) {
        if (
            x >= handle.x - handleSize / 2 &&
            x <= handle.x + handleSize / 2 &&
            y >= handle.y - handleSize / 2 &&
            y <= handle.y + handleSize / 2
        ) {
          return handle;
        }
      }
    }
    if (this.SelectedShape.name === "circle") {
      const distance = Math.sqrt(
          Math.pow(x - this.SelectedShape.x, 2) +
          Math.pow(y - this.SelectedShape.y, 2),
      );
      if (Math.abs(distance - this.SelectedShape.radius) <= 10) {
        return {
          x: this.SelectedShape.x + this.SelectedShape.radius,
          y: this.SelectedShape.y,
          type: "se",
        };
      }
    }

    return null;
  }

  drawSelectionBox() {
    if (!this.SelectedShape) {
      return;
    }

    const ctx = this.ctx;
    const handleSize = 8;
    const handleColor = "blue";
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    const padding = 4;

    if (this.SelectedShape.name === "rect") {
      ctx.strokeRect(
          this.SelectedShape.x - padding / 2,
          this.SelectedShape.y - padding / 2,
          this.SelectedShape.Width + padding,
          this.SelectedShape.Height + padding,
      );
    } else if (this.SelectedShape.name === "circle") {
      ctx.beginPath();
      ctx.arc(
          this.SelectedShape.x,
          this.SelectedShape.y,
          this.SelectedShape.radius + padding / 2,
          0,
          Math.PI * 2,
      );
      ctx.stroke();
    } else if (this.SelectedShape.name === "triangle") {
      const minX = Math.min(
          this.SelectedShape.x1,
          this.SelectedShape.x2,
          this.SelectedShape.x3,
      );
      const minY = Math.min(
          this.SelectedShape.y1,
          this.SelectedShape.y2,
          this.SelectedShape.y3,
      );
      const maxX = Math.max(
          this.SelectedShape.x1,
          this.SelectedShape.x2,
          this.SelectedShape.x3,
      );
      const maxY = Math.max(
          this.SelectedShape.y1,
          this.SelectedShape.y2,
          this.SelectedShape.y3,
      );

      ctx.strokeRect(
          minX - padding / 2,
          minY - padding / 2,
          maxX - minX + padding,
          maxY - minY + padding,
      );
    }

    ctx.fillStyle = handleColor;
    if (this.SelectedShape.name === "rect") {
      ctx.strokeRect(
          this.SelectedShape.x - padding / 2,
          this.SelectedShape.y - padding / 2,
          this.SelectedShape.Width + padding,
          this.SelectedShape.Height + padding,
      );

      ctx.fillStyle = handleColor;
      ctx.setLineDash([]);

      const handles = [
        // Corners
        {
          x: this.SelectedShape.x - padding / 2,
          y: this.SelectedShape.y - padding / 2,
          type: "nw",
        },
        {
          x: this.SelectedShape.x + this.SelectedShape.Width + padding / 2,
          y: this.SelectedShape.y - padding / 2,
          type: "ne",
        },
        {
          x: this.SelectedShape.x - padding / 2,
          y: this.SelectedShape.y + this.SelectedShape.Height + padding / 2,
          type: "sw",
        },
        {
          x: this.SelectedShape.x + this.SelectedShape.Width + padding / 2,
          y: this.SelectedShape.y + this.SelectedShape.Height + padding / 2,
          type: "se",
        },
        // Midpoints
        {
          x: this.SelectedShape.x + this.SelectedShape.Width / 2,
          y: this.SelectedShape.y - padding / 2,
          type: "n",
        },
        {
          x: this.SelectedShape.x + this.SelectedShape.Width + padding / 2,
          y: this.SelectedShape.y + this.SelectedShape.Height / 2,
          type: "e",
        },
        {
          x: this.SelectedShape.x + this.SelectedShape.Width / 2,
          y: this.SelectedShape.y + this.SelectedShape.Height + padding / 2,
          type: "s",
        },
        {
          x: this.SelectedShape.x - padding / 2,
          y: this.SelectedShape.y + this.SelectedShape.Height / 2,
          type: "w",
        },
      ];

      handles.forEach((handle) => {
        ctx.fillRect(
            handle.x - handleSize / 2,
            handle.y - handleSize / 2,
            handleSize,
            handleSize,
        );
      });
    }
    if (this.SelectedShape.name === "circle") {
      ctx.beginPath();
      ctx.arc(
          this.SelectedShape.x,
          this.SelectedShape.y,
          this.SelectedShape.radius + padding / 2,
          0,
          Math.PI * 2,
      );
      ctx.stroke();
      ctx.fillStyle = handleColor;
      ctx.fillRect(
          this.SelectedShape.x + this.SelectedShape.radius - handleSize / 2,
          this.SelectedShape.y - handleSize / 2,
          handleSize,
          handleSize,
      );
    }
    ctx.setLineDash([]);
  }

  draw(shape: Shape) {
    if (shape.name === "rect") {
      this.ctx.strokeStyle = shape.color;
      this.ctx.lineWidth = shape.lineWidth;
      this.ctx.fillStyle = shape.background;
      this.ctx.fillRect(shape.x, shape.y, shape.Width, shape.Height);
      this.ctx.strokeRect(shape.x, shape.y, shape.Width, shape.Height);
    } else if (shape.name === "circle") {
      this.ctx.strokeStyle = shape.color;
      this.ctx.lineWidth = shape.lineWidth;
      this.ctx.fillStyle = shape.background;
      this.ctx.beginPath();

      this.ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.fill();
    } else if (shape.name === "pen") {
      this.ctx.strokeStyle = shape.color;
      this.ctx.lineWidth = shape.lineWidth;
      this.ctx.beginPath();
      this.ctx.moveTo(shape.startx, shape.starty);
      this.ctx.lineTo(shape.endx, shape.endy);
      this.ctx.stroke();
    } else if (shape.name === "line") {
      this.ctx.strokeStyle = shape.color;
      this.ctx.lineWidth = shape.lineWidth;
      this.ctx.beginPath();
      this.ctx.moveTo(shape.startX, shape.startY);
      this.ctx.lineTo(shape.endX, shape.endY);
      this.ctx.stroke();
    } else if (shape.name === "triangle") {
      this.ctx.strokeStyle = shape.color;
      this.ctx.lineWidth = shape.lineWidth;
      this.ctx.fillStyle = shape.background;
      this.ctx.beginPath();
      this.ctx.moveTo(shape.x1, shape.y1);
      this.ctx.lineTo(shape.x2, shape.y2);
      this.ctx.lineTo(shape.x3, shape.y3);
      this.ctx.closePath();
      this.ctx.stroke();
      this.ctx.fill();
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

  drawGrid = (width: number, height: number) => {
    const gridSize = 20;
    const gridColor = "#e0e0e0";

    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 1;

    for (let x = 0; x <= width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }

    for (let y = 0; y <= height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }
  };

  SelectShape() {
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

  resizeShape(mouseX: number, mouseY: number) {
    if (!this.SelectedShape || !this.currentResizeHandle) return;
    const shape = this.SelectedShape;
    const handle = this.currentResizeHandle;

    if (shape.name === "rect") {
      switch (handle.type) {
        case "nw":
          shape.Width += shape.x - mouseX;
          shape.Height += shape.y - mouseY;
          shape.x = mouseX;
          shape.y = mouseY;
          break;
        case "ne":
          shape.Width = mouseX - shape.x;
          shape.Height += shape.y - mouseY;
          shape.y = mouseY;
          break;
        case "sw":
          shape.Width += shape.x - mouseX;
          shape.Height = mouseY - shape.y;
          shape.x = mouseX;
          break;
        case "se":
          shape.Width = mouseX - shape.x;
          shape.Height = mouseY - shape.y;
          break;
      }
    }
    if (shape.name === "circle") {
      const distance = Math.sqrt(
          Math.pow(mouseX - shape.x, 2) + Math.pow(mouseY - shape.y, 2),
      );
      if (handle.type === "se") {
        shape.radius = distance;
      }
    }
    this.clearCanvas();
    this.shapes.forEach((shape) => {
      this.draw(shape);
    });
  }

  initMouseEvents() {
    this.canvas.addEventListener(
        "click",
        (e) => {
          this.lastX = e.offsetX;
          this.lastY = e.offsetY;
          if (this.SelectedTool == "cursor") {
            this.SelectShape();
          }
        },
        { signal: this.controller.signal },
    );
    
    this.canvas.addEventListener(
        "mousedown",
        (e) => {
          this.isDrawing = true;
          this.lastX = e.offsetX;
          this.lastY = e.offsetY;
          if (this.SelectedTool == "cursor" && this.SelectedShape) {
            const mouseX = e.clientX - this.canvas.offsetLeft;
            const mouseY = e.clientY - this.canvas.offsetTop;
            const handle = this.getHandleAtPosition(mouseX, mouseY);
            if (handle) {
              this.currentResizeHandle = handle;
              return;
            }

            this.SelectShape();
            this.dragStart = { x: this.lastX, y: this.lastY };
            this.isDragging = true;
          }
        },
        { signal: this.controller.signal },
    );

    this.canvas.addEventListener(
        "mouseup",
        (e) => {
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
          if (this.currentResizeHandle) {
            this.currentResizeHandle = null;
            return;
          }

          if (this.SelectedTool == "rect") {
            shape = {
              id: nanoid(),
              name: "rect",
              x: this.lastX,
              y: this.lastY,
              color: this.SelectedColor,
              lineWidth : this.SelectedLineWidth,
              background: this.SelectedBackground,
              Width: width,
              Height: height,
            };
          } else if (this.SelectedTool == "circle") {
            const radius = Math.max(width, height) / 2;
            shape = {
              id: nanoid(),
              name: "circle",
              x: this.lastX + radius,
              y: this.lastY + radius,
              color: this.SelectedColor,
              lineWidth : this.SelectedLineWidth,
              background: this.SelectedBackground,
              radius: radius,
            };
          } else if (this.SelectedTool == "pen") {
            shape = {
              id: nanoid(),
              name: "pen",
              startx: this.lastX,
              starty: this.lastY,
              endx: e.offsetX,
              endy: e.offsetY,
              lineWidth : this.SelectedLineWidth,
              color: this.SelectedColor,
            };
          } else if (this.SelectedTool == "line") {
            shape = {
              id: nanoid(),
              name: "line",
              startX: this.lastX,
              startY: this.lastY,
              endX: e.offsetX,
              endY: e.offsetY,
              color: this.SelectedColor,
              lineWidth : this.SelectedLineWidth,
            };
          } else if (this.SelectedTool == "triangle") {
            shape = {
              id: nanoid(),
              name: "triangle",
              x1: this.lastX,
              y1: this.lastY,
              x2: e.offsetX,
              y2: e.offsetY,
              x3: this.lastX + (e.offsetX - this.lastX) / 2,
              y3: this.lastY - (e.offsetY - this.lastY),
              color: this.SelectedColor,
              lineWidth : this.SelectedLineWidth,
              background: this.SelectedBackground,
            };
          } else if (this.SelectedTool == "eraser") {
            shape = {
              id : nanoid(),
              name: "eraser",
              x: e.offsetX,
              y: e.offsetY,
              size: 20,
            };
          }

          if (shape) {
            this.shapes.push(shape);
            this.socket.send(
                JSON.stringify({
                  type: "msg",
                  shape: shape,
                  roomID: this.roomID,
                }),
            );
          }
        },
        { signal: this.controller.signal },
    );

    this.canvas.addEventListener(
        "mousemove",
        (e) => {
          // Enhanced cursor position tracking with throttling
          this.sendCursorPosition(e.offsetX, e.offsetY);
          
          if (!this.isDrawing) {
            return;
          }
          if (
              this.SelectedTool == "cursor" &&
              this.SelectedShape &&
              this.currentResizeHandle
          ) {
            const mouseX = e.clientX - this.canvas.offsetLeft;
            const mouseY = e.clientY - this.canvas.offsetTop;
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
            this.socket.send(
                JSON.stringify({
                  type: "move",
                  shape: this.SelectedShape,
                  roomID: this.roomID,
                }),
            );
            this.dragStart = { x: e.offsetX, y: e.offsetY };
            return;
          }

          const width = e.offsetX - this.lastX;
          const height = e.offsetY - this.lastY;
          this.clearCanvas();
          const selectedTool = this.SelectedTool;

          if (selectedTool == "rect") {
            const shape: Shape = {
              id: nanoid(),
              name: "rect",
              x: this.lastX,
              y: this.lastY,
              color: this.SelectedColor,
              lineWidth : this.SelectedLineWidth,
              background: this.SelectedBackground,
              Width: width,
              Height: height,
            };
            this.draw(shape);
          } else if (selectedTool == "circle") {
            const radius = Math.max(width, height) / 2;
            const shape: Shape = {
              id: nanoid(),
              name: "circle",
              x: this.lastX + radius,
              y: this.lastY + radius,
              color: this.SelectedColor,
              lineWidth : this.SelectedLineWidth,
              background: this.SelectedBackground,
              radius: radius,
            };
            this.draw(shape);
          } else if (selectedTool == "pen") {
            const shape: Shape = {
              id: nanoid(),
              name: "pen",
              startx: this.lastX,
              starty: this.lastY,
              endx: e.offsetX,
              endy: e.offsetY,
              color: this.SelectedColor,
              lineWidth : this.SelectedLineWidth,
            };
            this.draw(shape);
            this.shapes.push(shape);
            this.socket.send(
                JSON.stringify({
                  type: "msg",
                  shape: shape,
                  roomID: this.roomID,
                }),
            );
            this.lastX = e.offsetX;
            this.lastY = e.offsetY;

          } else if (selectedTool == "line") {
            const shape: Shape = {
              id: nanoid(),
              name: "line",
              startX: this.lastX,
              startY: this.lastY,
              endX: e.offsetX,
              endY: e.offsetY,
              color: this.SelectedColor,
              lineWidth : this.SelectedLineWidth,
            };
            this.draw(shape);
          } else if (selectedTool == "triangle") {
            const shape: Shape = {
              id: nanoid(),
              name: "triangle",
              x1: this.lastX,
              y1: this.lastY,
              x2: e.offsetX,
              y2: e.offsetY,
              x3: this.lastX + (e.offsetX - this.lastX) / 2,
              y3: this.lastY - (e.offsetY - this.lastY),
              color: this.SelectedColor,
              lineWidth : this.SelectedLineWidth,
              background: this.SelectedBackground,
            };
            this.draw(shape);
          } else if (selectedTool == "eraser") {
            const shape: Shape = {
              id: nanoid(),
              name: "eraser",
              x: e.offsetX,
              y: e.offsetY,
              size: 20,
            };
            this.draw(shape);
          }
        },
        { signal: this.controller.signal },
    );
  }
}
