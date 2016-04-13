/**
 * Created by fule https:github.com/lohasle on 2015/12/31 0031
 */
var redis = require('redis'),
    client = redis.createClient({
        host:'127.0.0.1',
        port:6379,
        auth_pass:'tobetcmno1'
    }),
    Promise = require('bluebird');


Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);


var RedisUtil = {
    getClient: function () {
        return client;
    },
    /**
     * 获取一个值
     * @param key
     * @returns {*}
     */
    getAsync: function (key) {
        return client.getAsync(key);
    },
    /**
     * 设置一个值
     * @param key
     * @param val
     */
    set: function (key, val) {
        client.set(key, val);
        console.info("redis set key:" + key + " val:" + val);
        return RedisUtil;
    },
    /**
     * 得到新一个自增值
     * @param seq
     * @returns {*}
     */
    getincrNext: function (seq) {
        client.incr(seq, redis.print);
        return client.getAsync(seq);
    }

};

module.exports = RedisUtil;
