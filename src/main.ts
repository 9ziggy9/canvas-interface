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

function animateAtTargetFPS(
  target: number,
  ctx: CanvasRenderingContext2D,
  cnv: HTMLCanvasElement,
) {
    let lastFrameTime = 0; 

    // things we wish to evolve in time
    interface PolygonState {
      position: [number, number];
      radius: number;
      dy_dt: number; // vertical velocity
      dx_dt: number, // horizontal velocity
      decay: number; // impact loss
      frameCount: number;
      sides: number;
      morph: number;
    };

    const g = 2;
    const dt = 1;

    const updatePosition = (s: PolygonState): PolygonState => ({
      ...s, position: [s.position[0] + s.dx_dt, s.position[1] + s.dy_dt * dt]
    });

    const gravity = (s: PolygonState): PolygonState => ({
      ...s, dy_dt: s.dy_dt + g * dt
    });

    const applyFloor = (s: PolygonState): PolygonState =>
      (s.position[1] + s.radius > cnv.height)
        ? {
            ...s,
            position: [s.position[0], cnv.height - s.radius],
            dy_dt: (-1) * s.decay * s.dy_dt,
          }
        : s;

    const applyWalls = (s: PolygonState): PolygonState => ({
      ...s,
      dx_dt: s.dx_dt * ((s.position[0] + s.radius > cnv.width ||
        s.position[0] - s.radius < 0) ? (-1) : 1)
    });

    const updateFrames = (s: PolygonState): PolygonState => ({
      ...s, frameCount: s.frameCount + 1
    });

    const updateSides = (s: PolygonState): PolygonState => ({
      ...s,
      sides: s.sides + ((s.frameCount % 3 === 0) ? s.morph : 0),
    });

    const reverseMorph = (s: PolygonState): PolygonState => ({
      ...s,
      morph: s.morph * ((s.sides >= 10 || s.sides <= 3) ? -1 : 1),
    });

    const polygon00: PolygonState = {
      position: [cnv.width/2, cnv.height/2],
      radius: 40,
      dy_dt: 0, // start from rest
      dx_dt: 5,
      decay: 1,
      frameCount: 0,
      sides: 3,
      morph: 1,
    };
    const polygon0 = returnStateAggregator(polygon00, (s) => {
      drawNGon(ctx, s.position, s.radius, s.sides, 4, COLOR.red, COLOR.blue);
    });
    polygon0
      .attach(s => updateFrames(s))
      .attach(s => gravity(s))
      .attach(s => updatePosition(s))
      .attach(s => applyFloor(s))
      .attach(s => applyWalls(s))
      .attach(s => updateSides(s))
      .attach(s => reverseMorph(s));

    const polygon10: PolygonState = {
      position: [cnv.width/4, cnv.height/4],
      radius: 20,
      dy_dt: 0, // start from rest
      dx_dt: -2,
      decay: 1,
      frameCount: 0,
      sides: 3,
      morph: 1,
    };
    const polygon1 = returnStateAggregator(polygon10, (s) => {
      drawNGon(ctx, s.position, s.radius, s.sides, 4, COLOR.blue, COLOR.red);
    });
    polygon1
      .attach(s => updateFrames(s))
      .attach(s => gravity(s))
      .attach(s => updatePosition(s))
      .attach(s => applyFloor(s))
      .attach(s => applyWalls(s))
      .attach(s => updateSides(s))
      .attach(s => reverseMorph(s));


    function animationLoop(timestamp: number) {
      const timeSinceLastFrame = timestamp - lastFrameTime;
      const targetFrameTime = 1000 / target;
      // Only update if enough time has passed for the next frame
      if (timeSinceLastFrame >= targetFrameTime) {
        lastFrameTime = timestamp;

        // BEGIN: animations
        clearCanvas(ctx, cnv);
        polygon0.run();
        polygon1.run();
        // END: animations

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
