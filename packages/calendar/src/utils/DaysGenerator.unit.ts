import { afterEach, beforeEach, describe, expect, it, vi } from '@stencil/vitest';
import '../global/global';
import { DaysGenerator } from './DaysGenerator';
import { store, storeState } from '../store/mh-calendar-store';

describe('DaysGenerator', () => {
  describe('getDaysInWeek', () => {
    const originalFromDate = storeState.calendarDateRange.fromDate;

    afterEach(() => {
      storeState.calendarDateRange.fromDate = originalFromDate;
      vi.useRealTimers();
    });

    it('returns an empty array when calendarDateRange.fromDate is not set', () => {
      storeState.calendarDateRange.fromDate = undefined;
      expect(DaysGenerator.getDaysInWeek()).toEqual([]);
    });

    it('returns 7 consecutive days starting on Monday of the configured week', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 6, 10)); // system "today": Fri Jul 10 2026
      storeState.calendarDateRange.fromDate = new Date(2026, 6, 8); // Wed Jul 8 2026

      const result = DaysGenerator.getDaysInWeek();

      expect(result).toHaveLength(7);
      expect(result.map((d) => d.toDateString())).toEqual([
        'Mon Jul 06 2026',
        'Tue Jul 07 2026',
        'Wed Jul 08 2026',
        'Thu Jul 09 2026',
        'Fri Jul 10 2026',
        'Sat Jul 11 2026',
        'Sun Jul 12 2026',
      ]);
    });

    it('returns the same week when fromDate already falls on a Monday', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 6, 10));
      storeState.calendarDateRange.fromDate = new Date(2026, 6, 6); // Mon Jul 6 2026

      const result = DaysGenerator.getDaysInWeek();

      expect(result[0].toDateString()).toBe('Mon Jul 06 2026');
      expect(result[6].toDateString()).toBe('Sun Jul 12 2026');
    });
  });

  describe('getDatesForMonthView', () => {
    it('returns exactly 42 dates (a full 6-week grid)', () => {
      const result = DaysGenerator.getDatesForMonthView(new Date(2026, 6, 15));
      expect(result).toHaveLength(42);
    });

    it('starts the grid on a Monday and ends on a Sunday', () => {
      const result = DaysGenerator.getDatesForMonthView(new Date(2026, 6, 15));
      expect(result[0].getDay()).toBe(1);
      expect(result[result.length - 1].getDay()).toBe(0);
    });

    it('pads with days from the previous and next month to fill the grid', () => {
      const result = DaysGenerator.getDatesForMonthView(new Date(2026, 6, 15));

      expect(result[0].toDateString()).toBe('Mon Jun 29 2026');
      expect(result[result.length - 1].toDateString()).toBe('Sun Aug 09 2026');
    });

    it('includes every day of the target month', () => {
      const result = DaysGenerator.getDatesForMonthView(new Date(2026, 6, 15));
      const daysInJuly = result.filter((d) => d.getFullYear() === 2026 && d.getMonth() === 6);
      expect(daysInJuly).toHaveLength(31);
      expect(daysInJuly[0].getDate()).toBe(1);
      expect(daysInJuly[daysInJuly.length - 1].getDate()).toBe(31);
    });
  });

  describe('getDatesForMultiView', () => {
    const originalFromDate = storeState.calendarDateRange.fromDate;
    const originalToDate = storeState.calendarDateRange.toDate;
    const originalHiddenDays = storeState.hiddenDays;

    beforeEach(() => {
      storeState.hiddenDays = [];
    });

    afterEach(() => {
      storeState.calendarDateRange.fromDate = originalFromDate;
      storeState.calendarDateRange.toDate = originalToDate;
      storeState.hiddenDays = originalHiddenDays;
    });

    it('returns an empty array when no date range is configured', () => {
      storeState.calendarDateRange.fromDate = undefined;
      storeState.calendarDateRange.toDate = undefined;
      expect(DaysGenerator.getDatesForMultiView()).toEqual([]);
    });

    it('returns an empty array when fromDate is after toDate', () => {
      storeState.calendarDateRange.fromDate = new Date(2026, 6, 12);
      storeState.calendarDateRange.toDate = new Date(2026, 6, 6);
      expect(DaysGenerator.getDatesForMultiView()).toEqual([]);
    });

    it('returns a single-element array when fromDate and toDate are the same day', () => {
      const day = new Date(2026, 6, 10);
      storeState.calendarDateRange.fromDate = day;
      storeState.calendarDateRange.toDate = day;
      expect(DaysGenerator.getDatesForMultiView()).toEqual([day]);
    });

    it('returns every day in the range when no days are hidden', () => {
      storeState.calendarDateRange.fromDate = new Date(2026, 6, 6); // Monday
      storeState.calendarDateRange.toDate = new Date(2026, 6, 12); // Sunday
      const result = DaysGenerator.getDatesForMultiView();
      expect(result.map((d) => d.toDateString())).toEqual([
        'Mon Jul 06 2026',
        'Tue Jul 07 2026',
        'Wed Jul 08 2026',
        'Thu Jul 09 2026',
        'Fri Jul 10 2026',
        'Sat Jul 11 2026',
        'Sun Jul 12 2026',
      ]);
    });

    it('excludes days listed in hiddenDays', () => {
      storeState.calendarDateRange.fromDate = new Date(2026, 6, 6); // Monday
      storeState.calendarDateRange.toDate = new Date(2026, 6, 12); // Sunday
      storeState.hiddenDays = [0, 6]; // Sunday, Saturday

      const result = DaysGenerator.getDatesForMultiView();

      expect(result.map((d) => d.toDateString())).toEqual([
        'Mon Jul 06 2026',
        'Tue Jul 07 2026',
        'Wed Jul 08 2026',
        'Thu Jul 09 2026',
        'Fri Jul 10 2026',
      ]);
    });

    it('normalizes a hiddenDays value of 7 to Sunday (0)', () => {
      storeState.calendarDateRange.fromDate = new Date(2026, 6, 6); // Monday
      storeState.calendarDateRange.toDate = new Date(2026, 6, 12); // Sunday
      storeState.hiddenDays = [7];

      const result = DaysGenerator.getDatesForMultiView();

      expect(result.map((d) => d.toDateString())).not.toContain('Sun Jul 12 2026');
      expect(result).toHaveLength(6);
    });
  });

  describe('generateSlotHours', () => {
    const originalShowTimeFrom = store.state.showTimeFrom;
    const originalShowTimeTo = store.state.showTimeTo;

    afterEach(() => {
      store.state.showTimeFrom = originalShowTimeFrom;
      store.state.showTimeTo = originalShowTimeTo;
    });

    it('returns an empty array when showTimeFrom is not configured', () => {
      store.state.showTimeFrom = undefined as unknown as number;
      store.state.showTimeTo = 17;
      expect(DaysGenerator.generateSlotHours({ hours: 1, minutes: 0 })).toEqual([]);
    });

    it('returns an empty array when showTimeTo is not configured', () => {
      store.state.showTimeFrom = 8;
      store.state.showTimeTo = undefined as unknown as number;
      expect(DaysGenerator.generateSlotHours({ hours: 1, minutes: 0 })).toEqual([]);
    });

    it('returns an empty array when the interval is 0', () => {
      store.state.showTimeFrom = 8;
      store.state.showTimeTo = 17;
      expect(DaysGenerator.generateSlotHours({ hours: 0, minutes: 0 })).toEqual([]);
    });

    it('generates one slot per hour, inclusive of both ends', () => {
      store.state.showTimeFrom = 8;
      store.state.showTimeTo = 12;
      expect(DaysGenerator.generateSlotHours({ hours: 1, minutes: 0 })).toEqual([
        '8',
        '9',
        '10',
        '11',
        '12',
      ]);
    });

    it('generates half-hour slots with minute suffixes', () => {
      store.state.showTimeFrom = 8;
      store.state.showTimeTo = 9;
      expect(DaysGenerator.generateSlotHours({ hours: 0, minutes: 30 })).toEqual([
        '8',
        '8:30',
        '9',
      ]);
    });

    it('stops before showTimeTo when the interval does not divide it evenly', () => {
      store.state.showTimeFrom = 8;
      store.state.showTimeTo = 10;
      expect(DaysGenerator.generateSlotHours({ hours: 0, minutes: 45 })).toEqual([
        '8',
        '8:45',
        '9:30',
      ]);
    });

    it('returns a single slot when showTimeFrom equals showTimeTo', () => {
      store.state.showTimeFrom = 9;
      store.state.showTimeTo = 9;
      expect(DaysGenerator.generateSlotHours({ hours: 1, minutes: 0 })).toEqual(['9']);
    });

    it('includes midnight (0) as a valid start hour', () => {
      store.state.showTimeFrom = 0;
      store.state.showTimeTo = 2;
      expect(DaysGenerator.generateSlotHours({ hours: 1, minutes: 0 })).toEqual(['0', '1', '2']);
    });
  });
});
