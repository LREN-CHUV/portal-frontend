var helpers = require('protractor-helpers');

function toNumber(promiseOrValue) {
  // if it is not a promise, then convert a value
  if (!protractor.promise.isPromise(promiseOrValue)) {
      return parseInt(promiseOrValue, 10);
  }
  // if promise - convert result to number
  return promiseOrValue.then(function (stringNumber) {
      return parseInt(stringNumber, 10);
  });
}




describe('the EE (explore) page ', function() {
  beforeEach(function(done){
    browser.get('http://localhost:8000/explore');
    loginButton = element.all(by.css('#login_btn'));
    loginButton.count().then(function(count){
      if (count === 1){
        loginButton.get(0).click().then(function(){
          var panel = element.all(by.css('.panel-footer'));
          panel(by.css('#agree')).click();
          panel(by.css('button.btn-primary')).click().then(function(){
            done();
          });    
        });   
      } else {
        //terms and service page
        var tos = element.all(by.css('.panel-footer #agree'));
        tos.count().then(function(count){
          if (count === 1){
            panel.all(by.css('#agree')).get(0).click().then(function(){
              panel.all(by.css('button.btn-primary')).get(0).click().then(function(){
                browser.get('http://localhost:8000/explore');
                done();
              });
            });
          } else {
            done();
          }

        });
      }
    });
  });


  describe('has a layout that ', function() {
    var titles;
    beforeEach(function(){
      titles = element.all(by.css('.panel .panel-heading h2'));
    });

    it('should have the title *Epidemiological Exploration*', function(done) {
      var title = element.all(by.css('.page-content h3')).get(0);
      title.getText().then(function(txt){
        expect(txt.toLowerCase()).toEqual('epidemiological exploration');
        done();
      });
    });

    it('should have a panel with the title *1. Select dataset*', function(done) {      
      titles.get(0).getText().then(function(txt){
        expect(txt.toLowerCase()).toEqual('1. select dataset');
        done();
      });
    });
  
    it('should have a panel with the title *2. Select variable*', function(done) {
      titles.get(1).getText().then(function(txt){
        expect(txt.toLowerCase()).toEqual('2. select variable');
        done();
      });
    });

    it('should have a panel with the title *Variable overview*', function(done) {
      titles.get(2).getText().then(function(txt){
        expect(txt.toLowerCase()).toEqual('variable overview');
        done();
      });
    });
  
    it('should have a panel with the title *3. Add variables to Model*', function(done) {
      titles.get(3).getText().then(function(txt){
        expect(txt.toLowerCase()).toEqual('3. add variables to model');
        done();
      });
    });

  });


  describe('in the panel `dataset`', function() {
    
    var panel;
    beforeEach(function(){
      panel = element.all(by.css('.panel:nth-child(1)'));
    });

    it('should display a list of datasets', function() {     
      var list = panel.all(by.css('.dataset-list'));
      expect(list.count()).toEqual(1);
    });

    it('should have a list of datasets that contains a least one dataset', function() {      
      var dataset = panel.all(by.css('.dataset-list span:nth-child(1) a')).get(0);
      expect(dataset.isPresent()).toBe(true);
    });

    it('should visually select a dataset when the corresponding dataset button is clicked', function() {      
      var dataset = panel.all(by.css('.dataset-list span:nth-child(1) a')).get(0);
      dataset.click();
      expect(helpers.hasClass(dataset, 'active')).toBe(true);
    });

  });

  describe('in the panel `select variable` ', function() {
    
    var panel, bubble;
    beforeEach(function(){
      panel = element.all(by.css('.panel:nth-child(1)'));
      bubble = panel.all(by.css('.panel-body:nth-child(1)>svg circle.node--leaf')).get(0);
    });

    it('should display a list of 6 shortcuts', function() {     
      var list = panel.all(by.css('.panel-body>.panel-body>span>a'));
      expect(list.count()).toEqual(6);
    });

    it('should display a list of shortcuts that are: `Genetic` `brain_metabolism` `Brain` `Demographics` `Clinical` `Provenance`', function(done) {     
      var list = panel.all(by.css('.panel-body>.panel-body:nth-child(1)>span>a'));
      var text = [];
      list.each(function(el, i){
        el.getText().then(function(txt){
          text.push(txt);
          if (i == 5) {
            expect(text[0]).toEqual('Genetic');
            expect(text[1]).toEqual('brain_metabolism');
            expect(text[2]).toEqual('Brain');
            expect(text[3]).toEqual('Demographics');
            expect(text[4]).toEqual('Clinical');
            expect(text[5]).toEqual('Provenance');
            done();
          }
        });
      });
    });

    it('should zoom the same bubble item when a bubble item is clicked', function() {      
      expect(toNumber(bubble.getAttribute('r'))).toBeLessThan(7);//4.053769907494721

      bubble.click();

      expect(toNumber(bubble.getAttribute('r'))).toBeGreaterThan(70);//69.80421083246561
    });

    it('should display the variable detail in the variable-statistics panel when a bubble item is clicked', function(done) {      
      var variableStatisticsPanel = element.all(by.css('.panel')).get(2);

      bubble.click();

      var text = [];
      var details = variableStatisticsPanel.all(by.css('.panel-body div>b+span, .panel-body div>b+variable-description'));
      details.each(function(el, i){
        el.getText().then(function(txt){
          text.push(txt);
          if (i == 3){
            expect(text[0]).toEqual('ApoE4');
            expect(text[1]).toEqual('adni-merge');
            expect(text[2]).toEqual('polynominal');
            expect(text[3]).toEqual('Apolipoprotein E (APOE) e4 allele: is the strongest risk factor for Late Onset Alzheimer Disease (LOAD). At least one copy of APOE-e4');
            done();
          }
        });
      });
    });

  });

  describe('in the panel `variable-configuration` ', function() {

    var panel, buttons, cols;
    beforeEach(function(){
      panel = element.all(by.css('.panel')).get(3);
      buttons = panel.all(by.css('.panel-body .explore-container button'));
      cols = panel.all(by.css('.panel-body .explore-container>div.column'));
    });

    it('should display 3 buttons', function() {       
      expect(buttons.count()).toEqual(3);
    });

    it('should display the first button labelled as : *as variable* ', function(done) {           
      buttons.get(0).getText().then(function(txt){
        expect(txt.toLowerCase()).toContain('as variable');
        done();
      });
    });

    it('should display the second button labelled as *as covariable*', function(done) {       
      buttons.get(1).getText().then(function(txt){
        expect(txt.toLowerCase()).toContain('as covariable');
        done();
      });
    });

    it('should display the third buttons labelled as : *as filter*', function(done) {       
      buttons.get(2).getText().then(function(txt){
        expect(txt.toLowerCase()).toContain('as filter');
        done();
      });
    });

    it('should do nothing when the first button `as variable` is clicked at initial state', function() {         
      buttons.get(0).click().then(
        function(){
          fail('button 1 `as variable` should not be clickable');
      }, function(error){  
        expect(error.message.toString()).toContain("is not clickable at point");
      });  
    });

    it('should do nothing when the second button `as covariable` is clicked at initial state', function() {         
      buttons.get(1).click().then(
        function(){
          fail('button 2 `as covariable should not be clickable');
      }, function(error){  
        expect(error.message.toString()).toContain("is not clickable at point");
      });  
    });

    it('should do nothing when the third button `as filter` is clicked at initial state', function() {         
      buttons.get(2).click().then(
        function(){
          fail('button 3 `as filter` should not be clickable');
      }, function(error){  
        expect(error.message.toString()).toContain("is not clickable at point");
      });  
    });

    function get_ApoE4_bubble(){
      return element.all(by.css('.panel:nth-child(1) .panel-body:nth-child(1)>svg circle.node--leaf')).get(0);
    }

    it('should add a variable to the `Variable` column when the variable bubble item is clicked and then the first button `as variable` is clicked', function() {         
      bubble = get_ApoE4_bubble();
      bubble.click();
      buttons.get(0).click();
      expect(cols.get(0).all(by.css('h3+div')).count()).toEqual(1);
    });

    it('should add a variable to the `Covariable - grouping` column when the variable bubble item is clicked and then the first button `as variable` is clickedand and then the second button `as covariable`', function() {         
      bubble = get_ApoE4_bubble();
      bubble.click();
      buttons.get(0).click();
      buttons.get(1).click();
      expect(cols.get(0).all(by.css('h3+div')).count()).toEqual(0);
      expect(cols.get(1).all(by.css('h3+div')).count()).toEqual(1);
    });

  

  })

});