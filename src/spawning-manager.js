module.exports = (function() {
    var Shaman = require('./goblin-shaman.js');

    var updatePeriodSeconds = 1;

    function SpawningManager(entityManager, scoreEngine, player) {
        this.entityManager = entityManager;
        this.scoreEngine = scoreEngine;
        this.previousScore =
        this.updateTimeLeft = 0;
    }

    SpawningManager.prototype.update = function (elapsedTime) {
        this.updateTimeLeft -= elapsedTime;
        if(this.updateTimeLeft < 0) {
            this.updateTimeLeft = updatePeriodSeconds;

            //TODO implement this, so that enemies spawn in waves, etc
            this.entityManager.add(new Shaman(Math.random()*64*15, Math.random()*64*15, 0));
        }
    };


    return SpawningManager;
})();
