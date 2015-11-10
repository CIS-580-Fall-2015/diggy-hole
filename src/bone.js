/* Class of the Barrel Skeleton entity
 *
 * Author:
 * - Matej Petrlik 
 */
 
 
module.exports = (function(){
  var Entity = require('./entity.js'),
		Player = require('./player.js'),
      Animation = require('./animation.js');
  
  
  const DEBUG = true;
  
  const PROJECTILE = 0;
  
  // The Sprite Size
  const SIZE = 64;

  // Movement constants
  
    var boneLeft = new Image();
  boneLeft.src = 'img/BoneLeft.png';
  

  //The Bone constructor
  function Bone(locationX, locationY, layerIndex, isLeft) {
    this.layerIndex = layerIndex;
    this.currentX = locationX; 
    this.currentY = locationY; 
    this.xSpeed = 200; 
    this.isLeft = isLeft;
	
	this.type = "Bone";
	
	this.range = 5*SIZE;
	this.enabled = true;
	this.distTraveled = 0;
	this.size = SIZE/2;
	this.playerHit = false;
	
    
    //The animations
    this.animations = {
      left: [],
      right: [],
    }
    
    //The right-facing animations
	this.animations.right[PROJECTILE] = new Animation(boneLeft, SIZE, SIZE, 0, 0, 8);
    
    //The left-facing animations
	this.animations.left[PROJECTILE] = new Animation(boneLeft, SIZE, SIZE, 0, 0, 8);
  }
  
  // Bone inherits from Entity
	Bone.prototype = new Entity();
  
	Bone.prototype.onGround = function(tilemap) {
    var box = this.boundingBox(),
        tileX = Math.floor((box.left + (SIZE/2))/64),
        tileY = Math.floor(box.bottom / 64),
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);   
    return (tile && tile.data.solid) ? true : false;
  }
  
  

  Bone.prototype.update = function(elapsedTime, tilemap, entityManager) {
    
	var entities = entityManager.queryRadius(this.currentX, this.currentY, this.range);
	  
	// Update projectile
	if(this.enabled){
			if(this.isLeft){
				this.currentX -= elapsedTime * this.xSpeed;
			} else {
				this.currentX += elapsedTime * this.xSpeed;
			}
			this.distTraveled += elapsedTime * this.xSpeed;	
			
			
			if(this.distTraveled >= this.range){
				this.distTraveled = 0;
				this.enabled = false;
			}
			
			if(this.isLeft){
		var box = this.boundingBox(),
        tileX = Math.floor(box.left/64),
        tileY = Math.floor(box.bottom / 64) - 1,
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid) 
      this.enabled = false;

			
		
	} else {
		var box = this.boundingBox(),
        tileX = Math.floor(box.right/64),
        tileY = Math.floor(box.bottom / 64) - 1,
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid)
      this.enabled = false;
	}  
       
	} 
	
	// Update projectile animation
	if(this.isLeft){
		this.animations.left[PROJECTILE].update(elapsedTime);
	} else {
		this.animations.right[PROJECTILE].update(elapsedTime);
	}
	
	if(!this.enabled){
		entityManager.remove(this);
	}
  }
  
  Bone.prototype.render = function(ctx, debug) {
	if(this.enabled){
		if(this.isLeft){
			this.animations.left[PROJECTILE].render(ctx, this.currentX, this.currentY);
		} else {
			this.animations.right[PROJECTILE].render(ctx, this.currentX, this.currentY);
		}
	}
	
	   if(debug) renderDebug(this, ctx);
  }
  
  // Draw debugging visual elements
  function renderDebug(bone, ctx) {
    var bounds = bone.boundingBox();
    ctx.save();
    
    // Draw bone bounding box
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
  
  
  Bone.prototype.boundingBox = function() {
    return {
      left: this.currentX,
      top: this.currentY,
      right: this.currentX + this.size*2,
      bottom: this.currentY + this.size*2
    }
  }
  
  
    Bone.prototype.boundingCircle = function() {
     return {
		 cx: this.currentX + this.size/2,
		 cy: this.currentY + this.size/2,
		 radius: this.size/2
	 }
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
   Bone.prototype.collide = function(otherEntity) {
	   if( otherEntity instanceof Player){
		   this.enabled = false;
		   if(DEBUG){
		   console.log("Player hit by bone");	 			   
		   } 
	   }
   }
   
   
  
  return Bone;

}());

