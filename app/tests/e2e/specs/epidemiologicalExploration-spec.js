function toNumber(promiseOrValue) {
  // if it is not a promise, then convert a value
  if (!protractor.promise.isPromise(promiseOrValue)) {
    return parseInt(promiseOrValue, 10);
  }
  // if promise - convert result to number
  return promiseOrValue.then(function(stringNumber) {
    return parseInt(stringNumber, 10);
  });
}

var width = 1200;
var height = 800;
browser.driver.manage().window().setSize(width, height);

describe("the EE (explore) page ", function() {
  function get_bubble(rank) {
    return element
      .all(
        by.css(
          ".panel:nth-child(1) .panel-body:nth-child(1)>svg circle.node--leaf"
        )
      )
      .get(rank);
  }
  get_ApoE4_bubble = () => get_bubble(0);
  get_AgeYears_bubble = () => get_bubble(153);

  beforeEach(function(done) {
    jasmine.addMatchers({
      toHaveClass: function() {
        return {
          compare: function(actual, expected) {
            return {
              pass: actual.getAttribute("class").then(function(classes) {
                return classes.split(" ").indexOf(expected) !== -1;
              })
            };
          }
        };
      }
    });

    browser.get("http://localhost:8000/explore");
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
                    browser.get("http://localhost:8000/explore");
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
    var titles;
    beforeEach(function() {
      titles = element.all(by.css(".panel .panel-heading h2"));
    });

    it("should have the title *Epidemiological Exploration*", function(done) {
      var title = element.all(by.css(".page-content h3")).get(0);
      title.getText().then(function(txt) {
        expect(txt.toLowerCase()).toEqual("epidemiological exploration");
        done();
      });
    });

    it("should have a panel with the title *1. Select dataset*", function(
      done
    ) {
      titles.get(0).getText().then(function(txt) {
        expect(txt.toLowerCase()).toEqual("1. select dataset");
        done();
      });
    });

    it("should have a panel with the title *2. Select variable*", function(
      done
    ) {
      titles.get(1).getText().then(function(txt) {
        expect(txt.toLowerCase()).toEqual("2. select variable");
        done();
      });
    });

    it("should have a panel with the title *Variable overview*", function(
      done
    ) {
      titles.get(2).getText().then(function(txt) {
        expect(txt.toLowerCase()).toEqual("variable overview");
        done();
      });
    });

    it("should have a panel with the title *3. Add variables to Model*", function(
      done
    ) {
      titles.get(3).getText().then(function(txt) {
        expect(txt.toLowerCase()).toEqual("3. add variables to model");
        done();
      });
    });
  });

  describe("in the panel `dataset`", function() {
    var panel;
    beforeEach(function() {
      panel = element.all(by.css(".panel")).get(0);
    });

    it("should display a list of datasets", function() {
      var list = panel.all(by.css(".dataset-list"));
      expect(list.count()).toEqual(1);
    });

    it("should have a list of datasets that contains a least one dataset", function() {
      var dataset = panel
        .all(by.css(".dataset-list span:nth-child(1) a"))
        .get(0);
      expect(dataset.isPresent()).toBe(true);
    });

    it("should have a list of datasets in which each dataset is active", function(
      done
    ) {
      var datasets = panel.all(by.css(".dataset-list span a"));
      var i = 0;
      datasets.each(function(dataset) {
        i++;
        expect(dataset).toHaveClass("active");
        if (i === 3) {
          done();
        }
      });
    });

    it("should visually unselect a dataset when the corresponding dataset button is clicked", function(
      done
    ) {
      var dataset = panel
        .all(by.css(".dataset-list span:nth-child(1) a"))
        .get(0);
      var scrolled = browser.executeScript(
        "arguments[0].scrollIntoView(false);",
        dataset.getWebElement()
      );
      scrolled.then(function() {
        dataset.click();
        expect(dataset).not.toHaveClass("active");
        done();
      });
    });

    it("should remove a dataset from url params (as in explore?trainingDatasets=foo,bar) when the corresponding dataset button is clicked", function(
      done
    ) {
      var datasetAdni = panel
        .all(by.css(".dataset-list span:nth-child(1) a"))
        .get(0);
      var datasetPpmi = panel
        .all(by.css(".dataset-list span:nth-child(2) a"))
        .get(0);
      var scrolled = browser.executeScript(
        "arguments[0].scrollIntoView(false);",
        datasetAdni.getWebElement()
      );
      expect(browser.getCurrentUrl()).toContain("/explore");
      scrolled.then(function() {
        datasetAdni.click();
        expect(browser.getCurrentUrl()).toContain(
          "/explore?trainingDatasets=ppmi"
        );
        datasetPpmi.click();
        expect(browser.getCurrentUrl()).toContain("/explore?trainingDatasets=");
        done();
      });
    });
  });

  describe("in the panel `select variable` ", function() {
    var panel, bubble;
    beforeEach(function() {
      panel = element.all(by.css(".panel:nth-child(1)"));
      bubble = panel
        .all(by.css(".panel-body:nth-child(1)>svg circle.node--leaf"))
        .get(0);
    });

    it("should display a list of 6 shortcuts", function() {
      var list = panel.all(by.css(".panel-body>.panel-body>span>a"));
      expect(list.count()).toEqual(6);
    });

    it("should display a list of shortcuts that are: `Genetic` `brain_metabolism` `Brain` `Demographics` `Clinical` `Provenance`", function(
      done
    ) {
      var list = panel.all(
        by.css(".panel-body>.panel-body:nth-child(1)>span>a")
      );
      var text = [];
      list.each(function(el, i) {
        el.getText().then(function(txt) {
          text.push(txt);
          if (i == 5) {
            expect(text[0]).toEqual("Genetic");
            expect(text[1]).toEqual("brain_metabolism");
            expect(text[2]).toEqual("Brain");
            expect(text[3]).toEqual("Demographics");
            expect(text[4]).toEqual("Clinical");
            expect(text[5]).toEqual("Provenance");
            done();
          }
        });
      });
    });

    it("should zoom the same bubble item when a bubble item is clicked", function() {
      expect(toNumber(bubble.getAttribute("r"))).toBeLessThan(7); //4.053769907494721

      bubble.click();

      expect(toNumber(bubble.getAttribute("r"))).toBeGreaterThan(60); //69.80421083246561
    });

    it(
      "should display the variable detail in the variable-statistics panel when a bubble item is clicked",
      function(done) {
        var variableStatisticsPanel = element.all(by.css(".panel")).get(2);

        bubble.click();

        var text = [];
        var details = variableStatisticsPanel.all(
          by.css(
            ".panel-body div>b+span, .panel-body div>b+variable-description"
          )
        );

        details.each(function(el, i) {
          el.getText().then(function(txt) {
            text.push(txt);
            if (i === 3) {
              expect(text[0]).toEqual("ApoE4");
              expect(text[1]).toEqual("adni-merge");
              expect(text[2]).toEqual("polynominal");
              expect(text[3]).toEqual(
                "Apolipoprotein E (APOE) e4 allele: is the strongest risk factor for Late Onset Alzheimer Disease (LOAD). At least one copy of APOE-e4"
              );
              done();
            }
          });
        });
      },
      60000
    ); //^^ this is slowing down the test and should be removed the day the variable-statitics panel become significantly faster
  });

  describe("the tabs in the variable detail panel", function() {
    var variableStatisticsPanel, bubble;
    beforeEach(function(done) {
      variableStatisticsPanel = element.all(by.css(".panel")).get(2);
      get_AgeYears_bubble().click().then(function() {
        browser
          .wait(
            protractor.ExpectedConditions.presenceOf(
              $('[ng-if="stats.length"]')
            ),
            30000
          )
          .then(function() {
            done();
          });
      });
    });
    it(
      "should have 5 tabs",
      function() {
        expect(
          variableStatisticsPanel
            .all(by.css("ul.nav.nav-tabs li.nav-item"))
            .count()
        ).toBe(5);
      },
      60000
    );

    it(
      "should have the first tab open",
      function() {
        expect(
          variableStatisticsPanel
            .all(by.css("ul.nav.nav-tabs li.nav-item"))
            .get(0)
        ).toHaveClass("active");
      },
      60000
    );

    it(
      "should have a chart with the title *subjectageyears histogram*",
      function() {
        expect(
          variableStatisticsPanel
            .element(by.css(".highcharts-title tspan"))
            .getText()
        ).toEqual("subjectageyears histogram");
      },
      60000
    );

    it(
      "should have a first bar of value *19*",
      function() {
        var histogram = variableStatisticsPanel
          .all(by.css("g.highcharts-series-group"))
          .get(0);
        expect(
          histogram
            .all(by.css("rect.highcharts-point"))
            .get(0)
            .getAttribute("height")
        ).toEqual("12");
      },
      60000
    );
  });

  describe("the varcount component` in the panel `variable detail` ", function() {
    var breadcrumbPanel, selectVariablePanel, groupBubble, varcounter;
    beforeEach(function(done) {
      browser.get("http://localhost:8000/explore").then(function() {
        selectVariablePanel = element.all(by.css(".panel")).get(1);
        variableDetailPanel = element.all(by.css(".panel")).get(2);
        selectVariablePanel
          .all(
            by.css(".panel-body:nth-child(1)>svg circle.node:not(.node--leaf)")
          )
          .each((el, i) =>
            el.getAttribute("innerHTML").then(txt => console.log("i", i, txt))
          );
        groupBubbleScore = selectVariablePanel
          .all(
            by.css(".panel-body:nth-child(1)>svg circle.node:not(.node--leaf)")
          )
          .get(24);
        groupBubbleDiagnosis = selectVariablePanel
          .all(
            by.css(".panel-body:nth-child(1)>svg circle.node:not(.node--leaf)")
          )
          .get(28);
        varcounter = variableDetailPanel.all(by.css(".panel-body varcounter"));
        done();
      });
    });

    it("should display the count [46, 46, 91, 274] of each subcategory of that category *Score* when the corresponding bubble item is clicked", function(
      done
    ) {
      browser
        .actions()
        .mouseMove(groupBubbleScore)
        .mouseMove({ x: 0, y: 40 }) //in order to avoid to click on subcircles
        .click()
        .perform();
      var height = [];
      varcounter
        .all(
          by.css(
            "highchart g.highcharts-series-group g.highcharts-series rect.highcharts-point"
          )
        )
        .each(function(el, i) {
          el.getAttribute("height").then(function(h) {
            height.push(h);
            if (i === 3) {
              expect(height[0]).toEqual("46");
              expect(height[1]).toEqual("46");
              expect(height[2]).toEqual("91");
              expect(height[3]).toEqual("274");
              done();
            }
          });
        });
    });

    it("should display the count [274] of each subcategory of that category *Diagnosis* when the corresponding bubble item is clicked", function(
      done
    ) {
      browser
        .actions()
        .mouseMove(groupBubbleDiagnosis)
        .mouseMove({ x: 0, y: 18 }) //in order to avoid to click on subcircles
        .click()
        .perform();
      var height = [];
      varcounter
        .all(
          by.css(
            "highchart g.highcharts-series-group g.highcharts-series rect.highcharts-point"
          )
        )
        .each(function(el, i) {
          el.getAttribute("height").then(function(h) {
            height.push(h);
            if (i === 0) {
              expect(height[0]).toEqual("274");
              done();
            }
          });
        });
    });
  });

  describe("the breadcrumb component` in the panel `variable detail` ", function() {
    var breadcrumbPanel, selectVariablePanel, bubble, breadcrumbs;
    beforeEach(function(done) {
      browser.get("http://localhost:8000/explore").then(function() {
        selectVariablePanel = element.all(by.css(".panel")).get(1);
        variableDetailPanel = element.all(by.css(".panel")).get(2);
        bubble = selectVariablePanel
          .all(by.css(".panel-body:nth-child(1)>svg circle.node--leaf"))
          .get(0);
        breadcrumbs = variableDetailPanel.all(
          by.css(".panel-body breadcrumb span")
        );
        done();
      });
    });

    it("should display the breadcrumb (path) to that variable when a bubble item is clicked", function(
      done
    ) {
      bubble.click();
      var text = [];
      breadcrumbs.each(function(el, i) {
        el.getText().then(function(txt) {
          text.push(txt);
          if (i === 5) {
            expect(text[0]).toEqual("Genetic");
            expect(text[1]).toEqual("(1)");
            expect(text[2]).toEqual(">");
            expect(text[3]).toEqual("polymorphism");
            expect(text[4]).toEqual(">");
            expect(text[5]).toEqual("ApoE4");
            done();
          }
        });
      });
    });

    it("should display the path to that item and not more when a breadcrumb item is clicked", function(
      done
    ) {
      bubble.click();
      breadcrumbs.get(3).click();
      newBreadcrumbs = variableDetailPanel.all(
        by.css(".panel-body breadcrumb span")
      );
      var text = [];
      newBreadcrumbs.each(function(el, i) {
        el.getText().then(function(txt) {
          text.push(txt);
          if (i === 3) {
            expect(text[0]).toEqual("Genetic");
            expect(text[1]).toEqual("(1)");
            expect(text[2]).toEqual(">");
            expect(text[3]).toEqual("polymorphism");
            done();
          }
        });
      });
    });

    it("should zoom the corresponding bubble item when a breadcrumb item is clicked", function(
      done
    ) {
      var polymorphismBubble = selectVariablePanel.all(by.css(".node"));
      polymorphismBubble.each(function(el, i) {
        el.all(by.css("title")).getAttribute("innerHTML").then(function(txt) {
          if (i === 2) {
            expect(txt[0]).toEqual("polymorphism");
            expect(toNumber(polymorphismBubble.getAttribute("r"))).toBeLessThan(
              300
            );
            bubble.click();
            breadcrumbs.get(3).click();
            expect(
              toNumber(polymorphismBubble.getAttribute("r"))
            ).toBeGreaterThan(1700);
            done();
          }
        });
      });
    });
  });

  describe("in the panel `variable-configuration` ", function() {
    var panel, buttons, cols;
    beforeEach(function() {
      panel = element.all(by.css(".panel")).get(3);
      buttons = panel.all(by.css(".panel-body .explore-container button"));
      cols = panel.all(by.css(".panel-body .explore-container>div.column"));
    });

    it("should display 3 buttons", function() {
      expect(buttons.count()).toEqual(3);
    });

    it("should display the first button labelled as : *as variable* ", function(
      done
    ) {
      buttons.get(0).getText().then(function(txt) {
        expect(txt.toLowerCase()).toContain("as variable");
        done();
      });
    });

    it("should display the second button labelled as *as covariable*", function(
      done
    ) {
      buttons.get(1).getText().then(function(txt) {
        expect(txt.toLowerCase()).toContain("as covariable");
        done();
      });
    });

    it("should display the third buttons labelled as : *as filter*", function(
      done
    ) {
      buttons.get(2).getText().then(function(txt) {
        expect(txt.toLowerCase()).toContain("as filter");
        done();
      });
    });

    it("should do nothing when the first button `as variable` is clicked at initial state", function() {
      buttons.get(0).click().then(
        function() {
          fail("button 1 `as variable` should not be clickable");
        },
        function(error) {
          expect(error.message.toString()).toContain(
            "is not clickable at point"
          );
        }
      );
    });

    it("should do nothing when the second button `as covariable` is clicked at initial state", function() {
      buttons.get(1).click().then(
        function() {
          fail("button 2 `as covariable should not be clickable");
        },
        function(error) {
          expect(error.message.toString()).toContain(
            "is not clickable at point"
          );
        }
      );
    });

    it("should do nothing when the third button `as filter` is clicked at initial state", function() {
      buttons.get(2).click().then(
        function() {
          fail("button 3 `as filter` should not be clickable");
        },
        function(error) {
          expect(error.message.toString()).toContain(
            "is not clickable at point"
          );
        }
      );
    });

    it("should add a variable to the `Variable` column when the variable bubble item is clicked and then the first button `as variable` is clicked", function() {
      var bubble = get_ApoE4_bubble();
      bubble.click();
      buttons.get(0).click();
      expect(cols.get(0).all(by.css("h3+div")).count()).toEqual(1);
    });

    it("should add a variable to the `Covariable - grouping` column when the variable bubble item is clicked and then the first button `as variable` is clickedand and then the second button `as covariable`", function() {
      var bubble = get_ApoE4_bubble();
      bubble.click();
      buttons.get(0).click();
      buttons.get(1).click();
      expect(cols.get(0).all(by.css("h3+div")).count()).toEqual(0);
      expect(cols.get(1).all(by.css("h3+div")).count()).toEqual(1);
    });

    it("should add a variable name to url params (as in explore?trainingDatasets=foo) when the corresponding bubble item is clicked, and then the button `as variable`", function() {
      var bubble = get_ApoE4_bubble();
      expect(browser.getCurrentUrl()).toContain("/explore");
      bubble.click();
      buttons.get(0).click();
      expect(browser.getCurrentUrl()).toContain(
        "/explore?trainingDatasets=adni,ppmi,edsd&variable=apoe4"
      );
    });

    it("should add a variable name to url params as covariable (as in explore?grouping=foo) when the corresponding bubble item is clicked, and then the button `as variable`", function() {
      var bubble = get_ApoE4_bubble();
      expect(browser.getCurrentUrl()).toContain("/explore");
      bubble.click();
      buttons.get(1).click();
      expect(browser.getCurrentUrl()).toContain(
        "/explore?trainingDatasets=adni,ppmi,edsd&grouping=apoe4"
      );
    });
  });

  describe("the `review model` button ", function() {
    it("should not be visible when no variable is selected (initial state)", function() {
      reviewModelButton = element.all(
        by.css(".page-content .explore button.btn-round")
      );
      expect(reviewModelButton.count()).toEqual(0);
    });

    it("should  be visible when a variable is selected", function() {
      var bubble = get_ApoE4_bubble();
      asVariableButton = element
        .all(by.css(".panel.explore-box .panel-body .explore-container button"))
        .get(0);
      bubble.click();
      asVariableButton.click();
      reviewModelButton = element.all(
        by.css(".page-content .explore button.btn-round")
      );
      expect(reviewModelButton.count()).toEqual(1);
    });
  });
});
