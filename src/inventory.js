module.exports = (function(){
	
	var InventorySlot = require('./inventorySlot.js');
	
	const	slotSize = 64,
			lineWidth = 5;
	
	/**
	This class manages player's inventory.
	All actions from input manager are handled
	from the player class - section commented as
	Power Up Usage Management
	
	slotNum		- number of slots in the inventory
	*/
	function Inventory(slotNum) {
		this.x;
		this.y;
		this.slotNum = slotNum;
		this.slots = new Array(slotNum);
		this.inventoryLength = slotNum * slotSize;
		
		
		//Init Power Ups
			// Hardcoded to 3
			// Change parameter in inventory constructor in game.js
		for (var i = 0; i < slotNum; i ++) {
			if (i == 0) {
				this.slots[0] = new InventorySlot('./img/powerUps/medicine.png');
			} else if (i == 1) {
				this.slots[1] = new InventorySlot('./img/powerUps/pick.png');
			} else if (i == 2) {
				this.slots[2] = new InventorySlot('./img/powerUps/stone_shield.png');
			} else if (i == 3) {
				// this.slots[3] = new InventorySlot('');
			} else if (i == 4) {
				// this.slots[4] = new InventorySlot('');
			}
		};
		
		this.slotUsed = function(idx) {
			return this.slots[idx].slotUsed();
		};
		
		this.powerUpPickedUp = function(idx) {
			this.slots[idx].pickedUp();
		}
		
		this.update = function(x, y, screenWidth, screenHeight) {
			this.x = x + screenWidth - this.inventoryLength - lineWidth;
			this.y = y + screenHeight - slotSize;
		};
	
		this.render = function(screenCtx) {
			screenCtx.strokeStyle = 'black';
			screenCtx.lineWidth = lineWidth;
			for (var i = 0; i < this.slotNum; i ++) {
				screenCtx.rect(this.x + i * slotSize, this.y, slotSize, slotSize);
				this.slots[i].render(screenCtx, this.x + i * slotSize, this.y);
			}
			screenCtx.stroke();
		};
	};

return Inventory;
}());