/* Pickaxe is an invisible entity created by player that represents the hitbox
 * of the Pickaxe.
 * In the future this would be interesting to have an attack animation effect
 * like a slash or something.
 */
module.exports = (function() {
  var Entity = require('./entity.js');

  /* moveing these values to a pickaxe factory class would be cool.
  Then powerups could change the attack size. */
  var attackSize = { x: 10, y: 10 };
  var attackRadius = 15;


  var Pickaxe = function(position) {
      this.position = { x: position.x, y: position.y };
  };

  Pickaxe.prototype.update = function() {

  };

  Pickaxe.prototype.render = function() {

  };

  Pickaxe.prototype.boundingBox = function() {
    return {
      left: this.position.x,
      top: this.position.y,
      right: position.x + attackSize.x,
      bottom: position.y + attackSize.y
    };
  };


  Pickaxe.prototype.boundingCircle = function() {
    return {
      cx: this.position.x + attackRadius / 2,
      cy: this.position.y + attackRadius / 2,
      radius: attackRadius
    };
  };






  })();
