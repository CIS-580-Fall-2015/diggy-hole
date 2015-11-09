/* Stone monster module
 * Implements the entity pattern
 * Authors:
 * - Filip Stanek
 */

module.exports = (function() {
    var Entity = require('./entity.js'),
        Animation = require('./animation.js');

    function StoneMonster(locationX, locationY, mapLayer)
    {
        Entity.call(this, locationX, locationY, mapLayer);
        this.speedX = 0;
        this.speedY = 0;
    }

    StoneMonster.prototype = new Entity();

    Entity.prototype.update = function(elapsedTime, tilemap, entityManager) {
        // TODO: Determine what your entity will do
    };

    /* Render function
     * parameters:
     *  - context is the rendering context.  It may be transformed
     *    to account for the camera
     */
    Entity.prototype.render = function(context) {
        // TODO: Draw your entity sprite
    };

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
    };

    /* BoundingBox function
     * This function returns an axis-aligned bounding
     * box, i.e {top: 0, left: 0, right: 20, bottom: 50}
     * the box should contain your entity or at least the
     * part that can be collided with.
     */
    Entity.prototype.boundingBox = function() {
        // Return a bounding box for your entity
    };

    /* BoundingCircle function
     * This function returns a bounding circle, i.e.
     * {cx: 0, cy: 0, radius: 20}
     * the circle should contain your entity or at
     * least the part that can be collided with.
     */
    Entity.prototype.boundingCircle = function() {
        // Return a bounding box for your entity
    };

    return StoneMonster;

});