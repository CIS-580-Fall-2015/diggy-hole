module.exports = (function(){

	function HealthBar(stateManager) {
		const 	hbYOffset = 50,
			hbWidth = 200,
			hbHeight = 30,
			lineCount = Math.round(hbWidth / 40),
			lineOffset = Math.round(hbWidth / 100),
			alpha = 1/lineCount,
			hbXOffset = Math.round(hbWidth / 25),
			hbFrameWidthOffset = 5,
			hbFrameYOffset = hbYOffset - ((lineCount+1)*4-lineOffset)/2 - hbFrameWidthOffset;


		this.x;
		this.y;
		this.health = 100;
		this.deficit = 0;
		this.gameOver = require('./gameOver.js');
		this.stateManager = stateManager;


		this.heal = function(health) {
			this.health = Math.min(this.health + health, 100)
		};

		/**
		 returns true if the player is alive
		 returns false if the player is dead
		 */
		this.hurt = function(health) {
			this.health = Math.max(this.health - health, 0);
			var sm = this.stateManager;
			var go = this.gameOver;
			if (this.health == 0) {
				setInterval(function(){
					sm.pushState(go);
				}, 3000);
				return false;
			}
			return true;
		};

		/**
		 screenCtx: 		canvas
		 x:				top left corner x of the player
		 y:				top left corner y of the player
		 screenWidth:	screen width
		 screenHeight:	screen height
		 */
		this.update = function(x, y, screenWidth, screenHeight) {
			// console.log("x: " + x + " y: " + y);
			this.x = x;
			this.y = y;
			this.deficit = (1 - this.health / 100) * (hbWidth - 2 * hbXOffset);
		};


		/**
		 screenCtx: 		canvas
		 */
		this.render = function(screenCtx) {

			screenCtx.strokeStyle = 'black';
			// screenCtx.fillStyle = 'black';
			screenCtx.lineWidth = 5;
			screenCtx.rect(this.x, this.y + hbFrameYOffset, hbWidth,
				(lineCount+1)*4-lineOffset + hbFrameWidthOffset*2);
			screenCtx.stroke();

			for (var j = lineCount; j >= 0; j --) {
				screenCtx.lineWidth = (j+1)*4-lineOffset;
				if	(j == 0)
					screenCtx.strokeStyle = 'yellow';
				else
					screenCtx.strokeStyle = 'rgba(255,0,0,'+alpha+')';
				screenCtx.beginPath();
				screenCtx.moveTo(this.x + hbXOffset, this.y + hbYOffset);
				screenCtx.lineTo(this.x + hbWidth - hbXOffset - this.deficit, this.y + hbYOffset);
				screenCtx.closePath();
				screenCtx.stroke();
			}
		}
	}

	return HealthBar;
}());