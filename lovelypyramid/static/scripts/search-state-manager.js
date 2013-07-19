var searchStateManager = angular.module('Search-State-Mgr', []);

searchStateManager.factory('SearchStateMgr', function($rootScope, $location, $state) {
    // Local Vars
    //////////////
    var searchObj = {
        beds: [2],
        lat: 37,
        lon: -122,
        zoom: 12
    };

    var requiredParams = {
        'zoom': true,
        'lat': true,
        'lon': true
    };

    var typeOfParams = {
        beds: 'intArray',
        lat: 'float',
        lon: 'float',
        zoom: 'int'
    }


    // Listeners
    //////////////
    $rootScope.$on('SearchCtrlReady', function () {
        updateViewModel();
    });


    // Private
    //////////////
//    var updateUrl = function (replaceHistory) {
//        $rootScope.allowRefresh = false;
//        if (replaceHistory) {
//            $location.url($state.href($state.current.name, searchObj)).replace();
//        } else {
//            $location.url($state.href($state.current.name, searchObj));
//        }
//    };

    var updateFactoryModel = function () {
        console.log('SAVING SEARCH FROM FACTORY')
        console.log(searchObj)
        $rootScope.Search.saveSearch(searchObj);
    };

    var updateViewModel = function () {
        $rootScope.$broadcast('SearchUpdated', searchObj);
    };

//    var validSearch = function (search) {
//        var valid = true;
//        for (var param in requiredParams) {
//            if (!(param in search) || search[param] === null || search[param].toString() === 'NaN') {
//                valid = false;
//            }
//        }
//        return valid;
//    };

    var trimUselessParams = function(search) {
        var nulledVals = false;

        for (var key in search) {
            if (typeOfParams[key] === 'float') {
                search[key] = parseFloat(search[key]);
            }
            if (typeOfParams[key] === 'int') {
                search[key] = parseInt(search[key]);
            }
            if (typeOfParams[key] === 'intArray') {
                var newBeds = [];

                if (typeof search[key] === 'string') {
                    newBeds = search[key].split(',');
                } else if (Array.isArray(search[key])) {
                    newBeds = search[key];
                }

                var final = [];
                for (var i=0; i < newBeds.length; i++) {
                    if (!isNaN(parseInt(newBeds[i]))) {
                        final.push(parseInt(newBeds[i]));
                    }
                }
                if (final.length === 0) {
                    search[key] = null;
                } else {
                    search[key] = final;
                }
            }

            if (( !( key in requiredParams ) ) && ( ( search[key] === null || search[key].toString() == 'NaN') || search[key] == '')) {
                nulledVals = true;
                delete search[key];
            }
        }
        console.log('Current search', search)

        return search;
    }

    var setSearch = function(search) {
        if (validSearch(search)) {
            searchObj = trimUselessParams(search);
            $rootScope.Search.saveSearch(search);
            return true;
        }
        return false;
    };

    var lastResortSyncSearchModel = function() {
        updateUrl(true);
        updateFactoryModel();
        updateViewModel();
        $rootScope.Search.saveSearch(searchObj);
    }


    // Public
    //////////////
    var URLUpdated = function(search) {
        if ( setSearch(search) ) {
            updateFactoryModel();
            updateViewModel();
        } else {
            var result = $rootScope.Search.getSearch();
            if (result == null) {
                lastResortSyncSearchModel();
            } else {
                searchObj = result;
                updateUrl(true);
                updateViewModel();
            }
        }
    };

    var factoryModelUpdated = function(search) {
        setSearch(search);
        updateUrl();
        updateViewModel();
    };

    var viewModelUpdated = function (search) {
        setSearch(search);
        updateUrl();
        updateFactoryModel();
    };

    return {
        URLUpdated: URLUpdated,
        factoryModelUpdated: factoryModelUpdated,
        viewModelUpdated: viewModelUpdated
    }
});