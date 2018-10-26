var config = {
  title: "PacMen",
  parent: "game-screen", // id of the dom element containing the game
  type: Phaser.AUTO,
  width: 448,
  height: 496,
  fps: 30,
  physics:{
    default: 'arcade',
    debug: false
  },
  scene: {
      preload: preload,
      create: create,
      update: update
  }
};

var game = new Phaser.Game(config);
// Load the resources
function preload() {
  this.load.image('dot', '../assets/img/dot.png');
  this.load.spritesheet('pacman', '../assets/img/pacman.png', { frameWidth: 32, frameHeight: 32 });
  this.load.tilemapTiledJSON('map', '../assets/pacman-map.json');
  this.load.image('tiles', '../assets/img/pacman-tiles.png');
  this.load.spritesheet('ghost', '../assets/img/pac_man_extended.png', {frameWidth:16, frameHeight: 16});

}

var score = 0;

// Create the game objects
function create() {

  // params - Should be on a constructor funciton
  this.speed = 150;
  this.safetiles = [7, 14];

  //  create the map
  this.map     = this.make.tilemap({ key: 'map' });
  this.tileset  = this.map.addTilesetImage("pacman-tiles", "tiles");
  this.layer    = this.map.createStaticLayer('Pacman', this.tileset, 0, 0);


  // add spritesheet
  this.pacman = this.physics.add.sprite((14 * 16) + 8, (17 * 16) + 8, 'pacman');

  // please pacman - do not go at infinity !
  this.pacman.setCollideWorldBounds(true);

  // animations
  this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('pacman', { start: 0, end: 2 }),
      frameRate: 10,
      repeat: -1
  });

  this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('pacman', { start: 0, end: 2 }),
      frameRate: 10,
      repeat: -1
  });

  this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers('pacman', { start: 0, end: 2 }),
      frameRate: 10,
      repeat: -1
  });

  this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers('pacman', { start: 0, end: 2 }),
      frameRate: 10,
      repeat: -1
  });

  cursors = this.input.keyboard.createCursorKeys();


  //----------------------------------------------------------------------------
  // Add dots


  var dotPositions = getDotPositions();

  this.dots = [];
  dotPositions
    // .filter(pos => { return pos.rowIx === 14;})
    .forEach( dotPosition => {
     this.dots.push(this.physics.add.sprite((dotPosition.colIx * 16) + 8, (dotPosition.rowIx * 16) + 8, 'dot'));
  });


  this.dots.forEach(dot=>{
    this.physics.add.overlap(this.pacman, dot, eatDot, null, this);
  });

  //---------------------------------------------------------------------------
  // Add Ghosts

  this.ghosts = [];
  this.ghosts.push(
    this.physics.add.sprite((17 * 16) + 8, (20 * 16) + 8, 'ghost')
  );

  this.ghosts.forEach(ghost => {
    ghost.setScale(2);
    ghost.setCollideWorldBounds(true);
  });


  // animations
  this.anims.create({
      key: 'ghostRight',
      frames: this.anims.generateFrameNumbers('ghost', { start: 25, end: 25 }),
      frameRate: 10,
      repeat: -1
  });

  this.anims.create({
      key: 'ghostLeft',
      frames: this.anims.generateFrameNumbers('ghost', { start: 25, end: 25 }),
      frameRate: 10,
      repeat: -1
  });

  this.anims.create({
      key: 'ghostUp',
      frames: this.anims.generateFrameNumbers('ghost', { start: 25, end: 25 }),
      frameRate: 10,
      repeat: -1
  });

  this.anims.create({
      key: 'ghostDown',
      frames: this.anims.generateFrameNumbers('ghost', { start: 25, end: 25 }),
      frameRate: 10,
      repeat: -1
  });

  this.ghosts.forEach(ghost=>{
    this.physics.add.overlap(ghost, this.pacman, ghostEatPacman, null, this);
  });




}


function ghostEatPacman(ghost, pacman){

  this.physics.pause();
  pacman.setTint(0xff0000);
  gameOver = true;
}

function getDotPositions(){
  return dotPositions;
}

// Update the game objects
function update(){

  var step = 8;

  var currentTile = this.layer.getTileAtWorldXY(this.pacman.x, this.pacman.y).index;
  var upTile      = this.layer.getTileAtWorldXY(this.pacman.x, this.pacman.y - step).index;
  var downTile    = this.layer.getTileAtWorldXY(this.pacman.x, this.pacman.y + step).index;
  var rightTile   = this.layer.getTileAtWorldXY(this.pacman.x + step, this.pacman.y).index;
  var leftTile    = this.layer.getTileAtWorldXY(this.pacman.x - step, this.pacman.y).index;

  var upIsWall    = !inArray(upTile   , this.safetiles);
  var downIsWall  = !inArray(downTile , this.safetiles);
  var rightIsWall = !inArray(rightTile, this.safetiles);
  var leftIsWall  = !inArray(leftTile , this.safetiles);

  var currentDirection = getDirection(this.pacman.body.velocity.x, this.pacman.body.velocity.y);
  if (
    (currentDirection === "right" && rightIsWall) ||
    (currentDirection === "left"  && leftIsWall) ||
    (currentDirection === "up"    && upIsWall) ||
    (currentDirection === "down"  && downIsWall)
  ){
    this.pacman.body.velocity.x = 0;
    this.pacman.body.velocity.y = 0
  }

  // console.log(cursors.shift.isDown);
  if (cursors.right.isDown){
    this.pacman.body.velocity.x = rightIsWall? 0: this.speed;
    this.pacman.body.velocity.y = 0;
    this.pacman.angle = 0;
    this.pacman.anims.play('right', true);
  }

  if (cursors.left.isDown)
  {
    this.pacman.body.velocity.x = leftIsWall? 0: -this.speed;
    this.pacman.body.velocity.y = 0;
    this.pacman.angle = 180;
    this.pacman.anims.play('left', true);
  }

  if (cursors.down.isDown)
  {
    this.pacman.body.velocity.x = 0;
    this.pacman.body.velocity.y = downIsWall? 0 : this.speed;
    this.pacman.angle = 90;
    this.pacman.anims.play('down', true);

  }

  if (cursors.up.isDown)
  {
    this.pacman.body.velocity.y = upIsWall ? 0 : -this.speed;
    this.pacman.body.velocity.x = 0;
    this.pacman.angle = 270;
    this.pacman.anims.play('up', true);
  }

  //---------------------------------------------------------------------------
  // Ghost movement

  this.ghosts[0].body.velocity.x = -100;
  this.ghosts[0].anims.play('ghostLeft', true);

}

function inArray(e, arr){
   return arr.indexOf(e) > -1
}

function getDirection(vx, vy) {

  if(vx > 0){
    return 'right';
  }
  if(vx < 0){
    return "left"
  }
  if(vy > 0){
    return "down";
  }
  if(vy < 0){
    return "up";
  }
  return "nomove"
}

function eatDot(pacman, dot){
  dot.disableBody(true, true);
  score += 10;
}