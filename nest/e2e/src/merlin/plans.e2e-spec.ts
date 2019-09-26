import { browser, logging } from 'protractor';
import { MerlinPage } from './merlin.po';

describe('Plans Page (/plans)', () => {
  let page: MerlinPage;

  beforeEach(() => {
    page = new MerlinPage();
    page.navigateTo('plans');
  });

  describe('Merlin', () => {
    it('[C136472] WHEN the Merlin is loaded, the browser tab title SHOULD be Merlin', () => {
      browser.navigate().refresh();
      const pageTitle = browser.getTitle();
      expect(pageTitle).toBe(page.config.title);
    });
  });

  describe('Plan Creation', () => {
    it('[C134983] WHEN the Plans View is Loaded THEN it SHOULD have Plan Catalog as title', () => {
      expect(page.routeTitle.getText()).toBe('Plan Catalog');
    });

    it('[C134984] WHEN the Plans View is Loaded THEN it SHOULD have a create plan button in the header', () => {
      expect(page.newPlanButton.isDisplayed()).toBe(true);
    });

    it('[C134985] WHEN the Create Plan form is shown THEN the form SHOULD require Name, Plan Start and End and Adaptation fields', () => {
      page.newPlanButton.click();
      expect(page.formTitle.getText()).toBe('Create Plan');
      expect(page.nameInput.isDisplayed()).toBe(true);
      expect(page.planStartInput.isDisplayed()).toBe(true);
      expect(page.planEndInput.isDisplayed()).toBe(true);
      expect(page.adaptationInput.isDisplayed()).toBe(true);
    });

    it('[C134986] WHEN the Create Plan form is shown THEN the form SHOULD NOT allow the user to click Save when the required fields are not filled', () => {
      page.newPlanButton.click();
      expect(page.saveButton.isEnabled()).toBe(false);
    });

    it('[C134987] WHEN the Create Plan form is shown AND the user presses the Cancel Button, THEN a plan SHOULD NOT be added to the plans list', () => {
      const numRowsStart = page.planTableRows.count();
      page.newPlanButton.click();
      page.cancelButton.click();
      const numRowsEnd = page.planTableRows.count();

      expect(numRowsEnd).toBe(numRowsStart);
    });
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser
      .manage()
      .logs()
      .get(logging.Type.BROWSER);
    expect(logs).not.toContain(
      jasmine.objectContaining({
        level: logging.Level.SEVERE,
      } as logging.Entry),
    );
  });
});