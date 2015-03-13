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
var pg = require('pg');
var conString = "postgres://postgres:1234@localhost/SurveyMania";
var secret = 'secret-df4b8fn5fn6f1vw1cxbuthf4g4n7dty87ng41nsrg35';

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
app.use('/app', expressJwt({secret: secret}));

app
.post('/login', function (req, res) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.setHeader('Accept', 'application/json');
    var email = req.body.email;
    var password = req.body.password;
    //verifying in database that login informations are correct
    pg.connect(conString, function(err, client, done) {
        if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error fetching client from pool"});
        else {
            var query = 'SELECT * FROM surveymania.users INNER JOIN surveymania.user_types ON surveymania.users.user_type = user_types.id WHERE surveymania.users.email = \'' + email + '\' AND surveymania.users.password = \'' + password + '\'';
            client.query(query, function(err, result) {
                done();
                if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                else if (result.rows.length) {
                    console.log(result.rows);
                    var profile = {
                        firstname: result.rows[0].name,
                        lastname: result.rows[0].lastname,
                        email: result.rows[0].email,
                        id: result.rows[0].id,
                        usertype: result.rows[0].type_name,
                        organization: result.rows[0].user_organization
                    };
                    // We are sending the profile inside the token
                    var token = jwt.sign(profile, secret, { expiresInMinutes: 30*24*60 });
                    res.json({token: token});
                }
                else res.json({code: 200, error: "Unauthorized", message: "No account found with given email and password"});
                client.end();
            });
        }
    });
})

.get('/login', function (req, res) {
    res.setHeader("Content-Type", "text/html");
    res.render('partials/login');
})

.get('/signin', function (req, res) {
    res.setHeader("Content-Type", "text/html");
    res.render('partials/signin');
})

.get('/app/account', function (req, res) {
    console.log(req.user);
    res.setHeader("Content-Type", "text/html");
    res.render('partials/account', {user: req.user});
})

.get('/401-unauthorized', function (req, res) {
    res.setHeader("Content-Type", "text/html");
    res.render('401-unauthorized');
})

// route to get index page
.get('/', function (req, res) {
    res.setHeader("Content-Type", "text/html");
    res.render('index');
})

// route to get static files
.use(express.static(__dirname + '/app'))

// redirecting to index for any other route
.use(function (req, res) {
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
