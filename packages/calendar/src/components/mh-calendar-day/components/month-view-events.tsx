import { Component, Prop, h } from '@stencil/core';
import { IMHCalendarEvent } from '../../../types';
import { store } from '../../../store/mh-calendar-store';

@Component({
  tag: 'mh-calendar-day-month-view-events',
  shadow: false,
})
export class MonthViewEvents {
  @Prop() groupedEvents!: IMHCalendarEvent[];
  @Prop() maxVisibleEventsInMonthView!: number;
  @Prop() calendarDayElementHeight?: number;
  @Prop() day?: Date;

  render() {
    if (!this.calendarDayElementHeight || !this.day || !this.groupedEvents) {
      return null;
    }

    const sortedEvents = [...this.groupedEvents].sort((a, b) => {
      console.log(this.groupedEvents);
      if (a.allDay !== b.allDay) {
        return a.allDay ? -1 : 1;
      }
      return a.startDate.getTime() - b.startDate.getTime();
    });

    const maxEvents = this.maxVisibleEventsInMonthView;
    const hasMoreEvents = sortedEvents.length > maxEvents;
    const eventsToShow = hasMoreEvents
      ? sortedEvents.slice(0, maxEvents - 1)
      : sortedEvents.slice(0, maxEvents);

    return (
      <div
        class="mhCalendarDay__eventsContainer"
        style={{
          minHeight: '0',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          padding: '2px',
        }}
      >
        {eventsToShow.map((event) => {
          return (
            <div
              key={event.id}
              class="mhCalendarDay__eventHolder"
              style={{
                width: '100%',
                position: 'relative',
                ...store.getInlineStyleForClass('mhCalendarDay__eventHolder'),
              }}
            >
              <mh-calendar-event
                event={event}
                dayHeight={this.calendarDayElementHeight}
                eventTopPosition={0}
                dayOfRendering={this.day}
              />
            </div>
          );
        })}

        {hasMoreEvents && (
          <div
            class="mhCalendarDay__eventHolder"
            style={{
              width: '100%',
              ...store.getInlineStyleForClass('mhCalendarDay__eventHolder'),
            }}
          >
            <div
              class="mhCalendarDay__eventsLeftIndicator"
              style={{
                fontSize: '11px',
                padding: '2px 4px',
                fontWeight: 'bold',
                color: '#666',
                cursor: 'pointer',
                ...store.getInlineStyleForClass('mhCalendarDay__eventsLeftIndicator'),
              }}
            >
              {`+${sortedEvents.length - eventsToShow.length} more`}
            </div>
          </div>
        )}
      </div>
    );
  }
}
