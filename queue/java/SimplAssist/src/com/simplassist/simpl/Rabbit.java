package com.simplassist.simpl;

import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import org.json.simple.JSONObject;

import java.io.IOException;
import java.net.URISyntaxException;
import java.net.UnknownHostException;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;

public class Rabbit {
    private static Connection rabbitConn;
    private static Channel ch;

    public Rabbit() {
        connect();
    }

    public static boolean isConnected() {
        return rabbitConn.isOpen();
    }

    public static void connect() {
        try {
            System.out.println("connect RabbitMQ");
            ConnectionFactory cfconn = new ConnectionFactory();
             cfconn.setHost("localhost");
            rabbitConn = cfconn.newConnection();
            ch = rabbitConn.createChannel();
            ch.queueDeclare("actions", true, false, false, null);

        }
          catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void disconnect() {
        try {
            ///ch.close();
            rabbitConn.close();

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void reconnect() {
        disconnect();
        connect();
    }

    public static Channel getChannel() {
        return ch;
    }

    public static void publishMessage(JSONObject sendData, String routingKey) {
        try {
            //ch.exchangeDeclare("actions", "fantest");
            ch.basicPublish("fantest", routingKey, null, sendData.toString().getBytes());
            System.out.println("ROUTING KEY: "+routingKey);
            System.out.println(sendData);
            System.out.println();
        } catch (IOException e) {
            e.printStackTrace();
        }

    }
}
