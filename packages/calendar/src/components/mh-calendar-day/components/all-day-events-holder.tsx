import { Component, Prop, h } from '@stencil/core';
import { IMHCalendarEvent } from '../../../types';
import { DragDropState } from '../../../utils/DragDropHandler';
import { store, storeState } from '../../../store/mh-calendar-store';
import { MONTH_EVENT_HEIGHT } from '../../../const/default-theme';

const ALL_DAY_EVENT_GAP = 3;
const ALL_DAY_CONTAINER_PADDING = 4;

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

    const maxEvents = Math.max(
      1,
      Math.floor(
        (storeState.allDayEventsHeight - ALL_DAY_CONTAINER_PADDING) /
          (MONTH_EVENT_HEIGHT + ALL_DAY_EVENT_GAP),
      ),
    );
    const hasMoreEvents = this.allDayEvents.length > maxEvents;
    const eventsToShow = hasMoreEvents
      ? this.allDayEvents.slice(0, maxEvents - 1)
      : this.allDayEvents;
    const hiddenCount = this.allDayEvents.length - eventsToShow.length;

    console.log(
      Math.floor(
        (storeState.allDayEventsHeight - ALL_DAY_CONTAINER_PADDING) /
          (MONTH_EVENT_HEIGHT + ALL_DAY_EVENT_GAP),
      ),
      storeState.allDayEventsHeight,
      ALL_DAY_CONTAINER_PADDING,
      MONTH_EVENT_HEIGHT,
      ALL_DAY_EVENT_GAP,
    );
    return (
      <div
        class="mhCalendarDay_allDaysEventHolder"
        style={{
          position: storeState.makeAllDaysSticky ? 'sticky' : 'absolute',
          height: storeState.allDayEventsHeight + 'px',
          ...store.getInlineStyleForClass('mhCalendarDay_allDaysEventHolder'),
        }}
        onDragOver={this.handleDragOver}
        onDragLeave={this.handleDragLeave}
        onDrop={this.handleDrop}
      >
        {eventsToShow.map((event) => (
          <mh-calendar-event event={event} />
        ))}
        {hasMoreEvents && (
          <div
            class="mhCalendarDay__eventsLeftIndicator"
            style={{
              fontSize: '11px',
              padding: '2px 4px',
              fontWeight: 'bold',
              color: '#666',
              cursor: 'pointer',
              ...store.getInlineStyleForClass('mhCalendarDay__eventsLeftIndicator'),
            }}
          >
            {`+${hiddenCount} more`}
          </div>
        )}
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
