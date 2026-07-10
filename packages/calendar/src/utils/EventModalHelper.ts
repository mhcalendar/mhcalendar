import dayjs from 'dayjs';
import { IMHCalendarEvent } from '../types';
import { store } from '../store/mh-calendar-store';
import { EventManager } from './EventManager';

export class EventModalHelper {
  /**
   * Creates modal content for event creation/editing
   */
  static createEventModalContent(
    event: IMHCalendarEvent,
    isNewEvent: boolean = false,
    onSave: (updatedEvent: IMHCalendarEvent) => void,
    onCancel: () => void,
  ): HTMLElement {
    const container = document.createElement('div');
    container.className = 'mhCalendarEventModal';
    container.innerHTML = `
      <div class="mhCalendarEventModal__header">
        <h3>${isNewEvent ? 'New Event' : 'Edit Event'}</h3>
      </div>
      <div class="mhCalendarEventModal__body">
        <div class="mhCalendarEventModal__field">
          <label>Title:</label>
          <input
            type="text"
            id="event-title"
            value="${this.escapeHtml(event.title || '')}"
            placeholder="Enter title"
          />
        </div>
        <div class="mhCalendarEventModal__field">
          <label>Description:</label>
          <textarea
            id="event-description"
            placeholder="Enter description (optional)"
            rows="3"
          >${this.escapeHtml(event.description || '')}</textarea>
        </div>
        <div class="mhCalendarEventModal__field">
          <label>Date and Time:</label>
          <div class="mhCalendarEventModal__datetime">
            <div>
              <label style="font-size: 12px;">From:</label>
              <input
                type="datetime-local"
                id="event-start"
                value="${this.formatDateTimeLocal(event.startDate)}"
              />
            </div>
            <div>
              <label style="font-size: 12px;">To:</label>
              <input
                type="datetime-local"
                id="event-end"
                value="${this.formatDateTimeLocal(event.endDate)}"
              />
            </div>
          </div>
        </div>
        <div class="mhCalendarEventModal__field">
          <label>
            <input
              type="checkbox"
              id="event-allDay"
              ${event.allDay ? 'checked' : ''}
            />
            All Day
          </label>
        </div>
      </div>
      <div class="mhCalendarEventModal__footer">
        <button id="event-modal-cancel" class="mhCalendarEventModal__button mhCalendarEventModal__button--cancel">
          Cancel
        </button>
        <button id="event-modal-save" class="mhCalendarEventModal__button mhCalendarEventModal__button--save">
          Save
        </button>
      </div>
    `;

    // Add event listeners
    const saveButton = container.querySelector('#event-modal-save');
    const cancelButton = container.querySelector('#event-modal-cancel');

    (saveButton as HTMLElement)?.addEventListener('click', () => {
      const titleInput = container.querySelector('#event-title') as HTMLInputElement;
      const descriptionInput = container.querySelector('#event-description') as HTMLTextAreaElement;
      const startInput = container.querySelector('#event-start') as HTMLInputElement;
      const endInput = container.querySelector('#event-end') as HTMLInputElement;
      const allDayInput = container.querySelector('#event-allDay') as HTMLInputElement;

      // Validation
      const errors = this.validateEventForm(titleInput, startInput, endInput);
      this.clearValidationErrors(container);

      if (errors.length > 0) {
        this.showValidationErrors(container, errors);
        return;
      }

      const updatedEvent: IMHCalendarEvent = {
        ...event,
        title: titleInput.value.trim(),
        description: descriptionInput?.value || undefined,
        allDay: allDayInput?.checked || false,
        startDate: dayjs.tz(startInput.value, store.mainTimezone).toDate(),
        endDate: dayjs.tz(endInput.value, store.mainTimezone).toDate(),
      };

      if (isNewEvent) {
        EventManager.addEvent(updatedEvent);
      } else {
        EventManager.updateEvent(event.id, updatedEvent);
      }

      // Call user callback with the event (user can do whatever they want with it)
      onSave(updatedEvent);
      store.closeModal();
    });

    cancelButton?.addEventListener('click', () => {
      onCancel();
      store.closeModal();
    });

    // Handle Enter key in title input
    const titleInput = container.querySelector('#event-title') as HTMLInputElement;
    titleInput?.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        (saveButton as HTMLElement)?.click();
      }
    });

    return container;
  }

  /**
   * Validates the event form inputs and returns error messages
   */
  private static validateEventForm(
    titleInput: HTMLInputElement,
    startInput: HTMLInputElement,
    endInput: HTMLInputElement,
  ): { field: string; message: string }[] {
    const errors: { field: string; message: string }[] = [];

    if (!titleInput?.value?.trim()) {
      errors.push({ field: 'event-title', message: 'Title is required.' });
    }

    const tz = store.mainTimezone;
    const startDate = dayjs.tz(startInput?.value, tz).toDate();
    const endDate = dayjs.tz(endInput?.value, tz).toDate();

    if (isNaN(startDate.getTime())) {
      errors.push({ field: 'event-start', message: 'Start date is invalid.' });
    }

    if (isNaN(endDate.getTime())) {
      errors.push({ field: 'event-end', message: 'End date is invalid.' });
    }

    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate >= endDate) {
      errors.push({ field: 'event-end', message: 'End date must be after start date.' });
    }

    return errors;
  }

  /**
   * Displays validation errors in the modal
   */
  private static showValidationErrors(
    container: HTMLElement,
    errors: { field: string; message: string }[],
  ): void {
    for (const error of errors) {
      const input = container.querySelector(`#${error.field}`) as HTMLElement;
      if (input) {
        input.style.borderColor = '#dc3545';
      }
    }

    const footer = container.querySelector('.mhCalendarEventModal__footer');
    if (footer) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'mhCalendarEventModal__errors';
      errorDiv.style.cssText =
        'color: #dc3545; font-size: 13px; margin-top: 12px; display: flex; flex-direction: column; gap: 4px;';

      const uniqueMessages = [...new Set(errors.map((e) => e.message))];
      errorDiv.innerHTML = uniqueMessages.map((msg) => `<span>${msg}</span>`).join('');

      footer.insertAdjacentElement('beforebegin', errorDiv);
    }
  }

  /**
   * Clears previous validation errors from the modal
   */
  private static clearValidationErrors(container: HTMLElement): void {
    const existingErrors = container.querySelector('.mhCalendarEventModal__errors');
    if (existingErrors) {
      existingErrors.remove();
    }

    container.querySelectorAll<HTMLElement>('input, textarea').forEach((el) => {
      el.style.borderColor = '';
    });
  }

  /**
   * Formats a Date object to datetime-local input format
   */
  private static formatDateTimeLocal(date: Date): string {
    return dayjs(date).tz(store.mainTimezone).format('YYYY-MM-DDTHH:mm');
  }

  /**
   * Escapes HTML special characters to prevent XSS when interpolating
   * user-controlled event data into an innerHTML template.
   */
  private static escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
