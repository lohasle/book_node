/**
 * Created by fule https:github.com/lohasle on 2015/12/14 0014.
 * route review
 * @type {*|exports|module.exports}
 * 现场回顾
 */
var express = require('express');
var router = express.Router();

var Course = require('../../app/models/course.schema.js');
var Album = require('../../app/models/album.schema.js');
var CommonService = require('../../app/services/common.service.js');
var MessageBean = require('../../app/beans/messageBean.js');
var WebUtils = require('../../app/utils/webutils.js');
var moment = require('moment');

router.get('/', function (req, res, next) {
    var ops = {},
        beginTime = req.param("beginTime"); //查询参数
    ops.pageNo = req.param('pageNo');
    ops.pageSize = req.param('pageSize');
    ops.condition = {
        albumId:{$exists: true},
        frontImg:{$exists: true}
    };
    ops.orderBy = {beginTime: -1};

    try {
        if (WebUtils.strNotNull(beginTime) && moment(beginTime).isValid()) {
            ops.condition.beginTime = {$gte: beginTime};
        }
    } catch (e) {
        console.error(e);
    }

    ops.select = " name albumId title beginTime  fullAddress address1 address2 ";
    ops.populate = {  //关联讲师姓名
        path: 'albumId',
        select: '_id frontImg photos'
    };
    CommonService.findPage(Course, ops, function (data) {
        WebUtils.write('front/review/list2', {current: 'review', album: data}, req, res);
    });
});


/**
 * 获取 相册里的数据
 */
router.get('/:id', function (req, res, next) {
    var id = req.param("id");
    Album.findById(id).then(function (data) {
        WebUtils.write('front/review/detail', data, req, res);
    });
});


module.exports = router;
