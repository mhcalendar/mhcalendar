import { Component, State, h } from '@stencil/core';
import { store, storeState } from '../../store/mh-calendar-store';
import { DaysGenerator } from '../../utils/DaysGenerator';
import { IMHCalendarDateRange } from '../../types';
import { VIEW_HEIGHT } from '../../const/default-theme';

@Component({
  tag: 'mh-calendar-month',
  styleUrl: 'mh-calendar-month.css',
  shadow: false,
})
export class MHCalendarMonth {
  @State() currentFromDate: Date | undefined;

  private storeUnsubscribers: (() => void)[] = [];

  connectedCallback() {
    this.currentFromDate = storeState.calendarDateRange.fromDate;
    this.storeUnsubscribers.push(
      store.onChange('calendarDateRange', (value: IMHCalendarDateRange) => {
        this.currentFromDate = value.fromDate;
      }),
    );
  }

  disconnectedCallback() {
    this.storeUnsubscribers.forEach((unsubscribe) => unsubscribe());
    this.storeUnsubscribers = [];
  }

  render() {
    if (!this.currentFromDate) return;

    const daysInMonth = DaysGenerator.getDatesForMonthView(this.currentFromDate);
    return (
      <div
        class="mhCalendarMonth"
        style={{
          ...store.getInlineStyleForClass('mhCalendarMonth'),
        }}
      >
        <mh-calendar-header />
        <div
          style={{
            height: storeState.fixedHeight ?? VIEW_HEIGHT,
            overflow: storeState.fixedHeight ? 'scroll' : 'hidden',
          }}
        >
          <div
            class="mhCalendarMonth__days"
            style={{
              height: storeState.virtualScrollHeight ?? '100%',
            }}
          >
            {daysInMonth.map((day) => {
              return <mh-calendar-day day={day} showCurrentDate={true} />;
            })}
          </div>
        </div>
      </div>
    );
  }
}
