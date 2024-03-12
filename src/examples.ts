import { State as StateMonad } from "./state.js";

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

  export const coulombInteraction = <E extends Ensemble<State>>(s: E): E =>
    Circle.pairs(s)
      .reduce<E>((ensemble, [cName1, cName2]) => {
        const dt       = s[cName1].dt;
        const [x1, y1] = s[cName1].position;
        const [x2, y2] = s[cName2].position;
        const dy1_dt   = s[cName1].dy_dt;
        const dx1_dt   = s[cName1].dx_dt;
        const dy2_dt   = s[cName2].dy_dt;
        const dx2_dt   = s[cName2].dx_dt;
        return {
          ...ensemble,
          [cName1]: {
            ...s[cName1],
            dy_dt: dy1_dt + dt * ((y2 - y1) / Math.pow((y2 - y1), 3)),
            dx_dt: dx1_dt + dt * ((x2 - x1) / Math.pow((x2 - x1), 3)),
          },
          [cName2]: {
            ...s[cName2],
            dy_dt: dy2_dt + dt * ((y2 - y1) / Math.pow((y2 - y1), 3)),
            dx_dt: dx2_dt + dt * ((x2 - x1) / Math.pow((x2 - x1), 3)),
          },
        };
      }, {} as E);

  export const meshUpdate = <E extends Ensemble<State>> (e: E): E =>
    Circle.pairs(e)
      .reduce<E>((ensemble, [cName1, cName2]) => {
        const [x1, y1] = e[cName1].position;
        const [x2, y2] = e[cName2].position;
        return {
          ...ensemble,
          [cName1]: {
            ...e[cName1],
            position: [x1 + 1, y1 + 1],
          },
          [cName2]: {
            ...e[cName2],
            position: [x2 - 1, y2 - 1],
          },
        }
      }, {} as E);
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
