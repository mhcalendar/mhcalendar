import { Component, Event, EventEmitter, Prop, h } from '@stencil/core';
import dayjs from 'dayjs';
import { storeState } from '../../../store/mh-calendar-store';
import { IMHCalendarEvent } from '../../../types';
import {
  IMHCalendarPopoverAlignment,
  IMHCalendarPopoverAnchorRect,
} from '../mh-calendar-popover';

/**
 * A day/cell's overflowed events shown in a popover — a header with the date
 * and the full event list. Renders its own `mh-calendar-popover`, so callers
 * only need this single component (anchored + dismissible out of the box).
 */
@Component({
  tag: 'mh-calendar-event-list-popup',
  styleUrl: 'event-list-popup.css',
  shadow: false,
})
export class MHCalendarEventListPopup {
  @Prop() date!: Date;
  @Prop() events: IMHCalendarEvent[] = [];
  @Prop() anchorRect!: IMHCalendarPopoverAnchorRect;
  @Prop() alignment: IMHCalendarPopoverAlignment = 'bottom';

  @Event() closePopover!: EventEmitter<void>;

  render() {
    return (
      <mh-calendar-popover
        anchorRect={this.anchorRect}
        alignment={this.alignment}
        onClosePopover={() => this.closePopover.emit()}
      >
        <div class="mhCalendarEventListPopup">
          <div class="mhCalendarEventListPopup__header">
            {dayjs(this.date).locale(storeState.locale).format('ddd, MMM D')}
          </div>
          <div class="mhCalendarEventListPopup__list">
            {this.events.map((event) => (
              <mh-calendar-event key={event.id} event={event} />
            ))}
          </div>
        </div>
      </mh-calendar-popover>
    );
  }
}
