module.exports = function() {
	var mongodb = require('mongodb'),
		useDb = require('./db'),
		_ = require('underscore'),
     pushServer=require('./PushServer');

	function getNotifications(req, $c) {
		if (req.session.serviceProvider) {
			useDb(function(db) {
				db.collection('notifications').find({
					serviceProvider: req.session.serviceProvider
				}, {

				}).toArray(function(err, results) {
					if (err) {
						return console.dir(err);
					}

					$c(results);
					db.close();
				});
			});
		}
	};

	function getNotification(req, $c) {
		var id = req.route.params.id;
		useDb(function(db) {
			db.collection('notifications').findOne({
				_id: new mongodb.ObjectID(id),
				serviceProvider: req.session.serviceProvider
			}, function(err, results) {
				if (err) {
					return console.dir(err);
				}

				$c(results);
				db.close();
			});
		});
	};

	function addNotification(req, $c) {
		var userData=req.body;
		if (req.session.serviceProvider) {
			useDb(function(db) {
				req.body.serviceProvider = req.session.serviceProvider;
				db.collection('notifications').insert(req.body, function(err, results) {
					$c(results[0]);
					db.close();
				});
			});
		}
        var actionId=req.body.action;
        console.log("userData"+JSON.stringify(userData));

        useDb(function(db){
           db.collection('actions').findOne({
               _id:new mongodb.ObjectID(actionId)

           },function(err,data){

              //var  groupId=data.groups[1];
               var eventId=data.events[0].event;
               //console.log("groupId"+groupId);
               console.log("Eventid"+eventId);
               console.log("data"+JSON.stringify(data));

               db.close();
               collectData(eventId);
           })
        });
        function collectData(eventId){
            useDb   (function(db) {
                db.collection('events').findOne({
                              _id:new mongodb.ObjectID(eventId)
                          },function(err,data){
                    console.log("lat"+JSON.stringify(userData.geo.lat));
                    var payload={};
                    payload.status=data.status;
                    payload.statusCode=data.statusCode;
                    payload.title=data.items[0].title;
                    payload.openImmediately=data.items[0].openImmediately;
                    payload.message=data.items[0].message;
                    payload.stackId=eventId;
					payload.uid='4856846361193249489L';
					payload.map='true';
					payload.position={
						latitude:userData.geo.lat,
						longitude:userData.geo.long
					};
                    payload.actions=data.items[0].items;

                    var groupId=data.items[0].groups[0];
                    //console.log("payload"+JSON.stringify(payload));
                    //$c(payload);
                    findRecipients(groupId,payload);
                });
            });
        }
        function findRecipients(groupId,payload){
            useDb(function(db){
               db.collection('users').find({
                   groups:groupId,
                   roles:'agent'
               },{_id:1}).toArray(function(err,result){
                   console.log("recipients"+result[0]._id);
                   pushServer.sendNotification(result,payload);


               })
            });
        }





	};

	function updateNotification(req, $c) {
		var id = req.route.params.id,
			data = req.body;
		delete data._id;

		useDb(function(db) {
			db.collection('notifications').update({
					'_id': new mongodb.ObjectID(id)
				}, {
					$set: data
				},
				function(err, results) {
					if (err) {
						return console.dir(err);
					}

					$c();
					db.close();
				}
			);
		});
	};

	function removeNotification(req, $c) {
		var id = req.route.params.id;
		useDb(function(db) {
			db.collection('notifications').remove({
				'_id': new mongodb.ObjectID(id)
			}, function() {
				$c();
				db.close();
			});
		});
	};

	return {
		getNotifications: getNotifications,
		getNotification: getNotification,
		addNotification: addNotification,
		updateNotification: updateNotification,
		removeNotification: removeNotification
	};

}();