/* The entity manager for the DiggyHole game
* Currently it uses brute-force approaches
* to its role - this needs to be refactored
* into a spatial data structure approach.
* Authors:
* - Nathan Bean
*/
module.exports = (function() {
    /* jshint esnext: true */
    const MAX_ENTITIES = 200;

    var entityXpos = [],
        entityYpos = [],
        player,
        entityCount;

/* Adds an entity to those managed.
* Arguments:
* - entity, the entity to add
*/
function add(entity) {

}

/* Removes an entity from those managed
* Arguments:
* - entity, the entity to remove
*/
function remove(entity) {

}


function updateEntityHitboxes() {
    for(i = 0; i < entityXpos.length; i++) {
        entityXpos[i].hitbox = entityXpos[i].e.getBoundingBox();
    }
}

function sortEntities() {

}

/* Checks for collisions between entities, and
* triggers the collide() event handler.
*/
function checkCollisions() {
    updateEntityHitboxes();
    sortEntities();

    var xPotentialCollisions = [];
    var yPotentialCollisions = [];
    var i, j, current;

    for(i = 0; i < entityXpos.length; i++) {
        current = entityXpos[i].hitbox;
        j = i;
        while(++j < entityXpos.length && current.right >= entityXpos[j].hitbox.left) {
            xPotentialCollisions.push({ a: current.entity, b: entityXpos[j].entity });
        }
    }

    for(i = 0; i < entityYpos.length; i++) {
        current = entityYpos[i].hitbox;
        j = i;
        while(++j < entityYpos.length && current.bottom >= entityYpos[j].hitbox.top) {
            yPotentialCollisions.push({ a: current.entity, b: entityYpos[j].entity });
        }
    }

    for(i = 0; i < xPotentialCollisions.length; i++) {
        for(j = 0; j < yPotentialCollisions.length; j++) {
            if( (xPotentialCollisions[i].a === yPotentialCollisions[j].a && xPotentialCollisions[i].b === yPotentialCollisions[j].b) ||
                (xPotentialCollisions[i].b === yPotentialCollisions[j].a && xPotentialCollisions[i].a === yPotentialCollisions[j].b)) {
                xPotentialCollisions[i].a.collide(xPotentialCollisions[i].b);
                break;
            }
        }
    }
}

/* Returns all entities within the given radius.
* Arguments:
* - x, the x-coordinate of the center of the query circle
* - y, the y-coordinate of the center of the query circle
* - r, the radius of the center of the circle
* Returns:
*   An array of entity references
*/
function queryRadius(x, y, r) {

}

function queryRectangle(rect) {

}

/* Updates all managed entities
* Arguments:
* - elapsedTime, how much time has passed between the prior frameElement
*   and this one.
* - tilemap, the current tilemap for the game.
*/
function update(elapsedTime, tilemap, ParticleManager) {

}

/* Renders the managed entities
* Arguments:
* - ctx, the rendering contextual
* - debug, the flag to trigger visual debugging
*/
function render(ctx, debug) {

}

function getPlayer() {

}

function getEntity(index) {

}

/* Gets distance between entity and player */
function playerDistanceSquaredFrom(entity) {

}

/* Gets direction relative to player */
function playerDirection(entity) {

}

return {
    add: add,
    remove: remove,
    queryRadius: queryRadius,
    update: update,
    render: render,
    playerDistanceSquaredFrom: playerDistanceSquaredFrom,
    playerDirection: playerDirection,
    getPlayer: getPlayer,
    getEntity: getEntity,
};

}());
