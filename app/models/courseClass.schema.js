/**
 * Created by fule https:github.com/lohasle on 2015/12/14 0014.
 * 课程分类模型
 */
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Promise = require('bluebird');

/**
 * CourseClass Schema
 */
var CourseClassSchema = new Schema({
    name: String,    // 分类名称
    parentId: String,   // 父分类节点
    level: {type: Number, default: 1},   // 分类层级
    isAvalible: Boolean,//是否启用
    orderCode: Number,   // 排序字段
    createTime: {type: Date, default: Date.now},   //创建时间
    modifyTime: Date    //修改时间
});

/**
 * 静态方法
 * @type {{getAll}}
 */
CourseClassSchema.statics = {
    // 获取所有分类
    getAll:Promise.method(
        function (fileds) {
            return this.find({isAvalible: true}, fileds).sort({orderCode: 1, createTime: -1}).exec();
        }
    )
};

var CourseClass = mongoose.model('course_class', CourseClassSchema);
Promise.promisifyAll(CourseClass);
Promise.promisifyAll(CourseClass.prototype);
module.exports = CourseClass;
