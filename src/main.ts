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
const ctx = canvas.getContext("2d");

canvas.addEventListener("mousedown", () => {
  isDrawing = true;
});
canvas.addEventListener("mouseup", () => {
  isDrawing = false;
  canvas.getContext("2d")!.beginPath();
});
canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) return;
  ctx?.lineTo(e.offsetX, e.offsetY);
  ctx?.stroke();
  ctx?.beginPath();
  ctx?.moveTo(e.offsetX, e.offsetY);
});

const lineBreak = document.createElement("br");
app.append(lineBreak);

const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear";
const originX = 0;
const originY = 0;
clearButton.addEventListener("click", () => {
  const ctx = canvas.getContext("2d")!;
  ctx?.clearRect(originX, originY, canvas.width, canvas.height);
});
app.append(clearButton);
