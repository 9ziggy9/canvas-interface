import { Primitives } from "./primitives.js";
import { Loop }       from "./animate.js";
import { State }      from "./state.js";
import { Color }      from "./color.js";
import {
  Polygon,
  Circle,
  Forces,
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

window.onload = main_polygon_ex;


// Further examples
function main_spring_ex(): void {
  const [ctx, cnv] = initCanvas("main-canvas");

  const c0: Circle.State = {
    ...Circle.defaults, position: [cnv.width/2, 121], radius: 10,
    fillColor: Color.red, borderColor: Color.blue, borderWidth: 4
  };
  const c1: Circle.State = {
    ...Circle.defaults, position: [cnv.width/2, 171], radius: 10,
    fillColor: Color.blue, borderColor: Color.red, borderWidth: 4,
  };

  const springPair = State.unit(({c0, c1}), (s) => {
    Primitives.drawSpringPair(ctx, [s.c0, s.c1])
  });

  springPair
    .attach(({c0, c1}) => ({
      c0: Kinematic.updateFrames(c0),
      c1: Kinematic.updateFrames(c1)
    }))
    .attach(({c0, c1}) => ({
      c0: Kinematic.updatePosition(c0),
      c1: Kinematic.updatePosition(c1),
    }))
    .attach(({c1, ...s}) => ({
      ...s,
      c1: Forces.verticalGravity(c1, 2)
    }))
    .attach((s) => Forces.hookeSpring(s, 0.02, (50/4 + s.c1.radius)))
    .attach((s) => {
      if (s.c0.frameCount === 120) console.log(s);
      return s;
    })

  Loop.animateAtTargetFPS(
    60, ctx, cnv,
    () => {
      clearCanvas(ctx, cnv);
      springPair.run();
    }
  );
}

function main_dumbells_ex(): void {
  const [ctx, cnv] = initCanvas("main-canvas");

  const dumbells = makeDumbells(ctx, cnv);

  Loop.animateAtTargetFPS(
    60, ctx, cnv,
    () => {
      clearCanvas(ctx, cnv);
      dumbells.forEach(d => d.run());
    }
  );
}

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
  .attach(s => Forces.verticalGravity(s, 2))
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

const randomVelocity = (): number => (1 - 2 * Number((Math.random() > 0.5)))
  * Math.floor(Math.random() * 20)

function makeDumbells(ctx: CanvasRenderingContext2D, cnv: HTMLCanvasElement) {
  const xs: number[] = (new Array(100))
                         .fill(10)
                         .reduce((acc, _, n) => [...acc, n + 10], [])
  return xs
    .map(p => State.unit({
      c0: {
        ...Circle.defaults,
        position:    [p, p+10],
        fillColor:   Color.blue,
        borderColor: Color.red,
        radius: 10,
        dx_dt: randomVelocity(),
        dy_dt: randomVelocity(),
        yDissipation: Math.random(), xDissipation: Math.random(),
      },
      c1: {
        ...Circle.defaults,
        position:    [p+10, p+20],
        radius: 10,
        fillColor:   Color.red,
        borderColor: Color.blue,
        dx_dt: randomVelocity(),
        dy_dt: randomVelocity(),
        yDissipation: Math.random(), xDissipation: Math.random(),
      }
    }, ({c0,c1}) => {
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
      .attach(({c0, c1}) => ({
        c0: Kinematic.updateFrames(c0),
        c1: Kinematic.updateFrames(c1),
      }))
      .attach(({c0, c1}) => ({
        c0: Forces.verticalGravity(c0, 3),
        c1: Forces.verticalGravity(c1, 3),
      }))
      .attach(({c0, c1}) => ({
        c0: Kinematic.updatePosition(c0),
        c1: Kinematic.updatePosition(c1),
      }))
      .attach(({c0, c1}) => {
        const [nc0, nc1] = Forces.fixedDistanceConstraint(c0, c1, 100);
        return {
          c0: nc0,
          c1: nc1,
        }
      })
      .attach(({c0, c1}) => ({
        c0: Bounded.applyFloor(c0, cnv),
        c1: Bounded.applyFloor(c1, cnv),
      }))
      .attach(({c0, c1}) => ({
        c0: Bounded.applyWalls(c0, cnv),
        c1: Bounded.applyWalls(c1, cnv),
      })));
}
