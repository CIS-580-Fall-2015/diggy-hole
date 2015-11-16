/**
 * Created by Administrator on 11/12/15.
 */
/**
 * Created by Administrator on 11/12/15.
 */
/**
 * Created by Administrator on 11/7/15.
 * Author Uzzi Emuchay
 * Animation for sudo-chan monster
 */
module.exports = (function() {

    function Sudo_Animation(image, width, height, top, left, numberOfFrames,secondsPerFrame) {
        this.frameIndex = 0,
            this.time = 0,
            this.secondsPerFrame = secondsPerFrame || (1/16),
            this.numberOfFrames = numberOfFrames || 0;


        this.width = width;
        this.height = height;
        this.image = image;

        this.drawLocationX = top || 0;
        this.drawLocationY = left || 0;
    }

    Sudo_Animation.prototype.setStats = function(frameCount, locationX, locationY){
        this.numberOfFrames = frameCount;
        this.drawLocationY = locationY;
        this.drawLocationX = locationX;
        console.log("I am called");
    };

    Sudo_Animation.prototype.update = function (elapsedTime, tilemap) {
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

    Sudo_Animation.prototype.render = function(ctx, x, y) {

        // Draw the current frame
        //console.log("image name "+ this.image);
        //console.log("This is the index of frame " + this.frameIndex);
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
    }

    return Sudo_Animation;

}());