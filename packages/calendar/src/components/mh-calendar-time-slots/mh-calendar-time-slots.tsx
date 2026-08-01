import { Component, Element, h } from '@stencil/core';
import { store, storeState } from '../../store/mh-calendar-store';
import { DaysGenerator } from '../../utils/DaysGenerator';
import { TimezoneUtils } from '../../utils/TimezoneUtils';
import dayjs from 'dayjs';
@Component({
  tag: 'mh-calendar-time-slots',
  styleUrl: 'mh-calendar-time-slots.css',
  shadow: false,
})
export class MHCalendarTimeSlots {
  @Element() MHCalendarTimeSlotsElement: any;

  private amountOfPrintedSlots = 0;
  private amountOfPrintedHoursSlots: string[] = [];

  componentWillRender() {
    if (!storeState.slotInterval || !storeState.hoursSlotInterval) {
      this.amountOfPrintedSlots = 0;
      this.amountOfPrintedHoursSlots = [];
      return;
    }

    const userSlotDivider =
      (storeState.slotInterval.hours * 60 + storeState.slotInterval.minutes) / 60;

    this.amountOfPrintedSlots = store.hoursRangeCal / userSlotDivider;
    this.amountOfPrintedHoursSlots = DaysGenerator.generateSlotHours(storeState.hoursSlotInterval);
  }

  componentDidRender() {
    this.updateCssVariables();
  }

  private updateCssVariables() {
    const { headerMargin } = store;

    this.MHCalendarTimeSlotsElement.style.setProperty(
      '--border-slots-length',
      `calc((100% - ${headerMargin}px) / ${this.amountOfPrintedSlots})`,
    );

    if (this.amountOfPrintedHoursSlots.length) {
      const hourLabels = this.amountOfPrintedHoursSlots.map((h) => parseInt(h));
      const hourInterval = hourLabels.length > 1 ? hourLabels[1] - hourLabels[0] : 1;
      const totalHourIntervals = (hourLabels[hourLabels.length - 1] - hourLabels[0]) / hourInterval;
      this.MHCalendarTimeSlotsElement.style.setProperty(
        '--time-slots-length',
        `calc((100% - ${headerMargin}px) / ${totalHourIntervals + 1})`,
      );
    }
  }

