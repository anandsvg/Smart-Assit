package com.simplassist.simpl;

import com.mongodb.DB;
import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;

import java.net.UnknownHostException;

public class DBConnection {
    protected static DB db;

    public DBConnection() {
        System.out.println("connectDB");
        String textURI = "mongodb://smartassist:smartAssist456!!@smartassist.kopeltechdev.com:27017/smartassist";
        MongoClientURI uri = new MongoClientURI(textURI);
        MongoClient mongoClient = null;
        try {
            mongoClient = new MongoClient(uri);
        } catch (UnknownHostException e) {
            e.printStackTrace();
        }
        db = mongoClient.getDB("smartassist");
        boolean auth = db.authenticate("smartassist", "smartAssist456!!".toCharArray());
    }
}
