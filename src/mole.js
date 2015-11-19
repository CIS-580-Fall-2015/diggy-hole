/* Authors:
 * - Nathan Bean
 * - Hunter Goddard
 */
module.exports = (function(){
	
	var state = "idle",
	    direction = "left";
	    timer = 0;
	
	/* Constructor
	 * Generally speaking, you'll want to set
	 * the X and Y position, as well as the layerX
	 * of the map the entity is located on
	 */
	function Entity(locationX, locationY, mapLayer){
		this.x = locationX;
		this.y = locationY;
		this.mapLayer = mapLayer;
		this.type = "mole";
	}

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
		switch (state) {
			case "dig":
				
				break;
			case "flee":
				timer += elapsedTime;
				if (timer > 5) {
					state = "idle";
					timer = 0;
					break;
				}
				
				break;
			case "fall":
				
				break;
			default: //idle
				
				break;
		}
	}

	/* Render function
	 * parameters:
	 * - context is the rendering context. It may be transformed
	 *   to account for the camera.
	 * - debug is a boolean flag to determine whether debug 
	 *   information should be drawn or not.
	 */
	Entity.prototype.render = function(context, debug) {
		if (debug) {
			context.beginPath();
			context.rect(this.x, this.y, 40, 24);
			context.lineWidth = 3;
			context.strokeStyle = 'red';
			context.stroke();
		}
		
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
		state = "flee";
		timer = 0;
	}

	/* BoundingBox function
	 * This function returns an axis-aligned bounding
	 * box, i.e {top: 0, left: 0, right: 20, bottom: 50}
	 * the box should contain your entity or at least the
	 * part that can be collided with.
	 */
	Entity.prototype.boundingBox = function() {
		return {
			top: this.y,
			left: this.x,
			right: this.x + 40,
			bottom: this.y + 24;
		};
	}

	/* BoundingCircle function
	 * This function returns a bounding circle, i.e.
	 * {cx: 0, cy: 0, radius: 20}
	 * the circle should contain your entity or at 
	 * least the part that can be collided with.
	 */
	Entity.prototype.boundingCircle = function() {
		return {
			cx: this.x + 20,
			cy: this.y + 12,
			radius: 20;
		};
	}

	return Entity;

}());
