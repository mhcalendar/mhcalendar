import dayjs from 'dayjs';
import { MINUTES_IN_HOUR } from '../components/mh-calendar-day/mh-calendar-day.const';
import { DEFAULT_THEME, THEMES } from '../const/default-theme';
import { ConfigValidator } from '../utils/ConfigValidator';
import { DateUtils } from '../utils/DateUtils';
import { EventManager } from '../utils/EventManager';
import { BusinessHoursUtils } from '../utils/BusinessHoursUtils';
import {
  IEventDropPayload,
  IEventResizePayload,
  IMHCalendarState,
  IMHCalendarViewType,
  IModalPosition,
} from './mh-calendar-store.types';
import { MHCalendarStoreUtils } from './mh-calendar-store.utils';
import { IMHCalendarEvent } from '../types';

export class MHCalendarActions extends MHCalendarStoreUtils {
  protected _setConfig(state: IMHCalendarState, payload: Record<string, any>): IMHCalendarState {
    const configValidator = new ConfigValidator(payload);
    if (!configValidator.validateConfig()) return state;

    const baseTheme = (payload.theme && THEMES[payload.theme]) ? THEMES[payload.theme] : DEFAULT_THEME;

    const { properties, ...userJsCss } = payload.style ?? {};

    state.style = Object.keys(userJsCss).length
      ? this.mergeStyles(userJsCss, baseTheme)
      : { ...baseTheme };

    const userPropsMergeWithDefaults = {
      ...baseTheme.properties,
      ...(properties ?? {}),
    };
    state.properties = userPropsMergeWithDefaults;

    const hostElement = payload.hostElement ?? document.documentElement;
    Object.entries(userPropsMergeWithDefaults).map(([key, val]: any) => {
      hostElement.style.setProperty(`--${key}`, val);
    });

    const { fromDate, toDate } = this.updateDateRangeForViewType(
      payload.viewType,
      payload.startDate || new Date(),
      payload.shiftplanDays,
    );

    state.anchorDate = fromDate;
    state.calendarDateRange = { fromDate, toDate };
    state.eventContent = payload.eventContent;
    state.eventSmallContent = payload.eventSmallContent;
    state.viewType = payload.viewType;

    if (payload.events) {
      state.reactiveEvents = EventManager.mapEventsByDate(payload.events);
    }

    const configKeys = [
      'showTimeFrom',
      'showTimeTo',
      'showAllDayTasks',
      'allDayEventsHeight',
      'fixedHeight',
      'virtualScrollHeight',
      'showDateSwitcher',
      'showViewTypeSwitcher',
      'showCalendarNavigation',
      'makeAllDaysSticky',
      'allowEventDragging',
      'showViewHeader',
      'hoursDisplayFormat',
      'allowEventResize',
      'minEventDuration',
      'businessHours',
      'hiddenDays',
      'blockBusinessHours',
      'showTimeIndicator',
      'slotInterval',
      'hoursSlotInterval',
      'timezones',
      'timezoneLabel',
      'eventDisplayMode',
      'onDayClick',
      'onEventClick',
      'onRightEventClick',
      'onRightDayClick',
      'onEventCreated',
      'onEventUpdated',
      'createEventOnClick',
      'resources',
      'shiftplanDays',
      'avaliableViews',
    ] as const;

    for (const key of configKeys) {
      (state as any)[key] = payload[key];
    }

    return { ...state };
  }

  protected _changeView(
    state: IMHCalendarState,
    payload: { viewType: IMHCalendarViewType },
  ): IMHCalendarState {
    const newCalendarDateRange = this.updateDateRangeForViewType(
      payload.viewType,
      state.anchorDate ?? state.calendarDateRange.fromDate ?? new Date(),
      state.shiftplanDays,
    );
    state.viewType = payload.viewType;
    state.calendarDateRange = newCalendarDateRange;
    return state;
  }

  protected _shiftDateRange(
    state: IMHCalendarState,
    payload: { amount: number },
  ): IMHCalendarState {
    if (!state.viewType || !state.anchorDate) return state;
    state.calendarDateRange = this.shiftCalendar(
      state.viewType,
      state.anchorDate,
      payload.amount,
      state.shiftplanDays,
    );
    state.anchorDate = state.calendarDateRange.fromDate;
    return state;
  }

  protected _setDateToToday(state: IMHCalendarState): IMHCalendarState {
    if (!state.viewType) return state;
    state.calendarDateRange = this.updateDateRangeForViewType(
      state.viewType,
      new Date(),
      state.shiftplanDays,
    );
    state.anchorDate = state.calendarDateRange.fromDate;
    return state;
  }

