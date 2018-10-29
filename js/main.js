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

var gameDuration = 0.1; // in minutes

/********** MAIN *****************/

$(document).ready(()=>{

  phaserConfig['scene'] = pacManScene;
  var game = new Phaser.Game(phaserConfig);


  // set timer of the game
  var startingTime = new Date().getTime();
  var endingTime = startingTime + gameDuration * 60000;
  var gameTimer = setInterval(()=>{

    var now = new Date().getTime();
    var distance = endingTime - now;
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    $("#rem-time").html(minutes+":"+ seconds);

    if( minutes == 0 && seconds < 10){
      $("#rem-time").css('color', 'red');
    }

    // end game
    if (distance <= 0) {
      clearInterval(gameTimer);
      $("#rem-time").html("0:0");
      game.start();
    }

    }, 500);



});
