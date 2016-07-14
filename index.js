var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));


// App Secret can be retrieved from the App Dashboard
const APP_SECRET = (process.env.MESSENGER_APP_SECRET) ?
  process.env.MESSENGER_APP_SECRET :
  config.get('appSecret');

// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ?
  (process.env.MESSENGER_VALIDATION_TOKEN) :
  config.get('validationToken');

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
  (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
  config.get('pageAccessToken');

// URL where the app is running (include protocol). Used to point to scripts and
// assets located at this address.
const SERVER_URL = (process.env.SERVER_URL) ?
  (process.env.SERVER_URL) :
  config.get('serverURL');

if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL)) {
  console.error("Missing config values");
  process.exit(1);
}

// Server frontpage
app.get('/', function (req, res) {
    res.send('Chhiwat hana server');
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === VALIDATION_TOKEN) {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});


// handler receiving message
app.post('/webhook', function (req, res) {

    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];

        if (event.message && event.message.text) {
          if (!kittenMessage(event.sender.id, event.message.text)) {
               //sendMessage(event.sender.id, {text: event.message.text});
              // if(event.message.text === "fatafeat")
                  sendSeen(event.sender.id);
                  sendEcrire(event.sender.id);
                  menu(event.sender.id);
                  if(event.message.text === "video"){
                    var  message = {
                          "attachment": {
                              "type": "video",
                              "payload": {
                                  "url":"http://www.sample-videos.com/video/mp4/720/big_buck_bunny_720p_1mb.mp4"
                              }
                          }
                      };
                      sendVideo(event.sender.id, message);
                  }else
                  rihana(event.sender.id, event.message.text);


              //sendMessage(event.sender.id, { text: event.message.text });
           }

          // var what = event.message.text;
          //   switch(what){
          //     case "pizza fruit de mer":
          //       var message = "العجينة" +
          //                         "300 جرام طحين" +
          //                         "3 ملعقة كبيرة زيت زيتون" +
          //                         "نصف ملعقة صغيرة ملح" +
          //                         "ملعقة كبيرة سكر" ;
          //       sendMessage(event.sender.id, {text: message});
          //         kittenMessage(event.sender.id, event.message.text);
          //       break;
          //     case "7ot":
          //       sendMessage(event.sender.id, {text: "7ot ? bent lik chomicha ana ? hhhhhhh"});
          //     break;
          //     default:
          //       sendMessage(event.sender.id, {text: "" + event.message.text});
          //     break;
          //   }

            } else if (event.postback) {
              console.log("Postback received: " + JSON.stringify(event.postback));
          }else if(event.message && event.message.is_echo){
            console.log(event.message.metadata);
          }
    }
    res.sendStatus(200);
});


function sendSeen(recipientId) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            sender_action:"mark_seen",
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};


function menu(recipientId){
  request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
      method: 'POST',
      json: {
        recipient: {id: recipientId},
        setting_type : "call_to_actions",
        thread_state : "existing_thread",
        call_to_actions:[
          {
            "type":"postback",
            "title":"Help",
            "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_HELP"
          },
          {
            "type":"postback",
            "title":"Start a New Order",
            "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_START_ORDER"
          },
          {
            "type":"web_url",
            "title":"View Website",
            "url":"http://petersapparel.parseapp.com/"
          }
        ]

      }
  }, function(error, response, body) {
      if (error) {
          console.log('Error sending message: ', error);
      } else if (response.body.error) {
          console.log('Error: ', response.body.error);
      }
  });
}

// generic function sending messages
function sendEcrire(recipientId) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            sender_action:"typing_on",
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

// generic function sending messages
function sendTypingOff(recipientId) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            sender_action:"typing_off",
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};
// generic function sending messages
function sendGreeting() {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
          setting_type:"greeting",
            greeting:{
              "text":"Welcome to My Company!"
            }

        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};
// generic function sending messages
function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,

        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

function sendVideo(recipientId, message){
  request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
      method: 'POST',
      json: {
          recipient: {id: recipientId},
          message: message,

      }
  }, function(error, response, body) {
      if (error) {
          console.log('Error sending message: ', error);
      } else if (response.body.error) {
          console.log('Error: ', response.body.error);
      }
  });
}

// generic function sending messages
function sendQuikMessage(recipientId) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message:{
               "text":"Pick a color:",
               "quick_replies":[
                 {
                   "content_type":"text",
                   "title":"Red",
                   "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED"
                 },
                 {
                   "content_type":"text",
                   "title":"Green",
                   "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
                 }
               ]
             }

        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

