module.exports = (function(){

var Animation = require('./animation.js'),
	Entity = require('./entity.js'),
	Tilemap = require('./tilemap.js'),
	cannonballImg = new Image();
	cannonballImg.src = './img/turret/cannonball_small.png',
	explosionImg = new Image(),
	explosionImg.src = './img/turret/explosion_small.png';

	const IDLE = 0,
		  ASCENDING = 1,
		  DESCENDING = 2,
		  EXPLODING = 3;

	const BALL_SIZE = 20,
	      EXPLOSION_SIZE = 64;

	const TILE_WIDTH = 64,
		  TILE_HEIGHT = 64,
		  MAP_SIZE = 1000;

function Cannonball(locationX, locationY, mapLayer, verticalV, horizontalV, gravity, centerOffsetX, centerOffsetY) {
	this.initPosX = locationX + centerOffsetX,
	this.initPosY = locationY + centerOffsetY;
	this.posX = locationX;
	this.posY = locationY;
	this.type = 'cannonball';
	this.state = IDLE;
	this.verticalV = verticalV;
	this.horizontalV = horizontalV;
	this.gravity = gravity;
	this.projectileTime = 0;
	this.projectileTimeExploding = 0;
	this.explosionSound = new Audio('./resources/sounds/explosion.wav');

	// constants
	this.projectileTimeToReachTop = undefined;

	this.animations = [];

	this.animations[IDLE] = new Animation(explosionImg, BALL_SIZE, BALL_SIZE, 0, 0);
	this.animations[ASCENDING] = new Animation(cannonballImg, BALL_SIZE, BALL_SIZE, 0, 0);
	this.animations[DESCENDING] = new Animation(cannonballImg, BALL_SIZE, BALL_SIZE, 0, 0);
	this.animations[EXPLODING] = new Animation(explosionImg, EXPLOSION_SIZE, EXPLOSION_SIZE, 0, 0, 10);

	// get position x of the projectile at a given time after it has been fired
	this.getXAtTime = function() {
		return this.initPosX + this.horizontalV * this.projectileTime;
	}

	// get position y of the projectile at a given time after it has been fired
	this.getYAtTime = function() {
		return this.initPosY + this.verticalV * this.projectileTime + this.gravity * this.projectileTime * this.projectileTime / 2;
	}

	this.reset = function(verticalV, horizontalV) {
		this.posX = this.initPosX;
		this.posY = this.initPosY;
		this.horizontalV = horizontalV;
		this.verticalV = verticalV;
		this.projectileTime = 0;
		this.state = ASCENDING;
		this.projectileTimeToReachTop = -this.verticalV / gravity;
		this.projectileTimeExploding = 0;
	}

	this.checkCollisions = function(tile) {
		if (tile && tile.data.solid) {
			tilemap.destroyTileAt(1, this.getXFromCoords(this.posX), this.getYFromCoords(this.posY), 0);
			this.state = EXPLODING;
			this.offsetExploding();
			this.explosionSound.play();
		}
	}

	this.offsetExploding = function() {
		this.posX -= 20;
		this.posY -= 20;
	}

	this.getXFromCoords = function(x) {
		return (x / TILE_WIDTH) | 0;
	}

	this.getYFromCoords = function(y) {
		return (y / TILE_HEIGHT) | 0;
	}
}

Cannonball.prototype = new Entity();

	Cannonball.prototype.update = function(elapsedTime, tilemap, entityManager)
	{
		if (this.state == ASCENDING || this.state == DESCENDING) {
			if (this.projectileTime > this.projectileTimeToReachTop) {
				this.state = DESCENDING;
			}
			this.animations[this.state].update(elapsedTime);
			this.posX = this.getXAtTime();
			this.posY = this.getYAtTime();
			this.projectileTime += 0.5;
		}

		if (this.state == EXPLODING) {
			this.animations[this.state].update(elapsedTime);
			this.projectileTimeExploding += elapsedTime;
			if (this.projectileTimeExploding > 2) {
				this.state = IDLE;
				//Wyatt Watson - Now removes the explosion left overs
				entityManager.remove(this);
			}
		}

		this.checkCollisions(Tilemap.tileAt(this.getXFromCoords(this.posX), this.getYFromCoords(this.posY), 0));
	}

	Cannonball.prototype.render = function(context, debug)
	{
		this.animations[this.state].render(context, this.posX, this.posY);
		if(debug) renderDebug(this, context);
	}

	Cannonball.prototype.collide = function(otherEntity)
	{
		if (otherEntity.type == 'turret' && this.state == DESCENDING) {
			this.offsetExploding();
			this.state = EXPLODING;
			this.explosionSound.play();
		}
	}

	function renderDebug(cannonball, ctx) {
		var bounds = cannonball.boundingBox();
		var circle = cannonball.boundingCircle();
		ctx.save();

		// Draw player bounding box
		ctx.strokeStyle = "red";
		ctx.beginPath();
		ctx.moveTo(bounds.left, bounds.top);
		ctx.lineTo(bounds.right, bounds.top);
		ctx.lineTo(bounds.right, bounds.bottom);
		ctx.lineTo(bounds.left, bounds.bottom);
		ctx.closePath();
		ctx.stroke();

		ctx.strokeStyle = "blue";
		ctx.beginPath();
		ctx.arc(circle.cx, circle.cy, circle.radius, 0, 2*Math.PI);
		ctx.stroke();

		// Outline tile underfoot
		var tileX = 64 * Math.floor((bounds.left + (BALL_SIZE/2))/64),
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

	Cannonball.prototype.boundingBox = function()
	{
		return {
			left: this.posX,
			top: this.posY,
			right: this.posX + BALL_SIZE,
			bottom: this.posY + BALL_SIZE
		}
	}

	Cannonball.prototype.boundingCircle = function()
	{
		return {
			cx: this.posX + BALL_SIZE / 2,
			cy: this.posY + BALL_SIZE / 2,
			radius: BALL_SIZE * Math.sqrt(2) / 2
		}
	}

return Cannonball;

}())
