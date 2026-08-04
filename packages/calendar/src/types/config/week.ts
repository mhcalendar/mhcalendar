import { ICalendarMultiViewConfig } from './multiview';

export interface IMHCalendarResource {
  id: string;
  title: string;
}

export interface ICalendarWeekConfig extends ICalendarMultiViewConfig {
  /**
   * Array of resources (employees, rooms, courts, etc.) for RESOURCE view.
   */
  resources: IMHCalendarResource[];

  /**
   * Number of days to display in RESOURCE view.
   * @default 7
   */
  resourceDays: number;
}

/**
 * Public user-facing week config. All fields optional — defaults are applied internally.
 */
export type IMHCalendarWeekConfig = Partial<ICalendarWeekConfig>;

/**
 * Alias for IMHCalendarWeekConfig — full public options type.
 */
export type IMHCalendarFullOptions = Partial<ICalendarWeekConfig>;
