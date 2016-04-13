/**
 * Created by fule https:github.com/lohasle on 2015/12/14 0014.
 * route courses
 * @type {*|exports|module.exports}
 * 课程管理路由
 */
var express = require('express');
var router = express.Router();

var Course = require('../../app/models/course.schema.js');
var Album = require('../../app/models/album.schema.js');
var CourseClass = require('../../app/models/courseClass.schema.js');
var MessageBean = require('../../app/beans/messageBean.js');
var DataTableBean = require('../../app/beans/dataTables/dataTableBean.js');
var DataTablesReqPar = require('../../app/beans/dataTables/dataTablesReqPar.js');
var BackStageIndexBean = require('../../app/beans/backStageIndexBean.js');
var BackStageEditBean = require('../../app/beans/backStageEditBean.js');
var CourseService = require('../../app/services/course.service.js');
var CommonService = require('../../app/services/common.service.js');
var WebUtils = require('../../app/utils/webutils.js');
var RedisUtil = require('../../app/utils/redisUtil.js');
var _ = require('underscore');


/**
 * 相册查看
 */
router.get('/album/:id',function(req,res,next){
    var id = req.param('id');

    if(id==='0'){
        res.render("backstage/common/album_tpl",{});
    }else{
        Album.findOne({'_id':id}).then(function(data){
            res.render("backstage/common/album_tpl",new MessageBean(data));
        });
    }
});

/**
 * 保存相册
 */
router.post('/album/:id',function(req,res,next){
    var id =req.param('id');
    var courseId = req.body.courseId;

    var album = new Album(req.body);

    // 判断封面照
    var frontImg = req.body.frontImg;
    if(!frontImg||frontImg==''){
        // 没有设置封面照，默认第一张为封面
        album._doc.frontImg = req.body.photos[0].img;
    }
    if (id&&id!='0') {
        // 更新
        delete album._doc._id;
        album._doc.modifyTime = new Date();
        Album.findByIdAndUpdate(id, {$set: album._doc}, function (err, data) {
            res.json(new MessageBean("更新成功"));
        });
    } else {
        // 保存
        album.save(function (err) {
            if (err) {
                res.json(new MessageBean("服务错误,保存失败"), "false");
            } else {
                // 保存成功写入课程模型
                var id = album._doc._id;
                Course.findByIdAndUpdate(courseId,{$set:{
                    albumId:id
                }}).then(function(data){
                    res.json(new MessageBean("保存成功"));
                });
            }
        });
    }
});


/**
 * 课程分类列表数据
 */
router.get('/class/list.json', function (req, res) {

    var name = req.query.name,
        isAvalible = req.query.isAvalible,
        ops = DataTablesReqPar.buildOpsFromStr(req.query.dataTablesReqPar);

    ops.condition = {};

    if (WebUtils.strNotNull(name)) {
        ops.condition['name'] = new RegExp(name);
    }
    if (isAvalible !== undefined) {
        ops.condition['isAvalible'] = isAvalible;
    }

    ops.select = "name isAvalible orderCode createTime modifyTime level"; //需要返回的字段
    CommonService.findPage(CourseClass, ops, function (data) {
        // data
        res.json(DataTableBean.format(data, ops));
    });
});

/**
 * 课程分类管理页面
 */
router.get('/class', function (req, res) {

    var backStageIndexBean = new BackStageIndexBean('课程管理', '课程分类管理'),
        message = new MessageBean(backStageIndexBean);
    res.render('backstage/course/class_list', message);
});

/**
 * 课程分类编辑页面
 */
router.get('/class/:id', function (req, res) {
    var id = req.param("id");
    CommonService.loadOne(CourseClass, {id, id}, function (data) {

        // 编辑页面模型
        var backStageEditBean = new BackStageEditBean({
            title: id === '0' ? '新增分类' : '编辑分类',
            actionUrl: '/backstage/course/class'
        }, data);
        WebUtils.write('backstage/course/class_tpl_edit', new MessageBean(backStageEditBean), req, res);
    });
});

/**
 * 课程分类保存
 */
