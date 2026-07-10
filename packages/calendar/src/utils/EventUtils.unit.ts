import { afterEach, beforeEach, describe, expect, it } from '@stencil/vitest';
import '../global/global';
import { EventUtils } from './EventUtils';
import { store } from '../store/mh-calendar-store';
import { IMHCalendarEvent } from '../types';

function createEvent(start: string, end: string): IMHCalendarEvent {
  return {
    id: 'event',
    startDate: new Date(start),
    endDate: new Date(end),
  };
}

describe('EventUtils', () => {
  describe('areEventsOverlapping', () => {
    it('returns true when events overlap partially', () => {
      const event1 = createEvent('2026-07-10T10:00:00Z', '2026-07-10T12:00:00Z');
      const event2 = createEvent('2026-07-10T11:00:00Z', '2026-07-10T13:00:00Z');
      expect(EventUtils.areEventsOverlapping(event1, event2)).toBe(true);
    });

    it('returns true when one event fully contains another', () => {
      const event1 = createEvent('2026-07-10T09:00:00Z', '2026-07-10T17:00:00Z');
      const event2 = createEvent('2026-07-10T10:00:00Z', '2026-07-10T11:00:00Z');
      expect(EventUtils.areEventsOverlapping(event1, event2)).toBe(true);
    });

    it('returns true when events have identical start and end', () => {
      const event1 = createEvent('2026-07-10T10:00:00Z', '2026-07-10T11:00:00Z');
      const event2 = createEvent('2026-07-10T10:00:00Z', '2026-07-10T11:00:00Z');
      expect(EventUtils.areEventsOverlapping(event1, event2)).toBe(true);
    });

    it('returns false when one event ends exactly when the other starts', () => {
      const event1 = createEvent('2026-07-10T09:00:00Z', '2026-07-10T10:00:00Z');
      const event2 = createEvent('2026-07-10T10:00:00Z', '2026-07-10T11:00:00Z');
      expect(EventUtils.areEventsOverlapping(event1, event2)).toBe(false);
    });

    it('returns false when events are sequential with a gap', () => {
      const event1 = createEvent('2026-07-10T09:00:00Z', '2026-07-10T10:00:00Z');
      const event2 = createEvent('2026-07-10T12:00:00Z', '2026-07-10T13:00:00Z');
      expect(EventUtils.areEventsOverlapping(event1, event2)).toBe(false);
    });

    it('is symmetric regardless of argument order', () => {
      const event1 = createEvent('2026-07-10T10:00:00Z', '2026-07-10T12:00:00Z');
      const event2 = createEvent('2026-07-10T11:00:00Z', '2026-07-10T13:00:00Z');
      expect(EventUtils.areEventsOverlapping(event2, event1)).toBe(true);
    });
  });

  describe('shouldEventBeDisplayedInTimeView', () => {
    const windowStart = new Date('2026-07-10T08:00:00Z').getTime();
    const windowEnd = new Date('2026-07-10T17:00:00Z').getTime();

    it('returns true when the event is fully inside the window', () => {
      const event = createEvent('2026-07-10T10:00:00Z', '2026-07-10T11:00:00Z');
      expect(EventUtils.shouldEventBeDisplayedInTimeView(event, windowStart, windowEnd)).toBe(true);
    });

    it('returns true when the event starts before and ends inside the window', () => {
      const event = createEvent('2026-07-10T06:00:00Z', '2026-07-10T09:00:00Z');
      expect(EventUtils.shouldEventBeDisplayedInTimeView(event, windowStart, windowEnd)).toBe(true);
    });

    it('returns true when the event starts inside and ends after the window', () => {
      const event = createEvent('2026-07-10T16:00:00Z', '2026-07-10T19:00:00Z');
      expect(EventUtils.shouldEventBeDisplayedInTimeView(event, windowStart, windowEnd)).toBe(true);
    });

    it('returns false when the event ends exactly at windowStart', () => {
      const event = createEvent('2026-07-10T06:00:00Z', '2026-07-10T08:00:00Z');
      expect(EventUtils.shouldEventBeDisplayedInTimeView(event, windowStart, windowEnd)).toBe(false);
    });

    it('returns false when the event starts exactly at windowEnd', () => {
      const event = createEvent('2026-07-10T17:00:00Z', '2026-07-10T19:00:00Z');
      expect(EventUtils.shouldEventBeDisplayedInTimeView(event, windowStart, windowEnd)).toBe(false);
    });

    it('returns false when the event is entirely before the window', () => {
      const event = createEvent('2026-07-10T04:00:00Z', '2026-07-10T05:00:00Z');
      expect(EventUtils.shouldEventBeDisplayedInTimeView(event, windowStart, windowEnd)).toBe(false);
    });

    it('returns false when the event is entirely after the window', () => {
      const event = createEvent('2026-07-10T18:00:00Z', '2026-07-10T19:00:00Z');
      expect(EventUtils.shouldEventBeDisplayedInTimeView(event, windowStart, windowEnd)).toBe(false);
    });
  });

  describe('getTimeViewWindow', () => {
    const originalShowTimeFrom = store.state.showTimeFrom;
    const originalShowTimeTo = store.state.showTimeTo;
    const originalTimezones = store.state.timezones;

    beforeEach(() => {
      store.state.timezones = ['UTC'];
    });

    afterEach(() => {
      store.state.showTimeFrom = originalShowTimeFrom;
      store.state.showTimeTo = originalShowTimeTo;
      store.state.timezones = originalTimezones;
    });

    it('returns null when showTimeFrom is not configured', () => {
      store.state.showTimeFrom = undefined as unknown as number;
      store.state.showTimeTo = 17;
      expect(EventUtils.getTimeViewWindow('2026-07-10')).toBeNull();
    });

    it('returns null when showTimeTo is not configured', () => {
      store.state.showTimeFrom = 8;
      store.state.showTimeTo = undefined as unknown as number;
      expect(EventUtils.getTimeViewWindow('2026-07-10')).toBeNull();
    });

    it('computes the window when showTimeFrom is 0 (midnight is a valid start hour)', () => {
      store.state.showTimeFrom = 0;
      store.state.showTimeTo = 12;

      const result = EventUtils.getTimeViewWindow('2026-07-10');

      expect(result).toEqual({
        windowStart: new Date('2026-07-10T00:00:00Z').getTime(),
        windowEnd: new Date('2026-07-10T12:00:00Z').getTime(),
      });
    });

    it('computes the window start/end for the given date in the configured timezone', () => {
      store.state.showTimeFrom = 8;
      store.state.showTimeTo = 17;

      const result = EventUtils.getTimeViewWindow('2026-07-10');

      expect(result).toEqual({
        windowStart: new Date('2026-07-10T08:00:00Z').getTime(),
        windowEnd: new Date('2026-07-10T17:00:00Z').getTime(),
      });
    });

    it('shifts the window when a non-UTC main timezone is configured', () => {
      store.state.timezones = ['Europe/Warsaw'];
      store.state.showTimeFrom = 8;
      store.state.showTimeTo = 17;

      const result = EventUtils.getTimeViewWindow('2026-07-10');

      // Warsaw is UTC+2 in July (CEST)
      expect(result).toEqual({
        windowStart: new Date('2026-07-10T06:00:00Z').getTime(),
        windowEnd: new Date('2026-07-10T15:00:00Z').getTime(),
      });
    });
  });
});
