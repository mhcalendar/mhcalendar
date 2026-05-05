export type ConfigCSSProperites = {
  /**
   * Width of the time column on the left side of DAY and WEEK views (showing hour labels).
   * Default: '70px'
   */
  timeSlotWidth: string;

  /**
   * Color of all internal grid borders — between time slots, day columns, and header cells.
   * Applies across DAY, WEEK, MONTH, AGENDA, and SHIFTPLAN views.
   * Default: '#eaeaeaff'
   */
  bordersColor: string;

  /**
   * Default background color for events that have no per-event `color` set.
   * Individual events can override this via the `color` field on the event object.
   * Default: '#00b536'
   */
  eventBackgroundColor: string;

  /**
   * Background color used to highlight the "today" cell in the header and shiftplan view.
   * Default: '#00b536'
   */
  headerTodayBackgroundColor: string;

  /**
   * Color of the current time indicator line shown in DAY and WEEK views.
   * Also used for the current time text label in SHIFTPLAN view.
   * Default: '#db372d'
   */
  currentTimeColor: string;

  /**
   * Color of the drag handle displayed at the bottom of events during resizing.
   *
   * @remarks
   * If not provided, the handle inherits the event's color.
   * Accepts any valid CSS `background-color` value.
   *
   * @default undefined
   * @example "#00b536"
   * @example "yellow"
   */
  eventResizeHandleColor?: string;

  /**
   * CSS filter applied to events on hover.
   * Default: 'brightness(0.88)' (slight darkening).
   * Set to 'none' to disable hover effect.
   * Examples: 'brightness(1.1)', 'saturate(1.5)', 'brightness(0.8) saturate(1.2)'
   */
  eventHoverFilter: string;

  /**
   * Background color of the time tooltip that appears while resizing an event.
   * Default: '#fff'
   */
  eventTimeLabelBg: string;

  /**
   * Text color of the time tooltip that appears while resizing an event.
   * Default: '#222'
   */
  eventTimeLabelColor: string;

  /**
   * Color of the duration diff label (e.g. "+15 min") inside the resize tooltip.
   * Default: '#3578fa'
   */
  eventTimeDiffColor: string;

  /**
   * Color of the semi-transparent overlay applied to time slots outside business hours.
   * Business hours are configured via the `businessHours` config option.
   * Default: 'rgba(0, 0, 0, 0.03)'
   */
  nonBusinessHoursOverlayColor: string;

  /**
   * Height of the day/week header row that displays day names and dates.
   * Affects the top section of DAY and WEEK views.
   * Default: '70px'
   */
  viewHeaderHeight: string;

  /**
   * Height of a single event row in MONTH, AGENDA, and SHIFTPLAN views.
   * Default: '20px'
   */
  monthEventHeight: string;

  mainBackgroundColor: string;
  fontColor: string;
  fontFamily: string;
  dateFontColor: string;
  navigationBackgroundColor: string;
  buttonsColor: string;
  holidayDateColor: string;
  /**
   * Height of the top navigation bar (title, arrow buttons, view switcher).
   * Default: '20%'
   */
  calendarNavigationHeight: string;
};
