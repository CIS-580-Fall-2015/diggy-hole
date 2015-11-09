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
  
  
  /* The following are barrel states */
  const IDLE = 0;
  const ATTACKING = 1;
  const ROLLING = 2;
  const FALLING = 3;
  const SWIMMING = 4;
  const DEAD = 5;

  const PROJECTILE = 6;
  
  
  // The Sprite Size
  const SIZE = 64;

  // Movement constants
  const SPEED = 150;
  const GRAVITY = -250;
  const JUMP_VELOCITY = -600;
  const PROJECTILE_SPEED = 200;
  const PROJECTILE_DIST = 3*SIZE;
  
  //The Right facing dwarf spritesheet
  var dwarfRight = new Image();
  dwarfRight.src = 'DwarfAnimatedRight.png';

  //The left facing dwarf spritesheet
  var dwarfLeft = new Image();
  dwarfLeft.src = "DwarfAnimatedLeft.png";
  
    var boneLeft = new Image();
  boneLeft.src = 'BoneLeft.png';
  
  var barrelIdle = new Image();
  barrelIdle.src = 'BarrelIdle.png';
  
    var barrelAttack = new Image();
  barrelAttack.src = 'BarrelAttack.png';

  //The Barrel constructor
  function Barrel(locationX, locationY, layerIndex) {
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
	
	this.type = "BarrelSkeleton";
	
	this.range = 3*SIZE;
	this.attackFrequency = 1.2;
	this.lastAttack = 0;
	this.lives = 5;
	this.projectile = {
		enabled: false,
		size: 10,
		distTraveled: 0,
		x: this.currentX,
		y: this.currentY,
		xSpeed: 0,
		isLeft: true
	}
	
	this.state = IDLE;
	this.playerInRange = false;
	this.attacked = false;
	this.attackedFromLeft = false;
    
    //The animations
    this.animations = {
      left: [],
      right: [],
    }
    
    //The right-facing animations
    this.animations.right[IDLE] = new Animation(barrelIdle, SIZE, SIZE, 0, 0, 15);
	this.animations.right[ATTACKING] = new Animation(barrelAttack, SIZE, SIZE, 0, 0, 12);
    this.animations.right[ROLLING] = new Animation(dwarfRight, SIZE, SIZE, 0, 0, 4);
    this.animations.right[FALLING] = new Animation(barrelIdle, SIZE, SIZE, 0, 0, 15);
    this.animations.right[SWIMMING] = new Animation(barrelIdle, SIZE, SIZE, 0, 0, 15);
	this.animations.right[DEAD] = new Animation(dwarfRight, SIZE, SIZE, SIZE*3, 0);
	this.animations.right[PROJECTILE] = new Animation(boneLeft, SIZE, SIZE, 0, 0, 8);
    
    //The left-facing animations
    this.animations.left[IDLE] = new Animation(barrelIdle, SIZE, SIZE, 0, 0, 15);
	this.animations.left[ATTACKING] = new Animation(barrelAttack, SIZE, SIZE, 0, 0, 12);
    this.animations.left[ROLLING] = new Animation(dwarfLeft, SIZE, SIZE, 0, 0, 4);
    this.animations.left[FALLING] = new Animation(barrelIdle, SIZE, SIZE, 0, 0, 15);
    this.animations.left[SWIMMING] = new Animation(barrelIdle, SIZE, SIZE, 0, 0, 15);
	this.animations.left[DEAD] = new Animation(dwarfLeft, SIZE, SIZE, SIZE*3, 0);
	this.animations.left[PROJECTILE] = new Animation(boneLeft, SIZE, SIZE, 0, 0, 8);
  }
  
  // Barrel inherits from Entity
  Barrel.prototype = new Entity();
  
  // Determines if the barrel is on the ground
  Barrel.prototype.onGround = function(tilemap) {
    var box = this.boundingBox(),
        tileX = Math.floor((box.left + (SIZE/2))/64),
        tileY = Math.floor(box.bottom / 64),
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);   
    // find the tile we are standing on.
    return (tile && tile.data.solid) ? true : false;
  }
  
  // Moves the barrel to the left, colliding with solid tiles
  Barrel.prototype.moveLeft = function(distance, tilemap) {
    this.currentX -= distance;
    var box = this.boundingBox(),
        tileX = Math.floor(box.left/64),
        tileY = Math.floor(box.bottom / 64) - 1,
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid) 
      this.currentX = (Math.floor(this.currentX/64) + 1) * 64
  }
  
  // Moves the barrel to the right, colliding with solid tiles
  Barrel.prototype.moveRight = function(distance, tilemap) {
    this.currentX += distance;
    var box = this.boundingBox(),
        tileX = Math.floor(box.right/64),
        tileY = Math.floor(box.bottom / 64) - 1,
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid)
      this.currentX = (Math.ceil(this.currentX/64)-1) * 64;
  }
  
  /* Barrel update function
   * arguments:
   * - elapsedTime, the time that has passed 
   *   between this and the last frame.
   * - tilemap, the tilemap that corresponds to
   *   the current game world.
   */
  Barrel.prototype.update = function(elapsedTime, tilemap, entityManager) {
    var sprite = this;
    
	var entities = entityManager.queryRadius(this.currentX, this.currentY, this.range);
	this.playerInRange = false;
		for(var i=0; i<entities.length;i++){
			if(entities[i] instanceof Player){
				this.playerInRange = true;
				break;
			}
		}
    
      // Process barrel state
      switch(sprite.state) {
		  
        case IDLE:
			if(!sprite.onGround(tilemap)) {
            sprite.state = FALLING;
            sprite.velocityY = 0;
			if(DEBUG){
				console.log("Barrel state: FALLING");
			}
          } else if(sprite.attacked){
				if(--this.lives<1){
				  sprite.state = DEAD;
				  
				  if(DEBUG){
					console.log("Barrel state: DEAD");
				  }
				}
				  
			  
			if(!sprite.attackedFromLeft) {
              sprite.isLeft = true;
              sprite.state = ROLLING;
              sprite.moveLeft(elapsedTime * SPEED, tilemap);
			  if(DEBUG){
				console.log("Barrel state: ROLLING left");
			}
            }
            else if(sprite.attackedFromLeft) {
              sprite.isLeft = false;
              sprite.state = ROLLING;
              sprite.moveRight(elapsedTime * SPEED, tilemap);
			  
			  if(DEBUG){
				console.log("Barrel state: ROLLING right");
			}
            }
		  }
			else if(sprite.playerInRange){
				this.lastAttack = this.attackFrequency;
				sprite.state = ATTACKING;
				
				if(DEBUG){
				console.log("Barrel state: ATTACKING");
			}
			}
			break;
          
		
		
		case ATTACKING:
			sprite.attack(elapsedTime, entities);
			if(!sprite.onGround(tilemap)) {
            sprite.state = FALLING;
            sprite.velocityY = 0;
          } else if(sprite.attacked){
			if(!sprite.attackedFromLeft) {
              sprite.isLeft = true;
              sprite.state = ROLLING;
              sprite.moveLeft(elapsedTime * SPEED, tilemap);
            }
            else if(sprite.attackedFromLeft) {
              sprite.isLeft = false;
              sprite.state = ROLLING;
              sprite.moveRight(elapsedTime * SPEED, tilemap);
            }
		  }
			else if(!sprite.playerInRange){
				sprite.state = IDLE;
				
				if(DEBUG){
				console.log("Barrel state: IDLE");
			}
			}
          
		break;
		
        case ROLLING:
          // If there is no ground underneath, fall
          if(!sprite.onGround(tilemap)) {
            sprite.state = FALLING;
            sprite.velocityY = 0;
          } else {
			if(playerInRange && !attackedFromLeft) {
              sprite.isLeft = true;
              sprite.state = ROLLING;
              sprite.moveLeft(elapsedTime * SPEED, tilemap);
            }
            else if(playerInRange && attackedFromLeft) {
              sprite.isLeft = false;
              sprite.state = ROLLING;
              sprite.moveRight(elapsedTime * SPEED, tilemap);
            }
            else {
              sprite.state = IDLE;
			  
			  if(DEBUG){
				console.log("Barrel state: IDLE");
			}
            }
          }
          break;
		  
        case FALLING:
          sprite.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
          sprite.currentY += sprite.velocityY * elapsedTime;
          if(sprite.onGround(tilemap)) {
            sprite.state = IDLE;
            sprite.currentY = 64 * Math.floor(sprite.currentY / 64);
			
			if(DEBUG){
				console.log("Barrel state: IDLE");
			}
          }
          break;
		  
		case DEAD:
			
		break;
		  
        case SWIMMING:
          // NOT IMPLEMENTED YET
      }
	  
	// Update projectile
	if(this.projectile.enabled){

			this.projectile.x += elapsedTime * this.projectile.xSpeed;
			this.projectile.distTraveled +=	elapsedTime * this.projectile.xSpeed;	
			var entities = entityManager.queryRadius(this.projectile.x, this.projectile.y, this.projectile.size);
			this.playerHit = false;
			for(var i=0; i<entities.length;i++){
				if(entities[i] instanceof Player){
					this.playerHit = true;
					break;
				}
			}
			if(this.playerHit){
				this.projectile.enabled = false;
				if(DEBUG){
					console.log("Player hit!");
				}
			}
			
			if(this.projectile.distTraveled >= PROJECTILE_DIST || this.projectile.distTraveled <= -PROJECTILE_DIST){
				this.projectile.distTraveled = 0;
				this.projectile.enabled = false;
			}
			
			if(this.projectile.isLeft){
		var box = this.projectileBoundingBox(),
        tileX = Math.floor(box.left/64),
        tileY = Math.floor(box.bottom / 64) - 1,
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid) 
      this.projectile.enabled = false;

			
		
	} else {
		var box = this.projectileBoundingBox(),
        tileX = Math.floor(box.right/64),
        tileY = Math.floor(box.bottom / 64) - 1,
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid)
      this.projectile.enabled = false;
	}  
       
	}
    // Update animation
    if(this.isLeft){
		this.animations.left[this.state].update(elapsedTime);
		
    } else {
		this.animations.right[this.state].update(elapsedTime);
    }
	
	// Update projectile animation
	if(this.projectile.isLeft){
		this.animations.left[PROJECTILE].update(elapsedTime);
	} else {
		this.animations.right[PROJECTILE].update(elapsedTime);
	}
  }
  
  /* Barrel Render Function
   * arguments:
   * - ctx, the rendering context
   * - debug, a flag that indicates turning on
   * visual debugging
   */
  Barrel.prototype.render = function(ctx, debug) {
    // Draw the barrel (and the correct animation)
    if(this.isLeft)
      this.animations.left[this.state].render(ctx, this.currentX, this.currentY);
    else
      this.animations.right[this.state].render(ctx, this.currentX, this.currentY);
    
	if(this.projectile.enabled){
		if(this.projectile.isLeft){
			this.animations.left[PROJECTILE].render(ctx, this.projectile.x, this.projectile.y);
		} else {
			this.animations.right[PROJECTILE].render(ctx, this.projectile.x, this.projectile.y);
		}
	}
    if(debug) renderDebug(this, ctx);
  }
  
  // Draw debugging visual elements
  function renderDebug(barrel, ctx) {
    var bounds = barrel.boundingBox();
    ctx.save();
    
    // Draw barrel bounding box
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
  
  /* barrel BoundingBox Function
   * returns: A bounding box representing the barrel 
   */
  Barrel.prototype.boundingBox = function() {
    return {
      left: this.currentX,
      top: this.currentY,
      right: this.currentX + SIZE,
      bottom: this.currentY + SIZE
    }
  }
  
   Barrel.prototype.projectileBoundingBox = function() {
    return {
      left: this.projectile.x,
      top: this.projectile.y,
      right: this.projectile.x + SIZE,
      bottom: this.projectile.y + SIZE
    }
  }
  
    Barrel.prototype.boundingCircle = function() {
     return {
		 cx: this.currentX,
		 cy: this.currentY,
		 radius: SIZE/2
	 }
   }
   
   Barrel.prototype.attack = function(elapsedTime, entities){
		this.lastAttack += elapsedTime;
		if(!this.projectile.enabled && this.lastAttack >= this.attackFrequency){
			
			for(var i=0; i<entities.length;i++){
				if(entities[i] instanceof Player){
					var playerX = entities[i].currentX;
					break;
				}
			}
			if(playerX > this.currentX){
				this.projectile.isLeft = false;
				this.projectile.xSpeed = PROJECTILE_SPEED;
			} else {
				this.projectile.xSpeed = -PROJECTILE_SPEED;
				this.projectile.isLeft = true;
			}
			
			this.lastAttack = 0;
			this.projectile.x = this.currentX;
			this.projectile.y = this.currentY;
			
			this.projectile.enabled = true;
		}
	   
   }
  
  return Barrel;

}());

