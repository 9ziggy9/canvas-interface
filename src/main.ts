import { Primitives } from "./primitives.js";
import { Loop } from "./animate.js";
import { State } from "./state.js";

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

function clearCanvas(
  ctx: CanvasRenderingContext2D,
  cnv: HTMLCanvasElement,
): void {
  ctx.clearRect(0, 0, cnv.width, cnv.height);
  Primitives.drawCheckerBoard(
    ctx, [cnv.width, cnv.height], COLOR.lightGray, COLOR.white
  );
}

const g = 2;
const dt = 1;
interface PolygonState {
  position: [number, number];
  radius: number;
  dy_dt: number; // vertical velocity
  dx_dt: number, // horizontal velocity
  decay: number; // impact loss
  frameCount: number;
  sides: number;
  morph: number; // time evolution of gon sides
  fillColor: string;
  borderColor: string;
};

const updatePosition = (s: PolygonState): PolygonState => ({
  ...s, position: [s.position[0] + s.dx_dt, s.position[1] + s.dy_dt * dt]
});

const gravity = (s: PolygonState): PolygonState => ({
  ...s, dy_dt: s.dy_dt + g * dt
});

const applyFloor = (s: PolygonState, cnv: HTMLCanvasElement): PolygonState =>
  (s.position[1] + s.radius > cnv.height)
    ? {
        ...s,
        position: [s.position[0], cnv.height - s.radius],
        dy_dt: (-1) * s.decay * s.dy_dt,
      }
    : s;

const applyWalls = (s: PolygonState, cnv: HTMLCanvasElement): PolygonState => ({
  ...s,
  dx_dt: s.dx_dt * ((s.position[0] + s.radius > cnv.width ||
    s.position[0] - s.radius < 0) ? (-1) : 1)
});

const updateFrames = (s: PolygonState): PolygonState => ({
  ...s, frameCount: s.frameCount + 1
});

const updateSides = (s: PolygonState): PolygonState => ({
  ...s,
  sides: s.sides + ((s.frameCount % 2 === 0) ? s.morph : 0),
});

const reverseMorph = (s: PolygonState): PolygonState =>
  (s.sides >= 10)
    ? {...s, morph: -1}
    : (s.sides <= 3)
      ? {...s, morph: 1}
      : s

const growRadius = (s: PolygonState): PolygonState => ({
  ...s, radius: s.radius + 2 * s.morph
});

const changeColor = (s: PolygonState): PolygonState => ({
  ...s,
  fillColor:   (s.frameCount % 5 === 0) ? s.borderColor : s.fillColor,
  borderColor: (s.frameCount % 5 === 0) ? s.fillColor   : s.borderColor,
});

function main(): void {
  const [ctx, cnv] = initCanvas();

  // BEGIN STATE: polygon0
  const polygon0 = State.returnStateAggregator<PolygonState>({
    position: [cnv.width/2, cnv.height/2],
    radius: 40, dy_dt: 0, dx_dt: 5,
    decay: 1, frameCount: 1, sides: 3, morph: 1,
    fillColor: COLOR.red, borderColor: COLOR.blue,
  }, (s) => {
    Primitives.drawNGon(ctx, s.position, s.radius, s.sides, 4, s.fillColor, s.borderColor);
  })
  .attach(s => updateFrames(s))
  .attach(s => gravity(s))
  .attach(s => updatePosition(s))
  .attach(s => applyFloor(s, cnv))
  .attach(s => applyWalls(s, cnv))
  .attach(s => reverseMorph(s))
  .attach(s => updateSides(s))
  .attach(s => changeColor(s));
  // END STATE: polygon0


  // BEGIN STATE: polygon1
  const polygon1 = State.returnStateAggregator<PolygonState>({
    position: [cnv.width/4, cnv.height/4],
    radius: 20, dy_dt: 0, dx_dt: -2,
    decay: 1, frameCount: 1, sides: 3, morph: 1,
    fillColor: COLOR.blue, borderColor: COLOR.red,
  }, (s) => {
    Primitives.drawNGon(
      ctx, s.position, s.radius, s.sides, 4, s.fillColor, s.borderColor
    );
  })
  .attach(s => updateFrames(s))
  .attach(s => gravity(s))
  .attach(s => updatePosition(s))
  .attach(s => applyFloor(s, cnv))
  .attach(s => applyWalls(s, cnv))
  .attach(s => reverseMorph(s))
  .attach(s => updateSides(s))
  .attach(s => changeColor(s));
  // END STATE: polygon1

  Loop.animateAtTargetFPS(
    60, ctx, cnv,
    () => {
      clearCanvas(ctx, cnv);
      polygon0.run();
      polygon1.run();
    }
  );
}

window.onload = main;
