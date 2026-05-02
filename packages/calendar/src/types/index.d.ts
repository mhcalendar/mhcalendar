import type { IMHCalendarEvent } from '../components';
export type { IMHCalendarEvent };
import { IMHCalendarStoreUserApi } from '../store/mh-calendar-store.user-api';

export type IMHCalendarDateRange = {
  fromDate?: Date;
  toDate?: Date;
};

export type IMHCalendarDayClickPayload = {
  date: Date;
  resourceId?: string;
};

type CSSinJS = Record<string, string>;

export type IMHCalendarConfigBaseStyle = {
  /*
   * Properties can be overwritten, by passing them right here.
   * Check documentation for more information.
   */
  properties: {
    /**
     * Width of the time column on the left side of DAY and WEEK views (showing hour labels).
     * Default: '70px'
     */
    timeSlotWidth?: string;

    /**
     * Color of all internal grid borders — between time slots, day columns, and header cells.
     * Applies across DAY, WEEK, MONTH, AGENDA, and SHIFTPLAN views.
     * Default: '#eaeaeaff'
     */
    bordersColor?: string;

    /**
     * Default background color for events that have no per-event `color` set.
     * Individual events can override this via the `color` field on the event object.
     * Default: '#00b536'
     */
    eventBackgroundColor?: string;

    /**
     * Background color used to highlight the "today" cell in the header and shiftplan view.
     * Default: '#00b536'
     */
    headerTodayBackgroundColor?: string;

    /**
     * Color of the current time indicator line shown in DAY and WEEK views.
     * Also used for the current time text label in SHIFTPLAN view.
     * Default: '#db372d'
     */
    currentTimeColor?: string;

    /**
     * Color of the drag handle shown at the bottom of events in DAY and WEEK views.
     * Matches the event color by default when set per-event; this property controls the fallback.
     * Default: '#00b536'
     */
    eventResizeHandleColor?: string;

    /**
     * CSS filter applied to events on hover.
     * Default: 'brightness(0.88)' (slight darkening).
     * Set to 'none' to disable hover effect.
     * Examples: 'brightness(1.1)', 'saturate(1.5)', 'brightness(0.8) saturate(1.2)'
     */
    eventHoverFilter?: string;

    /**
     * Background color of the time tooltip that appears while resizing an event.
     * Default: '#fff'
     */
    eventTimeLabelBg?: string;

    /**
     * Text color of the time tooltip that appears while resizing an event.
     * Default: '#222'
     */
    eventTimeLabelColor?: string;

    /**
     * Color of the duration diff label (e.g. "+15 min") inside the resize tooltip.
     * Default: '#3578fa'
     */
    eventTimeDiffColor?: string;

    /**
     * Color of the semi-transparent overlay applied to time slots outside business hours.
     * Business hours are configured via the `businessHours` config option.
     * Default: 'rgba(0, 0, 0, 0.03)'
     */
    nonBusinessHoursOverlayColor?: string;

    /**
     * Height of the day/week header row that displays day names and dates.
     * Affects the top section of DAY and WEEK views.
     * Default: '70px'
     */
    viewHeaderHeight?: string;

    /**
     * Height of the top navigation bar (title, arrow buttons, view switcher).
     * Default: '20%'
     */
    calendarNavigationHeight?: string;

    /**
     * Height of a single event row in MONTH, AGENDA, and SHIFTPLAN views.
     * Default: '20px'
     */
    monthEventHeight?: string;
  };

  /*
   * Style for the event box component.
   */
  mhCalendarEvent: CSSinJS;

  /*
   * Style for the small event box component.
   */
  mhCalendarEventSmall: CSSinJS;

  /*
   * Style for the full event box component.
   */
  mhCalendarEventFull: CSSinJS;
  mhCalendarEventFull__content: CSSinJS;
  mhCalendarEventFull__userEventContentHolder: CSSinJS;
  mhCalendarEventFull__content__title: CSSinJS;
  mhCalendarEventFull__content__date: CSSinJS;

  /*
   * Style for the header component.
   */
  mhCalendarHeader: CSSinJS;
  mhCalendarHeader__date: CSSinJS;
  mhCalendarHeader__today: CSSinJS;

  /*
   * Style for the month component.
   */
  mhCalendarMonth: CSSinJS;

  /*
   * Style for the multi view component.
   */
  mhCalendarMultiView__holder: CSSinJS;

  /*
   * Style for the calendar wrapper component.
   */
  mhCalendar: CSSinJS;

  /*
   * Style for the navigation.
   */
  mhCalendarNavigation__container: CSSinJS;
  mhCalendarNavigation__viewSwitcher: CSSinJS;

  /*
   * Style for the day component.
   */
  mhCalendarDay: CSSinJS;
  mhCalendarDay_allDaysEventHolder: CSSinJS;
  mhCalendarDay_dayDate: CSSinJS;
  mhCalendarDay__currentTime: CSSinJS;
  mhCalendarDay__eventHolder: CSSinJS;
  mhCalendarDay__eventsLeftIndicator: CSSinJS;
};

