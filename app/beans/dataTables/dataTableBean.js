/**
 * Created by fule https:github.com/lohasle on 2015/12/21 0021
 *  dataTable 模型
 */

/*function DataTableBean(draw, recordsFiltered, recordsTotal, error, data) {
    this.draw = draw;
    this.recordsFiltered = recordsFiltered;
    this.recordsTotal = recordsTotal;
    this.error = error;
    this.data = data;
}*/

var DataTableBean = {

    /**
     * 格式化为一个dataTable 模型
     * @returns {DataTableBean}
     */
    format: function (pageBean, dataTablesReqPar) {
        var result = {
            draw: dataTablesReqPar.draw,
            recordsFiltered: pageBean.rowCount,
            recordsTotal: pageBean.rowCount,
            data: pageBean.rows,
        };
        return result;
    }
};


module.exports = DataTableBean;
