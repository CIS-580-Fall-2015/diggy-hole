module.exports = (function() {
    var Shaman = require('./goblin-shaman.js');
    var DemonGHog = require('./DemonicGroundH.js');
    var Barrel = require('./barrel.js');
    var Miner = require('./goblin-miner.js');
    var Turret = require('./turret.js');

    var updatePeriodSeconds = 1;

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
        }
    };


    return SpawningManager;
})();
