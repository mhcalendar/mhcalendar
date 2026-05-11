import { Component, h, State } from '@stencil/core';
import { store, storeState } from '../../store/mh-calendar-store';
import { IMHCalendarViewType } from '../../store/mh-calendar-store.types';

@Component({
  tag: 'mh-view-switcher',
  styleUrl: 'mh-view-switcher.css',
  shadow: false,
})
export class MhViewSwitcher {
  @State() private isCompact: boolean = false;

  private mediaQuery!: MediaQueryList;

  connectedCallback() {
    this.mediaQuery = window.matchMedia('(max-width: 999px)');
    this.isCompact = this.mediaQuery.matches;
    this.mediaQuery.addEventListener('change', this.onMediaChange);
  }

  disconnectedCallback() {
    this.mediaQuery?.removeEventListener('change', this.onMediaChange);
  }

  private onMediaChange = (e: MediaQueryListEvent) => {
    this.isCompact = e.matches;
  };

  private onViewChange = (viewType: IMHCalendarViewType) => {
    store.changeView(viewType);
  };

  render() {
    const currentView = storeState.viewType;
    const viewTypes = Object.values(IMHCalendarViewType) as IMHCalendarViewType[];
    const filteredViewTypes = storeState.avaliableViews
      ? viewTypes.filter((viewType) => storeState.avaliableViews?.includes(viewType))
      : viewTypes;

    if (this.isCompact) {
      return (
        <div class="mhViewSwitcher mhViewSwitcher--select">
          <select
            class="mhViewSwitcher__select"
            onChange={(e) =>
              this.onViewChange((e.target as HTMLSelectElement).value as IMHCalendarViewType)
            }
          >
            {filteredViewTypes.map((viewType) => (
              <option value={viewType} selected={currentView === viewType}>
                {viewType.charAt(0) + viewType.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div class="mhViewSwitcher">
        {filteredViewTypes.map((viewType) => (
          <button
            class={`mhViewSwitcher__btn${currentView === viewType ? ' mhViewSwitcher__btn--active' : ''}`}
            onClick={() => this.onViewChange(viewType)}
          >
            {viewType.charAt(0) + viewType.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
    );
  }
}
