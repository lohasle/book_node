/**
 * Created by fule https:github.com/lohasle on 2015/12/14 0014.
 * route lecturer
 * @type {*|exports|module.exports}
 * 讲师路由
 */
var express = require('express');
var router = express.Router();
var Lecturer = require('../../app/models/lecturer.schema.js');
var LecturerService = require('../../app/services/lecturer.service.js');
var CourseService = require('../../app/services/course.service.js');
var MessageBean = require('../../app/beans/messageBean.js');
var WebUtils = require('../../app/utils/webutils.js');


// 讲师分页查询 支持json  html
router.get('/list.*', function (req, res) {
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
    ops.orderBy = {
        orderCode:1,
        createTime:-1
    };

    LecturerService.findLecturerPageFast(ops, function (data) {
        result['lecturerPage'] = data;
        WebUtils.write("tpl/lecturer/front_lecturer_item", new MessageBean(result), req, res);
    });
});

// 近期开班
router.get('/course?time=recent', function (req, res) {
    var ops = {}; //查询参数
    ops.condition = {
        lecturerId: req.param('id')// 讲师id
    };
    ops.select = "title seq";
    CourseService.findCoursePage(ops, function (data) {
        var result = {};
        result['coursePage'] = data;
        res.json({data: result});
    });
});

// list page
router.get('/', function (req, res, next) {
    var ops = {},
        result = {};
    var skill = req.param('skill');

    ops.pageNo = req.param('pageNo') || 1;
    ops.pageSize = req.param('pageSize') || 8;
    ops.condition = {
        isAvalible: true
    };
    if (WebUtils.strNotNull(skill)) {
        ops.condition['skill_id'] = {$in: skill.split(",")}; //专长
    }

    ops.resultType = "list";
    ops.orderBy = {
        orderCode:1,
        createTime:-1
    };
    // 查询标签分类
    LecturerService.getAllSkillTags(function (data) {
        result.skillList = data;
        LecturerService.findLecturerPageFast(ops, function (data2) {
            result['lecturerPage'] = data2;
            result['ops'] = ops;
            result['ops']['skill'] = skill;
            // 查询所有讲师
            res.render('front/lecturer/list', {current: 'lecturer', data: result}); // 当前页  lecturer
        });
    });
});


// detail page
router.get('/:seq', function (req, res) {
    var seq = req.param("seq"),
        coursePageSize = req.param('coursePageSize'),
        result = {};
    // 查询讲师详情
    LecturerService.loadLecturerFastBySeq(seq, function (data) {

        if (!data) {
            res.render('error', {message: "找不到相关教师"});
        }

        result['lecturer'] = data.toObject();
        var courseQry = {
            pageNo: 1,
            pageSize: 999,
            condition: {
                lecturerId: result['lecturer']._id.toString(),
                isAvalible: true
            }
        };

        if(req.param('dataType')=='json'){
            courseQry.pageSize=5; // json 接口默认课程分页大小为5
        }

        if(WebUtils.strNotNull(coursePageSize)){
            courseQry.pageSize=coursePageSize;
        }

        // 查询讲师下所有的课程
        CourseService.findCourseListFast(courseQry, function (data) {
            result['coursePage'] = data;
            WebUtils.write('front/lecturer/detail', new MessageBean(result), req, res);
        });
    });
});

module.exports = router;
