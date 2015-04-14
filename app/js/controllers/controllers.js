'use strict';

var surveyManiaControllers = angular.module('surveyManiaControllers', []);

surveyManiaControllers.controller('GlobalController', ['$scope', '$window', '$location', function($scope, $window, $location) {
    $scope.isLogged;
    $scope.isLoggedFun = function(){$scope.isLogged = !($window.localStorage.token == undefined);console.log("inside:"+$scope.isLogged+"     isLogged:"+ $scope.isLogged);};
    $scope.isLoggedFun();

    $scope.isCustomer;
    $scope.isOrganization;
    $scope.isAdmin;
    $scope.initUserType = function () {
        var type = $window.localStorage.userType; $scope.isCustomer = false; $scope.isOrganization = false; $scope.isAdmin = false;
        if (type == 1) $scope.isCustomer = true;
        else if (type == 4 || type == 3) $scope.isOrganization = true;
        else if (type == 2) $scope.isAdmin = true;
    };
    $scope.initUserType();

    $scope.logout = function () {
        delete $window.localStorage.token;
        delete $window.localStorage.userType;
        $scope.isLoggedFun();
        $scope.initUserType();
        console.log("logout"+$scope.isLogged); 
        $location.path("/home");
    };
}]);


surveyManiaControllers.controller('LoginController', ['$rootScope', '$scope', '$http', '$window', '$location', '$route', function($rootScope, $scope, $http, $window, $location, $route) {
    $scope.user = {email: '', password: ''};
    $scope.loginErrMess = undefined;
    $scope.submit = function () {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test($scope.user.email))
            return $scope.loginErrMess = "Format d'email invalide!";
        var password = CryptoJS.SHA256($scope.user.password).toString();
        $http.post('/login', {email: $scope.user.email, password: password})
        .success(function (data, status, headers, config) {
            console.log(data);
            if (data.error == undefined) {
                //$window.location.reload(); // O-M-G
                $window.localStorage.token = data.token;
                $window.localStorage.userType = data.usertype;
                $scope.isLoggedFun();
                $scope.initUserType();
                if (data.usertype == 1 || data.usertype == 3 || data.usertype == 4) {
                    if ($rootScope.navigationPart != "account")
                        $location.path( "/account");
                    else $route.reload();
                }
                else $location.path( "/account/admin/validate/pro");
            }
            else {
                delete $window.localStorage.token;
                $scope.loginErrMess = data.error + '. ' + data.message;
            }
        })
        .error(function (data, status, headers, config) {
            console.log(data);
            // Erase the token if the user fails to log in
            delete $window.localStorage.token;
            $scope.loginErrMess = data.error + '. ' + data.message;
        });
    };
}]);

