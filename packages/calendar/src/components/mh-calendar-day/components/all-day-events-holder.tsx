import { Component, Prop, h } from '@stencil/core';
import { IMHCalendarEvent } from '../../../types';
import { DragDropState } from '../../../utils/DragDropHandler';
import { store, storeState } from '../../../store/mh-calendar-store';
import { AllDayEventsHeightUtils } from '../../../utils/AllDayEventsHeightUtils';

@Component({
  tag: 'mh-calendar-day-all-day-events-holder',
  shadow: false,
})
export class AllDayEventsHolder {
  @Prop() showCurrentDate!: boolean;
  @Prop() allDayEvents!: IMHCalendarEvent[];
  @Prop() dragDropState!: DragDropState;
  @Prop() handleDragOver!: (e: DragEvent) => void;
  @Prop() handleDragLeave!: (e: DragEvent) => void;
  @Prop() handleDrop!: (e: DragEvent) => void;

  render() {
    if (this.showCurrentDate || !storeState.showAllDayTasks) {
      return null;
    }

    const maxHeight = storeState.allDayEventsHeight;
    const maxEvents = AllDayEventsHeightUtils.getMaxVisibleEvents(maxHeight);
    const draggedEvent = this.dragDropState.isDraggedOverAllDay ? storeState.draggedEvent : undefined;
    const showsDragPreview = !!draggedEvent;

    // The dragged preview counts as one more row (shown first) so the "+N more" indicator
    // reflects what the holder will actually look like once the event is dropped.
    const effectiveCount = this.allDayEvents.length + (showsDragPreview ? 1 : 0);
    const hasMoreEvents = effectiveCount > maxEvents;
    const visibleSlots = hasMoreEvents ? maxEvents - 1 : effectiveCount;
    const visibleRealEvents = showsDragPreview ? Math.max(visibleSlots - 1, 0) : visibleSlots;
    const eventsToShow = this.allDayEvents.slice(0, visibleRealEvents);
    const hiddenCount = effectiveCount - visibleSlots;

    const ownHeight = AllDayEventsHeightUtils.getHeightForEventCount(effectiveCount, maxHeight);
    // Every day column shares one row with the hour grid, so they must all use the same
    // height (driven by whichever day currently has the most all-day events) to stay aligned.
    const height = Math.max(store.currentAllDayEventsHeight, ownHeight);

    return (
      <div
        class="mhCalendarDay_allDaysEventHolder"
        style={{
          position: storeState.makeAllDaysSticky ? 'sticky' : 'absolute',
          height: `${height}px`,
          ...store.getInlineStyleForClass('mhCalendarDay_allDaysEventHolder'),
        }}
        onDragOver={this.handleDragOver}
        onDragLeave={this.handleDragLeave}
        onDrop={this.handleDrop}
      >
        {draggedEvent && <mh-calendar-event event={{ ...draggedEvent, allDay: true }} isDragged={true} />}
        {eventsToShow.map((event) => (
          <mh-calendar-event event={event} />
        ))}
        {hasMoreEvents && <mh-calendar-more-events-indicator hiddenCount={hiddenCount} />}
      </div>
    );
  }
}
