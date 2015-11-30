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

    /*Audio sources*/
    jump_sound = new Audio('resources/sounds/jumping_sound.wav');
    dig_sound = new Audio('resources/sounds/digging_sound.mp3');
    walk_sound = new Audio('resources/sounds/walking_sound.mp3');
    throw_sound = new Audio('resources/sounds/throwing_sound.mp3');

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

    // Swimming Moving Constant
    const GRAVITY_IN_WATER = -80;
    const SWIM_UP = -164;
    const SPEED_IN_LIQUID = 80;

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
        this.boneImg = new Image();
        this.boneImg.src = "./img/BoneLeft.png";
        this.stoneShield = false;

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

    // Check to see if player is in water i.e full body immersion (head inside water)
    Player.prototype.inWater = function(tilemap){
        var box = this.boundingBox();
        // Based on the position that player is facing changed the location of it's X coordinate
        if(this.isLeft){
            var tileX = Math.floor((box.left + (SIZE/(3/2)))/64);
        }
        else{
            var tileX = Math.floor((box.right - (SIZE/24))/64);
        }
        var tileY = Math.floor(box.top / 64),
            tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
        if(tile){
            if (tile.data.type == "Water"){
                return true;
            }
        }
        return false; //
    };

    // Check to see if player is on top of water
    Player.prototype.onWater = function(tilemap){
        var box = this.boundingBox();
        // Based on the position that player is facing changed the location of it's X coordinate
        if(this.isLeft){
            var tileX = Math.floor((box.left)/64)
        }
        else{
            var tileX = Math.floor((box.right)/64);
        }
        var tileY = Math.floor(box.bottom / 64) - 1,// check if player is right above water.
            tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
        if(tile){
            if (tile.data.type == "Water" && !this.inWater(tilemap)){
                return true;
            }
        }
        return false; //
    };

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

    // Check that player's head is above water
    Player.prototype.headOverWater = function (tilemap){
        var box = this.boundingBox();
        return (tilemap.tileAt(Math.floor(box.right / 64), Math.floor(box.top / 64),
            this.layerIndex).data.type == "SkyBackground");
    }

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
    Player.prototype.update = function(elapsedTime, tilemap, entityManager, ParticleManager) {
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
                    }
                    // If player is above water or inside water
                    else if(sprite.inWater(tilemap)){
                        if(sprite.swimmingProperty.escapeSwimming){
                            sprite.state = JUMPING;
                            sprite.velocityY = JUMP_VELOCITY;
                            sprite.swimmingProperty.escapeSwimming = false;
                        }
                        else{
                            sprite.state = SWIMMING;
                            sprite.holdBreath = true;
                        }
                    }
                    else {
                        if (isKeyDown(commands.DIGDOWN)) {
                            dig_sound.play();
                            this.pick = new Pickaxe({ x: this.currentX + SIZE / 2, y: this.currentY + SIZE}, true);
                            sprite.state = DIGGING;
                            sprite.digState = DOWN_DIGGING;
                        } else if(isKeyDown(commands.DIGLEFT)) {
                            dig_sound.play();
                            this.pick = new Pickaxe({ x: this.currentX, y: this.currentY + SIZE / 2 });
                            sprite.state = DIGGING;
                            sprite.digState = LEFT_DIGGING;
                            sprite.isLeft = true;
                        } else if(isKeyDown(commands.DIGRIGHT)) {
                            dig_sound.play();
                            this.pick = new Pickaxe({ x: this.currentX + SIZE, y: this.currentY + SIZE / 2 });
                            sprite.state = DIGGING;
                            sprite.digState = RIGHT_DIGGING;
                            sprite.isLeft = false;
                        } else if(isKeyDown(commands.DIGUP)) {
                            dig_sound.play();
                            this.pick = new Pickaxe({ x: this.currentX + SIZE / 2, y: this.currentY }, true);
                            sprite.state = DIGGING;
                            sprite.digState = UP_DIGGING;
                        } else if (isKeyDown(commands.UP)) {

                            /* Added sound effect for jumping */
                            jump_sound.play();

                            sprite.state = JUMPING;
                            sprite.velocityY = JUMP_VELOCITY;
                        } else if (isKeyDown(commands.LEFT)) {
                            /*Added walking sound*/
                            walk_sound.play();
                            sprite.isLeft = true;
                            sprite.state = WALKING;
                            sprite.moveLeft(elapsedTime * this.SPEED, tilemap);
                        }
                        else if(isKeyDown(commands.RIGHT)) {

                            /* Added walking sound */
                            walk_sound.play();

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
                                    ParticleManager.addDirtParticles(tileX, tileY);
                                } else if (layerType == 1) {
                                    tilemap.mineAt(13, tileX, tileY, currentPlayer.layerIndex, sprite.superPickaxe);
                                    ParticleManager.addStoneParticles(tileX, tileY);
                                } else if (layerType == 2) {
                                    tilemap.mineAt(15, tileX, tileY, currentPlayer.layerIndex, sprite.superPickaxe);
                                    ParticleManager.addDeepParticles(tileX, tileY);
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
                    else if(sprite.inWater(tilemap)){
                        sprite.state = SWIMMING;
                        sprite.holdBreath = true;
                    }
                    break;
                case SWIMMING:
                    //Player Sinks automatically, they have resistance i.e sink slower if fully immersed in water
                    if(sprite.inWater(tilemap)) {
                        sprite.velocityY += Math.pow(GRAVITY_IN_WATER * elapsedTime, 2) + (sprite.velocityY / GRAVITY_IN_WATER);
                        console.log("in water");
                        sprite.currentY += sprite.velocityY * elapsedTime;
                        if (isKeyDown(commands.LEFT)) {
                            sprite.velocityY = 0;
                            sprite.isLeft = true;
                            sprite.moveLeft(elapsedTime * SPEED_IN_LIQUID, tilemap);
                        }
                        else if (isKeyDown(commands.RIGHT)) {
                            sprite.velocityY = 0;
                            sprite.isLeft = false;
                            sprite.moveRight(elapsedTime * SPEED_IN_LIQUID, tilemap);
                        }
                        else if (isKeyDown(commands.UP)) {
                            sprite.velocityY = SWIM_UP;
                            console.log("SWIMING UP");
                        }
                        else if (isKeyDown(commands.DIGDOWN)) {
                            dig_sound.play();
                            this.pick = new Pickaxe({ x: this.currentX + SIZE / 2, y: this.currentY + SIZE}, true);
                            sprite.state = DIGGING;
                            sprite.digState = DOWN_DIGGING;
                        } else if(isKeyDown(commands.DIGLEFT)) {
                            dig_sound.play();
                            this.pick = new Pickaxe({ x: this.currentX, y: this.currentY + SIZE / 2 });
                            sprite.state = DIGGING;
                            sprite.digState = LEFT_DIGGING;
                            sprite.isLeft = true;
                        } else if(isKeyDown(commands.DIGRIGHT)) {
                            dig_sound.play();
                            this.pick = new Pickaxe({ x: this.currentX + SIZE, y: this.currentY + SIZE / 2 });
                            sprite.state = DIGGING;
                            sprite.digState = RIGHT_DIGGING;
                            sprite.isLeft = false;
                        } else if(isKeyDown(commands.DIGUP)) {
                            dig_sound.play();
                            this.pick = new Pickaxe({x: this.currentX + SIZE / 2, y: this.currentY}, true);
                            sprite.state = DIGGING;
                            sprite.digState = UP_DIGGING;
                        }
                        else if (!sprite.inWater(tilemap) && !sprite.headOverWater(tilemap)) {
                            sprite.state = FALLING;
                            console.log("Player hit its head on something");
                            sprite.holdBreath = false;
                        }
                        else if (sprite.onGround(tilemap) && !sprite.inWater(tilemap)) {
                            sprite.velocityY = 0;
                            sprite.currentY = 64 * Math.floor(sprite.currentY / 64);
                            sprite.state = STANDING;
                            console.log("standing");
                        }
                        else if (sprite.onGround(tilemap) && sprite.inWater(tilemap)) {
                            sprite.velocityY = 0;
                            sprite.currentY = 64 * Math.floor(sprite.currentY / 64);
                            console.log("floating in water");
                        }
                        sprite.swimmingProperty.escapeSwimming = false;
                    }
                    else if (sprite.headOverWater(tilemap)) {
                        sprite.state = STANDING;
                        sprite.swimmingProperty.escapeSwimming = true;
                        console.log("Can escape swimming");
                        sprite.currentY += sprite.velocityY * elapsedTime;
                    }
                    else{
                        sprite.state = FALLING;
                        sprite.currentY += sprite.velocityY * elapsedTime;
                    }
                    // Exact copy of walking state code, might be a bit redudant, possibly make it a global function?
                    if(sprite.state == DIGGING) {
                        //if we just entered the digging state we need to spawn the hitbox of our pickaxe
                        //this.pick = new Pickaxe({ x: this.currentX, y: this.currentY + SIZE / 2 });
                        entityManager.add(this.pick);


                        var currentPlayerr = this;
                        var digCompleted = function() {
                            /* Add score */
                            //TODO different scores for different blocks?
                            entityManager.scoreEngine.addScore(1);

                            var box = currentPlayerr.boundingBox(),
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
                            var layerType = tilemap.returnTileLayer(tileX, tileY, currentPlayerr.layerIndex);
                            if (layerType == 0) {
                                tilemap.mineAt(1, tileX, tileY, currentPlayerr.layerIndex, sprite.superPickaxe);
                                ParticleManager.addDirtParticles(tileX, tileY);
                            } else if (layerType == 1) {
                                tilemap.mineAt(13, tileX, tileY, currentPlayerr.layerIndex, sprite.superPickaxe);
                                ParticleManager.addStoneParticles(tileX, tileY);
                            } else if (layerType == 2) {
                                tilemap.mineAt(15, tileX, tileY, currentPlayerr.layerIndex, sprite.superPickaxe);
                                ParticleManager.addDeepParticles(tileX, tileY);
                            }

                            /* setup the callback for when the animation is complete */
                            currentPlayerr.animations.left[currentPlayerr.state].donePlayingCallback = function() {};
                            currentPlayerr.animations.right[currentPlayerr.state].donePlayingCallback = function() {};
                            entityManager.remove(currentPlayerr.pick);

                            /* reset the digging state */
                            sprite.digState = NOT_DIGGING;
                        };
                        this.animations.left[this.state].donePlayingCallback = digCompleted;
                        this.animations.right[this.state].donePlayingCallback = digCompleted;
                    }
                    // A counter for the health bar to check if player is drowning
                    if (this.swimmingProperty.breathCount > 20) {
                        //Player is dead!
                        //<progress id="health" value="100" max="100"></progress>
                        // var health = document.getElementById("health")
                        // health.value = health.value (add, subtract health, whatever.)
                        this.swimmingProperty.breathCount = 0;
                    }
                    break;
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
            // Check oxygen level of player
        if(sprite.holdBreath && sprite.inWater(tilemap)){
            this.swimmingProperty.breathCount += elapsedTime;
        }
        else{
            this.swimmingProperty.breathCount = 0; // If player is not in water reset breath count to zero
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

        console.log("Picked up power up: " + powerUp.type);

        if (powerUp.type == 'boneUp') {
            this.bones++;
        } else if (powerUp.type == 'coin') {
            // add points

        } else if (powerUp.type == 'crystal') {
            // add points

        } else if (powerUp.type == 'pick') {

            console.log("super pickaxe activated");
            this.superPickaxe = true;

        } else if (powerUp.type == 'stone-shield') {
            this.stoneShield = true;
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

        } else if (powerUp.type == 'stone-shield') {
            this.stoneShield = false;
        }
    }

    /*
     Bone projectile powerup
     */
    Player.prototype.shoot = function(){
        if(this.bones > 0 && this.lastAttack >= this.attackFrequency){
            //Added sound for throwing bone
            throw_sound.play();
            var bone = new Bone(this.currentX, this.currentY, 0, this.isLeft, this);
            this.entityManager.add(bone);
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

        if (this.holdBreath && this.state == SWIMMING) {
            var bb = this.boundingBox();
            var width = (bb.right - bb.left) - ((Math.floor(this.swimmingProperty.breathCount) / 20) * (bb.right - bb.left));

            ctx.fillStyle = "#21C8FF";
            ctx.fillRect(bb.left, bb.top - 15, width, 10);
            ctx.fill();
        }

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

        ctx.drawImage(
            this.boneImg,
            0,
            0,
            64,
            64,
            this.currentX + 400,
            this.currentY - 350,
            64,
            64);
        ctx.font = "20pt Calibri";
        ctx.fillText("x"+this.bones, this.currentX + 445, this.currentY - 300);




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
