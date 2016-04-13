/**
 * Created by lohas on 2015/8/22.
 */

function openBankWin(){
    var url = location.href;
    window.open(url);
}

/**
 * prototype ext
 */
;(function(){

    Array.prototype.indexOf = function(val) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == val) return i;
        }
        return -1;
    };

    Array.prototype.remove = function(val) {
        var index = this.indexOf(val);
        if (index > -1) {
            this.splice(index, 1);
        }
    };

    /**
     * [format 日期格式化]
     * @param  {[type]} format ["YYYY年MM月dd日hh小时mm分ss秒"]
     * @return {[type]}        [string]
     */
    Date.prototype.format = function(format){
        var o = {
            "M+" : this.getMonth()+1, //month
            "d+" : this.getDate(), //day
            "h+" : this.getHours(), //hour
            "m+" : this.getMinutes(), //minute
            "s+" : this.getSeconds(), //second
            "q+" : Math.floor((this.getMonth()+3)/3), //quarter
            "S" : this.getMilliseconds() //millisecond
        }
        if(/(y+)/.test(format))
            format = format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
        for(var k in o)
            if(new RegExp("("+ k +")").test(format))
                format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
        return format;
    };

    /**
     * [ago 多少小时前、多少分钟前、多少秒前]
     * @return {[type]} [string]
     */
    Date.prototype.ago = function(){
        if(!arguments.length) return '';
        var arg = arguments,
            now=this.getTime(),
            past =  !isNaN(arg[0])?arg[0]:new Date(arg[0]).getTime(),
            diffValue = now - past,
            result='',
            minute = 1000 * 60,
            hour = minute * 60,
            day = hour * 24,
            halfamonth = day * 15,
            month = day * 30,
            year = month * 12,

            _year = diffValue/year,
            _month =diffValue/month,
            _week =diffValue/(7*day),
            _day =diffValue/day,
            _hour =diffValue/hour,
            _min =diffValue/minute;

        if(_year>=1) result=parseInt(_year) + "年前";
        else if(_month>=1) result=parseInt(_month) + "个月前";
        else if(_week>=1) result=parseInt(_week) + "周前";
        else if(_day>=1) result=parseInt(_day) +"天前";
        else if(_hour>=1) result=parseInt(_hour) +"个小时前";
        else if(_min>=1) result=parseInt(_min) +"分钟前";
        else result="刚刚";
        return result;
    }
}());

/***
 * bs https://github.com/lohas
 */
