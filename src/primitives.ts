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

}
