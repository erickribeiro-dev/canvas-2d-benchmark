"use strict";
(() => {
  // Canvas settings
  const canvas = document.getElementById("canvas");
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext("2d");
  // DOM, variables and constants
  let output = document.getElementById("output");
  let startBtn = document.getElementById("start-btn");
  let shapes = [];
  let t0 = performance.now();
  let startedAt = t0;
  let bestScore = 0;
  // Benchmark tuning/settings
  const bench = {
    goodFPS: 60, // Default: 60
    avgFPS: 50, // Default: 50
    badFPS: 40, // Default: 40
    runDurationMs: 10000, // Default: 10000
    randomColors: true, // Default: true
    defaultStyle: "rgba(0, 0, 0, .5)", // Default: "rgba(0, 0, 0, .5)"
    autoRun: false, // Default: false
    keepPrevScore: true, // Default: true
    goFullScreen: false, // Default: false
  };

  // Classes
  class Rectangle {
    constructor(x, y, width, height, style) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.reverseX = false;
      this.reverseY = false;
      this.style = style;
    }
  }

  // Functions
  // Makes the whole canvas blank with each repaint
  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Creates and add new shapes to the array
  function pushRectangle(amount) {
    for (let i = 0; i < amount; i++) {
      let r, g, b, style;
      if (bench.randomColors) {
        r = Math.floor(Math.random() * 255);
        g = Math.floor(Math.random() * 255);
        b = Math.floor(Math.random() * 255);
        style = `rgba(${r},${g},${b},.5)`;
      } else {
        style = bench.defaultStyle;
      }
      let x = Math.floor(Math.random() * 200);
      let y = Math.floor(Math.random() * 200);

      let width = Math.floor(Math.random() * 100);
      let height = Math.floor(Math.random() * 100);

      shapes.push(new Rectangle(x, y, width, height, style));
    }
  }
  // Removes one shape from the list
  function popRectangle() {
    shapes.pop();
  }
  // Adds or remove shapes to the list depending on the fps
  function manageShapes(fps) {
    switch (true) {
      case fps > bench.goodFPS:
        pushRectangle(400);
        break;
      case fps > bench.avgFPS:
        pushRectangle(200);
      case fps > bench.badFPS:
        pushRectangle(50);
        break;
      default:
        popRectangle();
        break;
    }
  }

  // Render and animate all the shapes in the array
  function animateShapes() {
    for (const rectangle of shapes) {
      ctx.fillStyle = rectangle.style;
      ctx.fillRect(
        rectangle.reverseX ? rectangle.x-- : rectangle.x++,
        rectangle.reverseY ? rectangle.y-- : rectangle.y++,
        rectangle.width,
        rectangle.height
      );

      if (rectangle.x + rectangle.width >= canvas.width) {
        rectangle.reverseX = true;
      } else if (rectangle.x <= 0) {
        rectangle.reverseX = false;
      }

      if (rectangle.y + rectangle.height >= canvas.height) {
        rectangle.reverseY = true;
      } else if (rectangle.y <= 0) {
        rectangle.reverseY = false;
      }
    }
  }
  function updateBestScore() {
    if (shapes.length > bestScore) {
      bestScore = shapes.length;
    }
  }

  // Measure the current FPS
  function measureFPS() {
    let t1 = performance.now();
    let fps = 1000 / (t1 - t0);
    t0 = t1;
    return Math.floor(fps);
  }

  // Resets the benchmark value to default without needing to refresh the page
  function resetBenchmark() {
    if (!bench.keepPrevScore) {
      shapes = [];
    }
    t0 = performance.now();
    startedAt = t0;
  }

  // change html classes to .done and .running
  function changeClassToDone() {
    output.classList.remove("running");
    startBtn.classList.remove("running");
    canvas.classList.remove("running");
    output.classList.add("done");
    startBtn.classList.add("done");
    canvas.classList.add("done");
  }
  function changeClassToRunning() {
    output.classList.remove("done");
    startBtn.classList.remove("done");
    canvas.classList.remove("done");
    output.classList.add("running");
    startBtn.classList.add("running");
    canvas.classList.add("running");
  }

  // The main function with all the logic
  function render() {
    if (performance.now() - startedAt > bench.runDurationMs) {
      startBtn.disabled = false;
      changeClassToDone();
      return;
    }
    let fps = measureFPS();
    clearCanvas();
    manageShapes(fps);
    animateShapes();
    output.innerHTML = "Score: " + shapes.length + " | Best: " + bestScore;
    updateBestScore();
    requestAnimationFrame(render);
  }

  // Event listeners and other logic
  // Click to run
  startBtn.addEventListener("click", () => {
    changeClassToRunning();
    resetBenchmark();
    render();
    startBtn.disabled = true;
    if (bench.goFullScreen) {
      document.documentElement.requestFullscreen();
    }
  });

  // Autorun
  if (bench.autoRun) {
    changeClassToRunning();
    resetBenchmark();
    render();
    startBtn.disabled = true;
  }

  // Keyboard shortcuts
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "f") {
        document.documentElement.requestFullscreen();
      } else if (e.key === "r") {
        startBtn.click();
      }
    },
    false
  );
  console.log(
    "%cCanvas 2D Benchmark |%c Author: Erick Ribeiro ",
    "color: #aa0",
    "color: #0aa"
  );
  console.log(
    "Check the %cbench%cconstant on main.js to adjust the Benchmark settings.",
    "color: #aa0"
  );
})();
