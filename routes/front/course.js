/**
 * Created by fule https:github.com/lohasle on 2015/12/14 0014.
 * route courses
 * @type {*|exports|module.exports}
 * 课程路由
 */
var express = require('express');
var router = express.Router();

var Course = require('../../app/models/course.schema.js');
var Album = require('../../app/models/album.schema.js');
var User = require('../../app/models/user.schema.js');
var Comment = require('../../app/models/comment.schema.js');
var CourseClass = require('../../app/models/courseClass.schema.js');
var Lecturer = require('../../app/models/lecturer.schema.js');
var CourseService = require('../../app/services/course.service.js');
var CommonService = require('../../app/services/common.service.js');
var MessageBean = require('../../app/beans/messageBean.js');
var WebUtils = require('../../app/utils/webutils.js');
var moment = require('moment');

var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });

// 课程分页查询 支持json  html
router.get('/list.*', function (req, res,next) {

    var orderBy = req.param('orderBy'),
        beginTime = req.param("beginTime"),
        ops = {}; //查询参数
    ops.pageNo = req.param('pageNo');
    ops.pageSize = req.param('pageSize');
    ops.condition = {
        courseClassId:req.param('courseClassId'),// 分类ID
        lecturerId:req.param('lecturerId'),
        isAvalible:true
    };
    if(orderBy==='hot'){
        // 最热
        ops.orderBy={isHot:1,beginTime:1};
        ops.condition.isHot = true;
    }else{
        // 最新
        ops.orderBy={beginTime:1};
    }

    try {
        if(WebUtils.strNotNull(beginTime)&&moment(beginTime).isValid()){
            ops.condition.beginTime = {$gte:beginTime};
        }
    }catch(e) {
        console.error(e);
    }

    CourseService.findCoursePageFast(ops, function (data) {
        var result = {};
        result['coursePage'] = data;
        WebUtils.write("tpl/course/front_course_item", new MessageBean(result), req, res);
    });
});

// 添加一条评论 todo 测试随机用户
router.post('/addComment',csrfProtection, function (req, res) {
    var body = req.body;
    // 随机一个用户
    var index = WebUtils.randomNum(0, 7);

    User.findOne({}).limit(1).skip(index).then(function (userData) {
        // 随机的用户
        body.userId = userData._id.toString();
        var comment = new Comment(body);
        var result = {success: 'true'};
        comment.save(function (err, data) {
            if (err) {
                res.json({data:'评论失败',success:'false'});
            } else {
                result['comment'] = data;
                result['user'] = userData;
                res.json({data:result,success:'true'});
            }
        });
    });
});

/**
 * 课程的评论列表
 */
router.get('/comment/list.*', function (req, res) {
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
 * 获取最新评论
 */
router.get('/comment/lastOne.json', function (req, res) {
    var time = req.param("createTime"),
        condition = {};
    condition['createTime'] = {$gt: time};

    Comment.findOne(condition, " createTime content courseId userId").populate({
        path: 'courseId',
        select: 'title seq',
    }).populate({
        path: 'userId',
        select: 'userName avatar',
    }).then(function (data) {
        res.json({data: data});
    });
});

/**
 * 课程详情页
 */
router.get('/:seq',csrfProtection,function (req, res) {
    var seq = req.param("seq"),
        result = {};
    result['csrfToken'] = req.csrfToken(); // csrf token
    CourseService.loadCourseFastBySeq(seq, function (data) {
        if (!data) {
            res.render('error', {message: "找不到相关课程"});
        }
        result['course'] = data._doc;  // 课程
        CourseService.findCoursePage({
            condition:{
                lecturerId: result['course'].lecturerId._id.toString(),
                isAvalible:true
            },
            orderBy:{
                createTime:-1
            },
            enablePopulate:false,
            pageSize: 10,
            select: "title seq",
            resultType: 'list'
        }, function (data) {
            result['recentCourseList'] = data; // 近期开班

            // 加载评论
            CommonService.findPage(Comment, {
                populates:[
                    {path: 'courseId', select: '_id title seq'},
                    {path: 'userId', select: '_id userName avatar'}
                ] ,
                condition:{
                    courseId:result['course']._id.toString()
                },
                resultType: 'list',
                orderBy: {createTime: -1}
            },function(data){
                result['commentPage'] = data; // 评论
                WebUtils.write('front/course/detail',new MessageBean(result),req,res); //
            });
        });
    });
});


/**
 * 课程分类 页面
 */
router.get('/', function (req, res, next) {
    var ops = {};
    ops.pageNo = req.param('pageNo')||1;
    ops.pageSize = req.param('pageSize')||5;
    ops.condition = {
        courseClassId:req.param('courseClassId'),// 分类ID
        lecturerId:req.param('lecturerId'),
        isAvalible:true
    };
    var orderBy = req.param('orderBy');
    if(orderBy==='hot'){
        // 最热
        ops.orderBy={beginTime:1};
        ops.condition.isHot = true;
    }else{
        // 最新
        ops.orderBy={beginTime:1};
    }


    CourseService.getCourseAndlecturer(function (data) {
        CourseService.findCoursePageFast(ops, function (courseList) {
            data['coursePage'] = courseList;
            data['ops'] = ops;
            data['ops']['orderBy'] = orderBy;
            data['ops']['courseClassId'] = ops.condition.courseClassId;
            data['ops']['lecturerId'] = ops.condition.lecturerId;
            res.render('front/course/list', {current: 'course', data: data}); // 当前页  index
        });
    });
});


module.exports = router;