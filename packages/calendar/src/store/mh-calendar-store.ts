import { createStore, ObservableMap } from '@stencil/store';
import { MHCalendarActions } from './mh-calendar-store.actions';
import {
  IEventDropPayload,
  IEventResizePayload,
  IMHCalendarState,
  IMHCalendarViewType,
  IModalPosition,
} from './mh-calendar-store.types';
import dayjs from 'dayjs';
import { DaysGenerator } from '../utils/DaysGenerator';
import { initialState } from './mh-calendar-store.const';
import { EventManager } from '../utils/EventManager';
import { CssStyles } from '../types/config/cssStyles';
import { IMHCalendarEvent } from '../types';

export class MHCalendarStore extends MHCalendarActions {
  private readonly _map: ObservableMap<IMHCalendarState>;
  readonly state: IMHCalendarState;

  constructor() {
    super();
    this._map = createStore<IMHCalendarState>(initialState);
    this.state = this._map.state;
  }

  onChange(key: keyof IMHCalendarState, callback: (value: any) => void) {
    this._map.onChange(key, callback);
  }

  // ###### Computed getters ######

  get daysInRange(): number {
    if (this.state.viewType === 'WEEK' || this.state.viewType === 'DAY') {
      return DaysGenerator.getDatesForMultiView().length;
    }
    const start = dayjs(this.state.calendarDateRange.fromDate);
    const end = dayjs(this.state.calendarDateRange.toDate);
    if (start.isAfter(end, 'day')) return 0;
    return end.diff(start, 'day') + 1;
  }

  get hoursRangeCal(): number {
    if (typeof this.state.showTimeTo !== 'number' || typeof this.state.showTimeFrom !== 'number')
      return 0;
    return this.state.showTimeTo - this.state.showTimeFrom;
  }

  get hoursInDay(): number {
    if (!this.state.slotInterval || !this.state.hoursSlotInterval) return 0;
    const slotDivider = (this.state.slotInterval.hours * 60 + this.state.slotInterval.minutes) / 60;
    return this.hoursRangeCal / slotDivider;
  }

  get mainTimezone(): string {
    return this.state.timezones?.[0] || Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  get headerMargin(): number {
    return (this.state.showAllDayTasks ? this.state.allDayEventsHeight : 0) ?? 0;
  }

  // ###### Queries ######

  getEventById(id: string): IMHCalendarEvent[] {
    const result: IMHCalendarEvent[] = [];
    for (const eventMapById of this.state.reactiveEvents.values()) {
      if (eventMapById.has(id)) {
        result.push(eventMapById.get(id)!);
      }
    }
    return result;
  }

  getEvents(): IMHCalendarEvent[] {
    const allEvents: IMHCalendarEvent[] = [];
    for (const eventMapById of this.state.reactiveEvents.values()) {
      for (const event of eventMapById.values()) {
        allEvents.push(event);
      }
    }
    return allEvents;
  }

  getInlineStyleForClass(className: keyof CssStyles) {
    return this.state?.style?.styles?.[className] || {};
  }

  // ###### Actions ######

  setConfig(payload: Record<string, any>): void {
    this._setConfig(this.state, payload);
  }

  changeView(viewType: IMHCalendarViewType): void {
    this._changeView(this.state, { viewType });
  }

  nextPeriod(): void {
    this._shiftDateRange(this.state, { amount: 1 });
  }

  previousPeriod(): void {
    this._shiftDateRange(this.state, { amount: -1 });
  }

  setToToday(): void {
    this._setDateToToday(this.state);
  }

  setDraggedEvent(event: IMHCalendarEvent | null): void {
    this.state.draggedEvent = event;
  }

  dropEvent(payload: IEventDropPayload): void {
    this._handleEventDrop(this.state, payload);
  }

  resizeEvent(payload: IEventResizePayload): void {
    this._handleEventResize(this.state, payload);
  }

  openModal(content: any, position?: IModalPosition): void {
    this._openModal(this.state, { content, position });
  }

  closeModal(): void {
    this._closeModal(this.state);
  }

  addEvent(event: IMHCalendarEvent): void {
    EventManager.addEvent(event);
  }

  updateEvent(eventId: string, event: IMHCalendarEvent): void {
    EventManager.updateEvent(eventId, event);
  }

  removeEvent(eventId: string): void {
    EventManager.removeEvent(eventId);
  }
}

export const store = new MHCalendarStore();
export const storeState = store.state;
export default store;
