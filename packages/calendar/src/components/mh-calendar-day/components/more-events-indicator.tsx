import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';
import store from '../../../store/mh-calendar-store';
import { LabelUtils } from '../../../utils/LabelUtils';

@Component({
  tag: 'mh-calendar-more-events-indicator',
  shadow: false,
})
export class MoreEventsIndicator {
  @Prop() hiddenCount!: number;

  @Event() moreClick!: EventEmitter<MouseEvent>;

  render() {
    return (
      <button
        class="mhCalendarDay__eventsLeftIndicator"
        style={{
          ...store.getInlineStyleForClass('mhCalendarDay__eventsLeftIndicator'),
        }}
        onClick={(e) => this.moreClick.emit(e)}
      >
        {LabelUtils.moreEvents(this.hiddenCount)}
      </button>
    );
  }
}
