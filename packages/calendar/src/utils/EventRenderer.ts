import { IMHCalendarViewType } from '../store/mh-calendar-store.types';
import { EventStyleManager } from './EventStyleManager';
import { DateUtils } from './DateUtils';
import { store, storeState } from '../store/mh-calendar-store';

export class EventRenderer {
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

      // Calculate the new start date based on current drag position on this day
      const newStartDate = DateUtils.getExactDateBasedOnUserPosition(isDraggedOver, day);

      // Calculate event duration in minutes from original event
      const eventDurationInMinutes =
        (draggedEvent.endDate.getTime() - draggedEvent.startDate.getTime()) / (1000 * 60);

      // Calculate new end date based on new start date and original duration
      const newEndDate = new Date(newStartDate.getTime() + eventDurationInMinutes * 60 * 1000);

      // Calculate height using full event duration (not clamped to visible time window)
      const { showTimeFrom = 10, showTimeTo = 24 } = store.state;
      const eventHeight = EventStyleManager.calculateEventHeight(
        newStartDate,
        newEndDate,
        calendarDayElementHeight,
        day,
        showTimeFrom,
        showTimeTo,
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
        height: '40px',
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
