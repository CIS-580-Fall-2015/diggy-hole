/* Wolf module
 * Implements the entity pattern and provides
 * the DiggyHole Wolf info.
 * Authors:
 * Ryan Ward
 */
module.exports = (function(){
  var Entity = require('./entity.js'),
      Animation = require('./animation.js');
  
  /* The following are Wolf States  */
  const IDLE = 0;
  const RIGHT = 1;
  const LEFT = 2;
  const SMELL = 3;
  const AGRO = 4;
  const FALLING = 5;

  // The Sprite HEIGHT
  const HEIGHT = 62;
  const WIDTH = 37;

  // Movement constants
  const SPEED = 100;
  const GRAVITY = -250;
  const JUMP_VELOCITY = -600;
  
  //The Right facing wolf spritesheet
  var WolfRight = new Image();
  //WolfRight.src = './img/Wolf_walkright.png';

  //The left facing wolf spritesheet
  var WolfLeft = new Image();
  //WolfLeft.src = "./img/Wolf_walkleft.png";
  
   //The IDLE wolf spritesheet
  var WolfIdle = new Image();
  //WolfIdle.src = "./img/Wolf_idle.png";

  //The Wolf constructor
  function Wolf(locationX, locationY, layerIndex, inputManager) {
	  console.log('WolfCreated');
    this.inputManager = inputManager;
    this.state = RIGHT; 
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
    this.type = "Wolf";
    
    //The animations
    this.animations = {
      left: [],
      right: [],
    }
    
    //The right-facing animations
    this.animations.right[RIGHT] = new Animation(WolfRight, WIDTH, HEIGHT, 0, 0, 8);
    this.animations.right[IDLE] = new Animation(WolfIdle, WIDTH, HEIGHT, 0, 0, 8);
    this.animations.right[FALLING] = new Animation(WolfIdle, WIDTH, HEIGHT, 0, 0, 8);
    this.animations.right[SMELL]= new Animation(WolfIdle, WIDTH, HEIGHT, 0, 0, 8);
    this.animations.right[AGRO] =  new Animation(WolfRight, WIDTH, HEIGHT, 0, 0, 8);
    //this.animations.right[SWIMMING] = new Animation(WolfRight, HEIGHT, HEIGHT, 0, 0, 4);
    
    //The left-facing animations
    this.animations.left[LEFT] = new Animation(WolfLeft, WIDTH, HEIGHT, 0, 0, 8);
    this.animations.left[IDLE] = new Animation(WolfIdle, WIDTH, HEIGHT, 0, 0, 8);
    this.animations.left[FALLING] = new Animation(WolfIdle, WIDTH, HEIGHT, 0, 0, 8);
    this.animations.left[SMELL]= new Animation(WolfIdle, WIDTH, HEIGHT, 0, 0, 8);
    this.animations.left[AGRO] = new Animation(WolfLeft, WIDTH, HEIGHT, 0, 0, 8);
    //this.animations.left[SWIMMING] = new Animation(WolfLeft, HEIGHT, HEIGHT, 0, 0, 4);
  }
  
  // Wolf inherits from Entity
  Wolf.prototype = new Entity();
  
  // Determines if the Wolf is on the ground
  Wolf.prototype.onGround = function(tilemap) {
    var box = this.boundingBox(),
        tileX = Math.floor((box.left + (WIDTH/2))/64),
        tileY = Math.floor(box.bottom / 64),
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);   
    // find the tile we are standing on.
    return (tile && tile.data.solid) ? true : false;
  }
  
  // Moves the Wolf to the left, colliding with solid tiles
  Wolf.prototype.moveLeft = function(distance, tilemap) {
    this.currentX -= distance;
    var box = this.boundingBox(),
        tileX = Math.floor(box.left/64),
        tileY = Math.floor(box.bottom / 64) - 1,
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid) 
      this.currentX = (Math.floor(this.currentX/64) + 1) * 64
  }
  
  // Moves the Wolf to the right, colliding with solid tiles
  Wolf.prototype.moveRight = function(distance, tilemap) {
    this.currentX += distance;
    var box = this.boundingBox(),
        tileX = Math.floor(box.right/64),
        tileY = Math.floor(box.bottom / 64) - 1,
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid)
      this.currentX = (Math.ceil(this.currentX/64)-1) * 64;
  }
  
  /* Wolf update function
   * arguments:
   * - elapsedTime, the time that has passed 
   *   between this and the last frame.
   * - tilemap, the tilemap that corresponds to
   *   the current game world.
   */
  Wolf.prototype.update = function(elapsedTime, tilemap, entityManager) {
    var sprite = this;
    
    // The "with" keyword allows us to change the
    // current scope, i.e. 'this' becomes our 
    // inputManager
    //with (this.inputManager) {
    
      // Process Wolf state
       switch(sprite.state) {
       case RIGHT:
          // If there is no ground underneath, fall
          if(!sprite.onGround(tilemap)) {
            sprite.state = FALLING;
            sprite.velocityY = 0;
          } else {
              sprite.isLeft = false;
              sprite.moveRight(elapsedTime * SPEED, tilemap);
			  //var i = Math.floor((Math.random() * 100) + 1);
			  //if(i < 50) sprite.state = RIGHT;
			  //else if( i < 75) sprite.state = LEFT;
			  //else if( i < 100) sprite.sate = SMELL;
            }
          break; 
		/*case LEFT:
          // If there is no ground underneath, fall
          if(!sprite.onGround(tilemap)) {
            sprite.state = FALLING;
            sprite.velocityY = 0;
          } else {
              sprite.isLeft = true;
              sprite.moveLeft(elapsedTime * SPEED, tilemap);
			  var i = Math.floor((Math.random() * 100) + 1);
			  if(i < 50) sprite.state = LEFT;
			  else if( i < 75) sprite.state = RIGHT;
			  else if( i < 100) sprite.sate = SMELL;
            }
         break; */
		case FALLING:
			sprite.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
			sprite.currentY += sprite.velocityY * elapsedTime;
			if(sprite.onGround(tilemap)) {
				sprite.isLeft = false;
				sprite.state = RIGHT;
				sprite.currentY = 64 * Math.floor(sprite.currentY / 64);
			}
			break;
          }
       
    // Update animation
    if(this.isLeft)
      this.animations.left[this.state].update(elapsedTime);
    else
      this.animations.right[this.state].update(elapsedTime);
    
  }
  
  /* Wolf Render Function
   * arguments:
   * - ctx, the rendering context
   * - debug, a flag that indicates turning on
   * visual debugging
   */
  Wolf.prototype.render = function(ctx, debug) {
    // Draw the Wolf (and the correct animation)
    if(this.isLeft)
      this.animations.left[this.state].render(ctx, this.currentX, this.currentY);
    else
      this.animations.right[this.state].render(ctx, this.currentX, this.currentY);
    
    if(debug) renderDebug(this, ctx);
  }
  
  // Draw debugging visual elements
  function renderDebug(Wolf, ctx) {
    var bounds = Wolf.boundingBox();
    ctx.save();
    
    // Draw Wolf bounding box
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(bounds.left, bounds.top);
    ctx.lineTo(bounds.right, bounds.top);
    ctx.lineTo(bounds.right, bounds.bottom);
    ctx.lineTo(bounds.left, bounds.bottom);
    ctx.closePath();
    ctx.stroke();
    
    // Outline tile underfoot
    var tileX = 64 * Math.floor((bounds.left + (WIDTH/2))/64),
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
  
  /* Wolf BoundingBox Function
   * returns: A bounding box representing the Wolf 
   */
  Wolf.prototype.boundingBox = function() {
    return {
      left: this.currentX,
      top: this.currentY,
      right: this.currentX + WIDTH,
      bottom: this.currentY + HEIGHT
    }
  }
  
    Wolf.prototype.boundingCircle =function(){
    return{
      cx: this.currentX + WIDTH/2,
      cy: this.currentY + HEIGHT/2,
      radius: WIDTH/2
    }
  }
  
   Wolf.prototype.collide = function(otherEntity){
      this.state = AGRO;
    }
  return Wolf;

}());
