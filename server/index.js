const express = require('express');
const bodyParser = require('body-parser');
var session = require('express-session');
var config = require('./config.js');

const app = module.exports = express();

app.use(bodyParser.json());
app.use(session({
  secret: config.secret,
  resave: true,
  saveUninitialized: false,
  cookie:{
    maxAge: (1000*60*60*24*14) //this is 14 days
  }
}))

app.use(express.static(__dirname + './../build'))

var userController = require("./userController.js");




// Chess engine Stockfish AI
var sendResult = 'blank';
var stockfish = require('stockfish')();

stockfish.onmessage = function(event) {
  let result = event.data ? event.data : event;
  sendResult = result;
  console.log(sendResult);
};


//////////Endpoints for the front end
app.post('/api/getStockfishMove', function(req, res){
  
  sendResult = 'blank';
  let {fen, level} = req.body;
  console.log(fen);
  console.log(level);
  
  stockfish.postMessage('position fen ' + fen);
  stockfish.postMessage("go depth " + level);
  
  let count = 0;
  function awaitResult(){
    if (!sendResult.match(/bestmove/) && count < 10){
      setTimeout(() => {
        count ++; 
        awaitResult(); 
      }, 500);
    }
    else{
      return res.status(200).send(sendResult);
    }
  }
 
  awaitResult();

})

stockfish.postMessage('position fen rnbqkbnr/ppp1pppp/8/3P4/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2');
stockfish.postMessage("go depth 2");

app.listen(config.port, console.log("you are now connected on " + config.port));
