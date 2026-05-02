import { Component, Prop, h } from '@stencil/core';
import { BusinessHoursUtils } from '../../../utils/BusinessHoursUtils';
import { store, storeState } from '../../../store/mh-calendar-store';

@Component({
  tag: 'mh-calendar-day-time-view-overlays',
  shadow: false,
})
export class TimeViewOverlays {
  @Prop() day!: Date;
  @Prop() calendarDayElementHeight!: number;
  @Prop() isToday!: boolean;
  @Prop() currentTimePosition?: { top: string };
  @Prop() isTimeView!: boolean;

  render() {
    if (!this.isTimeView) {
      return null;
    }

    // Non-business hours overlays
    const businessHours = BusinessHoursUtils.getBusinessHoursForDay(
      this.day,
     storeState.businessHours,
    );
    const { viewType, showTimeFrom, showTimeTo } = store.state;

    const nonBusinessHoursStyles = BusinessHoursUtils.getNonBusinessHoursStyles(
      this.day,
      this.calendarDayElementHeight,
      viewType,
      businessHours,
      showTimeFrom,
      showTimeTo,
      store.headerMargin,
    );

    return (
      <>
        {nonBusinessHoursStyles.map((style, index) => (
          <div
            key={`non-business-hours-${index}`}
            class="mhCalendarDay__nonBusinessHours"
            style={{
              ...style,
              ...store.getInlineStyleForClass('mhCalendarDay__nonBusinessHours'),
            }}
          />
        ))}
        {storeState.showTimeIndicator && this.isToday && this.currentTimePosition && (
          <div
            class="mhCalendarDay__currentTime"
            style={{
              ...this.currentTimePosition,
              ...store.getInlineStyleForClass('mhCalendarDay__currentTime'),
            }}
          />
        )}
      </>
    );
  }
}
