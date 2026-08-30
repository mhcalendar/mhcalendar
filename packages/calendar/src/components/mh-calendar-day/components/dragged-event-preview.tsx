import { Component, Prop, h } from '@stencil/core';
import { DragDropState } from '../../../utils/DragDropHandler';
import { EventRenderer } from '../../../utils/EventRenderer';
import { store, storeState } from '../../../store/mh-calendar-store';
import { MHCalendarViewType } from '../../../store/mh-calendar-store.types';

@Component({
  tag: 'mh-calendar-day-dragged-event-preview',
  shadow: false,
})
export class DraggedEventPreview {
  @Prop() dragDropState!: DragDropState;
  @Prop() day?: Date;
  @Prop() calendarDayElementHeight?: number;
  @Prop() viewType?: MHCalendarViewType;

  render() {
    if (!this.dragDropState.isDraggedOver || !storeState.draggedEvent) {
      return null;
    }

    const draggedDates = EventRenderer.getDraggedEventPreviewDates(
      this.dragDropState.isDraggedOver,
      this.day,
    );
    const previewEvent = draggedDates
      ? { ...storeState.draggedEvent, startDate: draggedDates.newStartDate, endDate: draggedDates.newEndDate }
      : storeState.draggedEvent;

    return (
      <div
        class={`mhCalendarDay__eventHolder ${this.dragDropState.isDraggedOverBlocked ? 'mhCalendarDay__eventHolder--blocked' : ''}`}
        style={{
          ...EventRenderer.getStylesForDraggedEvent(
            this.dragDropState.isDraggedOver,
            this.dragDropState.isDraggedOverBlocked,
            this.day,
            this.calendarDayElementHeight,
            this.viewType,
          ),
          ...store.getInlineStyleForClass('mhCalendarDay__eventHolder'),
        }}
      >
        <mh-calendar-event
          event={previewEvent}
          dayHeight={this.calendarDayElementHeight}
          eventTopPosition={this.dragDropState.isDraggedOver}
          dayOfRendering={this.day}
          isDragged={true}
        />
      </div>
    );
  }
}
