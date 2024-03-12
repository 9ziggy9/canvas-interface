import { Circle } from "./examples.js";
import { Color } from "./color.js";

export namespace Primitives {

  export type Scale = 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1; // lol
  export function drawCheckerBoard(
    ctx: CanvasRenderingContext2D,
    region: [number, number],
    color1: string,
    color2: string,
    scale: Scale = 0.1,
  ) : void
  {
    const [width, height] = region;
    const size = Math.min(width, height) * scale; // compute the size of each square
    for (let i = 0; i < width; i += size) {
      for (let j = 0; j < height; j += size) {
        ctx.fillStyle = (i / size + j / size) % 2 === 0 ? color1 : color2;
        ctx.fillRect(i, j, size, size);
      }
    }
  }

  export function drawCircle(
    ctx: CanvasRenderingContext2D,
    center: [number,number],
    radius: number,
    fillColor: string,
    strokeColor: string,
    strokeWidth: number,
  ): void {
    ctx.beginPath(); // Start a new path
    ctx.arc(center[0], center[1], radius, 0, 2 * Math.PI); // Draw a circle
    ctx.fillStyle = fillColor; // Set the fill color
    ctx.fill(); // Fill the circle
    ctx.lineWidth = strokeWidth; // Set the stroke width
    ctx.strokeStyle = strokeColor; // Set the stroke color
    ctx.stroke(); // Draw the circle outline
  }

  export function drawNGon(
      ctx: CanvasRenderingContext2D,
      center: [number, number],
      radius: number,
      n: number,
      borderWidth: number,
      fillColor: string,
      borderColor: string
  ): void {
      const [x, y] = center;
      n = Math.max(3, Math.min(n, 32));  // Enforce range 3-32

      ctx.beginPath();
      for (let i = 0; i < n; i++) {
          const angle = (2 * Math.PI / n) * i;
          const vertexX = x + radius * Math.cos(angle);
          const vertexY = y + radius * Math.sin(angle);

          if (i === 0) {
              ctx.moveTo(vertexX, vertexY);
          } else {
              ctx.lineTo(vertexX, vertexY);
          }
      }

      ctx.closePath();  // Connect last vertex to the first
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth;
      ctx.stroke();
  }

  export function drawSpringPair
  (ctx: CanvasRenderingContext2D, cs: Circle.State[]): void
  {
    const dy = (cs[1].position[1] - cs[0].position[1]);
    const [x1,y1] = cs[0].position;
    const [x2,y2] = cs[1].position;
    const r = cs[1].radius;
    // Draw Spring
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = r / ((dy / (r ** 2)) + 1);
    ctx.strokeStyle = Color.darkGray;
    ctx.stroke();
    // Draw circles
    Primitives.drawCircle(
      ctx, [x1, y1], r,
      cs[0].fillColor, cs[0].borderColor, cs[0].borderWidth,
    );
    Primitives.drawCircle(
      ctx, [x2, y2], r,
      cs[1].fillColor, cs[1].borderColor, cs[1].borderWidth,
    );
  }

  export function drawConnection
  (ctx: CanvasRenderingContext2D, cs: Circle.State[], color: string): void
  {
    const [x1,y1] = cs[0].position;
    const [x2,y2] = cs[1].position;
    const dxdx = (x2 - x1)*(x2 - x1);
    const dydy = (y2 - y1)*(y2 - y1);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = 0.1;
    ctx.strokeStyle = color;
    ctx.stroke();

  }
}
