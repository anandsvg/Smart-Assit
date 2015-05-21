module.exports = function() {
    request = require('request-json');
    var client = request.createClient('http://localhost:8000/');
    function sendNotification(users,message){
        console.log("sending notification to "+JSON.stringify(users)+" with message"+JSON.stringify(message));

        var data = {
            "notifications": [{
                "users": users,
                "android": {
                    "collapseKey": "optional",
                    "data":message
                },
                "ios": {
                    "badge": 0,
                    "alert": "Foo bar",
                    "sound": "soundName"
                }
            }
            ]
        };
        client.post('sendBatch', data, function(err, res, body) {
            return console.log("notification sent"+res.statusCode);
        });

    }


    return{
        sendNotification: sendNotification

    }
}();