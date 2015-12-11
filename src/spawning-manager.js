module.exports = (function() {
    var Shaman = require('./goblin-shaman.js');
    var DemonGHog = require('./DemonicGroundH.js');
    var Barrel = require('./barrel.js');
    var Miner = require('./goblin-miner.js');
    var Turret = require('./turret.js');
    var StoneMonster = require('./stone-monster.js');

    var updatePeriodSeconds = 50;

    function SpawningManager(entityManager, scoreEngine, player) {
        this.entityManager = entityManager;
        this.scoreEngine = scoreEngine;
        this.player = player;
        this.updateTimeLeft = 0;
    }

    SpawningManager.prototype.update = function (elapsedTime) {
        this.updateTimeLeft -= elapsedTime;
        if(this.updateTimeLeft < 0) {
            this.updateTimeLeft = updatePeriodSeconds;

            //TODO implement this, so that enemies spawn in waves, etc
            this.entityManager.add(new Shaman(Math.random()*64*15 + this.player.currentX, Math.random()*64*15 + this.player.currentY, 0));
        
            this.entityManager.add(new Turret(Math.random()*64*15 + this.player.currentX, Math.random()*64*15 + this.player.currentY, 0));
            this.entityManager.add(new Miner(Math.random()*64*15 + this.player.currentX, Math.random()*64*15 + this.player.currentY, 0));
            this.entityManager.add(new DemonGHog(Math.random()*64*15 + this.player.currentX, Math.random()*64*15 + this.player.currentY, 0));
            this.entityManager.add(new Barrel(Math.random()*64*15 + this.player.currentX, Math.random()*64*15 + this.player.currentY, 0));
            this.addStoneMonster();
        }
    };

    SpawningManager.prototype.addStoneMonster = function() {
        var xPosition = Math.random()*15*64;
        var yPosition = (Math.random()*10+5)*64;

        this.entityManager.add(new StoneMonster(this.player.currentX + xPosition, this.player.currentY + yPosition, 0));
        this.entityManager.add(new StoneMonster(this.player.currentX - xPosition, this.player.currentY + yPosition, 0));
    };

    return SpawningManager;
})();
