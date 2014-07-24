var fakeit = require('./index');
var fs = require('fs');

var template = '[{{#repeat 22}}{ "name": "{{findName}}", "handle":"{{userName}}", "address": "{{streetAddress}}", "phone":"{{phoneNumber}}", "company":"{{companyName}}", "img":"{{avatar}}", "bio": "{{sentences 3}}" }{{/repeat}}]';
template = fs.readFileSync('./fixtures/users.jtpl', "utf8");
var result = fakeit.parse(template);
// var out = JSON.parse(result);

console.log(result);