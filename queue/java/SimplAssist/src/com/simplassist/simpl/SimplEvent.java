package com.simplassist.simpl;

import com.mongodb.BasicDBObject;
import org.bson.types.ObjectId;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;

import java.util.Iterator;
import java.util.Map;

public class SimplEvent extends DBConnection {

    public static JSONObject getAction(String actionId) {
        System.out.println("Action: "+actionId);
        BasicDBObject query = new BasicDBObject("_id", new ObjectId(actionId));
        BasicDBObject fields = new BasicDBObject("events", true);

        return (JSONObject) JSONValue.parse(db.getCollection("actions").findOne(query, fields).toString());
    }

    public static JSONObject getEvent(String eventId) {
        BasicDBObject query = new BasicDBObject("_id", new ObjectId(eventId));
        JSONObject event = (JSONObject) JSONValue.parse(db.getCollection("events").findOne(query).toString());
        event.put("_id", event.get("_id").toString());
        return event;
    }

    public static JSONArray findItem(JSONObject collection, String id) {
        JSONArray thisItem = new JSONArray();
        JSONArray items = (JSONArray) collection.get("items");

        for(int i=0; i < items.size(); i++) {
            JSONObject item = (JSONObject) items.get(i);
            if(item.get("id").toString().equals(id)) {
                System.out.println("FOUND!");
                thisItem.add(0, collection);
                thisItem.add(1, i);
                break;
            } else if(item.containsKey("items")) {
                JSONArray subItems = (JSONArray) item.get("items");
                if(subItems.size() > 0) {
                    JSONArray x = findItem(item, id);
                    if(x.size() > 0) {
                        thisItem = x;
                    }
                }
            }
        }

        return thisItem;
    }

}
