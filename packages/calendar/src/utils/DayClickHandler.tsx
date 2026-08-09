import { h } from '@stencil/core';
import { DateUtils } from './DateUtils';
import { store, storeState } from '../store/mh-calendar-store';
import { IMHCalendarViewType } from '../store/mh-calendar-store.types';
import { IMHCalendarEvent } from '../types';
import { EventManager } from './EventManager';

export class DayClickHandler {
  static handleDayClick(
    event: MouseEvent,
    el: HTMLElement | null,
    day: Date | undefined,
    isContext: boolean = false,
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
      const viewType = storeState.viewType;
      const isTimeView =
        viewType && [IMHCalendarViewType.DAY, IMHCalendarViewType.WEEK].includes(viewType);

      let newEvent: IMHCalendarEvent;

      if (isTimeView) {
        // For WEEK/DAY view: round down to hour and create 1-hour event
        // e.g., click at 15:30 -> create event 15:00-16:00
        // Dates are already in main timezone from getExactDateBasedOnUserPosition
        const clickedHour = exactDateUserClicked.getHours();
        const startDate = new Date(exactDateUserClicked);
        startDate.setHours(clickedHour, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setHours(clickedHour + 1, 0, 0, 0);

        newEvent = {
          id: EventManager.generateEventId(),
          startDate,
          endDate,
          title: 'New Event',
          allDay: false,
        };
      } else {
        // For MONTH view: create all-day event
        const startDate = new Date(day);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(day);
        endDate.setHours(23, 59, 59, 999);

        newEvent = {
          id: EventManager.generateEventId(),
          startDate,
          endDate,
          title: 'New Event',
          allDay: true,
        };
      }

      // Open modal for event creation
      const modalContent = (
        <mh-calendar-event-form
          event={newEvent}
          isNewEvent={true}
          onSave={(e) => {
            // Save event via callback
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

    // Call original onDayClick callback if provided
    if (!isContext && typeof storeState.onDayClick === 'function') {
     storeState.onDayClick({ date: exactDateUserClicked });
    }
    if (isContext && typeof storeState.onRightDayClick === 'function') {
     storeState.onRightDayClick({ date: exactDateUserClicked });
    }
  }
}
