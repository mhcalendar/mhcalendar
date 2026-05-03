export interface IMHCalendarEvent {
  id: string;
  startDate: Date;
  endDate: Date;
  title?: string;
  allDay?: boolean;
  description?: string;
  isHidden?: boolean;
  color?: string;
  resourceId?: string;
  draggingToggle?: boolean;
  [key: string]: unknown;
}

export type IMHCalendarDayClickPayload = {
  date: Date;
  resourceId?: string;
};

export type IMHCalendarDateRange = {
  fromDate?: Date;
  toDate?: Date;
};

export type ICalendarDateRange = {
  fromDate: Date;
  toDate: Date;
};
