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
   * Overrides for the view switcher's view names.
   * Keys not provided fall back to the title-cased IMHCalendarViewType value (e.g. 'Month').
   * @example { WEEK: 'Semaine', MONTH: 'Mois' }
   */
  views: Partial<Record<IMHCalendarViewType, string>>;
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
