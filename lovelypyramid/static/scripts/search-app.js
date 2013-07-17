var searchModule = angular.module('Search-Module', []);

searchModule.factory('Search', function($http, $rootScope, $cookieStore, $parse) {
    this.saveSearch = function(search) {
        $http.post('/save/search', search).success(function(data) {
            console.log('SUCCESSFULLY SAVED: ', search);
            $cookieStore.put('search', search);
        });
    };

    this.getSearch = function() {
        var that = this;
        var search = $cookieStore.get('search');

        if (search != undefined) {
            return search;
        } else {
            var worker = new Worker('/static/scripts/workers/getSearch.js');

            worker.addEventListener("message", function (data) {
                var parsedData = $.parseJSON(data.data);
                if ('failed' in parsedData) {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(function (pos) {
                            search = {
                                beds: null,
                                lat: pos.coords.latitude,
                                lon: pos.coords.longitude,
                                zoom: 15
                            }
                            console.log('about to RET SERVER SRCH from GEO LOCATION');
                            that.saveSearch(search);
                            $rootScope.returnedServerSearch(search);
                        });
                    }
                } else {
                    $rootScope.returnedServerSearch(parsedData);
                    $cookieStore.put('search', parsedData);
                }
            }, false);
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


    $scope.params = { beds: 3, lat: 40, lon: -150, zoom: 19 };

	$scope.updateModel = function () {
//		var url = $state.href($state.current.name, $scope.params);
//		if('stopRefresh' in config && config['stopRefresh'] === true ) {
//			$rootScope.allowRefresh = false;
//		}
//		$location.url(url);
        console.log('ViewModel is about to update:', $scope.params);
        SearchStateMgr.viewModelUpdated($scope.params);
	};

	$scope.syncSearchWithMap = function(mapModel, zoom_changed) {
		if (zoom_changed || $scope.params.zoom != mapModel.zoom || $scope.params.lon != mapModel.center.lng() || $scope.params.lat != mapModel.center.lat()) {
            $scope.params.zoom = mapModel.zoom;
            console.log('ZOOM ==', $scope.params.zoom);
            $scope.params.lon = mapModel.center.lng();
            console.log('LONG ==', $scope.params.lon);
            $scope.params.lat = mapModel.center.lat();
            console.log('LAT ==', $scope.params.lat);

            console.log('All together now... ==', $scope.params);

            $scope.updateModel();
		}
	};

    $scope.syncMapWithSearch = function() {
        if($scope.params != undefined) {
            $scope.center = {
                latitude: $scope.params.lat,
                longitude: $scope.params.lon
            };
            $scope.zoom = $scope.params.zoom;
        }
    }

    angular.extend($scope, {
        center: {
            latitude: $scope.params.lat, // initial map center latitude
            longitude: $scope.params.lon // initial map center longitude
        },
        zoom: $scope.params.zoom,
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
	            $scope.syncSearchWithMap(mapModel);

            },
	        dragstart: function(mapModel) {

	        },
            dragend: function() {

            },
	        zoom_changed: function(mapModel) {
		        $scope.syncMapWithSearch(mapModel, true);
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
        $scope.syncMapWithSearch();
    });

    $scope.setView = function(name) {
        console.log('SETVIEW', $scope.params);

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