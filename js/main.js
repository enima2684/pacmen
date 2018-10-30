var names = [
  "Abi",
  "Adele",
  "Amine",
  "Antoine",
  "Cecile",
  "Chloe",
  "Corrado",
  "Fareaha",
  "Filippo",
  "Geoffroy",
  "Harnit",
  "Heather",
  "Helen",
  "JN",
  "Laura",
  "Marie",
  "Mathis",
  "Maya",
  "Mehdi",
  "Nicolas",
  "Nik",
  "Nizar",
  "Paul",
  "Priyanka",
  "Antoine",
  "Regis"
];



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

var playerName = names[Math.floor(names.length * Math.random())];
var pacManScene = new PacManScene(
  speed         = 150,        // defines the speed of the characters
  safetiles     = [7, 14],    // defines what a wall is
  gameDuration  = 1.5,     // game duration in minutes
  owner         = playerName
);


/********** MAIN *****************/

$(document).ready(()=>{


  phaserConfig['scene'] = pacManScene;
  var game = new Phaser.Game(phaserConfig);

  // replay button
  $("#btn-replay").on('click', ()=>{
    pacManScene.replay();
  });

});
