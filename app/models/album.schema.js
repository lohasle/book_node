/**
 * 相册模型
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Promise = require('bluebird');

/**
 * Schema
 */
var albumSchema = new Schema({
    title: String, // 相册标题
    photos: [ //照片
        {
            des: String,// 描述
            img: String, // 图片地址
        }
    ],
    frontImg:String,
    orderCode: Number,
    createTime: {type: Date, default: Date.now},
    modifyTime: Date
});


var Album = mongoose.model('Album', albumSchema);
Promise.promisifyAll(Album);
Promise.promisifyAll(Album.prototype);
module.exports = Album;
