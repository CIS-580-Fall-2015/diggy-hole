/* MainMenu GameState module
 * Provides the main menu for the Diggy Hole game.
 * Authors:
 * - Nathan Bean
 */
module.exports = (function (){
  var menu = document.getElementById("main-menu"),
      play = document.getElementById("play-btn"),
      help = document.getElementById("help-btn"),
      credits = document.getElementById("credits-btn"),
      items = [play, help, credits],
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
   *  The Help button launches the help menu
   */
  help.onclick = function(event) {
    event.preventDefault();
    var helpScreen = require('./help-screen');
    stateManager.pushState(helpScreen);
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