surveyManiaControllers.controller('SignupController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
    $scope.user = {type: 'particulier', email: '', password: '', password2: '', firstname: '', lastname: '',
                   address: '', postal: '', town: '', country: '', phone: '', inviter: '',
                   firmname: '', firmdescription: '', logo_skip: true};
    $scope.default_img ="img/default_profil.jpg";
    $scope.img ="img/default_profil.jpg";
    $scope.fetch_img = function() {
        $http.get('https://www.googleapis.com/customsearch/v1?key=AIzaSyBaiPSlrA4cVQKAv-RlRwo1UgkkVpOS67U&cx=004343761578996942245:kcfk8xi6kqk&q='+$scope.user.firmname+'+logo&searchType=image&fileType:jpg,png&imgSize=small&alt=json', {cache: true, responseType: "json"})
        .success(function (data, status, headers, config) {
            console.log(data);
            var items = data.items;
            var i = 0;
            while (items[i].mime === "image/gif") i++;

            var successCall = function (data, status, headers, config) {
                console.log(data);
                var myBlob = data;
                var reader = new FileReader();
                reader.onload = function(e) {
                    $scope.img = reader.result;
                    $scope.user.logo_skip = false;
                    $('#logo_suggestion').show();
                    $scope.$apply();
                    console.log($scope.img);
                }
                reader.readAsDataURL(myBlob);
            };

            var errorCall = function (data, status, headers, config) {
                i++;
                if (i < items.length) {
                    $http.get(items[i].link, {cache: true, responseType: "blob"})
                    .success(successCall)
                    .error(errorCall);
                }
            };

            $http.get(items[i].link, {cache: true, responseType: "blob"})
            .success(successCall)
            .error(errorCall);
        })
        .error(function (data, status, headers, config) {
            console.log(data);
        });
    };

    $scope.reset_default_image = function(){$scope.img = $scope.default_img;}

    $scope.isValidEmail = false;
    $scope.isValidConfirmPwd = false;
    $scope.isValidPwd = false;
    $scope.isValidFirstName = false;
    $scope.isValidLastName = false;
    $scope.isValidPhoneNumber = false;
    $scope.email_check = function(){$scope.isValidEmail = !(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test($scope.user.email));}
    $scope.pwd_check = function(){$scope.isValidPwd = !(/^(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/.test($scope.user.password));} 
    $scope.confirmpwd_check = function(){$scope.isValidConfirmPwd = !($scope.user.password == $scope.user.password2);}
    $scope.firstName_check = function(){$scope.isValidFirstName = !(/^[A-zÀ-ú-']{2,}$/.test($scope.user.firstname));}
    $scope.lastName_check = function(){$scope.isValidLastName = !(/^[A-zÀ-ú-']{2,}$/.test($scope.user.lastname));}
    $scope.phoneNumber_check = function(){$scope.isValidPhoneNumber = !(/^((\+|00)33\s?|0)[1-9](\s?\d{2}){4}$/.test($scope.user.phone));}
    // Champ non obligatoire. Si il y a déjà eu le focus dessus et que le champ est vide, ça met quand même le message d'erreur. Si le champ est non required et à 0 alors on enlève le msg d'erreur
    $("#phoneNumber").focusout(function() {if($scope.user.phone == 0){$scope.isValidPhoneNumber = false; $scope.$apply();}});

    $scope.change_form = function()
    {
        var pro = $(".professionnal_form");
        var pro_check = $(".pro_check");
        var part_check = $(".part_check");
        var par = $(".particulier_form");
        if (document.getElementById('professionnal').checked) {
            pro.find('input[type=text]:first').attr("required", true);
            pro_check.slideDown();
            par.find('input[type=text]:first').removeAttr("required");
            part_check.slideUp();
            $(".professionnal_form .link_primary").show();
        }
        else
        {
            pro.find('input[type=text]:first').removeAttr("required");
            pro_check.slideUp();
            par.find('input[type=text]:first').attr("required", true);
            part_check.slideDown();
            $(".professionnal_form .link_primary").hide();
        }
    }

    $scope.img_upload_form = function()
    {
        $('#img_upload').slideDown();
    }

    $scope.change_img_preview = function()
    {
        var fileInput = document.getElementById('uploadLogo');
        var file = fileInput.files[0];
        var imageType = /image.*/;

        if (file.type.match(imageType)) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $scope.img = reader.result;
                $scope.user.logo_skip = false;
                $scope.$apply();
            }
            reader.readAsDataURL(file); 
        }
    }

    $scope.signupErrMess = undefined;
    $scope.signupSuccMess = undefined;
    $scope.submit = function () {
        if ((document.getElementById('particulier').checked && ($scope.user.email == '' || $scope.user.password == '' || $scope.user.password2 == '' 
            || $scope.user.firstname == '' || $scope.user.lastname == '')) || 
            (document.getElementById('professionnal').checked && ($scope.user.email == '' || $scope.user.password == '' || $scope.user.password2 == '' 
            || $scope.user.firmname == '' || $scope.user.firmdescription == '')))
            return $scope.signupErrMess = 'Please provide all needed informations!';

        if($scope.isValidEmail || $scope.isValidConfirmPwd || $scope.isValidPwd || $scope.isValidFirstName || $scope.isValidLastName || $scope.isValidPhoneNumber)
            return $scope.signupErrMess = 'Please correct the errors below';

        var password = CryptoJS.SHA256($scope.user.password).toString();
        var newuser = {
            type: $scope.user.type,
            email: $scope.user.email,
            password: password,
            firstname: ($scope.user.firstname == '') ? null : $scope.user.firstname,
            lastname: ($scope.user.lastname == '') ? null : $scope.user.lastname,
            adress: ($scope.user.address == '') ? null : $scope.user.address,
            postal: ($scope.user.postal == '') ? null : $scope.user.postal,
            town: ($scope.user.town == '') ? null : $scope.user.town,
            country: ($scope.user.country == '') ? null : $scope.user.country,
            phone: ($scope.user.phone == '') ? null : $scope.user.phone,
            inviter: ($scope.user.inviter == '') ? null : $scope.user.inviter,
            firmname: ($scope.user.firmname == '') ? null : $scope.user.firmname,
            firmdescription: ($scope.user.firmdescription == '') ? null : $scope.user.firmdescription,
            logo_img: $scope.img,
            logo_type: '',
            logo_skip: $scope.user.logo_skip
        }

        if (newuser.logo_skip == false) {
            var splits = newuser.logo_img.split(/:(.+)?/);
            console.log(splits[0]);
            if (splits[0] != 'data') return $scope.signupErrMess = 'Bad logo image format!';
            splits = splits[1].split(/\/(.+)?/);
            console.log(splits[0]);
            if (splits[0] != 'image') return $scope.signupErrMess = 'Bad logo image format!';
            splits = splits[1].split(/;(.+)?/);
            console.log(splits[0]);
            if (splits[0] != 'png' && splits[0] != 'jpeg') return $scope.signupErrMess = 'Bad logo image format!';
            else newuser.logo_type = (splits[0] == 'png') ? 'png' : 'jpg';
            splits = splits[1].split(/,(.+)?/);
            console.log(splits[0]);
            if (splits[0] != 'base64') return $scope.signupErrMess = 'Bad logo image format!';
            newuser.logo_img = splits[1];
        }

        $http.post('/signup', newuser)
        .success(function (data, status, headers, config) {
            if (data.error == undefined) {
                console.log(data);
                $scope.signupSuccMess = "Your account has been successfully created. An email has been sent, please follow its intructions to finish your inscription.";
            }
            else $scope.signupErrMess = data.error + '. ' + data.message;
        })
        .error(function (data, status, headers, config) {
            console.log(data);
            $scope.signupErrMess = data.error + '. ' + data.message;
        });
    };

    if ($location.$$path != "/account")
        googleInitialize();
}]);

surveyManiaControllers.controller('ValidateProAccount', ['$scope', '$http', '$window', function($scope, $http, $window) {
    $scope.verifErrMess = undefined;
    $scope.verifSuccMess = undefined;
    $scope.validate_pro_account = function($id)
    {
        $http.post('/app/account/admin/validate/pro',  {id: $id})
        .success(function (data, status, headers, config) {
            console.log(data);
            if (data.error == undefined) {
                $scope.verifSuccMess = "Le compte a bien été validé.";
                $("#account-pro-" + $id).toggle(700, function () {
                    $("#account-pro-" + $id).removeClass("account-pro");
                    console.log($(".account-pro"));
                    if ($(".account-pro").length == 0)
                        $("#account-pro-none").show();
                });
            }
            else $scope.verifErrMess = data.error + '. ' + data.message;
        })
        .error(function (data, status, headers, config) {
            console.log(data);
            $scope.verifErrMess = data.error + '. ' + data.message;
        });
    }

}]);

surveyManiaControllers.controller('AccountController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {

    var oldUser;
    var oldOrganization;
    $http.post('/app/getUser/')
        .success(function (data, status, headers, config) {
            console.log(data);
            if (data.error == undefined) {
                oldUser = angular.copy(data.user);
                $scope.user = data.user;

                if ($scope.user.owner_type == 3)
                {
                    console.log("idorga:"+$scope.user.owner_organization);
                    $http.post('/app/getUserOrganization/', {userOrganization:$scope.user.owner_organization})
                    .success(function (data, status, headers, config) {
                        console.log(data);
                        if (data.error == undefined) {
                            oldOrganization = angular.copy(data.organization);
                            $scope.organization = data.organization;
                        }
                        else $scope.verifErrMess = data.error + '. ' + data.message;
                    })
                    .error(function (data, status, headers, config) {
                        $scope.verifErrMess = data.error + '. ' + data.message;
                    });
                }
            }
            else $scope.verifErrMess = data.error + '. ' + data.message;
        })
        .error(function (data, status, headers, config) {
            $scope.verifErrMess = data.error + '. ' + data.message;
        });

    $scope.submitProfileChange = function()
    {
         $http.post('/app/profileChange/', {newuser:$scope.user, olduser:oldUser})
        .success(function (data, status, headers, config) {
            console.log(data);
            if (data.error == undefined) {
                console.log("nickel");
            }
            else $scope.verifErrMess = data.error + '. ' + data.message;
        })
        .error(function (data, status, headers, config) {
            $scope.verifErrMess = data.error + '. ' + data.message;
        });
    }

    $scope.reduce = false;
    $scope.tab_hide = function() {
        $("#show_about").hide();
        $("#ss-container").hide();
        $("#account-main").show();
    }
    $scope.tab_show = function($id)
    {
        $("#account-main").hide();
        if (!$scope.reduce)
        {
            $scope.reduce = true;
            $("#profil_bg").animate({height:"100px"},400);
            $("#profil_img").animate({width:"70px",height:"70px", marginRight:"50px"},400);
            $("#default_profil").fadeOut(600, function(){$("#default_profil").css("padding","16px 0px 10px 0px")
                .css("display","flex").css("align-items","center").css("justify-content","center")});
        }
        $("#show_about").hide();
        $("#ss-container").hide();
        $("#"+$id+"").fadeIn();
    }
    
    // Edit profile
    $scope.showEditProfileField=false;
    $scope.addressEdit=false;
    $scope.emailEdit=false;
    $scope.phoneEdit=false;
    $scope.isValidOldPwd=false;
    $scope.isValidPwd=false;
    $scope.isValidConfirmPwd=false;
    $scope.isValidPhoneNumber = false;
    $scope.isValidEmail = false;
    $scope.editProfileField = function(){$scope.showEditProfileField = !$scope.showEditProfileField;}
    $scope.displayChangePassword=function(){$("#changePassword").toggle();}

    $scope.oldPasswordCompare=function(){
        $scope.editProfile=true;
        var password = CryptoJS.SHA256($scope.oldpwd).toString();
        $scope.isValidOldPwd = !(password == $scope.user.owner_password);
    }
    $scope.pwd_check = function(){$scope.isValidPwd = !(/^(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/.test($scope.newPwd));} 
    $scope.confirmpwd_check = function(){$scope.isValidConfirmPwd = !($scope.newPwd == $scope.newPwdConfirm);}
    $scope.email_check = function(){$scope.isValidEmail = !(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test($scope.user.owner_email));}
    $scope.phoneNumber_check = function(){$scope.isValidPhoneNumber = !(/^((\+|00)33\s?|0)[1-9](\s?\d{2}){4}$/.test($scope.user.owner_tel));}

    //Edit firm profile

    $scope.isValidFirmPhoneNumber = false;
    $scope.showEditFirmField=false;
    $scope.firmPhoneNumber_check = function(){$scope.isValidFirmPhoneNumber = !(/^((\+|00)33\s?|0)[1-9](\s?\d{2}){4}$/.test($scope.organization.organization_tel));}
    $scope.editFirmField = function(){$scope.showEditFirmField = !$scope.showEditFirmField;}

    googleAccountInitialize();

    // Save profile changes
    $scope.submitProfileChange = function()
    {
        var password;
        if($scope.newPwd == undefined)
            password = $scope.user.owner_password;
        else
            password = CryptoJS.SHA256($scope.newPwd).toString();

        var ownerType;
        if ($scope.user.owner_type == 1 || $scope.user.owner_type == 2)
            ownerType = 'particulier';
        else if($scope.user.owner_type == 3 || $scope.user.owner_type == 4)
            ownerType = 'professional';

        var edituser = {
            id: $scope.user.owner_id,
            firstname: $scope.user.owner_firstname,
            lastname: $scope.user.owner_lastname,
            type: ownerType,
            email: $scope.user.owner_email,
            password: password,
            adress: ($scope.user.owner_adress == '') ? null : $scope.user.owner_adress,
            postal: ($scope.user.owner_postal == '') ? null : $scope.user.owner_postal,
            town: ($scope.user.owner_town == '') ? null : $scope.user.owner_town,
            country: ($scope.user.owner_country == '') ? null : $scope.user.owner_country,
            phone: ($scope.user.owner_tel == '') ? null : $scope.user.owner_tel,
        }

        $http.post('/editUserProfile', edituser)
        .success(function (data, status, headers, config) {
            if(data.verifMail)
            {
                $scope.editSuccMess = "Un mail vous a été envoyé pour confirmer votre nouvelle adresse e-mail";
                $scope.user.owner_email = oldUser.owner_email;
            }

            else if (data.error == undefined) {
                $scope.showEditField = false;
                $scope.editSuccMess = "Vos modifications ont bien été prises en compte";
            }
            else
            {
                $scope.editErrMess = data.error + '. ' + data.message;
                if (data.code == 1)
                    $scope.user.owner_email = oldUser.owner_email;
            }
        })
        .error(function (data, status, headers, config) {
            console.log(data);
            $scope.editErrMess = data.error + '. ' + data.message;
        });
    }

    //Save firm changes
    $scope.submitFirmChange = function()
    {
         var editfirm = {
            id: $scope.organization.organization_id,
            adress: ($scope.organization.organization_adress == '') ? null : $scope.organization.organization_adress,
            postal: ($scope.organization.organization_postal == '') ? null : $scope.organization.organization_postal,
            town: ($scope.organization.organization_town == '') ? null : $scope.organization.organization_town,
            country: ($scope.organization.organization_country == '') ? null : $scope.organization.organization_country,
            phone: ($scope.organization.organization_tel == '') ? null : $scope.organization.organization_tel,
            description: ($scope.organization.organization_description == '') ? null : $scope.organization.organization_description
        }

        $http.post('/editFirmProfile', editfirm)
        .success(function (data, status, headers, config) {
            if (data.error == undefined) {
                $scope.showEditFirmField = false;
                $scope.editSuccMess = "Vos modifications ont bien été prises en compte";
            }
            else
                $scope.editErrMess = data.error + '. ' + data.message;
        })
        .error(function (data, status, headers, config) {
            $scope.editErrMess = data.error + '. ' + data.message;
        });
    }

}]);

surveyManiaControllers.controller('MailVerifyController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
    $scope.user = {email: '', password: ''};
    $scope.verifSuccMess = undefined;
    $scope.verifErrMess = undefined;
    $scope.submit = function (token) {
        var password = CryptoJS.SHA256($scope.user.password).toString();
        $http.post('/accounts/verify/' + token, {password: password})
        .success(function (data, status, headers, config) {
            console.log(data);
            if (data.error == undefined) {
                $scope.verifSuccMess = 'Votre compte a bien été activé. Vous pouvez dès à présent vous connecter.';
            }
            else {
                $scope.verifErrMess = data.error + '. ' + data.message;
            }
        })
        .error(function (data, status, headers, config) {
            console.log(data);
            $scope.verifErrMess = data.error + '. ' + data.message;
        });
    };
    $scope.submit2 = function () {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test($scope.user.email))
            return $scope.verifErrMess = "Format d'email invalide!";
        $http.post('/accounts/get/verify', {email: $scope.user.email})
        .success(function (data, status, headers, config) {
            console.log(data);
            if (data.error == undefined) {
                $scope.verifSuccMess = 'Un nouveau mail avec votre code de vérification a bien été envoyé.';
            }
            else {
                $scope.verifErrMess = data.error + '. ' + data.message;
            }
        })
        .error(function (data, status, headers, config) {
            console.log(data);
            $scope.verifErrMess = data.error + '. ' + data.message;
        });
    };
}]);

