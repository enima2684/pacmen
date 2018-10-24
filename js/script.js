
var config = {
  title: "PacMen",
  parent: "game-screen", // id of the dom element containing the game
  type: Phaser.AUTO,
  width: 450,
  height: 500,
  fps: 30,
  physics:{
    default: 'arcade'
  },
  scene: {
      preload: preload,
      create: create,
      update: update
  }
};

var game = new Phaser.Game(config);

// var Pacman = function(game){
//
//   this.map = nu
//
// };

// Load the resources
function preload() {
  this.load.image('dot', '../assets/img/dot.png');
  this.load.spritesheet('pacman', '../assets/img/pacman.png', { frameWidth: 32, frameHeight: 32 });
  this.load.tilemapTiledJSON('map', '../assets/pacman-map.json');
  this.load.image('tiles', '../assets/img/pacman-tiles.png');

}

// Create the game objects
function create(){

  //  create the map
  this.map     = this.add.tilemap('map');
  const tileset = this.map.addTilesetImage("pacman-tiles", "tiles");
  this.map.createStaticLayer('Pacman', tileset, 0, 0);

  // add spritesheet
  this.pacman = this.add.sprite((14 * 16) + 8, (17 * 16) + 8, 'pacman', 0)

  // animations
  // this.cursors = this.input.keyboard.createCursorKeys();
  //
  // this.anims.create({
  //     key: 'right',
  //     frames: this.anims.generateFrameNumbers('pacman', { start: 0, end: 1 }), // TODO: change animation
  //     frameRate: 10,
  //     repeat: -1
  // });


}

// Update the game objects
function update(){

  if (this.cursors.right.isDown)
  {
      this.pacman.setVelocityX(100);
      this.pacman.anims.play('right', true);
  }

}