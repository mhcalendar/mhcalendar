import { IMHCalendarStoreUserApi } from '../store/mh-calendar-store.user-api';

// Event & data types
export type { IMHCalendarEvent, IMHCalendarDayClickPayload, IMHCalendarDateRange, ICalendarDateRange } from './config/event';

// Config types — internal (for store / implementation use)
export type { ICalendarBaseConfig, IMHCalendarConfigBaseStyle } from './config/base';
export type { ICalendarMultiViewConfig, SlotOption, BusinessHoursConfig } from './config/multiview';
export type { ICalendarWeekConfig, IMHCalendarResource } from './config/week';

// Config types — public (user-facing, all Partial<>)
export type { IMHCalendarConfigBase, MHCalendarTheme } from './config/base';
export type { IMHCalendarConfigBaseMultiViewOptions } from './config/multiview';
export type { IMHCalendarWeekConfig, IMHCalendarFullOptions } from './config/week';

export type UserApi = IMHCalendarStoreUserApi;
