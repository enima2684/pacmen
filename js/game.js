

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
      this.score = 0;
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

    // Create a cursor to take control of the character
    this.cursors = this.input.keyboard.createCursorKeys();

    this.createMap();

    this.createPacMan();

    this.createGhosts();

  }

  /**
   * Update the game objects
   */
  update(){

    this.pacman.update();

    this.ghosts.forEach(
      ghost=>{
        ghost.update(this.pacman.getPosition());
      }
    );

  }


  /**
   * Creates the map - should be called inside create method
   */
  createMap(){
    this.map     = this.make.tilemap({ key: 'map' });
    this.tileset  = this.map.addTilesetImage("pacman-tiles", "tiles");
    this.layer    = this.map.createStaticLayer('Pacman', this.tileset, 0, 0);


    // add dots
    var dotPositions = this.getDotPositions();

    this.dots = [];
    dotPositions.forEach( dotPosition => {
       this.dots.push(this.physics.add.sprite((dotPosition.colIx * 16) + 8, (dotPosition.rowIx * 16) + 8, 'dot'));
    });
  }

  /**
   * This method returns the dot positions from json static file
   * @return {*}
   */
  getDotPositions(){

    // for the moment, the file is imported a global variable - this is bad and shoud be changed
    // TODO: fix this
    return dotPositions;
  }


  /**
   * Create PacMan
   */
  createPacMan(){

    // * create the character
    this.pacman = new Pacman(this, "pacmanPlayer", [14, 17]);


    // add event handler when pacman eats a dot
    this.dots.forEach(dot=>{
      this.physics.add.overlap(this.pacman.phaserCharacter, dot, this.eatDot, null, this);
    });

  }


  createGhosts(){

    var ghostsToCreate = [
      "blinky"
    ];

    // creata and populate the list of ghosts
    ghostsToCreate.forEach(ghost => {
      this.ghosts.push(
        new Ghost(this, ghost, [18, 14])
      )
    });

    // scale the ghosts
    this.ghosts.forEach(ghost => {ghost.phaserCharacter.setScale(2);});

  }

  /**
   * What happens when pacman eats a dot
   * @param pacman
   * @param dot
   */
  eatDot(pacman, dot){
    dot.disableBody(true, true);
    this.score += 10;
  }


}


/**
 * This class represents a character.
 * This is an abstract class from which we will derive pacmans and ghosts.
 * This should be the only interface to deal with the characters on the game
 */
class Character{

  /**
   * @param scene: instance of PacManScene we are working on
   * @param name: name of the character - defines also animation properties
   * @param characterType: string that specifies the character type : pacman or ghost
   * @param initialPosition : array og lenth 2 with the position of the charachter on the 31x28 grid
   */
  constructor(scene, characterType, name, initialPosition){

    if (this.constructor === Character) {
        throw new TypeError('Abstract class "Character" cannot be instantiated directly.');
    }

    if (this.update === undefined) {
        throw new TypeError('Classes extending the Character abstract class need to implement an update method');
    }

    this.scene = scene;
    this.name = name;
    this.phaserCharacter = scene.physics.add.sprite((initialPosition[0] * 16) + 8, (initialPosition[1] * 16) + 8, characterType);
    this.phaserCharacter.setCollideWorldBounds(true);
    this.step = 8;
    this.movements = [];



  }

  setMovements(){

    var scene = this.scene;
    var phaserCharacter = this.phaserCharacter;

    //----------------------------------------------------------
    //KEEP : movement if no trigger
    var keep = new Movement("keep");
    keep.trigger = ()=>{
      throw new Error("Please define a trigger to the movement keep");
    };
    keep.defaultAction = ()=>{
      var wallAround = this.isWallAround();
      var currentDirection = this.getCurrentDirrection();
      if (
        (currentDirection === "right" && wallAround["right"]) ||
        (currentDirection === "left"  && wallAround["left"]) ||
        (currentDirection === "up"    && wallAround["up"]) ||
        (currentDirection === "down"  && wallAround["down"])
        ){
          this.setVelocity([0, 0]);
        }

      phaserCharacter.anims.play(this.name + '_move', true);
    };
    this.movements.push(keep);

    //----------------------------------------------------------
    // UP
    let up = new Movement("up");
    up.trigger = ()=>{
      throw new Error("Please define a trigger to the movement up");
    };
    up.defaultAction  = ()=>{
      this.setVelocity([
        0,
        (this.isWallAround()["up"])? 0 : -scene.speed
      ]);
      phaserCharacter.anims.play(this.name + '_move', true);
    };
    this.movements.push(up);

    //----------------------------------------------------------
    // DOWN
    let down = new Movement("down");
    down.trigger = ()=>{
      throw new Error("Please define a trigger to the movement down");
    };
    down.defaultAction  = ()=>{
      this.setVelocity([
        0,
        (this.isWallAround()["down"])? 0 : scene.speed
      ]);
      phaserCharacter.anims.play(this.name + '_move', true);
    };
    this.movements.push(down);

    //----------------------------------------------------------
    // LEFT
    let left = new Movement("left");
    left.trigger = ()=>{
      throw new Error("Please define a trigger to the movement left");
    };
    left.defaultAction  = ()=>{
      this.setVelocity([
        (this.isWallAround()["left"])? 0 : -scene.speed,
        0
      ]);
      phaserCharacter.anims.play(this.name + '_move', true);
    };
    this.movements.push(left);

    //----------------------------------------------------------
    // RIGHT
    let right = new Movement("right");
    right.trigger = ()=>{
      throw new Error("Please define a trigger to the movement right");
    };
    right.defaultAction  = ()=>{
      this.setVelocity([
        (this.isWallAround()["right"])? 0 : scene.speed,
        0
      ]);
      phaserCharacter.anims.play(this.name + '_move', true);
    };
    this.movements.push(right);
  }

