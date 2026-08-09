import { Component, Element, Event, EventEmitter, Prop, h } from '@stencil/core';

export interface IMHCalendarPopoverAnchorRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export type IMHCalendarPopoverAlignment = 'top' | 'bottom' | 'left' | 'right';

/**
 * Lightweight, backdrop-less popover anchored next to a target element's bounding rect.
 * Unlike `mh-calendar-modal`, it doesn't dim the page and closes on outside click / Escape.
 */
@Component({
  tag: 'mh-calendar-popover',
  styleUrl: 'mh-calendar-popover.css',
  shadow: false,
})
export class MHCalendarPopover {
  @Element() el!: HTMLElement;

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

  private getPositionStyle() {
    const { top, left, width, height } = this.anchorRect;

    switch (this.alignment) {
      case 'top':
        return {
          top: `${top}px`,
          left: `${left + width / 2}px`,
          transform: 'translate(-50%, -100%)',
        };
      case 'left':
        return {
          top: `${top + height / 2}px`,
          left: `${left}px`,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: `${top + height / 2}px`,
          left: `${left + width}px`,
          transform: 'translate(0, -50%)',
        };
      default:
        return {
          top: `${top + height}px`,
          left: `${left + width / 2}px`,
          transform: 'translate(-50%, 0)',
        };
    }
  }

  render() {
    return (
      <div
        class="mhCalendarPopover"
        style={this.getPositionStyle()}
        onClick={(e) => e.stopPropagation()}
      >
        <slot />
      </div>
    );
  }
}
