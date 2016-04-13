/**
 * Created by fule https:github.com/lohasle on 2015/12/21 0021
 * 消息对象
 */
function MessageBean(data,success,ext){
    this.data = data;
    this.success = success||'true';
    this.ext = ext;
}


module.exports = MessageBean;