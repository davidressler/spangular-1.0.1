'use strict';

var app = angular.module('spangularApp', ['ui.state', "google-maps", 'Search-Module', 'listings', 'Search-Manager']);

app.run(function($rootScope, $state, $stateParams, $location, $timeout, Search){
	$rootScope.$state = $state;
	$rootScope.$stateParams = $stateParams;
    $rootScope.allowRefresh = true;
    $rootScope.$on('$stateChangeStart', function(ev) {
        if(!$rootScope.allowRefresh){
	        ev.preventDefault();
            $rootScope.allowRefresh = true;
        }

    });
	$rootScope.$on('$stateChangeSuccess', function(ev){
		// Set search from url; method will ignore invalid parameters
        // stateParams is the App's source of truth
		Search.setSearch($stateParams);

		// Does our url match our model?
		if(!Search.resolveSearch($stateParams)){
			//If not, which wins - url or search?

			// Is the url a valid search?
			// If not, navigate to new url based on our model
			if(!Search.isValid($stateParams)){
				$location.url($state.href($state.current.name, Search.getSearch())).replace();
			// If so, let errbody know the search model has been updated
			}else {
				$rootScope.$broadcast('updateSearch');
			}
		}
	});
});

app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

	$locationProvider.html5Mode(true).hashPrefix('!');

	var paramList = '?beds&lat&lon&zoom';

    $urlRouterProvider
        .when('', '/')
        .when('/', '/search')
        .when('/search', '/search/list')
        .otherwise('/');

    $stateProvider
        .state('search', {
	        abstract: true,
		    url: '/search',
            templateUrl: '/static/views/search.html',
		    controller: 'SearchCtrl'
         })
	        .state('search.list', {
	            url: '/list' + paramList,
	            templateUrl: '/static/views/search-list.html'
	         })
	        .state('search.map', {
	            url: '/map' + paramList,
	            templateUrl: '/static/views/search-map.html'
	        })
	    .state('search.listing', {
		    url: '/listing/:id' + paramList,
		    templateUrl: '/static/views/search-listing.html'
	    })
        .state('favorites', {
            url: '/favorites',
            templateUrl: '/static/views/favorites.html'
        });
});

app.directive('listView', function() {
	return {
		restrict: 'EA',
//		scope: {},
		templateUrl: '/static/views/list-view.html',
		link: function(scope, element, attrs){
//			console.log(scope);
		}
	}
});

var listings = angular.module('listings', []);

listings.factory('Listings', function($http) {
    return {
        getListings: function(callback) {
//            $http.get('http://pro.livelovely.com/frontendtest/yolo').success(function(data) {
//                callback(data);
//            });
	        callback([]);
        }
    }
});

app.directive('filter', function($stateParams) {
    return {
        restrict: 'EA',
        templateUrl: '/static/views/search-filter.html',
        scope: {},
	    transclude: true,
	    controller: 'SearchCtrl',
        link: function(scope, element, attrs) {
            var timer;

            element.bind("keyup paste", function () {
                timer && clearTimeout(timer);
                timer = setTimeout(function(){
                    scope.$apply(function () {
                        scope.filter();
                    });
                }, 500);
            });
        }
    }
});

app.directive('listingCell', function(){
	return {
		restrict: 'E',
		templateUrl: '/static/views/listing-cell.html',
		scope:{
			listing: '='
		},
		controller: function($scope, $location, $stateParams){
			$scope.showListing = function(id) {
				$location.path('/search/listing/' + id).search($stateParams);
			}
		}
	}
});
