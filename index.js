"use strict";

require('dotenv').config();

var Botkit = require('botkit'),
    os = require('os'),
    url = require('url'),
    http = require('http'),
    request = require('request'),
    formatter = require('./modules/glip-formatter'),
    salesforce = require('./modules/salesforce'),
    Bitfinex = require('bitfinex'),
    bitfinex = new Bitfinex(process.env.BITFINEX_KEY, process.env.BITFINEX_SECRET);
 



var controller = Botkit.glipbot({
    debug: false,
    //storage: redis_store,
});

var bot = controller.spawn({
    server: process.env.GLIP_SERVER,
    appKey: process.env.GLIP_APPKEY,
    appSecret: process.env.GLIP_APPSECRET,
    username: process.env.GLIP_USERNAME,
    password: process.env.GLIP_PASSWORD,
    extension: process.env.GLIP_EXTENSION,
}).startRTM();

controller.setupWebserver(process.env.port || 3000, function(err, webserver){
    webserver.get('/', function (req ,res) {
        res.send(':)');
    });
    controller.createWebhookEndpoints(webserver, bot);
});




controller.hears(['Hey', 'hey', 'Hi', 'hi'], 'message_received', function (bot, message) {
    console.log("Message is", message);
    bot.reply(message, 'Hello');
});

controller.hears(['check bitcoin'], 'message_received', function (bot, message) {
    bitfinex.ticker('btcusd', function(error, data) {
        if (error) {
            bot.reply(message, 'Ooops' + error);
            return;
        }
        console.log(data);
        bot.reply(message, 'BTC current price ' + data.last_price);
    });
});

controller.hears(['check ethereum'], 'message_received', function (bot, message) {
    bitfinex.ticker('ethusd', function(error, data) {
        if (error) {
            bot.reply(message, 'Ooops' + error);
            return;
        }
        console.log(data);
        bot.reply(message, 'ETH current price ' + data.last_price);
    });
});

controller.hears(['check litecoin'], 'message_received', function (bot, message) {
    bitfinex.ticker('ltcusd', function(error, data) {
        if (error) {
            bot.reply(message, 'Ooops' + error);
            return;
        }
        console.log(data);
        bot.reply(message, 'LTC current price ' + data.last_price);
    });
});

controller.hears(['salesforce: create contact', 'salesforce: new contact'], 'message_received', function (bot, message) {

    var firstName, lastName, title, email, phone = null;

    var askFirstName = function askFirstName(response, convo) {

        convo.ask("What's the first name?", function (response, convo) {
            firstName = response.text;
            askLastName(response, convo);
            convo.next();
        });
    };

    var askLastName = function askLastName(response, convo) {

        convo.ask("What's the last name?", function (response, convo) {
            lastName = response.text;
            askTitle(response, convo);
            convo.next();
        });
    };

    var askEmail = function askEmail(response, convo) {

        convo.ask("What's the Email?", function (response, convo) {
            email = response.text;
            askTitle(response, convo);
            convo.next();
        });
    };

    var askTitle = function askTitle(response, convo) {

        convo.ask("What's the title?", function (response, convo) {
            title = response.text;
            askPhone(response, convo);
            convo.next();
        });
    };

    var askPhone = function askPhone(response, convo) {

        convo.ask("What's the phone number?", function (response, convo) {
            phone = response.text;
            salesforce.createContact({ firstName: firstName, lastName: lastName, email: email, title: title, phone: phone }).then(function (contact) {
                var data = null;
                data = "New contact created :\n\n"
                data += "**Name**\n\n"
                data += contact.get("FirstName") + " " + contact.get("LastName") + "\n\n"
                data += "**Phone**\n\n"
                data += contact.get("Phone") + "\n\n"
                data += "**Title**\n\n"
                data += contact.get("Title") + "\n\n"
                data += "**Email**\n\n"
                data += contact.get("email") + "\n\n"
                data += "**Link**\n\n"
                data += "https://login.salesforce.com/" + contact.get("id") + "\n\n"
                bot.reply(message, data);
                convo.next();
            });

        });
    };

    bot.reply(message, "OK, I can help you with that!");
    bot.startConversation(message, askFirstName);
});












