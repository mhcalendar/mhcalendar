import { Component, Element, State, h, Watch } from '@stencil/core';
import dayjs from 'dayjs';
import { store, storeState } from '../../store/mh-calendar-store';
import { DaysGenerator } from '../../utils/DaysGenerator';
import { EventManager } from '../../utils/EventManager';
import { DateUtils } from '../../utils/DateUtils';
import { EventStyleManager } from '../../utils/EventStyleManager';
import { IMHCalendarEvent } from '../../types';
import { VIEW_HEIGHT } from '../../const/default-theme';
import { LabelUtils } from '../../utils/LabelUtils';

@Component({
  tag: 'mh-calendar-agenda-view',
  styleUrl: 'mh-calendar-agenda-view.css',
  shadow: false,
})
export class MHCalendarAgendaView {
  @Element() el?: HTMLElement;

  @State() sortedEvents: Array<{
    date: Date;
    events: IMHCalendarEvent[];
  }> = [];

  private storeUnsubscribers: (() => void)[] = [];

  componentWillLoad() {
    this.updateEvents();

    this.storeUnsubscribers.push(
      store.onChange('calendarDateRange', () => {
        this.updateEvents();
      }),
    );

    this.storeUnsubscribers.push(
      store.onChange('reactiveEvents', () => {
        this.updateEvents();
      }),
    );
  }

  disconnectedCallback() {
    this.storeUnsubscribers.forEach((unsubscribe) => unsubscribe());
    this.storeUnsubscribers = [];
  }

  @Watch('sortedEvents')
  handleEventsChange() {
    // Force re-render if needed
  }

  private updateEvents() {
    const { fromDate, toDate } = storeState.calendarDateRange;
    if (!fromDate || !toDate) return;

    // Agenda view works for DAY and WEEK - use calendarDateRange
    // For DAY: fromDate === toDate (single day)
    // For WEEK: fromDate to toDate (week range)
    let dates: Date[];

    if (dayjs(fromDate).isSame(toDate, 'day')) {
      // Single day
      dates = [fromDate];
    } else {
      // Week range - use getDatesForMultiView to respect hiddenDays
      dates = DaysGenerator.getDatesForMultiView();

      // If getDatesForMultiView doesn't return dates (e.g., hiddenDays filter all days),
      // fallback to generating dates from range
      if (dates.length === 0) {
        dates = [];
        let current = dayjs(fromDate);
        const end = dayjs(toDate);
        while (current.isBefore(end, 'day') || current.isSame(end, 'day')) {
          dates.push(current.toDate());
          current = current.add(1, 'day');
        }
      }
    }

    // Get all events for the date range and sort them
    const allEvents: Array<{ date: Date; event: IMHCalendarEvent }> = [];

    dates.forEach((date) => {
      const eventsForDate = EventManager.getEventsForDate(date);

      eventsForDate.forEach((event) => {
        allEvents.push({ date, event });
      });
    });

    // Group events by date
    const eventsByDate = new Map<string, { date: Date; events: IMHCalendarEvent[] }>();

    allEvents.forEach(({ date, event }) => {
      const dateKey = DateUtils.convertDateToString(date);

      if (!eventsByDate.has(dateKey)) {
        eventsByDate.set(dateKey, { date, events: [] });
      }

      const dayData = eventsByDate.get(dateKey)!;

      // Check if event is not already added (to avoid duplicates)
      if (!dayData.events.find((e) => e.id === event.id)) {
        dayData.events.push(event);
      }
    });

    // Sort events within each day by start time
    // All-day events come first, then timed events sorted by start time
    eventsByDate.forEach((dayData) => {
      dayData.events.sort((a, b) => {
        // All-day events come first
        if (a.allDay && !b.allDay) return -1;
        if (!a.allDay && b.allDay) return 1;

        // If both all-day or both timed, sort by start time
        return a.startDate.getTime() - b.startDate.getTime();
      });
    });

    // Sort days chronologically
    const sortedDays = Array.from(eventsByDate.values()).sort((a, b) => {
      return a.date.getTime() - b.date.getTime();
    });

    this.sortedEvents = sortedDays;
  }

  private formatDate(date: Date): string {
    const d = dayjs(date).locale(storeState.locale);
    const today = dayjs();

    if (d.isSame(today, 'day')) {
      return LabelUtils.today();
    }

    if (d.isSame(today.add(1, 'day'), 'day')) {
      return 'Tomorrow';
    }

    if (d.isSame(today.subtract(1, 'day'), 'day')) {
      return 'Yesterday';
    }

    // Check if within current week
    const startOfWeek = today.startOf('week');
    const endOfWeek = today.endOf('week');

    if (d.isAfter(startOfWeek) && d.isBefore(endOfWeek)) {
      return d.format('dddd'); // Day name (Monday, Tuesday, etc.)
    }

    // Default format
    return d.format('MMMM D, YYYY');
  }

  render() {
    const containerHeight = storeState.fixedHeight ?? VIEW_HEIGHT;

    if (this.sortedEvents.length === 0) {
      return (
        <div
          class="mhCalendarAgendaView mhCalendarAgendaView--empty"
          style={{
            height: containerHeight,
            overflow: 'hidden',
          }}
        >
          <div class="mhCalendarAgendaView__emptyMessage">No events scheduled</div>
        </div>
      );
    }

    return (
      <div
        style={{
          height: containerHeight,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '0',
        }}
      >
        <div
          class="mhCalendarAgendaView"
          style={{
            flex: '1 1 0',
            minHeight: '0',
            maxHeight: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {this.sortedEvents.map((dayData) => (
            <div
              key={DateUtils.convertDateToString(dayData.date)}
              class="mhCalendarAgendaView__day"
            >
              <div class="mhCalendarAgendaView__dayHeader">
                <span class="mhCalendarAgendaView__dayDate">{this.formatDate(dayData.date)}</span>
                <span class="mhCalendarAgendaView__dayDateFull">
                  {dayjs(dayData.date).locale(storeState.locale).format('MMM D, YYYY')}
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
