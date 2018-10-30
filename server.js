const express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/assets', express.static('assets'));
app.use('/js', express.static('js'));
app.use('/css', express.static('css'));


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

/** SOCKET EVENTS **/

var players = [];

io.on('connection', client => {
  console.log('User {0} is connected !'.format(client.id));

  if(players.length > 0){
    // join an existing game

    // 1. create the pacman in others
    io.emit('createPacman', {
      name: "pong",
      sender: client.id
    });

    io.to(players[0]).emit('test', "trigger transmission to all");

  }

  players.push(client.id);
  console.log(client.id + " player added !");

  /** Disconnect Event **/
  client.on('disconnect', () =>{
    console.log('User {0} is now disconnected !'.format(client.id));
  });


  client.on('answerGameState', state=>{
    console.log("state updated!");
    console.log(state);
  });


  client.on('movementUpdate', msg =>{
    // console.log(msg);
  });

  client.on('forall', msg=>{
    console.log("I am the one who received the message for all !");
    io.emit('forall', "hello");
  });


});

/*** LISTENNER ******/
http.listen(5000, ()=>{
  console.log("listening on port 5000");
});
