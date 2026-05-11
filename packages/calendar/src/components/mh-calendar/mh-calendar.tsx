import { Component, Element, Method, Prop, State, Watch, h } from '@stencil/core';
import { IMHCalendarEvent, IMHCalendarFullOptions, UserApi } from '../../types';
import { DEFAULT_WEEK_VIEW_CONFIG } from '../../const/default-config';
import { store, storeState } from '../../store/mh-calendar-store';
import { IMHCalendarViewType } from '../../store/mh-calendar-store.types';
import { createUserAPI } from '../../store/mh-calendar-store.user-api';

@Component({
  tag: 'mh-calendar',
  styleUrl: 'mh-calendar.css',
  shadow: false,
})
export class MHCalendar {
  @Element() el: HTMLElement | null = null;

  @Prop() config: IMHCalendarFullOptions = {};
  @Prop() reactComponent: any;
  @Prop() events: IMHCalendarEvent[] = [];

  @State() svgContent: string = '';

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

  private applyConfig() {
    store.setConfig({
      ...DEFAULT_WEEK_VIEW_CONFIG,
      ...this.config,
      events: this.events,
      hostElement: this.el,
    });
  }

  private getCorrectViewType() {
    switch (storeState.viewType) {
      case IMHCalendarViewType.DAY:
        return <mh-calendar-multi-view />;
      case IMHCalendarViewType.WEEK:
        return <mh-calendar-multi-view />;
      case IMHCalendarViewType.MONTH:
        return <mh-calendar-month />;
      case IMHCalendarViewType.AGENDA:
        return <mh-calendar-agenda-view />;
      case IMHCalendarViewType.SHIFTPLAN:
        return <mh-calendar-shiftplan-view />;
      default:
        return <mh-calendar-multi-view />;
    }
  }

  render() {
    if (!storeState.reactiveEvents) return [];
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
