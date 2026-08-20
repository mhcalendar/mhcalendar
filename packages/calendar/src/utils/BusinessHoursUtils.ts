import dayjs from 'dayjs';
import {
  MINUTES_IN_HOUR,
  NON_BUSINESS_HOURS_OVERLAY_Z_INDEX,
  FULL_WIDTH_PERCENTAGE,
  DATE_FORMAT_YYYY_MM_DD,
} from '../components/mh-calendar-day/mh-calendar-day.const';
import { BusinessHoursConfig } from '../types';
import { IMHCalendarViewType, MHCalendarViewType } from '../store/mh-calendar-store.types';
import { DateUtils } from './DateUtils';
import { store } from '../store/mh-calendar-store';

export class BusinessHoursUtils {
  /**
   * Converts business hours (start/end) to minutes since midnight
   */
  private static businessHoursToMinutes(businessHours: { start: number; end: number }): {
    startInMinutes: number;
    endInMinutes: number;
  } {
    return {
      startInMinutes: businessHours.start * MINUTES_IN_HOUR,
      endInMinutes: businessHours.end * MINUTES_IN_HOUR,
    };
  }

  /**
   * Checks if a time range (in minutes) fits within business hours range
   */
  private static isTimeRangeWithinBusinessHours(
    startTimeInMinutes: number,
    endTimeInMinutes: number,
    businessHours: { start: number; end: number },
    endTimeExclusive: boolean = false,
  ): boolean {
    const { startInMinutes, endInMinutes } = this.businessHoursToMinutes(businessHours);

    if (endTimeExclusive) {
      // For single point in time: start >= businessStart && start < businessEnd
      return startTimeInMinutes >= startInMinutes && startTimeInMinutes < endInMinutes;
    } else {
      // For time range: start >= businessStart && end <= businessEnd
      return startTimeInMinutes >= startInMinutes && endTimeInMinutes <= endInMinutes;
    }
  }

  /**
   * Finds the business hours configuration for a specific day
   * Priority: specific date > day of week > default configuration
   */
  static getBusinessHoursForDay(
    day: Date,
    businessHours: BusinessHoursConfig[] | undefined,
  ): { start: number; end: number } | null {
    if (!businessHours || !Array.isArray(businessHours) || businessHours.length === 0) {
      return null;
    }

    const currentDay = dayjs(day).tz(store.mainTimezone);
    const currentDayOfWeek = currentDay.day(); // 0 = Sunday, 6 = Saturday
    const currentDateStr = currentDay.format(DATE_FORMAT_YYYY_MM_DD);

    // First, check for specific date match
    for (const config of businessHours) {
      if (config.date) {
        const configDate = dayjs(config.date);
        if (configDate.format(DATE_FORMAT_YYYY_MM_DD) === currentDateStr) {
          return { start: config.start, end: config.end };
        }
      }
    }

    // Then, check for day of week match
    for (const config of businessHours) {
      if (config.dayOfWeek !== undefined) {
        // Handle both array and single number
        const daysOfWeek = Array.isArray(config.dayOfWeek) ? config.dayOfWeek : [config.dayOfWeek];

        if (daysOfWeek.includes(currentDayOfWeek)) {
          return { start: config.start, end: config.end };
        }
      }
    }

    // Finally, check for default (no dayOfWeek or date specified)
    for (const config of businessHours) {
      if (config.dayOfWeek === undefined && !config.date) {
        return { start: config.start, end: config.end };
      }
    }

    return null;
  }

