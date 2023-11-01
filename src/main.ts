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
canvas.style.cursor = "none";
app.append(canvas);

let isDrawing = false;
let inCanvas = false;
const empty = 0;
const lineBreak = document.createElement("br");
app.append(lineBreak);

const THIN = 2;
const THICK = 10;

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

const EXPORT_SIZE = 1024;
const SCALE_SIZE = 4;
const exportButton = document.createElement("button");
exportButton.innerHTML = "Export";
exportButton.addEventListener("click", () => {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = EXPORT_SIZE;
  exportCanvas.height = EXPORT_SIZE;
  const ctx = exportCanvas.getContext("2d")!;
  ctx.scale(SCALE_SIZE, SCALE_SIZE);
  for (const command of lines) {
    command.display(ctx);
  }
  const anchor = document.createElement("a");
  anchor.href = canvas.toDataURL("image/png");
  anchor.download = "sketchpad.png";
  anchor.click();
});
app.append(exportButton);

const lineBreaks = document.createElement("br");
app.append(lineBreaks);

interface Command {
  display(ctx: CanvasRenderingContext2D): void;
}
class MarkerLine implements Command {
  private points: Point[] = [];
  private thickness: number;
  private color = `#000000`;

  constructor(initialPoint: Point, thickness: number) {
    this.points.push(initialPoint);
    this.thickness = thickness;
    this.color = CURRENT_COLOR;
  }

  drag(x: number, y: number): void {
    this.points.push({ x, y });
  }

  display(ctx: CanvasRenderingContext2D): void {
    if (this.points.length === empty || !ctx) return;
    ctx.lineWidth = this.thickness;
    ctx.strokeStyle = this.color;
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
  if (currentSticker) {
    const newSticker = new Sticker(
      e.offsetX,
      e.offsetY,
      currentSticker,
      CURRENT_ROTATION
    );
    lines.push(newSticker);
    currentStickerCommand = newSticker;
  } else {
    isDrawing = true;
    const newLine = new MarkerLine(
      { x: e.offsetX, y: e.offsetY },
      currentThickness
    );
    lines.push(newLine);
    currentLine = newLine;
  }
});

canvas.addEventListener("mouseup", () => {
  if (currentStickerCommand) {
    currentStickerCommand = null;
  } else {
    isDrawing = false;
    if (currentLine) {
      canvas.dispatchEvent(new Event("drawing-changed"));
      currentLine = null;
    }
  }
});

let lastMouseX: number | null = null;
let lastMouseY: number | null = null;

