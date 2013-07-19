var searchModule = angular.module('Search-Module', []);

searchModule.factory('Search', function($http, $rootScope, $cookieStore, $q, $log, $timeout) {
    var requiredParams = {
        'zoom': true,
        'lat': true,
        'lon': true
    };

    var paramTypes = {
        'beds': 'intArr',
        'center': 'center',
        'lat': 'int',
        'lon': 'int',
        'zoom': 'int'
    };

    var validParams = function (url) {
        var valid = true;

        var validParams = {
            'zoom': true,
            'lat': true,
            'lon': true
        };

        if ('zoom' in url && 'lat' in url && 'lon' in url) {
            for (var param in validParams) {
                if (url[param] === null || url[param].toString() === 'NaN') {
                    valid = false;
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
                    if (search[param].lat === null || search[param].lat.toString() === 'NaN' || search[param].lon === null || search[param].lon.toString() === 'NaN') {
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
                search['center'].lat = parseFloat(search['center'].lat);
                search['center'].lon = parseFloat(search['center'].lon);
            }
            if (paramTypes[param] === 'int') {
                search[param] = parseInt(search[param]);
            }
        }
        return search;
    };

    var formatParams = function(search) {
        var newSearch = {}

        newSearch['center'] = {
            'lat': search.lat,
            'lon': search.lon
        }

        for (var param in search) {
            if (param != 'lon' && param != 'lat') {
                newSearch[param] = search[param];
            }
        }

        return newSearch;
    };

    this.saveSearchFromURL = function(search) {
        if (validParams(search)) {
            var search = formatParams(search);
            $http.post('/save/search', search).success(function (data) {
                colorConsole('save from url', 'green', '18px');
                    $cookieStore.put('search', search);
                    $rootScope.$broadcast('SearchUpdated');

            });
        } else {
            $rootScope.$broadcast('SearchUpdated');
        }
    };

    this.saveSearchFromModel = function(search) {
        if (validModel(search)) {
            $http.post('/save/search', search).success(function (data) {
                    colorConsole('save from model', 'blue', '18px');
                    console.log(search);
                    $cookieStore.put('search', search);
                    $rootScope.$broadcast('SearchUpdated');
            });
        } else {
            $rootScope.$broadcast('SearchUpdated');
        }
    }

    this.getSearch = function() {
        var search = $cookieStore.get('search');
        $log.error('GETTING COOKIE:', search);

        if (search != null) {
            var deferred = $q.defer();
            $timeout(function() {
                deferred.resolve(formatReturnedSearch(search));
            });
            return deferred.promise;
        } else {
            var promise = $http.get('/get/search').then(function (data) {
                var formatted = formatReturnedSearch(data.data);
                $cookieStore.put('search', formatted);
                return formatReturnedSearch(formatted);
            });

            return promise;
        }




//        if (search != undefined) {
//            deferred.resolve(search);
//            return deferred.promise;
//        } else {
//
//        }
//
//        $http.get('/get/search').then(function(data) {
//            return data.data;
//        });
//
//        return deferred;

//        var search = $cookieStore.get('search');
//
//        if (search != undefined) {
//            console.log('got from cookies', search)
//            return search;
//        } else {
//            var worker = new Worker('/static/scripts/workers/getSearch.js');
//
//            worker.addEventListener("message", function (data) {
//                var parsedData = $.parseJSON(data.data);
//                if ('failed' in parsedData) {
//                    console.log('got from LOCAL')
//                    if (navigator.geolocation) {
//                        navigator.geolocation.getCurrentPosition(function (pos) {
//                            search = {
//                                beds: [1],
//                                lat: pos.coords.latitude,
//                                lon: pos.coords.longitude,
//                                zoom: 15
//                            }
//                            console.log('about to RET SERVER SRCH from GEO LOCATION');
//                            that.saveSearch(search);
//                            $rootScope.returnedServerSearch(search);
//                        });
//                    }
//                } else {
//                    console.log('got from server')
//                    $rootScope.returnedServerSearch(parsedData);
//                    $cookieStore.put('search', parsedData);
//                }
//            }, false);
//        }

    };

    return {
        getSearch: this.getSearch,
        saveSearchFromURL: this.saveSearchFromURL,
        saveSearchFromModel: this.saveSearchFromModel
    }
});

searchModule.controller('SearchCtrl', function($rootScope, $scope, Search, Listings, $state, $location, $log, $timeout) {

    $scope.search = {
        zoom: 2,
        center: {
            lat: 34,
            lon: -122
        }
    };

    Search.getSearch().then(function(data) {
        $log.warn('INITIAL GETTING SEARCH', data);
        $scope.search = data;
    });

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


//    $scope.$watch('search.zoom', function () {
//        console.log('IN THE ZOOM watch');
//    });
//    $scope.$watch('search.center.lat', function () {
//        console.log('IN THE LAT');
//    });
//    $scope.$watch('search.center.lon', function () {
//        console.log('IN THE LON');
//    });

    $scope.$on('SearchUpdated', function(evt, args) {
        Search.getSearch().then(function (data) {
            $scope.search = data;
            console.log('BROADCAST GET SEARCH: ', $scope.search);
        });


//        $scope.updateBeds();
//        $scope.syncMapWithSearch();
//        console.log($scope.params)
    });

    $scope.createParams = function(search) {
        var url = '?';
        for (var param in search) {
            if (! (url === '?') ) {
                url += '&'
            }

            if (param === 'center') {
                url += 'lat='
                url += search[param].lat;
                url += '&lon='
                url += search[param].lon;
            }

            else {
                url += param + '=' + search[param];
            }

        }
        return url;
    };

    $scope.updateURL = function() {
        var search = $scope.createParams($scope.search);
        $rootScope.allowRefresh = false;
        $location.url($state.href($state.current.name) + search);
        Search.saveSearchFromModel($scope.search);
    };

    $scope.setView = function(name) {
        if (name === 'list') {
            $rootScope.allowRefresh = true;
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
        console.log('RESULT LENGTH: ', result.length);
        return result;
    };
});