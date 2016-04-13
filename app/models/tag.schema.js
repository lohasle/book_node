/**
 * 标签模型
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Promise = require('bluebird');

/**
 * tagSchema
 */
var tagSchema = new Schema({
    name: String,
    type: String, //类型
    value: String,
    orderCode: Number,
    isAvalible: Boolean, //是否启用
    createTime: {type: Date, default: Date.now},
    modifyTime: Date
});

/**
 * 静态方法
 * @type
 */
tagSchema.statics = {
    // 获取某一类型下所有标签
    getTagsByType: Promise.method(
        function (type, fileds) {
            return this.find({type: type}, fileds).sort({orderCode: 1, createTime: -1}).exec();
        }
    )
};

var Tag = mongoose.model('Tag', tagSchema);
Promise.promisifyAll(Tag);
Promise.promisifyAll(Tag.prototype);
module.exports = Tag;
