/* Noise generation module
 * Authors:
 * - Nathan Bean
 * - Wyatt Watson
 */
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
      var map = new Array(width * height);

      for (var a = 0; a < height; a++){
          for (var b = 0; b < width; b++) {
              map[a*height + b] = Math.random();
          }
      }

      return map;
  }

  function generateSmoothNoise(x, y, width, height, noise) {
      var fractX = x - Math.floor(x);
      var fractY = y - Math.floor(y);

      var x1 = (Math.floor(x) + width) % width;
      var y1 = (Math.floor(y) + height) % height;

      var x2 = (x1 + width - 1) % width;
      var y2 = (y1 + height - 1) % height;

      var value = 0.0;
      value += fractX * fractY * noise[y1 * width + x1];
      value += fractX * (1 - fractY) * noise[y2 * width + x1];
      value += (1 - fractX) * fractY * noise[y1 * width + x2];
      value += (1 - fractX) * (1 - fractY) * noise[y2 * width + x2];

      return value;
  }

  function Interpolate(x0, x1, alpha){
    return x0 * (1-alpha) + alpha * x1;
  }

  function Turbulence(x, y, width, height, size, noise) {
      var value = 0.0, initialSize = size;

      while (size >= 1) {
          value += generateSmoothNoise(x / size, y / size, width, height, noise) * size;
          size /= 2.0;
      }

      return (128.0 * value / initialSize);
  }

  function generatePerlinNoise(map, width, height, noise) {
      var translate = [1,1,1,3,5,9,4,4,5,9,6,11,7,9,7,10];

      for (var a = 0; a < height; a++) {
          for (var b = 0; b < width; b++) {
              map[a * width + b] = translate[Math.floor(Clamp(Turbulence(a, b, width, height, 64, noise) / 10 /*FREQUENCY*/,0,15))];
          }
      }

      return map;
  }

  function Clamp(val, min, max) {
      if (val > max) return max;
      else if (val < min) return min;
      else return val;
  }

  return {
    setSeed: setSeed,
    randomNumber: randomNumber,
    generateNoise: generateNoise,
    generateSmoothNoise: generateSmoothNoise,
    generatePerlinNoise: generatePerlinNoise,
    Turbulence: Turbulence,
    Clamp: Clamp
  }
}());
