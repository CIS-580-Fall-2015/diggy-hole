module.exports = (function() { 

  var commands = {	
    RIGHT: 39,
    LEFT: 37,
    UP: 38,
    DOWN: 40,
    DIGDOWN: 83, 	// S
    DIGLEFT: 65, 	// A
    DIGRIGHT: 68,	// D
    DIGUP: 87,		// W
	PAY: 50,		// P
	ATTACK : 65,	// A
	SHOOT : 66,	 	// B
	ONE : 49,
	TWO : 50,
	THREE : 51,
	FOUR : 52,
	FIVE : 53,
	SIX : 54
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