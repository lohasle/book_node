/**
 * Created by fule https:github.com/lohasle on 2015/12/14 0014.
 * route search
 * @type {*|exports|module.exports}
 * 搜索
 */
var express = require('express');
var router = express.Router();
var Course = require('../../app/models/course.schema.js');
var Comment = require('../../app/models/comment.schema.js');
var Lecturer = require('../../app/models/lecturer.schema.js');
var CommonService = require('../../app/services/common.service.js');
var WebUtils = require('../../app/utils/webutils.js');

/**
 * 搜索 讲师或者课程
 */
router.get('/', function (req, res, next) {
    var word = req.param("word");
    var type = req.param("type") || "all"; // all  lecturer course
    var result = {};
    var lecturerOps = {
        pageNo:req.param("pageNo")||1,
        pageSize:req.param("pageSize")||99,
        select:'seq name avatar sex jobTitle summary certificate skill_id',
        condition:{
            isAvalible:true
        }
    };
    var courseOps = {
        pageNo:req.param("pageNo")||1,
        pageSize:req.param("pageSize")||99,
        select:'seq name lecturerId courseSeriesId title summary beginTime bmUrl content fullAddress isHot extInfo frontImg address1 address2',
        populate:({ //关联讲师姓名
            path: 'lecturerId',
            select: 'name _id avatar',
        }),
        condition:{
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
    CommonService.findPage(Course,courseOps, function (data) {
        result['coursePage'] = data;

        //讲师
        CommonService.findPage(Lecturer,lecturerOps, function (data) {
            result['lecturerPage'] = data;
            WebUtils.write("front/search", {data: result}, req, res);
        });
    });
});



module.exports = router;
