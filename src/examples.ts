export namespace Polygon {
  const g = 2;
  const dt = 1;
  export interface State {
    position:    [number, number];
    radius:      number;
    dy_dt:       number; // vertical velocity
    dx_dt:       number, // horizontal velocity
    decay:       number; // impact loss
    frameCount:  number;
    sides:       number;
    morph:       number; // time evolution of gon sides
    fillColor:   string;
    borderColor: string;
  };

  export const updatePosition = (s: State): State => ({
    ...s, position: [s.position[0] + s.dx_dt, s.position[1] + s.dy_dt * dt]
  });

  export const gravity = (s: State): State => ({
    ...s, dy_dt: s.dy_dt + g * dt
  });

  export const applyFloor = (s: State, cnv: HTMLCanvasElement): State =>
    (s.position[1] + s.radius > cnv.height)
      ? {
          ...s,
          position: [s.position[0], cnv.height - s.radius],
          dy_dt: (-1) * s.decay * s.dy_dt,
        }
      : s;

  export const applyWalls = (s: State, cnv: HTMLCanvasElement): State =>
  ({
    ...s,
    dx_dt: s.dx_dt * ((s.position[0] + s.radius > cnv.width ||
      s.position[0] - s.radius < 0) ? (-1) : 1)
  });

  export const updateFrames = (s: State): State => ({
    ...s, frameCount: s.frameCount + 1
  });

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

  export const growRadius = (s: State): State => ({
    ...s, radius: s.radius + 2 * s.morph
  });

  export const changeColor = (s: State): State => ({
    ...s,
    fillColor:   (s.frameCount % 5 === 0) ? s.borderColor : s.fillColor,
    borderColor: (s.frameCount % 5 === 0) ? s.fillColor   : s.borderColor,
  });
}
