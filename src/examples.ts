export namespace Drawable {
  export interface State {
    fillColor:   string;
    borderColor: string;
    borderWidth: number;
  }
};

export namespace Kinematic {
  export interface State {
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

  export function hookeSpring<S extends State>
  (c0: S, c1: S, k: number, rest: number): S[]
  {
    const [x1, y1] = c0.position;
    const [x2, y2] = c1.position;
    const F = (-1) * k * ((y2 - y1) - rest);
    return [
      {...c0},
      {...c1, dy_dt: c1.dy_dt + (F * (c0.dt))}
    ]
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
