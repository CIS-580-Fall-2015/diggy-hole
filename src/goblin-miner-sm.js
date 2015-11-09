/* Goblin Miner State Machine
 * Allows for the Goblin Miner(s) to make
 * decisions based on surroundings
 * Author(s):
 * - Wyatt Watson
 */
 module.exports = (function(){
	 
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
		var entities = [];
		for(int i = -5; i <= 5; i++){
			if(i == 0){}
			else{
				var temp = [tileMap.tileAt(tileX+i, tileY, layerIndex), i];
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
		var entities = [];
		for(int j = -7; j <= 7; j++){
			for(int i = -7; i <= 7; i++){
				if(i == 0 && j == 0){}
				else{
					var temp = [tileMap.tileAt(tileX+i, tileY, layerIndex), i];
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
		var tile = tileMap.tileAt(tileX, tileY-1, layerIndex);
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
		if(!(checkBelow(tileX, tileY, layerIndex, tileMap))){
			return [FALLING, 0];
		}
		  
		var visionEnts = vision(tileX, tileY, layerIndex, tileMap);
		var aggroEnts = aggressionRadius(tileX, tileY, layerIndex, tileMap);
		  
		// Check for player in vision
		for(int i = 0; i < visionEnts.length; i++){
			if(visionEnts[i].[0].type == 'player'){
				var temp
				if(visionEnts[i].[1] == 1 || visionEnts[i].[1] == -1)
					temp = [ATTACKING, visionEnts[i].[1]];
				else
					temp = [CHARGING, visionEnts[i].[1]];
				return temp;
			}
		}
		  
		// Check for player in aggro range
		for(i = 0; i < aggroEnts.length; i++){
			if(aggroEnts[i].[0].type == 'player'){
				var temp = [AGGRESSIVE_STANDING, aggroEnts[i].[1]];
				return temp;
			}
		}
		  
		// Player is not nearby, so need to find something to do
		var randomNum = Math.random();
		  
		switch(currentState) {
			case AGGRESSIVE_STANDING:
			    return [PASSIVE_STANDING, 0];
			case PASSIVE_STANDING:
			    if(randomNum > .8)
				    return [PASSIVE_STANDING, 0];
			    else{
				    if(randomNum > .6){
					    if(checkAbovePath(tileX, tileY, layerIndex, tileMap))
							return [JUMPING, 0];
					}
				}
				if(randomNum > .4){
					if(checkLeft(tileX, tileY, layerIndex, tileMap))
						return [WALKING, -1];
					else{
						if(randomNum > .7)
							return [DIGGING, -1];
						else
							return [WALKING, 1];
					}
				}
				else{
					if(checkRight(tileX, tileY, layerIndex, tileMap))
						return [WALKING, 1];
					else{
						if(randomNum < .1)
							return [DIGGING, 1];
						else
							return [WALKING, -1];
					}
				}
			case WALKING:
			    if(randomNum > .9){
				    if(checkAbovePath(tileX, tileY, layerIndex, tileMap))
						return [JUMPING, 0];
			    }
			    if(randomNum < .05)
				    return [PASSIVE_STANDING, 0];
			    if(direction == 1){
				    if(checkRight(tileX, tileY, layerIndex, tileMap))
					    return [WALKING, 1];
				    else
					    return [DIGGING, 1];
			    }
			    else{
				    if(checkLeft(tileX, tileY, layerIndex, tileMap))
					    return [WALKING, -1];
				    else
					    return [DIGGING, -1];
			    }
			case DIGGING:
			    if(direction == 1 && checkRight(tileX, tileY, layerIndex, tileMap))
				    return [WALKING, 1];
			    else if(direction == -1 && checkLeft(tileX, tileY, layerIndex, tileMap))
				    return [WALKING, -1];
			    else
				    return [currentState, direction];
			case JUMPING:
			    /* if(checkAbove(tileX, tileY, layerIndex, tileMap))
				    return [FALLING, 0]; */
			    if(randomNum > .5){
				    if(checkRight(tileX, tileY, layerIndex, tileMap))
					    return [JUMPING, 1];
				    else
						return [JUMPING, 0];
			    }
			    else{
				    if(checkLeft(tileX, tileY, layerIndex, tileMap))
						return [JUMPING, -1];
				    else
						return [JUMPING, 0];
			    }
			case FALLING:
				/* if(!(checkBelow(tileX, tileY, layerIndex, tileMap)))
					return [PASSIVE_STANDING, 0]; */
				if(randomNum > .5){
				    if(checkRight(tileX, tileY, layerIndex, tileMap))
						return [FALLING, 1];
				    else
						return [FALLING, 0];
				}
				else{
				    if(checkLeft(tileX, tileY, layerIndex, tileMap))
						return [FALLING, -1];
				    else
					    return [FALLING, 0];
				}	  
        }
	}
  
 }());
