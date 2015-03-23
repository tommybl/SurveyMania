'use strict';

var surveyManiaControllers = angular.module('surveyManiaControllers', []);

surveyManiaControllers.controller('LoginController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
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
                $window.localStorage.token = data.token;
                if (data.usertype == 1 || data.usertype == 3 || data.usertype == 4)
                    $location.path( "/account");
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
    $scope.user = {email: '', password: '', password2: '', firstname: '', lastname: '', adress: '', postal: '', town: '', country: '', phone: '', inviter: ''};
    $scope.default_img ="img/default_profil.jpg";
    $scope.img ="img/default_profil.jpg";
    $scope.fetch_img = function() {
        console.log($scope.user.firmname)
        $.ajax({
            url: 'https://www.googleapis.com/customsearch/v1?key=AIzaSyBaiPSlrA4cVQKAv-RlRwo1UgkkVpOS67U&cx=004343761578996942245:kcfk8xi6kqk&q='+$scope.user.firmname+'+logo&searchType=image&fileType:jpg,png&imgSize=small&alt=json',
            type: "GET",
            dataType: 'json',
            cache: true,
            success: function (data, status, error) {
              var i = 0;
              while (data.items[i].mime === "image/gif")
                i++;
              $scope.img=data.items[i].link;
              $('#logo_suggestion').show();
              $scope.$apply();
              console.log('success', data.items[i].mime);
            },
            error: function (data, status, error) {
              console.log('error', data, status, error);
            }
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
        var pro = document.getElementsByClassName("professionnal_form");
        var pro_check = document.getElementsByClassName("pro_check");
        var part_check = document.getElementsByClassName("part_check");
        var par = document.getElementsByClassName("particulier_form");
        if (document.getElementById('professionnal').checked) {
            for (var i = 0; i < pro.length; i++)
            {
                $(pro_check[i]).find('input[type=text]:first').attr("required", true);
                $(pro[i]).slideDown();
            }
            for (var i = 0; i < par.length; i++)
            {
                $(part_check[i]).find('input[type=text]:first').removeAttr("required");
                $(par[i]).hide();
            }
        }
        else
        {
            for (var i = 0; i < pro.length; i++)
            {
                $(pro_check[i]).find('input[type=text]:first').removeAttr("required");
                $(pro[i]).hide();
            }
            for (var i = 0; i < par.length; i++)
            {
                $(part_check[i]).find('input[type=text]:first').attr("required", true);
                $(par[i]).slideDown();
            }
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
            email: $scope.user.email,
            password: password,
            firstname: $scope.user.firstname,
            lastname: $scope.user.lastname,
            adress: ($scope.user.address == '') ? null : $scope.user.address,
            postal: ($scope.user.postal == '') ? null : $scope.user.postal,
            town: ($scope.user.town == '') ? null : $scope.user.town,
            country: ($scope.user.country == '') ? null : $scope.user.country,
            phone: ($scope.user.phone == '') ? null : $scope.user.phone,
            inviter: ($scope.user.inviter == '') ? null : $scope.user.inviter
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
    $scope.logout = function () {
        delete $window.localStorage.token;
        $location.path( "/home");
    };

    $scope.reduce = false;
    $scope.tab_show = function($id)
    {
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
