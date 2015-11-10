/* Goblin Miner module
 * Implements the entity pattern and provides
 * the DiggyHole Goblin Miner info.
 * Author:
 * - Wyatt Watson
 * - Nathan Bean
 */
module.exports = (function(){
    var Entity = require('./entity.js'),
	    Animation = require('./animation.js');
	  
    /* The following are Goblin Miner States */
    const PASSIVE_STANDING = 0;
    const WALKING = 1;
    const JUMPING = 2;
    const FALLING = 3;
    const DIGGING = 4;
    const CHARGING = 5;
    const ATTACKING = 6;
    const AGGRESSIVE_STANDING = 7;
  
    /* Returns the entities in Sight
     * - tileX, the x coordinate of our current tile location
     * - tileY, the y coordinate of our current tile location
     * - layerIndex, the layer we are in and interact with
     * - tileMap, the tilemap
     */
    function vision(tileX, tileY, layerIndex, tileMap){
	var entities = new Array();
	for(i = -5; i <= 5; i++){
		if(i == 0){}
		else{
			var temp = {
				entity: tileMap.tileAt(tileX+i, tileY, layerIndex), 
				direction: i};
			if(tileX+i >= 0 && tileX+i <= tileMap.height)
				entities.push(temp);
		}
	}
	return entities;
    }
	  
    /* Returns the entities in Hearing Range
     * - tileX, the x coordinate of our current tile location
     * - tileY, the y coordinate of our current tile location
     * - layerIndex, the layer we are in and interact with
     * - tileMap, the tilemap
     */
    function aggressionRadius(tileX, tileY, layerIndex, tileMap){
	var entities = new Array();
	for(j = -7; j <= 7; j++){
		for(i = -7; i <= 7; i++){
			if(i == 0 && j == 0){}
			else{
				var temp = {
					entity: tileMap.tileAt(tileX+i, tileY+j, layerIndex),
				direction: i};
				if(tileX+i >= 0 && tileX+i <= tileMap.width && tileY+j >= 0 && tileY+j <= tileMap.height)
					entities.push(tileMap.tileAt(tileX+i, tileY+j, layerIndex));
			}
		}
	}
	return entities;
    }
	  
    /* Returns a bool for if there is a large enough path to jump up
     * - tileX, the x coordinate of our current tile location
     * - tileY, the y coordinate of our current tile location
     * - layerIndex, the layer we are in and interact with
     * - tileMap, the tilemap
     */
    function checkAbovePath(tileX, tileY, layerIndex, tileMap){
	var tile = tileMap.tileAt(tileX, tileY-1, layerIndex);
	if(!(tile && tile.data.solid)){
		tile = tileMap.tileAt(tileX, tileY-2, layerIndex);
		if(!(tile && tile.data.solid))
			return true;
	}
	return false;
    }
	  
    /* Returns a bool for if the path above is open (false - solid, true - open)
     * - tileX, the x coordinate of our current tile location
     * - tileY, the y coordinate of our current tile location
     * - layerIndex, the layer we are in and interact with
     * - tileMap, the tilemap
     */
    function checkAbove(tileX, tileY, layerIndex, tileMap){
	var tile = tileMap.tileAt(tileX, tileY-1, layerIndex);
	if(tile && tile.data.solid)
		return false;
	return true;
    }
	  
    /* Returns a bool for if the path to the right is open (false - solid, true - open)
     * - tileX, the x coordinate of our current tile location
     * - tileY, the y coordinate of our current tile location
     * - layerIndex, the layer we are in and interact with
     * - tileMap, the tilemap
     */
    function checkRight(tileX, tileY, layerIndex, tileMap){
	var tile = tileMap.tileAt(tileX+1, tileY, layerIndex);
	if(tile && tile.data.solid)
		return false;
	return true;
    }

    /* Returns a bool for if the path to the left is open (false - solid, true - open)
     * - tileX, the x coordinate of our current tile location
     * - tileY, the y coordinate of our current tile location
     * - layerIndex, the layer we are in and interact with
     * - tileMap, the tilemap
     */  
    function checkLeft(tileX, tileY, layerIndex, tileMap){
	var tile = tileMap.tileAt(tileX-1, tileY, layerIndex);
	if(tile && tile.data.solid)
		return false;
	return true;
    }

    /* Returns a bool for if the path below is open (false - solid, true - open)
     * - tileX, the x coordinate of our current tile location
     * - tileY, the y coordinate of our current tile location
     * - layerIndex, the layer we are in and interact with
     * - tileMap, the tilemap
     */
    function checkBelow (tileX, tileY, layerIndex, tileMap){
	var tile = tileMap.tileAt(tileX, tileY+1, layerIndex);
	if(tile && tile.data.solid)
		return false;
	return true;
    }
	  
    /* Returns an array holding a command and possibly direction
     * - tileX, the x coordinate of our current tile location
     * - tileY, the y coordinate of our current tile location
     * - layerIndex, the layer we are in and interact with
     * - tileMap, the tilemap
     * - currentState, the current state of the goblin miner
     * - direction, the possible direction the goblin miner is moving
     */
    function command(tileX, tileY, layerIndex, tileMap, currentState, direction){  
	if((checkBelow(tileX, tileY, layerIndex, tileMap))){
		return {command: FALLING, direction: 0};
	}
		  
	var visionEnts = vision(tileX, tileY, layerIndex, tileMap);
	var aggroEnts = aggressionRadius(tileX, tileY, layerIndex, tileMap);
		  
	// Check for player in vision
	for(i = 0; i < visionEnts.length; i++){
		if(visionEnts[i].entity.data.type == 'player'){
			var temp;
			if(visionEnts[i].direction == 1 || visionEnts[i].direction == -1)
				temp = {command: ATTACKING, direction: visionEnts[i].direction};
			else
				temp = {command: CHARGING, direction: visionEnts[i].direction};
			return temp;
		}
	}
		  
	// Check for player in aggro range
	for(i = 0; i < aggroEnts.length; i++){
		if(aggroEnts[i].entity.data.type == 'player'){
			var temp = {command: AGGRESSIVE_STANDING, direction: aggroEnts[i].direction};
			return temp;
		}
	}
		  
	// Player is not nearby, so need to find something to do
	var randomNum = Math.random();
		  
	switch(currentState) {
		case AGGRESSIVE_STANDING:
		    return {command: PASSIVE_STANDING, direction: 0};
			break;
		case PASSIVE_STANDING:
		    if(randomNum > .8)
			    return {command: PASSIVE_STANDING, direction: 0};
		    else{
			    if(randomNum > .6){
				    if(checkAbovePath(tileX, tileY, layerIndex, tileMap))
						return {command: JUMPING, direction: 0};
				}
			}
			if(randomNum > .4){
				if(checkLeft(tileX, tileY, layerIndex, tileMap))
					return {command: WALKING, direction: -1};
				else{
					if(randomNum > .7)
						return {command: DIGGING, direction: -1};
					else
						return {command: WALKING, direction: 1};
				}
			}
			else{
				if(checkRight(tileX, tileY, layerIndex, tileMap))
					return {command: WALKING, direction: 1};
				else{
					if(randomNum < .1)
						return {command: DIGGING, direction: 1};
					else
						return {command: WALKING, direction: -1};
				}
			}
			break;
		case WALKING:
		    /* if(randomNum > .9){
			    if(checkAbovePath(tileX, tileY, layerIndex, tileMap))
					return {command: JUMPING, direction: 0};
		    }
		    if(randomNum < .05)
			    return {command: PASSIVE_STANDING, direction: 0}; */
		    if(direction == 1){
			    if(checkRight(tileX, tileY, layerIndex, tileMap))
				    return {command: WALKING, direction: 1};
			    else
				    return {command: DIGGING, direction: 1};
		    }
		    else{
			    if(checkLeft(tileX, tileY, layerIndex, tileMap))
				    return {command: WALKING, direction: -1};
			    else
				    return {command: DIGGING, direction: -1};
		    }
			break;
		case DIGGING:
		    if(direction == 1 && checkRight(tileX, tileY, layerIndex, tileMap))
			    return {command: WALKING, direction: 1};
		    else if(direction == -1 && checkLeft(tileX, tileY, layerIndex, tileMap))
			    return {command: WALKING, direction: -1};
		    else
			    return {command: currentState, direction: direction};
			break;
		case JUMPING:
		     /*if(checkAbove(tileX, tileY, layerIndex, tileMap))
			    return [FALLING, 0];*/ 
		    if(randomNum > .5){
			    if(checkRight(tileX, tileY, layerIndex, tileMap))
				    return {command: JUMPING, direction: 1};
			    else
					return {command: JUMPING, direction: 0};
		    }
		    else{
			    if(checkLeft(tileX, tileY, layerIndex, tileMap))
					return {command: JUMPING, direction: -1};
			    else
					return {command: JUMPING, direction: 0};
		    }
			break;
		case FALLING:
			/*if(!(checkBelow(tileX, tileY, layerIndex, tileMap)))
				return [PASSIVE_STANDING, 0]; */
			if(randomNum > .5){
			    if(checkRight(tileX, tileY, layerIndex, tileMap))
					return {command: FALLING, direction: 1};
			    else
					return {command: FALLING, direction: 0};
			}
			else{
			    if(checkLeft(tileX, tileY, layerIndex, tileMap))
					return {command: FALLING, direction: -1};
			    else
				    return {command: FALLING, direction: 0};
			}	
			break;
        }
		return {command: currentState, direction: direction};
    } 
  
    // Movement constants
    const SPEED = 150;
    const GRAVITY = -250;
    const JUMP_VELOCITY = -600;
  
    // Current stance (Passive, Aggressive)
    var Passive = true;
	
	var SIZE = 64;
  
    /* ADD CODE HERE */
    // The right facing goblin miner spritesheet(s)
    var goblinMinerRight = new Image();
    goblinMinerRight.src = 'Passive_Scratch.png';
  
    // The left facing goblin miner spritesheet(s)
    var goblinMinerLeft = new Image();
    goblinMinerLeft.src = '';
    /* END ADD CODE HERE*/

    function GoblinMiner(locationX, locationY, layerIndex){
	    this.data = {type: 'goblinMiner'};
		this.state = PASSIVE_STANDING;
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
		this.direction = 0;
	  
	    // The animations
	    this.animations = {
			left: [],
			right: []
	    }
	  
	    /* ADD CODE HERE */
	    // The right-facing animations
	    this.animations.right[PASSIVE_STANDING] = new Animation(goblinMinerRight, 354/8, 64, 354/8, 0, 0, 1);
	    // the left-facing animations
	    /* END ADD CODE HERE */
    }  
  
    GoblinMiner.prototype = new Entity();
  
    // Determines if the Goblin Miner is on the ground
    GoblinMiner.prototype.onGround = function(tilemap) {
		var box = this.boundingBox(),
			tileX = Math.floor((box.left + (SIZE/2))/64),
			tileY = Math.floor(box.bottom / 64),
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);   
    // find the tile we are standing on.
    return (tile && tile.data.solid) ? true : false;
    }
  
    // Moves the Goblin Miner to the left, colliding with solid tiles
    GoblinMiner.prototype.moveLeft = function(distance, tilemap) {
    this.currentX -= distance;
    var box = this.boundingBox(),
        tileX = Math.floor(box.left/64),
        tileY = Math.floor(box.bottom / 64) - 1,
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid) 
      this.currentX = (Math.floor(this.currentX/64) + 1) * 64
    }
  
  // Moves the Goblin Miner to the right, colliding with solid tiles
  GoblinMiner.prototype.moveRight = function(distance, tilemap) {
    this.currentX += distance;
    var box = this.boundingBox(),
        tileX = Math.floor(box.right/64),
        tileY = Math.floor(box.bottom / 64) - 1,
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
    if (tile && tile.data.solid)
      this.currentX = (Math.ceil(this.currentX/64)-1) * 64;
  }
  
  /* Goblin Miner update function
   * arguments:
   * - elapsedTime, the time that has passed 
   *   between this and the last frame.
   * - tilemap, the tilemap that corresponds to
   *   the current game world.
   */
  GoblinMiner.prototype.update = function(elapsedTime, tilemap) {
    var sprite = this;
    
    // The "with" keyword allows us to change the
    // current scope, i.e. 'this' becomes our 
    // inputManager
    var whatDo = command(Math.floor(this.currentX/64), Math.floor(this.currentY/64), this.layerIndex, tilemap, this.state, this.direction);
    //var whatDo = {command: PASSIVE_STANDING, direction: 0};
	this.state = whatDo.command;
	this.direction = whatDo.direction;
	
	/* ADD CODE HERE */
    // Process Goblin Miner state
    switch(whatDo.command) {
        case PASSIVE_STANDING:
		  this.velocityY = 0;
		  break;
		case AGGRESSIVE_STANDING:
		  this.velocityY = 0;
		  break;
        case WALKING:
		  this.velocityY = 0;
          if(whatDo.direction > 0){
			  this.isLeft = false;
			  this.moveRight(elapsedTime * SPEED, tilemap);
		  }
		  else{
			  this.isLeft = true;
			  this.moveLeft(elapsedTime * SPEED, tilemap);
		  }
          break;
		case CHARGING:
          if(whatDo.direction > 0){
			  this.isLeft = false;
			  this.moveRight(elapsedTime * SPEED*2, tilemap);
		  }
		  else{
			  this.isLeft = true;
			  this.moveLeft(elapsedTime * SPEED*2, tilemap);
		  }
          break;
        case DIGGING:
		  if(whatDo.direction > 0){
			  //dig right
		  }
		  else{
			  //dig left
		  }
		case ATTACKING:
		  if(whatDo.direction > 0){
			  //attack right
		  }
		  else{
			  //attack left
		  }
        case JUMPING:
          //sprite.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
          //sprite.currentY += sprite.velocityY * elapsedTime;
          if(this.velocityY > 0) {
            this.state = FALLING;
          }
          
          if(whatDo.direction > 0){
			  this.isLeft = false;
			  this.moveRight(elapsedTime * SPEED, tilemap);
		  }
		  else{
			  this.isLeft = true;
			  this.moveLeft(elapsedTime * SPEED, tilemap);
		  }
          break;
        case FALLING:
          this.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
          this.currentY += sprite.velocityY * elapsedTime;
          if(this.onGround(tilemap)) {
            this.state = PASSIVE_STANDING;
            this.currentY = 64 * Math.floor(sprite.currentY / 64);
          }  
          if(whatDo.direction > 0){
			  this.isLeft = false;
			  this.moveRight(elapsedTime * SPEED, tilemap);
		  }
		  else if(whatDo.direction < 0){
			  this.isLeft = true;
			  this.moveLeft(elapsedTime * SPEED, tilemap);
		  }
          break;
      }
	  /* END ADD CODE HERE */
       
    // Update animation
    /* if(this.isLeft)
      this.animations.left[this.state].update(elapsedTime);
    else
      this.animations.right[this.state].update(elapsedTime); */
  
    this.animations.right[PASSIVE_STANDING].update(elapsedTime);
  }
  
  /* Goblin Miner Render Function
   * arguments:
   * - ctx, the rendering context
   * - debug, a flag that indicates turning on
   * visual debugging
   */
  GoblinMiner.prototype.render = function(ctx, debug) {
    // Draw the Goblin Miner (and the correct animation)
    /* if(this.isLeft)
      this.animations.left[this.state].render(ctx, this.currentX, this.currentY);
    else
      this.animations.right[this.state].render(ctx, this.currentX, this.currentY); */
    
	this.animations.right[PASSIVE_STANDING].render(ctx, this.currentX, this.currentY);
	
    if(debug) renderDebug(this, ctx);
  }
  
  // Draw debugging visual elements
  function renderDebug(goblinMiner, ctx) {
    var bounds = goblinMiner.boundingBox();
    ctx.save();
    
    // Draw Goblin Miner bounding box
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
  
  GoblinMiner.prototype.collide = function(otherEntity) {
  	if(otherEntity.type == "player"){
  		return [ATTACKING, 0];
  	}
  }
  
  /* Goblin Miner BoundingBox Function
   * returns: A bounding box representing the Goblin Miner 
   */
  GoblinMiner.prototype.boundingBox = function() {
    return {
      left: this.currentX,
      top: this.currentY,
      right: this.currentX + SIZE,
      bottom: this.currentY + SIZE
    }
  }
  
  return GoblinMiner;
  
}());
