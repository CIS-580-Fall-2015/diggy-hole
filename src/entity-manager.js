/* The entity manager for the DiggyHole game
* Currently it uses brute-force approaches
* to its role - this needs to be refactored
* into a spatial data structure approach.
* Authors:
* - Nathan Bean
*/
module.exports = (function() {
    var EntityManager = function(player) {
        /* jshint esnext: true */
        const MAX_ENTITIES = 200;
        const UPDATE_REGION = 75;
        const RENDER_REGION = 25;
        const TILE_SIZE = 64;
        const UPDATE_TIME = 1/60;

        var entityXpos = [],
            entityYpos = [],
            entityCount = 0,
            timeSinceUpdateRegion;

        /* Adds an entity to those managed.
         * Arguments:
         * - entity, the entity to add
         */
        function add(entityToAdd) {
            if (entityCount + 1 < MAX_ENTITIES) {
                var boundingBox = entityToAdd.boundingBox();
                var entityPos = {
                    entity: entityToAdd,
                    hitbox: boundingBox
                };

                //Add the wrapper object to the X pos list
                for (var i = 0; i < entityXpos.length; i++) {
                    if (entityXpos[i] !== null) {
                        if (entityPos.hitbox.left <= entityXpos[i]) {
                            entityXpos.splice(i, 0, entityPos);
                        }
                    }
                    else {
                        entityXpos.splice(i, 0, entityPos);
                    }
                }

                //Add the wrapper object to the Y pos list
                for (var i = 0; i < entityYpos.length; i++) {
                    if (entityYpos[i] !== null) {
                        if (entityPos.hitbox.left <= entityYpos[i]) {
                            entityYpos.splice(i, 0, entityPos);
                        }
                    }
                    else {
                        entityYpos.splice(i, 0, entityPos);
                    }
                }

                entityCount++;
            }
        }

        /* Removes an entity from those managed
         * Arguments:
         * - entity, the entity to remove
         * returns true if the entity was removed, false if not
         */
        function remove(entity) {
            var xPos = -1, yPos = -1;
            for (var i = 0; i < entityCount; i++) {
                if (entityXpos[i].entity === entity) xPos = i;
                if (entityYpos[i].entity === entity) yPos = i;
            }
            if (xPos === -1 || yPos === -1) return false;
            entityXpos.splice(xPos, 1);
            entityYpos.splice(yPos, 1);
            entityCount--;
            return true;
        }


        function updateEntityHitboxes() {
            for (var i = 0; i < entityXpos.length; i++) {
                entityXpos[i].hitbox = entityXpos[i].entity.getBoundingBox();
            }
        }

        function insertionSort(items)
        {
            for (var i = 0; i < items.length; ++i) {
                var tmp = items[i];
                for (var j = i - 1; j >=0 && items[j].hitbox.left > tmp.hitbox.left; --j) {
                    items[j + 1] = items[j];
                }
                items[j + 1] = tmp;
            }
        }

        function sortEntities() {

            insertionSort(entityXpos);
            insertionSort(entityYpos);
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
            var entitesInRadius = [];
            for (var i = 0; i < entityXpos.length; i++) {
                if (entityXpos[i] !== null) {
                    var boundingCircle = entityXpos[i].boundingCircle();
                    if (isWithinCircle(x, y, r, boundingCircle))
                        entitesInRadius.push(entityXpos[i].entity);
                }
            }

            return entitesInRadius;
        }

        function queryRectangle(rect) {

        }


        function isWithinCircle(x, y, r, circle) {
            if (Math.pow(circle.radius + r, 2) >=
                (Math.pow(x - circle.cx, 2) + Math.pow(y - circle.cy, 2)))
                return true;

            return false;
        }

        //Determines if 2 bounding boxes intersect in any way
        function isWithinBox(bb1, bb2) {
            if ((bb1.left >= bb2.left) && (bb1.left <= bb2.right)) return true;
            if ((bb1.right <= bb2.right) && (bb1.right >= bb2.left)) return true;
            if ((bb1.top >= bb2.top) && (bb1.top <= bb2.bottom)) return true;
            if ((bb1.bottom <= bb2.bottom) && (bb1.bottom >= bb2.top)) return true;

            return false;
        }

        /* Updates all managed entities
         * Arguments:
         * - elapsedTime, how much time has passed between the prior frameElement
         *   and this one.
         * - tilemap, the current tilemap for the game.
         */
        function update(elapsedTime, tilemap, ParticleManager) {
            timeSinceUpdateRegion += elapsedTime;

            //create bounding box and clean updatable objects, but only after some time interval
            if(timeSinceUpdateRegion >= UPDATE_TIME) {
                var playerBB = player.boundingBox(),
                    updateFactor = UPDATE_REGION * TILE_SIZE,
                    updateBox = {
                        top: playerBB.top - updateFactor,
                        bottom: playerBB.bottom + updateFactor,
                        left: playerBB.left - updateFactor,
                        right: playerBB.right + updateFactor
                    };

                timeSinceUpdateRegion = 0;
                for(var i = 0; i < entityXpos.length; i ++) {
                    if(entityXpos[i] !== null) {
                        if(!isWithinBox(updateBox, entityXpos[i].hitbox))
                            remove(entityXpos[i]);
                    }
                }
            }

            //call everyone's update function
            for(var i = 0; i < entityXpos.length; i ++) {
                if(entityXpos[i] !== null) {
                    entityXpos[i].entity.update();
                }
            }

            //check collisions
            checkCollisions();
        }

        /* Renders the managed entities
         * Arguments:
         * - ctx, the rendering contextual
         * - debug, the flag to trigger visual debugging
         */
        function render(ctx, debug) {
            //create the renderable region
            var playerBB = player.boundingBox(),
                updateFactor = RENDER_REGION * TILE_SIZE,
                updateBox = {
                    top: playerBB.top - updateFactor,
                    bottom: playerBB.bottom + updateFactor,
                    left: playerBB.left - updateFactor,
                    right: playerBB.right + updateFactor
                };

            //call the real update method
            for(var i = 0; i < entityXpos.length; i ++) {
                if(entityXpos[i] !== null) {
                    if(isWithinBox(updateBox, entityXpos[i].hitbox))
                        entityXpos[i].entity.render();
                }
            }
        }

        function getPlayer() {
            return player;
        }

        return {
            add: add,
            remove: remove,
            queryRadius: queryRadius,
            update: update,
            render: render,
            getPlayer: getPlayer,
        };
    };
}());
