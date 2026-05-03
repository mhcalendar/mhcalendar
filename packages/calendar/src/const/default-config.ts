import { IMHCalendarViewType } from '../store/mh-calendar-store.types';
import { IMHCalendarConfigBase, IMHCalendarWeekConfig } from '../types';
import { IMHCalendarConfigBaseUserActions } from '../types/config/callbacks';
import { EventDisplayMode } from '../types/enums';
import { DEFAULT_THEME } from './default-theme';

export const MIN_EVENT_DURATION_MINUTES = 15;

export const DEF_USER_ACTIONS: Partial<IMHCalendarConfigBaseUserActions> = {
  onEventClick: undefined,
  onRightEventClick: undefined,
  onDayClick: undefined,
  onRightDayClick: undefined,
};

export const DEFAULT_CALENDAR_CONFIG: IMHCalendarConfigBase = {
  style: DEFAULT_THEME,
  viewType: IMHCalendarViewType.MONTH,
  eventContent: undefined,
  showDateSwitcher: true,
  showViewTypeSwitcher: true,
  showCalendarNavigation: true,
  allowEventDragging: true,
  showViewHeader: true,
  ...DEF_USER_ACTIONS,
};

export const DEFAULT_WEEK_VIEW_CONFIG: IMHCalendarWeekConfig = {
  ...DEFAULT_CALENDAR_CONFIG,
  showTimeFrom: 8,
  showTimeTo: 17,
  startDate: new Date(),
  showWeekends: true,
  showAllDayTasks: true,
  allDayEventsHeight: 100,
  allowEventResize: true,
  minEventDuration: MIN_EVENT_DURATION_MINUTES,
  makeAllDaysSticky: false,
  showTimeIndicator: true,
  slotInterval: {
    hours: 1,
    minutes: 0,
  },
  hoursSlotInterval: {
    hours: 1,
    minutes: 0,
  },
  hoursDisplayFormat: 'h A',
  businessHours: [],
  timezones: [],
  createEventOnClick: false,
  eventDisplayMode: EventDisplayMode.SideBySide,
  resources: [],
  shiftplanDays: 7,
};
