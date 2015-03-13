'use strict';

var surveyManiaControllers = angular.module('surveyManiaControllers', []);

surveyManiaControllers.controller('LoginController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
    $scope.user = {email: '', password: ''};
    $scope.loginErrMess = undefined;
    $scope.submit = function () {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (re.test($scope.user.email)) {
            var password = CryptoJS.SHA256($scope.user.password).toString();
            $http.post('/login', {email: $scope.user.email, password: password})
            .success(function (data, status, headers, config) {
                console.log("success");
                console.log(data);
                $window.localStorage.token = data.token;
                $location.path( "/account");
            })
            .error(function (data, status, headers, config) {
                console.log("error");
                console.log(data);
                // Erase the token if the user fails to log in
                delete $window.localStorage.token;
                // Handle login errors here
                $scope.loginErrMess = data.error + '. ' + data.message;
            });
        }
        else $scope.loginErrMess = 'Invalid email format!';
    };
}]);

surveyManiaControllers.controller('AccountController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
    $scope.logout = function () {
        delete $window.localStorage.token;
        $location.path( "/login");
    };
}]);

surveyManiaControllers.controller('TodoController', ['$scope', function($scope) {
    $scope.todos = [
      {text:'learn angular', done:true},
      {text:'build an angular app', done:false}];
 
    $scope.addTodo = function() {
      $scope.todos.push({text:$scope.todoText, done:false});
      $scope.todoText = '';
    };
 
    $scope.remaining = function() {
      var count = 0;
      angular.forEach($scope.todos, function(todo) {
        count += todo.done ? 0 : 1;
      });
      return count;
    };
 
    $scope.archive = function() {
      var oldTodos = $scope.todos;
      $scope.todos = [];
      angular.forEach(oldTodos, function(todo) {
        if (!todo.done) $scope.todos.push(todo);
      });
    };
  }]);
