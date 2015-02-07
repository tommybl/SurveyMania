'use strict';

var surveyManiaApp = angular.module('surveyManiaApp', ['ngRoute', 'surveyManiaConfig', 'surveyManiaControllers', 'surveyManiaServices']);

surveyManiaApp.config(['$routeProvider',
    function($routeProvider) {
        // angularjs routing
        $routeProvider.
        when('/index', {
            templateUrl: '/partials/index',
            controller: '',
            navigationPart: 'index'
        }).
        otherwise({
            redirectTo: '/index'
        });
    }
]);

surveyManiaApp.run(function ($rootScope, $location, $route, $templateCache) {

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