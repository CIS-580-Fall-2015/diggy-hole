module.exports = (function(){
	
	var HUDelements = [];
	
	function HUD(screenWidth, screenHeight) {
		// Are these necessary?
		this.screenWidth = screenWidth;
		this.screenHeight = screenHeight;
		
		
		
		
		this.addElement = function(newElement) {
			HUDelements.push(newElement);
		}
		
		this.update = function(bounds) {
			var topLeftY = bounds.top - this.screenHeight / 2;
			var topLeftX = bounds.left - this.screenWidth / 2;
			for (var i = 0; i < HUDelements.length; i ++) {
				if (HUDelements[i])
					HUDelements[i].update(topLeftX, topLeftY, this.screenWidth, this.screenHeight);
			}
		}
		
		this.render = function(screenCtx) {
			
			
			for (var i = 0; i < HUDelements.length; i ++) {
				if (HUDelements[i])
					HUDelements[i].render(screenCtx);
			}
		}
	}

	return 	HUD

}());
