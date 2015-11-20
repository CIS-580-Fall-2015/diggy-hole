/* Player module
 * Implements the entity pattern and provides
 * the DiggyHole player info.
 * Authors:
 * - Wyatt Watson
 * - Nathan Bean
 */
module.exports = (function() {
  var Entity = require('./entity.js'),
    Animation = require('./animation.js'),
    Pickaxe = require('./Pickaxe.js'),
	Bone = require('./Bone.js');

  /* The following are player States (Swimming is not implemented) */
  const STANDING = 0;
  const WALKING = 1;
  const JUMPING = 2;
  const DIGGING = 3;
  const FALLING = 4;
  const SWIMMING = 5;

  /* The following are digging direction states */
  const NOT_DIGGING = 0;
  const LEFT_DIGGING = 1;
  const RIGHT_DIGGING = 2;
  const DOWN_DIGGING = 3;
  const UP_DIGGING = 4;

  // The Sprite Size
  const SIZE = 64;

  // Movement constants
  const GRAVITY = -250;
  const TERMINAL_VELOCITY = GRAVITY * -8;
  const JUMP_VELOCITY = -900;

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
    this.inputManager = inputManager
    this.state = WALKING;
    this.digState = NOT_DIGGING;
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
    this.SPEED = 150;
	this.type = "player";
	this.superPickaxe = false;
	this.superAxeImg = new Image();
	this.superAxeImg.src = "./img/powerUps/pick.png";
	
	// bone powerup
	this.attackFrequency = 1;
	this.lastAttack = 0;
	this.bones = 10;

    //The animations
    this.animations = {
      left: [],
      right: []
    };

    //The right-facing animations
    this.animations.right[STANDING] = new Animation(dwarfRight, SIZE, SIZE, SIZE * 3, 0);
    this.animations.right[WALKING] = new Animation(dwarfRight, SIZE, SIZE, 0, 0, 4);
    this.animations.right[DIGGING] = new Animation(dwarfRight, SIZE, SIZE, 0, SIZE * 2, 4);
    this.animations.right[FALLING] = new Animation(dwarfRight, SIZE, SIZE, 0, SIZE);
    this.animations.right[SWIMMING] = new Animation(dwarfRight, SIZE, SIZE, 0, 0, 4);

    //The left-facing animations
    this.animations.left[STANDING] = new Animation(dwarfLeft, SIZE, SIZE, 0, 0);
    this.animations.left[WALKING] = new Animation(dwarfLeft, SIZE, SIZE, 0, 0, 4);
    this.animations.left[DIGGING] = new Animation(dwarfLeft, SIZE, SIZE, 0, SIZE * 2, 4);
    this.animations.left[FALLING] = new Animation(dwarfLeft, SIZE, SIZE, SIZE * 3, SIZE);
    this.animations.left[SWIMMING] = new Animation(dwarfLeft, SIZE, SIZE, 0, 0, 4);

    //Setup the jump animations
    resetJumpingAnimation(this);
  }

  // Player inherits from Entity
  Player.prototype = new Entity();

  // Determines if the player is on the ground
  Player.prototype.onGround = function(tilemap) {
    var box = this.boundingBox(),
      tileXL = Math.floor((box.left + 5) / 64),
      tileXR = Math.floor((box.right - 5) / 64),
      tileY = Math.floor((box.bottom) / 64),
      tileL = tilemap.tileAt(tileXL, tileY, this.layerIndex),
      tileR = tilemap.tileAt(tileXR, tileY, this.layerIndex);
    // find the tile we are standing on.
    if(tileL && tileL.data.solid) return true;
    if(tileR && tileR.data.solid) return true;
    return false;
  };

  // Determines if the player will ram his head into a block above
  Player.prototype.isBlockAbove = function(tilemap) {
    var box = this.boundingBox(),
        tileXL = Math.floor((box.left + 5) / 64),
        tileXR = Math.floor((box.right - 5) / 64),
        tileY = Math.floor((box.top + 5) / 64),
        tileL = tilemap.tileAt(tileXL, tileY, this.layerIndex),
        tileR = tilemap.tileAt(tileXR, tileY, this.layerIndex);
    // find the tile we are standing on.
    if(!tileL || tileL.data.solid) return true;
    if(!tileR || tileR.data.solid) return true;
    return false;
  }

  // Moves the player to the left, colliding with solid tiles
  Player.prototype.moveLeft = function(distance, tilemap) {
    var box = this.boundingBox(),
      tileX = Math.floor(box.left / 64),
      tileY = Math.floor(box.bottom / 64) - 1,
      tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && !tile.data.solid)
      this.currentX -= distance;
  };

  // Moves the player to the right, colliding with solid tiles
  Player.prototype.moveRight = function(distance, tilemap) {
    var box = this.boundingBox(),
      tileX = Math.floor(box.right / 64),
      tileY = Math.floor(box.bottom / 64) - 1,
      tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && !tile.data.solid)
      this.currentX += distance;
  };
  /* Player update function
   * arguments:
   * - elapsedTime, the time that has passed
   *   between this and the last frame.
   * - tilemap, the tilemap that corresponds to
   *   the current game world.
   */
  Player.prototype.update = function(elapsedTime, tilemap, entityManager) {
    var sprite = this;
	sprite.entityManager = entityManager;
    // The "with" keyword allows us to change the
    // current scope, i.e. 'this' becomes our
    // inputManager
    with (this.inputManager) {

      // Process player state
      switch (sprite.state) {
        case STANDING:
        case WALKING:
          // If there is no ground underneath, fall
          if (!sprite.onGround(tilemap)) {
            sprite.state = FALLING;
            sprite.velocityY = 0;
          } else {
            if (isKeyDown(commands.DIGDOWN)) {
              this.pick = new Pickaxe({ x: this.currentX + SIZE / 2, y: this.currentY + SIZE}, true);
              sprite.state = DIGGING;
              sprite.digState = DOWN_DIGGING;
            } else if(isKeyDown(commands.DIGLEFT)) {
              this.pick = new Pickaxe({ x: this.currentX, y: this.currentY + SIZE / 2 });
              sprite.state = DIGGING;
              sprite.digState = LEFT_DIGGING;
              sprite.isLeft = true;
            } else if(isKeyDown(commands.DIGRIGHT)) {
              this.pick = new Pickaxe({ x: this.currentX + SIZE, y: this.currentY + SIZE / 2 });
              sprite.state = DIGGING;
              sprite.digState = RIGHT_DIGGING;
              sprite.isLeft = false;
            } else if(isKeyDown(commands.DIGUP)) {
                this.pick = new Pickaxe({ x: this.currentX + SIZE / 2, y: this.currentY }, true);
              sprite.state = DIGGING;
              sprite.digState = UP_DIGGING;
            } else if (isKeyDown(commands.UP)) {
              sprite.state = JUMPING;
              sprite.velocityY = JUMP_VELOCITY;
            } else if (isKeyDown(commands.LEFT)) {
              sprite.isLeft = true;
              sprite.state = WALKING;
              sprite.moveLeft(elapsedTime * this.SPEED, tilemap);
            }
            else if(isKeyDown(commands.RIGHT)) {
              sprite.isLeft = false;
              sprite.state = WALKING;
              sprite.moveRight(elapsedTime * this.SPEED, tilemap);
            }
            else {
              sprite.state = STANDING;
            }

            if(sprite.state == DIGGING) {
                //if we just entered the digging state we need to spawn the hitbox of our pickaxe
                //this.pick = new Pickaxe({ x: this.currentX, y: this.currentY + SIZE / 2 });
                entityManager.add(this.pick);


                var currentPlayer = this;
                var digComplete = function() {
                  /* Add score */
                  //TODO different scores for different blocks?
                  entityManager.scoreEngine.addScore(1);

                  var box = currentPlayer.boundingBox(),
                      tileX,
                      tileY;

                  /* set the tile location that we are deleting */
                  switch(sprite.digState) {
                    case DOWN_DIGGING:
                          tileX = Math.floor((box.left + (SIZE / 2)) / 64);
                          tileY = Math.floor(box.bottom / 64);

                          /* we also know we will be falling if digging down, so start fall */
                          sprite.state = FALLING;
                          sprite.velocityY = 0;
                          break;
                    case LEFT_DIGGING:
                          tileX = Math.floor((box.left - 5)/ 64);
                          tileY = Math.floor((box.bottom - (SIZE / 2)) / 64);
                          sprite.state = STANDING;
                          break;
                    case RIGHT_DIGGING:
                          tileX = Math.floor((box.right + 5)/ 64);
                          tileY = Math.floor((box.bottom - (SIZE / 2)) / 64);
                          sprite.state = STANDING;
                          break;
                    case UP_DIGGING:
                          tileX = Math.floor((box.left + (SIZE / 2)) / 64);
                          tileY = Math.floor((box.top - 5) / 64);
                          sprite.state = STANDING;
                          break;
                    default:
                          return;
                  }

                  /* replace the set tile at this layer */
                  var layerType = tilemap.returnTileLayer(tileX, tileY, currentPlayer.layerIndex);
                  if (layerType == 0) {
                    tilemap.mineAt(1, tileX, tileY, currentPlayer.layerIndex, sprite.superPickaxe);
                  } else if (layerType == 1) {
                    tilemap.mineAt(13, tileX, tileY, currentPlayer.layerIndex, sprite.superPickaxe);
                  } else if (layerType == 2) {
                    tilemap.mineAt(15, tileX, tileY, currentPlayer.layerIndex, sprite.superPickaxe);
                  }

                  /* setup the callback for when the animation is complete */
                  currentPlayer.animations.left[currentPlayer.state].donePlayingCallback = function() {};
                  currentPlayer.animations.right[currentPlayer.state].donePlayingCallback = function() {};
                  entityManager.remove(currentPlayer.pick);

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
          sprite.currentY += sprite.velocityY * elapsedTime;
          if (sprite.velocityY > 0) {
            sprite.state = FALLING;
            resetJumpingAnimation(sprite);
          } else if (sprite.isBlockAbove(tilemap)) {
            sprite.state = FALLING;
            sprite.velocityY = 0;
            resetJumpingAnimation(sprite);
          }

          if (isKeyDown(commands.LEFT)) {
            sprite.isLeft = true;
            sprite.moveLeft(elapsedTime * this.SPEED, tilemap);
          }
          if (isKeyDown(commands.RIGHT)) {
            sprite.isLeft = false;
            sprite.moveRight(elapsedTime * this.SPEED, tilemap);
          }
          break;
        case FALLING:
          if(sprite.velocityY < TERMINAL_VELOCITY) {
            sprite.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
          }
          sprite.currentY += sprite.velocityY * elapsedTime;
          if (sprite.onGround(tilemap)) {
            sprite.state = STANDING;
            sprite.currentY = 64 * Math.floor(sprite.currentY / 64);
          } else if (isKeyDown(commands.LEFT)) {
            sprite.isLeft = true;
            sprite.moveLeft(elapsedTime * this.SPEED, tilemap);
          }
          else if(isKeyDown(commands.RIGHT)) {
            sprite.isLeft = false;
            sprite.moveRight(elapsedTime * this.SPEED, tilemap);
          }
          break;
        case SWIMMING:
          // NOT IMPLEMENTED YET
      }
		
		// countdown to next bone projectile
	  	if(this.lastAttack <= this.attackFrequency){
			this.lastAttack += elapsedTime;
		}
	
		if (isKeyDown(commands.SHOOT)) {
            this.shoot();
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

  /* This function resets (or initializes) the jumping animations */
  function resetJumpingAnimation(player) {
    player.animations.right[JUMPING] = new Animation(dwarfRight, SIZE, SIZE, SIZE * 3, SIZE, 3, 0.1, true, null, true);
    player.animations.left[JUMPING] = new Animation(dwarfLeft, SIZE, SIZE, 0, SIZE, 3, 0.1, true);
  }

  // Update function for use with the help player
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
          if (sprite.currentY < 64) {
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
          sprite.currentY += sprite.velocityY * elapsedTime;
          if (sprite.currentY <= -64) {
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
          sprite.currentY += sprite.velocityY * elapsedTime;
          if (sprite.currentY >= 64) {
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
  }

  /*
     This method gets called when a power up is picked up
	 It should eventually delete the power up from the game
  */
  Player.prototype.poweredUp = function(powerUp) {
	  // Delete power up from entity manager
	  console.log(powerUp.type);
	  /*
	  if (powerUp.type == '') {
		  ...
	  }
	  */
	  if (powerUp.type == 'pick') {
		  
		  console.log("super pickaxe activated");
		  this.superPickaxe = true;
	  }
	  
	  if(powerUp.effectDuration < 0){//if power up lasts 4ever
		   this.entityManager.remove(powerUp);
	  }
	 
  }
  
  /*
     This method gets called when a power up effect vanishes
  */
  Player.prototype.clearEffect = function(powerUp) {
	  // Delete power up from entity manager
	  if (powerUp.type == 'pick') {
		  console.log("super pickaxe expired");
		  this.superPickaxe = false;
		  this.entityManager.remove(powerUp);
	  }
	 
  }
  
  	/*
		Bone projectile powerup	
	*/
   Player.prototype.shoot = function(){
		if(this.bones > 0 && this.lastAttack >= this.attackFrequency){
			bone = new Bone(this.currentX, this.currentY, 0, this.isLeft, this);
			entityManager.add(bone);			
			this.bones--;
			this.lastAttack = 0;
		}		   
   } 

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

    //draw powerups
	if(this.superPickaxe){
		ctx.drawImage(
        this.superAxeImg,
        0,
        0,
        64,
        64,
        this.currentX + 500,
        this.currentY - 350,
        64,
        64);
	}
	
    if (debug) renderDebug(this, ctx);
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
