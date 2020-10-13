export default {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  db: parseInt(process.env.REDIS_DB_INDEX) || 1,
};
