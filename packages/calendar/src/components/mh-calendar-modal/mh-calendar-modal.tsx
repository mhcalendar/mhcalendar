import { Component, h, State, VNode } from '@stencil/core';
import { store } from '../../store/mh-calendar-store';

@Component({
  tag: 'mh-calendar-modal',
  styleUrl: 'mh-calendar-modal.css',
  shadow: false,
})
export class MHCalendarModal {
  @State() isOpen: boolean = false;
  @State() modalContent: VNode | null = null;

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

  render() {
    if (!this.isOpen) {
      return null;
    }

    return (
      <div class="mhCalendarModal" onClick={this.handleBackdropClick}>
        <div
          class="mhCalendarModal__content"
          style={{
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
