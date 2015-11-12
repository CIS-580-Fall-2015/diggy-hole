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
  roboKillerWalkRight.src = 'img/robo-killer_walk_right.png';

  // The left walking robo-killer spritesheet
  var roboKillerWalkLeft = new Image();
  roboKillerWalkLeft.src = "img/robo-killer_walk_left.png";

  // The right attacking robo-killer spritesheet
  var roboKillerAttackRight = new Image();
  roboKillerWalkLeft.src = "img/robo-killer_attack_right.png";

  // The left attacking robo-killer spritesheet
  var roboKillerAttackLeft = new Image();
  roboKillerWalkLeft.src = "img/robo-killer_attack_left.png";


  // Constructor for the robo-killer enemy. It inherits from entity (entity.js).
  function Robo_Killer(locationX, locationY, layerIndex){
    // Establish entity type.
    this.type = "robo-killer";

    // Establish visual layer.
    this.layerIndex = layerIndex;

    // Establish current position.
    this.currentX = locationX;
    this.currentY = locationY;

    // The default state is patrolling. Set the state accordingly.
    this.state  = PATROLING;

    //There is more to set here.

    // Create an animations property, with arrays for each direction of animations.
    this.animations = {
      left: [],
      right: []
    };

    // The right-facing animations.
    this.animations.right[PATORLING] = new Animation(roboKillerWalkRight, SIZE, SIZE, 0, 0, 3);
    this.animations.right[ATTACKING] = new Animation(roboKillerAttackRight, SIZE, SIZE, 0, 0, 3);
    this.animations.right[IDLE] = new Animation(roboKillerWalkRight, SIZE, SIZE, 0, 0, 1);
    this.animations.right[FALLING] = new Animation(roboKillerWalkRight, SIZE, SIZE, 0, 0, 1);

    //The left-facing animations
    this.animations.left[PATORLING] = new Animation(roboKillerWalkLeft, SIZE, SIZE, 0, 0, 3);
    this.animations.left[ATTACKING] = new Animation(roboKillerAttackLeft, SIZE, SIZE, 0, 0, 3;
    this.animations.left[IDLE] = new Animation(roboKillerWalkLeft, SIZE, SIZE, 0, 0, 1));
    this.animations.left[FALLING] = new Animation(roboKillerWalkLeft, SIZE, SIZE, 0, 0, 1));

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
