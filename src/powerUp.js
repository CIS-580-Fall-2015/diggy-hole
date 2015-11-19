module.exports = (function(){
	var Animation = require('./animation.js'),
		Entity = require('./entity.js'),
		Player = require('./player.js'),
		EntityManager = require('./entity-manager.js');
	
	/**
		locationX 	- posX
		locationY 	- posY
		mapLayer 	- mapLayer
		type		- custom name (string)
		width		- width of one animation image
		height		- height of one animation image
		frameNum	- number of frames of its animation
		imgPath		- path to the animation's spritesheet
	*/
	function PowerUp(locationX, locationY, mapLayer,
					 type, width, height, frameNum, imgPath) {
		this.x = locationX;
		this.y = locationY;
		this.type = type;
		this.width = width;
		this.height = height;
		this.img = new Image();
		this.animation = null;
		this.radius = Math.sqrt(this.width * this.width / 4 + this.height * this.height / 4);
		var outerObject = this;
		this.img.onload = function () {
			outerObject.animation = new Animation(outerObject.img, outerObject.width, outerObject.height, 0, 0, frameNum);
		}
		this.img.src = imgPath;
		
		this.pickedUp = false;
		this.pickedUpSound = new Audio('./sounds/powerUp.wav');
	}
	
	
	PowerUp.prototype.update = function(elapsedTime, tilemap, entityManager)
	{
		if (this.img.complete == false || this.pickedUp == true) return;
		
		this.animation.update(elapsedTime);
	}
	
	PowerUp.prototype.render = function(context, debug)
	{
		if (this.img.complete == false || this.pickedUp == true) return;
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
	
	PowerUp.prototype.collide = function(otherEntity)
	{
		if (otherEntity.type == 'player' && this.pickedUp == false) {
			otherEntity.poweredUp(this);
			this.pickedUpSound.play();
			this.pickedUp = true;
		}
	}
	
	PowerUp.prototype.boundingBox = function()
	{
		return {
			left: this.x,
			top: this.y,
			right: this.x + this.width,
			bottom: this.y + this.height
		}
	}

	PowerUp.prototype.boundingCircle = function()
	{
		return {
			cx: this.x + this.width / 2,
			cy: this.y + this.height / 2,
			radius: this.radius
		}
	}
	
	
	return PowerUp;

}())