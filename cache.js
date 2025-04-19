const redis = require("ioredis");

 class cache {
  constructor() {
    this.redis = new redis();
  }

  async set(key, value) {
    await this.redis.set(key, value);
  }

  async get(key) {
    return await this.redis.get(key);
  }

  async clear() {
    await this.redis.flushall();
  }
}
module.exports = cache;