describe("the IA (review) page ", function() {
  beforeEach(function(done) {
    browser.get("http://localhost:8000/review");
    loginButton = element.all(by.css("#login_btn"));
    loginButton.count().then(function(count) {
      if (count === 1) {
        loginButton.get(0).click().then(function() {
          element.all(by.css(".panel-footer #agree")).get(0).click();
          element
            .all(by.css(".panel-footer button.btn-primary"))
            .get(0)
            .click()
            .then(function() {
              done();
            });
        });
      } else {
        //terms and service page
        var tos = element.all(by.css(".panel-footer #agree"));
        tos.count().then(function(count) {
          if (count === 1) {
            element
              .all(by.css(".panel-footer #agree"))
              .get(0)
              .click()
              .then(function() {
                element
                  .all(by.css(".panel-footer button.btn-primary"))
                  .get(0)
                  .click()
                  .then(function() {
                    browser.get("http://localhost:8000/review");
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

  describe("has a layout that ", function() {
    var panels;
    beforeEach(function() {
      panels = element.all(by.css(".page-content .dataset-container .panel"));
    });

    it("should have the first panel that contains the title *Datasets*", function(
      done
    ) {
      panels
        .get(0)
        .all(by.css(".panel-heading"))
        .get(0)
        .getText()
        .then(function(txt) {
          expect(txt.toLowerCase()).toEqual("datasets");
          done();
        });
    });

    it("should have the second panel that contains the title *Model*", function(
      done
    ) {
      panels
        .get(1)
        .all(by.css(".panel-heading"))
        .get(0)
        .getText()
        .then(function(txt) {
          expect(txt.toLowerCase()).toEqual("model");
          done();
        });
    });

    it("should have the third panel that contains two tabs `Table` `Histogram`", function(
      done
    ) {
      var text = [];
      panels.get(2).all(by.css("ul.nav-tabs li a")).each(function(el, i) {
        el.getText().then(function(txt) {
          text.push(txt);
          if (i === 1) {
            expect(text[0].toLowerCase()).toEqual("table");
            expect(text[1].toLowerCase()).toEqual("histogram");
            done();
          }
        });
      });
    });
  });
});
