package com.simplassist.simpl.rabbitmq;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * Created by Dovid Boruch on 2/13/14.
 */
public class RabbitMQBootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        Intent serviceIntent = new Intent(context, RabbitMQService.class);
        context.startService(serviceIntent);
    }
}
