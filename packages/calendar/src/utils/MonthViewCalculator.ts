import { storeState } from '../store/mh-calendar-store';

const DEFAULT_MAX_VISIBLE_EVENTS = 3;
const EVENT_DISPLAY_PADDING = 2;

export class MonthViewCalculator {
  static calculateMaxVisibleEvents(el: HTMLElement | null): number {
    if (!el || el.offsetHeight <= 0) {
      return DEFAULT_MAX_VISIBLE_EVENTS;
    }

    return this.calculateFromElementHeight(el.offsetHeight, el);
  }

  private static calculateFromElementHeight(dayCellHeight: number, el: HTMLElement): number {
    const dateHeight = this.getHeightOfDateNumberElement(el);
    const availableHeight = dayCellHeight - dateHeight - EVENT_DISPLAY_PADDING;

    const maxEvents = Math.max(
      1,
      Math.floor(availableHeight / MonthViewCalculator.getMonthEventHeight()),
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
