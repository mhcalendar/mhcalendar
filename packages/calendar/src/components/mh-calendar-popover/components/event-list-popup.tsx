import { Component, Element, Event, EventEmitter, Prop, State, h } from '@stencil/core';
import dayjs from 'dayjs';
import { storeState } from '../../../store/mh-calendar-store';
import { IMHCalendarEvent } from '../../../types';
import {
  IMHCalendarPopoverAlignment,
  IMHCalendarPopoverAnchorRect,
  PopoverPositionUtils,
} from '../../../utils/PopoverPositionUtils';

/**
 * A day/cell's overflowed events shown in a backdrop-less popover — a header
 * with the date and the full event list. Anchored next to `anchorRect` and
 * dismissible via outside click / Escape.
 *
 * Renders its own popover chrome directly (no separate slotted custom
 * element) so the event list stays reactive: a slot host that doesn't get
 * its own prop changes can fail to re-relocate updated slotted content in
 * non-shadow Stencil components.
 */
@Component({
  tag: 'mh-calendar-event-list-popup',
  styleUrl: 'event-list-popup.css',
  shadow: false,
})
export class MHCalendarEventListPopup {
  @Element() el!: HTMLElement;

  @Prop() date!: Date;
  @Prop() events: IMHCalendarEvent[] = [];
  @Prop() anchorRect!: IMHCalendarPopoverAnchorRect;
  @Prop() alignment: IMHCalendarPopoverAlignment = 'bottom';

  @Event() closePopover!: EventEmitter<void>;

  @State() positionOverride: { top: number; left: number } | null = null;

  private popoverRef?: HTMLDivElement;

  componentDidLoad() {
    document.addEventListener('mousedown', this.handleOutsideClick, true);
    document.addEventListener('keydown', this.handleKeydown);
    this.keepWithinViewport();
  }

  disconnectedCallback() {
    document.removeEventListener('mousedown', this.handleOutsideClick, true);
    document.removeEventListener('keydown', this.handleKeydown);
  }

  private handleOutsideClick = (e: MouseEvent) => {
    if (!this.el.contains(e.target as Node)) {
      this.closePopover.emit();
    }
  };

  private handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      this.closePopover.emit();
    }
  };

  private keepWithinViewport() {
    if (!this.popoverRef) return;
    const rect = this.popoverRef.getBoundingClientRect();
    this.positionOverride = PopoverPositionUtils.clampToViewport(rect);
  }

  render() {
    const positionStyle = this.positionOverride
      ? { top: `${this.positionOverride.top}px`, left: `${this.positionOverride.left}px` }
      : PopoverPositionUtils.getPositionStyle(this.anchorRect, this.alignment);

    return (
      <div
        ref={(el) => (this.popoverRef = el)}
        class="mhCalendarPopover"
        style={positionStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div class="mhCalendarEventListPopup__header">
          {dayjs(this.date).locale(storeState.locale).format('ddd, MMM D')}
        </div>
        <div class="mhCalendarEventListPopup__  list">
          {this.events.map(
            (event) => !event.isHidden && <mh-calendar-event key={event.id} event={event} />,
          )}
        </div>
      </div>
    );
  }
}
