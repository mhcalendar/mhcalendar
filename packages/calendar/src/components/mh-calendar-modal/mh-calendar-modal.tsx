import { Component, h, State, VNode } from '@stencil/core';
import { store } from '../../store/mh-calendar-store';
import { IModalPosition } from '../../store/mh-calendar-store.types';

@Component({
  tag: 'mh-calendar-modal',
  styleUrl: 'mh-calendar-modal.css',
  shadow: false,
})
export class MHCalendarModal {
  @State() isOpen: boolean = false;
  @State() modalContent: VNode | null = null;
  @State() position: IModalPosition | null = null;

  private modalRef?: HTMLElement;
  private storeUnsubscribers: (() => void)[] = [];

  componentWillLoad() {
    this.setupStoreSubscriptions();
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.handleEscapeKey);

    this.storeUnsubscribers.forEach((unsubscribe) => unsubscribe());
    this.storeUnsubscribers = [];
  }

  private setupStoreSubscriptions() {
    // Subscribe to modal changes
    this.storeUnsubscribers.push(
      store.onChange('modal', (modalState) => {
        this.isOpen = modalState?.isOpen ?? false;
        this.modalContent = modalState?.content ?? null;
        this.position = modalState?.position ?? null;
      }),
    );

    document.addEventListener('keydown', this.handleEscapeKey);
  }

  private handleBackdropClick = (event: MouseEvent) => {
    // Close modal if clicking on backdrop (not on content)
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  };

  private handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.isOpen) {
      this.closeModal();
    }
  };

  private closeModal = () => {
    store.closeModal();
  };

  private calculatePosition(): {
    top?: string;
    left?: string;
    transform?: string;
  } {
    if (!this.position || !this.modalRef) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const { x, y, element, alignment, rect } = this.position;

    // If position is relative to an element or rect
    const elementRect = rect || (element ? element.getBoundingClientRect() : null);
    if (elementRect) {
      const modalRect = this.modalRef.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

      // Calculate bottom and right if using rect object
      const rectBottom =
        'bottom' in elementRect ? elementRect.bottom : elementRect.top + elementRect.height;
      const rectRight =
        'right' in elementRect ? elementRect.right : elementRect.left + elementRect.width;

      let top = elementRect.top + scrollTop;
      let left = elementRect.left + scrollLeft;

      switch (alignment) {
        case 'bottom':
          top = rectBottom + scrollTop;
          left = elementRect.left + scrollLeft + elementRect.width / 2;
          return {
            top: `${top}px`,
            left: `${left}px`,
            transform: 'translate(-50%, 0)',
          };
        case 'top':
          top = elementRect.top + scrollTop - modalRect.height;
          left = elementRect.left + scrollLeft + elementRect.width / 2;
          return {
            top: `${top}px`,
            left: `${left}px`,
            transform: 'translate(-50%, -100%)',
          };
        case 'right':
          top = elementRect.top + scrollTop + elementRect.height / 2;
          left = rectRight + scrollLeft;
          return {
            top: `${top}px`,
            left: `${left}px`,
            transform: 'translate(0, -50%)',
          };
        case 'left':
          top = elementRect.top + scrollTop + elementRect.height / 2;
          left = elementRect.left + scrollLeft - modalRect.width;
          return {
            top: `${top}px`,
            left: `${left}px`,
            transform: 'translate(-100%, -50%)',
          };
        default: // center
          top = elementRect.top + scrollTop + elementRect.height / 2;
          left = elementRect.left + scrollLeft + elementRect.width / 2;
          return {
            top: `${top}px`,
            left: `${left}px`,
            transform: 'translate(-50%, -50%)',
          };
      }
    }

    // If position is absolute coordinates
    if (x !== undefined && y !== undefined) {
      return {
        top: `${y}px`,
        left: `${x}px`,
        transform: 'translate(-50%, -50%)',
      };
    }

    // Default: center of screen
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  }

  render() {
    if (!this.isOpen) {
      return null;
    }

    const positionStyle = this.calculatePosition();

    return (
      <div class="mhCalendarModal" onClick={this.handleBackdropClick}>
        <div
          class="mhCalendarModal__content"
          ref={(el) => (this.modalRef = el)}
          style={{
            ...positionStyle,
            ...store.getInlineStyleForClass('mhCalendarModal__content'),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {this.modalContent}
        </div>
      </div>
    );
  }
}
