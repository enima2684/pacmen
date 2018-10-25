
var config = {
  title: "PacMen",
  parent: "game-screen", // id of the dom element containing the game
  type: Phaser.AUTO,
  width: 450,
  height: 500,
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


}

// Create the game objects
function create() {

  // params - Should be on a constructor funciton
  this.speed = 150;
  // this.safetile = 14;

  //  create the map
  this.map     = this.add.tilemap('map');
  var tileset  = this.map.addTilesetImage("pacman-tiles", "tiles");
  var walls    = this.map.createStaticLayer('Pacman', tileset, 0, 0);



  // add spritesheet
  this.pacman = this.physics.add.sprite((14 * 16) + 8, (17 * 16) + 8, 'pacman');

  // please pacman - do not go at infinity !
  this.pacman.setCollideWorldBounds(true);

  // please pacman - do not go through walls
  // this.pacman.setCollisionByExclusion([this.safetile], true, this.map);
  // this.physics.add.collider(this.pacman, tileset);
  //
  // this.map.setCollision([3], true);
  // this.physics.world.collide(self.pacman, this.map, null, this);
  // walls.setCollisionBetween(1, 50);
  // this.physics.add.collider(this.pacman, this.map);
  this.map.setCollisionByExclusion([this.safetile], true, this.layer);
  this.physics.add.collider(this.pacman, walls);


  // animations
  this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('pacman', { start: 0, end: 2 }), // TODO: change animation
      frameRate: 10,
      repeat: -1
  });

  this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('pacman', { start: 0, end: 2 }), // TODO: change animation
      frameRate: 10,
      repeat: -1
  });

  this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers('pacman', { start: 0, end: 2 }), // TODO: change animation
      frameRate: 10,
      repeat: -1
  });

  this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers('pacman', { start: 0, end: 2 }), // TODO: change animation
      frameRate: 10,
      repeat: -1
  });

  cursors = this.input.keyboard.createCursorKeys();
}

// Update the game objects
function update(){

  // console.log(cursors.shift.isDown);
  if (cursors.right.isDown){

    console.log("RIGHT");
    this.pacman.body.velocity.x = this.speed;
    this.pacman.angle = 0;
    this.pacman.anims.play('right', true);
  }

  if (cursors.left.isDown)
  {
    this.pacman.body.velocity.x = -this.speed;
    this.pacman.angle = 180;
    this.pacman.anims.play('left', true);
  }

  if (cursors.down.isDown)
  {
    this.pacman.body.velocity.y = this.speed;
    this.pacman.angle = 90;
    this.pacman.anims.play('down', true);
  }

  if (cursors.up.isDown)
  {
    this.pacman.body.velocity.y = -this.speed;
    this.pacman.angle = 270;
    this.pacman.anims.play('up', true);
  }



}