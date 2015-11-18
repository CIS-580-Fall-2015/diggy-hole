/* Player module
 * Implements the entity pattern and provides
 * the DiggyHole player info.
 * Authors:
 * - Wyatt Watson
 * - Nathan Bean
 */
module.exports = (function(){
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
  const GRAVITY_IN_WATER = -80;
  const SWIM_UP = -164;
    const SPEED_IN_LIQUID = 80;
  
  //The Right facing dwarf spritesheet
  var dwarfRight = new Image();
  dwarfRight.src = 'DwarfAnimatedRight.png';

  //The left facing dwarf spritesheet
  var dwarfLeft = new Image();
  dwarfLeft.src = "DwarfAnimatedLeft.png";
  // Player's breath count, right now 4 seconds for testing purposes
   var breathCount;
  //The Player constructor
  function Player(locationX, locationY, layerIndex, inputManager) {
    this.inputManager = inputManager
    this.state = WALKING;
    this.holdBreath = false;
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
	this.type = "player";
      this.enable_vertical_swim = false; //By default player should not be able to swim up
    
    //The animations
    this.animations = {
      left: [],
      right: [],
    }

    //The right-facing animations
    this.animations.right[STANDING] = new Animation(dwarfRight, SIZE, SIZE, SIZE*2, SIZE);
    this.animations.right[WALKING] = new Animation(dwarfRight, SIZE, SIZE, 0, 0, 4);
    this.animations.right[JUMPING] = new Animation(dwarfRight, SIZE, SIZE, SIZE*3, 0);
    this.animations.right[DIGGING] = new Animation(dwarfRight, SIZE, SIZE, 0, SIZE*2, 4);
    this.animations.right[FALLING] = new Animation(dwarfRight, SIZE, SIZE, SIZE, SIZE);
    this.animations.right[SWIMMING] = new Animation(dwarfRight, SIZE, SIZE, 0, 0, 4);
    
    //The left-facing animations
    this.animations.left[STANDING] = new Animation(dwarfLeft, SIZE, SIZE, SIZE*2, SIZE);
    this.animations.left[WALKING] = new Animation(dwarfLeft, SIZE, SIZE, 0, 0, 4);
    this.animations.left[JUMPING] = new Animation(dwarfLeft, SIZE, SIZE, SIZE*3, 0);
    this.animations.left[DIGGING] = new Animation(dwarfLeft, SIZE, SIZE, 0, SIZE*2, 4);
    this.animations.left[FALLING] = new Animation(dwarfLeft, SIZE, SIZE, SIZE, SIZE);
    this.animations.left[SWIMMING] = new Animation(dwarfLeft, SIZE, SIZE, 0, 0, 4);
  }
  
  // Player inherits from Entity
  Player.prototype = new Entity();
  
  // Determines if the player is on the ground
  Player.prototype.onGround = function(tilemap) {
    var box = this.boundingBox(),
        tileX = Math.floor((box.left + (SIZE/2))/64),
        tileY = Math.floor(box.bottom / 64),
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);   
    // find the tile we are standing on.
    return (tile && tile.data.solid) ? true : false;
  }
    Player.prototype.inWater = function(tilemap){
        var box = this.boundingBox(),
            tileX = Math.floor((box.left + (SIZE/2))/64), //possibly make whole body immersion
            tileY = Math.floor(box.bottom / 64), //possibly make whole body immersion
            tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
            if(tile){
                if (tile.data.type == "Water"){
                    return true;
                }
            }
        return false; //
    };
  
  // Moves the player to the left, colliding with solid tiles
  Player.prototype.moveLeft = function(distance, tilemap) {
    this.currentX -= distance;
    var box = this.boundingBox(),
        tileX = Math.floor(box.left/64),
        tileY = Math.floor(box.bottom / 64) - 1,
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid) 
      this.currentX = (Math.floor(this.currentX/64) + 1) * 64
  }
  
  // Moves the player to the right, colliding with solid tiles
  Player.prototype.moveRight = function(distance, tilemap) {
    this.currentX += distance;
    var box = this.boundingBox(),
        tileX = Math.floor(box.right/64),
        tileY = Math.floor(box.bottom / 64) - 1,
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid)
      this.currentX = (Math.ceil(this.currentX/64)-1) * 64;
  }
  
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
    with (this.inputManager) {
    
      // Process player state
      switch(sprite.state) {
        case STANDING:
        case WALKING:
          // If there is no ground underneath, fall
          if(!sprite.onGround(tilemap)) {
            sprite.state = FALLING;
            sprite.velocityY = 0;
          }
          else if(sprite.inWater(tilemap)){
              sprite.state = SWIMMING;
              sprite.holdBreath = true;
              sprite.enable_vertical_swim = true;
          }
          else {
            if(isKeyDown(commands.DIG)) {
              sprite.state = DIGGING;
            }
            else if(isKeyDown(commands.UP)) {
              sprite.state = JUMPING;
              sprite.velocityY = JUMP_VELOCITY;
            }
            else if(isKeyDown(commands.LEFT)) {
              if (sprite.inWater(tilemap)) {//DEBUG
                sprite.velocityY = 0;
                sprite.isLeft = true;
                sprite.moveLeft(elapsedTime * SPEED_IN_LIQUID, tilemap);
              }
              else {
                sprite.isLeft = true;
                sprite.state = WALKING;
                sprite.moveLeft(elapsedTime * SPEED, tilemap);
              }
            }
            else if(isKeyDown(commands.RIGHT)) {
              sprite.isLeft = false;
              sprite.state = WALKING;
              sprite.moveRight(elapsedTime * SPEED, tilemap);
            }
            else {
              sprite.state = STANDING;
            }
          }
          break;
        case DIGGING:
		var box = this.boundingBox(),
			tileX = Math.floor((box.left + (SIZE/2))/64),
			tileY = Math.floor(box.bottom / 64);											
			tilemap.setTileAt(7, tileX, tileY, 0);			
			sprite.state = FALLING;
        case JUMPING:
          sprite.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
          sprite.currentY += sprite.velocityY * elapsedTime;
          if(sprite.velocityY > 0) {
            sprite.state = FALLING;
          }
          if(isKeyDown(commands.LEFT)) {
            sprite.isLeft = true;
            sprite.moveLeft(elapsedTime * SPEED, tilemap);
          }
          if(isKeyDown(commands.RIGHT)) {
            sprite.isLeft = true;
            sprite.moveRight(elapsedTime * SPEED, tilemap);
          }
          break;
        case FALLING:
          sprite.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
          sprite.currentY += sprite.velocityY * elapsedTime;
          if(sprite.onGround(tilemap)) {
            sprite.state = STANDING;
            sprite.currentY = 64 * Math.floor(sprite.currentY / 64);
          }
          else if(sprite.inWater(tilemap)){
            sprite.state = SWIMMING;
            sprite.holdBreath = true;
            sprite.enable_vertical_swim = false;
          }
          else if(isKeyDown(commands.LEFT)) {
            sprite.isLeft = true;
            sprite.moveLeft(elapsedTime * SPEED, tilemap);
          }
          else if(isKeyDown(commands.RIGHT)) {
            sprite.isLeft = false;
            sprite.moveRight(elapsedTime * SPEED, tilemap);
          }
          break;
          case SWIMMING:
            console.log("swimming");
            console.log(sprite.velocityY);
              //Player Sinks automatically
              //if(!sprite.onGround(tilemap)){
                  sprite.velocityY += Math.pow(GRAVITY_IN_WATER * elapsedTime, 2) +
                      (sprite.velocityY / GRAVITY_IN_WATER);
                  sprite.currentY += sprite.velocityY * elapsedTime;
              //}
              //check if the force from player's plunge enables them to swim back up, left or right
              if(sprite.enable_vertical_swim){
                  if(isKeyDown(commands.LEFT)){
                      sprite.velocityY = 0;
                      sprite.isLeft = true;
                      sprite.moveLeft(elapsedTime * SPEED_IN_LIQUID, tilemap);
                  }
                  else if(isKeyDown(commands.RIGHT)){
                      sprite.velocityY = 0;
                      sprite.isLeft = false;
                      sprite.moveRight(elapsedTime * SPEED_IN_LIQUID, tilemap);
                  }
                  else if(isKeyDown(commands.UP)) {
                    sprite.velocityY = Math.pow(GRAVITY_IN_WATER * elapsedTime, 2);
                    sprite.currentY -= sprite.velocityY * elapsedTime;
                    sprite.velocityY = 0;
                      console.log("SWIMING UP");
                  }
              }
              else if(!sprite.onGround(tilemap) && !sprite.inWater(tilemap)){
                    sprite.state = FALLING;
                    sprite.holdBreath = false;
                    console.log("falling");
              }
              else if(sprite.onGround(tilemap)){
                  sprite.velocityY = 0;
                  sprite.currentY = 64 * Math.floor(sprite.currentY / 64);
                  console.log("standing");
              }
              if(breathCount > 4){
                //Player is dead!
              //<progress id="health" value="100" max="100"></progress>
                // var health = document.getElementById("health")
                // health.value = health.value (add, subtract health, whatever.)
              }
              break;
      }
      // Swap input buffers
      swapBuffers();
    }
       if(sprite.holdBreath){
         breathCount = elapsedTime + breathCount
       }
        else{
         breathCount = 0; // If player is not in water reset breath count to zero
       }
    // Update animation
    if(this.isLeft)
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
  
  /* Player BoundingBox Function
   * returns: A bounding box representing the player 
   */
  Player.prototype.boundingBox = function() {
    return {
      left: this.currentX,
      top: this.currentY,
      right: this.currentX + SIZE,
      bottom: this.currentY + SIZE
    }
  }
  
  Player.prototype.boundingCircle = function() {
     return {
		 cx: this.currentX + SIZE/2,
		 cy: this.currentY + SIZE/2,
		 radius: SIZE/2
	 }
   }
  
  return Player;

}());