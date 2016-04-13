/**
 * Created by fule https:github.com/lohasle on 2015/12/14 0014.
 * route courses
 * @type {*|exports|module.exports}
 * index路由
 */
var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var MessageBean = require('../../app/beans/messageBean.js');
var DataTableBean = require('../../app/beans/dataTables/dataTableBean.js');
var DataTablesReqPar = require('../../app/beans/dataTables/dataTablesReqPar.js');
var BackStageIndexBean = require('../../app/beans/backStageIndexBean.js');
var BackStageEditBean = require('../../app/beans/backStageEditBean.js');
var WebUtils = require('../../app/utils/webutils.js');
var RedisUtil = require('../../app/utils/redisUtil.js');
var Ad = require('../../app/models/ad.schema.js');
var User = require('../../app/models/user.schema.js');
var Comment = require('../../app/models/comment.schema.js');
var Feedback = require('../../app/models/feedback.schema.js');
var CommonService = require('../../app/services/common.service.js');
var Course = require('../../app/models/course.schema.js');
var Lecturer = require('../../app/models/lecturer.schema.js');
var Sysconfig = require('../../app/models/sysconfig.schema.js');
var http = require('http');
var util = require('util');
var fs = require('fs');
var path = require('path');
var uuid = require('uuid');
var request = require('request');
var async = require('async');
var _ = require("underscore")._;


/**
 * 推荐帖管理页面
 */
router.get("/bbsThread",function(req, res){
    var backStageIndexBean = new BackStageIndexBean('广告管理', '推荐帖管理'),
        message = new MessageBean(backStageIndexBean);
    //查找热门帖 数量大小
    Sysconfig.findOne({"type":"discuz_hot_thread_pageSize"}).then(function(data){
        var message = new MessageBean(backStageIndexBean,'true',data);
        res.render('backstage/bbsThread/list', message);
    });
});

/**
 * 添加热门帖
 */
router.post('/bbsThread/setPageSize', function (req, res) {

    var ps = req.param("ps");

    Sysconfig.findOne({"type": "discuz_hot_thread_pageSize"}).then(function (data) {
        if (data) {
            // 更新
            Sysconfig.findByIdAndUpdate(data._id.toString(), {$set: {value: ps}}, function (err, data) {
                res.json(new MessageBean("更新成功"));
            });
        } else {
            // 新增
            var sysconfig = new Sysconfig({
                value: ps,
                type: 'discuz_hot_thread_pageSize'
            });
            // 保存
            sysconfig.save(function (err) {
                if (err) {
                    res.json(new MessageBean("服务错误,保存失败"), "false");
                } else {
                    res.json(new MessageBean("保存成功"));
                }
            });
        }
    });
});

/**
 * 推荐帖管理列表页面
 */
router.get("/bbsThread/list.json",function(req, res){
    var  ops = DataTablesReqPar.buildOpsFromStr(req.query.dataTablesReqPar);

    ops.condition = {type:"discuz_hot_thread"};

    ops.select = "name value type orderCode createTime modifyTime"; //需要返回的字段

    CommonService.findPage(Sysconfig, ops, function (data) {
        // data
        res.json(DataTableBean.format(data, ops));
    });
});

/**
 * 推荐帖管理详情
 */
router.get('/bbsThread/:id', function (req, res, next) {
    var id = req.param("id");
    var method = req.param("method");
    if (method === 'delete') {
        next(); // 删除操作
    } else {
        CommonService.loadOne(Sysconfig, {id, id}, function (data) {
            // 编辑页面模型
            var backStageEditBean = new BackStageEditBean({
                title: id === '0' ? '新增热门帖' : '编辑热门帖',
                actionUrl: '/backstage/bbsThread'
            }, data);
            WebUtils.write('backstage/bbsThread/tpl_edit', new MessageBean(backStageEditBean), req, res);
        });
    }
}, function (req, res, next) {
    var id = req.param("id");
    // 删除
    Sysconfig.remove({_id: id}, function (err, data) {
        if (err) {
            res.json(new MessageBean("服务错误,删除失败"), "false");
        } else {
            res.json(new MessageBean("删除成功"));
        }
    });
});