surveyManiaControllers.controller('PwdResetController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
    $scope.user = {email: '', password: '', password2: ''};
    $scope.resetSuccMess = undefined;
    $scope.resetErrMess = undefined;
    $scope.submit = function (token) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test($scope.user.email))
            return $scope.resetErrMess = "Format d'email invalide!";
        if ($scope.user.password != $scope.user.password2)
            return $scope.resetErrMess = "Les deux mots de passe doivent être identiques!";
        var password = CryptoJS.SHA256($scope.user.password).toString();
        $http.post('/accounts/reset/' + token, {email: $scope.user.email, password: password})
        .success(function (data, status, headers, config) {
            console.log(data);
            if (data.error == undefined) {
                $scope.resetSuccMess = 'Votre mot de passe a été changé avec succès.';
            }
            else {
                $scope.resetErrMess = data.error + '. ' + data.message;
            }
        })
        .error(function (data, status, headers, config) {
            console.log(data);
            $scope.resetErrMess = data.error + '. ' + data.message;
        });
    };
    $scope.submit2 = function () {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test($scope.user.email))
            return $scope.resetErrMess = "Format d'email invalide!";
        $http.post('/accounts/get/reset', {email: $scope.user.email})
        .success(function (data, status, headers, config) {
            console.log(data);
            if (data.error == undefined) {
                $scope.resetSuccMess = 'Un nouveau mail avec votre code de réinitialisation a bien été envoyé.';
            }
            else {
                $scope.resetErrMess = data.error + '. ' + data.message;
            }
        })
        .error(function (data, status, headers, config) {
            console.log(data);
            $scope.resetErrMess = data.error + '. ' + data.message;
        });
    };
}]);

