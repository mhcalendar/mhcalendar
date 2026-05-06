import { Component, h, Prop } from '@stencil/core';
import { store, storeState } from '../../../../store/mh-calendar-store';
import { DateUtils } from '../../../../utils/DateUtils';
import { IMHCalendarEvent } from '../../../../types';

@Component({
  tag: 'mh-calendar-event-small',
  styleUrl: 'mh-calendar-event-small.css',
  shadow: false,
})
export class MHCalendarEventSmall {
  @Prop() event?: IMHCalendarEvent;

  render() {
    if (!this.event) return;

    /*
     User provide his own version of small component,
     use it instead of the default template.
    */
    if (typeof store.state?.eventSmallContent === 'function') {
      return (
        <div
          class="mhCalendarEventSmall mhCalendarEventSmall--custom"
          style={{
            ...store.getInlineStyleForClass('mhCalendarEventSmall'),
          }}
          innerHTML={storeState.eventSmallContent?.(this.event)}
        />
      );
    }

    /*
     Default small component template.
    */
    return (
      <div
        class="mhCalendarEventSmall"
        style={{
          ...store.getInlineStyleForClass('mhCalendarEventSmall'),
        }}
      >
        <span class="mhCalendarEventSmall__title">{this.event.title}</span>
        <span class="mhCalendarEventSmall__time">{DateUtils.formatEventTime(this.event)}</span>
      </div>
    );
  }
}
