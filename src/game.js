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
	  Rat = require('./rat.js'),
	  Wolf = require('./wolf.js'),
    Robo_Killer = require('./robo-killer.js'),
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
    Bird = require('./bird.js'),
    bird,
	  kakao,
	wolf,
  robo_killer,
      GoblinMiner = require('./goblin-miner.js'),
      Shaman = require('./goblin-shaman.js'),
    Blobber = require('./blobber.js'),
    blobber,
    extantBlobbers,
      player,
	  rat,
      octopus,
      stoneMonster,
	  Slime = require('./slime.js'),
      Sudo_Chan = require('./sudo_chan.js'),
      sudo_chan,
      slime,
      goblinMiner,
      screenCtx,
      backBuffer,
      backBufferCtx,
      stateManager,
      ScoreEngine = require('./score.js'),
	  PowerUp = require('./powerUp.js');

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
      //stoneMonster = new StoneMonster(64*i, 0, 0);
      //entityManager.add(stoneMonster);
    }

    // Create the player and add them to
    // the entity manager
    player = new Player(400, 240, 0, inputManager);
    entityManager.add(player);
    
    // Set up score engine
    scoreEngine = new ScoreEngine();
    scoreEngine.setPositionFunction(tilemap.getCameraPosition)
    entityManager.setScoreEngine(scoreEngine);

    //add wolf to
    // the entity manager
    wolf = new Wolf(430,240,0,inputManager);  //four tiles to the right of the player
    entityManager.add(wolf);

    bird = new Bird(400, 100);
    entityManager.add(bird);

    // Add a robo-killer to the entity manager.
    robo_killer = new Robo_Killer(450, 240, 0);
    entityManager.add(robo_killer);

	rat = new Rat(500, 360, 0);
	entityManager.add(rat);

	slime = new Slime(400, 20, 0);
	entityManager.add(slime);

    sudo_chan = new Sudo_Chan(490, 240, 0);
    entityManager.add(sudo_chan);

    octopus = new Octopus(120, 240, 0);
    entityManager.add(octopus);

	DemonicGroundHog = new DemonicGroundHog(5*64,240,0,entityManager);
	entityManager.add(DemonicGroundHog);

	goblinMiner = new GoblinMiner(180-64-64, 240, 0, entityManager);
	entityManager.add(goblinMiner);

	// Spawn 10 barrels close to player
	 // And some turrets
    // and some shamans
	for(var i = 0; i < 10; i++){
		if (i < 3) {
			turret = new Turret(Math.random()*64*50, Math.random()*64*20, 0);
			entityManager.add(turret);
			
		}
		dynamiteDwarf = new DynamiteDwarf(Math.random()*64*50, Math.random()*64*20, 0, inputManager);
	entityManager.add(dynamiteDwarf);
		entityManager.add(new PowerUp(Math.random()*64*50, Math.random()*64*20, 0,'pick', 64, 64, 2, './img/powerUps/pick.png', false, 3600));
		entityManager.add(new PowerUp(Math.random()*64*50, Math.random()*64*20, 0,'medicine', 64, 64, 1, './img/powerUps/medicine.png', false, -1));
		entityManager.add(new PowerUp(Math.random()*64*50, Math.random()*64*20, 0,'crystal', 32, 32, 12, './img/powerUps/crystal_enhanced.png', true, -1));
		barrel = new Barrel(Math.random()*64*50, Math.random()*64*20, 0);
		entityManager.add(barrel);
        entityManager.add(new Shaman(Math.random()*64*50, Math.random()*64*20, 0));
		

	}
	//powerUp = new PowerUp(280, 240, 0, 'demo', 44, 40, 10, './img/powerUps/coin.png');
					 
	
	

	

	// Karenfang: Create a Kakao and add it to
    // the entity manager
    kakao = new Kakao(310,240,0);  //two tiles to the right of the player
    entityManager.add(kakao);

    extantBlobbers = 1;
    blobber = new Blobber(280,240,0,0,0,player,extantBlobbers);
    entityManager.add(blobber);



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