surveyManiaControllers.controller('MySurveysController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
    $scope.userSurveys = [];
    $scope.lastAddedSurvey = null;
    $scope.resultMessage = null;
    $scope.dismissButton = null;
    $scope.validateButton = null;
    $scope.QRcode = null;

    $http.post('/app/getUserSurveys/')
        .success(function (data, status, headers, config) {
            $scope.userSurveys = data.userSurveys;
    });

    $('#confirmScanModal')
        .on('hide.bs.modal', function () {
            cameraPause(false);
        })
        .on('show.bs.modal', function() {
            cameraPause(true);
        });
    
    $scope.addSurvey = function (readedQRcode) {
        $scope.QRcode = null;
        $http.post('/app/addUserSurvey/', {qrcode: readedQRcode})
            .success(function (data, status, header, config) {
                switch (data.message.toUpperCase()) {
                    case "SCANNING ERROR":
                        $scope.resultMessage = "Le QRcode n'est pas lisible";
                        $scope.dismissButton = "Réessayer";
                        $scope.validateButton = null;
                        break;
                    case "NOT VALID":
                        $scope.resultMessage = "Ce QRcode est invalide";
                        $scope.dismissButton = "Réessayer";
                        $scope.validateButton = null;
                        break;
                    case "ALREADY SCANNED":
                        $scope.resultMessage = "Vous avez déjà scanné ce QRcode";
                        $scope.dismissButton = "Réessayer";
                        $scope.validateButton = null;
                        break;
                    case "UNKNOWN SURVEY":
                        $scope.resultMessage = "Ce QRcode est invalide";
                        $scope.dismissButton = "Réessayer";
                        $scope.validateButton = null;
                        break;
                    case "VALID":
                        $scope.resultMessage = "Nouveau sondage disponible : " + data.surveyHeader.surveyname + " pour " + data.surveyHeader.points + " points !";
                        $scope.validateButton = "Ajouter à ma liste";
                        $scope.dismissButton = "Annuler";
                        $scope.QRcode = readedQRcode;
                        break;
                    default:
                        $scope.resultMessage = "Erreur inconnue";
                        $scope.dismissButton = "Réessayer";
                }
            })
            .error(function (data, status, header, config) {
                $scope.resultMessage = "Erreur interne";
                $scope.dismissButton = "Réessayer";
                $scope.validateButton = null;
            });
        $("#confirmScanModal").modal('show');
    };

    $scope.validateAddSurvey = function () {
        $http.post('/app/validateAddUserSurvey/', {qrcode: $scope.QRcode})
            .success(function (data, status, header, config) {
                $scope.userSurveys.unshift({organame: data.userSurveys.organame, surveyname: data.userSurveys.surveyname, points: data.userSurveys.points, infos: data.userSurveys.infos, completed: data.userSurveys.completed});
            });
        $("#confirmScanModal").modal('hide');
    };
}]);

