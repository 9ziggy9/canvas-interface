import { Primitives } from "./primitives.js";
import { Loop }       from "./animate.js";
import { State }      from "./state.js";
import { Color }      from "./color.js";
import {
  Polygon,
  Circle,
  Gravitational,
  Kinematic,
  Bounded,
} from "./examples.js";

function initCanvas
(id: string): [CanvasRenderingContext2D, HTMLCanvasElement] | never
{
  const cnv = document.getElementById(id) as HTMLCanvasElement
  if (!cnv) {
    throw new Error("Could not bind to canvas element. Not found?"); 
  }
  const ctx = cnv.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create 2D context.") 
  }
  return [ctx, cnv];
}

function clearCanvas
(ctx: CanvasRenderingContext2D, cnv: HTMLCanvasElement): void
{
  ctx.clearRect(0, 0, cnv.width, cnv.height);
  Primitives.drawCheckerBoard(
    ctx, [cnv.width, cnv.height], Color.lightGray, Color.white
  );
}

function main(): void {
  const [ctx, cnv] = initCanvas("main-canvas");

  const circle0 = State.unit<Circle.State>({
    ...Circle.defaults,
    position:    [cnv.width/2, cnv.height/2],
    fillColor:   Color.blue,
    borderColor: Color.red,
    dx_dt: 3,
  }, (s) => {
    Primitives.drawCircle(
      ctx, [s.position[0], s.position[1]], s.radius,
      s.fillColor, s.borderColor, s.borderWidth,
    )
  })
  .attach(s => Kinematic.updateFrames(s))
  .attach(s => Gravitational.vertical(s))
  .attach(s => Kinematic.updatePosition(s))
  .attach(s => Bounded.applyFloor(s, cnv))
  .attach(s => Bounded.applyWalls(s, cnv));

  Loop.animateAtTargetFPS(
    60, ctx, cnv,
    () => {
      clearCanvas(ctx, cnv);
      circle0.run();
    }
  );
}

window.onload = main;



// Further examples
function main_polygon_ex(): void {
  const [ctx, cnv] = initCanvas("main-canvas");

  const polygon0 = State.unit<Polygon.State>({
    ...Polygon.defaults,
    position:    [cnv.width/2, cnv.height/2],
    fillColor:   Color.red,
    borderColor: Color.blue,
    dx_dt: 3,
  }, (s) => {
    Primitives.drawNGon(
      ctx, s.position, s.radius, s.sides, 4, s.fillColor, s.borderColor
    );
  })
  .attach(s => Kinematic.updateFrames(s))
  .attach(s => Gravitational.vertical(s))
  .attach(s => Kinematic.updatePosition(s))
  .attach(s => Bounded.applyFloor(s, cnv))
  .attach(s => Bounded.applyWalls(s, cnv))
  .attach(s => Polygon.reverseMorph(s))
  .attach(s => Polygon.updateSides(s));

  Loop.animateAtTargetFPS(
    60, ctx, cnv,
    () => {
      clearCanvas(ctx, cnv);
      polygon0.run();
    }
  );
}

