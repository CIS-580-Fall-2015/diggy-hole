/* The particle manager maintains the list of particles currently in the world,
*  and handles the update and rendering functions for it
*
* Author: Daniel Marts
*/
module.exports = (function() {
const GRAVITY = -250;
const TERMINAL_VELOCITY = GRAVITY * -8;
const MAX_PARTICLES = 250;

/* Constructor for each particle
* x = starting x Pos, y = starting y Pos, velX, velY starting velocities
* grav = if the particle follows the effect of gravity
* r = radius of the particle, c = color of particle,
* life = lifespan of particle in seconds
*/
function Particle(x, y, velX, velY, grav, r, c, life) {
  this.xPos = x;
  this.yPos = y;
  this.velocityX = velX;
  this.velocityY = velY;
  this.gravity = grav;
  this.radius = r;
  this.color = c;
  this.lifeLeft = life;
}

var Count = 0;
var particles = [];
    //start = 0, end = 0;

/* adds a particle to the world
* x = starting x Pos, y = starting y Pos, velX, velY starting velocities
* grav = if the particle follows the effect of gravity
* r = radius of the particle, c = color of particle,
* life = lifespan of particle in seconds
*/
function add(x, y, velX, velY, grav, r, c, life){
  /*
  if ((end) > MAX_PARTICLES)
  {
    end = 0;
    particles[0] = new Particle(x, y, velX, velY, grav, r, c, life);
  }
  else {
    particles[end++] = new Particle(x, y, velX, velY, grav, r, c, life);
  }*/
  particles.push(new Particle(x, y, velX, velY, grav, r, c, life));
  Count++;
}

//Adds dirt particles with a small lifespan
//Player calls this when he digs a tile
function addDirtParticles(tileX, tileY) {
  var xoff = tileX * 64 + 32;
  var yoff = tileY * 64 + 32;
  for (var i = 0; i < 5; i++) {
    var xv = 200*(Math.random()-0.5),
        yv = -100+-200*Math.random(),
        rad = 5*Math.random();

    add(xoff,yoff, xv, yv, "true", rad, "#361718", 1);

  }
}

//Adds stone particles with a small lifespan
//Player calls this when he digs a tile
function addStoneParticles(tileX, tileY) {
  var xoff = tileX * 64 + 32;
  var yoff = tileY * 64 + 32;
  for (var i = 0; i < 5; i++) {
    var xv = 200*(Math.random()-0.5),
        yv = -100+-200*Math.random(),
        rad = 5*Math.random();

    add(xoff,yoff, xv, yv, "true", rad, "#4d4d4d", 1);

  }
}

//Adds lava level particles with a small lifespan
//Player calls this when he digs a tile
function addDeepParticles(tileX, tileY) {
  var xoff = tileX * 64 + 32;
  var yoff = tileY * 64 + 32;
  for (var i = 0; i < 5; i++) {
    var xv = 200*(Math.random()-0.5),
        yv = -100+-200*Math.random(),
        rad = 5*Math.random();

    add(xoff,yoff, xv, yv, "true", rad, "#000000", 1);

  }
}

/*Removes the particle at the location given and increments start until it points
* to the first element still in the array
*/
function remove(loc) {
  //particles[loc] = undefined;
  particles.splice(loc, 1);
  Count--;
  /*
  if (loc == start) {
    while (typeof(particles[start]) !== "undefined")
      start++;
  }
  */
}

/* Updates the particle at the current location
*/
function updateCurrent(i, elapsedTime) {
  particles[i].lifeLeft -= elapsedTime;
  if (particles[i].lifeLeft <= 0) {
    remove(i);
  }
  else {
    if (particles[i].gravity == "true") {
      particles[i].xPos += elapsedTime * particles[i].velocityX;
      if(particles[i].velocityY < TERMINAL_VELOCITY) {
        particles[i].velocityY += Math.pow(GRAVITY * elapsedTime, 2);
      }
      particles[i].yPos += particles[i].velocityY * elapsedTime;
    }
    else {
      particles[i].xPos += elapsedTime * particles[i].velocityX;
      particles[i].yPos += elapsedTime * particles[i].velocityY;
    }
  }
}

/* Updates all particles
*/
function update(elapsedTime){
  for (var i = 0; i < MAX_PARTICLES; i++) {
    if (typeof(particles[i]) !== "undefined"){
      updateCurrent(i, elapsedTime);
    }
  }
  /*
  if (start > end) {
    for (var i = start; start < MAX_PARTICLES; i++) {
      if (typeof(particles[i]) !== "undefined"){
        updateCurrent(i, elapsedTime);
      }
    }
    for (var i = 0; i <=start ; i++) {
      if (typeof(particles[i]) !== "undefined"){
        updateCurrent(i, elapsedTime);
      }
    }
  }
  else {
    for (var i = start; i < end; i++) {
      if (typeof(particles[i]) !== "undefined"){
        updateCurrent(i, elapsedTime);
      }
    }
  }*/
}

/* Draws particle at the index on the current contextual
*/
function renderCurrent(index, ctx) {
  ctx.beginPath();
  ctx.arc(particles[index].xPos, particles[index].yPos, particles[index].radius, 2* Math.PI, false );
  ctx.closePath();
  ctx.fillStyle = particles[index].color;
  ctx.fill();
}

/* Draws all particles on the given context
*/
function render(ctx) {
  for (var i = 0; i < MAX_PARTICLES; i++) {
    if (typeof(particles[i]) !== "undefined"){
      renderCurrent(i, ctx);
    }
  }
  /*
  if (start > end) {
    for (var i = start; start < MAX_PARTICLES; i++) {
      if (typeof(particles[i]) !== "undefined"){
        renderCurrent(i, ctx);
      }
    }
    for (var i = 0; i <=start ; i++) {
      if (typeof(particles[i]) !== "undefined"){
        renderCurrent(i, ctx);
      }
    }
  }
  else {
    for (var i = start; i < end; i++) {
      if (typeof(particles[i]) !== "undefined"){
        renderCurrent(i, ctx);
      }
    }
  }
  */
}

return {
  add: add,
  addDirtParticles: addDirtParticles,
  addStoneParticles: addStoneParticles,
  addDeepParticles: addDeepParticles,
  remove: remove,
  update: update,
  render: render
};

}());
