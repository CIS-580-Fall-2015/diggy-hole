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

	// =-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

	function Knight(xlocation, ylocation, layer)
	{
		// Layer info
		this.layer = layer; 
		// State variable
		this.state = States.STOPPED;
		// Movement vectors
		this.xvec = 0;
		this.yvec = 0;
		this.gravity = 0.3;
		this.friction = 0.8;
		// Image data
		
		// Position info
		this.xpos = xlocation;
		this.ypos = ylocation;


	}

	Knight.prototype = require('./entity.js');

	
	Knight.update = function(elapsedTime, tilemap, entityManager)
	{

	}

	Knight.render = function(context, debug)
	{

	}

	Knight.collide = function(otherEntity)
	{

	}

	Knight.boundingBox = function()
	{

	}

	Knight.boundingCircle = function()
	{

	}

})();