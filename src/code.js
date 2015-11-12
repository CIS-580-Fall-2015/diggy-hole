module.exports = (function()
{
	
var Entity = require('./entity.js');
var Animation = require('./animation.js');
var entityManager = require('./entity-manager.js');

this.animations.right[STANDING]

function Pixie(xpos, ypos)
{
var state, x, y, cooldown, spritetimer, ssx, ssy, image;
this.state = "chained";
this.cooldown = 0;
this.spritetimer = 0;
this.ssx = 1;
this.ssy = 5;
this.image = new Image();
this.image.src = "spritesheettransp.png";
this.x = xpos;
this.y = ypos;
}

Pixie.prototype.boundingBox = function boundingBox()
{
	return {
		left: this.x,
		right: this.x + 64,
		top: this.y,
		bottom: this.y + 64
	};
}
Pixie.prototype.boundingCircle = function boundingCircle()
{
	return {
		cx: this.x + 32,
		cy: this.y + 32,
		radius: 32
	};
}
Pixie.prototype.collide = function collide(otherEntity)
{
	return ((otherEntity.x < this.boundingBox().right) && (otherEntity.x > this.boundingBox().left) && (otherEntity.y > this.boundingBox().top) && (otherEntity.y < this.boundingBox().bottom));
}
Pixie.prototype.update = function update(elapsedTime, tilemap, entityManager)
{
	var player = entityManager.getEntity(0);
	var playerx = player.currentX;
	var playery = player.currentY;
	this.spritetimer += elapsedTime;
	if (this.cooldown > 0)
	{
		this.cooldown -= elapsedTime;
	}
	switch(this.state)
	{
		case "chained":
			if (this.collide(player))
			this.spritetimer = 0;
			this.ssx = 2;
			this.ssy = 5;
			this.state = "free";
			break;
		case "free":
			if (this.spritetimer >= 1000)
			{
				if (Math.pow(playerx - this.x, 2) + Math.pow(playery - this.y, 2) > 8192)
				{
					this.state = "follow";
					this.ssy = 4;
					this.ssx = 1
					this.spritetimer = 0;
				}
				else
				{
					this.state = "idle";
					this.ssy = 1;
					this.ssx = 1;
					this.spritetimer = 0;
				}
			}
			else if (this.spritetimer >= 500)
			{
				this.ssx = 3
			}
			break;
		case "idle":
			/*
			if ((player.health < player.maxhealth) && (cooldown <= 0)
			{
				this.cooldown = 3000;
				this.spritetimer = 0;
				this.ssx = 1;
				this.ssy = 2;
				this.state = "healing";
			}
			*/
			if (Math.pow(playerx - this.x, 2) + Math.pow(playery - this.y, 2) > 8192)
			{
				this.state = "follow";
				this.ssy = 4;
				this.ssx = 1;
				this.spritetimer = 0;
			}
			else
			{
				if (this.spritetimer = 500)
				{
					this.ssx = 2;
				}
				else if (this.spritetimer = 1000)
				{
					this.ssx = 3;
				}
				else if (this.spritetimer = 1500)
				{
					this.ssx = 2;
				}
				else if (this.spritetimer >= 2000)
				{
					this.spritetimer = 0;
					this.ssx = 1;
				}
			}
			break;
		case "follow":
			if (Math.pow(playerx - this.x, 2) + Math.pow(playery - this.y, 2) > 589824)
			{
				this.ssx = 4;
				this.ssy = 1;
				this.spritetimer = 0;
				this.state = "lost";
			}
			/*
			else if ((player.health < player.maxhealth) && (cooldown <= 0)
			{
				this.cooldown = 3000;
				this.spritetimer = 0;
				this.ssx = 1;
				this.ssy = 2;
				this.state = "healing";
			}
			*/
			else if (Math.pow(playerx - this.x, 2) + Math.pow(playery - this.y, 2) < 8192)
			{
				this.spritetimer = 0;
				this.ssx = 1;
				this.ssy = 1;
				this.state = "idle";
			}
			else
			{
				if (this.spritetimer >= 1000)
				{
					this.ssx = 1;
					this.spritetimer = 0;
				}
				else if (this.spritetimer >= 500)
				{
					this.ssx = 2;
				}
				if (player.x > this.x)
				{
					this.x ++;
				}
				else if (player.x < this.x)
				{
					this.x --;
				}
				if (player.y > this.y)
				{
					this.y ++;
				}
				else if (player.y > this.y)
				{
					this.y --;
				}
			}
		case "lost":
			if (this.spritetimer >=1000)
			{
				this.state = "idle";
				this.ssx = 1;
				this.spritetimer = 0;
			}
			if (this.spritetimer >=750)
			{
				this.ssx = 4;
			}
			if (this.spritetimer >= 500)
			{
				this.x = playerx - 32;
				this.y = playery;
			}
			if (this.spritetimer >= 250)
			{
				this.ssx = 5;
			}
			break;
		/*
		case "healing":
			if (this.spritetimer >= 1500)
			{
				this.spritetimer = 0;
				if (Math.pow(playerx - this.x, 2) + Math.pow(playery - this.y, 2) > 8192)
				{
					this.state = "follow";
					this.ssy = 4;
				}
				else
				{
					this.state = "idle";
					this.ssy = 1;
				}
			}
			else if (this.spritetimer >= 1000)
			{
				this.ssx = 4;
			}
			else if (this.spritetimer >= 750)
			{
				this.ssx = 3;
			}
			else if (this.spritetimer >= 500)
			{
				this.ssx = 2;
				player.health ++;
			}
			else
			{
				this.ssx = 1;
			}
			*/
	}
}
Pixie.prototype.render = function render(context, debug)
{
	context.save();
	if ((entityManager.getEntity(0).currentX > this.x) || (this.state == "chained"))
	{
		this.animations.left[this.state].render(context, this.x, this.y);
	}
	else
	{
		this.animations.right[this.state].render(context, this.x, this.y);
	}
	if (debug)
	{
		context.strokeStyle = "#330077";
		context.moveTo(this.x, this.y);
		context.lineTo(this.x + 64, this.y);
		context.lineTo(this.x + 64, this.y + 64);
		context.lineTo(this.x, this.y + 64);
		context.lineTo(this.x, this.y);
		context.stroke();
	}
}

return Pixie;

})();