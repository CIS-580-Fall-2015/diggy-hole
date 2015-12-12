module.exports = (function(){
	
	const	slotSize = 50,
			lineWidth = 5;
	
	function Inventory(slotNum, inputManager) {
		this.x;
		this.y;
		this.slotNum = slotNum;
		this.inputManager = inputManager;
		this.elements = new Array(slotNum);
		this.inventoryLength = slotNum * slotSize;
		
		
		this.update = function(x, y, screenWidth, screenHeight) {
			this.x = x + screenWidth - this.inventoryLength - lineWidth;
			this.y = y + screenHeight - slotSize;
			
			if (this.inputManager.wasKeyReleased(this.inputManager.commands.ONE)) {
				console.log("One has been pressed");
			}
			
		};
	
		this.render = function(screenCtx) {
			screenCtx.strokeStyle = 'black';
			screenCtx.lineWidth = lineWidth;
			for (var i = 0; i < this.slotNum; i ++) {
				screenCtx.rect(this.x + i * slotSize, this.y, slotSize, slotSize);
			}
			screenCtx.stroke();
		};
	};

return Inventory;
}());