surveyManiaControllers.controller('OrganizationPanel', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
    $scope.categories = [];
    $scope.newCategory = {name: "", color: ""};
    $scope.updatedCategory = {name: "", color: ""};
    $scope.oldCategory;
    $scope.isValidCategoryName = true;
    $scope.isValidCategoryColor = true;

    $http.post('/app/category/get')
        .success(function (data, status, header, config) {
            $scope.categories = data.categories;
        });

    $scope.categoryNameCheck = function () {$scope.isValidCategoryName = (/^.{2,25}$/.test($scope.newCategory.name));}
    $scope.categoryColorCheck = function () {$scope.isValidCategoryColor = (/^#(\d|[A-F]){6}$/.test($scope.newCategory.color));}

    $scope.addCategory = function () {
        $http.post('/app/category/add', {newCategory: $scope.newCategory})
            .success(function (data, status, header, config) {
                if (data.message == "done")
                    $scope.categories.unshift({name: $scope.newCategory.name, color: $scope.newCategory.color});
            })
            .error(function (data, status, header, config) {

            });
    };

    $scope.updateCategory = function () {
        $http.post('/app/category/update', {category: $scope.updatedCategory, old_category: $scope.oldCategory})
            .success(function (data, status, header, config) {
                alert(data.message);
            })
            .error(function (data, status, header, config) {

            });
    }
}]);