/**
 * 添加热门帖
 */
router.post('/bbsThread/', function (req, res) {
    var body = req.body,
        id = body._id;
    body['type'] = "discuz_hot_thread"; // 热门帖子类型
    var sysconfig = new Sysconfig(body);
    if (id) {
        // 更新
        delete sysconfig._doc._id;
        sysconfig._doc.modifyTime = new Date();
        Sysconfig.findByIdAndUpdate(id, {$set: sysconfig._doc}, function (err, data) {
            res.json(new MessageBean("更新成功"));
        });
    } else {
        // 保存
        sysconfig.save(function (err) {
            if (err) {
                res.json(new MessageBean("服务错误,保存失败"), "false");
            } else {
                res.json(new MessageBean("保存成功"));
            }
        });
    }
});

/**
 * 用户管理页面
 */
router.get("/user",function(req, res){
    var backStageIndexBean = new BackStageIndexBean('用户管理', '用户管理'),
        message = new MessageBean(backStageIndexBean);
    res.render('backstage/user/list', message);
});

/**
 * 用户管理分页数据
 */
router.get("/user/list.json",function(req, res){
    var userName = req.query.userName,
        ops = DataTablesReqPar.buildOpsFromStr(req.query.dataTablesReqPar);

    ops.condition = {};

    if (WebUtils.strNotNull(userName)) {
        ops.condition['userName'] = new RegExp(userName);
    }

    ops.select = "userName avatar"; //需要返回的字段
    CommonService.findPage(User, ops, function (data) {
        // data
        res.json(DataTableBean.format(data, ops));
    });
});

/**
 * 用户编辑页面
 */
router.get('/user/:id', function (req, res, next) {
    var id = req.param("id");
    var method = req.param("method");
    if (method === 'delete') {
        next(); // 删除操作
    } else {
        CommonService.loadOne(User, {id, id}, function (data) {
            // 编辑页面模型
            var backStageEditBean = new BackStageEditBean({
                title: id === '0' ? '新增用户' : '编辑用户',
                actionUrl: '/backstage/user'
            }, data);
            WebUtils.write('backstage/user/tpl_edit', new MessageBean(backStageEditBean), req, res);
        });
    }
}, function (req, res, next) {
    var id = req.param("id");
    // 删除
    User.remove({_id: id}, function (err, data) {
        if (err) {
            res.json(new MessageBean("服务错误,删除失败"), "false");
        } else {
            res.json(new MessageBean("删除成功"));
        }
    });
});

/**
 * 用户保存
 */
router.post('/user/', function (req, res) {
    var body = req.body,
        id = body._id;


    var user = new User(body);

    if (id) {
        // 更新
        delete user._doc._id;
        user._doc.modifyTime = new Date();
        User.findByIdAndUpdate(id, {$set: user._doc}, function (err, data) {
            res.json(new MessageBean("更新成功"));
        });
    } else {
        // 保存
        user.save(function (err) {
            if (err) {
                res.json(new MessageBean("服务错误,保存失败"), "false");
            } else {
                res.json(new MessageBean("保存成功"));
            }
        });
    }
});


/**
 * 评论管理页面
 */
router.get("/comment",function(req, res){
    var backStageIndexBean = new BackStageIndexBean('评论管理', '评论管理'),
        message = new MessageBean(backStageIndexBean);
    // 查询课程
    Course.find({isAvalible:true},"_id title").sort({beginTime:-1}).then(function(data){
        message.ext = {
            courseList:data
        };
        res.render('backstage/comment/list', message);
    });
});

/**
 * 评论管理列表页面
 */
