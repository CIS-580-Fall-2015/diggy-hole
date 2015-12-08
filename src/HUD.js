module.exports = (function(){
	
	var HUDelements = [];
	
	function HUD(screenWidth, screenHeight) {
		this.screeWidth = screenWidth;
		this.screenHeight = screenHeight;
		
		
		
		
		this.addElement = function(newElement) {
			HUDelements.push(newElement);
		}
		
		this.update = function(newElement) {
			for (var i = 0; i < HUDelements.length; i ++) {
				if (HUDelements[i])
					HUDelements[i].update();
			}
		}
	}

	return 	HUD

}());
