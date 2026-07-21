import { afterEach, beforeEach, describe, expect, it } from '@stencil/vitest';
import '../global/global';
import { BusinessHoursUtils } from './BusinessHoursUtils';
import { store } from '../store/mh-calendar-store';
import { IMHCalendarViewType } from '../types/enums';
import { BusinessHoursConfig } from '../types';

describe('BusinessHoursUtils', () => {
  const originalTimezones = store.state.timezones;

  beforeEach(() => {
    store.state.timezones = ['UTC'];
  });

  afterEach(() => {
    store.state.timezones = originalTimezones;
  });

  describe('getBusinessHoursForDay', () => {
    it('returns null when businessHours is undefined', () => {
      expect(BusinessHoursUtils.getBusinessHoursForDay(new Date('2026-07-10'), undefined)).toBeNull();
    });

    it('returns null when businessHours is an empty array', () => {
      expect(BusinessHoursUtils.getBusinessHoursForDay(new Date('2026-07-10'), [])).toBeNull();
    });

    it('returns null when businessHours is not an array', () => {
      expect(
        BusinessHoursUtils.getBusinessHoursForDay(
          new Date('2026-07-10'),
          {} as unknown as BusinessHoursConfig[],
        ),
      ).toBeNull();
    });

    it('matches a specific date config over a day-of-week config', () => {
      const config: BusinessHoursConfig[] = [
        { dayOfWeek: [0, 1, 2, 3, 4, 5, 6], start: 9, end: 17 },
        { date: '2026-07-10', start: 10, end: 14 },
      ];
      // 2026-07-10 is a Friday (dayOfWeek 5)
      expect(BusinessHoursUtils.getBusinessHoursForDay(new Date('2026-07-10T12:00:00Z'), config)).toEqual({
        start: 10,
        end: 14,
      });
    });

    it('matches a day-of-week config when no specific date matches', () => {
      const config: BusinessHoursConfig[] = [{ dayOfWeek: 5, start: 9, end: 17 }];
      expect(BusinessHoursUtils.getBusinessHoursForDay(new Date('2026-07-10T12:00:00Z'), config)).toEqual({
        start: 9,
        end: 17,
      });
    });

    it('matches a day-of-week config given as an array containing the current day', () => {
      const config: BusinessHoursConfig[] = [{ dayOfWeek: [1, 2, 3, 4, 5], start: 9, end: 17 }];
      // 2026-07-10 is a Friday (dayOfWeek 5)
      expect(BusinessHoursUtils.getBusinessHoursForDay(new Date('2026-07-10T12:00:00Z'), config)).toEqual({
        start: 9,
        end: 17,
      });
    });

    it('falls back to the default config when no date or dayOfWeek matches', () => {
      const config: BusinessHoursConfig[] = [
        { dayOfWeek: [6], start: 10, end: 14 },
        { start: 9, end: 17 },
      ];
      // 2026-07-10 is a Friday, not in [6]
      expect(BusinessHoursUtils.getBusinessHoursForDay(new Date('2026-07-10T12:00:00Z'), config)).toEqual({
        start: 9,
        end: 17,
      });
    });

    it('returns null when nothing matches and there is no default config', () => {
      const config: BusinessHoursConfig[] = [{ dayOfWeek: [6], start: 10, end: 14 }];
      expect(BusinessHoursUtils.getBusinessHoursForDay(new Date('2026-07-10T12:00:00Z'), config)).toBeNull();
    });

    it('uses the configured main timezone to determine the current day', () => {
      store.state.timezones = ['Pacific/Kiritimati']; // UTC+14
      const config: BusinessHoursConfig[] = [{ dayOfWeek: 6, start: 9, end: 17 }];
      // 2026-07-10T12:00:00Z is a Friday in UTC, but Saturday in UTC+14
      expect(BusinessHoursUtils.getBusinessHoursForDay(new Date('2026-07-10T12:00:00Z'), config)).toEqual({
        start: 9,
        end: 17,
      });
    });
  });

  describe('isWithinBusinessHours', () => {
    it('returns true when no business hours are configured', () => {
      expect(BusinessHoursUtils.isWithinBusinessHours(new Date('2026-07-10T12:00:00Z'), undefined)).toBe(
        true,
      );
    });

    it('returns true when the time is within business hours', () => {
      const config: BusinessHoursConfig[] = [{ start: 9, end: 17 }];
      expect(BusinessHoursUtils.isWithinBusinessHours(new Date('2026-07-10T12:00:00Z'), config)).toBe(true);
    });

    it('returns true at the exact business hours start (inclusive)', () => {
      const config: BusinessHoursConfig[] = [{ start: 9, end: 17 }];
      expect(BusinessHoursUtils.isWithinBusinessHours(new Date('2026-07-10T09:00:00Z'), config)).toBe(true);
    });

    it('returns false at the exact business hours end (exclusive)', () => {
      const config: BusinessHoursConfig[] = [{ start: 9, end: 17 }];
      expect(BusinessHoursUtils.isWithinBusinessHours(new Date('2026-07-10T17:00:00Z'), config)).toBe(
        false,
      );
    });

    it('returns false when the time is before business hours', () => {
      const config: BusinessHoursConfig[] = [{ start: 9, end: 17 }];
      expect(BusinessHoursUtils.isWithinBusinessHours(new Date('2026-07-10T08:00:00Z'), config)).toBe(
        false,
      );
    });

    it('returns false when the time is after business hours', () => {
      const config: BusinessHoursConfig[] = [{ start: 9, end: 17 }];
      expect(BusinessHoursUtils.isWithinBusinessHours(new Date('2026-07-10T18:00:00Z'), config)).toBe(
        false,
      );
    });
  });

  describe('isEventWithinBusinessHours', () => {
    it('returns true when no business hours are configured', () => {
      expect(
        BusinessHoursUtils.isEventWithinBusinessHours(
          new Date('2026-07-10T12:00:00Z'),
          new Date('2026-07-10T20:00:00Z'),
          undefined,
        ),
      ).toBe(true);
    });

    it('returns true when the entire event fits within business hours', () => {
      const config: BusinessHoursConfig[] = [{ start: 9, end: 17 }];
      expect(
        BusinessHoursUtils.isEventWithinBusinessHours(
          new Date('2026-07-10T10:00:00Z'),
          new Date('2026-07-10T11:00:00Z'),
          config,
        ),
      ).toBe(true);
    });

    it('returns true when the event exactly matches business hours boundaries', () => {
      const config: BusinessHoursConfig[] = [{ start: 9, end: 17 }];
      expect(
        BusinessHoursUtils.isEventWithinBusinessHours(
          new Date('2026-07-10T09:00:00Z'),
          new Date('2026-07-10T17:00:00Z'),
          config,
        ),
      ).toBe(true);
    });

    it('returns false when the event starts before business hours', () => {
      const config: BusinessHoursConfig[] = [{ start: 9, end: 17 }];
      expect(
        BusinessHoursUtils.isEventWithinBusinessHours(
          new Date('2026-07-10T08:00:00Z'),
          new Date('2026-07-10T10:00:00Z'),
          config,
        ),
      ).toBe(false);
    });

    it('returns false when the event ends after business hours', () => {
      const config: BusinessHoursConfig[] = [{ start: 9, end: 17 }];
      expect(
        BusinessHoursUtils.isEventWithinBusinessHours(
          new Date('2026-07-10T16:00:00Z'),
          new Date('2026-07-10T18:00:00Z'),
          config,
        ),
      ).toBe(false);
    });
  });

  describe('getNonBusinessHoursStyles', () => {
    const day = new Date('2026-07-10T00:00:00Z');

    it('returns an empty array when viewType is missing', () => {
      expect(
        BusinessHoursUtils.getNonBusinessHoursStyles(day, 800, undefined, { start: 9, end: 17 }, 8, 17, 0),
      ).toEqual([]);
    });

    it('returns an empty array when calendarDayElementHeight is 0', () => {
      expect(
        BusinessHoursUtils.getNonBusinessHoursStyles(
          day,
          0,
          IMHCalendarViewType.DAY,
          { start: 9, end: 17 },
          8,
          17,
          0,
        ),
      ).toEqual([]);
    });

    it('returns an empty array for non-time views (e.g. MONTH)', () => {
      expect(
        BusinessHoursUtils.getNonBusinessHoursStyles(
          day,
          800,
          IMHCalendarViewType.MONTH,
          { start: 9, end: 17 },
          8,
          17,
          0,
        ),
      ).toEqual([]);
    });

    it('returns an empty array when businessHours is null', () => {
      expect(
        BusinessHoursUtils.getNonBusinessHoursStyles(day, 800, IMHCalendarViewType.DAY, null, 8, 17, 0),
      ).toEqual([]);
    });

    it('returns an empty array when showTimeFrom/showTimeTo are not configured', () => {
      expect(
        BusinessHoursUtils.getNonBusinessHoursStyles(
          day,
          800,
          IMHCalendarViewType.DAY,
          { start: 9, end: 17 },
          undefined,
          undefined,
          0,
        ),
      ).toEqual([]);
    });

    it('does not short-circuit when showTimeFrom is 0 (midnight is a valid start hour)', () => {
      const styles = BusinessHoursUtils.getNonBusinessHoursStyles(
        day,
        900, // (9-0)*100 => 100px/hour
        IMHCalendarViewType.DAY,
        { start: 3, end: 9 },
        0,
        9,
        0,
      );
      expect(styles).toHaveLength(1);
      expect(styles[0].top).toBe('0px');
      expect(parseFloat(styles[0].height)).toBeCloseTo(300, 5);
    });

    it('returns no overlays when business hours span the entire displayed range', () => {
      const styles = BusinessHoursUtils.getNonBusinessHoursStyles(
        day,
        900, // (17-8)*100 => 100px/hour
        IMHCalendarViewType.DAY,
        { start: 8, end: 17 },
        8,
        17,
        0,
      );
      expect(styles).toEqual([]);
    });

    it('returns an overlay before business hours start', () => {
      const styles = BusinessHoursUtils.getNonBusinessHoursStyles(
        day,
        900, // 9 hours displayed -> 100px per hour
        IMHCalendarViewType.DAY,
        { start: 9, end: 17 },
        8,
        17,
        0,
      );
      expect(styles).toHaveLength(1);
      expect(styles[0]).toMatchObject({
        position: 'absolute',
        top: '0px',
        left: '0',
        width: '100%',
        height: '100px',
      });
    });

    it('returns an overlay after business hours end', () => {
      const styles = BusinessHoursUtils.getNonBusinessHoursStyles(
        day,
        900,
        IMHCalendarViewType.DAY,
        { start: 8, end: 16 },
        8,
        17,
        0,
      );
      expect(styles).toHaveLength(1);
      expect(styles[0]).toMatchObject({
        position: 'absolute',
        top: '800px',
        left: '0',
        width: '100%',
        height: '100px',
      });
    });

    it('returns overlays both before and after business hours', () => {
      const styles = BusinessHoursUtils.getNonBusinessHoursStyles(
        day,
        900,
        IMHCalendarViewType.DAY,
        { start: 9, end: 16 },
        8,
        17,
        0,
      );
      expect(styles).toHaveLength(2);
    });

    it('offsets overlay positions by the header margin', () => {
      const styles = BusinessHoursUtils.getNonBusinessHoursStyles(
        day,
        920, // 20px header margin + 900px content
        IMHCalendarViewType.DAY,
        { start: 9, end: 17 },
        8,
        17,
        20,
      );
      expect(styles).toHaveLength(1);
      expect(styles[0].top).toBe('20px');
      expect(styles[0].height).toBe('100px');
    });
  });

  describe('isDragPositionBlockedByBusinessHours', () => {
    const day = new Date('2026-07-10T00:00:00Z');
    const originalShowTimeFrom = store.state.showTimeFrom;
    const originalShowTimeTo = store.state.showTimeTo;
    const originalHeightOfCalendarDay = store.state.heightOfCalendarDay;
    const originalShowAllDayTasks = store.state.showAllDayTasks;

    beforeEach(() => {
      // showTimeFrom must be non-zero: DateUtils.getExactDateBasedOnUserPosition
      // treats `0` as "not configured" due to a falsy check on the value.
      store.state.showTimeFrom = 6;
      store.state.showTimeTo = 22;
      store.state.heightOfCalendarDay = 1600; // 16h range -> 100px per hour
      store.state.showAllDayTasks = false; // keep headerMargin at 0
    });

    afterEach(() => {
      store.state.showTimeFrom = originalShowTimeFrom;
      store.state.showTimeTo = originalShowTimeTo;
      store.state.heightOfCalendarDay = originalHeightOfCalendarDay;
      store.state.showAllDayTasks = originalShowAllDayTasks;
    });

    const event = {
      startDate: new Date('2026-07-10T10:00:00Z'),
      endDate: new Date('2026-07-10T11:00:00Z'),
    };

    it('returns false when blockBusinessHours is false', () => {
      expect(
        BusinessHoursUtils.isDragPositionBlockedByBusinessHours(0, day, event, false, [
          { start: 9, end: 17 },
        ]),
      ).toBe(false);
    });

    it('returns false when day is undefined', () => {
      expect(
        BusinessHoursUtils.isDragPositionBlockedByBusinessHours(0, undefined, event, true, [
          { start: 9, end: 17 },
        ]),
      ).toBe(false);
    });

    it('returns false when event is null', () => {
      expect(
        BusinessHoursUtils.isDragPositionBlockedByBusinessHours(0, day, null, true, [
          { start: 9, end: 17 },
        ]),
      ).toBe(false);
    });

    it('returns false for all-day events regardless of business hours', () => {
      expect(
        BusinessHoursUtils.isDragPositionBlockedByBusinessHours(
          0,
          day,
          { ...event, allDay: true },
          true,
          [{ start: 9, end: 17 }],
        ),
      ).toBe(false);
    });

    it('returns false when the dragged position keeps the event within business hours', () => {
      // top position 400px -> 400/1600 of the 06:00-22:00 range -> 10:00, 1-hour event -> 10:00-11:00, within 9-17
      expect(
        BusinessHoursUtils.isDragPositionBlockedByBusinessHours(400, day, event, true, [
          { start: 9, end: 17 },
        ]),
      ).toBe(false);
    });

    it('returns true when the dragged position moves the event outside business hours', () => {
      // top position 100px -> 07:00, 1-hour event -> 07:00-08:00, before 9-17
      expect(
        BusinessHoursUtils.isDragPositionBlockedByBusinessHours(100, day, event, true, [
          { start: 9, end: 17 },
        ]),
      ).toBe(true);
    });
  });
});