  /**
   * Calculates styles for non-business hours overlays (gray areas)
   * Returns array of style objects for each non-business hours range
   */
  static getNonBusinessHoursStyles(
    day: Date,
    calendarDayElementHeight: number,
    viewType: MHCalendarViewType | undefined,
    businessHours: { start: number; end: number } | null,
    showTimeFrom: number | undefined,
    showTimeTo: number | undefined,
    headerMargin: number,
  ): Array<Record<string, string>> {
    if (!viewType || !calendarDayElementHeight || !day) {
      return [];
    }

    const isTimeView =
      viewType === IMHCalendarViewType.DAY || viewType === IMHCalendarViewType.WEEK;

    if (!isTimeView) return [];

    // If no business hours configured, don't show overlay
    if (!businessHours || typeof showTimeFrom !== 'number' || typeof showTimeTo !== 'number') {
      return [];
    }

    const availableHeight = calendarDayElementHeight - headerMargin;
    const totalDisplayedMinutes = (showTimeTo - showTimeFrom) * MINUTES_IN_HOUR;

    const calculatePosition = (hour: number): number => {
      const minutes = (hour - showTimeFrom) * MINUTES_IN_HOUR;
      const percentage = (minutes / totalDisplayedMinutes) * FULL_WIDTH_PERCENTAGE;
      return (availableHeight * percentage) / FULL_WIDTH_PERCENTAGE + headerMargin;
    };

    const styles: Array<Record<string, string>> = [];
    const MIN_HEIGHT = 0;

    // Non-business hours before business hours
    if (showTimeFrom < businessHours.start) {
      const nonBusinessStart = calculatePosition(showTimeFrom);
      const nonBusinessEnd = Math.min(
        calculatePosition(businessHours.start),
        calendarDayElementHeight,
      );
      const height = Math.max(
        MIN_HEIGHT,
        nonBusinessEnd - Math.max(headerMargin, nonBusinessStart),
      );

      if (height > MIN_HEIGHT) {
        styles.push({
          position: 'absolute',
          top: `${Math.max(headerMargin, nonBusinessStart)}px`,
          left: `${MIN_HEIGHT}`,
          width: `${FULL_WIDTH_PERCENTAGE}%`,
          height: `${height}px`,
          zIndex: `${NON_BUSINESS_HOURS_OVERLAY_Z_INDEX}`,
        });
      }
    }

    // Non-business hours after business hours
    if (showTimeTo > businessHours.end) {
      const nonBusinessStart = Math.max(headerMargin, calculatePosition(businessHours.end));
      const nonBusinessEnd = calculatePosition(showTimeTo);
      const height = Math.max(
        MIN_HEIGHT,
        Math.min(calendarDayElementHeight, nonBusinessEnd) - nonBusinessStart,
      );

      if (height > MIN_HEIGHT) {
        styles.push({
          position: 'absolute',
          top: `${nonBusinessStart}px`,
          left: `${MIN_HEIGHT}`,
          width: `${FULL_WIDTH_PERCENTAGE}%`,
          height: `${height}px`,
          zIndex: `${NON_BUSINESS_HOURS_OVERLAY_Z_INDEX}`,
        });
      }
    }

    return styles;
  }

  /**
   * Checks if a given date/time is within business hours
   * Returns true if the time is within business hours, false otherwise
   */
  static isWithinBusinessHours(
    date: Date,
    businessHours: BusinessHoursConfig[] | undefined,
  ): boolean {
    const businessHoursForDay = this.getBusinessHoursForDay(date, businessHours);

    // If no business hours configured, allow all times
    if (!businessHoursForDay) {
      return true;
    }

    const timeInMinutes = DateUtils.dateToMinutesInTimezone(date, store.mainTimezone);

    // Check if current time is within business hours
    // Note: end time is exclusive (not included)
    return this.isTimeRangeWithinBusinessHours(
      timeInMinutes,
      timeInMinutes,
      businessHoursForDay,
      true,
    );
  }

  /**
   * Checks if an event (with start and end times) fits within business hours
   * Returns true if the entire event fits within business hours, false otherwise
   */
  static isEventWithinBusinessHours(
    startDate: Date,
    endDate: Date,
    businessHours: BusinessHoursConfig[] | undefined,
  ): boolean {
    // Get business hours for the start date (assuming same day event)
    const businessHoursForDay = this.getBusinessHoursForDay(startDate, businessHours);

    // If no business hours configured, allow all times
    if (!businessHoursForDay) {
      return true;
    }

    const startTimeInMinutes = DateUtils.dateToMinutesInTimezone(startDate, store.mainTimezone);
    const endTimeInMinutes = DateUtils.dateToMinutesInTimezone(endDate, store.mainTimezone);

    // Check if entire event is within business hours
    return this.isTimeRangeWithinBusinessHours(
      startTimeInMinutes,
      endTimeInMinutes,
      businessHoursForDay,
      false,
    );
  }

  /**
   * Checks if a drag position is blocked by business hours
   * Returns true if the position is blocked, false otherwise
   */
  static isDragPositionBlockedByBusinessHours(
    topPosition: number,
    day: Date | undefined,
    event: { startDate: Date; endDate: Date; allDay?: boolean } | null,
    blockBusinessHours: boolean,
    businessHours: BusinessHoursConfig[] | undefined,
  ): boolean {
    if (!blockBusinessHours || !day || !event) {
      return false;
    }

    // All-day events are not blocked by business hours
    if (event.allDay) {
      return false;
    }

    const startDate = DateUtils.getExactDateBasedOnUserPosition(topPosition, day);

    // Calculate event duration
    const eventDurationInMinutes =
      (event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60);
    const endDate = new Date(startDate.getTime() + eventDurationInMinutes * 60 * 1000);

    // Check if event fits within business hours
    const isWithinBusinessHours = this.isEventWithinBusinessHours(
      startDate,
      endDate,
      businessHours,
    );

    return !isWithinBusinessHours;
  }
}
