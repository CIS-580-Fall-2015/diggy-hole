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

    QuadTree = require('./QuadTree.js');

    var collisionTree = new QuadTree({ x: 0, y: 0, width: 1000*64, height: 1000*64 }, false);

    var entities = [],
    entityCount = 0;

    /* Adds an entity to those managed.
    * Arguments:
    * - entity, the entity to add
    */
    function add(entity) { if (entityCount < MAX_ENTITIES) {
        // Determine the entity's unique ID
        // (we simply use an auto-increment count)
        var id = entityCount;
        entityCount++;

        // Set the entity's id on the entity itself
        // as a property.  Due to the dynamic nature of
        // JavaScript, this is easy
        entity._entity_id = id;

        // Store the entity in the entities array
        entities[id] = entity;
        return true;
    } else {
        // We've hit the max number of allowable entities,
        // yet we may have freed up some space within our
        // entity array when an entity was removed.
        // If so, let's co-opt it.
        for (var i = 0; i < MAX_ENTITIES; i++) {
            if (entities[i] === undefined) {
                entity._entity_id = i;
                entities[i] = entity;
                return i;
            }
        }
        // If we get to this point, there are simply no
        // available spaces for a new entity.
        // Log an error message, and return an error value.
        console.error("Too many entities");
        return undefined;
    }
}

/* Removes an entity from those managed
* Arguments:
* - entity, the entity to remove
*/
function remove(entity) {
    // Set the entry in the entities table to undefined,
    // indicating an open slot
    if (entity.score) {
        var player = getPlayer();
        player.score(entity.score);
    }
    entities[entity._entity_id] = undefined;
}

/* Checks for collisions between entities, and
* triggers the collide() event handler.
*/
function checkCollisions() {
    var colliders = [];
    for(var i = 0; i < entityCount; i++) {
        if(entities[i]) {
            var hitbox = entities[i].boundingBox();
            colliders.push({
                x: hitbox.left,
                y: hitbox.top,
                width: hitbox.right - hitbox.left,
                height: hitbox.bottom - hitbox.top,
                entity: entities[i]
            });
        }
    }

    collisionTree.insert(colliders);

    for (i = 0; i < colliders.length; i++) {
        var possibleCollisions = collisionTree.retrieve(colliders[i]);
        for (var j = 0; j < possibleCollisions.length; j++) {
            var boundsA = colliders[i].entity.boundingBox();
            var boundsB = possibleCollisions[j].entity.boundingBox();
            if (boundsA.left < boundsB.right &&
                boundsA.right > boundsB.left &&
                boundsA.top < boundsB.bottom &&
                boundsA.bottom > boundsB.top
            ) {
                colliders[i].entity.collide(possibleCollisions[j].entity);

                //TODO bug if removed?
                possibleCollisions[j].entity.collide(colliders[i].entity);
            }

        }

    }
    collisionTree.clear(); /* do this now for garbage collector speed */
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
    var entitiesInRadius = [];
    for (var i = 0; i < entityCount; i++) {
        // Only check existing entities
        if (entities[i]) {
            var circ = entities[i].boundingCircle();
            if (Math.pow(circ.radius + r, 2) >=
            Math.pow(x - circ.cx, 2) + Math.pow(y - circ.cy, 2)
        ) {
            entitiesInRadius.push(entities[i]);
        }
    }
}
return entitiesInRadius;
}

function queryRectangle(rect) {
    var entitiesInRect = [];
    for (var i = 0; i < entityCount; i++) {
        // Only check existing entities
        if (entities[i]) {
            entityHitbox = entities[i].boundingBox();
            if( entityHitbox.left > rect.right || entityHitbox.right < rect.left ||
                entityHitbox.top > rect.bottom || entityHitbox.bottom < rect.top) continue;
            entitiesInRect.push(entities[i]);
        }
    }
    return entitiesInRect;
}

/* Updates all managed entities
* Arguments:
* - elapsedTime, how much time has passed between the prior frameElement
*   and this one.
* - tilemap, the current tilemap for the game.
*/
function update(elapsedTime, tilemap, ParticleManager) {
    //loops through entities
    for (var i = 0; i < entityCount; i++) {
        if(entities[i]) {
            entities[i].update(elapsedTime, tilemap, this, ParticleManager);
        }
    }
    var playerBox = getPlayer().boundingBox();
    checkCollisions();
}

/* Renders the managed entities
* Arguments:
* - ctx, the rendering contextual
* - debug, the flag to trigger visual debugging
*/
function render(ctx, debug) {
    //used for determining the area of the screen/what entities are on/near screen to be rendered
    var play = getPlayer();
    var viewPortArea = tilemap.getViewPort();

    var entitiesOnScreen = queryRectangle(viewPortArea);
    //loops through entities
    for (var i = 0; i < entitiesOnScreen.length; i++) {
        if(entitiesOnScreen[i]) {
            entitiesOnScreen[i].render(ctx, debug);
        }
    }
}

function getPlayer() {
    for (var i = 0; i < entityCount; i++) {
        if (entities[i] && entities[i].type == "player") {
            return entities[i];
        }
    }
}

function getEntity(index) {
    return entities[index];
}

/* Gets distance between entity and player */
function playerDistanceSquaredFrom(entity) {
    if(typeof(entity) === "undefined" || entity === null) return Number.MAX_VALUE;
    var playerHitbox = getPlayer().boundingBox();
    var entityHitbox = entity.boundingBox();

    return (entityHitbox.left - playerHitbox.left) * (entityHitbox.left - playerHitbox.left) +
            (entityHitbox.top - playerHitbox.top) * (entityHitbox.top - playerHitbox.top);
}

/* Gets direction relative to player */
function playerDirection(entity) {
    if(typeof(entity) === "undefined" || entity === null) return false; // TODO ?
    var playerHitbox = getPlayer().boundingBox();
    var entityHitbox = entity.boundingBox();

    if (playerHitbox.right < entityHitbox.left) {
        return true;
    }
    return false;
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
