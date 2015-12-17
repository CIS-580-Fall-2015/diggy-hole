/* Author: Nic Johnson
 *
 * Title: knight.js
 *
 * Description: implementation of an AI enemy for
 * 		DiggyHole.
 *
 *
 * History:
 * 		November 04, 2015:
 *  		-Date Created
 *  	November 08, 2015:
 *  		-Completed boundingBox, boundingCirle, render
 *  			and constructor
 *  		-Started update and update animation
 *  	November 10, 2015:
 *  		-Finished updateAnimation
 *  		-Began work on update function
 *  		-Modularized update function into movement
 *  			and state changes.
 *  	November 11, 2015:
 *  		-Finished state machine and update function
 *
 */

module.exports = (function()
{

	///////////////
	// Constants //
	///////////////

	var States =
	{
		WALKING_RIGHT: 0,
		WALKING_LEFT: 1,
		RUNNING_RIGHT:2,
		RUNNING_LEFT: 3,
		STOPPED: 4
	};
	Object.freeze(States);
	// Prevents any changes to States object
	// essentially creating an enum or constant

	var Directions =
	{
		UP: 1,
		DOWN: 2,
		LEFT: 3,
		RIGHT: 4
	};
	Object.freeze(Directions);

	var IMG_WIDTH = 320;
	var IMG_HEIGHT = 256;
	var RENDER_HEIGHT = 32;
	var RENDER_WIDTH = 32;
	var TILE_WIDTH = 32;
	var TILE_HEIGHT = 32;

	var DEBUG_COLOR = "#E60000";

	// =-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

	//////////////////////
	// Class Definition //
	//////////////////////

	function Knight(xlocation, ylocation, layer)
	{
		// Type Info
		this.type                 = "knight";
		// Layer info
		this.timer 				  = 0;
		this.layer = layer;
		// State variable
		this.state = States.STOPPED;
		// Movement vectors
		this.xvec                 = 0;
		this.yvec                 = 0;
		this.gravity              = 0.3;
		this.friction             = 0.8;
		this.walkspeed 			  = 2;
		this.runspeed 			  = 6;
		// Position info
		this.xpos                 = xlocation;
		this.ypos                 = ylocation;
		// Image data
		this.numFramesPerRow      = 5;
		this.numRows              = 4;
		this.img                  = new Image();
		this.img.src 			  = './img/knight_sheet.png ';
		this.width 				  = IMG_WIDTH / this.numFramesPerRow;
		this.height 			  = IMG_HEIGHT / this.numRows;
		this.center 			  = [this.xpos + (this.width / 2), this.ypos + (this.height / 2)];
		// Animation
		this.walkingRightFrames   = [10, 11, 12, 13, 14];
		this.walkingLeftFrames    = [15, 16, 17, 18, 19];
		this.attackingRightFrames = [0, 1, 2, 3, 4];
		this.attackingLeftFrames = [5, 6, 7, 8, 9];
		this.facing = 1;
		this.frameIndex = 0;
		this.ticksPerFrame = 7;
		this.tickCount = 0;
		this.currentFrameSet = this.walkingRightFrames;

		this.score = 5;

	}

	Knight.prototype = require('./entity.js');


	/**
	 * Function: update
	 * 		performs all the logic to update position, animation, and state
	 *   	of the knight
	 * Parameters:
	 *      elapsedTime   - time elapsed since last frame
	 *      tilemap       - reference to the tilemap
	 *      entityManager - reference to the entity manager
	 */
	Knight.prototype.update = function(elapsedTime, tilemap, entityManager)
	{
		if (this.state != States.DEAD)
		{
			this.updateCenter();
			//this.useSensors(entityManager, elapsedTime);
			this.updateMovement(elapsedTime);
			var state = this.resolveTilemapCollisions(tilemap);
			if (state !== null)
			{
				this.state = state;
			}
			this.updateAnimation();
		}
		else
		{
			entityManager.remove(this);
		}
	};

	/**
	 * Function: render
	 *     renders the knight into the supplied context
	 * Parameters:
	 *     context - context to render knight into
	 *     debug   - boolean indicating if bounding box needs
	 *               to be drawn
	 */
	Knight.prototype.render = function(context, debug)
	{
		context.save();
		var sx = (this.frameIndex % this.numFramesPerRow) * this.width;
		var sy = Math.floor(this.frameIndex / this.numFramesPerRow) * this.height;
		context.drawImage(
			this.img,
			sx,
			sy,
			this.width,
			this.height,
			this.xpos,
			this.ypos,
			RENDER_WIDTH,
			RENDER_HEIGHT

		);

		if (debug)
		{
			var box = this.boundingBox();
			context.strokeStyle = DEBUG_COLOR;
			context.moveTo(box.left, box.top);
			context.lineTo(box.right, box.top);
			context.lineTo(box.right, box.bottom);
			context.lineTo(box.left, box.bottom);
			context.lineTo(box.left, box.top);
			context.stroke();
		}
		context.restore();
	}

	/**
	 * Function: collide
	 * 		Called by the entityManager whenever a collision
	 *   	is detected.
	 * Parameters:
	 *      otherEntity - the entity being collided with
	 */
	Knight.prototype.collide = function(otherEntity)
	{
		if (otherEntity.type == "player" && otherEntity.currentY < this.ypos) // It's a player and they're stomping on
		{																	  // my head
			this.state = States.DEAD;
		}
	}

	/**
	 * Function: boundingBox
	 * 		returns a bounding box defining the Knight
	 * Returns:
	 *      object containing left, right, top, and
	 *       bottom properties
	 */
	Knight.prototype.boundingBox = function()
	{
		return {
			top: this.ypos,
			bottom: this.ypos + RENDER_HEIGHT,
			left: this.xpos,
			right: this.xpos + RENDER_WIDTH
		};
	}

	/**
	 * Function: boundingCircle
	 * 		returns a bounding circle defining the knight
	 * Returns:
	 *   	an object containing cx, cy, and radius properties
	 */
	Knight.prototype.boundingCircle = function()
	{
		return {
			cx: this.center[0],
			cy: this.center[1],
			radius: RENDER_HEIGHT / 2
		};
	}

	// =-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

	///////////////////////
	// Utility Functions //
	///////////////////////

	Knight.prototype.useSensors = function(EM, elapsed)
	{
		var list = EM.queryRadius(this.center[0], this.center[1], 150);
		var player = EM.getPlayer();
		for (var i = 0; i < list.length; i++)
		{
			if (list[i]._entity_id == player._entity_id) // Player is in the list
			{
				if (this.state != States.RUNNING_RIGHT && this.state != States.RUNNING_LEFT) // not already running
				{
					if (facing == 1) // Facing right
					{
						// Check is player is on roughly the same horizontal line
						var y1 = player.currentY < (this.center[1] + (RENDER_HEIGHT / 2));
						var y2 = player.currentY > (this.center[1] - (RENDER_HEIGHT / 2));
						if (player.currentX > this.xpos && (y1 && y2)) // Players position is right of me
						{
							this.state = States.RUNNING_RIGHT;
						}
					}
					else // Facing left
					{
						var y1 = player.currentY < (this.center[1] + (RENDER_HEIGHT / 2));
						var y2 = player.currentY > (this.center[1] - (RENDER_HEIGHT / 2));
						if (player.currentX < this.xpos && (y1 && y2)) // Players position is left of me
						{
							this.state = States.RUNNING_LEFT;
						}
					}
				}
				else // already running
				{
					if (facing == 1) // facing right
					{
						if (this.xpos > player.currentX) // passed the player
						{
							this.timer += elapsed;
						}
					}
					else // facing left
					{
						if (this.xpos < player.currentX) // passed the player
						{
							this.timer += elapsed;
						}
					}
					if (this.timer > 1) // Should have ran past the player since
					{					// since it only updates after you've passed them
						this.timer = 0;
						if (this.state == States.RUNNING_RIGHT)
						{
							this.state == States.WALKING_LEFT;
						}
						else
						{
							this.state == States.WALKING_RIGHT;
						}
					}
				}
			}
		}
	}

	/**
	 * Function: detectCollision
	 *      Modified version of code from:
	 *		http://www.somethinghitme.com/2013/04/16/creating-a-canvas-platformer-tutorial-part-tw/
	 * Parameters:
	 *      shape - other entity
	 * Returns:
	 *      direction of collision or -1 if no collision
	 */
	Knight.prototype.detectCollision = function(shape)
	{
		// get the vectors to check against
	    var vX = (this.xpos + (RENDER_HEIGHT / 2)) - (shape.xpos + (shape.width / 2)),
	        vY = (this.ypos + (RENDER_WIDTH / 2)) - (shape.ypos + (shape.height / 2)),
	        // add the half widths and half heights of the objects
	        hWidths = (RENDER_WIDTH / 2) + (shape.width / 2),
	        hHeights = (RENDER_HEIGHT / 2) + (shape.height / 2),
	        colDir = -1;

	    // if the x and y vector are less than the half width or half height,
	    // they we must be inside the object, causing a collision
	    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
	    	var oX = hWidths - Math.abs(vX),
	    	oY = hHeights - Math.abs(vY);
	    	if (oX >= oY) {
	            if (vY > 0) {
	                colDir = Directions.UP;
	                this.ypos += oY;
	            } else {
	                colDir = Directions.DOWN;
	                this.ypos -= oY;
	            }
	        } else {
	            if (vX > 0) {
	                colDir = Directions.LEFT;
	                this.xpos += oX;
	            } else {
	                colDir = Directions.RIGHT;
	                this.xpos -= oX;
	            }
	        }
	    }
	    return colDir;
	}

	/**
	 * Function: resolveTilemapCollisions
	 * 		resolves collisions with tilemap
	 * Returns:
	 *   	the new state for the knight
	 */
	Knight.prototype.resolveTilemapCollisions = function(tilemap)
	{
		var potential = this.getSurroundingTiles(tilemap);
		var newState = null;
		for (var i = 0; i < potential.length; i++)
		{
			var collision = this.detectCollision(potential[i]);
			if (collision != -1)
			{
				switch(collision)
				{
					case Directions.LEFT:
						this.xvec = 0;
						this.facing = 1;
						newState = States.WALKING_RIGHT;
						break;
					case Directions.RIGHT:
						this.xvec = 0;
						this.facing = -1;
						newState = States.WALKING_LEFT;
						break;
					case Directions.TOP:  // Should never be a collision with a tile above the knight
						this.yvec = 0;
						break;
					case Directions.DOWN:
						this.yvec = 0;
						break;
				}
			}
		}
		return newState;
	}

	/**
	 * Function: updateCenter
	 * 		utility function to maintain the center point
	 *   	of the knight
	 */
	Knight.prototype.updateCenter = function()
	{
		this.center = [this.xpos + (RENDER_WIDTH / 2), this.ypos + (RENDER_HEIGHT / 2)];
	}

	/**
	 * Function: updateAnimation
	 * 		utility function to update animation logic so render function
	 *   	can just render the scene
	 */
	Knight.prototype.updateAnimation = function()
	{
		this.tickCount++;
		var update = false;
		switch(this.state)
		{
			case States.RUNNING_RIGHT:
			case States.WALKING_RIGHT:
				this.currentFrameSet = this.walkingRightFrames;
				update = true;
				break;

			case States.WALKING_LEFT:
			case States.RUNNING_LEFT:
				this.currentFrameSet = this.walkingLeftFrames;
				update = true;
				break;

			case States.STOPPED:
				if (facing == 1)
				{
					this.currentFrameSet = this.walkingRightFrames;
				}
				else
				{
					this.currentFrameSet = this.walkingLeftFrames;
				}
				this.frameIndex = this.currentFrameSet[0];

		}
		if (update)
		{
			if (this.tickCount > this.ticksPerFrame)
			{
				this.tickCount = 0;
				if ((this.frameIndex % this.numFramesPerRow) < this.numFramesPerRow - 1)
				{
					this.frameIndex += 1;
				}
				else
				{
					this.frameIndex = this.currentFrameSet[0];
				}
			}
		}
	}

	/*
		Gets the four tiles that surround the center point
		of the Knight
	 */
	Knight.prototype.getSurroundingTiles = function(tilemap)
	{
		var centerTile = tilemap.pixelsToCoords(this.center[0], this.center[1]);
		var initial = [];
		var potential = [];
		initial.push([centerTile[0] - 1, centerTile[1]]);
		initial.push([centerTile[0] + 1, centerTile[1]]);
		initial.push([centerTile[0], centerTile[1] - 1]);
		initial.push([centerTile[0] , centerTile[1] + 1]);
		//console.log(initial[0], initial[1], initial[2], initial[3]);
		for (var i = 0; i < initial.length; i++)
		{
			var tile = tilemap.tileAt(initial[i][0], initial[i][1], 0);
			if (tile && tile.solid) // tile exists and its solid
			{
				//console.log('Exists');
				var coords = this.coordsToPixels(initial[i][0], initial[i][1]);
				potential.push(
					{
						xpos: coords[0],
						ypos: coords[1],
						width: TILE_WIDTH,
						height: TILE_HEIGHT
					});
			}
		}
		return potential;
	}

	/**
	 * Function: pixelsToCoords
	 * 		converts pixel x and y to tilemap
	 *   	coordinates
	 * Parameters:
	 *       x - x position in pixels
	 *       y - y position in pixels
	 * Returns:
	 *       0-based tile coordinates
	 */
	Knight.prototype.pixelsToCoords = function(x, y)
	{
		var xcoord = Math.floor(x / TILE_WIDTH);
	    var ycoord = Math.floor(y / TILE_HEIGHT);
	    return [xcoord, ycoord];
	}

	/**
	 * Function: coordsToPixels
	 * 		returns the top right corner of a tile
	 *   	in the form of pixel coordinates
	 * Parameters:
	 *      x - x position in index
	 *      y - y position in index
	 * Returns:
	 *      pixel coordinates
	 */
	Knight.prototype.coordsToPixels = function(x, y)
	{
		var xcoord = TILE_WIDTH * x;
    	var ycoord = TILE_HEIGHT * y;
    	return [xcoord, ycoord];
	}


	/**
	 * Function: updateMovement
	 * 		utility function to deal with movement
	 */
	Knight.prototype.updateMovement = function(delta)
	{
		switch(this.state)
		{
			case States.WALKING_LEFT:
				this.facing = -1;
				if (this.xvec >= this.walkspeed * -1)
				{
					this.xvec -= 1;
				}
				break;

			case States.WALKING_RIGHT:
				this.facing = 1;
				if (this.xvec <= this.walkspeed)
				{
					this.xvec += 1;
				}
				break;

			case States.RUNNING_RIGHT:
				this.facing = 1;
				if (this.xvec <= this.runspeed)
				{
					this.xvec += 1;
				}
				break;

			case States.RUNNING_LEFT:
				this.facing = -1;
				if (this.xvec >= this.runspeed * -1)
				{
					this.xvec -= 1;
				}
				break;

			case States.STOPPED:

				break;
		}

		// Apply friction and gravity
		this.xvec *= this.friction;
		this.yvec += this.gravity;

		// If either vector is small enough,
		// just make it easy and set it to zero
		if (Math.abs(this.xvec) < 0.1)
		{
			this.xvec = 0;
		}
		if (Math.abs(this.yvec) < 0.1)
		{
			this.yvec = 0;
		}
		// Apply all the movement changes
		this.xpos += this.xvec * (delta / 10);
		this.ypos += this.yvec * (delta / 10);
	}

	return Knight;

})();