import dayjs from 'dayjs';
import { storeState } from '../store/mh-calendar-store';
import { IMHCalendarViewType } from '../types/enums';
import { DateUtils } from './DateUtils';

export class LabelUtils {
  static today(): string {
    return storeState.labels?.today ?? 'Today';
  }

  static moreEvents(hiddenCount: number): string {
    return storeState.labels?.moreEvents?.(hiddenCount) ?? `+${hiddenCount} more`;
  }

  static viewName(viewType: IMHCalendarViewType): string {
    return (
      storeState.labels?.views?.[viewType] ?? viewType.charAt(0) + viewType.slice(1).toLowerCase()
    );
  }

  static dateLabel(date: Date): string {
    const target = dayjs(date).locale(storeState.locale);
    const today = dayjs();

    if (target.isSame(today, 'day')) return LabelUtils.today();
    if (target.isSame(today.add(1, 'day'), 'day')) return storeState.labels?.tomorrow ?? 'Tomorrow';
    if (target.isSame(today.subtract(1, 'day'), 'day'))
      return storeState.labels?.yesterday ?? 'Yesterday';
    if (target.isSame(today, 'week')) return DateUtils.formatDate(date, 'dddd');

    return DateUtils.formatDate(date, 'MMMM D, YYYY');
  }

  static noEvents(): string {
    return storeState.labels?.noEvents ?? 'No events scheduled';
  }

  static untitledEvent(): string {
    return storeState.labels?.untitledEvent ?? 'Untitled Event';
  }

  static defaultEventTitle(): string {
    return storeState.labels?.defaultEventTitle ?? 'New Event';
  }

  static noResources(): string {
    return storeState.labels?.noResources ?? 'No resources configured';
  }

  static newEventTitle(): string {
    return storeState.labels?.newEventTitle ?? 'New Event';
  }

  static editEventTitle(): string {
    return storeState.labels?.editEventTitle ?? 'Edit Event';
  }

  static titleFieldLabel(): string {
    return storeState.labels?.titleFieldLabel ?? 'Title:';
  }

  static titlePlaceholder(): string {
    return storeState.labels?.titlePlaceholder ?? 'Enter title';
  }

  static descriptionFieldLabel(): string {
    return storeState.labels?.descriptionFieldLabel ?? 'Description:';
  }

  static descriptionPlaceholder(): string {
    return storeState.labels?.descriptionPlaceholder ?? 'Enter description (optional)';
  }

  static dateTimeFieldLabel(): string {
    return storeState.labels?.dateTimeFieldLabel ?? 'Date and Time:';
  }

  static fromLabel(): string {
    return storeState.labels?.fromLabel ?? 'From:';
  }

  static toLabel(): string {
    return storeState.labels?.toLabel ?? 'To:';
  }

  static allDayLabel(): string {
    return storeState.labels?.allDayLabel ?? 'All Day';
  }

  static cancelButton(): string {
    return storeState.labels?.cancelButton ?? 'Cancel';
  }

  static saveButton(): string {
    return storeState.labels?.saveButton ?? 'Save';
  }

  static titleRequiredError(): string {
    return storeState.labels?.titleRequiredError ?? 'Title is required.';
  }

  static startDateInvalidError(): string {
    return storeState.labels?.startDateInvalidError ?? 'Start date is invalid.';
  }

  static endDateInvalidError(): string {
    return storeState.labels?.endDateInvalidError ?? 'End date is invalid.';
  }

  static endBeforeStartError(): string {
    return storeState.labels?.endBeforeStartError ?? 'End date must be after start date.';
  }
}
