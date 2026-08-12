import { afterEach, describe, expect, it } from '@stencil/vitest';
import dayjs from 'dayjs';
import '../global/global';
import { LabelUtils } from './LabelUtils';
import { store } from '../store/mh-calendar-store';
import { IMHCalendarViewType } from '../types/enums';

describe('LabelUtils', () => {
  const originalLabels = store.state.labels;

  afterEach(() => {
    store.state.labels = originalLabels;
  });

  describe('today', () => {
    it('defaults to "Today"', () => {
      store.state.labels = undefined;
      expect(LabelUtils.today()).toBe('Today');
    });

    it('uses the configured override', () => {
      store.state.labels = { today: 'Dzisiaj' };
      expect(LabelUtils.today()).toBe('Dzisiaj');
    });
  });

  describe('dateLabel', () => {
    it('returns the "Today" label for the current day', () => {
      store.state.labels = undefined;
      expect(LabelUtils.dateLabel(new Date())).toBe('Today');
    });

    it('returns the "Tomorrow" label for the next day', () => {
      store.state.labels = undefined;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(LabelUtils.dateLabel(tomorrow)).toBe('Tomorrow');
    });

    it('uses the configured override for "Tomorrow"', () => {
      store.state.labels = { tomorrow: 'Jutro' };
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(LabelUtils.dateLabel(tomorrow)).toBe('Jutro');
    });

    it('returns the "Yesterday" label for the previous day', () => {
      store.state.labels = undefined;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(LabelUtils.dateLabel(yesterday)).toBe('Yesterday');
    });

    it('uses the configured override for "Yesterday"', () => {
      store.state.labels = { yesterday: 'Wczoraj' };
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(LabelUtils.dateLabel(yesterday)).toBe('Wczoraj');
    });

    it('returns the day name for dates outside today/tomorrow/yesterday but within the current week', () => {
      store.state.labels = undefined;
      const today = new Date();
      const inFiveDays = new Date(today);
      inFiveDays.setDate(today.getDate() + 5);

      const isSameWeek = dayjs(inFiveDays).isSame(dayjs(today), 'week');

      if (isSameWeek) {
        expect(LabelUtils.dateLabel(inFiveDays)).toBe(dayjs(inFiveDays).format('dddd'));
      }
    });

    it('returns "MMMM D, YYYY" for dates outside the current week', () => {
      store.state.labels = undefined;
      const farAway = new Date('2020-01-15T12:00:00Z');
      expect(LabelUtils.dateLabel(farAway)).toBe('January 15, 2020');
    });
  });

  describe('moreEvents', () => {
    it('defaults to "+N more"', () => {
      store.state.labels = undefined;
      expect(LabelUtils.moreEvents(3)).toBe('+3 more');
    });

    it('uses the configured override', () => {
      store.state.labels = { moreEvents: (count) => `${count} więcej` };
      expect(LabelUtils.moreEvents(5)).toBe('5 więcej');
    });
  });

  describe('viewName', () => {
    it('defaults to a title-cased view type', () => {
      store.state.labels = undefined;
      expect(LabelUtils.viewName(IMHCalendarViewType.MONTH)).toBe('Month');
    });

    it('uses the configured override for a specific view', () => {
      store.state.labels = { views: { MONTH: 'Mois' } };
      expect(LabelUtils.viewName(IMHCalendarViewType.MONTH)).toBe('Mois');
    });

    it('falls back to title-case for views without an override', () => {
      store.state.labels = { views: { MONTH: 'Mois' } };
      expect(LabelUtils.viewName(IMHCalendarViewType.WEEK)).toBe('Week');
    });
  });

  describe('simple string labels', () => {
    const cases: [keyof typeof LabelUtils, string, string, string][] = [
      ['noEvents', 'noEvents', 'No events scheduled', 'Brak wydarzeń'],
      ['untitledEvent', 'untitledEvent', 'Untitled Event', 'Wydarzenie bez tytułu'],
      ['defaultEventTitle', 'defaultEventTitle', 'New Event', 'Nowe wydarzenie'],
      ['noResources', 'noResources', 'No resources configured', 'Brak skonfigurowanych zasobów'],
      ['newEventTitle', 'newEventTitle', 'New Event', 'Nowe wydarzenie'],
      ['editEventTitle', 'editEventTitle', 'Edit Event', 'Edytuj wydarzenie'],
      ['titleFieldLabel', 'titleFieldLabel', 'Title:', 'Tytuł:'],
      ['titlePlaceholder', 'titlePlaceholder', 'Enter title', 'Wpisz tytuł'],
      ['descriptionFieldLabel', 'descriptionFieldLabel', 'Description:', 'Opis:'],
      [
        'descriptionPlaceholder',
        'descriptionPlaceholder',
        'Enter description (optional)',
        'Wpisz opis (opcjonalnie)',
      ],
      ['dateTimeFieldLabel', 'dateTimeFieldLabel', 'Date and Time:', 'Data i godzina:'],
      ['fromLabel', 'fromLabel', 'From:', 'Od:'],
      ['toLabel', 'toLabel', 'To:', 'Do:'],
      ['allDayLabel', 'allDayLabel', 'All Day', 'Cały dzień'],
      ['cancelButton', 'cancelButton', 'Cancel', 'Anuluj'],
      ['saveButton', 'saveButton', 'Save', 'Zapisz'],
      ['titleRequiredError', 'titleRequiredError', 'Title is required.', 'Tytuł jest wymagany.'],
      [
        'startDateInvalidError',
        'startDateInvalidError',
        'Start date is invalid.',
        'Data rozpoczęcia jest nieprawidłowa.',
      ],
      [
        'endDateInvalidError',
        'endDateInvalidError',
        'End date is invalid.',
        'Data zakończenia jest nieprawidłowa.',
      ],
      [
        'endBeforeStartError',
        'endBeforeStartError',
        'End date must be after start date.',
        'Data zakończenia musi być późniejsza niż data rozpoczęcia.',
      ],
    ];

    it.each(cases)('%s defaults to the English fallback', (method, _key, defaultValue) => {
      store.state.labels = undefined;
      expect((LabelUtils[method] as () => string)()).toBe(defaultValue);
    });

    it.each(cases)('%s uses the configured override', (method, key, _defaultValue, override) => {
      store.state.labels = { [key]: override };
      expect((LabelUtils[method] as () => string)()).toBe(override);
    });
  });
});
