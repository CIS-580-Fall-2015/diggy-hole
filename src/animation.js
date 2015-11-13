module.exports = (function() {

  function Animation(image, width, height, top, left, numberOfFrames, secondsPerFrame, playItOnce, donePlayingCallback) {
    this.frameIndex = 0,
      this.time = 0,
      this.secondsPerFrame = secondsPerFrame || (1 / 16),
      this.numberOfFrames = numberOfFrames || 1;

    this.width = width;
    this.height = height;
    this.image = image;

    this.drawLocationX = top || 0;
    this.drawLocationY = left || 0;

    this.playItOnce = playItOnce;
    this.donePlayingCallback = donePlayingCallback;
  }

  Animation.prototype.setStats = function(frameCount, locationX, locationY) {
    this.numberOfFrames = frameCount;
    this.drawLocationY = locationY;
    this.drawLocationX = locationX;
  };

  Animation.prototype.update = function(elapsedTime, tilemap) {
    this.time += elapsedTime;

    // Update animation
    if (this.time > this.secondsPerFrame) {
      if (this.time > this.secondsPerFrame) this.time -= this.secondsPerFrame;

      // If the current frame index is in range
      if (this.frameIndex < this.numberOfFrames - 1) {
        this.frameIndex += 1;
      } else {
        if (!this.playItOnce)
          this.frameIndex = 0;

        if(this.donePlayingCallback)
          this.donePlayingCallback();
      }
    }
  };

  Animation.prototype.render = function(ctx, x, y) {

    // Draw the current frame
    ctx.drawImage(
      this.image,
      this.drawLocationX + this.frameIndex * this.width,
      this.drawLocationY,
      this.width,
      this.height,
      x,
      y,
      this.width,
      this.height);
  };

  return Animation;

}());
