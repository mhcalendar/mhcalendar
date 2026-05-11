import { Component, h, Prop, State } from '@stencil/core';
import { IMHCalendarDateRange } from '../../types';
import { store, storeState } from '../../store/mh-calendar-store';
import { IMHCalendarViewType } from '../../store/mh-calendar-store.types';
import dayjs from 'dayjs';
import { DateUtils } from '../../utils/DateUtils';

@Component({
  tag: 'mh-calendar-navigation',
  styleUrl: 'mh-calendar-navigation.css',
  shadow: false,
})
export class MhCalendarNavigation {
  @Prop() changeDateRangeByUnit: IMHCalendarViewType = IMHCalendarViewType.WEEK;

  @State() currentDateRange?: IMHCalendarDateRange;

  private isOneDay: boolean = false;
  private storeUnsubscribers: (() => void)[] = [];

  connectedCallback() {
    this.currentDateRange = { ...storeState.calendarDateRange };

    this.storeUnsubscribers.push(
      store.onChange('calendarDateRange', (value) => {
        this.currentDateRange = { ...value };
        this.isOneDay = dayjs(value.fromDate).isSame(value.toDate, 'day');
      }),
    );

    this.isOneDay = dayjs(storeState.calendarDateRange.fromDate).isSame(
      storeState.calendarDateRange.toDate,
      'day',
    );
  }

  disconnectedCallback() {
    this.storeUnsubscribers.forEach((unsubscribe) => unsubscribe());
    this.storeUnsubscribers = [];
  }

  private onTodayClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    store.setToToday();
  };

  private onDateRangeChange(event: Event, amount: number) {
    event.preventDefault();
    event.stopPropagation();

    if (amount > 0) {
      store.nextPeriod();
    } else {
      store.previousPeriod();
    }
  }

  render() {
    const { fromDate, toDate } = storeState.calendarDateRange;
    if (!fromDate || !toDate) return [];
    return (
      <div
        class="mhCalendarNavigation__container"
        style={{
          ...store.getInlineStyleForClass('mhCalendarNavigation__container'),
        }}
      >
        {storeState.showDateSwitcher && (
          <div class="mhCalendarNavigation">
            <button class="mhCalendarNavigation__todayBtn" onClick={this.onTodayClick}>
              Today
            </button>
            <button
              class="mhCalendarNavigation__arrowBtn"
              onClick={(e) => this.onDateRangeChange(e, -1)}
            >
              <svg viewBox="0 0 24 24">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <button
              class="mhCalendarNavigation__arrowBtn"
              onClick={(e) => this.onDateRangeChange(e, 1)}
            >
              <svg viewBox="0 0 24 24">
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </button>

            <span class="mhCalendarNavigation__dateLabel">
              {DateUtils.formatDateRange(fromDate, toDate, this.isOneDay) || '...'}
            </span>
          </div>
        )}
        {storeState.showViewTypeSwitcher && <mh-view-switcher />}
      </div>
    );
  }
}
