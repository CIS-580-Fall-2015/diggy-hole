

module.exports = (function() {
  var Entity = require('./entity.js'),
    Animation = require('./animation.js');

  /* The following are player States (Swimming is not implemented) */
  const STANDING = 0;
  const WALKING = 1;
  const JUMPING = 2;
  const DIGGING = 3;
  const FALLING = 4;
  const SWIMMING = 5;
  
  
  
  // The Sprite Size
  //const SIZE = 64;
	const trollIdleWidth = 319;
	const trollIdleHeight = 92;
	const trollLeftWidth = 312;
	const trollLeftHeight = 96;
	const trollRightWidth = 316;
	const trollRightHeight = 91;
	
  // Movement constants
  const SPEED = 150;
  const GRAVITY = -250;
  const JUMP_VELOCITY = -600;
  
  var trollRight = new Image();
  trollRight.src = 'trollRight.png';
  
  var trollLeft = new Image();
  trollLeft.src = 'trollLeft.png';
  
  var trollIdle = new Image();
  trollIdle.src = 'trollIdle.png';
  
  function Troll(locationX, locationY, layerIndex) {
    this.state = STANDING;
    this.layerIndex = layerIndex;
    this.currentX = locationX;
    this.currentY = locationY;
    this.nextX = 0;
    this.nextY = 0;
    this.currentTileIndex = 0;
    this.nextTileIndex = 0;
    this.constSpeed = 15;
    this.gravity = 0.5;
    this.angle = 0;
    this.xSpeed = 10;
    this.ySpeed = 15;
    this.isLeft = false;
    this.type = "troll";

    //The animations
    this.animations = {
      left: [],
      right: [],
	  idle: []
    };


	this.animations.right[WALKING] = new Animation(trollRight, trollRightWidth, trollRightHeight, 0, 0, 4);
	this.animations.left[WALKING] = new Animation(trollLeft, trollLeftWidth, trollLeftHeight, 0, 0, 4);
	this.animations.idle[STANDING] = new Animation(trollIdle, trollIdleWidt, trollIdleHeight, 0, 0, 4);
  }
  
  Troll.prototype = new Entity();
  
    Troll.prototype.onGround = function(tilemap) {
    var box = this.boundingBox(),
      tileX = Math.floor((box.left + (SIZE / 2)) / 64),
      tileY = Math.floor(box.bottom / 64),
      tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    // find the tile we are standing on.
    return (tile && tile.data.solid) ? true : false;
  };
  Troll.prototype.moveLeft = function(distance, tilemap) {
    this.currentX -= distance;
    var box = this.boundingBox(),
      tileX = Math.floor(box.left / 64),
      tileY = Math.floor(box.bottom / 64) - 1,
      tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid)
      this.currentX = (Math.floor(this.currentX / 64) + 1) * 64;
  };
  
  Troll.prototype.moveRight = function(distance, tilemap) {
    this.currentX += distance;
    var box = this.boundingBox(),
      tileX = Math.floor(box.right / 64),
      tileY = Math.floor(box.bottom / 64) - 1,
      tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid)
      this.currentX = (Math.ceil(this.currentX/64)-1) * 64;
  };
  
    Player.prototype.update = function(elapsedTime, tilemap) {
    var sprite = this;

    // The "with" keyword allows us to change the
    // current scope, i.e. 'this' becomes our
    // inputManager
    with(this.inputManager) {

      // Process player state
      switch (sprite.state) {
        case STANDING:
			break;
        case WALKING:
          // If there is no ground underneath, fall
          if (!sprite.onGround(tilemap)) {
            sprite.state = FALLING;
            sprite.velocityY = 0;
          } 
		  else {
				if(sprite.isLeft) {
					sprite.moveLeft(SPEED, tilemap);
				}
				else {
					sprite.moveRight(SPEED, tilemap);
				}
		  }
          break;
        case DIGGING:
          break;
        case JUMPING:
          break;
        case FALLING:
          sprite.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
          sprite.currentY += sprite.velocityY * elapsedTime;
          if (sprite.onGround(tilemap)) {
            sprite.state = STANDING;
            sprite.currentY = 64 * Math.floor(sprite.currentY / 64);
          } 
          break;
        case SWIMMING:
          // NOT IMPLEMENTED YET
      }

      // Swap input buffers
      swapBuffers();
    }

    // Update animation
    if (this.isLeft)
      this.animations.left[this.state].update(elapsedTime);
    else
      this.animations.right[this.state].update(elapsedTime);

  };
  
    Troll.prototype.render = function(ctx, debug) {
    if (this.isLeft)
      this.animations.left[this.state].render(ctx, this.currentX, this.currentY);
    else
      this.animations.right[this.state].render(ctx, this.currentX, this.currentY);

    if (debug) renderDebug(this, ctx);
  };
  
    function renderDebug(Troll, ctx) {
    var bounds = Troll.boundingBox();
    ctx.save();

    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(bounds.left, bounds.top);
    ctx.lineTo(bounds.right, bounds.top);
    ctx.lineTo(bounds.right, bounds.bottom);
    ctx.lineTo(bounds.left, bounds.bottom);
    ctx.closePath();
    ctx.stroke();

    var tileX = 64 * Math.floor((bounds.left + (SIZE / 2)) / 64),
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
  
    Troll.prototype.boundingBox = function() {
    return {
      left: this.currentX,
      top: this.currentY,
      right: this.currentX + SIZE,
      bottom: this.currentY + SIZE
    };
  };
  
    Player.prototype.boundingCircle = function() {
    return {
      cx: this.currentX + SIZE / 2,
      cy: this.currentY + SIZE / 2,
      radius: SIZE / 2
    };
  };
}());
