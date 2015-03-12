// getting required modules
var express = require('express');
var https = require('https');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var pem = require('pem');
var compress = require('compression');
var bodyParser = require('body-parser');
var moment = require('moment');
var request = require('request');
var fs = require('fs');

// creating a new app with express framework
var app = express();

app.set('view engine', 'ejs');
app.enable('trust proxy');

// needed to compress all our responses
app.use(compress());
// needed to parse requests body (for example in post requests)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// needed to protect / routes with JWT
app.use('/', expressJwt({secret: 'secret-df4b8fn5fn6f1vw1cxbuthf4g4n7dty87ng41nsrg35'}));

app
// route to get the partials views (rendered with ejs)
.get('/partials/:partial', function (req, res, next) {
    var partial = req.params.partial;
    res.render('partials/' + partial);
})

// route to get index page
.get('/', function (req, res, next) {
    res.render('index');
})

// route to get static files
.use(express.static(__dirname + '/app'))

// redirecting to index for any other route
.use(function (req, res, next) {
    res.redirect('/');
});

/* setting ssl certificate to create https server
pem.createCertificate({days:365, selfSigned:true}, function (err, keys) {
    https.createServer({key: keys.serviceKey, cert: keys.certificate}, app).listen(4300, 'localhost');
    pem.getPublicKey(keys.certificate, function (err, key) {
        console.log(keys.serviceKey);
        console.log(keys.certificate);
        console.log(key);
    });
    console.log('HTTPS Server running at https://localhost:4300/');
});*/

app.listen(1337, 'localhost');

console.log('HTTP Server running at http://localhost:1337/');
