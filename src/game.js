/* Game GameState module
 * Provides the main game logic for the Diggy Hole game.
 * Authors:
 * - Nathan Bean
 */
module.exports = (function (){
  
  // The width & height of the screen
  const SCREEN_WIDTH = 1280,
        SCREEN_HEIGHT = 720;	
	
  // Module variables
  var Player = require('./player.js'),
      inputManager = require('./input-manager.js'),
      tilemap = require('./tilemap.js'),
      entityManager = require('./entity-manager.js'),
      Barrel = require('./barrel.js'),
	  DynamiteDwarf = require('./dynamiteDwarf.js'),
      player,
      screenCtx,
      backBuffer,
      backBufferCtx,
      stateManager;
  
  /* Loads the GameState, triggered by the StateManager
   * This function sets up the screen canvas, the tilemap,
   * and loads the entity.
   * arguments:
   * - sm, the state manager that loaded this game
   */  
  var load = function(sm) {
    stateManager = sm;
    
    // Set up the screen canvas
    var screen = document.createElement("canvas");
    screen.width = SCREEN_WIDTH;
    screen.height = SCREEN_HEIGHT;
    screenCtx = screen.getContext("2d");
    document.getElementById("game-screen-container").appendChild(screen);
  
    // Set up the back buffer
    backBuffer = document.createElement("canvas");
    backBuffer.width = SCREEN_WIDTH;
    backBuffer.height = SCREEN_HEIGHT;
    backBufferCtx = backBuffer.getContext("2d");
  
    // Generate the tilemap 
    tilemap.generate(1000, 1000, {
      viewport: {
        width: 1028,
        height: 720
      },
      onload: function() {
        window.tilemap = tilemap;
        tilemap.render(screenCtx);
      }
    });
    
    // Create the player and add them to
    // the entity manager
    player = new Player(180, 240, 0, inputManager);
    entityManager.add(player);
	
	
	// Spawn 10 barrels close to player
	for(var i = 0; i < 10; i++){
		barrel = new Barrel(Math.random()*64*50, Math.random()*64*20, 0, inputManager);
    entityManager.add(barrel);
	}
	
	dynamiteDwarf = new DynamiteDwarf(180, 240, 0, inputManager);
	entityManager.add(dynamiteDwarf);
  }
   
  /* Updates the state of the game world
   * arguments: 
   * - elapsedTime, the amount of time passed between
   * this and the prior frame.   
   */
  var update = function(elapsedTime) {
    //player.update(elapsedTime, tilemap);
    entityManager.update(elapsedTime, tilemap);
    inputManager.swapBuffers();
  }
  
  /* Renders the current state of the game world
   */
  var render = function() {
    // Clear the back buffer
    backBufferCtx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    
    // TODO: Calculate rubberbanding
    var bounds = player.boundingBox();
    var offsetX = SCREEN_WIDTH / 2,
        offsetY = SCREEN_HEIGHT / 2;
    
    // Apply camera transforms
    backBufferCtx.save();backBufferCtx.translate(offsetX - bounds.left, offsetY - bounds.top);
    tilemap.setCameraPosition(bounds.left, bounds.top);
    
    // Redraw the map & entities
    tilemap.render(backBufferCtx);
    entityManager.render(backBufferCtx, true);
    //player.render(backBufferCtx, true);
    
    backBufferCtx.restore();
    
    // Flip the back buffer
    screenCtx.drawImage(backBuffer, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);    
  }
  
  /* Event handler for key down events
   * arguments:
   * - event, the key down event to process
   */
  function keyDown(event) {
    if(event.keyCode == 27) { // ESC
      var mainMenu = require('./main-menu.js');
      stateManager.pushState(mainMenu);
    } 
    inputManager.keyDown(event);
  }
  
  /* Event handler for key up events
   * arguments:
   * - event, the key up event to process
   */
  function keyUp(event) {
    inputManager.keyUp(event);
  }
  
  /* Exits the game */
  var exit = function() {}
  
  return {
    load: load,
    exit: exit,
    update: update,
    render: render,
    keyDown: keyDown,
    keyUp: keyUp
  }
  
})();