/* Score engine */

module.exports = (function (){

  function ScoreEngine() {
    this.img             = new Image();
    this.img.src         = './img/score/clear_background_yellow_num.png';
    this.score           = 0;
    this.tickCount       = [0, 0, 0, 0];
    this.frameIndex      = [0, 0, 0, 0];
    this.frameGoal       = [0, 0, 0, 0];
    this.numFramesPerRow = 4;
    this.numRows         = 10;
    this.ticksPerFrame   = 9;

    this.xpos            = 0;
    this.ypos            = 0;
    
    this.height          = 32;
    this.width           = 32;
  }

  ScoreEngine.prototype.addScore = function(amount) {
    var scoreString;
    this.score += amount;
    if (this.score < 10)
    {
      scoreString = "000" + this.score.toString();
    }
    else if (this.score < 100)
    {
      scoreString = "00" + this.score.toString();
    }
    else if (this.score < 1000)
    {
      scoreString = "0" + this.score.toString();
    }
    else
    {
      scoreString = this.score.toString();
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
    this.updatePosition();
    this.updateAnimation();
  }

  ScoreEngine.prototype.setPositionFunction = function(func) {
    this.positionFunction = func;
  }

  ScoreEngine.prototype.render = function(context)
  {
    //console.log("Score Render");
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
        this.xpos + (32 * i),
        this.ypos,
        this.width,
        this.height
      );
    }
  }

  ScoreEngine.prototype.updatePosition = function() {
    if (this.positionFunction)
    {
      var pos = this.positionFunction();
      this.xpos = pos[0];
      this.ypos = pos[1];
    }
  };

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
