import { browser, by, element } from 'protractor';
import { config } from '../../../src/config';
import { click } from '../utils';

export class SequencingPage {
  routeTitle = element(by.css('.top-bar-title'));

  config = config.appModules[1];

  waitTimeout = 5000;

  commandDictionarySelect = element(by.css('#sequencing-command-select'));
  testCommandDictionary = element(by.id('mat-option-1'));
  commandList = element(by.id('sequencing-command-list'));
  commands = element.all(by.css('.mat-list-text'));
  noCommandsPrompt = element(by.id('sequencing-no-commands-prompt'));

  codeMirrorEditor = element(
    by.css('#sequencing-editor-mount > div:nth-of-type(2)'),
  );
  codeMirrorTextArea = element(
    by.css('#sequencing-editor-mount > div > div > textarea'),
  );
  codeMirrorWrapper = element(by.css('.CodeMirror-wrap'));

  hintsContainer = element(by.css('.CodeMirror-hints'));

  helpDialog = element(by.className('mat-dialog-container'));

  panelButton = element(by.id('sequencing-panels-button'));
  panelMenu = element(by.css('.mat-menu-content'));
  leftPanelToggleButton = element(
    by.id('sequencing-panels-left-toggle-button'),
  );
  rightPanelToggleButton = element(
    by.id('sequencing-panels-right-toggle-button'),
  );
  addEditorPanelButton = element(by.id('sequencing-add-editor-pane-button'));
  leftPanel = element(by.id('left-panel-area'));
  middlePanel = element(by.id('middle-panel-area'));
  rightPanel = element(by.id('right-panel-area'));
  editorPanels = element.all(by.className('editor-panel'));

  toolsButton = element(by.id('sequencing-editor-button'));
  toolsMenu = element(by.className('mat-menu-content'));
  autocompleteButton = element(
    by.id('sequencing-editor-toggle-autocomplete-button'),
  );
  colorschemeButton = element(
    by.id('sequencing-editor-toggle-color-scheme-button'),
  );
  tooltipsButton = element(by.id('sequencing-editor-toggle-tooltips-button'));
  helpButton = element(by.id('sequencing-editor-help-button'));

  firstCommand = element
    .all(
      by.css(
        '#sequencing-command-list > mat-accordion > cdk-virtual-scroll-viewport > div > mat-expansion-panel > mat-expansion-panel-header > span > mat-panel-title',
      ),
    )
    .first();
  firstCommandExpansion = element
    .all(
      by.css(
        '#sequencing-command-list > mat-accordion > cdk-virtual-scroll-viewport > div > mat-expansion-panel > div',
      ),
    )
    .first();

  addTabButton = element(by.id('seq-create-tab-button'));
  tabs = element.all(by.className('seq-tab'));
  tabTitles = element.all(by.css('.seq-tab-text'));
  tabCloseButtons = element.all(by.css('.seq-tab-icon'));
  fullscreenButton = element(by.css('#fullscreen-toggle > button'));

  selectTestCommandDictionary() {
    this.commandDictionarySelect.click();
    element(
      by.cssContainingText('mat-option .mat-option-text', 'Test 1'),
    ).click();
  }

  /**
   * Prepares the test for testing CodeMirror
   * 1. Refreshes the browser
   * 2. Loads the test command dictionary
   * 3. Creates a new tab
   */
  prepareForCodeMirrorTesting() {
    this.refreshBrowser();
    this.selectTestCommandDictionary();
    this.addTab();
  }

  addTab() {
    this.addTabButton.click();
  }

  sendKeysToCodeMirror(text: string) {
    click(this.codeMirrorWrapper);
    this.codeMirrorTextArea.sendKeys(text);
  }

  /**
   * Handles sending keys to the window rather than an element
   */
  sendGlobalKeys(keys: string) {
    browser
      .actions()
      .sendKeys(keys)
      .perform();
  }

  refreshBrowser() {
    browser.navigate().refresh();
  }

  navigateTo(route: string) {
    return browser.get(`${browser.baseUrl}/#/${route}`) as Promise<any>;
  }
}
