/**
 * Created by Administrator on 2015/12/17 0017.
 */
var moment = require('moment');
var RedisUtil = require('../../app/utils/redisUtil.js');
var SwigFilterExt = {

    /**
     * 截断字符  兼容 字母 数字 中文 等宽
     * @param input
     * @param number
     * @param type
     */
    subBtyesStr: function (input, length) {
        if (!input) {
            return '';
        }
        var tStr = "";  //返回的字符串
        var pEnd = 0;   //截取字符串的结束位置
        var totalLength = 0;   //
        var charCode;
        for (var i = 0; i < input.length; i++) {
            charCode = input.charCodeAt(i);
            if (charCode < 0x007f) {
                totalLength++;
            }
            else {  //当为非字母时， 按第个字符占两个字节宽度计算
                totalLength += 2;
            }

            if (totalLength <= length) {
                pEnd = i + 1;
            }
        }

        if (pEnd < input.length) {  //有截取
            tStr = input.substr(0, pEnd);
            tStr += "...";
        }
        else {  //没有截取
            tStr = input.substr(0, this.length);
        }
        return tStr;
    },
    /**
     * 使用Moment 格式化时间
     * @param input
     * @param format
     */
    mdate: function (input, format) {
        return moment(input).format(format);
    },

    /**
     * 得到全局变量
     */
    globalVal: function (input) {
        return global[input];
    },

    // 注册自定义模板过滤
    register: function (swig) {
        swig.setFilter('subBtyesStr', SwigFilterExt.subBtyesStr);
        swig.setFilter('mdate', SwigFilterExt.mdate);
        swig.setFilter('globalVal', SwigFilterExt.globalVal);
    }
};

module.exports = SwigFilterExt;