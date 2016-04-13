/**
 * Created by fule https:github.com/lohasle on 2015/12/14 0014.
 * 用户模型
 */
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Promise = require('bluebird');

/**
 * userSchema
 */
var userSchema = new Schema({
    userName: String,
    avatar: String,
    createTime: {type: Date, default: Date.now},
    modifyTime: Date
});


var User = mongoose.model('User', userSchema);
Promise.promisifyAll(User);
Promise.promisifyAll(User.prototype);
module.exports = User;