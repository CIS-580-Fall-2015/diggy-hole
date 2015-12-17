module.exports = (function(){
	
	var SIZE = 50;
	
	function Minimap(screenWidth, screenHeight, player) {
		this.x;
		this.y;
		this.contents;
		this.player = player;
		this.screenWidth = screenWidth;
		this.screenHeight = screenHeight;
	}
	
	Minimap.prototype.update = function(elapsedTime, tilemap, bounds) {
		this.x = bounds.left - this.screenWidth / 2;
		this.y = bounds.top - this.screenHeight / 2 + this.screenHeight-SIZE*5;
		
		var posX = Math.floor(this.player.x/64);
		var posY = Math.floor(this.player.y/64);
		
		var startX = Math.floor(this.player.x/64) - SIZE/2;
		var endX = Math.floor(this.player.x/64) + SIZE/2;
		var startY = Math.floor(this.player.y/64) - SIZE/2;
		var endY = Math.floor(this.player.y/64) + SIZE/2;
		this.contents = new Array();
		for(var j = startY; j < endY; j++){
			for(var i = startX; i < endX; i++){
				this.contents.push(tilemap.tileAt(i,j,0));
			}
		}
	};
	
	Minimap.prototype.render = function(screenCtx) {
		screenCtx.fillStyle = 'black';
		screenCtx.fillRect(this.x, this.y, SIZE*5, SIZE*5);
		for(var l = 0; l < SIZE; l++){
			for(var m = 0; m < SIZE; m++){
				var tile = this.contents[l*SIZE + m];
				if(tile){
					var temp = tile.data.type;
					if(temp == "DirtWithGrass" || temp == "Sky Earth" || temp == "Dirt"){
						screenCtx.fillStyle = 'coral';
					}
					else if(temp == "StoneWithGrass" || temp == "Stone"){
						screenCtx.fillStyle = 'grey';
					}
					else if(temp == "Water"){
						screenCtx.fillStyle = 'blue';
					}
					else if(temp == "SkyBackground" || temp == "Clouds"){
						screenCtx.fillStyle = 'aliceblue';
					}
					else if(temp == "Gems" || temp == "GemsWithGrass"){
						screenCtx.fillStyle = 'chartreuse';
					}
					else if(temp == "CaveBackground"){
						screenCtx.fillStyle = 'brown';
					}
					else if(temp == "Lava"){
						screenCtx.fillStyle = 'red';
					}
					else if(temp == "DarkBackground"){
						screenCtx.fillStyle = 'black';
					}
					screenCtx.fillRect(this.x+m*5, this.y+l*5, 5, 5);
				}
			}
		}
		screenCtx.fillStyle = 'green';
		screenCtx.fillRect(this.x+(SIZE*5/2), this.y+(SIZE*5/2), 5,5);
	};
	
	return Minimap;
	
})();
