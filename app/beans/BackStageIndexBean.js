/**
 * Created by fule https:github.com/lohasle on 2015/12/14 0014.
 * 后台管理页面首页模型
 */
function BackStageIndexBean(parentName,currentName){
    this.parent={};
    this.current={};
    this.parent.name = parentName;
    this.current.name = currentName;
}


module.exports = BackStageIndexBean;