import dayjs from 'dayjs';
import {
  MILLISECONDS_IN_HOUR,
  MINUTES_IN_HOUR,
} from '../components/mh-calendar-day/mh-calendar-day.const';
import { store, storeState } from '../store/mh-calendar-store';
import { IMHCalendarViewType } from '../store/mh-calendar-store.types';
import { IMHCalendarEvent } from '../types';
import { EventUtils } from './EventUtils';

const DEFAULT_EVENT_WIDTH = 100; // 100%
const EVENT_MARGIN = 2; // pixels

export class EventStyleManager {
  static getEventColor(event?: { color?: string }): string {
    return event?.color || storeState.properties.eventBackgroundColor;
  }

  /**
   * Computes the inline style for an event's container element across all view types
   * (month/week/day, regular and dragged-preview variants).
   */
  static getEventStyle(
    event: IMHCalendarEvent,
    viewType: IMHCalendarViewType,
    isDragged: boolean,
    dayHeight?: number,
    dayOfRendering?: Date,
  ): any {
    const eventColor = this.getEventColor(event);

    // RESOURCE view has no fixed time axis — each event fills its host, and the host tags
    // equally divide the cell's height via flex (see mh-calendar-resource-view.css).
    if (viewType === IMHCalendarViewType.RESOURCE) {
      return {
        height: '100%',
        width: '100%',
        opacity: '1',
        padding: '3px',
        fontSize: '10px',
        backgroundColor: eventColor,
      };
    }

    // When dragged in a time-slot view, ensure full opacity for the preview (original item fades
    // separately) and let it fill the precisely-sized holder positioned by EventRenderer.
    if (isDragged && !event.allDay && [IMHCalendarViewType.DAY, IMHCalendarViewType.WEEK].includes(viewType)) {
      return {
        height: '100%',
        width: '100%',
        position: 'relative',
        opacity: '1',
        borderRadius: '5px', // Ensure border radius is visible
        overflow: 'hidden', // Ensure content stays within rounded corners
        background: eventColor,
        ...store.getInlineStyleForClass('mhCalendarEvent'),
      };
    }

    // Dragged all-day preview should also be fully opaque and match regular styling
    if (isDragged && event.allDay) {
      return {
        height: 'var(--monthEventHeight)',
        width: '100%',
        opacity: '1',
        padding: '3px',
        fontSize: '10px',
        backgroundColor: eventColor,
      };
    }

    const shouldEventHaveCustomHeight =
      [IMHCalendarViewType.WEEK, IMHCalendarViewType.DAY].includes(viewType) && !event.allDay;

    if (shouldEventHaveCustomHeight) {
      const height = dayHeight
        ? this.calculateEventHeight(event.startDate, event.endDate, dayHeight, dayOfRendering, isDragged)
        : undefined;

      return {
        height,
        maxHeight: height,
        background: eventColor,
        position: 'relative',
      };
    }

    return {
      height: 'var(--monthEventHeight)',
      width: '100%',
      opacity: '1',
      padding: '3px',
      fontSize: '10px',
      backgroundColor: eventColor,
    };
  }

  /**
   * Calculates optimal width and position for overlapping events (side-by-side mode)
   * Based on the maximum number of events that overlap at any given time.
   */
  static calculateEventWidth(
    events: IMHCalendarEvent[],
    currentEventIndex: number,
    columnAssignments: Map<string, number>,
  ) {
    if (events.length === 1) {
      return {
        width: `${DEFAULT_EVENT_WIDTH}%`,
        left: '0%',
        marginLeft: '0px',
        zIndex: 1,
      };
    }

    const currentEvent = events[currentEventIndex];
    const currentEventColumn = columnAssignments.get(currentEvent.id) || 0;

    // Find overlapping events (including self) and determine local column count
    const overlappingEvents = events.filter((event) =>
      EventUtils.areEventsOverlapping(currentEvent, event),
    );
    let localColumnCount = 0;
    for (const event of overlappingEvents) {
      const col = columnAssignments.get(event.id) || 0;
      if (col + 1 > localColumnCount) {
        localColumnCount = col + 1;
      }
    }
    localColumnCount = Math.max(localColumnCount, 1);

    // Calculate width based on local column count (not global max)
    const totalMarginSpace = EVENT_MARGIN * (localColumnCount - 1);
    const availableWidth = DEFAULT_EVENT_WIDTH - (totalMarginSpace / window.innerWidth) * 100;
    const eventWidth = availableWidth / localColumnCount;

    // Calculate left position based on the event's column
    const leftPosition =
      eventWidth * currentEventColumn +
      ((EVENT_MARGIN * currentEventColumn) / window.innerWidth) * 100;

    return {
      width: `calc(${eventWidth}% - 2px)`, // -2 is margin to event not touching
      left: `${leftPosition}%`,
      marginLeft: '0px',
      zIndex: 1,
    };
  }

