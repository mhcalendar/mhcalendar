import { Component, Element, Event, EventEmitter, h, Prop, State } from '@stencil/core';
import { store, storeState } from '../../../../store/mh-calendar-store';
import { IMHCalendarViewType } from '../../../../store/mh-calendar-store.types';
import { DateUtils } from '../../../../utils/DateUtils';
import { EventStyleManager } from '../../../../utils/EventStyleManager';
import dayjs from 'dayjs';
import { MIN_EVENT_DURATION_MINUTES } from '../../../../const/default-config';

const DEFAULT_RESIZE_HANDLE_HEIGHT = 4;
@Component({
  tag: 'mh-calendar-resize-event-handler',
  styleUrl: 'mh-calendar-resize-event-handler.css',
  shadow: false,
})
export class MHCalendarResizeEventHandler {
  @Element() el?: HTMLElement;
  @Prop() eventId!: string;
  @Prop() eventHeight!: string;
  @Prop() eventEndDate: null | Date = null;
  @Prop() eventStartDate: null | Date = null;
  @Prop() dayOfRendering: null | Date = null;
  @Prop() eventColor?: string;

  @State() isResizing: boolean = false;
  @State() startY: number = 0;
  @State() finalY: number = 0;
  @State() startHeight: number = 0;
  @State() currentHeight: number = DEFAULT_RESIZE_HANDLE_HEIGHT;
  @State() topPosition: number | null = null;
  @State() newEndDate: Date | null = null;

  @Event() resizePreview!: EventEmitter<Date | null>;

  componentDidLoad(): void {
    if (!this.el) return;
    const el = this.el;
    const parent = el?.closest('.mhCalendarDay__eventHolder');
    if (parent) {
      parent.appendChild(el);
    }
  }

  private onResizeStart = (event: PointerEvent) => {
    if (!this.eventStartDate || !this.eventEndDate) {
      console.warn('Cannot resize event without start/end dates');
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const target = event.target as HTMLElement;
    target.setPointerCapture(event.pointerId);

    this.isResizing = true;
    this.startY = event.clientY;

    // Get the parent event element's height
    const parentEventElement = this.el?.closest('.mhCalendarEvent') as HTMLElement;
    if (parentEventElement) {
      this.startHeight = parentEventElement.clientHeight;
      this.currentHeight = parentEventElement.clientHeight;
    }

    document.addEventListener('pointermove', this.onResizeMove);
    document.addEventListener('pointerup', this.onResizeEnd);
  };

  private getCalendarTopPosition() {
    const day = this.el?.closest('.mhCalendarDay');
    const dayHeight = day?.getBoundingClientRect().top ?? 0;
    return dayHeight;
  }

  private onResizeMove = (event: PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!this.isResizing || !this.el) return;

    const deltaY = event.clientY - this.startY;
    let newHeight = this.startHeight + deltaY;

    if (this.eventEndDate) {
      const generatedEndDate = DateUtils.getExactDateBasedOnUserPosition(
        event.clientY - this.getCalendarTopPosition(),
        this.eventEndDate,
      );

      if (dayjs(generatedEndDate).isBefore(dayjs(this.eventStartDate))) {
        // If the generated end date is before the start date, set the end date to 15 minutes after the start date
        this.newEndDate = dayjs(this.eventStartDate)
          .add(storeState.minEventDuration ?? MIN_EVENT_DURATION_MINUTES, 'minute')
          .toDate();
      } else {
        this.newEndDate = generatedEndDate;
      }
      this.resizePreview.emit(this.newEndDate);
    }

    // Block resizing if user is dragging the event outside of the calendar day
    if (event.clientY < this.getCalendarTopPosition()) return;

    if (deltaY < 0) {
      // Shrinking event – move handler upward
      newHeight = Math.max(Math.abs(deltaY), 1);
      this.topPosition = parseInt(this.eventHeight) - newHeight;
    } else {
      // Extending event – handle stays below
      newHeight = Math.max(newHeight, 1);
      this.topPosition = parseInt(this.eventHeight) - DEFAULT_RESIZE_HANDLE_HEIGHT;
    }

    this.currentHeight = newHeight;
    this.finalY = event.clientY;
  };

  private onResizeEnd = (event: PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!this.isResizing) {
      return;
    }
    this.isResizing = false;
    if (!this.dayOfRendering) return;
    store.resizeEvent({
      eventId: this.eventId,
      finalY: this.finalY - this.getCalendarTopPosition(),
      dayOfRendering: this.dayOfRendering,
    });

    this.topPosition = null;
    this.currentHeight = DEFAULT_RESIZE_HANDLE_HEIGHT;
    this.newEndDate = null;
    this.resizePreview.emit(null);

    // Release pointer capture
    const target = event.target as HTMLElement;
    if (target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }

    document.removeEventListener('pointermove', this.onResizeMove);
    document.removeEventListener('pointerup', this.onResizeEnd);
  };

  disconnectedCallback() {
    document.removeEventListener('pointermove', this.onResizeMove);
    document.removeEventListener('pointerup', this.onResizeEnd);
  }

  render() {
    if (!storeState.allowEventResize || storeState.viewType === IMHCalendarViewType.MONTH)
      return null;

    const inlineStyle = {
      ...store.getInlineStyleForClass('mhCalendarResizeEventHandler'),
      height: `${this.currentHeight}px`,
      top: this.topPosition === null ? 'auto' : `${this.topPosition}px`,
      backgroundColor:
        storeState.properties.eventResizeHandleColor ||
        EventStyleManager.getEventColor({ color: this.eventColor }),
    };
    return (
      <div
        id={this.eventId}
        class={`mhCalendarResizeEventHandler ${this.isResizing ? 'resizing' : ''}`}
        style={inlineStyle}
        onPointerDown={(e: PointerEvent) => this.onResizeStart(e)}
      >
        {this.newEndDate &&
          typeof this.eventEndDate === 'object' &&
          this.eventEndDate &&
          (() => {
            const diffMs = this.newEndDate.getTime() - this.eventEndDate.getTime();
            const diffMin = Math.round(diffMs / 60000);
            if (diffMin === 0) return null;
            const sign = diffMin > 0 ? '+' : '-';
            return (
              <span class="mhCalendarResizeEventHandler__time-label">
                {sign}
                {Math.abs(diffMin)} min
              </span>
            );
          })()}
      </div>
    );
  }
}