  getPosition(){
    return [this.phaserCharacter.x, this.phaserCharacter.y]
  }

  getVelocity(){
    return [this.phaserCharacter.body.velocity.x, this.phaserCharacter.body.velocity.y]
  }

  /**
   * Sets the velocity of the character
   * @param v: array of length 2
   */
  setVelocity(v){
    this.phaserCharacter.body.velocity.x = v[0];
    this.phaserCharacter.body.velocity.y = v[1];
  }

  /**
   * Method that returns boolaeans to say of a wall is aroud the character
   * The method returns an object direction -> boolean
   */
  isWallAround(){

    var step = 8;
  
    var currentTile = this.scene.layer.getTileAtWorldXY(this.phaserCharacter.x, this.phaserCharacter.y).index;
    var upTile      = this.scene.layer.getTileAtWorldXY(this.phaserCharacter.x, this.phaserCharacter.y - step).index;
    var downTile    = this.scene.layer.getTileAtWorldXY(this.phaserCharacter.x, this.phaserCharacter.y + step).index;
    var rightTile   = this.scene.layer.getTileAtWorldXY(this.phaserCharacter.x + step, this.phaserCharacter.y).index;
    var leftTile    = this.scene.layer.getTileAtWorldXY(this.phaserCharacter.x - step, this.phaserCharacter.y).index;
  
    var upIsWall    = !inArray(upTile   , this.scene.safetiles);
    var downIsWall  = !inArray(downTile , this.scene.safetiles);
    var rightIsWall = !inArray(rightTile, this.scene.safetiles);
    var leftIsWall  = !inArray(leftTile , this.scene.safetiles);

    return {
      "up": upIsWall,
      "down": downIsWall,
      "right": rightIsWall,
      "left": leftIsWall
    }

    
  }

  getCurrentDirrection(){

    var vx = this.getVelocity()[0];
    var vy = this.getVelocity()[1];

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


    createAnimations(){
      console.log("No animation configured for " + this.name);
    }


  update() {
    this.movements.forEach(
      movement => {
        if (movement.trigger()) {
          movement.action(this.phaserCharacter);
        }
      }
    )
  }

}


/** Pacman character **/
class Pacman extends Character{

  constructor(scene, name, initialPosition){
    super(scene, "pacman", name, initialPosition);
    this.createAnimations();
    this.setMovements();
  }


  /**
   * place to set specific movement of Pacman
   */
  setMovements(){
    super.setMovements();

    var scene = this.scene;

    //------------------------------------------------------------------------
    // KEEP
    this.movements.filter(mov => {return mov.direction === 'keep';})[0].trigger = ()=>{return true;};

    //------------------------------------------------------------------------
    // UP

    /* trigger */
    var movementUp = this.movements.filter(mov => {return mov.direction === 'up';})[0];
    movementUp.trigger = ()=>{return scene.cursors.up.isDown;};
    movementUp.action  = ()=>{
      movementUp.defaultAction();
      this.setAngle(270);
    };

    //------------------------------------------------------------------------
    // DOWN

    /* trigger */
    var movementDown = this.movements.filter(mov => {return mov.direction === 'down';})[0];
    movementDown.trigger = ()=>{return scene.cursors.down.isDown;};
    movementDown.action  = ()=>{
      movementDown.defaultAction();
      this.setAngle(90);
    };

    //------------------------------------------------------------------------
    // RIGHT

    /* trigger */
    var movementRight = this.movements.filter(mov => {return mov.direction === 'right';})[0];
    movementRight.trigger = ()=>{return scene.cursors.right.isDown;};
    movementRight.action  = ()=>{
      movementRight.defaultAction();
      this.setAngle(0);
    };

    //------------------------------------------------------------------------
    // LEFT

    /* trigger */
    var movementLeft = this.movements.filter(mov => {return mov.direction === 'left';})[0];
    movementLeft.trigger = ()=>{return scene.cursors.left.isDown;};
    movementLeft.action  = ()=>{
      movementLeft.defaultAction();
      this.setAngle(180);
    };
  }


