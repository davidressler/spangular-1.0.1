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


    // Listeners
    //////////////
    $rootScope.$on('SearchCtrlReady!!', function () {
        updateViewModel();
    });


    // Private
    //////////////
    var updateUrl = function () {
        console.log('update url');
        $rootScope.allowRefresh = false;
        $location.url($state.href($state.current.name, searchObj));
    };

    var updateFactoryModel = function () {
        console.log('update factory')
        $rootScope.updateSearchFactory(searchObj);
    };

    var updateViewModel = function () {
        console.log('about to BC');
        $rootScope.$broadcast('SearchUpdated', searchObj);
    };


    // Public
    //////////////
    var URLUpdated = function(search) {
        console.log('URL Updated: ', search);
        searchObj = search;
        updateFactoryModel();
        updateViewModel();
    };

    var factoryModelUpdated = function(search) {
        console.log('Factory Updated: ', search);
        searchObj = search;
        updateUrl();
        updateViewModel();
    };

    var viewModelUpdated = function (search) {
        console.log('VM Updated: ', search);
        searchObj = search;
        updateUrl();
        updateFactoryModel();
    };

    return {
        URLUpdated: URLUpdated,
        factoryModelUpdated: factoryModelUpdated,
        viewModelUpdated: viewModelUpdated
    }
});