'use strict';

var tuxedo = require('tuxedo');
var router = require('express').Router();

var uploader = {};

var t = '['+
'{{#repeat 13}}'+
'{'+
'  "_id": "{{uid 32}}",'+
'  "_index": "{{autoIncrement}}",'+
'  "name": "{{findName}}",'+
'  "handle": "{{userName}}",'+
'  "address": "{{streetAddress}}",'+
'  "phone": "{{phoneNumber}}",'+
'  "company": "{{companyName}}",'+
'  "img": "{{avatar}}",'+
'  "bio": "{{sentences 3}}",'+
'  "created": "{{moment}}"'+
'}'+
'{{/repeat}}'+
']';

uploader.post = function(req, res) {
    // tuxedo.on('complete', function(result) {
    //     res.send(result);
    // });

    var template = req.param('template',t);
    var context = req.param('context', {});

    var result = tuxedo.parse(template, context);
    console.log(typeof result)
    console.log(result);
    result = JSON.parse(result);
    res.json(result);
};

var Routes = {
	using:'/tuxedo',
	routes:{
		'GET /create': uploader.post,
		'POST /create': uploader.post
	}
};

module.exports = Routes;