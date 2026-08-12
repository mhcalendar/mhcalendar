import { IMHCalendarConfigBaseStyle } from '../types';
import { ConfigCSSProperites } from '../types/config/properties';

export const DEFAULT_THEME_COLOR = '#8a79ff';
export const VIEW_HEADER_HEIGHT = '70px';
export const VIEW_HEIGHT = `calc(100% - ${VIEW_HEADER_HEIGHT})`;
export const NAVIGATION_HEIGHT = '20%';
export const CALENDAR_HEIGHT = `calc(100% - ${NAVIGATION_HEIGHT})`;
export const CALENDAR_BACKGROUND_COLOR = '#14141a';
export const MONTH_EVENT_HEIGHT = 20;
export const ALL_DAY_EVENT_GAP = 3;
export const ALL_DAY_CONTAINER_PADDING = 4;
export const ALL_DAY_MIN_HEIGHT = 40;
// Must match the gap/padding used by .mhCalendarDay__eventsContainer's inline style
// (month-view-events.tsx) so MonthViewCalculator's fit calculation stays accurate.
export const MONTH_VIEW_EVENTS_GAP = 2;
export const MONTH_VIEW_EVENTS_PADDING = 2;
// Must match .mhCalendarResource__cell's gap/padding so ResourceRowHeightUtils' fit
// calculation stays accurate.
export const RESOURCE_CELL_GAP = 2;
export const RESOURCE_CELL_PADDING = 4;
// Fits exactly 2 events by default, matching the view's previous fixed capacity.
export const DEFAULT_RESOURCE_ROW_HEIGHT = 55;
export const DEFAULT_RESOURCE_LABEL_COLUMN_WIDTH = 160;

const DARK_PROPERTIES: ConfigCSSProperites = {
  timeSlotWidth: '60px',
  eventBackgroundColor: DEFAULT_THEME_COLOR,
  /*
   Set to undefined at purpose as user may want 
   to match resize handle style with event color
   */
  eventResizeHandleColor: undefined,
  eventTimeLabelBg: '#fff',
  eventTimeLabelColor: '#222',
  eventTimeDiffColor: '#3578fa',
  eventHoverFilter: 'brightness(0.88)',
  nonBusinessHoursOverlayColor: 'rgba(0, 0, 0, 0.03)',
  headerTodayBackgroundColor: DEFAULT_THEME_COLOR,
  currentTimeColor: '#db372d',
  monthEventHeight: `${MONTH_EVENT_HEIGHT}px`,
  viewHeaderHeight: VIEW_HEADER_HEIGHT,
  calendarNavigationHeight: '80px',

  mainBackgroundColor: '#131314',
  navigationBackgroundColor: '#1b1b1b',
  fontColor: '#d4d4d4',
  fontFamily: 'system-ui',
  dateFontColor: '#82828e',
  bordersColor: '#2a2a36',
  buttonsColor: '#232323',
  holidayDateColor: '#8a2929',
};

const LIGHT_PROPERTIES: ConfigCSSProperites = {
  timeSlotWidth: '60px',
  eventBackgroundColor: DEFAULT_THEME_COLOR,
  eventResizeHandleColor: undefined,
  eventTimeLabelBg: '#fff',
  eventTimeLabelColor: '#222',
  eventTimeDiffColor: '#3578fa',
  eventHoverFilter: 'brightness(0.92)',
  nonBusinessHoursOverlayColor: 'rgba(0, 0, 0, 0.04)',
  headerTodayBackgroundColor: DEFAULT_THEME_COLOR,
  currentTimeColor: '#db372d',
  monthEventHeight: `${MONTH_EVENT_HEIGHT}px`,
  viewHeaderHeight: VIEW_HEADER_HEIGHT,
  calendarNavigationHeight: '80px',

  mainBackgroundColor: '#ffffff',
  navigationBackgroundColor: '#f5f5f7',
  fontColor: '#1a1a1a',
  fontFamily: 'system-ui',
  dateFontColor: '#6e6e80',
  bordersColor: '#e2e2e8',
  buttonsColor: '#ebebef',
  holidayDateColor: '#c0392b',
};

export const DEFAULT_THEME: IMHCalendarConfigBaseStyle = {
  properties: DARK_PROPERTIES,
  styles: {},
};

export const LIGHT_THEME: IMHCalendarConfigBaseStyle = {
  properties: LIGHT_PROPERTIES,
  styles: {},
};

export const THEMES: Record<string, IMHCalendarConfigBaseStyle> = {
  dark: DEFAULT_THEME,
  light: LIGHT_THEME,
};
