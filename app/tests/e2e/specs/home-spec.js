describe('the homepage ', function() {
    beforeEach(function(){
      browser.get('http://localhost:8000');
    });
  
    it('should display the title *CHUV-DEV*', function() {
      var title = element(by.css('#topnav h2'));
      expect(title.getText()).toBe("CHUV-DEV");
    });
  
    it('should display a page content area with 4 info boxes', function() { 
      var tiles = element.all(by.css('.page-content .info-tile')); 
      expect(tiles.count()).toBe(4);
    });
  
    it('should display a page content area containing a panel *Recent Models*', function(done) { 
      var panelh2 = element.all(by.css('.page-content .panel h2')); 
      panelh2.get(0).getText().then(function(txt){
        expect(txt.toLowerCase()).toEqual('recent models');
        done();
      });
  
    });
  
    it('should display a page content area containing a panel *Recent Articles*', function(done) { 
      var panelh2 = element.all(by.css('.page-content .panel h2')); 
      panelh2.get(1).getText().then(function(txt){
        expect(txt.toLowerCase()).toEqual('recent articles');
        done();
      });
    });    
});