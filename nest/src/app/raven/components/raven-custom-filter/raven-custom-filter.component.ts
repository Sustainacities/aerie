/**
 * Copyright 2018, by the California Institute of Technology. ALL RIGHTS RESERVED. United States Government Sponsorship acknowledged.
 * Any commercial use must be negotiated with the Office of Technology Transfer at the California Institute of Technology.
 * This software may be subject to U.S. export control laws and regulations.
 * By accepting this document, the user agrees to comply with all applicable U.S. export laws and regulations.
 * User has the responsibility to obtain export licenses, or other export authority as may be required
 * before exporting such information to foreign countries or providing access to foreign persons
 */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { RavenCustomFilterSource, RavenSourceActionEvent } from '../../models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'raven-custom-filter',
  styleUrls: ['./raven-custom-filter.component.css'],
  templateUrl: './raven-custom-filter.component.html',
})
export class RavenCustomFilterComponent {
  @Input()
  source: RavenCustomFilterSource;

  @Output()
  action: EventEmitter<RavenSourceActionEvent> = new EventEmitter<
    RavenSourceActionEvent
  >();

  @Output()
  selectCustomFilter: EventEmitter<RavenCustomFilterSource> = new EventEmitter<
    RavenCustomFilterSource
  >();
}