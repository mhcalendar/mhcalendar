import { IMHCalendarViewType } from '../enums';
import { CssStyles } from './cssStyles';
import { IMHCalendarDayClickPayload, IMHCalendarEvent } from './event';
import { ConfigCSSProperites } from './properties';

export type IMHCalendarConfigBaseStyle = {
  properties: ConfigCSSProperites;
  styles: CssStyles;
};

export type MHCalendarTheme = 'dark' | 'light' | (string & {});

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
}

/**
 * Public user-facing base config. All fields optional — defaults are applied internally.
 */
export type IMHCalendarConfigBase = Partial<ICalendarBaseConfig>;
