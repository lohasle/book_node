/**
 * 课程模型
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Promise = require('bluebird');


/**
 * course Schema
 */
var CourseSchema = new Schema({
    courseClassId: { // 课程分类id
        type: mongoose.Schema.ObjectId,
        ref: 'course_class'
    },
    courseSeriesId: { // 课程系列id
        type: mongoose.Schema.ObjectId,
        ref: 'course_series',
        default:null
    },
    lecturerId: { // 讲师id
        type: mongoose.Schema.ObjectId,
        ref: 'Lecturer'
    },
    albumId: {  // 关联相册
        type: mongoose.Schema.ObjectId,
        ref: 'Album'
    },
    // 标题
    title: {
        type: String,
        trim: true
    },
    // 自增序列值
    seq:{
        type:Number     // redis seq_course
    },
    summary: String,//课程简介
    periodsCount: String, //课时数量
    beginTime: Date,
    endTime: Date,
    createTime: {type: Date, default: Date.now},
    modifyTime: {type: Date, default: Date.now},
    sourcePrice: Number, //实际价格
    currentPrice: Number, //当前价格
    sourcePersonNum: Number,//计划容纳人数
    currentPersonNum: Number,//实际容纳人数
    address1: String,//地址1
    address2: String,//地址2
    fullAddress: String,//完整地址
    bmUrl: String,//报名链接
    positionLng: Number,//经度
    positionLat: Number, //维度
    collectionCount: Number, //收藏数量
    isHot: Boolean, //是否热门
    isAvalible: Boolean,//是否启用
    content: String,//课程内容
    orderCode: Number,  //排序字段
    frontImg:String,
    extInfo: [   //拓展信息
        {
            name: String,
            val: String,
        }
    ],
});

var Course = mongoose.model('Course', CourseSchema);
Promise.promisifyAll(Course);
Promise.promisifyAll(Course.prototype);
module.exports = Course;

