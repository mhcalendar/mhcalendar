import { ICalendarMultiViewConfig } from './multiview';

export interface IMHCalendarResource {
  id: string;
  title: string;
}

export interface ICalendarWeekConfig extends ICalendarMultiViewConfig {
  /**
   * If set to true, the week view will start from the `startDate` provided.
   * @description NOT IMPLEMENTED
   */
  customWeekView: boolean;

  /**
   * Defines if the week view should show weekends (Saturday and Sunday).
   * @description NOT IMPLEMENTED
   */
  showWeekends: boolean;

  /**
   * Array of resources (employees, rooms, courts, etc.) for SHIFTPLAN view.
   */
  resources: IMHCalendarResource[];

  /**
   * Number of days to display in SHIFTPLAN view.
   * @default 7
   */
  shiftplanDays: number;
}

/**
 * Public user-facing week config. All fields optional — defaults are applied internally.
 */
export type IMHCalendarWeekConfig = Partial<ICalendarWeekConfig>;

/**
 * Alias for IMHCalendarWeekConfig — full public options type.
 */
export type IMHCalendarFullOptions = Partial<ICalendarWeekConfig>;
