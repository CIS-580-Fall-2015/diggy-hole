/* Bird Module
	Authors: Josh Benard
*/
/*
module.exports = (function(){
	var Entity = require('./entity.js');
	var Animation = require('./animation.js');

	//states
	const FLYING = 0;
	const COLLIDED = 1;
	const EXPLODED = 2;

	const SIZE = 64;
	const SPRITE_NUM = 8;

	//how often the bird changes directions
	const RAND_VELOCITY_TIME = 15;
	const MAX_VELOCITY = 20;
	const EXPLOSION_TIME = 25;

	var birdImage = new Image();
	birdImage.src = './img/birdsheet.png';
	var birdExplodeImage = new Image();
	birdExplodeImage.src = './img/explosionBird.png';

	function Bird(x, y) {

		this.type = 'bird';

		this.x = x;
		this.y = y;
		this.velocityTime = 0;
		this.velocityX = 10;
		this.velocityY = 10;
		this.state = FLYING;
	} 

	Bird.prototype = new Entity();

	this.animators = { birdimations: [] }

	//loop this animation
	this.animators.bridimations[FLYING] = new Animation(birdImage, SIZE, SIZE, 0, 0, 8, 1, false);
	this.animators.bridimations[COLLIDED] = new Animation(birdExplodeImage, SIZE, SIZE, 0, 0, 8, 1, true);

	Bird.prototype.update = function(elapsedTime, tilemap, entityManager){
		this.velocityTime += elapsedTime;

		switch(this.state) {
			case FLYING:
				this.animators.birdimations[this.state].update(elapsedTime, tilemap);
				this.x += this.velocityX;
				this.y += this.velocityY;

				//after a specified period, randomize bird velocity
				if(this.velocityTime >= RAND_VELOCITY_TIME) {
					this.velocityTime = 0;

					//randomly assign the velocity values
					this.velocityX =  Math.random() * MAX_VELOCITY;
					this.velocityY = Math.random() * MAX_VELOCITY;

					//randomly flip direction of veloicty
					if((Math.random() * 10) > 5)
						this.velocityX *= -1;
					if((Math.random() * 10) > 5)
						this.velocityY *= -1;
				}
				break;
			case COLLIDED:
				this.animators.birdimations[this.state].update(elapsedTime, tilemap);
				if(this.velocityTime >= EXPLOSION_TIME)
					this.state = EXPLODED;
				break;
			default:
				break;
		}
	}

	Bird.prototype.render = function(context, debug){
		switch(this.state) {
			case FLYING:
				this.animators.birdimations[this.state].render(context, this.x - (SIZE / 2), this.y - (SIZE / 2));
				break;
			case COLLIDED:
				this.animators.bridimations[this.state].render(context, this.x - (SIZE / 2), this.y - (SIZE / 2));
				break;
			default:
				//dont draw anything if in a done state
				break;
		}

		if(debug) {
			if(this.state != EXPLODED) {
				///draw a box around the bird if it hasnt exploded
				var boundary = Bird.boundingBox();
				context.save();

				context.strokeStyle = "red";
				context.beginPath();
				context.moveTo(boundary.left, boundary.top);
				context.lineTo(boundary.right, boundary.top);
				context.lineTo(boundary.right, boundary.bottom);
				context.lineTo(boundary.left, boundary.bottom);
				context.closePath();
				context.stroke();

				context.restore();
			}
		}
	}

	Bird.prototype.collide = function(otherEntity){

		if(otherEntity instanceof Player){
			this.state = COLLIDED;
			this.velocityTime = 0;
		}

	}

	Bird.prototype.boundingBox = function(){
		var halfSize = SIZE /2;

		return {
			left: this.x - halfSize;
			right: this.x + halfSize;
			top: this.y - halfSize;
			bottom: this.y + halfSize;
		}
	}

	Bird.prototype.boundingCircle = function(){
		return {
			cx: this.x;
			cy: this.y;
			radius: SIZE / 2;
		}
	}


	return Bird;

}());