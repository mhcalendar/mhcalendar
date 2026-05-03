import { EventDisplayMode } from '../enums';
import { ICalendarBaseConfig } from './base';

export type SlotOption = {
  hours: number;
  minutes: number;
  /**
   * Show a visible grid line every N slots.
   * E.g. with slotInterval 15min and visibleEvery: 4, lines appear every hour.
   * @default 1 (every slot has a line)
   */
  visibleEvery?: number;
};

export type BusinessHoursConfig = {
  /**
   * Days of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday).
   * Can be an array to apply the same hours to multiple days.
   * If not provided, applies to all days that don't have a specific match.
   *
   * @example [1, 2, 3, 4, 5] // Monday to Friday
   * @example [0, 6] // Weekend
   */
  dayOfWeek?: number | number[];

  /**
   * Specific date for this business hours configuration.
   * Takes precedence over dayOfWeek.
   */
  date?: Date | string;

  /**
   * Business hours start time (0-23).
   * @example 9 for 9:00 AM
   */
  start: number;

  /**
   * Business hours end time (0-24).
   * @example 17 for 5:00 PM
   */
  end: number;
};

export interface ICalendarMultiViewConfig extends ICalendarBaseConfig {
  /**
   * Defines start hour of display in the week/day view.
   */
  showTimeFrom: number;

  /**
   * Defines end hour of display in the week/day view.
   */
  showTimeTo: number;

  slotInterval: SlotOption;

  hoursSlotInterval: SlotOption;

  /**
   * Business hours configuration array.
   * Allows different business hours for different days.
   * Hours outside business hours will be grayed out.
   *
   * @example
   * [
   *   { dayOfWeek: [1, 2, 3, 4, 5], start: 9, end: 17 }, // Monday to Friday
   *   { dayOfWeek: [0, 6], start: 10, end: 14 }, // Weekend
   *   { date: new Date('2024-12-25'), start: 0, end: 0 }, // Christmas - closed
   * ]
   */
  businessHours: BusinessHoursConfig[];

  /**
   * Format for hours display in week/day view.
   * @default 'h A'
   */
  hoursDisplayFormat: string;

  /**
   * Week/Day views have a first row with all-day events.
   * @default true
   */
  showAllDayTasks: boolean;

  /**
   * Height of the all-day events row in week/day view.
   * @default 100
   */
  allDayEventsHeight: number;

  /**
   * If true, the all-day events row in week/day view will be sticky.
   * @default false
   */
  makeAllDaysSticky: boolean;

  /**
   * Minimum duration of an event in minutes.
   * @default 15
   */
  minEventDuration: number;

  /**
   * Allow user to resize event.
   * @default true
   */
  allowEventResize: boolean;

  /**
   * Array of day numbers (0-6) to hide in multi-view (WEEK/DAY views).
   * 0 = Sunday, 1 = Monday, ..., 6 = Saturday
   * @example [0, 6] to hide weekends (Sunday and Saturday)
   */
  hiddenDays: number[];

  /**
   * If true, prevents dragging events into non-business hours areas.
   * Events can only be dropped within business hours defined in businessHours config.
   * @default false
   */
  blockBusinessHours: boolean;

  /**
   * Array of timezone identifiers (IANA timezone names, e.g., 'Europe/Warsaw', 'America/Sao_Paulo').
   * Maximum 3 timezones. First one (index 0) is the main timezone used for calendar operations and events.
   * Additional timezones (max 2) are displayed alongside for reference only.
   * @example ['Europe/Warsaw', 'America/Sao_Paulo'] // Main: Warsaw, Reference: Sao Paulo
   * @example ['America/New_York', 'Europe/London', 'Asia/Tokyo'] // Main: New York, References: London & Tokyo
   */
  timezones: string[];

  /**
   * Custom text to display in the timezone label area (above time slots, left of dates).
   * If not provided, displays automatically generated timezone info (e.g., "CET (GMT+1)").
   * @example "My Timezone" // Custom label
   * @example undefined // Auto-generated timezone info
   */
  timezoneLabel: string | undefined;

  /**
   * Display mode for overlapping events.
   * - EventDisplayMode.SideBySide: Events are displayed next to each other (default)
   * - EventDisplayMode.Overlapping: Events are displayed on top of each other (like Google Calendar)
   * @default EventDisplayMode.SideBySide
   */
  eventDisplayMode: EventDisplayMode;

  /**
   * If true, displays the time indicator in the calendar.
   * @default true
   */
  showTimeIndicator: boolean;
}

/**
 * Public user-facing multi-view config. All fields optional — defaults are applied internally.
 */
export type IMHCalendarConfigBaseMultiViewOptions = Partial<ICalendarMultiViewConfig>;
