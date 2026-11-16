function main() {
  // prevent spamming of bookmarklet
  const existing = document.getElementById("drawlet");
  if (existing) {
    // remove external event listeners
    existing.controller.abort();
    existing.remove();
    return;
  }

  const controller = new AbortController();

  // styles
  const toolbarStyle = {
    width: "fit-content",
    height: "auto",
    position: "absolute",
    top: "1rem",
    left: "50%",
    transform: "translateX(-50%)", // translates by own element length
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

  // because it may not work on bigger websites where there are lots of elements, we create a shadow dom so it doesn't interfere
  const host = document.createElement("div");
  host.id = "drawlet";
  host.controller = controller;

  host.style.position = "fixed";
  host.style.inset = "0";
  host.style.zIndex = "2147483647";
  host.style.pointerEvents = "none";
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

  // creating the canvas element
  const canvas = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.pointerEvents = "auto";

  // creating the toolbar
  const toolbar = document.createElement("div");
  toolbar.id = "drawlet-toolbar";

  const hideToolbarButton = document.createElement("button");
  hideToolbarButton.id = "drawlet-toolbar-toggle";
  hideToolbarButton.textContent = "Hide Toolbar";

  const clearButton = document.createElement("button");
  clearButton.textContent = "Clear";
  const eraserButton = document.createElement("button");
  eraserButton.textContent = "Eraser: Off";
  const undoButton = document.createElement("button");
  undoButton.textContent = "Undo";

  // containers with labels
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
  toolbar.style.pointerEvents = "auto";

  hideToolbarButton.style.position = "absolute";
  hideToolbarButton.style.top = "1rem";
  hideToolbarButton.style.left = "1rem";
  hideToolbarButton.style.pointerEvents = "auto";

  for (const button of [clearButton, eraserButton, undoButton, hideToolbarButton]) {
    Object.assign(button.style, buttonStyle);

    if (button === hideToolbarButton) {
      button.style.backgroundColor = "white";
    }

    button.addEventListener("mouseenter", () => {
      if (button === eraserButton && isErasing) return;
      button.style.backgroundColor = "#e5e7eb";
    });

    button.addEventListener("mouseleave", () => {
      if (button === eraserButton && isErasing) return;
      if (button === hideToolbarButton) {
        button.style.backgroundColor = "#ffffff";
        return;
      }
      button.style.backgroundColor = "#f9fafb";
    });
  }

  hideToolbarButton.style.boxShadow = "0 4px 20px rgba(0,0,0,0.10)";

  penWidthSlider.style.width = "90px";
  eraserWidthSlider.style.width = "90px";

  for (const label of [
    penWidthSliderLabel,
    eraserWidthSliderLabel,
    colourPickerLabel,
  ]) {
    label.style.fontSize = "0.7rem";
    label.style.fontFamily = "monospace";
    label.style.color = "#6b7280";
    label.style.whiteSpace = "nowrap";
  }

  colourPicker.style.border = "1px solid #e5e7eb";
  colourPicker.style.borderRadius = "8px";

  // append all elements
  const inputLabelPairs = [
    [colourPickerLabel, colourPicker],
    [penWidthSliderLabel, penWidthSlider],
    [eraserWidthSliderLabel, eraserWidthSlider],
  ];

  shadow.appendChild(canvas);
  shadow.appendChild(toolbar);
  shadow.appendChild(hideToolbarButton);
  toolbar.appendChild(clearButton);
  toolbar.appendChild(eraserButton);

  for (const pair of inputLabelPairs) {
    const pairDiv = document.createElement("div");
    pairDiv.style.display = "flex";
    pairDiv.style.flexDirection = "column";
    pairDiv.style.alignItems = "center";
    pairDiv.style.gap = "0.3rem";
    pairDiv.style.padding = "0.2rem";

    pairDiv.appendChild(pair[0]);
    pairDiv.appendChild(pair[1]);

    toolbar.appendChild(pairDiv);
  }

  toolbar.appendChild(undoButton)

  // drawing logic
  const ctx = canvas.getContext("2d");
  let penColour = "black";
  let isDrawing = false;
  let x = 0;
  let y = 0;

  const strokes = [];
  let currentStroke = [];

  // toolbar settings
  let isErasing = false;
  let penWidth = Number(penWidthSlider.value);
  let eraserWidth = 100;

  // button functionality
  clearButton.onclick = () => {
    ctx.reset();
  };

  hideToolbarButton.onclick = () => {
    if (toolbar.style.display === "flex") {
      toolbar.style.display = "none";
      hideToolbarButton.textContent = "Show Toolbar";
    } else {
      toolbar.style.display = "flex";
      hideToolbarButton.textContent = "Hide Toolbar";
    }
  };

  eraserButton.onclick = () => {
    isErasing = !isErasing;
    eraserButton.textContent = isErasing ? "Eraser: On" : "Eraser: Off";
    eraserButton.style.backgroundColor = isErasing ? "LightGreen" : "";
  };

  undoButton.onclick = undo;

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

  // canvas events
  canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    x = e.offsetX;
    y = e.offsetY;

    currentStroke = {
      points: [{ x: x, y: y }],
      colour: penColour,
      width: isErasing ? eraserWidth : penWidth,
      isErasing: isErasing,
    };
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) {
      drawLine(ctx, x, y, e.offsetX, e.offsetY);
      currentStroke.points.push({
        x: e.offsetX,
        y: e.offsetY,
      });
      x = e.offsetX;
      y = e.offsetY;
    }
  });

  canvas.addEventListener("mouseup", (e) => {
    if (isDrawing) {
      drawLine(ctx, x, y, e.offsetX, e.offsetY);
      currentStroke.points.push({
        x: e.offsetX,
        y: e.offsetY,
      });
      strokes.push(currentStroke);

      currentStroke = [];
      x = 0;
      y = 0;
      isDrawing = false;
    }
  });

  window.addEventListener("resize", handleResize, {
    signal: controller.signal,
  });

  window.addEventListener(
    "keydown",
    (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      }
    },
    { signal: controller.signal },
  );

  // handling resizing
  function handleResize() {
    const savedCanvas = document.createElement("canvas");
    savedCanvas.width = canvas.width;
    savedCanvas.height = canvas.height;

    const savedCtx = savedCanvas.getContext("2d");
    savedCtx.drawImage(canvas, 0, 0);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.drawImage(savedCanvas, 0, 0);
  }

  // redrawing canvas to recreate all the strokes after removing one of them
  function redrawCanvas(context) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (const stroke of strokes) {
      context.globalCompositeOperation = isErasing
        ? "destination-out"
        : "source-over";

      context.strokeStyle = penColour;
      context.lineWidth = isErasing ? eraserWidth : penWidth;
      context.lineCap = "round";

      context.beginPath();

      const firstPt = stroke.points[0];
      context.moveTo(firstPt.x, firstPt.y);

      for (const point of stroke.points) {
        context.lineTo(point.x, point.y);
      }

      context.stroke();
      context.closePath();
    }
  }

  function undo() {
    if (strokes.length === 0) return;
    // removing off top of stack
    strokes.pop();

    redrawCanvas(ctx);
  }

  function drawLine(context, x1, y1, x2, y2) {
    context.globalCompositeOperation = isErasing
      ? "destination-out"
      : "source-over";

    context.strokeStyle = penColour;
    context.lineWidth = isErasing ? eraserWidth : penWidth;
    context.lineCap = "round";

    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
  }
}

main();
