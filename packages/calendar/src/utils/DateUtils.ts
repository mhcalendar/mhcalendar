import dayjs from 'dayjs';
import { MINUTES_IN_HOUR, WEEKEND_DAYS } from '../components/mh-calendar-day/mh-calendar-day.const';
import { store, storeState } from '../store/mh-calendar-store';
import { IMHCalendarEvent } from '../types';

export class DateUtils {
  static convertDateToString = (date: Date, format: string = 'YYYY-MM-DD'): string => {
    return dayjs(date).format(format);
  };

  static formatDateRange(from: Date, to: Date, isOneDay = false): string {
    const fromDate = dayjs(from);
    const toDate = dayjs(to);

    if (isOneDay || fromDate.isSame(toDate, 'day')) {
      return fromDate.format('MMMM D, YYYY');
    }

    const sameMonth = fromDate.month() === toDate.month();
    const sameYear = fromDate.year() === toDate.year();

    const fromStr = fromDate.format('MMMM D');
    const toStr = sameMonth ? toDate.format('D') : toDate.format('MMMM D');

    const yearStr = sameYear
      ? fromDate.format(', YYYY')
      : `, ${fromDate.year()} - ${toDate.year()}`;

    return `${fromStr} - ${toStr}${yearStr}`;
  }

  static formatTime(date: Date): string {
    return dayjs(date).tz(store.mainTimezone).format(storeState.hoursDisplayFormat);
  }

  static formatEventTime(event: IMHCalendarEvent): string {
    if (event.allDay) {
      return 'All Day';
    }

    const tz = store.mainTimezone;
    const startTime = dayjs(event.startDate).tz(tz);
    const endTime = dayjs(event.endDate).tz(tz);

    if (startTime.isSame(endTime, 'day')) {
      return `${DateUtils.formatTime(event.startDate)} - ${DateUtils.formatTime(event.endDate)}`;
    }

    const fmt = storeState.hoursDisplayFormat;
    return `${startTime.format(`MMM D, ${fmt}`)} - ${endTime.format(`MMM D, ${fmt}`)}`;
  }

  static isToday(day: string | Date): boolean {
    return dayjs(day).isSame(dayjs(), 'day');
  }

  static isWeekend(day: string | Date): boolean {
    return WEEKEND_DAYS.includes(dayjs(day).day());
  }

  static getExactDateBasedOnUserPosition(userTopPosition: number, dayToSet: Date): Date {
    const { heightOfCalendarDay, showTimeTo, showTimeFrom } = store.state;
    const { headerMargin } = store;

    if (!heightOfCalendarDay || !showTimeTo || !showTimeFrom) return dayToSet;

    const adjustedMousePosition = userTopPosition - headerMargin;
    const adjustedCalendarHeight = heightOfCalendarDay - headerMargin;
    const userPositionInDayPercentage = adjustedMousePosition / adjustedCalendarHeight;

    const totalDisplayedMinutes = (showTimeTo - showTimeFrom) * MINUTES_IN_HOUR;
    const totalMinutesFromStart = Math.round(totalDisplayedMinutes * userPositionInDayPercentage);

    const absoluteMinutesSinceMidnight = showTimeFrom * MINUTES_IN_HOUR + totalMinutesFromStart;

    const clickedHour = Math.floor(absoluteMinutesSinceMidnight / MINUTES_IN_HOUR);
    const clickedMinutes = absoluteMinutesSinceMidnight % MINUTES_IN_HOUR;

    if (store.mainTimezone !== Intl.DateTimeFormat().resolvedOptions().timeZone) {
      return DateUtils.dateAtHourInTimezone(
        dayToSet,
        clickedHour,
        clickedMinutes,
        store.mainTimezone,
      );
    }

    const newDate = new Date(dayToSet);
    newDate.setHours(clickedHour, clickedMinutes, 0, 0);
    return newDate;
  }

  static dateAtHourInTimezone(
    date: Date | string,
    hour: number,
    minute: number = 0,
    timezone: string,
  ): Date {
    const dayString = typeof date === 'string' ? date : dayjs(date).format('YYYY-MM-DD');
    return dayjs
      .tz(
        `${dayString} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`,
        timezone,
      )
      .toDate();
  }

  static dateToMinutesInTimezone(date: Date, timezone: string): number {
    const d = dayjs(date).tz(timezone);
    return d.hour() * MINUTES_IN_HOUR + d.minute();
  }
}
