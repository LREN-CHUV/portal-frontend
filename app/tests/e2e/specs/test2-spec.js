/*describe('the homepage ', function() {
  beforeEach(function(){
    browser.get('http://localhost:8000');
  });

  it('should have the title *CHUV-DEV*', function() {
    var title = element(by.css('#topnav h2'));
    expect(title.getText()).toBe("CHUV-DEV");
  });

  it('should have a page content area with 4 info boxes', function() { 
    var tiles = element.all(by.css('.page-content .info-tile')); 
    //console.log(tiles);
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
});*/

var helpers = require('protractor-helpers');
describe('the EE (explore) page ', function() {
  beforeEach(function(){
    browser.get('http://localhost:8000/explore');
  });

  /*it('should have the title *Epidemiological Exploration*', function(done) {
    var title = element.all(by.css('.page-content h3')).get(0);
    title.getText().then(function(txt){
      expect(txt.toLowerCase()).toEqual('epidemiological exploration');
      done();
    });
  });

  describe('has a layout that ', function() {
    var title;
    beforeEach(function(){
      title = element.all(by.css('.panel .panel-heading h2'));
    });

    it('should have a panel with the title *1. Select dataset*', function(done) {      
      title.get(0).getText().then(function(txt){
        expect(txt.toLowerCase()).toEqual('1. select dataset');
        done();
      });
    });
  
    it('should have a panel with the title *2. Select variable*', function(done) {
      title.get(1).getText().then(function(txt){
        expect(txt.toLowerCase()).toEqual('2. select variable');
        done();
      });
    });

    it('should have a panel with the title *Variable overview*', function(done) {
      title.get(2).getText().then(function(txt){
        expect(txt.toLowerCase()).toEqual('variable overview');
        done();
      });
    });
  
    it('should have a panel with the title *3. Add variables to Model*', function(done) {
      title.get(3).getText().then(function(txt){
        expect(txt.toLowerCase()).toEqual('3. add variables to model');
        done();
      });
    });

  });*/

  describe('in the panel dataset', function() {
    var panel;
    beforeEach(function(){
      panel = element.all(by.css('.panel:nth-child(1)'));
    });

    it('should have a list of datasets', function() {     
      var list = panel.all(by.css('.dataset-list'));
      expect(list.count()).toEqual(1);
    });

    it('should have a list of datasets that contains a least one dataset', function() {      
      var dataset = panel.all(by.css('.dataset-list span:nth-child(1) a')).get(0);
      //browser.waitForAngular();
      expect(dataset.isPresent()).toBe(true);
    });

    it('should visually select a dataset when the corresponding dataset button is clicked', function() {      
      var dataset = panel.all(by.css('.dataset-list span:nth-child(1) a')).get(0);
      dataset.click();
      expect(helpers.hasClass(dataset, 'active')).toBe(true);
    });

    /*it('should add to url dataset when the corresponding dataset button is clicked', function(done) {      
      var dataset = panel.all(by.css('.dataset-list span:nth-child(1) a')).get(0);
      dataset.click();
      browser.waitForAngular();
      //expect(helpers.hasClass(dataset, 'active')).toBe(true);
      browser.getCurrentUrl().then(function(url) {
        console.log(url);
        done();
      });
    });*/
  });








});