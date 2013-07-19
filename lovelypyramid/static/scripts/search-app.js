var searchModule = angular.module('Search-Module', []);

searchModule.factory('Search', function($http, $rootScope, $cookieStore, $q, $log, $timeout) {
    var currentSearch = null;

    var requiredParams = {
        'zoom': true,
        'center': true
    };

    var paramTypes = {
        'beds': 'intArr',
        'center': 'center',
        'zoom': 'int'
    };

    var validParams = function (url) {
        var valid = true;

        if ('zoom' in url && 'center' in url) {
            for (var param in requiredParams) {
                if (param === 'center') {
                    var latLng = url[param].split(',');

                    if (latLng.length === 2) {
                        for (var i=0; i < latLng.length; i++) {
                            var geo = parseFloat(latLng[i]);
                            if (geo[i] === null || geo[i].toString() === 'NaN') {
                                valid = false;
                            }
                        }
                    } else {
                        valid = false;
                    }
                } else {
                    if (url[param] === null || url[param].toString() === 'NaN') {
                        valid = false;
                    }
                }
            }
        } else {
            valid = false;
        }

        return valid;
    };

    var validModel = function (search) {
        var valid = true;

        var validParams = {
            'zoom': true,
            'center': true
        };

        if ('zoom' in search && 'center' in search) {
            for (var param in validParams) {
                if (param === 'center') {
                    if (search[param][0] === null || search[param][0].toString() === 'NaN' || search[param][1] === null || search[param][1].toString() === 'NaN') {
                        valid = false;
                    }
                } else {
                    if (search[param] === null || search[param].toString() === 'NaN') {
                        valid = false;
                    }
                }
            }
        } else {
            valid = false;
        }

        return valid;
    };

    var formatReturnedSearch = function(search) {
        for (var param in search) {
            if (paramTypes[param] === 'center') {
                search['center'][0] = parseFloat(search['center'][0]);
                search['center'][1] = parseFloat(search['center'][1]);
            }
            if (paramTypes[param] === 'int') {
                search[param] = parseInt(search[param]);
            }
        }

        return search;
    };

    var formatParams = function(params) {
        var newSearch = {}
        var splitCoords = params.center.split(',');

        newSearch['center'] = [splitCoords[0], splitCoords[1]];


        for (var param in params) {
            if (param != 'lon' && param != 'lat') {
                newSearch[param] = params[param];
            }
        }

        return newSearch;
    };

    this.saveSearchFromURL = function(search) {
        if (validParams(search)) {
            var search = formatParams(search);
            $http.post('/save/search', search).success(function (data) {
                    currentSearch = search;
                    $rootScope.$broadcast('SearchUpdated');

            });
        } else {
            $rootScope.$broadcast('SearchUpdated');
        }
    };

    this.saveSearchFromModel = function(search) {
        if (validModel(search)) {
            $http.post('/save/search', search).success(function (data) {
                    currentSearch = search;
                    $rootScope.$broadcast('SearchUpdated');
            });
        } else {
            $rootScope.$broadcast('SearchUpdated');
        }
    }

    this.getSearch = function() {
        if (currentSearch != null) {
            var deferred = $q.defer();
            deferred.resolve(formatReturnedSearch(currentSearch));
            return deferred.promise;
        } else {
            var promise = $http.get('/get/search').then(function (data) {
                console.log('DTO:', data.data.center)
                var formatted = formatReturnedSearch(data.data);

                $cookieStore.put('search', formatted);
                return formatReturnedSearch(formatted);
            });

            return promise;
        }

    };

    return {
        getSearch: this.getSearch,
        saveSearchFromURL: this.saveSearchFromURL,
        saveSearchFromModel: this.saveSearchFromModel
    }
});

searchModule.controller('SearchCtrl', function($rootScope, $scope, Search, Listings, $state, $location, $log, $timeout) {
    $timeout(function () {
        Search.getSearch().then(function (data) {
            $scope.search = data;
        });
    });

    $scope.search = {
        zoom: 2,
        center: [ 34, -122 ]
    };

    angular.extend($scope, {
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
                $scope.updateURL();
            },
	        dragstart: function(mapModel) {

	        },
            dragend: function() {

            },
	        zoom_changed: function(mapModel) {
//		        $scope.syncMapWithSearch(mapModel, true);
	        }
        }
    });

	Listings.getListings().then(function(data) {
		$scope.listings = data;
	});

	$scope.filter = function () {
//        $scope.updateModel({stopRefresh:true});
    };

    $scope.$on('SearchUpdated', function(evt, args) {
        Search.getSearch().then(function (data) {
            $scope.search = data;
        });
    });

    $scope.createParams = function(search) {
        var url = '?';
        for (var param in search) {
            if (! (url === '?') ) {
                url += '&'
            }

            if (param === 'center') {
                url += 'center='
                url += search[param][0];
                url += ','
                url += search[param][1];
            }

            else {
                url += param + '=' + search[param];
            }

        }
        return url;
    };

    $scope.updateURL = function() {
        var search = $scope.createParams($scope.search);
        var oldUrl = $location.url();
        var newUrl = $state.href($state.current.name) + search;

        if (newUrl != oldUrl) {
            $rootScope.allowRefresh = false;
            $location.url(newUrl);
            Search.saveSearchFromModel($scope.search);
        }
    };

    $scope.setView = function(name) {
        if (name === 'list') {
            var url = $state.href('search.list') + $scope.createParams($scope.search);
            $location.url(url);
        }  else if (name === 'map') {
            var url = $state.href('search.map') + $scope.createParams($scope.search);
            $location.url(url);
        }
    };

});

searchModule.filter('searchFilter', function() {

    return function(input, params) {
        var result = [];
//        if ('beds' in params) {
//            for (var bed in params.beds) {
//                for (var i in input) {
//                    if (input[i].Beds === params.beds[bed]) {
//                        result.push(input[i]);
//                    }
//                }
//            }
//        } else {
            for (var i in input) {
                result.push(input[i]);
            }
//        }
//        console.log('RESULT LENGTH: ', result.length);
        return result;
    };
});