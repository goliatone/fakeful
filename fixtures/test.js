var fakeit = require('./index');
var template = '[{{#repeat 22}}{ "name": "{{name}}", "address": "{{streetAddress}}"}{{/repeat}}]';
var result = fakeit.parse(template);
var out = JSON.parse(result);

console.log(result);