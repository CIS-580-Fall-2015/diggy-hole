module.exports = (function(){
  var Entity = require('./entity.js');
  var PlayerClass = require('./player.js');
  var player;
  var spritesheet;
  var extantBlobbers;
  const SIZE = 64;

  const FALLING = 0;
  const IDLE = 1;
  const AIM = 2;
  const FIRE = 3;
  const DEAD = 4;

  var State = 0;
  var idleOffset = 0;
  var aimTimer = 0;
  var cooldown = 0;
  function Blobber(locationX, locationY, layerIndex, xVel, yVel, p, eb) {
    extantBlobbers = eb;
    spritesheet = new Image();
    spritesheet.src = "./img/blobber.png";

    this.layerIndex = layerIndex;
    this.currentX = locationX;
    this.currentY = locationY;


    this.dug = false;
    this.downPressed = false;
    this.nextX = 0;
    this.nextY = 0;
    this.currentTileIndex = 0;
    this.nextTileIndex = 0;
    this.constSpeed = 15;
    this.gravity = .5;
    this.angle = 0;
    this.xSpeed = xVel;
    this.ySpeed = yVel;
    this.isLeft = false;

    player = p;
    this.type = "BlobLobber";

    this.shots = 3;
    this.sterile = false;
  }


  Blobber.prototype = new Entity();

  Blobber.prototype.update = function(elapsedTime, tilemap, entityManager) {

    cooldown -= elapsedTime;

    //console.log(State);
if (State < 2)
    if (this.onGround(tilemap)==true) {
      this.ySpeed = 0;
      State = 1;
    } else {
      this.ySpeed += 5*elapsedTime;
      //State = 0;
    }



    if (State<=2) {
      //   >:)
      if (distance(player,this) < 150 && State < 2) {
          // Go to aiming/charging attack state
          aimTimer = 0;
          State = AIM;
      }


      var rand = Math.random();


      //if (player.currentY > this.currentY-10)
      if (Math.abs(player.currentX-this.currentX) > 100)
        if (player.currentX > this.currentX) {
          if (this.xSpeed < -.2) this.xSpeed = 0;
          this.xSpeed+=elapsedTime*3 + rand*elapsedTime;
        } else {
          if (this.xSpeed > .2) this.xSpeed = 0;
          this.xSpeed-=elapsedTime*3 - rand*elapsedTime;
        }

      if (player.currentY > this.currentY) {
        this.ySpeed+=elapsedTime*3;
      } else {
        this.ySpeed-=elapsedTime*3;
      }


    }

    if (State==AIM) {
      //State=FIRE;

      if (aimTimer > 1 && cooldown <= 0) {
        aimTimer = 0;
        State=FIRE;
      } else {
        aimTimer += elapsedTime;
      }


    } else if (State==FIRE) {


      var vectorx, vectory, dist;
      dist = distance(player,this);

      // Unit vector for where to shoot him to
      vectorx = 0-this.currentX-player.currentX;
      vectory = 0-this.currentY-player.currentY;

      var mag = Math.sqrt(vectorx*vectorx + vectory*vectory);

      var scalar = 5;
      vectorx = scalar*vectorx/mag;
      vectory = scalar*vectory/mag;

      cooldown = 5;

      //alert("Vector is " + vectorx + " ___ " + vectory);

      if (extantBlobbers < 20) {
        var BlobToLob = new Blobber(this.currentX,this.currentY, this.layerIndex, vectorx,vectory, player, ++extantBlobbers);
        entityManager.add(BlobToLob);
        console.log("Extant Blobbers: "+(extantBlobbers));
      }

      console.log("BlobLobber has Lobbed Blobbers");
      console.log("Vector is " + vectorx + " ___ " + vectory);
      if (this.shots > 0) {
        this.shots--;
        State = 1;

      } else {

        // DIE
        State = 4;
      }

    } else if (State==DEAD) {
      // TODO play dying crap
      State = 5;
    } else if (State==5) {
      entityManager.remove(this);
    }
    if (State < 4) {
      this.currentX += this.xSpeed;
      this.currentY += this.ySpeed;
    }

  }

  Blobber.prototype.collide = function(otherEntity) {


        if (otherEntity instanceof PlayerClass) {
          entityManager.remove(this);

            otherEntity.SPEED *= 0.86;
            console.log("Player entity has caught a cold! Speed is now " + otherEntity.SPEED + "(out of original 150)");
        }
        //entityManager.remove(this);
  }

  Blobber.prototype.onGround = function(tilemap) {
    var box = this.boundingBox(),
        tileX = Math.floor((box.left + (SIZE/2))/64),
        tileY = Math.floor(box.bottom / 64),
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    // find the tile we are standing on.
    return (tile && tile.data.solid) ? true : false;
  }

  Blobber.prototype.boundingBox = function() {
    return {
      left: this.currentX,
      top: this.currentY,
      right: this.currentX + SIZE,
      bottom: this.currentY + SIZE
    }
  }

  Blobber.prototype.boundingCircle = function() {
    return {
      cx: this.currentX + SIZE/2,
      cy: this.currentY + SIZE/2,
      radius: SIZE/2
    }
  }

  var frameIndex = 0;

  Blobber.prototype.render = function(ctx, debug) {

    ctx.drawImage(spritesheet,0,0+frameIndex*414,414,414,this.currentX,this.currentY,64,64);
    frameIndex++;
    if (frameIndex>7)
      frameIndex = 0;
    //ctx.drawImage(spritesheet,this.currentX,this.currentY);
    if (debug) debugRender(this, ctx);


  }
var everal = false;
  function distance(player,enemy) {
    return Math.sqrt((player.currentX-enemy.currentX)*(player.currentX-enemy.currentX) + (player.currentY-enemy.currentY)*(player.currentY-enemy.currentY))
  }

  function debugRender(blobber, ctx) {
    var bounds = blobber.boundingBox();



    ctx.save();

    // Draw player bounding box
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(bounds.left, bounds.top);
    ctx.lineTo(bounds.right, bounds.top);
    ctx.lineTo(bounds.right, bounds.bottom);
    ctx.lineTo(bounds.left, bounds.bottom);
    ctx.closePath();
    ctx.stroke();

    // Outline tile underfoot
    var tileX = 64 * Math.floor((bounds.left + (SIZE/2))/64),
        tileY = 64 * (Math.floor(bounds.bottom / 64));
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(tileX, tileY);
    ctx.lineTo(tileX + 64, tileY);
    ctx.lineTo(tileX + 64, tileY + 64);
    ctx.lineTo(tileX, tileY + 64);
    ctx.closePath();
    ctx.stroke();

    ctx.font = "30px Arial";
    ctx.fillText("Shots left: " + this.shots,this.currentX,this.currentY + 50);
    ctx.stroke();

    ctx.restore();


  }


  return Blobber;

}());
