

class PacManScene extends Phaser.Scene{

  /**
   *
   * @param speed of the characters on the map
   * @param safetiles : indexes of the safe tiles ie not walls
   * #param gameDuration: in minutes
   */
  constructor(speed, safetiles, gameDuration){
      super();

      /******** PARAMS *******************/
      this.speed = speed;
      this.safetiles = safetiles;


      /****** Internal Objects ********/
      this.ghosts  = [];
      this.dots  = [];
      this.players = []
      this.cursors;
      this.score;
      this.startingTime;
      this.endingTime;
      this.gameDuration = gameDuration;

  }

  /**
   * Load the ressources
   */
  preload(){
    this.load.spritesheet('dot', '../assets/img/dot.png', { frameWidth: 4, frameHeight: 4 });
    this.load.spritesheet('pacman', '../assets/img/pacman.png', { frameWidth: 32, frameHeight: 32 });
    this.load.tilemapTiledJSON('map', '../assets/pacman-map.json');
    this.load.image('tiles', '../assets/img/pacman-tiles.png');
    this.load.spritesheet('ghost', '../assets/img/pac_man_extended.png', {frameWidth:16, frameHeight: 16});
  }

  /**
   * Create Game Objects
   */
  create(){

    // init scores
    this.score = 0;
    this.startingTime = new Date().getTime();
    this.endingTime = this.startingTime + this.gameDuration * 60000;

    // Create a cursor to take control of the character
    this.createUserInputs();

    this.createMap();

    this.createDots();

    this.createPacMan();

    this.createGhosts();

    this.setUpInterractionsBetweenCharacters()

  }

  /**
   * Method to create all user inputs
   */
  createUserInputs(){

    this.cursors = this.input.keyboard.createCursorKeys();

    // add keys for second player

    this.cursors["z"] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.cursors["q"] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.cursors["s"] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.cursors["d"] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  }

  /**
   * Update the game objects
   */
  update(){

    // update pacman
    this.players.forEach(pacman=>{
      pacman.update();
    });

    // update ghosts
    // TODO: review priorities
    this.ghosts.forEach(
      ghost=>{
        this.players.forEach(pacman=>{
          ghost.update(pacman.getPosition());
        });
      }
    );

    // update score
    $("#score").html(this.score);

    // update timer
    this.updateTimer();

    // is the game over ?
    if (this.isGameOver())
    {
      this.doWhenGameIsOver();
    }

  }

  /**
   * What to do when the game is over
   */
  doWhenGameIsOver(){
    this.physics.pause();
    this.pacman.phaserCharacter.setTint(0xff0000);// Pac man animation

    // Pac man animation
    var angle = 0;
    setInterval(()=>{
      angle += 90;
      this.pacman.setAngle(angle);
    }, 100)
  }

  replay(){

    this.pacman = undefined;
    this.dots = [];
    this.ghosts = [];

    this.create();
    this.physics.play();


  }

  /** updates the game timer **/
  updateTimer(){
    var now = new Date().getTime();
    var distance = this.endingTime - now;
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (distance > 0){

      // update dom
      $("#rem-time").html(
        ((minutes<10) ? ('0' + minutes) : minutes )+
        ":"+
        ((seconds<10) ? ('0' + seconds) : seconds )
      );

      if( minutes === 0 && seconds < 10){
        $("#rem-time").css('color', 'red');
      }

    }

    return distance
  }

  /**
   * Returns true if the game is over
   */
  isGameOver(){
    var remainingTime = this.updateTimer();
    return remainingTime <= 0;
  }

  /**
   *
   * @param character1
   * @param character2
   * @param callback : function that takes as o-input two insrtances of the character class
   */
  addPhysicsOverLap(character1, character2, callback){

    this.physics.add.overlap(character1.phaserCharacter, character2.phaserCharacter,
      (c1, c2)=>{return callback(c1.character, c2.character, this);},
      null, this);
  }


