package com.simplassist.simpl;

import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import org.bson.types.ObjectId;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;

import java.util.Iterator;
import java.util.Map;

public class SimplUser extends DBConnection {

    public static JSONObject getUser(String userId) {
        ObjectId _id = new ObjectId(userId);
        BasicDBObject query = new BasicDBObject("_id", _id);
        BasicDBObject fields = new BasicDBObject("firstName", true)
                .append("lastName", true)
                .append("email", true);
        JSONObject user = (JSONObject) JSONValue.parse(db.getCollection("users").findOne(query, fields).toString());
        user.put("name", user.get("firstName").toString() + " " + user.get("lastName").toString());

        return user;
    }

    public static String getUsername(String userId) {
        JSONObject user = getUser(userId);

        return user.get("firstName")+" "+user.get("lastName");
    }

    public static JSONObject getUserProfile(String userId, String serviceProvider) {
        JSONObject user = getUser(userId);
        DBObject query = new BasicDBObject("user", userId)
                .append("serviceProvider", serviceProvider);
        JSONObject userProfile = (JSONObject) JSONValue.parse(db.getCollection("questionnaireData").findOne(query).toString());
        userProfile.remove("_id");

        Iterator it = user.entrySet().iterator();
        while(it.hasNext()) {
            Map.Entry entry = (Map.Entry) it.next();
            userProfile.put(entry.getKey(), entry.getValue());
        }
        return userProfile;
    }
}
