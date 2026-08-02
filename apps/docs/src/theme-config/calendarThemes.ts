export const boldTheme: Record<string, any> = {
  properties: {
    eventBackgroundColor: '#111111',
    bordersColor: '#111111',
    headerTodayBackgroundColor: '#111111',
    currentTimeColor: '#FF2D55',
    eventTimeLabelBg: '#FFDD00',
    eventTimeLabelColor: '#111111',
  },
  mhCalendar: { backgroundColor: '#FFDD00', fontFamily: "'Courier New', monospace" },
};

// Modeled after Microsoft Teams' dark calendar view: deep purple-grey
// background, indigo event blocks, and the Teams brand purple for accents.
export const corporateTheme: Record<string, any> = {
  properties: {
    mainBackgroundColor: '#201F28',
    navigationBackgroundColor: '#252430',
    eventBackgroundColor: '#3B3A56',
    bordersColor: '#3A3A46',
    headerTodayBackgroundColor: '#6264A7',
    currentTimeColor: '#7B83EB',
    eventTimeLabelBg: '#2A2938',
    eventTimeLabelColor: '#E1E1E6',
    eventTimeDiffColor: '#7B83EB',
    fontColor: '#E1E1E6',
    dateFontColor: '#8B8B9E',
    buttonsColor: '#5B5FC7',
    holidayDateColor: '#E1E1E6',
  },
};

// Modeled after Google Calendar's light view: white background, thin grey
// grid lines, Google blue events, and the Google red current-time indicator.
export const minimalTheme: Record<string, any> = {
  properties: {
    mainBackgroundColor: '#ffffff',
    navigationBackgroundColor: '#ffffff',
    eventBackgroundColor: '#1a73e8',
    bordersColor: '#e0e0e0',
    headerTodayBackgroundColor: '#1a73e8',
    currentTimeColor: '#ea4335',
    eventTimeLabelBg: '#ffffff',
    eventTimeLabelColor: '#3c4043',
    eventTimeDiffColor: '#1a73e8',
    fontColor: '#3c4043',
    dateFontColor: '#70757a',
    buttonsColor: '#f1f3f4',
    holidayDateColor: '#d93025',
  },
};

