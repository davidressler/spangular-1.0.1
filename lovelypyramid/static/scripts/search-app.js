var searchModule = angular.module('Search-Module', []);

searchModule.factory('Search', function($http, $rootScope, $cookieStore, $parse) {
    this.saveSearch = function(search) {
        $http.post('/save/search', search).success(function(data) {
            console.log('SAVED: ', data)
            $cookieStore.put('search', search);
        });
    };

    this.getSearch = function() {
        var that = this;
//        var search = $cookieStore.get('search');

        var search = undefined;

        if (search != undefined) {
            console.log('in cookie: ', search);
            return search;
        } else {
            console.log('WORKER')
            var worker = new Worker('/static/scripts/workers/getSearch.js');

            worker.addEventListener("message", function (data) {
                var parsedData = $.parseJSON(data.data);
                $rootScope.returnedServerSearch(parsedData);
                $cookieStore.put('search', parsedData);
            }, false);



//            $http.get('/get/search')
//                .success(function(data) {
//                    console.log('in success: ', data);
//                    $cookieStore.put('search', data);
//                    return data;
//                })
//                .error(function() {
//                    console.log('in error: ');
//                    if (navigator.geolocation) {
//                        navigator.geolocation.getCurrentPosition(function (pos) {
//                            search = {
//                                beds: null,
//                                lat: pos.coords.latitude,
//                                lon: pos.coords.longitude,
//                                zoom: 15
//                            }
//
//                            that.saveSearch(search);
//
//                            return search;
//                        });
//                    }
//                });
//
//            return null;
        }

    };

    return {
        getSearch: this.getSearch,
        saveSearch: this.saveSearch
    }
});

searchModule.controller('SearchCtrl', function($rootScope, $scope, SearchStateMgr, Listings, $state, $location, $timeout) {

    $timeout(function () {
        $scope.$emit('SearchCtrlReady');

    }, 0);

    $scope.params = { beds: 3, lat: 40, lon: -150, zoom: 12 };

	$scope.updateModel = function (config) {
//		var url = $state.href($state.current.name, $scope.params);
//		if('stopRefresh' in config && config['stopRefresh'] === true ) {
//			$rootScope.allowRefresh = false;
//		}
//		$location.url(url);
        SearchStateMgr.viewModelUpdated($scope.params);
	};

	$scope.updateMap = function(mapModel, zoom_changed) {
		if (zoom_changed || $scope.params.zoom != mapModel.zoom || $scope.params.lon != mapModel.center.lng() || $scope.params.lat != mapModel.center.lat()) {
			$scope.params.zoom = mapModel.zoom;
			$scope.params.lon = mapModel.center.lng();
			$scope.params.lat = mapModel.center.lat();

			$scope.updateModel({stopRefresh: true});
		}
	};

    angular.extend($scope, {
        center: {
            latitude: $scope.params.lat, // initial map center latitude
            longitude: $scope.params.lon // initial map center longitude
        },
	    options: {
			mapTypeControl: false,
		    streetViewControl: false,
		    panControl: false,
		    keyboardShortcuts: false
	    },
        markers: [], // an array of markers,
        events: {
            bounds_changed: function() {
//                if (!beenSeen) {
//                    beenSeen = true;
//                }
            },
            idle: function (mapModel) {
	            $scope.updateMap(mapModel);

            },
	        dragstart: function(mapModel) {

	        },
            dragend: function() {

            },
	        zoom_changed: function(mapModel) {
		        $scope.updateMap(mapModel, true);
	        }
        }
    });

	Listings.getListings(function(data) {
		$scope.listings = data;
	});

	$scope.filter = function () {
        $scope.updateModel({stopRefresh:true});
    };

    $scope.$on('SearchUpdated', function(evt, args) {
        $scope.params = args;
    });

    $scope.setView = function(name) {
        if (name === 'list') {
            var url = $state.href('search.list', $scope.params);
            $location.url(url);
        }  else if (name === 'map') {
            var url = $state.href('search.map', $scope.params);
            $location.url(url);
        }
    };

});

searchModule.filter('searchFilter', function($stateParams) {

    return function(input) {
        var res = [];

        for (var i in input) {
            if (input[i].Beds == $stateParams.beds || $stateParams.beds === null) {
                res.push(input[i]);
            }
        }
        return res;
    };
});