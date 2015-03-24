'use strict';

var surveyManiaApp = angular.module('surveyManiaApp', ['ngRoute', 'surveyManiaConfig', 'surveyManiaControllers', 'surveyManiaServices', 'surveyManiaFilters', 'ngSanitize']);

surveyManiaApp.config(['$routeProvider',
    function($routeProvider) {
        // angularjs routing
        $routeProvider.
         when('/', {
            redirectTo: '/home'
        }).
        when('/home', {
            templateUrl: '/home',
            controller: '',
            navigationPart: 'home'
        }).
        when('/account', {
            templateUrl: '/app/account',
            controller: '',
            navigationPart: 'account'
        }).
        when('/account/admin/validate/pro', {
            templateUrl: '/app/account/admin/validate/pro',
            controller: '',
            navigationPart: 'account/admin/validate/pro'
        }).
        when('/accounts/verify/:token', {
            templateUrl: function(params){ return '/accounts/verify/' + params.token; },
            controller: '',
            navigationPart: 'accounts/verify'
        }).
        when('/accounts/reset/:token', {
            templateUrl: function(params){ return '/accounts/reset/' + params.token; },
            controller: '',
            navigationPart: 'accounts/reset'
        }).
        when('/401-unauthorized', {
            templateUrl: '/401-unauthorized',
            controller: '',
            navigationPart: '401-unauthorized'
        }).
        when('/404-notfound', {
            templateUrl: '/404-notfound',
            controller: '',
            navigationPart: '404-notfound'
        }).
        otherwise({
            redirectTo: '/404-notfound'
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
            else if (response.status == 404) {
                $location.path( "/404-notfound");
            }
            return response || $q.when(response);
        },
        responseError: function(rejection) {
            if (rejection.status == 401) {
                $location.path('/401-unauthorized');
            }
            else if (rejection.status == 404) {
                $location.path( "/404-notfound");
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
        $('#myModal').modal('hide');
        $('#myModal2').modal('hide');
        if (data.$$route) {
            $rootScope.navigationPart = data.$$route.navigationPart;
        }
    });
});