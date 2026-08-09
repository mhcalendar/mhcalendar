import { describe, expect, it } from '@stencil/vitest';
import { ResourceRowHeightUtils } from './ResourceRowHeightUtils';
import { DEFAULT_RESOURCE_ROW_HEIGHT } from '../const/default-theme';

describe('ResourceRowHeightUtils', () => {
  describe('getMaxVisibleEvents', () => {
    it('fits exactly 2 events at the default row height', () => {
      expect(ResourceRowHeightUtils.getMaxVisibleEvents(DEFAULT_RESOURCE_ROW_HEIGHT)).toBe(2);
    });

    it('fits more events as the row height grows', () => {
      expect(ResourceRowHeightUtils.getMaxVisibleEvents(108)).toBe(4);
    });

    it('never returns less than 1, even for a very small row height', () => {
      expect(ResourceRowHeightUtils.getMaxVisibleEvents(1)).toBe(1);
    });
  });
});