  protected _handleEventDrop(
    state: IMHCalendarState,
    payload: IEventDropPayload,
  ): IMHCalendarState {
    const { topPosition, date, isAllDay } = payload;
    if (!state.draggedEvent) return state;

    if (state.viewType === IMHCalendarViewType.SHIFTPLAN) {
      state.draggedEvent = null;
      return state;
    }

    if (state.viewType === IMHCalendarViewType.MONTH && state.draggedEvent) {
      const originalStart = state.draggedEvent.startDate;
      const originalEnd = state.draggedEvent.endDate;

      const newStartDate = new Date(date);
      newStartDate.setHours(
        originalStart.getHours(),
        originalStart.getMinutes(),
        originalStart.getSeconds(),
        originalStart.getMilliseconds(),
      );
      const newEndDate = new Date(date);
      newEndDate.setHours(
        originalEnd.getHours(),
        originalEnd.getMinutes(),
        originalEnd.getSeconds(),
        originalEnd.getMilliseconds(),
      );

      EventManager.handleEventDateChange(newStartDate, newEndDate);
      state.draggedEvent = null;
      return state;
    }

    if (isAllDay === true) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      const updatedEvent = { ...state.draggedEvent, allDay: true };
      EventManager.handleEventDateChange(startDate, endDate, updatedEvent);
      state.draggedEvent = null;
      return state;
    }

    if (!isAllDay && state.draggedEvent.allDay) {
      const startHour = state.showTimeFrom;
      const endHour = state.showTimeTo;
      const dayString = dayjs(date).format('YYYY-MM-DD');
      const mainTimezone = state.timezones[0] || Intl.DateTimeFormat().resolvedOptions().timeZone;

      let startDate: Date;
      let endDate: Date;

      if (mainTimezone !== Intl.DateTimeFormat().resolvedOptions().timeZone) {
        startDate = DateUtils.dateAtHourInTimezone(dayString, startHour, 0, mainTimezone);
        endDate = DateUtils.dateAtHourInTimezone(dayString, endHour, 0, mainTimezone);
      } else {
        startDate = new Date(date);
        startDate.setHours(startHour, 0, 0, 0);
        endDate = new Date(date);
        endDate.setHours(endHour, 0, 0, 0);
      }

      const updatedEvent = { ...state.draggedEvent, allDay: false };
      EventManager.handleEventDateChange(startDate, endDate, updatedEvent);
      state.draggedEvent = null;
      return state;
    }

    const startDate = DateUtils.getExactDateBasedOnUserPosition(topPosition, date);
    const eventDurationInMinutes = this.calculateEventDuration(state.draggedEvent);
    const endDate = new Date(startDate.getTime() + eventDurationInMinutes * MINUTES_IN_HOUR * 1000);

    if (state.blockBusinessHours && !isAllDay && state.draggedEvent.allDay) {
      const isWithinBusinessHours = BusinessHoursUtils.isEventWithinBusinessHours(
        startDate,
        endDate,
        state.businessHours,
      );
      if (!isWithinBusinessHours) {
        state.draggedEvent = null;
        return state;
      }
    }

    const updatedEvent = { ...state.draggedEvent, allDay: false };
    EventManager.handleEventDateChange(startDate, endDate, updatedEvent);
    state.draggedEvent = null;
    return state;
  }

  protected _handleEventResize(
    state: IMHCalendarState,
    payload: IEventResizePayload,
  ): IMHCalendarState {
    const { eventId } = payload;

    let event: IMHCalendarEvent | undefined;
    for (const eventMapById of state.reactiveEvents.values()) {
      if (eventMapById.has(eventId)) {
        event = eventMapById.get(eventId)!;
        break;
      }
    }

    if (!event) return state;

    let endDate = DateUtils.getExactDateBasedOnUserPosition(payload.finalY, payload.dayOfRendering);
    if (dayjs(endDate).isBefore(dayjs(event.startDate))) {
      endDate = dayjs(event.startDate).add(state.minEventDuration, 'minute').toDate();
    }

    EventManager.handleEventDateChange(event.startDate, endDate, event);
    return state;
  }

  protected _openModal(
    state: IMHCalendarState,
    payload: { content: any; position?: IModalPosition },
  ): IMHCalendarState {
    state.modal = { isOpen: true, content: payload.content, position: payload.position };
    return { ...state };
  }

  protected _closeModal(state: IMHCalendarState): IMHCalendarState {
    state.modal = { isOpen: false, content: null, position: undefined };
    return { ...state };
  }
}
