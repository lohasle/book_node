/**
 * Created by fule https:github.com/lohasle on 2015/12/14 0014.
 * 课程相关业务方法
 */
var Course = require('../../app/models/course.schema.js');
var CourseClass = require('../../app/models/courseClass.schema.js');
var CourseSeries = require('../../app/models/courseSeries.schema.js');
var Comment = require('../../app/models/comment.schema.js');
var Lecturer = require('../../app/models/lecturer.schema.js');
var WebUtils = require('../../app/utils/webutils.js');
var Promise = require('bluebird');
var _ = require('underscore');
var CommonService = require('../../app/services/common.service.js');

var CourseService = {
    // 取得 课程分类和老师分类
    getCourseAndlecturer: function (cb) {
        var result = {};
        CourseClass.getAll('name level parentId').then(function (data) {
            result.courseClasses = data;
        }).then(function () {
            Lecturer.getAll('name').then(function (data) {
                result.lecturers = data;
            }).then(function () {
                cb(result);
            });
        });
    },
    /**
     * 查询课程的分页列表
     * @param cb
     * 返回 pageBean
     */
    findCoursePage: function (ops,cb) {
        if(ops.enablePopulate===undefined||ops.enablePopulate){ // 是否启用关联
            ops.populate = {  //关联讲师姓名
                path: 'lecturerId',
                select: 'name _id avatar'
            };
        }
        CommonService.findPage(Course, ops, function (data) {
            cb(data);
        });
    },
    // 快速分页
    findCoursePageFast: function (ops, cb) {
        ops.select = "seq name lecturerId albumId title summary beginTime createTime bmUrl fullAddress address1 address2 isHot frontImg isAvalible beginTime currentPrice"; //需要返回的字段
        CourseService.findCoursePage(ops, cb);
    },

    // 快速去除列表数据
    findCourseListFast: function (ops, cb) {
        ops.resultType='list';
        CourseService.findCoursePageFast(ops, cb);
    },

    /**
     * 加载课程
     * @param id
     * @param cb
     */
    loadCourse: function (id, fileds, cb) {
        Course.findOne({"_id": id}, fileds)
            .populate({ // 关联讲师
                path: 'lecturerId',
                select: 'name _id avatar jobTitle summary',
            }).populate({ // 关联系列
            path: 'courseSeriesId',
            select: 'title _id',
        }).exec(function (err, data) {
            cb(data);
        });
    },
    /**
     * 加载课程
     * @param id
     * @param cb
     */
    loadCourseFast: function (id, cb) {
        var filed = "name lecturerId courseSeriesId title summary beginTime bmUrl content fullAddress isHot extInfo frontImg currentPrice ";
        CourseService.loadCourse(id, filed, cb);
    },
    /**
     * 加载课程by seq
     * @param seq
     * @param cb
     */
    loadCourseFastBySeq: function (seq, cb) {
        var fileds = "name lecturerId courseSeriesId title summary beginTime bmUrl content fullAddress isHot extInfo frontImg currentPrice ";
        Course.findOne({"seq": seq,"isAvalible":true}, fileds)
            .populate({ // 关联讲师
                path: 'lecturerId',
                select: 'name _id avatar jobTitle summary seq',
            }).populate({ // 关联系列
            path: 'courseSeriesId',
            select: 'title _id',
        }).exec(function (err, data) {
            cb(data);
        });
    },
};
module.exports = CourseService;
