import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = " Sticker Sketchpad game";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

//Step 1
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.style.border = "thin solid black";
canvas.style.borderRadius = "10px";
canvas.style.boxShadow = "5px 5px 10px rgba(0, 0, 0, 0.5)";
app.append(canvas);

//Step 2
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
  currentLine.length = empty;
  redoStack.length = empty;
  canvas.dispatchEvent(new Event("drawing-changed"));
});
app.append(clearButton);

//Step 3
interface Point {
  x: number;
  y: number;
}
let currentLine: Point[] = [];
const lines: Point[][] = [];
const firstIndex = 0;

canvas.addEventListener("mousedown", () => {
  isDrawing = true;
  currentLine = [];
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
  if (currentLine.length > empty) {
    lines.push(currentLine);
  }
  canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    const point: Point = { x: e.offsetX, y: e.offsetY };
    currentLine.push(point);
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

canvas.addEventListener("drawing-changed", () => {
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(originX, originY, canvas.width, canvas.height);
  for (const line of lines) {
    if (line.length === empty) continue;
    ctx.beginPath();
    ctx.moveTo(line[firstIndex].x, line[firstIndex].y);
    for (const point of line) {
      ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
  }
  if (isDrawing && currentLine.length > empty) {
    ctx.beginPath();
    ctx.moveTo(currentLine[firstIndex].x, currentLine[firstIndex].y);
    for (const point of currentLine) {
      ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
  }
});

//Step 4
const redoStack: Point[][] = [];

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
