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
    this.gravity = 0.5;
    this.angle = 0;
    this.xSpeed = 10;
    this.ySpeed = 15;
    this.isLeft = false;
    this.hurtFrame =0;
    this.hasDiamond = false;
    this.moveDiamond = false;

    this.score = 3;

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