;(function(window){

    var _bs = {};

    _bs.revisePath = function(path){
        return path.replace(/\/{2,}/g,'\/')
    };
    _bs.noop = function(){},
        _bs.getCookie=function(name){
            var ret = new RegExp('(?:^|[^;])' + name + '=([^;]+)').exec(document.cookie);
            return ret ? decodeURIComponent(ret[1]) : '';
        };

    _bs.setCookie = function(name, value, expir){
        var cookie = name + '=' + encodeURIComponent(value);
        if(expir !== void 0){
            var now = new Date();
            now.setDate(now.getDate() + ~~expir);
            cookie += '; expires=' + now.toGMTString();
        }
        document.cookie = cookie;
    };

    _bs.delCookie = function(name){
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        var cval=_bs.getCookie(name);
        if(cval!=null) document.cookie= name + "="+cval+";expires="+exp.toGMTString();
    };

    /**
     * 设置缓存
     * @param name 名称
     * @param value 值
     */
    _bs.setCache = function(name,value){
        if(localStorage){
            localStorage.setItem(name,value);
        }else if(document.cookie){
            _bs.setCookie(name,value);
        }
    };
    /**
     * 得到缓存
     * @param cacheName
     */
    _bs.getCache = function(cacheName){
        var cacheValue = '';
        if(localStorage){
            cacheValue = localStorage.getItem(cacheName);
        }else if(document.cookie){
            cacheValue = _bs.getCookie(cacheName);
        }
        return cacheValue;
    };


    /**
     * 清除缓存
     * @param cacheName
     */
    _bs.cleanCache = function(cacheName){
        var cacheValue = '';
        if(localStorage){
            cacheValue = localStorage.removeItem(cacheName);
        }else if(document.cookie){
            cacheValue = _bs.getCookie(cacheName); //删除cookie
            _bs.delCookie(cacheValue);
        }
        return cacheValue;
    };

    /**
     * 清除所有缓存
     * @param cacheName
     */
    _bs.cleanAllCache = function(){
        if(localStorage){
            localStorage.clear();
        }else if(document.cookie){
            //清空cookie
            var keys=document.cookie.match(/[^ =;]+(?=\=)/g);
            if (keys) {
                for (var i = keys.length; i--;)
                    document.cookie=keys[i]+'=0;expires=' + new Date(0).toUTCString();
            }
        }
    };

    /**真实宽高**/
    _bs.getRelSize=  function($el,method){
        var $self = $($el);
        if(method=='width'||method=='height'){
            var size = $self.show()[method]();
            $self.hide();
            return size;
        }
    };
    //创建url
    _bs.createReqUrl = function(url,params){
        var s = url+'?';
        for(var key in params){
            s+=("&"+key+"="+params[key]);
        }
        s = s.substr(0, s.length - 1);
        return s;
    };

    //创建url
    _bs.getRelHref = function(){
        return location.pathname;
    };

    _bs.isEmpty = function(val){
        return !/\S/.test(val);
    };
    // 字母或者数字 6位以上
    _bs.isPwd = function(val){
      return /^\w+$/.test(val)&&val.length>=6;
    };
    _bs.is_weixn = function () {
        var ua = navigator.userAgent.toLowerCase();
        if (ua.match(/MicroMessenger/i) == "micromessenger") {
            return true;
        } else {
            return false;
        }
    };

    _bs.isNumber = function(val){
        return /^\d+$/.test(val);
    };

    _bs.isPhone = function (val) {
        if (val != '' && /^0?(13[0-9]|15[012356789]|17[0-9]|18[0-9]|14[0-9])[0-9]{8}$/.test(val)) {
            return true;
        }
        return false;
    };


    //日记上报
    _bs.log = function(data,leve){
        if(console){
            console.log(data);
        }
    };

    // 跳转
    _bs.goTo = function(href){
        //  check 是否 有父窗口
        if(window.top!=window.self){
            //
            var app =  bs.getCache("app");
            if(app=="true"){
                window.parent.goTo(href);
            }
        }else{
            location.href = href;
        }
    };

    // 创建一个frame closeCallBack 子窗口关闭函数
    _bs.createFullFrame = function(url,closeCallBack){
        var $iframe = $('<iframe class="frameContent" id="contentFrame" name="contentFrame" frameborder="0" src="'+url+'"></iframe>');
        var $div = $("<div class='frameWarp' id='iframeScroll'></div>");
        $div.css({
            height:$(window).height()
        });
        $div.append($iframe);

        $(".bs-header,.bs-warp,.bs-footer").hide();

        $("body").append($div);

        window.closeCallBack = closeCallBack;//注册关闭窗口的回调
    };

    // 页面刷新
    _bs.reload = function(){
        //  check 是否 有父窗口
        if(window.top!=window.self){
            //
            var app =  bs.getCache("app");
            if(app=="true"){
                window.parent.goTo(location.href);
            }
        }else{
            location.reload();
        }
    };

    /**
     * 截断字符  兼容 字母 数字 中文 等宽
     * @param input
     * @param number
     * @param type
     */
    _bs.subBtyesStr  = function(input, length) {
        if(!input){
            return "";
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
    };
    /**
     *
     * @param url  模板地址
     * @param ops  编辑参数
     * {
     *  form：#yourFormId,
     *  type： 1, // 窗口模式0（信息框，默认）1（页面层）2（iframe层）默认 1
     *  area:窗口大小,
     *  maxmin:是否有最大最小框,
     *  btn:按钮
     * }
     * @param cb   成功后的回调函数
     */
    _bs.editForm = function(url,ops,cb){
        var title = "编辑";
        if(url&&url.lastIndexOf("0")==url.length-1){
            // 新增
            title = "新增";
        }
        var enableValidate = ops.validate||true; // 是否开启验证

        function _yes($form){
            if(typeof ops.beforeSubmit==='function'){
                ops.beforeSubmit  = ops.beforeSubmit($form);
            }else{
                ops.beforeSubmit  = true;
            }
            if( ops.beforeSubmit ){
                $form.trigger('submit');
            }
        };
        function _cancel(){

        };
        function _success($form){

            // 开启验证
            if(enableValidate){
                $form.validator({
                    onValid: function (validity) {
                        $(validity.field).closest('.am-form-group').find('.am-alert').hide();
                    },

                    onInValid: function (validity) {
                        var $field = $(validity.field);
                        var $group = $field.closest('.am-form-group');
                        var $alert = $group.find('.am-alert');
                        // 使用自定义的提示信息 或 插件内置的提示信息
                        var msg = $field.data('validationMessage') || this.getValidationMessage(validity);

                        if (!$alert.length) {
                            $alert = $('<div class="am-alert am-alert-danger"></div>').hide().
                            appendTo($group);
                        }

                        $alert.html(msg).show();
                    }
                });
            }

            // ajaxForm
            $form.ajaxForm(function(data,state,req,formEl) {
                // 关闭窗口
                if(window.editFormIndex){
                    layer.close(editFormIndex);
                }
                if(window.iframeFormId){
                    // 处理iframe
                    layer.close(iframeFormId);
                }

                if(state==="success"&&data.success==='true'){
                    // 更新成功
                    console.info("更新成功");
                    layer.alert('保存成功',{icon: 1},function(index){
                        (cb||$.noop).call(formEl,data,req);
                        layer.close(index);
                    });
                }else{
                    // 更新失败
                    layer.alert('保存失败',{icon: 2});
                    console.info("更新失败");
                    console.error(arguments);
                }
            });
        };

        if(ops.type===2){
            // 处理 iframe
            window.iframeFormId = layer.open({
                type:2,
                title:title,
                content:url,  // 后台内容
                btn: ops.btn||['保存','取消'],
                area: ops.area||['60%','90%'],
                maxmin:ops.maxmin||'true',
                yes:function(layero, index){
                    var body = $($(index).find('iframe')[0].contentWindow.document);// 触发子窗口 form
                    var $form =$(body).find(ops.form);
                    _yes($form);
                },
                cancel:function(){
                    // 取消
                    _cancel();
                },
                success:function(layero, index){
                    var body = layer.getChildFrame('body', index);//
                    var $form =$(body).find(ops.form);
                    _success($form);
                }
            });
        }else{
            if(url===''||!url||url===undefined){
                // 页面模式 非窗口模式
                var $form = $(ops.form);
                _success($form);
            }else{

                // 普通窗口
                $.get(url,{"dataType":"html"},function(html){
                    window.editFormIndex = layer.open({
                        type:ops.type||1,
                        title:title,
                        content:html,  // 后台内容
                        btn: ops.btn||['保存','取消'],
                        area: ops.area||['60%','90%'],
                        maxmin:ops.maxmin||'true',
                        yes:function(){
                            // 确定
                            var $form = $(ops.form);
                            _yes($form);
                        },
                        cancel:function(){
                            // 取消
                            _cancel();
                        },
                        success:function(){
                            var $form = $(ops.form);
                            _success($form);
                        }
                    });
                });
            }

        }

    };


    /**
     * 删除某一个选项
     * @param url
     * @param cb
     */
    _bs.delOneOnWin = function(url,cb){
        layer.confirm('确定删除?', {icon: 3, title:'提示'}, function(index){
            layer.close(index);
            //do something
            $.getJSON(url,function(data){
                if(data.success==='true'){
                    layer.alert('删除成功', function(index){
                        //do something
                        layer.close(index);
                        (cb||$.noop).call(data);
                    });
                }else{
                    layer.alert(data.data, function(index){
                        //do something
                        layer.close(index);
                    });
                }
            });
        });
    };

    /**
     *  file ajax upload 后台文件异步上传 监听程式
     *  使用前指定file name 为 file
     * @param $jqEl input file jq 元素
     * @param model 上传到指定的模块文件
     * @param enableDelOld  是否删除老文件 （默认删除）
     */
    _bs.bkUploadFileListener =  function($jqEl,model,enableDelOld){
        var _oldPath = "";
        var $hiddenVal = $jqEl.next();
        var $img = $jqEl.parent().prev().find("img");
        enableDelOld = enableDelOld?enableDelOld:true;
        $jqEl.ajaxfileupload({
            'action' : '/backstage/upload',
            'onComplete' : function(uploadData) {
                var result =  JSON.parse($(uploadData).html());
                if(result.success=='true'){
                    var path  = result.data.path;
                    // 设置图片路径值
                    $hiddenVal.val(path);
                    // 图片预览
                    $img.attr("src",path);
                }else{
                    console.info(uploadData);
                    if(uploadData.message){
                        alert(uploadData.message);
                    }else{
                        alert(result.data);
                    }
                }
            },
            'onStart' : function() {
                if(enableDelOld){
                    _oldPath  =  $hiddenVal.val();
                }
            },
            'params':{'model':model,'oldPath':_oldPath}
        });
    };

    /**
     * 表格数据组件
     */
    _bs.dataTable = function(url,ops){
        var $table = (ops.tableElem&&$(ops.tableElem))||$("#listTable"),
            $searchForm = (ops.searchElem&&$(ops.searchElem))||$("#searchForm"),
            dt = $.extend({         // 表格配置bProcessing: true,
                bProcessing: true,
                bServerSide: true,
                responsive: true,
                serverSide: true,
                searching: false,
                pagingType: "full_numbers",
                ext:{
                    sErrMode:"console"
                },
                //lengthMenu: [ [-1,10, 25, 50], ["All",10, 25, 50] ], //自定义每页数量的时候,下拉菜单的选项
                ajax: {
                    url: url,
                    data: function (data) {
                        var searchFormData = $searchForm.serializeArray();
                        var resultData = {
                            dataTablesReqPar: JSON.stringify(data)
                        };
                        // 附加搜索条件
                        for (var i = 0; i < searchFormData.length; i++) {
                            var par = searchFormData[i];
                            resultData[par['name']] = par['value'];
                        }
                        return resultData;
                    }
                },
            },ops.dt);
            ;
        var dataTable = $table.DataTable(dt);

        var fixedHeader = ops.fixedHeader===undefined?true:ops.fixedHeader;
        // 固定表头
        if(fixedHeader){
            $table.on('init.dt', function () {
                new FixedHeader(dataTable);
            });
        }

        // list view

        // event
        (function(){

            //搜索
            $searchForm.submit(function () {
                dataTable.draw();
                return false;
            });

            // 快速筛选
            $searchForm.on("change","select",function(){
                dataTable.draw();
            });

            //重置搜索
            $searchForm.on("click",".btn-reset",function(){
                $searchForm[0].reset();
                dataTable.draw();
                return false;
            });
        })();
        return dataTable;
    },

    window.bs= _bs;
})(window);


var dataTableTools={
    createColumnsEditAndDel:function(dataId){
        var html = '<div class="bs-action" data-id="'+dataId+'"><div class="am-btn-group am-btn-group-xs"><button onclick="" class="am-btn am-btn-default am-btn-xs am-text-secondary editBtn"><span class="am-icon-pencil-square-o"></span>编辑</button><button data-href="" class="am-btn am-btn-default am-btn-xs am-text-danger am-hide-sm-only delBtn"><span class="am-icon-trash-o"></span>删除</button></div></div>'
        return html;
    }
};

// 模板方法的拓展
if(window.template){
    /**
     * 拓展 artTemplate help方法
     */

    /**
     * 对日期进行格式化，
     * @param date 要格式化的日期
     * @param format 进行格式化的模式字符串
     *     支持的模式字母有：
     *     y:年,
     *     M:年中的月份(1-12),
     *     d:月份中的天(1-31),
     *     h:小时(0-23),
     *     m:分(0-59),
     *     s:秒(0-59),
     *     S:毫秒(0-999),
     *     q:季度(1-4)
     * @return String
     * @author yanis.wang
     * @see	http://yaniswang.com/frontend/2013/02/16/dateformat-performance/
     */
    template.helper('dateFormat', function (date, format) {

        date = new Date(date);

        var map = {
            "M": date.getMonth() + 1, //月份
            "d": date.getDate(), //日
            "h": date.getHours(), //小时
            "m": date.getMinutes(), //分
            "s": date.getSeconds(), //秒
            "q": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds() //毫秒
        };
        format = format.replace(/([yMdhmsqS])+/g, function(all, t){
            var v = map[t];
            if(v !== undefined){
                if(all.length > 1){
                    v = '0' + v;
                    v = v.substr(v.length-2);
                }
                return v;
            }
            else if(t === 'y'){
                return (date.getFullYear() + '').substr(4 - all.length);
            }
            return all;
        });
        return format;
    });

    /**
     * 订单状态
     * data
     * orderType 订单类型
     */
    template.helper('orderState', function (data) {
        switch (data+''){
            case '-2':
                return "已退款";
            case '-1':
                return "待退款";
            case '0':
                return "已取消";
            case '1':
                return "已确认";
            case '2':
                return "待支付";
            case '3':
                return "支付中";
            case '4':
                return "待咨询";
            case '5':
                return "服务中";
            case '6':
                return "待点评";
            case '7':
                return "已点评";
            default :
                return "未知状态";
        }
    });

    /**
     * 订单类型
     * data
     */
    template.helper('getOrderType', function (data) {
        switch (Number(data)){
            case 1:
                return "电话订单";
            case 2:
                return "咨询订单";
            default:
                return "默认类型";
        }
    });
    /**
     * 服务器图片
     * data
     */
    template.helper('serverImg', function (data,defaultImgType) {
        if(data&&data!=""){
            return EVA.SERV_ROOT_DIR+"/"+data;
        }else{
            switch (defaultImgType){
                case '1':
                    return EVA.SERV_ROOT_DIR+"/images/no_user";
                case '2':
                    return EVA.SERV_ROOT_DIR+"/images/no_doctor";
                default :
                    return EVA.SERV_ROOT_DIR+"/images/img_no_pic";
            }
        }
    });

    /**
     * int to date
     */
    template.helper("getDateOnTimestmp",function(data){
        if(data){
            return new Date(data).format("yyyy-MM-dd hh:mm:ss.S");
        }
    });


    /**
     * int to date
     */
    template.helper("getReadStatus",function(data){
        if(data&&data==1){
            return "已读";
        }else{
            return "未读";
        }
    });

    /**
     * int to date
     */
    template.helper("getReadAccept",function(data){
        if(data&&data=='1'){
            return "已采纳";
        }else{
            return "未采纳";
        }
    });
}


// jquery 的拓展
if(jQuery){
    ;(function($){
        if ($.AMUI && $.AMUI.validator) {
            $.AMUI.validator.patterns.mobile = /^\s*1\d{10}\s*$/;
        }
    }(jQuery));
}