  /**
   * Sets up all interractions between the characters
   * N.B : every call back function has to take the scene as a third parameter
   */
  setUpInterractionsBetweenCharacters(){

    // PACMAN - GHOST
    this.ghosts.forEach(
      ghost => {
        this.players.forEach(pacman => {
          this.addPhysicsOverLap(ghost, pacman, this.ghostEatPacman)
        });
      }
    );

    // PACMAN - DOTS
    this.dots.forEach(dot=>{
      this.players.forEach(pacman => {
        this.addPhysicsOverLap(pacman, dot, this.pacmanEatDot);
      });
    });



  }


  /**
   * Creates the map - should be called inside create method
   */
  createMap(){
    this.map       = this.make.tilemap({ key: 'map' });
    this.tileset   = this.map.addTilesetImage("pacman-tiles", "tiles");
    this.layer     = this.map.createStaticLayer('Pacman', this.tileset, 0, 0);


  }

  /**
   * Creates dots to eat
   */
  createDots(){
    var dotPositions = this.getDotPositions();
    var initialPosition;

    // Create the dots
    // 3% of the dots created are super dots
    dotPositions.forEach( dotPosition => {
      initialPosition = [dotPosition["colIx"], dotPosition["rowIx"]];
      this.dots.push(
        new Dot(this, "dot", initialPosition, Math.random() < 0.02 ? "super" : "normal")
      );
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


    // ---------------------------------------------------------------------
    // create player 1
    var player1Controls = {
        right: ()=>{return this.cursors.right.isDown},
        left : ()=>{return this.cursors.left.isDown},
        up   : ()=>{return this.cursors.up.isDown},
        down : ()=>{return this.cursors.down.isDown}
      };
    var player1Color = 0xFFFF00;
    var player1 = new Pacman(this, "player1", [15, 17], player1Controls, player1Color);
    this.players.push(player1);

    // ---------------------------------------------------------------------
    // create player 2
    var player2Controls = {
        right: ()=>{return this.cursors["d"].isDown},
        left : ()=>{return this.cursors["q"].isDown},
        up   : ()=>{return this.cursors["z"].isDown},
        down : ()=>{return this.cursors["s"].isDown}
      };
    var player2Color = 0x00FFF4;
    var player2 = new Pacman(this, "player1", [13, 17], player2Controls, player2Color);
    this.players.push(player2);

  }


  createGhosts(){

    // Add ghosts here
    var ghostsToCreate = [
      {
        name: "blinky",
        initialPosition: [18, 8]
      },
      {
        name: "pinky",
        initialPosition: [10, 8]
      },
      {
        name: "inky",
        initialPosition: [18, 22]
      },
      {
        name: "clyde",
        initialPosition: [10, 22]
      },

    ];

    // create and populate the list of ghosts
    ghostsToCreate.forEach(ghost => {
      this.ghosts.push(
        new Ghost(this, ghost.name, ghost.initialPosition)
      )
    });

    // // Ghost eat Pacman
    // this.ghosts.forEach(ghost => {
    //   this.physics.add.overlap(ghost.phaserCharacter, this.pacman.phaserCharacter, this.ghostEatPacman, null, this);
    // });
  }

  /**
   * Callback when a ghost eats pacman - also when pacman eats a ghost in afraid mode
   * @param ghost
   * @param pacman
   * @param scene
   */
  ghostEatPacman(ghost, pacman, scene){

    if(ghost.state === "normal"){
      // ghost eat pacman
      if(pacman.state !== "dead"){
        pacman.resetWhenEaten();
      }


    }
    else{
      // pacman eats ghost
      ghost.state = "dead";
      clearTimeout(ghost.timeout);
      ghost.timeout = setTimeout(()=>{
        ghost.state = "normal";
      }, 5000);
      scene.score += 10;
    }


  }

  /**
   * What happens when pacman eats a dot
   * @param pacman: charcarcter object
   * @param dot: charcarcter object
   * @param scene: scene we are working with
   */
  pacmanEatDot(pacman, dot, scene){

    dot.disable();
    dot.isEaten = true;

    scene.score += 10;

    // if super dot, give super power
    if(dot.typeDot === "super")
    {
      // super state
      pacman.setColor(0xfd6a02); // TODO: to implment inside pacman

      // all ghosts go in afraid mode
      scene.ghosts.forEach(
        ghost => {
          ghost.state = "afraid";
          ghost.invertDirection();
        }
      );

      // come back to normal after a while
      clearTimeout(pacman.timeout);
      pacman.timeout = setTimeout(()=>{
        pacman.resetColor();  // TODO: to implment inside pacman

        // all ghosts alive come back to normal mode
        scene.ghosts
          .filter(ghost => {return ghost.state !== "dead"})
          .forEach(ghost=> {ghost.state = "normal";});

      }, 5000);
    }


    // if all dots are eaten, reborn all of them
    var nbEatenDots = scene.dots.filter(dot => {return dot.isEaten;}).length;
    if(nbEatenDots === scene.dots.length){
      scene.dots =[];
      scene.createDots();
      scene.setUpInterractionsBetweenCharacters();
    }

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

    this.scene = scene;
    this.name = name;
    this.phaserCharacter = scene.physics.add.sprite((initialPosition[0] * 16) + 8, (initialPosition[1] * 16) + 8, characterType);
    this.phaserCharacter.setCollideWorldBounds(true);
    this.step = 8;
    this.movements = [];
    this.initialPosition = initialPosition;

    // keep inside the phaser object a reference of the character object
    this.phaserCharacter.character = this;

  }

  /**
   * Disables the character and makes it disappear
   */
  disable(){
    this.phaserCharacter.disableBody(true, true);
  }

  /**
   * Changes the color of the character
   * @param newColor : 0xffffff
   */
  setColor(newColor){
    this.phaserCharacter.setTint(newColor);
  }

  /**
   * Clears any given color and resets to the origin color
   */
  resetColor(){
    this.setColor(this.color);
  }

  // moves the character to the desired position
  setPosition(position){
    this.phaserCharacter.x = position[0] * 16 + 8;
    this.phaserCharacter.y = position[1] * 16 + 6;

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

  /**
   * Invert the current direction of a character
   */
  invertDirection(){
    this.setVelocity(
      this.getVelocity().map(x=>x * (-1))
    );
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

  /**
   *
   * @param scene
   * @param name
   * @param initialPosition
   * @param controls : obj that specifies what controls are used to trigger every control - it is an obj {right: trigger, left: trigger, ...}
   */
  constructor(scene, name, initialPosition, controls, color){
    super(scene, "pacman", name, initialPosition);
    this.controls = controls;
    this.timeout; // timeout triggered when eating a super dot
    this.color = color;

    this.setColor(color);
    this.createAnimations();
    this.setMovements();

    this.phaserCharacter.setScale(0.9);
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
    movementUp.trigger = this.controls["up"];
    movementUp.action  = ()=>{
      movementUp.defaultAction();
      this.phaserCharacter.anims.play(this.name + '_move', true);
      this.setAngle(270);
    };

    //------------------------------------------------------------------------
    // DOWN

    /* trigger */
    var movementDown = this.movements.filter(mov => {return mov.direction === 'down';})[0];
    movementDown.trigger = this.controls["down"];
    movementDown.action  = ()=>{
      movementDown.defaultAction();
      this.phaserCharacter.anims.play(this.name + '_move', true);
      this.setAngle(90);
    };

    //------------------------------------------------------------------------
    // RIGHT

    /* trigger */
    var movementRight = this.movements.filter(mov => {return mov.direction === 'right';})[0];
    movementRight.trigger = this.controls["right"];
    movementRight.action  = ()=>{
      movementRight.defaultAction();
      this.phaserCharacter.anims.play(this.name + '_move', true);
      this.setAngle(0);
    };

    //------------------------------------------------------------------------
    // LEFT

    /* trigger */
    var movementLeft = this.movements.filter(mov => {return mov.direction === 'left';})[0];
    movementLeft.trigger = this.controls["left"];
    movementLeft.action  = ()=>{
      movementLeft.defaultAction();
      this.phaserCharacter.anims.play(this.name + '_move', true);
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

  /**
   * Executed when pacman is eaten by a ghost
   */
  resetWhenEaten(){

    this.state = "dead";

    // 0. stop movement
    this.setVelocity([0, 0]);

    // 1. paralyze
    var movements = this.movements.slice(0);
    this.movements = [];

    // 2. color in red
    this.setColor("0xff0000");

    // 3. rotate animation
    var angle = 0;
    var timer = setInterval(()=>{
      angle += 90;
      this.setAngle(angle);
    }, 100);

    // 4. reposition at start position after 5 s
    setTimeout(()=>{

      clearInterval(timer);
      this.setPosition(this.initialPosition);

      // give back movement
      this.movements = movements.slice(0);

      // reset color
      this.resetColor();

      // reset state
      this.state = "normal";
      },5000);
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
    this.timeout;

    this.phaserCharacter.setScale(1.8);

    // state can be normal or afraid (when pacman eats a super dot)
    // when state is afraid - the ghost runs away from pacman and it has a different animation
    // when state is dead - the ghost takes some time to become as he was
    this.state = "normal";

  }


  setMovements(){
    super.setMovements();

    //------------------------------------------------------------------------
    // KEEP
    var movementKeep = this.movements.filter(mov=>{return mov.direction === 'keep';})[0];
    movementKeep.trigger = ()=>{return false;};
    movementKeep.action = ()=>{
      movementKeep.defaultAction();
      if (this.state === "normal"){
        // this.phaserCharacter.anims.play(this.name + '_move', true);
      }
      else if (this.state === "dead"){
        this.phaserCharacter.anims.play(this.name + '_dead', true);
      }
      else{
        // afraid - change animation
        this.phaserCharacter.anims.play(this.name + '_afrai', true);
      }

    };

    //------------------------------------------------------------------------
    // UP
    var movementUp = this.movements.filter(mov=>{return mov.direction === 'up';})[0];
    movementUp.trigger = ()=>{return false;};
    movementUp.action = ()=>{
      movementUp.defaultAction();
      if (this.state === "normal"){
        this.phaserCharacter.anims.play(this.name + '_move_up', true);
      }
      else if (this.state === "dead"){
        this.phaserCharacter.anims.play(this.name + '_dead', true);
      }
      else{
        // afraid - change animation
        this.phaserCharacter.anims.play(this.name + '_afraid', true);
      }

    };


    //------------------------------------------------------------------------
    // DOWN
    var movementDown = this.movements.filter(mov=>{return mov.direction === 'down';})[0];
    movementDown.trigger = ()=>{return false;};
    movementDown.action = ()=>{
      movementDown.defaultAction();
      if (this.state === "normal"){
        this.phaserCharacter.anims.play(this.name + '_move_down', true);
      }
      else if (this.state === "dead"){
        this.phaserCharacter.anims.play(this.name + '_dead', true);
      }
      else{
        // afraid - change animation
        this.phaserCharacter.anims.play(this.name + '_afraid', true);
      }

    };

    //------------------------------------------------------------------------
    // LEFT
    var movementLeft = this.movements.filter(mov=>{return mov.direction === 'left';})[0];
    movementLeft.trigger = ()=>{return false;};
    movementLeft.action = ()=>{
      movementLeft.defaultAction();
      if (this.state === "normal"){
        this.phaserCharacter.anims.play(this.name + '_move_left', true);
      }
      else if (this.state === "dead"){
        this.phaserCharacter.anims.play(this.name + '_dead', true);
      }
      else{
        // afraid - change animation
        this.phaserCharacter.anims.play(this.name + '_afraid', true);
      }

    };

    //------------------------------------------------------------------------
    // RIGHT
    var movementRight = this.movements.filter(mov=>{return mov.direction === 'right';})[0];
    movementRight.trigger = ()=>{return false;};
    movementRight.action = ()=>{
      movementRight.defaultAction();
      if (this.state === "normal"){
        this.phaserCharacter.anims.play(this.name + '_move_right', true);
      }
      else if (this.state === "dead"){
        this.phaserCharacter.anims.play(this.name + '_dead', true);
      }
      else{
        // afraid - change animation
        this.phaserCharacter.anims.play(this.name + '_afraid', true);
      }
    };
  }


  createAnimations(){

    var mappingAnimations = {
      blinky:{
        start:0,
        end: 0
      },
      pinky:{
        start:12,
        end: 12
      },
      inky:{
        start:24,
        end: 24
      },
      clyde:{
        start:36,
        end: 36
      }
    };


    function getAnimationGivenDirection(obj, direction){

      var mapping = {
        right: 0,
        left: 1,
        up: 2,
        down: 3
      };

      return {
        start: obj["start"] + 2 * mapping[direction],
        end: obj["end"] + 2 * mapping[direction]
      }

    }

    // animations
    this.scene.anims.create({
        key: this.name + '_move_up',
        frames: this.scene.anims.generateFrameNumbers('ghost', getAnimationGivenDirection(mappingAnimations[this.name], "up" )),
        frameRate: 10,
        repeat: -1
    });


    this.scene.anims.create({
        key: this.name + '_move_down',
        frames: this.scene.anims.generateFrameNumbers('ghost', getAnimationGivenDirection(mappingAnimations[this.name], "down" )),
        frameRate: 10,
        repeat: -1
    });


    this.scene.anims.create({
        key: this.name + '_move_left',
        frames: this.scene.anims.generateFrameNumbers('ghost', getAnimationGivenDirection(mappingAnimations[this.name], "left" )),
        frameRate: 10,
        repeat: -1
    });


    this.scene.anims.create({
        key: this.name + '_move_right',
        frames: this.scene.anims.generateFrameNumbers('ghost', getAnimationGivenDirection(mappingAnimations[this.name], "right" )),
        frameRate: 10,
        repeat: -1
    });



    // afraid animation
    this.scene.anims.create({
        key: this.name + '_afraid',
        frames: this.scene.anims.generateFrameNumbers('ghost', {start: 10, end: 10}),
        frameRate: 10,
        repeat: -1
    });

    // dead animation
      this.scene.anims.create({
        key: this.name + '_dead',
        frames: this.scene.anims.generateFrameNumbers('ghost', {start: 22, end: 22}),
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
   * When ghost affraid, chooses the opposite direction
   * @param distX
   * @param distY
   */
  getDirectionBasedOnDistance(distX, distY){

    if (Math.abs(distX) > Math.abs(distY)){
      // we have to choose between right and left in normal mode

      if(this.state === "normal"){
        return (distX > 0) ? "right" : "left";
      }
      else{
        return (distX > 0) ? "left" : "right";
      }

    }
    else {
      // we have to choose between up and down
      if(this.state === "normal"){
        return (distY > 0) ? "down" : "up";
      }
      else {
        return (distY > 0) ? "up" : "down";
      }
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
 * Represents a dot to be eaten by pacman
 */
class Dot extends Character{

  /**
   *
   * @param scene : scene object to work on
   * @param name : name of the dot - should be 'dot'
   * @param initialPosition : array of length 2
   * @param type : "normal" or "super - super dots give super powers to pacman
   */
  constructor(scene, name, initialPosition, type){
    super(scene, "dot", name, initialPosition);
    this.typeDot = type;
    this.isEaten = false;

    if(this.typeDot === "super"){
      this.phaserCharacter.setScale(2.25);
      this.setColor(0xE0CE00);
    }

  }

  createAnimations(){}
  setMovements(){}
}

/**
 * Class to represent a type of movement of a charchter.
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
