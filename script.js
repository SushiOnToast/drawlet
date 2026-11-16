function main() {
  // styles
  const toolbarStyle = {
    width: "20rem",
    height: "2.5rem",
    position: "absolute",
    top: "0",
    left: "50%",
    transform: "translateX(-50%)", // translates by own element length
    zIndex: "3",
    boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
    border: "solid rgba(149, 157, 165, 0.2)",
  };

  // creating the canvas element
  const canvas = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.zIndex = "2";

  // creating the toolbar
  const toolbar = document.createElement("div");

  const clearButton = document.createElement("button");
  clearButton.textContent = "Clear Canvas";
  const eraserButton = document.createElement("button");
  eraserButton.textContent = "Toggle Eraser";

  // applying styles
  for (const [key, value] of Object.entries(toolbarStyle)) {
    toolbar.style[key] = value;
  }

  document.body.appendChild(canvas);
  // toolbar and its elements
  document.body.appendChild(toolbar);
  toolbar.appendChild(clearButton);
  toolbar.appendChild(eraserButton);

  // drawing logic
  const ctx = canvas.getContext("2d");
  const strokeColour = "black";
  let isDrawing = false;
  let x = 0;
  let y = 0;

  // toolbar settings
  let isErasing = false;
  let penWidth = 1;
  let eraserWidth = 100;

  clearButton.onclick = () => {
    ctx.reset();
  };

  eraserButton.onclick = () => {
    isErasing = !isErasing;
  };

  canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    x = e.offsetX;
    y = e.offsetY;
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) {
      drawLine(ctx, x, y, e.offsetX, e.offsetY);
      x = e.offsetX;
      y = e.offsetY;
    }
  });

  canvas.addEventListener("mouseup", (e) => {
    if (isDrawing) {
      drawLine(ctx, x, y, e.offsetX, e.offsetY);
      x = 0;
      y = 0;
      isDrawing = false;
    }
  });

  function drawLine(context, x1, y1, x2, y2) {
    context.beginPath();

    context.globalCompositeOperation = isErasing
      ? "destination-out"
      : "source-over";

    context.strokeStyle = strokeColour;
    context.lineWidth = isErasing ? eraserWidth : penWidth;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
  }
}

main();
