import { IMHCalendarConfigBaseStyle } from '../types';
import { ConfigCSSProperites } from '../types/config/properties';

export const DEFAULT_THEME_COLOR = '#8a79ff';
export const VIEW_HEADER_HEIGHT = '60px';
export const VIEW_HEIGHT = `calc(100% - ${VIEW_HEADER_HEIGHT})`;
export const NAVIGATION_HEIGHT = '20%';
export const CALENDAR_HEIGHT = `calc(100% - ${NAVIGATION_HEIGHT})`;
export const CALENDAR_BACKGROUND_COLOR = '#14141a';

const DEFAULT_PROPERTIES: ConfigCSSProperites = {
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
  monthEventHeight: '20px',
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

export const DEFAULT_THEME: IMHCalendarConfigBaseStyle = {
  properties: DEFAULT_PROPERTIES,
  styles: {},
};
