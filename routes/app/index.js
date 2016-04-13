"use strict";
/**
 * Created by fule https:github.com/lohasle on 2015/12/14 0014.
 * route courses
 * @type {*|exports|module.exports}
 * index路由
 */
var express = require('express');
var router = express.Router();
var Course = require('../../app/models/course.schema.js');
var User = require('../../app/models/user.schema.js');
var Comment = require('../../app/models/comment.schema.js');
var CourseClass = require('../../app/models/courseClass.schema.js');
var Lecturer = require('../../app/models/lecturer.schema.js');
var Ad = require('../../app/models/ad.schema.js');
var Sysconfig = require('../../app/models/sysconfig.schema.js');
var LecturerService = require('../../app/services/lecturer.service.js');
var CourseService = require('../../app/services/course.service.js');
var CommonService = require('../../app/services/common.service.js');
var MessageBean = require('../../app/beans/messageBean.js');
var WebUtils = require('../../app/utils/webutils.js');
var moment = require('moment');
var _ = require("underscore")._;
var async = require('async');
var Promise = require('bluebird');
var request = require('request');

/**
 * app 帖子推荐信息
 */
router.get('/discuz/thread/hot', function (req, res) {
    var apiUrl = "http://app.weizy.cn/app/dz?mod=thread&tid=";
    async.waterfall([
        function(callbock){
            Sysconfig.findOne({"type":"discuz_hot_thread_pageSize"},"value").then(function(data){
                callbock(null,data);
            });
        },
        function(arg1,callbock){
            Sysconfig.find({"type":"discuz_hot_thread"}).skip(0).sort({orderCode:1}).limit(Number(arg1.value)).then(function(data){
                callbock(null,data);
            });
        },
        function(arg1,callbock){
            // 请求
            var tasks = [];
            for(var i in arg1){
                (function(tid){
                    tasks.push(
                        function(callback2){
                            request.get(apiUrl+tid, {timeout: 1500}, function(err,data) {
                                if(err){
                                }
                                // 处理data
                                var body = JSON.parse(data.body);
                                var thread = body.data.thread;
                                thread.postcount = body.data.count;
                                callback2(null,thread);
                            });
                        }
                    );
                })(arg1[i].value);
            }
            async.parallel(tasks,function(err,result){
                callbock(null,result);
            });
        },
    ],function(err, resultData){
        if(err){
        }
        res.json(new MessageBean(resultData));
    });
});

/**
 * 课程的评论列表
 */
router.get('/course/comment/list', function (req, res) {
    var ops = {}, //查询参数
        result = {};
    ops.pageNo = req.param('pageNo');
    ops.pageSize = req.param('pageSize');
    ops.orderBy = req.param('orderBy');  // 排序
    ops.condition = {
        "courseId": req.param('courseId')//课程id
    };
    ops.resultType = req.param('resultType');//返回类型
    ops.select = "content courseId";//返回类型
    ops.populate = { // 关联课程名称
        path: 'courseId',
        select: 'title',
    };
    CommonService.findPage(Comment, ops, function (data) {
        result['commentPage'] = data;
        res.json({data: result});
    });
});

/**
 * 课程列表接口
 */
router.get('/course/list', function (req, res, next) {
    var orderBy = req.param('orderBy'),
        beginTime = req.param("beginTime"),
        ops = {}; //查询参数
    ops.pageNo = req.param('pageNo');
    ops.pageSize = req.param('pageSize');
    ops.condition = {
        courseClassId: req.param('courseClassId'),// 分类ID
        lecturerId: req.param('lecturerId'),
        isAvalible: true
    };
    ops.orderBy = {beginTime: 1}; // 按照开始时间顺序
    try {
        if (WebUtils.strNotNull(beginTime) && moment(beginTime).isValid()) {
            ops.condition.beginTime = {$gte: beginTime};
        }
    } catch (e) {
        console.error(e);
    }

    ops.select = "name lecturerId title summary beginTime createTime bmUrl fullAddress address1  isHot frontImg isAvalible beginTime currentPrice"; //需要返回的字段
    CourseService.findCoursePage(ops, function (data) {
        var result = {};
        result['coursePage'] = data;
        res.json(new MessageBean(result));
    });
});

/**
 * 课程详情接口
 */
