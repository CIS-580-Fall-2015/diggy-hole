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
      GoblinSorcerer = require('./goblin_sorcerer.js'),
	  Rat = require('./rat.js'),
      Octopus = require('./octopus.js'),
      inputManager = require('./input-manager.js'),
      tilemap = require('./tilemap.js'),
      entityManager = require('./entity-manager.js'),
      StoneMonster = require('./stone-monster.js'),
	  DemonicGroundHog = require('./DemonicGroundH.js'),
      Barrel = require('./barrel.js'),
	  Turret = require('./turret.js'),
	  DynamiteDwarf = require('./dynamiteDwarf.js'),
	  Kakao = require('./Kakao.js'),
	  kakao,
      GoblinMiner = require('./goblin-miner.js'),
	  goblinSorcerer,
      player,
	  rat,
      octopus,
      stoneMonster,
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

    for (var i = 0; i < 35; i += 7){
      stoneMonster = new StoneMonster(64*i, 0, 0);
      entityManager.add(stoneMonster);
    }

    // Create the player and add them to
    // the entity manager
    player = new Player(400, 240, 0, inputManager);
    entityManager.add(player);
	
	rat = new Rat(500, 360, 0);
	entityManager.add(rat);
   
    player = new Player(64*6, 240, 0, inputManager);
    entityManager.add(player);

    octopus = new Octopus(120, 240, 0);
    entityManager.add(octopus);

	goblinMiner = new GoblinMiner(180-64-64, 240, 0, entityManager);
	entityManager.add(goblinMiner);
	
	goblinSorcerer = new GoblinSorcerer(420, 240, 0, entityManager);
	entityManager.add(goblinSorcerer);

	// Spawn 10 barrels close to player
	 // And some turrets
	for(var i = 0; i < 10; i++){
		if (i < 3) {
			turret = new Turret(Math.random()*64*50, Math.random()*64*20, o);
			entityManager.add(turret);
		}
		barrel = new Barrel(Math.random()*64*50, Math.random()*64*20, 0, inputManager);
		entityManager.add(barrel);
	}

	dynamiteDwarf = new DynamiteDwarf(280, 240, 0, inputManager);
	entityManager.add(dynamiteDwarf);

	// Karenfang: Create a Kakao and add it to
    // the entity manager
    kakao = new Kakao(310,240,0);  //two tiles to the right of the player
    entityManager.add(kakao);
  };

  /* Updates the state of the game world
   * arguments:
   * - elapsedTime, the amount of time passed between
   * this and the prior frame.
   */
  var update = function(elapsedTime) {
    //player.update(elapsedTime, tilemap);
    entityManager.update(elapsedTime, tilemap);
    inputManager.swapBuffers();

    octopus.getPlayerPosition(player.boundingBox());
  };

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
  };

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
