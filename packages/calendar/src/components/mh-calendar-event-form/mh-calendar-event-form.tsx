import { Component, Event, EventEmitter, h, Prop, State } from '@stencil/core';
import dayjs from 'dayjs';
import { IMHCalendarEvent } from '../../types';
import { store } from '../../store/mh-calendar-store';
import { EventManager } from '../../utils/EventManager';
import { DateUtils } from '../../utils/DateUtils';

const DATETIME_LOCAL_FORMAT = 'YYYY-MM-DDTHH:mm';

interface IValidationError {
  field: 'title' | 'start' | 'end';
  message: string;
}

@Component({
  tag: 'mh-calendar-event-form',
  styleUrl: 'mh-calendar-event-form.css',
  shadow: false,
})
export class MHCalendarEventForm {
  @Prop() event!: IMHCalendarEvent;
  @Prop() isNewEvent: boolean = false;

  @Event() save!: EventEmitter<IMHCalendarEvent>;
  @Event() cancel!: EventEmitter<void>;

  @State() title: string = '';
  @State() description: string = '';
  @State() startDate: string = '';
  @State() endDate: string = '';
  @State() allDay: boolean = false;
  @State() errors: IValidationError[] = [];

  componentWillLoad() {
    this.title = this.event.title ?? '';
    this.description = this.event.description ?? '';
    this.allDay = this.event.allDay ?? false;
    this.startDate = DateUtils.formatDate(this.event.startDate, DATETIME_LOCAL_FORMAT);
    this.endDate = DateUtils.formatDate(this.event.endDate, DATETIME_LOCAL_FORMAT);
  }

  private errorFor(field: IValidationError['field']): string | undefined {
    return this.errors.find((error) => error.field === field)?.message;
  }

  private validate(): IValidationError[] {
    const errors: IValidationError[] = [];

    if (!this.title.trim()) {
      errors.push({ field: 'title', message: 'Title is required.' });
    }

    const startDate = dayjs.tz(this.startDate, store.mainTimezone).toDate();
    const endDate = dayjs.tz(this.endDate, store.mainTimezone).toDate();

    if (isNaN(startDate.getTime())) {
      errors.push({ field: 'start', message: 'Start date is invalid.' });
    }
    if (isNaN(endDate.getTime())) {
      errors.push({ field: 'end', message: 'End date is invalid.' });
    }
    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate >= endDate) {
      errors.push({ field: 'end', message: 'End date must be after start date.' });
    }

    return errors;
  }

  private handleSave = () => {
    const errors = this.validate();
    this.errors = errors;
    if (errors.length > 0) return;

    const updatedEvent: IMHCalendarEvent = {
      ...this.event,
      title: this.title.trim(),
      description: this.description || undefined,
      allDay: this.allDay,
      startDate: dayjs.tz(this.startDate, store.mainTimezone).toDate(),
      endDate: dayjs.tz(this.endDate, store.mainTimezone).toDate(),
    };

    if (this.isNewEvent) {
      EventManager.addEvent(updatedEvent);
    } else {
      EventManager.updateEvent(this.event.id, updatedEvent);
    }

    this.save.emit(updatedEvent);
    store.closeModal();
  };

  private handleCancel = () => {
    this.cancel.emit();
    store.closeModal();
  };

  private handleTitleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.handleSave();
    }
  };

  render() {
    const errorMessages = [...new Set(this.errors.map((error) => error.message))];

    return (
      <div class="mhCalendarEventForm">
        <div class="mhCalendarEventForm__header">
          <h3>{this.isNewEvent ? 'New Event' : 'Edit Event'}</h3>
        </div>
        <div class="mhCalendarEventForm__body">
          <div class="mhCalendarEventForm__field">
            <label>Title:</label>
            <input
              type="text"
              value={this.title}
              placeholder="Enter title"
              class={{ 'mhCalendarEventForm__input--error': !!this.errorFor('title') }}
              onInput={(e) => (this.title = (e.target as HTMLInputElement).value)}
              onKeyDown={this.handleTitleKeydown}
            />
          </div>
          <div class="mhCalendarEventForm__field">
            <label>Description:</label>
            <textarea
              rows={3}
              value={this.description}
              placeholder="Enter description (optional)"
              onInput={(e) => (this.description = (e.target as HTMLTextAreaElement).value)}
            />
          </div>
          <div class="mhCalendarEventForm__field">
            <label>Date and Time:</label>
            <div class="mhCalendarEventForm__datetime">
              <div>
                <label class="mhCalendarEventForm__datetimeLabel">From:</label>
                <input
                  type="datetime-local"
                  value={this.startDate}
                  class={{ 'mhCalendarEventForm__input--error': !!this.errorFor('start') }}
                  onInput={(e) => (this.startDate = (e.target as HTMLInputElement).value)}
                />
              </div>
              <div>
                <label class="mhCalendarEventForm__datetimeLabel">To:</label>
                <input
                  type="datetime-local"
                  value={this.endDate}
                  class={{ 'mhCalendarEventForm__input--error': !!this.errorFor('end') }}
                  onInput={(e) => (this.endDate = (e.target as HTMLInputElement).value)}
                />
              </div>
            </div>
          </div>
          <div class="mhCalendarEventForm__field">
            <label class="mhCalendarEventForm__checkboxLabel">
              <input
                type="checkbox"
                checked={this.allDay}
                onInput={(e) => (this.allDay = (e.target as HTMLInputElement).checked)}
              />
              All Day
            </label>
          </div>
        </div>
        {errorMessages.length > 0 && (
          <div class="mhCalendarEventForm__errors">
            {errorMessages.map((message) => (
              <span>{message}</span>
            ))}
          </div>
        )}
        <div class="mhCalendarEventForm__footer">
          <button
            class="mhCalendarEventForm__button mhCalendarEventForm__button--cancel"
            onClick={this.handleCancel}
          >
            Cancel
          </button>
          <button
            class="mhCalendarEventForm__button mhCalendarEventForm__button--save"
            onClick={this.handleSave}
          >
            Save
          </button>
        </div>
      </div>
    );
  }
}
