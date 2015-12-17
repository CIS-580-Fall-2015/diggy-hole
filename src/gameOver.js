/* Game over module
 * Authors:
 * - Filip Stanek
 */
module.exports = (function (){

	
    var gameOver = document.getElementById("game_over");
	
	
	var engine = function(scoreEngine){
		this.score = document.getElementById("score");
		this.score.innerHTML = "Score: " + scoreEngine.getScore();
	};
    var load = function(sm) {
        gameOver.style.display = "flex";
    };

    var exit = function() {
        gameOver.style.display = "none";
    };

    var update = function() {};

    var render = function() {};

    var keyDown = function(event) {
        switch(event.keyCode) {
            case 13: // ENTER
                location.reload();
                break;
        }
    };

    function keyUp(event) {}

    return {
		engine: engine,
        load: load,
        exit: exit,
        update: update,
        render: render,
        keyDown: keyDown,
        keyUp: keyUp
    }
})();