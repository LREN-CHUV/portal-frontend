describe('site homepage', function() {
  it('should click', function() {
    browser.get('http://localhost:8000');
    element(by.css('.action--next a')).click();

    var mainH1 = element(by.tagName('h1'));

    expect(mainH1.getText()).toBe("THE MEDICAL INFORMATICS PLATFORM");
  });
});
