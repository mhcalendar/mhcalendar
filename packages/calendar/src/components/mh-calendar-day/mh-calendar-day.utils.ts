import dayjs from 'dayjs';
import { MINUTES_IN_HOUR } from './mh-calendar-day.const';
import { IMHCalendarEvent } from '../../types';
import { store, storeState } from '../../store/mh-calendar-store';
import { EventUtils } from '../../utils/EventUtils';
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
      (event.allDay ? allDayEvents : regularEvents).push(event);
    }

    const groups: IMHCalendarEvent[][] = [];

    // Process only regular events (not all-day events)
    regularEvents.forEach((currentEvent) => {
      const overlappingGroupIndices: number[] = [];

      // Find ALL existing groups that currentEvent overlaps with
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        // Check if currentEvent overlaps with ANY event in this group
        if (group.some((groupEvent) => EventUtils.areEventsOverlapping(currentEvent, groupEvent))) {
          overlappingGroupIndices.push(i);
        }
      }

      if (overlappingGroupIndices.length === 0) {
        // No overlapping group found, create a new group
        groups.push([currentEvent]);
      } else {
        // Current event overlaps with one or more existing groups.
        // Add currentEvent to the first overlapping group.
        const targetGroupIndex = overlappingGroupIndices[0];
        groups[targetGroupIndex].push(currentEvent);

        // If currentEvent overlapped with multiple groups, these groups now need to be merged.
        // Merge other overlapping groups (beyond the first one) into the targetGroup.
        // Iterate backwards because we are modifying the 'groups' array by splicing.
        for (let i = overlappingGroupIndices.length - 1; i > 0; i--) {
          const groupToMergeIndex = overlappingGroupIndices[i];
          groups[targetGroupIndex].push(...groups[groupToMergeIndex]);
          groups.splice(groupToMergeIndex, 1); // Remove the merged group
        }
      }
    });

    // Convert groups to Map format (dayEvents)
    const dayEventsMap = new Map<string, IMHCalendarEvent[]>();
    groups.forEach((group, index) => {
      // Sort events within the group by start date for consistent key generation (optional but good)
      group.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
      const earliestStartTime = group[0].startDate.getTime(); // Assumes sorted or you can use Math.min
      const keyDate = new Date(earliestStartTime);

      // Using UTC methods for keys can make them more consistent across timezones
      const timeKey = `${keyDate.getUTCHours()}:${String(keyDate.getUTCMinutes()).padStart(2, '0')}-group-${index}`;
      dayEventsMap.set(timeKey, group);
    });

    // Sort all-day events by start date for consistency
    allDayEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    return {
      dayEvents: dayEventsMap,
      allDayEvents: allDayEvents,
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
