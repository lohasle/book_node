/**
 * Created by fule https:github.com/lohasle on 2015/12/14 0014.
 * webutils 工具
 */


var WebUtils = {
    // 转化为mongo所需 分页参数
    getStart: function (pageNo, pageSize) {
        pageNo = Number(pageNo);
        pageSize = Number(pageSize);
        var start = (pageNo - 1) * pageSize;
        return {
            start: start,
            limit: pageSize
        }
    },
    /**
     * 写入页面
     * @param tplUrl  模板路径
     * @param data    数据
     * @param req
     * @param res
     */
    write: function (tplUrl, data, req, res) {
        var url = req.url;
        var point = url.lastIndexOf(".");
        var type = url.substr(point + 1);
        if (url.indexOf("?") > -1) {
            // 处理带后缀的
            type = url.substr(point + 1, url.indexOf("?") - (point + 1));

        }

        if (WebUtils.strNotNull(req.param("dataType"))) {
            // 处理方法参数
            type = req.param("dataType");
        }

        if (type == 'json') {
            res.json(data);
        } else {
            res.render(tplUrl, data);
        }


    },
    //是否为空
    strNotNull: function (s) {
        return s && s !== undefined && (typeof s == 'string') && s.trim() != '';
    },


    // 随机N-M整数
    randomNum: function (minNum, maxNum) {
        switch (arguments.length) {
            case 1:
                return parseInt(Math.random() * minNum + 1);
                break;
            case 2:
                return parseInt(Math.random() * (maxNum - minNum + 1) + minNum);
                break;
            default:
                return 0;
                break;
        }
    },
    /**
     * 得到客户端IP
     * @param req
     * @returns {*|string}
     */
    getClientIp: function (req) {
        return req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
    }
};

module.exports = WebUtils;

