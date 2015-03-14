'use strict';

var surveyManiaControllers = angular.module('surveyManiaControllers', []);

surveyManiaControllers.controller('LoginController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
    $scope.user = {email: '', password: ''};
    $scope.loginErrMess = undefined;
    $scope.submit = function () {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test($scope.user.email))
            return $scope.loginErrMess = 'Invalid email format!';
        var password = CryptoJS.SHA256($scope.user.password).toString();
        $http.post('/login', {email: $scope.user.email, password: password})
        .success(function (data, status, headers, config) {
            if (data.error == undefined) {
                console.log(data);
                $window.localStorage.token = data.token;
                $location.path( "/account");
            }
            else $scope.loginErrMess = data.error + '. ' + data.message;
        })
        .error(function (data, status, headers, config) {
            console.log(data);
            // Erase the token if the user fails to log in
            delete $window.localStorage.token;
            $scope.loginErrMess = data.error + '. ' + data.message;
        });
    };
}]);

surveyManiaControllers.controller('SigninController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
    $scope.user = {email: '', password: '', password2: '', firstname: '', lastname: '', adress: '', phone: '', inviter: ''};
    $scope.signinErrMess = undefined;
    $scope.signinSuccMess = undefined;
    $scope.submit = function () {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test($scope.user.email)) 
            return $scope.signinErrMess = 'Invalid email format!';
        if ($scope.user.email == '' || $scope.user.password == '' || $scope.user.password2 == '' || $scope.user.firstname == '' || $scope.user.lastname == '')
            return $scope.signinErrMess = 'Please provide all needed informations!';
        if ($scope.user.password != $scope.user.password2)
            return $scope.signinErrMess = 'The two passwords are not equals!';
        var password = CryptoJS.SHA256($scope.user.password).toString();
        var newuser = {
            email: $scope.user.email,
            password: password,
            firstname: $scope.user.firstname,
            lastname: $scope.user.lastname,
            adress: ($scope.user.adress == '') ? null : $scope.user.adress,
            phone: ($scope.user.phone == '') ? null : $scope.user.phone,
            inviter: ($scope.user.inviter == '') ? null : $scope.user.inviter
        }
        $http.post('/signin', newuser)
        .success(function (data, status, headers, config) {
            if (data.error == undefined) {
                console.log(data);
                $scope.signinSuccMess = "Your account has been successfully created. An email has been sent, please follow its intructions to finish your inscription.";
            }
            else $scope.signinErrMess = data.error + '. ' + data.message;
        })
        .error(function (data, status, headers, config) {
            console.log(data);
            $scope.signinErrMess = data.error + '. ' + data.message;
        });
    };
}]);

surveyManiaControllers.controller('AccountController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
    $scope.logout = function () {
        delete $window.localStorage.token;
        $location.path( "/login");
    };
}]);
