// import {Polygon, Circle, Forces, Kinematic, Bounded, Field} from "./examples-old.js";
import { Primitives } from "./primitives.js";
import { Loop }       from "./animate.js";
import { State }      from "./state.js";
import { Color }      from "./color.js";
import { Iso, Std }        from "./coordinates.js";
import { LinearAlgebra as LA } from "./la.js";


// note that choosing a cnv.width and cnv.height which is a power of
// integer would allow us to choose any square size which is a power of
// said integer (and smaller than the short side, obviously)

function initCanvas(id: string, w: number, h: number)
: [CanvasRenderingContext2D, HTMLCanvasElement] | never
{
  const cnv = document.getElementById(id) as HTMLCanvasElement
  if (!cnv) {
    throw new Error("Could not bind to canvas element. Not found?"); 
  }
  cnv.width = w;
  cnv.height = h;
  const ctx = cnv.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create 2D context.") 
  }
  return [ctx, cnv];
}

// tail recursive
const gcd = (x: number, y: number): number => {
  const aux = (d: number): number => (x % d === 0) && (y % d === 0)
    ? d
    : d <= 2
      ? 1
      : aux (d - 1);
  return aux(x >= y ? y : x);
}


function clearCanvas
(ctx: CanvasRenderingContext2D, cnv: HTMLCanvasElement, size: number): void
{
  ctx.clearRect(0, 0, cnv.width, cnv.height);
  // Iso.drawBoard(ctx, size, Color.lightGray, Color.white);
}

function main(): void {
  const [ctx, cnv] = initCanvas("main-canvas", 620, 480);
  const squareSize = gcd(cnv.width/2, cnv.height/2);

  Iso.computeExtremum(cnv.width/2, cnv.height/2, squareSize);

  Loop.animateAtTargetFPS(60, ctx, cnv, () => {
    clearCanvas(ctx, cnv, squareSize);
    Std.drawGrid(ctx, squareSize, cnv.width/2, cnv.height/2);
    Std.drawIsoGrid(ctx, squareSize);
    Iso.drawSquare(ctx, {x: 10,  y: 0}, "red",  squareSize);
    // Iso.drawSquare(ctx, {x: 42,  y: 6}, "blue", isoSquareSize);
  });
}

window.onload = main;

// Further examples
// function main_mesh_ex(): void {
//   const [ctx, cnv] = initCanvas("main-canvas");

//   const mesh =
//     [
//       [0,0],  [0,1],  [0,2],  [0,3],  [0,4],  [0,5],  [0,6],  [0,7],  [0,8],
//       [1,0],  [1,1],  [1,2],  [1,3],  [1,4],  [1,5],  [1,6],  [1,7],  [1,8],
//       [2,0],  [2,1],  [2,2],  [2,3],  [2,4],  [2,5],  [2,6],  [2,7],  [2,8],
//       [3,0],  [3,1],  [3,2],  [3,3],  [3,4],  [3,5],  [3,6],  [3,7],  [3,8],
//       [4,0],  [4,1],  [4,2],  [4,3],  [4,4],  [4,5],  [4,6],  [4,7],  [4,8],
//       [5,0],  [5,1],  [5,2],  [5,3],  [5,4],  [5,5],  [5,6],  [5,7],  [5,8],
//       [6,0],  [6,1],  [6,2],  [6,3],  [6,4],  [6,5],  [6,6],  [6,7],  [6,8],
//       [7,0],  [7,1],  [7,2],  [7,3],  [7,4],  [7,5],  [7,6],  [7,7],  [7,8],
//       [8,0],  [8,1],  [8,2],  [8,3],  [8,4],  [8,5],  [8,6],  [8,7],  [8,8],
//       [9,0],  [9,1],  [9,2],  [9,3],  [9,4],  [9,5],  [9,6],  [9,7],  [9,8],
//       [10,0], [10,1], [10,2], [10,3], [10,4], [10,5], [10,6], [10,7], [10,8],
//       [11,0], [11,1], [11,2], [11,3], [11,4], [11,5], [11,6], [11,7], [11,8],
//     ].reduce<State.Ensemble<Circle.State>>((m, [x, y]) => ({
//       ...m,
//       [`c${x}${y}`]: {
//         ...Circle.defaults,
//         position: [
//           (x+1) * (cnv.width / 13),
//           (y+1) * (cnv.height / 10),
//         ],
//         radius: 4, fillColor: Color.red, borderColor: Color.blue,
//         borderWidth: 1,
//         dx_dt: 2,
//       }
//     }), {});
//   const meshStates = State.unit(mesh, (circles) => {
//     Circle.pairs(circles).forEach(([cName0, cName1]) => {
//       Primitives.drawConnection(
//         ctx,
//         [circles[cName0], circles[cName1]],
//         Color.blue,
//       );
//     });
//     for (const c of Object.values(circles)) {
//       const [x,y] = c.position;
//       Primitives.drawCircle(
//         ctx, [x,y], c.radius, c.fillColor, c.borderColor, c.borderWidth,
//       );
//     };
//   });

//   Loop.animateAtTargetFPS(
//     60, ctx, cnv,
//     () => {
//       clearCanvas(ctx, cnv);
//       meshStates.run();
//     }
//   );
// }

// function main_spring_ex(): void {
//   const [ctx, cnv] = initCanvas("main-canvas");

//   const c0: Circle.State = {
//     ...Circle.defaults, position: [cnv.width/2, 121], radius: 10,
//     fillColor: Color.red, borderColor: Color.blue, borderWidth: 4
//   };
//   const c1: Circle.State = {
//     ...Circle.defaults, position: [cnv.width/2, 171], radius: 10,
//     fillColor: Color.blue, borderColor: Color.red, borderWidth: 4,
//   };

