/* A stationary mud golem creature with a powerful attack
   Built from player.js template
   By Richard Petrie */

module.exports = (function() {
  var Entity = require('./entity.js'),
    Animation = require('./animation.js');

  const DORMANT = 0;
  const RISING = 1;
  const STANDING = 2;
  const CHARGING = 3;
  const ATTACK = 4;

  // The Sprite Size
  const SIZE = 64;
  const ARMX = 128;
  const ARMY = 32;

  //Right
  var golemRight = new Image();
  golemRight.src = 'GolemAnimatedRight.png';

  //Left
  var golemLeft = new Image();
  golemLeft.src = "GolemAnimatedLeft.png";

  //The Player constructor
  function Golem(locationX, locationY, layerIndex) {
    this.state = DORMANT;
    this.layerIndex = layerIndex;
    this.currentX = locationX;
    this.currentY = locationY;
    this.nextX = 0;
    this.nextY = 0;
    this.currentTileIndex = 0;
    this.nextTileIndex = 0;
    this.isLeft = false;
    this.entity_type = "Golem";
    this.arm = new Entity();

    //Arm proprerties
    this.arm.currentY = this.currentY + 16;
    this.arm.currentX = this.currentX;
    this.arm.isLeft = false;
    this.arm.entity_type = "Golem-arm";
    this.arm.state = 0;

    //Arm functions
    this.arm.boundingBox = function(otherEntity) {
      //TODO this or this.arm?
      if (this.state === 0) {
        return;
      }
      return {
        left: this.currentX,
        top: this.currentY,
        right: this.currentX + ARMX,
        bottom: this.currentY + ARMY,
      };
    };

    this.arm.render = function(context, debug) {
      //TODO this
    }

    //Update handled by Golem

    //The animations
    this.animations = {
      left: [],
      right: [],
    };

    //TODO this
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
  Golem.prototype = new Entity();

  // Determines if the player is on the ground
  Golem.prototype.onGround = function(tilemap) {
    var box = this.boundingBox(),
      tileX = Math.floor((box.left + (SIZE / 2)) / 64),
      tileY = Math.floor(box.bottom / 64),
      tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    // find the tile we are standing on.
    return (tile && tile.data.solid) ? true : false;
  };

  /* Player update function
   * arguments:
   * - elapsedTime, the time that has passed
   *   between this and the last frame.
   * - tilemap, the tilemap that corresponds to
   *   the current game world.
   */
  Golem.prototype.update = function(elapsedTime, tilemap) {
    var sprite = this;
    if (!sprite.onGround(tilemap)) {
      // Kill if not on ground
      entityManager.remove(this);
    }
    // Process player state
    switch (sprite.state) {
      case STANDING:
        // If there is no ground underneath, fall
        //TODO facing
        break;
      case DORMANT:
        //TODO this
        break;
      case CHARGING:
        //TODO this
        break;
      case RISING:
        //TODO this
        break;
      case ATTACK:
        //TODO this
        break;

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
  Golem.prototype.render = function(ctx, debug) {
    // Draw the player (and the correct animation)
    if (this.isLeft)
      this.animations.left[this.state].render(ctx, this.currentX, this.currentY);
    else
      this.animations.right[this.state].render(ctx, this.currentX, this.currentY);

    if (debug) renderDebug(this, ctx);
  };

  // Draw debugging visual elements
  function renderDebug(player, ctx) {
    var bounds = golem.boundingBox();
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
  Golem.prototype.boundingBox = function() {
    return {
      left: this.currentX,
      top: this.currentY,
      right: this.currentX + SIZE,
      bottom: this.currentY + SIZE
    };
  };

  Golem.prototype.boundingCircle = function() {
    //TODO bounding circle
    return {};
  };

  Golem.prototype.collide = function(otherEntity) {
    if (this.state == ATTACK) {
      if (otherEntity.entity_type == "Player") {
        //TODO kill player
      }
    }
  };

  return Golem;

}());
