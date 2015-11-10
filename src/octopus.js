/**
 * Created by Jessica on 11/8/15.
 */

module.exports = function () {

    var Entity = require('./entity.js'),
        OctopusAnimation = require('./octopus_animation.js');


    //const STANDING = 0;
    const WALKING = 1;
    const JUMPING = 2;
    const ATTACKING = 3;
    const FALLING = 4;

    const SIZE = 64;

    const SPEED = 150;
    const GRAVITY = -250;
    const JUMP_VELOCITY = -600;

    const IMG_WIDTH = 240;
    const IMG_HEIGH = 309;

    var oct = new Image();
    oct.src = 'octopus.png';

    function Octopus(locationX, locationY, layerIndex) {
        this.state = WALKING;
        this.layerIndex = layerIndex;
        this.currentX = locationX;
        this.currentY = locationY;
        this.gravity = 0.5;
        this.xSpeed = 10;
        this.ySpeed = 15;
        this.animations = [];
        this.isLeft = false;
        this.type = "magicOctopus";

        //this.animations[STANDING] = new OctopusAnimation(oct, IMG_WIDTH, IMG_HEIGH, SIZE, 0, 0);
        this.animations[WALKING] = new OctopusAnimation(oct, IMG_WIDTH, IMG_HEIGH, SIZE, 0, 0, 4);
        this.animations[JUMPING] = new OctopusAnimation(oct, IMG_WIDTH, IMG_HEIGH, SIZE, 0, IMG_HEIGH, 4);
        this.animations[FALLING] = new OctopusAnimation(oct, IMG_WIDTH, IMG_HEIGH, SIZE, 0, 0);
        this.animations[ATTACKING] = new OctopusAnimation(oct, IMG_WIDTH, IMG_HEIGH, SIZE, 0, IMG_HEIGH * 2, 4);

    }

    Octopus.prototype = new Entity();

    Octopus.prototype.onGround = function (tilemap) {
        var box = this.boundingBox(),
            tileX = Math.floor((box.left + (SIZE / 2)) / 64),
            tileY = Math.floor(box.bottom / 64);
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
        return (tile && tile.data.solid) ? true : false;
    };

    Octopus.prototype.moveLeft = function (distance, tilemap) {
        this.currentX -= distance;
        var box = this.boundingBox(),
            tileX = Math.floor(box.left / 64),
            tileY = Math.floor(box.bottom / 64) - 1,
            tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
        if (tile && tile.data.solid)
            this.currentX = (Math.floor(this.currentX / 64) + 1) * 64;
    };

    Octopus.prototype.moveRight = function (distance, tilemap) {
        this.currentX += distance;
        var box = this.boundingBox(),
            tileX = Math.floor(box.right / 64),
            tileY = Math.floor(box.bottom / 64) - 1,
            tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
        if (tile && tile.data.solid)
            this.currentX = (Math.ceil(this.currentX / 64) - 1) * 64;
    };

    Octopus.prototype.getPlayerPosition = function(playerPosition) {

        console.log(playerPosition.top + " " + this.currentY);

        if (playerPosition.top <= this.currentY - 64) {
            this.state = JUMPING;
            this.velocityY = JUMP_VELOCITY;
        } else if (playerPosition.left > this.currentX + 64) {
            this.state = WALKING;
            this.isLeft = false;
        } else if (playerPosition.left < this.currentX - 64) {
            this.state = WALKING;
            this.isLeft = true;
        }

    };

    Octopus.prototype.update = function(elapsedTime, tilemap) {

        switch(this.state) {
            //case STANDING:
            case WALKING:
                // If there is no ground underneath, fall
                if (!this.onGround(tilemap)) {
                    this.state = FALLING;
                    this.velocityY = 0;
                }
                if (this.isLeft == true) {
                    console.log("leftleftleftlelft");
                    this.moveLeft(elapsedTime * SPEED, tilemap);
                } else {
                    this.moveRight(elapsedTime * SPEED, tilemap);
                }

                break;
            case JUMPING:
                this.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
                this.currentY += this.velocityY * elapsedTime;
                if (this.velocityY > 0) {
                    this.state = FALLING;
                }
                break;
            case FALLING:
                this.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
                this.currentY += this.velocityY * elapsedTime;
                if (this.onGround(tilemap)) {
                    this.state = WALKING;
                    this.currentY = 64 * Math.floor(this.currentY / 64);
                }
                break;
        }
        this.animations[this.state].update(elapsedTime);

     };

    function renderDebug(player, ctx) {
        var bounds = player.boundingBox();
        ctx.save();

        // Draw player bounding box
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(bounds.left, bounds.top);
        ctx.lineTo(bounds.right, bounds.top);
        ctx.lineTo(bounds.right, bounds.bottom);
        ctx.lineTo(bounds.left, bounds.bottom);
        ctx.closePath();
        ctx.stroke(); // Outline tile underfoot
        var tileX = 64 * Math.floor((bounds.left + (SIZE / 2 )) / 64),
            tileY = 64 * (Math.floor(bounds.bottom / 64));
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(tileX, tileY);
        ctx.lineTo(tileX + 64, tileY);
        ctx.lineTo(tileX + 64, tileY + 64);
        ctx.lineTo(tileX, tileY + 64);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
    }


    Octopus.prototype.render = function (context, debug) {
        this.animations[this.state].render(context, this.currentX, this.currentY);

        if (debug) renderDebug(this, context);
    };

    Octopus.prototype.collide = function (otherEntity) {
        if (otherEntity.type != "player") {
            if (this.onGround(tilemap)) {
                this.state = ATTACKING;
            }
        }
    };

    Octopus.prototype.boundingBox = function () {
        return {
            left: this.currentX,
            top: this.currentY,
            right: this.currentX + SIZE,
            bottom: this.currentY + SIZE
        }
    };

    Octopus.prototype.boundingCircle = function () {
        return {
            cx: this.currentX + SIZE / 2,
            cy: this.currentY + SIZE / 2,
            radius: SIZE / 2
        }
    };

    return Octopus;

}();

