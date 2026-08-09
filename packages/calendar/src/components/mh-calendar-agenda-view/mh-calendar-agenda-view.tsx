import { Component, Element, forceUpdate, h } from '@stencil/core';
import { store, storeState } from '../../store/mh-calendar-store';
import { DaysGenerator } from '../../utils/DaysGenerator';
import { EventManager } from '../../utils/EventManager';
import { DateUtils } from '../../utils/DateUtils';
import { EventStyleManager } from '../../utils/EventStyleManager';
import { VIEW_HEIGHT } from '../../const/default-theme';
import { LabelUtils } from '../../utils/LabelUtils';

@Component({
  tag: 'mh-calendar-agenda-view',
  styleUrl: 'mh-calendar-agenda-view.css',
  shadow: false,
})
export class MHCalendarAgendaView {
  @Element() el?: HTMLElement;

  private storeUnsubscribers: (() => void)[] = [];

  componentWillLoad() {
    this.storeUnsubscribers.push(
      store.onChange('calendarDateRange', () => forceUpdate(this)),
      store.onChange('reactiveEvents', () => forceUpdate(this)),
    );
  }

  disconnectedCallback() {
    this.storeUnsubscribers.forEach((unsubscribe) => unsubscribe());
    this.storeUnsubscribers = [];
  }

  private getSortedEvents() {
    const { fromDate, toDate } = storeState.calendarDateRange;
    if (!fromDate || !toDate) return [];

    // getDatesForMultiView already covers a single day and respects hiddenDays
    const dates = DaysGenerator.getDatesForMultiView();

    return dates
      .map((date) => ({
        date,
        // All-day events come first, then timed events sorted by start time
        events: EventManager.getEventsForDate(date).sort((a, b) => {
          if (a.allDay && !b.allDay) return -1;
          if (!a.allDay && b.allDay) return 1;
          return a.startDate.getTime() - b.startDate.getTime();
        }),
      }))
      .filter((dayData) => dayData.events.length > 0);
  }

  render() {
    const containerHeight = storeState.fixedHeight ?? VIEW_HEIGHT;
    const sortedEvents = this.getSortedEvents();

    if (sortedEvents.length === 0) {
      return (
        <div
          class="mhCalendarAgendaView mhCalendarAgendaView--empty"
          style={{ height: containerHeight }}
        >
          <div class="mhCalendarAgendaView__emptyMessage">
            {storeState.labels?.noEvents ?? 'No events scheduled'}
          </div>
        </div>
      );
    }

    return (
      <div class="mhCalendarAgendaView__container" style={{ height: containerHeight }}>
        <div class="mhCalendarAgendaView">
          {sortedEvents.map((dayData) => (
            <div
              key={DateUtils.convertDateToString(dayData.date)}
              class="mhCalendarAgendaView__day"
            >
              <div class="mhCalendarAgendaView__dayHeader">
                <span class="mhCalendarAgendaView__dayDate">
                  {LabelUtils.dateLabel(dayData.date)}
                </span>
                <span class="mhCalendarAgendaView__dayDateFull">
                  {DateUtils.formatDate(dayData.date, 'MMM D, YYYY')}
                </span>
              </div>
              <div class="mhCalendarAgendaView__events">
                {dayData.events.map((event) => {
                  const eventColor = EventStyleManager.getEventColor(event);
                  return (
                    <div
                      key={event.id}
                      class="mhCalendarAgendaView__event"
                      data-event-id={event.id}
                      style={{
                        '--eventColor': eventColor,
                      }}
                    >
                      <div class="mhCalendarAgendaView__eventTime">
                        {DateUtils.formatEventTime(event)}
                      </div>
                      <div class="mhCalendarAgendaView__eventContent">
                        <>
                          <div class="mhCalendarAgendaView__eventTitle">
                            {event.title || 'Untitled Event'}
                          </div>
                          {event.description && (
                            <div class="mhCalendarAgendaView__eventDescription">
                              {event.description}
                            </div>
                          )}
                        </>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
