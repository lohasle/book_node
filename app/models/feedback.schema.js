/**
 * 用户反馈模型
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Promise = require('bluebird');

/**
 * adSchema
 */
var feedbackSchema = new Schema({
    userName: String,
    userPhone: String,
    content: String,
    originIp: String,
    createTime: {type: Date, default: Date.now}
});


var FeedbackSchema = mongoose.model('feedback', feedbackSchema);
Promise.promisifyAll(FeedbackSchema);
Promise.promisifyAll(FeedbackSchema.prototype);
module.exports = FeedbackSchema;
