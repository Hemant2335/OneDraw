import { getShapes } from "@/utils/getShapes";
import { Tooltype } from "@/Components/ToolBar";
import { nanoid } from "nanoid";

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

// Infinite canvas viewport interface
interface Viewport {
  x: number;
  y: number;
  scale: number;
  minScale: number;
  maxScale: number;
}

interface CanvasBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

interface Point {
  x: number;
  y: number;
}

export class DrawHandler {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cursorCanvas: HTMLCanvasElement;
  private cursorCtx: CanvasRenderingContext2D;
  private isDrawing: boolean = false;
  private lastWorldPos: Point = { x: 0, y: 0 };
  private SelectedColor: string = "black";
  private Participants: string[] = [];
  private SelectedTool: Tooltype = "cursor";
  private SelectedLineWidth: number = 2;
  private SelectedBackground: string = "white";
  private readonly roomID: string;
  private socket: WebSocket;
  private shapes: Shape[] = [];
  private isDragging: boolean = false;
  private dragStart: Point | null = null;
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
  private lastCursorPosition: Point | null = null;

  // Infinite canvas system
  private viewport: Viewport;
  private isPanning: boolean = false;
  private panStart: Point | null = null;
  private canvasBounds: CanvasBounds;
  private lastWheelTime: number = 0;

  // Performance optimization
  private needsRedraw: boolean = true;
  private animationFrameId: number | null = null;

