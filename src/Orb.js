module.exports = (function () {
    var Entity = require('./entity.js');


    //Tracks the entity's current movement.
    var _state = {
        IDLE : 0,
        MOVING : 1,
        DRAIN: 2
    }

    function Orb(x, y, layer) {
        //Coordinates, velocity, and state information.
        this.x = x;
        this.y = y;
        this.xvel = 10;
        this.yvel = 10;
        this.state = _state.IDLE;
        this.type = "Ethereal Rune Spirit";
        this.layer = layer;

        //Load Orb Assets
        this.img = new Image();
        this.img.src = "./img/Orb_Spritesheet.png";
        this.img.addEventListener('load', function () { this.animation = new Sprite(img); }, false);
    }

    function Sprite() {
        this.img = img;
        this.currFrame = 1;
        this.frameCount = 12;
        this.frameWidth = this.img.width / this.frameCount;
        this.frameHeight = this.img.height;
        this.drawFrame = function (ctx, x, y) {
            if (this.currFrame == 0) { this.currFrame += 1; }
            ctx.drawImage(this.img, this.frameWidth * this.currFrame, 0, this.frameWidth, this.img.height, x, y, this.frameWidth, this.frameHeight);
            this.currFrame = (this.currFrame + 1) % this.frameCount;
        }
    }

    Orb.prototype = new Entity();

    Orb.prototype.update = function (elapsedTime, tilemap, entityManager) {
        var proximity = entityManager.queryRadius();
    }

    Orb.prototype.render = function (ctx, debug) {
        if (debug) {
            var bound = this.boundingBox();
            ctx.strokeStyle = "red";
            ctx.beginPath();
            ctx.moveTo(bound.left, bound.top);
            ctx.lineTo(bound.right, bound.top);
            ctx.lineTo(bound.right, bound.bottom);
            ctx.lineTo(bound.left, bound.bottom);
            ctx.closePath();
            ctx.stroke();
        }
        this.animation.drawFrame(ctx, this.x, this.y);
    }

    Orb.prototype.collide = function (otherEntity) {
        if (otherEntity.type == 'player') {
            this.state = _state.DRAIN;
        }
    }

    Orb.prototype.boundingBox = function () {
        return {
            top: this.y,
            left: this.x,
            right: this.x + this.animation.frameWidth,
            bottom: this.y + this.animation.frameHeight
        }
    }

    Orb.prototype.boundingCircle = function () {
        return {
            cx: this.x + (this.animation.frameWidth / 2),
            cy: this.y + (this.animation.frameHeight / 2),
            r: ((this.animation.frameWidth + this.animation.frameHeight) / 4)
        }
    }
})();