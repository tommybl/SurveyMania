// getting required modules
var express = require('express');
var https = require('https');
var mysql = require('mysql');
var pem = require('pem');
var session = require('express-session');
var MemoryStore = session.MemoryStore;
var compress = require('compression');
var bodyParser = require('body-parser');
var moment = require('moment');
var request = require('request');
var fs = require('fs');
var RateLimiter = require('limiter').RateLimiter;

// creating a new session store
var sessionStore = new MemoryStore();

// creating a new mysql pool for future database requests
/*var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'SurveyMania',
    connectionLimit: 1000
});*/

// creating a new app with express framework
var app = express();

app.set('view engine', 'ejs');
app.enable('trust proxy');
//app.set('trust proxy', false);

// needed to compress all our responses
app.use(compress());
// needed to parse requests body (for example in post requests)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// needed to manage sessions
app.use(session({store: sessionStore, secret: 'keyboard cat', resave: true, saveUninitialized: true, cookie: { path: '/', httpOnly: true, secure: false, maxAge: 365*24*60*60*1000}}));

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
