/**
 * Created by fule https:github.com/lohasle on 2016/1/5 0005
 */
    "use strict";
var assert = require("assert");
var RedisUtil = require('../app/utils/redisUtil.js');
var request = require('request');
var supertest = require('supertest');
var async = require('async');
var jwt = require('jwt-simple');


function testQnUp() {
    console.info("测试七牛云上传图片");
    assert.equal(true, true);
}

//
describe(' token create ', function () {
    it('create', function () {
        var secret = new Buffer("1234","base64").toString();
        var token ={
            "body": {
                "uid": "123",
                "role": "user",
                "uname": "呵呵",
                "uhead": "upload/img.png"
            },
            "header": {
                "typ": "jwt",
                "alg": "HS512",
                "avs": "1.3.0",
                "ua": "android"
            },
            "signature": "GeuaAvlsqax6SO2-a2ysltJBON4iM3GN4fM4eL-wd6FcsVubAD-_9sTWbwGkHdChm0oqRGO7Fc9MEQUfPvDR9g"
        };
        var decoded = jwt.encode(token, secret);
        console.info(decoded);
    });
});

// 测试jwt
describe('test jwt', function () {
    it('jwt', function () {

        let secret = "1234";
        let token = "eyJ0eXAiOiJqd3QiLCJ1YSI6ImFuZHJvaWQiLCJhbGciOiJIUzUxMiIsImF2cyI6IjEuMy4wIn0.eyJ1bmFtZSI6Iua1i-ivlSIsInVoZWFkIjoidXBsb2FkL2ltZy5qcGciLCJ1c2VySWQiOiIxMjMifQ.15h08YNuRYHsWQUGub_O2E1xsNWZKa6dvWFPYLOmbSm304-NyryP_9jO0rGHnOQ0BjCp5EvOZAXeKqMpWCSgnw";

        let arr = token.split(".");
        let head =JSON.parse( new Buffer(arr[0],"base64").toString());
        let alg =head['alg'];

        // decode
        var decoded = jwt.decode(token, secret,alg);
        console.info(head);
        console.log(decoded); //=> { foo: 'bar' }
    });
});


