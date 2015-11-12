/* Entity: Robo-Killer module
 * Implements the entity pattern, provides specific robo-killer constructs.
 *
 * Author: Christian Hughes
 *
 * Image labled for reuse. Source: http://4.bp.blogspot.com/-iu9fsSz_L5I/T9X-dz3AFhI/AAAAAAAAAfQ/bG6hvI_eKzo/s1600/robotboy.png
 */
module.exports = (function() {
  var Entity = require('./entity.js'),
  Animation = require('./animation.js');

  // States for the robo-killer
  const PATROLING = 0;
  const ATTACKING = 1;
  const IDLE = 2;
  const FALLING = 3;

  // The sprite size (It's a square 64 pixels x 64 pixels)
  const SIZE = 64;

  // Movement constants, which are in line with that of the player (player.js)
  const SPEED = 150;
  const GRAVITY = -250;
  const JUMP_VELOCITY = -600;

  // The right walking robo-killer spritesheet
  var roboKillerWalkRight = new Image();
  roboKillerWalkRight.src = './img/robo-killer_walk_right.png';

  // The left walking robo-killer spritesheet
  var roboKillerWalkLeft = new Image();
  roboKillerWalkLeft.src = "./img/robo-killer_walk_left.png";

  // The right attacking robo-killer spritesheet
  var roboKillerAttackRight = new Image();
  roboKillerAttackRight.src = "./img/robo-killer_attack_right.png";

  // The left attacking robo-killer spritesheet
  var roboKillerAttackLeft = new Image();
  roboKillerAttackLeft.src = "./img/robo-killer_attack_left.png";


  // Constructor for the robo-killer enemy. It inherits from entity (entity.js).
  function Robo_Killer(locationX, locationY, layerIndex){
    // Establish entity type.
    this.type = "robo-killer";

    // Establish visual layer.
    this.layerIndex = layerIndex;

    // Establish current position.
    this.currentX = locationX;
    this.currentY = locationY;

    this.state  = PATROLING; // The default state is patrolling. Set the state accordingly.
    this.isLeft = false; // The robo-killer begins facing to the right.

    //There is more to set here.

    // Create an animations property, with arrays for each direction of animations.
    this.animations = {
      left: [],
      right: []
    };

    // The right-facing animations.
    this.animations.right[PATROLING] = new Animation(roboKillerWalkRight, SIZE, SIZE, 0, 0, 3, .2);
    this.animations.right[ATTACKING] = new Animation(roboKillerAttackRight, SIZE, SIZE, 0, 0, 3, .2);
    this.animations.right[IDLE] = new Animation(roboKillerWalkRight, SIZE, SIZE, 0, 0, 1);
    this.animations.right[FALLING] = new Animation(roboKillerWalkRight, SIZE, SIZE, 0, 0, 1);

    //The left-facing animations
    this.animations.left[PATROLING] = new Animation(roboKillerWalkLeft, SIZE, SIZE, 0, 0, 3, .2);
    this.animations.left[ATTACKING] = new Animation(roboKillerAttackLeft, SIZE, SIZE, 0, 0, 3, .2);
    this.animations.left[IDLE] = new Animation(roboKillerWalkLeft, SIZE, SIZE, 0, 0, 1);
    this.animations.left[FALLING] = new Animation(roboKillerWalkLeft, SIZE, SIZE, 0, 0, 1);

  }
  // Robo-Killer inherits from Entity
  Robo_Killer.prototype = new Entity();

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
  Robo_Killer.prototype.update = function(elapsedTime, tilemap, entityManager) {
      // Determine what your entity will do

      // Update animation
      if(this.isLeft)
        this.animations.left[this.state].update(elapsedTime);
      else
        this.animations.right[this.state].update(elapsedTime);
  }

  /* Render function
   *
   * Renders the character based on state (direction facing/if debugging is enabled).
   *
   * params:
   * context - The context from the canvas being drawn to.
   * debug - A binary flag denoting whether debug mode is on (draws bounding box around Robo-Killer).
   */
   Robo_Killer.prototype.render = function(context, debug) {
     // Draw the Robo-Killer (and the correct animation).
     if (this.isLeft)
     {
       this.animations.left[this.state].render(context, this.currentX, this.currentY);
     }
     else
     {
       this.animations.right[this.state].render(context, this.currentX, this.currentY);
     }

     if (debug)
     {
       renderDebug(this, context);
     }
   };

   // Draws debugging visual elements. Same method used in player.js.
   function renderDebug(robo_killer, ctx) {
     var bounds = robo_killer.boundingBox();
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

     // Outline tile underneath the robo-killer.
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

   /* Collide function
    *
    * This robot hates slime. He will telport away from the slime as soon as contact is made.
    *
    * params:
    * otherEntity - The entity being colided with.
    */
   Robo_Killer.prototype.collide = function(otherEntity) {
     // The robo-killer is terrifed of slime. He will teleport in the opposite direction upon touching the slime.
     if (otherEntity.type == "Slime")
     {
       if (this.isLeft)
       {
         // If hit from the left, teleport to the right.
         this.CurrentX += SIZE * 3;
       }
       else
       {
         //If hit from the right, teleport to the left.
         this.CurrentX += SIZE * 3;
       }
     }
   }

   /* BoundingBox function
    *
    * Returns a bounding box (which is 64 x 64 pixels) denoting the bounds
    * of the Robo-Killer.
    */
   Robo_Killer.prototype.boundingBox = function() {
     // Return a bounding box for Robo-Killer
     return {
       left: this.currentX,
       top: this.currentY,
       right: this.currentX + SIZE,
       bottom: this.currentY + SIZE
     };
   };

   /* BoundingCircle function
    *
    * Returns a bouding circle that surrounds the Robo-Killer.
    * The cirlce has a radius of 32 pixels, and a diameter of 64 pixels.
    */
   Robo_Killer.prototype.boundingCircle = function() {
     // Return a bounding circle Robo-Killer
     return {
       cx: this.currentX + SIZE / 2,
       cy: this.currentY + SIZE / 2,
       radius: SIZE / 2
     };
   };

   return Robo_Killer;

}());
