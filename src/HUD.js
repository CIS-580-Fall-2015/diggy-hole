module.exports = (function(){
	
	var HUDelements = [];
	
	function HUD(screenCtx, screenWidth, screenHeight) {
		// Are these necessary?
		this.screenCtx = screenCtx;
		this.screeWidth = screenWidth;
		this.screenHeight = screenHeight;
		
		
		
		
		this.addElement = function(newElement) {
			HUDelements.push(newElement);
		}
		
		this.render = function(bounds) {
			
			
			for (var i = 0; i < HUDelements.length; i ++) {
				if (HUDelements[i])
					HUDelements[i].render(this.screenCtx, bounds.top, bounds.left, this.screeWidth, this.screenHeight);
			}
		}
	}

	return 	HUD

}());
