Fork of **node_redis_lua** by shirro
====================================

Patch redis script commands into node-redis prototype.

## Npm

    npm install redis-lua

## Usage
To use add lua support to redis module:

    redis = require('redis');
    require('redis-lua').attachLua(redis)

Add some redis scripts:

    redis.lua('myset', 'return redis.call("set", KEYS[1], KEYS[2])');

If you want to return a javascript object add a 4th truthy parameter:
    redis.lua('hashtest, 0, 'return redis.call("hgetall", "something")', true);

And call like a regular redis command:

    r = redis.createClient();
    r.myset(2, 'testing', 'surprise', redis.print);

`2` is the number of keys that the script will receive. Arrays are also supported:

    var args = ['testing', 'surprise']
    ,   r = redis.createClient();
    r.myset(args.length, args, function(err, res){console.log(arguments)});

The lua script is passed by eval first time and evalsha subsequently
with fallback to eval.
