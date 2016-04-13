/**
 * Created by fule https:github.com/lohasle on 2015/12/14 0014.
 * route courses
 * @type {*|exports|module.exports}
 * index路由
 */
var express = require('express');
var CourseService = require('../../app/services/course.service.js');
var LecturerService = require('../../app/services/lecturer.service.js');
var CommonService = require('../../app/services/common.service.js');
var Comment = require('../../app/models/comment.schema.js');
var Course = require('../../app/models/course.schema.js');
var Feedback = require('../../app/models/feedback.schema.js');
var MessageBean = require('../../app/beans/messageBean.js');
var Ad = require('../../app/models/ad.schema.js');
var CourseClass = require('../../app/models/courseClass.schema.js');
var WebUtils = require('../../app/utils/webutils.js');
var Promise = require('bluebird');
var async = require('async');
var router = express.Router();

/* 首页 */
router.get(['/', '/index'], function (req, res, next) {
    var courseListLen = 5;
    var lecturerLen = 4;

    // 异步并行
    async.parallel({
        coursePage: function (callback) {
            // 热门课程
            CourseService.findCoursePageFast({
                pageNo: 1,
                pageSize: courseListLen,
                orderBy: {beginTime: 1},
                condition: {isAvalible: true, isHot: 1},
                resultType: 'list'
            }, function (courseList) {
                callback(null, courseList);
            });
        },
        lecturerPage: function (callback) {
            // 名师
            LecturerService.findLecturerPageFast({
                pageNo: 1,
                pageSize: lecturerLen,
                condition: {isAvalible: true},
                orderBy: {
                    orderCode: 1,
                    createTime: -1
                }
            }, function (data) {
                callback(null, data);
            });
        },
        ads: function (callback) {
            // banner 广告图
            Ad.find({
                isAvalible: true,
                position: 'index',
                type: 'site'
            }, "title href img bgColor").sort({orderCode:1}).skip(0).limit(5).then(function (data) {
                callback(null, data);
            });
        },
        commentPage: function (callback) {
            // 最近评论
            CommonService.findPage(Comment, {
                pageSize: 5,
                pageNo: 1,
                populates: [
                    {path: 'courseId', select: '_id title seq'},
                    {path: 'userId', select: '_id userName avatar'}
                ],
                resultType: 'list',
                orderBy: {createTime: -1}
            }, function (data) {
                callback(null, data);
            });
        },
        courseClassList: function (callback) {
            // 查询所有可见分类
            CourseClass.find({
                isAvalible: true,
                level: "1"
            }, "name").skip(0).limit(5).sort({orderCode: 1}).then(function (data) {
                var data = JSON.parse(JSON.stringify(data)); //BSON 转成 JSON
                getCourse(data, function (data) {
                    callback(null, data);
                });
            });
        },
    }, function (err, rs) {
        res.render('front/index', {current: 'index', data: rs}); // 当前页  index
    });
});

/**
 * 添加一个反馈
 */
router.post('/feedback', function (req, res, next) {
    var body = req.body;
    body['originIp'] = WebUtils.getClientIp(req);
    var feedback = new Feedback(body);
    feedback.save(function (err, data) {
        if (err) {
            res.json(new MessageBean("预约失败了~", "false"));
        } else {
            res.json(new MessageBean("预约成功"));
        }
    });
});

// data 分类数据
function getCourse(data, cb) {

    // 并行计算分类下的课程
    async.map(data, function (item, callback) {
        CourseService.findCoursePage({
            pageNo: 1,
            pageSize: 2,
            condition: {
                isAvalible: true,
                courseClassId: item['_id'].toString(),
            },
            orderBy: {
                isHot: 1,
                createTime: -1
            },
            select: "title seq",
            enablePopulate: false,
            resultType: 'list'
        }, function (cdata) {
            item['course'] = cdata;
            callback(null, item);
        });
    }, function (err, results) {
        cb(results);
    });
}

module.exports = router;
