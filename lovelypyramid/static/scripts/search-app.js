var searchModule = angular.module('Search-Module', []);

searchModule.provider('Search', function() {
    var defaultZoom = 12,
        defaultBeds = 3,
        defaultLat = 37,
        defaultLon = -122,
        searchObj = {
            beds: defaultBeds,
            lat: defaultLat,
            lon: defaultLon,
            zoom: defaultZoom
        };

    var requiredParams = {
        'zoom': true,
        'lat': true,
        'lon': true
    };

    this.getSearch = function() {
        var nulledVals = false,
            smartSearch = searchObj;

        for (var key in searchObj) {
            if ( ( !( key in requiredParams ) ) && ( ( searchObj[key].toString() == 'NaN') || searchObj[key] === null ) ) {
                nulledVals = true;
                delete smartSearch[key];
            }
        }

        if (nulledVals) {
            return smartSearch;
        }
        return searchObj;
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

    this.$get = function() {
        return {
            getSearch: this.getSearch,
	        isValid: this.isValid,
	        resolveSearch: this.resolveSearch,
            setSearch: this.setSearch
        }
    }
});

function SearchCtrl($scope, Search, Listings, $state, $location, $rootScope) {

    $scope.params = Search.getSearch();

	$scope.updateModel = function (config) {
		var url = $state.href($state.current.name, $scope.params);
		if('stopRefresh' in config && config['stopRefresh'] === true ) {
			$rootScope.allowRefresh = false;
		}
		$location.url(url);
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
        Search.setSearch($scope.params);
        $scope.updateModel({stopRefresh:true});
    };

	$scope.$on('updateSearch', function(){
		$scope.params = Search.getSearch();
	});

};
searchModule.$inject = ['$scope', '$state', '$stateParams', '$location', 'Search', 'Listings', '$rootScope'];

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