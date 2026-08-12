import { MONTH_EVENT_HEIGHT, RESOURCE_CELL_GAP, RESOURCE_CELL_PADDING } from '../const/default-theme';

export class ResourceRowHeightUtils {
  /**
   * How many event rows fit in a resource cell of the given fixed height before the
   * "+N more" indicator kicks in.
   */
  static getMaxVisibleEvents(rowHeight: number): number {
    const verticalPadding = RESOURCE_CELL_PADDING * 2;
    const available = rowHeight - verticalPadding + RESOURCE_CELL_GAP;

    return Math.max(1, Math.floor(available / (MONTH_EVENT_HEIGHT + RESOURCE_CELL_GAP)));
  }
}
