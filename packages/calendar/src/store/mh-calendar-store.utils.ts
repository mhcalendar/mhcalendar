import { DEFAULT_THEME } from '../const/default-theme';
import { IMHCalendarEvent, IMHCalendarConfigBaseStyle } from '../types';
import { IDateRange, IMHCalendarViewType } from './mh-calendar-store.types';

type StylesWithoutProperties = Omit<IMHCalendarConfigBaseStyle, 'properties'>;

export class MHCalendarStoreUtils {
  protected mergeStyles(
    userStyles: Partial<StylesWithoutProperties>,
  ): Partial<IMHCalendarConfigBaseStyle> {
    const mergedStyles: Partial<IMHCalendarConfigBaseStyle> = { ...DEFAULT_THEME };
    (Object.keys(userStyles) as (keyof StylesWithoutProperties)[]).forEach((key) => {
      mergedStyles[key] = { ...userStyles[key], ...mergedStyles[key] };
    });
    return mergedStyles;
  }

  protected calculateEventDuration(event: IMHCalendarEvent): number {
    const differenceInMs = new Date(event.endDate).getTime() - new Date(event.startDate).getTime();
    return differenceInMs / (1000 * 60);
  }

  protected getDatesForWeekView(startDate: Date | string): IDateRange {
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
    shiftplanDays: number = 7,
  ): IDateRange {
    switch (viewType) {
      case IMHCalendarViewType.MONTH: {
        const year = fromDate.getFullYear();
        const month = fromDate.getMonth();
        return { fromDate: new Date(year, month, 1), toDate: new Date(year, month + 1, 0) };
      }
      case IMHCalendarViewType.WEEK:
      case IMHCalendarViewType.AGENDA: {
        const { fromDate: weekFrom, toDate: weekTo } = this.getDatesForWeekView(fromDate);
        return { fromDate: weekFrom, toDate: weekTo };
      }
      case IMHCalendarViewType.SHIFTPLAN: {
        const to = new Date(fromDate);
        to.setDate(fromDate.getDate() + shiftplanDays - 1);
        return { fromDate, toDate: to };
      }
      case IMHCalendarViewType.DAY:
      default:
        return { fromDate, toDate: fromDate };
    }
  }

  protected shiftCalendar(
    by: IMHCalendarViewType,
    fromDate: Date,
    amount: number = 1,
    shiftplanDays: number = 7,
  ): IDateRange {
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
      case IMHCalendarViewType.SHIFTPLAN:
        newFromDate.setDate(newFromDate.getDate() + shiftplanDays * amount);
        break;
      default:
        throw new Error(`Unsupported unit: ${by}`);
    }
    return this.updateDateRangeForViewType(by, newFromDate, shiftplanDays);
  }
}
