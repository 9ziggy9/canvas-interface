// save on Math calls
const SQRT_3 = 1.7320508075688772;

export namespace LinearAlgebra {
  export enum  Basis    { Standard, Isometric };
  export type  Vector = { x: number; y: number; }
  export const Unit: {[b in Basis]: [Vector, Vector]} = {
    [Basis.Standard]: [
      {x: 1, y: 0},
      {x: 0, y: 1}
    ],
    [Basis.Isometric]: [
      {x:  (0.5) * SQRT_3, y: 0.5},
      {x: -(0.5) * SQRT_3, y: 0.5}
    ],
  };

  // NOTE: floating point values can lose precision, i.e.
  // examine the norm of Basis.Isometric vectors.
  export const scale = (a: number, v: Vector): Vector =>
    ({ x: a*v.x, y: a*v.y });

  export const dot = (v1: Vector, v2: Vector): number =>
    v1.x * v2.x + v1.y * v2.y;

  export function changeBasis(b: Basis, v: Vector): Vector {
    console.warn(
      "Bear in mind that changeBasis() currently only " +
      "makes sense for transformations between orthonormal bases. " +
      "This is because we are computing the transpose of the " +
      "transformation. Which for orthonormal bases, is the inverse " +
      "P^T = P^-1, where v_new = P^-1 * v_old."
    );
    /* Transformation matrix:     Transformation transpose:
       Unit[b][0].x Unit[b][1].x  Unit[b][0].x Unit[b][0].y
       Unit[b][0].y Unit[b][1].y  Unit[b][1].x Unit[b][1].y */
    return {
      x: v.x * Unit[b][0].x + v.y * Unit[b][1].x,
      y: v.x * Unit[b][0].y + v.y * Unit[b][1].y
    };
  }
}
