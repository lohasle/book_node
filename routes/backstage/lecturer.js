/**
 * Created by fule https:github.com/lohasle on 2015/12/14 0014.
 * route courses
 * @type {*|exports|module.exports}
 * 讲师管理路由
 */
var express = require('express');
var router = express.Router();

var MessageBean = require('../../app/beans/messageBean.js');
var DataTableBean = require('../../app/beans/dataTables/dataTableBean.js');
var DataTablesReqPar = require('../../app/beans/dataTables/dataTablesReqPar.js');
var BackStageIndexBean = require('../../app/beans/backStageIndexBean.js');
var BackStageEditBean = require('../../app/beans/backStageEditBean.js');
var Lecturer = require('../../app/models/lecturer.schema.js');
var Tag = require('../../app/models/tag.schema.js');
var LecturerService = require('../../app/services/lecturer.service.js');
var CommonService = require('../../app/services/common.service.js');
var WebUtils = require('../../app/utils/webutils.js');
var RedisUtil = require('../../app/utils/redisUtil.js');



/**
 * 讲师专长列表数据
 */
router.get('/skill/list.json', function (req, res) {

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
    ops.type = 'lecturer_skill'; // 专长

    ops.select = "name orderCode createTime modifyTime isAvalible"; //需要返回的字段
    CommonService.findPage(Tag,ops, function (data) {
        // data
        res.json(DataTableBean.format(data, ops));
    });
});

/**
 * 讲师专长管理页面
 */
router.get('/skill', function (req, res) {

    var backStageIndexBean = new BackStageIndexBean('讲师管理', '讲师专长管理'),
        message = new MessageBean(backStageIndexBean);
    res.render('backstage/lecturer/skill_list', message);
});

/**
 * 讲师专长编辑页面
 */
router.get('/skill/:id', function (req, res) {
    var id = req.param("id");
    CommonService.loadOne(Tag, {id, id}, function (data) {

        // 编辑页面模型
        var backStageEditBean = new BackStageEditBean({
            title:id==='0'?'新增专长':'编辑专长',
            actionUrl:'/backstage/lecturer/skill'
        },data);
        WebUtils.write('backstage/lecturer/skill_tpl_edit', new MessageBean(backStageEditBean), req, res);
    });
});

/**
 * 讲师专长保存
 */
router.post('/skill/', function (req, res) {
    var body = req.body,
        id = body._id;
    body['value'] = body['name'];

    var tag = new Tag(body);

    if(id){
        // 更新
        delete tag._doc._id;
        tag._doc.modifyTime = new Date();
        Tag.findByIdAndUpdate(id,{$set:tag._doc},function(err,data){
            res.json(new MessageBean("更新成功"));
        });
    }else{
        // 保存
        tag.save(function(err){
            if (err){
                res.json(new MessageBean("服务错误,保存失败"),"false");
            }else{
                res.json(new MessageBean("保存成功"));
            }
        });
    }
});



// 列表数据
router.get('/list.json', function (req, res) {

    var name = req.query.name,
        phone = req.query.phone,
        isAvalible = req.query.isAvalible,
        ops = DataTablesReqPar.buildOpsFromStr(req.query.dataTablesReqPar);

    ops.condition = {};

    if (WebUtils.strNotNull(name)) {
        ops.condition['name'] = new RegExp(name);
    }
    if (WebUtils.strNotNull(phone)) {
        ops.condition['phone'] = new RegExp(phone);
    }
    if (isAvalible !== undefined) {
        ops.condition['isAvalible'] = isAvalible;
    }

    ops.select = "seq name avatar sex jobTitle summary certificate skill_id createTime phone isAvalible"; //需要返回的字段
    LecturerService.findLecturerPage(ops, function (data) {
        // data
        res.json(DataTableBean.format(data, ops));
    });
});

// 管理页面
router.get('/', function (req, res) {

    var backStageIndexBean = new BackStageIndexBean('讲师管理', '讲师管理'),
        message = new MessageBean(backStageIndexBean);
    res.render('backstage/lecturer/list', message);
});

// 编辑页面
router.get('/:id', function (req, res) {
    var id = req.param("id");
    CommonService.loadOne(Lecturer, {id, id}, function (data) {

        // 编辑页面模型
        var backStageEditBean = new BackStageEditBean({
            title:id==='0'?'新增讲师':'编辑讲师',
            actionUrl:'/backstage/lecturer'
        },data);

        // 查询所有专长
        LecturerService.getAllSkillTags(function (data) {
            backStageEditBean.ops.skills = data;
            WebUtils.write('backstage/lecturer/tpl_edit', new MessageBean(backStageEditBean), req, res);
        });
    });
});

// 保存
router.post('/', function (req, res) {
    var body = req.body,
        id = body._id;




    var lecturer = new Lecturer(body);

    if(id){
        // 更新
        delete lecturer._doc._id;
        lecturer._doc.modifyTime = new Date();
        Lecturer.findByIdAndUpdate(id,{$set:lecturer._doc},function(err,data){
            res.json(new MessageBean("更新成功"));
        });
    }else{

        RedisUtil.getincrNext("seq:lecturer").then(function (seq) {
            // 保存
            lecturer._doc.seq = Number(seq);
            lecturer.save(function(err){
                if (err){
                    console.error(err);
                    res.json(new MessageBean("服务错误,保存失败"),"false");
                }else{
                    res.json(new MessageBean("保存成功"));
                }
            });
        });

    }
});

module.exports = router;