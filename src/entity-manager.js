/* The entity manager for the DiggyHole game
* Currently it uses brute-force approaches
* to its role - this needs to be refactored
* into a spatial data structure approach.
* Authors:
* - Nathan Bean
*/
module.exports = (function() {
    var settings = require('./Settings.js');

    var entityXpos = [],
        entityYpos = [],
        player,
        timeSinceUpdateRegion;

    function EntityManager(p) {
        /* jshint esnext: true */
        player = p;
        this.add(player);
    }

        /* Adds an entity to those managed.
         * Arguments:
         * - entity, the entity to add
         */
    EntityManager.prototype.add = function(entityToAdd) {
        if (entityXpos.length < settings.MAX_ENTITIES) {
            var boundingBox = entityToAdd.boundingBox();
            var entityPos = {
                entity: entityToAdd,
                hitbox: boundingBox
            };

            entityXpos.push(entityPos);
            entityYpos.push(entityPos);
        }
    };

        /* Removes an entity from those managed
         * Arguments:
         * - entity, the entity to remove
         * returns true if the entity was removed, false if not
         */
    EntityManager.prototype.remove = function(entity) {
        var xPos = -1, yPos = -1;
        for (var i = 0; i < entityXpos.length; i++) {
            if (entityXpos[i].entity === entity) xPos = i;
            if (entityYpos[i].entity === entity) yPos = i;
        }
        if (xPos === -1 || yPos === -1) return false;
        entityXpos.splice(xPos, 1);
        entityYpos.splice(yPos, 1);
        return true;
    };


    EntityManager.prototype.updateEntityHitboxes = function() {
        for (var i = 0; i < entityXpos.length; i++) {
            entityXpos[i].hitbox = entityXpos[i].entity.boundingBox();
        }
    };

    EntityManager.prototype.insertionSort = function(items) {
        for (var i = 0; i < items.length; ++i) {
            var tmp = items[i];
            for (var j = i - 1; j >=0 && items[j].hitbox.left > tmp.hitbox.left; --j) {
                items[j + 1] = items[j];
            }
            items[j + 1] = tmp;
        }
    };

    EntityManager.prototype.sortEntities = function() {
        this.insertionSort(entityXpos);
        this.insertionSort(entityYpos);
    };

    /* Checks for collisions between entities, and
     * triggers the collide() event handler.
     */
    EntityManager.prototype.checkCollisions = function() {
         this.updateEntityHitboxes();
         this.sortEntities();

         var xPotentialCollisions = [];
         var yPotentialCollisions = [];
         var i, j, current;

         for(i = 0; i < entityXpos.length; i++) {
             current = entityXpos[i].hitbox;
             j = i;
             while(++j < entityXpos.length && current.right >= entityXpos[j].hitbox.left) {
                 xPotentialCollisions.push({ a: entityXpos[i].entity, b: entityXpos[j].entity });
             }
         }

         for(i = 0; i < entityYpos.length; i++) {
             current = entityYpos[i].hitbox;
             j = i;
             while(++j < entityYpos.length && current.bottom >= entityYpos[j].hitbox.top) {
                 yPotentialCollisions.push({ a: entityYpos[i].entity, b: entityYpos[j].entity });
             }
         }

         for(i = 0; i < xPotentialCollisions.length; i++) {
             for(j = 0; j < yPotentialCollisions.length; j++) {
                 if( (xPotentialCollisions[i].a === yPotentialCollisions[j].a && xPotentialCollisions[i].b === yPotentialCollisions[j].b) ||
                     (xPotentialCollisions[i].b === yPotentialCollisions[j].a && xPotentialCollisions[i].a === yPotentialCollisions[j].b)) {
                     xPotentialCollisions[i].a.collide(xPotentialCollisions[i].b, this);
                     break;
                 }
             }
         }
     };

    /* Returns all entities within the given radius.
     * Arguments:
     * - x, the x-coordinate of the center of the query circle
     * - y, the y-coordinate of the center of the query circle
     * - r, the radius of the center of the circle
     * Returns:
     *   An array of entity references
     */
    EntityManager.prototype.queryRadius = function(x, y, r) {
        var entitesInRadius = [];
        for (var i = 0; i < entityXpos.length; i++) {
            if (entityXpos[i] !== null) {
                var boundingCircle = entityXpos[i].entity.boundingCircle();
                if (this.isWithinCircle(x, y, r, boundingCircle))
                    entitesInRadius.push(entityXpos[i].entity);
            }
        }

        return entitesInRadius;
    };

    EntityManager.prototype.isWithinCircle = function(x, y, r, circle) {
        if(Math.pow(circle.radius + r, 2) >=
            (Math.pow(x - circle.cx, 2) + Math.pow(y - circle.cy, 2)))
            return true;

        return false;
    };

    //Determines if 2 bounding boxes intersect in any way
    EntityManager.prototype.isWithinBox = function(bb1, bb2) {
        return(bb1.left < bb2.right && bb1.right > bb2.left && bb1.top < bb2.bottom && bb1.bottom > bb2.top);
    };

    /* Updates all managed entities
     * Arguments:
     * - elapsedTime, how much time has passed between the prior frameElement
     *   and this one.
     * - tilemap, the current tilemap for the game.
     */
    EntityManager.prototype.update = function(elapsedTime, tilemap, ParticleManager) {
        timeSinceUpdateRegion += elapsedTime;

        //create bounding box and clean updatable objects, but only after some time interval
        if(timeSinceUpdateRegion >= settings.UPDATE_TIME) {
            var playerBB = player.boundingBox(),
                updateFactor = settings.UPDATE_REGION * settings.TILESIZEX,
                updateBox = {
                    top: playerBB.top - updateFactor,
                    bottom: playerBB.bottom + updateFactor,
                    left: playerBB.left - updateFactor,
                    right: playerBB.right + updateFactor
                };

            timeSinceUpdateRegion = 0;
            for(var i = 0; i < entityXpos.length; i ++) {
                if(entityXpos[i] !== null) {
                    if(!this.isWithinBox(updateBox, entityXpos[i].hitbox))
                        this.remove(entityXpos[i]);
                }
            }
        }

        //call everyone's update function
        for(var i = 0; i < entityXpos.length; i ++) {
            if(entityXpos[i] !== null) {
                entityXpos[i].entity.update(elapsedTime, tilemap, this, ParticleManager);
            }
        }

        //check collisions
        this.checkCollisions();
    };

    /* Renders the managed entities
     * Arguments:
     * - ctx, the rendering contextual
     * - debug, the flag to trigger visual debugging
     */
    EntityManager.prototype.render = function(ctx, debug) {
        //create the renderable region
        var playerBB = player.boundingBox(),
            updateFactor = settings.RENDER_REGION * settings.TILESIZEX,
            updateBox = {
                top: playerBB.top - updateFactor,
                bottom: playerBB.bottom + updateFactor,
                left: playerBB.left - updateFactor,
                right: playerBB.right + updateFactor
            };

        //call the real update method
        for(var i = 0; i < entityXpos.length; i ++) {
            if(entityXpos[i] !== null) {
                if(this.isWithinBox(updateBox, entityXpos[i].hitbox))
                    entityXpos[i].entity.render(ctx, debug);
            }
        }
    };

    EntityManager.prototype.getPlayer = function() {
        return player;
    };

    return EntityManager;

}());
