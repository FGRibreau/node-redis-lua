var createHash = require('crypto').createHash,
    _          = require('lodash'),
    sha        = function(str) {return createHash('sha1').update(str).digest('hex');};

/**
 * [eval_cmd description]
 * @param  {[type]}   db     [description]
 * @param  {[type]}   script [description]
 * @param  {[type]}   params [description]
 * @param  {Function} cb     [description]
 * @return {[type]}          [description]
 */
function eval_cmd(db, script, params, cb) {
  params.unshift(script);
  db.send_command('eval', params, cb);
}

function evalsha_cmd(db, script_sha, params, cb) {
  params.unshift(script_sha);
  db.send_command('evalsha', params, cb);
}

function keyval(cb) {
  return function(err, res) {
    var hash = {}, i, key, val;

    if (err) {
      cb(err);
    } else if (res.length % 2 !== 0) {
      cb('result length not even');
    } else {
      for (i = 0; i < res.length; i += 2) {
        key = res[i].toString();
        val = res[i + 1];
        hash[key] = val;
      }
      cb(null, hash);
    }
  };
}

exports.attachLua = function(redis) {

  /**
   * redis.lua( SCRIPTNAME , SCRIPT_PLAINTEXT, [keyed]);
   * @param  {String} name     Script name
   * @param  {String} script   Script string
   * @param  {[type]} keyed    [description]
   * @chainable
   * @return {Redis}
   */
  redis.lua = function(name, script, keyed) {
    var script_sha = null;

    redis.RedisClient.prototype[name] = function(){
      var cb = function(){}, self = this, params;

      params = [].slice.call(arguments);

      if (params.length > 0 && typeof params[params.length - 1] == 'function') {
        cb = params.pop();
      }

      if(!_.isArray(params)){
        params = [params];
      }

      params = _.flatten(params);

      if (keyed) {
        cb = keyval(cb);
      }

      if (!script_sha) {
        script_sha = script_sha || sha(script);
        eval_cmd(self, script, params, cb);
        return;
      }

      evalsha_cmd(self, script_sha, params, function(err, res) {
        if (err && err.message.indexOf('NOSCRIPT') > 0) {
          // @todo test this part
          eval_cmd(self, script, params.slice(2, -1), cb);
        } else {
          cb(err, res);
        }
      });

    };

    return this;
  };

  return redis;
};
