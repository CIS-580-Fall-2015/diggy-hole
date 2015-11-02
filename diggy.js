(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = (function() { 
  
  function Animation(image, width, height, top, left, numberOfFrames, secondsPerFrame) {
    this.frameIndex = 0,
    this.time = 0,
    this.secondsPerFrame = secondsPerFrame || (1/16),
    this.numberOfFrames = numberOfFrames || 1;
  
    this.width = width;
    this.height = height;
    this.image = image;
    
    this.drawLocationX = top || 0;
    this.drawLocationY = left || 0;
  }
  
  Animation.prototype.setStats = function(frameCount, locationX, locationY){
    this.numberOfFrames = frameCount;
    this.drawLocationY = locationY; 
    this.drawLocationX = locationX;
  } 
		
	Animation.prototype.update = function (elapsedTime, tilemap) {
    this.time += elapsedTime;
    
    // Update animation
    if (this.time > this.secondsPerFrame) {
      if(this.time > this.secondsPerFrame) this.time -= this.secondsPerFrame;
      
      // If the current frame index is in range
      if (this.frameIndex < this.numberOfFrames - 1) {	
        this.frameIndex += 1;
      } else {
        this.frameIndex = 0;
      }
    }
  }
		
	Animation.prototype.render = function(ctx, x, y) {
		
    // Draw the current frame
    ctx.drawImage(
      this.image,
      this.drawLocationX + this.frameIndex * this.width,
      this.drawLocationY,
      this.width,
      this.height,
      x,
      y,
      this.width,
      this.height);
  }
  
  return Animation;
  
}());

},{}],2:[function(require,module,exports){
// Credits Menu game state defined using the Module pattern
module.exports = (function (){
  var menu = document.getElementById("credits-menu"),
      exit = document.getElementById("exit-btn"),
      wrap = document.getElementById("credits-wrapper"),
      scroll = 0,
      stateManager;    
   
  /*
   * The load() method initializes the menu 
   * and tells the DOM to render the menu HTML
   * parameters:
   * - sm the state manager
   */
  var load = function(sm) {
    stateManager = sm;
    menu.style.display = "flex";
    scroll = 200;
    wrap.style.marginTop = "200px";
  }
  
  /*
   * The exit() method hides the menu
   */
  var exit = function() {
    menu.style.display = "none";
  }
    
  /* 
   * The update() method updates the menu,
   * scrolling the credits
   */
  var update = function(elapsedTime) {
    scroll -= 0.0001 * elapsedTime;
    wrap.style.marginTop = Math.round(scroll) + "px";
console.log(scroll);    
  }
  
  /* 
   * The render() method renders the menu
   * (in this case, a no-op as the menu is 
   * HTML elements renderd by the DOM)
   */
  var render = function() {}
    
  /* 
   * The keyHander() method handles key
   * events for the menu.
   */
  var keyDown = function(event) {
    switch(event.keyCode) {
      case 13: // ENTER
      case 32: // SPACE
      case 27: // ESC
        event.preventDefault();
        stateManager.popState();
        break;
    }
  }
  
  var keyUp = function(event) {}
  
  return {
    load: load,
    exit: exit,
    update: update,
    render: render,
    keyDown: keyDown,
    keyUp: keyUp
  }
  
})();
},{}],3:[function(require,module,exports){
/* Base class for all game entities,
 * implemented as a common JS module 
 */
module.exports = (function(){
  
  /* Constructor
   * Generally speaking, you'll want to set
   * the X and Y position, as well as the layerX
   * of the map the entity is located on
   */
  function Entity(locationX, locationY, mapLayer){
    this.x = locationX;
    this.y = locationY;
    this.mapLayer = mapLayer;
  }
  
  /* Update function
   * parameters:
   * - elapsedTime is the time that has passed since the
   *   previous frame 
   * - tilemap is the currently loaded tilemap; you'll 
   *   probably want to call its tileAt and setTile methods.
   * - entityManager is the game's entity manager, and
   *   keeps track of where all game entities are.
   *   you can call its query functions
   */
  Entity.prototype.update = function(elapsedTime, tilemap, entityManager) {
      // TODO: Determine what your entity will do
  }
  
  /* Render function
   * parameters:
   *  - context is the rendering context.  It may be transformed
   *    to account for the camera 
   */
   Entity.prototype.render = function(context) {
     // TODO: Draw your entity sprite
   }
   
   /* Collide function
    * This function is called by the entityManager when it determines
    * a possible collision.
    * parameters:
    * - otherEntity is the entity this enemy collided with
    *   You will likely want to use 
    *     'otherEntity instanceof <Type>' 
    *   to determine what type it is to know what to 
    *   do with it.
    */
   Entity.prototype.collide = function(otherEntity) {
   }
   
   /* BoundingBox function
    * This function returns an axis-aligned bounding
    * box, i.e {top: 0, left: 0, right: 20, bottom: 50}
    * the box should contain your entity or at least the
    * part that can be collided with.
    */
   Entity.prototype.boundingBox = function() {
     // Return a bounding box for your entity
   }
   
   return Entity;
  
}());
},{}],4:[function(require,module,exports){
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
},{"../tilemaps/example_tilemap.js":11,"./input-manager.js":5,"./main-menu.js":6,"./player.js":9,"./tilemap.js":10}],5:[function(require,module,exports){
module.exports = (function() { 

  var commands = {	
    RIGHT: 39,
    LEFT: 37,
	  UP: 38,
	  DOWN: 40,
    DIG: 32,
  }
  
  var oldKeys = [];
  var newKeys = [];
  for(var i = 30; i < 40; i++) {
    oldKeys[i] = false;
    newKeys[i] = false;
  }
  
  function swapBuffers() {
    for(var i = 30; i < 40; i++) {
      oldKeys[i] = newKeys[i];
    }
  }

  function keyDown(event) {
    event.preventDefault();
    newKeys[event.keyCode] = true;
    return false;
  }
  
  function keyUp(event) {
    event.preventDefault();
    newKeys[event.keyCode] = false;
    return false;
  }
  
  function isKeyDown(keyCode) {
    return newKeys[keyCode];
  }
  
  function wasKeyPressed(keyCode) {
    return (!oldKeys[keyCode] && newKeys[keyCode]);
  }
  
  function wasKeyReleased(keyCode) {
    return (oldKeys[keyCode] && !newKeys[keyCode]);
  }
  
  return {
    commands: commands,
    swapBuffers: swapBuffers,
    keyDown: keyDown,
    keyUp: keyUp,
    isKeyDown: isKeyDown,
    wasKeyPressed: wasKeyPressed,
    wasKeyReleased: wasKeyReleased
  }
  
})();
},{}],6:[function(require,module,exports){
// Main Menu game state defined using the Module pattern
module.exports = (function (){
  var menu = document.getElementById("main-menu"),
      play = document.getElementById("play-btn"),
      settings = document.getElementById("settings-btn"),
      credits = document.getElementById("credits-btn"),
      items = [play, settings, credits],
      selectedItemIndex = 0,
      stateManager;
  
  items.forEach( function(item, i) {
    item.onmouseover = function() {
      items[selectedItemIndex].classList.remove("selected");
      selectedItemIndex = i;
      items[selectedItemIndex].classList.add("selected");
    }
  });
  
  /*
   * The Play button exits the menu and returns 
   * to the previous (gameplay) state.  This 
   * should only be called when the stateManager
   * has been set via a load() call.
   */
  play.onclick = function(event) {
    event.preventDefault();
    stateManager.popState();
  }
  
  /* 
   * The Credits button launches the credit menu
   */
  credits.onclick = function(event) {
    event.preventDefault();
    var creditsScreen = require('./credits-screen');
    stateManager.pushState(creditsScreen);
  }
  
  /*
   * The load() method initializes the menu 
   * and tells the DOM to render the menu HTML
   * parameters:
   * - sm the state manager
   */
  var load = function(sm) {
    stateManager = sm;
    menu.style.display = "flex";
    items[selectedItemIndex].classList.add("selected");
  }
  
  /*
   * The exit() method hides the menu
   */
  var exit = function() {
    menu.style.display = "none";
  }
    
  /* 
   * The update() method updates the menu
   * (in this case, a no-op)
   */
  var update = function() {}
  
  /* 
   * The render() method renders the menu
   * (in this case, a no-op as the menu is 
   * HTML elements renderd by the DOM)
   */
  var render = function() {}
    
  /* 
   * The keyDown() method handles 
   * the key down event for the menu.
   */
  var keyDown = function(event) {
    switch(event.keyCode) {
      case 13: // ENTER
      case 32: // SPACE
        event.preventDefault();
        var me = new MouseEvent('click', {
          'view': window,
          'bubbles': true,
          'cancelable': true
        });
        items[selectedItemIndex].dispatchEvent(me);
        break;      
      case 27: // ESC
        event.preventDefault();
        stateManager.popState();
        break;
      case 40: // up
        event.preventDefault();
        items[selectedItemIndex].classList.remove("selected");
        selectedItemIndex++;
        if(selectedItemIndex >= items.length) selectedItemIndex = 0;
        items[selectedItemIndex].classList.add("selected");
        break;
      case 38: // down
        event.preventDefault();
        items[selectedItemIndex].classList.remove("selected");
        selectedItemIndex--;
        if(selectedItemIndex < 0) selectedItemIndex = items.length - 1;
        items[selectedItemIndex].classList.add("selected");
        break;
    }
  }
  
  /* The keyUp() method handles the key up event */
  function keyUp(event) {}
  
  return {
    load: load,
    exit: exit,
    update: update,
    render: render,
    keyDown: keyDown,
    keyUp: keyUp
  }
  
})();
},{"./credits-screen":2}],7:[function(require,module,exports){


// Wait for the window to load completely
window.onload = function() {
  
  var gameTime = 0,
      gameState = [];
    
  var pushState = function(state) {
    state.load({pushState: pushState, popState: popState});
    gameState.push(state);
  }
  
  var popState = function() {
    state = gameState.pop(); 
    if(state) state.exit();
    return state;
  }
  
  var game = require('./game');
  pushState(game);
  
  var mainMenu = require('./main-menu');
  pushState(mainMenu);
  
  // Event handlers for key events
  window.onkeydown = function(event) {
    gameState[gameState.length-1].keyDown(event);
  }
  window.onkeyup = function(event) {
    gameState[gameState.length-1].keyUp(event);
  }
  
  function loop(newTime) {
    var elapsedTime = (newTime - gameTime) / 1000;
    gameTime = newTime;
    gameState[gameState.length-1].update(elapsedTime);
    gameState[gameState.length-1].render(elapsedTime);
    window.requestAnimationFrame(loop);
  }
  window.requestAnimationFrame(loop);
  
};
},{"./game":4,"./main-menu":6}],8:[function(require,module,exports){
module.exports = (function(){
  // Initially, we start with a random seed
  var seed = Math.random();
  
  /* Seeds the random number generator
   * params:
   * - newSeed - the seed to use
   */
  function setSeed(newSeed) {
    seed = newSeed;
  }
  
  /* Taken from http://indiegamr.com/generate-repeatable-random-numbers-in-js/ */
  function randomNumber(min, max){
    min = min || 0;
    max = max || 1;
    
    seed = (seed * 9301 + 49297) % 233280;
    var random = seed/233280;
    
    return min + random * (max - min);
  }

  /* The following functions were done in tandem with the tutorial at 
  http://devmag.org.za/2009/04/25/perlin-noise/ and following along through
  Nathan Bean's Perlin Noise file*/

  function generateNoise(width, height){
    var noise = new Array(width*height);
    
    for (i = 0; i < width; i++){
      for (j = 0; j < height; j++){
        noise[j * width + i] = (randomNumber(0, 1269.5));
      }
    }
    
    return noise;
  }

  function generateSmoothNoise(mapWidth, noise, octave){
    var width = mapWidth;
    var height = noise.length / width;
    
    var smoothNoise = new Array(width*height);
    
    var samplePeriod = Math.floor(Math.pow(2, octave));
    var sampleFrequency = 1.0 / samplePeriod;
    
    for (i = 0; i < width; i++){
      var sample_i0 = Math.floor(Math.floor(i / samplePeriod) * samplePeriod);
      var sample_i1 = Math.floor((sample_i0 + samplePeriod) % width);
      var horizontal_blend = (i - sample_i0) * sampleFrequency;
      
      for (j = 0; j < height; j++){
        var sample_j0 = Math.floor(Math.floor(j / samplePeriod) * samplePeriod);
        var sample_j1 = Math.floor((sample_j0 + samplePeriod) % height);
        var vertical_blend = (j - sample_j0) * sampleFrequency;
        
        var top = Interpolate(noise[sample_j0 * width + sample_i0], 
          noise[sample_j0 * width + sample_i1], horizontal_blend);
        
        var bottom = Interpolate(noise[sample_j1 * width + sample_i0], 
          noise[sample_j1 * width + sample_i1], horizontal_blend);
      
        smoothNoise[j * width + i] = Interpolate(top, bottom, vertical_blend);
      }
    }
    
    return smoothNoise;
  }

  function Interpolate(x0, x1, alpha){
    return x0 * (1-alpha) + alpha * x1;
  }

  function generatePerlinNoise(mapWidth, noise, octave){
    var width = mapWidth;
    var height = noise.length / width;
    
    var smoothNoise = new Array(octave);
    
    var persistance = 0.5;
    
    for (x = 0; x < octave; x++){
      smoothNoise[x] = generateSmoothNoise(mapWidth, noise, x);}
    
    var perlinNoise = new Array(width*height);
    var amplitude = 1.0;
    var totalAmplitude = 0.0;
    
    for (o = octave - 1; o >= 0; o--){
      amplitude *= persistance;
      totalAmplitude += amplitude;
      
      for (i = 0; i < width; i++){
        for (j = 0; j < height; j++){
          perlinNoise[j * width + i] = smoothNoise[o][j * width + i] * amplitude;
        }
      }
    }
    
    for (i = 0; i < width; i++){
      for (j = 0; j < height; j++){
        perlinNoise[j * width + i] = perlinNoise[j * width + i] / totalAmplitude;
      }
    }
    
    return perlinNoise;
  }
  /*END PERLIN NOISE TUTORIAL/CODE*/
  
  return {
    setSeed: setSeed,
    randomNumber: randomNumber,
    generateNoise: generateNoise,
    generateSmoothNoise: generateSmoothNoise,
    generatePerlinNoise: generatePerlinNoise,
  }

}());
},{}],9:[function(require,module,exports){
/* Player module
 * Authors:
 * - Wyatt Watson
 * - Nathan Bean
 */
module.exports = (function(){
  var Entity = require('./entity.js'),
      Animation = require('./animation.js');
  
  /* The following are player States (Swimming is not implemented) */
  const STANDING = 0;
  const WALKING = 1;
  const JUMPING = 2;
  const DIGGING = 3;
  const FALLING = 4;
  const SWIMMING = 5;

  // The Sprite Size
  const SIZE = 64;

  // Movement constants
  const SPEED = 150;
  const GRAVITY = -0.5;
  
  //The Right facing dwarf spritesheet
  var dwarfRight = new Image();
  dwarfRight.src = 'DwarfAnimatedRight.png';

  //The left facing dwarf spritesheet
  var dwarfLeft = new Image();
  dwarfLeft.src = "DwarfAnimatedLeft.png";

  //The Player constructor
  function Player(locationX, locationY, layerIndex, inputManager) {
    this.inputManager = inputManager
    this.state = WALKING; 
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
    
    //The animations
    this.animations = {
      left: [],
      right: [],
    }
    
    //The right-facing animations
    this.animations.right[STANDING] = new Animation(dwarfRight, SIZE, SIZE, SIZE*2, SIZE);
    this.animations.right[WALKING] = new Animation(dwarfRight, SIZE, SIZE, 0, 0, 4);
    this.animations.right[JUMPING] = new Animation(dwarfRight, SIZE, SIZE, SIZE*3, 0);
    this.animations.right[DIGGING] = new Animation(dwarfRight, SIZE, SIZE, 0, SIZE*2, 4);
    this.animations.right[FALLING] = new Animation(dwarfRight, SIZE, SIZE, SIZE, SIZE);
    this.animations.right[SWIMMING] = new Animation(dwarfRight, SIZE, SIZE, 0, 0, 4);
    
    //The left-facing animations
    this.animations.left[STANDING] = new Animation(dwarfLeft, SIZE, SIZE, SIZE*2, SIZE);
    this.animations.left[WALKING] = new Animation(dwarfLeft, SIZE, SIZE, 0, 0, 4);
    this.animations.left[JUMPING] = new Animation(dwarfLeft, SIZE, SIZE, SIZE*3, 0);
    this.animations.left[DIGGING] = new Animation(dwarfLeft, SIZE, SIZE, 0, SIZE*2, 4);
    this.animations.left[FALLING] = new Animation(dwarfLeft, SIZE, SIZE, SIZE, SIZE);
    this.animations.left[SWIMMING] = new Animation(dwarfLeft, SIZE, SIZE, 0, 0, 4);
  }
  
  // Player inherits from Entity
  Player.prototype = new Entity();
  
  Player.prototype.onGround = function(tilemap) {
    var box = this.boundingBox(),
        tileX = Math.floor((box.left + (SIZE/2))/64),
        tileY = Math.floor(box.bottom / 64) + 1,
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);   
    console.log(tile);
    // find the tile we are standing on.
    return (tile && tile.solid);
  }
  
  
  // Player update function
  Player.prototype.update = function(elapsedTime, tilemap) {
    var sprite = this;
    
    // The "with" keyword allows us to change the
    // current scope, i.e. 'this' becomes our 
    // inputManager
    with (this.inputManager) {
    
      // Process player state
      switch(sprite.state) {
        case STANDING:
        case WALKING:
          // If there is no ground underneath, fall
          if(sprite.onGround(tilemap)) {
            sprite.state = FALLING;
          } else {
            if(isKeyDown(commands.DIG)) {
              sprite.state = DIGGING;
            }
            else if(isKeyDown(commands.UP)) {
              sprite.state = JUMPING;
              sprite.velocityY = SPEED * 50;
            }
            else if(isKeyDown(commands.LEFT)) {
              sprite.isLeft = true;
              sprite.state = WALKING;
              sprite.currentX -= elapsedTime * SPEED;
            }
            else if(isKeyDown(commands.RIGHT)) {
              sprite.isLeft = false;
              sprite.state = WALKING;
              sprite.currentX += elapsedTime * SPEED;
            }
            else {
              sprite.state = STANDING;
            }
          }
          break;
        case DIGGING:
        case JUMPING:
          sprite.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
          sprite.currentY -= sprite.velocityY * elapsedTime;
          if(sprite.velocityY < 0) {
            sprite.state = FALLING;
          }
          if(isKeyDown(commands.LEFT)) {
            sprite.isLeft = true;
            sprite.currentX -= elapsedTime * SPEED;
          }
          if(isKeyDown(commands.RIGHT)) {
            sprite.isLeft = true;
            sprite.currentX += elapsedTime * SPEED;
          }
          break;
        case FALLING:
          sprite.velocityY += Math.pow(GRAVITY * elapsedTime, 2);
          sprite.currentY -= sprite.velocityY * elapsedTime;
          if(sprite.onGround(tilemap)) {
            sprite.state = STANDING;
          }
          else if(isKeyDown(commands.LEFT)) {
            sprite.isLeft = true;
            sprite.currentX -= elapsedTime * SPEED;
          }
          else if(isKeyDown(commands.RIGHT)) {
            sprite.isLeft = false;
            sprite.currentX += elapsedTime * SPEED;
          }
          break;
        case SWIMMING:
          // NOT IMPLEMENTED YET
      }
      
      // Swap input buffers
      swapBuffers();
    }
      
    //console.log(this.isLeft);
       
    // Update animation
    if(this.isLeft)
      this.animations.left[this.state].update(elapsedTime);
    else
      this.animations.right[this.state].update(elapsedTime);
    
  }
  
  // Player Render Function
  Player.prototype.render = function(ctx, debug) {
    // Draw the player (and the correct animation)
    if(this.isLeft)
      this.animations.left[this.state].render(ctx, this.currentX, this.currentY);
    else
      this.animations.right[this.state].render(ctx, this.currentX, this.currentY);
    
    if(debug) {
      var bounds = this.boundingBox();
      ctx.save();
      ctx.strokeStyle = "red";
      ctx.beginPath();
      ctx.moveTo(bounds.left, bounds.top);
      ctx.lineTo(bounds.right, bounds.top);
      ctx.lineTo(bounds.right, bounds.bottom);
      ctx.lineTo(bounds.left, bounds.bottom);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  }
  
  // Player BoundingBox Function
  Player.prototype.boundingBox = function() {
    return {
      left: this.currentX,
      top: this.currentY,
      right: this.currentX + SIZE,
      bottom: this.currentY + SIZE
    }
  }
  
  return Player;

}());
},{"./animation.js":1,"./entity.js":3}],10:[function(require,module,exports){
// Tilemap engine defined using the Module pattern
module.exports = (function (){
  var noisy = require('./noise.js'),
      tiles = [],
      tilesets = [],
      layers = [],
      tileWidth = 0,
      tileHeight = 0,
      mapWidth = 0,
      mapHeight = 0,
      cameraX = 0,
      cameraY = 0,
      viewportHalfWidth = 0,
      viewportHalfHeight = 0,
      viewportTileWidth = 0,
      viewportTileHeight = 0;
      
  function clamp(value, min, max) {
    return (value < min ? min : (value > max ? max : value));
  }
      
  var setViewportSize = function(width, height) {
    viewportHalfWidth = width / 2;
    viewportHalfHeight = height / 2;
    viewportTileWidth = Math.ceil(width / tileWidth) + 2;
    viewportTileHeight = Math.ceil(height / tileHeight) + 2;
    console.log("tile size", viewportTileWidth, viewportTileHeight);
  }
  
  var setCameraPosition = function(x, y) {
    cameraX = x;
    cameraY = y;
  }
      
  var load = function(mapData, options) {
      
    var loading = 0;
    
    // Release old tiles & tilesets
    tiles = [];
    tilesets = [];
    
    // Resize the map
    tileWidth = mapData.tilewidth;
    tileHeight = mapData.tileheight;
    mapWidth = mapData.width;
    mapHeight = mapData.height;
    
    if(options.viewport) 
      setViewportSize(options.viewport.width, options.viewport.height);
    else
      setViewportSize(mapData.width * mapData.tilewidth, mapData.height * mapData.tileheight);
    
    // Load the tileset(s)
    mapData.tilesets.forEach( function(tilesetmapData, index) {
      // Load the tileset image
      var tileset = new Image();
      loading++;
      tileset.onload = function() {
        loading--;
        if(loading == 0 && options.onload) options.onload();
      }
      tileset.src = tilesetmapData.image;
      tilesets.push(tileset);
      
      // Create the tileset's tiles
      var colCount = Math.floor(tilesetmapData.imagewidth / tileWidth),
          rowCount = Math.floor(tilesetmapData.imageheight / tileHeight),
          tileCount = colCount * rowCount;
      for(i = 0; i < tileCount; i++) {
        var tile = {
          // Reference to the image, shared amongst all tiles in the tileset
          image: tileset,
          // Source x position.  i % colCount == col number (as we remove full rows)
          sx: (i % colCount) * tileWidth,
          // Source y position. i / colWidth (integer division) == row number 
          sy: Math.floor(i / rowCount) * tileHeight,
          // Indicates a solid tile (i.e. solid property is true).  As properties
          // can be left blank, we need to make sure the property exists. 
          // We'll assume any tiles missing the solid property are *not* solid
          solid: (tilesetmapData.tileproperties[i] && tilesetmapData.tileproperties[i].solid == "true") ? true : false
        }
        tiles.push(tile);
      }
    });
    
    // Parse the layers in the map
    mapData.layers.forEach( function(layerData) {
      
      // Tile layers need to be stored in the engine for later
      // rendering
      if(layerData.type == "tilelayer") {
        // Create a layer object to represent this tile layer
        var layer = {
          name: layerData.name,
          width: layerData.width,
          height: layerData.height,
          visible: layerData.visible
        }
      
        // Set up the layer's data array.  We'll try to optimize
        // by keeping the index data type as small as possible
        if(tiles.length < Math.pow(2,8))
          layer.data = new Uint8Array(layerData.data);
        else if (tiles.length < Math.Pow(2, 16))
          layer.data = new Uint16Array(layerData.data);
        else 
          layer.data = new Uint32Array(layerData.data);
      
        // save the tile layer
        layers.push(layer);
      }
    });
  }

  var generate = function(width, height, options) {
    var map = new Array(width*height);
    var noise = noisy.generateNoise(width, height);
    noise = noisy.generatePerlinNoise(width, noise, 7);
    
    var tileWidth = 64, tileHeight = 64;
    var tilesets = [
      {
        firstgid: 0,
        image: "Tileset.png",
        imageheight: 256,
        imagewidth: 256,
        margin: 0,
        name: "Tileset",
        tileproperties: {
          2: { // Sky Earth
            solid: true
          },
          3: { // Gems w grass
            solid: true,
            gems: true
          },
          4: { // Dirt w grass
            solid: true
          },
          5: { // Stone w grass
            solid: true
          },
          6: { // Water
            liquid: true
          },
          8: { // Gems
            gems: true
          },
          9: { // dirt
            solid: true,
          },
          10: { // stone
            solid: true,
          },
          11: { // water
            liquid: true
          },
          13: { // lava
            liquid: true,
            damage: 10,
          }
          
        },
        spacing: 0,
        tilewidth: 64,
        tileheight: 64
      }
    ]
    
    // Determines where the surface is (and end of the sky)
    var surface = Math.floor(noisy.randomNumber(Math.floor(height*1/8), Math.floor(height*2/8)));  
    
    // Determines where the crust layer of the earth ends
    var midEarth = Math.floor(noisy.randomNumber(Math.floor(height*3/8), Math.floor(height*5/8)) + surface);
	
    // Used to help clump up the sky islands
    var skyEarthCount = 0;
    var cloudCount = 0;
  
    /* As a key the tile numbers are as follows:
     * SkyBackground: 0, Clouds: 1, SkyEarth: 2, GemsWithGrass: 3, DirtWithGrass: 4, StoneWithGrass: 5, Water: 6,
     * CaveBackground: 7, Gems: 8, Dirt: 9, Stone: 10, Water(Again): 11, CaveBackground(Again): 12, Lava: 13, DarkBackground: 14, DugTile: 15
     * you can replace any of the tiles that are unwanted (or wanted) at any point and it will preserve initial functionality*/
    for(j = 0; j < height; j++){
      var rand = noisy.randomNumber(0, 3);
      var rand2 = noisy.randomNumber(0, 1);
      for(i = 0; i < width; i++){
        var index = j * width + i;
        var temp = noise[index];
        //Ensure first row is sky
        if(j == 0){
          map[index] = 0;
        }
        //Sky Area
        else if(j < surface-2){
          if(temp < 8 && skyEarthCount == 0 && cloudCount == 0){ //Sky Background
            map[index] = 0;
          }
          else if(temp < 9.4 && skyEarthCount == 0){ //Clouds
            map[index] = 1;
            cloudCount++;
            if(cloudCount > rand2){
              rand2 = noisy.randomNumber(0, 3);
              cloudCount = 0;
            }
          }
          else{ //Sky Earth
            map[index] = 2;
            skyEarthCount++;
            if(skyEarthCount > rand){
              skyEarthCount = 0;
              rand = noisy.randomNumber(0, 3);
            }
          }
        }
        //Ensure row before the surface is sky
        else if(j < surface){
          map[index] = 0;
        }
        //Surface blocks - Start of Crust Layer
        else if(j == surface){ 
          if(temp < .5){ //Gems w grass
            map[index] = 4;
          }
          else if(temp < 4){ //Dirt w grass
            map[index] = 4;
          }
          else if(temp < 6){ //Stone w grass
            map[index] = 5;
          }
          else if(temp < 8){ //Water 6
            map[index] = 6;
          }
          else{ //Cave Background
            map[index] = 4;
          }
        }
        //Crust Area
        else if(j < midEarth-1){
          if(temp < .5){ //Gems
            map[index] = 8;
          }
          else if(temp < 4){ //Dirt
            map[index] = 9;
          }
          else if(temp < 6){ //Stone
            map[index] = 10;
          }
          else if(temp < 8){ //Water 11
            map[index] = 11;
          }
          else{ //Cave Background
            map[index] = 12;
          }
        }
        //Solid layer between crust and deep earth
        else if(j < midEarth){
          if(temp < .5){ //Gems
            map[index] = 8;
          }
          else if(temp < 4){ //Dirt
            map[index] = 9;
          }
          else if(temp < 6){ //Stone
            map[index] = 10;
          }
          else if(temp < 8){ //Water 11
            map[index] = 9;
          }
          else{ //Cave Background
            map[index] = 10;
          }
        }
        //Deep Earth
        else{
          if(temp < 4){ // Lava
            map[index] = 13;
          }
          else if(temp < 6){ // Stone
            map[index] = 10;
          }
          else{ // Dark Background
            map[index] = 14;
          }
        }
      }
    }
    
    // Create mapData object
    var mapData = {
      height: height,
      width: width,
      tilewidth: tileWidth,
      tileheight: tileHeight,
      layers: [{
          data: map,
          name: "Interaction Layer",
          type: "tilelayer",
          height: height,
          width: width,
          visible: true,
          x: 0,
          y: 0
      }],
      tilesets: tilesets,
      options: options
    }
    return load(mapData, options);
  }
  
  
  
  /* GenerateObjectMap generates an object map based on the previously generated game map
   * mapWidth - the overall map's width
   * map - the game map
   * returns: the object map */
  function GenerateObjectMap(mapWidth, map){
    var width = mapWidth;
    var height = map.length / width;

    /* 0 - SB, 1 - C, 2 - SE
       3 - G, 4 - D, 5 - S, 6 - W, 7 - CB
       8      9      10     11     12
       13 - L, 14 - S, 15 - DB */
    
    var objectMap = new Array(width*height);
    var surface = 0;
    
    /* 0 - Nothing
       1 - Player
       2 - Enemy */
    
    /* place enemies (NOT FULLY IMPLEMENTED) and locates the surface of the game map */
    for(i = 0; i < width; i++){
      for(j = 0; j < height; j++){
        var temp = map[j * width + 1];
        var num = noisy.randomNumber(0, 10);
        if(temp < 3){
          if(temp == 2 && j > 0){
            if(num > 9.8)
              objectMap[j-1 * width + i] = 2;
          }
        }
        else if(temp > 2 && temp < 13){
          if(surface == 0)
            surface = j-1;
          if(temp == 7 || temp == 12){
            if(num > 9.8)
              objectMap[j * width + i] = 2;
          }
        }
        else{
          if(temp == 15){
            if(num > 9.8)
              objectMap[j * width + i] = 2;
          }
        }
      }
    }
    
    /*Place player in the middle*/
    objectMap[surface * width + width/2] = 1;
    return objectMap;
  }
  
  /* */
  var render = function(screenCtx) {
    // Render tilemap layers - note this assumes
    // layers are sorted back-to-front so foreground
    // layers obscure background ones.
    // see http://en.wikipedia.org/wiki/Painter%27s_algorithm
    layers.forEach(function(layer){
      // Only draw layers that are currently visible
      if(layer.visible) { 
        
        // Only draw tiles that are within the viewport
        var startX =  clamp(Math.floor((cameraX - viewportHalfWidth) / tileWidth) - 1, 0, layer.width);
        var startY =  clamp(Math.floor((cameraY - viewportHalfHeight) / tileHeight) - 1, 0, layer.height);
        var endX = clamp(startX + viewportTileWidth + 1, 0, layer.width);
        var endY = clamp(startY + viewportTileHeight + 1, 0, layer.height);
        
        for(y = startY; y < endY; y++) {
          for(x = startX; x < endX; x++) {
            var tileId = layer.data[x + layer.width * y];
            
            // tiles with an id of < 0 don't exist
            if(tileId >= 0) {
              var tile = tiles[tileId];
              if(tile.image) { // Make sure the image has loaded
                screenCtx.drawImage(
                  tile.image,     // The image to draw 
                  tile.sx, tile.sy, tileWidth, tileHeight, // The portion of image to draw
                  x*tileWidth, y*tileHeight, tileWidth, tileHeight // Where to draw the image on-screen
                );
              }
            }
            
          }
        }
      }
      
    });
  }
  
  var tileAt = function(x, y, layer) {
    // sanity check
    if(layer < 0 || x < 0 || y < 0 || layer >= layers.length || x > mapWidth || y > mapHeight) 
      return undefined;  
    return tiles[layers[layer].data[x + y*mapWidth] - 1] || {};
  }
  
  // Expose the module's public API
  return {
    load: load,
    generate: generate,
    render: render,
    tileAt: tileAt,
    setViewportSize: setViewportSize,
    setCameraPosition: setCameraPosition
  }
  
  
})();
},{"./noise.js":8}],11:[function(require,module,exports){
// Modifed example_tilemap.json by adding an export declaration
// and saving as a JavaScript file

module.exports = { 
 "height":10,
 "layers":[
        {
         "data":[3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 2, 2, 2, 2, 2, 2, 3, 3, 2, 4, 4, 1, 4, 2, 2, 2, 3, 3, 2, 2, 2, 2, 4, 4, 4, 2, 3, 3, 2, 2, 2, 2, 2, 2, 1, 2, 3, 3, 3, 1, 3, 2, 2, 2, 4, 4, 3, 3, 2, 2, 3, 2, 3, 2, 2, 4, 4, 3, 2, 2, 3, 2, 3, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
         "height":10,
         "name":"Tile Layer 1",
         "opacity":1,
         "type":"tilelayer",
         "visible":true,
         "width":10,
         "x":0,
         "y":0
        }],
 "orientation":"orthogonal",
 "properties":
    {

    },
 "renderorder":"right-down",
 "tileheight":64,
 "tilesets":[
        {
         "firstgid":1,
         "image":"tilesets\/example.png",
         "imageheight":130,
         "imagewidth":128,
         "margin":0,
         "name":"example",
         "properties":
            {

            },
         "spacing":0,
         "tileheight":64,
         "tileproperties":
            {
             "2":
                {
                 "solid":"true"
                }
            },
         "tilewidth":64
        }],
 "tilewidth":64,
 "version":1,
 "width":10
}
},{}]},{},[7]);
