import { LinearAlgebra as LA } from "./la.js";

const enum Dir { up, down, left, right};
const [UNIT_STD_X, UNIT_STD_Y] = LA.Unit[LA.Basis.Standard];
const [UNIT_ISO_X, UNIT_ISO_Y] = LA.Unit[LA.Basis.Isometric];
const [UNIT_45_X, UNIT_45_Y]   = LA.Unit[LA.Basis.FortyFive];
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
// this will allow us to remove size padding.
const within_cnv_bounds =
(ctx: CanvasRenderingContext2D, v: Vector, size: number): boolean =>
  (v.x >= -2*size && v.x <= ctx.canvas.width) &&
  (v.y >= 0 && v.y <= ctx.canvas.height)

export namespace Iso {
  export function drawSquare(
    ctx: CanvasRenderingContext2D,
    stdPos: Vector,
    color: string, size: number,
  ): void {

    // Provide ctx immediately
    const moveTo = (v: Vector) => move_to(v, ctx);
    const lineTo = (v: Vector) => line_to(v, ctx);


    let isoPos = CHANGE_BASIS(Basis.Isometric, stdPos);
    isoPos = SCALE(size, isoPos);

    if (within_cnv_bounds(ctx, isoPos, size)) {
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

  function computeExtrema
  (width: number, height: number, size: number): [number, number, number] | never
  {
    const isoBasisTransform: LA.Matrix2x2 = LA.matrixFromBasis(
      Basis.Isometric
    );

    // Partial application, isn't that nice?
    const invert = LA.applyMatrix (LA.adjugateInverse(isoBasisTransform));

    const corner1: Vector = invert ({x: width/size, y: 0})
    const corner2: Vector = invert ({x: 0, y: height/size})
    const corner3: Vector = invert ({x: width/size, y: height/size})

    return [corner2.x, corner1.x, corner3.y];
  }

  export function drawBoard (
    ctx: CanvasRenderingContext2D,
    size: number, width: number, height: number,
    color1: string, color2: string,
  ): void {

    const [x_lwr_bound, x_upr_bound, y_upr_bound] = computeExtrema(
      width, height, size
    );

    for (let x = x_lwr_bound; x < x_upr_bound; x++) {
      for (let y = 0; y < y_upr_bound; y++) {
        drawSquare(ctx, {x,y}, ((x+y) % 2) ? color1 : color2, size);
      }
    }
  }

  export function drawGrid(
    ctx: CanvasRenderingContext2D,
    size: number, width: number, height: number,
    color: string, center?: boolean
  ) : void
  {

    const moveTo = (v: Vector) => move_to(v, ctx);
    const lineTo = (v: Vector) => line_to(v, ctx);

    const [x_lwr_bound, x_upr_bound, y_upr_bound] = computeExtrema(
      width, height, size
    );

    for (let i = x_lwr_bound; i < x_upr_bound; i++) {
      for (let j = 0; j < y_upr_bound; j++) {
        let isoPos = CHANGE_BASIS(Basis.Isometric, {x: i, y: j});
        isoPos = SCALE(size, isoPos);

        isoPos = ADD({
          x: center ?  width / 2 : 0,
          y: center ? height / 2 : 0,
        }, isoPos);

        ctx.lineWidth = 0.15;
        ctx.strokeStyle = color;
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
        ctx.stroke();
      }
    }
  }
}

export namespace Std {
  export function drawGrid(
    ctx: CanvasRenderingContext2D,
    size: number, width: number, height: number,
    center?: boolean
  ) : void
  {
    for (let i = 0; i < width; i += size) {
      for (let j = 0; j < height; j += size) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = "green";
        ctx.strokeRect(
          i + (center ?  width / 2 : 0),
          j + (center ? height / 2 : 0),
          size, size);
      }
    }
  }
}

export namespace FF {
  export function draw45Grid(
    ctx: CanvasRenderingContext2D,
    size: number,
  ) : void
  {
    console.warn("draw45Grid(): EXPERIMENTAL FUNCTION");
    function ff_square_step
    (v: Vector, squareSize: number, dir: Dir): Vector | never {
      switch (dir) {
        case Dir.up:    return ADD(v, SCALE(-squareSize, UNIT_45_Y));
        case Dir.down:  return ADD(v, SCALE(squareSize, UNIT_45_Y));
        case Dir.left:  return ADD(v, SCALE(-squareSize, UNIT_45_X));
        case Dir.right: return ADD(v, SCALE(squareSize, UNIT_45_X));
        default: throw new Error("ff_square_step(): unreachable");
      };
    };

    const offsetX = ctx.canvas.width / 4;
    const offsetY = ctx.canvas.height / 4;

    const moveTo = (v: Vector) => move_to(v, ctx);
    const lineTo = (v: Vector) => line_to(v, ctx);

    for (let i = 0; i < ctx.canvas.width / (2*size); i++) {
      for (let j = 0; j < ctx.canvas.height / (2*size); j++) {

      let ffPos = CHANGE_BASIS(Basis.FortyFive, {x: i, y: j});
      ffPos = SCALE(size, ffPos);

      const offsetX = ctx.canvas.width / 4;
      const offsetY = ctx.canvas.height / 4;
      ffPos = ADD({x: offsetX, y: offsetY}, ffPos);

        ctx.strokeStyle = "yellow";
        ctx.beginPath();
        moveTo(ffPos);
        ffPos = ff_square_step(ffPos, size, Dir.right);
        lineTo(ffPos);
        ffPos = ff_square_step(ffPos, size, Dir.down);
        lineTo(ffPos);
        ffPos = ff_square_step(ffPos, size, Dir.left);
        lineTo(ffPos);
        ffPos = ff_square_step(ffPos, size, Dir.up);
        lineTo(ffPos);
        ctx.stroke();
      }
    }
  }
}
