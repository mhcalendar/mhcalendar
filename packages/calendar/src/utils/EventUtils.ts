import { store } from '../store/mh-calendar-store';
import { IMHCalendarEvent } from '../types';
import { DateUtils } from './DateUtils';

export class EventUtils {
  static areEventsOverlapping(event1: IMHCalendarEvent, event2: IMHCalendarEvent): boolean {
    const start1 = event1.startDate.getTime();
    const end1 = event1.endDate.getTime();
    const start2 = event2.startDate.getTime();
    const end2 = event2.endDate.getTime();

    // Events overlap if one starts before the other ends
    return start1 < end2 && start2 < end1;
  }

  static shouldEventBeDisplayedInTimeView(
    event: IMHCalendarEvent,
    windowStart: number,
    windowEnd: number,
  ): boolean {
    return event.startDate.getTime() < windowEnd && event.endDate.getTime() > windowStart;
  }

  static getTimeViewWindow(dateKey: string): { windowStart: number; windowEnd: number } | null {
    const { showTimeFrom, showTimeTo } = store.state;
    if (!showTimeFrom || !showTimeTo) return null;

    const tz = store.mainTimezone;
    const windowStart = DateUtils.dateAtHourInTimezone(dateKey, showTimeFrom, 0, tz).getTime();
    const windowEnd = DateUtils.dateAtHourInTimezone(dateKey, showTimeTo, 0, tz).getTime();
    return { windowStart, windowEnd };
  }
}
