/**
 * Created by Administrator on 11/12/15.
 */
/**
 * Created by Administrator on 11/6/15.
 * Author: Uzzi Emuchay
 * Sudo-Chan Monster Entity For Diggy Hole Game
 */
module.exports = (function(){
    var Entity = require('./entity.js'),
        Sudo_Animation = require('./sudo-chan-animation.js');
    const STANDING = 0;
    const WALKING = 1;
    const JUMPING = 2;
    const PUNCHING = 3;
    const FALLING = 4;
    const HIT = 5;
    const STOP = 6;

    const SIZE = 64;
    const GRAVITY = -250;
    const SPEED_OF_MOVEMENT = 50;
    const JUMPING_VELOCITY = -600;
    //The right face sudo-chan spritesheet
    var sudo_chan_right_idle = new Image();
    sudo_chan_right_idle.src = 'sudo-chan-images/idle_sudo_chan.png';
    var sudo_chan_right_walk = new Image();
    sudo_chan_right_walk.src = 'sudo-chan-images/walking_sudo_chan.png';
    var sudo_chan_right_jump = new Image();
    sudo_chan_right_jump.src = 'sudo-chan-images/jumping_sudo_chan.png';
    var sudo_chan_right_punch = new Image();
    sudo_chan_right_punch.src = 'sudo-chan-images/celebrating_sudo_chan.png';
    var sudo_chan_right_fall = new Image();
    sudo_chan_right_fall.src = 'sudo-chan-images/falling_sudo_chan.png';
    var sudo_chan_right_hit =  new Image();
    sudo_chan_right_hit.src = 'sudo-chan-images/hurt_sudo_chan.png';

    function Sudo_Chan(locationX, locationY, mapLayer) {
        this.positionX = locationX;
        this.positionY = locationY;
        this.mapLayer = mapLayer;
        this.state_of_player = STANDING;
        this.constant_speed = 15;
        this.facing_left = false;
        this.type = "sudo_chan";
        this.sudo_chan_collided_with_knight = false;

        this.animations = {
            left: [],
            right: [],
        };

        this.animations.right[STANDING] = new Sudo_Animation(sudo_chan_right_idle, SIZE, SIZE, 0, 0, 10);
        this.animations.right[WALKING] = new Sudo_Animation(sudo_chan_right_walk, SIZE, SIZE, 0, 0, 10);
        this.animations.right[JUMPING] = new Sudo_Animation(sudo_chan_right_jump, SIZE, SIZE, 0, 0, 10);
        this.animations.right[PUNCHING] = new Sudo_Animation(sudo_chan_right_punch, SIZE, SIZE, 0, 0, 10);
        this.animations.right[FALLING] = new Sudo_Animation(sudo_chan_right_fall, SIZE, SIZE, 0, 0, 10);
        this.animations.right[HIT] = new Sudo_Animation(sudo_chan_right_hit, SIZE, SIZE, 0, 0, 10);
        this.animations.right[STOP] = new Sudo_Animation(sudo_chan_right_idle, SIZE, SIZE, 0, 0, 10);

    };
    //Player inherits from entity
    Sudo_Chan.prototype = new Entity();
    Sudo_Chan.prototype.onGround = function(tilemap) {
        var box = this.boundingBox(),
            tileX = Math.floor((box.left + (SIZE/2) + 10)/64), //Gets the rounded off value of tile's x coordinate
            tileY = Math.floor((box.bottom/64)), //Gets the rounded off value of the tile's y value
            tile = tilemap.tileAt(tileX, tileY, this.mapLayer);
        return (tile && tile.data.solid) ? true : false;
    };

    Sudo_Chan.prototype.boundingBox = function(){
        return{
            left: this.positionX,
            top: this.positionY,
            right: this.positionX + SIZE,
            bottom: this.positionY + SIZE
        }
    };
    
     Sudo_Chan.prototype.boundingCircle = function() {
    return {
      cx: this.positionX + SIZE / 2,
      cy: this.positionY + SIZE / 2,
      radius: SIZE / 2
    };
  };

    // Draw Player
    Sudo_Chan.prototype.render = function(ctx, debug) {
        if(this.facing_left){
            this.animations.left[this.state_of_player].render(ctx, this.positionX, this.positionY);
        }
        else{
            this.animations.right[this.state_of_player].render(ctx, this.positionX, this.positionY);
            //this.state_of_player = STANDING;
        }
        if(debug) {
            renderDebug(this, ctx);
        }

    };
    Sudo_Chan.prototype.rightMove = function (elaspedtime, tilemap){
        var speed_of_movements;
        if(this.sudo_chan_collided_with_knight == true){
            speed_of_movements = SPEED_OF_MOVEMENT * 2;
        }
        else{
            speed_of_movements = SPEED_OF_MOVEMENT;
        }
        this.positionX += speed_of_movements * elaspedtime;
        var box = this.boundingBox(),
            tileX = Math.floor(box.right/64),
            tileY = Math.floor(box.bottom/64) - 1;
        //console.log("This is tileX: "+tileX + " this is tileY: "+tileY + "layer's index "+ this.mapLayer);
        var tile = tilemap.tileAt(tileX, tileY, this.mapLayer);
        if(tile && tile.data.solid){
            //this.positionX = (Math.floor(this.positionX/64) + 1) * 64;
            this.state_of_player = STOP;
        }
    };
    Sudo_Chan.prototype.leftMove = function (elaspedtime, tilemap){

        this.positionX += SPEED_OF_MOVEMENT * elaspedtime;
        var box = this.boundingBox(),
            tileX = Math.floor(box.left/64),
            tileY = Math.floor(box.bottom/64) - 1,
            tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
        if(tile && tile.data.solid){
            this.positionX = (Math.floor(this.positionX/64) + 1) * 64;
            this.state_of_player = STOP;
        }
    };
    Sudo_Chan.prototype.update = function(elapsedtime, tilemap) {
        var sudo_chan_sprite = this;
        var celebration_count = 0;
        switch (sudo_chan_sprite.state_of_player) {
            case STOP:
                sudo_chan_sprite.state_of_player = JUMPING;
                sudo_chan_sprite.sprite_velocityY = JUMPING_VELOCITY;
                //console.log("punching");
                break;
            // Case when there is no ground beneath sudo-chan
            case STANDING:
                if (!sudo_chan_sprite.onGround(tilemap)) {
                    //loop through for loop rendering the animation sprite
                    sudo_chan_sprite.state_of_player = FALLING;
                    sudo_chan_sprite.sprite_velocityY = 0;
                    //console.log("this should cause monster to drop")
                }
                else {
                    //changed state of sudo-chan to walking
                    sudo_chan_sprite.state_of_player = WALKING;
                    //console.log("this should cause monster to walk");
                }
                break;
            // Case when sudo-chan is already falling, if there is ground sudo-chan stops falling
            case FALLING:
                sudo_chan_sprite.sprite_velocityY = sudo_chan_sprite.sprite_velocityY + Math.pow(GRAVITY * elapsedtime, 2);
                sudo_chan_sprite.positionY = sudo_chan_sprite.positionY + sudo_chan_sprite.sprite_velocityY * elapsedtime;
                if (sudo_chan_sprite.onGround(tilemap)) {
                    sudo_chan_sprite.state_of_player = STANDING;
                    sudo_chan_sprite.positionY = 64 * Math.floor(sudo_chan_sprite.positionY / 64);
                }
                break;
            case WALKING:
                if (!sudo_chan_sprite.onGround(tilemap)) {
                    //loop through for loop rendring the animation sprite
                    sudo_chan_sprite.state_of_player = STOP;
                    sudo_chan_sprite.sprite_velocityY = 0;
                }
                if(sudo_chan_sprite.isLeft){
                    sudo_chan_sprite.leftMove(elapsedtime, tilemap);
                }
                else {
                    sudo_chan_sprite.rightMove(elapsedtime, tilemap);
                }
                sudo_chan_sprite.sudo_chan_collided_with_knight = false;
                break;
            case PUNCHING:
                celebration_count += 1;
                break;
            case JUMPING:
                sudo_chan_sprite.sprite_velocityY += Math.pow(GRAVITY * elapsedtime, 2);
                sudo_chan_sprite.positionY += sudo_chan_sprite.sprite_velocityY * elapsedtime;
                if(sudo_chan_sprite.sprite_velocityY > 0)
                {
                    if(sudo_chan_sprite.isLeft){
                        sudo_chan_sprite.leftMove(elapsedtime, tilemap);
                    }
                    else{
                        sudo_chan_sprite.rightMove(elapsedtime, tilemap);
                    }
                    sudo_chan_sprite.state_of_player = FALLING;
                }
                break;
        }

        if (this.isLeft) {
            this.animations.left[this.state_of_player].update(elapsedtime);
        }
        else {
            this.animations.right[this.state_of_player].update(elapsedtime);
        }
    };

    //When Sudo Chan colides with player it squares up!
    Sudo_Chan.prototype.collide = function (otherEntity) {
        if(otherEntity.type == "knight"){
            this.state_of_player = PUNCHING;
            this.state_of_player = STANDING;
        }
    };

    function renderDebug(player, ctx) {
        var bounds = player.boundingBox();
        ctx.save();

        // Draw player bounding box
        ctx.strokeStyle = "red";
        ctx.beginPath();
        ctx.moveTo(bounds.left, bounds.top);
        ctx.lineTo(bounds.right, bounds.top);
        ctx.lineTo(bounds.right, bounds.bottom);
        ctx.lineTo(bounds.left, bounds.bottom);
        ctx.closePath();
        ctx.stroke();

        // Outline tile underfoot
        var tileX = 64 * Math.floor((bounds.left + (SIZE/2))/64),
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


    return Sudo_Chan;
}());
