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
    const SWIM_UP = -100;
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
        this.bones = 5;

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
                    console.log("I am being called");
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
                      this.velocityY = -500;
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

        if (this.inputManager.isKeyDown(this.inputManager.commands.SHOOT)) {
            this.shoot();
        }

        // Power Up Usage Management
        this.lastPowerUpUsed += elapsedTime;

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
            }
            this.lastPowerUpUsed = 0;
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
            this.bones++;
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
        if(this.bones > 0 && this.lastAttack >= this.attackFrequency){
            //Added sound for throwing bone
            throw_sound.play();
            var bone = new Bone(this.x, this.y, 0, this.isLeft, this);
            this.entityManager.add(bone);
            this.bones--;
            this.lastAttack = 0;
        }
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

        ctx.drawImage(
            this.boneImg,
            0,
            0,
            64,
            64,
            this.x + 400,
            this.y - 350,
            64,
            64);
        ctx.font = "20pt Calibri";
        ctx.fillText("x"+this.bones, this.x + 445, this.y - 300);

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
