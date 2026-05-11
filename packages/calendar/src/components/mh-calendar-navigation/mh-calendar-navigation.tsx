import { Component, h, Prop } from '@stencil/core';
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
    if (!fromDate || !toDate) return null;

    const isOneDay = dayjs(fromDate).isSame(toDate, 'day');

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
              {DateUtils.formatDateRange(fromDate, toDate, isOneDay) || '...'}
            </span>
          </div>
        )}
        {storeState.showViewTypeSwitcher && <mh-view-switcher />}
      </div>
    );
  }
}