  /**
   * Calculates width and position for overlapping events (overlapping mode)
   * Ordering rules:
   * 1) Earlier start time => smaller z-index and closer to the left
   * 2) If same start time => longer duration => smaller z-index and closer to the left
   */
  static calculateEventWidthOverlapping(events: IMHCalendarEvent[], currentEventIndex: number) {
    const currentEvent = events[currentEventIndex];

    // Find all events that overlap with the current event
    const overlappingEvents = events.filter((event) =>
      EventUtils.areEventsOverlapping(currentEvent, event),
    );

    // Group events by same start time (within 1 minute tolerance)
    const TOLERANCE_MS = 60 * 1000; // 1 minute
    const eventsWithSameStartTime = overlappingEvents.filter((event) => {
      const timeDiff = Math.abs(event.startDate.getTime() - currentEvent.startDate.getTime());
      return timeDiff < TOLERANCE_MS;
    });

    // Sort to determine BASE LEFT OFFSET order:
    // 1) earlier start first
    // 2) same start -> longer duration first (longer sits further left)
    const sortedForLeftOffset = overlappingEvents.sort((a, b) => {
      const startDiff = a.startDate.getTime() - b.startDate.getTime();
      if (startDiff !== 0) return startDiff; // earlier first

      const durationA = a.endDate.getTime() - a.startDate.getTime();
      const durationB = b.endDate.getTime() - b.startDate.getTime();
      if (durationA !== durationB) return durationB - durationA; // longer first

      return a.id.localeCompare(b.id);
    });

    // z-index MUST be monotonic with left offset to avoid a lower layer being more to the right
    // Therefore, use the same ordering as for left offset: earlier first, for same start longer first
    const zIndexPosition = sortedForLeftOffset.findIndex((event) => event.id === currentEvent.id);
    // Higher index (further right) => higher z-index (on top)
    const zIndex = zIndexPosition + 1; // 1..N

    // Calculate offset and width
    let offset: number | string = 0;
    let width = DEFAULT_EVENT_WIDTH;

    // Check if there are events starting at the same time (for percentage-based offset)
    const hasSameStartTime = eventsWithSameStartTime.length > 1;

    if (hasSameStartTime) {
      // If events start at the same time, use percentage-based offset with decreasing width
      // Sort events with same start time by duration: LONGEST first (descending)
      // Longest event gets left = 0%, shorter events are shifted right
      const sortedSameStart = eventsWithSameStartTime.sort((a, b) => {
        const durationA = a.endDate.getTime() - a.startDate.getTime();
        const durationB = b.endDate.getTime() - b.startDate.getTime();
        if (durationA !== durationB) return durationB - durationA; // Longer first (descending)
        // If same duration, sort by id for consistency
        return a.id.localeCompare(b.id);
      });

      // Find the position of current event among events with same start time
      const positionInSameStart = sortedSameStart.findIndex(
        (event) => event.id === currentEvent.id,
      );

      // Calculate offset and width for events starting at the same time
      // Position 0 (longest event): left = 0%, width = 100%
      // Position 1+ (shorter events): shifted right by ~8% each, width decreases by ~6% each
      const OFFSET_STEP = 8; // Percentage shift for each shorter event
      const WIDTH_SCALE = 0.94; // Each shorter event is 94% width of the previous

      offset = `${positionInSameStart * OFFSET_STEP}%`;
      width = DEFAULT_EVENT_WIDTH * Math.pow(WIDTH_SCALE, positionInSameStart);
    } else {
      // For overlapping events with different start times:
      // earlier/longer should be closer to left.
      const PIXEL_OFFSET_STEP = 5;
      const positionByLeftOrder = sortedForLeftOffset.findIndex(
        (event) => event.id === currentEvent.id,
      );
      offset = `${positionByLeftOrder * PIXEL_OFFSET_STEP}px`;
    }

    return {
      width: `${width}%`,
      left: typeof offset === 'string' ? offset : `${offset}%`,
      marginLeft: '0px',
      zIndex: zIndex,
    };
  }

