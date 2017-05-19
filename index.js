var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var repas = "";



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
    console.log("/");
    res.send('Chhiwat hana server ok');
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === VALIDATION_TOKEN) {
        console.log("Validating webhook");
        res.status(200).send(req.query['hub.challenge']);
    } else {
        console.log('invalid token');
        res.send('Invalid verify token');
    }
});


// handler receiving message
app.post('/webhook', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          // Putting a stub for now, we'll expand it in the following steps
          console.log("Message data: ", event.message);
          receiveIt(event);
        } else if (event.postback) {
          console.log("Webhook received unknown event: ", event);
          receivedPostback(event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

function receiveIt(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));

    var messageId = message.mid;

    var messageText = message.text;
    var messageAttachments = message.attachments;

  if (messageText) {

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'generic':
        sendGenericMessage(senderID);
        break;

      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}


function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback
  // button for Structured Messages.
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " +
    "at %d", senderID, recipientID, payload, timeOfPostback);

    request({
      uri: 'https://graph.facebook.com/v2.6/'+senderID,
      qs: {
        fields:'first_name,last_name,profile_pic,locale,timezone,gender',
        access_token: process.env.PAGE_ACCESS_TOKEN
       },
      method: 'GET'

    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        //  console.log("fistname: "+JSON.stringify(response.body.first_name));
          var user = JSON.parse(body);
          sendTextMessage(senderID, "Welcome to Oh-Yeah " + user.first_name +" What are you looking for today?" );
          var message = {
            "quick_replies": [
              {
                "content_type":"text",
                "title":"Unisex Tees",
                "payload":"quick_reply_tshirt"
              },
              {
                "content_type":"text",
                "title":"Hoodies & Sweatshirts",
                "payload":"quick_reply_hoodies"
              },
            ]
          };
          sendQuickMessage(senderID, message);

      } else {
        console.error("Unable to send message.");
        console.error(response);
        console.error(error);
      }
    });

  // When a postback is called, we'll send a message back to the sender to
  // let them know it was successful

}

sendQuickMessage(recipientId, message){

  var messageData = {
    recipient: {
      id: recipientId
    },
    message: message
  }

  callSendAPI(messageData);
}


function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "HELLO SUMMER",
            subtitle: "T-Shirt of quality, very comfortable and well cut. NOT AVAILABLE IN STORES!",
            item_url: "https://www.teezily.com/hello-summer-oh-yeah?source=store&store=ohyeah-summer",
            image_url: "https://dpar4s8x3qago.cloudfront.net/previews/images/259/856/791/normal/hello-summer-oh-yeah.jpg?1494844230",
            buttons: [{
              type: "web_url",
              url: "https://www.teezily.com/hello-summer-oh-yeah?source=store&store=ohyeah-summer",
              title: "Go to Store"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "SUMMER TIME HAVE FUN LIMITED EDITION",
            subtitle: "Limited Time Only ! Makes a great gift. NOT AVAILABLE IN STORES! See additional styles and colors",
            item_url: "https://www.teezily.com/summer-time-have-fun-limited-edition?source=store&store=ohyeah-summer",
            image_url: "https://dpar4s8x3qago.cloudfront.net/previews/images/262/962/943/original/summer-time-have-fun-limited-edition.jpg?1494930534",
            buttons: [{
              type: "web_url",
              url: "https://www.teezily.com/summer-time-have-fun-limited-edition?source=store&store=ohyeah-summer",
              title: "Go to Store"
            }, {
              type: "postback",
              title: "Call me",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s",
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });
}
