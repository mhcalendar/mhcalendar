import { DEFAULT_THEME } from '../const/default-theme';
import { ICalendarDateRange, IMHCalendarEvent, IMHCalendarConfigBaseStyle } from '../types';
import { IMHCalendarViewType } from './mh-calendar-store.types';

type StylesWithoutProperties = Omit<IMHCalendarConfigBaseStyle, 'properties'>;

export class MHCalendarStoreUtils {
  protected mergeStyles(
    userStyles: Partial<StylesWithoutProperties>,
    baseTheme: IMHCalendarConfigBaseStyle = DEFAULT_THEME,
  ): Partial<IMHCalendarConfigBaseStyle> {
    const mergedStyles: Partial<IMHCalendarConfigBaseStyle> = { ...baseTheme };
    (Object.keys(userStyles) as (keyof StylesWithoutProperties)[]).forEach((key) => {
      mergedStyles[key] = { ...userStyles[key], ...mergedStyles[key] };
    });
    return mergedStyles;
  }

  protected calculateEventDuration(event: IMHCalendarEvent): number {
    const differenceInMs = new Date(event.endDate).getTime() - new Date(event.startDate).getTime();
    return differenceInMs / (1000 * 60);
  }

  protected getDatesForWeekView(startDate: Date | string): ICalendarDateRange {
    const today = new Date(startDate);
    const dayOfWeek = today.getDay();
    const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    const fromDate = new Date(today);
    fromDate.setDate(today.getDate() + diffToMonday);
    const toDate = new Date(fromDate);
    toDate.setDate(fromDate.getDate() + 6);
    return { fromDate, toDate };
  }

  protected updateDateRangeForViewType(
    viewType: IMHCalendarViewType,
    fromDate: Date,
    resourceDays: number = 7,
  ): ICalendarDateRange {
    const anchorDate = new Date(fromDate);
    anchorDate.setHours(0, 0, 0, 0);

    switch (viewType) {
      case IMHCalendarViewType.MONTH: {
        const year = anchorDate.getFullYear();
        const month = anchorDate.getMonth();
        return { fromDate: new Date(year, month, 1), toDate: new Date(year, month + 1, 0) };
      }
      case IMHCalendarViewType.WEEK:
      case IMHCalendarViewType.AGENDA:
        return this.getDatesForWeekView(anchorDate);
      case IMHCalendarViewType.RESOURCE: {
        const to = new Date(anchorDate);
        to.setDate(anchorDate.getDate() + resourceDays - 1);
        return { fromDate: anchorDate, toDate: to };
      }
      case IMHCalendarViewType.DAY:
      default:
        return { fromDate: anchorDate, toDate: anchorDate };
    }
  }

  protected shiftCalendar(
    by: IMHCalendarViewType,
    fromDate: Date,
    amount: number = 1,
    resourceDays: number = 7,
  ): ICalendarDateRange {
    const newFromDate = new Date(fromDate);
    switch (by) {
      case IMHCalendarViewType.DAY:
        newFromDate.setDate(newFromDate.getDate() + amount);
        break;
      case IMHCalendarViewType.AGENDA:
      case IMHCalendarViewType.WEEK:
        newFromDate.setDate(newFromDate.getDate() + 7 * amount);
        break;
      case IMHCalendarViewType.MONTH:
        newFromDate.setMonth(newFromDate.getMonth() + amount);
        break;
      case IMHCalendarViewType.RESOURCE:
        newFromDate.setDate(newFromDate.getDate() + resourceDays * amount);
        break;
      default:
        throw new Error(`Unsupported unit: ${by}`);
    }
    return this.updateDateRangeForViewType(by, newFromDate, resourceDays);
  }
}
