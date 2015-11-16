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

    this.patrolDirectionCounter = 0; // A counter denoting how long the robo-killer should patrol in one direction. 0-100 by deafault.
    this.attackCounter = 0; // Determines how long the robo-killer will attack for upon seeing the player. 0-10 by default.


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

  /* Update function for Robo_Killer
   *
   * The robot patrols a fixed distance. He will attack the player if the player comes near.
   * He will fall off ledges, and contine patrolling upon landing on solid ground.
   */
  Robo_Killer.prototype.update = function(elapsedTime, tilemap, entityManager) {
      // Determins what the robo-killer will do.
      var sprite = this;

      switch (sprite.state)
      {
          case PATROLING:
            // If there is no ground underneath, fall down.
            if(!sprite.onGround(tilemap))
            {
              sprite.state = FALLING;
              sprite.velocityY = 0;
            }
            else // Otherwise, begin the patrolling sequence.
            {
              if(sprite.isLeft) // Patrols to the left for a specified period.
              {
                sprite.moveLeft(elapsedTime * SPEED, tilemap);
                sprite.patrolDirectionCounter++;
                if (sprite.patrolDirectionCounter === 100)
                {
                  sprite.patrolDirectionCounter = 0;
                  sprite.isLeft = false;
                }
              }
              else // Patrols to the right for a specified duration.
              {
                sprite.moveRight(elapsedTime * SPEED, tilemap);
                sprite.patrolDirectionCounter++;
                if (sprite.patrolDirectionCounter === 100)
                {
                  sprite.patrolDirectionCounter = 0;
                  sprite.isLeft = true;
                }
              }
            }
            break;
          case ATTACKING:
            // Trigger attack animation upon contact with the Player.
            // Possibly implement some sort of damage later on.
            sprite.attackCounter++;
            if (sprite.attackCounter === 20)
            {
              sprite.attackCounter = 0;
              sprite.state = PATROLING;
            }
            break;
          // I may implement an idle state later. For the time being, the entity will simply attack the player if the player ends up in the patrol zone.
          // In my opinion, the lack of idle behavior may be more fitting
          // case IDLE: // Goes to idle state if the robo-killer loses site of the player. He will stay there for several seconds.
          //   // If he sees the player, he will chase after them.
          //
          //   // Otherwise he will return back to patrolling.
          //
          //   break;
          case FALLING: // Fall down at an accelerating speed until solid ground is hit. He will fall straight down, then continue to patrol at the landing zone.
            sprite.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
            sprite.currentY += sprite.velocityY * elapsedTime;
            if (sprite.onGround(tilemap))
            {
              sprite.state = PATROLING;
              sprite.currentY = 64 * Math.floor(sprite.currentY / 64);
            }
            break;
      };

      // Update animation each time the update() function runs.
      if(this.isLeft)
      {
        this.animations.left[this.state].update(elapsedTime);
      }
      else
      {
        this.animations.right[this.state].update(elapsedTime);
      }
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

   // Determines if the robo killer is on the ground (method copied from player.js).
   Robo_Killer.prototype.onGround = function(tilemap) {
     var box = this.boundingBox(),
       tileX = Math.floor((box.left + (SIZE / 2)) / 64),
       tileY = Math.floor(box.bottom / 64),
       tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
     // find the tile we are standing on.
     return (tile && tile.data.solid) ? true : false;
   };

   // Moves the robo-killer to the left, colliding with solid tiles (method copied from player.js).
   Robo_Killer.prototype.moveLeft = function(distance, tilemap) {
     this.currentX -= distance;
     var box = this.boundingBox(),
       tileX = Math.floor(box.left / 64),
       tileY = Math.floor(box.bottom / 64) - 1,
       tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
     if (tile && tile.data.solid)
       this.currentX = (Math.floor(this.currentX / 64) + 1) * 64;
   };

   // Moves the robo-killer to the right, colliding with solid tiles (method copied from player.js).
   Robo_Killer.prototype.moveRight = function(distance, tilemap) {
     this.currentX += distance;
     var box = this.boundingBox(),
       tileX = Math.floor(box.right / 64),
       tileY = Math.floor(box.bottom / 64) - 1,
       tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
     if (tile && tile.data.solid)
       this.currentX = (Math.ceil(this.currentX/64)-1) * 64;
   };

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
         this.CurrentX -= SIZE * 3;
       }
     }
     else if (otherEntity.type == "player") // If we touch the player, begin attacking.
     {
       this.state = ATTACKING;
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
