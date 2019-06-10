import { browser, ExpectedConditions as EC, logging } from 'protractor';
import { clickHarder } from '../utils';
import { SequencingPage } from './sequencing.po';

describe('/sequencing.panels', () => {
  let page: SequencingPage;

  beforeEach(() => {
    page = new SequencingPage();
    page.navigateTo('sequencing');
    // wait needed because CodeMirror mounting is stalling the test causing it to exit due to timeout
    browser.waitForAngularEnabled(false);
    page.refreshBrowser();
  });

  it('[C136493] A user SHOULD be able to open the panel menu', () => {
    page.panelButton.click();
    browser.wait(EC.visibilityOf(page.panelMenu), page.waitTimeout);
    expect(page.panelMenu.isDisplayed()).toBe(true);
  });

  it('[C136494] A user SHOULD be able to toggle the left panel off and on', () => {
    expect(page.leftPanel.isDisplayed()).toBe(true);

    page.panelButton.click();

    browser.wait(
      EC.visibilityOf(page.panelMenu),
      1000,
      'Panels menu should appear',
    );

    clickHarder('#sequencing-panels-left-toggle-button');

    browser.wait(
      EC.invisibilityOf(page.leftPanel),
      2000,
      'Left panel should no longer be visible',
    );

    expect(page.leftPanel.isDisplayed()).toBe(false);

    page.panelButton.click();

    browser.wait(
      EC.visibilityOf(page.panelMenu),
      1000,
      'Panels menu should appear',
    );

    clickHarder('#sequencing-panels-left-toggle-button');

    browser.wait(
      EC.visibilityOf(page.leftPanel),
      1000,
      'Left panel should be visible',
    );

    expect(page.leftPanel.isDisplayed()).toBe(true);
  });

  it('[C136495] A user SHOULD be able to toggle the right panel off and on', () => {
    expect(page.rightPanel.isDisplayed()).toBe(true);

    page.panelButton.click();

    browser.wait(EC.visibilityOf(page.panelMenu), page.waitTimeout);
    clickHarder('#sequencing-panels-right-toggle-button');
    browser.wait(EC.invisibilityOf(page.rightPanel), page.waitTimeout);

    expect(page.rightPanel.isDisplayed()).toBe(false);

    page.panelButton.click();

    browser.wait(EC.visibilityOf(page.panelMenu), page.waitTimeout);
    clickHarder('#sequencing-panels-right-toggle-button');
    browser.wait(EC.visibilityOf(page.rightPanel), page.waitTimeout);

    expect(page.rightPanel.isDisplayed()).toBe(true);
  });

  it('[C141205] A user SHOULD be able to create a new editor panel', () => {
    page.panelButton.click();
    browser.wait(EC.visibilityOf(page.panelMenu), page.waitTimeout);
    clickHarder('#sequencing-add-editor-pane-button');

    expect(page.editorPanels.count()).toBe(2);
  });

  it('[C141206] An editor panel SHOULD be removed if there are no tabs AND there is not one editor panel', () => {
    page.prepareForCodeMirrorTesting();

    page.panelButton.click();
    browser.wait(EC.visibilityOf(page.panelMenu), page.waitTimeout);
    clickHarder('#sequencing-add-editor-pane-button');
    page.addTab();
    page.tabCloseButtons.get(0).click();
    page.tabCloseButtons.get(0).click();

    expect(page.editorPanels.count()).toBe(1);
  });

  it('[C141410] WHEN a user closes a tab resulting in no tabs in the only editor, the editor instance SHOULD still be there', () => {
    page.prepareForCodeMirrorTesting();

    page.tabCloseButtons.get(0).click();

    expect(page.editorPanels.count()).toBe(1);
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