  constructor(canvas: HTMLCanvasElement, roomID: string, socket: WebSocket) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to get 2D context from canvas");
    }
    this.ctx = context;

    // Initialize cursor configuration
    this.cursorConfig = {
      size: 24,
      colors: [
        "#EF4444", "#3B82F6", "#10B981", "#EAB308", 
        "#8B5CF6", "#EC4899", "#F97316", "#06D6A0"
      ],
      animationSpeed: 200,
      showTrails: false,
      highContrast: false,
      throttleRate: 50,
    };

    // Initialize infinite canvas viewport - center the viewport
    this.viewport = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      scale: 1,
      minScale: 0.1,
      maxScale: 5,
    };

    // Initialize canvas bounds
    this.canvasBounds = {
      minX: -10000,
      minY: -10000,
      maxX: 10000,
      maxY: 10000,
    };

    this.roomID = roomID;
    this.socket = socket;
    this.controller = new AbortController();

    this.setupCursorCanvas();
    this.createModernCursorIcon();
    this.init();
    this.initHandler();
    this.initMouseEvents();
    this.startCursorAnimation();
    this.startRenderLoop();
    this.updateCanvasBounds();
  }

  // Enhanced cursor canvas setup
  private setupCursorCanvas(): void {
    this.cursorCanvas = document.createElement("canvas");
    this.cursorCanvas.className = "cursor-canvas";
    this.cursorCanvas.width = this.canvas.width;
    this.cursorCanvas.height = this.canvas.height;

    const ctx = this.cursorCanvas.getContext("2d");
    if (!ctx) {
      throw new Error("Unable to get 2D context from cursor canvas");
    }

    // Optimize for crisp rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

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
      if (parent.style.position !== "relative" && parent.style.position !== "absolute") {
        parent.style.position = "relative";
      }
    }

    // Insert cursor canvas after the main canvas
    this.canvas.parentNode?.insertBefore(this.cursorCanvas, this.canvas.nextSibling);
    this.cursorCtx = ctx;
  }

  // Modern cursor icon creation
  private createModernCursorIcon(): void {
    const iconCanvas = document.createElement("canvas");
    iconCanvas.width = 32;
    iconCanvas.height = 32;
    const ctx = iconCanvas.getContext("2d");
    if (!ctx) return;

    // Enable anti-aliasing for smooth curves
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Modern cursor design with shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;

    // Main cursor body - white with subtle border
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#374151";
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
    ctx.shadowColor = "transparent";
    ctx.fillStyle = "#6B7280";
    ctx.beginPath();
    ctx.arc(6, 6, 2, 0, Math.PI * 2);
    ctx.fill();

    this.cursorIcon = iconCanvas;
  }

  // Method to set the participants change callback
  public setParticipantsCallback(callback: (participants: string[]) => void): void {
    this.onParticipantsChange = callback;
  }

  // Method to update participants and notify callback
  private updateParticipants(participants: string[]): void {
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
  private updateRemoteCursor(userId: string, x: number, y: number): void {
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
        color: this.getColorForUser(userId),
      });
    }

    // Start animation if not already running
    if (!this.cursorAnimationFrame) {
      this.startCursorAnimation();
    }
  }

  // Method to remove remote cursor (when user disconnects)
  private removeRemoteCursor(userId: string): void {
    this.animatedCursors.delete(userId);
  }

  // Enhanced cursor animation system
  private startCursorAnimation(): void {
    if (this.cursorAnimationFrame) return;

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
        this.cursorAnimationFrame = null;
      }
    };

    this.cursorAnimationFrame = requestAnimationFrame(animate);
  }

  // Modern cursor rendering
  private drawModernCursor(cursor: AnimatedCursor): void {
    const ctx = this.cursorCtx;
    const { currentX: worldX, currentY: worldY, color, userId, opacity, scale } = cursor;

    // Convert world coordinates to screen coordinates
    const screenPos = this.worldToScreen(worldX, worldY);
    const x = screenPos.x;
    const y = screenPos.y;

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
      ctx.globalCompositeOperation = "multiply";
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

      ctx.globalCompositeOperation = "source-over";
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
  private drawFallbackCursor(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
    // Modern fallback design
    ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = "#FFFFFF";
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
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  // Enhanced user label with modern design
  private drawModernUserLabel(
    ctx: CanvasRenderingContext2D,
    userId: string,
    x: number,
    y: number,
    color: string,
    opacity: number
  ): void {
    const initial = userId.charAt(0).toUpperCase();
    const padding = 8;
    const fontSize = 12;

    ctx.globalAlpha = opacity;
    ctx.font = `600 ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    const textWidth = ctx.measureText(initial).width;

    // Modern pill background with shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = color;
    ctx.beginPath();
    // Create rounded rectangle manually for better browser compatibility
    const rectX = x - padding;
    const rectY = y - fontSize / 2 - padding / 2;
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
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // White text with better typography
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initial, x + textWidth / 2, y + 1);
  }

  // Optimized cursor position sending with throttling
  private sendCursorPosition(screenX: number, screenY: number): void {
    const now = Date.now();
    if (now - this.lastCursorSend < this.cursorConfig.throttleRate) return;

    this.lastCursorSend = now;

    // Convert screen coordinates to world coordinates for cursor sharing
    const worldPos = this.screenToWorld(screenX, screenY);

    // Only send if position changed significantly (reduce network traffic)
    if (
      !this.lastCursorPosition ||
      Math.abs(this.lastCursorPosition.x - worldPos.x) > 2 ||
      Math.abs(this.lastCursorPosition.y - worldPos.y) > 2
    ) {
      this.lastCursorPosition = { x: worldPos.x, y: worldPos.y };

      this.socket.send(
        JSON.stringify({
          type: "cursorMove",
          x: Math.round(worldPos.x),
          y: Math.round(worldPos.y),
          roomId: this.roomID,
        })
      );
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

  // Infinite canvas viewport methods
  private applyViewportTransform(): void {
    this.ctx.save();
    this.ctx.translate(this.viewport.x, this.viewport.y);
    this.ctx.scale(this.viewport.scale, this.viewport.scale);
  }

  private restoreViewportTransform(): void {
    this.ctx.restore();
  }

  // Convert screen coordinates to world coordinates
  private screenToWorld(screenX: number, screenY: number): Point {
    return {
      x: (screenX - this.viewport.x) / this.viewport.scale,
      y: (screenY - this.viewport.y) / this.viewport.scale,
    };
  }

  // Convert world coordinates to screen coordinates
  private worldToScreen(worldX: number, worldY: number): Point {
    return {
      x: worldX * this.viewport.scale + this.viewport.x,
      y: worldY * this.viewport.scale + this.viewport.y,
    };
  }

  // Fixed pan the viewport
  private panViewport(deltaX: number, deltaY: number): void {
    this.viewport.x += deltaX;
    this.viewport.y += deltaY;
    this.updateCanvasBounds();
    this.needsRedraw = true;
  }

  // Fixed zoom the viewport
  private zoomViewport(zoomFactor: number, centerX: number, centerY: number): void {
    const oldScale = this.viewport.scale;
    const newScale = Math.max(
      this.viewport.minScale,
      Math.min(this.viewport.maxScale, this.viewport.scale * zoomFactor)
    );

    if (newScale !== oldScale) {
      // Zoom towards the center point (mouse position)
      const scaleRatio = newScale / oldScale;
      this.viewport.x = centerX - (centerX - this.viewport.x) * scaleRatio;
      this.viewport.y = centerY - (centerY - this.viewport.y) * scaleRatio;
      this.viewport.scale = newScale;

      this.updateCanvasBounds();
      this.needsRedraw = true;
    }
  }

  // Update canvas bounds based on viewport
  private updateCanvasBounds(): void {
    const margin = 1000;
    
    this.canvasBounds = {
      minX: -this.viewport.x / this.viewport.scale - margin,
      minY: -this.viewport.y / this.viewport.scale - margin,
      maxX: (-this.viewport.x + this.canvas.width) / this.viewport.scale + margin,
      maxY: (-this.viewport.y + this.canvas.height) / this.viewport.scale + margin,
    };
  }

  // Reset viewport to center
  public resetViewport(): void {
    this.viewport.x = this.canvas.width / 2;
    this.viewport.y = this.canvas.height / 2;
    this.viewport.scale = 1;
    this.updateCanvasBounds();
    this.needsRedraw = true;
  }

  // Get current viewport info
  public getViewportInfo() {
    return {
      x: this.viewport.x,
      y: this.viewport.y,
      scale: this.viewport.scale,
      bounds: this.canvasBounds,
    };
  }

  // Draw infinite grid that adapts to zoom level
  private drawInfiniteGrid(): void {
    const baseGridSize = 50;
    const gridSize = baseGridSize * this.viewport.scale;
    
    // Only draw grid if it's not too dense or too sparse
    if (gridSize < 10 || gridSize > 200) return;
    
    const gridColor = this.viewport.scale > 0.5 ? "#e0e0e0" : "#f0f0f0";

    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 1 / this.viewport.scale;

    // Calculate visible grid bounds in world coordinates
    const worldBounds = {
      minX: this.canvasBounds.minX,
      minY: this.canvasBounds.minY,
      maxX: this.canvasBounds.maxX,
      maxY: this.canvasBounds.maxY
    };

    const startX = Math.floor(worldBounds.minX / baseGridSize) * baseGridSize;
    const endX = Math.ceil(worldBounds.maxX / baseGridSize) * baseGridSize;
    const startY = Math.floor(worldBounds.minY / baseGridSize) * baseGridSize;
    const endY = Math.ceil(worldBounds.maxY / baseGridSize) * baseGridSize;

    // Draw vertical lines
    for (let x = startX; x <= endX; x += baseGridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, worldBounds.minY);
      this.ctx.lineTo(x, worldBounds.maxY);
      this.ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = startY; y <= endY; y += baseGridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(worldBounds.minX, y);
      this.ctx.lineTo(worldBounds.maxX, y);
      this.ctx.stroke();
    }
  }

  // Start render loop for performance optimization
  private startRenderLoop(): void {
    const render = () => {
      if (this.needsRedraw) {
        this.clearCanvas();
        this.needsRedraw = false;
      }
      this.animationFrameId = requestAnimationFrame(render);
    };
    render();
  }

  async init(): Promise<void> {
    try {
      this.shapes = await getShapes(this.roomID);
      console.log(this.shapes, "Shapes");
      this.needsRedraw = true;
    } catch (error) {
      console.error("Failed to load shapes:", error);
      this.shapes = [];
    }
  }

  selectColor(color: string): void {
    this.SelectedColor = color;
  }

  selectLineWidth(width: number): void {
    this.SelectedLineWidth = width;
  }

  selectBackground(color: string): void {
    this.SelectedBackground = color;
  }

  selectTool(tool: Tooltype): void {
    this.SelectedTool = tool;
    
    // Update cursor style based on tool
    if (tool === "pan") {
      this.canvas.style.cursor = "grab";
    } else {
      this.canvas.style.cursor = "crosshair";
    }
  }

  initHandler(): void {
    this.socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Message Received", data);

        if (data.type === "participants") {
          this.updateParticipants(data.participants);
          return;
        }
        if (data.type === "participantsUpdate") {
          this.updateParticipants(data.participants.map((p: any) => p.userId));
          return;
        }
        if (data.type === "cursorMove") {
          this.updateRemoteCursor(data.userId, data.x, data.y);
          return;
        }

        const shape = JSON.parse(data.message);
        if (data.type === "msg") {
          this.shapes.push(shape);
          this.needsRedraw = true;
        }
        if (data.type === "move") {
          this.shapes = this.shapes.map((el) => {
            if (el.name !== "eraser" && el.id === shape.id) {
              return shape;
            }
            return el;
          });
          this.needsRedraw = true;
        }
      } catch (error) {
        console.error("Error parsing socket message:", error);
      }
    };
  }

  clearCanvas(): void {
    // Clear the entire canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Fill with white background
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply viewport transformation
    this.applyViewportTransform();

    // Draw grid
    this.drawInfiniteGrid();

    // Draw all shapes
    this.shapes.forEach((shape) => {
      this.draw(shape);
    });

    // Draw selection box if shape is selected
    if (this.SelectedShape) {
      this.drawSelectionBox();
    }

    // Restore transformation
    this.restoreViewportTransform();
  }

  public getParticipants(): string[] {
    return this.Participants;
  }

  cleanCanvas(): void {
    this.shapes = [];
    this.SelectedShape = undefined;
    this.needsRedraw = true;
  }

  public DeleteHandler(): void {
    this.controller.abort();

    // Clean up render loop
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

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
      const handles = [
        // Corners
        { x: this.SelectedShape.x - padding / 2, y: this.SelectedShape.y - padding / 2, type: "nw" },
        { x: this.SelectedShape.x + this.SelectedShape.Width + padding / 2, y: this.SelectedShape.y - padding / 2, type: "ne" },
        { x: this.SelectedShape.x - padding / 2, y: this.SelectedShape.y + this.SelectedShape.Height + padding / 2, type: "sw" },
        { x: this.SelectedShape.x + this.SelectedShape.Width + padding / 2, y: this.SelectedShape.y + this.SelectedShape.Height + padding / 2, type: "se" },
        // Midpoints
        { x: this.SelectedShape.x + this.SelectedShape.Width / 2, y: this.SelectedShape.y - padding / 2, type: "n" },
        { x: this.SelectedShape.x + this.SelectedShape.Width + padding / 2, y: this.SelectedShape.y + this.SelectedShape.Height / 2, type: "e" },
        { x: this.SelectedShape.x + this.SelectedShape.Width / 2, y: this.SelectedShape.y + this.SelectedShape.Height + padding / 2, type: "s" },
        { x: this.SelectedShape.x - padding / 2, y: this.SelectedShape.y + this.SelectedShape.Height / 2, type: "w" },
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
        Math.pow(x - this.SelectedShape.x, 2) + Math.pow(y - this.SelectedShape.y, 2)
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

  drawSelectionBox(): void {
    if (!this.SelectedShape) return;

    const ctx = this.ctx;
    const handleSize = 8;
    const handleColor = "blue";
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2 / this.viewport.scale;
    ctx.setLineDash([5 / this.viewport.scale, 5 / this.viewport.scale]);

    const padding = 4;

    if (this.SelectedShape.name === "rect") {
      ctx.strokeRect(
        this.SelectedShape.x - padding / 2,
        this.SelectedShape.y - padding / 2,
        this.SelectedShape.Width + padding,
        this.SelectedShape.Height + padding
      );

      ctx.fillStyle = handleColor;
      ctx.setLineDash([]);

      const handles = [
        // Corners
        { x: this.SelectedShape.x - padding / 2, y: this.SelectedShape.y - padding / 2, type: "nw" },
        { x: this.SelectedShape.x + this.SelectedShape.Width + padding / 2, y: this.SelectedShape.y - padding / 2, type: "ne" },
        { x: this.SelectedShape.x - padding / 2, y: this.SelectedShape.y + this.SelectedShape.Height + padding / 2, type: "sw" },
        { x: this.SelectedShape.x + this.SelectedShape.Width + padding / 2, y: this.SelectedShape.y + this.SelectedShape.Height + padding / 2, type: "se" },
        // Midpoints
        { x: this.SelectedShape.x + this.SelectedShape.Width / 2, y: this.SelectedShape.y - padding / 2, type: "n" },
        { x: this.SelectedShape.x + this.SelectedShape.Width + padding / 2, y: this.SelectedShape.y + this.SelectedShape.Height / 2, type: "e" },
        { x: this.SelectedShape.x + this.SelectedShape.Width / 2, y: this.SelectedShape.y + this.SelectedShape.Height + padding / 2, type: "s" },
        { x: this.SelectedShape.x - padding / 2, y: this.SelectedShape.y + this.SelectedShape.Height / 2, type: "w" },
      ];

      handles.forEach((handle) => {
        ctx.fillRect(
          handle.x - (handleSize / 2) / this.viewport.scale,
          handle.y - (handleSize / 2) / this.viewport.scale,
          handleSize / this.viewport.scale,
          handleSize / this.viewport.scale
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
        Math.PI * 2
      );
      ctx.stroke();
      ctx.fillStyle = handleColor;
      ctx.fillRect(
        this.SelectedShape.x + this.SelectedShape.radius - (handleSize / 2) / this.viewport.scale,
        this.SelectedShape.y - (handleSize / 2) / this.viewport.scale,
        handleSize / this.viewport.scale,
        handleSize / this.viewport.scale
      );
    }

    ctx.setLineDash([]);
  }

  draw(shape: Shape): void {
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
      this.ctx.fill();
      this.ctx.stroke();
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
      this.ctx.fill();
      this.ctx.stroke();
    } else if (shape.name === "eraser") {
      // Apply global composite operation for eraser
      const originalOperation = this.ctx.globalCompositeOperation;
      this.ctx.globalCompositeOperation = "destination-out";
      this.ctx.fillStyle = "rgba(0,0,0,1)";
      this.ctx.fillRect(
        shape.x - shape.size / 2,
        shape.y - shape.size / 2,
        shape.size,
        shape.size
      );
      this.ctx.globalCompositeOperation = originalOperation;
    }
  }

  SelectShape(): void {
    const worldPos = this.lastWorldPos;
    
    const selectedShape = this.shapes.find((shape) => {
      if (shape.name === "rect") {
        return (
          worldPos.x > shape.x &&
          worldPos.x < shape.x + shape.Width &&
          worldPos.y > shape.y &&
          worldPos.y < shape.y + shape.Height
        );
      } else if (shape.name === "circle") {
        const distance = Math.sqrt(
          Math.pow(worldPos.x - shape.x, 2) + Math.pow(worldPos.y - shape.y, 2)
        );
        return distance < shape.radius;
      } else if (shape.name === "triangle") {
        // Point in triangle test using barycentric coordinates
        const { x1, y1, x2, y2, x3, y3 } = shape;
        const denominator = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3);
        const a = ((y2 - y3) * (worldPos.x - x3) + (x3 - x2) * (worldPos.y - y3)) / denominator;
        const b = ((y3 - y1) * (worldPos.x - x3) + (x1 - x3) * (worldPos.y - y3)) / denominator;
        const c = 1 - a - b;
        return a >= 0 && b >= 0 && c >= 0;
      }
      return false;
    });

    this.SelectedShape = selectedShape;
    this.needsRedraw = true;
  }

  resizeShape(worldX: number, worldY: number): void {
    if (!this.SelectedShape || !this.currentResizeHandle) return;
    
    const shape = this.SelectedShape;
    const handle = this.currentResizeHandle;

    if (shape.name === "rect") {
      switch (handle.type) {
        case "nw":
          shape.Width += shape.x - worldX;
          shape.Height += shape.y - worldY;
          shape.x = worldX;
          shape.y = worldY;
          break;
        case "ne":
          shape.Width = worldX - shape.x;
          shape.Height += shape.y - worldY;
          shape.y = worldY;
          break;
        case "sw":
          shape.Width += shape.x - worldX;
          shape.Height = worldY - shape.y;
          shape.x = worldX;
          break;
        case "se":
          shape.Width = worldX - shape.x;
          shape.Height = worldY - shape.y;
          break;
        case "n":
          shape.Height += shape.y - worldY;
          shape.y = worldY;
          break;
        case "s":
          shape.Height = worldY - shape.y;
          break;
        case "e":
          shape.Width = worldX - shape.x;
          break;
        case "w":
          shape.Width += shape.x - worldX;
          shape.x = worldX;
          break;
      }
      
      // Ensure minimum size
      if (shape.Width < 10) shape.Width = 10;
      if (shape.Height < 10) shape.Height = 10;
    }

    if (shape.name === "circle") {
      const distance = Math.sqrt(
        Math.pow(worldX - shape.x, 2) + Math.pow(worldY - shape.y, 2)
      );
      if (handle.type === "se") {
        shape.radius = Math.max(5, distance);
      }
    }

    this.needsRedraw = true;
  }

  initMouseEvents(): void {
    // Add wheel event for zooming
    this.canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();

        const now = Date.now();
        if (now - this.lastWheelTime < 16) return; // Limit to ~60fps
        this.lastWheelTime = now;

        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.zoomViewport(zoomFactor, e.offsetX, e.offsetY);
      },
      { signal: this.controller.signal, passive: false }
    );

    this.canvas.addEventListener(
      "click",
      (e) => {
        const worldPos = this.screenToWorld(e.offsetX, e.offsetY);
        this.lastWorldPos = worldPos;
        
        if (this.SelectedTool === "cursor") {
          this.SelectShape();
        }
      },
      { signal: this.controller.signal }
    );

    this.canvas.addEventListener(
      "mousedown",
      (e) => {
        const worldPos = this.screenToWorld(e.offsetX, e.offsetY);
        this.lastWorldPos = worldPos;
        this.isDrawing = true;

        // Handle panning
        if (this.SelectedTool === "pan") {
          this.isPanning = true;
          this.panStart = { x: e.offsetX, y: e.offsetY };
          this.canvas.style.cursor = "grabbing";
          return;
        }

        if (this.SelectedTool === "cursor" && this.SelectedShape) {
          const handle = this.getHandleAtPosition(worldPos.x, worldPos.y);
          if (handle) {
            this.currentResizeHandle = handle;
            return;
          }

          // Check if clicking on the selected shape for dragging
          this.SelectShape();
          if (this.SelectedShape) {
            this.dragStart = worldPos;
            this.isDragging = true;
          }
        }
      },
      { signal: this.controller.signal }
    );

    this.canvas.addEventListener(
      "mouseup",
      (e) => {
        this.isDrawing = false;

        // Handle panning end
        if (this.isPanning) {
          this.isPanning = false;
          this.panStart = null;
          this.canvas.style.cursor = this.SelectedTool === "pan" ? "grab" : "crosshair";
          return;
        }

        // Handle resize end
        if (this.currentResizeHandle) {
          this.currentResizeHandle = null;
          // Send updated shape to server
          if (this.SelectedShape) {
            this.socket.send(
              JSON.stringify({
                type: "move",
                shape: this.SelectedShape,
                roomID: this.roomID,
              })
            );
          }
          return;
        }

        // Handle drag end
        if (this.isDragging) {
          this.isDragging = false;
          this.dragStart = null;
          // Send updated shape to server
          if (this.SelectedShape) {
            this.socket.send(
              JSON.stringify({
                type: "move",
                shape: this.SelectedShape,
                roomID: this.roomID,
              })
            );
          }
          return;
        }

        // Create new shapes
        const worldStart = this.lastWorldPos;
        const worldEnd = this.screenToWorld(e.offsetX, e.offsetY);
        const worldWidth = worldEnd.x - worldStart.x;
        const worldHeight = worldEnd.y - worldStart.y;

        let shape: Shape | null = null;

        // Only create shapes if there's meaningful movement
        if (Math.abs(worldWidth) < 5 && Math.abs(worldHeight) < 5 && 
            this.SelectedTool !== "pen" && this.SelectedTool !== "eraser") {
          return;
        }

        if (this.SelectedTool === "rect") {
          shape = {
            id: nanoid(),
            name: "rect",
            x: Math.min(worldStart.x, worldEnd.x),
            y: Math.min(worldStart.y, worldEnd.y),
            color: this.SelectedColor,
            lineWidth: this.SelectedLineWidth,
            background: this.SelectedBackground,
            Width: Math.abs(worldWidth),
            Height: Math.abs(worldHeight),
          };
        } else if (this.SelectedTool === "circle") {
          const radius = Math.max(Math.abs(worldWidth), Math.abs(worldHeight)) / 2;
          shape = {
            id: nanoid(),
            name: "circle",
            x: worldStart.x + worldWidth / 2,
            y: worldStart.y + worldHeight / 2,
            color: this.SelectedColor,
            lineWidth: this.SelectedLineWidth,
            background: this.SelectedBackground,
            radius: radius,
          };
        } else if (this.SelectedTool === "pen") {
          shape = {
            id: nanoid(),
            name: "pen",
            startx: worldStart.x,
            starty: worldStart.y,
            endx: worldEnd.x,
            endy: worldEnd.y,
            lineWidth: this.SelectedLineWidth,
            color: this.SelectedColor,
          };
        } else if (this.SelectedTool === "line") {
          shape = {
            id: nanoid(),
            name: "line",
            startX: worldStart.x,
            startY: worldStart.y,
            endX: worldEnd.x,
            endY: worldEnd.y,
            color: this.SelectedColor,
            lineWidth: this.SelectedLineWidth,
          };
        } else if (this.SelectedTool === "triangle") {
          shape = {
            id: nanoid(),
            name: "triangle",
            x1: worldStart.x,
            y1: worldStart.y,
            x2: worldEnd.x,
            y2: worldEnd.y,
            x3: worldStart.x + worldWidth / 2,
            y3: worldStart.y - worldHeight,
            color: this.SelectedColor,
            lineWidth: this.SelectedLineWidth,
            background: this.SelectedBackground,
          };
        } else if (this.SelectedTool === "eraser") {
          shape = {
            id: nanoid(),
            name: "eraser",
            x: worldEnd.x,
            y: worldEnd.y,
            size: 20 / this.viewport.scale,
          };
        }

        if (shape) {
          this.shapes.push(shape);
          this.socket.send(
            JSON.stringify({
              type: "msg",
              shape: shape,
              roomID: this.roomID,
            })
          );
          this.needsRedraw = true;
        }
      },
      { signal: this.controller.signal }
    );

    this.canvas.addEventListener(
      "mousemove",
      (e) => {
        // Enhanced cursor position tracking with throttling
        this.sendCursorPosition(e.offsetX, e.offsetY);
        
        const worldPos = this.screenToWorld(e.offsetX, e.offsetY);

        // Handle panning
        if (this.isPanning && this.panStart) {
          const deltaX = e.offsetX - this.panStart.x;
          const deltaY = e.offsetY - this.panStart.y;
          this.panViewport(deltaX, deltaY);
          this.panStart = { x: e.offsetX, y: e.offsetY };
          return;
        }

        if (!this.isDrawing) return;

        // Handle resizing
        if (this.SelectedTool === "cursor" && this.SelectedShape && this.currentResizeHandle) {
          this.resizeShape(worldPos.x, worldPos.y);
          return;
        }

        // Handle dragging
        if (this.isDragging && this.dragStart && this.SelectedShape) {
          const dx = worldPos.x - this.dragStart.x;
          const dy = worldPos.y - this.dragStart.y;

          if (this.SelectedShape.name === "rect") {
            this.SelectedShape.x += dx;
            this.SelectedShape.y += dy;
          } else if (this.SelectedShape.name === "circle") {
            this.SelectedShape.x += dx;
            this.SelectedShape.y += dy;
          } else if (this.SelectedShape.name === "triangle") {
            this.SelectedShape.x1 += dx;
            this.SelectedShape.x2 += dx;
            this.SelectedShape.x3 += dx;
            this.SelectedShape.y1 += dy;
            this.SelectedShape.y2 += dy;
            this.SelectedShape.y3 += dy;
          }

          this.dragStart = worldPos;
          this.needsRedraw = true;
          return;
        }

        // Handle drawing tools (preview while drawing)
        if (this.SelectedTool === "pen") {
          // For pen tool, create strokes as we move
          const shape: Shape = {
            id: nanoid(),
            name: "pen",
            startx: this.lastWorldPos.x,
            starty: this.lastWorldPos.y,
            endx: worldPos.x,
            endy: worldPos.y,
            color: this.SelectedColor,
            lineWidth: this.SelectedLineWidth,
          };

          this.shapes.push(shape);
          this.socket.send(
            JSON.stringify({
              type: "msg",
              shape: shape,
              roomID: this.roomID,
            })
          );
          this.lastWorldPos = worldPos;
          this.needsRedraw = true;
        } else {
          // For other tools, just show preview (this would need a preview layer)
          this.needsRedraw = true;
        }
      },
      { signal: this.controller.signal }
    );
  }
}