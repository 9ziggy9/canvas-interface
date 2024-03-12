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

function makeDumbells(ctx: CanvasRenderingContext2D, cnv: HTMLCanvasElement) {
  const circle_pair1 = State.unit<Circle.State[]>([
    {
      ...Circle.defaults,
      position:    [cnv.width/2, cnv.height/2],
      fillColor:   Color.blue,
      borderColor: Color.red,
      dx_dt: 7,
      dy_dt: 2,
      yDissipation: 0.8, xDissipation: 0.3,
    },
    {
      ...Circle.defaults,
      position:    [cnv.width/2, cnv.height/4],
      fillColor:   Color.red,
      borderColor: Color.blue,
      yDissipation: 0.8, xDissipation: 0.3,
    }
  ], ([c0,c1]) => {
    ctx.beginPath();
    ctx.moveTo(c0.position[0], c0.position[1]);
    ctx.lineTo(c1.position[0], c1.position[1]);
    ctx.strokeStyle = Color.darkGray;
    ctx.stroke();
    Primitives.drawCircle(
      ctx, [c0.position[0], c0.position[1]], c0.radius,
      c0.fillColor, c0.borderColor, c0.borderWidth,
    );
    Primitives.drawCircle(
      ctx, [c1.position[0], c1.position[1]], c1.radius,
      c1.fillColor, c1.borderColor, c1.borderWidth,
    );
  })
    .attach(circles => circles.map(c => Kinematic.updateFrames(c)))
    .attach(circles => circles.map(c => Gravitational.vertical(c)))
    .attach(circles => circles.map(c => Kinematic.updatePosition(c)))
    .attach(([c0, c1]) => Circle.fixedDistanceConstraint(c0, c1, 100))
    .attach(circles => circles.map(c => Bounded.applyFloor(c, cnv)))
    .attach(circles => circles.map(c => Bounded.applyWalls(c, cnv)));

  const circle_pair2 = State.unit<Circle.State[]>([
    {
      ...Circle.defaults,
      position:    [cnv.width/3, cnv.height/3],
      fillColor:   Color.blue,
      borderColor: Color.red,
      dx_dt: -1,
      dy_dt: 3,
      yDissipation: 0.8, xDissipation: 0.3,
    },
    {
      ...Circle.defaults,
      position:    [cnv.width/3, cnv.height/3 + 20],
      fillColor:   Color.red,
      borderColor: Color.blue,
      yDissipation: 0.8, xDissipation: 0.3,
    }
  ], ([c0,c1]) => {
    ctx.beginPath();
    ctx.moveTo(c0.position[0], c0.position[1]);
    ctx.lineTo(c1.position[0], c1.position[1]);
    ctx.strokeStyle = Color.darkGray;
    ctx.stroke();
    Primitives.drawCircle(
      ctx, [c0.position[0], c0.position[1]], c0.radius,
      c0.fillColor, c0.borderColor, c0.borderWidth,
    );
    Primitives.drawCircle(
      ctx, [c1.position[0], c1.position[1]], c1.radius,
      c1.fillColor, c1.borderColor, c1.borderWidth,
    );
  })
    .attach(circles => circles.map(c => Kinematic.updateFrames(c)))
    .attach(circles => circles.map(c => Gravitational.vertical(c)))
    .attach(circles => circles.map(c => Kinematic.updatePosition(c)))
    .attach(([c0, c1]) => Circle.fixedDistanceConstraint(c0, c1, 100))
    .attach(circles => circles.map(c => Bounded.applyFloor(c, cnv)))
    .attach(circles => circles.map(c => Bounded.applyWalls(c, cnv)));

  const circle_pair3 = State.unit<Circle.State[]>([
    {
      ...Circle.defaults,
      position:    [200, 240],
      fillColor:   Color.blue,
      borderColor: Color.red,
      radius: 10,
      dx_dt: -30,
      dy_dt: 20,
      yDissipation: 0.8, xDissipation: 0.3,
    },
    {
      ...Circle.defaults,
      position:    [210, 250],
      radius: 10,
      fillColor:   Color.red,
      borderColor: Color.blue,
      yDissipation: 0.8, xDissipation: 0.3,
    }
  ], ([c0,c1]) => {
    ctx.beginPath();
    ctx.moveTo(c0.position[0], c0.position[1]);
    ctx.lineTo(c1.position[0], c1.position[1]);
    ctx.strokeStyle = Color.darkGray;
    ctx.stroke();
    Primitives.drawCircle(
      ctx, [c0.position[0], c0.position[1]], c0.radius,
      c0.fillColor, c0.borderColor, c0.borderWidth,
    );
    Primitives.drawCircle(
      ctx, [c1.position[0], c1.position[1]], c1.radius,
      c1.fillColor, c1.borderColor, c1.borderWidth,
    );
  })
    .attach(circles => circles.map(c => Kinematic.updateFrames(c)))
    .attach(circles => circles.map(c => Gravitational.vertical(c)))
    .attach(circles => circles.map(c => Kinematic.updatePosition(c)))
    .attach(([c0, c1]) => Circle.fixedDistanceConstraint(c0, c1, 100))
    .attach(circles => circles.map(c => Bounded.applyFloor(c, cnv)))
    .attach(circles => circles.map(c => Bounded.applyWalls(c, cnv)));

  return [circle_pair1, circle_pair2, circle_pair3];
}

function main(): void {
  const [ctx, cnv] = initCanvas("main-canvas");

  const [circle_pair1, circle_pair2, circle_pair3] = makeDumbells(ctx, cnv);

  Loop.animateAtTargetFPS(
    60, ctx, cnv,
    () => {
      clearCanvas(ctx, cnv);
      circle_pair1.run();
      circle_pair2.run();
      circle_pair3.run();
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

