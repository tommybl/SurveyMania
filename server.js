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
                        ' FROM surveymania.users anyuser INNER JOIN surveymania.user_types usertypes ON anyuser.user_type = usertypes.id LEFT JOIN surveymania.organizations orga ON anyuser.user_organization = orga.id WHERE anyuser.email = \'' + email + '\' AND anyuser.password = \'' + password + '\'';
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
                    console.log(result.rows);
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
                    console.log(profile);
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

.post('/signup', function (req, res) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.setHeader('Accept', 'application/json');
    var inviter = null;
    var error = false;

    if (req.body.type == 'particulier' && req.body.email != null && req.body.password != null && req.body.firstname != null && req.body.lastname != null) {
        pg.connect(conString, function(err, client, done) {
            if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error fetching client from pool"});
            else {
                var query = 'SELECT getuser.email AS user_email, getuser.id AS user_id FROM surveymania.users getuser WHERE getuser.email = \'' + req.body.email + '\' ' +
                            'UNION ' +
                            'SELECT getuser.email AS user_email, getuser.id AS user_id FROM surveymania.users getuser WHERE getuser.email = \'' + req.body.inviter + '\'';
                client.query(query, function(err, result) {
                    done();
                    if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query verifying email"});
                    else if (result.rows.length && result.rows[0].user_email == req.body.email)
                        res.status(200).json({code: 200, error: "Conflict", message: "Email already used for an existing account"});
                    else {
                        var inviter_id = (result.rows.length && result.rows[0].user_email != req.body.email) ? result.rows[0].user_id : null;
                        var dateNow = '\'' + moment().format("YYYY-MM-DD HH:mm:ss") + '\'';
                        var email = '\'' + req.body.email + '\'';
                        var password = '\'' + req.body.password + '\'';
                        var firstname = '\'' + req.body.firstname + '\'';
                        var lastname = '\'' + req.body.lastname + '\'';
                        var telephone = (req.body.phone == null) ? 'NULL' : '\'' + req.body.phone + '\'';
                        var adress = (req.body.adress == null) ? 'NULL' : '\'' + req.body.adress + '\'';
                        var postal = (req.body.postal == null) ? 'NULL' : '\'' + req.body.postal + '\'';
                        var town = (req.body.town == null) ? 'NULL' : '\'' + req.body.town + '\'';
                        var country = (req.body.country == null) ? 'NULL' : '\'' + req.body.country + '\'';
                        var inviteDT = (inviter_id == null) ? 'NULL' : dateNow;
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
                var query = 'SELECT getuser.email AS user_email, getuser.id AS user_id FROM surveymania.users getuser WHERE getuser.email = \'' + req.body.email + '\' ';
                client.query(query, function(err, result) {
                    done();
                    if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query verifying email"});
                    else if (result.rows.length && result.rows[0].user_email == req.body.email)
                        res.status(200).json({code: 200, error: "Conflict", message: "Email already used for an existing account"});
                    else {
                        var dateNow = '\'' + moment().format("YYYY-MM-DD HH:mm:ss") + '\'';
                        var email = '\'' + req.body.email + '\'';
                        var password = '\'' + req.body.password + '\'';
                        var firstname = '\'' + req.body.firstname + '\'';
                        var lastname = '\'' + req.body.lastname + '\'';
                        var telephone = (req.body.phone == null) ? 'NULL' : '\'' + req.body.phone + '\'';
                        var adress = (req.body.adress == null) ? 'NULL' : '\'' + req.body.adress + '\'';
                        var postal = (req.body.postal == null) ? 'NULL' : '\'' + req.body.postal + '\'';
                        var town = (req.body.town == null) ? 'NULL' : '\'' + req.body.town + '\'';
                        var country = (req.body.country == null) ? 'NULL' : '\'' + req.body.country + '\'';
                        var firmname = (req.body.firmname == null) ? 'NULL' : '\'' + req.body.firmname + '\'';
                        var firmdescription = (req.body.firmdescription == null) ? 'NULL' : '\'' + req.body.firmdescription + '\'';
                        var logo_img = req.body.logo_img;
                        var logo_type = req.body.logo_type;
                        var logo_skip = req.body.logo_skip;
                        var query = 'INSERT INTO surveymania.organizations(name, description, adress, postal, town, country, telephone, logo_path, url_add_discount, url_verify_discount, url_remove_discount, current_points, verified) ' +
                            'VALUES (' + firmname + ', ' + firmdescription + ', ' + adress + ', ' + postal + ', ' + town + ', ' + country + ', ' + telephone + ', \'img/default_profil.jpg\', \'url\', \'url\', \'url\', 50, false) ' +
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
                                                    var query = 'UPDATE surveymania.organizations SET logo_path = \'' + img_path + '\' WHERE surveymania.organizations.id = ' + orgaid;
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
                                                  'You have submitted a new professional account for your organization <strong>' + firmname + '</strong><br>' +
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
                    var dateNow = '\'' + moment().format("YYYY-MM-DD HH:mm:ss") + '\'';
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

.post('/app/getUser', function (req, res) {
        pg.connect(conString, function(err, client, done) {
        if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
        var query = 'SELECT owner.id AS owner_id, owner.email AS owner_email, owner.password AS owner_password, owner.name AS owner_firstname, owner.lastname AS owner_lastname, owner.adress AS owner_adress, owner.postal AS owner_postal, owner.town AS owner_town, owner.country AS owner_country, owner.telephone AS owner_tel, owner.user_type AS owner_type, owner.points AS owner_points ' +
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

.get('/app/account', function (req, res) {
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

.post('/editUserProfile', function (req, res) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.setHeader('Accept', 'application/json');
    var inviter = null;
    var error = false;

    if (req.body.type == 'particulier' && req.body.email != null && req.body.password != null) {
        pg.connect(conString, function(err, client, done) {
            if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error fetching client from pool"});
            else {

                        var email = '\'' + req.body.email + '\'';
                        var password = '\'' + req.body.password + '\'';
                        var telephone = (req.body.phone == null) ? 'NULL' : '\'' + req.body.phone + '\'';
                        var adress = (req.body.adress == null) ? 'NULL' : '\'' + req.body.adress + '\'';
                        var postal = (req.body.postal == null) ? 'NULL' : '\'' + req.body.postal + '\'';
                        var town = (req.body.town == null) ? 'NULL' : '\'' + req.body.town + '\'';
                        var country = (req.body.country == null) ? 'NULL' : '\'' + req.body.country + '\'';
                        console.log("email:"+email+"    pawd:"+password+"     adress:"+adress+"    postal:"+postal
                                    +"     town:"+town+"    country:"+country+"      id:"+req.body.id);
                        var query = 'UPDATE surveymania.users SET email = ' + email + ', password = ' + password + ', telephone = ' + telephone + ', adress=' + adress + ', postal =' + postal + ', town = ' + town + ', country = ' + country +
                                    'WHERE id = '+req.body.id;
                        client.query(query, function(err, result) {
                            console.log("lolo ki");
                            done();
                            if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query editing user"});
                            else
                                res.status(200).json({code: 200, message: "Les modifications ont été sauvegardés !"});
                        });
            }
        });
    }
    /*else if (req.body.type == 'professional' && req.body.email != null && req.body.password != null && req.body.firmdescription != null && req.body.phone != null && 
             req.body.adress != null && req.body.postal != null && req.body.town != null && req.body.country != null)
    {
        pg.connect(conString, function(err, client, done) {
            if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error fetching client from pool"});
            else {
                var query = 'SELECT getuser.email AS user_email, getuser.id AS user_id FROM surveymania.users getuser WHERE getuser.email = \'' + req.body.email + '\' ';
                client.query(query, function(err, result) {
                    done();
                    if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query verifying email"});
                    else if (result.rows.length && result.rows[0].user_email == req.body.email)
                        res.status(200).json({code: 200, error: "Conflict", message: "Email already used for an existing account"});
                    else {
                        var email = '\'' + req.body.email + '\'';
                        var password = '\'' + req.body.password + '\'';
                        var telephone = (req.body.phone == null) ? 'NULL' : '\'' + req.body.phone + '\'';
                        var adress = (req.body.adress == null) ? 'NULL' : '\'' + req.body.adress + '\'';
                        var postal = (req.body.postal == null) ? 'NULL' : '\'' + req.body.postal + '\'';
                        var town = (req.body.town == null) ? 'NULL' : '\'' + req.body.town + '\'';
                        var country = (req.body.country == null) ? 'NULL' : '\'' + req.body.country + '\'';
                        var firmname = (req.body.firmname == null) ? 'NULL' : '\'' + req.body.firmname + '\'';
                        var firmdescription = (req.body.firmdescription == null) ? 'NULL' : '\'' + req.body.firmdescription + '\'';
                        var logo_img = req.body.logo_img;
                        var logo_type = req.body.logo_type;
                        var logo_skip = req.body.logo_skip;
                        var query = 'INSERT INTO surveymania.organizations(name, description, adress, postal, town, country, telephone, logo_path, url_add_discount, url_verify_discount, url_remove_discount, current_points, verified) ' +
                            'VALUES (' + firmname + ', ' + firmdescription + ', ' + adress + ', ' + postal + ', ' + town + ', ' + country + ', ' + telephone + ', \'img/default_profil.jpg\', \'url\', \'url\', \'url\', 50, false) ' +
                            'RETURNING id';
                        client.query(query, function(err, result) {
                            done();
                            if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query inserting new organization"});
                            else {
                                var orgaid = result.rows[0].id;
                                var query = 'INSERT INTO surveymania.users(user_organization, email, password, user_type, name, lastname, telephone, adress, postal, town, country, creation_dt, last_dt, points, verified) ' +
                                    'VALUES (' + orgaid + ', ' + email + ', ' + password + ', 3, ' + firstname + ', ' + lastname + ', ' + telephone + ', ' + adress + ', ' + postal + ', ' + town + ', ' + country + ', ' +  dateNow + ', ' + dateNow + ', 200, false) ' +
                                    'RETURNING id';
                                client.query(query, function(err, result) {
                                    done();
                                    if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query inserting new user"});
                                    else 
                                        res.status(200).json({code: 200, message: "Account successfully created"});
                                });
                            }
                        });
                    }
                });
            }
        });
    }*/
    else res.status(500).json({code: 500, error: "Internal server error", message: "Bad user infos"});
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
                        'FROM surveymania.users invited LEFT JOIN surveymania.users inviter ON invited.inviter_id = inviter.id WHERE invited.id = ' + userid + ' AND invited.password = \'' + password + '\'';
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
                            var dateNow = '\'' + moment().format("YYYY-MM-DD HH:mm:ss") + '\'';
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
                                                var dateNow = '\'' + moment().format("YYYY-MM-DD HH:mm:ss") + '\'';
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
                                    var dateNow = '\'' + moment().format("YYYY-MM-DD HH:mm:ss") + '\'';
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
            var query = 'SELECT surveymania.users.id AS userid, * FROM surveymania.users WHERE surveymania.users.email = \'' + email + '\'';
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
    var password = '\'' + req.body.password + '\'';
    var userid = null;
    PwdResetToken.find({token: token}, function (err, tokens) {
        if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Une erreur est survenue lors de la recherche du token de vérification d'email"});
        else if (!tokens.length) res.json({code: 200, error: "Invalid reinitialization code", message: "Le code de réinitialisation de mot de passe est invalide, le mot de passe n'a pas pu être modifié"});
        else {
            userid = tokens[0].userid;
            pg.connect(conString, function(err, client, done) {
                if(err) res.status(500).json({code: 500, error: "Internal server error", message: "Error fetching client from pool"});
                else {
                    var query = 'SELECT surveymania.users.id AS userid, * FROM surveymania.users WHERE surveymania.users.id = ' + userid + ' AND surveymania.users.email = \'' + email + '\'';
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
            var query = 'SELECT surveymania.users.id AS userid, * FROM surveymania.users WHERE surveymania.users.email = \'' + email + '\'';
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
    if(req.user.usertypenumber != 1) res.redirect('/401-unauthorized');
    res.setHeader("Content-Type", "text/html");
    res.render('partials/mysurveys');
})

.post('/app/getUserSurveys', function (req, res) {
    var user = req.user;
    var survey_headers = [];
    pg.connect(conString, function(err, client, done) {
        if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
        else {
            var query = 'SELECT o.name AS orgaName, sh.name AS surveyName, sh.points AS points, sh.info AS infos, us.completed AS completed FROM surveymania.survey_headers sh INNER JOIN surveymania.user_surveys us ON sh.id = us.survey_header_id '
                + 'INNER JOIN surveymania.organizations o ON sh.organization_id = o.id INNER JOIN surveymania.users u ON us.user_id = u.id WHERE u.id = ' + req.user.id;
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
})

.post('/app/addUserSurvey/', function (req, res) {
    var user = req.user;

    /*console.log(req.body.qrcode);
    var encrypted = CryptoJS.AES.encrypt(req.body.qrcode, SurveyManiasecret, { format: JsonFormatter }).toString();
    var tmp = encrypted.replace(/\+/g, ".");
    console.log(tmp);*/
    if (req.body.qrcode == "error decoding QR Code")
        res.status(200).json({code: 200, message: "Scanning error"});
    else {
        var myBase = req.body.qrcode.replace(/\./g, "+");
        var decrypted = CryptoJS.AES.decrypt(myBase, SurveyManiasecret, { format: JsonFormatter }).toString(CryptoJS.enc.Utf8);

        if (!(/^\d+$/.test(decrypted)))
            res.status(200).json({code: 200, message: "Not valid"});
        else {
            pg.connect(conString, function(err, client, done) {
                if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                else {
                    var query = 'SELECT us.id FROM surveymania.user_surveys us WHERE us.user_id = ' + user.id + ' AND us.survey_header_id = ' + decrypted;
                    client.query(query, function(err, result) {
                        done();
                        if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                        else {
                            if (result.rows.length != 0) res.status(200).json({code: 200, message: "Already scanned"});
                            else {
                                var query = 'SELECT o.name AS orgaName, sh.name AS surveyName, sh.points AS points, sh.info AS infos FROM surveymania.survey_headers sh '
                                    + 'INNER JOIN surveymania.organizations o ON sh.organization_id = o.id WHERE sh.id = ' + decrypted;
                                client.query(query, function(err, result) {
                                    done();
                                    if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                                    else {
                                        if (result.rows.length == 0){
                                            res.status(200).json({code: 200, message: "Unknown survey"});
                                        } else {
                                            res.setHeader('Content-Type', 'application/json; charset=UTF-8');
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
})

.post('/app/validateAddUserSurvey/', function (req, res) {
    var user = req.user;
    var encrypted = req.body.qrcode.replace(/\./g, "+");
    var decrypted = CryptoJS.AES.decrypt(encrypted, SurveyManiasecret, { format: JsonFormatter }).toString(CryptoJS.enc.Utf8);
    pg.connect(conString, function(err, client, done) {
        if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
        else {
            var query = 'INSERT INTO surveymania.user_surveys (user_id, survey_header_id, completed) VALUES (' + user.id + ', ' + decrypted + ', NULL)';
            client.query(query, function(err, result) {
                done();
                if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                else {
                    var query = 'SELECT o.name AS orgaName, sh.name AS surveyName, sh.points AS points, sh.info AS infos, us.completed AS completed FROM surveymania.survey_headers sh INNER JOIN surveymania.user_surveys us ON sh.id = us.survey_header_id '
                        + 'INNER JOIN surveymania.organizations o ON sh.organization_id = o.id INNER JOIN surveymania.users u ON us.user_id = u.id WHERE u.id = ' + user.id + ' AND sh.id = ' + decrypted;
                    client.query(query, function(err, result) {
                        done();
                        if (err) res.status(500).json({code: 500, error: "Internal server error", message: "Error running query"});
                        else {
                            res.setHeader('Content-Type', 'application/json; charset=UTF-8');
                            res.json({code: 200, userSurveys: result.rows[0]});
                        }
                    })
                }
            });
        }
    });
})

.get('/app/organizationPanel', function (req, res) {
    if(req.user.usertypenumber != 3 && req.user.usertypenumber != 4) res.redirect('/401-unauthorized');
    else {
        res.setHeader("Content-Type", "text/html");
        res.render('partials/organizationPanel');
    }
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
