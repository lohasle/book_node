/**
 * Created by fule https:github.com/lohasle on 2015/12/21 0021
 * datatables 的 请求内容封装
 */

/**
 *
 * @param search 搜索参数 {"value":"","regex":false}
 *
 * @param columns 列参数
 * {"data":"eventId","name":"event_id","searchable":true,"orderable":true,"search":{"value":"","regex":false}}
 *
 * @param start  开始行数 int
 * @param length 行大小  int
 * @param draw 请求次数  int
 *
 * @param order 排序参数
 * [{"column":0,"dir":"desc"}]
 *
 * @constructor
 */
function DataTablesReqPar() {

    var argLen = arguments.length;
    if (argLen == 1) {
        // json
        try {
            var dataObj = JSON.parse(arguments[0]);
            this.start = dataObj.start;
            this.length = Number(dataObj.length);
            this.search = dataObj.search;
            this.columns = dataObj.columns;
            this.draw = dataObj.draw;
            this.order = dataObj.order;
        } catch (e) {
            console.error(e);
        }
    } else if (argLen == 6) {
        this.start = arguments[0];
        this.length = Number(arguments[1]);
        this.search = arguments[2];
        this.columns = arguments[3];
        this.draw = arguments[4];
        this.order = arguments[5];
    } else {
        console.error(" not support this arguments, the arguments must be json or len(6)")
    }
}

/**
 * 解析分页参数到ops 对象中
 */
DataTablesReqPar.prototype.resolvePage2Ops = function () {
    var pageSize = this.length;
    var pageNo = Math.ceil(this.start / this.length);

    var orders = this.order;
    var columns = this.columns;
    var orderBy = {};
    for (var i in orders) {
        var orderIndex = orders[i]['column'];
        var orderName = columns[orderIndex].name;
        var orderVal = orders[i].dir;
        orderBy[orderName] = orderVal == 'desc' ? -1 : 1;
    }

    return {
        pageSize: pageSize,
        pageNo: pageNo,
        orderBy: orderBy,
        draw:this.draw
    }
};

DataTablesReqPar.buildOpsFromStr = function(jsonStr){
    return new DataTablesReqPar(jsonStr).resolvePage2Ops();
};


module.exports = DataTablesReqPar;
