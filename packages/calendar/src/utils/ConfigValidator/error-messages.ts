import { ConfigErrorCodes } from './error-codes';

export const ERROR_MESSAGES = {
  [ConfigErrorCodes.VIRTUAL_SCROLL_1]:
    'Both fixedHeight and virtualScrollHeight must be set for virtual scrolling to work.',
  [ConfigErrorCodes.SHOW_TIME_HOURS]:
    'showTimeFrom and showTimeTo must be numbers between 0 and 24, with showTimeTo greater than showTimeFrom',
  [ConfigErrorCodes.SLOT_TIME_HOURS]: 'Need to have correct shape',
  [ConfigErrorCodes.SLOT_MINUTES_DIVISIBLE]:
    'slotInterval.minutes and hoursSlotInterval.minutes must be divisible by 5 (e.g. 0, 5, 10, 15, 30)',
  [ConfigErrorCodes.TIMEZONES_1]: 'Timezones were given with wrong format. Use e.g "Europe/Warsaw"',
};
