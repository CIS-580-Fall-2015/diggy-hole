// Gameplay game state defined using the Module pattern
module.exports = (function (){
  
  const SCREEN_WIDTH = 1280,
        SCREEN_HEIGHT = 720;
        
  var Player = require('./player.js'),
      inputManager = require('./input-manager.js'),
      tilemap = require('./tilemap.js'),
      tilemapData = require('../tilemaps/example_tilemap.js'),
      playerEntity = new Player(180, 240, 0, inputManager),
      player = {x: 1, y: 2},
      screenCtx,
      backBuffer,
      backBufferCtx,
      stateManager;
        
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
        console.log(tilemap);
      }
    });
  }
    
  // Helper function to check for non-existent or solid tiles
  function isPassible(x, y) {
    var data = tilemap.tileAt(x, y, 0);
    // if the tile is out-of-bounds for the tilemap, then
    // data will be undefined, a "falsy" value, and the
    // && operator will shortcut to false.
    // Otherwise, it is truthy, so the solid property
    // of the tile will determine the result
    return data && !data.solid
  }
  
  var update = function(elapsedTime) {
    playerEntity.update(elapsedTime, tilemap);
    inputManager.swapBuffers();
  }
  
  var render = function() {
    // Clear the back buffer
    backBufferCtx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    
    // Apply camera transforms
    backBufferCtx.save();
    backBufferCtx.translate((10 - player.x) * 64, (6 - player.y) * 64);
    
    // Redraw the map & player
    tilemap.render(backBufferCtx);
    backBufferCtx.beginPath();
    backBufferCtx.arc(player.x * 64 + 32, player.y * 64 + 32, 30, 0, Math.PI * 2);
    backBufferCtx.fill();
    
    playerEntity.render(backBufferCtx, true);
    
    backBufferCtx.restore();
    
    // Flip the back buffer
    screenCtx.drawImage(backBuffer, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);    
  }
  
  function movePlayer(x, y) {
    player.x += x;
    player.y += y;
    tilemap.setCameraPosition(player.x * 64, player.y * 64);
    tilemap.render(screenCtx);
  }
    
  // Event handler for key down events
  function keyDown(event) {
    if(event.keyCode == 27) { // ESC
      var mainMenu = require('./main-menu.js');
      stateManager.pushState(mainMenu);
    } 
    inputManager.keyDown(event);
  }
  
  // Event handler for key up events
  function keyUp(event) {
    inputManager.keyUp(event);
  }
  
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