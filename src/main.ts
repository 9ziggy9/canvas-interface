const COLOR = {
  "red":        "#bf616a",
  "blue":       "#81a1c1",
  "lightGray":  "#d8dee9",
  "white":      "#e5e9f0",
}

function initCanvas(): [CanvasRenderingContext2D, HTMLCanvasElement] | never {
  const cnv = document.getElementById("main-canvas") as HTMLCanvasElement
  if (!cnv) {
    throw new Error("Could not bind to canvas element. Not found?"); 
  }
  const ctx = cnv.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create 2D context.") 
  }
  return [ctx, cnv];
}

function greetingMsg(msg: string): void {
  console.log(msg);
}

// Has to be a better way.
type Scale = 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;

type DrawFunction = (ctx: CanvasRenderingContext2D,
                     region: [number, number],
                     ...args: any[]) => void

function drawCheckerBoard(
  ctx: CanvasRenderingContext2D,
  region: [number, number],
  color1: string,
  color2: string,
  scale: Scale = 0.1,
) : void
{
  const [width, height] = region;
  const size = Math.min(width, height) * scale; // compute the size of each square
  for (let i = 0; i < width; i += size) {
    for (let j = 0; j < height; j += size) {
      ctx.fillStyle = (i / size + j / size) % 2 === 0 ? color1 : color2;
      ctx.fillRect(i, j, size, size);
    }
  }
}

function drawCircle(
    ctx: CanvasRenderingContext2D,
    center: [number, number],
    radius: number,
    borderWidth: number,
    fillColor: string,
    borderColor: string
): void {
    const [x, y] = center;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.stroke();
}

function drawNGon(
    ctx: CanvasRenderingContext2D,
    center: [number, number],
    radius: number,
    n: number,
    borderWidth: number,
    fillColor: string,
    borderColor: string
): void {
    const [x, y] = center;
    n = Math.max(3, Math.min(n, 32));  // Enforce range 3-32

    ctx.beginPath();

    // Calculate angles for each vertex
    for (let i = 0; i < n; i++) {
        const angle = (2 * Math.PI / n) * i;
        const vertexX = x + radius * Math.cos(angle);
        const vertexY = y + radius * Math.sin(angle);

        if (i === 0) {
            ctx.moveTo(vertexX, vertexY);
        } else {
            ctx.lineTo(vertexX, vertexY);
        }
    }

    ctx.closePath();  // Connect last vertex to the first

    ctx.fillStyle = fillColor;
    ctx.fill();

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.stroke();
}

function runAt(callback: Function, interval: number) {
    let frameCount = 0;

    return () => {
        frameCount++;
        if (frameCount % interval === 0) {
            callback();
        }
    }
}

function animateAt30FPS(ctx: CanvasRenderingContext2D, cnv: HTMLCanvasElement) {
  let lastFrameTime = 0; 
  let nSides = 3; // Initial number of sides

  // Function to increment sides and redraw
  const incrementSides = runAt(() => {
      nSides++;
      if (nSides > 32) {
          nSides = 3;
      }
  }, 60); // Assuming 30FPS, this will trigger every 2 seconds

  function animationLoop(timestamp: number) {
    const timeSinceLastFrame = timestamp - lastFrameTime;
    const targetFrameTime = 1000 / 30; // Approximately 33 milliseconds for 30 FPS

    // Only update if enough time has passed for the next frame
    if (timeSinceLastFrame >= targetFrameTime) {
      lastFrameTime = timestamp;

      ctx.clearRect(0, 0, cnv.width, cnv.height);
      drawCheckerBoard(ctx, [cnv.width, cnv.height], COLOR.lightGray, COLOR.white);

      drawNGon(
        ctx,
        [cnv.width / 2, cnv.height / 2],
        100, nSides, 2,
        COLOR.red, COLOR.blue
      );

      incrementSides();

      requestAnimationFrame(animationLoop); 
    } else {
      // Skip this frame and continue to wait
      requestAnimationFrame(animationLoop);
    }
  }

  // Start the animation loop
  requestAnimationFrame(animationLoop);
}

function main(): void {
  greetingMsg("Logging function test: hello.");
  const [ctx, cnv] = initCanvas();
  const regionEntire: [number, number] = [cnv.width, cnv.height];
  drawCheckerBoard(ctx, regionEntire, COLOR.lightGray, COLOR.white);
  // drawCircle(ctx, [120,120], 50, 0, COLOR.red, COLOR.red);
  drawNGon(
    ctx,
    [cnv.width / 2, cnv.height / 2],
    120, 12, 4, COLOR.red, COLOR.blue
  );
  animateAt30FPS(ctx, cnv);
}

window.onload = main
