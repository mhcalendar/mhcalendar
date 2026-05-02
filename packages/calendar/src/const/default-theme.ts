export const DEFAULT_THEME_COLOR = '#00b536';
export const VIEW_HEADER_HEIGHT = '70px';
export const VIEW_HEIGHT = `calc(100% - ${VIEW_HEADER_HEIGHT})`;
export const NAVIGATION_HEIGHT = '20%';
export const CALENDAR_HEIGHT = `calc(100% - ${NAVIGATION_HEIGHT})`;

export const DEFAULT_THEME = {
  properties: {
    timeSlotWidth: '70px',
    bordersColor: '#eaeaeaff',
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
    calendarNavigationHeight: '20%',
  },
};
