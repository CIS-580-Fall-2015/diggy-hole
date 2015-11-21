/* The construct for a collectible. Inherits from entity.
 * Removed from entity manager upon being collected by player.
 * Certain strategies derived from the powerup class.
 *
 * Author: Christian Hughes
 */

module.exports = (function(){
	var Animation = require('./animation.js'),
		Entity = require('./entity.js');

  // Create an image object in advance. The constructor will provide a source to the proper sprite sheet.
  var collectibleSpriteSheet = new Image();

	/* THE CONSTRUCTOR FOR A COLLECTIBLE OBJECT.
		locationX - x-position of the collectble.
		locationY - y-position of the collectible.
		mapLayer - z-layer of the map that the collecible should appear on.
		type - The NAME of the collectible (should be a string unqiue to this entity).
		width - Width of one animation image.
		height - Height of one animation image.
		frameNum - The number of frames in the collectible's sprite sheet.
		imgPath - Relative path to the animation's sprite sheet.
    score - The amount of points that the collectible is worth.
	*/
	function Collectible(locationX, locationY, mapLayer,
					 type, width, height, frameNum, imgPath, score) {
    // Establish coordinates.
		this.x = locationX;
		this.y = locationY;
    // Establish map-layer.
		this.layerIndex = mapLayer;
    // The type, which is unique to the entity.
		this.type = type;
    // The height and width of a single frame.
		this.width = width;
		this.height = height;
    // Establish the radius of the image.
		this.radius = Math.sqrt(this.width * this.width / 4 + this.height * this.height / 4);
    // Assign the image path to the image object.
    this.img = collectibleSpriteSheet;
    this.img.src = imgPath;
    // Create the collectible's animation. It only has one state (always on).
		this.animation = new Animation(this.img, this.width, this.height, 0, 0, frameNum);
    // Has the collectible been collected by the player? False to begin with.
		this.collected = false;
    // Establish the score of the entity.
    this.score = score;

    console.log("A " + this.type + " was created.");

    // A pickedUpSound might be implemented in the future (similar to the powerup).
		//this.pickedUpSound = new Audio('');
	}

  // The Collectible inherits from Entity.
  Collectible.prototype = new Entity();

	Collectible.prototype.update = function(elapsedTime, tilemap, entityManager)
	{
    // Update the animation based on the elapsed time.
		this.animation.update(elapsedTime);

    // If the player touches the collects the collectible, then the collectible should be removed from the entity manager.
    // (It no longer requires any updates).
    if (this.collected == true)
    {
      entityManager.remove(this);
      console.log("A " + this.type + " was removed.");
    }
	}

	Collectible.prototype.render = function(context, debug)
	{
    // Nothing fancy, just use the animation function to render the sprite sheet.
		this.animation.render(context, this.x, this.y);
		if(debug) renderDebug(this, context);
	}

	function renderDebug(powerUp, ctx) {
		var bounds = powerUp.boundingBox();
		var circle = powerUp.boundingCircle();
		ctx.save();

		// Draw player bounding box
		ctx.strokeStyle = "red";
		ctx.beginPath();
		ctx.moveTo(bounds.left, bounds.top);
		ctx.lineTo(bounds.right, bounds.top);
		ctx.lineTo(bounds.right, bounds.bottom);
		ctx.lineTo(bounds.left, bounds.bottom);
		ctx.lineTo(bounds.left, bounds.bottom);
		ctx.closePath();
		ctx.stroke();

		ctx.strokeStyle = "blue";
		ctx.beginPath();
		ctx.arc(circle.cx, circle.cy, circle.radius, 0, 2*Math.PI);
		ctx.stroke();

		// Outline tile underfoot
		var tileX = 64 * Math.floor((bounds.left + (this.width/2))/64),
			tileY = 64 * (Math.floor(bounds.bottom / 64));
		ctx.strokeStyle = "black";
		ctx.beginPath();
		ctx.moveTo(tileX, tileY);
		ctx.lineTo(tileX + 64, tileY);
		ctx.lineTo(tileX + 64, tileY + 64);
		ctx.lineTo(tileX, tileY + 64);
		ctx.closePath();
		ctx.stroke();

		ctx.restore();
  }

	Collectible.prototype.collide = function(otherEntity)
	{
		if (otherEntity.type == 'player' && this.collected == false) {
			// Sounds may be implemented in the future.
			//this.pickedUpSound.play();
			this.collected = true;
      // Tell the player to add this to its list of collectibles.
			// otherEntity.collected(this);
		}
	}

	Collectible.prototype.boundingBox = function()
	{
		return {
			left: this.x,
			top: this.y,
			right: this.x + this.width,
			bottom: this.y + this.height
		}
	}

	Collectible.prototype.boundingCircle = function()
	{
		return {
			cx: this.x + this.width / 2,
			cy: this.y + this.height / 2,
			radius: this.radius
		}
	}

	Collectible.prototype.onGround = function(tilemap) {
    var box = this.boundingBox(),
        tileX = Math.floor((box.left + (this.width/2))/64),
        tileY = Math.floor(box.bottom / 64),
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    // find the tile we are standing on.
    return (tile && tile.data.solid) ? true : false;
  }


	return Collectible;

}())