  private renderCalendarSlots() {
    if (!storeState.slotInterval || !storeState.hoursSlotInterval) return;
    // Extract constants
    const slotDurationMinutes =
      storeState.slotInterval.hours * 60 + storeState.slotInterval.minutes;
    const hourIntervalMinutes =
      storeState.hoursSlotInterval.hours * 60 + storeState.hoursSlotInterval.minutes;
    const startTimeMinutes = (typeof storeState.showTimeFrom === 'number' ? storeState.showTimeFrom : 0) * 60;

    // Helper functions
    const calculateSlotTime = (index: number) => {
      const totalMinutes =
        index === 0 ? startTimeMinutes : startTimeMinutes + slotDurationMinutes * index;
      return totalMinutes / 60; // Convert to hours
    };

    const shouldShowTime = (timeInHours: number): number | null => {
      const hourInterval = hourIntervalMinutes / 60;
      return timeInHours % hourInterval === 0 ? timeInHours : null;
    };

    const additionalTimezones = (storeState.timezones || []).slice(1);
    const visibleEvery = storeState.slotInterval.visibleEvery ?? 1;

    // Render slots
    return Array.from({ length: this.amountOfPrintedSlots }).map((_, index) => {
      const slotTime = calculateSlotTime(index);
      const displayTime = shouldShowTime(slotTime);
      const slotTimeMinutes = startTimeMinutes + slotDurationMinutes * index;
      const visibleEveryMinutes = visibleEvery * 60;
      const isFirstSlotAfterAllDay = index === 0 && storeState.showAllDayTasks;
      const borderClass =
        !isFirstSlotAfterAllDay && slotTimeMinutes % visibleEveryMinutes === 0
          ? 'mhCalendarWeek__border'
          : 'mhCalendarWeek__border mhCalendarWeek__border--hidden';

      if (displayTime === null) {
        return (
          <div class={borderClass}>
            <span></span>
          </div>
        );
      }

      // Format main timezone time
      // Use main timezone if specified, otherwise use browser default
      const referenceDate = storeState.calendarDateRange.fromDate || new Date();
      const dateString = dayjs(referenceDate).format('YYYY-MM-DD');

      const formattedMainTime = dayjs
        .tz(
          `${dateString} ${String(Math.floor(displayTime)).padStart(2, '0')}:${String(Math.round((displayTime % 1) * 60)).padStart(2, '0')}:00`,
          store.mainTimezone,
        )
        .format(storeState.hoursDisplayFormat);

      // Format additional timezones
      const additionalTimes = additionalTimezones.map((tz, tzIndex) => {
        const formattedTime = TimezoneUtils.formatTimeInTimezone(
          Math.floor(displayTime),
          Math.round((displayTime % 1) * 60),
          store.mainTimezone,
          tz,
          storeState.hoursDisplayFormat,
          referenceDate,
        );
        const abbreviation = TimezoneUtils.getTimezoneAbbreviation(tz);

        return {
          formattedTime,
          abbreviation,
          timezone: tz,
          key: `tz-${tzIndex}`,
        };
      });

      return (
        <div class={borderClass}>
          <div class="mhCalendarWeek__border__timeContainer">
            <span class="mhCalendarWeek__border__mainTime">{formattedMainTime}</span>
            {additionalTimes.length > 0 && (
              <div class="mhCalendarWeek__border__additionalTimezones">
                {additionalTimes.map(({ formattedTime, abbreviation, timezone, key }) => (
                  <span key={key} class="mhCalendarWeek__border__additionalTime" title={timezone}>
                    {formattedTime}
                    {abbreviation && (
                      <span class="mhCalendarWeek__border__tzAbbr">{abbreviation}</span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    });
  }

  render() {
    if (!store.hoursInDay) return <></>;

    return (
      <div
        style={{
          height: storeState.virtualScrollHeight ?? '100%',
          ...store.getInlineStyleForClass('mhCalendarTimeSlots'),
        }}
        class="mhCalendarTimeSlots"
      >
        <div
          style={{
            height: storeState.virtualScrollHeight ?? '100%',
            ...store.getInlineStyleForClass('mhCalendarWeek__borders'),
          }}
          class="mhCalendarWeek__borders"
        >
          {storeState.showAllDayTasks && (
            <div
              class="mhCalendarWeek__border mhCalendarWeek__border--hidden"
              style={{
                height: `${storeState.allDayEventsHeight}px`,
                ...store.getInlineStyleForClass('mhCalendarWeek__border'),
              }}
            />
          )}
          {this.renderCalendarSlots()}
        </div>
        <div class="mhCalendarTimeSlots__timeHolder">
          {storeState.showAllDayTasks && (
            <div
              class="time__holder"
              style={{
                height: `${storeState.allDayEventsHeight}px`,
                ...store.getInlineStyleForClass('time__holder'),
              }}
            >
              <span
                class="gtmInfo"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  width: '100%',
                  height: '100%',
                  ...store.getInlineStyleForClass('gtmInfo'),
                }}
              >
                {storeState.timezoneLabel !== undefined
                  ? storeState.timezoneLabel
                  : (() => {
                      const offset = TimezoneUtils.getTimezoneOffset(store.mainTimezone);
                      const abbr = TimezoneUtils.getTimezoneAbbreviation(store.mainTimezone);

                      if (abbr) {
                        return `${abbr} (GMT${offset >= 0 ? '+' : ''}${offset})`;
                      }

                      return `GMT${offset >= 0 ? '+' : ''}${offset}`;
                    })()}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
}
