/* Enemy module
 * Authors:
 * Kien Le
 */
module.exports = (function(){
  var Entity = require('./entity.js'),
      Animation = require('./animation.js');

  /* The following are enemy States */
  const STANDING = 0;
  const WALKING = 1;
  const FALLING = 2;
  const ATTACKING = 3;

  // The Sprite Size
  const SIZE = 64;

  // Movement constants
  const SPEED = 100;
  const GRAVITY = -250;
  const JUMP_VELOCITY = -600;

  var ratIdleRight = new Image();
  ratIdleRight.src = 'img/ratIdleRight.png';

  var ratIdleLeft = new Image();
  ratIdleLeft.src = 'img/ratIdleLeft.png';

  var ratRight = new Image();
  ratRight.src = 'img/ratRight2.png';

  var ratLeft = new Image();
  ratLeft.src = "img/ratLeft2.png";

  //The enemy constructor
  function Rat(locationX, locationY, layerIndex)
  {
    this.state = WALKING;
    this.layerIndex = layerIndex;
    this.currentX = locationX;
    this.currentY = locationY;
    this.nextX = 0;
    this.nextY = 0;
    this.currentTileIndex = 0;
    this.nextTileIndex = 0;
    this.constSpeed = 15;
    this.gravity = .5;
    this.angle = 0;
    this.xSpeed = 10;
    this.ySpeed = 15;
    this.isLeft = false;
	this.type = "rat";

    //The animations
    this.animations = {
      left: [],
      right: [],
    }

    //The right-facing animations
    this.animations.right[STANDING] = new Animation(ratIdleRight, SIZE, SIZE, SIZE*2, SIZE);
    this.animations.right[WALKING] = new Animation(ratRight, SIZE, SIZE, 0, 0, 8);
    this.animations.right[FALLING] = new Animation(ratIdleRight, SIZE, SIZE, 0, 0, 8);
	this.animations.right[ATTACKING] = new Animation(ratRight, SIZE, SIZE, 0, 0, 8);

    //The left-facing animations
    this.animations.left[STANDING] = new Animation(ratIdleLeft, SIZE, SIZE, SIZE*2, SIZE);
    this.animations.left[WALKING] = new Animation(ratLeft, SIZE, SIZE, 0, 0, 8);
    this.animations.left[FALLING] = new Animation(ratIdleLeft, SIZE, SIZE, 0, 0, 8);
	this.animations.left[ATTACKING] = new Animation(ratLeft, SIZE, SIZE, 0, 0, 8);
  }

  // Player inherits from Entity
  Rat.prototype = new Entity();

  // Determines if the player is on the ground
  Rat.prototype.onGround = function(tilemap)
  {
    var box = this.boundingBox(),
        tileX = Math.floor((box.left + (SIZE/2))/64),
        tileY = Math.floor(box.bottom / 64),
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    // find the tile we are standing on.
    return (tile && tile.data.solid) ? true : false;
  }

  Rat.prototype.checkLeft = function(tilemap)
  {
    var box = this.boundingBox(),
        tileX = Math.floor(box.left/64),
        tileY = Math.floor(box.bottom / 64) - 1,
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    return (tile && tile.data.solid) ? true : false;
  }

  Rat.prototype.checkRight = function(tilemap)
  {
    var box = this.boundingBox(),
        tileX = Math.floor(box.right/64),
        tileY = Math.floor(box.bottom / 64) - 1,
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    return (tile && tile.data.solid) ? true : false;
  }

  // Moves the enemy to the left, colliding with solid tiles
  Rat.prototype.moveLeft = function(distance, tilemap)
  {
    this.currentX -= distance;
    var box = this.boundingBox(),
        tileX = Math.floor(box.left/64),
        tileY = Math.floor(box.bottom / 64) - 1,
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid)
      this.currentX = (Math.floor(this.currentX/64) + 1) * 64
  }

  // Moves the enemy to the right, colliding with solid tiles
  Rat.prototype.moveRight = function(distance, tilemap)
  {
    this.currentX += distance;
    var box = this.boundingBox(),
        tileX = Math.floor(box.right/64),
        tileY = Math.floor(box.bottom / 64) - 1,
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid)
      this.currentX = (Math.ceil(this.currentX/64)-1) * 64;
  }

  /* Enemy update function
   * arguments:
   * - elapsedTime, the time that has passed
   *   between this and the last frame.
   * - tilemap, the tilemap that corresponds to
   *   the current game world.
   */
  Rat.prototype.update = function(elapsedTime, tilemap) {
    var sprite = this;

      // Process enemy state
      switch(sprite.state) {
        case STANDING:
        case WALKING:
          // If there is no ground underneath, fall
          if(!sprite.onGround(tilemap))
		  {
            sprite.state = FALLING;
            sprite.velocityY = 0;
          }
		  else
		  {
            if(sprite.onGround(tilemap) && sprite.checkLeft(tilemap))
			{
              sprite.isLeft = false;
              sprite.state = WALKING;
              sprite.moveRight(elapsedTime * SPEED, tilemap);
            }
            else if(sprite.onGround(tilemap) && sprite.checkRight(tilemap))
			{
              sprite.isLeft = true;
              sprite.state = WALKING;
              sprite.moveLeft(elapsedTime * SPEED, tilemap);
            }
            else
			{
              sprite.state = STANDING;
            }
          }
          break;
        case FALLING:
          sprite.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
          sprite.currentY += sprite.velocityY * elapsedTime;
          if(sprite.onGround(tilemap)) {
            sprite.state = STANDING;
            sprite.currentY = 64 * Math.floor(sprite.currentY / 64);
          }
          break;
        //case SWIMMING:
          // NOT IMPLEMENTED YET
		case ATTACKING:
		  sprite.state = STANDING;
		  //TODO: attack player
      }

    // Update animation
    if(this.isLeft)
      this.animations.left[this.state].update(elapsedTime);
    else
      this.animations.right[this.state].update(elapsedTime);

  }

  /* Enemy Render Function
   * arguments:
   * - ctx, the rendering context
   * - debug, a flag that indicates turning on
   * visual debugging
   */
  Rat.prototype.render = function(ctx, debug) {
    // Draw the enemy (and the correct animation)
    if(this.isLeft)
      this.animations.left[this.state].render(ctx, this.currentX, this.currentY);
    else
      this.animations.right[this.state].render(ctx, this.currentX, this.currentY);

    if(debug) renderDebug(this, ctx);
  }

  // Draw debugging visual elements
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

   Rat.prototype.collide = function (otherEntity)
   {
        if (otherEntity.type != "player") {
            if (this.onGround(tilemap)) {
                this.state = ATTACKING;
            }
        }
    };

  Rat.prototype.boundingBox = function()
  {
    return {
      left: this.currentX,
      top: this.currentY,
      right: this.currentX + SIZE,
      bottom: this.currentY + SIZE
    }
  }

  Rat.prototype.boundingCircle = function ()
  {
        return {
            cx: this.currentX + SIZE / 2,
            cy: this.currentY + SIZE / 2,
            radius: SIZE / 2
        }
    };

  return Rat;

}());
