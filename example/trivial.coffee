redis = require 'redis'
require('redis-lua2').attachLua(redis)

r = redis.createClient()

# lua command name, number of keys, script
redis.lua 'myset', 'return redis.call("set", KEYS[1], ARGV[1])'
redis.lua 'myget', 'return redis.call("get", KEYS[1])'

# The first time eval will be used
r.myset 1, 'testing', 'surprise', ->
  # After that evalsha will be used with eval fallback
  r.myset 1, 'testing', 'surprise', ->
    r.myget 1, 'testing', (err, res) ->
      console.log err || "It worked, testing = #{res}"
      r.quit()

