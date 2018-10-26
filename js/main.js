var phaserConfig = {
  title: "PacMen",
  parent: "game-screen", // id of the dom element containing the game
  type: Phaser.AUTO,
  width: 448,
  height: 496,
  fps: 30,
  physics:{
    default: 'arcade',
    debug: false
  }
};

var pacManScene = new PacManScene(
  speed     = 150,                 // defines the speed of the characters
  safetiles = [7, 14]              // defines what a wall is

);


/********** MAIN *****************/

$(document).ready(()=>{

  phaserConfig['scene'] = pacManScene;
  var game = new Phaser.Game(phaserConfig);

});
