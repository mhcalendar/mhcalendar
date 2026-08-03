import { Component, h, Prop, State } from '@stencil/core';
import { IMHCalendarDateRange } from '../../types';
import dayjs from 'dayjs';
import { IMHCalendarViewType } from '../../store/mh-calendar-store.types';
import { store, storeState } from '../../store/mh-calendar-store';
import { DateUtils } from '../../utils/DateUtils';
import { DaysGenerator } from '../../utils/DaysGenerator';

@Component({
  tag: 'mh-calendar-header',
  styleUrl: 'mh-calendar-header.css',
  shadow: false,
})
export class MHCalendarHeader {
  @Prop() showCurrentDate: boolean = false;
  @State() currentDateRange?: IMHCalendarDateRange;

  private storeUnsubscribers: (() => void)[] = [];

  connectedCallback() {
    this.currentDateRange = storeState.calendarDateRange;
    this.storeUnsubscribers.push(
      store.onChange('calendarDateRange', (value) => {
        this.currentDateRange = { ...value };
      }),
    );
  }

  disconnectedCallback() {
    this.storeUnsubscribers.forEach((unsubscribe) => unsubscribe());
    this.storeUnsubscribers = [];
  }

  private formatDate(date: Date) {
    if (this.showCurrentDate) {
      // Works for multiview, where we need to display day number
      const dayDate = dayjs(date).locale(storeState.locale);
      const isWeekend = [0, 6].includes(dayDate.day());
      return (
        <div
          class={`mhCalendarHeader__dateWrapper ${isWeekend ? 'mhCalendarHeader__dateWrapper--weekend' : ''}`}
        >
          <span class="mhCalendarHeader__dayName">{`${dayDate.format('ddd')}`}</span>
          <span
            class={`mhCalendarHeader__dayNumber  ${DateUtils.isToday(date) ? 'mhCalendarHeader__today' : ''}`}
          >{`${dayDate.date()}`}</span>
        </div>
      );
    }

    return <span>{dayjs(date).locale(storeState.locale).format('ddd')}</span>;
  }

  private getGridTemplateColumns() {
    switch (storeState.viewType) {
      case IMHCalendarViewType.DAY:
        return {
          display: 'grid',
          gridTemplateColumns: '40px 1fr',
        };
      case IMHCalendarViewType.WEEK:
        const daysCount = store.daysInRange;
        return {
          display: 'grid',
          gridTemplateColumns: `${storeState.properties.timeSlotWidth} repeat(${daysCount}, 1fr)`,
        };
      case IMHCalendarViewType.MONTH:
      default:
        return {
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
        };
    }
  }

  render() {
    if (!this.currentDateRange?.fromDate || !storeState.showViewHeader) return <></>;

    let days: Date[] = [];
    switch (storeState.viewType) {
      case IMHCalendarViewType.DAY:
        // For day view, show only the current day (if not hidden)
        const dayViewDate = this.currentDateRange.fromDate;
        const dayViewDayOfWeek = dayjs(dayViewDate).day();
        const hiddenDays = storeState.hiddenDays || [];
        const normalizedHiddenDays = hiddenDays.map((day) => (day === 7 ? 0 : day));
        if (!normalizedHiddenDays.includes(dayViewDayOfWeek)) {
          days = [dayViewDate];
        }
        break;
      case IMHCalendarViewType.MONTH:
        // For month view, show all days in the month grid
        days = DaysGenerator.getDatesForMonthView(this.currentDateRange.fromDate).slice(0, 7);
        break;
      case IMHCalendarViewType.WEEK:
      default:
        // For week view, show all visible days (filtered by hiddenDays)
        days = DaysGenerator.getDatesForMultiView();
        break;
    }

    return (
      <div
        class="mhCalendarHeader"
        style={{
          ...this.getGridTemplateColumns(),
          ...store.getInlineStyleForClass('mhCalendarHeader'),
        }}
      >
        {/* This empty div is to fill the grid layout */}
        {(storeState.viewType === IMHCalendarViewType.WEEK ||
          storeState.viewType === IMHCalendarViewType.DAY) && <div />}

        {days.map((day) => (
          <div class="mhCalendarHeader__dateCell">
            <div
              class={`mhCalendarHeader__date`}
              style={{
                ...store.getInlineStyleForClass('mhCalendarHeader__date'),
                ...(DateUtils.isToday(day)
                  ? store.getInlineStyleForClass('mhCalendarHeader__today')
                  : {}),
              }}
            >
              {this.formatDate(day)}
            </div>
          </div>
        ))}
      </div>
    );
  }
}