//   const springPair = State.unit(({c0, c1}), (s) => {
//     Primitives.drawSpringPair(ctx, [s.c0, s.c1])
//   });

//   springPair
//     .attach(({c0, c1}) => ({
//       c0: Kinematic.updateFrames(c0),
//       c1: Kinematic.updateFrames(c1)
//     }))
//     .attach(({c0, c1}) => ({
//       c0: Kinematic.updatePosition(c0),
//       c1: Kinematic.updatePosition(c1),
//     }))
//     .attach(({c1, ...s}) => ({
//       ...s,
//       c1: Forces.verticalGravity(c1, 2)
//     }))
//     .attach((s) => Forces.hookeSpring(s, 0.02, (50/4 + s.c1.radius)))
//     .attach((s) => {
//       if (s.c0.frameCount === 120) console.log(s);
//       return s;
//     })

//   Loop.animateAtTargetFPS(
//     60, ctx, cnv,
//     () => {
//       clearCanvas(ctx, cnv);
//       springPair.run();
//     }
//   );
// }

// function main_dumbells_ex(): void {
//   const [ctx, cnv] = initCanvas("main-canvas");

//   const dumbells = makeDumbells(ctx, cnv);

//   Loop.animateAtTargetFPS(
//     60, ctx, cnv,
//     () => {
//       clearCanvas(ctx, cnv);
//       dumbells.forEach(d => d.run());
//     }
//   );
// }

// function main_polygon_ex(): void {
//   const [ctx, cnv] = initCanvas("main-canvas");

//   const polygon0 = State.unit<Polygon.State>({
//     ...Polygon.defaults,
//     position:    [cnv.width/2, cnv.height/2],
//     fillColor:   Color.red,
//     borderColor: Color.blue,
//     dx_dt: 3,
//   }, (s) => {
//     Primitives.drawNGon(
//       ctx, s.position, s.radius, s.sides, 4, s.fillColor, s.borderColor
//     );
//   })
//   .attach(s => Kinematic.updateFrames(s))
//   .attach(s => Forces.verticalGravity(s, 2))
//   .attach(s => Kinematic.updatePosition(s))
//   .attach(s => Bounded.applyFloor(s, cnv))
//   .attach(s => Bounded.applyWalls(s, cnv))
//   .attach(s => Polygon.reverseMorph(s))
//   .attach(s => Polygon.updateSides(s));

//   Loop.animateAtTargetFPS(
//     60, ctx, cnv,
//     () => {
//       clearCanvas(ctx, cnv);
//       polygon0.run();
//     }
//   );
// }

// const randomVelocity = (): number => (1 - 2 * Number((Math.random() > 0.5)))
//   * Math.floor(Math.random() * 20)

// function makeDumbells(ctx: CanvasRenderingContext2D, cnv: HTMLCanvasElement) {
//   const xs: number[] = (new Array(100))
//                          .fill(10)
//                          .reduce((acc, _, n) => [...acc, n + 10], [])
//   return xs
//     .map(p => State.unit({
//       c0: {
//         ...Circle.defaults,
//         position:    [p, p+10],
//         fillColor:   Color.blue,
//         borderColor: Color.red,
//         radius: 10,
//         dx_dt: randomVelocity(),
//         dy_dt: randomVelocity(),
//         yDissipation: Math.random(), xDissipation: Math.random(),
//       },
//       c1: {
//         ...Circle.defaults,
//         position:    [p+10, p+20],
//         radius: 10,
//         fillColor:   Color.red,
//         borderColor: Color.blue,
//         dx_dt: randomVelocity(),
//         dy_dt: randomVelocity(),
//         yDissipation: Math.random(), xDissipation: Math.random(),
//       }
//     }, ({c0,c1}) => {
//       ctx.beginPath();
//       ctx.moveTo(c0.position[0], c0.position[1]);
//       ctx.lineTo(c1.position[0], c1.position[1]);
//       ctx.strokeStyle = Color.darkGray;
//       ctx.stroke();
//       Primitives.drawCircle(
//         ctx, [c0.position[0], c0.position[1]], c0.radius,
//         c0.fillColor, c0.borderColor, c0.borderWidth,
//       );
//       Primitives.drawCircle(
//         ctx, [c1.position[0], c1.position[1]], c1.radius,
//         c1.fillColor, c1.borderColor, c1.borderWidth,
//       );
//     })
//       .attach(({c0, c1}) => ({
//         c0: Kinematic.updateFrames(c0),
//         c1: Kinematic.updateFrames(c1),
//       }))
//       .attach(({c0, c1}) => ({
//         c0: Forces.verticalGravity(c0, 3),
//         c1: Forces.verticalGravity(c1, 3),
//       }))
//       .attach(({c0, c1}) => ({
//         c0: Kinematic.updatePosition(c0),
//         c1: Kinematic.updatePosition(c1),
//       }))
//       .attach(({c0, c1}) => {
//         const [nc0, nc1] = Forces.fixedDistanceConstraint(c0, c1, 100);
//         return {
//           c0: nc0,
//           c1: nc1,
//         }
//       })
//       .attach(({c0, c1}) => ({
//         c0: Bounded.applyFloor(c0, cnv),
//         c1: Bounded.applyFloor(c1, cnv),
//       }))
//       .attach(({c0, c1}) => ({
//         c0: Bounded.applyWalls(c0, cnv),
//         c1: Bounded.applyWalls(c1, cnv),
//       })));
// }
