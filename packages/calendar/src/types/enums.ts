export enum EventDisplayMode {
  SideBySide = 'side-by-side',
  Overlapping = 'overlapping',
}

export enum IMHCalendarViewType {
  DAY = 'DAY',
  MONTH = 'MONTH',
  WEEK = 'WEEK',
  AGENDA = 'AGENDA',
  RESOURCE = 'RESOURCE',
}

/**
 * A view type known at build time, or any custom string registered via `registerView`
 * (e.g. from a premium views package).
 */
export type MHCalendarViewType = IMHCalendarViewType | (string & {});
