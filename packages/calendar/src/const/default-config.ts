import { IMHCalendarViewType } from '../store/mh-calendar-store.types';
import { IMHCalendarConfigBase, IMHCalendarWeekConfig } from '../types';
import { EventDisplayMode } from '../types/enums';
import { DEFAULT_THEME } from './default-theme';

export const MIN_EVENT_DURATION_MINUTES = 15;

export const DEFAULT_CALENDAR_CONFIG: IMHCalendarConfigBase = {
  style: DEFAULT_THEME,
  viewType: IMHCalendarViewType.AGENDA,
  fixedHeight: undefined,
  virtualScrollHeight: undefined,
  eventContent: undefined,
  eventSmallContent: undefined,
  onEventClick: undefined,
  onRightEventClick: undefined,
  onDayClick: undefined,
  onRightDayClick: undefined,
  onEventCreated: undefined,
  onEventUpdated: undefined,
  showDateSwitcher: true,
  showViewTypeSwitcher: true,
  showCalendarNavigation: true,
  allowEventDragging: true,
  showViewHeader: true,
  createEventOnClick: false,
  avaliableViews: undefined,
};

export const DEFAULT_WEEK_VIEW_CONFIG: IMHCalendarWeekConfig = {
  ...DEFAULT_CALENDAR_CONFIG,
  startDate: new Date(),
  showTimeFrom: 8,
  showTimeTo: 17,
  slotInterval: { hours: 1, minutes: 0 },
  hoursSlotInterval: { hours: 1, minutes: 0 },
  businessHours: [],
  hoursDisplayFormat: 'h A',
  showAllDayTasks: true,
  allDayEventsHeight: 100,
  makeAllDaysSticky: false,
  minEventDuration: MIN_EVENT_DURATION_MINUTES,
  allowEventResize: true,
  hiddenDays: [],
  blockBusinessHours: false,
  timezones: [],
  timezoneLabel: undefined,
  eventDisplayMode: EventDisplayMode.SideBySide,
  showTimeIndicator: true,
  customWeekView: false,
  showWeekends: true,
  resources: [],
  shiftplanDays: 7,
};
