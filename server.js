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
var nodemailer = require('nodemailer');
var pg = require('pg');
var conString = "postgres://postgres:1234@localhost/SurveyMania";
var secret = 'secret-df4b8fn5fn6f1vw1cxbuthf4g4n7dty87ng41nsrg35';

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'surveymania.plic@gmail.com',
        pass: 'surveymania4242'
    }
});

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
            var query = 'SELECT surveymania.users.id AS userid, * FROM surveymania.users INNER JOIN surveymania.user_types ON surveymania.users.user_type = user_types.id WHERE surveymania.users.email = \'' + email + '\' AND surveymania.users.password = \'' + password + '\'';
            client.query(query, function(err, result) {
                done();
                if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                else if (result.rows.length) {
                    console.log(result.rows);
                    var profile = {
                        firstname: result.rows[0].name,
                        lastname: result.rows[0].lastname,
                        email: result.rows[0].email,
                        id: result.rows[0].userid,
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

.post('/signup', function (req, res) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.setHeader('Accept', 'application/json');
    var inviter = null;
    var error = false;

    pg.connect(conString, function(err, client, done) {
        if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error fetching client from pool"});
        else {
            var query = 'SELECT * FROM surveymania.users WHERE surveymania.users.email = \'' + req.body.email + '\'';
            client.query(query, function(err, result) {
                done();
                if(err) {
                    res.status(500).json({code: 500, error: "Internal server error", message: "Error running query verifying email"});
                    client.end();
                }
                else if (result.rows.length) {
                    res.status(200).json({code: 200, error: "Conflict", message: "Email already used for an existing account"});
                    client.end();
                }
                else {
                    if (req.body.inviter != null) {
                        var query = 'SELECT * FROM surveymania.users WHERE surveymania.users.email = \'' + req.body.inviter + '\'';
                        client.query(query, function(err, result) {
                            done();
                            if(err) error = true;
                            else if (result.rows.length) inviter = result.rows[0];
                        });
                    }
                    if (error == true) {
                        res.status(500).json({code: 500, error: "Internal server error", message: "Error running query verifying inviter"});
                        client.end();
                    }
                    else {
                        var dateNow = '\'' + moment().format("YYYY-MM-DD hh:mm:ss") + '\'';
                        var email = '\'' + req.body.email + '\'';
                        var password = '\'' + req.body.password + '\'';
                        var firstname = '\'' + req.body.firstname + '\'';
                        var lastname = '\'' + req.body.lastname + '\'';
                        var telephone = (req.body.phone == null) ? 'NULL' : '\'' + req.body.phone + '\'';
                        var adress = (req.body.adress == null) ? 'NULL' : '\'' + req.body.adress + '\'';
                        var inviteDT = (inviter == null) ? 'NULL' : dateNow;
                        var inviterID = (inviter == null) ? 'NULL' : inviter.id;
                        var query = 'INSERT INTO surveymania.users(email, password, user_type, name, lastname, telephone, adress, creation_dt, last_dt, invite_dt, inviter_id, points, verified) ' +
                            'VALUES (' + email + ', ' + password + ', 1, ' + firstname + ', ' + lastname + ', ' + telephone + ', ' + adress + ', ' +  dateNow + ', ' + dateNow + ', ' + inviteDT + ', ' + inviterID + ', 50, false)';
                        client.query(query, function(err, result) {
                            done();
                            if(err) {
                                res.status(500).json({code: 500, error: "Internal server error", message: "Error running query inserting new user"});
                                client.end();
                            }
                            else {
                                var mailOptions = {
                                    from: 'webmaster@surveymania.com',
                                    to: req.body.email,
                                    subject: 'Signin account verification',
                                    html: 'Please verify your account email to finish your <b>SurveyMania</b> inscription.<br>Thank you and enjoy our services.<br><br>' +
                                          'SurveyMania Team'
                                };
                                transporter.sendMail(mailOptions, function(error, info){
                                    if(error) console.log(error);
                                    else console.log('Message sent: ' + info.response);
                                });
                                if (inviter != null) {
                                    var newpoints = inviter.points + 500;
                                    var query = 'UPDATE surveymania.users SET points=' + newpoints + ' WHERE id=' + inviter.id;
                                    client.query(query, function(err, result) {
                                        done();
                                        if(!err) {
                                            var mailOptions = {
                                                from: 'webmaster@surveymania.com',
                                                to: inviter.email,
                                                subject: 'Someone has just named you as his inviter',
                                                html: req.body.firstname + ' ' + req.body.lastname + ' (' + req.body.email + ') has just named you as his inviter!<br>' +
                                                      'This action made you win 500 points and you have now a total of ' + newpoints + ' points.<br>' +
                                                      'Plus you unlocked a new achievement! You can see the details on your account.<br>' +
                                                      'Congratulations and thank you very much for your activity, we hope you enjoy our services :D<br><br>' +
                                                      'SurveyMania Team'
                                            };
                                            transporter.sendMail(mailOptions, function(error, info){
                                                if(error) console.log(error);
                                                else console.log('Message sent: ' + info.response);
                                            });
                                        }
                                        res.status(200).json({code: 200, message: "Account successfully created"});
                                        client.end();
                                    });
                                }
                                else {
                                    res.status(200).json({code: 200, message: "Account successfully created"});
                                    client.end();
                                }
                            }
                        });
                    }
                }
            });
        }
    });
})

.get('/signup', function (req, res) {
    res.setHeader("Content-Type", "text/html");
    res.render('partials/signup');
})

.get('/app/account', function (req, res) {
    console.log(req.user);
    var achvmnts = '';
       pg.connect(conString, function(err, client, done) {
            var query = 'SELECT * FROM surveymania.user_achievements INNER JOIN surveymania.achievements ON surveymania.user_achievements.achiev_id = surveymania.achievements.id WHERE surveymania.user_achievements.user_id=3';
            client.query(query, function(err, result) {
                done();
                if (result.rows.length) {
                    achvmnts = result.rows; 
                }
                client.end();
                console.log(achvmnts);
                res.setHeader("Content-Type", "text/html");
                res.render('partials/account', {user: req.user, achievements: achvmnts});
            });
        
    });
})

.get('/401-unauthorized', function (req, res) {
    res.setHeader("Content-Type", "text/html");
    res.render('401-unauthorized');
})

.get('/404-notfound', function (req, res) {
    res.setHeader("Content-Type", "text/html");
    res.render('404-notfound');
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
    res.setHeader("Content-Type", "text/html");
    res.status(404).render('404-notfound');
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