router.get("/comment/list.json",function(req, res){
    var content = req.query.content, // 评论内容
        courseId = req.query.courseId,
        ops = DataTablesReqPar.buildOpsFromStr(req.query.dataTablesReqPar);

    ops.condition = {};

    if (WebUtils.strNotNull(content)) {
        ops.condition['content'] = new RegExp(content);
    }
    if (WebUtils.strNotNull(courseId)) {
        ops.condition['courseId'] = courseId;
    }

    ops.select = "content courseId userId commentType createTime"; //需要返回的字段

    ops.populates = [{
        path: 'userId',
        select: '_id userName avatar'
    },{
        path: 'courseId',
        select: 'title _id'
    }];
    CommonService.findPage(Comment, ops, function (data) {
        // data
        res.json(DataTableBean.format(data, ops));
    });
});

/**
 * 评论管理详情
 */
router.get('/comment/:id', function (req, res, next) {
    var id = req.param("id");
    var method = req.param("method");
    if (method === 'delete') {
        next(); // 删除操作
    } else {

        async.parallel({
            courseList:function(callback){
                // 查询课程
                Course.find({isAvalible:true},"_id title").sort({beginTime:-1}).then(function(data){
                    callback(null,data);
                });
            },
            userList:function(callback){
                // 用户列表
                User.find({},"_id userName avatar").sort({createTime:-1}).then(function(data){
                    callback(null,data);
                });
            },
            item:function(callback){
                // 详情
                CommonService.loadOne(Comment, {id, id}, function (data) {
                    callback(null,data);
                });
            }
        },function(err, rs){
            // 编辑页面模型
            var backStageEditBean ={
                ops:{
                    title: id === '0' ? '新增评论' : '编辑评论',
                    actionUrl: '/backstage/comment'
                }
            };
            _.extend(backStageEditBean,rs);
            WebUtils.write('backstage/comment/tpl_edit', new MessageBean(backStageEditBean), req, res);
        });
    }
}, function (req, res, next) {
    var id = req.param("id");
    // 删除
    Comment.remove({_id: id}, function (err, data) {
        if (err) {
            res.json(new MessageBean("服务错误,删除失败"), "false");
        } else {
            res.json(new MessageBean("删除成功"));
        }
    });
});

/**
 * 添加评论
 */
router.post('/comment/', function (req, res) {
    var body = req.body,
        id = body._id;

    var comment = new Comment(body);

    if (id) {
        // 更新
        delete comment._doc._id;
        comment._doc.modifyTime = new Date();
        Comment.findByIdAndUpdate(id, {$set: comment._doc}, function (err, data) {
            res.json(new MessageBean("更新成功"));
        });
    } else {
        // 保存
        comment.save(function (err) {
            if (err) {
                res.json(new MessageBean("服务错误,保存失败"), "false");
            } else {
                res.json(new MessageBean("保存成功"));
            }
        });
    }
});




/**
 * 系统配置
 */
router.get("/sysConfig/site", function (req, res) {
    var backStageIndexBean = new BackStageIndexBean('系统设置', '站点设置');
    // 查询SEO 配置
    Sysconfig.findOne({"type":"site_seo"}).then(function(data){
        var message = new MessageBean(backStageIndexBean,'true',data);
        res.render('backstage/sys/siteConfig', message);
    });
});

/**
 * ID 重建
 */
router.post("/sysConfig/fixId", function (req, res) {
    // 重建 讲师 序列ID
    Lecturer.find({}, 'createTime').sort({"createTime": 1}).then(function (dataArr) {
        if (dataArr && dataArr.length > 0) {
            RedisUtil.set("seq:lecturer", 0);
            var promiseArr = [];
            for (var i in dataArr) {

                (function () {
                    var item = dataArr[i];
                    RedisUtil.getincrNext("seq:lecturer").then(function (seq) {
                        promiseArr.push(Lecturer.updateAsync({_id: item._id.toString()}, {seq: seq}));
                    });
                }());
            }

            // 执行重建讲师
            Promise.all(promiseArr).then(function () {

                // 重建所有 课程 序列ID
                Course.find({}, 'createTime').sort({"createTime": 1}).then(function (dataArr) {
                    if (dataArr && dataArr.length > 0) {
                        RedisUtil.set("seq:course", 0);
                        var promiseArr = [];
                        for (var j in dataArr) {

                            (function () {
                                var item = dataArr[j];
                                RedisUtil.getincrNext("seq:course").then(function (seq) {
                                    promiseArr.push(Course.updateAsync({_id: item._id.toString()}, {seq: seq}));
                                });
                            }());

                        }

                        // 执行重建课程
                        Promise.all(promiseArr).then(function () {
                            res.json(new MessageBean("重置成功"));
                        });
                    }
                    ;
                })

            });
        }

    });

});

