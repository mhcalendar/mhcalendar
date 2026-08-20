import { h } from '@stencil/core';
import { DateUtils } from './DateUtils';
import { store, storeState } from '../store/mh-calendar-store';
import { IMHCalendarViewType, MHCalendarViewType } from '../store/mh-calendar-store.types';
import { IMHCalendarEvent } from '../types';
import { EventManager } from './EventManager';
import { LabelUtils } from './LabelUtils';

type NewEventContext = {
  day: Date;
  exactDateUserClicked: Date;
  resourceId?: string;
};

export class DayClickHandler {
  static handleDayClick(
    event: MouseEvent,
    el: HTMLElement | null,
    day: Date | undefined,
    isContext: boolean = false,
    resourceId?: string,
  ): void {
    if (!el || !day) return;

    // Prevent opening modal if click is from resize handler or event element
    const target = event.target as HTMLElement;
    if (target.closest('.mhCalendarResizeEventHandler') || target.closest('.mhCalendarEvent')) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const exactDateUserClicked = DateUtils.getExactDateBasedOnUserPosition(
      event.clientY - el.getBoundingClientRect().top,
      day,
    );

    // Handle event creation if createEventOnClick is enabled
    if (
      !isContext &&
      storeState.createEventOnClick &&
      typeof storeState.onEventCreated === 'function'
    ) {
      const buildNewEvent =
        this.newEventBuildersByViewType[storeState.viewType as MHCalendarViewType] ??
        this.buildAllDayEvent;
      const newEvent = buildNewEvent({ day, exactDateUserClicked, resourceId });
      this.openEventCreationModal(newEvent);
    }

    // Call original onDayClick callback if provided
    if (!isContext && typeof storeState.onDayClick === 'function') {
      storeState.onDayClick({ date: exactDateUserClicked, resourceId });
    }
    if (isContext && typeof storeState.onRightDayClick === 'function') {
      storeState.onRightDayClick({ date: exactDateUserClicked, resourceId });
    }
  }

  // Maps a view type to how it builds the event created by clicking an empty slot.
  // Falls back to buildAllDayEvent (used by MONTH) for anything not listed here.
  private static readonly newEventBuildersByViewType: Partial<
    Record<MHCalendarViewType, (context: NewEventContext) => IMHCalendarEvent>
  > = {
    [IMHCalendarViewType.DAY]: DayClickHandler.buildTimedEvent,
    [IMHCalendarViewType.WEEK]: DayClickHandler.buildTimedEvent,
    [IMHCalendarViewType.RESOURCE]: DayClickHandler.buildResourceEvent,
  };

  // WEEK/DAY: round down to hour and create 1-hour event, e.g. click at 15:30 -> 15:00-16:00.
  private static buildTimedEvent({ exactDateUserClicked }: NewEventContext): IMHCalendarEvent {
    const clickedHour = exactDateUserClicked.getHours();
    const startDate = new Date(exactDateUserClicked);
    startDate.setHours(clickedHour, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setHours(clickedHour + 1, 0, 0, 0);

    return {
      id: EventManager.generateEventId(),
      startDate,
      endDate,
      title: LabelUtils.defaultEventTitle(),
      allDay: false,
    };
  }

  // MONTH (and any other/unregistered view type): create an all-day event on the clicked day.
  private static buildAllDayEvent({ day }: NewEventContext): IMHCalendarEvent {
    const startDate = new Date(day);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(day);
    endDate.setHours(23, 59, 59, 999);

    return {
      id: EventManager.generateEventId(),
      startDate,
      endDate,
      title: LabelUtils.defaultEventTitle(),
      allDay: true,
    };
  }

  // RESOURCE: same as MONTH's all-day event, but tied to the clicked resource row.
  private static buildResourceEvent(context: NewEventContext): IMHCalendarEvent {
    return { ...DayClickHandler.buildAllDayEvent(context), resourceId: context.resourceId };
  }

  private static openEventCreationModal(newEvent: IMHCalendarEvent): void {
    const modalContent = (
      <mh-calendar-event-form
        event={newEvent}
        isNewEvent={true}
        onSave={(e) => {
          if (typeof storeState.onEventCreated === 'function') {
            storeState.onEventCreated(e.detail);
          }
        }}
        onCancel={() => {
          // Cancel - do nothing, event was not created
        }}
      />
    );

    store.openModal(modalContent);
  }
}
