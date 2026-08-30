import { ICalendarMultiViewConfig } from './multiview';
import { IMHCalendarEvent } from './event';

export interface IMHCalendarResourceExtraColumn {
  /**
   * Unique identifier for this column (used as the render key).
   */
  id: string;

  /**
   * Header text shown for this column in RESOURCE view.
   */
  title: string;

  /**
   * Fixed width (px) of this column.
   * @default 160
   */
  width?: number;

  /**
   * Returns the HTML markup to render in this column's cell for a given resource.
   * `events` are all events for that resource within the currently visible date range.
   */
  render: (resource: IMHCalendarResource, events: IMHCalendarEvent[]) => string;
}

export interface IMHCalendarResource {
  id: string;
  title: string;

  /**
   * Overrides `resourceRowHeight` for this resource's row only (e.g. to give one
   * resource more vertical space than the rest).
   */
  rowHeight?: number;

  /**
   * URL of an image shown as a circular avatar to the left of the resource's title in the
   * label column of RESOURCE view.
   */
  image?: string;
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

  /**
   * Fixed width (px) of each day column in RESOURCE view. When set, day columns no longer
   * stretch to fill the available width — if `resourceDays * resourceColumnWidth` exceeds
   * the container width, the view scrolls horizontally instead of shrinking the columns.
   * If omitted, columns stretch evenly to fill the available width and no horizontal
   * scroll occurs.
   * @default undefined
   */
  resourceColumnWidth: number | undefined;

  /**
   * Fixed width (px) of the resource label column in RESOURCE view.
   * @default 160
   */
  resourceLabelColumnWidth: number;

  /**
   * Extra columns appended after the day columns in RESOURCE view (e.g. a "Summary" column
   * with a value computed per resource).
   * @default undefined
   */
  resourceExtraColumns: IMHCalendarResourceExtraColumn[] | undefined;
}

/**
 * Public user-facing week config. All fields optional — defaults are applied internally.
 */
export type IMHCalendarWeekConfig = Partial<ICalendarWeekConfig>;

/**
 * Alias for IMHCalendarWeekConfig — full public options type.
 */
export type IMHCalendarFullOptions = Partial<ICalendarWeekConfig>;
