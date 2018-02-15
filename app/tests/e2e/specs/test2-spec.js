describe('the homepage ', function() {
  beforeEach(function(){
    browser.get('http://localhost:8000');
  });

  it('should have the title *CHUV-DEV*', function() {
    var h2 = element(by.css('#topnav h2'));
    expect(h2.getText()).toBe("CHUV-DEV");
  });

  it('should have a page content area with 4 info boxes', function() { 
    var tiles = element.all(by.css('.page-content .info-tile')); 
    expect(tiles.count()).toBe(4);
  });

  it('should have a page content area containing a panel *Recent Models*', function(done) { 
    var panelh2 = element.all(by.css('.page-content .panel h2')); 
    panelh2.get(0).getText().then(function(txt){
      expect(txt.toLowerCase()).toEqual('recent models');
      done();
    });

  });

  it('should have a page content area containing a panel *Recent Articles*', function(done) { 
    var panelh2 = element.all(by.css('.page-content .panel h2')); 
    panelh2.get(1).getText().then(function(txt){
      expect(txt.toLowerCase()).toEqual('recent articles');
      done();
    });
  });    
});


describe('the EE (explore) page ', function() {
  beforeEach(function(){
    browser.get('http://localhost:8000/explore');
  });

  it('should have the title *Epidemiological Exploration*', function(done) {
    var h3 = element.all(by.css('.page-content h3')).get(0);
    h3.getText().then(function(txt){
      expect(txt.toLowerCase()).toEqual('epidemiological exploration');
      done();
    });
  });
  
});