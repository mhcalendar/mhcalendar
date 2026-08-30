import { VNode } from '@stencil/core';
import { IMHCalendarDateRange, IMHCalendarEvent } from '../types';
import { ICalendarWeekConfig } from '../types/config/week';
import { EventBuilderMapByDate } from '../utils/EventManager';

export { IMHCalendarViewType, MHCalendarViewType } from '../types/enums';

export interface IModalState {
  isOpen: boolean;
  content?: VNode;
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

export interface IMHCalendarState extends ICalendarWeekConfig {
  // Runtime-only internal state
  anchorDate: Date | undefined;
  calendarDateRange: IMHCalendarDateRange;
  reactiveEvents: EventBuilderMapByDate;
  draggedEvent: IMHCalendarEvent | null;
  draggedOverAllDayDate: Date | null;
  heightOfCalendarHour: number;
  heightOfCalendarDay: number | undefined;
  properties: Record<string, string>;
  modal: IModalState;
}

export enum UserErrors {
  DIRECT_STORE_SET = "State can't be set directly.",
}
