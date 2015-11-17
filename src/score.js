/* Score engine */

module.exports = (function (){

  function ScoreEngine() {
    this.score = 0;
  }

  ScoreEngine.prototype.addScore = function(amount) {
    this.score += amount;
  };

  ScoreEngine.prototype.getScore = function() {
    return this.score;
  };

  ScoreEngine.prototype.subScore = function(amount) {
    this.score -= amount;
  };

  return ScoreEngine;

})();
