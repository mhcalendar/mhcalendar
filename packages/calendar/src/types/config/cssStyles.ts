export const CalendarClasses = {
  mhCalendarEvent: 'mhCalendarEvent',
  mhCalendarEventSmall: 'mhCalendarEventSmall',
  mhCalendarEventFull: 'mhCalendarEventFull',
  mhCalendarEventFull__content: 'mhCalendarEventFull__content',
  mhCalendarEventFull__userEventContentHolder: 'mhCalendarEventFull__userEventContentHolder',
  mhCalendarEventFull__content__title: 'mhCalendarEventFull__content__title',
  mhCalendarEventFull__content__date: 'mhCalendarEventFull__content__date',

  mhCalendarHeader: 'mhCalendarHeader',
  mhCalendarHeader__date: 'mhCalendarHeader__date',
  mhCalendarHeader__today: 'mhCalendarHeader__today',

  mhCalendarMonth: 'mhCalendarMonth',

  mhCalendarMultiView__holder: 'mhCalendarMultiView__holder',

  mhCalendar: 'mhCalendar',

  mhCalendarNavigation__container: 'mhCalendarNavigation__container',
  mhCalendarNavigation__viewSwitcher: 'mhCalendarNavigation__viewSwitcher',

  mhCalendarDay: 'mhCalendarDay',
  mhCalendarDay_allDaysEventHolder: 'mhCalendarDay_allDaysEventHolder',
  mhCalendarDay_dayDate: 'mhCalendarDay_dayDate',
  mhCalendarDay__currentTime: 'mhCalendarDay__currentTime',
  mhCalendarDay__eventHolder: 'mhCalendarDay__eventHolder',
  mhCalendarDay__eventsLeftIndicator: 'mhCalendarDay__eventsLeftIndicator',

  mhCalendarWeek__borders: 'mhCalendarWeek__borders',
  mhCalendarWeek__border: 'mhCalendarWeek__border',
  mhCalendarTimeSlots: 'mhCalendarTimeSlots',
  time__holder: 'time__holder',
  gtmInfo: 'gtmInfo',

  mhCalendarMultiView: 'mhCalendarMultiView',
  mhCalendarModal__content: 'mhCalendarModal__content',
  mhCalendarResizeEventHandler: 'mhCalendarResizeEventHandler',
  mhCalendarDay__nonBusinessHours: 'mhCalendarDay__nonBusinessHours',
} as const;

export type CssClass = keyof typeof CalendarClasses;
export type CSSinJS = Record<string, string>;
export type CssStyles = Partial<Record<CssClass, CSSinJS>>;
