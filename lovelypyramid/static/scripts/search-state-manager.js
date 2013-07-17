var searchStateManager = angular.module('Search-State-Mgr', []);

searchStateManager.factory('SearchStateMgr', function($rootScope, $location, $state) {
    // Local Vars
    //////////////
    var searchObj = {
        beds: 4,
        lat: 37,
        lon: -122,
        zoom: 12
    };

    var requiredParams = {
        'zoom': true,
        'lat': true,
        'lon': true
    };


    // Listeners
    //////////////
    $rootScope.$on('SearchCtrlReady', function () {
        updateViewModel();
    });


    // Private
    //////////////
    var updateUrl = function () {
        console.log('updateURL is called', searchObj);
        $rootScope.allowRefresh = false;
        console.log('location', $location);
        $location.url($state.href($state.current.name, searchObj));
    };

    var updateFactoryModel = function () {
        $rootScope.Search.saveSearch(searchObj);
    };

    var updateViewModel = function () {
        console.log('updateVM is called', searchObj);
        $rootScope.$broadcast('SearchUpdated', searchObj);
    };

    var validSearch = function (search) {
        var valid = true;
        for (var param in requiredParams) {
            if (!(param in search) || search[param] === null || search[param].toString() === 'NaN') {
                valid = false;
            }
        }
        return valid;
    };

    var setSearch = function(search) {
        if (validSearch(search)) {
            for (var key in search) {
                search[key] = parseFloat(search[key]);
            }
            searchObj = search;
            return true;
        }
        return false;
    };

    var syncSearchModel = function() {
        updateUrl();
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
            console.log('GSR:', result);
            if (result == null) {
                syncSearchModel();
            } else {
                searchObj = result;
                updateUrl();
                updateViewModel();
            }
        }
    };

    var factoryModelUpdated = function(search) {
        console.log('Factory Model Updated with: ', search)
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