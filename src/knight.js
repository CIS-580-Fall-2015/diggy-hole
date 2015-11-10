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
 */

module.exports = (function()
{

	///////////////
	// Constants //
	///////////////
	
	var States = 
	{
		WALKING_RIGHT = 0,
		WALKING_LEFT = 1,
		RUNNING_RIGHT = 2,
		RUNNING_LEFT = 3,
		STOPPED = 4
	}
	Object.freeze(States); 
	// Prevents any changes to States object
	// essentially creating an enum or constant
	
	var Directions =
	{
		UP: 1,
		DOWN: 2,
		LEFT: 3,
		RIGHT: 4
	}
	Object.freeze(Directions);

	var DEBUG_COLOR = "#E60000";

	// =-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
	
	//////////////////////
	// Class Definition //
	//////////////////////

	function Knight(xlocation, ylocation, layer)
	{
		// Type Info
		this.type = "knight";
		// Layer info
		this.layer = layer; 
		// State variable
		this.state = States.STOPPED;
		// Movement vectors
		this.xvec = 0;
		this.yvec = 0;
		this.gravity = 0.3;
		this.friction = 0.8;
		// Position info
		this.xpos = xlocation;
		this.ypos = ylocation;
		// Image data
		this.image = new Image();
		this.numFramesPerRow = 5;
		this.numRows = 4;
		this.image.onload = function()
		{
			this.width = this.image.width / this.numFramesPerRow;
			this.height = this.image.height / this.numRows;
			this.imgHeight = this.image.height;
			this.imgWidth = this.image.width;
			this.center = [this.xpos + (this.width / 2), this.ypos + (this.height / 2)];
		}
		this.image.src = './img/knight_sheet.png';
		// Animation
		this.walkingRightFrames = [10, 11, 12, 13, 14];
		this.walkingLeftFrames = [15, 16, 17, 18, 19];
		this.attackingRightFrames = [0, 1, 2, 3, 4];
		this.attackingLeftFrames = [5, 6, 7, 8, 9];
		this.facing = 1; 
		this.frameIndex = 0;
		this.ticksPerFrame = 7;
		this.tickCount = 0;
		this.currentFrameSet = this.walkingRightFrames;

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
	Knight.update = function(elapsedTime, tilemap, entityManager)
	{
		this.updateCenter();
		this.updateAnimation();
	}

	/**
	 * Function: render
	 *     renders the knight into the supplied context
	 * Parameters:
	 *     context - context to render knight into
	 *     debug   - boolean indicating if bounding box needs
	 *               to be drawn
	 */
	Knight.render = function(context, debug)
	{
		context.save();
		var sx = (this.frameIndex % this.numFramesPerRow) * this.width;
		var sy = Math.floor(this.frameIndex / this.numFramesPerRow) * this.height;
		context.drawImage(
			this.image,
			sx,
			sy,
			this.width,
			this.height,
			this.xpos,
			this.ypos,
			this.width,
			this.height

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

	Knight.collide = function(otherEntity)
	{

	}

	/**
	 * Function: boundingBox
	 * 		returns a bounding box defining the Knight
	 * Returns:
	 *      object containing left, right, top, and
	 *       bottom properties
	 */
	Knight.boundingBox = function()
	{
		return {
			top: this.ypos,
			bottom: this.ypos + this.height,
			left: this.xpos,
			right: this.xpos + this.width
		};
	}

	/**
	 * Function: boundingCircle
	 * 		returns a bounding circle defining the knight
	 * Returns:
	 *   	an object containing cx, cy, and radius properties
	 */
	Knight.boundingCircle = function()
	{
		return {
			cx: this.center[0], 
			cy: this.center[1],
			radius: this.width / 2;
		};
	}

	// =-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

	///////////////////////
	// Utility Functions //
	///////////////////////

	/**
	 * Function: updateCenter
	 * 		utility function to maintain the center point
	 *   	of the knight
	 */
	Knight.updateCenter = function()
	{
		this.center = [this.xpos + (this.width / 2), this.ypos + (this.height / 2)];
	}

	/**
	 * Function: updateAnimation
	 * 		utility function to update animation logic so render function
	 *   	can just render the scene
	 */
	Knight.updateAnimation = function()
	{
		this.tickCount++;
		if (this.tickCount > this.ticksPerFrame)
		{
			if (this.state != States.STOPPED)
			{
				if ((this.frameIndex % this.numFramesPerRow) < this.numFramesPerRow - 1)
				{
					this.frameIndex += 1;
				}
				else
				{
					this.frameIndex = this.currentFrameSet[0];
				}
			}
			else
			{
				this.frameIndex = this.walkingRightFrames[0];
			}
		}
	}

	

	return Knight;

})();