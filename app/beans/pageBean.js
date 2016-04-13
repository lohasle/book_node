/**
 * Created by fule https:github.com/lohasle on 2015/12/21 0021
 * 分页数据对象
 */
function PageBean(rows, rowCount, pageNo, pageSize) {
    this.rows = rows;
    this.rowCount = rowCount;
    this.pageNo = Number(pageNo);
    this.pageSize = Number(pageSize);
    this.pageTotal = this.getPageTotal();
}

/**
 * 得到总页数
 * @returns {number}
 */
PageBean.prototype.getPageTotal = function () {
    return Math.ceil(this.rowCount / this.pageSize);
};

module.exports = PageBean;