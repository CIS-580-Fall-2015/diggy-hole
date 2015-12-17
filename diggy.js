(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* Class of the Barrel Skeleton entity
 *
 * Author:
 * - Matej Petrlik
 */


module.exports = (function(){
  var Entity = require('./entity.js'),
		Player = require('./player.js'),
      Animation = require('./animation.js');
	  PowerUp = require('./powerUp.js');

      var spritesheet = new Image();
      spritesheet.src = './img/blobber.png';


  const DEBUG = true;

  const PROJECTILE = 0;

  // The Sprite Size
  const SIZE = 64;

  // Movement constants

    var boneLeft = new Image();
  boneLeft.src = 'img/BoneLeft.png';


  //The Bone constructor
  function Bone(locationX, locationY, layerIndex, isLeft, parent) {
    this.layerIndex = layerIndex;
    this.currentX = locationX;
    this.currentY = locationY;
    this.xSpeed = 200;
    this.isLeft = isLeft;
	this.parent = parent;

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
				tileY = Math.floor(box.bottom / 64) - 1;
		} else {
			var box = this.boundingBox(),
				tileX = Math.floor(box.right/64),
				tileY = Math.floor(box.bottom / 64) - 1;
		}
		var tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
		if (tile && tile.data.solid)
			this.enabled = false;
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
   Bone.prototype.collide = function(otherEntity, entityManager) {
	   if(!this.enabled || otherEntity.type == this.parent.type || otherEntity.type == "Bone" || otherEntity.type == "Pickaxe" || otherEntity instanceof PowerUp){
		   return

	   }

	   if( otherEntity.type == "player"){
		   this.enabled = false;
		   otherEntity.hurt(10);
		   if(DEBUG){
		   console.log("Player hit by bone");
		   otherEntity.scoreEngine.scoreToZero();
		   }
	   } else if(otherEntity.lives){
		   this.enabled = false;
		   if(--otherEntity.lives < 1){

				if(DEBUG){
					console.log("Entity "+otherEntity.type+" killed by bone.");
				}
				if(otherEntity.die){
					otherEntity.die(entityManager);
				} else {
					entityManager.remove(otherEntity);
				}
		   }
		   if(DEBUG){
					console.log("Entity "+otherEntity.type+" has "+otherEntity.lives+" lives left.");
			}
	   } else {
		   this.enabled = false;
		   if(DEBUG){
				console.log("Entity "+otherEntity.type+" killed by bone.");
			}
		   if(otherEntity.die){
					otherEntity.die(entityManager);				
				} else {
					entityManager.remove(otherEntity);
				}
	   }
   }



  return Bone;

}());

},{"./animation.js":6,"./entity.js":16,"./player.js":31,"./powerUp.js":32}],2:[function(require,module,exports){
/* DemonicGroundHog
 * Authors:
	Nathan Bean
	Alexander Duben
	Josh Vander Leest

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
  const SPEED = 100;
  const GRAVITY = -150;

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
	this.dead = false;

    //The animations
    this.animations = {
      left: [],
      right: [],
  };

    //The right-facing animations
    this.animations.right[IDLE] = new Animation(idleRight, SIZE, SIZE, 0, 0, 8);
    this.animations.right[MOVING] = new Animation(attackRight, SIZE, SIZE, 0, 0, 8);
    this.animations.right[ATTACKING] = new Animation(attackRight, SIZE, SIZE, 0, 0, 8);
    this.animations.right[DIGGING] = new Animation(digRight, SIZE, SIZE, 0, 0, 8);
    this.animations.right[FALLING] = new Animation(idleRight, SIZE, SIZE, 0, 0, 8);

    //The left-facing animations
    this.animations.left[IDLE] = new Animation(idleLeft, SIZE, SIZE, 0, 0, 8);
    this.animations.left[MOVING] = new Animation(moveLeft, SIZE, SIZE, 0, 0, 8);
    this.animations.left[ATTACKING] = new Animation(attackLeft, SIZE, SIZE, 0, 0, 8);
    this.animations.left[DIGGING] = new Animation(digLeft, SIZE, SIZE, 0, 0, 8);
    this.animations.left[FALLING] = new Animation(idleLeft, SIZE, SIZE, 0, 0, 8);

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
  DemonicGroundHog.prototype.getPlayerPosition = function(playerPosition) {
	  if (playerPosition.left > this.currentX + 64) {
            this.isLeft = false;
        } else if (playerPosition.left < this.currentX - 64) {
            this.isLeft = true;
        }

    }
  DemonicGroundHog.prototype.update = function(elapsedTime, tilemap, entityManager) {
    var sprite = this;
	if(this.dead) entityManager.remove(this);
      // Process the different states
      switch(sprite.state) {
        case IDLE:
			if(idleTimer > 100){
					sprite.state = MOVING;
					idleTimer = 0;
				}
			else if(!sprite.onGround(tilemap)) {
				sprite.state = FALLING;
				sprite.velocityY = 0;
				idleTimer = 0;
				break;
			}
			else if(idleTimer > 50){
					sprite.state = MOVING;
					idleTimer = 0;
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

    // Update animation
    if(this.isLeft)
      this.animations.left[this.state].update(elapsedTime);
    else
      this.animations.right[this.state].update(elapsedTime);
  }

  /* GroundHog Render Function */
  DemonicGroundHog.prototype.render = function(ctx, debug) {
    if(this.isLeft)
      this.animations.left[this.state].render(ctx, this.currentX, this.currentY);
    else
      this.animations.right[this.state].render(ctx, this.currentX, this.currentY);

    if(this.state != IDLE){
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
		  otherEntity.hurt(1);
	  }
	  if(otherEntity.type == 'Pickaxe'){
		  this.dead = true;
	  }
  };

  /* DemonicGroundHog BoundingBox Function
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

},{"./animation.js":6,"./entity.js":16}],3:[function(require,module,exports){
module.exports = (function(){
	
	var HUDelements = [];
	
	function HUD(screenWidth, screenHeight) {
		// Are these necessary?
		this.screenWidth = screenWidth;
		this.screenHeight = screenHeight;
		
		
		
		
		this.addElement = function(newElement) {
			HUDelements.push(newElement);
		}
		
		this.update = function(bounds) {
			var topLeftY = bounds.top - this.screenHeight / 2;
			var topLeftX = bounds.left - this.screenWidth / 2;
			for (var i = 0; i < HUDelements.length; i ++) {
				if (HUDelements[i])
					HUDelements[i].update(topLeftX, topLeftY, this.screenWidth, this.screenHeight);
			}
		}
		
		this.render = function(screenCtx) {
			
			
			for (var i = 0; i < HUDelements.length; i ++) {
				if (HUDelements[i])
					HUDelements[i].render(screenCtx);
			}
		}
	}

	return 	HUD

}());

},{}],4:[function(require,module,exports){
/* Pickaxe is an invisible entity created by player that represents the hitbox
* of the Pickaxe.
* In the future this would be interesting to have an attack animation effect
* like a slash or something.
*/
module.exports = (function() {
    var Entity = require('./entity.js');

    /* moveing these values to a pickaxe factory class would be cool.
    Then powerups could change the attack size. */
    var attackSize = { x: 20, y: 40 };
    var attackRadius = 15;


    var Pickaxe = function(position, horizontal) {
        this.x = position.x;
        this.y = position.y;
        this.score = 0;
        this.type = "Pickaxe";
        if(horizontal) this.attackSize = {x: attackSize.y, y: attackSize.x };
        else this.attackSize = {x: attackSize.x, y: attackSize.y };
    };

    Pickaxe.prototype.update = function() {

    };

    Pickaxe.prototype.render = function(ctx, debug) {
        if (debug) renderDebug(this, ctx);
    };

    Pickaxe.prototype.boundingBox = function() {
        return {
            left: this.x - this.attackSize.x / 2,
            top: this.y - this.attackSize.y / 2,
            right: this.x + this.attackSize.x / 2,
            bottom: this.y + this.attackSize.y / 2
        };
    };


    Pickaxe.prototype.boundingCircle = function() {
        return {
            cx: this.x,
            cy: this.y,
            radius: attackRadius
        };
    };


    Pickaxe.prototype.collide = function(otherEntity, entityManager) {
        if( otherEntity.type == "player") {
            return;
        } else if(otherEntity.lives) {
            if(--otherEntity.lives < 1) {
                if(otherEntity.die){
                    otherEntity.die(entityManager);
                } else {
                    entityManager.remove(otherEntity);
                }
            }
        } else {
            this.enabled = false;
            if(otherEntity.die){
                otherEntity.die(entityManager);
            } else {
                entityManager.remove(otherEntity);
            }
        }
    };

    function renderDebug(player, ctx) {
        var bounds = player.boundingBox();
        var circle = player.boundingCircle();
        ctx.save();

        // Draw player bounding box
        ctx.strokeStyle = "red";
        ctx.beginPath();
        ctx.moveTo(bounds.left, bounds.top);
        ctx.lineTo(bounds.right, bounds.top);
        ctx.lineTo(bounds.right, bounds.bottom);
        ctx.lineTo(bounds.left, bounds.bottom);
        ctx.closePath();
        ctx.stroke(); // Outline tile underfoot

        ctx.strokeStyle = "blue";
        ctx.beginPath();
        ctx.arc(circle.cx, circle.cy, circle.radius, 0, 2*Math.PI);
        ctx.stroke();

        ctx.restore();
    }




    return Pickaxe;


})();

},{"./entity.js":16}],5:[function(require,module,exports){
module.exports = (function (){
    return {
      SCREENSIZEX : 1280,
      SCREENSIZEY : 720,
      TILESIZEX : 64,
      TILESIZEY : 64,
      MAPSIZEX : 1000,
      MAPSIZEY : 1000,
      MAX_ENTITIES : 200,
      UPDATE_REGION : 75,
      RENDER_REGION : 25,
      UPDATE_TIME : 1/60,
      LIQUID_UPDATE_TIME: 1,
    };
})();

},{}],6:[function(require,module,exports){
module.exports = function () {


  function Animation(image, width, height, top, left, numberOfFrames, secondsPerFrame, playItOnce, donePlayingCallback, reverse) {
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
    this.donePlayingCallback = donePlayingCallback;
    this.reversalFactor = 1;
    if(reverse) this.reversalFactor = -1;
  }

  Animation.prototype.setStats = function (frameCount, locationX, locationY) {
    this.numberOfFrames = frameCount;
    this.drawLocationY = locationY;
    this.drawLocationX = locationX;
  };

  Animation.prototype.update = function (elapsedTime, tilemap) {
    this.time += elapsedTime;

    // Update animation
    if (this.time > this.secondsPerFrame) {
      if (this.time > this.secondsPerFrame) this.time -= this.secondsPerFrame;

      // If the current frame index is in range
      if (this.frameIndex < this.numberOfFrames - 1) {
        this.frameIndex += 1;
      } else {
        if (!this.playItOnce)
          this.frameIndex = 0;

        if (this.donePlayingCallback) {
          this.donePlayingCallback();

          //once we call the callback, destroy it so it cannot be called again
          this.donePlayingCallback = null;
        }
      }
    }
  };

  Animation.prototype.render = function (ctx, x, y) {

    // Draw the current frame
    ctx.drawImage(
        this.image,
        this.drawLocationX + (this.frameIndex * this.reversalFactor * this.width),
        this.drawLocationY,
        this.width,
        this.height,
        x,
        y,
        this.width,
        this.height);
  };

  return Animation;

}();

},{}],7:[function(require,module,exports){
/* Class of the Barrel Skeleton entity
 *
 * Author:
 * - Matej Petrlik
 */


module.exports = (function(){
  var Entity = require('./entity.js'),
		Player = require('./player.js'),
		Bone = require('./bone.js'),
      Animation = require('./animation.js'),
	  PowerUp = require('./powerUp.js');
	//  entityManager = require('./entity-manager.js');


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

  // Time before removing entity after dead
  const TIME_DEAD = 20;


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
    this.score = 4;

	this.type = "Barrel";

	this.range = 5*SIZE;
	this.attackFrequency = 1.7;
	this.lastAttack = 0;
	this.lives = 2;
	this.timeDead = 0;
	this.score = 10;

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
			sprite.attack(elapsedTime, entities, entityManager);
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
			this.timeDead += elapsedTime;
			if(this.timeDead > TIME_DEAD){
				entityManager.remove(this);
			}
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
   Barrel.prototype.collide = function(otherEntity, entityManager) {
	   if((this.state == ATTACKING || this.state == IDLE) && this.recovered && otherEntity instanceof Player){
		   if(DEBUG){
		   console.log("Collision with player");
	   }
		   if(--this.lives<=0){
			   this.die(entityManager);

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

   Barrel.prototype.die = function(entityManager){
	   this.state = DEAD;
			   boneUp = new PowerUp(this.currentX, this.currentY, this.layerIndex, 'boneUp', 64, 64, 10, 'img/powerUps/boneUp.png');
			   entityManager.add(boneUp);
			   if(DEBUG){
				console.log("Barrel state: DEAD");
			}
   }

   Barrel.prototype.attack = function(elapsedTime, entities, entityManager){
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
			bone = new Bone(this.currentX, this.currentY, 0, isLeft, this);
			entityManager.add(bone);
		}

   }

  return Barrel;

}());

},{"./animation.js":6,"./bone.js":9,"./entity.js":16,"./player.js":31,"./powerUp.js":32}],8:[function(require,module,exports){
/* Bird Module
	Authors: Josh Benard
*/

module.exports = (function(){
	var Entity = require('./entity.js');
	var Animation = require('./animation.js');
	var Player = require('./player.js');

	//states
	const FLYING = 0;
	const COLLIDED = 1;
	const EXPLODED = 2;

	const SIZE = 64;
	const SPRITE_NUM = 8;

	//how often the bird changes directions
	const RAND_VELOCITY_TIME = 2;
	const MAX_VELOCITY = 20;
	const EXPLOSION_TIME = 1;
	const SPEED_FACTOR = 5;

	var birdImage = new Image();
	birdImage.src = './img/birdsheet.png';
	var birdExplodeImage = new Image();
	birdExplodeImage.src = './img/explosionBird.png';

	function Bird(x, y) {

		this.type = 'bird';

		this.x = x;
		this.y = y;
		this.velocityTime = 0;
		this.velocityX = 10;
		this.velocityY = 10;
		this.state = FLYING;
	} 

	Bird.prototype = new Entity();

	this.animators = { birdimations: [] };

	//loop this animation
	this.animators.birdimations[FLYING] = new Animation(birdImage, SIZE, SIZE, 0, 0, SPRITE_NUM, 0.1, false);
	this.animators.birdimations[COLLIDED] = new Animation(birdExplodeImage, SIZE, SIZE, 0, 0, SPRITE_NUM, 0.125, true);

	Bird.prototype.update = function(elapsedTime, tilemap, entityManager){
		this.velocityTime += elapsedTime;

		switch(this.state) {
			case FLYING:
				animators.birdimations[this.state].update(elapsedTime, tilemap);
				this.x += this.velocityX / SPEED_FACTOR;
				this.y += this.velocityY / SPEED_FACTOR;

				//after a specified period, randomize bird velocity
				if(this.velocityTime >= RAND_VELOCITY_TIME) {
					this.velocityTime = 0;

					//randomly assign the velocity values
					this.velocityX =  Math.random() * MAX_VELOCITY;
					this.velocityY = Math.random() * MAX_VELOCITY;

					//randomly flip direction of veloicty
					if((Math.random() * 10) > 5)
						this.velocityX *= -1;
					if((Math.random() * 10) > 5)
						this.velocityY *= -1;
				}
				break;
			case COLLIDED:
				animators.birdimations[this.state].update(elapsedTime, tilemap);
				if(this.velocityTime >= EXPLOSION_TIME)
					this.state = EXPLODED;
				break;
			default:
				entityManager.remove(this);
				break;
		}
	}

	Bird.prototype.render = function(context, debug){
		switch(this.state) {
			case FLYING:
				animators.birdimations[this.state].render(context, this.x - (SIZE / 2), this.y - (SIZE / 2));
				break;
			case COLLIDED:
				animators.birdimations[this.state].render(context, this.x - (SIZE / 2), this.y - (SIZE / 2));
				break;
			default:
				//dont draw anything if in a done state
				break;
		}

		if(debug) {
			if(this.state != EXPLODED) {
				///draw a box around the bird if it hasnt exploded
				var boundary = this.boundingBox();
				context.save();

				context.strokeStyle = "red";
				context.beginPath();
				context.moveTo(boundary.left, boundary.top);
				context.lineTo(boundary.right, boundary.top);
				context.lineTo(boundary.right, boundary.bottom);
				context.lineTo(boundary.left, boundary.bottom);
				context.closePath();
				context.stroke();

				context.restore();
			}
		}
	}

	Bird.prototype.collide = function(otherEntity){

		if(otherEntity instanceof Player){
			this.state = COLLIDED;
			this.velocityTime = 0;
		}

	}

	Bird.prototype.boundingBox = function(){
		var halfSize = SIZE /2;

		return {
			left: this.x - halfSize,
			right: this.x + halfSize,
			top: this.y - halfSize,
			bottom: this.y + halfSize,
		};
	}

	Bird.prototype.boundingCircle = function(){
		return {
			cx: this.x,
			cy: this.y,
			radius: SIZE / 2,
		};
	}


	return Bird;

}());
},{"./animation.js":6,"./entity.js":16,"./player.js":31}],9:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"./animation.js":6,"./entity.js":16,"./player.js":31,"./powerUp.js":32,"dup":1}],10:[function(require,module,exports){
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
	this.explosionSound = new Audio('./resources/sounds/explosion.wav');

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

	this.checkCollisions = function(tile, tileX, tileY) {
		if (tile && tile.data.solid) {
			var layerType = tilemap.returnTileLayer(tileX, tileY, 0);
			if (layerType === 0) {
					tilemap.destroyTileAt(1, this.getXFromCoords(this.posX), this.getYFromCoords(this.posY), 0);
			} else if (layerType == 1) {
					tilemap.destroyTileAt(13, this.getXFromCoords(this.posX), this.getYFromCoords(this.posY), 0);
			} else if (layerType == 2) {
					tilemap.destroyTileAt(15, this.getXFromCoords(this.posX), this.getYFromCoords(this.posY), 0);
			}
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
			if (this.projectileTimeExploding > 1) {
				this.state = IDLE;
				//Wyatt Watson - Now removes the explosion left overs
				// MZ - If you do that the turret has nothing to shoot with afterwards
				// entityManager.remove(this);
				this.posX = 0;
				this.posY = 0;
			}
		}
		var tileX = this.getXFromCoords(this.posX), tileY = this.getYFromCoords(this.posY);
		this.checkCollisions(Tilemap.tileAt(tileX, tileY, 0), tileX, tileY);
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
		} else if (otherEntity.type == 'player') {
			this.offsetExploding();
			this.state = EXPLODING;
			this.explosionSound.play();
			otherEntity.hurt(30);
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

},{"./animation.js":6,"./entity.js":16,"./tilemap.js":36}],11:[function(require,module,exports){
/* The construct for a collectible. Inherits from entity.
 * Removed from entity manager upon being collected by player.
 * Certain strategies derived from the powerup class.
 *
 * Author: Christian Hughes
 */

module.exports = (function(){
	var Animation = require('./animation.js'),
		Entity = require('./entity.js');

  // Create an image object in advance. The constructor will provide a source to the proper sprite sheet.
  var collectibleSpriteSheet = new Image();

	/* THE CONSTRUCTOR FOR A COLLECTIBLE OBJECT.
		locationX - x-position of the collectble.
		locationY - y-position of the collectible.
		mapLayer - z-layer of the map that the collecible should appear on.
		type - The NAME of the collectible (should be a string unqiue to this entity).
		width - Width of one animation image.
		height - Height of one animation image.
		frameNum - The number of frames in the collectible's sprite sheet.
		imgPath - Relative path to the animation's sprite sheet.
    score - The amount of points that the collectible is worth.
	*/
	function Collectible(locationX, locationY, mapLayer,
					 type, width, height, frameNum, imgPath, score) {
    // Establish coordinates.
		this.x = locationX;
		this.y = locationY;
    // Establish map-layer.
		this.layerIndex = mapLayer;
    // The type, which is unique to the entity.
		this.type = type;
    // The height and width of a single frame.
		this.width = width;
		this.height = height;
    // Establish the radius of the image.
		this.radius = Math.sqrt(this.width * this.width / 4 + this.height * this.height / 4);
    // Assign the image path to the image object.
    this.img = collectibleSpriteSheet;
    this.img.src = imgPath;
    // Create the collectible's animation. It only has one state (always on).
		this.animation = new Animation(this.img, this.width, this.height, 0, 0, frameNum);
    // Has the collectible been collected by the player? False to begin with.
		this.collected = false;
    // Establish the score of the entity.
    this.score = score;

    console.log("A " + this.type + " was created.");

    // A pickedUpSound might be implemented in the future (similar to the powerup).
		//this.pickedUpSound = new Audio('');
	}

  // The Collectible inherits from Entity.
  Collectible.prototype = new Entity();

	Collectible.prototype.update = function(elapsedTime, tilemap, entityManager)
	{
    // Update the animation based on the elapsed time.
		this.animation.update(elapsedTime);

    // If the player touches the collects the collectible, then the collectible should be removed from the entity manager.
    // (It no longer requires any updates).
    if (this.collected == true)
    {
      entityManager.remove(this);
      console.log("A " + this.type + " was removed.");
    }
	}

	Collectible.prototype.render = function(context, debug)
	{
    // Nothing fancy, just use the animation function to render the sprite sheet.
		this.animation.render(context, this.x, this.y);
		if(debug) renderDebug(this, context);
	}

	function renderDebug(powerUp, ctx) {
		var bounds = powerUp.boundingBox();
		var circle = powerUp.boundingCircle();
		ctx.save();

		// Draw player bounding box
		ctx.strokeStyle = "red";
		ctx.beginPath();
		ctx.moveTo(bounds.left, bounds.top);
		ctx.lineTo(bounds.right, bounds.top);
		ctx.lineTo(bounds.right, bounds.bottom);
		ctx.lineTo(bounds.left, bounds.bottom);
		ctx.lineTo(bounds.left, bounds.bottom);
		ctx.closePath();
		ctx.stroke();

		ctx.strokeStyle = "blue";
		ctx.beginPath();
		ctx.arc(circle.cx, circle.cy, circle.radius, 0, 2*Math.PI);
		ctx.stroke();

		// Outline tile underfoot
		var tileX = 64 * Math.floor((bounds.left + (this.width/2))/64),
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

	Collectible.prototype.collide = function(otherEntity)
	{
		if (otherEntity.type == 'player' && this.collected == false) {
			// Sounds may be implemented in the future.
			//this.pickedUpSound.play();
			this.collected = true;
      // Tell the player to add this to its list of collectibles.
			// otherEntity.collected(this);
		}
	}

	Collectible.prototype.boundingBox = function()
	{
		return {
			left: this.x,
			top: this.y,
			right: this.x + this.width,
			bottom: this.y + this.height
		}
	}

	Collectible.prototype.boundingCircle = function()
	{
		return {
			cx: this.x + this.width / 2,
			cy: this.y + this.height / 2,
			radius: this.radius
		}
	}

	Collectible.prototype.onGround = function(tilemap) {
    var box = this.boundingBox(),
        tileX = Math.floor((box.left + (this.width/2))/64),
        tileY = Math.floor(box.bottom / 64),
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    // find the tile we are standing on.
    return (tile && tile.data.solid) ? true : false;
  }


	return Collectible;

}())

},{"./animation.js":6,"./entity.js":16}],12:[function(require,module,exports){
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
},{}],13:[function(require,module,exports){
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
  
  var explosion = new Audio('resources/sounds/explosion.wav');

  //The Dynamite constructor
  function Dynamite(locationX, locationY, layerIndex, sourceEntity, surface) {
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
	this.surface = surface;
	
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
			if(detonationTimer > 150){
				sprite.state = DETONATE;
			}
		break;
        case DETONATE:
		  explosion.play();
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
						if(j < this.surface){
							tilemap.destroyTileAt(1, i, j, 0);
						}else{
							tilemap.removeTileAt(i, j, 0);
						}
						
					}	  
				}
				for(var i = tileX-5; i < tileX+5;i++){
					for(var j = tileY -5; j < tileY+5;j++){
						if(Math.random() < 0.4){
							if(j < this.surface){
								tilemap.destroyTileAt(1,i, j, 0);
							}else{
								tilemap.removeTileAt(i, j, 0);
							}
						}
						
					}	  
				}
				
				killedEntities = entityManager.queryRadius(sprite.currentX, sprite.currentY, 10*64);
				killedEntities.forEach(function(entity) {
					if(entity.type == 'player'){
						entity.hurt(80);
					}else{
						if((entity).type != 'dynamite')
						entityManager.remove(entity);
					}
				});
										
				
				sprite.state = DONE;
				
				
		  }
		  
          break;
		  
		  case DONE:
		  //final state
			break;
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
},{"./animation.js":6,"./entity.js":16}],14:[function(require,module,exports){
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
  
  var explosion = new Audio('resources/sounds/explosion.wav');
  
  var walkTimer = 0,
	idleTimer = 0,
	settingChargesTimer = 0,
	dyingTimer = 0;

  //The Dwarf constructor
  function Dwarf(locationX, locationY, layerIndex, inputManager, scoreEngine) {
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
    this.gravity = .5; 
    this.angle = 0; 
    this.xSpeed = 10; 
    this.ySpeed = 15;
    this.isLeft = false;
	this.isPlayerColliding = false;
	this.type = 'dynamiteDwarf';
	this.score = 10;//negative ten
	this.scoreEngine = scoreEngine;
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
    
	
      // Process Dwarf state
      switch(sprite.state) {
        case STANDING:
			sprite.isPlayerColliding = false;
			if(!sprite.onGround(tilemap)) {
				sprite.state = FALLING;
				sprite.velocityY = 0;
				idleTimer = 0;
				break;
			}
			if(idleTimer < 120){
				idleTimer++;
				if(this.inputManager.isKeyDown(this.inputManager.commands.PAY)) {
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
			if(settingChargesTimer < 67){
				settingChargesTimer++;
			}else{
				settingChargesTimer = 0;
				var box = sprite.boundingBox(),
				tileX = Math.floor((box.left + (SIZE/2))/64),
				tileY = Math.floor(box.bottom / 64);								
				for(var j = tileY; j > GROUNDLVL;j--){
					tilemap.removeTileAt( tileX, j-1, 0);
				}
				player.currentX = tileX*64;
				player.currentY = tileY*64;
				//player.velocityY = -1500;		
				player.velocityY = -Math.sqrt((tileY-GROUNDLVL)*64*30*(-GRAVITY));//shoot player above surface level
				if((tileY-GROUNDLVL) <= 0){//if above surface just use just constant force
					player.velocityY = -1500;
				}
				explosion.play();
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
			if(dyingTimer < 12){
				dyingTimer++;
			}else{
				dyingTimer = 0;
				var dynamite = new Dynamite(sprite.currentX,sprite.currentY,0,sprite, GROUNDLVL);
				entityManager.add(dynamite);
				sprite.state = DEAD;
				this.scoreEngine.subScore(this.score);
			}
			break;
		case DEAD:
			
			break;
		case DONE:
			entityManager.remove(this);
			break;
      }
      
  
    
       
    // Update animation
    if(this.isLeft)
      this.animations.left[this.state].update(elapsedTime);
    else
      this.animations.right[this.state].update(elapsedTime);
    
  }
  
  Dwarf.prototype.die = function(){
	  this.state = DYING;
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
	  else if(otherEntity.type == 'Pickaxe'){
		 this.state = DYING;		 
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
},{"./animation.js":6,"./dynamite.js":13,"./entity.js":16}],15:[function(require,module,exports){
/* The entity manager for the DiggyHole game
* Currently it uses brute-force approaches
* to its role - this needs to be refactored
* into a spatial data structure approach.
* Authors:
* - Nathan Bean
*/
module.exports = (function() {
    var settings = require('./Settings.js');

    var entityXpos = [],
        entityYpos = [],
        player,
        timeSinceUpdateRegion;

    function EntityManager(p) {
        /* jshint esnext: true */
        player = p;
        this.add(player);
    }

        /* Adds an entity to those managed.
         * Arguments:
         * - entity, the entity to add
         */
    EntityManager.prototype.add = function(entityToAdd) {
        if (entityXpos.length < settings.MAX_ENTITIES) {
            var boundingBox = entityToAdd.boundingBox();
            var entityPos = {
                entity: entityToAdd,
                hitbox: boundingBox
            };

            entityXpos.push(entityPos);
            entityYpos.push(entityPos);
        }
    };

        /* Removes an entity from those managed
         * Arguments:
         * - entity, the entity to remove
         * returns true if the entity was removed, false if not
         */
    EntityManager.prototype.remove = function(entity) {
        var xPos = -1, yPos = -1;
        for (var i = 0; i < entityXpos.length; i++) {
            if (entityXpos[i].entity === entity) xPos = i;
            if (entityYpos[i].entity === entity) yPos = i;
        }
        if (xPos === -1 || yPos === -1) return false;
        entityXpos.splice(xPos, 1);
        entityYpos.splice(yPos, 1);
        return true;
    };


    EntityManager.prototype.updateEntityHitboxes = function() {
        for (var i = 0; i < entityXpos.length; i++) {
            entityXpos[i].hitbox = entityXpos[i].entity.boundingBox();
        }
    };

    EntityManager.prototype.insertionSortLeft = function(items) {
        for (var i = 0; i < items.length; ++i) {
            var tmp = items[i];
            for (var j = i - 1; j >=0 && items[j].hitbox.left > tmp.hitbox.left; --j) {
                items[j + 1] = items[j];
            }
            items[j + 1] = tmp;
        }
    };

    EntityManager.prototype.insertionSortTop = function(items) {
        for (var i = 0; i < items.length; ++i) {
            var tmp = items[i];
            for (var j = i - 1; j >=0 && items[j].hitbox.top > tmp.hitbox.top; --j) {
                items[j + 1] = items[j];
            }
            items[j + 1] = tmp;
        }
    };

    EntityManager.prototype.sortEntities = function() {
        this.insertionSortLeft(entityXpos);
        this.insertionSortTop(entityYpos);
    };

    /* Checks for collisions between entities, and
     * triggers the collide() event handler.
     */
    EntityManager.prototype.checkCollisions = function() {
         this.updateEntityHitboxes();
         this.sortEntities();

         var xPotentialCollisions = [];
         var yPotentialCollisions = [];
         var i, j, current;

         for(i = 0; i < entityXpos.length; i++) {
             current = entityXpos[i].hitbox;
             j = i;
             while(++j < entityXpos.length && current.right >= entityXpos[j].hitbox.left) {
                 xPotentialCollisions.push({ a: entityXpos[i].entity, b: entityXpos[j].entity });
             }
         }

         for(i = 0; i < entityYpos.length; i++) {
             current = entityYpos[i].hitbox;
             j = i;
             while(++j < entityYpos.length && current.bottom >= entityYpos[j].hitbox.top) {
                 yPotentialCollisions.push({ a: entityYpos[i].entity, b: entityYpos[j].entity });
             }
         }

         for(i = 0; i < xPotentialCollisions.length; i++) {
             for(j = 0; j < yPotentialCollisions.length; j++) {
                 if( (xPotentialCollisions[i].a === yPotentialCollisions[j].a && xPotentialCollisions[i].b === yPotentialCollisions[j].b) ||
                     (xPotentialCollisions[i].b === yPotentialCollisions[j].a && xPotentialCollisions[i].a === yPotentialCollisions[j].b)) {
                     xPotentialCollisions[i].a.collide(xPotentialCollisions[i].b, this);
                     xPotentialCollisions[i].b.collide(xPotentialCollisions[i].a, this);
                     break;
                 }
             }
         }
     };

    /* Returns all entities within the given radius.
     * Arguments:
     * - x, the x-coordinate of the center of the query circle
     * - y, the y-coordinate of the center of the query circle
     * - r, the radius of the center of the circle
     * Returns:
     *   An array of entity references
     */
    EntityManager.prototype.queryRadius = function(x, y, r) {
        var entitesInRadius = [];
        for (var i = 0; i < entityXpos.length; i++) {
            if (entityXpos[i] !== null) {
                var boundingCircle = entityXpos[i].entity.boundingCircle();
                if (this.isWithinCircle(x, y, r, boundingCircle))
                    entitesInRadius.push(entityXpos[i].entity);
            }
        }

        return entitesInRadius;
    };

    EntityManager.prototype.isWithinCircle = function(x, y, r, circle) {
        if(Math.pow(circle.radius + r, 2) >=
            (Math.pow(x - circle.cx, 2) + Math.pow(y - circle.cy, 2)))
            return true;

        return false;
    };

    //Determines if 2 bounding boxes intersect in any way
    EntityManager.prototype.isWithinBox = function(bb1, bb2) {
        return(bb1.left < bb2.right && bb1.right > bb2.left && bb1.top < bb2.bottom && bb1.bottom > bb2.top);
    };

    /* Updates all managed entities
     * Arguments:
     * - elapsedTime, how much time has passed between the prior frameElement
     *   and this one.
     * - tilemap, the current tilemap for the game.
     */
    EntityManager.prototype.update = function(elapsedTime, tilemap, ParticleManager) {
        timeSinceUpdateRegion += elapsedTime;

        //create bounding box and clean updatable objects, but only after some time interval
        if(timeSinceUpdateRegion >= settings.UPDATE_TIME) {
            var playerBB = player.boundingBox(),
                updateFactor = settings.UPDATE_REGION * settings.TILESIZEX,
                updateBox = {
                    top: playerBB.top - updateFactor,
                    bottom: playerBB.bottom + updateFactor,
                    left: playerBB.left - updateFactor,
                    right: playerBB.right + updateFactor
                };

            timeSinceUpdateRegion = 0;
            for(var i = 0; i < entityXpos.length; i ++) {
                if(entityXpos[i] !== null) {
                    if(!this.isWithinBox(updateBox, entityXpos[i].hitbox))
                        this.remove(entityXpos[i]);
                }
            }
        }

        //call everyone's update function
        for(var i = 0; i < entityXpos.length; i ++) {
            if(entityXpos[i] !== null) {
                entityXpos[i].entity.update(elapsedTime, tilemap, this, ParticleManager);
            }
        }

        //check collisions
        this.checkCollisions();
    };

    /* Renders the managed entities
     * Arguments:
     * - ctx, the rendering contextual
     * - debug, the flag to trigger visual debugging
     */
    EntityManager.prototype.render = function(ctx, debug) {
        //create the renderable region
        var playerBB = player.boundingBox(),
            updateFactor = settings.RENDER_REGION * settings.TILESIZEX,
            updateBox = {
                top: playerBB.top - updateFactor,
                bottom: playerBB.bottom + updateFactor,
                left: playerBB.left - updateFactor,
                right: playerBB.right + updateFactor
            };

        //call the real update method
        for(var i = 0; i < entityXpos.length; i ++) {
            if(entityXpos[i] !== null) {
                if(this.isWithinBox(updateBox, entityXpos[i].hitbox))
                    entityXpos[i].entity.render(ctx, debug);
            }
        }
    };

    EntityManager.prototype.getPlayer = function() {
        return player;
    };

    return EntityManager;

}());

},{"./Settings.js":5}],16:[function(require,module,exports){
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
    };

    /* Render function
    * parameters:
    *  - context is the rendering context.  It may be transformed
    *    to account for the camera
    */
    Entity.prototype.render = function(context) {
        // TODO: Draw your entity sprite
    };

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
    };

    /* BoundingBox function
    * This function returns an axis-aligned bounding
    * box, i.e {top: 0, left: 0, right: 20, bottom: 50}
    * the box should contain your entity or at least the
    * part that can be collided with.
    */
    Entity.prototype.boundingBox = function() {
        // Return a bounding box for your entity
    };

    /* BoundingCircle function
    * This function returns a bounding circle, i.e.
    * {cx: 0, cy: 0, radius: 20}
    * the circle should contain your entity or at
    * least the part that can be collided with.
    */
    Entity.prototype.boundingCircle = function() {
        // Return a bounding circle for your entity
    };

    return Entity;

}());

},{}],17:[function(require,module,exports){
/* Game GameState module
 * Provides the main game logic for the Diggy Hole game.
 * Authors:
 * - Nathan Bean
 */
module.exports = (function (){
    /* jshint esnext: true */

    // The width & height of the screen

    // Module variables
    var Player = require('./player.js'),
        inputManager = require('./input-manager.js'),
        tilemap = require('./tilemap.js'),
        EntityManager = require('./entity-manager.js'),
        entityManager,
        SpawningManager = require('./spawning-manager.js'),
        player,
        screenCtx,
        backBuffer,
        backBufferCtx,
        stateManager,
        ScoreEngine = require('./score.js'),
        PowerUp = require('./powerUp.js'),
        Collectible = require('./collectible.js'),
        ParticleManager = require('./particle-manager.js'),
        HUD = require('./HUD.js'),
        hud,
        healthBar = require('./healthBar.js'),
        Inventory = require('./inventory.js'),
        Settings = require('./Settings.js');

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
        screen.width = Settings.SCREENSIZEX;
        screen.height = Settings.SCREENSIZEY;
        screenCtx = screen.getContext("2d");
        document.getElementById("game-screen-container").appendChild(screen);

        // Set up the back buffer
        backBuffer = document.createElement("canvas");
        backBuffer.width = Settings.SCREENSIZEX;
        backBuffer.height = Settings.SCREENSIZEY;
        backBufferCtx = backBuffer.getContext("2d");

        // Generate the tilemap
        tilemap.generate(Settings.MAPSIZEX, Settings.MAPSIZEY, {
            viewport: {
                width: Settings.SCREENSIZEX,
                height: Settings.SCREENSIZEY
            },
            onload: function() {
                window.tilemap = tilemap;
                tilemap.render(screenCtx);
                //tilemap.renderWater(screenCtx);
            }
        });

		// Set up HUD
		hud = new HUD(Settings.SCREENSIZEX, Settings.SCREENSIZEY);

        // Set up score engine
        scoreEngine = new ScoreEngine();
        hud.addElement(scoreEngine);

        // Set up invenotory
        inventory = new Inventory(6);

        hud.addElement(inventory);
		for(i=0;i<5;i++){
			inventory.powerUpPickedUp(5);
		}

        // Set up health bar
        hb = new healthBar(stateManager);
        hud.addElement(hb);

        // Create the player and add them to
        // the entity manager
        var randomPos = tilemap.randomOnSurface();
        player = new Player(randomPos.x * 64, randomPos.y * 64, 0, inputManager, hb, scoreEngine, inventory);
        entityManager = new EntityManager(player);

        this.spawningManager = new SpawningManager(entityManager, scoreEngine, player, inputManager);

        // Kyle Brown: Background Music
        var bgMusic = new Audio('./resources/sounds/DiggyHoleBGMusicAm.wav');
        bgMusic.addEventListener('ended', function() {
            this.currentTime = 0;
            this.play();
        }, false);
        bgMusic.play();


    };

    /* Updates the state of the game world
     * arguments:
     * - elapsedTime, the amount of time passed between
     * this and the prior frame.
     */
    var update = function(elapsedTime) {
        this.spawningManager.update(elapsedTime, tilemap);
        entityManager.update(elapsedTime, tilemap, ParticleManager);
        tilemap.update(elapsedTime);
        ParticleManager.update(elapsedTime);
        inputManager.swapBuffers();
        //octopus.getPlayerPosition(player.boundingBox());
        hud.update(player.boundingBox());
    };

    /* Renders the current state of the game world
     */
    var render = function() {
        // Clear the back buffer
        backBufferCtx.fillRect(0, 0, Settings.SCREENSIZEX, Settings.SCREENSIZEY);
        // TODO: Calculate rubberbanding
        var bounds = player.boundingBox();
        var offsetX = Settings.SCREENSIZEX / 2,
            offsetY = Settings.SCREENSIZEY / 2;

        // Apply camera transforms
        backBufferCtx.save();backBufferCtx.translate(offsetX - bounds.left, offsetY - bounds.top);
        tilemap.setCameraPosition(bounds.left, bounds.top);

        // Redraw the map & entities
        tilemap.render(backBufferCtx);
        entityManager.render(backBufferCtx, false);
        //player.render(backBufferCtx, true);
        ParticleManager.render(backBufferCtx);
        tilemap.renderWater(backBufferCtx);
        hud.render(backBufferCtx);

        backBufferCtx.restore();

        // Flip the back buffer
        screenCtx.drawImage(backBuffer, 0, 0, Settings.SCREENSIZEX, Settings.SCREENSIZEY);
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
    var exit = function() {};

    return {
        load: load,
        exit: exit,
        update: update,
        render: render,
        keyDown: keyDown,
        keyUp: keyUp
    };

})();

},{"./HUD.js":3,"./Settings.js":5,"./collectible.js":11,"./entity-manager.js":15,"./healthBar.js":22,"./input-manager.js":24,"./inventory.js":25,"./main-menu.js":27,"./particle-manager.js":30,"./player.js":31,"./powerUp.js":32,"./score.js":33,"./spawning-manager.js":34,"./tilemap.js":36}],18:[function(require,module,exports){
/* Game over module
 * Authors:
 * - Filip Stanek
 */
module.exports = (function (){

    var gameOver = document.getElementById("game_over");

    var load = function(sm) {
        gameOver.style.display = "flex";
    };

    var exit = function() {
        gameOver.style.display = "none";
    };

    var update = function() {};

    var render = function() {};

    var keyDown = function(event) {
        switch(event.keyCode) {
            case 13: // ENTER
                location.reload();
                break;
        }
    };

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
},{}],19:[function(require,module,exports){
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

},{"./animation.js":6,"./entity.js":16}],20:[function(require,module,exports){
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

},{"./animation.js":6,"./entity.js":16}],21:[function(require,module,exports){
/* Richard Habeeb */

module.exports = (function(){
    var Entity = require('./entity.js');
    var Animation = require('./animation.js');
    var imagesToLoad = 2;
    var frameSize = {x: 64, y: 64};
    var loader = function() {
        imagesToLoad--;
        if(imagesToLoad === 0) {

        }
    };
    var walkingSpriteSheet = new Image();
    walkingSpriteSheet.src = "./img/Goblin Shaman.png";

    var attackSpriteSheet = new Image();
    attackSpriteSheet.src = "./img/Goblin Shaman Attack.png";
    var gravity = -250;


    var shaman = function(x, y, layer) {
        this.score = 1;
        this.type = "shaman";
        this.maxhp = 100;
        this.hp = this.maxhp;
        this.state = this.idleState;
        this.layerIndex = layer;
        this.reverse = false;
        this.dead = false;
        this.walkingAnimation = new Animation(walkingSpriteSheet, frameSize.x, frameSize.y, 0, 0, 4, 1.0 / 4, false);
        this.attackingAnimation = new Animation(attackSpriteSheet, frameSize.x, frameSize.y, 0, 0, 6, 1.0 / 4, false);
        this.renderAnimation = null;
        this.position = {x: x, y: y};
        this.size = {x: 0, y: 0};
        this.velocity = {x: -50, y: 0};
    };

    shaman.prototype = new Entity();

    shaman.prototype.update = function(elapsedTime, tilemap, entityManager) {
        if(this.state === null) this.state = this.idleState;

        if(this.dead) entityManager.remove(this);

        this.state(elapsedTime, tilemap, entityManager);
    };

    shaman.prototype.render = function(ctx, debug) {

        if(this.reverse) {
            ctx.save();
            ctx.scale(-1, 1);
            this.renderAnimation.render(ctx, -frameSize.x - this.position.x, this.position.y);
            ctx.restore();
        }
        else {
            this.renderAnimation.render(ctx, this.position.x, this.position.y);
        }



        if (debug) renderDebug(this, ctx);
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
        var tileX = 64 * Math.floor((bounds.left + (frameSize.x / 2 )) / 64),
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

    shaman.prototype.onGround = function (tilemap) {
        var box = this.boundingBox(),
            tileX = Math.floor((box.left + (frameSize.x / 2)) / 64),
            tileY = Math.floor(box.bottom / 64);
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
        return (tile && tile.data.solid) ? true : false;
    };

    shaman.prototype.nextTileEmpty = function (tilemap) {
        var box = this.boundingBox(),
            tileX = Math.floor((box.left + (frameSize.x / 2)) / 64),
            tileY = Math.floor((box.bottom + (frameSize.y / 2)) / 64);
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
        return (tile && !tile.data.solid) ? true : false;
    };

    shaman.prototype.isPlayerNearby = function(entityManager) {
        var entitiesInRange = entityManager.queryRadius(this.position.x, this.position.y, 200);
        if (entitiesInRange.length > 0) {
            for (var i = 0; i < entitiesInRange.length; i ++) {
                if (entitiesInRange[i].type == 'player') {
                    return true;
                }
            }
        }
        return false;
    };

    shaman.prototype.idleState = function(elapsedTime, tilemap, entityManager) {
        if(!this.onGround(tilemap)) {
            this.velocity.y += (gravity * elapsedTime) * (gravity * elapsedTime);

        }
        else {
            this.velocity.y = 0;
            this.position.y = Math.floor(this.position.y / 64) * 64;
            if(this.isPlayerNearby(entityManager)) {
                this.state = this.attackState;
            }
        }

        if(this.nextTileEmpty(tilemap)) {
            this.velocity.x = -this.velocity.x;
        }

        this.position.x += this.velocity.x * elapsedTime;
        this.position.y += this.velocity.y * elapsedTime;
        this.reverse = this.velocity.x > 0;
        this.walkingAnimation.update(elapsedTime);
        this.renderAnimation = this.walkingAnimation;
    };

    shaman.prototype.attackState = function(elapsedTime, tilemap, entityManager) {
        if(!this.isPlayerNearby(entityManager) || !this.onGround(tilemap)) {
            this.state = this.idleState;
        }
        this.attackingAnimation.update(elapsedTime);
        this.renderAnimation = this.attackingAnimation;
    };

    shaman.prototype.boundingBox = function() {
        return {
            top: this.position.y,
            left: this.position.x,
            right: this.position.x + frameSize.x,
            bottom: this.position.y + frameSize.y
        };
    };

    shaman.prototype.boundingCircle = function() {
        return {
            cx: this.position.x + frameSize.x / 2.0,
            cy: this.position.y + frameSize.y / 2.0,
            radius: frameSize.x
        };
    };

    shaman.prototype.collide = function(ent) {
        if(ent.type == "Pickaxe")
        {
            //check if attacking once attacking is fixed.
            this.dead = true;
        }
        if(ent.type == "goblinMiner")
        {

            //Do something interesting with health later
        }
    };



    return shaman;
})();

},{"./animation.js":6,"./entity.js":16}],22:[function(require,module,exports){
module.exports = (function(){

	function HealthBar(stateManager) {
		const 	hbYOffset = 50,
			hbWidth = 200,
			hbHeight = 30,
			lineCount = Math.round(hbWidth / 40),
			lineOffset = Math.round(hbWidth / 100),
			alpha = 1/lineCount,
			hbXOffset = Math.round(hbWidth / 25),
			hbFrameWidthOffset = 5,
			hbFrameYOffset = hbYOffset - ((lineCount+1)*4-lineOffset)/2 - hbFrameWidthOffset;


		this.x;
		this.y;
		this.health = 100;
		this.deficit = 0;
		this.gameOver = require('./gameOver.js');
		this.stateManager = stateManager;


		this.heal = function(health) {
			this.health = Math.min(this.health + health, 100)
		};

		/**
		 returns true if the player is alive
		 returns false if the player is dead
		 */
		this.hurt = function(health) {
			this.health = Math.max(this.health - health, 0);
			var sm = this.stateManager;
			var go = this.gameOver;
			if (this.health == 0) {
				setInterval(function(){
					sm.pushState(go);
				}, 3000);
				return false;
			}
			return true;
		};

		/**
		 screenCtx: 		canvas
		 x:				top left corner x of the player
		 y:				top left corner y of the player
		 screenWidth:	screen width
		 screenHeight:	screen height
		 */
		this.update = function(x, y, screenWidth, screenHeight) {
			// console.log("x: " + x + " y: " + y);
			this.x = x;
			this.y = y;
			this.deficit = (1 - this.health / 100) * (hbWidth - 2 * hbXOffset);
		};


		/**
		 screenCtx: 		canvas
		 */
		this.render = function(screenCtx) {

			screenCtx.strokeStyle = 'black';
			// screenCtx.fillStyle = 'black';
			screenCtx.lineWidth = 5;
			screenCtx.rect(this.x, this.y + hbFrameYOffset, hbWidth,
				(lineCount+1)*4-lineOffset + hbFrameWidthOffset*2);
			screenCtx.stroke();

			for (var j = lineCount; j >= 0; j --) {
				screenCtx.lineWidth = (j+1)*4-lineOffset;
				if	(j == 0)
					screenCtx.strokeStyle = 'yellow';
				else
					screenCtx.strokeStyle = 'rgba(255,0,0,'+alpha+')';
				screenCtx.beginPath();
				screenCtx.moveTo(this.x + hbXOffset, this.y + hbYOffset);
				screenCtx.lineTo(this.x + hbWidth - hbXOffset - this.deficit, this.y + hbYOffset);
				screenCtx.closePath();
				screenCtx.stroke();
			}
		}
	}

	return HealthBar;
}());
},{"./gameOver.js":18}],23:[function(require,module,exports){
/**
 * Help Menu: Manages the help menu screen
 * Created by Josh Benard on 11/19/15.
 */
module.exports = (function (){
    const SCREEN_WIDTH = 128;
    const SCREEN_HEIGHT = 128;

    var menu = document.getElementById("help-menu"),
        exit = document.getElementById("exit-btn"),
        wrap = document.getElementById("help-wrapper"),
        inputManager = require('./input-manager.js'),
        scroll = 0,
        Player = require('./player.js'),
        player,
        Bone = require('./bone.js'),
        bone,
        screenCtx,
        backBuffer,
        backBufferCtx,
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
        player = new Player(32,64,0, inputManager);

        // Set up the screen canvas
        var screen = document.createElement("canvas");
        screen.width = SCREEN_WIDTH;
        screen.height = SCREEN_HEIGHT;
        screenCtx = screen.getContext("2d");
        document.getElementById("player-tester").appendChild(screen);
    }

    /*
     * The exit() method hides the menu
     */
    var exit = function() {
        // delete the canvas object
        document.getElementById("player-tester").removeChild(document.getElementById("player-tester").firstChild);
        menu.style.display = "none";
    }

    /*
     * The update() method updates the menu,
     * scrolling the credits
     */
    var update = function(elapsedTime) {
        player.demoUpdate(elapsedTime, null);
        if(bone) {
            if(bone.isLeft){
                bone.currentX -= elapsedTime * bone.xSpeed;
            } else {
                bone.currentX += elapsedTime * bone.xSpeed;
            }
            if(bone.boundingBox().right <= 0)
                bone = null;
            else if(bone.boundingBox().left >= 128)
                bone = null;
        }
    }

    /*
     * The render() method renders the menu
     * (in this case, a no-op as the menu is
     * HTML elements renderd by the DOM)
     */
    var render = function() {
        // Clear the back buffer
        screenCtx.fillStyle = 'rgb(0,0,0)';
        screenCtx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        screenCtx.save();

        player.render(screenCtx, false);

        if(bone)
            bone.render(screenCtx);

        screenCtx.restore();
    }

    /*
     * The keyHander() method handles key
     * events for the menu.
     */
    var keyDown = function(event) {
        event.preventDefault();
        switch(event.keyCode) {
            case 27: // ESC
                stateManager.popState();
                break;
            case inputManager.commands.SHOOT:
                bone = new Bone(player.currentX, player.currentY, 0, player.isLeft, player);
                break;
            default:
                inputManager.keyDown(event);
                break;
        }
    }

    var keyUp = function(event) {
        inputManager.keyUp(event);
    }

    return {
        load: load,
        exit: exit,
        update: update,
        render: render,
        keyDown: keyDown,
        keyUp: keyUp
    }

})();
},{"./bone.js":9,"./input-manager.js":24,"./player.js":31}],24:[function(require,module,exports){
module.exports = (function() { 

  var commands = {	
    RIGHT: 39,
    LEFT: 37,
    UP: 38,
    DOWN: 40,
    DIGDOWN: 83, 	// S
    DIGLEFT: 65, 	// A
    DIGRIGHT: 68,	// D
    DIGUP: 87,		// W
	PAY: 80,		// P
	ATTACK : 65,	// A
	SHOOT : 66,	 	// B
	ONE : 49,
	TWO : 50,
	THREE : 51,
	FOUR : 52,
	FIVE : 53,
	SIX : 54
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
},{}],25:[function(require,module,exports){
module.exports = (function(){
	
	var InventorySlot = require('./inventorySlot.js');
	
	const	slotSize = 64,
			lineWidth = 5;
	
	/**
	This class manages player's inventory.
	All actions from input manager are handled
	from the player class - section commented as
	Power Up Usage Management
	
	slotNum		- number of slots in the inventory
	*/
	function Inventory(slotNum) {
		this.x;
		this.y;
		this.slotNum = slotNum;
		this.slots = new Array(slotNum);
		this.inventoryLength = slotNum * slotSize;
		
		
		//Init Power Ups
			// Hardcoded to 3
			// Change parameter in inventory constructor in game.js
		for (var i = 0; i < slotNum; i ++) {
			if (i == 0) {
				this.slots[0] = new InventorySlot('./img/powerUps/medicine.png');
			} else if (i == 1) {
				this.slots[1] = new InventorySlot('./img/powerUps/pick.png');
			} else if (i == 2) {
				this.slots[2] = new InventorySlot('./img/powerUps/stone_shield.png');
			} else if (i == 3) {
				 this.slots[3] = new InventorySlot('./img/powerUps/coin.png');
			} else if (i == 4) {
				this.slots[4] = new InventorySlot('./img/powerUps/crystal.png');
			} else if (i == 5){
				this.slots[5] = new InventorySlot('./img/powerUps/bone.png');
			}
		};
		
		this.slotUsed = function(idx) {
			return this.slots[idx].slotUsed();
		};
		
		this.powerUpPickedUp = function(idx) {
			this.slots[idx].pickedUp();
		}
		
		this.update = function(x, y, screenWidth, screenHeight) {
			this.x = x + screenWidth - this.inventoryLength - lineWidth;
			this.y = y + screenHeight - slotSize;
		};
	
		this.render = function(screenCtx) {
			screenCtx.strokeStyle = 'black';
			screenCtx.lineWidth = lineWidth;
			for (var i = 0; i < this.slotNum; i ++) {
				screenCtx.rect(this.x + i * slotSize, this.y, slotSize, slotSize);
				this.slots[i].render(screenCtx, this.x + i * slotSize, this.y);
			}
			screenCtx.stroke();
		};
	};

return Inventory;
}());
},{"./inventorySlot.js":26}],26:[function(require,module,exports){
module.exports = (function(){
	
	const IMG_SIZE = 64;
	
	function InventorySlot(imgSrc) {
		this.amount = 0;
		this.img = new Image();
		this.img.src = imgSrc;
		
		/**
			Returns true if power up in the inventory otherwise false
		*/
		this.slotUsed = function() {
			if (this.amount > 0) {
				this.amount--;
				console.log("Used slot");
				return true;
			}
			console.log("Not enough in slot");
			return false;
		};
		
		this.pickedUp = function() {
			this.amount ++;
		};
		
		this.render = function(screenCtx, x, y) {
			if (this.img.complete == false)
				return;
			if (this.amount > 0)
				screenCtx.drawImage(this.img, 0, 0, IMG_SIZE, IMG_SIZE, x, y, IMG_SIZE, IMG_SIZE);
				screenCtx.font = "20pt Calibri";
				screenCtx.fillStyle = "red";
				screenCtx.fillText("x"+this.amount, x+5, y + IMG_SIZE - 10);
				
		};
	}


return InventorySlot;
}());




},{}],27:[function(require,module,exports){
/* MainMenu GameState module
 * Provides the main menu for the Diggy Hole game.
 * Authors:
 * - Nathan Bean
 */
module.exports = (function (){
  var menu = document.getElementById("main-menu"),
      play = document.getElementById("play-btn"),
      help = document.getElementById("help-btn"),
      credits = document.getElementById("credits-btn"),
      items = [play, help, credits],
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
   *  The Help button launches the help menu
   */
  help.onclick = function(event) {
    event.preventDefault();
    var helpScreen = require('./help-screen');
    stateManager.pushState(helpScreen);
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
},{"./credits-screen":12,"./help-screen":23}],28:[function(require,module,exports){


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
  
  //edited the main to go to the splash-screen first
  var splash = require('./splash-screen');
  pushState(splash);
  
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
},{"./game":17,"./splash-screen":35}],29:[function(require,module,exports){
/* Noise generation module
 * Authors:
 * - Nathan Bean
 * - Wyatt Watson
 */
module.exports = (function(){
  // Initially, we start with a random seed
  var seed = 0; //Math.random();

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

},{}],30:[function(require,module,exports){
/* The particle manager maintains the list of particles currently in the world,
*  and handles the update and rendering functions for it
*
* Author: Daniel Marts
*/
module.exports = (function() {
const GRAVITY = -250;
const TERMINAL_VELOCITY = GRAVITY * -8;
const MAX_PARTICLES = 250;

/* Constructor for each particle
* x = starting x Pos, y = starting y Pos, velX, velY starting velocities
* grav = if the particle follows the effect of gravity
* r = radius of the particle, c = color of particle,
* life = lifespan of particle in seconds
*/
function Particle(x, y, velX, velY, grav, r, c, life) {
  this.xPos = x;
  this.yPos = y;
  this.velocityX = velX;
  this.velocityY = velY;
  this.gravity = grav;
  this.radius = r;
  this.color = c;
  this.lifeLeft = life;
}

var Count = 0;
var particles = [];
    //start = 0, end = 0;

/* adds a particle to the world
* x = starting x Pos, y = starting y Pos, velX, velY starting velocities
* grav = if the particle follows the effect of gravity
* r = radius of the particle, c = color of particle,
* life = lifespan of particle in seconds
*/
function add(x, y, velX, velY, grav, r, c, life){
  /*
  if ((end) > MAX_PARTICLES)
  {
    end = 0;
    particles[0] = new Particle(x, y, velX, velY, grav, r, c, life);
  }
  else {
    particles[end++] = new Particle(x, y, velX, velY, grav, r, c, life);
  }*/
  particles.push(new Particle(x, y, velX, velY, grav, r, c, life));
  Count++;
}

//Adds dirt particles with a small lifespan
//Player calls this when he digs a tile
function addDirtParticles(tileX, tileY) {
  var xoff = tileX * 64 + 32;
  var yoff = tileY * 64 + 32;
  for (var i = 0; i < 5; i++) {
    var xv = 200*(Math.random()-0.5),
        yv = -100+-200*Math.random(),
        rad = 5*Math.random();

    add(xoff,yoff, xv, yv, "true", rad, "#361718", 1);

  }
}

//Adds stone particles with a small lifespan
//Player calls this when he digs a tile
function addStoneParticles(tileX, tileY) {
  var xoff = tileX * 64 + 32;
  var yoff = tileY * 64 + 32;
  for (var i = 0; i < 5; i++) {
    var xv = 200*(Math.random()-0.5),
        yv = -100+-200*Math.random(),
        rad = 5*Math.random();

    add(xoff,yoff, xv, yv, "true", rad, "#4d4d4d", 1);

  }
}

//Adds lava level particles with a small lifespan
//Player calls this when he digs a tile
function addDeepParticles(tileX, tileY) {
  var xoff = tileX * 64 + 32;
  var yoff = tileY * 64 + 32;
  for (var i = 0; i < 5; i++) {
    var xv = 200*(Math.random()-0.5),
        yv = -100+-200*Math.random(),
        rad = 5*Math.random();

    add(xoff,yoff, xv, yv, "true", rad, "#000000", 1);

  }
}

/*Removes the particle at the location given and increments start until it points
* to the first element still in the array
*/
function remove(loc) {
  //particles[loc] = undefined;
  particles.splice(loc, 1);
  Count--;
  /*
  if (loc == start) {
    while (typeof(particles[start]) !== "undefined")
      start++;
  }
  */
}

/* Updates the particle at the current location
*/
function updateCurrent(i, elapsedTime) {
  particles[i].lifeLeft -= elapsedTime;
  if (particles[i].lifeLeft <= 0) {
    remove(i);
  }
  else {
    if (particles[i].gravity == "true") {
      particles[i].xPos += elapsedTime * particles[i].velocityX;
      if(particles[i].velocityY < TERMINAL_VELOCITY) {
        particles[i].velocityY += Math.pow(GRAVITY * elapsedTime, 2);
      }
      particles[i].yPos += particles[i].velocityY * elapsedTime;
    }
    else {
      particles[i].xPos += elapsedTime * particles[i].velocityX;
      particles[i].yPos += elapsedTime * particles[i].velocityY;
    }
  }
}

/* Updates all particles
*/
function update(elapsedTime){
  for (var i = 0; i < MAX_PARTICLES; i++) {
    if (typeof(particles[i]) !== "undefined"){
      updateCurrent(i, elapsedTime);
    }
  }
  /*
  if (start > end) {
    for (var i = start; start < MAX_PARTICLES; i++) {
      if (typeof(particles[i]) !== "undefined"){
        updateCurrent(i, elapsedTime);
      }
    }
    for (var i = 0; i <=start ; i++) {
      if (typeof(particles[i]) !== "undefined"){
        updateCurrent(i, elapsedTime);
      }
    }
  }
  else {
    for (var i = start; i < end; i++) {
      if (typeof(particles[i]) !== "undefined"){
        updateCurrent(i, elapsedTime);
      }
    }
  }*/
}

/* Draws particle at the index on the current contextual
*/
function renderCurrent(index, ctx) {
  ctx.beginPath();
  ctx.arc(particles[index].xPos, particles[index].yPos, particles[index].radius, 2* Math.PI, false );
  ctx.closePath();
  ctx.fillStyle = particles[index].color;
  ctx.fill();
}

/* Draws all particles on the given context
*/
function render(ctx) {
  for (var i = 0; i < MAX_PARTICLES; i++) {
    if (typeof(particles[i]) !== "undefined"){
      renderCurrent(i, ctx);
    }
  }
  /*
  if (start > end) {
    for (var i = start; start < MAX_PARTICLES; i++) {
      if (typeof(particles[i]) !== "undefined"){
        renderCurrent(i, ctx);
      }
    }
    for (var i = 0; i <=start ; i++) {
      if (typeof(particles[i]) !== "undefined"){
        renderCurrent(i, ctx);
      }
    }
  }
  else {
    for (var i = start; i < end; i++) {
      if (typeof(particles[i]) !== "undefined"){
        renderCurrent(i, ctx);
      }
    }
  }
  */
}

return {
  add: add,
  addDirtParticles: addDirtParticles,
  addStoneParticles: addStoneParticles,
  addDeepParticles: addDeepParticles,
  remove: remove,
  update: update,
  render: render
};

}());

},{}],31:[function(require,module,exports){
/* Player module
 * Implements the entity pattern and provides
 * the DiggyHole player info.
 * Authors:
 * - Wyatt Watson
 * - Nathan Bean
 */
module.exports = (function() {
    /* jshint esnext: true */

    var Entity = require('./entity.js'),
        Animation = require('./animation.js'),
        Pickaxe = require('./Pickaxe.js'),
        Bone = require('./Bone.js'),
        Settings = require('./Settings.js');

    /*Audio sources*/
    jump_sound = new Audio('resources/sounds/jumping_sound.wav');
    dig_sound = new Audio('resources/sounds/digging_sound.mp3');
    walk_sound = new Audio('resources/sounds/walking_sound.mp3');
    throw_sound = new Audio('resources/sounds/throwing_sound.mp3');
    death_sound = new Audio('resources/sounds/death.wav');


    /* The following are player States (Swimming is not implemented) */
    const STANDING = 0;
    const WALKING = 1;
    const JUMPING = 2;
    const DIGGING = 3;
    const FALLING = 4;
    const SWIMMING = 5;
    const DEAD = 6;

    /* The following are digging direction states */
    const NOT_DIGGING = 0;
    const LEFT_DIGGING = 1;
    const RIGHT_DIGGING = 2;
    const DOWN_DIGGING = 3;
    const UP_DIGGING = 4;

    // The Sprite Size
    //depricated. this will soon be removed. TODO
    const SIZE = 64;


    // Movement constants
    const GRAVITY = -250;
    const TERMINAL_VELOCITY = GRAVITY * -8;
    const JUMP_VELOCITY = -900;

    // Swimming Moving Constant
    const GRAVITY_IN_WATER = -80;
    const SWIM_UP = -164;
    const SPEED_IN_LIQUID = 80;

    // Inventory constants
    const POWER_UP_FREQUENCY = 0.5;

    //The Right facing dwarf spritesheet
    var dwarfRight = new Image();
    dwarfRight.src = 'DwarfAnimatedRight.png';

    //The left facing dwarf spritesheet
    var dwarfLeft = new Image();
    dwarfLeft.src = "DwarfAnimatedLeft.png";

    var dwarfDead = new Image();
    dwarfDead.src = './img/dead_small.png';

    var ratRight = new Image();
    ratRight.src = 'img/ratRight2.png';

    var ratLeft = new Image();
    ratLeft.src = "img/ratLeft2.png";

    //The Player constructor
    function Player(locationX, locationY, layerIndex, inputManager, healthBar, scoreEngine, inventory) {
        this.inputManager = inputManager;
        this.state = WALKING;
        this.digState = NOT_DIGGING;
        this.dug = false;
        this.downPressed = false;
        this.layerIndex = layerIndex;
        this.x = locationX;
        this.y = locationY;
        this.spriteOffset = { x: -8, y: -16 };
        this.spriteSize = { x: 64, y: 64 };
        this.hitboxSize = { x: 48, y: 48 };
        this.gravity = 0.5;
        this.angle = 0;
        this.xSpeed = 10;
        this.ySpeed = 15;
        this.isLeft = false;
        this.SPEED = 300;
        this.type = "player";
        this.superPickaxe = false;
        this.superAxeImg = new Image();
        this.superAxeImg.src = "./img/powerUps/pick.png";
        this.boneImg = new Image();
        this.boneImg.src = "./img/BoneLeft.png";
        this.stoneShield = false;
        this.healthBar = healthBar;
        this.scoreEngine = scoreEngine;
        this.inventory = inventory;
        this.lastPowerUpUsed = 0;

        // bone powerup
        this.attackFrequency = 1;
        this.lastAttack = 0;

        //The animations
        this.animations = {
            left: [],
            right: []
        };

        // Player's Swimming properties
        this.swimmingProperty = {
            breathCount: 0,
            escapeSwimming: false,
        };

        //The right-facing animations
        this.animations.right[STANDING] = new Animation(dwarfRight, this.spriteSize.x, this.spriteSize.y, this.spriteSize.y * 3, 0);
        this.animations.right[WALKING] = new Animation(dwarfRight, this.spriteSize.x, this.spriteSize.y, 0, 0, 4);
        this.animations.right[DIGGING] = new Animation(dwarfRight, this.spriteSize.x, this.spriteSize.y, 0, this.spriteSize.x * 2, 4);
        this.animations.right[FALLING] = new Animation(dwarfRight, this.spriteSize.x, this.spriteSize.y, 0, this.spriteSize.x);
        this.animations.right[SWIMMING] = new Animation(dwarfRight, this.spriteSize.x, this.spriteSize.y, 0, 0, 4);
        this.animations.right[DEAD] = new Animation(dwarfDead, this.spriteSize.x, this.spriteSize.y, 0, 0, 16, 1/8, 1 );

        //The left-facing animations
        this.animations.left[STANDING] = new Animation(dwarfLeft, this.spriteSize.x, this.spriteSize.y, 0, 0);
        this.animations.left[WALKING] = new Animation(dwarfLeft, this.spriteSize.x, this.spriteSize.y, 0, 0, 4);
        this.animations.left[DIGGING] = new Animation(dwarfLeft, this.spriteSize.x, this.spriteSize.y, 0, this.spriteSize.x * 2, 4);
        this.animations.left[FALLING] = new Animation(dwarfLeft, this.spriteSize.x, this.spriteSize.y, this.spriteSize.y * 3, this.spriteSize.x);
        this.animations.left[SWIMMING] = new Animation(dwarfLeft, this.spriteSize.x, this.spriteSize.y, 0, 0, 4);
        this.animations.left[DEAD] = new Animation(dwarfDead, this.spriteSize.x, this.spriteSize.y, 0, 0, 16, 1/8, 1 );

        //Setup the jump animations
        resetJumpingAnimation(this);
    }

    // Player inherits from Entity
    Player.prototype = new Entity();

    // Check to see if player is in water i.e full body immersion (head inside water)
    Player.prototype.inWaterorLava = function(tilemap) {
        var box = this.boundingBox();
        var tileX = Math.floor((box.right - (SIZE/24))/Settings.TILESIZEX);
        // Based on the position that player is facing changed the location of it's X coordinate
        if(this.isLeft) {
            tileX = Math.floor((box.left + (SIZE/(3/2)))/Settings.TILESIZEX);
        }
        var tileY = Math.floor(box.top / Settings.TILESIZEX),
            tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
        if(tile){
            if (tile.data.type == "Water" || tile.data.type == "Lava"){
                return true;
            }
        }
        return false;
    };
    // Check to see if player is on top of water
        Player.prototype.onWater = function(tilemap) {
            var box = this.boundingBox();
            var tileX = Math.floor((box.right)/Settings.TILESIZEX);
            // Based on the position that player is facing changed the location of it's X coordinate
            if(this.isLeft) {
            	tileX = Math.floor((box.left)/Settings.TILESIZEX);
            }
            var tileY = Math.floor(box.bottom / Settings.TILESIZEX) - 1,// check if player is right above water.
            tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
            if(tile){
                if (tile.data.type == "Water" && !this.inWaterorLava(tilemap)){
                    return true;
                }
             }
         return false; //
        };


    // Determines if the player is on the ground
    Player.prototype.onGround = function(tilemap) {
        var box = this.boundingBox(),
            tileXL = Math.floor((box.left + 32) / 64),
            tileXR = Math.floor((box.right - 32) / 64),
            tileY = Math.floor((box.bottom) / 64),
            tileL = tilemap.tileAt(tileXL, tileY, this.layerIndex),
            tileR = tilemap.tileAt(tileXR, tileY, this.layerIndex);
        // find the tile we are standing on.
        if(tileL && tileL.data.solid) return true;
        if(tileR && tileR.data.solid) return true;
        return false;
    };
    Player.prototype.onGroundInWater = function(tilemap) {
        var box = this.boundingBox(),
            tileXL = Math.floor((box.left + 5) / Settings.TILESIZEX),
            tileXR = Math.floor((box.right - 5) / Settings.TILESIZEX),
            tileY = Math.floor((box.bottom) / Settings.TILESIZEY),
            tileL = tilemap.tileAt(tileXL, tileY, this.layerIndex),
            tileR = tilemap.tileAt(tileXR, tileY, this.layerIndex);
        // find the tile we are standing on.
        if(tileL && tileL.data.solid) return true;
        if(tileR && tileR.data.solid) return true;
        return false;
    };


    // Check that player's head is above water but not hitting a solid
    Player.prototype.headOverWater = function (tilemap){

        var box = this.boundingBox(),
            tileXL = Math.floor((box.left) / 64),
            tileXR = Math.floor((box.right) / 64),
            tileY = Math.floor((box.top) / 64),
            tileL = tilemap.tileAt(tileXL, tileY, this.layerIndex),
            tileR = tilemap.tileAt(tileXR, tileY, this.layerIndex);
            return ((tileL && tileL.data.notDiggable) || (tileR && tileR.data.notDiggable))&& !this.inWaterorLava(tilemap);
    };

    // Determines if the player will ram his head into a block above
    Player.prototype.isBlockAbove = function(tilemap) {
        var box = this.boundingBox(),
            tileXL = Math.floor((box.left + 5) / Settings.TILESIZEX),
            tileXR = Math.floor((box.right - 5) / Settings.TILESIZEX),
            tileY = Math.floor((box.top + 5) / Settings.TILESIZEY),
            tileL = tilemap.tileAt(tileXL, tileY, this.layerIndex),
            tileR = tilemap.tileAt(tileXR, tileY, this.layerIndex);
        // find the tile we are standing on.
        if(!tileL || tileL.data.solid) return true;
        if(!tileR || tileR.data.solid) return true;
        return false;
    };

    // Moves the player to the left, colliding with solid tiles
    Player.prototype.moveLeft = function(distance, tilemap) {
        var box = this.boundingBox(),
            tileXUpper = Math.floor(box.left / Settings.TILESIZEX),
            tileYUpper = Math.floor(box.top / Settings.TILESIZEY),
            tileXLower = Math.floor(box.left/ Settings.TILESIZEX),
            tileYLower = Math.floor(box.bottom / Settings.TILESIZEY),
            tileUpper = tilemap.tileAt(tileXUpper, tileYUpper, this.layerIndex),
            tileLower = tilemap.tileAt(tileXLower, tileYLower, this.layerIndex);
        if (this.state === FALLING || this.state === JUMPING) {
          if (tileUpper && !tileUpper.data.solid && tileLower && !tileLower.data.solid) {
            this.x -= distance;
          }
        }
        else {
          if (tileUpper && !tileUpper.data.solid) {
            this.x -= distance;
          }
          else {
              this.x = Settings.TILESIZEX * (tileXUpper + 1) - 5;
          }
        }
    };

    // Moves the player to the right, colliding with solid tiles
    Player.prototype.moveRight = function(distance, tilemap) {
        var box = this.boundingBox(),
            tileXUpper = Math.floor(box.right / Settings.TILESIZEX),
            tileYUpper = Math.floor(box.top / Settings.TILESIZEY),
            tileXLower = Math.floor(box.right / Settings.TILESIZEX),
            tileYLower = Math.floor(box.bottom / Settings.TILESIZEY),
            tileUpper = tilemap.tileAt(tileXUpper, tileYUpper, this.layerIndex),
            tileLower = tilemap.tileAt(tileXLower, tileYLower, this.layerIndex);

        if (this.state === FALLING || this.state === JUMPING) {
          if (tileUpper && !tileUpper.data.solid && tileLower && !tileLower.data.solid) {
            this.x += distance;
          }
        }
        else {
          if (tileUpper && !tileUpper.data.solid) {
            this.x += distance;
          }
          else {
              this.x = Settings.TILESIZEX * (tileXUpper) - this.hitboxSize.x;
          }
        }
    };

    /* Player update function
     * arguments:
     * - elapsedTime, the time that has passed
     *   between this and the last frame.
     * - tilemap, the tilemap that corresponds to
     *   the current game world.
     */
    Player.prototype.update = function(elapsedTime, tilemap, entityManager, ParticleManager) {
        var sprite = this;
        sprite.entityManager = entityManager;

        if(this.digState == NOT_DIGGING) {
            if (this.inputManager.isKeyDown(this.inputManager.commands.DIGDOWN)) {
                this.digState = DOWN_DIGGING;
                this.setupDig(new Pickaxe({ x: this.x + this.hitboxSize.x / 2, y: this.y + this.hitboxSize.y}, true), entityManager, ParticleManager);
            } else if(this.inputManager.isKeyDown(this.inputManager.commands.DIGLEFT)) {
                this.digState = LEFT_DIGGING;
                this.isLeft = true;
                this.setupDig(new Pickaxe({ x: this.x, y: this.y + this.hitboxSize.y / 2 }), entityManager, ParticleManager);
            } else if(this.inputManager.isKeyDown(this.inputManager.commands.DIGRIGHT)) {
                this.digState = RIGHT_DIGGING;
                this.isLeft = false;
                this.setupDig(new Pickaxe({ x: this.x + this.hitboxSize.x, y: this.y + this.hitboxSize.y / 2 }), entityManager, ParticleManager);
            } else if(this.inputManager.isKeyDown(this.inputManager.commands.DIGUP)) {
                this.digState = UP_DIGGING;
                this.setupDig(new Pickaxe({ x: this.x + this.hitboxSize.x / 2, y: this.y }, true), entityManager, ParticleManager);
            }
        }


        // Process player state
        switch (this.state) {
            case STANDING:
            case WALKING:
                // If there is no ground underneath, fall
                if (!this.onGround(tilemap)) {
                    this.state = FALLING;
                    this.velocityY = 0;
                }
                // If player is above water or inside water
                else if(this.inWaterorLava(tilemap)){
                    this.state = SWIMMING;
                    this.holdBreath = true;
                    this.velocityY = 0;
                }
                else {
                    if (this.inputManager.isKeyDown(this.inputManager.commands.UP)) {
                        /* Added sound effect for jumping */
                        jump_sound.play();

                        this.state = JUMPING;
                        this.velocityY = JUMP_VELOCITY;
                    } else if (this.inputManager.isKeyDown(this.inputManager.commands.LEFT)) {
                        /*Added walking sound*/
                        walk_sound.play();
                        this.isLeft = true;
                        this.state = WALKING;
                        this.moveLeft(elapsedTime * this.SPEED, tilemap);
                    }
                    else if(this.inputManager.isKeyDown(this.inputManager.commands.RIGHT)) {

                        /* Added walking sound */
                        walk_sound.play();

                        this.isLeft = false;
                        this.state = WALKING;
                        this.moveRight(elapsedTime * this.SPEED, tilemap);
                    }
                    else {
                        this.state = STANDING;
                    }
                }
                break;
            case JUMPING:
                this.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
                this.y += this.velocityY * elapsedTime;
                if (this.velocityY > 0) {
                    this.state = FALLING;
                    console.log("I falling from jump");
                    resetJumpingAnimation(this);
                } else if (this.isBlockAbove(tilemap)) {
                    this.state = FALLING;
                    this.velocityY = 0;
                    this.y = Settings.TILESIZEY * (Math.floor((this.y) / Settings.TILESIZEY)+1);
                    resetJumpingAnimation(this);
                }

                if (this.inputManager.isKeyDown(this.inputManager.commands.LEFT)) {
                    this.isLeft = true;
                    this.moveLeft(elapsedTime * this.SPEED, tilemap);
                }
                if (this.inputManager.isKeyDown(this.inputManager.commands.RIGHT)) {
                    this.isLeft = false;
                    this.moveRight(elapsedTime * this.SPEED, tilemap);
                }
                break;
            case FALLING:
                if(this.velocityY < TERMINAL_VELOCITY) {
                    this.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
                }
                if(this.onWater(tilemap) || this.inWaterorLava(tilemap)){
                    this.state = SWIMMING;
                    this.velocityY = Math.pow(GRAVITY_IN_WATER * elapsedTime, 2);
                }
                else{
                	this.y += this.velocityY * elapsedTime;
                }
                if (this.onGround(tilemap)) {
                    this.state = STANDING;
                    this.y = Settings.TILESIZEY * Math.floor((this.y + this.hitboxSize.y) / Settings.TILESIZEY) - this.hitboxSize.y;
                } else if (this.inputManager.isKeyDown(this.inputManager.commands.LEFT)) {
                    this.isLeft = true;
                    this.moveLeft(elapsedTime * this.SPEED, tilemap);
                }
                else if(this.inputManager.isKeyDown(this.inputManager.commands.RIGHT)) {
                    this.isLeft = false;
                    this.moveRight(elapsedTime * this.SPEED, tilemap);
                }
                break;
            case SWIMMING:
                  this.velocityY += Math.pow(GRAVITY_IN_WATER * elapsedTime, 2) + (this.velocityY / GRAVITY_IN_WATER);
                  console.log("in water");
                    //this.y += this.velocityY * elapsedTime;
                  if (this.inputManager.isKeyDown(this.inputManager.commands.LEFT)) {
                      this.velocityY = 0;
                      this.isLeft = true;
                      this.moveLeft(elapsedTime * SPEED_IN_LIQUID, tilemap);
                  }
                  else if (this.inputManager.isKeyDown(this.inputManager.commands.RIGHT)) {
                      this.velocityY = 0;
                      this.isLeft = false;
                      this.moveRight(elapsedTime * SPEED_IN_LIQUID, tilemap);
                  }
                  else if (this.inputManager.isKeyDown(this.inputManager.commands.UP)) {
                          this.velocityY = SWIM_UP;
                          this.y += this.velocityY * elapsedTime;
                          console.log("SWIMING UP");
                  }
                  if (this.onGround(tilemap) && !this.inWaterorLava(tilemap)) {
                      this.velocityY = 0;
                      this.y = Settings.TILESIZEY * Math.floor((this.y + this.hitboxSize.y) / Settings.TILESIZEY) - this.hitboxSize.y;
                      this.state = STANDING;
                      console.log("standing");
                  }
                  else if (this.onGroundInWater(tilemap) && this.inWaterorLava(tilemap)) {
                      this.velocityY = 0;
                      this.y = Settings.TILESIZEY * Math.floor((this.y + this.hitboxSize.y) / Settings.TILESIZEY) - this.hitboxSize.y;
                      console.log("floating in water");
                  }
                  else if(this.headOverWater(tilemap)){
                      this.velocityY = JUMP_VELOCITY;
                      //this.y += this.velocityY * elapsedTime;
                      console.log("I am not in water");
                      this.state = JUMPING;
                  }
                  else if (this.isBlockAbove(tilemap)){
                      this.state = FALLING;
                      console.log("I hit my head");
                      this.y = Settings.TILESIZEY * (Math.floor((this.y) / Settings.TILESIZEY)+1);
                      this.velocityY = 0;
                  }
                  else{
                      if(!this.onGroundInWater(tilemap)){
                          //Player Sinks automatically, they have resistance i.e sink slower if fully immersed in water
                      this.y += this.velocityY * elapsedTime;
                      }

                  }


                // A counter for the health bar to check if player is drowning
                if (this.swimmingProperty.breathCount > 20) {
                    this.hurt(1);
                }
                break;
        }

        // countdown to next bone projectile
        if(this.lastAttack <= this.attackFrequency){
            this.lastAttack += elapsedTime;
        }


        // Power Up Usage Management
        this.lastPowerUpUsed += elapsedTime;

		if (this.inputManager.isKeyDown(this.inputManager.commands.SIX) || this.inputManager.isKeyDown(this.inputManager.commands.SHOOT)) {
                console.log("SIX or B pressed");
                if (this.lastAttack >= this.attackFrequency && inventory.slotUsed(5)) {
						this.shoot();
                }
            }

        if (this.lastPowerUpUsed >= POWER_UP_FREQUENCY) {
            if (this.inputManager.isKeyDown(this.inputManager.commands.ONE)) {
                console.log("One pressed");
                if (inventory.slotUsed(0)) {
                    this.heal(30);
                }
            } else if (this.inputManager.isKeyDown(this.inputManager.commands.TWO)) {
                console.log("TWO pressed");
                if (inventory.slotUsed(1)) {

                }
            } else if (this.inputManager.isKeyDown(this.inputManager.commands.THREE)) {
                console.log("THREE pressed");
                if (inventory.slotUsed(2)) {

                }
            } else if (this.inputManager.isKeyDown(this.inputManager.commands.FOUR)) {
                console.log("FOUR pressed");
                if (inventory.slotUsed(3)) {

                }
			} else if (this.inputManager.isKeyDown(this.inputManager.commands.FIVE)) {
                console.log("FIVE pressed");
                if (inventory.slotUsed(4)) {

                }
			this.lastPowerUpUsed = 0;
			}
        }



        // Swap input buffers
        this.inputManager.swapBuffers();

            // Check oxygen level of player
        if(this.holdBreath && this.inWaterorLava(tilemap)){
            this.swimmingProperty.breathCount += elapsedTime;
        }
        else{
            this.swimmingProperty.breathCount = 0; // If player is not in water reset breath count to zero
        }


        /* Update animations and pick */
        var animationSet = this.isLeft ? this.animations.left : this.animations.right;

        if(this.digState == NOT_DIGGING || this.state == DEAD) {
            animationSet[this.state].update(elapsedTime);
        } else {

            /* update pick position every frame */
            if(this.pick && this.digState == LEFT_DIGGING) {
                this.pick.x = this.x;
                this.pick.y = this.y + this.hitboxSize.y / 2;
            }
            if(this.pick && this.digState == RIGHT_DIGGING) {
                this.pick.x = this.x + this.hitboxSize.x;
                this.pick.y = this.y + this.hitboxSize.y / 2;
            }
            if(this.pick && this.digState == UP_DIGGING) {
                this.pick.x = this.x + this.hitboxSize.x / 2;
                this.pick.y = this.y;
            }
            if(this.pick && this.digState == DOWN_DIGGING) {
                this.pick.x = this.x + this.hitboxSize.x / 2;
                this.pick.y = this.y + this.hitboxSize.y;
            }

            //TODO create animations for each dig state
            if(this.digState == LEFT_DIGGING) {
                animationSet = this.animations.left;
            }
            else if(this.digState == RIGHT_DIGGING) {
                animationSet = this.animations.right;
            }
            animationSet[DIGGING].update(elapsedTime);
        }

    };

    //TODO this should be a prototype function like the rest
    /* This function resets (or initializes) the jumping animations */
    function resetJumpingAnimation(player) {
        player.animations.right[JUMPING] = new Animation(dwarfRight, player.spriteSize.x, player.spriteSize.y, player.spriteSize.y * 3, player.spriteSize.x, 3, 0.1, true, null, true);
        player.animations.left[JUMPING] = new Animation(dwarfLeft, player.spriteSize.x, player.spriteSize.y, 0, player.spriteSize.x, 3, 0.1, true);
    }

    // Update function for use with the help player
    //this should be either its own entity or should just use the regular update.
    Player.prototype.demoUpdate = function(elapsedTime) {
        var sprite = this;

        // The "with" keyword allows us to change the
        // current scope, i.e. 'this' becomes our
        // inputManager
        with (this.inputManager) {

            // Process player state
            switch (sprite.state) {
                case STANDING:
                case WALKING:
                    // If there is no ground underneath, fall
                    if (sprite.y < 64) {
                        sprite.state = FALLING;
                        sprite.velocityY = 0;
                    } else {
                        if (isKeyDown(commands.DIGDOWN)) {
                            sprite.state = DIGGING;
                            sprite.digState = DOWN_DIGGING;
                        } else if(isKeyDown(commands.DIGLEFT)) {
                            sprite.state = DIGGING;
                            sprite.digState = LEFT_DIGGING;
                            sprite.isLeft = true;
                        } else if(isKeyDown(commands.DIGRIGHT)) {
                            sprite.state = DIGGING;
                            sprite.digState = RIGHT_DIGGING;
                            sprite.isLeft = false;
                        } else if(isKeyDown(commands.DIGUP)) {
                            sprite.state = DIGGING;
                            sprite.digState = UP_DIGGING;
                        } else if (isKeyDown(commands.UP)) {
                            sprite.state = JUMPING;
                            sprite.velocityY = JUMP_VELOCITY;
                        } else if (isKeyDown(commands.LEFT)) {
                            sprite.isLeft = true;
                            sprite.state = WALKING;
                        }
                        else if(isKeyDown(commands.RIGHT)) {
                            sprite.isLeft = false;
                            sprite.state = WALKING;
                        }
                        else {
                            sprite.state = STANDING;
                        }

                        if(sprite.state == DIGGING) {
                            var digComplete = function() {

                                /* set the tile location that we are deleting */
                                switch(sprite.digState) {
                                    case DOWN_DIGGING:
                                        sprite.state = STANDING;
                                        break;
                                    case LEFT_DIGGING:
                                        sprite.state = STANDING;
                                        break;
                                    case RIGHT_DIGGING:
                                        sprite.state = STANDING;
                                        break;
                                    case UP_DIGGING:
                                        sprite.state = STANDING;
                                        break;
                                    default:
                                        return;
                                }

                                /* setup the callback for when the animation is complete */
                                sprite.animations.left[sprite.state].donePlayingCallback = function() {};
                                sprite.animations.right[sprite.state].donePlayingCallback = function() {};

                                /* reset the digging state */
                                sprite.digState = NOT_DIGGING;
                            };
                            this.animations.left[this.state].donePlayingCallback = digComplete;
                            this.animations.right[this.state].donePlayingCallback = digComplete;
                        }
                    }
                    break;
                case DIGGING:

                    break;
                case JUMPING:
                    sprite.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
                    sprite.y += sprite.velocityY * elapsedTime;
                    if (sprite.y <= -64) {
                        sprite.state = FALLING;
                        sprite.velocityY = 0;
                    }
                    if (isKeyDown(commands.LEFT)) {
                        sprite.isLeft = true;
                    }
                    if (isKeyDown(commands.RIGHT)) {
                        sprite.isLeft = true;
                    }
                    break;
                case FALLING:
                    if(sprite.velocityY < TERMINAL_VELOCITY) {
                        sprite.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
                    }
                    sprite.y += sprite.velocityY * elapsedTime;
                    if (sprite.y >= 64) {
                        sprite.state = STANDING;
                    } else if (isKeyDown(commands.LEFT)) {
                        sprite.isLeft = true;
                    }
                    else if(isKeyDown(commands.RIGHT)) {
                        sprite.isLeft = false;
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


    Player.prototype.setupDig = function(pickaxe, entityManager, ParticleManager) {
        dig_sound.play();
        this.pick = pickaxe;
        entityManager.add(this.pick);

        var currentPlayer = this;
        var digComplete = function() {
            /* Add score */
            //TODO different scores for different blocks?
            //currentPlayer.score(1);

            var box = currentPlayer.boundingBox(),
                tileX,
                tileY;

            /* set the tile location that we are deleting */
            switch(currentPlayer.digState) {
                case DOWN_DIGGING:
                    tileX = Math.floor((box.left + box.right) / 2 / Settings.TILESIZEX);
                    tileY = Math.floor(box.bottom / Settings.TILESIZEY);
                    break;
                case LEFT_DIGGING:
                    tileX = Math.floor((box.left - 5)/ Settings.TILESIZEX);
                    tileY = Math.floor((box.bottom + box.top) / 2 / Settings.TILESIZEY);
                    break;
                case RIGHT_DIGGING:
                    tileX = Math.floor((box.right + 5)/ Settings.TILESIZEX);
                    tileY = Math.floor((box.bottom + box.top) / 2 / Settings.TILESIZEY);
                    break;
                case UP_DIGGING:
                    tileX = Math.floor((box.left + box.right) / 2 / Settings.TILESIZEX);
                    tileY = Math.floor((box.top - 5) / Settings.TILESIZEY);
                    break;
                default:
                    return;
            }



            /* replace the set tile at this layer */
            var layerType = tilemap.returnTileLayer(tileX, tileY, currentPlayer.layerIndex);
            var tileNum = 0;
            if (layerType === 0) {
                tileNum = tilemap.tileAt(tileX, tileY, 0);
                tilemap.mineAt(1, tileX, tileY, currentPlayer.layerIndex, currentPlayer.superPickaxe);
                currentPlayer.score(1);
            } else if (layerType == 1) {
                tileNum = tilemap.tileAt(tileX, tileY, 0);
                tilemap.mineAt(13, tileX, tileY, currentPlayer.layerIndex, currentPlayer.superPickaxe);
                currentPlayer.score(1);
            } else if (layerType == 2) {
                tileNum = tilemap.tileAt(tileX, tileY, 0);
                tilemap.mineAt(15, tileX, tileY, currentPlayer.layerIndex, currentPlayer.superPickaxe);
                currentPlayer.score(1);
            }

            if(tileNum.data) {
                if (tileNum.data.type === "Sky Earth" || tileNum.data.type === "DirtWithGrass" || tileNum.data.type === "Dirt") {
                    ParticleManager.addDirtParticles(tileX, tileY);
                }
                else if (tileNum.data.type === "GemsWithGrass" || tileNum.data.type === "StoneWithGrass" || tileNum.data.type === "Gems" || tileNum.data.type === "Stone") {
                    ParticleManager.addStoneParticles(tileX, tileY);
                }
            }

            /* setup the callback for when the animation is complete */
            currentPlayer.animations.left[DIGGING].donePlayingCallback = function() {};
            currentPlayer.animations.right[DIGGING].donePlayingCallback = function() {};
            entityManager.remove(currentPlayer.pick);
            currentPlayer.pick = undefined;

            /* reset the digging state */
            currentPlayer.digState = NOT_DIGGING;
        };
        //TODO update animations for each direction
        this.animations.left[DIGGING].donePlayingCallback = digComplete;
        this.animations.right[DIGGING].donePlayingCallback = digComplete;
    };

    /*
     This method gets called when a power up is picked up
     It should eventually delete the power up from the game
     */
    Player.prototype.poweredUp = function(powerUp) {

        console.log("Picked up power up: " + powerUp.type);

        if (powerUp.type == 'boneUp') {
            inventory.powerUpPickedUp(5);
        } else if (powerUp.type == 'coin') {
            // add points
            this.score(20);

        } else if (powerUp.type == 'crystal') {
            // add points
            this.score(50);

        } else if (powerUp.type == 'pick') {

            console.log("super pickaxe activated");
            this.superPickaxe = true;

        } else if (powerUp.type == 'stone-shield') {
            this.stoneShield = true;

        } else if (powerUp.type == 'medicine') {
            inventory.powerUpPickedUp(0);
            // this.heal(30); now used manually from the inventory
        }


        if(powerUp.effectDuration < 0){//if power up lasts 4ever
            this.entityManager.remove(powerUp);
        }

    };

    Player.prototype.heal = function(health) {
        this.healthBar.heal(health);
    };

    Player.prototype.hurt = function(health) {
        if (this.healthBar.hurt(health) === false) {
            this.state = DEAD;
            death_sound.play();
        }
    };

    Player.prototype.score = function(score) {
        this.scoreEngine.addScore(score);
    };

    /*
     This method gets called when a power up effect vanishes
     */
    Player.prototype.clearEffect = function(powerUp) {
        // Delete power up from entity manager
        if (powerUp.type == 'pick') {
            console.log("super pickaxe expired");
            this.superPickaxe = false;
            this.entityManager.remove(powerUp);

        } else if (powerUp.type == 'stone-shield') {
            this.stoneShield = false;
        }
    };

    /*
     Bone projectile powerup
     */
    Player.prototype.shoot = function(){
            //Added sound for throwing bone
            throw_sound.play();
            var bone = new Bone(this.x, this.y, 0, this.isLeft, this);
            this.entityManager.add(bone);
            this.lastAttack = 0;
    };

    /* Player Render Function
     * arguments:
     * - ctx, the rendering context
     * - debug, a flag that indicates turning on
     * visual debugging
     */
    Player.prototype.render = function(ctx, debug) {

        /* Draw the player */
        var animationSet = this.isLeft ? this.animations.left : this.animations.right;
        if(this.digState == NOT_DIGGING || this.state == DEAD) {
            animationSet[this.state].render(ctx, this.x + this.spriteOffset.x, this.y + this.spriteOffset.y);
        } else {
            if(this.digState == LEFT_DIGGING) {
                animationSet = this.animations.left;
            }
            else if(this.digState == RIGHT_DIGGING) {
                animationSet = this.animations.right;
            }
            animationSet[DIGGING].render(ctx, this.x + this.spriteOffset.x, this.y + this.spriteOffset.y);
        }


        if (this.holdBreath && this.state == SWIMMING) {
            var bb = this.boundingBox();
            var width = (bb.right - bb.left) - ((Math.floor(this.swimmingProperty.breathCount) / 20) * (bb.right - bb.left));

            //TODO create a hud element for this bar and wrap this code
            ctx.save();
            ctx.fillStyle = "#21C8FF";
            ctx.fillRect(bb.left, bb.top - 15, width, 10);
            ctx.fill();
            ctx.fillStyle = "rgba(0,0,200,0)";
            ctx.restore();
        }


        //TODO draw this in a hud class?
        //draw powerups
        if(this.superPickaxe){
            ctx.drawImage(
                this.superAxeImg,
                0,
                0,
                64,
                64,
                this.x + 500,
                this.y - 350,
                64,
                64);
        }


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
        var tileX = Settings.TILESIZEX * Math.floor((bounds.left + bounds.right) / 2 / Settings.TILESIZEX),
            tileY = Settings.TILESIZEY * (Math.floor(bounds.bottom / Settings.TILESIZEY));
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(tileX, tileY);
        ctx.lineTo(tileX + Settings.TILESIZEX, tileY);
        ctx.lineTo(tileX + Settings.TILESIZEX, tileY + Settings.TILESIZEY);
        ctx.lineTo(tileX, tileY + Settings.TILESIZEY);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
    }

    /* Player BoundingBox Function
     * returns: A bounding box representing the player
     */
    Player.prototype.boundingBox = function() {
        return {
            left: this.x,
            top: this.y,
            right: this.x + this.hitboxSize.x,
            bottom: this.y + this.hitboxSize.y
        };
    };


    Player.prototype.boundingCircle = function() {
        return {
            cx: this.x + this.hitboxSize.x / 2,
            cy: this.y + this.hitboxSize.y / 2,
            radius: this.hitboxSize.x / 2
        };
    };

    return Player;

}());

},{"./Bone.js":1,"./Pickaxe.js":4,"./Settings.js":5,"./animation.js":6,"./entity.js":16}],32:[function(require,module,exports){
module.exports = (function(){
	var Animation = require('./animation.js'),
		Entity = require('./entity.js'),
		Player = require('./player.js'),
		EntityManager = require('./entity-manager.js');
	const GRAVITY = -250;
	/**
		locationX 	- posX
		locationY 	- posY
		mapLayer 	- mapLayer
		type		- custom name (string)
		width		- width of one animation image
		height		- height of one animation image
		frameNum	- number of frames of its animation
		imgPath		- path to the animation's spritesheet
		flying      - if the gravity applies to this power up then false
		duration - how long will the effect last in ticks
	*/
	function PowerUp(locationX, locationY, mapLayer,
					 type, width, height, frameNum, imgPath, flying, duration) {
		this.x = locationX;
		this.y = locationY;
		this.type = type;
		this.width = width;
		this.height = height;
		this.img = new Image();
		this.animation = null;
		this.radius = Math.sqrt(this.width * this.width / 4 + this.height * this.height / 4);
		var outerObject = this;
		this.img.onload = function () {
			outerObject.animation = new Animation(outerObject.img, outerObject.width, outerObject.height, 0, 0, frameNum);
		};
		this.img.src = imgPath;

		this.pickedUp = false;
		this.pickedUpSound = new Audio('./resources/sounds/powerUp.wav');
		this.layerIndex = mapLayer;
		this.falling = true;
		this.flying = flying;
		this.velocityY = 0;
		this.effectDuration = duration;
	}


	PowerUp.prototype.update = function(elapsedTime, tilemap, entityManager)
	{
		if(!this.flying){
			if(this.falling){
				this.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
				this.y += this.velocityY * elapsedTime;
				if(this.onGround(tilemap)) {
					this.velocityY = 0;
					this.y = ((this.boundingBox().bottom/64)-1)*64;
					this.falling = false;
				}
			}
		}
		/* wait for image to load */
		if(this.animation) this.animation.update(elapsedTime);

		if(this.pickedUp){
			this.effectDuration--;
		}

		if(this.effectDuration === 0){
			this.player.clearEffect(this);
		}


		if (this.img.complete === false || this.pickedUp === true) return;
	};

	PowerUp.prototype.render = function(context, debug)
	{
		if (this.img.complete === false || this.pickedUp === true || this.animation === null) return;
		this.animation.render(context, this.x, this.y);
		if(debug) renderDebug(this, context);
	};

	function renderDebug(powerUp, ctx) {
		var bounds = powerUp.boundingBox();
		var circle = powerUp.boundingCircle();
		ctx.save();

		// Draw player bounding box
		ctx.strokeStyle = "red";
		ctx.beginPath();
		ctx.moveTo(bounds.left, bounds.top);
		ctx.lineTo(bounds.right, bounds.top);
		ctx.lineTo(bounds.right, bounds.bottom);
		ctx.lineTo(bounds.left, bounds.bottom);
		ctx.lineTo(bounds.left, bounds.bottom);
		ctx.closePath();
		ctx.stroke();

		ctx.strokeStyle = "blue";
		ctx.beginPath();
		ctx.arc(circle.cx, circle.cy, circle.radius, 0, 2*Math.PI);
		ctx.stroke();

		// Outline tile underfoot
		var tileX = 64 * Math.floor((bounds.left + (this.width/2))/64),
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

	PowerUp.prototype.collide = function(otherEntity)
	{
		if (otherEntity.type === 'player' && this.pickedUp === false) {
			otherEntity.poweredUp(this);
			this.pickedUpSound.play();
			this.pickedUp = true;
			this.player = otherEntity;
		}
	};

	PowerUp.prototype.boundingBox = function()
	{
		return {
			left: this.x,
			top: this.y,
			right: this.x + this.width,
			bottom: this.y + this.height
		};
	};

	PowerUp.prototype.boundingCircle = function()
	{
		return {
			cx: this.x + this.width / 2,
			cy: this.y + this.height / 2,
			radius: this.radius
		};
	};

	PowerUp.prototype.onGround = function(tilemap) {
    var box = this.boundingBox(),
        tileX = Math.floor((box.left + (this.width/2))/64),
        tileY = Math.floor(box.bottom / 64),
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    // find the tile we are standing on.
    return (tile && tile.data.solid) ? true : false;
};


	return PowerUp;

}());

},{"./animation.js":6,"./entity-manager.js":15,"./entity.js":16,"./player.js":31}],33:[function(require,module,exports){
/* Score engine */

module.exports = (function (){

  function ScoreEngine() {
    this.img             = new Image();
    this.img.src         = './img/score/clear_background_yellow_num.png';
    this.score           = 0;
    this.tickCount       = [0, 0, 0, 0];
    this.frameIndex      = [0, 0, 0, 0];
    this.frameGoal       = [0, 0, 0, 0];
    this.numFramesPerRow = 4;
    this.numRows         = 10;
    this.ticksPerFrame   = 2;

    this.xpos            = 0;
    this.ypos            = 0;
    
    this.height          = 32;
    this.width           = 32;
  }

  ScoreEngine.prototype.addScore = function(amount) {
    var scoreString;
    this.score += amount;
    if (this.score < 10)
    {
      scoreString = "000" + this.score.toString();
    }
    else if (this.score < 100)
    {
      scoreString = "00" + this.score.toString();
    }
    else if (this.score < 1000)
    {
      scoreString = "0" + this.score.toString();
    }
    else
    {
      scoreString = this.score.toString();
    }
    for (var i = 0; i < scoreString.length; i++)
    {
      var temp = parseInt(scoreString[i]);
      this.frameGoal[i] = temp * 4;
    }
  };

  ScoreEngine.prototype.getScore = function() {
    return this.score;
  };

  ScoreEngine.prototype.subScore = function(amount) {
    this.score -= amount;
    if (this.score < 0)
    {
      this.score = 0;
    }
	if (this.score < 10)
    {
      scoreString = "000" + this.score.toString();
    }
    else if (this.score < 100)
    {
      scoreString = "00" + this.score.toString();
    }
    else if (this.score < 1000)
    {
      scoreString = "0" + this.score.toString();
    }
    else
    {
      scoreString = this.score.toString();
    }
    for (var i = 0; i < scoreString.length; i++)
    {
      var temp = parseInt(scoreString[i]);
      this.frameGoal[i] = temp * 4;
    }
  };

  ScoreEngine.prototype.scoreToZero = function() {
    this.score = 0;
    for (var i = 0; i < this.frameGoal.length; i++)
    {
      this.frameGoal[i] = 0;
    }
  };

  ScoreEngine.prototype.update = function(x, y)
  {
    this.x = x;
    this.y = y;
    this.updatePosition();
    this.updateAnimation();
  }

  ScoreEngine.prototype.setPositionFunction = function(func) {
    this.positionFunction = func;
  }

  ScoreEngine.prototype.render = function(context)
  {
    //console.log("Score Render");
    for (var i = 0; i < this.frameIndex.length; i++)
    {
      var sx = (this.frameIndex[i] % this.numFramesPerRow) * this.width;
      var sy = Math.floor(this.frameIndex[i] / this.numFramesPerRow) * this.height;
      context.drawImage(
        this.img,
        sx,
        sy,
        this.width,
        this.height,
        this.x + (32 * i),
        this.y,
        this.width,
        this.height
      );
    }
  }

  ScoreEngine.prototype.updatePosition = function() {
    if (this.positionFunction)
    {
      var pos = this.positionFunction();
      this.xpos = pos[0];
      this.ypos = pos[1];
    }
  };

  /**
   * Parameters:
   *     forward - true is forward, false is backward
   */
  ScoreEngine.prototype.updateAnimation = function(forward)
  {
    for (var i = 0; i < this.frameGoal.length; i++)
    {
      if (this.frameIndex[i] != this.frameGoal[i])
      {
        this.tickCount[i] += 1;
        if (this.tickCount[i] > this.ticksPerFrame)
        {
          this.tickCount[i] = 0;
          if (this.frameIndex[i] < 39)
          {
            this.frameIndex[i] += 1;
          }
          else
          {
            this.frameIndex[i] = 0;
          }
          // if (forward)
          // {
            
          // }
          // else // backward
          // {
          //   if (this.frameIndex[i] > 0)
          //   {
          //     this.frameIndex[i] -= 1;
          //   }
          //   else
          //   {
          //     this.frameIndex[i] = 39;
          //   }
          // }
        }
      }
    }
  }

  return ScoreEngine;

})();

},{}],34:[function(require,module,exports){
module.exports = (function() {
    /* Some hard coded data values for our 8 entities */
	
	var skyEntities = new Array();
	var middleEntities = new Array();
	var deepEntities = new Array();
	var powerUps = new Array();
	
	var birdData = {
		Entity: require('./bird.js'),
		limit: 8,
		count: 0
	};
	
	var turretData = {
		Entity: require('./turret.js'),
		limit: 3,
		count: 0
	};
			
	var barrelData = {
		Entity: require('./barrel.js'),
		limit: 15,
		count: 0
	};
	
	skyEntities.push(birdData);
	skyEntities.push(turretData);
	skyEntities.push(barrelData);
	
	var demonGHogData = {
		Entity: require('./DemonicGroundH.js'),
		limit: 10,
		count: 0
	};
	
	var goblinMinerData = {
		Entity: require('./goblin-miner.js'),
		limit: 8,
		count: 0
	};
	
	var goblinShamanData = {
		Entity: require('./goblin-shaman.js'),
		limit: 5,
		count: 0
	};
	
	middleEntities.push(demonGHogData);
	middleEntities.push(goblinMinerData);
	middleEntities.push(goblinShamanData);
	
	var ghostMinerData = {
		Entity: require('./ghostminer.js'),
		limit: 4,
		count: 0
	};
	
	var dynamiteDwarfData = {
		Entity: require('./dynamiteDwarf.js'),
		limit: 2,
		count: 0
	}
	
	deepEntities.push(barrelData);
	deepEntities.push(ghostMinerData);
	deepEntities.push(dynamiteDwarfData);

	var pick = { 
	 Entity: require('./powerUp.js'),
	 limit: 2,
	 count: 0,
	 name: 'pick',
	 width: 64,
	 height: 64,
	 frameNum: 2,
	 img: './img/powerUps/pick.png',
	 flying: false,
	 duration: 3600
	}
	
	var medicine = { 
	 Entity: require('./powerUp.js'),
	 limit: 2,
	 count: 0,
	 name: 'medicine',
	 width: 64,
	 height: 64,
	 frameNum: 1,
	 img: './img/powerUps/medicine.png',
	 flying: false,
	 duration: -1
	}
	
	var crystal = { 
	 Entity: require('./powerUp.js'),
	 limit: 2,
	 count: 0,
	 name: 'crystal',
	 width: 32,
	 height: 32,
	 frameNum: 8,
	 img: './img/powerUps/crystal.png',
	 flying: true,
	 duration: -1
	}
	
	var coin = { 
	 Entity: require('./powerUp.js'),
	 limit: 2,
	 count: 0,
	 name: 'coin',
	 width: 44,
	 height: 40,
	 frameNum: 10,
	 img: './img/powerUps/coin.png',
	 flying: true,
	 duration: -1
	}
	
	var stoneShield = { 
	 Entity: require('./powerUp.js'),
	 limit: 2,
	 count: 0,
	 name: 'coin',
	 width: 64,
	 height: 64,
	 frameNum: 1,
	 img: './img/powerUps/stone_shield.png',
	 flying: false,
	 duration: 3600
	}
	
	powerUps.push(pick);
	powerUps.push(medicine);
	powerUps.push(crystal);
	powerUps.push(coin);
	powerUps.push(stoneShield);
	
    function SpawningManager(entityManager, scoreEngine, player) {
        this.entityManager = entityManager;
        this.scoreEngine = scoreEngine;
        this.player = player;
        this.updateTimeLeft = 0;
    }
	
	var updatePeriodSeconds = 2;

    SpawningManager.prototype.update = function (elapsedTime, tilemap) {
        this.updateTimeLeft -= elapsedTime;
        if(this.updateTimeLeft < 0) {
            this.updateTimeLeft = updatePeriodSeconds;
			
			/* Can change frequency of chance to spawn
			based on score values or something.
			Higher score means shorter spawn time.
			
			Or change limits for spawns based on
			score values. Higher score means
			higher limits. */
			
			var count = 0;
			var posFound = false;
			var x = 0, y = 0;
			do{
				var positive;
				if(Math.random() > .5) positive = -1;
				else positive = 1;
				x = Math.floor((Math.random()*5*positive + (64*15)*positive + this.player.x)/64);
				y = Math.floor((Math.random()*5*positive + (64*15)*positive + this.player.y)/64);
				
				var tile = tilemap.tileAt(x, y, 0);
				if(!(tile && tile.data.solid)){
					posFound = true;
				}
					
				count++;
			}while(!posFound && count < 10)
		
			if(posFound){
				var tile = tilemap.tileAt(x, y, 0);
				var num = Math.floor(Math.random()*3);
				if( tile && tile.data) {
					if (tile.data.type == "SkyBackground" || tile.data.type == "Clouds") {
						if (skyEntities[num].limit > skyEntities[num].count) {
							this.entityManager.add(
								new skyEntities[num].Entity(x * 64, y * 64, 0)
							);
							skyEntities[num].count++;
						}
						else
						{
							num = Math.floor(Math.random()*5);
							if(powerUps[num].limit > powerUps[num].count){
								this.entityManager.add(new powerUps[num].Entity(x*64, y*64, 0,powerUps[num].name, powerUps[num].width, powerUps[num].height, powerUps[num].frameNum, powerUps[num].img, powerUps[num].flying, powerUps[num].duration));
								powerUps[num].count++;
							}
						}
					} 
					else if(tile.data.type == "CaveBackground" || tile.data.type == "Water"){
						if(middleEntities[num].limit > middleEntities[num].count){
							this.entityManager.add(
									new middleEntities[num].Entity(x*64, y*64, 0)
							);
							middleEntities[num].count++;
						}
						else
						{
							num = Math.floor(Math.random()*5);
							if(powerUps[num].limit > powerUps[num].count){
								this.entityManager.add(new powerUps[num].Entity(x*64, y*64, 0,powerUps[num].name, powerUps[num].width, powerUps[num].height, powerUps[num].frameNum, powerUps[num].img, powerUps[num].flying, powerUps[num].duration));
								powerUps[num].count++;
							}		
						}
					}
					else if(tile.data.type == "Lava" || tile.data.type == "DarkBackground" || tile.data.type == "DugBackground"){
						if(deepEntities[num].limit > deepEntities[num].count){
							this.entityManager.add(
									new deepEntities[num].Entity(x*64, y*64, 0)
							);
							deepEntities[num].count++;

						}
						else
						{
							num = Math.floor(Math.random()*5);
							if(powerUps[num].limit > powerUps[num].count){
								this.entityManager.add(new powerUps[num].Entity(x*64, y*64, 0,powerUps[num].name, powerUps[num].width, powerUps[num].height, powerUps[num].frameNum, powerUps[num].img, powerUps[num].flying, powerUps[num].duration));
								powerUps[num].count++;
							}
							
						}
					}
				}
			}
        }
		

    };

    return SpawningManager;
})();

},{"./DemonicGroundH.js":2,"./barrel.js":7,"./bird.js":8,"./dynamiteDwarf.js":14,"./ghostminer.js":19,"./goblin-miner.js":20,"./goblin-shaman.js":21,"./powerUp.js":32,"./turret.js":37}],35:[function(require,module,exports){
/* MainMenu GameState module
 * Provides the main menu for the Diggy Hole game.
 * Authors:
 * - Ian Speer, Austin Boerger
 */
module.exports = (function (){
  var menu = document.getElementById("splash-screen"),
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
        event.preventDefault();
		stateManager.popState();
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
},{}],36:[function(require,module,exports){
/* Tilemap engine providing the static world
 * elements for Diggy Hole
 * Authors:
 * - Nathan Bean
 * - Wyatt Watson
 */

module.exports = (function (){
  var noisy = require('./noise.js'),
      settings = require('./Settings.js'),
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

    var parallaxBackground = new Image();
    parallaxBackground.src = "./img/background.png";
    var bigclouds = new Image();
    bigclouds.src = "./img/backclouds.png";
    var smallclouds = new Image();
    smallclouds.src = "./img/frontclouds.png";

    var cloudlaxscalars = {};
    var cloudxs = {};
    var cloudys = {};
    var cloudsize = {};

    var smallcloudlaxscalars = {};
    var smallcloudxs = {};
    var smallcloudys = {};
    var smallcloudsize = {};

    var timeSinceLiquidMovement = 0;

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
  };

  var getViewPort = function() {
      var pos = getCameraPosition();
      return {
          left: pos[0],
          right: pos[0] + 2 * viewportHalfWidth,
          top: pos[1],
          bottom: pos[1] + 2 * viewportHalfHeight,
      };
  };


  /* Sets the camera position
   * Arguments:
   * - x, the upper-left hand x-coordinate of the viewport
   * - y, the upper-left-hand y-coordinate of the viewport
   */
  var setCameraPosition = function(x, y) {
    cameraX = x;
    cameraY = y;
 };

  /**
   * Function: getCameraPosition
   *     gets the x-y position of the viewport
   * Returns:
   *     x-y postion
   */
  var getCameraPosition = function() {
    return [cameraX - viewportHalfWidth, cameraY - viewportHalfHeight];
  };

  /* Loads the tilemap
   * - mapData, the JavaScript object
   * - options, options for loading, currently:
   *  > onload, a callback to trigger once the load finishes
   */
  var load = function(mapData, options) {
    // Make some random background big clouds
    for (var i = 0; i < 30; i++) {
      cloudlaxscalars[i] = Math.random();
      while (cloudlaxscalars[i]<0.3 || cloudlaxscalars[i]>0.66)
        cloudlaxscalars[i] = Math.random();
      cloudxs[i]=4000*Math.random();
      cloudys[i]=13000*Math.random();
      cloudsize[i] = 0.7+Math.random();
    }

    //Make some random foreground big clouds
    for (var i = 0; i < 250; i++) {
      smallcloudlaxscalars[i] = 1+ 2.5* Math.random();
      // (cloudlaxscalars[i]<0.3 || cloudlaxscalars[i]>0.66)
      //  cloudlaxscalars[i] = Math.random();
      smallcloudxs[i]=5000*Math.random()-1000;
      smallcloudys[i]=28000*Math.random();
      smallcloudsize[i] = 0.7+Math.random();
    }
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
            notDiggable: true
          },
          1: { // Clouds
            type: "Clouds",
            notDiggable: true
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
            solid: true,
            notDiggable: true
          },
          6: { // Water
            type: "Water",
            liquid: true,
            notDiggable: true
          },
          7: { // Cave background
            type: "CaveBackground",
            notDiggable: true
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
            notDiggable: true
          },
          11: { // water
            type: "Water",
            liquid: true,
            notDiggable: true
          },
          12: { // cave background
            type: "CaveBackground",
            notDiggable: true
          },
          13: { // lava
            type: "Lava",
            liquid: true,
            damage: 10,
            notDiggable: true
          },
          14: { // dark background
            type: "DarkBackground",
            notDiggable: true
          },
          15: { // dug background
            type: "DugBackground",
            notDiggable: true
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
    this.midEarth = midEarth;
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

    for(var x = 0; x < height/20; x++){
      map = consolidateLiquids(map, width, height, width-1, 0, 0, height-1, width, 2);
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

  function shiftWaterDown(map, width, height, rightStart, bottomStart, viewWidth, viewHeight){
    for(var j = bottomStart; j > bottomStart-viewHeight; j--){
      for(var i = rightStart; i > rightStart-viewWidth; i--){
        index = j*width + i;
        if(map[index] == 6+1 || map[index] == 11+1 || map[index] == 13+1){
          if(map[index+height] == 14+1 || map[index+height] == 12+1 || map[index+height] == 7+1 || map[index+height] == 15+1){
            var temp = map[index];
            map[index] = map[index+height];
            map[index+height] = temp;
          }
        }
      }
    }

    return map;
  }

  function shiftWaterRight(map, width, height, leftStart, topStart, viewWidth, viewHeight){
    for(var i = leftStart; i < leftStart+viewWidth; i++){
      for(var j = topStart; j < topStart+viewHeight; j++){
        index = j*width + i;
        if(map[index] == 6+1 || map[index] == 11+1 || map[index] == 13+1 /*&& index+1 < width*/){
          if(map[index+1] == 14+1 || map[index+1] == 12+1|| map[index+1] == 7+1|| map[index+1] == 15+1){
            var temp = map[index];
            map[index] = map[index+1];
            map[index+1] = temp;
          }
        }
      }
    }

    return map;
  }

  function shiftWaterLeft(map, width, height, leftStart, topStart, viewWidth, viewHeight){
    for(var j = topStart; j < topStart+viewHeight; j++){
      for(var i = leftStart; i < leftStart+viewWidth; i++){
        index = j*width + i;
        if(map[index] == 6+1 || map[index] == 11+1 || map[index] == 13+1 /*&& index+1 < width*/){
          if(map[index-1] == 14+1 || map[index-1] == 12+1|| map[index-1] == 7+1 || map[index-1] == 15+1){
            var temp = map[index];
            map[index] = map[index-1];
            map[index-1] = temp;
          }
        }
      }
    }

    return map;
  }

  // Consolidate Liquids and called shifting functions made by Wyatt Watson
  function consolidateLiquids(map, width, height, rightStart, leftStart, topStart, bottomStart, viewWidth, viewHeight){
    for(var i = 0; i < viewHeight; i++){
      //Shift Down
      map = shiftWaterDown(map, width, height, rightStart+3, bottomStart+3, viewWidth+6, viewHeight+6);
      //Shift Right
      map = shiftWaterRight(map, width, height, leftStart-3, topStart-3, viewWidth+6, viewHeight+6);
    }
    for(var i = 0; i < viewHeight; i++){
      //Shift Down
      map = shiftWaterDown(map, width, height, rightStart+3, bottomStart+3, viewWidth+6, viewHeight+6);
      //Shift Right
      map = shiftWaterLeft(map, width, height, leftStart-3, topStart-3, viewWidth+6, viewHeight+6);
    }
    return map;
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

// Added by Wyatt Watson
  var update = function(elapsedTime){
    layers.forEach(function(layer){
      var startX =  clamp(Math.floor(((cameraX - 32) - viewportHalfWidth) / tileWidth) - 1, 0, layer.width);
      var startY =  clamp(Math.floor((cameraY - viewportHalfHeight) / tileHeight) - 1, 0, layer.height);
      var endX = clamp(startX + viewportTileWidth + 1, 0, layer.width);
      var endY = clamp(startY + viewportTileHeight + 1, 0, layer.height);

      timeSinceLiquidMovement += elapsedTime;

      //create bounding box and clean updatable objects, but only after some time interval
      if(timeSinceLiquidMovement >= settings.LIQUID_UPDATE_TIME) {
          consolidateLiquids(layer.data, layer.width, layer.height, endX, startX, startY, endY, endX-startX, endY-startY);
          timeSinceLiquidMovement = 0;
      }
    });
  };

  /*Karenfang*/
  var renderWater = function(screenCtx){
    layers.forEach(function(layer){
      var startX =  clamp(Math.floor(((cameraX - 32) - viewportHalfWidth) / tileWidth) - 1, 0, layer.width);
      var startY =  clamp(Math.floor((cameraY - viewportHalfHeight) / tileHeight) - 1, 0, layer.height);
      var endX = clamp(startX + viewportTileWidth + 1, 0, layer.width);
      var endY = clamp(startY + viewportTileHeight + 1, 0, layer.height);

      var map = layer.data;

      for(var i = startX; i < endX; i++){
        for(var j = startY; j < endY; j++){
          index = j*layer.width + i;
          //Todo: Lava covered by red
          if(map[index] == 6+1 || map[index] == 11+1){
            screenCtx.fillStyle="rgba(142,167,214,0.3)"; //color similar but lighter than the water tile
            screenCtx.fillRect(i*tileWidth,j*tileHeight,tileWidth,tileHeight);
          }else if (map[index] == 13+1) {
            screenCtx.fillStyle="rgba(182,56,46,0.3)"; //color similar but lighter than the lava tile
            screenCtx.fillRect(i*tileWidth,j*tileHeight,tileWidth,tileHeight);
          }
        }
      }

    });
  };

  /* */
  var render = function(screenCtx) {
    // Render tilemap layers - note this assumes
    // layers are sorted back-to-front so foreground
    // layers obscure background ones.
    // see http://en.wikipedia.org/wiki/Painter%27s_algorithm

    // For continuous scrolling
    var offsety = cameraY%(600);
    var offsetx = cameraX%600;

    // For parallax effect


    var alerted = false;
    if (!alerted) {
      //console.log("zomg: " + offset + "___" + cameraY);
      alerted = true;
    }

    // Starry night

    //console.log(cameraX);
    for (var i = -1; i*600+cameraY*0.3 < cameraY+1000; i++) {
      for (var j = -1; j*600+cameraX*0.3 < cameraX+2000; j++) {
        screenCtx.drawImage(parallaxBackground,j*600+cameraX*0.3,i*600+cameraY*0.3,600,600);
      }
    }

    // Ground is at 14912 +/- camera size

    // Big far clouds
    for (var i = 0; i < 30; i++) {

      screenCtx.drawImage(bigclouds,cloudxs[i]+cameraX*cloudlaxscalars[i],cloudys[i]+cameraY*cloudlaxscalars[i],1500*cloudsize[i],1500*cloudsize[i]);
    }

    // Small close clouds
    //screenCtx.drawImage(bigclouds,cameraX,cameraY,800,400);

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
            if(tileId > 2) {
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

  var renderfrontclouds = function(screenCtx) {
    // Close fast small clouds
    for (var i = 0; i < 250; i++ ) {
      screenCtx.drawImage(smallclouds,smallcloudxs[i]+cameraX*smallcloudlaxscalars[i]*smallcloudsize[i]-3000,smallcloudys[i]-cameraY*smallcloudlaxscalars[i]+5000,300*smallcloudsize[i],100*smallcloudsize[i]);
    }
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
      layers[layer].data[x + y * mapWidth] = newType;
    }
  }

  //Dig tile out at x, y
  var removeTileAt = function(x, y, layer) {
    if(layer < 0 || x < 0 || y < 0 || layer >= layers.length || x > mapWidth || y > mapHeight)
      return undefined;
    layers[layer].data[x + y*mapWidth] =  8;
  }

  //return current tile layer, 0: sky, 1: crust 2: magma
  //author: Shanshan Wu
  var returnTileLayer = function(x, y, layer) {
    if(layer < 0 || x < 0 || y < 0 || layer >= layers.length || x > mapWidth || y > mapHeight)
      return undefined;
    if (y < this.surface) {
      return 0;
    } else if ( y >= this.surface && y < this.midEarth) {
      return 1;
    } else {
      return 2;
    }
  };

  //change the type of tile in a given position.....duplicate of setTileAt
  //author: Shanshan Wu
  var mineAt = function(newType, x, y, layer, digAll) {
    if(layer < 0 || x < 0 || y < 0 || layer >= layers.length || x > mapWidth || y > mapHeight)
      return undefined;

    var tile = tileAt(x, y, layer);
    if(typeof(tile) !== "undefined" && tile.data.solid && ((!tile.data.notDiggable) || digAll))
      layers[layer].data[x + y * mapWidth] = newType;
  };

  var randomOnSurface = function() {
    return {
      x: Math.floor(Math.random() * mapWidth / 2 + mapWidth / 4),
      y: this.surface - 1
    };
  };

  // Expose the module's public API
  return {
    load: load,
    generate: generate,
    render: render,
    renderfrontclouds: renderfrontclouds,
    tileAt: tileAt,
    setTileAt: setTileAt,
    destroyTileAt: destroyTileAt,
    removeTileAt: removeTileAt,
    setViewportSize: setViewportSize,
    getViewPort: getViewPort,
    setCameraPosition: setCameraPosition,
    returnTileLayer: returnTileLayer,
    getCameraPosition: getCameraPosition,
    mineAt: mineAt,
    consolidateLiquids: consolidateLiquids,
    update: update,
    renderWater: renderWater,
    randomOnSurface: randomOnSurface
  }


})();

},{"./Settings.js":5,"./noise.js":29}],37:[function(require,module,exports){
module.exports = (function(){
	var Animation = require('./animation.js'),
		Player = require('./player.js'),
		Entity = require('./entity.js'),
		Cannonball = require('./cannonball.js'),
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
		this.firstUpdate = false;

		this.spawnCannonballs = function(entityManager) {
			for (var i = 0; i < cannonballNum; i ++) {
				this.cannonballs[i] = new Cannonball(this.posX, this.posY, 0, 0, 0, this.gravity, centerOffsetX, centerOffsetY);
				entityManager.add(this.cannonballs[i]);
				this.shotSound[i] = new Audio('./resources/sounds/shot.wav');
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

	}

	Turret.prototype = new Entity();

	Turret.prototype.update = function(elapsedTime, tilemap, entityManager)
	{
		if(!this.firstUpdate) {
			this.spawnCannonballs(entityManager);
			this.firstUpdate = true;
		}

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
			var angle = this.getAngle(this.player.x, this.player.y);
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
			// Wyatt Watson - Now remove entity after it's destroyed
			this.time += elapsedTime;
			if (this.time > reloadTime) {
				entityManager.remove(this);
			}
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

	Turret.prototype.collide = function(otherEntity, entityManager)
	{
		if (otherEntity.type == 'cannonball' && (otherEntity.state == 3 /*Cannonball.EXPLODING*/)) {
			this.state = DESTROYED;
			this.targeting = false;
			for (var i = 0; i < this.cannonballs.length; i ++) {
				entityManager.remove(this.cannonballs[i]);
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

},{"./animation.js":6,"./cannonball.js":10,"./entity.js":16,"./player.js":31}]},{},[28]);