export interface IMHCalendarConfigBaseUserActions {
  /**
   * Callback function to be called when an event is clicked.
   */
  onEventClick: (event: IMHCalendarEvent) => void;

  /**
   * Callback function to be called when an event is clicked with right mouse.
   */
  onRightEventClick: (event: IMHCalendarEvent) => void;

  /**
   * Callback function to be called when a day is clicked.
   */
  onDayClick: (day: IMHCalendarDayClickPayload) => void;

  /**
   * Callback function to be called when a day is right clicked.
   */
  onRightDayClick: (day: IMHCalendarDayClickPayload) => void;

  /**
   * Callback function to be called when a new event is created via click.
   * The callback receives the newly created event object.
   * You should add this event to your events array to display it in the calendar.
   */
  onEventCreated?: (event: IMHCalendarEvent) => void;

  /**
   * Callback function to be called when an event is updated (e.g., title, description, dates).
   * The callback receives the updated event object.
   * You should update the event in your events array.
   */
  onEventUpdated?: (event: IMHCalendarEvent) => void;
}

export interface IMHCalendarCustomRenderConfig {
  /**
   * Custom render function for full-size events (WEEK/DAY views).
   * Receives the event object and should return an HTML string.
   */
  eventContent: (event: any) => any;

  /**
   * Custom render function for small/compact events (MONTH, SHIFTPLAN, AGENDA views).
   * Receives the event object and should return an HTML string.
   */
  eventSmallContent: (event: any) => any;
}

export interface IMHCalendarConfigBase
  extends Partial<IMHCalendarCustomRenderConfig>, Partial<IMHCalendarConfigBaseUserActions> {
  /**
   * Styled for certain elements passed as a CSS-in-JS
   */
  style?: Partial<IMHCalendarConfigBaseStyle>;

  /**
   * View type of the calendar.
   */
  viewType?: IMHCalendarViewType;

  /**
   * Custom height, of view needed for virtual scrolling.
   */
  fixedHeight?: string;

  /**
   * Custom adjustment for virtual scroll height.
   */
  virtualScrollHeight?: string;

  /**
   * Defines the reference date to be displayed within the week view.
   * Can be any day of the week, not restricted to Monday.
   *
   * Defaults to the current date.
   * By default, MHCalendar displays the week starting from Monday.
   * To override this behavior, specify any date as the `startDate`
   * and set `customWeekView` to `true`.
   * For example, to display a week starting from Sunday, provide a Sunday date
   * as `startDate` and enable `customWeekView`.
   *
   * @default new Date()
   */
  startDate?: Date | string;

  /**
   * If set, displays the date switcher component (e.g., to move between weeks or months).
   * You can customize it or hide it entirely by setting this to `false`.
   * @default true
   */
  showDateSwitcher?: boolean;

  /**
   * If set, displays the view type switcher (e.g., to toggle between week/month/day views).
   * Set to `false` to hide it.
   * @default true
   */
  showViewTypeSwitcher?: boolean;

  /**
   * Controls the visibility of both the date switcher and view type switcher.
   * If set to `false`, both will be hidden,
   * and it's up to the consumer to implement custom navigation.
   * @default true
   */
  showCalendarNavigation?: boolean;

  /**
   * If false all events by default will not be draggable.
   * @default true
   */
  allowEventDragging?: boolean;

  /**
   * Show / hide view header. Element where dates are displayed.
   * @default true
   */
  showViewHeader?: boolean;
}

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

export interface IMHCalendarConfigBaseMultiViewOptions extends IMHCalendarConfigBase {
  /**
   * Defines start hour of display in the week view.
   */
  showTimeFrom?: number;

