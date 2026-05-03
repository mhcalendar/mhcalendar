import { Component, h, Prop } from '@stencil/core';
import { store, storeState } from '../../../../store/mh-calendar-store';
import { IMHCalendarViewType } from '../../../../store/mh-calendar-store.types';
import { DateUtils } from '../../../../utils/DateUtils';
import { IMHCalendarEvent } from '../../../../types';

@Component({
  tag: 'mh-calendar-event-full',
  styleUrl: 'mh-calendar-event-full.css',
  shadow: false,
})
export class MHCalendarEventFull {
  @Prop() event?: IMHCalendarEvent;

  render() {
    if (!this.event) return;

    return (
      <div
        class="mhCalendarEventFull"
        style={{
          ...store.getInlineStyleForClass('mhCalendarEventFull'),
        }}
      >
        {typeof store.state?.eventContent === 'function' ? (
          <div
            class="mhCalendarEventFull__userEventContentHolder"
            style={{
              ...store.getInlineStyleForClass('mhCalendarEventFull__userEventContentHolder'),
            }}
            innerHTML={storeState.eventContent?.(this.event)}
          />
        ) : (
          <div
            class="mhCalendarEventFull__content"
            style={{
              ...store.getInlineStyleForClass('mhCalendarEventFull__content'),
            }}
          >
            <div
              class="mhCalendarEventFull__content__title"
              style={{
                ...store.getInlineStyleForClass('mhCalendarEventFull__content__title'),
              }}
            >
              {this.event.title}
            </div>
            {storeState.viewType !== IMHCalendarViewType.MONTH && (
              <>
                <div
                  class="mhCalendarEventFull__content__date"
                  style={{
                    ...store.getInlineStyleForClass('mhCalendarEventFull__content__date'),
                  }}
                >
                  {DateUtils.formatTime(this.event.startDate)}-
                  {DateUtils.formatTime(this.event.endDate)}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  }
}
