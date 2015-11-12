/* Base class for all game entities,
 * implemented as a common JS module
 * Authors:
 * - Austin Boerger
 * - Nathan Bean 
 */
module.exports = (function(){
  var Entity = require('./entity.js'),
	  Animation = require('./animation.js');
	  
  // SLime States
  const IDLE = 0;
  const MOVING = 1;
  const FALLING = 2;
  
   const SPEED = 90;
   const GRAVITY = -250;
   const JUMP_VELOCITY = -600;
   const IDLE_COUNT = 50;
  
  // Slime Size
  const SIZE = 64;
  
  // Slime Sprite
  var slimage = new Image();
  slimage.src = 'img/slime.png';
  
  /* Constructor
   * Generally speaking, you'll want to set
   * the X and Y position, as well as the layerX
   * of the map the entity is located on
   */
  function Slime(locationX, locationY, layerIndex){
    this.type = "Slime";
	this.currentX = locationX;
    this.curentY = locationY;
    this.layerIndex = layerIndex;
	this.state = MOVING;
	this.score = 100;
	
	this.animations = {
		left: [],
		right: []
	}
	
	//Slime Moving Left
	this.animation.left[MOVING] = new Animation(slimage, SIZE, SIZE, 0, SIZE, 3);
	
	//Slime Moving Right
	this.animation.right[MOVING] = new Animation(slimage, SIZE, SIZE, 0, SIZE*2, 3);
	
	//Slime Idling
	this.animation.left[IDLE] = new Animation(slimage, SIZE, SIZE, 0, 0, 3);
	this.animation.right[IDLE] = new Animation(slimage, SIZE, SIZE, 0, 0, 3);
	
	//Slime falling
	this.animation.left[FALLING] = new Animation(slimage, SIZE, SIZE, 0, 0, 3);
	this.animation.right[FALLING] = new Animation(slimage, SIZE, SIZE, 0, 0, 3);
  }
  
  Slime.prototype = new Entity();
  
  
  // Determines if the Slime is on the ground
  Slime.prototype.onGround = function(tilemap) {
    var box = this.boundingBox(),
      tileX = Math.floor((box.left + (SIZE / 2)) / 64),
      tileY = Math.floor(box.bottom / 64),
      tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    // find the tile we are standing on.
    return (tile && tile.data.solid) ? true : false;
  };
  
  // Moves the Slime to the left, colliding with solid tiles
  Slime.prototype.moveLeft = function(distance, tilemap) {
    this.currentX -= distance;
    var box = this.boundingBox(),
      tileX = Math.floor(box.left / 64),
      tileY = Math.floor(box.bottom / 64) - 1,
      tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid){
      this.currentX = (Math.floor(this.currentX / 64) + 1) * 64;
	  return true;
	}
	return false;
  };

  // Moves the Slime to the right, colliding with solid tiles
  Slime.prototype.moveRight = function(distance, tilemap) {
    this.currentX += distance;
    var box = this.boundingBox(),
      tileX = Math.floor(box.right / 64),
      tileY = Math.floor(box.bottom / 64) - 1,
      tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid){
      this.currentX = (Math.ceil(this.currentX/64)-1) * 64;
  	  return true;
	}
	return false;
  };
  
  /* Update function
   * parameters:
   * - elapsedTime is the time that has passed since the
   *   previous frame 
   * - tilemap is the currently loaded tilemap; you'll 
   *   probably want to call its tileAt and setTile methods.
   * - entityManager is the game's entity manager, and
   *   keeps track of where all game entities are.
   *   you can call its query functions
   */
  Slime.prototype.update = function(elapsedTime, tilemap, entityManager) {
      // TODO: Determine what your entity will do
	  var sprite = this;
	  var i = 0;
	  switch(sprite.state){
		case IDLE:
		  if(sprite.onGround(tilemap)){
			  if(i < IDLE_COUNT){
				i++;}
			  else{
				  sprite.state = MOVING;
			  }
		  }else{
			  sprite.state = FALLING;
			  sprite.velocityY = 0;
		  }
		  break;
		case MOVING:
			if(!sprite.onGround(tilemap)){
				sprite.state = FALLING;
				sprite.velocityY = 0;
			  }else{
				if(sprite.isLeft){
				  sprite.moveLeft(elapsedTime * SPEED, tilemap);
				}else{
				  sprite.moveRight(elapsedTime * SPEED, tilemap);
				}  
			  }
		case FALLING:
		  sprite.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
          sprite.currentY += sprite.velocityY * elapsedTime;
          if(sprite.onGround(tilemap)) {
            sprite.state = IDLE;
            sprite.currentY = 64 * Math.floor(sprite.currentY / 64);
		  }
		  break;
	  }
	  
	  // Update Slimation
	  if(sprite.isLeft)
		sprite.animations.left[sprite.state].update(elapsedTime);
	  else
		sprite.animations.right[sprite.state].update(elapsedTime);
  }
  
  /* Render function
   * parameters:
   *  - context is the rendering context.  It may be transformed
   *    to account for the camera 
   */
   Slime.prototype.render = function(ctx, debug) {
     // TODO: Draw your entity sprite
	 if(this.isLeft)
      this.animations.left[MOVING].render(ctx, this.currentX, this.currentY);
    else
      this.animations.right[MOVING].render(ctx, this.currentX, this.currentY);
  
	 if(debug) renderDebug(this, ctx);
   }
   
   // Draw debugging visual elements
  function renderDebug(Slime, ctx) {
    var bounds = Slime.boundingBox();
    ctx.save();

    // Draw Slime bounding box
    ctx.strokeStyle = "blue";
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
    ctx.strokeStyle = "green";
    ctx.beginPath();
    ctx.moveTo(tileX, tileY);
    ctx.lineTo(tileX + 64, tileY);
    ctx.lineTo(tileX + 64, tileY + 64);
    ctx.lineTo(tileX, tileY + 64);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  }   
   
   /* Collide function
    * This function is called by the entityManager when it determines
    * a possible collision.
    * parameters:
    * - otherEntity is the entity this enemy collided with
    *   You will likely want to use 
    *     'otherEntity instanceof <Type>' 
    *   to determine what type it is to know what to 
    *   do with it.
    */
   Slime.prototype.collide = function(otherEntity) {
		if(otherEntity.type = 'player'){
			
		}
   }
   
   /* BoundingBox function
    * This function returns an axis-aligned bounding
    * box, i.e {top: 0, left: 0, right: 20, bottom: 50}
    * the box should contain your entity or at least the
    * part that can be collided with.
    */
   Slime.prototype.boundingBox = function() {
     // Return a bounding box for your entity
	 return{
		 left: this.currentX,
		 top: this.currentX,
		 right: this.currentX + SIZE,
		 bottom: this.currentY + SIZE
	 }
   }
   
   /* BoundingCircle function
    * This function returns a bounding circle, i.e.
    * {cx: 0, cy: 0, radius: 20}
    * the circle should contain your entity or at 
    * least the part that can be collided with.
    */
   Slime.prototype.boundingCircle = function() {
     // Return a bounding circle for your entity
	 return {
		 cx: this.currentX + SIZE/2,
		 cy: this.currentY + SIZE/2,
		 radius: SIZE/2
	 }
   }
   
   return Slime;
  
}());