/**
 * SEO 信息提交
 */
router.post("/sysConfig/seo", function (req, res) {
    var body = req.body;

    var sysconfig = new Sysconfig({
        "name":"网站SEO设置",
        "type":"site_seo",
        "value":JSON.stringify(body)
    });
    try {
        Sysconfig.remove({"type":"site_seo"}).then(function(){
            global['seomate'] = body;
            return sysconfig.save();
        }).then(function(){
            res.json(new MessageBean("保存成功"));
        });
    }catch (e){
        console.error(e);
    }
});


/**
 * 广告列表数据
 */
router.get('/ad/list.json', function (req, res) {
    var name = req.query.title,
        isAvalible = req.query.isAvalible,
        type = req.query.type,
        ops = DataTablesReqPar.buildOpsFromStr(req.query.dataTablesReqPar);

    ops.condition = {};

    if (WebUtils.strNotNull(name)) {
        ops.condition['title'] = new RegExp(title);
    }
    if (isAvalible !== undefined) {
        ops.condition['isAvalible'] = isAvalible;
    }
    if (type !== undefined) {
        ops.condition['type'] = type;
    }

    ops.select = "position title isAvalible orderCode createTime modifyTime type img href bgColor"; //需要返回的字段
    CommonService.findPage(Ad, ops, function (data) {
        // data
        res.json(DataTableBean.format(data, ops));
    });
});

/**
 * 广告管理页面
 */
router.get('/ad', function (req, res) {

    var backStageIndexBean = new BackStageIndexBean('广告管理', '广告管理'),
        message = new MessageBean(backStageIndexBean);
    res.render('backstage/ad/list', message);
});

/**
 * 广告编辑页面
 */
router.get('/ad/:id', function (req, res, next) {
    var id = req.param("id");
    var method = req.param("method");
    if (method === 'delete') {
        next(); // 删除操作
    } else {
        CommonService.loadOne(Ad, {id, id}, function (data) {
            // 编辑页面模型
            var backStageEditBean = new BackStageEditBean({
                title: id === '0' ? '新增广告' : '编辑广告',
                actionUrl: '/backstage/ad'
            }, data);
            WebUtils.write('backstage/ad/tpl_edit', new MessageBean(backStageEditBean), req, res);
        });
    }
}, function (req, res, next) {
    var id = req.param("id");
    // 删除
    Ad.remove({_id: id}, function (err, data) {
        if (err) {
            res.json(new MessageBean("服务错误,删除失败"), "false");
        } else {
            res.json(new MessageBean("删除成功"));
        }
    });
});

/**
 * 广告保存
 */
router.post('/ad/', function (req, res) {
    var body = req.body,
        id = body._id;


    var ad = new Ad(body);

    if (id) {
        // 更新
        delete ad._doc._id;
        ad._doc.modifyTime = new Date();
        Ad.findByIdAndUpdate(id, {$set: ad._doc}, function (err, data) {
            res.json(new MessageBean("更新成功"));
        });
    } else {
        // 保存
        ad.save(function (err) {
            if (err) {
                res.json(new MessageBean("服务错误,保存失败"), "false");
            } else {
                res.json(new MessageBean("保存成功"));
            }
        });
    }
});

/**
 * 反馈列表数据
 */
