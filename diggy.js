(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* DemonicGroundHog
 * Authors:
	Nathan Bean

 */
module.exports = (function(){
  var Entity = require('./entity.js'),
      Animation = require('./animation.js');

  /* ground hog states */
  const IDLE = 0;
  const MOVING = 1;
  const ATTACKING = 2;
  const FALLING = 3;
  const DIGGING = 4;

  // The Sprite Size
  const SIZE = 64;

  // Movement constants
  const SPEED = 30;
  const GRAVITY = -250;

  //DG (Demonic GroundHog)IDLE sprite sheetS
  var idleLeft = new Image();
  idleLeft.src = './img/DGFrontmoving.png';
  var idleRight = new Image();
  idleRight.src = './img/DGFrontmoving.png';

  //DG MOVING SPRITE SHEETS
  var moveLeft = new Image();
  moveLeft.src = './img/DGmovingleft.png';
  var moveRight = new Image();
  moveRight.src =  './img/DGmovingright.png';

  //DG ATACKING sprite sheets
  var attackLeft = new Image();
  attackLeft.src = './img/DGattackingright.png';
  var attackRight = new Image();
  attackRight.src =  './img/DGattackingLeft.png';

  //DG DIGGING sprite sheets
  var digLeft = new Image();
  digLeft.src = './img/DGdiggingmovement.png';
  var digRight = new Image();
  digRight.src =  './img/DGdiggingmovement.png';

  //timers
  var movingTimer = 0,
	idleTimer = 0,
	attackingTimer = 0;

  //The Dwarf constructor
  function DemonicGroundHog(locationX, locationY, layerIndex, entityManager) {
    this.type = "DemonicGroundHog";
    this.state = IDLE;
    this.layerIndex = layerIndex;
	this.entityManager = entityManager;
    this.currentX = locationX;
    this.currentY = locationY;
    this.currentTileIndex = 0;
    this.constSpeed = 15;
    this.gravity = 0.5;
    this.angle = 0;
    this.xSpeed = 10;
    this.ySpeed = 15;
	this.isPlayerColliding = false;
    this.isLeft = false;

    //The animations
    this.animations = {
      left: [],
      right: [],
  };

    //The right-facing animations
    this.animations.right[IDLE] = new Animation(idleRight, SIZE, SIZE, 0, 0, 8);
    this.animations.right[MOVING] = new Animation(moveRight, SIZE, SIZE, 0, 0, 8);
    this.animations.right[ATTACKING] = new Animation(attackRight, SIZE, SIZE, 0, 0, 8);
    this.animations.right[DIGGING] = new Animation(digRight, SIZE, SIZE, 0, 0, 8);
    this.animations.right[FALLING] = new Animation(idleRight, SIZE, SIZE, 0, 0, 8);

    //The left-facing animations
    this.animations.right[IDLE] = new Animation(idleLeft, SIZE, SIZE, 0, 0, 8);
    this.animations.right[MOVING] = new Animation(moveLeft, SIZE, SIZE, 0, 0, 8);
    this.animations.right[ATTACKING] = new Animation(attackLeft, SIZE, SIZE, 0, 0, 8);
    this.animations.right[DIGGING] = new Animation(digLeft, SIZE, SIZE, 0, 0, 8);
    this.animations.right[FALLING] = new Animation(idleLeft, SIZE, SIZE, 0, 0, 8);

  }

  DemonicGroundHog.prototype = new Entity();

  // Determines if the ground hog is on the ground
  DemonicGroundHog.prototype.onGround = function(tilemap) {
    var box = this.boundingBox(),
        tileX = Math.floor((box.left + (SIZE/2))/64),
        tileY = Math.floor(box.bottom / 64),
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    // find the tile we are standing on.
    return (tile && tile.data.solid) ? true : false;
};

  // Moves the ground hog to the left
  DemonicGroundHog.prototype.moveLeft = function(distance, tilemap) {
    this.currentX -= distance;
    var box = this.boundingBox(),
        tileX = Math.floor(box.left/64),
        tileY = Math.floor(box.bottom / 64) - 1,
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid)
      this.currentX = (Math.floor(this.currentX/64) + 1) * 64;
  };

  // Moves the groundhog to the right
  DemonicGroundHog.prototype.moveRight = function(distance, tilemap) {
    this.currentX += distance;
    var box = this.boundingBox(),
        tileX = Math.floor(box.right/64),
        tileY = Math.floor(box.bottom / 64) - 1,
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid)
      this.currentX = (Math.ceil(this.currentX/64)-1) * 64;
  };

  DemonicGroundHog.prototype.update = function(elapsedTime, tilemap, entityManager) {
    var sprite = this;

      // Process the different states
      switch(sprite.state) {
        case IDLE:
			if(!sprite.onGround(tilemap)) {
				sprite.state = FALLING;
				sprite.velocityY = 0;
				idleTimer = 0;
				break;
			}
			else if(idleTimer > 1100){
					sprite.state = MOVING;
					idleTimer = 0;
				}
			else if (isPlayerColliding){
				var player = entityManager.getEntity(0);
				//inflict damage
			}
			else{
				idleTimer++;
			}
			break;
        case MOVING:
		  if(!sprite.onGround(tilemap)) {
            sprite.state = FALLING;
            sprite.velocityY = 0;
          }
		  else {
            if(movingTimer<500) {
              sprite.state = MOVING;
			  movingTimer++;
			  if(sprite.isLeft){
				 sprite.moveLeft(elapsedTime * SPEED, tilemap);
			  }else{
				 sprite.moveRight(elapsedTime * SPEED, tilemap);
			  }
            }
			else{
				movingTimer = 0;
				sprite.isLeft = !sprite.isLeft;
				sprite.state = IDLE;
			}
          }
          break;

	   case FALLING:
          sprite.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
          sprite.currentY += sprite.velocityY * elapsedTime;
          if(sprite.onGround(tilemap)) {
            sprite.state = IDLE;
            sprite.currentY = 64 * Math.floor(sprite.currentY / 64);
          }
			break;
      }

      // Swap input buffers
      swapBuffers();

    // Update animation
    if(this.isLeft)
      this.animations.left[this.state].update(elapsedTime);
    else
      this.animations.right[this.state].update(elapsedTime);
  };

  /* GroundHog Render Function */
  DemonicGroundHog.prototype.render = function(ctx, debug) {
    // Draw the Dwarf (and the correct animation)
    if(this.isLeft)
      this.animations.left[this.state].render(ctx, this.currentX, this.currentY);
    else
      this.animations.right[this.state].render(ctx, this.currentX, this.currentY);

    if(this.state != DONE){
		if(debug) renderDebug(this, ctx);
	}
};

  // Draw debugging visual elements
  function renderDebug(DemonicGroundHog, ctx) {
    var bounds = DemonicGroundHog.boundingBox();
    ctx.save();
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(bounds.left, bounds.top);
    ctx.lineTo(bounds.right, bounds.top);
    ctx.lineTo(bounds.right, bounds.bottom);
    ctx.lineTo(bounds.left, bounds.bottom);
    ctx.closePath();
    ctx.stroke();
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

  DemonicGroundHog.prototype.collide = function(otherEntity){
	  if(otherEntity.type == 'player'){
		  this.isPlayerColliding = true;
	  }
  };

  /* DemonicGroundHog BoundingBox Function
   * returns: A bounding box representing the Dwarf
   */
  DemonicGroundHog.prototype.boundingBox = function() {
    return {
      left: this.currentX,
      top: this.currentY,
      right: this.currentX + SIZE,
      bottom: this.currentY + SIZE
    }
};

  DemonicGroundHog.prototype.boundingCircle = function() {
     return {cx: this.currentX+SIZE/2, cy: this.currentY+SIZE/2, radius: SIZE/2};
 };

  return DemonicGroundHog;

}());

},{"./animation.js":3,"./entity.js":12}],2:[function(require,module,exports){
/* Entity: Kakao(aka DiamondGroundhog) module
 * Implements the entity pattern and provides
 * the entity Kakao info.
 * Author:
 * - Karen(Fei) Fang
 * Image source: http://www.archjrc.com/clipart
 */
module.exports = (function(){
  var Entity = require('./entity.js'),
      Diamond = require('./diamond.js'),
      Animation = require('./animation.js');

  /* The following are Kakao States */
  const WALKING = 0;
  const FALLING  = 1;
  const HURT = 2;

  // The Sprite Size
  const SIZE = 64;

  // Movement constants
  const SPEED = 150/7;   //SLOWER THAN PLAYER
  const GRAVITY = -250;

  //The Kakao spritesheet
  var kakaoImage = new Image();
  kakaoImage.src = 'img/Kakao-animation.png';


  //The Kakao constructor
  function Kakao(locationX, locationY, layerIndex) {
    this.type = "Kakao";
    //default state
    this.state = WALKING;
    this.layerIndex = layerIndex;
    this.currentX = locationX;
    this.currentY = locationY;

    this.currentTileIndex = 0;
    this.constSpeed = 15;
    this.gravity = .5;
    this.angle = 0;
    this.xSpeed = 10;
    this.ySpeed = 15;
    this.isLeft = false;
    this.hurtFrame =0;
    this.hasDiamond = false;
    this.moveDiamond = false;

    //The animations
    this.animations = {
      left: [],
      right: [],
    }

    //The right-facing animations
    this.animations.right[WALKING] = new Animation(kakaoImage, SIZE, SIZE, 0, 0, 4);
    this.animations.right[FALLING] = new Animation(kakaoImage, SIZE, SIZE, 0, 0);
    this.animations.right[HURT] = new Animation(kakaoImage, SIZE, SIZE, 0, SIZE*2, 4, 1/4);

    //The left-facing animations
    this.animations.left[WALKING] = new Animation(kakaoImage, SIZE, SIZE, 0, 0, 4);
    this.animations.left[FALLING] = new Animation(kakaoImage, SIZE, SIZE, 0, 0);
    this.animations.left[HURT] = new Animation(kakaoImage, SIZE, SIZE, 0, SIZE*2, 4, 1/4);

    console.log("Kakao: create diamond entity");
    this.diamond = new Diamond(this.currentX, this.currentY, 0);
  }

  // Kakao inherits from Entity
  Kakao.prototype = new Entity();

  // Determines if the Kakao is on the ground
  Kakao.prototype.onGround = function(tilemap) {
    var box = this.boundingBox(),
        tileX = Math.floor((box.left + (SIZE/2))/64),
        tileY = Math.floor(box.bottom / 64),
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    // find the tile we are standing on.
    return (tile && tile.data.solid) ? true : false;
  }

  // Moves the Kakao to the left, colliding with solid tiles
  Kakao.prototype.moveLeft = function(distance, tilemap) {
    this.currentX -= distance;
    var box = this.boundingBox(),
        tileX = Math.floor(box.left/64),
        tileY = Math.floor(box.bottom / 64) - 1,
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid)
      this.isLeft = false;  // turn when collide
  }

  // Moves the Kakao to the right, colliding with solid tiles
  Kakao.prototype.moveRight = function(distance, tilemap) {
    this.currentX += distance;
    var box = this.boundingBox(),
        tileX = Math.floor(box.right/64),
        tileY = Math.floor(box.bottom / 64) - 1,
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid)
      this.isLeft = true;  // turn when collide
  }

  /* Kakao update function
   * arguments:
   * - elapsedTime, the time that has passed
   *   between this and the last frame.
   * - tilemap, the tilemap that corresponds to
   *   the current game world.
   */
  Kakao.prototype.update = function(elapsedTime, tilemap, entityManager) {
    if(!this.hasDiamond){
      console.log("Kakao: add diamond to entityManager");
      entityManager.add(this.diamond);
      this.hasDiamond = true;
    }
    var sprite = this;
    // Process Kakao state
    switch(sprite.state) {
      case WALKING:
      // If there is no ground underneath, fall
      if(!sprite.onGround(tilemap)) {
        sprite.state = FALLING;
        sprite.velocityY = 0;
      } else {
        if(sprite.isLeft){  //is not passable, turn
          sprite.moveLeft(elapsedTime * SPEED, tilemap);
        }else{
          sprite.moveRight(elapsedTime * SPEED, tilemap);
        }
      }
      break;
      case FALLING:
      sprite.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
      sprite.currentY += sprite.velocityY * elapsedTime;
      if(sprite.onGround(tilemap)) {
        sprite.state = WALKING;
        sprite.currentY = 64 * Math.floor(sprite.currentY / 64);
      }
      break;
      case HURT:
        //1/elapsedTime is the number of frames per min
        //Each frame of HURT state is 1/4 min, thus the total HURT animation takes 1 min
        //Therefore, hurtFrame is 1/(1/elapsedTime) = (1/elapsedTime)
        if(sprite.hurtFrame <= (1/elapsedTime)){
          sprite.hurtFrame++;
        }else {
          /*
           *PLAN A: Relocate after HURT
          */
          //sprite.hurtFrame = 0;  //for relocation
          //sprite.currentX += 3*SIZE;  //for relocation
          //console.log("Kakao: Relocating to "+"( "+sprite.currentX+" , "+sprite.currentY+" )...");
          /*
           *PLAN B: Remove after HURT
          */
          entityManager.remove(this);
          console.log("Kakao: Entity Kakao removed.");
        }
      break;
    }
    //console.log("Kakao: State: "+this.state+" Direction: "+this.isLeft);

    // Update animation
    if(this.isLeft)
      this.animations.left[this.state].update(elapsedTime);
    else
      this.animations.right[this.state].update(elapsedTime);

  }

  /* Kakao Render Function
   * arguments:
   * - ctx, the rendering context
   * - debug, a flag that indicates turning on
   * visual debugging
   */
  Kakao.prototype.render = function(ctx, debug) {
    // Draw the Kakao (and the correct animation)
    if(this.isLeft)
      this.animations.left[this.state].render(ctx, this.currentX, this.currentY);
    else
      this.animations.right[this.state].render(ctx, this.currentX, this.currentY);

    if(debug) renderDebug(this, ctx);
  }

  // Draw debugging visual elements
  function renderDebug(Kakao, ctx) {
    var bounds = Kakao.boundingBox();
    ctx.save();

    // Draw Kakao bounding box
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

  /* Kakao BoundingBox Function
   * returns: A bounding box representing the Kakao
   */
  Kakao.prototype.boundingBox = function() {
    return {
      left: this.currentX,
      top: this.currentY,
      right: this.currentX + SIZE,
      bottom: this.currentY + SIZE
    }
  }

  Kakao.prototype.boundingCircle =function(){
    return{
      cx: this.currentX + SIZE/2,
      cy: this.currentY + SIZE/2,
      radius: SIZE/2
    }
  }

  Kakao.prototype.collide = function(otherEntity){
    //console.log("Kakao: otherEntity.type: " + otherEntity.type);
    if(otherEntity.type!="Diamond"){
      this.state = HURT;
      this.diamond.state = 1; //DROPPED
      if(!this.moveDiamond){
        //console.log("Diamond: collide: "+this.currentX+" , "+this.currentY);
        this.diamond.currentX += SIZE;
        this.diamond.currentY -= SIZE;
        this.moveDiamond = true;
      }
    }
  }

  return Kakao;

}());

},{"./animation.js":3,"./diamond.js":8,"./entity.js":12}],3:[function(require,module,exports){
module.exports = (function() {

  function Animation(image, width, height, top, left, numberOfFrames, secondsPerFrame, playItOnce) {
    this.frameIndex = 0,
      this.time = 0,
      this.secondsPerFrame = secondsPerFrame || (1 / 16),
      this.numberOfFrames = numberOfFrames || 1;

    this.width = width;
    this.height = height;
    this.image = image;

    this.drawLocationX = top || 0;
    this.drawLocationY = left || 0;

    this.playItOnce = playItOnce;
  }

  Animation.prototype.setStats = function(frameCount, locationX, locationY) {
    this.numberOfFrames = frameCount;
    this.drawLocationY = locationY;
    this.drawLocationX = locationX;
  };

  Animation.prototype.update = function(elapsedTime, tilemap) {
    this.time += elapsedTime;

    // Update animation
    if (this.time > this.secondsPerFrame) {
      if (this.time > this.secondsPerFrame) this.time -= this.secondsPerFrame;

      // If the current frame index is in range
      if (this.frameIndex < this.numberOfFrames - 1) {
        this.frameIndex += 1;
      } else if (!this.playItOnce) {
        this.frameIndex = 0;
      }
    }
  };

  Animation.prototype.render = function(ctx, x, y) {

    // Draw the current frame
    ctx.drawImage(
      this.image,
      this.drawLocationX + this.frameIndex * this.width,
      this.drawLocationY,
      this.width,
      this.height,
      x,
      y,
      this.width,
      this.height);
  };

  return Animation;

}());

},{}],4:[function(require,module,exports){
/* Class of the Barrel Skeleton entity
 *
 * Author:
 * - Matej Petrlik 
 */
 
 
module.exports = (function(){
  var Entity = require('./entity.js'),
		Player = require('./player.js'),
		Bone = require('./bone.js'),
      Animation = require('./animation.js');
	  entityManager = require('./entity-manager.js');
  
  
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
  const MAX_BUMPS = 3;
  
  
    var boneLeft = new Image();
  boneLeft.src = 'img/BoneLeft.png';
  
  var barrelIdle = new Image();
  barrelIdle.src = 'img/BarrelIdle.png';
  
    var barrelAttack = new Image();
  barrelAttack.src = 'img/BarrelAttack.png';
  
      var barrelRollingLeft = new Image();
  barrelRollingLeft.src = 'img/BarrelRollingLeft.png';
  
      var barrelRollingRight = new Image();
  barrelRollingRight.src = 'img/BarrelRollingRight.png';
  
    var barrelDead = new Image();
  barrelDead.src = 'img/BarrelBroken.png';

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
	
	this.type = "Barrel";
	
	this.range = 5*SIZE;
	this.attackFrequency = 1.7;
	this.lastAttack = 0;
	this.lives = 5;
	
	this.state = IDLE;
	this.playerInRange = false;
	this.attacked = false;
	this.recovered = true;
	this.attackedFromLeft = false;
	this.bumpCount = 0;
    
    //The animations
    this.animations = {
      left: [],
      right: [],
    }
    
    //The right-facing animations
    this.animations.right[IDLE] = new Animation(barrelIdle, SIZE, SIZE, 0, 0, 15);
	this.animations.right[ATTACKING] = new Animation(barrelAttack, SIZE, SIZE, 0, 0, 12);
    this.animations.right[ROLLING] = new Animation(barrelRollingRight, SIZE, SIZE, 0, 0, 8);
    this.animations.right[FALLING] = new Animation(barrelIdle, SIZE, SIZE, 0, 0, 15);
    this.animations.right[SWIMMING] = new Animation(barrelRollingRight, SIZE, SIZE, 0, 0, 8);
	this.animations.right[DEAD] = new Animation(barrelDead, SIZE, SIZE, 0, 0, 1);
    
    //The left-facing animations
    this.animations.left[IDLE] = new Animation(barrelIdle, SIZE, SIZE, 0, 0, 15);
	this.animations.left[ATTACKING] = new Animation(barrelAttack, SIZE, SIZE, 0, 0, 12);
    this.animations.left[ROLLING] = new Animation(barrelRollingLeft, SIZE, SIZE, 0, 0, 8);
    this.animations.left[FALLING] = new Animation(barrelIdle, SIZE, SIZE, 0, 0, 15);
    this.animations.left[SWIMMING] = new Animation(barrelRollingLeft, SIZE, SIZE, 0, 0, 8);
	this.animations.left[DEAD] = new Animation(barrelDead, SIZE, SIZE, 0, 0, 1);
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
    if (tile && tile.data.solid) {
		this.attackedFromLeft = true;
		if(++this.bumpCount>MAX_BUMPS){
			this.state = IDLE;
			this.bumpCount = 0;
		}
      this.currentX = (Math.floor(this.currentX/64) + 1) * 64;
	}
  }
  
  // Moves the barrel to the right, colliding with solid tiles
  Barrel.prototype.moveRight = function(distance, tilemap) {
    this.currentX += distance;
    var box = this.boundingBox(),
        tileX = Math.floor(box.right/64),
        tileY = Math.floor(box.bottom / 64) - 1,
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid){
		this.attackedFromLeft = false;
		if(++this.bumpCount>MAX_BUMPS){
			this.state = IDLE;
			this.bumpCount = 0;
		}		
      this.currentX = (Math.ceil(this.currentX/64)-1) * 64;
	}
  }
  
  /* Barrel update function
   * arguments:
   * - elapsedTime, the time that has passed 
   *   between this and the last frame.
   * - tilemap, the tilemap that corresponds to
   *   the current game world.
   */
  Barrel.prototype.update = function(elapsedTime, tilemap, entityManager) {
	  if(this.state == DEAD){
		 return;
	  }
    var sprite = this;
    
	var entities = entityManager.queryRadius(this.currentX, this.currentY, this.range);
	this.playerInRange = false;
		for(var i=0; i<entities.length;i++){
			if(entities[i] instanceof Player){
				this.playerInRange = true;
				if(!this.recovered && Math.pow(entities[i].currentX-this.currentX,2)+Math.pow(entities[i].currentY-this.currentY,2)>Math.pow(SIZE,2)){
					this.recovered = true;
				}
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
	  
			if(!sprite.attackedFromLeft) {
              sprite.isLeft = true;
              sprite.state = ROLLING;
              sprite.moveLeft(elapsedTime * SPEED, tilemap);
			  if(DEBUG){
				console.log("Barrel direction: left");
			}
            }
            else if(sprite.attackedFromLeft) {
              sprite.isLeft = false;
              sprite.state = ROLLING;
              sprite.moveRight(elapsedTime * SPEED, tilemap);
			  
			  if(DEBUG){
				console.log("Barrel direction: right");
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
			if(DEBUG){
				console.log("Barrel state: FALLING");
			}
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
			if(DEBUG){
				console.log("Barrel state: FALLING");
			}
          } else {
			if(sprite.playerInRange && !sprite.attackedFromLeft) {
              sprite.isLeft = true;
              sprite.state = ROLLING;
              sprite.moveLeft(elapsedTime * SPEED, tilemap);
			  this.attacked = false;
            }
            else if(sprite.playerInRange && sprite.attackedFromLeft) {
              sprite.isLeft = false;
              sprite.state = ROLLING;
              sprite.moveRight(elapsedTime * SPEED, tilemap);
			  this.attacked = false;
            }
            else {
				sprite.attacked = false;
				sprite.recovered = true;
              sprite.state = IDLE;
			  
			  if(DEBUG){
				console.log("Barrel state: ROLLING");
			}
            }
          }
          break;
		  
        case FALLING:
          sprite.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
          sprite.currentY += sprite.velocityY * elapsedTime;
		  if(sprite.onGround(tilemap)) {
			  sprite.currentY = 64 * Math.floor(sprite.currentY / 64);
		  if(sprite.playerInRange && !sprite.attackedFromLeft) {
              sprite.isLeft = true;
              sprite.state = ROLLING;
              sprite.moveLeft(elapsedTime * SPEED, tilemap);
            }
            else if(sprite.playerInRange && sprite.attackedFromLeft) {
              sprite.isLeft = false;
              sprite.state = ROLLING;
              sprite.moveRight(elapsedTime * SPEED, tilemap);
            } else {
            sprite.state = IDLE;
            
			
			if(DEBUG){
				console.log("Barrel state: IDLE");
			}
          }
		}
          break;
		  
		case DEAD:
			
		break;
		  
        case SWIMMING:
          // NOT IMPLEMENTED YET
      }
	
	  
	    // Update animation
    if(this.isLeft)
      this.animations.left[this.state].update(elapsedTime);
    else
      this.animations.right[this.state].update(elapsedTime);
	
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
  
  
    Barrel.prototype.boundingCircle = function() {
     return {
		 cx: this.currentX + SIZE/2,
		 cy: this.currentY + SIZE/2,
		 radius: SIZE/2
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
   Barrel.prototype.collide = function(otherEntity) {
	   if((this.state == ATTACKING || this.state == IDLE) && this.recovered && otherEntity instanceof Player){
		   if(DEBUG){
		   console.log("Collision with player");
	   }
		   if(--this.lives<=0){
			   this.state = DEAD;
			   if(DEBUG){
				console.log("Barrel state: DEAD");
			}
			   
		   } else {
			   if(DEBUG){
		   console.log(this.lives+" lives left");
		   console.log("Barrel state: ROLLING");
	   }
			   this.attacked = true;
			   this.recovered = false;
			   this.state = ROLLING;
			   if(otherEntity.currentX <= this.currentX){
				   this.attackedFromLeft = true;
			   } else {
				   this.attackedFromLeft = false;
			   }
		   }
	   }
   }
   
   
   Barrel.prototype.attack = function(elapsedTime, entities){
		this.lastAttack += elapsedTime;
		if(this.lastAttack >= this.attackFrequency){
			
			for(var i=0; i<entities.length;i++){
				if(entities[i] instanceof Player){
					var playerX = entities[i].currentX;
					break;
				}
			}
			if(playerX > this.currentX){
				var isLeft = false;
			} else {
				var isLeft = true;
			}
			
			this.lastAttack = 0;
			bone = new Bone(this.currentX, this.currentY, 0, isLeft);
			entityManager.add(bone);
		}
	   
   }
  
  return Barrel;

}());


},{"./animation.js":3,"./bone.js":5,"./entity-manager.js":11,"./entity.js":12,"./player.js":22}],5:[function(require,module,exports){
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


},{"./animation.js":3,"./entity.js":12,"./player.js":22}],6:[function(require,module,exports){
module.exports = (function(){

var Animation = require('./animation.js'),
	Entity = require('./entity.js'),
	Tilemap = require('./tilemap.js'),
	cannonballImg = new Image();
	cannonballImg.src = './img/turret/cannonball_small.png',
	explosionImg = new Image(),
	explosionImg.src = './img/turret/explosion_small.png';
	
	const IDLE = 0,
		  ASCENDING = 1,
		  DESCENDING = 2,
		  EXPLODING = 3;
		  
	const BALL_SIZE = 20,
	      EXPLOSION_SIZE = 64;
		  
	const TILE_WIDTH = 64,
		  TILE_HEIGHT = 64,
		  MAP_SIZE = 1000;

function Cannonball(locationX, locationY, mapLayer, verticalV, horizontalV, gravity, centerOffsetX, centerOffsetY) {
	this.initPosX = locationX + centerOffsetX,
	this.initPosY = locationY + centerOffsetY;
	this.posX = locationX;
	this.posY = locationY;
	this.type = 'cannonball';
	this.state = IDLE;
	this.verticalV = verticalV;
	this.horizontalV = horizontalV;
	this.gravity = gravity;
	this.projectileTime = 0;
	this.projectileTimeExploding = 0;
	this.explosionSound = new Audio('./sounds/explosion.wav');
	
	// constants
	this.projectileTimeToReachTop = undefined;
	
	this.animations = [];
	
	this.animations[IDLE] = new Animation(explosionImg, BALL_SIZE, BALL_SIZE, 0, 0);
	this.animations[ASCENDING] = new Animation(cannonballImg, BALL_SIZE, BALL_SIZE, 0, 0);
	this.animations[DESCENDING] = new Animation(cannonballImg, BALL_SIZE, BALL_SIZE, 0, 0);
	this.animations[EXPLODING] = new Animation(explosionImg, EXPLOSION_SIZE, EXPLOSION_SIZE, 0, 0, 10);
	
	// get position x of the projectile at a given time after it has been fired
	this.getXAtTime = function() {
		return this.initPosX + this.horizontalV * this.projectileTime;
	}
	
	// get position y of the projectile at a given time after it has been fired
	this.getYAtTime = function() {
		return this.initPosY + this.verticalV * this.projectileTime + this.gravity * this.projectileTime * this.projectileTime / 2;
	}
	
	this.reset = function(verticalV, horizontalV) {
		this.posX = this.initPosX;
		this.posY = this.initPosY;
		this.horizontalV = horizontalV;
		this.verticalV = verticalV;
		this.projectileTime = 0;
		this.state = ASCENDING;
		this.projectileTimeToReachTop = -this.verticalV / gravity;
		this.projectileTimeExploding = 0;
	}
	
	this.checkCollisions = function(tile) {
		if (tile && tile.data.solid) {
			tilemap.destroyTileAt(1, this.getXFromCoords(this.posX), this.getYFromCoords(this.posY), 0);
			this.state = EXPLODING;
			this.offsetExploding();
			this.explosionSound.play();
		}
	}
	
	this.offsetExploding = function() {
		this.posX -= 20;
		this.posY -= 20;
	}
	
	this.getXFromCoords = function(x) {
		return (x / TILE_WIDTH) | 0;
	}
	
	this.getYFromCoords = function(y) {
		return (y / TILE_HEIGHT) | 0;
	}
}

Cannonball.prototype = new Entity();
	
	Cannonball.prototype.update = function(elapsedTime, tilemap, entityManager)
	{
		if (this.state == ASCENDING || this.state == DESCENDING) {
			if (this.projectileTime > this.projectileTimeToReachTop) {
				this.state = DESCENDING;
			}
			this.animations[this.state].update(elapsedTime);
			this.posX = this.getXAtTime();
			this.posY = this.getYAtTime();
			this.projectileTime += 0.5;
		}
		
		if (this.state == EXPLODING) {
			this.animations[this.state].update(elapsedTime);
			this.projectileTimeExploding += elapsedTime;
			if (this.projectileTimeExploding > 2) {
				this.state = IDLE;
			}
		}
		
		this.checkCollisions(Tilemap.tileAt(this.getXFromCoords(this.posX), this.getYFromCoords(this.posY), 0));
	}

	Cannonball.prototype.render = function(context, debug)
	{
		this.animations[this.state].render(context, this.posX, this.posY);
		if(debug) renderDebug(this, context);
	}

	Cannonball.prototype.collide = function(otherEntity)
	{
		if (otherEntity.type == 'turret' && this.state == DESCENDING) {
			this.offsetExploding();
			this.state = EXPLODING;
			this.explosionSound.play();
		}
	}
	
	function renderDebug(cannonball, ctx) {
		var bounds = cannonball.boundingBox();
		var circle = cannonball.boundingCircle();
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
		
		ctx.strokeStyle = "blue";
		ctx.beginPath();
		ctx.arc(circle.cx, circle.cy, circle.radius, 0, 2*Math.PI);
		ctx.stroke();
		
		// Outline tile underfoot
		var tileX = 64 * Math.floor((bounds.left + (BALL_SIZE/2))/64),
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

	Cannonball.prototype.boundingBox = function()
	{
		return {
			left: this.posX,
			top: this.posY,
			right: this.posX + BALL_SIZE,
			bottom: this.posY + BALL_SIZE
		}
	}

	Cannonball.prototype.boundingCircle = function()
	{
		return {
			cx: this.posX + BALL_SIZE / 2,
			cy: this.posY + BALL_SIZE / 2,
			radius: BALL_SIZE * Math.sqrt(2) / 2
		}
	}

return Cannonball;
	
}())
},{"./animation.js":3,"./entity.js":12,"./tilemap.js":25}],7:[function(require,module,exports){
// Credits Menu game state defined using the Module pattern
module.exports = (function (){
  var menu = document.getElementById("credits-menu"),
      exit = document.getElementById("exit-btn"),
      wrap = document.getElementById("credits-wrapper"),
      scroll = 0,
      stateManager;    
   
  /*
   * The load() method initializes the menu 
   * and tells the DOM to render the menu HTML
   * parameters:
   * - sm the state manager
   */
  var load = function(sm) {
    stateManager = sm;
    menu.style.display = "flex";
    scroll = 200;
    wrap.style.marginTop = "200px";
  }
  
  /*
   * The exit() method hides the menu
   */
  var exit = function() {
    menu.style.display = "none";
  }
    
  /* 
   * The update() method updates the menu,
   * scrolling the credits
   */
  var update = function(elapsedTime) {
    scroll -= 0.0001 * elapsedTime;
    wrap.style.marginTop = Math.round(scroll) + "px";   
  }
  
  /* 
   * The render() method renders the menu
   * (in this case, a no-op as the menu is 
   * HTML elements renderd by the DOM)
   */
  var render = function() {}
    
  /* 
   * The keyHander() method handles key
   * events for the menu.
   */
  var keyDown = function(event) {
    switch(event.keyCode) {
      case 13: // ENTER
      case 32: // SPACE
      case 27: // ESC
        event.preventDefault();
        stateManager.popState();
        break;
    }
  }
  
  var keyUp = function(event) {}
  
  return {
    load: load,
    exit: exit,
    update: update,
    render: render,
    keyDown: keyDown,
    keyUp: keyUp
  }
  
})();
},{}],8:[function(require,module,exports){
/* Entity: Diamond(added by Diamond) module
 * Implements the entity pattern and provides
 * the entity Diamond info.
 * Author:
 * - Karen(Fei) Fang
 * Image source: https://openclipart.org
 */
module.exports = (function(){
  var Entity = require('./entity.js'),
      Animation = require('./animation.js');

  // The Sprite Size
  const SIZE = 64;

  /* The following are Diamond States */
  const HOLD = 0;
  const DROPPED = 1;
  const PICKED = 2;

  //The Diamond spritesheet
  var diamondImage = new Image();
  diamondImage .src = 'img/diamond-animation.png';

  var pickFrame = 0;


  //The Diamond constructor
  function Diamond(locationX, locationY, layerIndex) {
    this.type = "Diamond";

    this.layerIndex = layerIndex;
    this.currentX = locationX;
    this.currentY = locationY;

    //default state
    this.state = HOLD;

    this.currentTileIndex = 0;

    //The animations
    this.animations = [];
    this.animations[DROPPED] = new Animation(diamondImage, SIZE, SIZE, 0, 0);
    this.animations[PICKED] = new Animation(diamondImage, SIZE, SIZE, 0, 0, 4, 1/4);
  }

  // Diamond inherits from Entity
  Diamond.prototype = new Entity();

  /* Diamond update function
   * arguments:
   * - elapsedTime, the time that has passed
   *   between this and the last frame.
   * - tilemap, the tilemap that corresponds to
   *   the current game world.
   */
  Diamond.prototype.update = function(elapsedTime, tilemap, entityManager) {
    switch (this.state) {
      case HOLD:
        return;
      case DROPPED:
        break;
      case PICKED:
        if(this.pickFrame <= 3*(1/elapsedTime)){
          this.pickFrame++;
        }else {
          entityManager.remove(this);
          console.log("Diamond: Player picked up the diamond! Entity Diamond removed.");
          return;
        }
        break;
    }
    this.animations[this.state].update(elapsedTime);

  }

  /* Diamond Render Function
   * arguments:
   * - ctx, the rendering context
   * - debug, a flag that indicates turning on
   * visual debugging
   */
  Diamond.prototype.render = function(ctx, debug) {
    // Draw the Diamond (and the correct animation)
    //console.log("Diamond: this.state: "+this.state);
    if(this.state != HOLD){
      //console.log("Diamond: this.currentX: "+this.currentX+" this.currentY: "+this.currentY);
      this.animations[this.state].render(ctx, this.currentX, this.currentY);
    }
  }

  /* Diamond BoundingBox Function
   * returns: A bounding box representing the Diamond
   */
  Diamond.prototype.boundingBox = function() {
    return {
      left: this.currentX + 1/4*SIZE,
      top: this.currentY,
      right: this.currentX + 3/4*SIZE,
      bottom: this.currentY + SIZE
    }
  }
  
  Diamond.prototype.boundingCircle =function(){
    return{
      cx: this.currentX + SIZE/2,
      cy: this.currentY + SIZE/2,
      radius: SIZE/2
    }
  }

  Diamond.prototype.collide = function(otherEntity){
    if(otherEntity.type === "Kakao"&& this.state===HOLD){
      //console.log("Kakao: Update diamond position.");
      this.currentX = otherEntity.currentX;
      this.currentY = otherEntity.currentY;
      return;
    }
    if(otherEntity.type!="player" && otherEntity.type!= "Kakao"){  //collides with other players
      this.state = DROPPED;
    }
    if(otherEntity.type === "player"){  //collides with player
      this.state = PICKED;
    }
  }

  return Diamond;

}());

},{"./animation.js":3,"./entity.js":12}],9:[function(require,module,exports){
/* Dynamite Dynamite module
 * Authors:
 * Alexander Duben
 */
module.exports = (function(){
  var Entity = require('./entity.js');
  Animation = require('./animation.js');
  
  //states
  const COUNTDOWN = 0;
  const DETONATE = 1;
  const DONE = 2;
  const FALLING = 3;

  // The Sprite Size
  const SIZE = 64;

  // Movement constants
  const SPEED = 50;
  const GRAVITY = -250;
  const JUMP_VELOCITY = -600;
  
  
  var dynamiteImg = new Image();
  dynamiteImg.src = './img/dynamiteSprite.png';
  var explosionImg = new Image();
  explosionImg.src = './img/explosionSpriteBig.png';
  var detonationTimer = 0;
  var explosionTimer = 0;

  //The Dynamite constructor
  function Dynamite(locationX, locationY, layerIndex, inputManager, sourceEntity) {
    this.inputManager = inputManager
    this.state = FALLING; 
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
	this.isPlayerColliding = false;
	this.type = 'dynamite';
	this.velocityY = -800;
	this.source = sourceEntity;
	
       //The animations
    this.animations = {
      dynamite: [],
    }
    
    //The right-facing animations
    this.animations.dynamite[FALLING] = new Animation(dynamiteImg, SIZE, SIZE, 0, 0, 8);
    this.animations.dynamite[DETONATE] = new Animation(explosionImg, 300, 300, 0, 0, 4);
	this.animations.dynamite[COUNTDOWN] = new Animation(dynamiteImg, SIZE, SIZE, 0, 0);
	this.animations.dynamite[DONE] = new Animation(explosionImg, SIZE, SIZE, 5*SIZE, 0);
  }
  // Dynamite inherits from Entity
  Dynamite.prototype = new Entity();
  
  // Determines if the player is on the ground
  Dynamite.prototype.onGround = function(tilemap) {
    var box = this.boundingBox(),
        tileX = Math.floor((box.left + (SIZE/2))/64),
        tileY = Math.floor(box.bottom / 64),
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);   
    // find the tile we are standing on.
    return (tile && tile.data.solid) ? true : false;
  }
  
  
  
  /* Dynamite update function
   * arguments:
   * - elapsedTime, the time that has passed 
   *   between this and the last frame.
   * - tilemap, the tilemap that corresponds to
   *   the current game world.
   */
  Dynamite.prototype.update = function(elapsedTime, tilemap, entityManager) {
    var sprite = this;
    
    // The "with" keyword allows us to change the
    // current scope, i.e. 'this' becomes our 
    // inputManager
    with (this.inputManager) {	

		switch(sprite.state) {
        case FALLING:
			sprite.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
			sprite.currentY += sprite.velocityY * elapsedTime;
			if(sprite.onGround(tilemap)) {
				sprite.velocityY = 0;
				sprite.currentY = 64 * Math.floor(sprite.currentY / 64);
				sprite.state = COUNTDOWN;
			}
			detonationTimer++;
			
          break;
		case COUNTDOWN:
			detonationTimer++;
			if(detonationTimer > 260){
				sprite.state = DETONATE;
			}
		break;
        case DETONATE:
		  if(explosionTimer < 15){
			  explosionTimer++;
			  if(explosionTimer == 8){
				  sprite.source.state = 6; //remove source body
			  }
		  }else{
				var box = sprite.boundingBox(),
				tileX = Math.floor((box.left + (SIZE/2))/64),
				tileY = Math.floor(box.bottom / 64);
				for(var i = tileX-3; i < tileX+3;i++){
					for(var j = tileY -3; j < tileY+3;j++){
						
						tilemap.setTileAt(7, i, j, 0);
					}	  
				}
				for(var i = tileX-5; i < tileX+5;i++){
					for(var j = tileY -5; j < tileY+5;j++){
						if(Math.random() < 0.4){
							tilemap.setTileAt(7, i, j, 0);
						}
						
					}	  
				}
				sprite.state = DONE;
				
				
		  }
		  
          break;
		  
		  case DONE:
		  //final state
			break;
		}
		
      
      
      // Swap input buffers
      swapBuffers();
    }
       
    // Update animation
    
      this.animations.dynamite[this.state].update(elapsedTime);
    
    
  }
  
  /* Dynamite Render Function
   * arguments:
   * - ctx, the rendering context
   * - debug, a flag that indicates turning on
   * visual debugging
   */
  Dynamite.prototype.render = function(ctx, debug) {
    // Draw the Dynamite (and the correct animation)
    if(this.state == COUNTDOWN){
		this.animations.dynamite[this.state].render(ctx, this.currentX, this.currentY+25); 
	}
	else if(this.state == DETONATE){
		this.animations.dynamite[this.state].render(ctx, this.currentX-100, this.currentY-100);
	}else{
		this.animations.dynamite[this.state].render(ctx, this.currentX, this.currentY);
	}
    if(this.state != DONE){
		if(debug) renderDebug(this, ctx);
	}
    
  }
  
  // Draw debugging visual elements
  function renderDebug(Dynamite, ctx) {
    var bounds = Dynamite.boundingBox();
    ctx.save();
    
    // Draw Dynamite bounding box
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
  
  Dynamite.prototype.collide = function(otherEntity){
	  
  }
  
  /* Dynamite BoundingBox Function
   * returns: A bounding box representing the Dynamite 
   */
  Dynamite.prototype.boundingBox = function() {
    return {
      left: this.currentX,
      top: this.currentY,
      right: this.currentX + SIZE,
      bottom: this.currentY + SIZE
    }
  }
  
  Dynamite.prototype.boundingCircle = function() {
     return {cx: this.currentX+SIZE/2, cy: this.currentY+SIZE/2, radius: SIZE/2}
   }
  
  return Dynamite;

}());
},{"./animation.js":3,"./entity.js":12}],10:[function(require,module,exports){
/* Dynamite Dwarf module
 * Authors:
 * Alexander Duben
 */
module.exports = (function(){
  var Entity = require('./entity.js'),
      Animation = require('./animation.js'),
	  Dynamite = require('./dynamite.js');
  
  /* The following are Dwarf States (Swimming is not implemented) */
  const STANDING = 0;
  const WALKING = 1;
  const DETONATING = 2;
  const FALLING = 3;
  const DYING = 4;
  const DEAD = 5;
  const DONE = 6;
  
  var GROUNDLVL = 10;

  // The Sprite Size
  const SIZE = 64;

  // Movement constants
  const SPEED = 50;
  const GRAVITY = -250;
  const JUMP_VELOCITY = -600;
  
  //The Right facing dwarf spritesheet
  var dwarfRight = new Image();
  dwarfRight.src = 'DwarfAnimatedRight.png';

  //The left facing dwarf spritesheet
  var dwarfLeft = new Image();
  dwarfLeft.src = "DwarfAnimatedLeft.png";
  
  //walk sprites
  var walkLeft = new Image();
  walkLeft.src = "./img/dwarfWalkLeft.png";
  var walkRight = new Image();
  walkRight.src = "./img/dwarfWalkRight.png";
  
  //idle sprites
  var idleLeft = new Image();
  idleLeft.src = "./img/dwarfIdleLeft.png";
  var idleRight = new Image();
  idleRight.src = "./img/dwarfIdleRight.png";
  
  //fall sprites
  var fallLeft = new Image();
  fallLeft.src = "./img/dwarfFallLeft.png";
  var fallRight = new Image();
  fallRight.src = "./img/dwarfFallRight.png";
  
  //dying sprites
  var dieLeft = new Image();
  dieLeft.src = "./img/dwarfDyingLeft.png";
  var dieRight = new Image();
  dieRight.src = "./img/dwarfDyingRight.png";
  
  //dead sprites
  var deadLeft = new Image();
  deadLeft.src = "./img/dwarfDeadLeft.png";
  var deadRight = new Image();
  deadRight.src = "./img/dwarfDeadRight.png";
  
  //detonate sprite
  var detonate = new Image();
  detonate.src = "./img/dwarfDetonate.png";
  
  var walkTimer = 0,
	idleTimer = 0,
	settingChargesTimer = 0,
	dyingTimer = 0;

  //The Dwarf constructor
  function Dwarf(locationX, locationY, layerIndex, inputManager) {
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
	this.isPlayerColliding = false;
	this.type = 'dynamiteDwarf';
	//this.player = playerEntity;
    
    //The animations
    this.animations = {
      left: [],
      right: [],
    }
    
    //The right-facing animations
    this.animations.right[STANDING] = new Animation(idleRight, SIZE, SIZE, 0, 0, 8);
    this.animations.right[WALKING] = new Animation(walkRight, SIZE, SIZE, 0, 0, 8);
    this.animations.right[DYING] = new Animation(dieRight, SIZE, SIZE, SIZE,0,7);
    this.animations.right[DETONATING] = new Animation(detonate, SIZE, SIZE, 0, 0, 20, 1/8);
    this.animations.right[FALLING] = new Animation(fallRight, SIZE, SIZE, 0, 0);
	this.animations.right[DEAD] = new Animation(deadRight, SIZE, SIZE, 0, 0);
	this.animations.right[DONE] = new Animation(dieRight,SIZE,SIZE,0,0);
    
    
    //The left-facing animations
    this.animations.left[STANDING] = new Animation(idleLeft, SIZE, SIZE, 0, 0, 8);
    this.animations.left[WALKING] = new Animation(walkLeft, SIZE, SIZE, 0, 0, 8);
    this.animations.left[DYING] = new Animation(dieLeft, SIZE, SIZE, 0,0,7);
    this.animations.left[DETONATING] = new Animation(detonate, SIZE, SIZE, 0, 0, 20, 1/8);
    this.animations.left[FALLING] = new Animation(fallLeft, SIZE, SIZE, 0, 0);
	this.animations.left[DEAD] = new Animation(deadLeft, SIZE, SIZE, 0, 0);
    this.animations.left[DONE] = new Animation(dieRight,SIZE,SIZE,0,0);
  }
  
  // Dwarf inherits from Entity
  Dwarf.prototype = new Entity();
  
  
  // Determines if the Dwarf is on the ground
  Dwarf.prototype.onGround = function(tilemap) {
    var box = this.boundingBox(),
        tileX = Math.floor((box.left + (SIZE/2))/64),
        tileY = Math.floor(box.bottom / 64),
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);   
    // find the tile we are standing on.
    return (tile && tile.data.solid) ? true : false;
  }
  
  // Moves the Dwarf to the left, colliding with solid tiles
  Dwarf.prototype.moveLeft = function(distance, tilemap) {
    this.currentX -= distance;
    var box = this.boundingBox(),
        tileX = Math.floor(box.left/64),
        tileY = Math.floor(box.bottom / 64) - 1,
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid) 
      this.currentX = (Math.floor(this.currentX/64) + 1) * 64
  }
  
  // Moves the Dwarf to the right, colliding with solid tiles
  Dwarf.prototype.moveRight = function(distance, tilemap) {
    this.currentX += distance;
    var box = this.boundingBox(),
        tileX = Math.floor(box.right/64),
        tileY = Math.floor(box.bottom / 64) - 1,
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid)
      this.currentX = (Math.ceil(this.currentX/64)-1) * 64;
  }
  
  /* Dwarf update function
   * arguments:
   * - elapsedTime, the time that has passed 
   *   between this and the last frame.
   * - tilemap, the tilemap that corresponds to
   *   the current game world.
   */
  Dwarf.prototype.update = function(elapsedTime, tilemap, entityManager) {
    var sprite = this;
    GROUNDLVL = tilemap.surface;
    // The "with" keyword allows us to change the
    // current scope, i.e. 'this' becomes our 
    // inputManager
    with (this.inputManager) {
	
      // Process Dwarf state
      switch(sprite.state) {
        case STANDING:
			sprite.isPlayerColliding = false;
			if(isKeyDown(commands.ATTACK)){
				sprite.state = DYING;
			}
			if(!sprite.onGround(tilemap)) {
				sprite.state = FALLING;
				sprite.velocityY = 0;
				idleTimer = 0;
				break;
			}
			if(idleTimer < 120){
				idleTimer++;
				if(isKeyDown(commands.PAY)) {
					sprite.state = DETONATING;
				}
			}else{
				idleTimer = 0;
				sprite.state = WALKING;
			}

			break;
        case WALKING:
          // If there is no ground underneath, fall
          if(sprite.isPlayerColliding){
			  sprite.state = STANDING;
			  walkTimer = 0;
		  }else if(!sprite.onGround(tilemap)) {
            sprite.state = FALLING;
            sprite.velocityY = 0;
          }
		  else {                      
            if(walkTimer<480) {
              sprite.state = WALKING;
			  walkTimer++;
			  if(sprite.isLeft){
				 sprite.moveLeft(elapsedTime * SPEED, tilemap); 
			  }else{
				 sprite.moveRight(elapsedTime * SPEED, tilemap); 
			  }             
            }else{
				walkTimer = 0;
				sprite.isLeft = !sprite.isLeft;
			}
          }
          break;
       
        case DETONATING:
			var player = entityManager.getPlayer();//player entity
			if(settingChargesTimer < 150){
				settingChargesTimer++;
			}else{
				settingChargesTimer = 0;
				var box = sprite.boundingBox(),
				tileX = Math.floor((box.left + (SIZE/2))/64),
				tileY = Math.floor(box.bottom / 64);								
				for(var j = tileY; j > GROUNDLVL;j--){
					tilemap.setTileAt(7, tileX, j-1, 0);
				}
				player.currentX = tileX*64;
				player.currentY = tileY*64;
				//player.velocityY = -1500;		
				player.velocityY = -Math.sqrt((tileY-GROUNDLVL)*64*10*(-GRAVITY));//shoot player above surface level
				if((tileY-GROUNDLVL) <= 0){//if above surface just use just constant force
					player.velocityY = -1500;
				}
				player.state = 2;//jumping
				sprite.state = WALKING;
			}
          break;
        case FALLING:
          sprite.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
          sprite.currentY += sprite.velocityY * elapsedTime;
          if(sprite.onGround(tilemap)) {
            sprite.state = WALKING;
            sprite.currentY = 64 * Math.floor(sprite.currentY / 64);
          }
          
          break;
        case DYING:
			if(dyingTimer < 25){
				dyingTimer++;
			}else{
				dyingTimer = 0;
				var dynamite = new Dynamite(sprite.currentX,sprite.currentY,0, sprite.inputManager,sprite);
				entityManager.add(dynamite);
				sprite.state = DEAD;
			}
			break;
		case DEAD:
			//stays dead until body destroyed
			break;
		case DONE:
			//final state
			break;
      }
      
      // Swap input buffers
      swapBuffers();
    }
       
    // Update animation
    if(this.isLeft)
      this.animations.left[this.state].update(elapsedTime);
    else
      this.animations.right[this.state].update(elapsedTime);
    
  }
  
  /* Dwarf Render Function
   * arguments:
   * - ctx, the rendering context
   * - debug, a flag that indicates turning on
   * visual debugging
   */
  Dwarf.prototype.render = function(ctx, debug) {
    // Draw the Dwarf (and the correct animation)
    if(this.isLeft)
      this.animations.left[this.state].render(ctx, this.currentX, this.currentY);
    else
      this.animations.right[this.state].render(ctx, this.currentX, this.currentY);
    
    if(this.state != DONE){
		if(debug) renderDebug(this, ctx);
	}
  }
  
  // Draw debugging visual elements
  function renderDebug(Dwarf, ctx) {
    var bounds = Dwarf.boundingBox();
    ctx.save();
    
    // Draw Dwarf bounding box
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
  
  Dwarf.prototype.collide = function(otherEntity){
	  if(otherEntity.type == 'player'){
		  this.isPlayerColliding = true;
	  }
  }
  
  /* Dwarf BoundingBox Function
   * returns: A bounding box representing the Dwarf 
   */
  Dwarf.prototype.boundingBox = function() {
    return {
      left: this.currentX,
      top: this.currentY,
      right: this.currentX + SIZE,
      bottom: this.currentY + SIZE
    }
  }
  
  Dwarf.prototype.boundingCircle = function() {
     return {cx: this.currentX+SIZE/2, cy: this.currentY+SIZE/2, radius: SIZE/2};
   }
  
  return Dwarf;

}());
},{"./animation.js":3,"./dynamite.js":9,"./entity.js":12}],11:[function(require,module,exports){
/* The entity manager for the DiggyHole game
 * Currently it uses brute-force approaches
 * to its role - this needs to be refactored
 * into a spatial data structure approach.
 * Authors:
 * - Nathan Bean
 */
module.exports = (function() {
  const MAX_ENTITIES = 100;


  var entities = [],
    entityCount = 0;

  var Player = require('./player.js');

  /* Adds an entity to those managed.
   * Arguments:
   * - entity, the entity to add
   */
  function add(entity) {
    if (entityCount < MAX_ENTITIES) {
      // Determine the entity's unique ID
      // (we simply use an auto-increment count)
      var id = entityCount;
      entityCount++;

      // Set the entity's id on the entity itself
      // as a property.  Due to the dynamic nature of
      // JavaScript, this is easy
      entity._entity_id = id;

      // Store the entity in the entities array
      entities[id] = entity;
      return true;
    } else {
      // We've hit the max number of allowable entities,
      // yet we may have freed up some space within our
      // entity array when an entity was removed.
      // If so, let's co-opt it.
      for (var i = 0; i < MAX_ENTITIES; i++) {
        if (entities[i] === undefined) {
          entity._entity_id = i;
          entities[i] = entity;
          return i;
        }
      }
      // If we get to this point, there are simply no
      // available spaces for a new entity.
      // Log an error message, and return an error value.
      console.error("Too many entities");
      return undefined;
    }
  }

  /* Removes an entity from those managed
   * Arguments:
   * - entity, the entity to remove
   */
  function remove(entity) {
    // Set the entry in the entities table to undefined,
    // indicating an open slot
    entities[entity._entity_id] = undefined;
  }

  /* Checks for collisions between entities, and
   * triggers the collide() event handler.
   */
  function checkCollisions() {
    for (var i = 0; i < entityCount; i++) {
      // Don't check for nonexistant entities
      if (entities[i]) {
        for (var j = 0; j < entityCount; j++) {
          // don't check for collisions with ourselves
          // and don't bother checking non-existing entities
          if (i != j && entities[j]) {
            var boundsA = entities[i].boundingBox();
            var boundsB = entities[j].boundingBox();
            if (boundsA.left < boundsB.right &&
              boundsA.right > boundsB.left &&
              boundsA.top < boundsB.bottom &&
              boundsA.bottom > boundsB.top
            ) {
              entities[i].collide(entities[j]);
              entities[j].collide(entities[i]);
            }
          }
        }
      }
    }
  }

  /* Returns all entities within the given radius.
   * Arguments:
   * - x, the x-coordinate of the center of the query circle
   * - y, the y-coordinate of the center of the query circle
   * - r, the radius of the center of the circle
   * Returns:
   *   An array of entity references
   */
  function queryRadius(x, y, r) {
    var entitiesInRadius = [];
    for (var i = 0; i < entityCount; i++) {
      // Only check existing entities
      if (entities[i]) {
        var circ = entities[i].boundingCircle();
        if (Math.pow(circ.radius + r, 2) >=
          Math.pow(x - circ.cx, 2) + Math.pow(y - circ.cy, 2)
        ) {
          entitiesInRadius.push(entities[i]);
        }
      }
    }
    return entitiesInRadius;
  }

  /* Updates all managed entities
   * Arguments:
   * - elapsedTime, how much time has passed between the prior frameElement
   *   and this one.
   * - tilemap, the current tilemap for the game.
   */
  function update(elapsedTime, tilemap) {
    for (i = 0; i < entityCount; i++) {
      if (entities[i]) entities[i].update(elapsedTime, tilemap, this);
    }
    checkCollisions();
  }

  /* Renders the managed entities
   * Arguments:
   * - ctx, the rendering contextual
   * - debug, the flag to trigger visual debugging
   */
  function render(ctx, debug) {
    for (var i = 0; i < entityCount; i++) {
      if (entities[i]) entities[i].render(ctx, debug);
    }
  }

  function getPlayer() {
    for (var i = 0; i < entityCount; i++) {
      if (entities[i] && entities[i] instanceof Player) {
        return entities[i];
      }
    }
  }

  function getEntity(index) {
    return entities[index];
  }

  /* Gets distance between entity and player */
  function playerDistance(entity) {
    var d = Math.pow(entity.currentX - entities[0].currentX, 2) + Math.pow(entity.currentY - entities[0].currentY, 2);
    d = Math.sqrt(d);
    return d;
  }

  /* Gets direction relative to player */
  function playerDirection(entity) {
    if (entities[0].currentX < entity.currentX) {
      return true;
    }
    return false;
  }

  return {
    add: add,
    remove: remove,
    queryRadius: queryRadius,
    update: update,
    render: render,
    playerDistance: playerDistance,
    playerDirection: playerDirection,
    getPlayer: getPlayer,
    getEntity: getEntity
  };

}());

},{"./player.js":22}],12:[function(require,module,exports){
/* Base class for all game entities,
 * implemented as a common JS module
 * Authors:
 * - Nathan Bean 
 */
module.exports = (function(){
  
  /* Constructor
   * Generally speaking, you'll want to set
   * the X and Y position, as well as the layerX
   * of the map the entity is located on
   */
  function Entity(locationX, locationY, mapLayer){
    this.x = locationX;
    this.y = locationY;
    this.mapLayer = mapLayer;
  }
  
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
  Entity.prototype.update = function(elapsedTime, tilemap, entityManager) {
      // TODO: Determine what your entity will do
  }
  
  /* Render function
   * parameters:
   *  - context is the rendering context.  It may be transformed
   *    to account for the camera 
   */
   Entity.prototype.render = function(context) {
     // TODO: Draw your entity sprite
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
   Entity.prototype.collide = function(otherEntity) {
   } 
   
   /* BoundingBox function
    * This function returns an axis-aligned bounding
    * box, i.e {top: 0, left: 0, right: 20, bottom: 50}
    * the box should contain your entity or at least the
    * part that can be collided with.
    */
   Entity.prototype.boundingBox = function() {
     // Return a bounding box for your entity
   }
   
   /* BoundingCircle function
    * This function returns a bounding circle, i.e.
    * {cx: 0, cy: 0, radius: 20}
    * the circle should contain your entity or at 
    * least the part that can be collided with.
    */
   Entity.prototype.boundingCircle = function() {
     // Return a bounding circle for your entity
   }
   
   return Entity;
  
}());
},{}],13:[function(require,module,exports){
/* Game GameState module
 * Provides the main game logic for the Diggy Hole game.
 * Authors:
 * - Nathan Bean
 */
module.exports = (function (){

  // The width & height of the screen
  const SCREEN_WIDTH = 1280,
        SCREEN_HEIGHT = 720;

  // Module variables
  var Player = require('./player.js'),
      GoblinSorcerer = require('./goblin_sorcerer.js'),
	  Rat = require('./rat.js'),
      Octopus = require('./octopus.js'),
      inputManager = require('./input-manager.js'),
      tilemap = require('./tilemap.js'),
      entityManager = require('./entity-manager.js'),
      StoneMonster = require('./stone-monster.js'),
	  DemonicGroundHog = require('./DemonicGroundH.js'),
      Barrel = require('./barrel.js'),
	  Turret = require('./turret.js'),
	  DynamiteDwarf = require('./dynamiteDwarf.js'),
	  Kakao = require('./Kakao.js'),
	  kakao,
      GoblinMiner = require('./goblin-miner.js'),
	  goblinSorcerer,
      player,
	  rat,
      octopus,
      stoneMonster,
      screenCtx,
      backBuffer,
      backBufferCtx,
      stateManager;

  /* Loads the GameState, triggered by the StateManager
   * This function sets up the screen canvas, the tilemap,
   * and loads the entity.
   * arguments:
   * - sm, the state manager that loaded this game
   */
var load = function(sm) {
    stateManager = sm;

    // Set up the screen canvas
    var screen = document.createElement("canvas");
    screen.width = SCREEN_WIDTH;
    screen.height = SCREEN_HEIGHT;
    screenCtx = screen.getContext("2d");
    document.getElementById("game-screen-container").appendChild(screen);

    // Set up the back buffer
    backBuffer = document.createElement("canvas");
    backBuffer.width = SCREEN_WIDTH;
    backBuffer.height = SCREEN_HEIGHT;
    backBufferCtx = backBuffer.getContext("2d");

    // Generate the tilemap
    tilemap.generate(1000, 1000, {
      viewport: {
        width: 1028,
        height: 720
      },
      onload: function() {
        window.tilemap = tilemap;
        tilemap.render(screenCtx);
      }
    });

    

    // Create the player and add them to
    // the entity manager
    player = new Player(400, 240, 0, inputManager);
    entityManager.add(player);
	
	for (var i = 0; i < 35; i += 7){
      stoneMonster = new StoneMonster(64*i, 0, 0);
      entityManager.add(stoneMonster);
    }
	
	rat = new Rat(500, 360, 0);
	entityManager.add(rat);
   
    player = new Player(64*6, 240, 0, inputManager);
    entityManager.add(player);

    octopus = new Octopus(120, 240, 0);
    entityManager.add(octopus);

	goblinMiner = new GoblinMiner(180-64-64, 240, 0, entityManager);
	entityManager.add(goblinMiner);
	
	goblinSorcerer = new GoblinSorcerer(400, 240, 0, entityManager);
	entityManager.add(goblinSorcerer);

	// Spawn 10 barrels close to player
	 // And some turrets
	for(var i = 0; i < 10; i++){
		if (i < 3) {
			turret = new Turret(Math.random()*64*50, Math.random()*64*20, o);
			entityManager.add(turret);
		}
		barrel = new Barrel(Math.random()*64*50, Math.random()*64*20, 0, inputManager);
		entityManager.add(barrel);
	}

	dynamiteDwarf = new DynamiteDwarf(280, 240, 0, inputManager);
	entityManager.add(dynamiteDwarf);

	// Karenfang: Create a Kakao and add it to
    // the entity manager
    kakao = new Kakao(310,240,0);  //two tiles to the right of the player
    entityManager.add(kakao);
  };

  /* Updates the state of the game world
   * arguments:
   * - elapsedTime, the amount of time passed between
   * this and the prior frame.
   */
  var update = function(elapsedTime) {
    //player.update(elapsedTime, tilemap);
    entityManager.update(elapsedTime, tilemap);
    inputManager.swapBuffers();

    octopus.getPlayerPosition(player.boundingBox());
  };

  /* Renders the current state of the game world
   */
  var render = function() {
    // Clear the back buffer
    backBufferCtx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // TODO: Calculate rubberbanding
    var bounds = player.boundingBox();
    var offsetX = SCREEN_WIDTH / 2,
        offsetY = SCREEN_HEIGHT / 2;

    // Apply camera transforms
    backBufferCtx.save();backBufferCtx.translate(offsetX - bounds.left, offsetY - bounds.top);
    tilemap.setCameraPosition(bounds.left, bounds.top);

    // Redraw the map & entities
    tilemap.render(backBufferCtx);
    entityManager.render(backBufferCtx, true);
    //player.render(backBufferCtx, true);

    backBufferCtx.restore();

    // Flip the back buffer
    screenCtx.drawImage(backBuffer, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  };

  /* Event handler for key down events
   * arguments:
   * - event, the key down event to process
   */
  function keyDown(event) {
    if(event.keyCode == 27) { // ESC
      var mainMenu = require('./main-menu.js');
      stateManager.pushState(mainMenu);
    }
    inputManager.keyDown(event);
  }

  /* Event handler for key up events
   * arguments:
   * - event, the key up event to process
   */
  function keyUp(event) {
    inputManager.keyUp(event);
  }

  /* Exits the game */
  var exit = function() {}

  return {
    load: load,
    exit: exit,
    update: update,
    render: render,
    keyDown: keyDown,
    keyUp: keyUp
  }

})();

},{"./DemonicGroundH.js":1,"./Kakao.js":2,"./barrel.js":4,"./dynamiteDwarf.js":10,"./entity-manager.js":11,"./goblin-miner.js":14,"./goblin_sorcerer.js":15,"./input-manager.js":16,"./main-menu.js":17,"./octopus.js":20,"./player.js":22,"./rat.js":23,"./stone-monster.js":24,"./tilemap.js":25,"./turret.js":26}],14:[function(require,module,exports){
/* Goblin Miner module
 * Implements the entity pattern and provides
 * the DiggyHole Goblin Miner info.
 * Author:
 * - Wyatt Watson
 * - Nathan Bean
 */
module.exports = (function(){
    var Entity = require('./entity.js'),
	    Animation = require('./animation.js');
	  
    /* The following are Goblin Miner States */
    const PASSIVE_STANDING = 0;
    const WALKING = 1;
    const JUMPING = 2;
    const FALLING = 3;
    const DIGGING = 4;
    const CHARGING = 5;
    const ATTACKING = 6;
    const AGGRESSIVE_STANDING = 7;
  

    function GoblinMiner(locationX, locationY, layerIndex, entManager){
	    this.data = {type: 'goblinMiner'};
		this.entityManager = entManager;
		this.state = PASSIVE_STANDING;
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
		this.velocityY = 0;
	    this.isLeft = false;
		this.direction = 0;
	  
	    // The animations
	    this.animations = {
			left: [],
			right: []
	    }
	  
	    /* ADD CODE HERE */
	    // The right-facing animations
	    this.animations.right[PASSIVE_STANDING] = new Animation(goblinMinerRight, 354/8, 64, 354/8, 0, 0, 8);
	    // the left-facing animations
	    /* END ADD CODE HERE */
    }  
  
    GoblinMiner.prototype = new Entity();
	
    // Determines if the Goblin Miner is on the ground
    GoblinMiner.prototype.onGround = function(tilemap) {
		var box = this.boundingBox(),
			tileX = Math.floor((box.left + (SIZE/2))/64),
			tileY = Math.floor(box.bottom / 64),
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);   
    // find the tile we are standing on.
    return (tile && tile.data.solid) ? true : false;
    }
	
    /* Returns the entities in Sight
     * - tileX, the x coordinate of our current tile location
     * - tileY, the y coordinate of our current tile location
     * - layerIndex, the layer we are in and interact with
     * - tileMap, the tilemap
     */
    function vision(tileX, tileY, layerIndex, tileMap, goblin){
	var entities = goblin.entityManager.queryRadius(tileX, tileY, 2);
	/* for(i = -5; i <= 5; i++){
		if(i == 0){}
		else{
			var temp = {
				entity: tileMap.tileAt(tileX+i, tileY, layerIndex), 
				direction: i};
			if(tileX+i >= 0 && tileX+i <= 1000)
				entities.push(temp);
		}
	} */
	return entities;
    }
	  
    /* Returns the entities in Hearing Range
     * - tileX, the x coordinate of our current tile location
     * - tileY, the y coordinate of our current tile location
     * - layerIndex, the layer we are in and interact with
     * - tileMap, the tilemap
     */
    function aggressionRadius(tileX, tileY, layerIndex, tileMap, goblin){
	var entities = goblin.entityManager.queryRadius(tileX, tileY, 7);
/* 	for(j = -5; j <= 5; j++){
		for(i = -5; i <= 5; i++){
			if(i == 0 && j == 0){}
			else{
				var temp = {
					entity: tileMap.tileAt(tileX+i, tileY+j, layerIndex),
				direction: i};
				if(tileX+i >= 0 && tileX+i <= 1000 && tileY+j >= 0 && tileY+j <= 1000)
					entities.push(tileMap.tileAt(tileX+i, tileY+j, layerIndex));
			}
		}
	} */
	return entities;
    }
	  
    /* Returns a bool for if there is a large enough path to jump up
     * - tileX, the x coordinate of our current tile location
     * - tileY, the y coordinate of our current tile location
     * - layerIndex, the layer we are in and interact with
     * - tileMap, the tilemap
     */
    function checkAbovePath(tileX, tileY, layerIndex, tileMap){
	var tile = tileMap.tileAt(tileX, tileY-1, layerIndex);
	if(!(tile && tile.data.solid)){
		tile = tileMap.tileAt(tileX, tileY-2, layerIndex);
		if(!(tile && tile.data.solid))
			return true;
	}
	return false;
    }
	  
    /* Returns a bool for if the path above is open (false - solid, true - open)
     * - tileX, the x coordinate of our current tile location
     * - tileY, the y coordinate of our current tile location
     * - layerIndex, the layer we are in and interact with
     * - tileMap, the tilemap
     */
    function checkAbove(tileX, tileY, layerIndex, tileMap){
	var tile = tileMap.tileAt(tileX, tileY-1, layerIndex);
	if(tile && tile.data.solid)
		return false;
	return true;
    }
	  
    /* Returns a bool for if the path to the right is open (false - solid, true - open)
     * - tileX, the x coordinate of our current tile location
     * - tileY, the y coordinate of our current tile location
     * - layerIndex, the layer we are in and interact with
     * - tileMap, the tilemap
     */
    function checkRight(tileX, tileY, layerIndex, tileMap){
	var tile = tileMap.tileAt(tileX+1, tileY, layerIndex);
	if(tile && tile.data.solid)
		return false;
	return true;
    }

    /* Returns a bool for if the path to the left is open (false - solid, true - open)
     * - tileX, the x coordinate of our current tile location
     * - tileY, the y coordinate of our current tile location
     * - layerIndex, the layer we are in and interact with
     * - tileMap, the tilemap
     */  
    function checkLeft(tileX, tileY, layerIndex, tileMap){
	var tile = tileMap.tileAt(tileX-1, tileY, layerIndex);
	if(tile && tile.data.solid)
		return false;
	return true;
    }

    /* Returns a bool for if the path below is open (false - solid, true - open)
     * - tileX, the x coordinate of our current tile location
     * - tileY, the y coordinate of our current tile location
     * - layerIndex, the layer we are in and interact with
     * - tileMap, the tilemap
     */
    function checkBelow (tileX, tileY, layerIndex, tileMap){
	var tile = tileMap.tileAt(tileX, tileY+1, layerIndex);
	if(tile && tile.data.solid)
		return false;
	return true;
    }
	  
    /* Returns an array holding a command and possibly direction
     * - tileX, the x coordinate of our current tile location
     * - tileY, the y coordinate of our current tile location
     * - layerIndex, the layer we are in and interact with
     * - tileMap, the tilemap
     * - currentState, the current state of the goblin miner
     * - direction, the possible direction the goblin miner is moving
     */
    function command(tileX, tileY, layerIndex, tileMap, currentState, direction, goblin){  
	if(!goblin.onGround(tilemap)){
		return {command: FALLING, direction: 0};
	}
		  
/* 	var visionEnts = vision(tileX, tileY, layerIndex, tileMap, goblin);
	var aggroEnts = aggressionRadius(tileX, tileY, layerIndex, tileMap, goblin);
		  
	// Check for player in vision
	for(i = 0; i < visionEnts.length; i++){
		if(visionEnts[i].type == 'player'){
			var temp;
			if(visionEnts[i].direction == 1 || visionEnts[i].direction == -1)
				temp = {command: ATTACKING, direction: visionEnts[i].direction};
			else
				temp = {command: CHARGING, direction: visionEnts[i].direction};
			return temp;
		}
	} 
		  
	// Check for player in aggro range
	for(i = 0; i < aggroEnts.length; i++){
		if(aggroEnts[i].type == 'player'){
			var temp = {command: AGGRESSIVE_STANDING, direction: aggroEnts[i].direction};
			return temp;
		}
	}  */
		  
	// Player is not nearby, so need to find something to do
	var randomNum = Math.random();
		  
	switch(currentState) {
		case AGGRESSIVE_STANDING:
		    return {command: PASSIVE_STANDING, direction: 0};
			break;
		case PASSIVE_STANDING:
		    if(randomNum < .8)
			    return {command: PASSIVE_STANDING, direction: 0};
			if(randomNum > .4){
				if(checkLeft(tileX, tileY, layerIndex, tileMap) && tileX-1 >= -1)
					return {command: WALKING, direction: -1};
				else{
					if(randomNum > .7)
						return {command: DIGGING, direction: -1};
					else 
						return {command: WALKING, direction: 1};
				}
			}
			else{
				if(checkRight(tileX, tileY, layerIndex, tileMap) && tileX+1 <= 1000)
					return {command: WALKING, direction: 1};
				else{
					if(randomNum < .1)
						return {command: DIGGING, direction: 1};
					else
						return {command: WALKING, direction: -1};
				}
			}
			break;
		case WALKING:
		    /*if(randomNum < .05)
			    return {command: PASSIVE_STANDING, direction: 0};
			else*/ if(checkBelow(tileX, tileY, layerIndex, tileMap)){
				if(randomNum > .1 && tileX+direction >= 0){
					return {command: WALKING, direction: direction};
				}
				else
					return {command: WALKING, direction: -direction};
			}
		    if(direction == 1){
			    if(checkRight(tileX, tileY, layerIndex, tileMap))
				    return {command: WALKING, direction: 1};
				else if(randomNum < .9 && tileX-1 >= -1)
					return {command: WALKING, direction: -1};
			    else
				    return {command: DIGGING, direction: 1}; 
		    }
		    else{
			    if(checkLeft(tileX, tileY, layerIndex, tileMap) && tileX-1 >= -1)
				    return {command: WALKING, direction: -1};
				else if(randomNum < .9 && tileX+1 <= 1000)
					return {command: WALKING, direction: 1};
			    else
				    return {command: DIGGING, direction: -1}; 
		    }
			break;
		case DIGGING:
		    if(direction >= 1 && checkRight(tileX, tileY, layerIndex, tileMap))
			    return {command: WALKING, direction: 1};
		    else if(direction <= -1 && checkLeft(tileX, tileY, layerIndex, tileMap))
			    return {command: WALKING, direction: -1};
			break;
		case FALLING:
			if(randomNum > .5){
			    if(checkRight(tileX, tileY, layerIndex, tileMap) && tileX+1 <= 1000)
					return {command: FALLING, direction: 1};
			    else
					return {command: FALLING, direction: 0};
			}
			else{
			    if(checkLeft(tileX, tileY, layerIndex, tileMap) && tileX-1 >= 0)
					return {command: FALLING, direction: -1};
			    else
				    return {command: FALLING, direction: 0};
			}	 
			break;
        }
		return {command: currentState, direction: direction};
    } 
  
    // Movement constants
    const SPEED = 150;
    const GRAVITY = -250;
    const JUMP_VELOCITY = -600;
  
    // Current stance (Passive, Aggressive)
    var Passive = true;
	
	var SIZE = 64;
  
    /* ADD CODE HERE */
    // The right facing goblin miner spritesheet(s)
    var goblinMinerRight = new Image();
    goblinMinerRight.src = 'img/Passive_Scratch.png';
  
    // The left facing goblin miner spritesheet(s)
    var goblinMinerLeft = new Image();
    goblinMinerLeft.src = '';
    /* END ADD CODE HERE*/
  
    // Moves the Goblin Miner to the left, colliding with solid tiles
    GoblinMiner.prototype.moveLeft = function(distance, tilemap) {
    this.currentX -= distance;
    var box = this.boundingBox(),
        tileX = Math.floor(box.left/64),
        tileY = Math.floor(box.bottom / 64) - 1,
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid) 
      this.currentX = (Math.floor(this.currentX/64) + 1) * 64
    }
  
  // Moves the Goblin Miner to the right, colliding with solid tiles
  GoblinMiner.prototype.moveRight = function(distance, tilemap) {
    this.currentX += distance;
    var box = this.boundingBox(),
        tileX = Math.floor(box.right/64),
        tileY = Math.floor(box.bottom / 64) - 1,
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid)
      this.currentX = (Math.ceil(this.currentX/64)-1) * 64;
  }
  
  /* Goblin Miner update function
   * arguments:
   * - elapsedTime, the time that has passed 
   *   between this and the last frame.
   * - tilemap, the tilemap that corresponds to
   *   the current game world.
   */
  GoblinMiner.prototype.update = function(elapsedTime, tilemap) {
    var sprite = this;
    
	var tileX = Math.floor(this.currentX/64);
	var tileY = Math.floor(this.currentY/64);
	
    var whatDo = command(Math.floor(this.currentX/64), Math.floor(this.currentY/64), this.layerIndex, tilemap, this.state, this.direction, this);
    //var whatDo = {command: PASSIVE_STANDING, direction: 0};
	this.state = whatDo.command;
	this.direction = whatDo.direction;
	
	/* ADD CODE HERE */
    // Process Goblin Miner state
    switch(whatDo.command) {
        case PASSIVE_STANDING:
		  this.velocityY = 0;
		  break;
		case AGGRESSIVE_STANDING:
		  this.velocityY = 0;
		  break;
        case WALKING:
		  this.velocityY = 0;
          if(whatDo.direction >= 0){
			  this.isLeft = false;
			  this.moveRight(elapsedTime * SPEED, tilemap);
		  }
		  else{
			  this.isLeft = true;
			  this.moveLeft(elapsedTime * SPEED, tilemap);
		  }
          break;
		case CHARGING:
          if(whatDo.direction > 0){
			  this.isLeft = false;
			  this.moveRight(elapsedTime * SPEED*2, tilemap);
		  }
		  else{
			  this.isLeft = true;
			  this.moveLeft(elapsedTime * SPEED*2, tilemap);
		  }
          break;
        case DIGGING:
		  if(whatDo.direction > 0){
			  tilemap.removeTileAt(tileX+1, tileY, this.layerIndex);
		  }
		  else{
			  tilemap.removeTileAt(tileX-1, tileY, this.layerIndex);
		  }
		case ATTACKING:
		  if(whatDo.direction > 0){
			  //attack right
		  }
		  else{
			  //attack left
		  }
        case FALLING:
          this.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
          this.currentY += sprite.velocityY * elapsedTime;
          if(this.onGround(tilemap)) {
            this.state = PASSIVE_STANDING;
            this.currentY = 64 * Math.floor(sprite.currentY / 64);
			this.velocityY = 0;
          }   
          if(whatDo.direction > 0){
			  this.isLeft = false;
			  this.moveRight(elapsedTime * SPEED, tilemap);
		  }
		  else if(whatDo.direction < 0){
			  this.isLeft = true;
			  this.moveLeft(elapsedTime * SPEED, tilemap);
		  }
          break;
      }
	  /* END ADD CODE HERE */
       
    // Update animation
    /* if(this.isLeft)
      this.animations.left[this.state].update(elapsedTime);
    else
      this.animations.right[this.state].update(elapsedTime); */
  
    this.animations.right[PASSIVE_STANDING].update(elapsedTime);
  }
  
  /* Goblin Miner Render Function
   * arguments:
   * - ctx, the rendering context
   * - debug, a flag that indicates turning on
   * visual debugging
   */
  GoblinMiner.prototype.render = function(ctx, debug) {
    // Draw the Goblin Miner (and the correct animation)
    /* if(this.isLeft)
      this.animations.left[this.state].render(ctx, this.currentX, this.currentY);
    else
      this.animations.right[this.state].render(ctx, this.currentX, this.currentY); */
    
	this.animations.right[PASSIVE_STANDING].render(ctx, this.currentX, this.currentY);
	
    if(debug) renderDebug(this, ctx);
  }
  
  // Draw debugging visual elements
  function renderDebug(goblinMiner, ctx) {
    var bounds = goblinMiner.boundingBox();
    ctx.save();
    
    // Draw Goblin Miner bounding box
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
  
  GoblinMiner.prototype.collide = function(otherEntity) {
  	if(otherEntity.type == "player"){
  		return [ATTACKING, 0];
  	}
  }
  
  /* Goblin Miner BoundingBox Function
   * returns: A bounding box representing the Goblin Miner 
   */
  GoblinMiner.prototype.boundingBox = function() {
    return {
      left: this.currentX,
      top: this.currentY,
      right: this.currentX + SIZE,
      bottom: this.currentY + SIZE
    }
  }
  GoblinMiner.prototype.boundingCircle = function() {
     return {
		 cx: this.currentX + SIZE/2,
		 cy: this.currentY + SIZE/2,
		 radius: SIZE/2
	 }
   }
  return GoblinMiner;
  
}());

},{"./animation.js":3,"./entity.js":12}],15:[function(require,module,exports){
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
   const DONE = 42;
   
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
	this.gravity = .5;
	
	this.animations = {
      left: [],
      right: [],
    }
	
	 var GoblinSorcerer = new Image();
	 GoblinSorcerer.src = 'img/GoblinSorcerer.png';
	 
	 this.animations.right[WALKING] = new Animation(GoblinSorcerer, SIZE_X, SIZE_Y, 0,0,20);
	 this.animations.left[WALKING] = new Animation(GoblinSorcerer, SIZE_X, SIZE_Y, 0,0,20);
	 this.animations.right[FALLING] = new Animation(GoblinSorcerer, SIZE_X, SIZE_Y, 0,0,20);
	 this.animations.left[FALLING] = new Animation(GoblinSorcerer, SIZE_X, SIZE_Y, 0,0,20);
	 this.animations.right[IDLE] = new Animation(GoblinSorcerer, SIZE_X, SIZE_Y, 0,0,20);
	 this.animations.left[IDLE] = new Animation(GoblinSorcerer, SIZE_X, SIZE_Y, 0,0,20);
  }
  
  
	GoblinSorcerer.prototype = new Entity();
 
	GoblinSorcerer.prototype.isGrounded = function(tilemap) {
    var box = this.boundingBox(),
      tileX = Math.floor((box.left + (SIZE_X / 2)) / 64),
      tileY = Math.floor(box.bottom / 64),
      tile = tilemap.tileAt(tileX, tileY, this.mapLayer);
    // find the tile we are standing on.
    return (tile && tile.data.solid) ? true : false;
  };

  // Moves the player to the left, colliding with solid tiles
  GoblinSorcerer.prototype.moveLeft = function(distance, tilemap) {
    this.x -= distance;
    var box = this.boundingBox(),
      tileX = Math.floor(box.left / 64),
      tileY = Math.floor(box.bottom / 64) - 1,
      tile = tilemap.tileAt(tileX, tileY, this.mapLayer);
    if (tile && tile.data.solid)
      this.x = (Math.floor(this.x / 64) + 1) * 64;
  };

  // Moves the player to the right, colliding with solid tiles
  GoblinSorcerer.prototype.moveRight = function(distance, tilemap) {
    this.x += distance;
    var box = this.boundingBox(),
      tileX = Math.floor(box.right / 64),
      tileY = Math.floor(box.bottom / 64) - 1,
      tile = tilemap.tileAt(tileX, tileY, this.mapLayer);
    if (tile && tile.data.solid)
      this.x = (Math.ceil(this.x/64)-1) * 64;
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
			if(!sprite.isGrounded(tilemap))
			{
				sprite.state = FALLING;
				sprite.yVelocity = 0;
			}
			else if(Math.abs(player.x - sprite.x) < 512)
			{
				sprite.state = WALKING;
			}
			break;
		  case FALLING:
			if(sprite.isGrounded(tilemap))
			{
				sprite.state = WALKING;
				sprite.y = 64* Math.floor(sprite.y/64);
			}
			sprite.yVelocity += Math.pow(GRAVITY * elapsedTime, 2);
			sprite.y += sprite.yVelocity * elapsedTime;
			break;
		  case WALKING:
			if(!sprite.isGrounded(tilemap))
			{
				sprite.state = FALLING;
				sprite.yVelocity = 0;
			}
			else if(player.isLeft && player.state == WALKING)
			{
				sprite.movingLeft = true;
				sprite.state = WALKING;
				//Determine if we are moving towards or away from the player
				if(player.x > sprite.x)//moving away from player
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
			else if(!(player.isLeft) && player.state == WALKING)
			{
				sprite.movingLeft = true;
				sprite.state = WALKING;
				//Determine if we are moving towards or away from the player
				if(player.x > sprite.x)//moving away from player
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
  }
  
  /* Render function
   * parameters:
   *  - context is the rendering context.  It may be transformed
   *    to account for the camera 
   */
   GoblinSorcerer.prototype.render = function(context, debug) {
     // TODO: Draw your entity sprite
	 if(this.isLeft)
      this.animations.left[this.state].render(context, this.x, this.y);
    else
      this.animations.right[this.state].render(context, this.x, this.y);

    if(this.state != DONE){
		if(debug) renderDebug(this, context);
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
    var tileX = 64 * Math.floor((bounds.left + (SIZE_X / 2)) / 64),
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
   };
   
   /* BoundingCircle function
    * This function returns a bounding circle, i.e.
    * {cx: 0, cy: 0, radius: 20}
    * the circle should contain your entity or at 
    * least the part that can be collided with.
    */
   GoblinSorcerer.prototype.boundingCircle = function() {
     // Return a bounding circle for your entity
	 return {
      cx: this.x + SIZE_X / 2,
      cy: this.y + SIZE_Y / 2,
      radius: SIZE_Y / 2
    };
  };
   
   
   return GoblinSorcerer;
  
}());
},{"./animation.js":3,"./entity-manager.js":11,"./entity.js":12}],16:[function(require,module,exports){
module.exports = (function() { 

  var commands = {	
    RIGHT: 39,
    LEFT: 37,
	  UP: 38,
	  DOWN: 40,
    DIG: 32,
	PAY: 80,
	ATTACK : 65
  }
  
  var oldKeys = [];
  var newKeys = [];
  for(var i = 30; i < 40; i++) {
    oldKeys[i] = false;
    newKeys[i] = false;
  }
  
  function swapBuffers() {
    for(var i = 30; i < 40; i++) {
      oldKeys[i] = newKeys[i];
    }
  }

  function keyDown(event) {
    event.preventDefault();
    newKeys[event.keyCode] = true;
    return false;
  }
  
  function keyUp(event) {
    event.preventDefault();
    newKeys[event.keyCode] = false;
    return false;
  }
  
  function isKeyDown(keyCode) {
    return newKeys[keyCode];
  }
  
  function wasKeyPressed(keyCode) {
    return (!oldKeys[keyCode] && newKeys[keyCode]);
  }
  
  function wasKeyReleased(keyCode) {
    return (oldKeys[keyCode] && !newKeys[keyCode]);
  }
  
  return {
    commands: commands,
    swapBuffers: swapBuffers,
    keyDown: keyDown,
    keyUp: keyUp,
    isKeyDown: isKeyDown,
    wasKeyPressed: wasKeyPressed,
    wasKeyReleased: wasKeyReleased
  }
  
})();
},{}],17:[function(require,module,exports){
/* MainMenu GameState module
 * Provides the main menu for the Diggy Hole game.
 * Authors:
 * - Nathan Bean
 */
module.exports = (function (){
  var menu = document.getElementById("main-menu"),
      play = document.getElementById("play-btn"),
      settings = document.getElementById("settings-btn"),
      credits = document.getElementById("credits-btn"),
      items = [play, settings, credits],
      selectedItemIndex = 0,
      stateManager;
  
  items.forEach( function(item, i) {
    item.onmouseover = function() {
      items[selectedItemIndex].classList.remove("selected");
      selectedItemIndex = i;
      items[selectedItemIndex].classList.add("selected");
    }
  });
  
  /*
   * The Play button exits the menu and returns 
   * to the previous (gameplay) state.  This 
   * should only be called when the stateManager
   * has been set via a load() call.
   */
  play.onclick = function(event) {
    event.preventDefault();
    stateManager.popState();
  }
  
  /* 
   * The Credits button launches the credit menu
   */
  credits.onclick = function(event) {
    event.preventDefault();
    var creditsScreen = require('./credits-screen');
    stateManager.pushState(creditsScreen);
  }
  
  /*
   * The load() method initializes the menu 
   * and tells the DOM to render the menu HTML
   * parameters:
   * - sm the state manager
   */
  var load = function(sm) {
    stateManager = sm;
    menu.style.display = "flex";
    items[selectedItemIndex].classList.add("selected");
  }
  
  /*
   * The exit() method hides the menu
   */
  var exit = function() {
    menu.style.display = "none";
  }
    
  /* 
   * The update() method updates the menu
   * (in this case, a no-op)
   */
  var update = function() {}
  
  /* 
   * The render() method renders the menu
   * (in this case, a no-op as the menu is 
   * HTML elements renderd by the DOM)
   */
  var render = function() {}
    
  /* 
   * The keyDown() method handles 
   * the key down event for the menu.
   */
  var keyDown = function(event) {
    switch(event.keyCode) {
      case 13: // ENTER
      case 32: // SPACE
        event.preventDefault();
        var me = new MouseEvent('click', {
          'view': window,
          'bubbles': true,
          'cancelable': true
        });
        items[selectedItemIndex].dispatchEvent(me);
        break;      
      case 27: // ESC
        event.preventDefault();
        stateManager.popState();
        break;
      case 40: // up
        event.preventDefault();
        items[selectedItemIndex].classList.remove("selected");
        selectedItemIndex++;
        if(selectedItemIndex >= items.length) selectedItemIndex = 0;
        items[selectedItemIndex].classList.add("selected");
        break;
      case 38: // down
        event.preventDefault();
        items[selectedItemIndex].classList.remove("selected");
        selectedItemIndex--;
        if(selectedItemIndex < 0) selectedItemIndex = items.length - 1;
        items[selectedItemIndex].classList.add("selected");
        break;
    }
  }
  
  /* The keyUp() method handles the key up event */
  function keyUp(event) {}
  
  return {
    load: load,
    exit: exit,
    update: update,
    render: render,
    keyDown: keyDown,
    keyUp: keyUp
  }
  
})();
},{"./credits-screen":7}],18:[function(require,module,exports){


// Wait for the window to load completely
window.onload = function() {
  
  var gameTime = 0,
      gameState = [];
    
  var pushState = function(state) {
    state.load({pushState: pushState, popState: popState});
    gameState.push(state);
  }
  
  var popState = function() {
    state = gameState.pop(); 
    if(state) state.exit();
    return state;
  }
  
  var game = require('./game');
  pushState(game);
  
  var mainMenu = require('./main-menu');
  pushState(mainMenu);
  
  // Event handlers for key events
  window.onkeydown = function(event) {
    gameState[gameState.length-1].keyDown(event);
  }
  window.onkeyup = function(event) {
    gameState[gameState.length-1].keyUp(event);
  }
  
  function loop(newTime) {
    var elapsedTime = (newTime - gameTime) / 1000;
    gameTime = newTime;
    gameState[gameState.length-1].update(elapsedTime);
    gameState[gameState.length-1].render(elapsedTime);
    window.requestAnimationFrame(loop);
  }
  window.requestAnimationFrame(loop);
  
};
},{"./game":13,"./main-menu":17}],19:[function(require,module,exports){
/* Noise generation module
 * Authors:
 * - Nathan Bean
 * - Wyatt Watson
 */
module.exports = (function(){
  // Initially, we start with a random seed
  var seed = Math.random();
  
  /* Seeds the random number generator
   * params:
   * - newSeed - the seed to use
   */
  function setSeed(newSeed) {
    seed = newSeed;
  }
  
  /* Taken from http://indiegamr.com/generate-repeatable-random-numbers-in-js/ */
  function randomNumber(min, max){
    min = min || 0;
    max = max || 1;
    
    seed = (seed * 9301 + 49297) % 233280;
    var random = seed/233280;
    
    return min + random * (max - min);
  }

  /* The following functions were done in tandem with the tutorial at 
  http://devmag.org.za/2009/04/25/perlin-noise/ and following along through
  Nathan Bean's Perlin Noise file*/

  function generateNoise(width, height){
    var noise = new Array(width*height);
    
    for (i = 0; i < width; i++){
      for (j = 0; j < height; j++){
        noise[j * width + i] = (randomNumber(0, 1269.5));
      }
    }
    
    return noise;
  }

  function generateSmoothNoise(mapWidth, noise, octave){
    var width = mapWidth;
    var height = noise.length / width;
    
    var smoothNoise = new Array(width*height);
    
    var samplePeriod = Math.floor(Math.pow(2, octave));
    var sampleFrequency = 1.0 / samplePeriod;
    
    for (i = 0; i < width; i++){
      var sample_i0 = Math.floor(Math.floor(i / samplePeriod) * samplePeriod);
      var sample_i1 = Math.floor((sample_i0 + samplePeriod) % width);
      var horizontal_blend = (i - sample_i0) * sampleFrequency;
      
      for (j = 0; j < height; j++){
        var sample_j0 = Math.floor(Math.floor(j / samplePeriod) * samplePeriod);
        var sample_j1 = Math.floor((sample_j0 + samplePeriod) % height);
        var vertical_blend = (j - sample_j0) * sampleFrequency;
        
        var top = Interpolate(noise[sample_j0 * width + sample_i0], 
          noise[sample_j0 * width + sample_i1], horizontal_blend);
        
        var bottom = Interpolate(noise[sample_j1 * width + sample_i0], 
          noise[sample_j1 * width + sample_i1], horizontal_blend);
      
        smoothNoise[j * width + i] = Interpolate(top, bottom, vertical_blend);
      }
    }
    
    return smoothNoise;
  }

  function Interpolate(x0, x1, alpha){
    return x0 * (1-alpha) + alpha * x1;
  }

  function generatePerlinNoise(mapWidth, noise, octave){
    var width = mapWidth;
    var height = noise.length / width;
    
    var smoothNoise = new Array(octave);
    
    var persistance = 0.5;
    
    for (x = 0; x < octave; x++){
      smoothNoise[x] = generateSmoothNoise(mapWidth, noise, x);}
    
    var perlinNoise = new Array(width*height);
    var amplitude = 1.0;
    var totalAmplitude = 0.0;
    
    for (o = octave - 1; o >= 0; o--){
      amplitude *= persistance;
      totalAmplitude += amplitude;
      
      for (i = 0; i < width; i++){
        for (j = 0; j < height; j++){
          perlinNoise[j * width + i] = smoothNoise[o][j * width + i] * amplitude;
        }
      }
    }
    
    for (i = 0; i < width; i++){
      for (j = 0; j < height; j++){
        perlinNoise[j * width + i] = perlinNoise[j * width + i] / totalAmplitude;
      }
    }
    
    return perlinNoise;
  }
  /*END PERLIN NOISE TUTORIAL/CODE*/
  
  return {
    setSeed: setSeed,
    randomNumber: randomNumber,
    generateNoise: generateNoise,
    generateSmoothNoise: generateSmoothNoise,
    generatePerlinNoise: generatePerlinNoise,
  }

}());
},{}],20:[function(require,module,exports){
/**
 * Created by Jessica on 11/8/15.
 */

module.exports = function () {

    var Entity = require('./entity.js'),
        OctopusAnimation = require('./octopus_animation.js');


    //const STANDING = 0;
    const WALKING = 1;
    const JUMPING = 2;
    const ATTACKING = 3;
    const FALLING = 4;

    const SIZE = 64;

    const SPEED = 150;
    const GRAVITY = -250;
    const JUMP_VELOCITY = -600;

    const IMG_WIDTH = 240;
    const IMG_HEIGH = 309;

    var oct = new Image();
    oct.src = 'octopus.png';

    function Octopus(locationX, locationY, layerIndex) {
        this.state = WALKING;
        this.layerIndex = layerIndex;
        this.currentX = locationX;
        this.currentY = locationY;
        this.gravity = 0.5;
        this.xSpeed = 10;
        this.ySpeed = 15;
        this.animations = [];
        this.isLeft = false;
        this.type = "magicOctopus";

        //this.animations[STANDING] = new OctopusAnimation(oct, IMG_WIDTH, IMG_HEIGH, SIZE, 0, 0);
        this.animations[WALKING] = new OctopusAnimation(oct, IMG_WIDTH, IMG_HEIGH, SIZE, 0, 0, 4);
        this.animations[JUMPING] = new OctopusAnimation(oct, IMG_WIDTH, IMG_HEIGH, SIZE, 0, IMG_HEIGH, 4);
        this.animations[FALLING] = new OctopusAnimation(oct, IMG_WIDTH, IMG_HEIGH, SIZE, 0, 0);
        this.animations[ATTACKING] = new OctopusAnimation(oct, IMG_WIDTH, IMG_HEIGH, SIZE, 0, IMG_HEIGH * 2, 4);

    }

    Octopus.prototype = new Entity();

    Octopus.prototype.onGround = function (tilemap) {
        var box = this.boundingBox(),
            tileX = Math.floor((box.left + (SIZE / 2)) / 64),
            tileY = Math.floor(box.bottom / 64);
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
        return (tile && tile.data.solid) ? true : false;
    };

    Octopus.prototype.moveLeft = function (distance, tilemap) {
        this.currentX -= distance;
        var box = this.boundingBox(),
            tileX = Math.floor(box.left / 64),
            tileY = Math.floor(box.bottom / 64) - 1,
            tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
        if (tile && tile.data.solid)
            this.currentX = (Math.floor(this.currentX / 64) + 1) * 64;
    };

    Octopus.prototype.moveRight = function (distance, tilemap) {
        this.currentX += distance;
        var box = this.boundingBox(),
            tileX = Math.floor(box.right / 64),
            tileY = Math.floor(box.bottom / 64) - 1,
            tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
        if (tile && tile.data.solid)
            this.currentX = (Math.ceil(this.currentX / 64) - 1) * 64;
    };

    Octopus.prototype.getPlayerPosition = function(playerPosition) {

        console.log(playerPosition.top + " " + this.currentY);

        if (playerPosition.top <= this.currentY - 64) {
            this.state = JUMPING;
            this.velocityY = JUMP_VELOCITY;
        } else if (playerPosition.left > this.currentX + 64) {
            this.state = WALKING;
            this.isLeft = false;
        } else if (playerPosition.left < this.currentX - 64) {
            this.state = WALKING;
            this.isLeft = true;
        }

    };

    Octopus.prototype.update = function(elapsedTime, tilemap) {

        switch(this.state) {
            //case STANDING:
            case WALKING:
                // If there is no ground underneath, fall
                if (!this.onGround(tilemap)) {
                    this.state = FALLING;
                    this.velocityY = 0;
                }
                if (this.isLeft == true) {
                    this.moveLeft(elapsedTime * SPEED, tilemap);
                } else {
                    this.moveRight(elapsedTime * SPEED, tilemap);
                }

                break;
            case JUMPING:
                this.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
                this.currentY += this.velocityY * elapsedTime;
                if (this.velocityY > 0) {
                    this.state = FALLING;
                }
                break;
            case FALLING:
                this.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
                this.currentY += this.velocityY * elapsedTime;
                if (this.onGround(tilemap)) {
                    this.state = WALKING;
                    this.currentY = 64 * Math.floor(this.currentY / 64);
                }
                break;
        }
        this.animations[this.state].update(elapsedTime);

     };

    function renderDebug(player, ctx) {
        var bounds = player.boundingBox();
        ctx.save();

        // Draw player bounding box
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(bounds.left, bounds.top);
        ctx.lineTo(bounds.right, bounds.top);
        ctx.lineTo(bounds.right, bounds.bottom);
        ctx.lineTo(bounds.left, bounds.bottom);
        ctx.closePath();
        ctx.stroke(); // Outline tile underfoot
        var tileX = 64 * Math.floor((bounds.left + (SIZE / 2 )) / 64),
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


    Octopus.prototype.render = function (context, debug) {
        this.animations[this.state].render(context, this.currentX, this.currentY);

        if (debug) renderDebug(this, context);
    };

    Octopus.prototype.collide = function (otherEntity) {
        if (otherEntity.type != "player") {
            if (this.onGround(tilemap)) {
                this.state = ATTACKING;
            }
        }
    };

    Octopus.prototype.boundingBox = function () {
        return {
            left: this.currentX,
            top: this.currentY,
            right: this.currentX + SIZE,
            bottom: this.currentY + SIZE
        }
    };

    Octopus.prototype.boundingCircle = function () {
        return {
            cx: this.currentX + SIZE / 2,
            cy: this.currentY + SIZE / 2,
            radius: SIZE / 2
        }
    };

    return Octopus;

}();


},{"./entity.js":12,"./octopus_animation.js":21}],21:[function(require,module,exports){
/**
 * Created by Jessica on 11/8/15.
 */
module.exports = (function() {

    function OctopusAnimation(image, srcWidth, srcHeight, size, top, left, numberOfFrames, secondsPerFrame) {
        this.frameIndex = 0;
        this.time = 0;
        this.secondsPerFrame = secondsPerFrame || (1/16);
        this.numberOfFrames = numberOfFrames || 1;

        this.srcWidth = srcWidth;
        this.srcHeight = srcHeight;
        this.size = size;
        this.image = image;

        this.drawLocationX = top || 0;
        this.drawLocationY = left || 0;
    }

    OctopusAnimation.prototype.setStats = function(frameCount, locationX, locationY){
        this.numberOfFrames = frameCount;
        this.drawLocationY = locationY;
        this.drawLocationX = locationX;
    };

    OctopusAnimation.prototype.update = function (elapsedTime, tilemap) {
        this.time += elapsedTime;

        // Update animation
        if (this.time > this.secondsPerFrame) {
            if(this.time > this.secondsPerFrame) this.time -= this.secondsPerFrame;

            // If the current frame index is in range
            if (this.frameIndex < this.numberOfFrames - 1) {
                this.frameIndex += 1;
            } else {
                this.frameIndex = 0;
            }
        }
    };

    OctopusAnimation.prototype.render = function(ctx, x, y) {

        // Draw the current frame
        ctx.drawImage(
            this.image,
            this.drawLocationX + this.frameIndex * this.srcWidth,
            this.drawLocationY,
            this.srcWidth,
            this.srcHeight,
            x,
            y,
            this.size,
            this.size);
    };



    return OctopusAnimation;

}());
},{}],22:[function(require,module,exports){
/* Player module
 * Implements the entity pattern and provides
 * the DiggyHole player info.
 * Authors:
 * - Wyatt Watson
 * - Nathan Bean
 */
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
  const SIZE = 64;

  // Movement constants
  const SPEED = 150;
  const GRAVITY = -250;
  const JUMP_VELOCITY = -600;

  //The Right facing dwarf spritesheet
  var dwarfRight = new Image();
  dwarfRight.src = 'DwarfAnimatedRight.png';

  //The left facing dwarf spritesheet
  var dwarfLeft = new Image();
  dwarfLeft.src = "DwarfAnimatedLeft.png";
  
   var ratRight = new Image();
  ratRight.src = 'img/ratRight2.png';

  var ratLeft = new Image();
  ratLeft.src = "img/ratLeft2.png";

  //The Player constructor
  function Player(locationX, locationY, layerIndex, inputManager) {
    this.inputManager = inputManager;
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
    this.gravity = 0.5;
    this.angle = 0;
    this.xSpeed = 10;
    this.ySpeed = 15;
    this.isLeft = false;
    this.type = "player";

    //The animations
    this.animations = {
      left: [],
      right: []
    };

    //The right-facing animations
    this.animations.right[STANDING] = new Animation(dwarfRight, SIZE, SIZE, SIZE * 2, SIZE);
    this.animations.right[WALKING] = new Animation(dwarfRight, SIZE, SIZE, 0, 0, 4);
    this.animations.right[JUMPING] = new Animation(dwarfRight, SIZE, SIZE, SIZE * 3, 0);
    this.animations.right[DIGGING] = new Animation(dwarfRight, SIZE, SIZE, 0, SIZE * 2, 4);
    this.animations.right[FALLING] = new Animation(dwarfRight, SIZE, SIZE, SIZE, SIZE);
    this.animations.right[SWIMMING] = new Animation(dwarfRight, SIZE, SIZE, 0, 0, 4);

    //The left-facing animations
    this.animations.left[STANDING] = new Animation(dwarfLeft, SIZE, SIZE, SIZE * 2, SIZE);
    this.animations.left[WALKING] = new Animation(dwarfLeft, SIZE, SIZE, 0, 0, 4);
    this.animations.left[JUMPING] = new Animation(dwarfLeft, SIZE, SIZE, SIZE * 3, 0);
    this.animations.left[DIGGING] = new Animation(dwarfLeft, SIZE, SIZE, 0, SIZE * 2, 4);
    this.animations.left[FALLING] = new Animation(dwarfLeft, SIZE, SIZE, SIZE, SIZE);
    this.animations.left[SWIMMING] = new Animation(dwarfLeft, SIZE, SIZE, 0, 0, 4);
  }

  // Player inherits from Entity
  Player.prototype = new Entity();

  // Determines if the player is on the ground
  Player.prototype.onGround = function(tilemap) {
    var box = this.boundingBox(),
      tileX = Math.floor((box.left + (SIZE / 2)) / 64),
      tileY = Math.floor(box.bottom / 64),
      tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    // find the tile we are standing on.
    return (tile && tile.data.solid) ? true : false;
  };

  // Moves the player to the left, colliding with solid tiles
  Player.prototype.moveLeft = function(distance, tilemap) {
    this.currentX -= distance;
    var box = this.boundingBox(),
      tileX = Math.floor(box.left / 64),
      tileY = Math.floor(box.bottom / 64) - 1,
      tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid)
      this.currentX = (Math.floor(this.currentX / 64) + 1) * 64;
  };

  // Moves the player to the right, colliding with solid tiles
  Player.prototype.moveRight = function(distance, tilemap) {
    this.currentX += distance;
    var box = this.boundingBox(),
      tileX = Math.floor(box.right / 64),
      tileY = Math.floor(box.bottom / 64) - 1,
      tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid)
      this.currentX = (Math.ceil(this.currentX/64)-1) * 64;
  };
  /* Player update function
   * arguments:
   * - elapsedTime, the time that has passed
   *   between this and the last frame.
   * - tilemap, the tilemap that corresponds to
   *   the current game world.
   */
  Player.prototype.update = function(elapsedTime, tilemap) {
    var sprite = this;

    // The "with" keyword allows us to change the
    // current scope, i.e. 'this' becomes our
    // inputManager
    with(this.inputManager) {

      // Process player state
      switch (sprite.state) {
        case STANDING:
        case WALKING:
          // If there is no ground underneath, fall
          if (!sprite.onGround(tilemap)) {
            sprite.state = FALLING;
            sprite.velocityY = 0;
          } else {
            if (isKeyDown(commands.DIG)) {
              sprite.state = DIGGING;
            } else if (isKeyDown(commands.UP)) {
              sprite.state = JUMPING;
              sprite.velocityY = JUMP_VELOCITY;
            } else if (isKeyDown(commands.LEFT)) {
              sprite.isLeft = true;
              sprite.state = WALKING;
              sprite.moveLeft(elapsedTime * SPEED, tilemap);
            } else if (isKeyDown(commands.RIGHT)) {
              sprite.isLeft = false;
              sprite.state = WALKING;
              sprite.moveRight(elapsedTime * SPEED, tilemap);
            } else {
              sprite.state = STANDING;
            }
          }
          break;
        case DIGGING:
          var box = this.boundingBox(),
            tileX = Math.floor((box.left + (SIZE / 2)) / 64),
            tileY = Math.floor(box.bottom / 64);
          tilemap.setTileAt(7, tileX, tileY, 0);
          sprite.state = FALLING;
          break;
        case JUMPING:
          sprite.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
          sprite.currentY += sprite.velocityY * elapsedTime;
          if (sprite.velocityY > 0) {
            sprite.state = FALLING;
          }
          if (isKeyDown(commands.LEFT)) {
            sprite.isLeft = true;
            sprite.moveLeft(elapsedTime * SPEED, tilemap);
          }
          if (isKeyDown(commands.RIGHT)) {
            sprite.isLeft = true;
            sprite.moveRight(elapsedTime * SPEED, tilemap);
          }
          break;
        case FALLING:
          sprite.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
          sprite.currentY += sprite.velocityY * elapsedTime;
          if (sprite.onGround(tilemap)) {
            sprite.state = STANDING;
            sprite.currentY = 64 * Math.floor(sprite.currentY / 64);
          } else if (isKeyDown(commands.LEFT)) {
            sprite.isLeft = true;
            sprite.moveLeft(elapsedTime * SPEED, tilemap);
          } else if (isKeyDown(commands.RIGHT)) {
            sprite.isLeft = false;
            sprite.moveRight(elapsedTime * SPEED, tilemap);
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

  /* Player Render Function
   * arguments:
   * - ctx, the rendering context
   * - debug, a flag that indicates turning on
   * visual debugging
   */
  Player.prototype.render = function(ctx, debug) {
    // Draw the player (and the correct animation)
    if (this.isLeft)
      this.animations.left[this.state].render(ctx, this.currentX, this.currentY);
    else
      this.animations.right[this.state].render(ctx, this.currentX, this.currentY);

    if (debug) renderDebug(this, ctx);
  };

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

  /* Player BoundingBox Function
   * returns: A bounding box representing the player
   */
  Player.prototype.boundingBox = function() {
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

  return Player;

}());

},{"./animation.js":3,"./entity.js":12}],23:[function(require,module,exports){
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
},{"./animation.js":3,"./entity.js":12}],24:[function(require,module,exports){
/* Stone monster module
 * Implements the entity pattern
 * Authors:
 * - Filip Stanek
 */
module.exports = (function(){
    var Entity = require('./entity.js'),
        Animation = require('./animation.js'),
        Player = require('./player.js');

    const SIZE = 64;
    const GRAVITY = -250;
    const SPEED = 50;

    // StoneMonster States
    const WAITING = 0;
    const MOVING = 1;
    const FALLING = 2;
    const SMASHED = 3;
    const STUCK = 4;

    const SPRITE_WIDTH = 82;
    const SPRITE_HEIGHT = 80;

    const CLOSE_TO_PLAYER = SIZE * 4;
    const WAIT_TIME = 3;

    const TIME_TO_LIVE = 25;

    function StoneMonster(locationX, locationY, layerIndex) {
        this.type = "StoneMonster";
        this.layerIndex = layerIndex;
        this.currentX = locationX;
        this.currentY = locationY;
        this.speedY = 0;
        this.state = MOVING;
        this.isMovingRight = true;
        this.bounced = false;
        this.waitingTime = 0;
        this.timeToLive = TIME_TO_LIVE;
        this.renderBoundingCircle = false;

        this.idle_image = new Image();
        this.idle_image.src = './stone-monster-img/stone_monster_idle.png';


        var moving_image_left = new Image();
        moving_image_left.src = './stone-monster-img/stone-monster-moving-left.png';
        var moving_image_right = new Image();
        moving_image_right.src = './stone-monster-img/stone-monster-moving-right.png';
        var destroyed_image = new Image();
        destroyed_image.src = './stone-monster-img/stone_monster_destroyed.png';

        this.animation_right = new Animation(moving_image_right, SPRITE_WIDTH, SPRITE_HEIGHT, 0, 0, 8, 0.1);
        this.animation_left = new Animation(moving_image_left, SPRITE_WIDTH, SPRITE_HEIGHT, 0, 0, 8, 0.1);
        this.animation_destroyed = new Animation(destroyed_image, SIZE, SIZE, 0, 0, 8, 0.05, true);
    }

    StoneMonster.prototype = new Entity();

    StoneMonster.prototype.moveLeft = function(distance, tilemap) {
        this.currentX -= distance;
        var box = this.boundingBox(),
            tileX = Math.floor(box.left/64),
            tileY = Math.floor(box.bottom / 64) - 1,
            tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
        if (tile && tile.data.solid) {
            this.currentX = (Math.floor(this.currentX / 64) + 1) * 64;
            return true;
        }
        return false;
    };

    StoneMonster.prototype.moveRight = function(distance, tilemap) {
        this.currentX += distance;
        var box = this.boundingBox(),
            tileX = Math.floor(box.right/64),
            tileY = Math.floor(box.bottom / 64) - 1,
            tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
        if (tile && tile.data.solid) {
            this.currentX = (Math.ceil(this.currentX / 64) - 1) * 64;
            return true;
        }
        return false;
    };

    StoneMonster.prototype.move = function(elapsedTime, tilemap, entityManager){
        var collided = false;
        if(this.isMovingRight){
            collided = this.moveRight(elapsedTime * SPEED, tilemap);
        }
        else{
            collided = this.moveLeft(elapsedTime * SPEED, tilemap);
        }
        if(collided){
            if(this.bounced){
                this.state = STUCK;
                return;
            }
            this.isMovingRight = !this.isMovingRight;
            this.bounced = true;
        }
        else if(!this.bounced){
            var player = entityManager.getPlayer();
            if (player) {
                if (this.currentX < player.currentX - CLOSE_TO_PLAYER) {
                    this.isMovingRight = true;
                }
                else if (this.currentX > player.currentX + CLOSE_TO_PLAYER) {
                    this.isMovingRight = false;
                }
                else if (this.currentY > player.currentY){
                    this.state = WAITING;
                }
            }
        }
    };

    StoneMonster.prototype.update = function(elapsedTime, tilemap, entityManager) {
        switch (this.state) {
            case WAITING:
                this.waitingTime += elapsedTime;
                if (this.waitingTime < WAIT_TIME) {
                    break;
                }
                var player = entityManager.getPlayer();
                if (player && (this.currentX <= 64*Math.floor((player.currentX - CLOSE_TO_PLAYER)/64)
                    || this.currentX >= 64*Math.floor((player.currentX + CLOSE_TO_PLAYER)/64)
                    || this.currentY < player.currentY )) {
                    this.waitingTime = 0;
                    this.state = MOVING;
                }
                break;
            case MOVING:
                if (!this.onGround(tilemap)) {
                    this.state = FALLING;
                    this.speedY = 0;
                    break;
                }
                this.move(elapsedTime, tilemap, entityManager);
                break;
            case FALLING:
                this.bounced = false;
                this.speedY += Math.pow(GRAVITY * elapsedTime, 2);
                this.currentY += this.speedY * elapsedTime;
                if (this.onGround(tilemap)) {
                    this.state = MOVING;
                    this.currentY = 64 * Math.floor(this.currentY / 64);
                }
                break;
            case SMASHED:
                this.animation_destroyed.update(elapsedTime);
                this.timeToLive -= elapsedTime;
                if(this.timeToLive < 0){
                    entityManager.remove(this);
                }
                break;
            case STUCK:
                var player = entityManager.getPlayer();
                if (player && (this.currentX <= 64*Math.floor((player.currentX - CLOSE_TO_PLAYER)/64)
                    || this.currentX >= 64*Math.floor((player.currentX + CLOSE_TO_PLAYER)/64)
                    || this.currentY < player.currentY )) {
                    this.timeToLive -= elapsedTime;
                }
                else{
                    this.timeToLive = TIME_TO_LIVE;
                }
                if(this.timeToLive < 0){
                    entityManager.remove(this);
                }
                break;
        }
        if (this.state == MOVING) {
            if (this.isMovingRight) {
                this.animation_right.update(elapsedTime);
            }
            else {
                this.animation_left.update(elapsedTime);
            }
        }
    };

    StoneMonster.prototype.render = function(ctx, debug) {
        if(this.state == WAITING || this.state == FALLING || this.state == STUCK) {
            ctx.drawImage(this.idle_image, this.currentX, this.currentY);
        }
        else if(this.state == MOVING) {
            if(this.isMovingRight){
                this.animation_right.render(ctx, this.currentX - 19, this.currentY - 16);
            }
            else {
                this.animation_left.render(ctx, this.currentX, this.currentY - 16);
            }
        }
        else if(this.state == SMASHED){
            this.animation_destroyed.render(ctx, this.currentX, this.currentY);
        }
        if(debug){
            this.renderDebug(ctx);
        }
    };

    StoneMonster.prototype.renderDebug = function(ctx) {
        var bounds = this.boundingBox();
        ctx.save();
        ctx.strokeStyle = "purple";
        ctx.beginPath();
        ctx.moveTo(bounds.left, bounds.top);
        ctx.lineTo(bounds.right, bounds.top);
        ctx.lineTo(bounds.right, bounds.bottom);
        ctx.lineTo(bounds.left, bounds.bottom);
        ctx.closePath();
        ctx.stroke();
        if(this.renderBoundingCircle){
            var boundingCircle = this.boundingCircle();
            ctx.beginPath();
            ctx.arc(boundingCircle.cx, boundingCircle.cy, boundingCircle.radius, 0, 2*Math.PI);
            ctx.closePath();
            ctx.stroke();
        }
        ctx.restore();
    };

    StoneMonster.prototype.onGround = function(tilemap) {
        var box = this.boundingBox(),
            tileX = Math.floor((box.left + (SIZE/3))/64),
            tileY = Math.floor(box.bottom / 64),
            tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
        return (tile && tile.data.solid) ? true : false;
    };

    StoneMonster.prototype.boundingBox = function() {
        return {
            left: this.currentX,
            top: this.currentY,
            right: this.currentX + SIZE,
            bottom: this.currentY + SIZE
        }
    };

    StoneMonster.prototype.boundingCircle = function() {
        return {
            cx: this.currentX + SIZE/2,
            cy: this.currentY + SIZE/2,
            radius: Math.sqrt(2*SIZE*SIZE)/2
        }
    };

    StoneMonster.prototype.collide = function(otherEntity){
        if(!otherEntity || otherEntity instanceof StoneMonster){
            return;
        }
        if(otherEntity instanceof Player && this.state != FALLING
            && otherEntity.currentY + SIZE/2 <= this.currentY){
            this.state = SMASHED;
        }
        var entityRect = otherEntity.boundingBox();
        var thisRect = this.boundingBox();


        if(entityRect.bottom > thisRect.top){
            if(otherEntity instanceof Player) {
                otherEntity.currentY = thisRect.top - SIZE - 2;
                if (this.state == SMASHED) {
                    //otherEntity.health -= DAMAGE;
                    console.log("damage");
                }
            }
        }
        else if(entityRect.right - SIZE/3 >= thisRect.left){
            otherEntity.currentX -= (entityRect.right - thisRect.left);
        }
        else if(entityRect.left - SIZE/3 <= thisRect.right){
            console.log(thisRect.right - entityRect.left);
            otherEntity.currentX = this.currentX + SIZE + 2;
        }
    };

    return StoneMonster;
}());
},{"./animation.js":3,"./entity.js":12,"./player.js":22}],25:[function(require,module,exports){
/* Tilemap engine providing the static world
 * elements for Diggy Hole
 * Authors:
 * - Nathan Bean 
 * - Wyatt Watson
 */
module.exports = (function (){
  var noisy = require('./noise.js'),
      tiles = [],
      tilesets = [],
      layers = [],
      tileWidth = 0,
      tileHeight = 0,
      mapWidth = 0,
      mapHeight = 0,
      cameraX = 0,
      cameraY = 0,
      viewportHalfWidth = 0,
      viewportHalfHeight = 0,
      viewportTileWidth = 0,
      viewportTileHeight = 0,
	  tileset;
   
  /* Clamps the provided value to the provided range
   * Arguments:
   * - value, the value to clamp
   * - min, the minimum of the range to clamp value to
   * - max, the maximum of the range to clamp value to
   * Returns:
   *   The clamped value.
   */   
  function clamp(value, min, max) {
    return (value < min ? min : (value > max ? max : value));
  }
  
  /* Resizes the viewport.
   * Arguments:
   * - width, the width of the viewport
   * - height, the height of hte viewport
   */   
  var setViewportSize = function(width, height) {
    viewportHalfWidth = width / 2;
    viewportHalfHeight = height / 2;
    viewportTileWidth = Math.ceil(width / tileWidth) + 2;
    viewportTileHeight = Math.ceil(height / tileHeight) + 2;
  }
  
  /* Sets the camera position
   * Arguments:
   * - x, the upper-left hand x-coordinate of the viewport
   * - y, the upper-left-hand y-coordinate of the viewport
   */
  var setCameraPosition = function(x, y) {
    cameraX = x;
    cameraY = y;
  }
   
  /* Loads the tilemap 
   * - mapData, the JavaScript object
   * - options, options for loading, currently:
   *  > onload, a callback to trigger once the load finishes
   */   
  var load = function(mapData, options) {
      
    var loading = 0;
    
    // Release old tiles & tilesets
    tiles = [];
    tilesets = [];
    
    // Resize the map
    tileWidth = mapData.tilewidth;
    tileHeight = mapData.tileheight;
    mapWidth = mapData.width;
    mapHeight = mapData.height;
    
    if(options.viewport) 
      setViewportSize(options.viewport.width, options.viewport.height);
    else
      setViewportSize(mapData.width * mapData.tilewidth, mapData.height * mapData.tileheight);
    
    // Load the tileset(s)
    mapData.tilesets.forEach( function(tilesetmapData, index) {
      // Load the tileset image
      tileset = new Image();
      loading++;
      tileset.onload = function() {
        loading--;
        if(loading == 0 && options.onload) options.onload();
      }
      tileset.src = tilesetmapData.image;
      tilesets.push(tileset);
      
      // Create the tileset's tiles
      var colCount = Math.floor(tilesetmapData.imagewidth / tileWidth),
          rowCount = Math.floor(tilesetmapData.imageheight / tileHeight),
          tileCount = colCount * rowCount;
      for(i = 0; i < tileCount; i++) {
        var data = {}
        for (var key in tilesetmapData.tileproperties[i]) {
          data[key] = tilesetmapData.tileproperties[i][key];
        }
        var tile = {
          // Reference to the image, shared amongst all tiles in the tileset
          image: tileset,
          // Source x position.  i % colCount == col number (as we remove full rows)
          sx: (i % colCount) * tileWidth,
          // Source y position. i / colWidth (integer division) == row number 
          sy: Math.floor(i / rowCount) * tileHeight,
          // The tile's data (solid/liquid, etc.)
          data: data
        }
        tiles.push(tile);
      }
    });
    
    // Parse the layers in the map
    mapData.layers.forEach( function(layerData) {
      
      // Tile layers need to be stored in the engine for later
      // rendering
      if(layerData.type == "tilelayer") {
        // Create a layer object to represent this tile layer
        var layer = {
          name: layerData.name,
          width: layerData.width,
          height: layerData.height,
          visible: layerData.visible
        }
      
        // Set up the layer's data array.  We'll try to optimize
        // by keeping the index data type as small as possible
        if(tiles.length < Math.pow(2,8))
          layer.data = new Uint8Array(layerData.data);
        else if (tiles.length < Math.Pow(2, 16))
          layer.data = new Uint16Array(layerData.data);
        else 
          layer.data = new Uint32Array(layerData.data);
      
        // save the tile layer
        layers.push(layer);
      }
    });
  }

  /* Generates a random tilemap
   * Arguments:
   * - width, the width of the tilemap
   * - height, the height of the tilemap
   * - options, options to trigger
   */
  var generate = function(width, height, options) {
    var map = new Array(width*height);
    var noise = noisy.generateNoise(width, height);
    noise = noisy.generatePerlinNoise(width, noise, 7);
    
    var tileWidth = 64, tileHeight = 64;
    var tilesets = [
      {
        firstgid: 0,
        image: "Tileset.png",
        imageheight: 256,
        imagewidth: 256,
        margin: 0,
        name: "Tileset",
        tileproperties: {
          0: { // Sky background
            type: "SkyBackground",
          },
          1: { // Clouds
             type: "Clouds",
          },
          2: { // Sky Earth
            type: "Sky Earth",
            solid: true
          },
          3: { // Gems w grass
            type: "GemsWithGrass",
            solid: true,
            gems: true
          },
          4: { // Dirt w grass
            type: "DirtWithGrass",
            solid: true
          },
          5: { // Stone w grass
            type: "StoneWithGrass",
            solid: true
          },
          6: { // Water
            type: "Water",
            liquid: true
          },
          7: { // Cave background
            type: "CaveBackground",
          },
          8: { // Gems
            type: "Gems",
            solid: true,
            gems: true
          },
          9: { // dirt
            type: "Dirt",
            solid: true,
          },
          10: { // stone
            type: "Stone",
            solid: true,
          },
          11: { // water
            type: "Water",
            liquid: true
          },
          12: { // cave background
            type: "CaveBackground",
          },
          13: { // lava
            type: "Lava",
            liquid: true,
            damage: 10,
          },
          14: { // dark background
            type: "DarkBackground",
          },
          15: { // dug background
            type: "DugBackground",
          }
        },
        spacing: 0,
        tilewidth: 64,
        tileheight: 64
      }
    ]
    
    // Determines where the surface is (and end of the sky)
    var surface = Math.floor(noisy.randomNumber(Math.floor(height*1/8), Math.floor(height*2/8)));  
    this.surface = surface;
    // Determines where the crust layer of the earth ends
    var midEarth = Math.floor(noisy.randomNumber(Math.floor(height*3/8), Math.floor(height*5/8)) + surface);
	
    // Used to help clump up the sky islands
    var skyEarthCount = 0;
    var cloudCount = 0;
  
    /* As a key the tile numbers are as follows:
     * SkyBackground: 0, Clouds: 1, SkyEarth: 2, GemsWithGrass: 3, DirtWithGrass: 4, StoneWithGrass: 5, Water: 6,
     * CaveBackground: 7, Gems: 8, Dirt: 9, Stone: 10, Water(Again): 11, CaveBackground(Again): 12, Lava: 13, DarkBackground: 14, DugTile: 15
     * you can replace any of the tiles that are unwanted (or wanted) at any point and it will preserve initial functionality*/
    for(j = 0; j < height; j++){
      var rand = noisy.randomNumber(0, 3);
      var rand2 = noisy.randomNumber(0, 1);
      for(i = 0; i < width; i++){
        var index = j * width + i;
        var temp = noise[index];
        //Ensure first row is sky
        if(j == 0){
          map[index] = 1;
        }
        //Sky Area
        else if(j < surface-2){
          if(temp < 8 && skyEarthCount == 0 && cloudCount == 0){ //Sky Background
            map[index] = 1;
          }
          else if(temp < 9.4 && skyEarthCount == 0){ //Clouds
            map[index] = 2;
            cloudCount++;
            if(cloudCount > rand2){
              rand2 = noisy.randomNumber(0, 3);
              cloudCount = 0;
            }
          }
          else{ //Sky Earth
            map[index] = 3;
            skyEarthCount++;
            if(skyEarthCount > rand){
              skyEarthCount = 0;
              rand = noisy.randomNumber(0, 3);
            }
          }
        }
        //Ensure row before the surface is sky
        else if(j < surface){
          map[index] = 1;
        }
        //Surface blocks - Start of Crust Layer
        else if(j == surface){ 
          if(temp < .5){ //Gems w grass
            map[index] = 4;
          }
          else if(temp < 5){ //Dirt w grass
            map[index] = 5;
          }
          else if(temp < 6){ //Stone w grass
            map[index] = 6;
          }
          else if(temp < 8){ //Water 
            map[index] = 7;
          }
          else{ //Cave Background
            map[index] = 13;
          }
        }
        //Crust Area
        else if(j < midEarth-1){
          if(temp < .5){ //Gems
            map[index] = 9;
          }
          else if(temp < 4){ //Dirt
            map[index] = 10;
          }
          else if(temp < 6){ //Stone
            map[index] = 11;
          }
          else if(temp < 8){ //Water 11
            map[index] = 12;
          }
          else{ //Cave Background
            map[index] = 13;
          }
        }
        //Solid layer between crust and deep earth
        else if(j < midEarth){
          if(temp < .5){ //Gems
            map[index] = 9;
          }
          else if(temp < 4){ //Dirt
            map[index] = 10;
          }
          else if(temp < 6){ //Stone
            map[index] = 11;
          }
          else if(temp < 8){ //Water 11
            map[index] = 10;
          }
          else{ //Cave Background
            map[index] = 11;
          }
        }
        //Deep Earth
        else{
          if(temp < 4){ // Lava
            map[index] = 14;
          }
          else if(temp < 6){ // Stone
            map[index] = 11;
          }
          else{ // Dark Background
            map[index] = 15;
          }
        }
		
      }
    }
    
    // Create mapData object
    var mapData = {
      height: height,
      width: width,
      tilewidth: tileWidth,
      tileheight: tileHeight,
      layers: [{
          data: map,
          name: "Interaction Layer",
          type: "tilelayer",
          height: height,
          width: width,
          visible: true,
          x: 0,
          y: 0
      }],
      tilesets: tilesets,
      options: options
    }
    return load(mapData, options);
  }
  
  
  
  /* GenerateObjectMap generates an object map based on the previously generated game map
   * mapWidth - the overall map's width
   * map - the game map
   * returns: the object map */
  function GenerateObjectMap(mapWidth, map){
    var width = mapWidth;
    var height = map.length / width;

    /* 0 - SB, 1 - C, 2 - SE
       3 - G, 4 - D, 5 - S, 6 - W, 7 - CB
       8      9      10     11     12
       13 - L, 14 - S, 15 - DB */
    
    var objectMap = new Array(width*height);
    var surface = 0;
    
    /* 0 - Nothing
       1 - Player
       2 - Enemy */
    
    /* place enemies (NOT FULLY IMPLEMENTED) and locates the surface of the game map */
    for(i = 0; i < width; i++){
      for(j = 0; j < height; j++){
        var temp = map[j * width + 1];
        var num = noisy.randomNumber(0, 10);
        if(temp < 3){
          if(temp == 2 && j > 0){
            if(num > 9.8)
              objectMap[j-1 * width + i] = 2;
          }
        }
        else if(temp > 2 && temp < 13){
          if(surface == 0)
            surface = j-1;
          if(temp == 7 || temp == 12){
            if(num > 9.8)
              objectMap[j * width + i] = 2;
          }
        }
        else{
          if(temp == 15){
            if(num > 9.8)
              objectMap[j * width + i] = 2;
          }
        }
      }
    }
    
    /*Place player in the middle*/
    objectMap[surface * width + width/2] = 1;
    return objectMap;
  }
  
  /* */
  var render = function(screenCtx) {
    // Render tilemap layers - note this assumes
    // layers are sorted back-to-front so foreground
    // layers obscure background ones.
    // see http://en.wikipedia.org/wiki/Painter%27s_algorithm
    layers.forEach(function(layer){
      // Only draw layers that are currently visible
      if(layer.visible) { 
        
        // Only draw tiles that are within the viewport
        var startX =  clamp(Math.floor(((cameraX - 32) - viewportHalfWidth) / tileWidth) - 1, 0, layer.width);
        var startY =  clamp(Math.floor((cameraY - viewportHalfHeight) / tileHeight) - 1, 0, layer.height);
        var endX = clamp(startX + viewportTileWidth + 1, 0, layer.width);
        var endY = clamp(startY + viewportTileHeight + 1, 0, layer.height);
   
        for(y = startY; y < endY; y++) {
          for(x = startX; x < endX; x++) {
            var tileId = layer.data[x + layer.width * y];
            
            // tiles with an id of < 0 don't exist
            if(tileId > 0) {
              var tile = tiles[tileId-1];
              if(tile.image) { // Make sure the image has loaded
                screenCtx.drawImage(
                  tile.image,     // The image to draw 
                  tile.sx, tile.sy, tileWidth, tileHeight, // The portion of image to draw
                  x*tileWidth, y*tileHeight, tileWidth, tileHeight // Where to draw the image on-screen
                );
              }
            }
            
          }
        }
      }
      
    });
  }
  
  /* Returns the tile at a given position.
   * - x, the x coordinate of the tile
   * - y, the y coordinate of the tile
   * - layer, the layer of the tilemap
   */
  var tileAt = function(x, y, layer) {
    // sanity check
    if(layer < 0 || x < 0 || y < 0 || layer >= layers.length || x > mapWidth || y > mapHeight) 
      return undefined;  
    return tiles[layers[layer].data[x + y*mapWidth] - 1];
  }
  
  /*
	Changes the type of tile at a given position
	author: Alexander Duben
  */
  var setTileAt = function(newType, x,y, layer){
	 if(layer < 0 || x < 0 || y < 0 || layer >= layers.length || x > mapWidth || y > mapHeight){ 
      return undefined; 
	 }else{
		 var tile = {
          // Reference to the image, shared amongst all tiles in the tileset
          image: tileset,
          // Source x position.  i % colCount == col number (as we remove full rows)
          sx: x,
          // Source y position. i / colWidth (integer division) == row number 
          sy: y,
          // The tile's data (solid/liquid, etc.)
          data: newType
        }
		layers[layer].data[x + y*mapWidth] = tile;
	 }
  }
  
  // Sets tile to skies
  // author: Milan Zelenka
  var destroyTileAt = function(newType, x,y, layer){
	 if(layer < 0 || x < 0 || y < 0 || layer >= layers.length || x > mapWidth || y > mapHeight){ 
      return undefined; 
	 }else{
		layers[layer].data[x + y * mapWidth] = 1;
	 }
  }
  
  //Dig tile out at x, y
  var removeTileAt = function(x, y, layer) {
	if(layer < 0 || x < 0 || y < 0 || layer >= layers.length || x > mapWidth || y > mapHeight) 
      return undefined;
    layers[layer].data[x + y*mapWidth] =  16; 
  }
  
  // Expose the module's public API
  return {
    load: load,
    generate: generate,
    render: render,
    tileAt: tileAt,
	setTileAt: setTileAt,
	destroyTileAt: destroyTileAt,
    removeTileAt: removeTileAt,
    setViewportSize: setViewportSize,
    setCameraPosition: setCameraPosition
  }
  
  
})();

},{"./noise.js":19}],26:[function(require,module,exports){



module.exports = (function(){
	var Animation = require('./animation.js'),
		Player = require('./player.js'),
		Entity = require('./entity.js'),
		Cannonball = require('./cannonball.js'),
		entityManager = require('./entity-manager.js'),
		turret = new Image();
		turret.src = './img/turret/turretMany.png';
		destroyedTurret = new Image();
		destroyedTurret.src = './img/turret/turretDestroyed2.png';
		
	const IDLE = 0,
		  FIRING = 1,
		  WAITING = 2,
		  RELOADING = 3,
		  DESTROYED = 4;
		
	const 	turretWidth = 88,
			turretHeight = 86;
			turretImgCount = 48,
			turretVertical = 25,
			turretDestroyedWidth = 88,
			turretDestroyedHeight = 169,
			// where to target from
			centerOffsetX = 47,
			centerOffsetY = 45,
			// where to aim
			playerOffsetX = 64/2,
			playerOffsetY = playerOffsetX;
			
	const   cannonballNum = 3,
			reloadTime = 5,
			shootingDelay = 0.5,
			optimizationDelay = 0.00;
	
	function Turret(locationX, locationY, mapLayer){
		// computational constants
		this.posX = locationX,
		this.posY = locationY,
		this.type = 'turret',
		this.launchSpeed = 20,
		this.gravity = 0.5,
		this.angle = 91,
		this.launchSpeedPow2 = this.launchSpeed * this.launchSpeed,
		this.launchSpeedPow4 = this.launchSpeedPow2 * this.launchSpeedPow2,
		this.gravityPow2 = this.gravity * this.gravity,
		this.gravityTimesLSPow2 = this.gravity * this.launchSpeedPow2,
		this.LSPow2TimesTwoTimesG = 2 * this.launchSpeedPow2 * this.gravity,
		
		this.player = null;
		this.state = IDLE;
		this.targeting = false;
		this.falling = false;
		this.fallingVelocity = 0;
		this.time = 0;
		this.optimizationTimer = 0;
		// variables fro animations, turret animations, index of animation to render, coordinates of lines that approximate targetting parabola
		this.animations = [],
		this.layerIndex = 0,
		this.destroyedAnimation = undefined;
		this.renderIdx = 0;
		this.parabolaSeries = [];
		// highlight for laser
		this.highlight = new Array(Math.round(Math.random()*255), Math.round(Math.random()*255), Math.round(Math.random()*255));
		
		this.cannonballs = [],
		this.cnbsFired = 0;
		this.shotSound = [];
		
		this.spawnCannonballs = function() {
			for (var i = 0; i < cannonballNum; i ++) {
				this.cannonballs[i] = new Cannonball(this.posX, this.posY, 0, 0, 0, this.gravity, centerOffsetX, centerOffsetY);
				entityManager.add(this.cannonballs[i]);
				this.shotSound[i] = new Audio('./sounds/shot.wav');
			}
		}
		
		// Loads animations to animations array
		this.loadAnimations = function () {
			for (var i = 0; i < turretImgCount; i ++) {
				this.animations[i] = new Animation(turret, turretWidth, turretHeight, i * turretWidth, 0);
			}
			this.destroyedAnimation = new Animation(destroyedTurret, turretWidth, turretHeight, 0, 0, 10);
		}
		
		// is called to aim the turret in a right angle
		this.setAngleOfAnimation = function(angle) {
			if (angle < 0) {
				var angleToFrames = Math.round((angle * 180 / Math.PI + 90) / 5);
				this.renderIdx = turretVertical - angleToFrames;
			} else {
				var angleToFrames = Math.round((angle * 180 / Math.PI - 90) / 5);
				this.renderIdx = turretVertical - angleToFrames;
			}
		}
		
		// compute angle that is necessary for the turret to hit our target
		this.getAngle = function (targetX, targetY) {
			var position = this.getDistance(targetX, targetY);
			
			var rightPart =  Math.sqrt(this.launchSpeedPow4 - (this.gravityPow2 * position[0] * position[0] + this.LSPow2TimesTwoTimesG * position[1]));
			var res1 = Math.atan((this.launchSpeedPow2 + rightPart) / (this.gravity * position[0])) /** (180 / 3.14159265)*/;
			var res2 = Math.atan((this.launchSpeedPow2 - rightPart) / (this.gravity * position[0])) /** (180 / 3.14159265)*/;
			// console.log(this.getVerticalVel());
			// console.log(this.getHorizontalVel());
			return res1;
		}
		
		// get distance of the target relative to the turret which is at (0, 0)
		this.getDistance = function (targetX, targetY) {
			x = (targetX + playerOffsetX) - (this.posX + centerOffsetX);
			y = (this.posY + centerOffsetY) - (targetY + playerOffsetY);
			return [x, y];
		}
		
		// computes initial vertical velocity of the projectile 
		this.getVerticalVel = function () {
			return -this.launchSpeed * Math.sin(Math.abs(this.angle) /** (3.14159265/180)*/);
		}
		
		// computes horizontal velocity of the projectile
		this.getHorizontalVel = function () {
			if (this.angle > 0)
				return this.launchSpeed * Math.cos(this.angle /** (3.14159265/180)*/);
			else
				return -this.launchSpeed * Math.cos(this.angle/* * (3.14159265/180)*/);
		}
		
		// computes the time necessary for the projectile to reach the target
		this.getTimeToReach = function(elevationDifference) {
			var verticalVel = Math.abs(this.getVerticalVel());
			var left = verticalVel / this.gravity;
			var right = Math.sqrt(verticalVel * verticalVel / this.gravityPow2 - elevationDifference * 2 / this.gravity);
			var x1 = left - right;
			var x2 = left + right;
			return [x1, x2];
		}
		
		// is called when the target gets in the turret's query range
		this.targetInRange = function(entitie) {
			if (this.optimizationTimer < optimizationDelay) {
				console.log("skipped");
				return;
			}
			else
				this.optimizationTimer = 0;
			this.buildParabola(entitie);
			this.setAngleOfAnimation(this.angle);
		}
		
		// get position x of the projectile at a given time after it has been fired
		this.getXAtTime = function(time) {
			return this.getHorizontalVel() * time;
		}
		
		// get position y of the projectile at a given time after it has been fired
		this.getYAtTime = function(time) {
			return this.getVerticalVel() * time + this.gravity * time * time / 2;
		}
		
		// constructs the parabolaSeries array that is used to approximate a parabola by drawing lines
		this.buildParabola = function(entitie) {
			this.parabolaSeries = [];
			var ttr = this.getTimeToReach((this.posY + centerOffsetY) - entitie.currentY);
			// console.log(ttr);
			var numOfLines = ttr[1];
			var intervals = ttr[1] / numOfLines;
			for (var i = 0; i < numOfLines; i ++) {
				this.parabolaSeries[i] = { x: this.getXAtTime(intervals * i) + (this.posX + centerOffsetX), y : this.getYAtTime(intervals * i) + (this.posY + centerOffsetY)};
			}
		}
		
		// draws parabola looking like a laser
		this.drawParabolaSeries = function(context) {
			context.fillStyle = 'red';
			context.lineWidth = 5;
			context.strokeStyle = 'red';
			
			for (var j = 5; j >= 0; j --) {
				context.beginPath();
				context.lineWidth = (j+1)*4-2;
				if	(j == 0)
					context.strokeStyle = '#fff';
				else
				{
					context.strokeStyle = 'rgba('+this.highlight[0]+','+this.highlight[1]+','+this.highlight[2]+',0.2)';
				}
				const parabolaOffset = 3;
				context.moveTo(this.parabolaSeries[0+parabolaOffset].x, this.parabolaSeries[0+parabolaOffset].y)
				for (var i = 1 + parabolaOffset; i < this.parabolaSeries.length; i ++) {
					context.lineTo(this.parabolaSeries[i].x, this.parabolaSeries[i].y);
				}
				context.stroke();
				}
		}
		
		this.loadAnimations();
		this.spawnCannonballs();
	}
	
	Turret.prototype = new Entity();
	
	Turret.prototype.update = function(elapsedTime, tilemap, entityManager)
	{
		this.optimizationTimer += elapsedTime;
		
		if (this.onGround(tilemap) == false) {
			this.falling = true;
			this.fallingVelocity += elapsedTime * this.gravity * 12;
			this.posY += this.fallingVelocity;
			for (var i = 0; i < this.cannonballs.length; i ++) {
				this.cannonballs[i].initPosY = this.posY;
			}
		} else {
			this.falling = false;
			this.fallingVelocity = 0;
		}
		
		if (this.state == IDLE) {
			// console.log("IDLE");
			this.playerInRange = false;
			var entitiesInRange = entityManager.queryRadius(this.posX, this.posY, 1500);
			if (entitiesInRange.length > 0) {
				for (var i = 0; i < entitiesInRange.length; i ++) {
					if (entitiesInRange[i].type == 'player') {
						// this.state = FIRING;
						this.player = entitiesInRange[i];
						this.playerInRange = true;
						this.targeting = true;
						playerIndex = i;
						break;
					}
				}
			}
			if (this.playerInRange == false) {
				// console.log("No player in range");
				this.targeting = false;
				this.parabolaSeries = [];
				this.player = null;
			}
		}
		
		if (this.targeting == true) {
			// entitiesInRange = entityManager.queryRadius(this.posX, this.posY, 1500);
			var angle = this.getAngle(this.player.currentX, this.player.currentY);
				if (isNaN(angle) == false) {
					this.angle = angle;
					this.targetInRange(this.player);
					if (this.state == IDLE) {
						this.state = FIRING;						
					}
				} else {
					this.parabolaSeries = [];
				}
		} else {
			this.parabolaSeries = [];
		}
		
		if (this.state == FIRING) {
			this.time = 0;
			// this.shoot(this.getVerticalVel(), this.getHorizontalVel());
			if (this.cnbsFired == cannonballNum) {
				this.state = RELOADING;
				this.targeting = false;
			} else {
				this.cannonballs[this.cnbsFired].reset(this.getVerticalVel(), this.getHorizontalVel());
				this.shotSound[this.cnbsFired].play();
				this.cnbsFired++;
				this.state = WAITING;
			}
		}
		
		if (this.state == WAITING) {
			this.time += elapsedTime;
			if (this.time > shootingDelay) {
				this.time = 0;
				this.state = IDLE;
			}
		}
		
		if (this.state == RELOADING) {
			this.time += elapsedTime;
			if (this.time > reloadTime) {
				this.time = 0;
				this.state = IDLE;
				this.cnbsFired = 0;
			}
		}
		
		if (this.state == DESTROYED) {
			this.destroyedAnimation.update(elapsedTime);
		}
	}

	Turret.prototype.render = function(context, debug)
	{
		if (this.state != DESTROYED) {
			this.animations[this.renderIdx].render(context, this.posX, this.posY);
			if (this.parabolaSeries.length > 0)
				this.drawParabolaSeries(context);
		}
		else {
			this.destroyedAnimation.render(context, this.posX, this.posY);
		}
		
		
		if(debug) renderDebug(this, context);
	}
	
	Turret.prototype.onGround = function(tilemap) {
		var box = this.boundingBox(),
        tileX = Math.floor((box.left + (turretWidth/2))/64),
        tileY = Math.floor(box.bottom / 64),
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);   
    // find the tile we are standing on.
		return (tile && tile.data.solid) ? true : false;
	}
	
	function renderDebug(turret, ctx) {
		var bounds = turret.boundingBox();
		var circle = turret.boundingCircle();
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
		
		ctx.strokeStyle = "blue";
		ctx.beginPath();
		ctx.arc(circle.cx, circle.cy, circle.radius, 0, 2*Math.PI);
		ctx.stroke();
		
		// Outline tile underfoot
		var tileX = 64 * Math.floor((bounds.left + (turretWidth/2))/64),
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

	Turret.prototype.collide = function(otherEntity)
	{
		if (otherEntity.type == 'cannonball' && (otherEntity.state == 3 /*Cannonball.EXPLODING*/)) {
			this.state = DESTROYED;
			this.targeting = false;
			for (var i = 0; i < this.cannonballs.length; i ++) {
			// Entity manager doesn't work correctly when I remove an entity
				// entityManager.remove(this.cannonballs[i]);
				// this.cannonballs[i] = [];
			}
		}
	}

	Turret.prototype.boundingBox = function()
	{
		return {
			left: this.posX + 30,
			top: this.posY,
			right: this.posX + turretWidth - 30,
			bottom: this.posY + turretHeight
		}
	}

	Turret.prototype.boundingCircle = function()
	{
		return {
			cx: this.posX + 44,
			cy: this.posY + 43 + 10,
			radius: 45 - 15
		}
	}
	
	return Turret;
	
}())
},{"./animation.js":3,"./cannonball.js":6,"./entity-manager.js":11,"./entity.js":12,"./player.js":22}]},{},[18]);
