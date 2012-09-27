var redis = require('redis');

require('redis-lua2').attachLua(redis);

r = redis.createClient();

script = 'return {"k1", "v1", "k2", "v2"}';
redis.lua('hashlike', script, 'keyed');

r.hashlike(0, function(err, res) {
  if (err) throw err;
  console.log( res);
  r.quit();
});
