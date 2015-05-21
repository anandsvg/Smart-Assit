<?

$dir = preg_replace('#/queue#','',__DIR__);
$rabbitMQConfig = json_decode(file_get_contents($dir.'/config/rabbitmq.json'), true);
$mongoDBConfig = json_decode(file_get_contents($dir.'/config/mongodb.json'), true);

$actions = array();
$events = array();

require_once __DIR__.'/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPConnection;
use PhpAmqpLib\Message\AMQPMessage;

$conn = new AMQPConnection(
    $rabbitMQConfig['host'], 
    $rabbitMQConfig['port'], 
    $rabbitMQConfig['login'], 
    $rabbitMQConfig['password']
);

try {
    $mconn = new MongoClient(
        'mongodb://'.$mongoDBConfig['username'].':'.$mongoDBConfig['password'].'@'.$mongoDBConfig['host'].':'.$mongoDBConfig['port'].'/'.$mongoDBConfig['database'],
        array()
    );
    $db = $mconn->selectDB($mongoDBConfig['database']);
}
catch(MongoConnectionException $e) {
    die('NO DB');
};

$ch = $conn->channel();

$queue = 'actions';
$ch->queue_declare($queue, false, true, false, false);

function getEvent($data) {
    global $db;

    $action = $db->actions->findOne(
        array(
            '_id' => new MongoId($data['action'])
        ),
        array(
            'events'
        )
    );    

    $rawEvents = $action['events'];
    $eventId = current($rawEvents)['event'];        

    $event = $db->events->findOne(
        array(
            '_id' => new MongoId($eventId)
        )
    );   

    return array($action,$event); 
}

function logAction($data) {
    global $db;

    $db->actionsLog->insert($data);
    return (string)$data['_id'];
}

function updateLog($id, $update) {
    global $db;

    print_r($update);

    $db->actionsLog->update(
        array(
            '_id' => new MongoId($id)
        ),
        $update
    );
}

function getLog($id) {
    global $db;

    $stack = $db->actionsLog->findOne(
        array(
            '_id' => new MongoId($id)
        )
    );

    return $stack;
}

function findItem($collection, $id) {
    $thisItem = false;
    foreach($collection['items'] as $key => $item) {
        if($item['id'] == $id) {
            $thisItem = array($collection, $key);
        } 
        else if(isset($item['items']) && sizeof($item['items']) > 0) {
            $x = findItem($item, $id);
            if($x) {
                $thisItem = $x;
            }
        }
    }

    return $thisItem;
}

function resolveCopy($collection, $item) {
    foreach($item['items'] as $k => $i) {
        if(isset($i['copyId'])) {
            $f = findItem($collection, $i['copyId']);
            $item['items'][$k] = $f[0]['items'][$f[1]];
            $item['items'][$k]['order'] = $i['order'];
        }
    }
    return $item;
}

function getUserName($userId) {
    global $db;

    $user = $db->users->findOne(
        array(
            '_id' => new MongoId($userId)
        ),
        array(
            'firstName',
            'lastName'
        )
    );    

    return($user['firstName'] .' '. $user['lastName']);    
}

function getUserProfile($userId, $serviceProvider) {
    global $db;

    $user = $db->users->findOne(
        array(
            '_id' => new MongoId($userId)
        ),
        array(
            'firstName',
            'lastName',
            'email'
        )
    );    

    $user['name'] = $user['firstName'] .' '. $user['lastName'];

    $userProfile =$db->questionnaireData->findOne(
        array(
            'user' => $userId,
            'serviceProvider' => $serviceProvider
        )
    );

    unset($userProfile['_id']);

    return array_merge($user, $userProfile);
}

function replaceVariables($message, $data) {
    preg_match_all('#{user:([\w/-]+)}#i', $message, $userMatches);

    foreach($userMatches[1] as $key => $var) {
        if(isset($data['userProfile'][$var])) {
            $v = $data['userProfile'][$var];
            $message = preg_replace('/'.$userMatches[0][$key].'/', $v, $message);
        } else {
            $message = preg_replace('/'.$userMatches[0][$key].'/', "N/A", $message);
        }       
    }

    preg_match_all('#{action:([\w/-]+)}#i', $message, $actionMatches);
    print_r($data['actionData']);
    print_r($actionMatches);
    foreach($actionMatches[1] as $key => $var) {
        if(isset($data['actionData'][$var])) {
            $v = $data['actionData'][$var];
            $message = preg_replace('/'.$actionMatches[0][$key].'/', $v, $message);
        } else {
            $message = preg_replace('/'.$actionMatches[0][$key].'/', "N/A", $message);
        }
    }    

    return $message;
}

