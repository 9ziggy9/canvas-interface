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

function clearCanvas(ctx: CanvasRenderingContext2D, cnv: HTMLCanvasElement) {
  ctx.clearRect(0, 0, cnv.width, cnv.height);
  drawCheckerBoard(ctx, [cnv.width, cnv.height], COLOR.lightGray, COLOR.white);
}

type StateMap<T> = (state: T) => T;
interface StateAggregator<T> {
  attach: (m: StateMap<T>) => StateAggregator<T>;
  run: () => void;
}

// MONAD !!!
function returnStateAggregator<T>
  (initialState: T, fn: (s: T) => void) : StateAggregator<T>
{
  let state: T = initialState;
  let stateMaps: StateMap<T>[] = [];
  return {
    attach(m: StateMap<T>) {
      stateMaps.push(m);
      console.log(stateMaps);
      return this;
    },
    run: () => {
      state = stateMaps.reduce((cState, m) => m(cState), state);
      fn(state);
    },
  }
}

interface PolygonState {
  sides: number;
  dy_dt: number; // Vertical velocity
  dx_dt: number; // horizontal velocity
  radius: number;
  center: [number, number]; // x, y coordinates of the center
  lineWidth: number; 
  strokeColor: string;
  fillColor: string;
  morphDir: number;
  frameCount: number;
}

function animateAtTargetFPS(
  target: number,
  ctx: CanvasRenderingContext2D,
  cnv: HTMLCanvasElement,
) {

    let lastFrameTime = 0; 
    let frameCount = 0;

    const poly0: PolygonState = {
      sides: 4,
      dy_dt: 0,
      dx_dt: 2,
      radius: 40,
      center: [cnv.width/2, cnv.height/2],
      lineWidth: 4,
      strokeColor: COLOR.red,
      fillColor: COLOR.blue,
      morphDir: 1,
      frameCount: 0,
    };

    const updatePolygon = returnStateAggregator<PolygonState>(poly0, (s) => {
      clearCanvas(ctx, cnv);
      drawNGon(ctx, s.center, s.radius, s.sides, s.lineWidth, COLOR.red, COLOR.blue);
    });

    const applyGravity = (s: PolygonState): PolygonState => {
      const dt = 1;
      const g = 2;
      s.dy_dt += g * dt;
      s.center[1] += s.dy_dt * dt;
      return s;
    };

    const enforceFloor = (s: PolygonState): PolygonState => {
      let [_,y] = s.center;
      if (y + s.radius > cnv.height) {
        y = cnv.height - s.radius;
        s.dy_dt *= -0.8; // energy loss
      }
      return {...s, center: [s.center[0], y], dy_dt: s.dy_dt};
    };

    const morphSides = (s: PolygonState): PolygonState =>  {
      if (s.frameCount % 5 === 0) s.sides++;
      return {...s, sides: s.sides};
    }

    const countFrames = (s: PolygonState): PolygonState => {
      return {...s, frameCount: s.frameCount + 1};
    }

    const logState = (s: PolygonState): PolygonState => {
      console.log(s);
      return s;
    }
 
    updatePolygon
      .attach(s => countFrames(s))
      .attach(s => applyGravity(s))
      .attach(s => enforceFloor(s))
      .attach(s => morphSides(s))

  function animationLoop(timestamp: number) {
    const timeSinceLastFrame = timestamp - lastFrameTime;
    const targetFrameTime = 1000 / target;
    // Only update if enough time has passed for the next frame
    if (timeSinceLastFrame >= targetFrameTime) {
      lastFrameTime = timestamp;
      frameCount++;

      updatePolygon.run();

      requestAnimationFrame(animationLoop); 
    } else {
      requestAnimationFrame(animationLoop); // skip and wait
    }
  }
  requestAnimationFrame(animationLoop);
}

function main(): void {
  greetingMsg("Logging function test: hello.");
  const [ctx, cnv] = initCanvas();
  const regionEntire: [number, number] = [cnv.width, cnv.height];
  drawCheckerBoard(ctx, regionEntire, COLOR.lightGray, COLOR.white);
  animateAtTargetFPS(60, ctx, cnv);
}

window.onload = main
