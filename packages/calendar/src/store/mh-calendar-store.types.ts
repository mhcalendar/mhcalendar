import { IMHCalendarFullOptions, IMHCalendarDateRange, SlotOption, BusinessHoursConfig } from '../types';
import { EventDisplayMode } from '../types/enums';
import { EventBuilderMapByDate } from '../utils/EventManager';

export interface IMHCalendarEvent {
  id: string;
  startDate: Date;
  endDate: Date;
  title?: string;
  allDay?: boolean;
  description?: string;
  isHidden?: boolean;
  color?: string;
  resourceId?: string;
  draggingToggle?: boolean;
  [key: string]: unknown;
}

export enum IMHCalendarViewType {
  DAY = 'DAY',
  MONTH = 'MONTH',
  WEEK = 'WEEK',
  AGENDA = 'AGENDA',
  SHIFTPLAN = 'SHIFTPLAN',
}

export interface IMHCalendarResource {
  id: string;
  title: string;
}

export interface IModalPosition {
  x?: number;
  y?: number;
  element?: HTMLElement;
  alignment?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  rect?: { top: number; left: number; width: number; height: number };
}

export interface IModalState {
  isOpen: boolean;
  content?: any;
  position?: IModalPosition;
}

export interface IEventDropPayload {
  topPosition: number;
  date: Date;
  isAllDay?: boolean;
}

export interface IEventResizePayload {
  eventId: string;
  finalY: number;
  dayOfRendering: Date;
}

export interface IMHCalendarState extends IMHCalendarFullOptions {
  // Override optional config properties — these always have defaults in state
  showAllDayTasks: boolean;
  allDayEventsHeight: number;
  makeAllDaysSticky: boolean;
  showTimeIndicator: boolean;
  allowEventResize: boolean;
  minEventDuration: number;
  hoursDisplayFormat: string;
  createEventOnClick: boolean;
  eventDisplayMode: EventDisplayMode;
  resources: IMHCalendarResource[];
  shiftplanDays: number;
  showWeekends: boolean;
  timezones: string[];
  showTimeFrom: number;
  showTimeTo: number;
  slotInterval: SlotOption;
  hoursSlotInterval: SlotOption;
  businessHours: BusinessHoursConfig[];
  showDateSwitcher: boolean;
  showViewTypeSwitcher: boolean;
  showCalendarNavigation: boolean;
  allowEventDragging: boolean;
  showViewHeader: boolean;
  // Runtime-only internal state
  calendarDateRange: IMHCalendarDateRange;
  reactiveEvents: EventBuilderMapByDate;
  draggedEvent: IMHCalendarEvent | null;
  heightOfCalendarHour: number;
  heightOfCalendarDay?: number;
  properties: Record<string, string>;
  modal?: IModalState;
}

export interface IMHCalendarStore {
  readonly state: IMHCalendarState;
  // Computed
  daysInRange: number;
  hoursInDay: number;
  hoursRangeCal: number;
  mainTimezone: string;
  headerMargin: number;
  // Queries
  getEventById: (id: string) => IMHCalendarEvent[];
  getEvents: () => IMHCalendarEvent[];
  getInlineStyleForClass: (className: string) => object;
  // Subscriptions
  onChange: (key: keyof IMHCalendarState, callback: (value: any) => void) => void;
  // Actions
  setConfig: (payload: Record<string, any>) => void;
  changeView: (viewType: IMHCalendarViewType) => void;
  nextPeriod: () => void;
  previousPeriod: () => void;
  setToToday: () => void;
  setDraggedEvent: (event: IMHCalendarEvent | null) => void;
  dropEvent: (payload: IEventDropPayload) => void;
  resizeEvent: (payload: IEventResizePayload) => void;
  openModal: (content: any, position?: IModalPosition) => void;
  closeModal: () => void;
  addEvent: (event: IMHCalendarEvent) => void;
  updateEvent: (eventId: string, event: IMHCalendarEvent) => void;
  removeEvent: (eventId: string) => void;
}

export enum UserErrors {
  DIRECT_STORE_SET = "State can't be set directly.",
}

export interface IDateRange {
  fromDate: Date;
  toDate: Date;
}
