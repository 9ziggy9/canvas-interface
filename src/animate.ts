export namespace Loop {
  export function animateAtTargetFPS(
  target: number,
  ctx: CanvasRenderingContext2D,
  cnv: HTMLCanvasElement,
  entry: () => void,
  ) {
    let lastFrameTime = 0; 

    function animationLoop(timestamp: number) {
      const timeSinceLastFrame = timestamp - lastFrameTime;
      const targetFrameTime = 1000 / target;

      // only update if enough time has passed for the next frame
      if (timeSinceLastFrame >= targetFrameTime) {
        lastFrameTime = timestamp;

        // BEGIN: animations
        entry();
        // END: animations

        requestAnimationFrame(animationLoop); 
      } else {
        requestAnimationFrame(animationLoop); // skip and wait
      }
    }
    requestAnimationFrame(animationLoop); // enter recursive loop
  };
}
