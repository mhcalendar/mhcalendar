export type ConfigCSSProperites = {
  /**
   * Width of the time column on the left side of DAY and WEEK views (showing hour labels).
   * Default: '60px'
   */
  timeSlotWidth: string;

  /**
   * Color of internal grid borders and dividers — between time slots, day columns, header cells,
   * and form fields inside the event modal.
   * Applies across DAY, WEEK, MONTH, AGENDA, and SHIFTPLAN views.
   * Default (dark theme): '#2a2a36'
   * Default (light theme): '#e2e2e8'
   */
  bordersColor: string;

  /**
   * Default background color for events that have no per-event `color` set.
   * Individual events can override this via the `color` field on the event object.
   * Default: '#8a79ff'
   */
  eventBackgroundColor: string;

  /**
   * Ring color around today's date number in the header (DAY/WEEK views) and in the SHIFTPLAN
   * header. Also used as the highlight color for the drag-over target cell in SHIFTPLAN.
   * Default: '#8a79ff'
   */
  headerTodayBackgroundColor: string;

  /**
   * Color of the current time indicator line and dot shown in DAY and WEEK views.
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
   * Default (dark theme): 'brightness(0.88)' (slight darkening)
   * Default (light theme): 'brightness(0.92)'
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
   * Color of the duration diff label (e.g. "+15 min") inside the resize tooltip, and of the
   * "+N more" overflow button in the SHIFTPLAN view.
   * Default: '#3578fa'
   */
  eventTimeDiffColor: string;

  /**
   * Color of the semi-transparent overlay applied to time slots outside business hours in DAY and
   * WEEK views. Business hours are configured via the `businessHours` config option.
   * Default (dark theme): 'rgba(0, 0, 0, 0.03)'
   * Default (light theme): 'rgba(0, 0, 0, 0.04)'
   */
  nonBusinessHoursOverlayColor: string;

  /**
   * Height of the day/week header row that displays day names and dates.
   * Affects the top section of DAY and WEEK views.
   * Default: '70px'
   */
  viewHeaderHeight: string;

  /**
   * Fixed height of a single event row when it renders compactly: MONTH view, the all-day row,
   * and SHIFTPLAN cells.
   * Default: '20px'
   */
  monthEventHeight: string;

  /**
   * Background color of the calendar's root container, the top navigation strip, the event modal,
   * form inputs inside it, and event cards in the AGENDA view.
   * Default (dark theme): '#131314'
   * Default (light theme): '#ffffff'
   */
  mainBackgroundColor: string;

  /**
   * General text color: event card text, the view switcher, the event modal's Cancel button and
   * form inputs, and AGENDA view event titles/times/descriptions.
   * Default (dark theme): '#d4d4d4'
   * Default (light theme): '#1a1a1a'
   */
  fontColor: string;

  /**
   * Font family applied to the `mh-calendar` host element and everything rendered inside it.
   * Default: 'system-ui'
   */
  fontFamily: string;

  /**
   * Muted text color used for secondary date-related labels: hour labels in the time column,
   * field labels in the event modal, and day/date headings in the AGENDA view.
   * Default (dark theme): '#82828e'
   * Default (light theme): '#6e6e80'
   */
  dateFontColor: string;

  /**
   * Background color of the pill-shaped navigation bar (Today button, prev/next arrows, date
   * label) shown when `showCalendarNavigation` is enabled.
   * Default (dark theme): '#1b1b1b'
   * Default (light theme): '#f5f5f7'
   */
  navigationBackgroundColor: string;

  /**
   * Background color of filled buttons: the Today/prev/next buttons in the navigation bar, the
   * active view-switcher button, and the event modal's Cancel button.
   * Default (dark theme): '#232323'
   * Default (light theme): '#ebebef'
   */
  buttonsColor: string;

  /**
   * Text color for weekend day names and numbers in the DAY/WEEK header and the SHIFTPLAN header.
   *
   * @remarks
   * Not currently applied to weekend day cells in the MONTH view.
   *
   * Default (dark theme): '#8a2929'
   * Default (light theme): '#c0392b'
   */
  holidayDateColor: string;

  /**
   * Height of the top navigation bar (title, arrow buttons, view switcher).
   * Default: '80px'
   */
  calendarNavigationHeight: string;
};
