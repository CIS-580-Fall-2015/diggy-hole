/* Richard Habeeb */

module.exports = (function(){
    var Entity = require('./entity.js');
    var Animation = require('./animation.js');
    var imagesToLoad = 2;
    var frameSize = {x: 64, y: 64};
    var loader = function() {
        imagesToLoad--;
        if(imagesToLoad === 0) {

        }
    };
    var walkingSpriteSheet = new Image();
    walkingSpriteSheet.src = "./img/Goblin Shaman.png";

    var attackSpriteSheet = new Image();
    attackSpriteSheet.src = "./img/Goblin Shaman Attack.png";
    var gravity = -250;


    var shaman = function(x, y, layer) {
        this.score = 1;
        this.type = "shaman";
        this.maxhp = 100;
        this.hp = this.maxhp;
        this.state = this.idleState;
        this.layerIndex = layer;
        this.reverse = false;
        this.dead = false;
        this.walkingAnimation = new Animation(walkingSpriteSheet, frameSize.x, frameSize.y, 0, 0, 4, 1.0 / 4, false);
        this.attackingAnimation = new Animation(attackSpriteSheet, frameSize.x, frameSize.y, 0, 0, 6, 1.0 / 4, false);
        this.renderAnimation = null;
        this.position = {x: x, y: y};
        this.size = {x: 0, y: 0};
        this.velocity = {x: -50, y: 0};
    };

    shaman.prototype = new Entity();

    shaman.prototype.update = function(elapsedTime, tilemap, entityManager) {
        if(this.state === null) this.state = this.idleState;

        if(this.dead) entityManager.remove(this);

        this.state(elapsedTime, tilemap, entityManager);
    };

    shaman.prototype.render = function(ctx, debug) {

        if(this.reverse) {
            ctx.save();
            ctx.scale(-1, 1);
            this.renderAnimation.render(ctx, -frameSize.x - this.position.x, this.position.y);
            ctx.restore();
        }
        else {
            this.renderAnimation.render(ctx, this.position.x, this.position.y);
        }



        if (debug) renderDebug(this, ctx);
    };

    function renderDebug(player, ctx) {
        var bounds = player.boundingBox();
        ctx.save();

        // Draw player bounding box
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(bounds.left, bounds.top);
        ctx.lineTo(bounds.right, bounds.top);
        ctx.lineTo(bounds.right, bounds.bottom);
        ctx.lineTo(bounds.left, bounds.bottom);
        ctx.closePath();
        ctx.stroke(); // Outline tile underfoot
        var tileX = 64 * Math.floor((bounds.left + (frameSize.x / 2 )) / 64),
            tileY = 64 * (Math.floor(bounds.bottom / 64));
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(tileX, tileY);
        ctx.lineTo(tileX + 64, tileY);
        ctx.lineTo(tileX + 64, tileY + 64);
        ctx.lineTo(tileX, tileY + 64);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
    }

    shaman.prototype.onGround = function (tilemap) {
        var box = this.boundingBox(),
            tileX = Math.floor((box.left + (frameSize.x / 2)) / 64),
            tileY = Math.floor(box.bottom / 64);
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
        return (tile && tile.data.solid) ? true : false;
    };

    shaman.prototype.nextTileEmpty = function (tilemap) {
        var box = this.boundingBox(),
            tileX = Math.floor((box.left + (frameSize.x / 2)) / 64),
            tileY = Math.floor((box.bottom + (frameSize.y / 2)) / 64);
        tile = tilemap.tileAt(tileX, tileY, this.layerIndex);
        return (tile && !tile.data.solid) ? true : false;
    };

    shaman.prototype.isPlayerNearby = function(entityManager) {
        var entitiesInRange = entityManager.queryRadius(this.position.x, this.position.y, 200);
        if (entitiesInRange.length > 0) {
            for (var i = 0; i < entitiesInRange.length; i ++) {
                if (entitiesInRange[i].type == 'player') {
                    return true;
                }
            }
        }
        return false;
    };

    shaman.prototype.idleState = function(elapsedTime, tilemap, entityManager) {
        if(!this.onGround(tilemap)) {
            this.velocity.y += (gravity * elapsedTime) * (gravity * elapsedTime);

        }
        else {
            this.velocity.y = 0;
            this.position.y = Math.floor(this.position.y / 64) * 64;
            if(this.isPlayerNearby(entityManager)) {
                this.state = this.attackState;
            }
        }

        if(this.nextTileEmpty(tilemap)) {
            this.velocity.x = -this.velocity.x;
        }

        this.position.x += this.velocity.x * elapsedTime;
        this.position.y += this.velocity.y * elapsedTime;
        this.reverse = this.velocity.x > 0;
        this.walkingAnimation.update(elapsedTime);
        this.renderAnimation = this.walkingAnimation;
    };

    shaman.prototype.attackState = function(elapsedTime, tilemap, entityManager) {
        if(!this.isPlayerNearby(entityManager) || !this.onGround(tilemap)) {
            this.state = this.idleState;
        }
        this.attackingAnimation.update(elapsedTime);
        this.renderAnimation = this.attackingAnimation;
    };

    shaman.prototype.boundingBox = function() {
        return {
            top: this.position.y,
            left: this.position.x,
            right: this.position.x + frameSize.x,
            bottom: this.position.y + frameSize.y
        };
    };

    shaman.prototype.boundingCircle = function() {
        return {
            cx: this.position.x + frameSize.x / 2.0,
            cy: this.position.y + frameSize.y / 2.0,
            radius: frameSize.x
        };
    };

    shaman.prototype.collide = function(ent) {
        if(ent.type == "Pickaxe")
        {
            //check if attacking once attacking is fixed.
            this.dead = true;
        }
        if(ent.type == "goblinMiner")
        {

            //Do something interesting with health later
        }
    };



    return shaman;
})();
