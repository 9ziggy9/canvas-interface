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


  export type Matrix2x2 = [  number, number,
                             number, number  ];

  export const applyMatrix = (m: Matrix2x2) => (v: Vector): Vector => 
    ({ x: m[0] * v.x + m[2] * v.y, y: m[1] * v.x + m[3] * v.y });

  export const matrixFromBasis = (b: Basis): Matrix2x2 =>
  [
    Unit[b][0].x , Unit[b][0].y , // column 1
    Unit[b][1].x , Unit[b][1].y , // column 2
  ];

  export const changeBasis = (b: Basis, v: Vector): Vector =>
    applyMatrix (matrixFromBasis(b)) (v);

  export function adjugateInverse(m: Matrix2x2): Matrix2x2 | never {
    const [a, b, c, d] = m;
  
    const det = a * d - b * c;

    if (det === 0)
      throw Error("adjugateInverse(): NOT INVERTIBLE PANICK!");

    const invDet = 1 / det;
    return [d * invDet, -b * invDet, -c * invDet, a * invDet];
  }
}
