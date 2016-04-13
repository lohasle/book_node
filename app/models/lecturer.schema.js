/**
 * 讲师模型
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Promise = require('bluebird');

/**
 * LecturerSchema
 */
var LecturerSchema = new Schema({
    // 自增序列值
    seq:{
        type:Number   // redis seq_lecturer
    },
    name: String,
    avatar: String,// 头像
    avatar_big: String,// 头像
    phone: String,
    wechat: String,
    weibo: String,
    qq: String,
    email: String,
    sex: String,
    ducation: String,// 学历
    jobTitle: String, // 职称
    createTime: {type: Date, default: Date.now},
    modifyTime: Date,
    birthDate: Date,
    orderCode: Number,
    summary:String, //简介
    education:String,// 学历
    isAvalible: Boolean, //是否启用
    skill_id:Array,// 专长 标签
    certificate: [   //证书信息
        {
            certificateNo: String, // 证书编号
            certificateFile: String,// 证书文件
            createTime: String, //创建时间
        }
    ],
});

/**
 * 静态方法
 * @type {{getAll}}
 */
LecturerSchema.statics = {
    getAll: Promise.method(
        function (fileds) {
            return this.find({isAvalible: true}, fileds).sort({orderCode: 1, createTime: -1}).exec();
        }
    )
};

var Lecturer = mongoose.model('Lecturer', LecturerSchema);
Promise.promisifyAll(Lecturer);
Promise.promisifyAll(Lecturer.prototype);
module.exports = Lecturer;
