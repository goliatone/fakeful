var fakeit = require('./index');
var fs = require('fs');

var template = '[{{#repeat 22}}{ "name": "{{name}}", "address": "{{streetAddress}}"}{{/repeat}}]';

template = fs.readFileSync('./users.jtpl', "utf8");
var result = fakeit.parse(template);
var out = JSON.parse(result);

console.log(result);