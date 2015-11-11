/* The entity manager for the DiggyHole game
 * Currently it uses brute-force approaches
 * to its role - this needs to be refactored
 * into a spatial data structure approach.
 * Authors:
 * - Nathan Bean 
 */
module.exports = (function (){
  const MAX_ENTITIES = 100;
  
  var entities = [],
      entityCount = 0;

  var Player = require('./player.js');
  
  /* Adds an entity to those managed.
   * Arguments:
   * - entity, the entity to add
   */
  function add(entity) {
    if(entityCount < MAX_ENTITIES) {
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
      for(var i = 0; i < MAX_ENTITIES; i++) {
        if(entities[i] == undefined) {
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
    entities[entity._entity_id] = undefined;
  }
  
  /* Checks for collisions between entities, and
   * triggers the collide() event handler.
   */
  function checkCollisions() {
    for(var i = 0; i < entityCount; i++) {
      // Don't check for nonexistant entities
      if(entities[i]) {
        for(var j = 0; j < entityCount; j++) {
          // don't check for collisions with ourselves
          // and don't bother checking non-existing entities
          if(i != j && entities[j]) {
            var boundsA = entities[i].boundingBox();
            var boundsB = entities[j].boundingBox();
            if( boundsA.left < boundsB.right &&
                boundsA.right > boundsB.left &&
                boundsA.top < boundsB.bottom &&
                boundsA.bottom > boundsB.top
              ) {
              entities[i].collide(entities[j]);
              entities[j].collide(entities[i]);
            }
          }
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
    var entitiesInRadius = [];
    for(var i = 0; i < entityCount; i++) {
      // Only check existing entities
      if(entities[i]) {
        var circ = entities[i].boundingCircle();
        if( Math.pow(circ.radius + r, 2) >=
            Math.pow(x - circ.cx, 2) + Math.pow(y - circ.cy, 2)
        ){
		entitiesInRadius.push(entities[i]);
      }
    }
	}
    return entitiesInRadius;
  }
  
  /* Updates all managed entities
   * Arguments:
   * - elapsedTime, how much time has passed between the prior frameElement
   *   and this one.
   * - tilemap, the current tilemap for the game.
   */
  function update(elapsedTime, tilemap) {
    for(i = 0; i < entityCount; i++) {
      if(entities[i]) entities[i].update(elapsedTime, tilemap, this);
    }
    checkCollisions();
  }
  
  /* Renders the managed entities
   * Arguments:
   * - ctx, the rendering contextual
   * - debug, the flag to trigger visual debugging
   */
  function render(ctx, debug) {
    for(var i = 0; i < entityCount; i++) {
      if(entities[i]) entities[i].render(ctx, debug);
    }
  }

  function getPlayer(){
    for(var i = 0; i < entityCount; i++) {
      if(entities[i] && entities[i] instanceof Player){
        return entities[i];
      }
    }
  }
  
    function getEntity(index){
	  return entities[index];
  }
  
  return {
    add: add,
    remove: remove,
    queryRadius: queryRadius,
    update: update,
    render: render,
    getPlayer: getPlayer,
	getEntity: getEntity
  }
  
}());