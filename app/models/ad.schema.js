/**
 * 广告模型
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
var adSchema = new Schema({
    title: String,
    type: String, // 广告类型  app site
    img: String,  // 广告图片
    href: String, // 广告链接
    bgColor: String, // 背景颜色
    orderCode: Number,
    position: String,// 广告位置
    isAvalible: Boolean, //是否-启用
    createTime: {type: Date, default: Date.now},
    modifyTime: Date
});


var Ad = mongoose.model('ad', adSchema);
Promise.promisifyAll(Ad);
Promise.promisifyAll(Ad.prototype);
module.exports = Ad;
