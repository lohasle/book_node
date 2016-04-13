var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var fs = require('fs');
var ueditor = require("ueditor"); // ueditor

var redis = require('redis');
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var flash = require('express-flash');
var passport = require('passport');
var helmet = require('helmet');


mongoose.connect('mongodb://localhost/weizy_book');// mongodb连接


/** swig begin **/
var app = require('express')(),
    swig = require('swig'),
    people;

// This is where all the magic happens!
app.engine('html', swig.renderFile);

app.set('view engine', 'html');
app.set('views', __dirname + '/views');

// Swig will cache templates for you, but you can disable
// that and use Express's caching instead, if you like:
app.set('view cache', false);
// To disable Swig's cache, do the following:
swig.setDefaults({ cache: false });
// NOTE: You should always cache templates in a production environment.
// Don't leave both of these to `false` in production!
var SwigFilterExt = require('./app/utils/swigFilterExt');
SwigFilterExt.register(swig);// 注册自定义过滤器
/** swig end **/



// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(helmet()); // xss
/** 认证 begin **/

// session  passport
app.use(session({
  secret: 'hot.weizy.cn',
  store: new redisStore({host: '127.0.0.1', port: 6379,ttl :60*60,pass:'tobetcmno1'}),
  saveUninitialized: false,
  resave: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


app.get('/bs-login', function (req, res, next) {
  res.render('backstage/login',{
      "url":"/bs-login"
  });
});

// 登出
app.get('/bs-logout', function (req, res, next) {
  delete  req.session.user;
  res.redirect('/bs-login/');
});

app.post('/bs-login', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  if(username==='admin'&&password==='weizy2015'){
    req.session.user = {username:"admin",password:"weizy2015"};
    //
    res.json({"success":"true","data":"登录成功"});
  }else{
    // 验证成功则调用此回调函数
    res.json({"success":"false","data":"用户名或密码错误"});
  }

});

app.get('/backstage**', function(req, res, next) {
  if(req.session.user!=null){
    next();
  }else{
    res.redirect('/bs-login/');
  }
});

/** 认证 end **/

/**  路由模块配置 **/

/** 网站前端 **/
app.use('/', require('./routes/front/index'));
app.use('/lecturer',require('./routes/front/lecturer'));
app.use('/course', require('./routes/front/course'));
app.use('/review', require('./routes/front/review'));
app.use('/search', require('./routes/front/search'));

/** 后台管理 **/
app.use('/backstage', require('./routes/backstage/index'));
app.use('/backstage/course', require('./routes/backstage/course'));
app.use('/backstage/lecturer', require('./routes/backstage/lecturer'));

/** app接口 **/
app.use('/app', require('./routes/app/index'));

/** 路由end **/

/** ueditor **/

app.use("/ueditor/ue", ueditor(path.join(__dirname, 'public'), function(req, res, next) {
  // ueditor 客户发起上传图片请求
  if(req.query.action === 'uploadimage'){
    var foo = req.ueditor;
    var date = new Date();
    var imgname = req.ueditor.filename;

    var img_url = '/images/ueditor/';
    res.ue_up(img_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
  }
  //  客户端发起图片列表请求
  else if (req.query.action === 'listimage'){
    var dir_url = '/images/ueditor/';
    res.ue_list(dir_url);  // 客户端会列出 dir_url 目录下的所有图片
  }
  // 客户端发起其它请求
  else {

    res.setHeader('Content-Type', 'application/json');
    res.redirect('/ueditor/ueditor.config.json')
  }}));

/** ueditor end **/



// 读取 全站SEO信息
var Sysconfig = require('./app/models/sysconfig.schema.js');
Sysconfig.findOne({"type":"site_seo"}).then(function(data){
  // 默认SEO内容
  data = data?data.value:JSON.stringify({
    title:"node_cms",
    keywords:"node_cms",
    description:"node_cms"
  });
  try {
    global['seomate'] = JSON.parse(data);
  }catch (e){
    console.error(e);
  }
});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace

// error handler  crsf
app.use(function (err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN') return next(err)

  // handle CSRF token errors here
  res.status(403)
  res.send('form tampered with')
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });

  app.use(logger('common', { skip: function(req, res) { return res.statusCode < 400 }, stream: __dirname + '/weizy_book.log' }));

}else{
  app.use(logger('dev'));
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  /*res.render('error', {
    message: err.message,
    error: {}
  });*/
  res.json({
    message: err.message,
    error: err
  });
});




process.on('uncaughtException', function (err) {
  console.log('Caught exception: ', err);
});

module.exports = app;
