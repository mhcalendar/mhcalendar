import { beforeEach, describe, expect, it } from '@stencil/vitest';
import { MonthViewCalculator } from './MonthViewCalculator';
import { storeState } from '../store/mh-calendar-store';

function createDayCellElement(
  options: {
    offsetHeight?: number;
    dateElementHeight?: number;
    hasDateElement?: boolean;
  } = {},
): HTMLElement {
  const { offsetHeight = 200, dateElementHeight = 40, hasDateElement = true } = options;

  const dateElement = {
    getBoundingClientRect: () => ({ height: dateElementHeight }),
  };

  return {
    offsetHeight,
    querySelector: (selector: string) =>
      hasDateElement && selector === '.mhCalendarDay_dayDate' ? dateElement : null,
  } as unknown as HTMLElement;
}

describe('MonthViewCalculator', () => {
  beforeEach(() => {
    storeState.properties.monthEventHeight = '20px';
  });

  describe('calculateMaxVisibleEvents', () => {
    it('returns the default when el is null', () => {
      expect(MonthViewCalculator.calculateMaxVisibleEvents(null)).toBe(3);
    });

    it('returns the default when el has no height', () => {
      const el = createDayCellElement({ offsetHeight: 0 });
      expect(MonthViewCalculator.calculateMaxVisibleEvents(el)).toBe(3);
    });

    it('returns the default when el has a negative height', () => {
      const el = createDayCellElement({ offsetHeight: -10 });
      expect(MonthViewCalculator.calculateMaxVisibleEvents(el)).toBe(3);
    });

    it('computes how many events fit within the cell', () => {
      // available = 200 - 40 (date) - 2 (padding) = 158; floor(158 / 20) = 7
      const el = createDayCellElement({ offsetHeight: 200, dateElementHeight: 40 });
      expect(MonthViewCalculator.calculateMaxVisibleEvents(el)).toBe(7);
    });

    it('falls back to a 40px date height when no date element is found', () => {
      const el = createDayCellElement({ offsetHeight: 200, hasDateElement: false });
      expect(MonthViewCalculator.calculateMaxVisibleEvents(el)).toBe(7);
    });

    it('never returns less than 1, even when the cell is too small to fit the date', () => {
      const el = createDayCellElement({ offsetHeight: 10, dateElementHeight: 40 });
      expect(MonthViewCalculator.calculateMaxVisibleEvents(el)).toBe(1);
    });

    it('caps the result at 10 even when the cell is very large', () => {
      const el = createDayCellElement({ offsetHeight: 5000, dateElementHeight: 0 });
      expect(MonthViewCalculator.calculateMaxVisibleEvents(el)).toBe(10);
    });
  });

  describe('calculateFromElementHeight', () => {
    it('subtracts the date height and padding before dividing by the event height', () => {
      const el = createDayCellElement({ dateElementHeight: 50 });
      // available = 100 - 50 - 2 = 48; floor(48 / 20) = 2
      const result = (MonthViewCalculator as any).calculateFromElementHeight(100, el);
      expect(result).toBe(2);
    });

    it('clamps to 1 when the available height is negative', () => {
      const el = createDayCellElement({ dateElementHeight: 200 });
      const result = (MonthViewCalculator as any).calculateFromElementHeight(50, el);
      expect(result).toBe(1);
    });
  });

  describe('getMonthEventHeight', () => {
    it('parses the configured px value into a number', () => {
      storeState.properties.monthEventHeight = '24px';
      expect((MonthViewCalculator as any).getMonthEventHeight()).toBe(24);
    });

    it('returns NaN when no value is configured', () => {
      delete storeState.properties.monthEventHeight;
      expect((MonthViewCalculator as any).getMonthEventHeight()).toBeNaN();
    });
  });

  describe('getHeightOfDateNumberElement', () => {
    it("returns the height of the '.mhCalendarDay_dayDate' element when present", () => {
      const el = createDayCellElement({ dateElementHeight: 32 });
      expect((MonthViewCalculator as any).getHeightOfDateNumberElement(el)).toBe(32);
    });

    it('defaults to 40 when the date element is missing', () => {
      const el = createDayCellElement({ hasDateElement: false });
      expect((MonthViewCalculator as any).getHeightOfDateNumberElement(el)).toBe(40);
    });
  });
});
