const express = require('express');
var app = express();
var http = require('http').Server(app);

app.use('/assets', express.static('assets'));
app.use('/js', express.static('js'));
app.use('/css', express.static('css'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(5000, ()=>{
  console.log("listening on port 5000");
});


