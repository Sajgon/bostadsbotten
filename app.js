// Require the module express
var express = require('express');

// Create a new express server, store in the variable app
var app = express();

// Store chat messages in messages
var messages = [];

// Store response objects that we want to respond to later
var responseObjs = [];

var data = require('./MOCK-DATA.json');

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Active index
var cindex = 0;

var state = [
    {   "step": "introduction",
        "options": ["Hitta bostad", "Slumpa bostad"],
        "message": "Hejsan! Jag är en simpel chattbot som gärna hjälper dig att hitta ditt drömboende. För nuvarande kan jag hjälpa dig att.." ,
        "err": "Vänligen välj att 'hitta bostad' eller 'slumpa bostad'."},

    {   "step": "city",
        "message": "Vilken stad vill du hitta boende i?",
        "options": ['Stockholm', 'Göteborg', 'Malmö'],
        "err": "Vi kan inte hantera ditt val av stad just nu. Vänligen försök igen.",
        "value":undefined},

    {   "step": "price",
        "message": "Vad är din maxbudget?",
        "options": ['0-500.000','500.000-1.000.000', '1.000.000-2.500.000', '2.500.000-5.000.000'],
        "err": "Vi kan inte hantera ditt val av maxbudget just nu. Vänligen försök igen.",
        "value":undefined},

    {	"step": "sqm",
        "message": "Hur stor yta vill du bo på?",
        "options": ["0-30", "31-60", "61-80", "81-150"],
        "err": "Vi kan inte hantera ditt val av yta att bo på. Vänligen försök igen.",
        "value":undefined},

    {	"step": "generate",
        "message": "Söker efter bostäder enligt dina kriterier ...",
        "options": ["Återställ"],
        "err": "Försår inte ..",
        "value":undefined}
];

messages.push({
    name: "Bostadsbotten",
    time: new Date().getTime(),
    text: state[0].message,
    options: state[0].options
});


function botResponse(value) {

    if (value) { value = capitalizeFirstLetter(value.toLowerCase()); }
    let st = state[cindex];

    // Value handler
    // Check if inputvalue is OK
    let correctInput = st.options.indexOf(value);
    if (correctInput == -1) {
        messages.push({
            name: "Bostadsbotten",
            time: new Date().getTime(),
            text: st.err,
            options: st.options || false
        });
        return answer();
    }else{
        state[cindex].value = value;
        cindex++
    }

    st = state[cindex];
    if (st){
        state[cindex].value = value;
        messages.push({
            name: "BOT",
            time: new Date().getTime(),
            options: st.options || false,
            text: st.message
        });
    }

    if (st.step === "generate") {
        let propertiesObj = generateLiving(state);
        let txt = propertiesObj.length>0 ? "Vi fann dessa object" : "Tyvrr finns det inga lediga object enligt dina kriterier.";
        messages.push({
            name: "BOT",
            time: new Date().getTime(),
            text: txt,
            properties: propertiesObj
        });
    }

    answer();
    //console.log("state",state[cindex])
}






function generateLiving(st) {
    //console.log("st",st)
    var objects = [];
console.log("goes")
    objects = data.filter(function(obj){

        var meetsRequirements = true;
        for (i in st) {
            var inputObj = st[i];
            var dataValue = obj[inputObj.step];

            if (dataValue) {

                var hasTwoValues = inputObj.value.indexOf("-");
                if (hasTwoValues > 0) {
                    let min = inputObj.value.substr(0, hasTwoValues).split('.').join("");
                    let max = inputObj.value.substr(hasTwoValues + 1, inputObj.value.length).split('.').join("");
                    //console.log(obj[inputObj.step], min, max, dataValue >= min && dataValue <= max)
                    meetsRequirements = (dataValue >= min && dataValue <= max);
                }else{
                    meetsRequirements = (dataValue === inputObj.value);
                }
            }

            if (meetsRequirements === false){break;}
        }

        console.log("meetsRequirements", meetsRequirements)
        return meetsRequirements;
    });


    console.log("objects", objects)
    return objects;
}



// Testfunction
function runTest() {
    console.log("Running test..")
    let st = state;
    for(var i=1;i<state.length;i++){

        let obj = st[i];
        console.log("Fråga:",obj.question)
        for (var t=0;t<obj.options.length;t++){
            console.log(obj.options[t])
        }
        let randomOption = obj.options[getRandomInt(obj.options.length)];
        console.log("Du valde", randomOption);
        obj.value = randomOption;
    }

    generateLiving(st);
}

//runTest();






// Send a new message
app.get('/send-message/:message',function(req,res){
  // add the message to the message array
  // with a timestamp and the text of the message
  messages.push({
    name: "Anton",
    time: new Date().getTime(),
    text:req.params.message
  });
  res.json({ok:"messaged recieved"});
  botResponse(req.params.message);
  answer();
});

// Get all messages after a certain timestamp 
app.get('/read-messages/:lastTime',function(req,res){
  responseObjs.push({
    name: "Anton",
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



































