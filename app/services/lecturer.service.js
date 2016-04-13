/**
 * Created by fule https:github.com/lohasle on 2015/12/14 0014.
 * 讲师相关业务
 */
var Course = require('../../app/models/course.schema.js');
var CourseClass = require('../../app/models/courseClass.schema.js');
var Lecturer = require('../../app/models/lecturer.schema.js');
var Tag = require('../../app/models/tag.schema.js');
var WebUtils = require('../../app/utils/webutils.js');
var Promise = require('bluebird');
var _ = require('underscore');
var CommonService = require('../../app/services/common.service.js');


var LecturerService = {
    /**
     * 获取所有的skill  标签
     * 可见的专长
     * @param cb
     */
    getAllSkillTags: function (cb) {
        Tag.find({type: 'lecturer_skill', "isAvalible": true}, "name value")
            .sort({orderCode: 1, createTime: -1})
            .exec(function (err, data) {
                cb(data);
            });
    },
    /**
     * 讲师分页数据
     */
    findLecturerPage: function (ops, cb) {
        CommonService.findPage(Lecturer, ops, function (data) {
            cb(data);
        });
    },

    findLecturerPageFast: function (ops, cb) {
        ops.select = "seq name avatar sex jobTitle summary certificate skill_id"; //需要返回的字段
        LecturerService.findLecturerPage(ops, cb);
    },
    /**
     * 加载一名讲师
     * @param id
     * @param cb
     */
    loadLecturer: function (id, fileds, cb) {
        Lecturer.findOne({"_id": id}, fileds).exec(function (err, data) {
            cb(data);
        });
    },
    /**
     * 加载一名讲师
     * @param id
     * @param cb
     */
    loadLecturerFast: function (id, cb) {
        var filed = "name avatar avatar_big sex jobTitle summary certificate skill_id";
        LecturerService.loadLecturer(id, filed, cb);
    },

    /**
     * 加载一名讲师
     */
    loadLecturerFastBySeq: function (seq, cb) {
        var fileds = "name avatar avatar_big sex jobTitle summary certificate skill_id";
        Lecturer.findOne({"seq": seq,"isAvalible":true}, fileds).exec(function (err, data) {
            cb(data);
        });
    }
};
module.exports = LecturerService;
