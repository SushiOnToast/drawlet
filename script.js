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

  const colourPicker = document.createElement("input");
  colourPicker.type = "color";
  colourPicker.id = "pen-colour"
  colourPicker.defaultValue = "#000000"
  const colourPickerLabel = document.createElement("label");
  colourPickerLabel.htmlFor = "pen-colour";
  colourPickerLabel.textContent = "Pen Colour";

  const penWidthSlider = document.createElement("input");
  penWidthSlider.type = "range";
  penWidthSlider.min = "1";
  penWidthSlider.max = "50";
  penWidthSlider.defaultValue = "10";
  penWidthSlider.id = "pen-width-slider";
  const penWidthSliderLabel = document.createElement("label");
  penWidthSliderLabel.htmlFor = "pen-width-slider";
  penWidthSliderLabel.textContent = "Pen Thickness: 10";

  const eraserWidthSlider = document.createElement("input");
  eraserWidthSlider.type = "range";
  eraserWidthSlider.min = "1";
  eraserWidthSlider.max = "500";
  eraserWidthSlider.defaultValue = "100";
  eraserWidthSlider.id = "eraser-width-slider";
  const eraserWidthSliderLabel = document.createElement("label");
  eraserWidthSliderLabel.htmlFor = "eraser-width-slider";
  eraserWidthSliderLabel.textContent = "Eraser Thickness: 100";

  // applying styles
  for (const [key, value] of Object.entries(toolbarStyle)) {
    toolbar.style[key] = value;
  }

  document.body.appendChild(canvas);
  // toolbar and its elements
  document.body.appendChild(toolbar);
  toolbar.appendChild(clearButton);
  toolbar.appendChild(eraserButton);
  toolbar.appendChild(colourPicker);
  toolbar.appendChild(colourPickerLabel);
  toolbar.appendChild(penWidthSlider);
  toolbar.appendChild(penWidthSliderLabel);
  toolbar.appendChild(eraserWidthSlider);
  toolbar.appendChild(eraserWidthSliderLabel);

  // drawing logic
  const ctx = canvas.getContext("2d");
  let penColour = "black";
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

  colourPicker.oninput = (e) => {
    penColour = e.target.value;
    colourPicker.value = e.target.value;
  }

  penWidthSlider.oninput = (e) => {
    penWidth = Number(e.target.value);
    penWidthSliderLabel.textContent = "Pen Thickness: " + penWidth;
  };

  eraserWidthSlider.oninput = (e) => {
    eraserWidth = Number(e.target.value);
    eraserWidthSliderLabel.textContent = "Eraser Thickness: " + eraserWidth;
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

    context.strokeStyle = penColour;
    context.lineWidth = isErasing ? eraserWidth : penWidth;
    context.lineCap = "round";

    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
  }
}

main();
