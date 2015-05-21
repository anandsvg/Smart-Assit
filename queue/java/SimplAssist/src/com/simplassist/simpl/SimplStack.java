package com.simplassist.simpl;

import com.mongodb.BasicDBObject;
import org.bson.types.ObjectId;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;

public class SimplStack extends DBConnection {
    public static JSONObject logStack(BasicDBObject logData) {
        db.getCollection("actionsLog").insert(logData);
        logData.put("_id", logData.get("_id").toString());
        return (JSONObject) JSONValue.parse(logData.toString());
    }

    public static void updateStack(String stackId, BasicDBObject update) {
        BasicDBObject query = new BasicDBObject("_id", new ObjectId(stackId));
        db.getCollection("actionsLog").update(query, update);
    }

    public static JSONObject getStack(String stackId) {
        BasicDBObject query = new BasicDBObject("_id", new ObjectId(stackId));
        JSONObject stack = (JSONObject) JSONValue.parse(db.getCollection("actionsLog").findOne(query).toString());
        JSONObject _id = (JSONObject) stack.get("_id");
        stack.put("_id", _id.get("$oid"));
        return stack;
    }
}
