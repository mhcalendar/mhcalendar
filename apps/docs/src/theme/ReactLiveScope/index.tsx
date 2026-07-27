import React from 'react';
import CalendarDemo, { buildDemoEvents } from '@site/src/components/CalendarDemo';
import {
  ICalendarMultiViewConfig,
  IMHCalendarFullOptions,
} from '../../../../../packages/calendar/dist/types/types';
import { IMHCalendarViewType } from '@mhcalendar/react';

// A baseline config shared across live demos so each one doesn't have to
// redeclare it. Spread it and override whatever the demo is actually about,
// e.g. `{ ...DEFAULT_CONFIG, hoursDisplayFormat: 'HH:mm' }`.
export const DEFAULT_CONFIG: Partial<IMHCalendarFullOptions> = {
  viewType: 'WEEK' as IMHCalendarViewType,
  showTimeFrom: 8,
  showTimeTo: 18,
  showAllDayTasks: false,
  showCalendarNavigation: false,
  showTimeIndicator: false,
};

// Exposed as globals inside every ```jsx live code block.
const ReactLiveScope = {
  React,
  ...React,
  MhCalendar: CalendarDemo,
  buildDemoEvents,
  DEFAULT_CONFIG,
};

export default ReactLiveScope;
