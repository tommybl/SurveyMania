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
var mkdirp = require('mkdirp');
var CryptoJS = require("crypto-js");
var nodemailer = require('nodemailer');
var generatePassword = require('password-generator');
var async = require('async');
var SurveyManiaURL = 'http://localhost:1337/';
var SurveyManiasecret = 'secret-df4b8fn5fn6f1vw1cxbuthf4g4n7dty87ng41nsrg35';
var pg = require('pg');
var conString = "postgres://postgres:1234@localhost/SurveyMania";
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/SurveyMania');
var mongodb = mongoose.connection;
mongodb.on('error', function () { console.log("Error connecting to mongodb"); process.exit(1);});
var MailVerifToken = null, PwdResetToken = null;
mongodb.once('open', function (callback) { 
    console.log("Successfully connected to mongodb");
    var MailVerifTokenSchema = mongoose.Schema({token: String, userid: Number});
    MailVerifToken = mongoose.model('MailVerifToken', MailVerifTokenSchema);
    var PwdResetTokenSchema = mongoose.Schema({token: String, userid: Number});
    PwdResetToken = mongoose.model('PwdResetToken', PwdResetTokenSchema);
    var EditMailTokenSchema = mongoose.Schema({token: String, userid: Number, usermail: String});
    EditMailToken = mongoose.model('EditMailToken', EditMailTokenSchema);
});

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'surveymania.plic@gmail.com',
        pass: 'surveymania4242'
    }
});

var JsonFormatter = {
    stringify: function (cipherParams) {
        return cipherParams.ciphertext.toString(CryptoJS.enc.Base64) + cipherParams.salt.toString();
    },

    parse: function (jsonStr) {
        var splitted = jsonStr.split("==");
        var cipherParams = CryptoJS.lib.CipherParams.create({
            ciphertext: CryptoJS.enc.Base64.parse(splitted[0] + "==")
        });

        cipherParams.salt = CryptoJS.enc.Hex.parse(splitted[1]);

        return cipherParams;
    }
};

// We need our own "html_special_chars" function
function escapeHtml(text) {
  var map = {
    '&': '\&',
    '<': '\<',
    '>': '\>',
    '"': '\"',
    "'": "\'\'"
  };

  return (text != null) ? text.replace(/[&<>"']/g, function(m) { return map[m]; }) : null;
}

// creating a new app with express framework
var app = express();

app.set('view engine', 'ejs');
app.enable('trust proxy');

// needed to compress all our responses
app.use(compress());
// needed to parse requests body (for example in post requests)
app.use(bodyParser.urlencoded({ extended: false, limit: '10000kb' }));
app.use(bodyParser.json({ limit: '10000kb' }));
// needed to protect / routes with JWT
app.use('/app', expressJwt({secret: SurveyManiasecret}));

app
.get('/home', function (req, res) {
    res.setHeader("Content-Type", "text/html");
    res.render('partials/home');
})

.get('/app/createSurvey', function (req, res) {
    if(req.user.usertypenumber != 3 && req.user.usertypenumber != 4) res.redirect('/401-unauthorized');
    res.setHeader("Content-Type", "text/html");
    res.render('partials/createSurvey');
})

.post('/app/account/admin/validate/survey', function (req, res) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.setHeader('Accept', 'application/json');
    if(req.user.usertypenumber != 3 && req.user.usertypenumber != 4) {res.status(401).json({code: 401, error: "Unauthorized", message: "Unauthorized"}); return;}
    var questions = req.body.list;
    var sections = req.body.sections;
    var name = (req.body.name == null || req.body.name == "") ? "Sondage" : escapeHtml(req.body.name);
    var points = (req.body.points == null || req.body.points == "") ? 100 : req.body.points;
    var instructions = (req.body.instructions == null || req.body.instructions == "") ? "NULL" : escapeHtml(req.body.instructions);
    var description = (req.body.description == null || req.body.description == "") ? "NULL" : escapeHtml(req.body.description);
    var category = req.body.category;
    var dateNow = escapeHtml(moment().format("YYYY-MM-DD HH:mm:ss"));
    console.log(name);
    console.log(points);
    console.log(instructions);
    console.log(description);
    console.log(category);
    console.log(sections);
    console.log(questions);

    pg.connect(conString, function(err, client, done) {
        if(err) {console.log("err1"); res.status(500).json({code: 500, error: "Internal server error", message: "Error fetching client from pool"});}
        else {
            var query = 'INSERT INTO surveymania.survey_headers(organization_id, category_id, theme_id, name, instructions, info, points, publied, publication_date) ' +
                        'VALUES (' + req.user.organization + ', ' + category + ', 1, \'' + name + '\', \'' + instructions + '\', \'' + description + '\', ' + points + ', FALSE, NULL) ' +
                        'RETURNING id';
            client.query(query, function(err, result) {
                done();
                if(err) {console.log("err2"); res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});}
                else {
                    var header_id = result.rows[0].id;
                    var section_index = 0;
                    async.eachSeries(questions,
                        function (s, callback) {
                            var section = s;
                            var query = 'INSERT INTO surveymania.survey_sections(header_id, title, required, section_order) ' +
                                        'VALUES (' + header_id + ', \'' + sections[section_index] + '\', TRUE, ' + (section_index+1) + ') ' +
                                        'RETURNING id';
                            client.query(query, function(err, result) {
                                done();
                                if(err) {console.log("err3"); res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});}
                                else {
                                    var section_id = result.rows[0].id;
                                    var question_index = 0;
                                    async.eachSeries(section,
                                        function (q, callback2) {
                                            var question = q;
                                            if (question.type == '0') {
                                                var query = 'INSERT INTO surveymania.questions(survey_section_id, input_type_id, description, question_order, multiple_answers) ' +
                                                            'VALUES (' + section_id + ', 5, \'' + escapeHtml(question.title) + '\', ' + (question_index+1) + ', FALSE) ' +
                                                            'RETURNING id';
                                                client.query(query, function(err, result) {
                                                    done();
                                                    if(err) {console.log("err4"); res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});}
                                                    else {
                                                        var question_id = result.rows[0].id;
                                                        question_index += 1;
                                                        callback2();
                                                    }
                                                });
                                            }
                                            else if (question.type == '1') {
                                                var query = 'INSERT INTO surveymania.questions(survey_section_id, input_type_id, description, question_order, multiple_answers) ' +
                                                            'VALUES (' + section_id + ', 1, \'' + escapeHtml(question.title) + '\', ' + (question_index+1) + ', FALSE) ' +
                                                            'RETURNING id';
                                                client.query(query, function(err, result) {
                                                    done();
                                                    if(err) {console.log("err5"); res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});}
                                                    else {
                                                        var question_id = result.rows[0].id;
                                                        var query = 'INSERT INTO surveymania.question_params(question_id, name, value_num) ' +
                                                                    'VALUES (' + question_id + ', \'max\', ' + question.maxlength + ')';
                                                        client.query(query, function(err, result) {
                                                            done();
                                                            if(err) {console.log("err6"); res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});}
                                                        });
                                                        question_index += 1;
                                                        callback2();
                                                    }
                                                });
                                            }
                                            else if (question.type == '2') {
                                                var query = 'INSERT INTO surveymania.questions(survey_section_id, input_type_id, description, question_order, multiple_answers) ' +
                                                            'VALUES (' + section_id + ', 3, \'' + escapeHtml(question.title) + '\', ' + (question_index+1) + ', FALSE) ' +
                                                            'RETURNING id';
                                                client.query(query, function(err, result) {
                                                    done();
                                                    if(err) {console.log("err7"); res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});}
                                                    else {
                                                        var question_id = result.rows[0].id;
                                                        var query = 'INSERT INTO surveymania.option_choices(question_id, choice_name, option_order, linked_section_id) VALUES ' +
                                                                    '(' + question_id + ', \'' + escapeHtml(question.label1) + '\', 1, NULL), ' +
                                                                    '(' + question_id + ', \'' + escapeHtml(question.label2) + '\', 2, NULL)';
                                                        client.query(query, function(err, result) {
                                                            done();
                                                            if(err) {console.log("err8"); res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});}
                                                        });
                                                        question_index += 1;
                                                        callback2();
                                                    }
                                                });
                                            }
                                            else if (question.type == '3') {
                                                var query = 'INSERT INTO surveymania.questions(survey_section_id, input_type_id, description, question_order, multiple_answers) ' +
                                                            'VALUES (' + section_id + ', 4, \'' + escapeHtml(question.title) + '\', ' + (question_index+1) + ', FALSE) ' +
                                                            'RETURNING id';
                                                client.query(query, function(err, result) {
                                                    done();
                                                    if(err) {console.log("err9"); res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});}
                                                    else {
                                                        var question_id = result.rows[0].id;
                                                        var query = 'INSERT INTO surveymania.question_params(question_id, name, value_num) VALUES ' +
                                                                    '(' + question_id + ', \'min\', ' + question.min + '), ' +
                                                                    '(' + question_id + ', \'max\', ' + question.max + '), ' +
                                                                    '(' + question_id + ', \'pas\', ' + question.step + ')';
                                                        client.query(query, function(err, result) {
                                                            done();
                                                            if(err) {console.log("err10"); console.log(err); res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});}
                                                        });
                                                        question_index += 1;
                                                        callback2();
                                                    }
                                                });
                                            }
                                            else if (question.type == '5') {
                                                var query = 'INSERT INTO surveymania.questions(survey_section_id, input_type_id, description, question_order, multiple_answers) ' +
                                                            'VALUES (' + section_id + ', 2, \'' + escapeHtml(question.title) + '\', ' + (question_index+1) + ', FALSE) ' +
                                                            'RETURNING id';
                                                client.query(query, function(err, result) {
                                                    done();
                                                    if(err) {console.log("err11"); res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});}
                                                    else {
                                                        var question_id = result.rows[0].id;
                                                        var query = 'INSERT INTO surveymania.question_params(question_id, name, value_num) VALUES ' +
                                                                    '(' + question_id + ', \'min\', ' + question.min + '), ' +
                                                                    '(' + question_id + ', \'max\', ' + question.max + ')';
                                                        client.query(query, function(err, result) {
                                                            done();
                                                            if(err) {console.log("err12"); res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});}
                                                        });
                                                        question_index += 1;
                                                        callback2();
                                                    }
                                                });
                                            }
                                            else if (question.type == '7') {
                                                var query = 'INSERT INTO surveymania.questions(survey_section_id, input_type_id, description, question_order, multiple_answers) ' +
                                                            'VALUES (' + section_id + ', 6, \'' + escapeHtml(question.text) + '\', ' + (question_index+1) + ', FALSE) ' +
                                                            'RETURNING id';
                                                client.query(query, function(err, result) {
                                                    done();
                                                    if(err) {console.log("err13"); res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});}
                                                    else {
                                                        var question_id = result.rows[0].id;
                                                        question_index += 1;
                                                        callback2();
                                                    }
                                                });
                                            }
                                            else if (question.type == '6') {
                                                var query = 'INSERT INTO surveymania.questions(survey_section_id, input_type_id, description, question_order, multiple_answers) ' +
                                                            'VALUES (' + section_id + ', 3, \'' + escapeHtml(question.title) + '\', ' + (question_index+1) + ', ' + question.multiple + ') ' +
                                                            'RETURNING id';
                                                client.query(query, function(err, result) {
                                                    done();
                                                    if(err) {console.log("err14"); res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});}
                                                    else {
                                                        var question_id = result.rows[0].id;
                                                        if (question.option.length == 0) {
                                                            var query = 'INSERT INTO surveymania.option_choices(question_id, choice_name, option_order, linked_section_id) VALUES ' +
                                                                        '(' + question_id + ', \'Option 1\', 1, NULL)';
                                                        }
                                                        else {
                                                            var query = 'INSERT INTO surveymania.option_choices(question_id, choice_name, option_order, linked_section_id) VALUES ';
                                                            for (var k = 0; k < question.option.length; k++) {
                                                                query += '(' + question_id + ', \'' + question.option[k] + '\', ' + (k+1) + ', NULL)';
                                                                if (k != question.option.length - 1) query += ', ';
                                                            }
                                                        }
                                                        client.query(query, function(err, result) {
                                                            done();
                                                            if(err) {console.log("err15"); res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});}
                                                        });
                                                        question_index += 1;
                                                        callback2();
                                                    }
                                                });
                                            }
                                            else if (question.type == '4') {
                                                var query = 'INSERT INTO surveymania.questions(survey_section_id, input_type_id, description, question_order, multiple_answers) ' +
                                                            'VALUES (' + section_id + ', 7, \'' + escapeHtml(question.title) + '\', ' + (question_index+1) + ', ' + question.multiple + ') ' +
                                                            'RETURNING id';
                                                client.query(query, function(err, result) {
                                                    done();
                                                    if(err) {console.log("err16"); res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});}
                                                    else {
                                                        var question_id = result.rows[0].id;
                                                        if (question.option.length == 0) {
                                                            var query = 'INSERT INTO surveymania.option_choices(question_id, choice_name, option_order, linked_section_id) VALUES ' +
                                                                        '(' + question_id + ', \'Option 1\', 1, NULL)';
                                                        }
                                                        else {
                                                            var query = 'INSERT INTO surveymania.option_choices(question_id, choice_name, option_order, linked_section_id) VALUES ';
                                                            for (var k = 0; k < question.option.length; k++) {
                                                                query += '(' + question_id + ', \'' + question.option[k].title + '\', ' + (k+1) + ', ' + question.option[k].sectionId + ')';
                                                                if (k != question.option.length - 1) query += ', ';
                                                            }
                                                        }
                                                        client.query(query, function(err, result) {
                                                            done();
                                                            if(err) {console.log("err17"); console.log(err); res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});}
                                                        });
                                                        question_index += 1;
                                                        callback2();
                                                    }
                                                });
                                            }
                                        },
                                        function (err) {
                                            if (err) {
                                                console.log("err18"); 
                                                res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                                            } else {
                                                section_index += 1;
                                                callback();
                                            }
                                        }
                                    );
                                }
                            });
                        },
                        function (err) {
                            if (err) {
                                console.log("err19"); 
                                res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                            } else {
                                res.status(200).json({code: 200, message: "Survey successfully created"});
                            }
                        }
                    );
                }
            });
        }
    });
})

