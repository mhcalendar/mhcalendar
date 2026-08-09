import { ICalendarMultiViewConfig } from './multiview';

export interface IMHCalendarResource {
  id: string;
  title: string;

  /**
   * Overrides `resourceRowHeight` for this resource's row only (e.g. to give one
   * resource more vertical space than the rest).
   */
  rowHeight?: number;
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

  /**
   * Fixed height (px) of each resource's row in RESOURCE view. All rows use this height
   * unless a resource sets its own `rowHeight`. Events beyond what fits collapse into a
   * "+N more" indicator instead of growing the row.
   * @default 64
   */
  resourceRowHeight: number;
}

/**
 * Public user-facing week config. All fields optional — defaults are applied internally.
 */
export type IMHCalendarWeekConfig = Partial<ICalendarWeekConfig>;

/**
 * Alias for IMHCalendarWeekConfig — full public options type.
 */
export type IMHCalendarFullOptions = Partial<ICalendarWeekConfig>;
