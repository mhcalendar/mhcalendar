import { storeState } from '../store/mh-calendar-store';
import { IMHCalendarViewType } from '../types/enums';

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
}