.post('/login', function (req, res) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.setHeader('Accept', 'application/json');
    var email = req.body.email;
    var password = req.body.password;
    //verifying in database that login informations are correct
    pg.connect(conString, function(err, client, done) {
        if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error fetching client from pool"});
        else {
            var query = 'SELECT usertypes.type_name AS anyuser_typename, anyuser.id AS anyuser_id, anyuser.name AS anyuser_firstname, anyuser.lastname AS anyuser_lastname, anyuser.email AS anyuser_email, anyuser.user_type AS anyuser_type, anyuser.user_organization AS anyuser_organization, anyuser.verified AS anyuser_verified, orga.verified AS orga_verified ' +
                        ' FROM surveymania.users anyuser INNER JOIN surveymania.user_types usertypes ON anyuser.user_type = usertypes.id LEFT JOIN surveymania.organizations orga ON anyuser.user_organization = orga.id WHERE anyuser.email = \'' + escapeHtml(email) + '\' AND anyuser.password = \'' + escapeHtml(password) + '\'';
            client.query(query, function(err, result) {
                done();
                if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                else if (result.rows.length && result.rows[0].anyuser_verified == false) res.json({
                        code: 200, error: "Account not verified",
                        message: "Votre compte n'a pas encore été vérifié. Si vous n'avez pas reçu ou si vous avez perdu votre mail contenant le code de vérification, " +
                                 "vous pouvez en recevoir un nouveau <strong><u><a href='#/accounts/verify/new' class='text-muted'>en cliquant ici.</a></u></strong>"
                    });
                else if (result.rows.length && result.rows[0].anyuser_verified == true && result.rows[0].orga_verified == false) res.json({
                        code: 200, error: "Professional account not accepted yet",
                        message: "Votre compte n'a pas encore été accepté par notre équipe. " +
                                 "Veuillez patienter, nous vous informerons lorsque votre demande de compte aura été traitée."
                    });
                else if (result.rows.length && result.rows[0].anyuser_verified == true) {
                    var profile = {
                        firstname: result.rows[0].anyuser_firstname,
                        lastname: result.rows[0].anyuser_lastname,
                        email: result.rows[0].anyuser_email,
                        id: result.rows[0].anyuser_id,
                        usertype: result.rows[0].anyuser_typename,
                        usertypenumber: result.rows[0].anyuser_type,
                        organization: result.rows[0].anyuser_organization,
                        tokenCreation: new Date().getTime()
                    };
                    // We are sending the profile inside the token
                    var token = jwt.sign(profile, SurveyManiasecret, { expiresInMinutes: 30*24*60 });
                    res.json({token: token, usertype: profile.usertypenumber});
                }
                else res.json({code: 200, error: "Unauthorized", message: "No account found with given email and password"});
            });
        }
    });
})

.get('/login', function (req, res) {
    res.setHeader("Content-Type", "text/html");
    res.render('partials/login');
})

.get('/ranking', function (req, res) {
    res.setHeader("Content-Type", "text/html");
    res.render('partials/ranking');
})

.get('/ranking/get/users', function (req, res) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.setHeader('Accept', 'application/json');
    pg.connect(conString, function(err, client, done) {
        if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error fetching client from pool"});
        else {
            var query = 'SELECT users.id AS user_id, users.name, users.lastname, users.points FROM surveymania.users users ORDER BY users.points DESC, users.name, users.lastname';
            client.query(query, function(err, result) {
                done();
                if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                else if (result.rows.length) {
                    res.json({code: 200, users: result.rows});
                }
                else res.json({code: 200, error: "No sponsors found", message: "No users found"});
            });
        }
    });
})

.get('/app/ranking/get/users', function (req, res) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.setHeader('Accept', 'application/json');
    pg.connect(conString, function(err, client, done) {
        if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error fetching client from pool"});
        else {
            var query = 'SELECT users.id AS user_id, users.name, users.lastname, users.points FROM surveymania.users users ORDER BY users.points DESC, users.name, users.lastname';
            client.query(query, function(err, result) {
                done();
                if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                else if (result.rows.length) {
                    res.json({code: 200, users: result.rows, user: req.user.id});
                }
                else res.json({code: 200, error: "No sponsors found", message: "No users found"});
            });
        }
    });
})

