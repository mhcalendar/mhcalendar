import { IMHCalendarViewType } from '../store/mh-calendar-store.types';
import { EventStyleManager } from './EventStyleManager';
import { DateUtils } from './DateUtils';
import { storeState } from '../store/mh-calendar-store';

export class EventRenderer {
  /**
   * Recalculates the dragged event's start/end based on the current drag position,
   * preserving its original duration. Shared by the preview's position/size styling
   * and by the event content itself, so the displayed time label stays in sync with
   * where the event is currently hovering instead of showing its pre-drag time.
   */
  static getDraggedEventPreviewDates(
    isDraggedOver: number | null,
    day: Date | undefined,
  ): { newStartDate: Date; newEndDate: Date } | null {
    const draggedEvent = storeState.draggedEvent;
    if (!draggedEvent || !day || isDraggedOver === null) {
      return null;
    }

    const newStartDate = DateUtils.getExactDateBasedOnUserPosition(isDraggedOver, day);

    const eventDurationInMinutes =
      (draggedEvent.endDate.getTime() - draggedEvent.startDate.getTime()) / (1000 * 60);

    const newEndDate = new Date(newStartDate.getTime() + eventDurationInMinutes * 60 * 1000);

    return { newStartDate, newEndDate };
  }

  static getEventHolderStyle(
    eventTopPosition: number,
    positionStyle: any,
    viewType: IMHCalendarViewType | undefined,
  ): any {
    if (!viewType) return;

    const isTimeView = [IMHCalendarViewType.DAY, IMHCalendarViewType.WEEK].includes(viewType);

    if (isTimeView) {
      return {
        position: 'absolute',
        left: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        top: `${eventTopPosition}px`,
        ...positionStyle,
        // Ensure z-index is applied for overlapping mode
        zIndex: positionStyle?.zIndex || 1,
      };
    }

    // For month view: ensure fixed height and no overflow
    return {
      height: 'var(--monthEventHeight)',
      width: '100%',
      flexShrink: 0,
      overflow: 'hidden',
    };
  }

  static getStylesForDraggedEvent(
    isDraggedOver: number | null,
    isDraggedOverBlocked: boolean,
    day: Date | undefined,
    calendarDayElementHeight: number | undefined,
    viewType: IMHCalendarViewType | undefined,
  ): any {
    if (!viewType) return;

    const isTimeView = [IMHCalendarViewType.DAY, IMHCalendarViewType.WEEK].includes(viewType);

    let baseStyle: any;

    if (isTimeView) {
      const draggedEvent = storeState.draggedEvent;
      if (!draggedEvent || !day || !calendarDayElementHeight || isDraggedOver === null) {
        return {};
      }

      const draggedDates = this.getDraggedEventPreviewDates(isDraggedOver, day);
      if (!draggedDates) {
        return {};
      }
      const { newStartDate, newEndDate } = draggedDates;

      // Calculate height using full event duration (not clamped to visible time window)
      const eventHeight = EventStyleManager.calculateEventHeight(
        newStartDate,
        newEndDate,
        calendarDayElementHeight,
        day,
        true, // useFullDuration = true for dragged events
      );

      baseStyle = {
        width: '100%',
        position: 'absolute',
        top: `${isDraggedOver}px`,
        height: eventHeight,
        zIndex: 9999,
      };
    } else {
      baseStyle = {
        width: '100%',
        zIndex: 9999,
        position: 'relative',
      };
    }

    // Add visual indicator if blocked by business hours
    if (isDraggedOverBlocked) {
      return {
        ...baseStyle,
        opacity: '0.5',
        border: '2px dashed red',
        pointerEvents: 'none',
        cursor: 'not-allowed',
      };
    }

    return baseStyle;
  }
}
