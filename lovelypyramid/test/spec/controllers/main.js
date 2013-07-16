describe('Flight management system', function () {
    beforeEach(module('ui.compat'));
	beforeEach(module('Search-Module'));
	beforeEach(module('listings'));

    describe('SearchCtrl', function () {
        var scope, controller, state;

    // load the controller's module
    beforeEach(
        module('spangularApp')
    );

    var scope,
        SearchCtrl;

    // Initialize the controller and a e2e scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();

        SearchCtrl = $controller('SearchCtrl', {
            $scope: scope
        });
    }));

    it('should shit the bed', function() {
       expect(scope.bingo()).toBe(4);
    });
});