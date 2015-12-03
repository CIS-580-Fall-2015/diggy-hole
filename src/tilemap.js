/* Tilemap engine providing the static world
 * elements for Diggy Hole
 * Authors:
 * - Nathan Bean
 * - Wyatt Watson
 */

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
      viewportTileHeight = 0,
      tileset;

    var parallaxBackground = new Image();
    parallaxBackground.src = "./img/background.png";
    var bigclouds = new Image();
    bigclouds.src = "./img/backclouds.png";
    var smallclouds = new Image();
    smallclouds.src = "./img/frontclouds.png";

    var cloudlaxscalars = {};
    var cloudxs = {};
    var cloudys = {};
    var cloudsize = {};

    var smallcloudlaxscalars = {};
    var smallcloudxs = {};
    var smallcloudys = {};
    var smallcloudsize = {};

  /* Clamps the provided value to the provided range
   * Arguments:
   * - value, the value to clamp
   * - min, the minimum of the range to clamp value to
   * - max, the maximum of the range to clamp value to
   * Returns:
   *   The clamped value.
   */
  function clamp(value, min, max) {
    return (value < min ? min : (value > max ? max : value));
  }

  /* Resizes the viewport.
   * Arguments:
   * - width, the width of the viewport
   * - height, the height of hte viewport
   */
  var setViewportSize = function(width, height) {
    viewportHalfWidth = width / 2;
    viewportHalfHeight = height / 2;
    viewportTileWidth = Math.ceil(width / tileWidth) + 2;
    viewportTileHeight = Math.ceil(height / tileHeight) + 2;
  };

  var getViewPort = function() {
      var pos = getCameraPosition();
      return {
          left: pos[0],
          right: pos[0] + 2 * viewportHalfWidth,
          top: pos[1],
          bottom: pos[1] + 2 * viewportHalfHeight,
      };
  };


  /* Sets the camera position
   * Arguments:
   * - x, the upper-left hand x-coordinate of the viewport
   * - y, the upper-left-hand y-coordinate of the viewport
   */
  var setCameraPosition = function(x, y) {
    cameraX = x;
    cameraY = y;
 };

  /**
   * Function: getCameraPosition
   *     gets the x-y position of the viewport
   * Returns:
   *     x-y postion
   */
  var getCameraPosition = function() {
    return [cameraX - viewportHalfWidth, cameraY - viewportHalfHeight];
  };

  /* Loads the tilemap
   * - mapData, the JavaScript object
   * - options, options for loading, currently:
   *  > onload, a callback to trigger once the load finishes
   */
  var load = function(mapData, options) {
    // Make some random background big clouds
    for (var i = 0; i < 30; i++) {
      cloudlaxscalars[i] = Math.random();
      while (cloudlaxscalars[i]<0.3 || cloudlaxscalars[i]>0.66)
        cloudlaxscalars[i] = Math.random();
      cloudxs[i]=4000*Math.random();
      cloudys[i]=13000*Math.random();
      cloudsize[i] = 0.7+Math.random();
    }

    //Make some random foreground big clouds
    for (var i = 0; i < 250; i++) {
      smallcloudlaxscalars[i] = 1+ 2.5* Math.random();
      // (cloudlaxscalars[i]<0.3 || cloudlaxscalars[i]>0.66)
      //  cloudlaxscalars[i] = Math.random();
      smallcloudxs[i]=5000*Math.random()-1000;
      smallcloudys[i]=28000*Math.random();
      smallcloudsize[i] = 0.7+Math.random();
    }
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
      tileset = new Image();
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
        var data = {}
        for (var key in tilesetmapData.tileproperties[i]) {
          data[key] = tilesetmapData.tileproperties[i][key];
        }
        var tile = {
          // Reference to the image, shared amongst all tiles in the tileset
          image: tileset,
          // Source x position.  i % colCount == col number (as we remove full rows)
          sx: (i % colCount) * tileWidth,
          // Source y position. i / colWidth (integer division) == row number
          sy: Math.floor(i / rowCount) * tileHeight,
          // The tile's data (solid/liquid, etc.)
          data: data
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

  /* Generates a random tilemap
   * Arguments:
   * - width, the width of the tilemap
   * - height, the height of the tilemap
   * - options, options to trigger
   */
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
          0: { // Sky background
            type: "SkyBackground",
            notDiggable: true
          },
          1: { // Clouds
            type: "Clouds",
            notDiggable: true
          },
          2: { // Sky Earth
            type: "Sky Earth",
            solid: true
          },
          3: { // Gems w grass
            type: "GemsWithGrass",
            solid: true,
            gems: true
          },
          4: { // Dirt w grass
            type: "DirtWithGrass",
            solid: true
          },
          5: { // Stone w grass
            type: "StoneWithGrass",
            solid: true,
            notDiggable: true
          },
          6: { // Water
            type: "Water",
            liquid: true,
            notDiggable: true
          },
          7: { // Cave background
            type: "CaveBackground",
            notDiggable: true
          },
          8: { // Gems
            type: "Gems",
            solid: true,
            gems: true
          },
          9: { // dirt
            type: "Dirt",
            solid: true,
          },
          10: { // stone
            type: "Stone",
            solid: true,
            notDiggable: true
          },
          11: { // water
            type: "Water",
            liquid: true,
            notDiggable: true
          },
          12: { // cave background
            type: "CaveBackground",
            notDiggable: true
          },
          13: { // lava
            type: "Lava",
            liquid: true,
            damage: 10,
            notDiggable: true
          },
          14: { // dark background
            type: "DarkBackground",
            notDiggable: true
          },
          15: { // dug background
            type: "DugBackground",
            notDiggable: true
          }
        },
        spacing: 0,
        tilewidth: 64,
        tileheight: 64
      }
    ]

    // Determines where the surface is (and end of the sky)
    var surface = Math.floor(noisy.randomNumber(Math.floor(height*1/8), Math.floor(height*2/8)));
    this.surface = surface;
    // Determines where the crust layer of the earth ends
    var midEarth = Math.floor(noisy.randomNumber(Math.floor(height*3/8), Math.floor(height*5/8)) + surface);
    this.midEarth = midEarth;
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
          map[index] = 1;
        }
        //Sky Area
        else if(j < surface-2){
          if(temp < 8 && skyEarthCount == 0 && cloudCount == 0){ //Sky Background
            map[index] = 1;
          }
          else if(temp < 9.4 && skyEarthCount == 0){ //Clouds
            map[index] = 2;
            cloudCount++;
            if(cloudCount > rand2){
              rand2 = noisy.randomNumber(0, 3);
              cloudCount = 0;
            }
          }
          else{ //Sky Earth
            map[index] = 3;
            skyEarthCount++;
            if(skyEarthCount > rand){
              skyEarthCount = 0;
              rand = noisy.randomNumber(0, 3);
            }
          }
        }
        //Ensure row before the surface is sky
        else if(j < surface){
          map[index] = 1;
        }
        //Surface blocks - Start of Crust Layer
        else if(j == surface){
          if(temp < .5){ //Gems w grass
            map[index] = 4;
          }
          else if(temp < 5){ //Dirt w grass
            map[index] = 5;
          }
          else if(temp < 6){ //Stone w grass
            map[index] = 6;
          }
          else if(temp < 8){ //Water
            map[index] = 7;
          }
          else{ //Cave Background
            map[index] = 13;
          }
        }
        //Crust Area
        else if(j < midEarth-1){
          if(temp < .5){ //Gems
            map[index] = 9;
          }
          else if(temp < 4){ //Dirt
            map[index] = 10;
          }
          else if(temp < 6){ //Stone
            map[index] = 11;
          }
          else if(temp < 8){ //Water 11
            map[index] = 12;
          }
          else{ //Cave Background
            map[index] = 13;
          }
        }
        //Solid layer between crust and deep earth
        else if(j < midEarth){
          if(temp < .5){ //Gems
            map[index] = 9;
          }
          else if(temp < 4){ //Dirt
            map[index] = 10;
          }
          else if(temp < 6){ //Stone
            map[index] = 11;
          }
          else if(temp < 8){ //Water 11
            map[index] = 10;
          }
          else{ //Cave Background
            map[index] = 11;
          }
        }
        //Deep Earth
        else{
          if(temp < 4){ // Lava
            map[index] = 14;
          }
          else if(temp < 6){ // Stone
            map[index] = 11;
          }
          else{ // Dark Background
            map[index] = 15;
          }
        }

      }
    }

    for(var x = 0; x < height/20; x++){
      map = consolidateLiquids(map, width, height, width-1, 0, 0, height-1, width, 2);
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

  function shiftWaterDown(map, width, height, rightStart, bottomStart, viewWidth, viewHeight){
    for(var j = bottomStart; j > bottomStart-viewHeight; j--){
      for(var i = rightStart; i > rightStart-viewWidth; i--){
        index = j*width + i;
        if(map[index] == 6+1 || map[index] == 11+1 || map[index] == 13+1){
          if(map[index+height] == 14+1 || map[index+height] == 12+1 || map[index+height] == 7+1 || map[index+height] == 15+1){
            var temp = map[index];
            map[index] = map[index+height];
            map[index+height] = temp;
          }
        }
      }
    }

    return map;
  }

  function shiftWaterRight(map, width, height, leftStart, topStart, viewWidth, viewHeight){
    for(var i = leftStart; i < leftStart+viewWidth; i++){
      for(var j = topStart; j < topStart+viewHeight; j++){
        index = j*width + i;
        if(map[index] == 6+1 || map[index] == 11+1 || map[index] == 13+1 /*&& index+1 < width*/){
          if(map[index+1] == 14+1 || map[index+1] == 12+1|| map[index+1] == 7+1|| map[index+1] == 15+1){
            var temp = map[index];
            map[index] = map[index+1];
            map[index+1] = temp;
          }
        }
      }
    }

    return map;
  }

  function shiftWaterLeft(map, width, height, leftStart, topStart, viewWidth, viewHeight){
    for(var j = topStart; j < topStart+viewHeight; j++){
      for(var i = leftStart; i < leftStart+viewWidth; i++){
        index = j*width + i;
        if(map[index] == 6+1 || map[index] == 11+1 || map[index] == 13+1 /*&& index+1 < width*/){
          if(map[index-1] == 14+1 || map[index-1] == 12+1|| map[index-1] == 7+1 || map[index-1] == 15+1){
            var temp = map[index];
            map[index] = map[index-1];
            map[index-1] = temp;
          }
        }
      }
    }

    return map;
  }

  // Consolidate Liquids and called shifting functions made by Wyatt Watson
  function consolidateLiquids(map, width, height, rightStart, leftStart, topStart, bottomStart, viewWidth, viewHeight){
    for(var i = 0; i < viewHeight; i++){
      //Shift Down
      map = shiftWaterDown(map, width, height, rightStart+3, bottomStart+3, viewWidth+6, viewHeight+6);
      //Shift Right
      map = shiftWaterRight(map, width, height, leftStart-3, topStart-3, viewWidth+6, viewHeight+6);
    }
    for(var i = 0; i < viewHeight; i++){
      //Shift Down
      map = shiftWaterDown(map, width, height, rightStart+3, bottomStart+3, viewWidth+6, viewHeight+6);
      //Shift Right
      map = shiftWaterLeft(map, width, height, leftStart-3, topStart-3, viewWidth+6, viewHeight+6);
    }
    return map;
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

// Added by Wyatt Watson
  var update = function(){
    layers.forEach(function(layer){
      var startX =  clamp(Math.floor(((cameraX - 32) - viewportHalfWidth) / tileWidth) - 1, 0, layer.width);
      var startY =  clamp(Math.floor((cameraY - viewportHalfHeight) / tileHeight) - 1, 0, layer.height);
      var endX = clamp(startX + viewportTileWidth + 1, 0, layer.width);
      var endY = clamp(startY + viewportTileHeight + 1, 0, layer.height);

      consolidateLiquids(layer.data, layer.width, layer.height, endX, startX, startY, endY, endX-startX, endY-startY);
    });
  }

  /*Karenfang*/
  var renderWater = function(screenCtx){
    layers.forEach(function(layer){
      var startX =  clamp(Math.floor(((cameraX - 32) - viewportHalfWidth) / tileWidth) - 1, 0, layer.width);
      var startY =  clamp(Math.floor((cameraY - viewportHalfHeight) / tileHeight) - 1, 0, layer.height);
      var endX = clamp(startX + viewportTileWidth + 1, 0, layer.width);
      var endY = clamp(startY + viewportTileHeight + 1, 0, layer.height);

      var map = layer.data;

      for(var i = startX; i < endX; i++){
        for(var j = startY; j < endY; j++){
          index = j*layer.width + i;
          //Todo: Lava covered by red
          if(map[index] == 6+1 || map[index] == 11+1){
            screenCtx.fillStyle="rgba(142,167,214,0.3)"; //color similar but lighter than the water tile
            screenCtx.fillRect(i*tileWidth,j*tileHeight,tileWidth,tileHeight);
          }else if (map[index] == 13+1) {
            screenCtx.fillStyle="rgba(182,56,46,0.3)"; //color similar but lighter than the lava tile
            screenCtx.fillRect(i*tileWidth,j*tileHeight,tileWidth,tileHeight);
          }
        }
      }

    });
  };

  /* */
  var render = function(screenCtx) {
    // Render tilemap layers - note this assumes
    // layers are sorted back-to-front so foreground
    // layers obscure background ones.
    // see http://en.wikipedia.org/wiki/Painter%27s_algorithm

    // For continuous scrolling
    var offsety = cameraY%(600);
    var offsetx = cameraX%600;

    // For parallax effect


    var alerted = false;
    if (!alerted) {
      //console.log("zomg: " + offset + "___" + cameraY);
      alerted = true;
    }

    // Starry night

    //console.log(cameraX);
    for (var i = -1; i*600+cameraY*0.3 < cameraY+1000; i++) {
      for (var j = -1; j*600+cameraX*0.3 < cameraX+2000; j++) {
        screenCtx.drawImage(parallaxBackground,j*600+cameraX*0.3,i*600+cameraY*0.3,600,600);
      }
    }

    // Ground is at 14912 +/- camera size

    // Big far clouds
    for (var i = 0; i < 30; i++) {

      screenCtx.drawImage(bigclouds,cloudxs[i]+cameraX*cloudlaxscalars[i],cloudys[i]+cameraY*cloudlaxscalars[i],1500*cloudsize[i],1500*cloudsize[i]);
    }

    // Small close clouds
    //screenCtx.drawImage(bigclouds,cameraX,cameraY,800,400);

    layers.forEach(function(layer){
      // Only draw layers that are currently visible
      if(layer.visible) {

        // Only draw tiles that are within the viewport
        var startX =  clamp(Math.floor(((cameraX - 32) - viewportHalfWidth) / tileWidth) - 1, 0, layer.width);
        var startY =  clamp(Math.floor((cameraY - viewportHalfHeight) / tileHeight) - 1, 0, layer.height);
        var endX = clamp(startX + viewportTileWidth + 1, 0, layer.width);
        var endY = clamp(startY + viewportTileHeight + 1, 0, layer.height);

        for(y = startY; y < endY; y++) {
          for(x = startX; x < endX; x++) {
            var tileId = layer.data[x + layer.width * y];

            // tiles with an id of < 0 don't exist
            if(tileId > 2) {
              var tile = tiles[tileId-1];
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

  var renderfrontclouds = function(screenCtx) {
    // Close fast small clouds
    for (var i = 0; i < 250; i++ ) {
      screenCtx.drawImage(smallclouds,smallcloudxs[i]+cameraX*smallcloudlaxscalars[i]*smallcloudsize[i]-3000,smallcloudys[i]-cameraY*smallcloudlaxscalars[i]+5000,300*smallcloudsize[i],100*smallcloudsize[i]);
    }
  }

  /* Returns the tile at a given position.
   * - x, the x coordinate of the tile
   * - y, the y coordinate of the tile
   * - layer, the layer of the tilemap
   */
  var tileAt = function(x, y, layer) {
    // sanity check
    if(layer < 0 || x < 0 || y < 0 || layer >= layers.length || x > mapWidth || y > mapHeight)
      return undefined;
    return tiles[layers[layer].data[x + y*mapWidth] - 1];
  }

  /*
   Changes the type of tile at a given position
   author: Alexander Duben
   */
  var setTileAt = function(newType, x,y, layer){
    if(layer < 0 || x < 0 || y < 0 || layer >= layers.length || x > mapWidth || y > mapHeight){
      return undefined;
    }else{
      var tile = {
        // Reference to the image, shared amongst all tiles in the tileset
        image: tileset,
        // Source x position.  i % colCount == col number (as we remove full rows)
        sx: x,
        // Source y position. i / colWidth (integer division) == row number
        sy: y,
        // The tile's data (solid/liquid, etc.)
        data: newType
      }
      layers[layer].data[x + y*mapWidth] = tile;
    }
  }

  // Sets tile to skies
  // author: Milan Zelenka
  var destroyTileAt = function(newType, x,y, layer){
    if(layer < 0 || x < 0 || y < 0 || layer >= layers.length || x > mapWidth || y > mapHeight){
      return undefined;
    }else{
      layers[layer].data[x + y * mapWidth] = 1;
    }
  }

  //Dig tile out at x, y
  var removeTileAt = function(x, y, layer) {
    if(layer < 0 || x < 0 || y < 0 || layer >= layers.length || x > mapWidth || y > mapHeight)
      return undefined;
    layers[layer].data[x + y*mapWidth] =  16;
  }

  //return current tile layer, 0: sky, 1: crust 2: magma
  //author: Shanshan Wu
  var returnTileLayer = function(x, y, layer) {
    if(layer < 0 || x < 0 || y < 0 || layer >= layers.length || x > mapWidth || y > mapHeight)
      return undefined;
    if (y < this.surface) {
      return 0;
    } else if ( y >= this.surface && y < this.midEarth) {
      return 1;
    } else {
      return 2;
    }
  };

  //change the type of tile in a given position.....duplicate of setTileAt
  //author: Shanshan Wu
  var mineAt = function(newType, x, y, layer, digAll) {
    if(layer < 0 || x < 0 || y < 0 || layer >= layers.length || x > mapWidth || y > mapHeight)
      return undefined;

    var tile = tileAt(x, y, layer);
    if(typeof(tile) !== "undefined" && tile.data.solid && ((!tile.data.notDiggable) || digAll))
      layers[layer].data[x + y * mapWidth] = newType;
  };

  // Expose the module's public API
  return {
    load: load,
    generate: generate,
    render: render,
    renderfrontclouds: renderfrontclouds,
    tileAt: tileAt,
    setTileAt: setTileAt,
    destroyTileAt: destroyTileAt,
    removeTileAt: removeTileAt,
    setViewportSize: setViewportSize,
    getViewPort: getViewPort,
    setCameraPosition: setCameraPosition,
    returnTileLayer: returnTileLayer,
    getCameraPosition: getCameraPosition,
    mineAt: mineAt,
    consolidateLiquids: consolidateLiquids,
    update: update,
    renderWater: renderWater
  }


})();
