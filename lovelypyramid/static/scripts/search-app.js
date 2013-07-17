var searchModule = angular.module('Search-Module', []);

searchModule.factory('Search', function($http, $rootScope, SearchStateMgr) {
    var defaultZoom = 12,
        defaultBeds = 3,
        defaultLat = 37,
        defaultLon = -122,
        searchObj = {
            beds: defaultBeds,
            lat: defaultLat,
            lon: defaultLon,
            zoom: defaultZoom
        },
	    madeRequest = false;

    var requiredParams = {
        'zoom': true,
        'lat': true,
        'lon': true
    };

    this.getSearch = function(from) {
	    console.log("GET SEARCH");
        console.log('FROM:', from);
	    var that = this;
	    var search = {};
	    //Is there a search object stored on the server?
		if(!madeRequest){
            console.log('request heyyyy');
			return $http.get('/get/search').then(function(data){
				that.setSearch(data.data);
                console.log(searchObj);
				madeRequest = true;
                console.log('returning');
				return searchObj;

			});

		} else {
			return searchObj;
		}


	    var ReturnSearch = function() {
		    console.log('in return function');
		    //If all else fails
		    if (!that.isValid(search)) {
			    console.log('search isnt valid; updating to defaults');
			    search = searchObj;
		    } else {
			    console.log('search is valid! new shit');
			    searchObj = search;
		    }

		    // Filter out non-required null values
		    var nulledVals = false,
			    smartSearch = search;

		    for (var key in searchObj) {
			    if (( !( key in requiredParams ) ) && ( ( searchObj[key].toString() == 'NaN') || searchObj[key] === null || searchObj[key] == '')) {
				    nulledVals = true;
				    delete smartSearch[key];
			    }
		    }

		    if (nulledVals) {
			    return smartSearch;
		    }
		    return searchObj;
	    };

    };

	this.isValid = function(search){
		var valid = true;
		for(var param in requiredParams){
			if(!(param in search) || search[param] === null || search[param].toString() === 'NaN'){
				valid = false;
			}
		}
		return valid;
	};

	this.resolveSearch = function(stateParams) {
		var equal = true;
		for (var key in searchObj) {
			if (stateParams[key] != searchObj[key]) {
				equal = false;
			}
		}
		return equal;
	};

    this.setSearch = function(filters) {
	    if(this.isValid(filters)){
		    for (var filter in filters) {
			    if (searchObj.hasOwnProperty(filter)) {
				    searchObj[filter] = parseFloat(filters[filter]);
			    }
		    }
	    }
        return searchObj;
    };

    return {
        getSearch: this.getSearch,
        isValid: this.isValid,
        resolveSearch: this.resolveSearch,
        setSearch: this.setSearch
    }
});

searchModule.controller('SearchCtrl', function($rootScope, $scope, Search, SearchStateMgr, Listings, $state, $location) {

    $scope.params = {zoom: 13, lat: 40, lon: -150, beds: 2};

    $scope.$emit('SearchCtrlReady!!!');

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
			Search.setSearch($scope.params);

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
        console.log('1212121212', args);
    });

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