/**
 * Created by fule https:github.com/lohasle on 2015/12/14 0014.
 * 通用业务服务
 */
var WebUtils = require('../../app/utils/webutils.js');
var PageBean = require('../../app/beans/pageBean.js');
var Promise = require('bluebird');
var _ = require('underscore');

var CommonService = {

    /**
     * 查询分页列表(简化列表查询和分页查询)
     * @param model  模型对象
     * @param ops    参数
     * @param cb     回调
     * return  pageBean
     * .....待改进
     * 嵌套查询key 非空指定
     */
    findPage: function (model, ops, cb) {

        var pageNo = ops.pageNo || 1,
            pageSize = ops.pageSize > 50 ? 50 : (ops.pageSize || 10),// 分页保护
            orderBy = ops.orderBy,  //排序
            resultType = ops.resultType,// 返回类型 list 列表  page 分页数据
            populate = ops.populate,// 单关联字段
            populates = ops.populates,// 多关联
            select = ops.select && ops.select != '' ? ops.select : "";     //需要查询的字段


        var page = WebUtils.getStart(pageNo, pageSize), //分页参数
            condition = {}; //查询条件

        var keys = _.keys(ops.condition);
        for (var i = 0, len = keys.length; i < len; i++) {
            var key = keys[i];
            if (ops.condition[key] != undefined && ops.condition[key] != '') {
                // 有值时填充查询条件
                condition[key] = ops.condition[key];
            }
        }

        // 查询
        var query = model.find(condition, select);

        // 分页
        if (ops.pageNo && ops.pageSize) {
            query.skip(page.start);
            query.limit(page.limit);
        }
        // 排序
        if (ops.orderBy) {
            query.sort(orderBy);
        }
        // 关联
        if(populates){
            // 多关联
            for(var i in populates){
                query.populate(populates[i]);
            }
        }else if(populate){
            // 单关联
            query.populate(populate);
        }

        //执行查询
        query.exec(function (err, data) {
            if (err) {
                console.info(err);
            }
            if (resultType === 'list') {
                // list
                cb({rows: data});
            } else {
                // 默认 page 包含 count
                model.count(condition).exec(function (err, rowCount) {
                    if (err) {
                        console.info(err);
                    }
                    var pageBean = new PageBean(data, rowCount, pageNo, pageSize);//分页对象
                    cb(pageBean);
                });
            }
        });
    },
    /**
     * 加载一个数据
     * @param model
     * @param ops
     * @param cb
     */
    loadOne:function(model,ops,cb){
        var id = ops.id,
            populate = ops.populate,// 单关联字段
            populates = ops.populates; // 多关联字段

        if(id==='0'){
            cb({});// 回调 空对象
            return ;
        }

        var query = model.findOne({"_id": id});

        // 关联
        if(populates){
            // 多关联
            for(var i in populates){
                query.populate(populates[i]);
            }
        }else if(populate){
            // 单关联
            query.populate(populate);
        }
        query.exec(function(err, data){
            if (err) {
                console.info(err);
            }
            cb(data);
        });
    }
};
module.exports = CommonService;
