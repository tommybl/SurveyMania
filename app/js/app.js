'use strict';

var surveyManiaApp = angular.module('surveyManiaApp', ['ngRoute', 'surveyManiaConfig', 'surveyManiaControllers', 'surveyManiaServices', 'surveyManiaFilters']);

surveyManiaApp.config(['$routeProvider',
    function($routeProvider) {
        // angularjs routing
        $routeProvider.
        when('/login', {
            templateUrl: '/login',
            controller: '',
            navigationPart: 'login'
        }).
        when('/signin', {
            templateUrl: '/signup_form',
            controller: '',
            navigationPart: 'signin'
        }).
        when('/account', {
            templateUrl: '/app/account',
            controller: '',
            navigationPart: 'account'
        }).
        when('/401-unauthorized', {
            templateUrl: '/401-unauthorized',
            controller: '',
            navigationPart: '401-unauthorized'
        }).
        otherwise({
            redirectTo: '/login'
        });
    }
]);

surveyManiaApp.factory('authInterceptor', function ($rootScope, $q, $window, $location) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            config.headers.Authorization = 'Bearer ' + $window.localStorage.token;
            return config;
        },
        response: function (response) {
            if (response.status == 401) {
                $location.path( "/401-unauthorized");
            }
            return response || $q.when(response);
        },
        responseError: function(rejection) {
            if (rejection.status == 401) {
                $location.path('/401-unauthorized');
            }
            return $q.reject(rejection);
        }
    };
});

surveyManiaApp.config(function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
});

surveyManiaApp.run(function ($rootScope, $location, $route, $templateCache, $injector) {

    // allow user to change route directly in browser url bar without refreshing the page
    var original = $location.path;
    $location.path = function (path, reload) {
        if (reload === false) {
            var lastRoute = $route.current;
            var un = $rootScope.$on('$locationChangeSuccess', function () {
                $route.current = lastRoute;
                un();
            });
        }
        return original.apply($location, [path]);
    };
    
    // when user changes route, before next page rendering
    $rootScope.$on("$routeChangeStart", function(event, next, current) {

        // remove all partial views from angularjs cache, to render modifications according to user infos updates
        $templateCache.removeAll();
    });

    // after the route was successfully changed
    $rootScope.$on('$routeChangeSuccess', function(ev,data) {
        
        if (data.$$route) {
            $rootScope.navigationPart = data.$$route.navigationPart;
        }
    });
});