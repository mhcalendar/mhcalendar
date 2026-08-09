import { IMHCalendarViewType } from '../enums';
import { CssStyles } from './cssStyles';
import { IMHCalendarDayClickPayload, IMHCalendarEvent } from './event';
import { ConfigCSSProperites } from './properties';

export type IMHCalendarConfigBaseStyle = {
  properties: ConfigCSSProperites;
  styles: CssStyles;
};

export type MHCalendarTheme = 'dark' | 'light' | (string & {});

export interface IMHCalendarLabels {
  /**
   * Label for the "Today" navigation button and the "Today" day header in agenda view.
   * @default 'Today'
   */
  today: string;

  /**
   * Label for the "Tomorrow" day header in agenda view.
   * @default 'Tomorrow'
   */
  tomorrow: string;

  /**
   * Label for the "Yesterday" day header in agenda view.
   * @default 'Yesterday'
   */
  yesterday: string;

  /**
   * Label for the overflow indicator shown when a day has more events than fit.
   * @param hiddenCount Number of events hidden behind the indicator.
   * @default (hiddenCount) => `+${hiddenCount} more`
   */
  moreEvents: (hiddenCount: number) => string;

  /**
   * Label shown in agenda view when there are no events to display.
   * @default 'No events scheduled'
   */
  noEvents: string;

  /**
   * Overrides for the view switcher's view names.
   * Keys not provided fall back to the title-cased IMHCalendarViewType value (e.g. 'Month').
   * @example { WEEK: 'Semaine', MONTH: 'Mois' }
   */
  views: Partial<Record<IMHCalendarViewType, string>>;

  /**
   * Fallback title used for an event with no title (e.g. in agenda view).
   * @default 'Untitled Event'
   */
  untitledEvent: string;

  /**
   * Title used for a newly created event before the user renames it.
   * @default 'New Event'
   */
  defaultEventTitle: string;

  /**
   * Message shown in resource view when no resources are configured.
   * @default 'No resources configured'
   */
  noResources: string;

  /**
   * Heading of the event form modal when creating a new event.
   * @default 'New Event'
   */
  newEventTitle: string;

  /**
   * Heading of the event form modal when editing an existing event.
   * @default 'Edit Event'
   */
  editEventTitle: string;

  /**
   * Label for the event title field in the event form.
   * @default 'Title:'
   */
  titleFieldLabel: string;

  /**
   * Placeholder for the event title input in the event form.
   * @default 'Enter title'
   */
  titlePlaceholder: string;

  /**
   * Label for the event description field in the event form.
   * @default 'Description:'
   */
  descriptionFieldLabel: string;

  /**
   * Placeholder for the event description textarea in the event form.
   * @default 'Enter description (optional)'
   */
  descriptionPlaceholder: string;

  /**
   * Label for the date/time section of the event form.
   * @default 'Date and Time:'
   */
  dateTimeFieldLabel: string;

  /**
   * Label for the start date/time input in the event form.
   * @default 'From:'
   */
  fromLabel: string;

  /**
   * Label for the end date/time input in the event form.
   * @default 'To:'
   */
  toLabel: string;

  /**
   * Label for the "all day" checkbox in the event form.
   * @default 'All Day'
   */
  allDayLabel: string;

  /**
   * Label for the cancel button in the event form.
   * @default 'Cancel'
   */
  cancelButton: string;

  /**
   * Label for the save button in the event form.
   * @default 'Save'
   */
  saveButton: string;

  /**
   * Validation error shown when the event title is empty.
   * @default 'Title is required.'
   */
  titleRequiredError: string;

  /**
   * Validation error shown when the start date is invalid.
   * @default 'Start date is invalid.'
   */
  startDateInvalidError: string;

  /**
   * Validation error shown when the end date is invalid.
   * @default 'End date is invalid.'
   */
  endDateInvalidError: string;

  /**
   * Validation error shown when the end date is not after the start date.
   * @default 'End date must be after start date.'
   */
  endBeforeStartError: string;
}

export interface ICalendarBaseConfig {
  // custom render
  eventContent: ((event: any) => any) | undefined;
  eventSmallContent: ((event: any) => any) | undefined;
  // user action callbacks
  onEventClick: ((event: IMHCalendarEvent) => void) | undefined;
  onRightEventClick: ((event: IMHCalendarEvent) => void) | undefined;
  onDayClick: ((day: IMHCalendarDayClickPayload) => void) | undefined;
  onRightDayClick: ((day: IMHCalendarDayClickPayload) => void) | undefined;
  onEventCreated: ((event: IMHCalendarEvent) => void) | undefined;
  onEventUpdated: ((event: IMHCalendarEvent) => void) | undefined;
  // base config
  theme: MHCalendarTheme | undefined;
  style: Partial<IMHCalendarConfigBaseStyle> | undefined;
  viewType: IMHCalendarViewType | undefined;
  fixedHeight: string | undefined;
  virtualScrollHeight: string | undefined;
  startDate: Date | string | undefined;
  showDateSwitcher: boolean;
  showViewTypeSwitcher: boolean;
  showCalendarNavigation: boolean;
  allowEventDragging: boolean;
  showViewHeader: boolean;
  createEventOnClick: boolean;

  /**
   * Option to determine which views are available in view switcher
   * if not provided all views are displayed
   *
   * @default undefined
   * @example ['WEEK', 'AGENDA']
   * @remarks IMHCalendarViewType contains names of views that user can use
   */
  availableViews: string[] | undefined;

  /**
   * Locale used to format day/month names (e.g. 'ddd', 'MMMM') via Day.js.
   *
   * Use the default `'en'` string as-is. For any other locale, pass the imported Day.js
   * locale object itself rather than its BCP 47 tag — this package bundles its own private
   * Day.js instance, so a side-effect-only `import 'dayjs/locale/pl'` in your app registers
   * the locale on a *different* Day.js instance and has no effect here:
   *
   * @example
   * import plLocale from 'dayjs/locale/pl';
   * const config = { locale: plLocale };
   *
   * @default 'en'
   */
  locale: string | ILocale;

  /**
   * Overrides for hardcoded UI strings (e.g. "Today", "+N more", view names).
   * @default undefined
   */
  labels: Partial<IMHCalendarLabels> | undefined;
}

/**
 * Public user-facing base config. All fields optional — defaults are applied internally.
 */
export type IMHCalendarConfigBase = Partial<ICalendarBaseConfig>;
