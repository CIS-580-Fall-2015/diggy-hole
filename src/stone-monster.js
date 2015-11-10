/* Stone monster module
 * Implements the entity pattern
 * Authors:
 * - Filip Stanek
 */
module.exports = (function(){
    var Entity = require('./entity.js'),
        Animation = require('./animation.js');

    const SIZE = 64;
    const GRAVITY = -250;
    const SPEED = 50;

    // StoneMonster States
    const WAITING = 0;
    const MOVING_RIGHT = 1;
    const MOVING_LEFT = 2;
    const FALLING = 3;
    const SMASHED = 4;

    const SPRITE_WIDTH = 82;
    const SPRITE_HEIGHT = 80;


    function StoneMonster(locationX, locationY, layerIndex) {
        this.layerIndex = layerIndex;
        this.currentX = locationX;
        this.currentY = locationY;
        this.speedX = 0;
        this.speedY = 0;
        this.state = MOVING_RIGHT;

        this.idle_image = new Image();
        this.idle_image.src = 'stone_monster_idle.png';

        var moving_image_left = new Image();
        moving_image_left.src = 'stone-monster-moving-left.png';
        var moving_image_right = new Image();
        moving_image_right.src = 'stone-monster-moving-right.png';

        this.animations = [];

        this.animations[MOVING_RIGHT] = new Animation(moving_image_right, SPRITE_WIDTH, SPRITE_HEIGHT, 0, 0, 8, 0.1);
        this.animations[MOVING_LEFT] = new Animation(moving_image_left, SPRITE_WIDTH, SPRITE_HEIGHT, 0, 8, 8, 0.1);
    }

    StoneMonster.prototype = new Entity();

    StoneMonster.prototype.moveLeft = function(distance, tilemap) {
        this.currentX -= distance;
        var box = this.boundingBox(),
            tileX = Math.floor(box.left/64),
            tileY = Math.floor(box.bottom / 64) - 1,
            tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
        if (tile && tile.data.solid)
            this.currentX = (Math.floor(this.currentX/64) + 1) * 64
    };

    // Moves the player to the right, colliding with solid tiles
    StoneMonster.prototype.moveRight = function(distance, tilemap) {
        this.currentX += distance;
        var box = this.boundingBox(),
            tileX = Math.floor(box.right/64),
            tileY = Math.floor(box.bottom / 64) - 1,
            tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
        if (tile && tile.data.solid)
            this.currentX = (Math.ceil(this.currentX/64)-1) * 64;
    };

    StoneMonster.prototype.update = function(elapsedTime, tilemap) {
        switch(this.state) {
            case WAITING:
                this.state = MOVING_RIGHT;
                break;
            case MOVING_RIGHT:
                if(!this.onGround(tilemap)) {
                    this.state = FALLING;
                    this.speedY = 0;
                }
                this.moveRight(elapsedTime * SPEED, tilemap);
                break;
            case FALLING:
                this.speedY += Math.pow(GRAVITY * elapsedTime, 2);
                this.currentY += this.speedY * elapsedTime;
                if(this.onGround(tilemap)) {
                    this.state =  WAITING;
                    this.currentY = 64 * Math.floor(this.currentY / 64);
                }
                break;
            case SMASHED:
                break;
        }
        if(this.state == MOVING_RIGHT || this.state == MOVING_LEFT) {
            this.animations[this.state].update(elapsedTime);
        }
    };


    StoneMonster.prototype.render = function(ctx, debug) {
        if(this.state == WAITING || this.state == FALLING) {
            ctx.drawImage(this.idle_image, this.currentX, this.currentY);
        }
        else if(this.state == MOVING_LEFT) {
            this.animations[this.state].render(ctx, this.currentX, this.currentY - 16);
        }
        else if(this.state == MOVING_RIGHT) {
            this.animations[this.state].render(ctx, this.currentX - 19, this.currentY - 16);
        }
        if(debug){
            this.renderDebug(ctx);
        }
    };

    StoneMonster.prototype.renderDebug = function(ctx) {
        var bounds = this.boundingBox();
        ctx.save();

        ctx.strokeStyle = "red";
        ctx.beginPath();
        ctx.moveTo(bounds.left, bounds.top);
        ctx.lineTo(bounds.right, bounds.top);
        ctx.lineTo(bounds.right, bounds.bottom);
        ctx.lineTo(bounds.left, bounds.bottom);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    };

    StoneMonster.prototype.onGround = function(tilemap) {
        var box = this.boundingBox(),
            tileX = Math.floor((box.left + (SIZE/3))/64),
            tileY = Math.floor(box.bottom / 64),
            tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
        return (tile && tile.data.solid) ? true : false;
    };

    StoneMonster.prototype.boundingBox = function() {
        return {
            left: this.currentX,
            top: this.currentY,
            right: this.currentX + SIZE,
            bottom: this.currentY + SIZE
        }
    };

    StoneMonster.prototype.boundingCircle = function() {

    };

    return StoneMonster;
}());