router.get('/feedback/list.json', function (req, res) {

    var userName = req.query.userName,
        userPhone = req.query.userPhone,
        ops = DataTablesReqPar.buildOpsFromStr(req.query.dataTablesReqPar);

    ops.condition = {};

    if (WebUtils.strNotNull(userName)) {
        ops.condition['userName'] = new RegExp(userName);
    }
    if (WebUtils.strNotNull(userPhone)) {
        ops.condition['userPhone'] = new RegExp(userPhone);
    }

    ops.select = "userName userPhone content createTime originIp"; //需要返回的字段
    CommonService.findPage(Feedback, ops, function (data) {
        // data
        res.json(DataTableBean.format(data, ops));
    });
});

/**
 * 反馈管理页面
 */
router.get('/feedback', function (req, res) {

    var backStageIndexBean = new BackStageIndexBean('运营管理', '预约查询'),
        message = new MessageBean(backStageIndexBean);
    res.render('backstage/feedback/list', message);
});


/**
 * 上传接口
 * ext params   model  指定上传的子文件夹(先建立此文件夹）
 * <input name="file">
 */
router.post('/upload', function (req, res) {
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.keepExtensions = true;     //保留后缀
    form.maxFieldsSize = 8 * 1024 * 1024;   // 最大文件大小 8 M
    form.parse(req, function (err, fields, files) {

        var myuuid = uuid.v1().replace(/-/g, "");

        // `file` is the name of the <input> field of type `file`
        var old_path = files.file.path,
            file_ext = files.file.name.split('.').pop(),
            model = fields.model,
            oldFilePathDel = fields.oldPath,
            new_xdPath_db = '/upload/' + model + "/" + myuuid + '.' + file_ext; // 保存到数据库中 顺斜杠
        new_xdPath = path.normalize(new_xdPath_db),// 相对路径
            new_path = path.join(path.join(path.resolve(__dirname, '../../'), 'public'), new_xdPath);

        if (WebUtils.strNotNull(oldFilePathDel)) {
            // 删除老文件
            fs.unlink(path.join(path.join(process.cwd(), 'public'), oldFilePathDel), function (err) {
                if (err) {
                    console.info(err);
                }
            });
        }

        if (!/jpg|png|jpeg|gif/.test(file_ext.trim())) {
            res.json(new MessageBean("请上传jpg,png,gif类的图片", 'false'));
        } else {
            fs.readFile(old_path, function (err, data) {
                fs.writeFile(new_path, data, function (err) {
                    fs.unlink(old_path, function (err) {
                        if (err) {
                            console.info("图片上传失败:"+new_xdPath_db);
                            res.json(new MessageBean("上传失败，请重试", 'false'));
                        } else {
                            console.info("图片上传成功:"+new_xdPath_db);
                            res.json(new MessageBean({path: new_xdPath_db}, 'true'));
                        }
                    });
                });
            });
        }
    });
});

/**
 * 路径测试
 */
router.get('/sp', function (req, res, next) {

    var new_xdPath = path.normalize('/upload/' + 'image' + "/" + uuid.v1().replace(/-/g, "") + '.jpg'),// 相对路径
        new_path = path.join(path.join(path.resolve(__dirname, '../../'), 'public'), new_xdPath);
    res.json({
        a: process.cwd(),
        aa: path.normalize(process.cwd()),
        b: __dirname,
        bb: path.normalize(__dirname),
        c: path.resolve(__dirname, '../../'),
        cc: path.normalize(path.resolve(__dirname, '../../')),
        n: new_path,
        nn: path.normalize(new_path)
    });
});
/*
router.get("/rq",function(req,res){
    var task  =[];
    var url = req.query.url;
    var count = req.query.count;
    for(var i=0;i<count;i++){
        task.push(i);
    }
    async.map(task,function(item,callback){
        request(url, function (error, response, body) {
            console.info(item);
            if (!error && response.statusCode == 200) {
                callback(null,body);
            }else{
                console.info(error);
            }
        })
    },function(err,results){
        res.send('ok');
    });

});*/


/* 首页 */
router.get(['', '/', '/index'], function (req, res, next) {
    var user = req.session.user;
    res.render('backstage/index', new MessageBean({user: user}));
});


module.exports = router;
