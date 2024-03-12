import { Primitives } from "./primitives.js";
import { Loop }       from "./animate.js";
import { State }      from "./state.js";
import { Color }      from "./color.js";
import { Polygon }    from "./examples.js";

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
    ctx, [cnv.width, cnv.height], Color.lightGray, Color.white
  );
}

function main(): void {
  const [ctx, cnv] = initCanvas();

  const polygon0 = State.returnStateAggregator<Polygon.State>({
    position: [cnv.width/2, cnv.height/2],
    radius: 40, dy_dt: 0, dx_dt: 5,
    decay: 1, frameCount: 1, sides: 3, morph: 1,
    fillColor: Color.red, borderColor: Color.blue,
  }, (s) => {
    Primitives.drawNGon(ctx, s.position, s.radius, s.sides, 4, s.fillColor, s.borderColor);
  })
  .attach(s => Polygon.updateFrames(s))
  .attach(s => Polygon.gravity(s))
  .attach(s => Polygon.updatePosition(s))
  .attach(s => Polygon.applyFloor(s, cnv))
  .attach(s => Polygon.applyWalls(s, cnv))
  .attach(s => Polygon.reverseMorph(s))
  .attach(s => Polygon.updateSides(s))
  .attach(s => Polygon.changeColor(s));

  const polygon1 = State.returnStateAggregator<Polygon.State>({
    position: [cnv.width/2, cnv.height/4],
    radius: 20, dy_dt: -1, dx_dt: -2,
    decay: 1, frameCount: 1, sides: 5, morph: 1,
    fillColor: Color.red, borderColor: Color.blue,
  }, (s) => {
    Primitives.drawNGon(ctx, s.position, s.radius, s.sides, 4, s.fillColor, s.borderColor);
  })
  .attach(s => Polygon.updateFrames(s))
  .attach(s => Polygon.gravity(s))
  .attach(s => Polygon.updatePosition(s))
  .attach(s => Polygon.applyFloor(s, cnv))
  .attach(s => Polygon.applyWalls(s, cnv))
  .attach(s => Polygon.reverseMorph(s))
  .attach(s => Polygon.updateSides(s))
  .attach(s => Polygon.changeColor(s));

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
