import redis from 'redis';
import redisConfig from '../config/redis-config';
const { promisify } = require('util');

export default function(config) {
  let options = redisConfig;
  if (config) {
    options = { ...options, config };
  }
  const redis_client = redis.createClient(options);
  const sadd = promisify(redis_client.sadd).bind(redis_client);
  const sismember = promisify(redis_client.sismember).bind(redis_client);
  const srem = promisify(redis_client.srem).bind(redis_client);
  const del = promisify(redis_client.del).bind(redis_client);
  const keys = promisify(redis_client.keys).bind(redis_client);
  const hmset = promisify(redis_client.hmset).bind(redis_client);
  const hmget = promisify(redis_client.hmget).bind(redis_client);
  const hget = promisify(redis_client.hget).bind(redis_client);
  const set = promisify(redis_client.set).bind(redis_client);
  const get = promisify(redis_client.get).bind(redis_client);
  const send_command = promisify(redis_client.send_command).bind(redis_client);
  const scard = promisify(redis_client.scard).bind(redis_client);
  const smembers = promisify(redis_client.smembers).bind(redis_client);
  const spop = promisify(redis_client.spop).bind(redis_client);
  const exists = promisify(redis_client.exists).bind(redis_client);
  return {
    sadd,
    sismember,
    del,
    keys,
    hmset,
    hmget,
    set,
    get,
    srem,
    send_command,
    hget,
    scard,
    smembers,
    spop,
    exists,
  };
}
