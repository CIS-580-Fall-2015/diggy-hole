 module.exports = (function(){
	 
	 function HealthBar() {
		 
		 
		 /**
			screenCtx: 		canvas
			x:				top left corner x
			y:				top left corner y
			screenWidth:	screen width
			screenHeight:	screen height
		 */
		 this.render = function(screenCtx, x, y, screenWidth, screenHeight) {
			 
			 screenCtx.beginPath();
			 screenCtx.lineWidth="60";
			 screenCtx.strokeStyle="red";
			 screenCtx.rect(x, y, 290, 140); 
			 screenCtx.stroke();
		 }
	 }
	 
	 
	 
	 return HealthBar
}());