.post('/signup', function (req, res) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.setHeader('Accept', 'application/json');
    var inviter = null;
    var error = false;

    if (req.body.type == 'particulier' && req.body.email != null && req.body.password != null && req.body.firstname != null && req.body.lastname != null) {
        pg.connect(conString, function(err, client, done) {
            if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error fetching client from pool"});
            else {
                var query = 'SELECT getuser.email AS user_email, getuser.id AS user_id FROM surveymania.users getuser WHERE getuser.email = \'' + escapeHtml(req.body.email) + '\' ' +
                            'UNION ' +
                            'SELECT getuser.email AS user_email, getuser.id AS user_id FROM surveymania.users getuser WHERE getuser.email = \'' + escapeHtml(req.body.inviter) + '\'';
                client.query(query, function(err, result) {
                    done();
                    if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query verifying email"});
                    else if (result.rows.length && result.rows[0].user_email == req.body.email)
                        res.status(200).json({code: 200, error: "Conflict", message: "Email already used for an existing account"});
                    else {
                        var inviter_id = (result.rows.length && result.rows[0].user_email != req.body.email) ? result.rows[0].user_id : null;
                        var dateNow = '\'' + escapeHtml(moment().format("YYYY-MM-DD HH:mm:ss")) + '\'';
                        var email = '\'' + escapeHtml(req.body.email) + '\'';
                        var password = '\'' + escapeHtml(req.body.password) + '\'';
                        var firstname = '\'' + escapeHtml(req.body.firstname) + '\'';
                        var lastname = '\'' + escapeHtml(req.body.lastname) + '\'';
                        var telephone = (req.body.phone == null) ? 'NULL' : '\'' + escapeHtml(req.body.phone) + '\'';
                        var adress = (req.body.adress == null) ? 'NULL' : '\'' + escapeHtml(req.body.adress) + '\'';
                        var postal = (req.body.postal == null) ? 'NULL' : '\'' + escapeHtml(req.body.postal) + '\'';
                        var town = (req.body.town == null) ? 'NULL' : '\'' + escapeHtml(req.body.town) + '\'';
                        var country = (req.body.country == null) ? 'NULL' : '\'' + escapeHtml(req.body.country) + '\'';
                        var inviteDT = (inviter_id == null) ? 'NULL' : escapeHtml(dateNow);
                        var inviterID = (inviter_id == null) ? 'NULL' : inviter_id;
                        var query = 'INSERT INTO surveymania.users(email, password, user_type, name, lastname, telephone, adress, postal, town, country, creation_dt, last_dt, invite_dt, inviter_id, points, verified) ' +
                            'VALUES (' + email + ', ' + password + ', 1, ' + firstname + ', ' + lastname + ', ' + telephone + ', ' + adress + ', ' + postal + ', ' + town + ', ' + country + ', ' +  dateNow + ', ' + dateNow + ', ' + inviteDT + ', ' + inviterID + ', 200, false) ' +
                            'RETURNING id';
                        client.query(query, function(err, result) {
                            done();
                            if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query inserting new user"});
                            else {
                                var userid = result.rows[0].id;
                                var hash = CryptoJS.HmacMD5(userid + "" + (new Date().getTime()), SurveyManiasecret).toString();
                                var verifyURL = SurveyManiaURL + '#/accounts/verify/' + hash;
                                new MailVerifToken({token: hash, userid: userid}).save(function (err, obj) {
                                    if (err) console.log(err);
                                });
                                var mailOptions = {
                                    from: 'webmaster@surveymania.com',
                                    to: req.body.email,
                                    subject: 'Signin account verification',
                                    html: 'Hello ' + req.body.firstname + ' ' + req.body.lastname + ', welcome to SurveyMania!<br><br>' +
                                          'Please click on the link below to verify your account email and finish your <b>SurveyMania</b> inscription.<br>' +
                                          '<a href="' + verifyURL + '">' + verifyURL + '</a><br><br>' +
                                          'By doing so you will win an achievement and 200 points ! <br><br>' +
                                          'Thank you for your trust and enjoy our services.<br><br>' +
                                          'SurveyMania Team'
                                };
                                transporter.sendMail(mailOptions, function(error, info){
                                    if(error) console.log(error);
                                    else console.log('Message sent: ' + info.response);
                                });
                                res.status(200).json({code: 200, message: "Account successfully created"});
                            }
                        });
                    }
                });
            }
        });
    }
    else if (req.body.type == 'professional' && req.body.email != null && req.body.firstname != null && req.body.lastname != null && req.body.password != null && req.body.firmname != null &&
             req.body.firmdescription != null && req.body.phone != null && req.body.adress != null && req.body.postal != null && req.body.town != null && req.body.country != null) {
        pg.connect(conString, function(err, client, done) {
            if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error fetching client from pool"});
            else {
                var query = 'SELECT getuser.email AS user_email, getuser.id AS user_id FROM surveymania.users getuser WHERE getuser.email = \'' + escapeHtml(req.body.email) + '\' ';
                client.query(query, function(err, result) {
                    done();
                    if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query verifying email"});
                    else if (result.rows.length && result.rows[0].user_email == req.body.email)
                        res.status(200).json({code: 200, error: "Conflict", message: "Email already used for an existing account"});
                    else {
                        var dateNow = '\'' + escapeHtml(moment().format("YYYY-MM-DD HH:mm:ss")) + '\'';
                        var email = '\'' + escapeHtml(req.body.email) + '\'';
                        var password = '\'' + escapeHtml(req.body.password) + '\'';
                        var firstname = '\'' + escapeHtml(req.body.firstname) + '\'';
                        var lastname = '\'' + escapeHtml(req.body.lastname) + '\'';
                        var telephone = (req.body.phone == null) ? 'NULL' : '\'' + escapeHtml(req.body.phone) + '\'';
                        var adress = (req.body.adress == null) ? 'NULL' : '\'' + escapeHtml(req.body.adress) + '\'';
                        var postal = (req.body.postal == null) ? 'NULL' : '\'' + escapeHtml(req.body.postal) + '\'';
                        var town = (req.body.town == null) ? 'NULL' : '\'' + escapeHtml(req.body.town) + '\'';
                        var country = (req.body.country == null) ? 'NULL' : '\'' + escapeHtml(req.body.country) + '\'';
                        var firmname = (req.body.firmname == null) ? 'NULL' : '\'' + escapeHtml(req.body.firmname) + '\'';
                        var firmdescription = (req.body.firmdescription == null) ? 'NULL' : '\'' + escapeHtml(req.body.firmdescription) + '\'';
                        var logo_img = req.body.logo_img;
                        var logo_type = req.body.logo_type;
                        var logo_skip = req.body.logo_skip;
                        var query = 'INSERT INTO surveymania.organizations(name, description, adress, postal, town, country, telephone, logo_path, current_points, verified) ' +
                            'VALUES (' + firmname + ', ' + firmdescription + ', ' + adress + ', ' + postal + ', ' + town + ', ' + country + ', ' + telephone + ', \'img/default_profil.jpg\', 50, false) ' +
                            'RETURNING id';
                        client.query(query, function(err, result) {
                            done();
                            if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query inserting new organization"});
                            else {
                                var orgaid = result.rows[0].id;
                                if (logo_skip == false) {
                                    var img_path = "img/organizations/" + orgaid + "/logo." + logo_type;
                                    mkdirp('app/img/organizations/' + orgaid, function (err) {
                                        if (err) console.log(err)
                                        else {
                                            fs.writeFile("app/" + img_path, logo_img, 'base64', function(err) {
                                                if (err) console.log(err);
                                                else {
                                                    var query = 'UPDATE surveymania.organizations SET logo_path = \'' + escapeHtml(img_path) + '\' WHERE surveymania.organizations.id = ' + orgaid;
                                                    client.query(query, function(err, result) {
                                                        done();
                                                        if (err) console.log(err);
                                                    });  
                                                }
                                            });       
                                        }
                                    });
                                }
                                var query = 'INSERT INTO surveymania.users(user_organization, email, password, user_type, name, lastname, telephone, adress, postal, town, country, creation_dt, last_dt, points, verified) ' +
                                    'VALUES (' + orgaid + ', ' + email + ', ' + password + ', 3, ' + firstname + ', ' + lastname + ', ' + telephone + ', ' + adress + ', ' + postal + ', ' + town + ', ' + country + ', ' +  dateNow + ', ' + dateNow + ', 200, false) ' +
                                    'RETURNING id';
                                client.query(query, function(err, result) {
                                    done();
                                    if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query inserting new user"});
                                    else {
                                        var userid = result.rows[0].id;
                                        var hash = CryptoJS.HmacMD5(userid + "" + (new Date().getTime()), SurveyManiasecret).toString();
                                        var verifyURL = SurveyManiaURL + '#/accounts/verify/' + hash;
                                        new MailVerifToken({token: hash, userid: userid}).save(function (err, obj) {
                                            if (err) console.log(err);
                                        });
                                        var mailOptions = {
                                            from: 'webmaster@surveymania.com',
                                            to: req.body.email,
                                            subject: 'Signin professional account verification',
                                            html: 'Hello ' + req.body.firstname + ' ' + req.body.lastname + ', welcome to SurveyMania!<br><br>' +
                                                  'You have submitted a new professional account for your organization <strong>' + req.body.firmname + '</strong><br>' +
                                                  'Please click on the link below to verify your account email for your <b>SurveyMania</b> inscription.<br>' +
                                                  '<a href="' + verifyURL + '">' + verifyURL + '</a><br><br>' +
                                                  'After that, we will study your request and will inform you when your professional account is validated, if it is accepted.<br><br>' +
                                                  'By doing so you will win an achievement and 200 points ! <br><br>' +
                                                  'Thank you for your trust and enjoy our services.<br><br>' +
                                                  'SurveyMania Team'
                                        };
                                        transporter.sendMail(mailOptions, function(error, info){
                                            if (error) console.log(error);
                                            else console.log('Message sent: ' + info.response);
                                        });
                                        res.status(200).json({code: 200, message: "Account successfully created"});
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
    else res.status(500).json({code: 500, error: "Internal server error", message: "Bad user infos"});
})

.get('/signup', function (req, res) {
    res.setHeader("Content-Type", "text/html");
    res.render('partials/signup');
})

.get('/app/account/get/sponsors', function (req, res) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.setHeader('Accept', 'application/json');
    pg.connect(conString, function(err, client, done) {
        if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error fetching client from pool"});
        else {
            var query = 'SELECT users.id AS user_id, users.email AS user_email, users.name AS user_name, users.lastname AS user_lastname, users.points AS user_points, users.inviter_id AS user_inviter_id, sponsors.sponsor_id AS sponsor_id, sponsors.email AS sponsor_email, sponsors.name AS sponsor_name, sponsors.lastname AS sponsor_lastname, sponsors.points AS sponsor_points, sponsors.inviter_id AS sponsor_inviter_id FROM surveymania.users users LEFT JOIN (SELECT sponsors.id AS sponsor_id, sponsors.email, sponsors.name, sponsors.lastname, sponsors.points, sponsors.inviter_id FROM surveymania.users sponsors) sponsors ON sponsors.sponsor_id = users.inviter_id WHERE users.id = ' + req.user.id + ' OR users.inviter_id = ' + req.user.id + ' ORDER BY users.invite_dt';
            client.query(query, function(err, result) {
                done();
                if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                else if (result.rows.length) {
                    res.json({code: 200, sponsors: result.rows, user_id: req.user.id});
                }
                else res.json({code: 200, error: "No sponsors found", message: "No sponsors found"});
            });
        }
    });
})

.get('/app/account/admin/validate/pro', function (req, res) {
    if(req.user.usertypenumber != 2) res.redirect('/401-unauthorized');
    else
    {
        var pro_accounts = undefined;
        pg.connect(conString, function(err, client, done) {
            if (err) console.log(err);
            var query = 'SELECT orga.id AS orga_id, orga.name AS orga_name, orga.description AS orga_description, orga.adress AS orga_adress, orga.postal AS orga_postal, orga.town AS orga_town, orga.country AS orga_country, orga.telephone AS orga_tel, orga.logo_path AS orga_logo, ' +
                                'owner.email AS owner_email, owner.name AS owner_firstname, owner.lastname AS owner_lastname, owner.adress AS owner_adress, owner.postal AS owner_postal, owner.town AS owner_town, owner.country AS owner_country, owner.telephone AS owner_tel ' +
                        'FROM surveymania.organizations orga INNER JOIN surveymania.users owner ON orga.id = owner.user_organization WHERE owner.user_type = 3 AND owner.verified=TRUE AND orga.verified=FALSE';
            client.query(query, function(err, result) {
                done();
                if (err) console.log(err);
                else if (result.rows.length) pro_accounts = result.rows;
                res.setHeader("Content-Type", "text/html");
                res.render('partials/validate-pro-account', {user: req.user, accounts: pro_accounts});
            });
        });
    }
})

.post('/app/account/admin/validate/pro', function (req, res) {
    if(req.user.usertypenumber != 2) {res.status(401).json({code: 401, error: "Unauthorized", message: "Unauthorized, you have to be an admin"}); return;}
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.setHeader('Accept', 'application/json');
    var id = req.body.id;
    pg.connect(conString, function(err, client, done) {
        if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error fetching client from pool"});
        else {
            var query = 'SELECT owner.email AS owner_email, owner.name AS owner_firstname, owner.lastname AS owner_lastname, orga.id FROM surveymania.organizations orga INNER JOIN surveymania.users owner ON orga.id = owner.user_organization WHERE owner.user_type = 3 AND orga.id = ' + id;
            client.query(query, function(err, result) {
                done();
                if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                else if (result.rows.length) {
                    var owner_email = result.rows[0].owner_email;
                    var owner_firstname = result.rows[0].owner_firstname;
                    var owner_lastname = result.rows[0].owner_lastname;
                    var dateNow = '\'' + escapeHtml(moment().format("YYYY-MM-DD HH:mm:ss")) + '\'';
                    var query = 'UPDATE surveymania.organizations SET verified = TRUE, verified_dt =' + dateNow + ' WHERE surveymania.organizations.id = ' + id;
                    client.query(query, function(err, result) {
                        done();
                        if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running update query"});
                        else {
                            var mailOptions = {
                                from: 'webmaster@surveymania.com',
                                to: owner_email,
                                subject: 'Professional account accepted',
                                html: 'Hello ' + owner_firstname + ' ' + owner_lastname + ', welcome to SurveyMania!<br><br>' +
                                      'Your profesionnal account has been accpeted. From now on you can access your account by logging in!<br><br>' +
                                      'Thank you for your trust and enjoy our services.<br><br>' +
                                      'SurveyMania Team'
                            };
                            transporter.sendMail(mailOptions, function(error, info){
                                if(error) console.log(error);
                                else console.log('Message sent: ' + info.response);
                            });
                            res.json({code: 200, message: "Professional account successfully accepted."});
                        }
                    });
                }
                else res.json({code: 200, error: "Organization not found", message: "Action couldn't perform and professional couldn't be accepted."});
            });
        }
    });
})

.post('/app/account/admin/deny/pro', function (req, res) {
    if(req.user.usertypenumber != 2) {res.status(401).json({code: 401, error: "Unauthorized", message: "Unauthorized, you have to be an admin"}); return;}
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.setHeader('Accept', 'application/json');

    var id = req.body.id;
    pg.connect(conString, function(err, client, done) {
        if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error fetching client from pool"});
        else {
            var query = 'SELECT id FROM surveymania.users WHERE user_organization = ' + id;
            client.query(query, function(err, result) {
                done();
                if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                else if (result.rows.length) {
                    var query = 'DELETE FROM surveymania.user_achievements WHERE user_id = ' + result.rows[0].id + '; DELETE FROM surveymania.users WHERE user_organization = ' + id + ' ; DELETE FROM surveymania.organizations WHERE id = ' + id;
                    client.query(query, function(err, result) {
                        done();
                        if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                        else res.status(200).json({code: 200});
                    });
                } else res.status(500).json({code: 500, error: "Internal server error", message: "The user / organization doesn't exist anymore"});
            });
        }
    });
})

.post('/app/getUser', function (req, res) {
    if(req.user.usertypenumber != 1 && req.user.usertypenumber != 2 && req.user.usertypenumber != 3 && req.user.usertypenumber != 4) {res.status(401).json({code: 401, error: "Unauthorized", message: "Unauthorized"}); return;}
    pg.connect(conString, function(err, client, done) {
        if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
        var query = 'SELECT owner.id AS owner_id, owner.user_organization AS owner_organization, owner.email AS owner_email, owner.password AS owner_password, owner.name AS owner_firstname, owner.lastname AS owner_lastname, owner.adress AS owner_adress, owner.postal AS owner_postal, owner.town AS owner_town, owner.country AS owner_country, owner.telephone AS owner_tel, owner.user_type AS owner_type, owner.points AS owner_points ' +
                    'FROM surveymania.users owner WHERE owner.id = ' + req.user.id;
        client.query(query, function(err, result) {
            done();
            if (err) console.log(err);
            else if (result.rows.length) {
                res.setHeader('Content-Type', 'application/json; charset=UTF-8');
                res.json({code: 200, user: result.rows[0]});
            }
        });
    });
})

.post('/app/getUserOrganization', function (req, res) {
    if(req.user.usertypenumber != 2 && req.user.usertypenumber != 3 && req.user.usertypenumber != 4) {res.status(401).json({code: 401, error: "Unauthorized", message: "Unauthorized"}); return;}
    pg.connect(conString, function(err, client, done) {
        if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
        var query = 'SELECT orga.id AS organization_id, orga.description AS organization_description, orga.adress AS organization_adress, orga.postal AS organization_postal, ' +
                    'orga.town AS organization_town, orga.country AS organization_country, orga.telephone AS organization_tel, orga.name AS organization_name ' +
                    'FROM surveymania.organizations orga WHERE orga.id = ' + req.body.userOrganization;
        client.query(query, function(err, result) {
            done();
            if (err) console.log(err);
            else if (result.rows.length) {
                res.setHeader('Content-Type', 'application/json; charset=UTF-8');
                res.json({code: 200, organization: result.rows[0]});
            }
        });
    });
})


.get('/app/account', function (req, res) {
    if(req.user.usertypenumber != 1 && req.user.usertypenumber != 2 && req.user.usertypenumber != 3 && req.user.usertypenumber != 4) {res.redirect('/401-unauthorized'); return;}
    var achvmnts = '';
    var user = req.user;
    pg.connect(conString, function(err, client, done) {
        if (err) return console.log(err);
        var query = 'SELECT owner.id AS owner_id, owner.email AS owner_email, owner.name AS owner_firstname, owner.lastname AS owner_lastname, owner.adress AS owner_adress, owner.postal AS owner_postal, owner.town AS owner_town, owner.country AS owner_country, owner.telephone AS owner_tel, owner.user_type AS owner_type, owner.points AS owner_points ' +
                    'FROM surveymania.users owner WHERE owner.id = ' + req.user.id;
        client.query(query, function(err, result) {
            done();
            if (err) console.log(err);
            else if (result.rows.length) {
                user = result.rows[0];
                var query = 'SELECT * FROM surveymania.user_achievements INNER JOIN surveymania.achievements ON surveymania.user_achievements.achiev_id = surveymania.achievements.id WHERE surveymania.user_achievements.user_id = ' + req.user.id + ' ORDER BY surveymania.user_achievements.id DESC';
                client.query(query, function(err, result) {
                    done();
                    if (err) console.log(err);
                    else if (result.rows.length) achvmnts = result.rows;
                    res.setHeader("Content-Type", "text/html");
                    res.render('partials/account', {user: user, achievements: achvmnts});
                });
            }
        });
    });
})

.post('/app/editUserProfile', function (req, res) {
    if(req.user.usertypenumber != 1 && req.user.usertypenumber != 2 && req.user.usertypenumber != 3 && req.user.usertypenumber != 4) {res.status(401).json({code: 401, error: "Unauthorized", message: "Unauthorized"}); return;}
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.setHeader('Accept', 'application/json');
    var error = false;

    pg.connect(conString, function(err, client, done) {
        if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error fetching client from pool"});
        else 
        {
            var email = '\'' + escapeHtml(req.body.email) + '\'';
            var password = '\'' + escapeHtml(req.body.password) + '\'';
            var telephone = (req.body.phone == null) ? 'NULL' : '\'' + escapeHtml(req.body.phone) + '\'';
            var adress = (req.body.adress == null) ? 'NULL' : '\'' + escapeHtml(req.body.adress) + '\'';
            var postal = (req.body.postal == null) ? 'NULL' : '\'' + escapeHtml(req.body.postal) + '\'';
            var town = (req.body.town == null) ? 'NULL' : '\'' + escapeHtml(req.body.town) + '\'';
            var country = (req.body.country == null) ? 'NULL' : '\'' + escapeHtml(req.body.country) + '\'';
            //Verify email
            var emailQuery = 'SELECT owner.id AS owner_id FROM surveymania.users owner WHERE owner.email = ' + email;
            client.query(emailQuery, function(err, result) {
                done();
                if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query retrieving email"});
                else if (result.rows.length)
                {
                    // if true, user didn't edit his email : no problem here
                    if(result.rows[0].owner_id == req.body.id)
                    {
                        var query = 'UPDATE surveymania.users SET email = ' + email + ', password = ' + password + ', telephone = ' + telephone + ', adress=' + adress + ', postal =' + postal + ', town = ' + town + ', country = ' + country +
                        'WHERE id = ' + req.body.id;
                        client.query(query, function(err, result) {
                            done();
                            if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query editing user"});
                            else
                                res.status(200).json({code: 200, message: "Les modifications ont été sauvegardés !"});
                        });
                    }
                    // if false, the email belongs to somebody else: 
                    else
                        res.status(200).json({code: 1, error: "Conflit d'e-mail", message: "Cet e-mail existe déjà"});
                }
                // Sending confirm mail and update the rest of the informations
                else
                {
                    var query = 'UPDATE surveymania.users SET password = ' + password + ', telephone = ' + telephone + ', adress=' + adress + ', postal =' + postal + ', town = ' + town + ', country = ' + country +
                    'WHERE id = ' + req.body.id;
                    client.query(query, function(err, result) {
                        done();
                        if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query editing user"});
                        else
                            res.status(200).json({verifMail:"verif", code: 200, message: "Les modifications ont été sauvegardés !"});
                    });

                    //Sending mail
                    var userid = req.body.id;
                    var hash = CryptoJS.HmacMD5(userid + "" + (new Date().getTime()), SurveyManiasecret).toString();
                    var verifyURL = SurveyManiaURL + '#/accounts/verifyEmail/' + hash;
                    new EditMailToken({token: hash, userid: userid, usermail: req.body.email}).save(function (err, obj) {
                        if (err) console.log(err);
                    });

                    var mailOptions = {
                        from: 'webmaster@surveymania.com',
                        to: req.body.email,
                        subject: 'Confirmation de votre changement d\'e-mail',
                        html: 'Bonjour ' + req.body.firstname + ' ' + req.body.lastname + ',<br>' +
                              'Vous avez demandé un changement d\'e-mail lié à ce compte.,<br>' +
                              'Pour des raisons de sécurité, veuillez cliquer sur le lien ci-dessous pour valider ce changement auprès de nos services.' +
                              '<a href="' + verifyURL + '">' + verifyURL + '</a><br><br>' +
                              'Merci pour votre confiance.<br><br>' +
                              'L\'équipe SurveyMania'
                    };
                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) console.log(error);
                        else console.log('Message sent: ' + info.response);
                    });
                }
            });     
        }
    });
})

.post('/app/editFirmProfile', function (req, res) {
    if(req.user.usertypenumber != 3 && req.user.usertypenumber != 4) {res.status(401).json({code: 401, error: "Unauthorized", message: "Unauthorized"}); return;}
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.setHeader('Accept', 'application/json');
    pg.connect(conString, function(err, client, done) {
        if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error fetching client from pool"});
        else 
        {
            var telephone = (req.body.phone == null) ? 'NULL' : '\'' + escapeHtml(req.body.phone) + '\'';
            var adress = (req.body.adress == null) ? 'NULL' : '\'' + escapeHtml(req.body.adress) + '\'';
            var postal = (req.body.postal == null) ? 'NULL' : '\'' + escapeHtml(req.body.postal) + '\'';
            var town = (req.body.town == null) ? 'NULL' : '\'' + escapeHtml(req.body.town) + '\'';
            var country = (req.body.country == null) ? 'NULL' : '\'' + escapeHtml(req.body.country) + '\'';
            var firmdescription = (req.body.description == null) ? 'NULL' : '\'' + escapeHtml(req.body.description) + '\'';
              
            var query = 'UPDATE surveymania.organizations SET description = ' + firmdescription +', telephone = ' + telephone + ', adress=' + adress + ', postal =' + postal + ', town = ' + town + ', country = ' + country +
                        ' WHERE id = ' + req.body.id;
            client.query(query, function(err, result) {
                done();
                if(err) {console.log(err);res.status(500).json({code: 500, error: "Internal server error", message: "Error running query inserting new organization"});}
                else 
                    res.status(200).json({code: 200, message: "Les modifications ont été sauvegardés !"});
            })
        }
    });
})

.get('/accounts/verifyEmail/:token', function (req, res) {
    var code = 1;
    res.setHeader("Content-Type", "text/html");
    var token = req.params.token;
    if (token != "new") {
        EditMailToken.find({token: token}, function (err, tokens) {
            if (err || !tokens.length) {
                if (err) console.error(err);
                token = undefined;
                res.render('partials/verify-edit-mail', {token: token, code: code});
            }
            else
            {
                var email = '\'' + escapeHtml(tokens[0].usermail) + '\'';
                var userId = tokens[0].userid;
                pg.connect(conString, function(err, client, done) {
                    var query = 'UPDATE surveymania.users SET email=' + email + ' WHERE id = ' + userId;
                    client.query(query, function(err, result) {
                        done();
                        if(err) 
                            res.render('partials/verify-edit-mail', {token: token, code: 2});
                        else
                        {
                            EditMailToken.find({token: token}).remove(function (err) {
                                        if (err) console.log(err);
                            });
                            res.render('partials/verify-edit-mail', {token: token, code: 0});
                        }
                    });
                });
            }
        });
    }
    else res.render('partials/verify-edit-mail', {token: token, code: code});
})

.get('/accounts/verify/:token', function (req, res) {
    res.setHeader("Content-Type", "text/html");
    var token = req.params.token;
    if (token != "new") {
        MailVerifToken.find({token: token}, function (err, tokens) {
            if (err || !tokens.length) {
                if (err) console.error(err);
                token = undefined;
            }
            res.render('partials/mail-verify', {token: token});
        });
    }
    else res.render('partials/mail-verify', {token: token});
})

.post('/accounts/verify/:token', function (req, res) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.setHeader('Accept', 'application/json');
    var token = req.params.token;
    var password = req.body.password;
    var userid = null;
    MailVerifToken.find({token: token}, function (err, tokens) {
        if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Une erreur est survenue lors de la recherche du token de vérification d'email"});
        else if (!tokens.length) res.json({code: 200, error: "Invalid verification code", message: "Le code de vérification est invalide, votre compte n'a pas pu être vérifié"});
        else {
            userid = tokens[0].userid;
            pg.connect(conString, function(err, client, done) {
                if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error fetching client from pool"});
                else {
                    var query = 'SELECT invited.id AS invited_id, inviter.id AS inviter_id, invited.verified AS invited_verified, inviter.points AS inviter_points, invited.email AS invited_email, inviter.email AS inviter_email, invited.name AS invited_firstname, invited.lastname AS invited_lastname ' +
                        'FROM surveymania.users invited LEFT JOIN surveymania.users inviter ON invited.inviter_id = inviter.id WHERE invited.id = ' + userid + ' AND invited.password = \'' + escapeHtml(password) + '\'';
                    client.query(query, function(err, result) {
                        done();
                        if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                        else if (result.rows.length && result.rows[0].invited_verified == false) {
                            var inviter_id = result.rows[0].inviter_id;
                            var invited_id = result.rows[0].invited_id;
                            var inviter_points = result.rows[0].inviter_points;
                            var inviter_email = result.rows[0].inviter_email;
                            var invited_email = result.rows[0].invited_email;
                            var invited_firstname = result.rows[0].invited_firstname;
                            var invited_lastname = result.rows[0].invited_lastname;
                            var dateNow = '\'' + escapeHtml(moment().format("YYYY-MM-DD HH:mm:ss")) + '\'';
                            var query = 'UPDATE surveymania.users SET verified=true, verified_dt=' + dateNow + ' WHERE id=' + userid;
                            client.query(query, function(err, result) {
                                done();
                                if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                                else {
                                    if (inviter_id != null) {
                                        var newpoints = inviter_points + 500;
                                        var query = 'UPDATE surveymania.users SET points=' + newpoints + ' WHERE id=' + inviter_id;
                                        client.query(query, function(err, result) {
                                            done();
                                            if(!err) {
                                                var mailOptions = {
                                                    from: 'webmaster@surveymania.com',
                                                    to: inviter_email,
                                                    subject: 'Someone has just named you as his inviter',
                                                    html: invited_firstname + ' ' + invited_lastname + ' (' + invited_email + ') has just named you as his inviter!<br>' +
                                                          'This action made you win 500 points and you have now a total of ' + newpoints + ' points.<br>' +
                                                          'Plus you unlocked a new achievement! You can see the details on your account.<br>' +
                                                          'Congratulations and thank you very much for your activity, we hope you enjoy our services :D<br><br>' +
                                                          'SurveyMania Team'
                                                };
                                                transporter.sendMail(mailOptions, function(error, info){
                                                    if(error) console.log(error);
                                                    else console.log('Message sent: ' + info.response);
                                                });
                                                var dateNow = '\'' + escapeHtml(moment().format("YYYY-MM-DD HH:mm:ss")) + '\'';
                                                var query = 'INSERT INTO surveymania.user_achievements(user_id, achiev_id, recieved_dt) ' +
                                                            'VALUES (' + inviter_id + ', 2, ' + dateNow + ') ';
                                                client.query(query, function(err, result) {
                                                    done();
                                                    if(err) console.log(err);
                                                });
                                            }
                                        });
                                    }
                                    MailVerifToken.find({userid: userid}).remove(function (err) {
                                        if (err) console.log(err);
                                        res.json({code: 200, message: "Le compte a bien été vérifié"});
                                    });
                                    var dateNow = '\'' + escapeHtml(moment().format("YYYY-MM-DD HH:mm:ss")) + '\'';
                                    var query = 'INSERT INTO surveymania.user_achievements(user_id, achiev_id, recieved_dt) ' +
                                                'VALUES (' + invited_id + ', 1, ' + dateNow + '), (' + invited_id + ', 3, ' + dateNow + '), (' + invited_id + ', 4, ' + dateNow + ')';
                                    client.query(query, function(err, result) {
                                        done();
                                        if(err) console.log(err);
                                    });
                                }
                            });
                        }
                        else if (result.rows.length) res.json({code: 200, error: "Already verified", message: "Votre compte a déjà été vérifié, vous pouvez donc y accéder en vous connectant"});
                        else res.json({code: 200, error: "Unauthorized", message: "Votre mot de passe ne correspond pas au compte associé à ce token, il n'a donc pas pu être vérifié"});
                    });
                }
            });
        }
    });
})

.post('/accounts/get/verify', function (req, res) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.setHeader('Accept', 'application/json');
    var email = req.body.email;
    var userid = null;
    pg.connect(conString, function(err, client, done) {
        if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error fetching client from pool"});
        else {
            var query = 'SELECT surveymania.users.id AS userid, * FROM surveymania.users WHERE surveymania.users.email = \'' + escapeHtml(email) + '\'';
            client.query(query, function(err, result) {
                done();
                if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                else if (result.rows.length && result.rows[0].verified == false) {
                    var userid = result.rows[0].userid;
                    var firstname = result.rows[0].name;
                    var lastname = result.rows[0].lastname;
                    var hash = CryptoJS.HmacMD5(userid + "" + (new Date().getTime()), SurveyManiasecret).toString();
                    var verifyURL = SurveyManiaURL + '#/accounts/verify/' + hash;
                    new MailVerifToken({token: hash, userid: userid}).save(function (err, obj) {
                        if (err) console.log(err);
                    });
                    var mailOptions = {
                        from: 'webmaster@surveymania.com',
                        to: email,
                        subject: 'New account verification code',
                        html: 'Hello ' + firstname + ' ' + lastname + ', welcome to SurveyMania!<br><br>' +
                              'Please click on the new link below to verify your account email and finish your <b>SurveyMania</b> inscription.<br>' +
                              '<a href="' + verifyURL + '">' + verifyURL + '</a><br><br>' +
                              'Thank you for your trust and enjoy our services.<br><br>' +
                              'SurveyMania Team'
                    };
                    transporter.sendMail(mailOptions, function(error, info){
                        if(error) res.status(500).json({code: 500, error: "Internal server error", message: "Une erreur est survenue lors de l'envoie du mail avec votre nouveau code de vérification"});
                        else res.json({code:200, message: "Le mail contenant votre nouveau code de vérification a bien été envoyé. Veuillez suivre ses instructions afin de finaliser votre inscription"});
                    });
                }
                else if (result.rows.length) res.json({code: 200, error: "Already verified", message: "Votre compte a déjà été vérifié, vous pouvez donc y accéder en vous connectant"});
                else res.json({code: 200, error: "Unauthorized", message: "Aucun compte associé à cet email n'a été trouvé"});
            });
        }
    });
})

.get('/accounts/reset/:token', function (req, res) {
    res.setHeader("Content-Type", "text/html");
    var token = req.params.token;
    if (token != "new") {
        PwdResetToken.find({token: token}, function (err, tokens) {
            if (err || !tokens.length) {
                if (err) console.error(err);
                token = undefined;
            }
            res.render('partials/pwd-reset', {token: token});
        });
    }
    else res.render('partials/pwd-reset', {token: token});
})

.post('/accounts/reset/:token', function (req, res) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.setHeader('Accept', 'application/json');
    var token = req.params.token;
    var email = req.body.email;
    var password = '\'' + escapeHtml(req.body.password) + '\'';
    var userid = null;
    PwdResetToken.find({token: token}, function (err, tokens) {
        if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Une erreur est survenue lors de la recherche du token de vérification d'email"});
        else if (!tokens.length) res.json({code: 200, error: "Invalid reinitialization code", message: "Le code de réinitialisation de mot de passe est invalide, le mot de passe n'a pas pu être modifié"});
        else {
            userid = tokens[0].userid;
            pg.connect(conString, function(err, client, done) {
                if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error fetching client from pool"});
                else {
                    var query = 'SELECT surveymania.users.id AS userid, * FROM surveymania.users WHERE surveymania.users.id = ' + userid + ' AND surveymania.users.email = \'' + escapeHtml(email) + '\'';
                    client.query(query, function(err, result) {
                        done();
                        if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                        else if (result.rows.length) {
                            var query = 'UPDATE surveymania.users SET password=' + password + ' WHERE id=' + userid;
                            client.query(query, function(err, result) {
                                done();
                                if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                                else {
                                    PwdResetToken.find({userid: userid}).remove(function (err) {
                                        if (err) console.log(err);
                                        res.json({code: 200, message: "Le mot de passe a bien été modifié"});
                                    });
                                }
                            });
                        }
                        else res.json({code: 200, error: "Unauthorized", message: "Votre email ne correspond pas au compte associé à ce token, le mot de passe n'a pas pu être modifié"});
                    });
                }
            });
        }
    });
})

.post('/accounts/get/reset', function (req, res) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.setHeader('Accept', 'application/json');
    var email = req.body.email;
    var userid = null;
    pg.connect(conString, function(err, client, done) {
        if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error fetching client from pool"});
        else {
            var query = 'SELECT surveymania.users.id AS userid, * FROM surveymania.users WHERE surveymania.users.email = \'' + escapeHtml(email) + '\'';
            client.query(query, function(err, result) {
                done();
                if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                else if (result.rows.length) {
                    var userid = result.rows[0].userid;
                    var firstname = result.rows[0].name;
                    var lastname = result.rows[0].lastname;
                    var hash = CryptoJS.HmacMD5(userid + "" + (new Date().getTime()), SurveyManiasecret).toString();
                    var verifyURL = SurveyManiaURL + '#/accounts/reset/' + hash;
                    new PwdResetToken({token: hash, userid: userid}).save(function (err, obj) {
                        if (err) console.log(err);
                    });
                    var mailOptions = {
                        from: 'webmaster@surveymania.com',
                        to: email,
                        subject: 'Password reinitialization code',
                        html: 'Hello ' + firstname + ' ' + lastname + ' !<br><br>' +
                              'A request to reinitialize your password has been made on your behalf.<br>' +
                              'If you are not at the origin of this action, just ignore this email and your password won\'t be changed.<br>' +
                              'If you want to reinitialize your password please click on the link below.<br>' +
                              '<a href="' + verifyURL + '">' + verifyURL + '</a><br><br>' +
                              'Thank you for your trust and enjoy our services.<br><br>' +
                              'SurveyMania Team'
                    };
                    transporter.sendMail(mailOptions, function(error, info){
                        if(error) res.status(500).json({code: 500, error: "Internal server error", message: "Une erreur est survenue lors de l'envoie du mail avec votre nouveau code de réinitialisation"});
                        else res.json({code:200, message: "Le mail contenant votre nouveau code de réinitialisation de mot de passe a bien été envoyé."});
                    });
                }
                else res.json({code: 200, error: "Unauthorized", message: "Aucun compte associé à cet email n'a été trouvé"});
            });
        }
    });
})

.get('/app/mysurveys', function (req, res) {
    if (req.user.usertypenumber != 1) res.redirect('/401-unauthorized');
    else {
        res.setHeader("Content-Type", "text/html");
        res.render('partials/mysurveys');
    }
})

.post('/app/getUserSurveys', function (req, res) {
    if (req.user.usertypenumber != 1) res.status(500).json({code: 500});
    else {
        var user = req.user;
        pg.connect(conString, function(err, client, done) {
            if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
            else {
                var query = 'SELECT sh.id AS id, o.name AS orgaName, sh.name AS surveyName, sh.points AS points, sh.info AS infos, to_char(us.completed, \'le DD/MM/YYYY à HH24:MI:SS\') AS completed, t.progression AS progression'
                    + ' FROM surveymania.survey_headers sh INNER JOIN surveymania.user_surveys us ON sh.id = us.survey_header_id'
                    + ' INNER JOIN surveymania.organizations o ON sh.organization_id = o.id LEFT OUTER JOIN'
                    + ' ('
                    + '     SELECT header_id, MIN(section) * 100 / MAX(section) AS progression FROM'
                    + '     ('
                    + '         SELECT ss.header_id, MIN (ss.section_order - 1) AS section'
                    + '         FROM surveymania.user_survey_sections uss INNER JOIN surveymania.survey_sections ss ON uss.section_id = ss.id'
                    + '         WHERE uss.user_id = ' + user.id + ' AND uss.completed IS NULL'
                    + '         GROUP BY ss.header_id'
                    + '         UNION'
                    + '         SELECT ss.header_id, MAX (ss.section_order) AS section'
                    + '         FROM surveymania.survey_sections ss'
                    + '         WHERE ss.header_id IN '
                    + '         ('
                    + '             SELECT DISTINCT ss.header_id'
                    + '             FROM surveymania.user_survey_sections uss INNER JOIN surveymania.survey_sections ss ON uss.section_id = ss.id'
                    + '             WHERE uss.user_id = ' + user.id
                    + '         )'
                    + '         GROUP BY ss.header_id'
                    + '     ) t'
                    + '     GROUP BY header_id'
                    + ' ) t ON t.header_id = sh.id'
                    + ' WHERE us.user_id = ' + user.id;

                client.query(query, function(err, result) {
                    done();
                    if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                    else {
                        res.setHeader('Content-Type', 'application/json; charset=UTF-8');
                        res.json({code: 200, userSurveys: result.rows});
                    }
                });
            }
        });
    }
})

.post('/app/addUserSurvey/', function (req, res) {
    if (req.user.usertypenumber != 1) res.status(500).json({code: 500});
    else {
        res.setHeader('Content-Type', 'application/json; charset=UTF-8');
        var user = req.user;

        /*console.log(req.body.qrcode);
        var encrypted = CryptoJS.AES.encrypt(req.body.qrcode, SurveyManiasecret, { format: JsonFormatter }).toString();
        var tmp = encrypted.replace(/\+/g, ".");
        console.log(tmp);*/
        if (req.body.qrcode == "error decoding QR Code")
            res.status(200).json({code: 200, message: "Scanning error"});
        else {
            var myBase = req.body.qrcode.replace(/\./g, "+");
            try {
                var decrypted = CryptoJS.AES.decrypt(myBase, SurveyManiasecret, { format: JsonFormatter }).toString(CryptoJS.enc.Utf8);
            } catch (err) {
                res.status(200).json({code: 200, message: "Scanning error"});
                return;
            }

            if (!(/^\d+$/.test(decrypted)))
                res.status(200).json({code: 200, message: "Not valid"});
            else {
                pg.connect(conString, function(err, client, done) {
                    if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                    else {
                        var query = 'SELECT us.id FROM surveymania.user_surveys us WHERE us.user_id = ' + user.id + ' AND us.survey_header_id = ' + escapeHtml(decrypted);
                        client.query(query, function(err, result) {
                            done();
                            if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                            else {
                                if (result.rows.length != 0) res.status(200).json({code: 200, message: "Already scanned"});
                                else {
                                    var query = 'SELECT o.name AS orgaName, sh.name AS surveyName, sh.points AS points, sh.info AS infos FROM surveymania.survey_headers sh '
                                        + 'INNER JOIN surveymania.organizations o ON sh.organization_id = o.id WHERE publied = true AND sh.id = ' + escapeHtml(decrypted);
                                    client.query(query, function(err, result) {
                                        done();
                                        if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                                        else {
                                            if (result.rows.length == 0){
                                                res.status(200).json({code: 200, message: "Unknown survey"});
                                            } else {
                                                res.status(200).json({code: 200, message: "Valid", surveyHeader: result.rows[0], encrypted: myBase});
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            }
        }
    }
})

.post('/app/validateAddUserSurvey/', function (req, res) {
    if (req.user.usertypenumber != 1) res.status(500).json({code: 500});
    else {
        var user = req.user;
        var encrypted = req.body.qrcode.replace(/\./g, "+");
        var decrypted = CryptoJS.AES.decrypt(encrypted, SurveyManiasecret, { format: JsonFormatter }).toString(CryptoJS.enc.Utf8);
        pg.connect(conString, function(err, client, done) {
            if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
            else {
                var query = 'INSERT INTO surveymania.user_surveys (user_id, survey_header_id, completed) VALUES (' + user.id + ', ' + escapeHtml(decrypted) + ', NULL)';
                client.query(query, function(err, result) {
                    done();
                    if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                    else {
                        var query = 'SELECT sh.id AS id, o.name AS orgaName, sh.name AS surveyName, sh.points AS points, sh.info AS infos, us.completed AS completed FROM surveymania.survey_headers sh INNER JOIN surveymania.user_surveys us ON sh.id = us.survey_header_id '
                            + 'INNER JOIN surveymania.organizations o ON sh.organization_id = o.id INNER JOIN surveymania.users u ON us.user_id = u.id WHERE u.id = ' + user.id + ' AND sh.id = ' + escapeHtml(decrypted);
                        client.query(query, function(err, result) {
                            done();
                            if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                            else {
                                res.setHeader('Content-Type', 'application/json; charset=UTF-8');
                                res.json({code: 200, userSurveys: result.rows[0]});
                            }
                        });
                    }
                });
            }
        });
    }
})

.post('/app/survey/initiateUserSurveySection', function (req, res) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    if (req.user.usertypenumber != 1) res.status(500).json({code: 500});
    else {
        var userid = req.user.id;
        var surveyid = req.body.survey;
        pg.connect(conString, function(err, client, done) {
            if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
            else {
                var query = 'SELECT id FROM surveymania.survey_sections WHERE required = true AND header_id = ' + surveyid;
                client.query(query, function(err, result) {
                    done();
                    if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                    else {
                        if (result.rows.length) {
                            var query = 'INSERT INTO surveymania.user_survey_sections (user_id, section_id) VALUES';
                            result.rows.forEach(function (element, index) {
                                if (index == 0) query = query + ' (' + userid + ', ' + element.id + ')';
                                else query = query + ', (' + userid + ', ' + element.id + ')';
                            });
                            client.query(query, function(err, result) {
                                done();
                                if (err) {
                                    if (err.detail.indexOf("already exists") > -1) res.status(200).json({code: 200, error: "Duplicate key", message: "Le sondage à déjà été initialisé"});
                                    else res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});  
                                } else res.status(200).json({code: 200, message: "OK"});
                            });
                        } else {
                            res.status(200).json({code: 200, error: "No result", message: "Ce sondage n'a aucune section de base"})
                        }
                    }
                });
            }
        });
    }
})

.get('/app/surveyAnswer/:surveyid', function (req, res) {
    if (req.user.usertypenumber != 1) res.redirect('/401-unauthorized');
    else {
        var surveyid = escapeHtml(req.params.surveyid);
        pg.connect(conString, function(err, client, done) {
            if (err) res.redirect('/404-notfound');
            else {
                var query = 'SELECT id FROM surveymania.user_surveys WHERE user_id = ' + req.user.id + ' AND survey_header_id = ' + surveyid + ' AND completed IS NULL';
                client.query(query, function(err, result) {
                    done();
                    if (err) res.redirect('/404-notfound');
                    else {
                        if (!result.rows.length) res.redirect('/401-unauthorized');
                        else {
                            res.setHeader("Content-Type", "text/html");
                            res.render('partials/SurveyAnswer');
                        }
                    }
                });
            }
        });
    }
})

.post('/app/survey/getSurvey', function (req, res) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    if (req.user.usertypenumber != 1 && req.user.usertypenumber != 3 && req.user.usertypenumber != 4) res.status(500).json({code: 500});
    else {
        var surveyid = req.body.survey;
        var user = req.user;

        pg.connect(conString, function(err, client, done) {
            if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
            else {
                if (user.usertypenumber == 1) {
                    var query = 'SELECT sh.name AS header_name, sh.instructions, sh.info, sh.points, st.theme_name, o.name'
                        + ' FROM surveymania.survey_headers sh INNER JOIN surveymania.survey_themes st ON sh.theme_id = st.id INNER JOIN surveymania.organizations o ON sh.organization_id = o.id'
                        + ' WHERE publied = true AND sh.id = ' + surveyid;
                    client.query(query, function(err, result) {
                        done();
                        if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                        else {
                            if (!result.rows.length) res.status(500).json({code: 500, error: "Internal server error", message: "Le sondage n'existe pas"});
                            else {
                                var survey = result.rows[0];

                                var query = 'SELECT count(q.id) * 0.15 + count(qm.id) * 1.2 AS time'
                                    + ' FROM surveymania.questions q INNER JOIN surveymania.survey_sections ss ON q.survey_section_id = ss.id'
                                    + ' LEFT OUTER JOIN surveymania.question_medias qm ON qm.question_id = q.id'
                                    + ' WHERE ss.header_id = ' + surveyid;
                                client.query(query, function(err, result) {
                                    done();
                                    if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                                    else {
                                        var time = Math.round(result.rows[0].time);

                                        var query = 'SELECT MIN(section) * 100 / MAX(section) AS progression FROM'
                                            + ' (SELECT MIN (ss.section_order - 1) AS section'
                                            + ' FROM surveymania.user_survey_sections uss INNER JOIN surveymania.survey_sections ss ON uss.section_id = ss.id'
                                            + ' WHERE uss.user_id = ' + user.id + ' AND ss.header_id = ' + surveyid + ' AND uss.completed IS NULL'
                                            + ' UNION'
                                            + ' SELECT MAX (ss.section_order) AS section'
                                            + ' FROM surveymania.survey_sections ss'
                                            + ' WHERE ss.header_id = ' + surveyid + ') t';
                                        client.query(query, function(err, result) {
                                            done();
                                            if (err || !result.rows.length) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                                            else {
                                                res.status(200).json({code: 200, survey: survey, time: time, progression: Math.round(result.rows[0].progression)});
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    });
                } else {
                    var prev = req.body.prev;
                    if (!prev) res.status(500).json({code: 500});
                    else {
                        var query = 'SELECT sh.name AS header_name, sh.instructions, sh.info, sh.points, st.theme_name, o.name'
                            + ' FROM surveymania.survey_headers sh INNER JOIN surveymania.survey_themes st ON sh.theme_id = st.id INNER JOIN surveymania.organizations o ON sh.organization_id = o.id'
                            + ' WHERE sh.id = ' + surveyid + ' AND sh.organization_id = ' + user.organization;
                        client.query(query, function(err, result) {
                            done();
                            if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                            else {
                                if (!result.rows.length) res.status(500).json({code: 500, error: "Internal server error", message: "Le sondage n'existe pas"});
                                else {
                                    var survey = result.rows[0];

                                    var query = 'SELECT count(q.id) * 0.15 + count(qm.id) * 1.2 AS time'
                                        + ' FROM surveymania.questions q INNER JOIN surveymania.survey_sections ss ON q.survey_section_id = ss.id'
                                        + ' LEFT OUTER JOIN surveymania.question_medias qm ON qm.question_id = q.id'
                                        + ' WHERE ss.header_id = ' + surveyid;
                                    client.query(query, function(err, result) {
                                        done();
                                        if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                                        else {
                                            var time = Math.round(result.rows[0].time);
                                            res.status(200).json({code: 200, survey: survey, time: time});
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            }
        });
    }
})

.post('/app/survey/getNextSurveyUserSection', function (req, res) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    if (req.user.usertypenumber != 1) res.status(500).json({code: 500});
    else {
        var userid = req.user.id;
        var surveyid = req.body.survey;
        pg.connect(conString, function(err, client, done) {
            if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
            else {
                var query = 'SELECT ss.id, ss.title, ss.subtitle, ss.section_order, uss.completed'
                    + ' FROM surveymania.user_survey_sections uss INNER JOIN surveymania.survey_sections ss ON uss.section_id = ss.id'
                    + ' WHERE uss.user_id = ' + userid + ' AND ss.header_id = ' + surveyid
                    + ' ORDER BY ss.section_order ASC';
                client.query(query, function(err, result) {
                    done();
                    if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                    else {
                        if (!result.rows.length) res.status(200).json({code: 200, message: "Aucune section à remplir"});
                        else {
                            var selected = null;
                            for (var i = 0; i < result.rows.length; i++) {
                                if (result.rows[i].completed == null) {
                                    selected = result.rows[i];
                                    break;
                                }
                            }

                            if (selected == null) {
                                var query = 'SELECT *'
                                    + ' FROM surveymania.user_surveys us'
                                    + ' WHERE us.user_id = ' + userid + ' AND us.survey_header_id = ' + surveyid;

                                client.query(query, function(err, result) {
                                    done();
                                    if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                                    else {
                                        if (!result.rows.length) res.status(500).json({code: 500, error: "Internal server error", message: "Le sondage n'existe pas"});
                                        else {
                                            if (result.rows[0].completed != null) res.status(200).json({code: 200, message: "Sondage terminé"});
                                            else {
                                                var query = 'UPDATE surveymania.user_surveys'
                                                    + ' SET completed = \'' + escapeHtml(moment().format("YYYY-MM-DD HH:mm:ss")) + '\''
                                                    + ' WHERE user_id = ' + userid + ' AND survey_header_id = ' + surveyid;

                                                client.query(query, function(err, result) {
                                                    done();
                                                    if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                                                    else {
                                                        var query = 'SELECT sh.points FROM surveymania.survey_headers sh WHERE sh.id = ' + surveyid;

                                                        client.query(query, function(err, result) {
                                                            done();
                                                            if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                                                            else {
                                                                var query = 'UPDATE surveymania.users SET points = (points + ' + result.rows[0].points + ') WHERE id = ' + userid;
                                                                client.query(query, function(err, result) {
                                                                    done();
                                                                    if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                                                                    else {
                                                                        var query = 'SELECT points FROM surveymania.users WHERE id = ' + userid;
                                                                        client.query(query, function(err, result) {
                                                                            done();
                                                                            if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                                                                            else res.status(200).json({code: 200, message: "Sondage terminé", points: result.rows[0].points});
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        }
                                    }
                                });
                            }
                            else {
                                var query = 'SELECT MIN(section) * 100 / MAX(section) AS progression FROM'
                                    + ' (SELECT MIN (ss.section_order - 1) AS section'
                                    + ' FROM surveymania.user_survey_sections uss INNER JOIN surveymania.survey_sections ss ON uss.section_id = ss.id'
                                    + ' WHERE uss.user_id = ' + userid + ' AND ss.header_id = ' + surveyid + ' AND uss.completed IS NULL'
                                    + ' UNION'
                                    + ' SELECT MAX (ss.section_order) AS section'
                                    + ' FROM surveymania.survey_sections ss'
                                    + ' WHERE ss.header_id = ' + surveyid + ') t';
                                client.query(query, function(err, result) {
                                    done();
                                    if (err || !result.rows.length) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                                    else {
                                        var progression = Math.round(result.rows[0].progression);

                                        /* Get les questions de la section et leur type */
                                        var query = 'SELECT it.type_name, q.id, q.description, q.question_order, q.multiple_answers'
                                            + ' FROM surveymania.questions q INNER JOIN surveymania.input_types it ON q.input_type_id = it.id'
                                            + ' WHERE q.survey_section_id = ' + selected.id;
                                            + ' ORDER BY q.question_order ASC';

                                        client.query(query, function(err, result) {
                                            done();
                                            if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                                            else {
                                                if (!result.rows.length) res.status(200).json({code: 200, message: "Aucune question dans la section"});
                                                else {
                                                    var question_array = [];

                                                    async.eachSeries(result.rows,
                                                        function (q, callback) {
                                                            var question = {};
                                                            question.question = q;

                                                            /* Get les paramètres de la question */
                                                            var query = 'SELECT qp.name, qp.value_num, qp.value_text'
                                                                + ' FROM surveymania.question_params qp'
                                                                + ' WHERE qp.question_id = ' + question.question.id;

                                                            client.query(query, function(err, result) {
                                                                done();
                                                                if (err) callback("Error running query");
                                                                else {
                                                                    question.parameters = result.rows;

                                                                    /* Get les options de la question (si QCM) */
                                                                    var query = 'SELECT oc.id, oc.choice_name, oc.option_order, oc.linked_section_id'
                                                                        + ' FROM surveymania.option_choices oc'
                                                                        + ' WHERE oc.question_id = ' + question.question.id
                                                                        + ' ORDER BY oc.option_order ASC';

                                                                    client.query(query, function(err, result) {
                                                                        done();
                                                                        if (err) callback("Error running query");
                                                                        else {
                                                                            question.options = result.rows;
                                                                            /* Get les médias de la question */
                                                                            var query = 'SELECT qm.media_path, qm.media_order, qm.media_type, qm.description'
                                                                                + ' FROM surveymania.question_medias qm'
                                                                                + ' WHERE qm.question_id = ' + question.question.id
                                                                                + ' ORDER BY qm.media_order ASC';

                                                                            client.query(query, function(err, result) {
                                                                                done();
                                                                                if (err) callback("Error running query");
                                                                                else {
                                                                                    question.medias = result.rows;
                                                                                    /* On ajoute la question à la liste des questions */
                                                                                    question_array.push(question);
                                                                                    callback();
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        },

                                                        function (err) {
                                                            if (err) {
                                                                res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                                                            } else {
                                                                /* On renvoit toute la liste de questions avec leurs paramètres / options / médias respectifs */
                                                                res.status(200).json({code: 200, message: "OK", section: selected, question_array: question_array, progression: progression});
                                                            }
                                                        }
                                                    );
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    }
                });
            }
        });
    }
})

.post('/app/survey/submitSurveyUserSection', function (req, res) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    if (req.user.usertypenumber != 1) res.status(500).json({code: 500});
    else {
        pg.connect(conString, function(err, client, done) {
            if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
            else {
                var user = req.user;
                var surveyid = req.body.survey;
                var sectionid = req.body.section;
                var answers = req.body.answerArray;
                var completionTime = req.body.time;
                var dateNow = moment().format("YYYY-MM-DD HH:mm:ss");

                var query = 'SELECT uss.id'
                    + ' FROM surveymania.user_survey_sections uss'
                    + ' INNER JOIN surveymania.survey_sections ss ON uss.section_id = ss.id'
                    + ' WHERE uss.user_id = ' + user.id + ' AND ss.id = ' + sectionid + ' AND ss.header_id = ' + surveyid;

                client.query(query, function(err, result) {
                    done();
                    if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                    else {
                        if (!result.rows.length) res.status(500).json({code: 500, error: "Internal server error", message: "La section n'existe pas"});
                        else {
                            var query = 'INSERT INTO surveymania.answers (question_id, user_id, option_choice_id, answer_num, answer_text) VALUES';
                            var idArray = [];
                            answers.forEach(function (element, index) {
                                if (element.ansChecked == undefined) {
                                    query += (index == 0) ? ' (' : ', (';
                                    query += element.id + ', ' + user.id + ', NULL, ';
                                    query += (element.ansNum != undefined) ? escapeHtml(element.ansNum) + ', ' : 'NULL, ';
                                    query += (element.ansText != undefined) ? '\'' + escapeHtml(element.ansText) + '\'' : 'NULL';
                                    query += ')';
                                } else {
                                    if (Array.isArray(element.ansChecked)) {
                                        for (var i = 0; i < element.ansChecked.length; ++i) {
                                            query += (index == 0 && i == 0) ? ' (' : ', (';
                                            query += element.id + ', ' + user.id + ', ' + escapeHtml(element.ansChecked[i]) + ', NULL, NULL)';
                                            idArray.push(element.ansChecked[i]);
                                        }
                                    } else {
                                        query += (index == 0) ? ' (' : ', (';
                                        query += element.id + ', ' + user.id + ', ' + escapeHtml(element.ansChecked) + ', NULL, NULL)';
                                        idArray.push(element.ansChecked);
                                    }
                                }
                            });

                            client.query(query, function(err, result) {
                                done();
                                if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                                else {
                                    var idList = '(';
                                    idArray.forEach(function (element, index) {
                                        idList += (index == 0) ? element : ', ' + element;
                                    });
                                    idList += ')'

                                    /* Si il y a eu des qcm dans la sections */
                                    var query = (idArray.length == 0) ? '' : 'SELECT DISTINCT linked_section_id FROM surveymania.option_choices'
                                        + ' WHERE id IN ' + idList
                                        + ' AND linked_section_id IS NOT NULL;';

                                    client.query(query, function(err, result) {
                                        done();
                                        if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                                        else {
                                            if (!result.rows.length) {
                                                var query = 'UPDATE surveymania.user_survey_sections'
                                                    + ' SET completed = \'' + escapeHtml(dateNow) + '\', duration = ' + completionTime
                                                    + ' WHERE user_id = ' + user.id + 'AND section_id = ' + sectionid;

                                                client.query(query, function(err, result) {
                                                    done();
                                                    if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                                                    else res.status(200).json({code: 200, message: "OK"});
                                                });
                                            } else {
                                                var query = 'INSERT INTO surveymania.user_survey_sections (user_id, section_id) VALUES';
                                                result.rows.forEach(function (element, index) {
                                                    if (index == 0) query = query + ' (' + user.id + ', ' + element.linked_section_id + ')';
                                                    else query = query + ', (' + user.id + ', ' + element.linked_section_id + ')';
                                                });

                                                client.query(query, function(err, result) {
                                                    done();
                                                    var query = 'UPDATE surveymania.user_survey_sections'
                                                        + ' SET completed = \'' + escapeHtml(dateNow) + '\', duration = ' + completionTime
                                                        + ' WHERE user_id = ' + user.id + 'AND section_id = ' + sectionid;

                                                    client.query(query, function(err, result) {
                                                        done();
                                                        if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                                                        else res.status(200).json({code: 200, message: "OK"});
                                                    });
                                                });
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            }
        });
    }
})

.post('/app/survey/getComments', function (req, res) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    if (req.user.usertypenumber != 1) res.status(500).json({code: 500});
    else {
        pg.connect(conString, function(err, client, done) {
            if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
            else {
                var surveyid = req.body.survey;

                var query = 'SELECT sc.comment, to_char(sc.posted, \'le DD/MM/YYYY à HH24:MI:SS\') AS posted, u.name, u.lastname, u.town, u.country, u.points, to_char(u.creation_dt, \'le DD/MM/YYYY\') AS creation_dt'
                    + ' FROM surveymania.survey_comments sc INNER JOIN surveymania.users u ON sc.user_id = u.id'
                    + ' WHERE header_id = ' + surveyid
                    + ' ORDER BY sc.posted DESC';

                client.query(query, function(err, result) {
                    done();
                    if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                    else res.status(200).json({code: 200, message: "OK", comments: result.rows});
                });
            }
        });
    }
})

.get('/app/previsualisation/:surveyid', function (req, res) {
    if (req.user.usertypenumber != 3 && req.user.usertypenumber != 4) res.redirect('/401-unauthorized');
    else {
        var surveyid = escapeHtml(req.params.surveyid);
        pg.connect(conString, function(err, client, done) {
            if (err) res.redirect('/404-notfound');
            else {
                var query = 'SELECT sh.id AS header, u.id AS user FROM surveymania.survey_headers sh'
                    + ' INNER JOIN surveymania.users u ON sh.organization_id = u.user_organization'
                    + ' WHERE u.id = ' + req.user.id + ' AND sh.id = ' + surveyid;
                client.query(query, function(err, result) {
                    done();
                    if (err) res.redirect('/404-notfound');
                    else {
                        if (!result.rows.length) res.redirect('/401-unauthorized');
                        else {
                            res.setHeader("Content-Type", "text/html");
                            res.render('partials/previsualisation');
                        }
                    }
                });
            }
        });
    }
})

.post('/app/previsualisation/getSections', function (req, res) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    if (req.user.usertypenumber != 3 && req.user.usertypenumber != 4) res.status(500).json({code: 500});
    else {
        var surveyid = req.body.surveyid;
        pg.connect(conString, function(err, client, done) {
            if (err) res.status(500).json({code: 500});
            else {
                var query = 'SELECT id, title, subtitle, required, section_order'
                    + ' FROM surveymania.survey_sections'
                    + ' WHERE header_id = ' + surveyid
                    + ' ORDER BY section_order ASC';
                client.query(query, function(err, result) {
                    done();
                    if (err) res.status(500).json({code: 500});
                    else {
                        if (!result.rows.length) res.status(500).json({code: 500});
                        else {
                            var sectionList = result.rows;
                            var section_array = [];

                            var queue = async.queue(function (s, mainCallback) {
                                var section = {};
                                section.section = s;

                                var query = 'SELECT it.type_name, q.id, q.description, q.question_order, q.multiple_answers'
                                    + ' FROM surveymania.questions q INNER JOIN surveymania.input_types it ON q.input_type_id = it.id'
                                    + ' WHERE q.survey_section_id = ' + section.section.id;
                                    + ' ORDER BY q.question_order ASC';

                                client.query(query, function(err, result) {
                                    done();
                                    if (err) callback("Error running query");
                                    else {
                                        if (!result.rows.length) callback("Error running query");
                                        else {
                                            var question_array = [];

                                            async.eachSeries(result.rows,
                                                function (q, callback) {
                                                    var question = {};
                                                    question.question = q;

                                                    var query = 'SELECT qp.name, qp.value_num, qp.value_text'
                                                        + ' FROM surveymania.question_params qp'
                                                        + ' WHERE qp.question_id = ' + question.question.id;

                                                    client.query(query, function(err, result) {
                                                        done();
                                                        if (err) callback("Error running query");
                                                        else {
                                                            question.parameters = result.rows;

                                                            var query = 'SELECT oc.id, oc.choice_name, oc.option_order, oc.linked_section_id, ss.title'
                                                                + ' FROM surveymania.option_choices oc LEFT JOIN surveymania.survey_sections ss ON oc.linked_section_id = ss.id'
                                                                + ' WHERE oc.question_id = ' + question.question.id
                                                                + ' ORDER BY oc.option_order ASC';

                                                            client.query(query, function(err, result) {
                                                                done();
                                                                if (err) callback("Error running query");
                                                                else {
                                                                    question.options = result.rows;

                                                                    var query = 'SELECT qm.media_path, qm.media_order, qm.media_type, qm.description'
                                                                        + ' FROM surveymania.question_medias qm'
                                                                        + ' WHERE qm.question_id = ' + question.question.id
                                                                        + ' ORDER BY qm.media_order ASC';

                                                                    client.query(query, function(err, result) {
                                                                        done();
                                                                        if (err) callback("Error running query");
                                                                        else {
                                                                            question.medias = result.rows;
                                                                            question_array.push(question);
                                                                            callback();
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    });
                                                },

                                                function (err) {
                                                    section.question_array = question_array;
                                                    section_array.push(section);
                                                    mainCallback(err);
                                                }
                                            );
                                        }
                                    }
                                });
                            }, 1);

                            queue.drain = function() {
                                res.status(200).json({code: 200, message: "OK", sections: section_array});
                            }

                            for (var i = 0; i < sectionList.length; ++i) {
                                queue.push(sectionList[i], function (err) {
                                    if (err) {
                                        queue.kill();
                                        res.status(500).json({code: 500});
                                    }
                                });
                            }
                        }
                    }
                });
            }
        });
    }
})

.post('/app/survey/addComment', function (req, res) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    if (req.user.usertypenumber != 1) res.status(500).json({code: 500});
    else {
        pg.connect(conString, function(err, client, done) {
            if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
            else {
                var user = req.user;
                var surveyid = req.body.survey;
                var comment = req.body.comment;
                var dateNow = moment().format("YYYY-MM-DD HH:mm:ss");

                var query = 'INSERT INTO surveymania.survey_comments (header_id, user_id, comment, posted) VALUES'
                    + ' (' + surveyid + ', ' + user.id + ', \'' + escapeHtml(comment) + '\', \'' + escapeHtml(dateNow) + '\')';

                client.query(query, function(err, result) {
                    done();
                    if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                    else res.status(200).json({code: 200, message: "OK"});
                });
            }
        });
    }
})

.get('/app/organizationPanel', function (req, res) {
    if(req.user.usertypenumber != 3 && req.user.usertypenumber != 4) res.redirect('/401-unauthorized');
    else {
        res.setHeader("Content-Type", "text/html");
        res.render('partials/organizationPanel');
    }
})

.post('/app/category/get', function (req, res) {
    if(req.user.usertypenumber != 3 && req.user.usertypenumber != 4) res.status(500).json({code: 500});
    else {
        var orgaid = req.user.organization;
        pg.connect(conString, function(err, client, done) {
            if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
            else {
                var query = 'SELECT id as category_id, name, color FROM surveymania.organization_categories WHERE organization_id = ' + orgaid + ' ORDER BY name';
                client.query(query, function(err, result) {
                    done();
                    if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                    else {
                        res.setHeader('Content-Type', 'application/json; charset=UTF-8');
                        res.json({code: 200, categories: result.rows});
                    }
                });
            }
        });
    }
})

.get('/app/category/get', function (req, res) {
    if(req.user.usertypenumber != 3 && req.user.usertypenumber != 4) res.status(500).json({code: 500});
    else {
        var orgaid = req.user.organization;
        pg.connect(conString, function(err, client, done) {
            if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
            else {
                var query = 'SELECT id as category_id, name, color FROM surveymania.organization_categories WHERE organization_id = ' + orgaid + ' ORDER BY name';
                client.query(query, function(err, result) {
                    done();
                    if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                    else {
                        res.setHeader('Content-Type', 'application/json; charset=UTF-8');
                        res.json({code: 200, categories: result.rows});
                    }
                });
            }
        });
    }
})

.post('/app/category/add', function (req, res) {
    if(req.user.usertypenumber != 3 && req.user.usertypenumber != 4) res.status(500).json({code: 500});
    else {
        res.setHeader('Content-Type', 'application/json; charset=UTF-8');
        var orgaid = req.user.organization;
        var newCategory = req.body.newCategory;
        if(!(/^.{2,25}$/.test(newCategory.name))) {res.status(200).json({code: 200, message: "Invalid name"}); return;}
        if(!(/^#(\d|[A-Fa-f]){6}$/.test(newCategory.color))) {res.status(200).json({code: 200, message: "Invalid color"}); return;}
        pg.connect(conString, function(err, client, done) {
            if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
            else {
                var query = 'SELECT name FROM surveymania.organization_categories WHERE organization_id = ' + orgaid + ' AND name = \'' + escapeHtml(newCategory.name) + '\'';
                client.query(query, function(err, result) {
                    done();
                    if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                    else {
                        if (result.rows.length != 0) res.status(200).json({code: 200, message: "Duplicate category"});
                        else{
                            var query = 'INSERT INTO surveymania.organization_categories (organization_id, name, color) VALUES (' + orgaid + ', \'' + escapeHtml(newCategory.name) + '\', \'' + escapeHtml(newCategory.color) + '\')';
                            client.query(query, function(err, result) {
                                done();
                                if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                                else {
                                    res.status(200).json({code: 200, message: 'done'});
                                }
                            });
                        }
                    }
                });
            }
        });
    }
})

.post('/app/category/update', function (req, res) {
    if(req.user.usertypenumber != 3 && req.user.usertypenumber != 4) res.status(500).json({code: 500});
    else {
        res.setHeader('Content-Type', 'application/json; charset=UTF-8');
        var orgaid = req.user.organization;
        var category = req.body.category;
        var old_category = req.body.old_category;
        var updateName = req.body.n;

        if(!(/^.{2,25}$/.test(category.name))) {res.status(200).json({code: 200, message: "Invalid name"}); return;}
        if(!(/^#(\d|[A-Fa-f]){6}$/.test(category.color))) {res.status(200).json({code: 200, message: "Invalid color"}); return;}
        pg.connect(conString, function(err, client, done) {
            if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
            else {
                var query = 'SELECT name FROM surveymania.organization_categories WHERE organization_id = ' + orgaid + ' AND name = \'' + escapeHtml(category.name) + '\'';
                client.query(query, function(err, result) {
                    done();
                    if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                    else {
                        if (result.rows.length != 0 && updateName === true) res.status(200).json({code: 200, message: "Duplicate category"});
                        else{
                            var query = 'UPDATE surveymania.organization_categories SET name=\'' + escapeHtml(category.name) + '\', color=\'' + escapeHtml(category.color) + '\' WHERE organization_id=' + orgaid + ' AND name=\'' + escapeHtml(old_category) + '\'';
                            client.query(query, function(err, result) {
                                done();
                                if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                                else {
                                    res.status(200).json({code: 200, message: 'done'});
                                }
                            });
                        }
                    }
                });
            }
        });
    }
})

.post('/app/survey/getOrganizationSurveys', function (req, res) {
    if(req.user.usertypenumber != 3 && req.user.usertypenumber != 4) res.status(500).json({code: 500});
    else {
        var orgaid = req.user.organization;
        pg.connect(conString, function(err, client, done) {
            if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
            else {
                var query = 'SELECT sh.name AS surveyName, sh.points AS points, sh.info AS infos FROM surveymania.survey_headers sh WHERE sh.organization_id = ' + orgaid;
                client.query(query, function(err, result) {
                    done();
                    if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                    else {
                        res.setHeader('Content-Type', 'application/json; charset=UTF-8');
                        res.json({code: 200, orgaSurveys: result.rows});
                    }
                });
            }
        });
    }
})

.get('/app/account/pro/shopadmins', function (req, res) {
    if(req.user.usertypenumber != 3) res.redirect('/401-unauthorized');
    else
    {
        res.setHeader("Content-Type", "text/html");
        res.render('partials/shop-admins');
    }
})

.get('/app/account/pro/get/shopadmins', function (req, res) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.setHeader('Accept', 'application/json');
    if(req.user.usertypenumber != 3) {res.status(401).json({code: 401, error: "Unauthorized", message: "Unauthorized, you have to be a shop owner"}); return;}
    else
    {
        pg.connect(conString, function(err, client, done) {
            if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
            else {
                var query = 'SELECT admin.id AS admin_id, admin.email AS admin_email, admin.name AS admin_firstname, admin.lastname AS admin_lastname ' +
                            'FROM surveymania.users admin WHERE admin.user_type = 4 AND admin.user_organization = ' + req.user.organization;
                client.query(query, function(err, result) {
                    done();
                    if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                    else if (result.rows.length) res.json({code: 200, shopadmins: result.rows});
                    else res.json({code: 200, message: "No shop admins found"});
                });
            }
        });
    }
})

.post('/app/account/pro/add/shopadmin', function (req, res) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.setHeader('Accept', 'application/json');
    if(req.user.usertypenumber != 3) {res.status(401).json({code: 401, error: "Unauthorized", message: "Unauthorized, you have to be a shop owner"}); return;}
    else if (req.body.email != null && req.body.firstname != null && req.body.lastname != null) {
        pg.connect(conString, function(err, client, done) {
            if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error fetching client from pool"});
            else {
                var query = 'SELECT getuser.email AS user_email, getuser.id AS user_id FROM surveymania.users getuser WHERE getuser.email = \'' + escapeHtml(req.body.email) + '\' ';
                client.query(query, function(err, result) {
                    done();
                    if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query verifying email"});
                    else if (result.rows.length && result.rows[0].user_email == req.body.email)
                        res.status(200).json({code: 200, error: "Conflict", message: "Email already used for an existing account"});
                    else {
                        var dateNow = '\'' + escapeHtml(moment().format("YYYY-MM-DD HH:mm:ss")) + '\'';
                        var email = '\'' + escapeHtml(req.body.email) + '\'';
                        var password = generatePassword(12, false, /[\d\W\w\p]/);
                        var passwordCrypted = '\'' + escapeHtml(CryptoJS.SHA256(password).toString()) + '\'';
                        var firstname = '\'' + escapeHtml(req.body.firstname) + '\'';
                        var lastname = '\'' + escapeHtml(req.body.lastname) + '\'';
                        var query = 'INSERT INTO surveymania.users(user_organization, email, password, user_type, name, lastname, creation_dt, last_dt, points, verified) ' +
                            'VALUES (' + req.user.organization + ', ' + email + ', ' + passwordCrypted + ', 4, ' + firstname + ', ' + lastname + ', ' + dateNow + ', ' + dateNow + ', 200, true) ' +
                            'RETURNING id';
                        client.query(query, function(err, result) {
                            done();
                            if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query inserting new shop admin"});
                            else {
                                var shopadminId = result.rows[0].id;
                                var url = 'http://localhost:1337/';
                                var mailOptions = {
                                    from: 'webmaster@surveymania.com',
                                    to: req.body.email,
                                    subject: 'New shop admin account',
                                    html: 'Hello ' + req.body.firstname + ' ' + req.body.lastname + ', welcome to SurveyMania!<br><br>' +
                                          'You have been added as a new shop administrator<br>' +
                                          'Please log in your account on <a href="' + url + '">' + url + '</a> and update your password in your user informations.<br><br>' +
                                          'Your login informations are<br>' +
                                          'Email: ' + req.body.email + '<br>' +
                                          'Password: ' + password + '<br><br>' +
                                          'Thank you for your trust and enjoy our services.<br><br>' +
                                          'SurveyMania Team'
                                };
                                transporter.sendMail(mailOptions, function(error, info){
                                    if (error) console.log(error);
                                    else console.log('Message sent: ' + info.response);
                                });
                                var shopadmin = {admin_id: shopadminId, admin_email: req.body.email, admin_firstname: req.body.firstname, admin_lastname: req.body.lastname}
                                res.status(200).json({code: 200, shopadmin: shopadmin, message: "Shop admin successfully created"});
                            }
                        });
                    }
                });
            }
        });
    }
})

.post('/app/account/pro/del/shopadmin', function (req, res) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.setHeader('Accept', 'application/json');
    if(req.user.usertypenumber != 3) {res.status(401).json({code: 401, error: "Unauthorized", message: "Unauthorized, you have to be a shop owner"}); return;}
    else if (req.body.shopadminId != null) {
        pg.connect(conString, function(err, client, done) {
            if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error fetching client from pool"});
            else {
                var query = 'SELECT * FROM surveymania.users admin WHERE admin.id = ' + req.body.shopadminId + ' AND admin.user_type = 4 AND admin.user_organization = ' + req.user.organization;
                client.query(query, function(err, result) {
                    done();
                    if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query verifying shop admin"});
                    else if (!result.rows.length) res.status(200).json({code: 200, error: "Unauthorized", message: "You don't gave the permission to delete this shop admin"});
                    else {
                        var query = 'DELETE FROM surveymania.users WHERE surveymania.users.id = ' + req.body.shopadminId;
                        client.query(query, function(err, result) {
                            done();
                            if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query deleting shop admin"});
                            else res.status(200).json({code: 200, message: "Shop admin successfully deleted"});
                        });
                    }
                });
            }
        });
    }
    else res.status(500).json({code: 500, error: "Internal server error", message: "Bad shop admin infos"});
})

.get('/401-unauthorized', function (req, res) {
    res.setHeader("Content-Type", "text/html");
    res.render('401-unauthorized');
})

.get('/404-notfound', function (req, res) {
    res.setHeader("Content-Type", "text/html");
    res.render('404-notfound');
})

.get('/#/404-notfound', function (req, res) {
    res.setHeader("Content-Type", "text/html");
    res.render('index');
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
    res.redirect('/#/404-notfound');
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

app.listen(1337);

console.log('HTTP Server running at http://localhost:1337/');
