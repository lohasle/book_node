/**
 * 系统配置模型
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Promise = require('bluebird');

/**
 * sysconfigSchema
 */
var sysconfigSchema = new Schema({
    name: String,   // 配置值名称
    value: String,  // 配置值值
    type: String,   // 类型    site_seo(网站seo设置)  discuz_hot_thread(discuz 热门帖子) discuz_hot_thread_pageSize(discuz 热门帖子显示数量)
    orderCode: Number, // 排序字段
    createTime: {type: Date, default: Date.now},
    modifyTime: Date
});


var SysconfigSchema = mongoose.model('sysconfig', sysconfigSchema);
Promise.promisifyAll(SysconfigSchema);
Promise.promisifyAll(SysconfigSchema.prototype);
module.exports = SysconfigSchema;
