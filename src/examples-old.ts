import { State as StateMonad } from "./state.js";
import { Color } from "./color.js";

type Base = StateMonad.State;
type Ensemble<S extends Base> = StateMonad.Ensemble<S>;

export namespace Drawable {
  export interface State extends Base {
    fillColor:   string;
    borderColor: string;
    borderWidth: number;
  }
};

export namespace Kinematic {
  export interface State extends Base {
    position: [number, number];
    dy_dt: number;
    dx_dt: number;
    frameCount: number;
    dt: number;
  };
  export const updateFrames = <S extends State> (s: S): S => ({
    ...s, frameCount: s.frameCount + 1
  });
  export const updatePosition = <S extends State> (s: S): S => ({
    ...s, position: [s.position[0] + s.dx_dt, s.position[1] + s.dy_dt * s.dt]
  });
};

export namespace Forces {
  export interface State extends Kinematic.State {};

  export const verticalGravity = <S extends State> (s: S, g: number): S => ({
    ...s, dy_dt: s.dy_dt + g * s.dt
  });

  export function fixedDistanceConstraint<S extends State>
  (c0: S, c1: S, r: number): S[]
  {
    // https://en.wikipedia.org/wiki/Verlet_integration#Constraints
    // This implementation effectively applies a string of infinite stiffness
    const [x1, y1] = c0.position;
    const [x2, y2] = c1.position;
    const dx_sqrd = (x2 - x1) * (x2 - x1);
    const dy_sqrd = (y2 - y1) * (y2 - y1);
    const d = Math.sqrt(dx_sqrd + dy_sqrd);
    const R = (d - r) / d;
    return [
      {
        ...c0,
        position: [
          x1 + ((x2 - x1) * R) / 2,
          y1 + ((y2 - y1) * R) / 2
        ]
      },
      {
        ...c1,
        position: [
          x2 - ((x2 - x1) * R) / 2,
          y2 - ((y2 - y1) * R) / 2
        ]
      }
    ]
  }

  export function hookeSpring<E extends Ensemble<State>>
  (s: E, k: number, rest: number): E
  {
    const [[p1, state1], [p2, state2]] = Object.entries(s);
    const [x1, y1] = state1.position;
    const [x2, y2] = state2.position;
    return {
      [p1]: {...state1},
      [p2]: {
        ...state2,
        dy_dt: state2.dy_dt + (-1) * ((y2 - y1) - rest) * k,
      }
    } as E;
  }
};

export namespace Field {
  export type State<T> = {
    [coord: string]: T;
  };

  export const from =
  <E extends Ensemble<Kinematic.State>> (e: E): State<[number,number]> =>
    Object.entries(e)
      .reduce((field, [_, { position: [x,y], dx_dt, dy_dt }]) => ({
        ...field,
        [`${x},${y}`]: [dx_dt, dy_dt]
      }), {});

  export function unit (
    // ctx: CanvasRenderingContext2D
    boundX: [number, number],
    boundY: [number, number],
    cols: number, // x
    rows: number, // y
    // f: (v: number => number),
  ): State<[number, number]> {
    const [bX0, bX1] = boundX;
    const [bY0, bY1] = boundY;
    const unitX = (bX1 - bX0) / cols;
    const unitY = (bY1 - bY0) / rows;

    type Region = {[coord: string]: [number, number]}
    const region: Region = [...Array(cols)]
      .map((_) => Array(rows).fill([1,1]))
      .reduce((points, col, x) => ({
        ...points,
        ...col.reduce(
          (innerPoints: Region, v: [number, number], y: number) =>
            ({...innerPoints, [`${x*unitX},${y*unitY}`]: v}), {})
      }), {});

    return region;
  }
  export function drawUnitField
  (ctx: CanvasRenderingContext2D,
   cnv: HTMLCanvasElement, f: State<[number, number]>): void
  {
    Object.entries(f)
      .forEach(([coord, [ux,uy]]) => {
        const [x,y] = coord.split(',').map(s => Number(s));
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo((x + 4*ux), (y + 4*uy));
        ctx.lineWidth = 2;
        ctx.strokeStyle = Color.blue;
        ctx.stroke();
      })
  }
}

export namespace Charged {
  export interface State extends Kinematic.State {
    charge: number;
  }
  export function coulombField<E extends Ensemble<State>>
  (ensemble: E): Field.State<{charge: State["charge"]}>
  {
    return {
      "0,1": {charge:0},
    }
  }
}

export namespace Bounded {
  export interface State extends Kinematic.State {
    radius:           number;
    xDissipation:     number;
    yDissipation:     number;
  }

  export const applyFloor =
    <S extends State>(s: S, cnv: HTMLCanvasElement): S =>
      (s.position[1] + s.radius > cnv.height)
        ? {
            ...s,
            position: [s.position[0], cnv.height - s.radius],
            dy_dt: (-1) * s.yDissipation * s.dy_dt,
          }
        : s;

  export const applyWalls =
    <S extends State>(s: S, cnv: HTMLCanvasElement): S =>
    (s.position[0] + s.radius >= cnv.width)
      ? {
          ...s,
          dx_dt: s.dx_dt * s.xDissipation * (-1),
          position: [cnv.width - s.radius, s.position[1]],
        }
      : ((s.position[0] - s.radius) <= 0)
        ? {
              ...s,
              dx_dt: s.dx_dt * s.xDissipation * (-1),
              position: [s.radius, s.position[1]],
          }
        : s;
}

export namespace Circle {
  export interface State
  extends Drawable.State, Forces.State, Bounded.State {};
  export const defaults = {
    fillColor:    Color.red,
    borderColor:  Color.blue,
    borderWidth:  4,
    dx_dt:        0,
    dy_dt:        0,
    radius:       20,
    g:            2,
    dt:           1,
    frameCount:   1,
    yDissipation: 1,
    xDissipation: 1,
  };

  // Pairs: [1,2] is equivalent to [2,1]
  export const pairs = <E extends Ensemble<State>>(s: E): string[][] =>
    Object.keys(s)
      .flatMap((n, i, ns) => ns.slice(i + 1)
      .flatMap(m => [[n,m]]));

  // Permutations: [1,2] is distinct from [2,1]
  export const perms = <E extends Ensemble<State>>(s: E): string[][] =>
    Object.keys(s)
      .flatMap((n, i, ns) => ns.slice(i + 1)
      .flatMap(m => [[n,m], [m,n]]));
}

export namespace Polygon {
  export interface State
  extends Drawable.State, Forces.State, Bounded.State
  {
    sides:       number;
    morph:       number;
  };

  export const updateSides = (s: State): State => ({
    ...s,
    sides: s.sides + ((s.frameCount % 2 === 0) ? s.morph : 0),
  });

  export const reverseMorph = (s: State): State =>
    (s.sides >= 10)
      ? {...s, morph: -1}
      : (s.sides <= 3)
        ? {...s, morph: 1}
        : s

  export const defaults = {
    borderWidth:  4,
    dx_dt:        0,
    dy_dt:        0,
    radius:       40,
    sides:        3,
    morph:        1,
    g:            2,
    dt:           1,
    frameCount:   1,
    yDissipation: 1,
    xDissipation: 1,
  };
};
