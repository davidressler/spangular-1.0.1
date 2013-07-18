var searchModule = angular.module('Search-Module', []);

searchModule.factory('Search', function($http, $rootScope, $cookieStore, $parse) {
    this.saveSearch = function(search) {
        $http.post('/save/search', search).success(function(data) {
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
                                beds: [],
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

    $scope.params = { beds: [2,3], lat: 40, lon: -150, zoom: 19 };

    $scope.beds = [];
    $scope.updateBeds = function() {
        if ($scope.params != undefined) {
            var result = [];
            for (var i = 0; i < 5; i++) {
                var bed = {};
                bed['value'] = i;
                if ($scope.params.beds.indexOf(i) === (-1)) {
                    bed['checked'] = false;
                } else {
                    bed['checked'] = true;
                }
                result.push(bed);
            }
            $scope.beds = result;
        }
    };
    $scope.updateBedsOnModel = function(index) {
        $scope.beds[index].checked = !$scope.beds[index].checked;
        var beds = [];
        for (var bed in $scope.beds){
            if(bed.checked) beds.push(parseInt(bed.value));
        }

        console.log($scope.params.beds)
        $scope.params.beds = beds;
        $scope.updateModel();
    };

	$scope.updateModel = function () {
//		var url = $state.href($state.current.name, $scope.params);
//		if('stopRefresh' in config && config['stopRefresh'] === true ) {
//			$rootScope.allowRefresh = false;
//		}
//		$location.url(url);
        SearchStateMgr.viewModelUpdated($scope.params);
	};

	$scope.syncSearchWithMap = function(mapModel, zoom_changed) {
		if (zoom_changed || $scope.params.zoom != mapModel.zoom || $scope.params.lon != mapModel.center.lng() || $scope.params.lat != mapModel.center.lat()) {
            $scope.params.zoom = mapModel.zoom;
            $scope.params.lon = mapModel.center.lng();
            $scope.params.lat = mapModel.center.lat();
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

	Listings.getListings().then(function(data) {
		$scope.listings = data;
	});


	$scope.filter = function () {
		colorConsole('FILTERING', 'blue', '21px');
        $scope.updateModel({stopRefresh:true});
    };

    $scope.$on('SearchUpdated', function(evt, args) {
        $scope.params = args;
        $scope.updateBeds();
        $scope.syncMapWithSearch();
        console.log($scope.params)
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
        var result = [];
		colorConsole($stateParams.beds, 'green', '14px');
        for (var i in input) {
            if (input[i].Beds == $stateParams.beds || $stateParams.beds === undefined) {
                result.push(input[i]);
            }
        }
        return result;
    };
});