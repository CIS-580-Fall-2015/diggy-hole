module.exports = (function(){
	
	const IMG_SIZE = 64;
	
	function InventorySlot(imgSrc) {
		this.amount = 0;
		this.img = new Image();
		this.img.src = imgSrc;
		
		/**
			Returns true if power up in the inventory otherwise false
		*/
		this.slotUsed = function() {
			if (this.amount > 0) {
				this.amount--;
				console.log("Used slot");
				return true;
			}
			console.log("Not enough in slot");
			return false;
		};
		
		this.pickedUp = function() {
			this.amount ++;
		};
		
		this.render = function(screenCtx, x, y) {
			if (this.img.complete == false)
				return;
			if (this.amount > 0)
				screenCtx.drawImage(this.img, 0, 0, IMG_SIZE, IMG_SIZE, x, y, IMG_SIZE, IMG_SIZE);
		};
	}


return InventorySlot;
}());



