import { afterEach, describe, expect, it } from '@stencil/vitest';
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
});
