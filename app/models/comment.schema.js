/**
 * Created by Administrator on 2015/12/17 0017.
 * 评论 模型  记录 用户评论
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Promise = require('bluebird'),
    moment = require('moment');

/**
 * commentSchema
 */
var CommentSchema = new Schema({
    content: {
        type:String
    },
    courseId: { // 课程id
        type: mongoose.Schema.ObjectId,
        ref: 'Course'
    },
    userId:{  // 用户id
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    commentType:String, // 评论类型 course 课程
    modifyTime: Date,
    createTime: {type: Date, default: Date.now}
});

CommentSchema.virtual('_createTime').get(function () {
    return moment(this.createTime).format('YYYY-MM-DD HH:mm');
});

/**
 * 静态方法
 * @type
 */
CommentSchema.statics = {

};

var Comment = mongoose.model('Comment', CommentSchema);
Promise.promisifyAll(Comment);
Promise.promisifyAll(Comment.prototype);
module.exports = Comment;
