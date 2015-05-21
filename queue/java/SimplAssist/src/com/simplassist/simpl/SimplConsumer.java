package com.simplassist.simpl;

import com.rabbitmq.client.AlreadyClosedException;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.QueueingConsumer;
import com.rabbitmq.client.ShutdownSignalException;

import java.io.IOException;
import java.util.Timer;
import java.util.TimerTask;

public class SimplConsumer {
    private static ProcessMessages processThread;

    public SimplConsumer(Channel ch) {
        System.out.println("New SimplConsumer");
        processThread = new ProcessMessages(ch);
        processThread.start();

    };

    public void cancelConsume() {
        processThread.cancel();

        System.out.println("Killing consume thread!");
        processThread.interrupt();
    };

    class ProcessMessages extends Thread {
        private Channel ch;
        private QueueingConsumer consumer;
        private String consumerTag;

        public ProcessMessages(Channel _ch) {
            ch = _ch;
        }

        public void run() {
            try {
                System.out.println("In process messages.");
                consumer = new QueueingConsumer(ch);
                ch.exchangeDeclare("actions", "direct");

                String queue = ch.queueDeclare().getQueue();
                System.out.println("QUEUE: "+queue);
                ch.queueBind(queue, "actions", "");

                consumerTag = ch.basicConsume(queue, false, consumer);
            } catch (IOException e) {
                e.printStackTrace();
            }

            while(Rabbit.isConnected()) {
                try {
                    QueueingConsumer.Delivery delivery = consumer.nextDelivery();
                    String messageText = new String(delivery.getBody());
                    ch.basicAck(delivery.getEnvelope().getDeliveryTag(), false);

                    System.out.println(messageText);
                    new SimplMessage(messageText);
                } catch (AlreadyClosedException e) {
                    e.printStackTrace();
                } catch (ShutdownSignalException e) {
                    e.printStackTrace();
                } catch (InterruptedException e) {
                    System.out.println("Interupted!!");
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }

        public void cancel() {
            try {
                System.out.println("Cancelling consumer: "+consumerTag);
                ch.basicCancel(consumerTag);
                ch.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
