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
}
