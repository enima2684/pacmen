try{
  Message = require('../Message').Message;
  var Joi = require('joi');
} catch (e) {}


var messages = {};

/*** gameState:publish ***/
messages["gameState:publish"] = new Message({

  name: "gameState:publish",

  description: "Event send by the server to the client that contains all the game state and is used on the client side" +
  " to update the client game state",

  schema: Joi.object().keys({
            "isOver": Joi.boolean(),
            "name": Joi.string().required()
          })

});


try{  module.exports = {
  messages
};} catch (e) {}

