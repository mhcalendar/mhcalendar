import dayjs from 'dayjs';
import { store, storeState } from '../store/mh-calendar-store';
import { IMHCalendarEvent } from '../types';
import { DateUtils } from './DateUtils';
import { EventUtils } from './EventUtils';

type EventBuilderMapById = Map<string, IMHCalendarEvent>;
export type EventBuilderMapByDate = Map<string, EventBuilderMapById>;

export class EventManager {
  /**
   * Generate a unique id for a newly created event
   */
  public static generateEventId(): string {
    const randomPart = Math.random().toString(36).substring(2, 9);
    return `event-${Date.now()}-${randomPart}`;
  }

  /**
   * Get all date keys for a date range
   */
  private static getDateKeysInRange = (
    startDate: Date,
    endDate: Date,
    isAllDay: boolean = false,
  ): string[] => {
    const dateKeys: string[] = [];

    if (isAllDay) {
      // For all-day events, extract just the date part to avoid timezone issues
      const startDateStr = DateUtils.convertDateToString(startDate);
      const endDateStr = DateUtils.convertDateToString(endDate);

      let currentDate = dayjs(startDateStr);
      const endDateTime = dayjs(endDateStr);

      while (currentDate.isSame(endDateTime, 'day') || currentDate.isBefore(endDateTime, 'day')) {
        dateKeys.push(currentDate.format('YYYY-MM-DD'));
        currentDate = currentDate.add(1, 'day');
      }
    } else {
      // For timed events, use the configured main timezone to determine which day the event belongs to.
      // This prevents events stored in UTC from being bucketed into the wrong day when the browser
      // timezone differs from the configured calendar timezone.
      const toDay = (d: Date) => dayjs(d).tz(store.mainTimezone).startOf('day');

      let currentDate = toDay(startDate);
      const endDateTime = toDay(endDate);

      while (currentDate.isSame(endDateTime, 'day') || currentDate.isBefore(endDateTime, 'day')) {
        dateKeys.push(currentDate.format('YYYY-MM-DD'));
        currentDate = currentDate.add(1, 'day');
      }
    }

    return dateKeys;
  };

  /**
   * Remove event from all dates in the events map
   */
  private static removeEventFromAllDates = (
    events: EventBuilderMapByDate,
    eventID: string,
  ): void => {
    for (const [dateKey, dateEvents] of events) {
      if (dateEvents.has(eventID)) {
        dateEvents.delete(eventID);
        // Clean up empty date entries
        if (dateEvents.size === 0) {
          events.delete(dateKey);
        }
      }
    }
  };

  /**
   * Add event to all relevant dates
   */
  private static addEventToDates = (
    events: EventBuilderMapByDate,
    eventData: IMHCalendarEvent,
  ): void => {
    const startDate = new Date(eventData.startDate);
    const endDate = new Date(eventData.endDate);
    const eventDates = this.getDateKeysInRange(startDate, endDate, eventData.allDay || false);

    eventDates.forEach((dateKey) => {
      if (!events.has(dateKey)) {
        events.set(dateKey, new Map<string, IMHCalendarEvent>());
      }
      events.get(dateKey)!.set(eventData.id, eventData);
    });
  };

  /**
   * Map events by date for calendar display
   */
  public static mapEventsByDate = (events: IMHCalendarEvent[]): EventBuilderMapByDate => {
    const eventsByDate = new Map<string, Map<string, IMHCalendarEvent>>();

    events.forEach((event) => {
      this.addEventToDates(eventsByDate, event);
    });

    return eventsByDate;
  };

  /**
   * Update an existing event
   */
  public static updateEvent(eventID: string, eventData: IMHCalendarEvent): void {
    const events = storeState.reactiveEvents;
    this.removeEventFromAllDates(events, eventID);
    this.addEventToDates(events, eventData);
    storeState.reactiveEvents = new Map(events);
  }

  public static addEvent(eventData: IMHCalendarEvent): void {
    const events = storeState.reactiveEvents;
    this.addEventToDates(events, eventData);
    storeState.reactiveEvents = new Map(events);
  }

  public static removeEvent(eventID: string): void {
    const events = storeState.reactiveEvents;
    this.removeEventFromAllDates(events, eventID);
    storeState.reactiveEvents = new Map(events);
  }

  /**
   * Get all events for a specific date
   */
  public static getEventsForDate(date: Date | string): IMHCalendarEvent[] {
    const dateKey = typeof date === 'string' ? date : DateUtils.convertDateToString(date);
    const dailyEvents = storeState.reactiveEvents.get(dateKey);

    if (dailyEvents) {
      const window = EventUtils.getTimeViewWindow(dateKey);
      if (!window) return [];

      const { windowStart, windowEnd } = window;
      return Array.from(dailyEvents.values()).filter((event) =>
        EventUtils.shouldEventBeDisplayedInTimeView(event, windowStart, windowEnd),
      );
    }
    return [];
  }

  /**
   * Handle event date change for drag and drop functionality
   */
  public static handleEventDateChange(
    newStartDate: Date,
    newEndDate: Date,
    event?: IMHCalendarEvent,
  ): void {
    const { reactiveEvents, draggedEvent } = store.state;
    const targetId = event?.id ?? draggedEvent?.id;

    if (!targetId) {
      console.error('No dragged event found');
      return;
    }

    let originalEvent: IMHCalendarEvent | null = null;
    for (const [_, eventsMap] of reactiveEvents) {
      if (eventsMap.has(targetId)) {
        originalEvent = eventsMap.get(targetId)!;
        break;
      }
    }
    if (!originalEvent) {
      console.error('Event not found in reactive events');
      return;
    }

    // Store original date range for cleanup
    const originalStartDate = new Date(originalEvent.startDate);
    const originalEndDate = new Date(originalEvent.endDate);
    const originalDateKeys = this.getDateKeysInRange(
      originalStartDate,
      originalEndDate,
      originalEvent.allDay || false,
    );

    // Remove event from all original date keys
    originalDateKeys.forEach((dateKey) => {
      if (reactiveEvents.has(dateKey)) {
        const eventsMap = reactiveEvents.get(dateKey)!;
        eventsMap.delete(originalEvent.id);
        // Clean up empty date entries
        if (eventsMap.size === 0) {
          reactiveEvents.delete(dateKey);
        }
      }
    });

    const updatedEvent: IMHCalendarEvent = {
      ...originalEvent,
      ...event,
      startDate: newStartDate,
      endDate: newEndDate,
      isHidden: false,
    };

    // Get new date keys where the event should be placed
    const newDateKeys = this.getDateKeysInRange(
      newStartDate,
      newEndDate,
      updatedEvent.allDay || false,
    );

    // Add the updated event to all new date keys
    newDateKeys.forEach((dateKey) => {
      if (!reactiveEvents.has(dateKey)) {
        reactiveEvents.set(dateKey, new Map());
      }
      reactiveEvents.get(dateKey)!.set(updatedEvent.id, updatedEvent);
    });

    if (typeof storeState.onEventUpdated === 'function') {
      storeState.onEventUpdated(updatedEvent);
    }

    // Trigger reactivity by creating a new Map reference
    storeState.reactiveEvents = new Map(reactiveEvents);

    // Clear the dragged event
    storeState.draggedEvent = null;
  }
}
