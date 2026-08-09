import { storeState } from '../store/mh-calendar-store';
import { MONTH_VIEW_EVENTS_GAP, MONTH_VIEW_EVENTS_PADDING } from '../const/default-theme';

const DEFAULT_MAX_VISIBLE_EVENTS = 3;

export class MonthViewCalculator {
  static calculateMaxVisibleEvents(el: HTMLElement | null): number {
    if (!el || el.offsetHeight <= 0) {
      return DEFAULT_MAX_VISIBLE_EVENTS;
    }

    return this.calculateFromElementHeight(el.offsetHeight, el);
  }

  private static calculateFromElementHeight(dayCellHeight: number, el: HTMLElement): number {
    const dateHeight = this.getHeightOfDateNumberElement(el);
    // The events container has vertical padding on both top and bottom, plus a gap between
    // every pair of stacked rows (n rows -> n-1 gaps), so the gap is added back once here to
    // make the "n-1 gaps" formula below work out for n starting at 1.
    const availableHeight =
      dayCellHeight - dateHeight - MONTH_VIEW_EVENTS_PADDING * 2 + MONTH_VIEW_EVENTS_GAP;

    const maxEvents = Math.max(
      1,
      Math.floor(
        availableHeight / (MonthViewCalculator.getMonthEventHeight() + MONTH_VIEW_EVENTS_GAP),
      ),
    );

    return Math.max(1, Math.min(maxEvents, 10));
  }

  private static getMonthEventHeight(): number {
    return parseInt(storeState.properties.monthEventHeight);
  }

  private static getHeightOfDateNumberElement(el: HTMLElement) {
    let dateHeight = 40;

    const dateElement = el.querySelector('.mhCalendarDay_dayDate') as HTMLElement;

    if (dateElement) {
      const dateRect = dateElement.getBoundingClientRect();
      dateHeight = dateRect.height;
    }

    return dateHeight;
  }
}
