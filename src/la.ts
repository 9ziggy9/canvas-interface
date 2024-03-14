export namespace LinearAlgebra {
  // CONSTANTS: save on Math calls
  export const SQRT_3 = 1.7320508075688772;
  // END CONSTANTS

  export enum  Basis    { Standard, Isometric, FortyFive};
  export type  Vector = { x: number; y: number; }

  export const Unit: {[b in Basis]: [Vector, Vector]} = {
    [Basis.Standard]: [
      {x: 1, y: 0},
      {x: 0, y: 1}
    ],
    [Basis.Isometric]: [
      {x:  1, y: -0.5},
      {x:  1, y:  0.5}
    ],
    [Basis.FortyFive]: [
      {x: Math.cos(Math.PI / 4), y: -Math.sin(Math.PI / 4)},
      {x: Math.sin(Math.PI / 4), y: Math.cos(Math.PI / 4)}
    ],
  };

  // NOTE: floating point values can lose precision, i.e.
  // examine the norm of Basis.Isometric vectors.
  export const scale = (a: number, v: Vector): Vector =>
    ({ x: a*v.x, y: a*v.y });

  export const dot = (v1: Vector, v2: Vector): number =>
    v1.x * v2.x + v1.y * v2.y;

  export const add = (v1: Vector, v2: Vector): Vector =>
    ({x: v1.x + v2.x, y: v1.y + v2.y});

  export const determinant = (b: Basis): number =>
    Unit[b][0].x * Unit[b][1].y - Unit[b][0].y * Unit[b][1].x

  export function changeBasis(b: Basis, v: Vector): Vector {
    return {
      x: v.x * Unit[b][0].x + v.y * Unit[b][1].x,
      y: v.x * Unit[b][0].y + v.y * Unit[b][1].y
    };
  }

  // This is hard coded! Because we are not guaranteed an orthogonal
  // transformation, we will need to write a general matrix inversion
  // algorithm. Gauss-Jordan elimination should be fine for 2-dimensions.
  export function invertBasis(b: Basis, v: Vector): Vector {
    return {
      x: v.x * 0.5 - v.y,
      y: v.x * 0.5 + v.y
    };
  }

}
