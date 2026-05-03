import { IMHCalendarDateRange, IMHCalendarEvent } from '../types';
import { ICalendarWeekConfig } from '../types/config/week';
import { EventBuilderMapByDate } from '../utils/EventManager';

export { IMHCalendarViewType } from '../types/enums';

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

export interface IMHCalendarState extends ICalendarWeekConfig {
  // Runtime-only internal state
  calendarDateRange: IMHCalendarDateRange;
  reactiveEvents: EventBuilderMapByDate;
  draggedEvent: IMHCalendarEvent | null;
  heightOfCalendarHour: number;
  heightOfCalendarDay: number | undefined;
  properties: Record<string, string>;
  modal: IModalState;
}

export enum UserErrors {
  DIRECT_STORE_SET = "State can't be set directly.",
}
