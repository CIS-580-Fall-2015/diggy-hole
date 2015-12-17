module.exports = (function() {
    /* Some hard coded data values for our 8 entities */
	
	var skyEntities = new Array();
	var middleEntities = new Array();
	var deepEntities = new Array();
	var powerUps = new Array();
	
	var birdData = {
		Entity: require('./bird.js'),
		type: 'bird',
		limit: 8,
		count: 0
	};
	
	var turretData = {
		Entity: require('./turret.js'),
		type: 'turret',
		limit: 3,
		count: 0
	};
			
	var barrelData = {
		Entity: require('./barrel.js'),
		type: 'Barrel',
		limit: 15,
		count: 0
	};
	
	skyEntities.push(birdData);
	skyEntities.push(turretData);
	skyEntities.push(barrelData);
	
	var demonGHogData = {
		Entity: require('./DemonicGroundH.js'),
		type: 'DemonicGroundHog',
		limit: 10,
		count: 0
	};
	
	var goblinMinerData = {
		Entity: require('./goblin-miner.js'),
		type: 'goblinMiner',
		limit: 8,
		count: 0
	};
	
	var goblinShamanData = {
		Entity: require('./goblin-shaman.js'),
		type: 'shaman',
		limit: 5,
		count: 0
	};
	
	middleEntities.push(demonGHogData);
	middleEntities.push(goblinMinerData);
	middleEntities.push(goblinShamanData);
	
	var ghostMinerData = {
		Entity: require('./ghostminer.js'),
		type: 'ghost',
		limit: 4,
		count: 0
	};
	
	var dynamiteDwarfData = {
		Entity: require('./dynamiteDwarf.js'),
		type: 'dynamiteDwarf',
		limit: 2,
		count: 0
	}
	
	deepEntities.push(barrelData);
	deepEntities.push(ghostMinerData);
	deepEntities.push(dynamiteDwarfData);

	var pick = { 
	 Entity: require('./powerUp.js'),
	 limit: 2,
	 count: 0,
	 name: 'pick',
	 width: 64,
	 height: 64,
	 frameNum: 2,
	 img: './img/powerUps/pick.png',
	 flying: false,
	 duration: 3600
	}
	
	var medicine = { 
	 Entity: require('./powerUp.js'),
	 limit: 2,
	 count: 0,
	 name: 'medicine',
	 width: 64,
	 height: 64,
	 frameNum: 1,
	 img: './img/powerUps/medicine.png',
	 flying: false,
	 duration: -1
	}
	
	var crystal = { 
	 Entity: require('./powerUp.js'),
	 limit: 2,
	 count: 0,
	 name: 'crystal',
	 width: 32,
	 height: 32,
	 frameNum: 8,
	 img: './img/powerUps/crystal.png',
	 flying: true,
	 duration: -1
	}
	
	var coin = { 
	 Entity: require('./powerUp.js'),
	 limit: 2,
	 count: 0,
	 name: 'coin',
	 width: 44,
	 height: 40,
	 frameNum: 10,
	 img: './img/powerUps/coin.png',
	 flying: true,
	 duration: -1
	}
	
	var stoneShield = { 
	 Entity: require('./powerUp.js'),
	 limit: 2,
	 count: 0,
	 name: 'coin',
	 width: 64,
	 height: 64,
	 frameNum: 1,
	 img: './img/powerUps/stone_shield.png',
	 flying: false,
	 duration: 3600
	}
	
	powerUps.push(pick);
	powerUps.push(medicine);
	powerUps.push(crystal);
	powerUps.push(coin);
	powerUps.push(stoneShield);
	
    function SpawningManager(entityManager, scoreEngine, player,inputManager) {
        this.entityManager = entityManager;
        this.scoreEngine = scoreEngine;
        this.player = player;
        this.updateTimeLeft = 0;
		this.inputManager = inputManager;
    }
	
	var updatePeriodSeconds = 2;

    SpawningManager.prototype.update = function (elapsedTime, tilemap) {
        this.updateTimeLeft -= elapsedTime;
        if(this.updateTimeLeft < 0) {
            this.updateTimeLeft = updatePeriodSeconds;
			
			/* Can change frequency of chance to spawn
			based on score values or something.
			Higher score means shorter spawn time.
			
			Or change limits for spawns based on
			score values. Higher score means
			higher limits. */
			
			var count = 0;
			var posFound = false;
			var x = 0, y = 0;
			do{
				var positive;
				if(Math.random() > .5) positive = -1;
				else positive = 1;
				x = Math.floor((Math.random()*5*positive + (64*15)*positive + this.player.x)/64);
				y = Math.floor((Math.random()*5*positive + (64*15)*positive + this.player.y)/64);
				
				var tile = tilemap.tileAt(x, y, 0);
				if(!(tile && tile.data.solid)){
					posFound = true;
				}
					
				count++;
			}while(!posFound && count < 10)
		
			if(posFound){
				var tile = tilemap.tileAt(x, y, 0);
				var num = Math.floor(Math.random()*3);
				if( tile && tile.data) {
					if (tile.data.type == "SkyBackground" || tile.data.type == "Clouds") {
						//Update count of that one
						skyEntities[num].count = 0;
						var ents = this.entityManager.queryRadius(this.player.x, this.player.y, 75*64);
						for(var i = 0; i < ents.length; i++){
							if(ents[i].type == skyEntities[num].type){
								skyEntities[num].count++;
							}
						}
						if (skyEntities[num].limit > skyEntities[num].count) {
							this.entityManager.add(
								new skyEntities[num].Entity(x * 64, y * 64, 0, this.inputManager, this.scoreEngine)
							);
							skyEntities[num].count++;
						}
						else
						{
							num = Math.floor(Math.random()*5);
							powerUps[num].count = 0;
							var ents = this.entityManager.queryRadius(this.player.x, this.player.y, 75*64);
							for(var i = 0; i < ents.length; i++){
								if(ents[i].type == powerUps[num].name){
									powerUps[num].count++;
								}
							}
							if(powerUps[num].limit > powerUps[num].count){
								this.entityManager.add(new powerUps[num].Entity(x*64, y*64, 0,powerUps[num].name, powerUps[num].width, powerUps[num].height, powerUps[num].frameNum, powerUps[num].img, powerUps[num].flying, powerUps[num].duration));
								powerUps[num].count++;
							}
						}
					} 
					else if(tile.data.type == "CaveBackground" || tile.data.type == "Water"){
						//Update count of that one
						middleEntities[num].count = 0;
						var ents = this.entityManager.queryRadius(this.player.x, this.player.y, 75*64);
						for(var i = 0; i < ents.length; i++){
							if(ents[i].type == middleEntities[num].type){
								middleEntities[num].count++;
							}
						}
						if(middleEntities[num].limit > middleEntities[num].count){
							this.entityManager.add(
									new middleEntities[num].Entity(x*64, y*64, 0, this.inputManager, this.scoreEngine)
							);
							middleEntities[num].count++;
						}
						else
						{
							num = Math.floor(Math.random()*5);
							powerUps[num].count = 0;
							var ents = this.entityManager.queryRadius(this.player.x, this.player.y, 75*64);
							for(var i = 0; i < ents.length; i++){
								if(ents[i].type == powerUps[num].name){
									powerUps[num].count++;
								}
							}
							if(powerUps[num].limit > powerUps[num].count){
								this.entityManager.add(new powerUps[num].Entity(x*64, y*64, 0,powerUps[num].name, powerUps[num].width, powerUps[num].height, powerUps[num].frameNum, powerUps[num].img, powerUps[num].flying, powerUps[num].duration));
								powerUps[num].count++;
							}		
						}
					}
					else if(tile.data.type == "Lava" || tile.data.type == "DarkBackground" || tile.data.type == "DugBackground"){
						//Update count of that one
						deepEntities[num].count = 0;
						var ents = this.entityManager.queryRadius(this.player.x, this.player.y, 75*64);
						for(var i = 0; i < ents.length; i++){
							if(ents[i].type == deepEntities[num].type){
								deepEntities[num].count++;
							}
						}
						if(deepEntities[num].limit > deepEntities[num].count){
							this.entityManager.add(
									new deepEntities[num].Entity(x*64, y*64, 0, this.inputManager, this.scoreEngine)
							);
							deepEntities[num].count++;

						}
						else
						{
							num = Math.floor(Math.random()*5);
							powerUps[num].count = 0;
							var ents = this.entityManager.queryRadius(this.player.x, this.player.y, 75*64);
							for(var i = 0; i < ents.length; i++){
								if(ents[i].type == powerUps[num].name){
									powerUps[num].count++;
								}
							}
							if(powerUps[num].limit > powerUps[num].count){
								this.entityManager.add(new powerUps[num].Entity(x*64, y*64, 0,powerUps[num].name, powerUps[num].width, powerUps[num].height, powerUps[num].frameNum, powerUps[num].img, powerUps[num].flying, powerUps[num].duration));
								powerUps[num].count++;
							}
							
						}
					}
				}
			}
        }
		

    };

    return SpawningManager;
})();
