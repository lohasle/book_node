/**
 * Created by fule https:github.com/lohasle on 2015/12/5 0005.
 */

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


/**轮播插件**/
;(function($){
    $.qslider = function(ops){
        var _ops = $.extend({},{
            auto : true,
            contentSelecter:'div', /***幻灯片*/
            thumbSelecter:'thumb',/**操作按钮 当带有前缀&时 为全局body内搜索**/
            onContentCss:'curSilder',
            onThumbCss:'curThumb',
            easing:'swing',
            model:'fade', /**淡入淡出模式**/
            duration : 300,
            delay : 2000,
            prevBtn:null,//上一张的按钮
            nextBtn:null,//下一张的按钮
            onbeforeplay : function(){return true},	//此时如果return false; 将会停止此次动画
            ondone : $.noop,
            living : $.noop,
        },ops),self = this,silder = {},len = self.find(_ops.contentSelecter).length,autoPlay = _ops.auto;


        //查找元素
        function queryDom(selecter){
            if(selecter.indexOf('&')>-1){
                return $(selecter.split('&')[1]);
            }else{
                return self.find(selecter);
            }
        }

        function _changeCss(elem1,elem2){
            elem2.addClass(_ops.onContentCss).siblings().removeClass(_ops.onContentCss);
            queryDom(_ops.thumbSelecter+':eq('+elem2.prevAll().length+')').addClass(_ops.onThumbCss).siblings().removeClass(_ops.onThumbCss);
        }

        function _animate(elem1,elem2,cb){
            if(elem1.is(":animated")||elem2.is(":animated")){
                return false;//防止点击过快
            }
            //播放之前的动作
            if(_ops.onbeforeplay.call(self,elem1,elem2)===false){
                autoPlay = false;
            }

            if(_ops.model==='fade'){
                //淡入淡出模式
                elem1.stop(false,true).animate({
                    opacity: 'hide'
                },_ops.duration,_ops.easing,function(){
                    _changeCss(elem1,elem2);
                    elem2.stop(false,true).animate({
                        opacity: 'show'
                    },_ops.duration,_ops.easing,function(){
                        (cb||$.noop).call();
                        _ops.ondone.call(self,elem1,elem2);//播放之后的动作
                    });
                    _ops.living.call(self,elem1,elem2);//正在播放
                });
            }else if(_ops.model==='vScroll'){
                //竖直滚动模式
                var _mH = elem2.height()*(elem2.prevAll().length);
                _changeCss(elem1,elem2);
                self.stop(false,true).animate({
                    'margin-top':-_mH
                },_ops.duration,_ops.easing,function(){
                    (cb||$.noop).call();
                    _ops.ondone.call(self,elem1,elem2);//播放之后的动作
                });
                _ops.living.call(self,elem1,elem2);//正在播放
                elem2.stop(false,true).animate({
                    opacity: 'show'
                },_ops.duration,_ops.easing);
            }
        }

        silder.getCurrent = function(){
            var cur =  queryDom(_ops.contentSelecter+'.'+_ops.onContentCss),
                index = (cur.length===0)?0:cur.prevAll().length;
            return queryDom(_ops.contentSelecter+':eq('+index+')');
        };
        silder.next = function(){
            var cur = silder.getCurrent();
            _animate(cur,cur.prevAll().length===len-1?self.find(_ops.contentSelecter+':first'):cur.next());
        };
        silder.prev = function(){
            var cur = silder.getCurrent();
            _animate(cur,cur.prevAll().length===0?self.find(_ops.contentSelecter+':last'):cur.prev());
        };
        silder.autoPlay = function(){
            self._timer = setInterval(function(){
                if(autoPlay){
                    silder.next();
                }else{
                    clearInterval(self._timer);
                }
            },_ops.delay);
        };

        //init
        (function(){

            //dom
            if(_ops.model==='fade'){

                //淡入淡出
                //父div 和silder 等宽高
                self.css({
                    'position':'relative'
                });
                self.find(_ops.contentSelecter).css({
                    'width':self.width(),
                    'height':self.height()
                });
            }else if(_ops.model==='vScroll'){
                //上下滚动
                var uHeight = queryDom(_ops.contentSelecter+":eq(0)").height();
                self.css({
                    'height':(queryDom(_ops.contentSelecter).length+1)*uHeight,
                    'overflow-y':'hidden',
                    'margin-top':'0'
                });
                queryDom(_ops.contentSelecter).show();
            }

            if(_ops.prevBtn){
                queryDom(_ops.prevBtn).hide();
            }
            if(_ops.nextBtn){
                queryDom(_ops.nextBtn).hide();
            }

            //action
            if(autoPlay){
                silder.autoPlay();
            }
            //event
            var $thumb = queryDom(_ops.thumbSelecter);
            if($thumb.length>0){
                queryDom(_ops.thumbSelecter).mouseenter(function(){
                    var thisIndex = $(this).prevAll().length,
                        elem1 = silder.getCurrent(),
                        elem2 = queryDom(_ops.contentSelecter + ':eq(' + thisIndex + ')');
                    clearInterval(self._timer);
                    autoPlay = false;
                    if(elem1.prevAll().length!==elem2.prevAll().length){
                        _animate(elem1,elem2);
                    }
                });

                $thumb.mouseleave(function() {
                    autoPlay = true;
                    if(autoPlay){
                        silder.autoPlay();
                    }
                });
            }

            //按钮操作
            if(_ops.prevBtn){
                self.on('mouseenter',function(){
                    queryDom(_ops.prevBtn).fadeIn(200);
                }).on('mouseleave',function(){
                    queryDom(_ops.prevBtn).fadeOut(200);
                });
                self.on('click',_ops.prevBtn,function(){
                    silder.prev();
                });
            }
            if(_ops.nextBtn){
                self.on('mouseenter',function(){
                    queryDom(_ops.nextBtn).fadeIn(200);
                }).on('mouseleave',function(){
                    queryDom(_ops.nextBtn).fadeOut(200);
                });
                self.on('click',_ops.nextBtn,function(){
                    silder.next();
                });
            }
        }());



        return self;
    };
    $.fn.qslider = function(ops){
        return this.each(function(){
            $.qslider.call($(this),ops);
        });
    }
})(jQuery,window);

;(function(window,$){
    // 随机N-M整数
    function randomNum(minNum, maxNum) {
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
    }
    function isPhone(str){
        return str&&/^1[0-9][0-9]\d{8}$/.test(str);
    }

    /**
     * 截断字符  兼容 字母 数字 中文 等宽
     * @param input
     * @param number
     * @param type
     */
    function subBtyesStr (input, length) {
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
    }
    var fs = {
        randomNum:randomNum,
        isPhone:isPhone,
        subBtyesStr:subBtyesStr,
        strNotNull:function(s){
            return  s&&s!==undefined&& (typeof s=='string')&& $.trim(s)!='';
        }
    };
    window.fs = fs;
})(window,jQuery);