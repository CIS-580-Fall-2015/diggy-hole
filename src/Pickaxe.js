/* Pickaxe is an invisible entity created by player that represents the hitbox
* of the Pickaxe.
* In the future this would be interesting to have an attack animation effect
* like a slash or something.
*/
module.exports = (function() {
    var Entity = require('./entity.js');

    /* moveing these values to a pickaxe factory class would be cool.
    Then powerups could change the attack size. */
    var attackSize = { x: 20, y: 40 };
    var attackRadius = 15;


    var Pickaxe = function(position, horizontal) {
        this.x = position.x;
        this.y = position.y;
        this.score = 0;
        this.type = "Pickaxe";
        if(horizontal) this.attackSize = {x: attackSize.y, y: attackSize.x };
        else this.attackSize = {x: attackSize.x, y: attackSize.y };
    };

    Pickaxe.prototype.update = function() {

    };

    Pickaxe.prototype.render = function(ctx, debug) {
        if (debug) renderDebug(this, ctx);
    };

    Pickaxe.prototype.boundingBox = function() {
        return {
            left: this.x - this.attackSize.x / 2,
            top: this.y - this.attackSize.y / 2,
            right: this.x + this.attackSize.x / 2,
            bottom: this.y + this.attackSize.y / 2
        };
    };


    Pickaxe.prototype.boundingCircle = function() {
        return {
            cx: this.x,
            cy: this.y,
            radius: attackRadius
        };
    };


    Pickaxe.prototype.collide = function(otherEntity, entityManager) {
        if( otherEntity.type == "player") {
            return;
        } else if(otherEntity.lives) {
            if(--otherEntity.lives < 1) {
                if(otherEntity.die){
                    otherEntity.die(entityManager);
                } else {
                    entityManager.remove(otherEntity);
                }
            }
        } else {
            this.enabled = false;
            if(otherEntity.die){
                otherEntity.die(entityManager);
            } else {
                entityManager.remove(otherEntity);
            }
        }
    };

    function renderDebug(player, ctx) {
        var bounds = player.boundingBox();
        var circle = player.boundingCircle();
        ctx.save();

        // Draw player bounding box
        ctx.strokeStyle = "red";
        ctx.beginPath();
        ctx.moveTo(bounds.left, bounds.top);
        ctx.lineTo(bounds.right, bounds.top);
        ctx.lineTo(bounds.right, bounds.bottom);
        ctx.lineTo(bounds.left, bounds.bottom);
        ctx.closePath();
        ctx.stroke(); // Outline tile underfoot

        ctx.strokeStyle = "blue";
        ctx.beginPath();
        ctx.arc(circle.cx, circle.cy, circle.radius, 0, 2*Math.PI);
        ctx.stroke();

        ctx.restore();
    }




    return Pickaxe;


})();
