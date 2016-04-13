/**
 * Created by fule https:github.com/lohasle on 2015/12/14 0014.
 * 课程系列模型
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * CourseSeriesSchema Schema
 */
var CourseSeriesSchema = new Schema({
    courseClassId: { // 课程分类id
        type: mongoose.Schema.ObjectId,
        ref: 'CourseClass'
    },
    title: String, //标题
    summary: String,//简介(不带图文)
    periodsCount: Number,// 课程数量
    collectionCount: Number,//收藏数量
    isHot: Boolean,//是否热门
    orderCode: Number,//排序
    isAvalible: Boolean,//是否启用
    beginTime: Date,
    endTime: Date,
    createTime: { type: Date, default: Date.now },
    modifyTime: Date,
    extInfo: [   //拓展信息
        {
            name: String,   // 属性名称
            val: String,    // 属性值
        }
    ],
});

var CourseSeries = mongoose.model('course_series', CourseSeriesSchema);
module.exports = CourseSeries;
