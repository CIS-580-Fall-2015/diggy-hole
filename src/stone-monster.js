/* Stone monster module
 * Implements the entity pattern
 * Authors:
 * - Filip Stanek
 */
module.exports = (function(){
    var Entity = require('./entity.js'),
        Animation = require('./animation.js'),
        Player = require('./player.js');

    const SIZE = 64;
    const GRAVITY = -250;
    const SPEED = 50;

    // StoneMonster States
    const WAITING = 0;
    const MOVING = 1;
    const FALLING = 2;
    const SMASHED = 3;
    const STUCK = 4;

    const SPRITE_WIDTH = 82;
    const SPRITE_HEIGHT = 80;

    const CLOSE_TO_PLAYER = SIZE*4;
    const WAIT_TIME = 3;

    function StoneMonster(locationX, locationY, layerIndex) {
        this.type = "StoneMonster";
        this.layerIndex = layerIndex;
        this.currentX = locationX;
        this.currentY = locationY;
        this.speedY = 0;
        this.state = MOVING;
        this.isMovingRight = true;
        this.bounced = false;
        this.waitingTime = 0;

        this.idle_image = new Image();
        this.idle_image.src = 'stone_monster_idle.png';

        var moving_image_left = new Image();
        moving_image_left.src = 'stone-monster-moving-left.png';
        var moving_image_right = new Image();
        moving_image_right.src = 'stone-monster-moving-right.png';
        var destroyed_image = new Image();
        destroyed_image.src = 'stone_monster_destroyed.png';

        this.animation_right = new Animation(moving_image_right, SPRITE_WIDTH, SPRITE_HEIGHT, 0, 0, 8, 0.1);
        this.animation_left = new Animation(moving_image_left, SPRITE_WIDTH, SPRITE_HEIGHT, 0, 0, 8, 0.1);
        this.animation_destroyed = new Animation(destroyed_image, SIZE, SIZE, 0, 0, 8, 0.035, true);
    }

    StoneMonster.prototype = new Entity();

    StoneMonster.prototype.moveLeft = function(distance, tilemap) {
        this.currentX -= distance;
        var box = this.boundingBox(),
            tileX = Math.floor(box.left/64),
            tileY = Math.floor(box.bottom / 64) - 1,
            tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
        if (tile && tile.data.solid) {
            this.currentX = (Math.floor(this.currentX / 64) + 1) * 64;
            return true;
        }
        return false;
    };

    StoneMonster.prototype.moveRight = function(distance, tilemap) {
        this.currentX += distance;
        var box = this.boundingBox(),
            tileX = Math.floor(box.right/64),
            tileY = Math.floor(box.bottom / 64) - 1,
            tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
        if (tile && tile.data.solid) {
            this.currentX = (Math.ceil(this.currentX / 64) - 1) * 64;
            return true;
        }
        return false;
    };

    StoneMonster.prototype.move = function(elapsedTime, tilemap, entityManager){
        var collided = false;
        if(this.isMovingRight){
            collided = this.moveRight(elapsedTime * SPEED, tilemap);
        }
        else{
            collided = this.moveLeft(elapsedTime * SPEED, tilemap);
        }
        if(collided){
            if(this.bounced){
                this.state = STUCK;
                return;
            }
            this.isMovingRight = !this.isMovingRight;
            this.bounced = true;
        }
        else if(!this.bounced){
            var player = entityManager.getPlayer();
            if (player) {
                if (this.currentX < player.currentX - CLOSE_TO_PLAYER) {
                    this.isMovingRight = true;
                }
                else if (this.currentX > player.currentX + CLOSE_TO_PLAYER) {
                    this.isMovingRight = false;
                }
                else if (this.currentY > player.currentY){
                    this.state = WAITING;
                }
            }
        }
    };

    StoneMonster.prototype.update = function(elapsedTime, tilemap, entityManager) {
        switch (this.state) {
            case WAITING:
                this.waitingTime += elapsedTime;
                if (this.waitingTime < WAIT_TIME) {
                    break;
                }
                var player = entityManager.getPlayer();
                if (player && (this.currentX < player.currentX - CLOSE_TO_PLAYER
                    || this.currentX > player.currentX + CLOSE_TO_PLAYER
                    || this.currentY < player.currentY )) {
                    this.waitingTime = 0;
                    this.state = MOVING;
                }
                break;
            case MOVING:
                if (!this.onGround(tilemap)) {
                    this.state = FALLING;
                    this.speedY = 0;
                    break;
                }
                this.move(elapsedTime, tilemap, entityManager);
                break;
            case FALLING:
                this.bounced = false;
                this.speedY += Math.pow(GRAVITY * elapsedTime, 2);
                this.currentY += this.speedY * elapsedTime;
                if (this.onGround(tilemap)) {
                    this.state = MOVING;
                    this.currentY = 64 * Math.floor(this.currentY / 64);
                }
                break;
            case SMASHED:
                this.animation_destroyed.update(elapsedTime);
                break;
            case STUCK:
                break;
        }
        if (this.state == MOVING) {
            if (this.isMovingRight) {
                this.animation_right.update(elapsedTime);
            }
            else {
                this.animation_left.update(elapsedTime);
            }
        }
    };

    StoneMonster.prototype.render = function(ctx, debug) {
        if(this.state == WAITING || this.state == FALLING || this.state == STUCK) {
            ctx.drawImage(this.idle_image, this.currentX, this.currentY);
        }
        else if(this.state == MOVING) {
            if(this.isMovingRight){
                this.animation_right.render(ctx, this.currentX - 19, this.currentY - 16);
            }
            else {
                this.animation_left.render(ctx, this.currentX, this.currentY - 16);
            }
        }
        else if(this.state == SMASHED){
            this.animation_destroyed.render(ctx, this.currentX, this.currentY);
        }
        if(debug){
            this.renderDebug(ctx);
        }
    };

    StoneMonster.prototype.renderDebug = function(ctx) {
        var bounds = this.boundingBox();
        ctx.save();
        ctx.strokeStyle = "purple";
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

    StoneMonster.prototype.collide = function(otherEntity){
        if(!otherEntity){
            return;
        }
        if(otherEntity instanceof Player && this.state != FALLING
            && otherEntity.currentY + SIZE/2 <= this.currentY){
            this.state = SMASHED;
        }
        var entityRect = otherEntity.boundingBox();
        var thisRect = this.boundingBox();


        if(entityRect.bottom > thisRect.top){
            otherEntity.currentY = thisRect.top - SIZE - 2;
            if(otherEntity instanceof  Player && this.state == SMASHED){
                //otherEntity.health -= DAMAGE;
                console.log("damage");
            }
        }
        else if(entityRect.right - SIZE/3 >= thisRect.left){
            otherEntity.currentX -= (entityRect.right - thisRect.left);
        }
        else if(entityRect.left - SIZE/3 <= thisRect.right){
            console.log(thisRect.right - entityRect.left);
            otherEntity.currentX = this.currentX + SIZE + 2;
        }
    };

    return StoneMonster;
}());