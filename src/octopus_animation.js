/**
 * Created by Jessica on 11/8/15.
 */
module.exports = (function() {

    function OctopusAnimation(image, srcWidth, srcHeight, size, top, left, numberOfFrames, secondsPerFrame) {
        this.frameIndex = 0;
        this.time = 0;
        this.secondsPerFrame = secondsPerFrame || (1/16);
        this.numberOfFrames = numberOfFrames || 1;

        this.srcWidth = srcWidth;
        this.srcHeight = srcHeight;
        this.size = size;
        this.image = image;

        this.drawLocationX = top || 0;
        this.drawLocationY = left || 0;
    }

    OctopusAnimation.prototype.setStats = function(frameCount, locationX, locationY){
        this.numberOfFrames = frameCount;
        this.drawLocationY = locationY;
        this.drawLocationX = locationX;
    };

    OctopusAnimation.prototype.update = function (elapsedTime, tilemap) {
        this.time += elapsedTime;

        // Update animation
        if (this.time > this.secondsPerFrame) {
            if(this.time > this.secondsPerFrame) this.time -= this.secondsPerFrame;

            // If the current frame index is in range
            if (this.frameIndex < this.numberOfFrames - 1) {
                this.frameIndex += 1;
            } else {
                this.frameIndex = 0;
            }
        }
    };

    OctopusAnimation.prototype.render = function(ctx, x, y) {

        // Draw the current frame
        ctx.drawImage(
            this.image,
            this.drawLocationX + this.frameIndex * this.srcWidth,
            this.drawLocationY,
            this.srcWidth,
            this.srcHeight,
            x,
            y,
            this.size,
            this.size);
    };



    return OctopusAnimation;

}());