//rihana Chhiwat
function rihana(recipientId, text){
  var values = text.split(' ');
  var rihanaLink = "";

  switch (values[0]) {
    case "regime":
        rihanaLink = 'http://chhiwat.ma/regime-et-minceur/recettes-pour-le-regime/page/'+ Number(values[1]) + "/";
      break;
    case "rihana":
      rihanaLink = 'http://chhiwat.ma/author/chhiwat-rihanna-kamal/page/'+ Number(values[1]) + '/';
      break;
    case "gateau":
        rihanaLink = 'http://chhiwat.ma/gateaux-2/gateaux-et-cakes/page'+ Number(values[1]) + '/';
    case "pizza":
      rihanaLink = 'http://chhiwat.ma/recettes-divers/pizza-pastry/page' + Number(values[1]) + '/';
    break;
    default:

  }

  console.log(rihanaLink);
  request.get({uri: rihanaLink}, function(error, response, html){
    if(!error && response.statusCode == 200){

      var $ = cheerio.load(html);
      var articles = $('article');
      var images = articles.find('.post-thumbnail').find('img').map(function(){
        return $(this).attr('src')
      });

      var titres = articles.find('.post-box-title a').map(function(){
      return $(this).text()
    });

      var liens = articles.find('a').map(function(){
      return $(this).attr('href')
    });

      console.log("articles : " + articles.length);
      var elements = [{}];
      for(var i=0; i<titres.length; i++){
        elements[i] = {
          "title": titres[i],
          "subtitle": $(this).find('.text').text(),
          "image_url":  images[i],
          "buttons": [{
              "type": "web_url",
              "url": liens[i],
              "title": "Voir"
              }, {
              "type": "postback",
              "title": "J'aime",
              "payload": "User " + recipientId + " likes repas "  + images[i],
          }]
      };


  }
  var  message = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": elements
            }
        }
    };
    sendMessage(recipientId, message);
    }else{
      console.log('error' + error);
    }
    sendTypingOff(recipientId);

  })
}

//send rich message with fatafeat
function fatafeat(recipientId, text){
  //  sendSeen(recipientId);
  //  sendEcrire(recipientId);
    var fatafeatLink = 'http://www.fatafeat.com/recipes/search?section=&category=&season=&chef=&kitchen=&group=&keyword=&page='+Number(text);
    console.log(fatafeatLink);
    request(fatafeatLink, function(error, response, html){
      if(!error){
        var $ = cheerio.load(html);
        var details = $('.container.wasafat').find('.item').find('.details');
        var img = $('.container.wasafat').find('.item').find('.pic').find('img');

        var countries = $(".theProgramName").find('span').map(function(){
          return $(this).text()
        });
        var times = $('.timeOfPreparation').find('span').map(function(){
          return $(this).text();
        });
        var index = 0;



    var d =  details.map(function(){
          var imgUrl = img.get(index).attribs['src'];
        var  message = {
              "attachment": {
                  "type": "template",
                  "payload": {
                      "template_type": "generic",
                      "elements": [{
                          "title": $(this).find('.name').text() + ' ' + countries[index] + ' ' + times[index],
                          "subtitle": $(this).find('.text').text(),
                          "image_url": imgUrl ,
                          "buttons": [{
                              "type": "web_url",
                              "url": $(this).find('.link').text(),
                              "title": "Voir"
                              }, {
                              "type": "postback",
                              "title": "J'aime",
                              "payload": "User " + recipientId + " likes repas "  + imgUrl,
                          }]
                      }]
                  }
              }
          };
          console.log(d);
          sendMessage(recipientId, message);
          index++;
          console.log(imgUrl);

        });
        console.log('okokoko');
      }else{
        console.log(error);
      }
    });


}




// send rich message with kitten
function kittenMessage(recipientId, text) {

    text = text || "";
    var values = text.split(' ');

    if (values.length === 3 && values[0] === 'kitten') {
        if (Number(values[1]) > 0 && Number(values[2]) > 0) {

            var imageUrl = "https://placekitten.com/" + Number(values[1]) + "/" + Number(values[2]);

            message = {
                "attachment": {
                    "type": "template",

                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Kitten",
                            "subtitle": "Cute kitten picture",
                            "image_url": imageUrl ,
                            "buttons": [{
                                "type": "web_url",
                                "url": imageUrl,
                                "title": "Voir"
                                }, {
                                "type": "postback",
                                "title": "I like this",
                                "payload": "User " + recipientId + " likes kitten " + imageUrl,
                            }]
                        }]
                    }
                }
            };

            sendMessage(recipientId, message);

            return true;
        }
    }

    return false;

};
