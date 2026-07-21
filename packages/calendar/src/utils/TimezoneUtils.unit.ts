import { describe, expect, it, vi } from '@stencil/vitest';
import '../global/global';
import { TimezoneUtils } from './TimezoneUtils';

const REFERENCE_DATE = new Date('2026-07-10T14:00:00Z');
const MAIN_TIMEZONE = 'Europe/Warsaw';
const TARGET_TIMEZONE_WEST = 'America/Sao_Paulo';
const TARGET_TIMEZONE_EAST = 'Asia/Tokyo';

describe('TimezoneUtils', () => {

  describe('formatTimeInTimezone', () => {

    describe('same timezone - returns the time unchanged', () => {
      it('in the middle of the day', () => {
        const result = TimezoneUtils.formatTimeInTimezone(
          16,
          30,
          MAIN_TIMEZONE,
          MAIN_TIMEZONE,
          'HH:mm',
          REFERENCE_DATE,
        );
        expect(result).toBe('16:30');
      });

      it('pre midnight', () => {
        const result = TimezoneUtils.formatTimeInTimezone(
          23,
          59,
          MAIN_TIMEZONE,
          MAIN_TIMEZONE,
          'HH:mm',
          REFERENCE_DATE,
        );
        expect(result).toBe('23:59');
      });

      it('midnight', () => {
        const result = TimezoneUtils.formatTimeInTimezone(
          0,
          0,
          MAIN_TIMEZONE,
          MAIN_TIMEZONE,
          'HH:mm',
          REFERENCE_DATE,
        );
        expect(result).toBe('00:00');
      });

      it('post midnight', () => {
        const result = TimezoneUtils.formatTimeInTimezone(
          23,
          59,
          MAIN_TIMEZONE,
          MAIN_TIMEZONE,
          'HH:mm',
          REFERENCE_DATE,
        );
        expect(result).toBe('23:59');
      });
    });


    describe('different timezone - west of main', () => {
      it('converts to an earlier local time', () => {
        const result = TimezoneUtils.formatTimeInTimezone(
          14,
          0,
          MAIN_TIMEZONE,
          TARGET_TIMEZONE_WEST,
          'HH:mm',
          REFERENCE_DATE,
        );
        expect(result).toBe('09:00');
      });

      it('local midnight', () => {
        const result = TimezoneUtils.formatTimeInTimezone(
          0,
          0,
          MAIN_TIMEZONE,
          TARGET_TIMEZONE_WEST,
          'HH:mm',
          REFERENCE_DATE,
        );
        expect(result).toBe('19:00');
      });

      it('target midnight', () => {
        const result = TimezoneUtils.formatTimeInTimezone(
          5,
          0,
          MAIN_TIMEZONE,
          TARGET_TIMEZONE_WEST,
          'HH:mm',
          REFERENCE_DATE,
        );
        expect(result).toBe('00:00');
      });

      it('over midnight', () => {
        const result = TimezoneUtils.formatTimeInTimezone(
          3,
          0,
          MAIN_TIMEZONE,
          TARGET_TIMEZONE_WEST,
          'HH:mm',
          REFERENCE_DATE,
        );
        expect(result).toBe('22:00');
      });
    });

    describe('different timezone - east of main', () => {
      it('converts to a later local time', () => {
        const result = TimezoneUtils.formatTimeInTimezone(
          14,
          0,
          MAIN_TIMEZONE,
          TARGET_TIMEZONE_EAST,
          'HH:mm',
          REFERENCE_DATE,
        );
        expect(result).toBe('21:00');
      });

      it('local midnight', () => {
        const result = TimezoneUtils.formatTimeInTimezone(
          0,
          0,
          MAIN_TIMEZONE,
          TARGET_TIMEZONE_EAST,
          'HH:mm',
          REFERENCE_DATE,
        );
        expect(result).toBe('07:00');
      });

      it('target midnight', () => {
        const result = TimezoneUtils.formatTimeInTimezone(
          17,
          0,
          MAIN_TIMEZONE,
          TARGET_TIMEZONE_EAST,
          'HH:mm',
          REFERENCE_DATE,
        );
        expect(result).toBe('00:00');
      });

      it('over midnight', () => {
        const result = TimezoneUtils.formatTimeInTimezone(
          3,
          0,
          MAIN_TIMEZONE,
          TARGET_TIMEZONE_EAST,
          'HH:mm',
          REFERENCE_DATE,
        );
        expect(result).toBe('10:00');
      });
    });



    describe('edge cases', () => {
      it('returns empty string when targetTimezone is missing', () => {
        expect(TimezoneUtils.formatTimeInTimezone(10, 0, MAIN_TIMEZONE, '')).toBe('');
      });

      it('uses the given reference date to resolve DST correctly', () => {
        const summer = TimezoneUtils.formatTimeInTimezone(
          12,
          0,
          'UTC',
          MAIN_TIMEZONE,
          'HH:mm',
          new Date('2024-07-01T00:00:00Z'),
        );
        const winter = TimezoneUtils.formatTimeInTimezone(
          12,
          0,
          'UTC',
          MAIN_TIMEZONE,
          'HH:mm',
          new Date('2024-01-01T00:00:00Z'),
        );
        expect(summer).toBe('14:00'); // CEST, UTC+2
        expect(winter).toBe('13:00'); // CET, UTC+1
      });

      it('applies the default format when none is provided', () => {
        const result = TimezoneUtils.formatTimeInTimezone(9, 0, 'UTC', 'UTC', undefined, new Date('2024-06-15T00:00:00Z'));
        expect(result).toBe('9 AM');
      });

      it('returns empty string and warns for an invalid timezone', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const result = TimezoneUtils.formatTimeInTimezone(10, 0, MAIN_TIMEZONE, 'Not/A_Real_Zone');
        expect(result).toBe('');
        expect(warnSpy).toHaveBeenCalled();
        warnSpy.mockRestore();
      });
    });
  });

  describe('getTimezoneAbbreviation', () => {
    it('returns empty string for missing timezone', () => {
      expect(TimezoneUtils.getTimezoneAbbreviation('')).toBe('');
    });

    it('returns an abbreviation for a known timezone', () => {
      const result = TimezoneUtils.getTimezoneAbbreviation('UTC');
      expect(result).toBe('UTC');
    });

    it('returns a non-empty abbreviation for a DST-observing timezone', () => {
      const result = TimezoneUtils.getTimezoneAbbreviation('America/New_York');
      expect(result.length).toBeGreaterThan(0);
    });

    it('falls back gracefully for an invalid timezone', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const result = TimezoneUtils.getTimezoneAbbreviation('Not/A_Real_Zone');
      expect(result).toBe('A_R');
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe('getTimezoneOffset', () => {
    it('returns 0 for missing timezone', () => {
      expect(TimezoneUtils.getTimezoneOffset('')).toBe(0);
    });

    it('returns 0 for UTC', () => {
      expect(TimezoneUtils.getTimezoneOffset('UTC')).toBe(0);
    });

    it('returns a positive offset east of UTC', () => {
      // Asia/Tokyo has a fixed UTC+9 offset with no DST
      expect(TimezoneUtils.getTimezoneOffset('Asia/Tokyo')).toBe(9);
    });

    it('returns 0 and warns for an invalid timezone', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const result = TimezoneUtils.getTimezoneOffset('Not/A_Real_Zone');
      expect(result).toBe(0);
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe('getMainTimezone', () => {
    it('returns the first timezone in the array', () => {
      expect(TimezoneUtils.getMainTimezone(['Europe/Warsaw', 'America/New_York'])).toBe('Europe/Warsaw');
    });

    it('falls back to the browser timezone when the array is empty', () => {
      const expected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      expect(TimezoneUtils.getMainTimezone([])).toBe(expected);
    });

    it('falls back to the browser timezone when no argument is given', () => {
      const expected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      expect(TimezoneUtils.getMainTimezone()).toBe(expected);
    });
  });
});
