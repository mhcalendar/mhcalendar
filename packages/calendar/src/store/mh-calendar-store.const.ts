import { IMHCalendarConfigBaseStyle } from '../types';
import { IMHCalendarState } from './mh-calendar-store.types';
import { DEFAULT_WEEK_VIEW_CONFIG } from '../const/default-config';

export const DEFAULT_HOUR_HEIGHT = 50;

export const initialState: IMHCalendarState = {
  ...DEFAULT_WEEK_VIEW_CONFIG,
  // viewType and style are managed by setConfig, not pre-initialized
  viewType: undefined,
  style: {} as IMHCalendarConfigBaseStyle,
  // Runtime-only internal state
  calendarDateRange: {
    fromDate: undefined,
    toDate: undefined,
  },
  reactiveEvents: new Map(),
  heightOfCalendarHour: DEFAULT_HOUR_HEIGHT,
  heightOfCalendarDay: undefined,
  draggedEvent: null,
  properties: {},
  modal: {
    isOpen: false,
    content: null,
    position: undefined,
  },
} as IMHCalendarState;
