package com.simplassist.simpl.rabbitmq;

import android.app.ActivityManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Binder;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.ResultReceiver;
import android.preference.PreferenceManager;
import android.util.Log;

import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.Consumer;
import com.rabbitmq.client.QueueingConsumer;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import org.json.simple.parser.JSONParser;

import java.io.IOException;
import java.net.URISyntaxException;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;

import com.simplassist.simpl.SimplAssist;

public class RabbitMQService extends Service {

    private String user;
    private String uri;
    private Map serviceProviders;
    private boolean isRunning = false;
    private ConnectionFactory cfconn;
    private Connection conn;
    private Channel channel;
    private ArrayList<String> queuesList = new ArrayList<String>();
    private QueueingConsumer consumer;
    private Map<String, Channel> channels = new HashMap();
    private Map<String, QueueingConsumer> consumers = new HashMap();

    private ResultReceiver resultReceiver;
    private String exchange = "fantest";

    public int onStartCommand(Intent intent, int flags, int startId) {
        resultReceiver = intent.getParcelableExtra("receiver");

        Context context = getApplicationContext();
        SharedPreferences sharedPrefs = PreferenceManager.getDefaultSharedPreferences(context);
        Map<String, ?> prefs = sharedPrefs.getAll();

        Log.d("Simpl", prefs.toString());
        if(sharedPrefs.contains("rabbitMqUri")) {
            uri = prefs.get("rabbitMqUri").toString();
        } else {
            System.err.println("No RabbitMQ connection URI!");
            System.exit(1);
        }
        if(sharedPrefs.contains("user")) {
            user = prefs.get("user").toString();

            if(prefs.containsKey("serviceProviders")) {
                serviceProviders = (HashMap) JSONValue.parse(prefs.get("serviceProviders").toString());
            }

            Log.d("Simpl", user);

            rabbitConnect();

        } else {
            Log.d("Simpl", "SERVICE NO USER!!!");
        }

        Timer connectionTimer = new Timer();
        TimerTask connectionTask = new TimerTask() {
            @Override
            public void run() {
                Log.d("Simpl", "rabbitReconnect");
                //rabbitReconnect();
            }
        };

        //connectionTimer.schedule(connectionTask, 30000, 30000);

        return Service.START_STICKY;
    }

    private boolean isActivityRunning() {
        try {
            ActivityManager manager = (ActivityManager) getApplicationContext().getSystemService(Context.ACTIVITY_SERVICE);
            for (ActivityManager.RunningTaskInfo task : manager.getRunningTasks(Integer.MAX_VALUE)) {
                if (SimplAssist.class.getName().equals(task.baseActivity.getClassName())) {
                    return true;
                }
            }
        }
        catch (NullPointerException e) {

        }

        return false;
    }

    private final class ServiceHandler extends Handler {
        public ServiceHandler(Looper looper) {
            super(looper);
        }
    }

    protected void sendMessage(Integer code, String name, String text) {
        Bundle bundle = new Bundle();
        bundle.putString(name, text);
        resultReceiver.send(code, bundle);
    }

    private void rabbitConnect() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    cfconn = new ConnectionFactory();
                    cfconn.setUri(uri);
                    cfconn.setRequestedHeartbeat(30);
                    cfconn.setConnectionTimeout(0);
                    conn = cfconn.newConnection();

                    rabbitPrepareChannels();

                } catch (KeyManagementException e) {
                    e.printStackTrace();
                } catch (NoSuchAlgorithmException e) {
                    e.printStackTrace();
                } catch (IOException e) {
                    e.printStackTrace();
                } catch (URISyntaxException e) {
                    e.printStackTrace();
                }
            }
        }).start();
    }

    private void rabbitPrepareChannels() {
        try {
            channel = conn.createChannel();
            channel.exchangeDeclare(exchange, "direct");
            String queue = channel.queueDeclare().getQueue();
            channel.queueBind(queue, exchange, user);
            consumer = new QueueingConsumer(channel);
            queuesList.add(queue);
            Log.d("Simpl", queuesList.toString());

            if(serviceProviders.size() > 0) {
                Iterator it = serviceProviders.entrySet().iterator();
                while(it.hasNext()) {
                    final Map.Entry data = (Map.Entry) it.next();
                    JSONObject spData = (JSONObject) data.getValue();
                    Log.d("Simpl", "SERVICE PROVIDER");
                    ArrayList<String> roles = (ArrayList<String>) spData.get("roles");
                    ArrayList<String> groups = (ArrayList<String>) spData.get("groups");

                    Log.d("Simpl", String.valueOf(groups));

                    Iterator itg = groups.iterator();
                    while(itg.hasNext()) {
                        String group = (String) itg.next();
                        String sp = (String) data.getKey();

                        channel.exchangeDeclare(exchange, "direct");
                        String queueServiceProvider = channel.queueDeclare().getQueue();
                        channel.queueBind(queueServiceProvider, exchange, sp+"."+group);
                        consumer = new QueueingConsumer(channel);
                        queuesList.add(queueServiceProvider);
                        Log.d("Simpl", queuesList.toString());
                        Log.d("Simpl", group);
                    }
                }
            }
            rabbitConsume();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void rabbitConsume() {
        final Iterator it = queuesList.iterator();
        while(it.hasNext()) {
            final String queue = (String) it.next();
            new Thread(new Runnable() {
                @Override
                public void run() {
                    try {
                        channel.basicConsume(queue, false, consumer);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }

                    while (true) {
                        try {
                            QueueingConsumer.Delivery delivery = consumer.nextDelivery();
                            String message = new String(delivery.getBody());
                            channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
                            Log.d("Simpl", "MESSAGE!!!!");
                            Log.d("Simpl", message);

                            // Convert to Object
                            JSONObject data = (JSONObject)JSONValue.parse(message);
                            String Id = (String) data.get("id");
                            JSONArray exceptionUsers = (JSONArray) data.get("exceptions");

                            Log.d("Simpl","user: "+user);

                            // Check exceptions
                            Log.d("Simpl", exceptionUsers.toJSONString());

                            if(!exceptionUsers.contains(user)) {
                                sendMessage(1, "data", message);
                            } else {
                                Log.d("Simpl", "Message recevied...but sent my user, ignored.");
                            }

                            // Check for activity
                            if(!isActivityRunning()) {
                                // Launch activity
                                bringToFront();
                            } else if(!SimplAssist.isVisible) {

                            }

                        } catch (NullPointerException e) {
                            e.printStackTrace();
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    }
                }
            }).start();
        }
    }

    private void bringToFront () {
        Intent intent = new Intent(this, SimplAssist.class);
        intent.setAction(Intent.ACTION_MAIN);
        intent.addCategory(Intent.CATEGORY_LAUNCHER);
        intent.addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(intent);
    }

    private void rabbitDisconnect() {
        try {
            String tag = consumer.getConsumerTag();
            Log.d("tag", tag);
            channel.basicCancel(tag);
            conn.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void rabbitReconnect() {
        if(conn.isOpen()) {
            rabbitDisconnect();
            rabbitConnect();
        }
    }

    @Override
    public void onDestroy() {
        rabbitDisconnect();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}