import { Component, Element, Event, EventEmitter, Prop, h } from '@stencil/core';
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

  componentDidLoad() {
    document.addEventListener('mousedown', this.handleOutsideClick, true);
    document.addEventListener('keydown', this.handleKeydown);
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

  render() {
    return (
      <div
        class="mhCalendarPopover"
        style={PopoverPositionUtils.getPositionStyle(this.anchorRect, this.alignment)}
        onClick={(e) => e.stopPropagation()}
      >
        <div class="mhCalendarEventListPopup__header">
          {dayjs(this.date).locale(storeState.locale).format('ddd, MMM D')}
        </div>
        <div class="mhCalendarEventListPopup__list">
          {this.events.map((event) => (
            <mh-calendar-event key={event.id} event={event} />
          ))}
        </div>
      </div>
    );
  }
}
