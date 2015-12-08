 module.exports = (function(){
	 
	 function HealthBar() {
		 this.x;
		 this.y;
		 
		 
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
		 }
		 
		 
		 /**
			screenCtx: 		canvas
		 */
		 this.render = function(screenCtx) {
			 screenCtx.beginPath();
			 screenCtx.lineWidth="60";
			 screenCtx.strokeStyle="red";
			 screenCtx.rect(this.x, this.y, 290, 140); 
			 // screenCtx.stroke();
		 }
	 }
	 
	 
	 
	 return HealthBar
}());