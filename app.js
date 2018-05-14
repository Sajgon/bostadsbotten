// Require the module express
var express = require('express');

// Create a new express server, store in the variable app
var app = express();

// Store chat messages in messages
var messages = [];

// Store response objects that we want to respond to later
var responseObjs = [];

// Send a new message
app.get('/send-message/:message',function(req,res){
  // add the message to the message array
  // with a timestamp and the text of the message
  messages.push({
    time: new Date().getTime(),
    text:req.params.message
  });
  res.json({ok:"messaged recieved"});
  answer();
});

// Get all messages after a certain timestamp 
app.get('/read-messages/:lastTime',function(req,res){
  responseObjs.push({
    lastTime: req.params.lastTime,
    time: new Date().getTime(),
    res: res
  });
  answer();
});

// Point to a folder where we have static files
// (our frontend code)
app.use(express.static('www'));

app.listen(3000, function () {
  console.log('Express app listening on port 3000!');
});

// Add an interval for answer so that the function
// runs even if nobody is chatting right now
setInterval(answer,1000);

function answer(){
  // Answer things
  responseObjs.forEach(function(obj){
    var res = obj.res,
        time = obj.time,
        lastTime = obj.lastTime,
        answer = [],
        now = new Date().getTime();
    // collect all messages for that hasn't been read yet
    messages.forEach(function(message){
      if(message.time > lastTime){
        answer.push(message);
      }
    });
    // close the response = send to browser
    // if there are unread messages or the request
    // is older than 25 seconds
    if(answer.length || now - time > 25000){
      res.json(answer);
      obj.answered = true;
    }
  });
  // Remove things from the responseObjs array
  // that has been answered
  responseObjs = responseObjs.filter(function(resObj){
    return !resObj.answered;
  });
}
