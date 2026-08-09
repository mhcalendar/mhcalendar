import { Component, Element, h, Prop, State } from '@stencil/core';
import { IMHCalendarEvent } from '../../types';
import { IMHCalendarViewType } from '../../store/mh-calendar-store.types';
import { store, storeState } from '../../store/mh-calendar-store';
import { EventStyleManager } from '../../utils/EventStyleManager';

@Component({
  tag: 'mh-calendar-event',
  styleUrl: 'mh-calendar-event.css',
  shadow: false,
})
export class MHCalendarEvent {
  @Prop() event?: IMHCalendarEvent;
  @Prop() dayHeight?: number;
  @Prop() eventTopPosition?: number;
  @Prop() dayOfRendering?: Date;
  @Prop() isDragged: boolean = false;
  @Prop() instanceOfEvent?: string;

  @Element() el?: HTMLElement;

  @State() resizePreviewEndDate: Date | null = null;

  private onEventClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (!this.event) return;

    // Open modal for event editing
    const modalContent = (
      <mh-calendar-event-form
        event={this.event}
        isNewEvent={false}
        onSave={(e) => {
          if (typeof storeState.onEventUpdated === 'function') {
            storeState.onEventUpdated(e.detail);
          }
          if (typeof storeState.onEventClick === 'function') {
            storeState.onEventClick(e.detail);
          }
        }}
        onCancel={() => {
          if (typeof storeState.onEventClick === 'function' && this.event) {
            storeState.onEventClick(this.event);
          }
        }}
      />
    );

    store.openModal(modalContent);
  }

  private onRightEventClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (storeState.onRightEventClick && this.event) {
      storeState.onRightEventClick(this.event);
    }
  }

  private calculateEventHeight() {
    if (!this.event || !this.dayHeight) return;

    const height = this.event.allDay
      ? '40px'
      : EventStyleManager.calculateEventHeight(
          this.event?.startDate,
          this.event?.endDate,
          this.dayHeight,
          this.dayOfRendering, // Always use dayOfRendering, not endDate
          storeState.showTimeFrom,
          storeState.showTimeTo,
          this.isDragged, // useFullDuration = true when dragged
        );
    return height;
  }

  private onDragStart = (event: DragEvent | TouchEvent) => {
    if (!this.el || !this.event) return;

    this.event.isHidden = true;
    this.el.style.opacity = '0.3';

    store.setDraggedEvent(this.event);

    const dragData = {
      event2: this.event,
      startDate: this.event.startDate,
      endDate: this.event.endDate,
      ...event,
    };

    if (event instanceof DragEvent && 'dataTransfer' in event && !!event.dataTransfer) {
      event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
      event.dataTransfer.effectAllowed = 'move';
      const img = new Image();
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='; // 1x1 transparent gif
      event.dataTransfer?.setDragImage(img, 0, 0);
    }
  };

  private onDragEnd = () => {
    if (!this.el) return;

    this.el.style.opacity = '1';
  };

  private getMHCalendarEventStyle() {
    if (!this.el || !this.event || !storeState.viewType) return;

    const eventColor = EventStyleManager.getEventColor(this.event);

    // When dragged in a time-slot view, ensure full opacity for the preview (original item fades
    // separately) and let it fill the precisely-sized holder positioned by EventRenderer.
    if (
      this.isDragged &&
      !this.event?.allDay &&
      [IMHCalendarViewType.DAY, IMHCalendarViewType.WEEK].includes(storeState.viewType)
    ) {
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
    if (this.isDragged && this.event?.allDay) {
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
      [IMHCalendarViewType.WEEK, IMHCalendarViewType.DAY].includes(storeState.viewType) &&
      !this.event.allDay;

    if (shouldEventHaveCustomHeight) {
      return {
        height: this.calculateEventHeight(),
        maxHeight: this.calculateEventHeight(),
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

  private getCorrectEventUI() {
    if (!this.event || !storeState.viewType) return;

    if (
      [IMHCalendarViewType.DAY, IMHCalendarViewType.WEEK].includes(storeState.viewType) &&
      !this.event.allDay
    ) {
      return <mh-calendar-event-full event={this.event} resizePreviewEndDate={this.resizePreviewEndDate} />;
    }

    return <mh-calendar-event-small event={this.event} />;
  }

  render() {
    return (
      <div
        onClick={(e) => this.onEventClick(e)}
        class="mhCalendarEvent"
        style={{
          ...this.getMHCalendarEventStyle(),
          ...store.getInlineStyleForClass('mhCalendarEvent'),
        }}
        draggable={true}
        onDragStart={(event) => {
          if (
            (!storeState.allowEventDragging && !this.event?.draggingToggle) ||
            (storeState.allowEventDragging && this.event?.draggingToggle)
          ) {
            event.preventDefault();
            return;
          }
          this.onDragStart(event);
        }}
        onTouchStart={(event) => {
          if (
            (!storeState.allowEventDragging && !this.event?.draggingToggle) ||
            (storeState.allowEventDragging && this.event?.draggingToggle)
          ) {
            event.preventDefault();
            return;
          }
          event.preventDefault();
          this.onDragStart(event);
        }}
        onDragEnd={this.onDragEnd}
        onTouchEnd={this.onDragEnd}
        onContextMenu={(e) => {
          e.preventDefault();
          this.onRightEventClick(e);
        }}
      >
        {this.getCorrectEventUI()}
        {!this.event?.allDay && (
          <mh-calendar-resize-event-handler
            eventId={this.event?.id ?? ''}
            eventHeight={this.calculateEventHeight() ?? '0px'}
            eventEndDate={this.event?.endDate}
            eventStartDate={this.event?.startDate}
            dayOfRendering={this.dayOfRendering}
            eventColor={this.event?.color}
            onResizePreview={(e) => (this.resizePreviewEndDate = e.detail)}
          />
        )}
      </div>
    );
  }
}