  /**
   * Defines end hour of display in the week view.
   */
  showTimeTo?: number;

  slotInterval?: SlotOption;

  hoursSlotInterval?: SlotOption;

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
  businessHours?: BusinessHoursConfig[];
}

export interface IMHCalendarWeekConfig extends IMHCalendarConfigBaseMultiViewOptions {
  /**
   * Week view have a first row with all-day events.
   * @default true
   */
  showAllDayTasks?: boolean;

  /**
   * Week view have a first row with all-day events.
   * @default 100
   */
  allDayEventsHeight?: number;

  /**
   * Week view have a first row with all-day events.
   * @default false
   */
  makeAllDaysSticky?: boolean;

  /**
   * Format for hours display in multi view.
   * @default 'h A'
   */
  hoursDisplayFormat?: string;

  /**
   * If set to true,
   * the week view will start from the `startDate` provided.
   * @description NOT IMPLEMENTED
   */
  customWeekView?: boolean;

  /**
   * Defines if the week view should show weekends (Saturday and Sunday).
   * @description NOT IMPLEMENTED
   */
  showWeekends?: boolean;

  /**
   * Minimum duration of an event in minutes.
   * @default 15
   */
  minEventDuration?: number;

  /**
   * Allow user to resize event.
   * @default true
   */
  allowEventResize?: boolean;

  /**
   * Array of day numbers (0-6) to hide in multi-view (WEEK/DAY views).
   * 0 = Sunday, 1 = Monday, ..., 6 = Saturday
   * @example [0, 6] to hide weekends (Sunday and Saturday)
   * @example [6, 7] to hide Saturday and Sunday (alternative notation)
   */
  hiddenDays?: number[];

  /**
   * If true, prevents dragging events into non-business hours areas.
   * Events can only be dropped within business hours defined in businessHours config.
   * @default false
   */
  blockBusinessHours?: boolean;

  /**
   * If true, creates a new event when user clicks on a day/hour in the calendar.
   * In WEEK/DAY view: creates event from clicked hour to next hour (e.g., click at 15:30 creates event 15:00-16:00).
   * In MONTH view: creates all-day event.
   * @default false
   */
  createEventOnClick?: boolean;

  /**
   * Array of timezone identifiers (IANA timezone names, e.g., 'Europe/Warsaw', 'America/Sao_Paulo').
   * Maximum 3 timezones. First one (index 0) is the main timezone used for calendar operations and events.
   * Additional timezones (max 2) are displayed alongside for reference only.
   * @example ['Europe/Warsaw', 'America/Sao_Paulo'] // Main: Warsaw, Reference: Sao Paulo
   * @example ['America/New_York', 'Europe/London', 'Asia/Tokyo'] // Main: New York, References: London & Tokyo
   */
  timezones?: string[];

  /**
   * Custom text to display in the timezone label area (above time slots, left of dates).
   * If not provided, displays automatically generated timezone info (e.g., "CET (GMT+1)").
   * @example "My Timezone" // Custom label
   * @example undefined // Auto-generated timezone info
   */
  timezoneLabel?: string;

  /**
   * Display mode for overlapping events.
   * - EventDisplayMode.SideBySide: Events are displayed next to each other (default)
   * - EventDisplayMode.Overlapping: Events are displayed on top of each other (like Google Calendar)
   * @default EventDisplayMode.SideBySide
   */
  eventDisplayMode?: EventDisplayMode;

  /**
   * If true, displays the time indicator in the calendar.
   * @default true
   */
  showTimeIndicator?: boolean;

  /**
   * Array of resources (employees, rooms, courts, etc.) for SHIFTPLAN view.
   */
  resources?: Array<{ id: string; title: string }>;

  /**
   * Number of days to display in SHIFTPLAN view.
   * @default 7
   */
  shiftplanDays?: number;
}

export interface IMHCalendarFullOptions extends IMHCalendarWeekConfig {}

export enum IMHCalendarViewType {
  DAY = 'DAY',
  MONTH = 'MONTH',
  WEEK = 'WEEK',
  AGENDA = 'AGENDA',
  SHIFTPLAN = 'SHIFTPLAN',
}

export enum EventDisplayMode {
  SideBySide = 'side-by-side',
  Overlapping = 'overlapping',
}

export type UserApi = IMHCalendarStoreUserApi;
