import { LinearAlgebra as LA } from "./la.js";

const enum Dir { up, down, left, right};
const [UNIT_STD_X, UNIT_STD_Y] = LA.Unit[LA.Basis.Standard];
const [UNIT_ISO_X, UNIT_ISO_Y] = LA.Unit[LA.Basis.Isometric];
const ADD   = LA.add;
const SCALE = LA.scale;
const CHANGE_BASIS = LA.changeBasis;
const DET = LA.determinant;
const Basis = LA.Basis;
type Vector = LA.Vector;

function iso_square_step
(v: Vector, squareSize: number, dir: Dir): Vector | never {
  switch (dir) {
    case Dir.up:    return ADD(v, SCALE(-squareSize, UNIT_ISO_Y));
    case Dir.down:  return ADD(v, SCALE(squareSize, UNIT_ISO_Y));
    case Dir.left:  return ADD(v, SCALE(-squareSize, UNIT_ISO_X));
    case Dir.right: return ADD(v, SCALE(squareSize, UNIT_ISO_X));
    default: throw new Error("iso_square_step(): unreachable");
  };
};

function move_to(v: Vector, ctx: CanvasRenderingContext2D) {
  ctx.moveTo(v.x, v.y);
}
function line_to(v: Vector, ctx: CanvasRenderingContext2D) {
  ctx.lineTo(v.x, v.y);
}

// Need to compute determinant of basis transformation to appropriately scale
// this will allow us to remove padding.
const within_cnv_bounds = (ctx: CanvasRenderingContext2D, v: Vector): boolean =>
  !(v.x < 0 || v.x > ctx.canvas.width) || (v.y < 0 || v.y > ctx.canvas.height)

export namespace Iso {
  export function drawSquare(
    ctx: CanvasRenderingContext2D,
    stdPos: Vector,
    color: string,
    size: number = 1,
  ): void {

    // Provide ctx immediately
    const moveTo = (v: Vector) => move_to(v, ctx);
    const lineTo = (v: Vector) => line_to(v, ctx);


    let isoPos = CHANGE_BASIS(Basis.Isometric, stdPos);
    isoPos = SCALE(size, isoPos);

    if (within_cnv_bounds(ctx, isoPos)) {
      ctx.fillStyle = color;
      ctx.beginPath();
      moveTo(isoPos);
      isoPos = iso_square_step(isoPos, size, Dir.right);
      lineTo(isoPos);
      isoPos = iso_square_step(isoPos, size, Dir.down);
      lineTo(isoPos);
      isoPos = iso_square_step(isoPos, size, Dir.left);
      lineTo(isoPos);
      isoPos = iso_square_step(isoPos, size, Dir.up);
      lineTo(isoPos);
      ctx.fill();
    }
  }

  export function computeCorners(width: number, height: number, size: number): Vector[] {
    const corner1: Vector = CHANGE_BASIS(Basis.Isometric, {x: width/size, y: 0});
    const corner2: Vector = CHANGE_BASIS(Basis.Isometric, {x: 0, y: height/size});
    const corner3: Vector = CHANGE_BASIS(Basis.Isometric, {x: 0, y: 0});
    const corner4: Vector = CHANGE_BASIS(Basis.Isometric, {x: 0, y: 1});
    return [corner1, corner2, corner3, corner4];
  }

  export function drawBoard (
    ctx: CanvasRenderingContext2D,
    size: number,
    color1: string, color2: string,
  ): void {
    for (let x = 0; x < 3 * size; x++) {
      for (let y = -size; y < 2*size; y++) {
        drawSquare(ctx, {x,y}, ((x+y) % 2) ? color1 : color2, size);
      }
    }
  }
}

export namespace Std {
  export function drawGrid(
    ctx: CanvasRenderingContext2D,
    size: number,
    width: number,
    height: number,
  ) : void
  {

    for (let i = 0; i < width; i += size) {
      for (let j = 0; j < height; j += size) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = "green";
        ctx.strokeRect(i, j, size, size);
      }
    }
  }
}
