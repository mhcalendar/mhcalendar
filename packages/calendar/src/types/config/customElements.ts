export interface IMHCalendarCustomRenderConfig {
  /**
   * Custom render function for full-size events (WEEK/DAY views).
   * Receives the event object and should return an HTML string.
   */
  eventContent: (event: any) => any;

  /**
   * Custom render function for small/compact events (MONTH, SHIFTPLAN, AGENDA views).
   * Receives the event object and should return an HTML string.
   */
  eventSmallContent: (event: any) => any;
}
