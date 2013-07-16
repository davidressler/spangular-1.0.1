describe('e2e setup', function() {

    beforeEach(function() {
       browser().navigateTo('/');
    });

    it('should redirect to searchlist', function() {
//        expect(1).toBe(1);
       expect(browser().location().url()).toBe('/search/list?beds=3&lat=37&lon=-122&zoom=12');
    });
});