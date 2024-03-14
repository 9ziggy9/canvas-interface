export namespace Iso {
  export function drawIsoSquare(
    ctx: CanvasRenderingContext2D,
    lengthCartesian: number,
    color: string,

  ): void {
    
  }

  export function drawIsometricBoard(
    ctx: CanvasRenderingContext2D,
    lengthCartesian: number,
    width: number, // of canvas!!!
    height: number,
    color1: string,
    color2: string,
  ): void {

    // Define the vector in the isometric basis for the parallelogram sides
    const xIso = {
      x: lengthCartesian * Math.sqrt(3) / 2,
      y: lengthCartesian / 2
    };
    const yIso = {
      x: -lengthCartesian * Math.sqrt(3) / 2,
      y: lengthCartesian / 2
    };

    // Calculate the number of cells along width and height based on vectors
    const cols = Math.ceil(width / xIso.x);
    const rows = Math.ceil(height / (lengthCartesian * 1.5));

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        // Calculate the top left corner of each parallelogram
        const startX = i * xIso.x + j * yIso.x;
        const startY = i * xIso.y + j * yIso.y;

        // Set fill style based on checkerboard pattern
        ctx.fillStyle = (i + j) % 2 === 0 ? color1 : color2;

        // Begin path for parallelogram
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + xIso.x, startY + xIso.y);
        ctx.lineTo(startX + xIso.x + yIso.x, startY + xIso.y + yIso.y);
        ctx.lineTo(startX + yIso.x, startY + yIso.y);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
}
