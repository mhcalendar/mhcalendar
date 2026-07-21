import { describe, expect, it } from '@stencil/vitest';
import { DEFAULT_WEEK_VIEW_CONFIG } from '../../const/default-config';
import { IMHCalendarFullOptions } from '../../types';
import { ConfigValidator } from './index';
import { ERROR_MESSAGES } from './error-messages';
import { ConfigErrorCodes } from './error-codes';

const validConfig: IMHCalendarFullOptions = DEFAULT_WEEK_VIEW_CONFIG;

describe('ConfigValidator', () => {
  it('accepts the default config', () => {
    expect(new ConfigValidator(validConfig).validateConfig()).toBe(true);
  });

  it('rejects virtualScrollHeight set without fixedHeight', () => {
    const config = { ...validConfig, fixedHeight: undefined, virtualScrollHeight: '400px' };
    expect(() => new ConfigValidator(config).validateConfig()).toThrow(
      ERROR_MESSAGES[ConfigErrorCodes.VIRTUAL_SCROLL_1],
    );
  });

  it('accepts showTimeFrom of 0 (midnight is a valid start hour)', () => {
    const config = { ...validConfig, showTimeFrom: 0 };
    expect(new ConfigValidator(config).validateConfig()).toBe(true);
  });

  it('rejects showTimeTo equal to showTimeFrom', () => {
    const config = { ...validConfig, showTimeFrom: 9, showTimeTo: 9 };
    expect(() => new ConfigValidator(config).validateConfig()).toThrow(
      ERROR_MESSAGES[ConfigErrorCodes.SHOW_TIME_HOURS],
    );
  });

  it('rejects showTimeTo before showTimeFrom', () => {
    const config = { ...validConfig, showTimeFrom: 20, showTimeTo: 4 };
    expect(() => new ConfigValidator(config).validateConfig()).toThrow(
      ERROR_MESSAGES[ConfigErrorCodes.SHOW_TIME_HOURS],
    );
  });

  it('rejects a non-numeric showTimeFrom', () => {
    const config = { ...validConfig, showTimeFrom: undefined as unknown as number };
    expect(() => new ConfigValidator(config).validateConfig()).toThrow(
      ERROR_MESSAGES[ConfigErrorCodes.SHOW_TIME_HOURS],
    );
  });

  it('rejects slot minutes not divisible by 5', () => {
    const config = { ...validConfig, slotInterval: { hours: 1, minutes: 7 } };
    expect(() => new ConfigValidator(config).validateConfig()).toThrow(
      ERROR_MESSAGES[ConfigErrorCodes.SLOT_MINUTES_DIVISIBLE],
    );
  });

  it('rejects an invalid timezone', () => {
    const config = { ...validConfig, timezones: ['Not/A_Real_Zone'] };
    expect(() => new ConfigValidator(config).validateConfig()).toThrow(
      ERROR_MESSAGES[ConfigErrorCodes.TIMEZONES_1],
    );
  });
});
