<?

$dir = preg_replace('#/queue#','',__DIR__);
$config = json_decode(file_get_contents($dir.'/config/rabbitmq.json'), true);


require_once __DIR__.'/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPConnection;
use PhpAmqpLib\Message\AMQPMessage;


$conn = new AMQPConnection($config['host'], $config['port'], $config['login'], $config['password']);
$ch = $conn->channel();

$queue = 'actions';
$exchange = '';

$ch->queue_declare($queue, false, true, false, false);
//$ch->exchange_declare($exchange, 'direct', false, true, false);

//$ch->queue_bind($queue, $exchange);

function processMessage($msg) {

	$data = json_decode($msg->body, true);
    echo "\n--------\n";
    echo $msg->body;
    print_r($data);
    echo "\n--------\n";

    $msg->delivery_info['channel']->
        basic_ack($msg->delivery_info['delivery_tag']);

    // Send a message with the string "quit" to cancel the consumer.
    if ($msg->body === 'quit') {
        $msg->delivery_info['channel']->
            basic_cancel($msg->delivery_info['consumer_tag']);
    }	

    publishMessage(
    	array(
    		'user' => $data['user'],
    		'serviceProvider' => $data['serviceProvider'],
    		'type' => 'action-response',
    		'message' => "This is a message!"
    	)
    );
};

    function publishMessage($msg) {
    	$data = $msg;

    	global $conn;
    	$ch = $conn->channel();
    	//$routing_key = $data['serviceProvider'].'.agent';

        //$routing_key = 'agent';
        //$routing_key = $data['user'];
        $routing_key = 'abcd1234';

    	//$ch->exchange_declare($exchange, 'direct', false, true, false);
    	//$ch->queue_declare($queue, true, false, false, false);
    	//$ch->queue_bind($queue, $exchange);
    	$msg = json_encode($msg);
    	echo("publishMessage: ".$msg."\n\n");
        $ch->exchange_declare('fantest', 'direct', false, false, false);
        $msg = new AMQPMessage($msg, array('content_type' => 'text/plain', 'delivery_mode' => 2));    
        //$ch->basic_publish($msg, "router", $routing_key);
        $ch->basic_publish($msg, 'fantest', $routing_key);
        $ch->close();
}

publishMessage(
    array(
        'user' => '52df37d156da29a02f4257f9',
        'serviceProvider' => '52df37d056da29a02f4257f5',
        'type' => 'action-response',
        'title' => 'Assistance Requested',
        'message' => $argv[1]
    )
);