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
  (v.x >= 0 && v.x <= ctx.canvas.width + size) &&
  (v.y > -size && v.y <= ctx.canvas.height)

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

    const offsetX = ctx.canvas.width / 4;
    const offsetY = ctx.canvas.height / 4;
    isoPos = ADD({x: offsetX, y: offsetY}, isoPos);

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

  export function computeExtremum(width: number, height: number, size: number): void {
    const corner1: Vector = LA.invertBasis(
      Basis.Isometric, {x: width/size, y: 0}
    );
    const corner2: Vector = LA.invertBasis(
      Basis.Isometric, {x: 0, y: height/size}
    );
    const corner3: Vector = LA.invertBasis(
      Basis.Isometric, {x: width/size, y: height/size}
    );
    console.log(corner1, corner2, corner3);
  }

  export function drawBoard (
    ctx: CanvasRenderingContext2D,
    size: number,
    color1: string, color2: string,
  ): void {
    // By symmetry, we know that the maximal standard X vector is mapped
    // to a value at the same angle as a bounding Y: this sets the bounds
    // of the y loop.
    const y_upper_bound = Math.ceil(ctx.canvas.width / size);
    const y_lower_bound = -y_upper_bound;

    // To get the x bounds is more difficult. I claim that to find this bound
    // we need find the intersection point on the X axis of the line with 
    // angle theta (ISO_EXTERIOR_ANGLE) relative to the bottom side.
    // By similarity of triangles, it can be shown that this point resides
    // at X = Y_max/tan(ISO_TAN_EXTERIOR) + X_max.
    // I call the reciprocal tangent here, ISO_TAN_ANGLE.

    // what vector gets mapped to (ctx.canvas.width/2, ctx.canvas.height/2)?

    const x_lower_bound = 0;
    const x_upper_bound = Math.ceil(
      (ctx.canvas.height * LA.ISO_TAN_EXTERIOR + ctx.canvas.width) / size
    );

    for (let x = x_lower_bound; x < 39; x++) {
      for (let y = -14; y < 14; y++) {
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

    const offsetX = ctx.canvas.width / 4;
    const offsetY = ctx.canvas.height / 4;

    for (let i = 0; i < width; i += size) {
      for (let j = 0; j < height; j += size) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = "green";
        ctx.strokeRect(i+offsetX, j+offsetY, size, size);
      }
    }
  }

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

  export function draw45Grid(
    ctx: CanvasRenderingContext2D,
    size: number,
  ) : void
  {
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

  export function drawIsoGrid(
    ctx: CanvasRenderingContext2D,
    size: number,
  ) : void
  {
    const offsetX = ctx.canvas.width / 4;
    const offsetY = ctx.canvas.height / 4;

    const moveTo = (v: Vector) => move_to(v, ctx);
    const lineTo = (v: Vector) => line_to(v, ctx);

    for (let i = -24; i < 15.5; i++) {
      for (let j = 0; j < 39.5; j++) {

      let isoPos = CHANGE_BASIS(Basis.Isometric, {x: i, y: j});
      isoPos = SCALE(size, isoPos);

      const offsetX = ctx.canvas.width / 4;
      const offsetY = ctx.canvas.height / 4;
      isoPos = ADD({x: offsetX, y: offsetY}, isoPos);

        ctx.strokeStyle = "black";
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
