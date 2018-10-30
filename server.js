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

  var address = client.handshake.address;
  console.log("User {0} is connected from {1}".format(client.id, address));

  // update list of players
  

  /** Disconnect Event **/
  client.on('disconnect', () =>{
    console.log('User {0} is now disconnected !'.format(client.id));
  });

  client.on('movementUpdate', msg =>{
    console.log(msg);
  });


});

/*** LISTENNER ******/
http.listen(5000, ()=>{
  console.log("listening on port 5000");
});
