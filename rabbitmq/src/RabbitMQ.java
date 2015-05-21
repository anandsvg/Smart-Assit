package com.simplassist.simpl.rabbitmq;

import android.app.Activity;
import android.app.ActivityManager;
import android.app.Application;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.Handler;
import android.os.ResultReceiver;
import android.preference.PreferenceManager;
import android.util.Log;

import com.rabbitmq.client.AMQP;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.Consumer;
import com.rabbitmq.client.DefaultConsumer;
import com.rabbitmq.client.Envelope;
import com.rabbitmq.client.QueueingConsumer;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import java.io.IOException;
import java.util.concurrent.ExecutorService;

/**
 * Created by Dovid Boruch on 2/9/14.
 */
public class RabbitMQ extends CordovaPlugin {

    private String uri;
    private JSONParser parse = new JSONParser();
    private CallbackContext subscribeCallbackContext;
    private BResultReceiver resultReceiver;

    class BResultReceiver extends ResultReceiver {
        public BResultReceiver(Handler handler) {
            super(handler);
        }

        @Override
        protected void onReceiveResult(int resultCode, Bundle resultData) {
            switch(resultCode) {
                case 1: // action-response
                    sendData((JSONObject)JSONValue.parse(resultData.getString("data")));
                    Log.d("smart", "from activity: action-response!!");
                    break;
            }
        }
    }

    private boolean isServiceRunning() {
        ActivityManager manager = (ActivityManager) this.cordova.getActivity().getApplicationContext().getSystemService(Context.ACTIVITY_SERVICE);
        for (ActivityManager.RunningServiceInfo service : manager.getRunningServices(Integer.MAX_VALUE)) {
            if (RabbitMQService.class.getName().equals(service.service.getClassName())) {
                return true;
            }
        }
        return false;
    }

    private void sendData(JSONObject data) {
        PluginResult result = new PluginResult(PluginResult.Status.OK, data.toJSONString());
        result.setKeepCallback(true);
        subscribeCallbackContext.sendPluginResult(result);
    }

    private String getRoutingKey() {
        SharedPreferences sharedPrefs = PreferenceManager.getDefaultSharedPreferences(this.cordova.getActivity());
        String routingKey = "";

        try {
            String user = sharedPrefs.getAll().get("user").toString();
            routingKey = user;
        } catch (Exception e) {
            System.err.println("Main thread caught exception: " + e);
            e.printStackTrace();
            System.exit(1);
        }
        Log.d("smart", routingKey);
        return routingKey;
    }

    public boolean execute(String action, final JSONArray args, final CallbackContext callbackContext) throws JSONException {
        try {
            Log.d("smart", action);
            if(action.equals("init")) {
                SharedPreferences sharedPrefs = PreferenceManager.getDefaultSharedPreferences(this.cordova.getActivity());
                JSONObject argsData = (JSONObject) JSONValue.parse(args.getString(0));
                uri = argsData.get("uri").toString();
                SharedPreferences.Editor editor = sharedPrefs.edit();
                editor.putString("rabbitMqUri", uri);
                editor.commit();
            }
            else if(action.equals("publish")) {

                cordova.getThreadPool().execute(new Runnable() {
                    public void run() {
                        try {
                            ConnectionFactory cfconn = new ConnectionFactory();
                            cfconn.setUri(uri);
                            Connection conn = cfconn.newConnection();
                            Channel ch = conn.createChannel();
                            String message = args.getString(0);

                            ch.basicPublish("", "actions", null, message.getBytes());
                            ch.close();
                            conn.close();
                        } catch(Exception e) {

                        }
                    }
                });

                return true;
            }
            else if(action.equals("subscribe")) {
                JSONObject argsData = (JSONObject) JSONValue.parse(args.getString(0));
                String subscribeType = argsData.get("type").toString();
                Log.d("smart", subscribeType);
                Context context = this.cordova.getActivity().getApplicationContext();
                Intent intent = new Intent(context, RabbitMQService.class);

                if(subscribeType.equals("start") && !isServiceRunning()) {
                    Log.d("smart", "Start!");
                    resultReceiver = new BResultReceiver(null);
                    subscribeCallbackContext = callbackContext;

                    intent.putExtra("receiver", resultReceiver);
                    assert context != null;
                    context.startService(intent);

                    JSONObject ret = new JSONObject();
                    ret.put("type", "start");
                    sendData(ret);

                } else if(subscribeType.equals("stop")) {
                    context.stopService(intent);
                    JSONObject ret = new JSONObject();
                    ret.put("type", "stop");
                    sendData(ret);
                }
                return true;
            }
        } catch (Exception e) {
            System.err.println("Main thread caught exception: " + e);
            e.printStackTrace();
            System.exit(1);
        }

        return false;
    }
}

