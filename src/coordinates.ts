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

function translate_column_height
(v: Vector, height: number, dir: Dir): Vector | never {
  switch(dir) {
    case Dir.up: return ADD(v, SCALE(-height, UNIT_STD_Y));
    case Dir.down: return ADD(v, SCALE(height, UNIT_STD_Y));
    default: throw new Error("translate_column_height(): unreachable");
  }
}

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
    pos: Vector, basis: LA.Basis,
    color: string, size: number,
  ): void {

    // Provide ctx immediately
    const moveTo = (v: Vector) => move_to(v, ctx);
    const lineTo = (v: Vector) => line_to(v, ctx);


    let posInBasis = CHANGE_BASIS(basis, pos);
    if (basis !== Basis.Standard) {
      posInBasis = SCALE(size, posInBasis);
    }

    if (within_cnv_bounds(ctx, posInBasis, size)) {
      ctx.fillStyle = color;
      ctx.beginPath();
      moveTo(posInBasis);
      posInBasis = iso_square_step(posInBasis, size, Dir.right);
      lineTo(posInBasis);
      posInBasis = iso_square_step(posInBasis, size, Dir.down);
      lineTo(posInBasis);
      posInBasis = iso_square_step(posInBasis, size, Dir.left);
      lineTo(posInBasis);
      posInBasis = iso_square_step(posInBasis, size, Dir.up);
      lineTo(posInBasis);
      ctx.fill();
    }
  }

  export function drawColumn(
    ctx: CanvasRenderingContext2D,
    pos: Vector, height: number,
    colorTop: string, colorLeft: string,
    colorRight: string, size: number,
    basis: LA.Basis,
  ): void {

    // Provide ctx immediately
    const moveTo = (v: Vector) => move_to(v, ctx);
    const lineTo = (v: Vector) => line_to(v, ctx);

    let initIsoPos = CHANGE_BASIS(basis, pos);
    if (basis !== Basis.Standard) {
      initIsoPos = SCALE(size, initIsoPos);
    }

      // DRAW LEFT
      ctx.fillStyle = colorLeft;
      ctx.beginPath();
      moveTo(initIsoPos);
      initIsoPos = translate_column_height(initIsoPos, height, Dir.up);
      lineTo(initIsoPos);
      initIsoPos = iso_square_step(initIsoPos, size, Dir.down);
      lineTo(initIsoPos);
      initIsoPos = translate_column_height(initIsoPos, height, Dir.down);
      lineTo(initIsoPos);
      initIsoPos = iso_square_step(initIsoPos, size, Dir.up);
      lineTo(initIsoPos);
      ctx.fill();

      // DRAW TOP
      ctx.fillStyle = colorTop;
      ctx.beginPath();
      initIsoPos = translate_column_height(initIsoPos, height, Dir.up);
      moveTo(initIsoPos);
      initIsoPos = iso_square_step(initIsoPos, size, Dir.right);
      lineTo(initIsoPos);
      initIsoPos = iso_square_step(initIsoPos, size, Dir.down);
      lineTo(initIsoPos);
      initIsoPos = iso_square_step(initIsoPos, size, Dir.left);
      lineTo(initIsoPos);
      initIsoPos = iso_square_step(initIsoPos, size, Dir.up);
      lineTo(initIsoPos);
      ctx.fill();

      // DRAW RIGHT
      ctx.fillStyle = colorRight;
      ctx.beginPath();
      initIsoPos = iso_square_step(initIsoPos, size, Dir.down);
      moveTo(initIsoPos);
      initIsoPos = translate_column_height(initIsoPos, height, Dir.down);
      lineTo(initIsoPos);
      initIsoPos = iso_square_step(initIsoPos, size, Dir.right);
      lineTo(initIsoPos);
      initIsoPos = translate_column_height(initIsoPos, height, Dir.up);
      lineTo(initIsoPos);
      initIsoPos = iso_square_step(initIsoPos, size, Dir.left);
      lineTo(initIsoPos);
      ctx.fill();
  }

  export function drawInZ(
    ctx: CanvasRenderingContext2D, z: number, size: number,
    width: number, height: number,
    colorTop1: string, colorTop2: string,
    colorLeft: string, colorRight: string,
    basis: LA.Basis,
  ): void {
    const [x_lwr_bound, x_upr_bound, y_upr_bound] = computeExtrema(
      width, height, size
    );

    for (let x = Math.ceil(x_upr_bound); x >= x_lwr_bound - 1; x--) {
      for (let y = 0; y <= y_upr_bound; y++) {
        drawColumn(
          ctx, {x,y}, z**2 / ((x)**2 + (y-20)**2 + 1),
          ((x + y) % 2)
            ? colorTop1
            : colorTop2,
          colorLeft, colorRight, size, basis,
        );
      }
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
        drawSquare(
          ctx, {x,y}, Basis.Isometric, ((x+y) % 2) ? color1 : color2, size
        );
      }
    }
  }

  export const clampSquare = (v: Vector, size: number): Vector => {
    const isoBasisTransform: LA.Matrix2x2 = LA.matrixFromBasis(
      Basis.Isometric
    );
    const invert = LA.applyMatrix (LA.adjugateInverse(isoBasisTransform));
    const w = invert (v); // transforming to iso basis representation

    // transforming back, note sign of x must be handled as x has
    // a range which is positive or negative
    return LA.changeBasis(Basis.Isometric, {
      x: (w.x + (w.x < 0 ?  -size : 0)) - w.x % size,
      y: (w.y) - w.y % (size),
    });
  };

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
        let posInBasis = CHANGE_BASIS(Basis.Isometric, {x: i, y: j});
        posInBasis = SCALE(size, posInBasis);

        posInBasis = ADD({
          x: center ?  width / 2 : 0,
          y: center ? height / 2 : 0,
        }, posInBasis);

        ctx.lineWidth = 0.15;
        ctx.strokeStyle = color;
        ctx.beginPath();
        moveTo(posInBasis);
        posInBasis = iso_square_step(posInBasis, size, Dir.right);
        lineTo(posInBasis);
        posInBasis = iso_square_step(posInBasis, size, Dir.down);
        lineTo(posInBasis);
        posInBasis = iso_square_step(posInBasis, size, Dir.left);
        lineTo(posInBasis);
        posInBasis = iso_square_step(posInBasis, size, Dir.up);
        lineTo(posInBasis);
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
