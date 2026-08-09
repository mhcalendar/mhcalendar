import { Component, Prop, State, h } from '@stencil/core';
import { IMHCalendarEvent } from '../../../types';
import { store, storeState } from '../../../store/mh-calendar-store';
import { DragDropState } from '../../../utils/DragDropHandler';
import { IMHCalendarPopoverAnchorRect } from '../../mh-calendar-popover/mh-calendar-popover';

@Component({
  tag: 'mh-calendar-day-month-view-events',
  shadow: false,
})
export class MonthViewEvents {
  @Prop() groupedEvents!: IMHCalendarEvent[];
  @Prop() maxVisibleEventsInMonthView!: number;
  @Prop() calendarDayElementHeight?: number;
  @Prop() day?: Date;
  @Prop() dragDropState?: DragDropState;

  @State() morePopoverAnchorRect: IMHCalendarPopoverAnchorRect | null = null;

  private onMoreClick = (e: MouseEvent) => {
    e.stopPropagation();
    const { top, left, width, height } = (e.currentTarget as HTMLElement).getBoundingClientRect();
    this.morePopoverAnchorRect = { top, left, width, height };
  };

  private closeMorePopover = () => {
    this.morePopoverAnchorRect = null;
  };

  render() {
    if (!this.calendarDayElementHeight || !this.day || !this.groupedEvents) {
      return null;
    }

    const sortedEvents = [...this.groupedEvents].sort((a, b) => {
      if (a.allDay !== b.allDay) {
        return a.allDay ? -1 : 1;
      }
      return a.startDate.getTime() - b.startDate.getTime();
    });

    const maxEvents = this.maxVisibleEventsInMonthView;
    const draggedEvent =
      this.dragDropState?.isDraggedOver !== null && this.dragDropState?.isDraggedOver !== undefined
        ? storeState.draggedEvent
        : undefined;

    // The dragged preview counts as one more row (shown first) so the "+N more" indicator
    // reflects what the cell will actually look like once the event is dropped.
    const effectiveCount = sortedEvents.length + (draggedEvent ? 1 : 0);
    const hasMoreEvents = effectiveCount > maxEvents;
    const visibleSlots = hasMoreEvents ? maxEvents - 1 : effectiveCount;
    const visibleRealEvents = draggedEvent ? Math.max(visibleSlots - 1, 0) : visibleSlots;
    const eventsToShow = sortedEvents.slice(0, visibleRealEvents);
    const hiddenCount = effectiveCount - visibleSlots;

    return (
      <div
        class="mhCalendarDay__eventsContainer"
        style={{
          minHeight: '0',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          padding: '2px',
        }}
      >
        {draggedEvent && (
          <div
            class="mhCalendarDay__eventHolder"
            style={{
              width: '100%',
              position: 'relative',
              ...store.getInlineStyleForClass('mhCalendarDay__eventHolder'),
            }}
          >
            <mh-calendar-event
              event={draggedEvent}
              dayHeight={this.calendarDayElementHeight}
              eventTopPosition={0}
              dayOfRendering={this.day}
              isDragged={true}
            />
          </div>
        )}
        {eventsToShow.map((event) => {
          return (
            <div
              key={event.id}
              class="mhCalendarDay__eventHolder"
              style={{
                width: '100%',
                position: 'relative',
                ...store.getInlineStyleForClass('mhCalendarDay__eventHolder'),
              }}
            >
              <mh-calendar-event
                event={event}
                dayHeight={this.calendarDayElementHeight}
                eventTopPosition={0}
                dayOfRendering={this.day}
              />
            </div>
          );
        })}

        {hasMoreEvents && (
          <div
            class="mhCalendarDay__eventHolder"
            style={{
              width: '100%',
              cursor: 'pointer',
              ...store.getInlineStyleForClass('mhCalendarDay__eventHolder'),
            }}
            onClick={this.onMoreClick}
          >
            <mh-calendar-more-events-indicator hiddenCount={hiddenCount} />
          </div>
        )}

        {this.morePopoverAnchorRect && (
          <mh-calendar-event-list-popup
            anchorRect={this.morePopoverAnchorRect}
            date={this.day}
            events={sortedEvents}
            onClosePopover={this.closeMorePopover}
          />
        )}
      </div>
    );
  }
}