  createAnimations(){
    // animations
    this.scene.anims.create({
        key: this.name + '_move',
        frames: this.scene.anims.generateFrameNumbers('pacman', { start: 0, end: 2 }),
        frameRate: 10,
        repeat: -1
    });

  }



  /**
   * Display angle of the character
   * @param angle
   */
  setAngle(angle){
    this.phaserCharacter.angle = angle;
  }

}


/**
 * Representation of a ghost
 */
class Ghost extends Character{

  constructor(scene, name, initialPosition){
    super(scene, "ghost", name, initialPosition);
    this.createAnimations();
    this.setMovements();
  }


  setMovements(){
    super.setMovements();

    //------------------------------------------------------------------------
    // KEEP
    var movement = this.movements.filter(mov=>{return mov.direction === 'keep';})[0];
    movement.trigger = ()=>{return false;}

    //------------------------------------------------------------------------
    // UP
    var movement = this.movements.filter(mov=>{return mov.direction === 'up';})[0];
    movement.trigger = ()=>{return false;}


    //------------------------------------------------------------------------
    // DOWN
    var movement = this.movements.filter(mov=>{return mov.direction === 'down';})[0];
    movement.trigger = ()=>{return false;}


    //------------------------------------------------------------------------
    // LEFT
    var movement = this.movements.filter(mov=>{return mov.direction === 'left';})[0];
    movement.trigger = ()=>{return false;}


    //------------------------------------------------------------------------
    // RIGHT
    var movement = this.movements.filter(mov=>{return mov.direction === 'right';})[0];
    movement.trigger = ()=>{return false;}

  }


  createAnimations(){
    // animations
    this.scene.anims.create({
        key: this.name + '_move',
        frames: this.scene.anims.generateFrameNumbers('ghost', { start: 25, end: 25 }),
        frameRate: 10,
        repeat: -1
    });
  }

  /**
   * Update the position of the ghost in order to reach the specified position
   * @param pacman
   */
  update(targetPosition){

    this.track(targetPosition);
    super.update();
  }


  /**
   * Updates the movements array of the ghost to make him reach the specified position
   * @param targetPosition : array of length 2
   */
  track(targetPosition){

    var directionToTake;

    var currentSpeed = math.norm(this.getVelocity());

    // only track if on an intersection <=> speed = 0
    if(currentSpeed < 1){

      // 1. calculate the distance to the target on the 2 axis
      var distX = targetPosition[0] - this.getPosition()[0];
      var distY = targetPosition[1] - this.getPosition()[1];

      // 2. choose the next direction to take -  random sometime
      if(Math.random() < 0.8){
        directionToTake = this.getDirectionBasedOnDistance(distX, distY);
      }
      else{
        var directions = ["up", "down", "right", "left"];
        directionToTake = directions[Math.floor(Math.random() * directions.length)];
      }


    }
    else{

      directionToTake = this.getCurrentDirrection();
    }

    // 3. update the movements
    this.setMovementsToGoTo(directionToTake);



  }

  /**
   * Returns the direction to follow based on the absolute distances on the 2 axis
   * @param distX
   * @param distY
   */
  getDirectionBasedOnDistance(distX, distY){

    if (Math.abs(distX) > Math.abs(distY)){
      // we have to choose between right and left
      return (distX > 0) ? "right" : "left";
    }
    else {
      // we have to choose between up and down
      return (distY > 0) ? "down" : "up";
    }

  }

  /**
   * Updates the movements array to make the ghost take the desired direction
   * @param direction: up, left, down, right
   */
  setMovementsToGoTo(direction){
    this.movements.forEach(mov=>{
      mov.trigger = ()=>{return false;}
    });
    this.movements.filter(mov=>{return mov.direction === direction;})[0].trigger = ()=>{return true;};
  }

}


/**
 * Class to represent a type of movement og a charchter.
 * A movement is defined by its trigger and by the action associated with it
 */
class Movement{

  constructor(direction){
    this.direction = direction;
  }

  trigger(){
    throw new TypeError('Every movement should implement a trigger method');
  }

  /**
   * This is the default action given to all characters for a specific movement
   */
  defaultAction(){
    throw new TypeError('Every movement should implement a default action method');
  }

  /**
   * This is the method invoked by the game, it can be charcater specific
   */
  action(){
    this.defaultAction();
  }

}


function inArray(e, arr){
   return arr.indexOf(e) > -1
}


/**

TODO NEXT STEPS :

 - Ghost follow pacman

 */