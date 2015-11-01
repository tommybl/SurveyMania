'use strict';

var surveyManiaApp = angular.module('surveyManiaApp', ['ngRoute', 'surveyManiaConfig', 'surveyManiaControllers', 'surveyManiaServices', 'surveyManiaFilters', 'ngSanitize', 'ngAnimate', 'ngDragDrop']);

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
        when('/accounts/verifyEmail/:token', {
            templateUrl: function(params){ return '/accounts/verifyEmail/' + params.token; },
            controller: '',
            navigationPart: 'accounts/verifyEmail'
        }).
        when('/mysurveys', {
            templateUrl: '/app/mysurveys',
            controller: '',
            navigationPart: 'mysurveys'
        }).
        when('/createSurvey', {
            templateUrl: '/app/createSurvey',
            controller: '',
            navigationPart: 'createSurvey'
        }).
        when('/createGame', {
            templateUrl: '/app/createGame',
            controller: '',
            navigationPart: 'createGame'
        }).
        when('/surveyAnswer/:surveyid', {
            templateUrl: function(params){ return '/app/surveyAnswer/' + params.surveyid; },
            controller: '',
            navigationPart: 'mysurveys'
        }).
        when('/previsualisation/:surveyid', {
            templateUrl: function(params){ return '/app/previsualisation/' + params.surveyid; },
            controller: '',
            navigationPart: 'createSurvey'
        }).
        when('/results/:surveyid', {
            templateUrl: function(params){ return '/app/results/' + params.surveyid; },
            controller: '',
            navigationPart: 'organizationPanel'
        }).
        when('/organizationPanel', {
            templateUrl: '/app/organizationPanel',
            controller: '',
            navigationPart: 'organizationPanel'
        }).
        when('/account/admin/validate/pro', {
            templateUrl: '/app/account/admin/validate/pro',
            controller: '',
            navigationPart: 'account/admin/validate/pro'
        }).
        /*when('/account/pro/shop-admins', {
            templateUrl: '/app/account/pro/shopadmins',
            controller: '',
            navigationPart: 'account/pro/shop-admins'
        }).*/
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
        when('/ranking', {
            templateUrl: '/ranking',
            controller: '',
            navigationPart: 'ranking'
        }).
        when('/games', {
            templateUrl: '/app/games',
            controller: '',
            navigationPart: 'games'
        }).
        when('/game/:gameid', {
            templateUrl: function(params){ return '/app/game/' + params.gameid; },
            controller: '',
            navigationPart: function(params){ return 'game/' + params.gameid; }
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
            if (config.url.charAt(0) == '/')
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

    $rootScope.showInfosBubble = true;

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