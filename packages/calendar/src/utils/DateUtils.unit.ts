import { afterEach, beforeEach, describe, expect, it } from '@stencil/vitest';
import dayjs from 'dayjs';
import 'dayjs/locale/pl';
import '../global/global';
import { DateUtils } from './DateUtils';
import { store } from '../store/mh-calendar-store';
import { IMHCalendarEvent } from '../types';

function createEvent(start: string, end: string, allDay = false): IMHCalendarEvent {
  return {
    id: 'event',
    startDate: new Date(start),
    endDate: new Date(end),
    allDay,
  };
}

describe('DateUtils', () => {
  describe('convertDateToString', () => {
    it('formats using the default YYYY-MM-DD format', () => {
      expect(DateUtils.convertDateToString(new Date(2026, 6, 10))).toBe('2026-07-10');
    });

    it('formats using a custom format', () => {
      expect(DateUtils.convertDateToString(new Date(2026, 6, 10), 'DD/MM/YYYY')).toBe('10/07/2026');
    });
  });

  describe('formatDateRange', () => {
    it('returns a single date when isOneDay is true', () => {
      const day = new Date(2026, 6, 10);
      expect(DateUtils.formatDateRange(day, day, true)).toBe('July 10');
    });

    it('returns a single date when from and to are the same day, regardless of isOneDay', () => {
      const day = new Date(2026, 6, 10);
      expect(DateUtils.formatDateRange(day, day, false)).toBe('July 10');
    });

    it('collapses the end date to just a day number within the same month', () => {
      const from = new Date(2026, 6, 10);
      const to = new Date(2026, 6, 15);
      expect(DateUtils.formatDateRange(from, to)).toBe('July 10 - 15');
    });

    it('shows the full end month when the range spans two months', () => {
      const from = new Date(2026, 6, 28);
      const to = new Date(2026, 7, 2);
      expect(DateUtils.formatDateRange(from, to)).toBe('July 28 - August 2');
    });

    it('formats month names using the configured locale string', () => {
      const originalLocale = store.state.locale;
      store.state.locale = 'pl';
      try {
        const day = new Date(2026, 6, 10);
        expect(DateUtils.formatDateRange(day, day, true)).toBe('lipiec 10');
      } finally {
        store.state.locale = originalLocale;
      }
    });

    it('formats month names using a locale object, independent of any prior registration', () => {
      // A locale object self-registers wherever .locale() is called, unlike a bare string
      // (which relies on the locale already being registered on this exact Day.js instance —
      // see the `locale` config doc comment for why the consumer's own dayjs/locale/xx import
      // can't reach the Day.js instance bundled inside this package).
      const originalLocale = store.state.locale;
      const customLocale: ILocale = {
        name: 'test-locale',
        months:
          'Miesiac1_Miesiac2_Miesiac3_Miesiac4_Miesiac5_Miesiac6_Miesiac7_Miesiac8_Miesiac9_Miesiac10_Miesiac11_Miesiac12'.split(
            '_',
          ),
        formats: {},
        relativeTime: {},
      };
      store.state.locale = customLocale;
      try {
        const day = new Date(2026, 6, 10);
        expect(DateUtils.formatDateRange(day, day, true)).toBe('Miesiac7 10');
      } finally {
        store.state.locale = originalLocale;
      }
    });
  });

  describe('formatTime', () => {
    const originalTimezones = store.state.timezones;

    beforeEach(() => {
      store.state.timezones = ['America/New_York'];
    });

    afterEach(() => {
      store.state.timezones = originalTimezones;
    });

    it('formats the time in the configured main timezone', () => {
      // 18:30 UTC -> 14:30 EDT (UTC-4 in July)
      expect(DateUtils.formatTime(new Date('2026-07-10T18:30:00Z'))).toBe('2 PM');
    });
  });

  describe('formatEventTime', () => {
    const originalTimezones = store.state.timezones;

    beforeEach(() => {
      store.state.timezones = ['UTC'];
    });

    afterEach(() => {
      store.state.timezones = originalTimezones;
    });

    it('returns "All Day" for all-day events', () => {
      const event = createEvent('2026-07-10T00:00:00Z', '2026-07-11T00:00:00Z', true);
      expect(DateUtils.formatEventTime(event)).toBe('All Day');
    });

    it('formats a same-day event as a single time range', () => {
      const event = createEvent('2026-07-10T13:00:00Z', '2026-07-10T14:00:00Z');
      expect(DateUtils.formatEventTime(event)).toBe('1 PM - 2 PM');
    });

    it('formats a multi-day event with a date on each side', () => {
      const event = createEvent('2026-07-10T23:00:00Z', '2026-07-11T01:00:00Z');
      expect(DateUtils.formatEventTime(event)).toBe('Jul 10, 11 PM - Jul 11, 1 AM');
    });
  });

  describe('isToday', () => {
    it('returns true for the current date', () => {
      expect(DateUtils.isToday(new Date())).toBe(true);
    });

    it('returns true for the current date given as a string', () => {
      expect(DateUtils.isToday(dayjs().format('YYYY-MM-DD'))).toBe(true);
    });

    it('returns false for a date in the past', () => {
      expect(DateUtils.isToday(new Date(2020, 0, 1))).toBe(false);
    });
  });

  describe('isWeekend', () => {
    // 2026-07-10 is a Friday, 2026-07-11 a Saturday, 2026-07-12 a Sunday
    it('returns false for a weekday', () => {
      expect(DateUtils.isWeekend(new Date(2026, 6, 10))).toBe(false);
    });

    it('returns true for a Saturday', () => {
      expect(DateUtils.isWeekend(new Date(2026, 6, 11))).toBe(true);
    });

    it('returns true for a Sunday', () => {
      expect(DateUtils.isWeekend(new Date(2026, 6, 12))).toBe(true);
    });

    it('accepts a date given as a string', () => {
      expect(DateUtils.isWeekend('2026-07-11')).toBe(true);
    });
  });

  describe('dateAtHourInTimezone', () => {
    it('builds a UTC instant for an hour/minute in UTC', () => {
      const result = DateUtils.dateAtHourInTimezone('2026-07-10', 14, 30, 'UTC');
      expect(result.toISOString()).toBe('2026-07-10T14:30:00.000Z');
    });

    it('builds the correct UTC instant for a non-UTC timezone', () => {
      // America/New_York is UTC-4 (EDT) in July
      const result = DateUtils.dateAtHourInTimezone('2026-07-10', 14, 30, 'America/New_York');
      expect(result.toISOString()).toBe('2026-07-10T18:30:00.000Z');
    });

    it('defaults minute to 0 when not provided', () => {
      const result = DateUtils.dateAtHourInTimezone('2026-07-10', 9, undefined, 'UTC');
      expect(result.toISOString()).toBe('2026-07-10T09:00:00.000Z');
    });

    it('accepts a Date object as the day source', () => {
      const result = DateUtils.dateAtHourInTimezone(new Date('2026-07-10T00:00:00Z'), 9, 0, 'UTC');
      expect(result.toISOString()).toBe('2026-07-10T09:00:00.000Z');
    });
  });

  describe('dateToMinutesInTimezone', () => {
    it('returns minutes since midnight in the given timezone', () => {
      // 18:30 UTC -> 14:30 EDT (UTC-4 in July)
      expect(
        DateUtils.dateToMinutesInTimezone(new Date('2026-07-10T18:30:00Z'), 'America/New_York'),
      ).toBe(870);
    });

    it('returns 0 at local midnight', () => {
      expect(DateUtils.dateToMinutesInTimezone(new Date('2026-07-10T00:00:00Z'), 'UTC')).toBe(0);
    });
  });

  describe('getExactDateBasedOnUserPosition', () => {
    const originalTimezones = store.state.timezones;
    const originalShowTimeFrom = store.state.showTimeFrom;
    const originalShowTimeTo = store.state.showTimeTo;
    const originalHeightOfCalendarDay = store.state.heightOfCalendarDay;
    const originalShowAllDayTasks = store.state.showAllDayTasks;
    const originalAllDayEventsHeight = store.state.allDayEventsHeight;

    afterEach(() => {
      store.state.timezones = originalTimezones;
      store.state.showTimeFrom = originalShowTimeFrom;
      store.state.showTimeTo = originalShowTimeTo;
      store.state.heightOfCalendarDay = originalHeightOfCalendarDay;
      store.state.showAllDayTasks = originalShowAllDayTasks;
      store.state.allDayEventsHeight = originalAllDayEventsHeight;
    });

    it('returns the input date unchanged when heightOfCalendarDay is not configured', () => {
      store.state.heightOfCalendarDay = undefined;
      store.state.showTimeFrom = 8;
      store.state.showTimeTo = 17;
      const day = new Date(2026, 6, 10);
      expect(DateUtils.getExactDateBasedOnUserPosition(400, day)).toBe(day);
    });

    it('returns the input date unchanged when showTimeFrom/showTimeTo are not configured', () => {
      store.state.heightOfCalendarDay = 900;
      store.state.showTimeFrom = undefined as unknown as number;
      store.state.showTimeTo = undefined as unknown as number;
      const day = new Date(2026, 6, 10);
      expect(DateUtils.getExactDateBasedOnUserPosition(400, day)).toBe(day);
    });

    it('resolves the clicked time locally when the main timezone matches the system timezone', () => {
      store.state.timezones = [Intl.DateTimeFormat().resolvedOptions().timeZone];
      store.state.showAllDayTasks = false;
      store.state.showTimeFrom = 8;
      store.state.showTimeTo = 17; // 9h range -> 100px/hour over 900px
      store.state.heightOfCalendarDay = 900;

      const day = new Date(2026, 6, 10);
      const result = DateUtils.getExactDateBasedOnUserPosition(400, day);

      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(6);
      expect(result.getDate()).toBe(10);
      expect(result.getHours()).toBe(12);
      expect(result.getMinutes()).toBe(0);
    });

    it('offsets the mouse position by the header margin before resolving the local time', () => {
      store.state.timezones = [Intl.DateTimeFormat().resolvedOptions().timeZone];
      store.state.showAllDayTasks = true;
      store.state.allDayEventsHeight = 50;
      store.state.showTimeFrom = 8;
      store.state.showTimeTo = 17;
      store.state.heightOfCalendarDay = 950; // 50px header + 900px content

      const day = new Date(2026, 6, 10);
      const result = DateUtils.getExactDateBasedOnUserPosition(450, day);

      expect(result.getHours()).toBe(12);
      expect(result.getMinutes()).toBe(0);
    });

    it('resolves the clicked time via the configured timezone when it differs from the system timezone', () => {
      const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const otherTimezone = systemTimezone === 'Asia/Tokyo' ? 'Europe/Warsaw' : 'Asia/Tokyo';

      store.state.timezones = [otherTimezone];
      store.state.showAllDayTasks = false;
      store.state.showTimeFrom = 8;
      store.state.showTimeTo = 17;
      store.state.heightOfCalendarDay = 900;

      const day = new Date(2026, 6, 10);
      const result = DateUtils.getExactDateBasedOnUserPosition(400, day);
      const resultInTz = dayjs(result).tz(otherTimezone);

      expect(resultInTz.format('YYYY-MM-DD')).toBe(dayjs(day).format('YYYY-MM-DD'));
      expect(resultInTz.hour()).toBe(12);
      expect(resultInTz.minute()).toBe(0);
    });
  });
});
