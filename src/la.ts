export namespace LinearAlgebra {
  // CONSTANTS: save on Math calls
  export const SQRT_3 = 1.7320508075688772;
  export const ISO_INTERIOR_ANGLE = 2.0943951023931953 // 120 degrees (phi)
  export const ISO_EXTERIOR_ANGLE = 0.5235987755982989 // 30 degrees (theta)
                                                       // (pi - phi) / 2
  export const ISO_TAN_EXTERIOR   = 1.732050807568877; // 1 / tan (theta)
  // END CONSTANTS
  export enum  Basis    { Standard, Isometric, FortyFive};
  export type  Vector = { x: number; y: number; }

  export const Unit: {[b in Basis]: [Vector, Vector]} = {
    [Basis.Standard]: [
      {x: 1, y: 0},
      {x: 0, y: 1}
    ],
    // [Basis.Isometric]: [
    //   {x:  (0.5) * SQRT_3, y: -(0.5) * SQRT_3},
    //   {x:  0.5,            y: 0.5}
    // ],
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

  // "Bear in mind that changeBasis() currently only "
  // "makes sense for transformations between orthonormal bases. "
  // "This is because we are computing the transpose of the "
  // "transformation. Which for orthonormal bases, is the inverse "
  // "P^T = P^-1, where v_new = P^-1 * v_old."
  /* Transformation matrix:     Transformation transpose:
      Unit[b][0].x Unit[b][0].y  Unit[b][0].x Unit[b][0].y
      Unit[b][1].x Unit[b][1].y  Unit[b][1].x Unit[b][1].y */
  export function changeBasis(b: Basis, v: Vector): Vector {
    return {
      x: v.x * Unit[b][0].x + v.y * Unit[b][1].x,
      y: v.x * Unit[b][0].y + v.y * Unit[b][1].y
    };
  }

    // [Basis.Isometric]: [
    //   {x:  1, y: -0.5},
    //   {x:  1, y:  0.5}
    // ],
  export function invertBasis(b: Basis, v: Vector): Vector {
    return {
      x: v.x * 0.5 - v.y,
      y: v.x * 0.5 + v.y
    };
  }

}
