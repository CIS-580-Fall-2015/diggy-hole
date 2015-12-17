/* Ghost Miner module
 * Implements the entity pattern and provides
 * the Ghost Miner info.
 * Authors:
 * - Daniel Marts
 */
module.exports = (function(){
  var Entity = require('./entity.js'),
      Animation = require('./animation.js');

const IDLE = 0;
const MOVING = 1;
const AGGRESSIVE = 2;
const ATTACKING = 3;
var direction;//0 for left, 1 for right

  // The Sprite Size
  const SIZE = 64;

  // Movement constants
  const PAS_SPEED = 40;//Passive speed
  const AGR_SPEED = 120;//Aggressive speed

  //The Right facing dwarf spritesheet
  var ghostRight = new Image();
  ghostRight.src = 'img/GhostAnimatedLeft.png';

  //The left facing dwarf spritesheet
  var ghostLeft = new Image();
  ghostLeft.src = "img/GhostAnimatedLeft.png";

  //The Player constructor
  function Ghost(locationX, locationY, layerIndex, id) {
    this.state = IDLE;
    this.direction = 1;
    this.layerIndex = layerIndex;
    this.currentX = locationX;
    this.currentY = locationY;
    this.velocityX = 0;
    this.velocityY = 0;
    this.health = 100;
    this.lastTime = 0;//Tracks the last time update was called
    this.id = id;
	  this.type = "ghost";
    this.score = 4;

    //The animations
    this.animations = {
      left: [],
      right: [],
    }

    //The right-facing animations
    this.animations.right[IDLE] = new Animation(ghostRight, SIZE, SIZE, 0, 0, 4);
    this.animations.right[MOVING] = new Animation(ghostRight, SIZE, SIZE, 0, 0, 4);
    this.animations.right[AGGRESSIVE] = new Animation(ghostRight, SIZE, SIZE, SIZE*1, 0, 4);
    this.animations.right[ATTACKING] = new Animation(ghostRight, SIZE, SIZE, SIZE*2, 0, 4);

    //The left-facing animations
    this.animations.left[IDLE] = new Animation(ghostLeft, SIZE, SIZE, 0, 0, 4);
    this.animations.left[MOVING] = new Animation(ghostLeft, SIZE, SIZE, 0, 0, 4);
    this.animations.left[AGGRESSIVE] = new Animation(ghostLeft, SIZE, SIZE, SIZE*1, 4);
    this.animations.left[ATTACKING] = new Animation(ghostLeft, SIZE, SIZE, 0, SIZE*2, 4);
  }

  // Player inherits from Entity
  Ghost.prototype = new Entity();

  // Determines if the player is on the ground
  Ghost.prototype.onGround = function(tilemap) {
    var box = this.boundingBox(),
        tileX = Math.floor((box.left + (SIZE/2))/64),
        tileY = Math.floor(box.bottom / 64),
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    // find the tile we are standing on.
    return (tile && tile.data.solid) ? true : false;
  }

  // Moves the player to the left, colliding with solid tiles
  Ghost.prototype.moveLeft = function(distance, tilemap) {
    this.currentX -= distance;
    var box = this.boundingBox(),
        tileX = Math.floor(box.left/64),
        tileY = Math.floor(box.bottom / 64) - 1,
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid)
      this.currentX = (Math.floor(this.currentX/64) + 1) * 64
  }

  // Moves the player to the right, colliding with solid tiles
  Ghost.prototype.moveRight = function(distance, tilemap) {
    this.currentX += distance;
    var box = this.boundingBox();
        tileX = Math.floor(box.right/64);
        tileY = Math.floor(box.bottom / 64) - 1;
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid)
      this.currentX = (Math.ceil(this.currentX/64)-1) * 64;
  }

  /* Ghost update function
   * arguments:
   * - elapsedTime, the time that has passed
   *   between this and the last frame.
   * - tilemap, the tilemap that corresponds to
   *   the current game world.
   */
  Ghost.prototype.update = function(elapsedTime, tilemap, entityManager) {
    if (this.health == 0) {
      entityManager.remove(this.id);
    }
    else {
      switch(this.state){
        case IDLE:
          if (this.health < 100) {
            this.state = AGGRESSIVE;
          }
          else {
            var chance = Math.random();
            if (chance > .95) { //5% chance to change states
              this.state = MOVING;
            }
          }
          break;
        case MOVING:
          if (this.health < 100)
          {
            this.state = AGGRESSIVE;
          }
          else {
            var chance = Math.random();
            if (chance > 95) { //5% chance to change states
              this.state = IDLE;
            }
            else if (chance > 92) { //Small chance to change direction
              if (direction == 0) direction = 1;
              else direction = 0;
            }
            else {
              if (!this.onGround(tilemap)){
                this.velocityY = -1;
                this.currentY = this.currentY + this.velocityY;
              }
              else this.velocityY = 0;
              if (direction == 0) this.moveLeft(elapsedTime * PAS_SPEED, tilemap);
              else this.moveRight(elapsedTime * PAS_SPEED, tilemap);
            }
          }
          break;
        case AGGRESSIVE:
          if (this.health == 100) this.state = IDLE;
          var PlayerX = Player.currentX;
          var PlayerY = Player.currentY;
          var dist = (PlayerX - this.currentX) * (PlayerX - this.currentX) + (PlayerY - 
			this.currentY) * (PlayerY - this.currentY);
          if (dist <= 40*40){
            this.state = ATTACKING;
            //We do not want to pause moving, so we always execute code below this
          }
          if (this.currentX > PlayerX) this.moveLeft(elapsedTime * AGR_SPEED, tilemap);
          else this.moveRight(elapsedTime * AGR_SPEED, tilemap);
          if (this.currentY > PlayerY) this.velocityY = -5;
          else this.velocityY = 5;
          this.currentY = this.currentY + this.velocityY;
          break;
        case ATTACKING:
          if (this.health == 100) this.state = IDLE;
          else {
            var PlayerX = Player.currentX;
            var PlayerY = Player.currentY;
            var dist = (PlayerX - this.currentX) * (PlayerX - this.currentX) + (PlayerY - 
				this.currentY) * (PlayerY - this.currentY);
            if (dist > 40*40) {
              this.state = AGGRESSIVE;
            }
            else {
              if (this.currentX > PlayerX) this.moveLeft(elapsedTime * AGR_SPEED, tilemap);
              else this.moveRight(elapsedTime * AGR_SPEED, tilemap);
              if (this.currentY > PlayerY) this.velocityY = -5;
              else this.velocityY = 5;
              this.currentY = this.currentY + this.velocityY;
              if (direction == 0) {
                if (animations.left[ATTACKING].frameIndex == 3) {
                  Player.health -= 10;
                }
              }
              else if (direction == 1) {
                if (animations.right[ATTACKING].frameIndex == 3) {
                  Player.health -= 10;
                }
              }
            }
          }

          break;
        }
        if (this.health < 100) {
          this.health += Math.floor(elapsedTime / 100);
          if (this.health > 100) this.health = 100;
        }

        // Update animation
        if(direction == 0)
          this.animations.left[this.state].update(elapsedTime);
        else
          this.animations.right[this.state].update(elapsedTime);
    }
  }

  /* Ghost Render Function
   * arguments:
   * - ctx, the rendering context
   * - debug, a flag that indicates turning on
   * visual debugging
   */
  Ghost.prototype.render = function(ctx, debug) {
    // Draw the ghost (and the correct animation)
    if(this.direction == 0)
      this.animations.left[this.state].render(ctx, this.currentX, this.currentY);
    else
      this.animations.right[this.state].render(ctx, this.currentX, this.currentY);

    if(debug) renderDebug(this, ctx);
  }

  // Draw debugging visual elements
  function renderDebug(player, ctx) {
    var bounds = player.boundingBox();
    ctx.save();

    // Draw ghost bounding box
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(bounds.left, bounds.top);
    ctx.lineTo(bounds.right, bounds.top);
    ctx.lineTo(bounds.right, bounds.bottom);
    ctx.lineTo(bounds.left, bounds.bottom);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  }

  /* Ghost BoundingBox Function
   * returns: A bounding box representing the player
   */
  Ghost.prototype.boundingBox = function() {
    return {
      left: this.currentX,
      top: this.currentY,
      right: this.currentX + SIZE,
      bottom: this.currentY + SIZE
    }
  }

  Ghost.prototype.boundingCircle = function() {
     return {
		 cx: this.currentX + SIZE/2,
		 cy: this.currentY + SIZE/2,
		 radius: SIZE/2
	  }
   }

   Ghost.prototype.collide = function(otherEntity) {
     if (otherEntity.type == "player" && state == ATTACKING) {
       var rand = Math.random();
       //10% chance to haunt the player, killing the ghost and dealing a
       //large amount of damage to the player
       if (rand > .90) { //10% chance to haunt the player
         //There is no way to remove the entity from entity manager
         //without changing the function, which will then not match
         //other students collide function, so I have set his
         //health to 0 for now, and damage the player
         health = 0;//remove the ghost from game
         otherEntity.health -= 30;

       }

     }
   }

  return Ghost;

}());