canvas.addEventListener("mousemove", (e) => {
  lastMouseX = e.offsetX;
  lastMouseY = e.offsetY;
  if (currentSticker && currentStickerCommand) {
    currentStickerCommand.drag(e.offsetX, e.offsetY);
  } else if (isDrawing && currentLine instanceof MarkerLine) {
    currentLine.drag(e.offsetX, e.offsetY);
  }
  canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("mouseenter", () => {
  inCanvas = true;
  canvas.dispatchEvent(new Event("tool-moved"));
});

canvas.addEventListener("mouseout", () => {
  inCanvas = false;
  canvas.dispatchEvent(new Event("tool-moved"));
});

canvas.addEventListener("drawing-changed", redraw);
canvas.addEventListener("tool-moved", redraw);

const half = 2;
const counterclockwise = 180;
function redraw() {
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(originX, originY, canvas.width, canvas.height);
  for (const command of lines) {
    command.display(ctx);
  }
  if (!isDrawing && inCanvas) {
    ctx.beginPath();
    if (currentSticker && lastMouseX !== null && lastMouseY !== null) {
      ctx.save();
      ctx.translate(lastMouseX, lastMouseY);
      ctx.rotate((CURRENT_ROTATION * Math.PI) / counterclockwise);
      ctx.fillText(currentSticker, empty, empty);
      ctx.restore();
    } else if (!currentSticker && lastMouseX !== null && lastMouseY !== null) {
      ctx.beginPath();
      ctx.fillStyle = CURRENT_COLOR;
      ctx.arc(
        lastMouseX,
        lastMouseY,
        currentThickness / half,
        empty,
        Math.PI * half
      );
      ctx.fill();
    }
  }
}

const toolReference = document.createElement("div");
let currentThickness: number = THIN;
toolReference.classList.add("thin");

const thinButton = document.createElement("button");
thinButton.innerHTML = "🖌️ Thin Marker";
thinButton.addEventListener("click", () => {
  toolReference.classList.remove("thick");
  toolReference.classList.add("thin");
  currentSticker = null;
  updateThickness();
  canvas.dispatchEvent(new Event("tool-moved"));
});
app.append(thinButton);

const thickButton = document.createElement("button");
thickButton.innerHTML = "🖌️ Thick Marker";
thickButton.addEventListener("click", () => {
  toolReference.classList.remove("thin");
  toolReference.classList.add("thick");
  currentSticker = null;
  updateThickness();
  canvas.dispatchEvent(new Event("tool-moved"));
});
app.append(thickButton);

const sliderContainer = document.createElement("div");
sliderContainer.style.display = "flex";
sliderContainer.style.justifyContent = "center";

let CURRENT_COLOR = `#000000`;
const colorDisplay = document.createElement("div");
colorDisplay.style.width = "15px";
colorDisplay.style.height = "15px";
colorDisplay.style.border = "1px solid black";
colorDisplay.style.marginTop = "1px";
colorDisplay.style.borderRadius = "5px";
colorDisplay.style.backgroundColor = CURRENT_COLOR;
sliderContainer.append(colorDisplay);
app.appendChild(sliderContainer);

const colorSlider = document.createElement("input");
colorSlider.type = "range";
colorSlider.min = "0";
colorSlider.max = "360";
colorSlider.value = "0";
colorSlider.id = "slider";
sliderContainer.appendChild(colorSlider);

colorSlider.addEventListener("input", (event) => {
  const hue = (event.target as HTMLInputElement).value;
  CURRENT_COLOR = `hsl(${hue}, 100%, 50%)`;
  colorDisplay.style.backgroundColor = CURRENT_COLOR;
});

function updateThickness() {
  if (toolReference.classList.contains("thin")) {
    currentThickness = THIN;
  } else if (toolReference.classList.contains("thick")) {
    currentThickness = THICK;
  }
}

class Sticker implements Command {
  private x: number;
  private y: number;
  private sticker: string;
  private rotation: number;

  constructor(x: number, y: number, sticker: string, rotation: number) {
    this.x = x;
    this.y = y;
    this.sticker = sticker;
    this.rotation = rotation;
  }

  drag(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  display(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / counterclockwise);
    ctx.fillText(this.sticker, empty, empty);
    ctx.restore();
  }
}

let currentSticker: string | null = null;
let currentStickerCommand: Sticker | null = null;

const customStickerButton = document.createElement("button");
customStickerButton.innerHTML = "Create Custom Sticker";
customStickerButton.addEventListener("click", () => {
  const customSticker = prompt("Enter your custom sticker", "");
  if (customSticker && customSticker.trim() !== "") {
    stickerList.push(customSticker);
    const stickerButton = document.createElement("button");
    stickerButton.innerHTML = customSticker;
    stickerButton.addEventListener("click", () => {
      currentSticker = customSticker;
      canvas.dispatchEvent(new Event("tool-moved"));
    });
    app.append(stickerButton);
  }
});
app.append(customStickerButton);

const rotationContainer = document.createElement("div");
rotationContainer.style.display = "flex";
rotationContainer.style.justifyContent = "center";

let CURRENT_ROTATION = 0;
const rotationDisplay = document.createElement("div");
rotationDisplay.innerHTML = `${CURRENT_ROTATION}%↻`;
rotationContainer.append(rotationDisplay);
app.appendChild(rotationContainer);

const rotationSlider = document.createElement("input");
rotationSlider.type = "range";
rotationSlider.min = "0";
rotationSlider.max = "360";
rotationSlider.value = "0";
rotationSlider.id = "slider";
rotationContainer.appendChild(rotationSlider);

rotationSlider.addEventListener("input", (event) => {
  CURRENT_ROTATION = parseInt((event.target as HTMLInputElement).value);
  rotationDisplay.innerHTML = `${CURRENT_ROTATION}%↻`;
});

const stickerList = ["😀", "😺", "👍"];
for (const sticker of stickerList) {
  const stickerButton = document.createElement("button");
  stickerButton.innerHTML = sticker;
  stickerButton.addEventListener("click", () => {
    currentSticker = sticker;
    canvas.dispatchEvent(new Event("tool-moved"));
  });
  app.append(stickerButton);
}
