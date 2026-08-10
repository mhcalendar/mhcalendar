import dayjs from 'dayjs';
import { MINUTES_IN_HOUR } from './mh-calendar-day.const';
import { IMHCalendarEvent } from '../../types';
import { store, storeState } from '../../store/mh-calendar-store';
import { DateUtils } from '../../utils/DateUtils';

export class DayUtils {
  static getDayStyles(day: string | Date): string[] {
    const isDayCurrentMonth = dayjs(day).isSame(storeState.calendarDateRange.fromDate, 'month');
    const style = [];
    if (isDayCurrentMonth) style.push('current-month');
    // Needed to properly show days with styles but not in the current month
    if (!isDayCurrentMonth) style.push('different-month');

    if (DateUtils.isToday(day)) style.push('today');
    if (DateUtils.isWeekend(day)) style.push('weekend');
    return style;
  }

  static calculateCurrentTimePosition(calendarDayElementHeight: number) {
    const now = dayjs().tz(store.mainTimezone);
    const hours = now.hour();
    const minutes = now.minute();
    const { headerMargin, hoursRangeCal } = store;
    const { showTimeTo, showTimeFrom } = store.state;

    if (typeof showTimeFrom !== 'number' || typeof showTimeTo !== 'number') return;

    const totalDisplayedMinutes = hoursRangeCal * MINUTES_IN_HOUR;

    // Ensure the current time is within the displayed range
    const clampedHours = Math.max(showTimeFrom, Math.min(hours, showTimeTo));
    const clampedMinutes = clampedHours === hours ? minutes : 0;
    const currentDisplayedMinutes =
      (clampedHours - showTimeFrom) * MINUTES_IN_HOUR + clampedMinutes;
    const percentageOfDisplayedTime = (currentDisplayedMinutes / totalDisplayedMinutes) * 100;
    const topPosition =
      ((calendarDayElementHeight - headerMargin) * percentageOfDisplayedTime) / 100;

    const calculatedTopPosition = topPosition + headerMargin || 0;
    return {
      top: calculatedTopPosition + 'px',
      display: calculatedTopPosition === headerMargin ? 'none' : 'block',
    };
  }

  static groupEvents(events: IMHCalendarEvent[]): {
    dayEvents: Map<string, IMHCalendarEvent[]>;
    allDayEvents: IMHCalendarEvent[];
  } {
    const allDayEvents: IMHCalendarEvent[] = [];
    const regularEvents: IMHCalendarEvent[] = [];

    for (const event of events) {
      if (event.allDay) {
        allDayEvents.push(event);
      } else {
        regularEvents.push(event);
      }
    }

    regularEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    const groups: IMHCalendarEvent[][] = [];

    let currentGroup: IMHCalendarEvent[] | undefined;
    let maxEnd = -Infinity;

    for (const event of regularEvents) {
      const start = event.startDate.getTime();
      const end = event.endDate.getTime();

      if (!currentGroup || start >= maxEnd) {
        currentGroup = [event];
        groups.push(currentGroup);
        maxEnd = end;
      } else {
        currentGroup.push(event);
        maxEnd = Math.max(maxEnd, end);
      }
    }

    const dayEventsMap = new Map<string, IMHCalendarEvent[]>();

    groups.forEach((group, index) => {
      const earliestStartTime = group[0].startDate.getTime();
      const date = new Date(earliestStartTime);

      const timeKey = `${date.getUTCHours()}:${String(date.getUTCMinutes()).padStart(
        2,
        '0',
      )}-group-${index}`;

      dayEventsMap.set(timeKey, group);
    });

    allDayEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    return {
      dayEvents: dayEventsMap,
      allDayEvents,
    };
  }

  static getDragEventTopPosition(mousePosition: number, calendarDayElementHeight: number): number {
    const { hoursInDay, headerMargin } = store;
    const { showAllDayTasks } = store.state;

    const slotHeight = (calendarDayElementHeight - headerMargin) / hoursInDay;
    const slotIndex = Math.floor((mousePosition - headerMargin) / slotHeight);
    const topPosition = slotIndex * slotHeight;

    if ((showAllDayTasks && mousePosition < headerMargin) || mousePosition < 0) {
      return headerMargin || 1;
    }

    return topPosition + (headerMargin || 1);
  }
}
