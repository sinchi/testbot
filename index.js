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
    var payload = (message.quick_reply) ? message.quick_reply.payload : '';

  if (messageText) {

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'generic':
        sendGenericMessage(senderID);
        break;
      case 'Jewelry':
        jewelryQuickMessageChoosen(senderID);
      break;
      case 'Watches':
        watchQuickMessageChoosen(senderID);
      break;

      default:
        sendTextMessage(senderID, messageText + '' /*+ payload JSON.parse(message).quick_reply.payload*/);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  } else if(payload){
    console.log("payload : " + payload);
    switch (payload) {
      case 'quick_reply_jewelry':
        sendTextMessage(senderID, "You love Jewelry " + JSON.stringify(message));
        break;
      case 'quick_reply_watches':
        sendTextMessage(senderID, "You love Watches");
        break;
    }
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
          switch(payload){
            case 'GET_STARTED_PAYLOAD':
              sendTextMessage(senderID, "Welcome to Trust Dream - Jewelry&Watches " + user.first_name +" What are you looking for today?", true);
            break;
          }

      } else {
        console.error("Unable to send message.");
        console.error(response);
        console.error(error);
      }
    });

  // When a postback is called, we'll send a message back to the sender to
  // let them know it was successful

}

function sendQuickMessageChooseOne(recipientId){

  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text:"Choose one:",
      quick_replies: [
        {
          content_type:"text",
          title:"Jewelry",
          payload:"quick_reply_jewelry"
        },
        {
          content_type:"text",
          title:"Watches",
          payload:"quick_reply_watches"
        },
      ]
    }
  };

  callSendAPI(messageData);
}

function jewelryQuickMessageChoosen(recipientId){
  sendTextMessage(recipientId, 'You have choosen Jewelry');
}

function slugify(text)
{
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

function watchQuickMessageChoosen(recipientId){
  sendTextMessage(recipientId, 'You have choosen Watches');
  request({
    uri: 'https://bccfcf062de7926851b727550bfdbdf7:64ea7967cfa60317e1eaa6e639598718@testo-mania.myshopify.com/admin/products.json',
    /*headers: {
      "X-Shopify-Storefront-Access-Token": "3d02750484be7c34eb8d53317b7d1f8a"
    },
    /*json: {
      query: `
        query {
          shop {
            name
            description
            products(first:4) {
              pageInfo {
                hasNextPage
                hasPreviousPage
              },
              edges {
                node {
                  id
                  title
                  description
                  options {
                    name
                    values
                  }
                  variants(first: 250) {
                    pageInfo {
                      hasNextPage
                      hasPreviousPage
                    }
                    edges {
                      node {
                        title
                        selectedOptions {
                          name
                          value
                        }
                        image {
                          src
                        }
                        price
                      }
                    }
                  }
                  images(first: 250) {
                    pageInfo {
                      hasNextPage
                      hasPreviousPage
                    }
                    edges {
                      node {
                        src
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `}*/

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      /*var data = body.data;
      var title = data.shop.products.edges[0].node.title;
      var edges = data.shop.products.edges;
      var elements = [];*/
    console.log("BODY BODY");
     console.log(body);
      for(var i=0; i< edges.length; i++){
        var edge = edges[i];
        console.log(edge);
         console.log(edge.node.images.edges);
         console.log("OPTIONS");
         console.log(edge.node.options);
         console.log("VARIANTES");
         console.log(JSON.stringify(edge.node.variants));
        elements.push({
          title: edge.node.title ,
          subtitle: edge.node.description,
          item_url: "https://testo-mania.myshopify.com/products/"+slugify(edge.node.title),
          image_url: edge.node.images.edges[0].node.src,
          buttons: [{
            type: "web_url",
            url: "https://testo-mania.myshopify.com/products/"+edge.node.title,
            title: "Go to Store"
          }, {
            type: "postback",
            title: "Share",
            payload: "Payload for first bubble",
          }]
        });
      }
      var messageData = {
        recipient: {
          id: recipientId
        },
        message: {
          attachment: {
            type: "template",
            payload: {
              template_type: "generic",
              elements: elements
            }
          }
        }
      };
      callSendAPI(messageData);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });
}

function sendGenericMessage(recipientId) {
  request({
    uri: 'https://testo-mania.myshopify.com/api/graphql',
    headers: {
      "X-Shopify-Storefront-Access-Token": "3d02750484be7c34eb8d53317b7d1f8a"
    },
    json: {
      query: `
        query {
          shop {
            name
            description
            products(first:20) {
              pageInfo {
                hasNextPage
                hasPreviousPage
              }
              edges {
                node {
                  id
                  title
                  description
                  options {
                    name
                    values
                  }
                  variants(first: 250) {
                    pageInfo {
                      hasNextPage
                      hasPreviousPage
                    }
                    edges {
                      node {
                        title
                        selectedOptions {
                          name
                          value
                        }
                        image {
                          src
                        }
                        price
                      }
                    }
                  }
                  images(first: 250) {
                    pageInfo {
                      hasNextPage
                      hasPreviousPage
                    }
                    edges {
                      node {
                        src
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `}

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = body.data;
      var title = data.shop.products.edges[0].node.title;
      var edges = data.shop.products.edges;
      var elements = [];
    //  console.log(products);
      for(var i=0; i< edges.length; i++){
        var edge = edges[i];
        console.log(edge);
         console.log(edge.node.images.edges);
         console.log("OPTIONS");
         console.log(edge.node.options);
         console.log("VARIANTES");
         console.log(JSON.stringify(edge.node.variants));
        elements.push({
          title: edge.node.title,
          subtitle: edge.node.description,
          item_url: "https://testo-mania.myshopify.com/products/"+slugify(edge.node.title),
          image_url: edge.node.images.edges[0].node.src,
          buttons: [{
            type: "web_url",
            url: "https://testo-mania.myshopify.com/products/"+edge.node.title,
            title: "Go to Store"
          }, {
            type: "postback",
            title: "Call Postback",
            payload: "Payload for first bubble",
          }]
        });
      }
      var messageData = {
        recipient: {
          id: recipientId
        },
        message: {
          attachment: {
            type: "template",
            payload: {
              template_type: "generic",
              elements: elements
            }
          }
        }
      };
      callSendAPI(messageData);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });

}

function sendTextMessage(recipientId, messageText, started) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData, started);
}

function callSendAPI(messageData, started) {
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
        if(started){
          sendQuickMessageChooseOne(messageData.recipient.id);
        }
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });
}
