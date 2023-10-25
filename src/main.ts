import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;
const gameName = " Sticker Sketchpad game";
document.title = gameName;
const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.style.border = "thin solid black";
canvas.style.borderRadius = "10px";
canvas.style.boxShadow = "5px 5px 10px rgba(0, 0, 0, 0.5)";
app.append(canvas);

let isDrawing = false;
const empty = 0;
const lineBreak = document.createElement("br");
app.append(lineBreak);

const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear";
const originX = 0;
const originY = 0;
clearButton.addEventListener("click", () => {
  lines.length = empty;
  currentLine = null;
  redoStack.length = empty;
  canvas.dispatchEvent(new Event("drawing-changed"));
});
app.append(clearButton);

interface Point {
  x: number;
  y: number;
}
const firstIndex = 0;
const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo";
undoButton.addEventListener("click", () => {
  if (lines.length > empty) {
    const lastLine = lines.pop();
    if (lastLine) {
      redoStack.push(lastLine);
    }
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});
app.append(undoButton);

const redoButton = document.createElement("button");
redoButton.innerHTML = "Redo";
redoButton.addEventListener("click", () => {
  if (redoStack.length > empty) {
    const lastRemovedLine = redoStack.pop();
    if (lastRemovedLine) {
      lines.push(lastRemovedLine);
    }
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});
app.append(redoButton);
const lineBreaks = document.createElement("br");
app.append(lineBreaks);

interface Command {
  display(ctx: CanvasRenderingContext2D): void;
}
class MarkerLine implements Command {
  private points: Point[] = [];

  constructor(initialPoint: Point) {
    this.points.push(initialPoint);
  }

  drag(x: number, y: number): void {
    this.points.push({ x, y });
  }

  display(ctx: CanvasRenderingContext2D): void {
    if (this.points.length === empty || !ctx) return;
    ctx.beginPath();
    ctx.moveTo(this.points[firstIndex].x, this.points[firstIndex].y);
    for (const point of this.points) {
      ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
  }
}

const lines: Command[] = [];
const redoStack: Command[] = [];
let currentLine: MarkerLine | null = null;
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  const newLine = new MarkerLine({ x: e.offsetX, y: e.offsetY });
  lines.push(newLine);
  currentLine = newLine;
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
  if (currentLine) {
    canvas.dispatchEvent(new Event("drawing-changed"));
    currentLine = null;
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing && currentLine instanceof MarkerLine) {
    currentLine.drag(e.offsetX, e.offsetY);
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

canvas.addEventListener("drawing-changed", () => {
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(originX, originY, canvas.width, canvas.height);
  for (const command of lines) {
    command.display(ctx);
  }
});
