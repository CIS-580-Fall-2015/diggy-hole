/* Game GameState module
 * Provides the main game logic for the Diggy Hole game.
 * Authors:
 * - Nathan Bean
 */
module.exports = (function (){
    /* jshint esnext: true */

    // The width & height of the screen

    // Module variables
    var Player = require('./player.js'),
        inputManager = require('./input-manager.js'),
        tilemap = require('./tilemap.js'),
        EntityManager = require('./entity-manager.js'),
        entityManager,
        SpawningManager = require('./spawning-manager.js'),
        player,
        screenCtx,
        backBuffer,
        backBufferCtx,
        stateManager,
        ScoreEngine = require('./score.js'),
        PowerUp = require('./powerUp.js'),
        Collectible = require('./collectible.js'),
        ParticleManager = require('./particle-manager.js'),
        HUD = require('./HUD.js'),
        hud,
        healthBar = require('./healthBar.js'),
        Inventory = require('./inventory.js'),
        Settings = require('./Settings.js');

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
        screen.width = Settings.SCREENSIZEX;
        screen.height = Settings.SCREENSIZEY;
        screenCtx = screen.getContext("2d");
        document.getElementById("game-screen-container").appendChild(screen);

        // Set up the back buffer
        backBuffer = document.createElement("canvas");
        backBuffer.width = Settings.SCREENSIZEX;
        backBuffer.height = Settings.SCREENSIZEY;
        backBufferCtx = backBuffer.getContext("2d");

        // Generate the tilemap
        tilemap.generate(Settings.MAPSIZEX, Settings.MAPSIZEY, {
            viewport: {
                width: Settings.SCREENSIZEX,
                height: Settings.SCREENSIZEY
            },
            onload: function() {
                window.tilemap = tilemap;
                tilemap.render(screenCtx);
                //tilemap.renderWater(screenCtx);
            }
        });

		// Set up HUD
		hud = new HUD(Settings.SCREENSIZEX, Settings.SCREENSIZEY);

        // Set up score engine
        scoreEngine = new ScoreEngine();
        hud.addElement(scoreEngine);

        // Set up invenotory
        inventory = new Inventory(6);

        hud.addElement(inventory);
		for(i=0;i<5;i++){
			inventory.powerUpPickedUp(5);
		}

        // Set up health bar
        hb = new healthBar(stateManager);
        hud.addElement(hb);

        // Create the player and add them to
        // the entity manager
        var randomPos = tilemap.randomOnSurface();
        player = new Player(randomPos.x * 64, randomPos.y * 64, 0, inputManager, hb, scoreEngine, inventory);
        entityManager = new EntityManager(player);

        this.spawningManager = new SpawningManager(entityManager, scoreEngine, player, inputManager);

        // Kyle Brown: Background Music
        var bgMusic = new Audio('./resources/sounds/DiggyHoleBGMusicAm.wav');
        bgMusic.addEventListener('ended', function() {
            this.currentTime = 0;
            this.play();
        }, false);
        bgMusic.play();


    };

    /* Updates the state of the game world
     * arguments:
     * - elapsedTime, the amount of time passed between
     * this and the prior frame.
     */
    var update = function(elapsedTime) {
        this.spawningManager.update(elapsedTime, tilemap);
        entityManager.update(elapsedTime, tilemap, ParticleManager);
        tilemap.update();
        ParticleManager.update(elapsedTime);
        inputManager.swapBuffers();
        //octopus.getPlayerPosition(player.boundingBox());
        hud.update(player.boundingBox());
    };

    /* Renders the current state of the game world
     */
    var render = function() {
        // Clear the back buffer
        backBufferCtx.fillRect(0, 0, Settings.SCREENSIZEX, Settings.SCREENSIZEY);
        // TODO: Calculate rubberbanding
        var bounds = player.boundingBox();
        var offsetX = Settings.SCREENSIZEX / 2,
            offsetY = Settings.SCREENSIZEY / 2;

        // Apply camera transforms
        backBufferCtx.save();backBufferCtx.translate(offsetX - bounds.left, offsetY - bounds.top);
        tilemap.setCameraPosition(bounds.left, bounds.top);

        // Redraw the map & entities
        tilemap.render(backBufferCtx);
        entityManager.render(backBufferCtx, false);
        //player.render(backBufferCtx, true);
        ParticleManager.render(backBufferCtx);
        tilemap.renderWater(backBufferCtx);
        hud.render(backBufferCtx);

        backBufferCtx.restore();

        // Flip the back buffer
        screenCtx.drawImage(backBuffer, 0, 0, Settings.SCREENSIZEX, Settings.SCREENSIZEY);
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
    var exit = function() {};

    return {
        load: load,
        exit: exit,
        update: update,
        render: render,
        keyDown: keyDown,
        keyUp: keyUp
    };

})();