router.get('/course/:id', function (req, res, next) {
    var id = req.param("id"),
        result = {};
    if(/^\d+$/.test(id)){
        Course.findOne({seq:id},"_id").then(function(data){
            id = data._id.toString();
            CourseService.loadCourseFast(id, function (data) {
                if (!data) {
                    res.render('error', {message: "找不到相关课程"});
                    return;
                }
                result['course'] = data;  // 课程
                // 加载评论
                CommonService.findPage(Comment, {
                    populates: [
                        {path: 'courseId', select: '_id title'},
                        {path: 'userId', select: '_id userName avatar'}
                    ],
                    condition: {
                        courseId: id
                    },
                    resultType: 'list',
                    orderBy: {createTime: -1}
                }, function (data) {
                    result['commentPage'] = data; // 评论
                    res.json(new MessageBean(result));
                });
            });
        });
    }else{
        CourseService.loadCourseFast(id, function (data) {
            if (!data) {
                res.render('error', {message: "找不到相关课程"});
                return;
            }
            result['course'] = data;  // 课程
            // 加载评论
            CommonService.findPage(Comment, {
                populates: [
                    {path: 'courseId', select: '_id title'},
                    {path: 'userId', select: '_id userName avatar'}
                ],
                condition: {
                    courseId: id
                },
                resultType: 'list',
                orderBy: {createTime: -1}
            }, function (data) {
                result['commentPage'] = data; // 评论
                res.json(new MessageBean(result));
            });
        });
    }

});

/**
 * 讲师分页接口
 */
router.get('/lecturer/list', function (req, res) {
    var ops = {},
        result = {};
    ops.pageNo = req.param('pageNo') || 1;
    ops.pageSize = req.param('pageSize') || 8;

    ops.condition = {
        skill: req.param('skill'),
        isAvalible: true
    };

    var random = req.param("random");// 是否随机 换一组
    if (random === 'true') {
        ops.resultType = 'list';
    }

    LecturerService.findLecturerPageFast(ops, function (data) {
        result['lecturerPage'] = data;
        res.json(new MessageBean(result));
    });
});

/**
 * 讲师详情接口
 */
router.get('/lecturer/:id', function (req, res) {
    var id = req.param("id"),
        coursePageSize = req.param('coursePageSize'),
        result = {};
    // 查询讲师详情
    LecturerService.loadLecturerFast(id, function (data) {
        result['lecturer'] = data;
        var courseQry = {
            pageNo: 1,
            pageSize: 5,
            condition: {
                lecturerId: id,
                isAvalible: true
            }
        };


        if (WebUtils.strNotNull(coursePageSize)) {
            courseQry.pageSize = coursePageSize;
        }

        // 查询讲师下所有的课程
        CourseService.findCoursePageFast(courseQry, function (data) {
            result['coursePage'] = data;
            res.json(new MessageBean(result));
        });
    });
});

/**
 * 搜索接口
 */
router.get('/search', function (req, res) {
    var word = req.param("word");
    var type = req.param("type") || "all"; // all  lecturer course
    var result = {};
    var lecturerOps = {
        pageNo: req.param("pageNo") || 1,
        pageSize: req.param("pageSize") || 10,
        select: 'name avatar sex jobTitle summary certificate skill_id',
        condition: {
            isAvalible:true
        }
    };
    var courseOps = {
        pageNo: req.param("pageNo") || 1,
        pageSize: req.param("pageSize") || 10,
        select: 'name lecturerId  title summary beginTime bmUrl content fullAddress isHot extInfo frontImg address1 address2 currentPrice',
        populate: ({ //关联讲师姓名
            path: 'lecturerId',
            select: 'name _id avatar',
        }),
        condition: {
            isAvalible:true
        },
    };

    if (WebUtils.strNotNull(word.trim())) {
        lecturerOps.condition['name'] = new RegExp(word);
        courseOps.condition['title'] = new RegExp(word);
    }

    result['word'] = word;
    result['type'] = type;
    // 课程
    CommonService.findPage(Course, courseOps, function (data) {
        result['coursePage'] = data;

        //讲师
        CommonService.findPage(Lecturer, lecturerOps, function (data) {
            result['lecturerPage'] = data;
            res.json(new MessageBean(result));
        });
    });
});

/**
 * 获取baanner接口
 */
router.get('/banner', function (req, res) {
    var type = req.param("type");
    Ad.find({isAvalible:true,position:type,type:'app'},"title href img type").sort({orderCode:1}).skip(0).limit(5).then(function(data){
        res.json(new MessageBean(data));
    });
});

module.exports = router;
