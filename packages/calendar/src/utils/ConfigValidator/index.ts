import dayjs from 'dayjs';
import '../../global/global';
import { IMHCalendarFullOptions } from '../../types';
import { ConfigErrorCodes } from './error-codes';
import { ERROR_MESSAGES } from './error-messages';
import { WARNING_MESSAGES } from './warning-messages';
import { WarningCodes } from './warning-codes';

type ValidationRule = {
  name: string;
  validate: (config: IMHCalendarFullOptions) => boolean;
  errorCode?: ConfigErrorCodes;
};

export class ConfigValidator {
  private rules: ValidationRule[];

  constructor(private config: IMHCalendarFullOptions) {
    this.rules = [
      {
        name: 'VIRTUAL_SCROLL',
        validate: ({ fixedHeight, virtualScrollHeight }) =>
          !((!!virtualScrollHeight && !fixedHeight) || (!virtualScrollHeight && !!fixedHeight)),
        errorCode: ConfigErrorCodes.VIRTUAL_SCROLL_1,
      },
      {
        name: 'SHOW_TIME_HOURS',
        validate: ({ showTimeFrom, showTimeTo }) => showTimeFrom !== 0 && showTimeTo !== 0,
        errorCode: ConfigErrorCodes.SHOW_TIME_HOURS,
      },
      {
        name: 'SLOT_TIME_HOURS',
        validate: ({ slotInterval, hoursSlotInterval }) => {
          if (!slotInterval && !hoursSlotInterval) return true;

          if (typeof slotInterval === 'object') {
            return slotInterval.hasOwnProperty('hours') && slotInterval.hasOwnProperty('minutes');
          }

          if (typeof hoursSlotInterval === 'object') {
            return (
              hoursSlotInterval.hasOwnProperty('hours') &&
              hoursSlotInterval.hasOwnProperty('minutes')
            );
          }

          return false;
        },
        errorCode: ConfigErrorCodes.SLOT_TIME_HOURS,
      },
      {
        name: 'SLOT_MINUTES_DIVISIBLE',
        validate: ({ slotInterval, hoursSlotInterval }) => {
          const isValidMinutes = (minutes: number | undefined) =>
            minutes === undefined || minutes % 5 === 0;
          return (
            isValidMinutes(slotInterval?.minutes) && isValidMinutes(hoursSlotInterval?.minutes)
          );
        },
        errorCode: ConfigErrorCodes.SLOT_MINUTES_DIVISIBLE,
      },
      {
        name: 'TIMEZONES_VALIDATOR',
        validate: ({ timezones }) => {
          if (!timezones || !Array.isArray(timezones)) return false;

          let timezonesToValidate = timezones;

          const TIMEZONE_AMOUNT_MAX = 3;
          if (timezonesToValidate.length > TIMEZONE_AMOUNT_MAX) {
            timezonesToValidate = timezones.slice(0, 3);
            console.warn(WARNING_MESSAGES[WarningCodes.TIMEZONE_LIMIT_EXCEEDED]);
          }

          return timezonesToValidate.every((tz) => {
            if (!tz || typeof tz !== 'string') return false;
            try {
              dayjs().tz(tz);
              return true;
            } catch {
              return false;
            }
          });
        },
        errorCode: ConfigErrorCodes.TIMEZONES_1,
      },
    ];
  }

  public validateConfig(): boolean {
    for (const rule of this.rules) {
      if (!rule.validate(this.config)) {
        if (rule.errorCode) {
          throw new Error(ERROR_MESSAGES[rule.errorCode]);
        }
      }
    }
    return true;
  }
}