  /**
   * Calculates the maximum number of events that overlap at any given time
   */
  static calculateMaxConcurrentEvents(events: IMHCalendarEvent[]): number {
    if (events.length <= 1) return events.length;

    // Create time points for start and end of each event
    const timePoints: {
      time: number;
      type: 'start' | 'end';
      eventId: string;
    }[] = [];

    events.forEach((event) => {
      timePoints.push(
        { time: event.startDate.getTime(), type: 'start', eventId: event.id },
        { time: event.endDate.getTime(), type: 'end', eventId: event.id },
      );
    });

    // Sort time points by time, with 'start' before 'end' for same time
    timePoints.sort((a, b) => {
      if (a.time === b.time) {
        return a.type === 'start' ? -1 : 1;
      }
      return a.time - b.time;
    });

    let currentConcurrent = 0;
    let maxConcurrent = 0;

    // Sweep through time points
    timePoints.forEach((point) => {
      if (point.type === 'start') {
        currentConcurrent++;
        maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
      } else {
        currentConcurrent--;
      }
    });

    return maxConcurrent;
  }

  /**
   * Assigns columns to all events in a group using greedy graph coloring.
   * Ensures that no two overlapping events share the same column.
   */
  static assignColumns(events: IMHCalendarEvent[]): Map<string, number> {
    // Sort by start time, then longer events first for consistent assignment
    const sorted = [...events].sort((a, b) => {
      const startDiff = a.startDate.getTime() - b.startDate.getTime();
      if (startDiff !== 0) return startDiff;
      const durationA = a.endDate.getTime() - a.startDate.getTime();
      const durationB = b.endDate.getTime() - b.startDate.getTime();
      if (durationA !== durationB) return durationB - durationA; // longer first
      return a.id.localeCompare(b.id);
    });

    const eventsById = new Map(events.map((event) => [event.id, event]));
    const columnAssignments = new Map<string, number>();

    for (const event of sorted) {
      // Find columns used by overlapping events that already have assignments
      const usedColumns = new Set<number>();
      for (const [id, col] of columnAssignments) {
        const other = eventsById.get(id);
        if (other && EventUtils.areEventsOverlapping(event, other)) {
          usedColumns.add(col);
        }
      }

      // Assign the lowest available column
      let column = 0;
      while (usedColumns.has(column)) {
        column++;
      }
      columnAssignments.set(event.id, column);
    }

    return columnAssignments;
  }

