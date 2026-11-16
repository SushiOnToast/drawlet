function main() {
  // styles
  const toolbarStyle = {
    width: "60rem",
    height: "auto",
    position: "absolute",
    top: "1rem",
    left: "50%",
    transform: "translateX(-50%)", // translates by own element length
    zIndex: "3",
    boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
    border: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    padding: "0.75rem 1.25rem",
    backgroundColor: "white",
    borderRadius: "12px",
  };

  const buttonStyle = {
    fontFamily: "monospace",
    padding: "0.5rem 0.9rem",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    backgroundColor: "#f9fafb",
    color: "#374151",
    fontSize: "0.85rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
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
  clearButton.textContent = "Clear";
  const eraserButton = document.createElement("button");
  eraserButton.textContent = "Eraser: Off";

  const colourPicker = document.createElement("input");
  colourPicker.type = "color";
  colourPicker.id = "pen-colour";
  colourPicker.defaultValue = "#000000";
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
  Object.assign(toolbar.style, toolbarStyle);

  for (const button of [clearButton, eraserButton]) {
    Object.assign(button.style, buttonStyle);

    button.addEventListener("mouseenter", () => {
      if (button === eraserButton && isErasing) return;
      button.style.backgroundColor = "#e5e7eb";
    });

    button.addEventListener("mouseleave", () => {
      if (button === eraserButton && isErasing) return;

      button.style.backgroundColor = "#f9fafb";
    });
  }

  penWidthSlider.style.width = "90px";
  eraserWidthSlider.style.width = "90px";

  for (const label of [
    penWidthSliderLabel,
    eraserWidthSliderLabel,
    colourPickerLabel,
  ]) {
    label.style.fontSize = "0.75rem";
    label.style.fontFamily = "monospace";
    label.style.color = "#6b7280";
    label.style.whiteSpace = "nowrap";
  }

  colourPicker.style.border = "1px solid #e5e7eb";
  colourPicker.style.borderRadius = "8px";

  // append all elements
  document.body.appendChild(canvas);
  document.body.appendChild(toolbar);
  toolbar.appendChild(clearButton);
  toolbar.appendChild(eraserButton);
  toolbar.appendChild(colourPickerLabel);
  toolbar.appendChild(colourPicker);
  toolbar.appendChild(penWidthSliderLabel);
  toolbar.appendChild(penWidthSlider);
  toolbar.appendChild(eraserWidthSliderLabel);
  toolbar.appendChild(eraserWidthSlider);

  // drawing logic
  const ctx = canvas.getContext("2d");
  let penColour = "black";
  let isDrawing = false;
  let x = 0;
  let y = 0;

  // toolbar settings
  let isErasing = false;
  let penWidth = Number(penWidthSlider.value);
  let eraserWidth = 100;

  clearButton.onclick = () => {
    ctx.reset();
  };

  eraserButton.onclick = () => {
    isErasing = !isErasing;
    eraserButton.textContent = isErasing ? "Eraser: On" : "Eraser: Off";
    eraserButton.style.backgroundColor = isErasing ? "LightGreen" : "";
  };

  colourPicker.oninput = (e) => {
    penColour = e.target.value;
    colourPicker.value = e.target.value;
  };

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

  // handling resizing
  window.addEventListener("resize", () => {
    const savedCanvas = document.createElement("canvas");
    savedCanvas.width = canvas.width;
    savedCanvas.height = canvas.height;

    const savedCtx = savedCanvas.getContext("2d");
    savedCtx.drawImage(canvas, 0, 0);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.drawImage(savedCanvas, 0, 0);
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
