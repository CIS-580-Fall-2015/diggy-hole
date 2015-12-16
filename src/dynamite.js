/* Dynamite Dynamite module
 * Authors:
 * Alexander Duben
 */
module.exports = (function(){
  var Entity = require('./entity.js');
  Animation = require('./animation.js');
  
  //states
  const COUNTDOWN = 0;
  const DETONATE = 1;
  const DONE = 2;
  const FALLING = 3;

  // The Sprite Size
  const SIZE = 64;

  // Movement constants
  const SPEED = 50;
  const GRAVITY = -250;
  const JUMP_VELOCITY = -600;
  
  
  var dynamiteImg = new Image();
  dynamiteImg.src = './img/dynamiteSprite.png';
  var explosionImg = new Image();
  explosionImg.src = './img/explosionSpriteBig.png';
  var detonationTimer = 0;
  var explosionTimer = 0;
  
  var explosion = new Audio('resources/sounds/explosion.wav');

  //The Dynamite constructor
  function Dynamite(locationX, locationY, layerIndex, sourceEntity) {
    this.state = FALLING; 
    this.dug = false; 
    this.downPressed = false;
    this.layerIndex = layerIndex;
    this.currentX = locationX; 
    this.currentY = locationY; 
    this.nextX = 0; 
    this.nextY = 0;
    this.currentTileIndex = 0; 
    this.nextTileIndex = 0;
    this.constSpeed = 15; 
    this.gravity = .5; 
    this.angle = 0; 
    this.xSpeed = 10; 
    this.ySpeed = 15;
    this.isLeft = false;
	this.isPlayerColliding = false;
	this.type = 'dynamite';
	this.velocityY = -800;
	this.source = sourceEntity;
	
       //The animations
    this.animations = {
      dynamite: [],
    }
    
    //The right-facing animations
    this.animations.dynamite[FALLING] = new Animation(dynamiteImg, SIZE, SIZE, 0, 0, 8);
    this.animations.dynamite[DETONATE] = new Animation(explosionImg, 300, 300, 0, 0, 4);
	this.animations.dynamite[COUNTDOWN] = new Animation(dynamiteImg, SIZE, SIZE, 0, 0);
	this.animations.dynamite[DONE] = new Animation(explosionImg, SIZE, SIZE, 5*SIZE, 0);
  }
  // Dynamite inherits from Entity
  Dynamite.prototype = new Entity();
  
  // Determines if the player is on the ground
  Dynamite.prototype.onGround = function(tilemap) {
    var box = this.boundingBox(),
        tileX = Math.floor((box.left + (SIZE/2))/64),
        tileY = Math.floor(box.bottom / 64),
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);   
    // find the tile we are standing on.
    return (tile && tile.data.solid) ? true : false;
  }
  
  
  
  /* Dynamite update function
   * arguments:
   * - elapsedTime, the time that has passed 
   *   between this and the last frame.
   * - tilemap, the tilemap that corresponds to
   *   the current game world.
   */
  Dynamite.prototype.update = function(elapsedTime, tilemap, entityManager) {
    var sprite = this;

		switch(sprite.state) {
        case FALLING:
			sprite.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
			sprite.currentY += sprite.velocityY * elapsedTime;
			if(sprite.onGround(tilemap)) {
				sprite.velocityY = 0;
				sprite.currentY = 64 * Math.floor(sprite.currentY / 64);
				sprite.state = COUNTDOWN;
			}
			detonationTimer++;
			
          break;
		case COUNTDOWN:
			detonationTimer++;
			if(detonationTimer > 260){
				sprite.state = DETONATE;
			}
		break;
        case DETONATE:
		  explosion.play();
		  if(explosionTimer < 15){
			  explosionTimer++;
			  if(explosionTimer == 8){
				  sprite.source.state = 6; //remove source body
			  }
		  }else{
				var box = sprite.boundingBox(),
				tileX = Math.floor((box.left + (SIZE/2))/64),
				tileY = Math.floor(box.bottom / 64);
				for(var i = tileX-3; i < tileX+3;i++){
					for(var j = tileY -3; j < tileY+3;j++){
						
						tilemap.removeTileAt(i, j, 0);
					}	  
				}
				for(var i = tileX-5; i < tileX+5;i++){
					for(var j = tileY -5; j < tileY+5;j++){
						if(Math.random() < 0.4){
							tilemap.removeTileAt( i, j, 0);
						}
						
					}	  
				}
				sprite.state = DONE;
				
				
		  }
		  
          break;
		  
		  case DONE:
		  //final state
			break;
		}
       
    // Update animation
    
      this.animations.dynamite[this.state].update(elapsedTime);
    
    
  }
  
  /* Dynamite Render Function
   * arguments:
   * - ctx, the rendering context
   * - debug, a flag that indicates turning on
   * visual debugging
   */
  Dynamite.prototype.render = function(ctx, debug) {
    // Draw the Dynamite (and the correct animation)
    if(this.state == COUNTDOWN){
		this.animations.dynamite[this.state].render(ctx, this.currentX, this.currentY+25); 
	}
	else if(this.state == DETONATE){
		this.animations.dynamite[this.state].render(ctx, this.currentX-100, this.currentY-100);
	}else{
		this.animations.dynamite[this.state].render(ctx, this.currentX, this.currentY);
	}
    if(this.state != DONE){
		if(debug) renderDebug(this, ctx);
	}
    
  }
  
  // Draw debugging visual elements
  function renderDebug(Dynamite, ctx) {
    var bounds = Dynamite.boundingBox();
    ctx.save();
    
    // Draw Dynamite bounding box
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
    
    ctx.restore();
  }
  
  Dynamite.prototype.collide = function(otherEntity){
	  
  }
  
  /* Dynamite BoundingBox Function
   * returns: A bounding box representing the Dynamite 
   */
  Dynamite.prototype.boundingBox = function() {
    return {
      left: this.currentX,
      top: this.currentY,
      right: this.currentX + SIZE,
      bottom: this.currentY + SIZE
    }
  }
  
  Dynamite.prototype.boundingCircle = function() {
     return {cx: this.currentX+SIZE/2, cy: this.currentY+SIZE/2, radius: SIZE/2}
   }
  
  return Dynamite;

}());