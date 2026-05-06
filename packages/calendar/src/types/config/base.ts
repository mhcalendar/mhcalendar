import { IMHCalendarViewType } from '../enums';
import { CssStyles } from './cssStyles';
import { IMHCalendarDayClickPayload, IMHCalendarEvent } from './event';
import { ConfigCSSProperites } from './properties';

export type IMHCalendarConfigBaseStyle = {
  properties: ConfigCSSProperites;
  styles: CssStyles;
};

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
}

/**
 * Public user-facing base config. All fields optional — defaults are applied internally.
 */
export type IMHCalendarConfigBase = Partial<ICalendarBaseConfig>;
