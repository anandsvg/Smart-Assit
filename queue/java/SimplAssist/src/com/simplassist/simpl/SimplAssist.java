package com.simplassist.simpl;

import java.util.Timer;
import java.util.TimerTask;

public class SimplAssist {

    private static SimplConsumer consumer;

    public static void main(String[] args) {
        Rabbit rabbit = new Rabbit();
        consumer = new SimplConsumer(rabbit.getChannel());

        Timer connectionTimer = new Timer();
        TimerTask connectionTask = new TimerTask() {
            @Override
            public void run() {
                if(rabbit.isConnected()) {
                    consumer.cancelConsume();
                }
                rabbit.reconnect();
                consumer = new SimplConsumer(rabbit.getChannel());
            }
        };
        connectionTimer.schedule(connectionTask, 600_000, 600_000);
    }
}