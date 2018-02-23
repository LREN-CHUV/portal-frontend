fdescribe("the IA (review) page ", function() {
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
      panels.get(0).all(by.css(".panel-heading")).getText().then(function(txt) {
        expect(txt.toLowerCase()).toEqual("dataset");
        done();
      });
    });

    it("should have the second panel that contains the title *Model*", function(
      done
    ) {
      panels.get(1).all(by.css(".panel-heading")).getText().then(function(txt) {
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

  fdescribe(
    "when reached using the url /review?execute=true&variable=rightmcggmiddlecingulategyrus&covariable=righthippocampus,leftmtgmiddletemporalgyrus,leftstgsuperiortemporalgyrus,lefttmptemporalpole,rightfugfusiformgyrus,rightmtgmiddletemporalgyrus,rightppplanumpolare,rightventraldc&grouping=&filter=brainstem&trainingDatasets=",
    function() {
      beforeEach(function() {
        browser.get(
          "http://localhost:8000/review?execute=true&variable=rightmcggmiddlecingulategyrus&covariable=righthippocampus,leftmtgmiddletemporalgyrus,leftstgsuperiortemporalgyrus,lefttmptemporalpole,rightfugfusiformgyrus,rightmtgmiddletemporalgyrus,rightppplanumpolare,rightventraldc&grouping=&filter=brainstem&trainingDatasets="
        );
        panels = element.all(by.css(".page-content .dataset-container .panel"));
      });

      it("should have in the second panel under `Variable` the variable : *rightmcggmiddlecingulategyrus* ", function(
        done
      ) {
        panels
          .get(1)
          .all(by.css("h5:nth-child(1) + p>a"))
          .get(0)
          .getText()
          .then(function(txt) {
            expect(txt.toLowerCase()).toEqual("rightmcggmiddlecingulategyrus");
            done();
          });
      });

      it("should have in the second panel under `CoVariables` the whole list of variables ", function(
        done
      ) {
        var text = [], els = [];
        var h5count = 0, j = 0;
        //h5:nth-of-type(2) ~ p:not(h5:nth-of-type(3) ~ p)      ----> not understood by protractor's css locators
        panels.get(1).all(by.css("h5, p")).each(function(el, i) {
          els.push(el);
          protractor.promise
            .all([el.getTagName(), el.getText()])
            .then(function(all) {
              var tagname = all[0];
              var txt = all[1];
              if (tagname === "h5") {
                h5count++;
              }
              if (h5count === 2 && tagname === "p") {
                text.push(txt);
                j++;
                if (j === 8) {
                  expect(text[0]).toEqual("righthippocampus");
                  expect(text[1]).toEqual("leftmtgmiddletemporalgyrus");
                  expect(text[2]).toEqual("leftstgsuperiortemporalgyrus");
                  expect(text[3]).toEqual("lefttmptemporalpole");
                  expect(text[4]).toEqual("rightfugfusiformgyrus");
                  expect(text[5]).toEqual("rightmtgmiddletemporalgyrus");
                  expect(text[6]).toEqual("rightppplanumpolare");
                  expect(text[7]).toEqual("rightventraldc");
                  done();
                }
              }
            });
        });
      });

      it("should have in the second panel under `Filter variable` the variable *brainstem* ", function(
        done
      ) {
        var text = [], els = [];
        var h5count = 0, j = 0;
        //h5:nth-of-type(2) ~ p:not(h5:nth-of-type(3) ~ p)      ----> not understood byprotractgor css locators
        panels.get(1).all(by.css("h5, p")).each(function(el, i) {
          els.push(el);
          protractor.promise
            .all([el.getTagName(), el.getText()])
            .then(function(all) {
              var tagname = all[0];
              var txt = all[1];
              if (tagname === "h5") {
                h5count++;
              }
              if (h5count === 4 && tagname === "p") {
                text.push(txt);
                j++;
                if (j === 1) {
                  expect(text[0]).toEqual("brainstem");
                  done();
                }
              }
            });
        });
      });

      it("should open the experiment page with all url params passed (plus execute=true) when the button `execute` is clicked ", function() {
        element
          .all(by.css(".static-content .dataset-box .execute .btn-round"))
          .get(0)
          .click();
        //notes :
        //- variable becomes variables
        //- covariable becomes coVariables
        //- filter becomes filters
        expect(browser.getCurrentUrl()).toContain(
          "experiment/?variables=rightmcggmiddlecingulategyrus&coVariables=righthippocampus,leftmtgmiddletemporalgyrus,leftstgsuperiortemporalgyrus,lefttmptemporalpole,rightfugfusiformgyrus,rightmtgmiddletemporalgyrus,rightppplanumpolare,rightventraldc&filters=brainstem"
        );
      });
    }
  );
});
