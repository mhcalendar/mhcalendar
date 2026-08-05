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
    const hasMoreEvents = this.allDayEvents.length > maxEvents;
    const eventsToShow = hasMoreEvents
      ? this.allDayEvents.slice(0, maxEvents - 1)
      : this.allDayEvents;
    const hiddenCount = this.allDayEvents.length - eventsToShow.length;
    const showsDragPreview = this.dragDropState.isDraggedOverAllDay && !!storeState.draggedEvent;
    const ownHeight = AllDayEventsHeightUtils.getHeightForEventCount(
      this.allDayEvents.length + (showsDragPreview ? 1 : 0),
      maxHeight,
    );
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
        {eventsToShow.map((event) => (
          <mh-calendar-event event={event} />
        ))}
        {hasMoreEvents && <mh-calendar-more-events-indicator hiddenCount={hiddenCount} />}
        {this.dragDropState.isDraggedOverAllDay &&
          storeState.draggedEvent &&
          (() => {
            const previewEvent = {
              ...storeState.draggedEvent,
              allDay: true,
            };
            return <mh-calendar-event event={previewEvent} isDragged={true} />;
          })()}
      </div>
    );
  }
}
