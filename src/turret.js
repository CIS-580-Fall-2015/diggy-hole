module.exports = (function(){
	var Animation = require('./animation.js'),
		Player = require('./player.js'),
		Entity = require('./entity.js'),
		Cannonball = require('./cannonball.js'),
		turret = new Image();
		turret.src = './img/turret/turretMany.png';
		destroyedTurret = new Image();
		destroyedTurret.src = './img/turret/turretDestroyed2.png';

	const IDLE = 0,
		  FIRING = 1,
		  WAITING = 2,
		  RELOADING = 3,
		  DESTROYED = 4;

	const 	turretWidth = 88,
			turretHeight = 86;
			turretImgCount = 48,
			turretVertical = 25,
			turretDestroyedWidth = 88,
			turretDestroyedHeight = 169,
			// where to target from
			centerOffsetX = 47,
			centerOffsetY = 45,
			// where to aim
			playerOffsetX = 64/2,
			playerOffsetY = playerOffsetX;

	const   cannonballNum = 3,
			reloadTime = 5,
			shootingDelay = 0.5,
			optimizationDelay = 0.00;

	function Turret(locationX, locationY, mapLayer){
		// computational constants
		this.posX = locationX,
		this.posY = locationY,
		this.type = 'turret',
		this.launchSpeed = 20,
		this.gravity = 0.5,
		this.angle = 91,
		this.launchSpeedPow2 = this.launchSpeed * this.launchSpeed,
		this.launchSpeedPow4 = this.launchSpeedPow2 * this.launchSpeedPow2,
		this.gravityPow2 = this.gravity * this.gravity,
		this.gravityTimesLSPow2 = this.gravity * this.launchSpeedPow2,
		this.LSPow2TimesTwoTimesG = 2 * this.launchSpeedPow2 * this.gravity,

		this.player = null;
		this.state = IDLE;
		this.targeting = false;
		this.falling = false;
		this.fallingVelocity = 0;
		this.time = 0;
		this.optimizationTimer = 0;
		// variables fro animations, turret animations, index of animation to render, coordinates of lines that approximate targetting parabola
		this.animations = [],
		this.layerIndex = 0,
		this.destroyedAnimation = undefined;
		this.renderIdx = 0;
		this.parabolaSeries = [];
		// highlight for laser
		this.highlight = new Array(Math.round(Math.random()*255), Math.round(Math.random()*255), Math.round(Math.random()*255));

		this.cannonballs = [],
		this.cnbsFired = 0;
		this.shotSound = [];
		this.firstUpdate = false;

		this.spawnCannonballs = function(entityManager) {
			for (var i = 0; i < cannonballNum; i ++) {
				this.cannonballs[i] = new Cannonball(this.posX, this.posY, 0, 0, 0, this.gravity, centerOffsetX, centerOffsetY);
				entityManager.add(this.cannonballs[i]);
				this.shotSound[i] = new Audio('./resources/sounds/shot.wav');
			}
		}

		// Loads animations to animations array
		this.loadAnimations = function () {
			for (var i = 0; i < turretImgCount; i ++) {
				this.animations[i] = new Animation(turret, turretWidth, turretHeight, i * turretWidth, 0);
			}
			this.destroyedAnimation = new Animation(destroyedTurret, turretWidth, turretHeight, 0, 0, 10);
		}

		// is called to aim the turret in a right angle
		this.setAngleOfAnimation = function(angle) {
			if (angle < 0) {
				var angleToFrames = Math.round((angle * 180 / Math.PI + 90) / 5);
				this.renderIdx = turretVertical - angleToFrames;
			} else {
				var angleToFrames = Math.round((angle * 180 / Math.PI - 90) / 5);
				this.renderIdx = turretVertical - angleToFrames;
			}
		}

		// compute angle that is necessary for the turret to hit our target
		this.getAngle = function (targetX, targetY) {
			var position = this.getDistance(targetX, targetY);

			var rightPart =  Math.sqrt(this.launchSpeedPow4 - (this.gravityPow2 * position[0] * position[0] + this.LSPow2TimesTwoTimesG * position[1]));
			var res1 = Math.atan((this.launchSpeedPow2 + rightPart) / (this.gravity * position[0])) /** (180 / 3.14159265)*/;
			var res2 = Math.atan((this.launchSpeedPow2 - rightPart) / (this.gravity * position[0])) /** (180 / 3.14159265)*/;
			// console.log(this.getVerticalVel());
			// console.log(this.getHorizontalVel());
			return res1;
		}

		// get distance of the target relative to the turret which is at (0, 0)
		this.getDistance = function (targetX, targetY) {
			x = (targetX + playerOffsetX) - (this.posX + centerOffsetX);
			y = (this.posY + centerOffsetY) - (targetY + playerOffsetY);
			return [x, y];
		}

		// computes initial vertical velocity of the projectile
		this.getVerticalVel = function () {
			return -this.launchSpeed * Math.sin(Math.abs(this.angle) /** (3.14159265/180)*/);
		}

		// computes horizontal velocity of the projectile
		this.getHorizontalVel = function () {
			if (this.angle > 0)
				return this.launchSpeed * Math.cos(this.angle /** (3.14159265/180)*/);
			else
				return -this.launchSpeed * Math.cos(this.angle/* * (3.14159265/180)*/);
		}

		// computes the time necessary for the projectile to reach the target
		this.getTimeToReach = function(elevationDifference) {
			var verticalVel = Math.abs(this.getVerticalVel());
			var left = verticalVel / this.gravity;
			var right = Math.sqrt(verticalVel * verticalVel / this.gravityPow2 - elevationDifference * 2 / this.gravity);
			var x1 = left - right;
			var x2 = left + right;
			return [x1, x2];
		}

		// is called when the target gets in the turret's query range
		this.targetInRange = function(entitie) {
			if (this.optimizationTimer < optimizationDelay) {
				console.log("skipped");
				return;
			}
			else
				this.optimizationTimer = 0;
			this.buildParabola(entitie);
			this.setAngleOfAnimation(this.angle);
		}

		// get position x of the projectile at a given time after it has been fired
		this.getXAtTime = function(time) {
			return this.getHorizontalVel() * time;
		}

		// get position y of the projectile at a given time after it has been fired
		this.getYAtTime = function(time) {
			return this.getVerticalVel() * time + this.gravity * time * time / 2;
		}

		// constructs the parabolaSeries array that is used to approximate a parabola by drawing lines
		this.buildParabola = function(entitie) {
			this.parabolaSeries = [];
			var ttr = this.getTimeToReach((this.posY + centerOffsetY) - entitie.currentY);
			// console.log(ttr);
			var numOfLines = ttr[1];
			var intervals = ttr[1] / numOfLines;
			for (var i = 0; i < numOfLines; i ++) {
				this.parabolaSeries[i] = { x: this.getXAtTime(intervals * i) + (this.posX + centerOffsetX), y : this.getYAtTime(intervals * i) + (this.posY + centerOffsetY)};
			}
		}

		// draws parabola looking like a laser
		this.drawParabolaSeries = function(context) {
			context.fillStyle = 'red';
			context.lineWidth = 5;
			context.strokeStyle = 'red';

			for (var j = 5; j >= 0; j --) {
				context.beginPath();
				context.lineWidth = (j+1)*4-2;
				if	(j == 0)
					context.strokeStyle = '#fff';
				else
				{
					context.strokeStyle = 'rgba('+this.highlight[0]+','+this.highlight[1]+','+this.highlight[2]+',0.2)';
				}
				const parabolaOffset = 3;
				context.moveTo(this.parabolaSeries[0+parabolaOffset].x, this.parabolaSeries[0+parabolaOffset].y)
				for (var i = 1 + parabolaOffset; i < this.parabolaSeries.length; i ++) {
					context.lineTo(this.parabolaSeries[i].x, this.parabolaSeries[i].y);
				}
				context.stroke();
				}
		}

		this.loadAnimations();

	}

	Turret.prototype = new Entity();

	Turret.prototype.update = function(elapsedTime, tilemap, entityManager)
	{
		if(!this.firstUpdate) {
			this.spawnCannonballs(entityManager);
			this.firstUpdate = true;
		}

		this.optimizationTimer += elapsedTime;

		if (this.onGround(tilemap) == false) {
			this.falling = true;
			this.fallingVelocity += elapsedTime * this.gravity * 12;
			this.posY += this.fallingVelocity;
			for (var i = 0; i < this.cannonballs.length; i ++) {
				this.cannonballs[i].initPosY = this.posY;
			}
		} else {
			this.falling = false;
			this.fallingVelocity = 0;
		}

		if (this.state == IDLE) {
			// console.log("IDLE");
			this.playerInRange = false;
			var entitiesInRange = entityManager.queryRadius(this.posX, this.posY, 1500);
			if (entitiesInRange.length > 0) {
				for (var i = 0; i < entitiesInRange.length; i ++) {
					if (entitiesInRange[i].type == 'player') {
						// this.state = FIRING;
						this.player = entitiesInRange[i];
						this.playerInRange = true;
						this.targeting = true;
						playerIndex = i;
						break;
					}
				}
			}
			if (this.playerInRange == false) {
				// console.log("No player in range");
				this.targeting = false;
				this.parabolaSeries = [];
				this.player = null;
			}
		}

		if (this.targeting == true) {
			// entitiesInRange = entityManager.queryRadius(this.posX, this.posY, 1500);
			var angle = this.getAngle(this.player.currentX, this.player.currentY);
				if (isNaN(angle) == false) {
					this.angle = angle;
					this.targetInRange(this.player);
					if (this.state == IDLE) {
						this.state = FIRING;
					}
				} else {
					this.parabolaSeries = [];
				}
		} else {
			this.parabolaSeries = [];
		}

		if (this.state == FIRING) {
			this.time = 0;
			// this.shoot(this.getVerticalVel(), this.getHorizontalVel());
			if (this.cnbsFired == cannonballNum) {
				this.state = RELOADING;
				this.targeting = false;
			} else {
				this.cannonballs[this.cnbsFired].reset(this.getVerticalVel(), this.getHorizontalVel());
				this.shotSound[this.cnbsFired].play();
				this.cnbsFired++;
				this.state = WAITING;
			}
		}

		if (this.state == WAITING) {
			this.time += elapsedTime;
			if (this.time > shootingDelay) {
				this.time = 0;
				this.state = IDLE;
			}
		}

		if (this.state == RELOADING) {
			this.time += elapsedTime;
			if (this.time > reloadTime) {
				this.time = 0;
				this.state = IDLE;
				this.cnbsFired = 0;
			}
		}

		if (this.state == DESTROYED) {
			this.destroyedAnimation.update(elapsedTime);
			// Wyatt Watson - Now remove entity after it's destroyed
			this.time += elapsedTime;
			if (this.time > reloadTime) {
				entityManager.remove(this);
			}
		}
	}

	Turret.prototype.render = function(context, debug)
	{
		if (this.state != DESTROYED) {
			this.animations[this.renderIdx].render(context, this.posX, this.posY);
			if (this.parabolaSeries.length > 0)
				this.drawParabolaSeries(context);
		}
		else {
			this.destroyedAnimation.render(context, this.posX, this.posY);
		}


		if(debug) renderDebug(this, context);
	}

	Turret.prototype.onGround = function(tilemap) {
		var box = this.boundingBox(),
        tileX = Math.floor((box.left + (turretWidth/2))/64),
        tileY = Math.floor(box.bottom / 64),
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    // find the tile we are standing on.
		return (tile && tile.data.solid) ? true : false;
	}

	function renderDebug(turret, ctx) {
		var bounds = turret.boundingBox();
		var circle = turret.boundingCircle();
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
		var tileX = 64 * Math.floor((bounds.left + (turretWidth/2))/64),
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

	Turret.prototype.collide = function(otherEntity)
	{
		if (otherEntity.type == 'cannonball' && (otherEntity.state == 3 /*Cannonball.EXPLODING*/)) {
			this.state = DESTROYED;
			this.targeting = false;
			for (var i = 0; i < this.cannonballs.length; i ++) {
				entityManager.remove(this.cannonballs[i]);
			}
		}
	}

	Turret.prototype.boundingBox = function()
	{
		return {
			left: this.posX + 30,
			top: this.posY,
			right: this.posX + turretWidth - 30,
			bottom: this.posY + turretHeight
		}
	}

	Turret.prototype.boundingCircle = function()
	{
		return {
			cx: this.posX + 44,
			cy: this.posY + 43 + 10,
			radius: 45 - 15
		}
	}

	return Turret;
}())
