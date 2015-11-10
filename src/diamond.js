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
