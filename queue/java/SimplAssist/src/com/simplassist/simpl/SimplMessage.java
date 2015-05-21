    package com.simplassist.simpl;

import com.mongodb.BasicDBList;
import com.mongodb.BasicDBObject;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import org.bson.types.ObjectId;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class SimplMessage extends DBConnection {

    private static String actionUser;
    private static String userName;
    private static String serviceProvider;
    private static String eventId;
    private static String stackId;
    private static JSONObject data;
    private static JSONObject actionData;
    private static JSONObject event;
    private static JSONObject stack;
    final private static int LAST_ACTIVE_WAIT = 1000 * 60 * 10; // 10 Minutes

    public SimplMessage(String messageText) {
        super();

        data = (JSONObject) JSONValue.parse(messageText);
        actionData = (JSONObject) data.get("details");
        actionUser = data.get("user").toString();
        userName = SimplUser.getUsername(actionUser);
        serviceProvider = data.get("serviceProvider").toString();

        if(data.get("type").equals("initial-action")) {
            initialAction();
        } else {
            followUpAction();
        }

        if(event.containsKey("items")) {
            JSONArray items = (JSONArray) event.get("items");
            for(int i=0;i<items.size();i++) {
                JSONObject notification = (JSONObject) items.get(i);
                processNotification(notification);
            }
        }
    }

    private static void initialAction() {
        JSONObject action = SimplEvent.getAction(data.get("action").toString());
        // RAW EVENT
        ArrayList<JSONObject> events = (ArrayList<JSONObject>) action.get("events");
        eventId = events.get(0).get("event").toString();
        event = SimplEvent.getEvent(eventId);

        BasicDBObject users = new BasicDBObject(eventId, actionUser);
        //users.put(eventId, actionUser);

        BasicDBObject nStack = new BasicDBObject("event", eventId)
                .append("user", actionUser)
                .append("userName", userName)
                .append("time", System.currentTimeMillis()/1000)
                .append("data", data);

        BasicDBList arrStack = new BasicDBList();
        arrStack.add(nStack);

        BasicDBObject insert = new BasicDBObject("event", event)
                .append("user", actionUser)
                .append("users", users)
                .append("allUsers", new BasicDBList())
                .append("notificationUsers", new BasicDBObject())
                .append("serviceProvider", serviceProvider)
                .append("time", System.currentTimeMillis()/1000)
                .append("lastUpdate", System.currentTimeMillis()/1000)
                .append("status", event.get("status"))
                .append("statusCode", event.get("statusCode"))
                .append("stack", arrStack);

        stack = SimplStack.logStack(insert);
        stackId = stack.get("_id").toString();
        System.out.println("STACK ID: "+stackId);
    }

    private static void followUpAction() {
        stackId = data.get("stackId").toString();
        stack = SimplStack.getStack(stackId);
        JSONObject orgEvent = (JSONObject) stack.get("event");
        JSONObject action = (JSONObject) data.get("action");
        JSONArray found = SimplEvent.findItem(orgEvent, action.get("id").toString());

        System.out.println(found.toJSONString());

        JSONObject f = (JSONObject) found.get(0);
        JSONArray fItems = (JSONArray) f.get("items");

        event = (JSONObject) fItems.get((int) found.get(1));

        System.out.println("EVENT!!!!");
        System.out.println(event);

        if(event.containsKey("disables")) {

        }

        if(event.containsKey("invoke")) {
            String invoke = event.get("invoke").toString();
            switch (invoke) {
                case "accept-request":
                    break;
                case "decline-request":
                    break;
                case "cancel-request":
                    cancelRequest();
                    break;
                case "complete-request":
                    completeRequest();
                    break;
            }
        }

        BasicDBObject nStack = new BasicDBObject("action", event.get("id"))
                .append("user", actionUser)
                .append("time", System.currentTimeMillis()/1000)
                .append("data", data);

        BasicDBObject set = new BasicDBObject("lastUpdate", System.currentTimeMillis()/1000)
                .append("status", event.get("status"))
                .append("statusCode", event.get("statusCode"))
                .append("users."+event.get("id"), actionUser);

        BasicDBObject update = new BasicDBObject("$push", new BasicDBObject("stack", nStack))
                .append("$set",set );

        SimplStack.updateStack(stackId, update);

        JSONObject users = (JSONObject) stack.get("users");
        String eventId = event.get("id").toString();
        users.put(eventId, actionUser);
        stack.put("users", users);
    }

    private static void cancelRequest() {
        JSONArray tUsers = (JSONArray) stack.get("allUsers");
        for(int i=0; i < tUsers.size(); i++) {
            JSONObject sendData = new JSONObject();
            sendData.put("stackId", stackId);
            sendData.put("type", "cancel-request");
            sendData.put("service-provider", serviceProvider);

            Rabbit.publishMessage(sendData, tUsers.get(i).toString());
        }
    }

    private static void completeRequest() {
        JSONArray tUsers = (JSONArray) stack.get("allUsers");
        for(int i=0; i < tUsers.size(); i++) {
            JSONObject sendData = new JSONObject();
            sendData.put("stackId", stackId);
            sendData.put("type", "complete-request");
            sendData.put("service-provider", serviceProvider);

            Rabbit.publishMessage(sendData, tUsers.get(i).toString());
        }
    }

    private static void processNotification(JSONObject notification) {
        JSONArray items = (JSONArray) notification.get("items");
        for(int i=0;i<items.size();i++) {
            JSONObject item = (JSONObject) items.get(i);
            item.remove("items");
            items.set(i, item);
        }
        notification.put("items", items);

        JSONObject userProfile = SimplUser.getUserProfile(actionUser, serviceProvider);
        String message = notification.get("message").toString();

        // USER MATCHES
        String userPatternString = "\\{user:([\\w-]+)\\}";
        Pattern userPattern = Pattern.compile(userPatternString, Pattern.CASE_INSENSITIVE);
        Matcher userMatch = userPattern.matcher(message);
        while(userMatch.find()) {
            String var = userMatch.group(1);

            if(userProfile.containsKey(var)) {
                String val = userProfile.get(var).toString();
                message = message.replaceAll("\\{user:"+var+"\\}", val);
            }
        }

        // ACTION MATCHES
        String actionPatternString = "\\{action:([\\w-]+)\\}";
        Pattern actionPattern = Pattern.compile(actionPatternString, Pattern.CASE_INSENSITIVE);
        Matcher actionMatch = actionPattern.matcher(message);
        while(actionMatch.find()) {
            String var = actionMatch.group(1);

            if(actionData.containsKey(var)) {
                String val = actionData.get(var).toString();
                message = message.replaceAll("\\{action:"+var+"\\}", val);
            }
        }

        boolean nUserAsTitle = (notification.containsKey("userAsTitle")) ? notification.get("userAsTitle").equals("true") : false;
        String nTitle = (notification.containsKey("title")) ? notification.get("title").toString() : notification.get("name").toString();
        String title = (nUserAsTitle) ? userName : nTitle;
        boolean openApplicationImmediately = (notification.containsKey("openApplicationImmediately")) ? notification.get("openApplicationImmediately").equals("true") : false;
        boolean openImmediately = (notification.containsKey("openImmediately")) ? notification.get("openImmediately").equals("true") : false;
        boolean map = (notification.containsKey("map")) ? notification.get("map").equals("true") : false;

        JSONObject defaultData = new JSONObject();

        defaultData.put("id", notification.get("id"));
        defaultData.put("eventId", eventId);
        defaultData.put("userName", userName);
        defaultData.put("serviceProvider", serviceProvider);
        defaultData.put("title", title);
        defaultData.put("message", message);
        defaultData.put("status", event.get("status"));
        defaultData.put("statusCode", event.get("statusCode"));
        defaultData.put("type", data.get("type"));
        defaultData.put("openApplicationImmediately", openApplicationImmediately);
        defaultData.put("openImmediately", openImmediately);
        defaultData.put("position", data.get("position"));
        defaultData.put("map", map);
        defaultData.put("ring", true);
        defaultData.put("stackId", stackId);

        JSONArray recipients = new JSONArray();
        JSONObject stackUsers = (JSONObject) stack.get("users");
        BasicDBObject query = new BasicDBObject();
        BasicDBList or = new BasicDBList();

        query.put(
            "lastActive",
             new BasicDBObject(
                     "$gte",
                     System.currentTimeMillis() - (LAST_ACTIVE_WAIT)
             )
        );

        // Exceptions
        JSONArray exceptions = new JSONArray();
        JSONArray nExceptions = (JSONArray) notification.get("exceptions");
        for(int i=0; i< nExceptions.size(); i++) {
            String tException = stackUsers.get(nExceptions.get(i)).toString();
            exceptions.add(new ObjectId(tException));

        }

        if(exceptions.size() > 0) {
            query.put("_id",
                    new BasicDBObject("$nin",
                            exceptions
                    )
            );
        }

        // Individual users
        JSONArray nRecipients = (JSONArray) notification.get("recipients");
        for(int i=0; i < nRecipients.size(); i++) {
            String r = nRecipients.get(i).toString();

            or.add(
                new BasicDBObject(
                    "_id",
                    new ObjectId( stackUsers.get(r).toString() )
                )
            );
        }

        // Groups
        JSONArray nGroups = (JSONArray) notification.get("groups");
        for(int i=0; i < nGroups.size(); i++) {
            String g = nGroups.get(i).toString();

            or.add(
                new BasicDBObject(
                    "serviceProviders."+serviceProvider+".groups",
                    g
                )
            );
        }

        query.put(
                "$or",
                or
        );

        BasicDBObject fields = new BasicDBObject("_id", true);

        System.out.println(query);

        DBCursor us = db.getCollection("users").find(query, fields);

        try {
            while(us.hasNext()) {
                BasicDBObject _user = (BasicDBObject) us.next();
                recipients.add(_user.get("_id").toString());
            }
        } finally {
            us.close();
        }

        System.out.println("RECIPIENTS: "+recipients);
        System.out.println();

        if(recipients.size() > 0) {
            for(int i=0; i < recipients.size(); i++) {
                JSONObject sendData = defaultData;
                sendData.put(
                        "uid",
                        UUID.randomUUID().toString()
                );
                String routingKey = recipients.get(i).toString();

                if(notification.get("type").equals("notification-prompt")) {
                    sendData.put("actions", notification.get("items"));
                }

                Rabbit.publishMessage(sendData, routingKey);
            }

            // Update Stack
            BasicDBObject update = new BasicDBObject(
                "$pushAll",
                new BasicDBObject("allUsers", recipients)
            )
            .append(
                    "$set",
                    new BasicDBObject(
                            notification.get("id").toString(),
                            recipients
                    )
            );

            SimplStack.updateStack(stackId, update);
        }
    }
}