  static calculateEventHeight(
    startDate: Date,
    endDate: Date,
    dayHeight: number,
    currentDate?: Date,
    useFullDuration: boolean = false,
  ): string {
    if (!currentDate) {
      return '0px';
    }

    const showTimeFrom = storeState.showTimeFrom ?? 10;
    const showTimeTo = storeState.showTimeTo ?? 24;

    // Get the top margin for all-day events (same logic as position calculation)
    const topMarginOfAllDayEvents = store.headerMargin;

    // Available height for timed events (excluding the top margin)
    const availableHeight = dayHeight - topMarginOfAllDayEvents;

    const visibleHoursPerDay = showTimeTo - showTimeFrom;
    if (visibleHoursPerDay <= 0 || availableHeight <= 0) {
      return '0px';
    }

    const s_time = startDate.getTime();
    const e_time = endDate.getTime();
    if (s_time >= e_time) {
      return '0px';
    }

    // Calculate the current day boundaries in the calendar's main timezone
    const tz = store.mainTimezone;
    const dateStr = dayjs(currentDate).tz(tz).format('YYYY-MM-DD');
    const c_day_start_time = dayjs.tz(`${dateStr} 00:00:00`, tz).valueOf();
    const c_day_end_time = dayjs.tz(`${dateStr} 00:00:00`, tz).add(1, 'day').valueOf();

    // Check if event overlaps with current day
    if (e_time <= c_day_start_time || s_time >= c_day_end_time) {
      return '0px';
    }

    // Get the actual start and end times within the current day
    const actualStartMillis = Math.max(s_time, c_day_start_time);
    const actualEndMillis = Math.min(e_time, c_day_end_time);

    // Convert milliseconds to hours from start of day
    const actualStartHour = (actualStartMillis - c_day_start_time) / MILLISECONDS_IN_HOUR;
    const actualEndHour = (actualEndMillis - c_day_start_time) / MILLISECONDS_IN_HOUR;

    // For dragged events, use full duration; otherwise clamp to visible time window
    let renderStartHour: number;
    let renderEndHour: number;

    if (useFullDuration) {
      // Use actual start/end hours without clamping (but still within day boundaries)
      // This gives us the full event duration even if it extends beyond visible window
      renderStartHour = actualStartHour;
      renderEndHour = actualEndHour;
    } else {
      // Clamp to visible time window (for normal displayed events)
      renderStartHour = Math.max(actualStartHour, showTimeFrom);
      renderEndHour = Math.min(actualEndHour, showTimeTo);
    }

    const durationInHours = renderEndHour - renderStartHour;
    if (durationInHours <= 0) {
      return '0px';
    }

    // Always use visible hours per day for hourHeight calculation
    // This ensures consistent scaling regardless of event duration
    const hourHeight = availableHeight / visibleHoursPerDay;

    // Calculate event height based on duration and hourHeight
    const eventHeight = durationInHours * hourHeight;

    // -2 added to have a margin, to events not touch when start
    // just after each other
    return `${Math.round(eventHeight) + 1}px`;
  }

  static calculateEventTopPosition(
    eventStartDate: Date,
    isAllDayEvent: boolean,
    calendarDayElementHeight: number,
    day: string | Date,
  ): number {
    if (isAllDayEvent) {
      return 0;
    }
    const topMarginOfAllDayEvents = store.headerMargin;

    // If event start before the day, return top calendar position
    if (!calendarDayElementHeight || dayjs(day).isAfter(dayjs(eventStartDate), 'day'))
      return topMarginOfAllDayEvents;

    // Space in calendar day for events without all day events (top margin)
    const availableHeight = calendarDayElementHeight - topMarginOfAllDayEvents;

    const tzDate = dayjs(eventStartDate).tz(store.mainTimezone);
    const hours = tzDate.hour();
    const minutes = tzDate.minute();

    const startHour = storeState.showTimeFrom;
    const endHour = storeState.showTimeTo;

    if (typeof startHour !== 'number' || typeof endHour !== 'number') return 0;

    const totalDisplayedMinutes = (endHour - startHour) * MINUTES_IN_HOUR;

    // Ensure the event time is within the displayed range
    const clampedHours = Math.max(startHour, Math.min(hours, endHour));
    const clampedMinutes = clampedHours === hours ? minutes : 0;

    const currentDisplayedMinutes = (clampedHours - startHour) * MINUTES_IN_HOUR + clampedMinutes;

    const percentageOfDisplayedTime = (currentDisplayedMinutes / totalDisplayedMinutes) * 100;

    const topPosition = (availableHeight * percentageOfDisplayedTime) / 100;

    return topPosition + topMarginOfAllDayEvents - 2; // Adjust for border
  }
}