function processMessage($msg) {
    $msg->delivery_info['channel']->
        basic_ack($msg->delivery_info['delivery_tag']);

	$data = json_decode($msg->body, true);

    $actionUser = $data['user'];
    $userName = getUserName($actionUser);
    $serviceProvider = $data['serviceProvider'];

    // Get Details From Action
    if($data['type'] == 'initial-action') {
        // Get details about action and store action
        // We will make begin an action sequence log entry

        list($action,$event) = getEvent($data);

        $event['id'] = (string)$event['_id'];
        $eventId = $event['id'];

        $insert = array(
            'user' => $actionUser,
            'users' => array(
                $eventId => $actionUser
            ),            
            'serviceProvider' => $serviceProvider,
            'time' => time(),
            'lastUpdate' => time(),
            'event' => $event,
            'status' => $event['status'],
            'statusCode' => (int) $event['statusCode'],
            'stack' => array(
                array(
                    'event' => $eventId,
                    'user' => $actionUser,
                    'userName' => $userName,
                    'time' => time(),
                    'data' => $data
                )
            )
        );
        $stackId = logAction($insert);
        $stack = $insert;

        // Get user profile info
        $userProfile = getUserProfile($actionUser, $serviceProvider);

        // To be used for all future actions to link the stack!

        /*
        $stack = array(
            'event' => $event,
            'actionData' => $data['details'],
            'userName' => $userName,
            'userProfile' => $userProfile,
            'users' => array(
                $event['id'] => $actionUser
            )
        );
        

        $redis->set(
            'stack_'.$stackId, json_encode(
                $stack
            )
        );
        */

    } else {
        // We have an action response!
        $stackId = $data['stackId'];

        echo('STACK ID: '.$stackId."\n\n");
        $stack = getLog($stackId);

        $orgEvent = $stack['event'];
        $eventId = (string) $orgEvent['_id'];
  
        $found = findItem($orgEvent, $data['action']['id']);

        $event = $found[0]['items'][$found[1]];

        // SEND DISABLE ACTIONS
        if(isset($event['disables'])) {
            foreach($event['disables'] as $actionId) {
                $found = findItem($orgEvent, $actionId);
                $notification = $found[0];

                $exceptions = array();
                if(isset($notification['exceptions'])) {
                    foreach($notification['exceptions'] as $exception) {
                        $exceptions[] = $stack['users'][$exception];
                    }
                }

                $recipients = array();

                foreach($notification['recipients'] as $recipient) {
                    $recipients[] = $stack['users'][$recipient];
                }        

                foreach($notification['groups'] as $group) {
                    $recipients[] = $data['serviceProvider'].'.'.$group;
                }

                $defaultData = array(
                    'eventId' => $event['id'],
                    'uid' => uniqid(),
                    'user' => $actionUser,
                    'serviceProvider' => $serviceProvider,
                    'type' => 'disable-actions',
                    'exceptions' => $exceptions,
                    'stackId' => $stackId,
                    'notification' => $notification['id'],
                    'action' => $actionId
                );

                if(sizeof($recipients) > 0) {
                    foreach($recipients as $recipient) {
                        $sendData = $defaultData;
                        $routing_key = $recipient;
                        publishMessage($sendData, $routing_key);
                        print_r($sendData);
                    }
                }
            }            
        }

        if(isset($event['invoke'])) {
            switch($event['invoke']) {
                case 'accept-request':

                    break;                
                case 'decline-request':

                    break;
                case 'cancel-request':
                    $sendData = array(
                        'stackId' => $stackId,
                        'type' => 'cancel-request',
                        'serviceProvider' => $serviceProvider,
                    );
                    $routing_key = $stackId;
                    publishMessage($sendData, $routing_key);
                    break;
                case 'complete-request':
                    $sendData = array(
                        'stackId' => $stackId,
                        'type' => 'complete-request',
                        'serviceProvider' => $serviceProvider,
                    );
                    $routing_key = $stackId;
                    publishMessage($sendData, $routing_key);
                    break;
            }            
        }
    
        updateLog(
            $data['stackId'], 
            array(
                '$push' => array(
                    'stack' => array(
                        'action' => $event['id'],
                        'user' => $actionUser,
                        'time' => time(),
                        'data' => $data
                    )
                ),
                '$set' => array(
                    'lastUpdate' => time(),
                    'status' => $event['status'],
                    'statusCode' => $event['statusCode'],
                    'users.'.$eventId => $actionUser
                )
            )
        );

        $stack['users'][ $eventId ] = $actionUser;

        /*
        $redis->set('stack_'.$stackId, json_encode(
                $stack
            )
        );
        */
    }

    // Register Event With Stack
    if(isset($event)) {
        $childItems = $event['items'];

        echo("STATUS: ".$event['status']."\n");
        echo("STATUS CODE: ".$event['statusCode']."\n");

        foreach($childItems as $notification) {
            
            $notification = resolveCopy($stack['event'], $notification);
            // Remove extra items
            foreach($notification['items'] as $k => $item) {
                unset($notification['items'][$k]['items']);
            }

            $exceptions = array();
            if(isset($notification['exceptions'])) {
                foreach($notification['exceptions'] as $exception) {
                    $exceptions[] = $stack['users'][$exception];
                }
            }

            // REPLACE VARIABLES
            $notification['message'] = replaceVariables($notification['message'], 
                array(
                    'userProfile' => $userProfile,
                    'actionData' => $data['details']
                )
            );

            $title = ($notification['userAsTitle']=='true') ? $userName : $notification['title'] ;

            $openApplicationImmediately = ($notification['openApplicationImmediately']=='true') ? true : false;
            $openImmediately = ($notification['openImmediately']=='true') ? true : false;

            $defaultData = array(
                'id' => $notification['id'],
                'eventId' => $event['id'],
                'uid' => uniqid(),
                'user' => $actionUser,
                'userName' => $userName,
                'serviceProvider' => $serviceProvider,
                'title' => $title,
                'message' => $notification['message'],                
                'status' => $event['status'],
                'statusCode' => $event['statusCode'],
                'type' => $data['type'],
                'openApplicationImmediately' => $openApplicationImmediately,
                'openImmediately' => $openImmediately,
                'exceptions' => $exceptions,
                'position' => $data['position'],
                'map' => ($notification['map'] == 'true'),
                'stackId' => $stackId
            );

            $recipients = array();

            foreach($notification['recipients'] as $recipient) {
                $recipients[] = $stack['users'][$recipient];
            }        

            foreach($notification['groups'] as $group) {
                $recipients[] = $data['serviceProvider'].'.'.$group;
            }

            echo("RECIPIENTS!!\n");
            print_r($recipients);

            if(sizeof($recipients) > 0) {

                foreach($recipients as $recipient) {
                    $sendData = $defaultData;
                    $routing_key = $recipient;
                    if($notification['type'] == 'notification-prompt') {
                        $sendData['actions'] = $notification['items'];
                    }                    
                    publishMessage($sendData, $routing_key);
                }

            } else {
                echo("NO RECIPIENTS!!!");
            }
            
            print_r($sendData);
        }

        echo "\n--------\n";
        echo $msg->body;
        print_r($data);

        echo "\n--------\n";
     }
};

function publishMessage($msg, $routing_key) {
	$data = $msg;

	global $conn;
	$ch = $conn->channel();

	$msg = json_encode($msg);
	echo("publishMessage: ".$msg."\n\n");
    $msg = new AMQPMessage($msg, array('content_type' => 'text/plain', 'delivery_mode' => 2));    
    $ch->basic_publish($msg, "fantest", $routing_key);
    $ch->close();
}

$ch->basic_consume($queue, 'actions', false, false, false, false, 'processMessage');

function shutdown($ch, $conn)
{
    $ch->close();
    $conn->close();
}
register_shutdown_function('shutdown', $ch, $conn);


// Loop as long as the channel has callbacks registered
while (count($ch->callbacks)) {
    $ch->wait();
}