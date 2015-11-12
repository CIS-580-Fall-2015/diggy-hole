/* Base class for all game entities,
 * implemented as a common JS module
 * Authors:
 * - Nathan Bean 
 */
module.exports = (function(){
      var Entity = require('./entity.js'),
	    Animation = require('./animation.js'),
		entityManager = require('./entity-manager.js');
  /* Constructor
   * Generally speaking, you'll want to set
   * the X and Y position, as well as the layerX
   * of the map the entity is located on
   */
   const IDLE = 0;
   const FALLING = 1;
   const WALKING = 2;
   const SIZE_Y = 64;
   const SIZE_X = 45;
   const SPEED = 150;
   const GRAVITY = -250;
   
  function GoblinSorcerer(locationX, locationY, mapLayer){
	this.type = "GoblinSorcerer";
    this.x = locationX;
    this.y = locationY;
    this.mapLayer = mapLayer;
	this.state = WALKING;
	this.xVelocity = 10;
	this.yVelocity = 0;
	this.moveAwaySpeed = 100;
	this.moveTowardSpeed = 160;
	this.movingLeft = false;
	this.counter = 0;
	this.leavesLava = true;
	
	this.animations = {
      left: [],
      right: [],
    }
	
	 var GoblinSorcerer = new Image();
	 GoblinSorcerer.src = 'img/GoblinSorcerer.png';
	 
	 this.animations.right[WALKING] = new Animation(GoblinSorcerer, SIZE_X, SIZE_Y, 0,0,20);
	 this.animations.left[WALKING] = new Animation(GoblinSorcerer, SIZE_X, SIZE_Y, 0,0,20);
  }
  
  
	GoblinSorcerer.prototype = new Entity();
 
	GoblinSorcerer.prototype.isGrounded = function(tilemap) {
    var box = this.boundingBox(),
      tileX = Math.floor((box.left + (SIZE / 2)) / 64),
      tileY = Math.floor(box.bottom / 64),
      tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    // find the tile we are standing on.
    return (tile && tile.data.solid) ? true : false;
  };

  // Moves the player to the left, colliding with solid tiles
  GoblinSorcerer.prototype.moveLeft = function(distance, tilemap) {
    this.currentX -= distance;
    var box = this.boundingBox(),
      tileX = Math.floor(box.left / 64),
      tileY = Math.floor(box.bottom / 64) - 1,
      tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid)
      this.currentX = (Math.floor(this.currentX / 64) + 1) * 64;
  };

  // Moves the player to the right, colliding with solid tiles
  GoblinSorcerer.prototype.moveRight = function(distance, tilemap) {
    this.currentX += distance;
    var box = this.boundingBox(),
      tileX = Math.floor(box.right / 64),
      tileY = Math.floor(box.bottom / 64) - 1,
      tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid)
      this.currentX = (Math.ceil(this.currentX/64)-1) * 64;
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
  GoblinSorcerer.prototype.update = function(elapsedTime, tilemap, entityManager) {
      var 	sprite = this,
			tileX = Math.floor(this.boundingBox.right/64),
			tileY = Math.floor(this.boundingBox.bottom/64),
			player = entityManager.getEntity(0);
			
	  switch(sprite.state){
		  case IDLE:
			if(!sprite.isGrounded(tileMap))
			{
				sprite.state = FALLING;
				sprite.yVelocity = 0;
			}
			else if(Math.abs(player.currentX - sprite.currentX) < 512)
			{
				sprite.state = WALKING;
			}
			break;
		  case FALLING:
			if(sprite.isGrounded(tileMap))
			{
				sprite.state = IDLE;
				sprite.y = 64* Math.floor(sprite.y/64);
			}
			sprite.yVelocity += sprite.gravity * elapsedTime;
			sprite.y += sprite.yVelocity * elapsedTime;
			break;
		  case WALKING:
			if(!sprite.isGrounded(tileMap))
			{
				sprite.state = FALLING;
				sprite.yVelocity = 0;
			}
			else if(player.moveLeft && player.state == WALKING)
			{
				sprite.movingLeft = true;
				sprite.state = WALKING;
				//Determine if we are moving towards or away from the player
				if(player.currentX > sprite.x)//moving away from player
				{
					sprite.moveLeft(elapsedTime*sprite.moveAwaySpeed, tilemap);
				}
				else
				{
					sprite.moveLeft(elapsedTime*sprite.moveTowardSpeed, tilemap);
				}
				if(this.counter > 120 && this.leavesLava)
				{
					this.counter = 0;
					tilemap.setTileAt(13, tileX+1, tileY, mapLayer)
				}
			}
			else if(player.moveRight && player.state == WALKING)
			{
				sprite.movingLeft = true;
				sprite.state = WALKING;
				//Determine if we are moving towards or away from the player
				if(player.currentX > sprite.x)//moving away from player
				{
					sprite.moveRight(elapsedTime*sprite.moveTowardSpeed, tilemap);
				}
				else
				{
					sprite.moveRight(elapsedTime*sprite.moveAwaySpeed, tilemap);
				}
				if(this.leavesLava && this.counter > 120)
				{
					this.counter = 0;
					tilemap.setTileAt(13, tileX-1, tileY, mapLayer)
				}
			}
			this.counter++;
			
			break;
	  }
  
  /* Render function
   * parameters:
   *  - context is the rendering context.  It may be transformed
   *    to account for the camera 
   */
   GoblinSorcerer.prototype.render = function(context) {
     // TODO: Draw your entity sprite
	 if(this.isLeft)
      this.animations.left[this.state].render(ctx, this.currentX, this.currentY);
    else
      this.animations.right[this.state].render(ctx, this.currentX, this.currentY);

    if(this.state != DONE){
		if(debug) renderDebug(this, ctx);
	}
   }
   
   function renderDebug(entity, ctx) {
    var bounds = entity.boundingBox();
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
   GoblinSorcerer.prototype.collide = function(otherEntity) {
	   player =  entityManager.getEntity(0);
	   if (otherEntity.type == player.type)
	   {
		   this.leavesLava = false;
	   }
   }
   
   /* BoundingBox function
    * This function returns an axis-aligned bounding
    * box, i.e {top: 0, left: 0, right: 20, bottom: 50}
    * the box should contain your entity or at least the
    * part that can be collided with.
    */
   GoblinSorcerer.prototype.boundingBox = function() {
     // Return a bounding box for your entity
	 return {
      left: this.x,
      top: this.y,
      right: this.x + SIZE_X,
      bottom: this.y + SIZE_Y
    };
   }
   
   /* BoundingCircle function
    * This function returns a bounding circle, i.e.
    * {cx: 0, cy: 0, radius: 20}
    * the circle should contain your entity or at 
    * least the part that can be collided with.
    */
   GoblinSorcerer.prototype.boundingCircle = function() {
     // Return a bounding circle for your entity
	 return {
      cx: this.currentX + SIZE_X / 2,
      cy: this.currentY + SIZE_Y / 2,
      radius: SIZE / 2
    };
  };
   }
   
   return GoblinSorcerer;
  
}());