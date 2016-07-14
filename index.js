var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

// Server frontpage
app.get('/', function (req, res) {
    res.send('Chhiwat hana server');
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'testbot_verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});


// handler receiving messages
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
              //    fatafeat(event.sender.id, event.message.text);
              sendMessage(event.sender.id, { text: event.message.text });
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
            console.log(event.message.mid);
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

//send rich message with fatafeat
function fatafeat(recipientId, text){
  //  sendSeen(recipientId);
  //  sendEcrire(recipientId);
    var fatafeat = 'http://www.fatafeat.com/recipes/search?section=&category=&season=&chef=&kitchen=&group=&keyword=&page='+text;
    console.log(fatafeat);
    request(fatafeat, function(error, response, html){
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
          message = {
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
