import { Component, Element, Method, Prop, Watch, h } from '@stencil/core';
import { IMHCalendarEvent, IMHCalendarFullOptions, UserApi } from '../../types';
import { DEFAULT_WEEK_VIEW_CONFIG } from '../../const/default-config';
import { store, storeState } from '../../store/mh-calendar-store';
import { createUserAPI } from '../../store/mh-calendar-store.user-api';
import { getRegisteredView } from '../../registry/mh-calendar-view-registry';

@Component({
  tag: 'mh-calendar',
  styleUrl: 'mh-calendar.css',
  shadow: false,
})
export class MHCalendar {
  @Element() el: HTMLElement | null = null;

  @Prop() config: IMHCalendarFullOptions = {};
  @Prop() events: IMHCalendarEvent[] = [];

  @Method()
  async getApi(): Promise<UserApi> {
    const userAPI = createUserAPI(store);
    return userAPI;
  }

  componentWillLoad() {
    this.applyConfig();
  }

  @Watch('config')
  onConfigChange() {
    this.applyConfig();
  }

  @Watch('events')
  onEventsChange() {
    store.setEvents(this.events);
  }

  private applyConfig() {
    store.setConfig({
      ...DEFAULT_WEEK_VIEW_CONFIG,
      ...this.config,
      events: this.events,
      hostElement: this.el,
    });
  }

  private getCorrectViewType() {
    const definition = getRegisteredView(storeState.viewType);
    if (!definition) return <mh-calendar-multi-view />;
    return h(definition.tagName, {});
  }

  render() {
    if (!storeState.reactiveEvents) return null;

    return (
      <div
        class="mhCalendar"
        onDrop={() => {}}
        onDragOver={(e) => e.preventDefault()}
        style={{ ...store.getInlineStyleForClass('mhCalendar') }}
      >
        {storeState.showCalendarNavigation && (
          <div class="mhCalendar__navigationHolder">
            <mh-calendar-navigation />
          </div>
        )}
        <div class="mhCalendar__calendarViewHolder">{this.getCorrectViewType()}</div>
        <mh-calendar-modal />
      </div>
    );
  }
}
