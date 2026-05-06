import { Component, h, Prop } from '@stencil/core';
import store from '../../../store/mh-calendar-store';

@Component({
  tag: 'mh-calendar-more-events-indicator',
  shadow: false,
})
export class AllDayEventsHolder {
  @Prop() hiddenCount!: number;

  render() {
    return (
      <div
        class="mhCalendarDay__eventsLeftIndicator"
        style={{
          ...store.getInlineStyleForClass('mhCalendarDay__eventsLeftIndicator'),
        }}
      >
        {`+${this.hiddenCount} more`}
      </div>
    );
  }
}
