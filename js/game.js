

class PacManScene extends Phaser.Scene{

  /**
   *
   * @param speed of the characters on the map
   * @param safetiles : indexes of the safe tiles ie not walls
   */
  constructor(speed, safetiles){
      super();

      /******** PARAMS *******************/
      this.speed = speed;
      this.safetiles = safetiles;


      /****** Internal Objects ********/
      this.pacman;
      this.ghosts  = [];
      this.cursors;

  }


  /**
   * Load the ressources
   */
  preload(){
    this.load.image('dot', '../assets/img/dot.png');
    this.load.spritesheet('pacman', '../assets/img/pacman.png', { frameWidth: 32, frameHeight: 32 });
    this.load.tilemapTiledJSON('map', '../assets/pacman-map.json');
    this.load.image('tiles', '../assets/img/pacman-tiles.png');
    this.load.spritesheet('ghost', '../assets/img/pac_man_extended.png', {frameWidth:16, frameHeight: 16});

  }

  /**
   * Create Game Objects
   */
  create(){

    this.createMap();

    this.createPacMan();




  }

  /**
   * Update the game objects
   */
  update(){

  }


  /**
   * Creates the map - should be called inside create method
   */
  createMap(){
    this.map     = this.make.tilemap({ key: 'map' });
    this.tileset  = this.map.addTilesetImage("pacman-tiles", "tiles");
    this.layer    = this.map.createStaticLayer('Pacman', this.tileset, 0, 0);
  }

  /**
   * Create PacMan
   */
  createPacMan(){

    // add spritesheet
    this.pacman = this.physics.add.sprite((14 * 16) + 8, (17 * 16) + 8, 'pacman');

    // add collider so pacman cannot go to infinity
    this.pacman.setCollideWorldBounds(true);

    // Create a cursor to take control of the charachter
    this.cursors = this.input.keyboard.createCursorKeys();

  }


}






class Character{
  /**
   * This class represents a character.
   * This can be an abstract class from which we will derive pacmans and ghosts
   */


  /**
   * /**
   * @param phaserObj: phaser object representing the character
   */
  constructor(phaserObj){


    // PROPERTIES
    this.phaserObj = phaserObj;

  }

  getPosition(){
    return [this.phaserObj.x, this.phaserObj.y]
  }



}


