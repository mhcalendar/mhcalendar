/**
 * @fileoverview Public entry point for @mhcalendar/calendar.
 *
 * Exports the types and utilities needed to consume the mh-calendar component.
 * Components themselves are not exported here — consume them as outlined in the `README.md`.
 */

export * from './types/enums';

// Public types needed to consume mh-calendar
export type { IMHCalendarFullOptions, UserApi } from './components.js';
export type { IMHCalendarEvent } from './components.js';
export type { IMHCalendarDayClickPayload } from './types/index.js';

export { registerView } from './registry/mh-calendar-view-registry';
export type { IMHCalendarViewDefinition } from './registry/mh-calendar-view-registry';
