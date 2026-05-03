import { IMHCalendarDayClickPayload, IMHCalendarEvent } from '../';

export interface IMHCalendarConfigBaseUserActions {
  /**
   * Callback function to be called when an event is clicked.
   */
  onEventClick: (event: IMHCalendarEvent) => void;

  /**
   * Callback function to be called when an event is clicked with right mouse.
   */
  onRightEventClick: (event: IMHCalendarEvent) => void;

  /**
   * Callback function to be called when a day is clicked.
   */
  onDayClick: (day: IMHCalendarDayClickPayload) => void;

  /**
   * Callback function to be called when a day is right clicked.
   */
  onRightDayClick: (day: IMHCalendarDayClickPayload) => void;

  /**
   * Callback function to be called when a new event is created via click.
   * The callback receives the newly created event object.
   * You should add this event to your events array to display it in the calendar.
   */
  onEventCreated?: (event: IMHCalendarEvent) => void;

  /**
   * Callback function to be called when an event is updated (e.g., title, description, dates).
   * The callback receives the updated event object.
   * You should update the event in your events array.
   */
  onEventUpdated?: (event: IMHCalendarEvent) => void;
}
