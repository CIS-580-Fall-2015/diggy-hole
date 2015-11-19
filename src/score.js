/* Score engine */

module.exports = (function (){

  function ScoreEngine() {
    this.score           = 0;
    this.tickCount       = [0, 0, 0, 0];
    this.frameIndex      = [0, 0, 0, 0];
    this.frameGoal       = [0, 0, 0, 0];
    this.numFramesPerRow = 4;
    this.numRows         = 10;
    this.ticksPerFrame   = 9;
    
    this.img             = new Image();
    this.img.onload      = function()
    {
      this.height          = this.img.height / numRows;
      this.width           = this.img.width / numFramesPerRow;
    }
    this.img.src         = './img/score/clear_background_spritesheet.png';
  }

  ScoreEngine.prototype.addScore = function(amount) {
    var scoreString;
    this.score += amount;
    if (score < 100)
    {
      scoreString = "00" + score.toString();
    }
    else if (score < 1000)
    {
      scoreString = "0" + score.toString();
    }
    else
    {
      scoreString = score.toString();
    }
    for (var i = 0; i < scoreString.length; i++)
    {
      var temp = parseInt(scoreString[i]);
      this.frameGoal[i] = temp * 4;
    }
  };

  ScoreEngine.prototype.getScore = function() {
    return this.score;
  };

  ScoreEngine.prototype.subScore = function(amount) {
    this.score -= amount;
  };

  ScoreEngine.prototype.update = function()
  {
    this.updateAnimation();
  }

  ScoreEngine.prototype.render = function(context)
  {
    for (var i = 0; i < this.frameIndex.length; i++)
    {
      var sx = (this.frameIndex[i] % this.numFramesPerRow) * this.width;
      var sy = Math.floor(this.frameIndex[i] / this.numFramesPerRow) * this.height;
      context.drawImage(
        this.img,
        sx,
        sy,
        this.width,
        this.height,
        32 * i,
        0,
        this.width,
        this.height
      );
    }
  }

  ScoreEngine.prototype.updateAnimation = function()
  {
    for (var i = 0; i < this.frameGoal.length; i++)
    {
      if (this.frameIndex[i] != this.frameGoal[i])
      {
        this.tickCount[i] += 1;
        if (this.tickCount[i] > this.ticksPerFrame)
        {
          this.tickCount[i] = 0;
          if (this.frameIndex[i] < 39)
          {
            this.frameIndex[i] += 1;
          }
          else
          {
            this.frameIndex[i] = 0;
          }
        }
      }
    }
  }

  return ScoreEngine;

})();
