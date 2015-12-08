module.exports = (function(){
	
	var HUDelements = [];
	
	function HUD(screenWidth, screenHeight) {
		// Are these necessary?
		this.screeWidth = screenWidth;
		this.screenHeight = screenHeight;
		
		
		
		
		this.addElement = function(newElement) {
			HUDelements.push(newElement);
		}
		
		this.update = function(bounds) {
			for (var i = 0; i < HUDelements.length; i ++) {
				if (HUDelements[i])
					HUDelements[i].update(bounds.left, bounds.top, this.screeWidth, this.screenHeight);
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