router.post('/class/', function (req, res) {
    var body = req.body,
        id = body._id;


    var courseClass = new CourseClass(body);

    if (id) {
        // 更新
        delete courseClass._doc._id;
        courseClass._doc.modifyTime = new Date();
        CourseClass.findByIdAndUpdate(id, {$set: courseClass._doc}, function (err, data) {
            res.json(new MessageBean("更新成功"));
        });
    } else {
        // 保存
        courseClass.save(function (err) {
            if (err) {
                res.json(new MessageBean("服务错误,保存失败"), "false");
            } else {
                res.json(new MessageBean("保存成功"));
            }
        });
    }
});


// 列表数据
router.get('/list.json', function (req, res) {

    var courseName = req.query.courseName,
        lecturerName = req.query.lecturerName,
        isAvalible = req.query.isAvalible,
        ops = DataTablesReqPar.buildOpsFromStr(req.query.dataTablesReqPar);

    ops.condition = {};

    if (WebUtils.strNotNull(courseName)) {
        ops.condition['title'] = new RegExp(courseName);
    }
    if (isAvalible !== undefined) {
        ops.condition['isAvalible'] = isAvalible;
    }

    CourseService.findCoursePageFast(ops, function (data) {
        // data
        res.json(DataTableBean.format(data, ops));
    });
});

// 编辑页面
router.get('/:id', function (req, res) {
    var id = req.param("id");
    CommonService.loadOne(Course, {
        id: id,
        populate: {   // 关联讲师
            path: 'lecturerId',
            select: 'name _id avatar'
        }
    }, function (data) {


        // 编辑页面模型
        var backStageEditBean = new BackStageEditBean({
            title: id === '0' ? '新增课程' : '编辑课程',
            actionUrl: '/backstage/course'
        }, data);

        // 查询分类
        CourseClass.getAll('name level parentId').then(function (data) {
            backStageEditBean['item']['ext'] = {
                courseClasses: data
            };
        }).then(function () {
            WebUtils.write('backstage/course/edit', new MessageBean(backStageEditBean), req, res);
        });

        /* // 所有的课程分类和讲师分类
         CourseService.getCourseAndlecturer(function (data) {
         backStageEditBean['item']['ext'] = data;
         WebUtils.write('backstage/course/edit', new MessageBean(backStageEditBean), req, res);
         });*/
    });
});


// 保存数据
router.post('/', function (req, res) {
    var body = req.body,
        id = body._id,
        extInfoKeys = body.extInfoKeys,
        extInfoKeysValues = body.extInfoKeysValues;

    // 解析extinfo
    if (extInfoKeys && extInfoKeysValues) {
        body.extInfo = [];
        if (_.isArray(extInfoKeys) && _.isArray(extInfoKeysValues)) {
            // 多属性
            var keyLen = extInfoKeys.length;
            var valLen = extInfoKeysValues.length;
            if (extInfoKeys && extInfoKeysValues && keyLen > 0 && valLen > 0) {
                if (keyLen !== valLen) {
                    res.json(new MessageBean("拓展信息格式错误，请检查"), "false");
                }
                for (var i = 0, len = keyLen; i < len; i++) {
                    var keyStr = extInfoKeys[i];
                    var valStr = extInfoKeysValues[i];
                    body.extInfo.push({
                        name: keyStr,
                        val: valStr
                    });
                }
            }
        } else {
            // 单属性
            body.extInfo.push({
                name: extInfoKeys,
                val: extInfoKeysValues
            });
        }

    }


    var course = new Course(body);

    if (id) {
        // 更新
        delete course._doc.modifyTime._id;
        course._doc.modifyTime = new Date();
        Course.findByIdAndUpdate(id, {$set: course._doc}, function (err, data) {
            // 原生更新文档
            res.json(new MessageBean("更新成功"));
        });
    } else {
        // 保存
        RedisUtil.getincrNext("seq:course").then(function (seq) {
            course._doc.seq = Number(seq);
            course.save(function (err) {
                if (err) {
                    console.error(err);
                    res.json(new MessageBean("服务错误,保存失败"), "false");
                } else {
                    res.json(new MessageBean("保存成功"));
                }
            });

        });
    }
});


// 课程管理页面
router.get('/', function (req, res) {
    var backStageIndexBean = new BackStageIndexBean('课程管理', '课程管理'),
        message = new MessageBean(backStageIndexBean);
    res.render('backstage/course/list', message);
});


module.exports = router;