const express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const Joi = require('joi');

var Message  = require('./socket/Message').Message;
var gameStateMessages = require('./socket/gameState/index').messages;

app.use('/assets', express.static('assets'));
app.use('/js', express.static('js'));
app.use('/css', express.static('css'));
app.use('/socket', express.static('socket'));


if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}


/*** ROUTES ******/
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});



console.log(gameStateMessages["gameState:publish"].description);
/**** GAME STATE OBJECT *****/


class CharacterState{

  constructor(id, name, type, position, velocity, state, score=0, kwargs={}){

    this.id = id;
    this.name = name;
    this.type = type; // pacman , ghost, dot
    this.position = position;
    this.velocity = velocity;
    this.state = state;
    this.score = score;
    this.kwargs = kwargs;

    // run some sanity checks
    this.testObject()

  }

  /**
   * Run tests to check the the object contains wh  t we expect from him
   */
  testObject(){

    // test the types
    if( ["pacman", "dot", "ghost"].indexOf(this.type) < 0){
      throw new Error("type in CharacterState should be pacman dot or ghost")
    }
  }

}


class GameState{

  constructor(){
    this.startingTime = undefined;
    this.endingTime = undefined;
    this.characters = []; // array of CharacterState objects
    this.socketIds = [];

  }


  /**
   * Updates all characters received on a mov data
   * @param data
   */
  onUpdataMovData(data){

    // 1. update the data
    try {
      data.forEach(d => this.updateOneCharacterMovData(d));
    }
    catch (e) {
      console.log(e);
    }


  }

  /**
   * Updates a single character
   * @param d
   */
  updateOneCharacterMovData(d){

    var character = this.characters.filter(c=>{return c.id === d["characterId"];});
    if(character.length !== 0){
      character = character[0];
      character.position = d["position"];
      character.velocity = d["velocity"];
      character.state    = d["state"];
      character.score    = d["score"];
    }
    else{
      // create the new character
      character = new CharacterState(
        d["characterId"],
        d["characterName"],
        d["characterType"],
        d["position"],
        d["velocity"],
        d["state"],
        d["kwargs"],
        0
      );
      this.characters.push(character);
    }
  }

  /**
   * Overwirtes the game state given what has been received from the client
   * @param gsClient
   */
  overwriteState(gsClient){
    this.startingTime = undefined;
    this.endingTime = undefined;
    this.characters = []; // array of CharacterState objects
    this.onUpdataMovData(gsClient);
  }
}

var gameState = new GameState();

/** SOCKET EVENTS **/

io.on('connection', client => {
  console.log('User {0} is connected !'.format(client.id));

  if( gameState.socketIds.length === 0 ){
    // Creation of a new game
    console.log("NEW GAME !");

    // gather ids for all objects
    io.to(client.id).emit('serverRequestStateFromClient', '')

  }
  else{

    if( gameState.socketIds.indexOf(client.id) < 0 ){


      // Joining an existing game
      console.log("Joining an existing game !");

      // 1. get the game state and send it to the client
      // -- expect the client to update his internal state
      io.to(client.id).emit('initialGameState', gameState);

    }
  }
  gameState.socketIds.push(client.id);

  /** serverRequestStateFromClientAnswer **/
  client.on('serverRequestStateFromClientAnswer', gsClient => {
    // overwrite the internal state with the data received
    console.log("setting initial state");
    gameState.overwriteState(gsClient);
  });

  /** Reception of update Mov **/
  client.on('updateMov', data =>{

    // update the game state
    if(data !== null){
      gameState.onUpdataMovData(data);

      // broadcast the new state to everyone
      client.broadcast.emit('updateStateToClient', gameState);
    }


  });


  client.on('reset', msg=>{
    gameState = new GameState();
    client.broadcast.emit('updateStateToClient', gameState);
    // gather ids for all objects
    io.to(client.id).emit('serverRequestStateFromClient', '')
  });

  /** Disconnect Event **/
  client.on('disconnect', () =>{
    console.log('User {0} is now disconnected !'.format(client.id));
  });

});

/*** LISTENNER ******/
http.listen(5000, ()=>{
  console.log("listening on port 5000");
});
