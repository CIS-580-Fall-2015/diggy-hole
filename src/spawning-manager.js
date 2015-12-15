module.exports = (function() {
    /* Some hard coded data values for our 8 entities */
	
	var skyEntities = new Array();
	var middleEntities = new Array();
	var deepEntities = new Array();
	
	var birdData = {
		Bird: require('./bird.js'),
		limit: 8,
		count: 0
	};
	
	var turretData = {
		Turret: require('./turret.js'),
		limit: 3,
		count: 0
	};
			
	var barrelData = {
		Barrel: require('./barrel.js'),
		limit: 15,
		count: 0
	};
	
	skyEntities.push(birdData);
	skyEntities.push(turretData);
	skyEntities.push(barrelData);
	
	var demonGHogData = {
		DemonGHog: require('./DemonicGroundH.js'),
		limit: 10,
		count: 0
	};
	
	var goblinMinerData = {
		Miner: require('./goblin-miner.js'),
		limit: 8,
		count: 0
	};
	
	var goblinShamanData = {
		Shaman: require('./goblin-shaman.js'),
		limit: 5,
		count: 0
	};
	
	middleEntities.push(demonGHogData);
	middleEntities.push(goblinMinerData);
	middleEntities.push(goblinShamanData);
	
	var ghostMinerData = {
		Ghost: require('./ghostminer.js'),
		limit: 4,
		count: 0
	};
	
	var dynamiteDwarfData = {
		Dwarf: require('./dynamiteDwarf.js'),
		limit: 2,
		count: 0
	}
	
	deepEntities.push(barrelData);
	deepEntities.push(ghostMinerData);
	deepEntities.push(dynamiteDwarfData);

    function SpawningManager(entityManager, scoreEngine, player) {
        this.entityManager = entityManager;
        this.scoreEngine = scoreEngine;
        this.player = player;
        this.updateTimeLeft = 0;
    }
	
	var updatePeriodSeconds = 5;

    SpawningManager.prototype.update = function (elapsedTime) {
        this.updateTimeLeft -= elapsedTime;
        if(this.updateTimeLeft < 0) {
            this.updateTimeLeft = updatePeriodSeconds;

			this.entityManager.add(
				new birdData.Bird(
					Math.random()*64*15 + this.player.currentX, 
					Math.random()*64*15 + this.player.currentY, 
					0)
				);
			this.entityManager.add(
				new turretData.Turret(
					Math.random()*64*15 + this.player.currentX, 
					Math.random()*64*15 + this.player.currentY, 
					0)
			);
			this.entityManager.add(
				new barrelData.Barrel(
					Math.random()*64*15 + this.player.currentX, 
					Math.random()*64*15 + this.player.currentY, 
					0)
			);
			this.entityManager.add(
				new demonGHogData.DemonGHog(
					Math.random()*64*15 + this.player.currentX, 
					Math.random()*64*15 + this.player.currentY, 
					0)
			);
			this.entityManager.add(
				new goblinMinerData.Miner(
					Math.random()*64*15 + this.player.currentX, 
					Math.random()*64*15 + this.player.currentY, 
					0)
			);
			this.entityManager.add(
				new goblinShamanData.Shaman(
					Math.random()*64*15 + this.player.currentX, 
					Math.random()*64*15 + this.player.currentY, 
					0)
			);
			this.entityManager.add(
				new ghostMinerData.Ghost(
					Math.random()*64*15 + this.player.currentX, 
					Math.random()*64*15 + this.player.currentY, 
					0)
			);
			this.entityManager.add(
				new dynamiteDwarfData.Dwarf(
					Math.random()*64*15 + this.player.currentX, 
					Math.random()*64*15 + this.player.currentY, 
					0)
			);
        }
		
		/* Can change frequency of chance to spawn
			based on score values or something.
			Higher score means shorter spawn time.
			
			Or change limits for spawns based on
			score values. Higher score means
			higher limits. */
		
		/* Some Sudo code of current spawn ideas
		count;
		rand x,y;
		while(solid && count < 100){
			rand x,y;
			count++;
		}
		if(type is sky)
			rand num;
			if(skyStuff[num].limit < skyStuff[num].count)
				spawn skyStuff[num];
		else if(type is middle)
			rand num;
			if(middleStuff[num].limit < middleStuff[num].count)
				spawn middleStuff[num];
		else if(type is bottom)
			rand num;
			if(bottomStuff[num].limit < middleStuff[num].count)
				spawn bottomStuff[num];
		*/
    };

    return SpawningManager;
})();
