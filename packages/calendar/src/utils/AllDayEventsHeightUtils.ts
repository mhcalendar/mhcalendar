import {
  ALL_DAY_CONTAINER_PADDING,
  ALL_DAY_EVENT_GAP,
  ALL_DAY_MIN_HEIGHT,
  MONTH_EVENT_HEIGHT,
} from '../const/default-theme';

export class AllDayEventsHeightUtils {
  /**
   * How many event rows fit in a given max height before the "+N more" indicator kicks in.
   */
  static getMaxVisibleEvents(maxHeight: number): number {
    return Math.max(
      1,
      Math.floor((maxHeight - ALL_DAY_CONTAINER_PADDING) / (MONTH_EVENT_HEIGHT + ALL_DAY_EVENT_GAP)),
    );
  }

  /**
   * Pixel height needed to render `eventCount` all-day events (or the "+N more" row in their
   * place), clamped between the empty-row baseline and the configured max height.
   */
  static getHeightForEventCount(eventCount: number, maxHeight: number): number {
    if (eventCount <= 0) return ALL_DAY_MIN_HEIGHT;

    const visibleRows = Math.min(eventCount, this.getMaxVisibleEvents(maxHeight));
    const neededHeight = visibleRows * (MONTH_EVENT_HEIGHT + ALL_DAY_EVENT_GAP) + ALL_DAY_CONTAINER_PADDING;

    return Math.min(Math.max(neededHeight, ALL_DAY_MIN_HEIGHT), maxHeight);
  }
}
