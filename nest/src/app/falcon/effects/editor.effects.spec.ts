/**
 * Copyright 2018, by the California Institute of Technology. ALL RIGHTS RESERVED. United States Government Sponsorship acknowledged.
 * Any commercial use must be negotiated with the Office of Technology Transfer at the California Institute of Technology.
 * This software may be subject to U.S. export control laws and regulations.
 * By accepting this document, the user agrees to comply with all applicable U.S. export laws and regulations.
 * User has the responsibility to obtain export licenses, or other export authority as may be required
 * before exporting such information to foreign countries or providing access to foreign persons
 */

import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material';
import { provideMockActions } from '@ngrx/effects/testing';
import { addMatchers, cold, hot, initTestScheduler } from 'jasmine-marbles';
import { Observable } from 'rxjs';
import { EditorActions } from '../actions';
import { defaultEditorId } from '../reducers/file.reducer';
import { SeqEditorService } from '../services/seq-editor.service';
import { EditorEffects } from './editor.effects';

describe('EditorEffects', () => {
  let actions: Observable<any>;
  let effects: EditorEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule],
      providers: [
        EditorEffects,
        provideMockActions(() => actions),
        {
          provide: SeqEditorService,
          useValue: new SeqEditorService(),
        },
      ],
    });

    initTestScheduler();
    addMatchers();
    effects = TestBed.get(EditorEffects);
  });

  describe('addText', () => {
    it('should not dispatch an action for AddText but should call addText and focusEditor in the SeqEditorService', () => {
      const action = EditorActions.addText({
        editorId: defaultEditorId,
        text: 'that was easy',
      });
      const service = TestBed.get(SeqEditorService);
      const addText = spyOn(service, 'addText');
      const focusEditor = spyOn(service, 'focusEditor');

      actions = hot('-a', { a: action });
      const expected = cold('-');

      expect(effects.addText).toBeObservable(expected);
      expect(addText).toHaveBeenCalled();
      expect(focusEditor).toHaveBeenCalled();
    });
  });
});