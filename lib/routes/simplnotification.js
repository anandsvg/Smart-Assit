/**
 * Created by Anandha Kumar on 18-03-2015.
 */
var express = require('express'),

Notification = require('../Notification');
    app = module.exports = express();

app.use(express.urlencoded());
app.use(express.json());

app.post('/', function(req, res) {
    console.log("notification being processed");
    Notification.addNotification(req, function(ret) {
        res.setHeader('Content-Type', 'application/json');
        res.send(ret);
    });
    pushServer=require('../PushServer');
    pushServer.sendNotification();
    var userData=reg.body;
    var user=userData.user;
    var serviceProvider=userData.serviceProvider;
    if(userData.type=='initial-action'){
        initialAction(userData);

    }else{
        followUpAction(userData)
    }
    function initialAction(userData){
        var stackLog={};
        stackLog.user=userData.user;
        stackLog.serviceProvide=userData.serviceProvider;
        var date=new Date();
        stackLog.time=date.getMilliseconds();
        stackLog.lastUpdate=date.getMilliseconds();
        //stackLog.status=

    }
    function followUpAction(userData){

    }




});