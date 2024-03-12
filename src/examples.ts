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

export namespace Gravitational {
  export interface State extends Kinematic.State {
    g:    number;
  };
  export const vertical = <S extends State> (s: S): S => ({
    ...s, dy_dt: s.dy_dt + s.g * s.dt
  });
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
      ({
      ...s,
      dx_dt: s.dx_dt
        * s.xDissipation
        * ((s.position[0] + s.radius > cnv.width
          || s.position[0] - s.radius < 0) ? (-1) : 1)
      });
}

export namespace Circle {
  export interface State
  extends Drawable.State, Gravitational.State, Bounded.State {};
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
  extends Drawable.State, Gravitational.State, Bounded.State
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
