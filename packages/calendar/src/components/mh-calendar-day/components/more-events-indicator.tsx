import { Component, h, Prop } from '@stencil/core';
import store from '../../../store/mh-calendar-store';
import { LabelUtils } from '../../../utils/LabelUtils';

@Component({
  tag: 'mh-calendar-more-events-indicator',
  shadow: false,
})
export class MoreEventsIndicator {
  @Prop() hiddenCount!: number;

  render() {
    return (
      <div
        class="mhCalendarDay__eventsLeftIndicator"
        style={{
          ...store.getInlineStyleForClass('mhCalendarDay__eventsLeftIndicator'),
        }}
      >
        {LabelUtils.moreEvents(this.hiddenCount)}
      </div>
    );
  }
}
