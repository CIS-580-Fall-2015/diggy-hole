/* Player module
 * Authors:
 * - Wyatt Watson
 * - Nathan Bean
 */
module.exports = (function(){
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
  const SIZE = 64;

  // Movement constants
  const SPEED = 150;
  const GRAVITY = -0.5;
  
  //The Right facing dwarf spritesheet
  var dwarfRight = new Image();
  dwarfRight.src = 'DwarfAnimatedRight.png';

  //The left facing dwarf spritesheet
  var dwarfLeft = new Image();
  dwarfLeft.src = "DwarfAnimatedLeft.png";

  //The Player constructor
  function Player(locationX, locationY, layerIndex, inputManager) {
    this.inputManager = inputManager
    this.state = WALKING; 
    this.dug = false; 
    this.downPressed = false;
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
    
    //The animations
    this.animations = {
      left: [],
      right: [],
    }
    
    //The right-facing animations
    this.animations.right[STANDING] = new Animation(dwarfRight, SIZE, SIZE, SIZE*2, SIZE);
    this.animations.right[WALKING] = new Animation(dwarfRight, SIZE, SIZE, 0, 0, 4);
    this.animations.right[JUMPING] = new Animation(dwarfRight, SIZE, SIZE, SIZE*3, 0);
    this.animations.right[DIGGING] = new Animation(dwarfRight, SIZE, SIZE, 0, SIZE*2, 4);
    this.animations.right[FALLING] = new Animation(dwarfRight, SIZE, SIZE, SIZE, SIZE);
    this.animations.right[SWIMMING] = new Animation(dwarfRight, SIZE, SIZE, 0, 0, 4);
    
    //The left-facing animations
    this.animations.left[STANDING] = new Animation(dwarfLeft, SIZE, SIZE, SIZE*2, SIZE);
    this.animations.left[WALKING] = new Animation(dwarfLeft, SIZE, SIZE, 0, 0, 4);
    this.animations.left[JUMPING] = new Animation(dwarfLeft, SIZE, SIZE, SIZE*3, 0);
    this.animations.left[DIGGING] = new Animation(dwarfLeft, SIZE, SIZE, 0, SIZE*2, 4);
    this.animations.left[FALLING] = new Animation(dwarfLeft, SIZE, SIZE, SIZE, SIZE);
    this.animations.left[SWIMMING] = new Animation(dwarfLeft, SIZE, SIZE, 0, 0, 4);
  }
  
  // Player inherits from Entity
  Player.prototype = new Entity();
  
  Player.prototype.onGround = function(tilemap) {
    var box = this.boundingBox(),
        tileX = Math.floor((box.left + (SIZE/2))/64),
        tileY = Math.floor(box.bottom / 64) + 1,
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);   
    console.log(tile);
    // find the tile we are standing on.
    return (tile && tile.solid);
  }
  
  
  // Player update function
  Player.prototype.update = function(elapsedTime, tilemap) {
    var sprite = this;
    
    // The "with" keyword allows us to change the
    // current scope, i.e. 'this' becomes our 
    // inputManager
    with (this.inputManager) {
    
      // Process player state
      switch(sprite.state) {
        case STANDING:
        case WALKING:
          // If there is no ground underneath, fall
          if(sprite.onGround(tilemap)) {
            sprite.state = FALLING;
          } else {
            if(isKeyDown(commands.DIG)) {
              sprite.state = DIGGING;
            }
            else if(isKeyDown(commands.UP)) {
              sprite.state = JUMPING;
              sprite.velocityY = SPEED * 50;
            }
            else if(isKeyDown(commands.LEFT)) {
              sprite.isLeft = true;
              sprite.state = WALKING;
              sprite.currentX -= elapsedTime * SPEED;
            }
            else if(isKeyDown(commands.RIGHT)) {
              sprite.isLeft = false;
              sprite.state = WALKING;
              sprite.currentX += elapsedTime * SPEED;
            }
            else {
              sprite.state = STANDING;
            }
          }
          break;
        case DIGGING:
        case JUMPING:
          sprite.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
          sprite.currentY -= sprite.velocityY * elapsedTime;
          if(sprite.velocityY < 0) {
            sprite.state = FALLING;
          }
          if(isKeyDown(commands.LEFT)) {
            sprite.isLeft = true;
            sprite.currentX -= elapsedTime * SPEED;
          }
          if(isKeyDown(commands.RIGHT)) {
            sprite.isLeft = true;
            sprite.currentX += elapsedTime * SPEED;
          }
          break;
        case FALLING:
          sprite.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
          sprite.currentY -= sprite.velocityY * elapsedTime;
          if(sprite.onGround(tilemap)) {
            sprite.state = STANDING;
          }
          else if(isKeyDown(commands.LEFT)) {
            sprite.isLeft = true;
            sprite.currentX -= elapsedTime * SPEED;
          }
          else if(isKeyDown(commands.RIGHT)) {
            sprite.isLeft = false;
            sprite.currentX += elapsedTime * SPEED;
          }
          break;
        case SWIMMING:
          // NOT IMPLEMENTED YET
      }
      
      // Swap input buffers
      swapBuffers();
    }
      
    //console.log(this.isLeft);
       
    // Update animation
    if(this.isLeft)
      this.animations.left[this.state].update(elapsedTime);
    else
      this.animations.right[this.state].update(elapsedTime);
    
  }
  
  // Player Render Function
  Player.prototype.render = function(ctx, debug) {
    // Draw the player (and the correct animation)
    if(this.isLeft)
      this.animations.left[this.state].render(ctx, this.currentX, this.currentY);
    else
      this.animations.right[this.state].render(ctx, this.currentX, this.currentY);
    
    if(debug) {
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
    }
  }
  
  // Player BoundingBox Function
  Player.prototype.boundingBox = function() {
    return {
      left: this.currentX,
      top: this.currentY,
      right: this.currentX + SIZE,
      bottom: this.currentY + SIZE
    }
  }
  
  return Player;

}());