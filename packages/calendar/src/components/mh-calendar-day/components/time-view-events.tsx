import { Component, Prop, h } from '@stencil/core';
import { IMHCalendarEvent } from '../../../types';
import { EventStyleManager } from '../../../utils/EventStyleManager';
import { EventRenderer } from '../../../utils/EventRenderer';
import { store, storeState } from '../../../store/mh-calendar-store';
import { EventDisplayMode } from '../../../types/enums';

@Component({
  tag: 'mh-calendar-day-time-view-events',
  shadow: false,
})
export class TimeViewEvents {
  @Prop() groupedEvents!: Map<string, IMHCalendarEvent[]>;
  @Prop() calendarDayElementHeight?: number;
  @Prop() day?: Date;

  render() {
    if (!this.calendarDayElementHeight || !this.day) {
      return null;
    }

    return (
      <>
        {Array.from(this.groupedEvents.entries()).flatMap(([_, events]) => {
          const sortedEvents = events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
          const columnAssignments = EventStyleManager.assignColumns(sortedEvents);

          return sortedEvents.map((event, index) => {
            const instanceId = `${event.id}-${index}`;
            const eventTopPosition = EventStyleManager.calculateEventTopPosition(
              event.startDate,
              event.allDay ?? false,
              this.calendarDayElementHeight!,
              this.day!,
            );
            // Use appropriate method based on eventDisplayMode
            const eventDisplayMode = storeState.eventDisplayMode || EventDisplayMode.SideBySide;
            const positionStyle =
              eventDisplayMode === EventDisplayMode.Overlapping
                ? EventStyleManager.calculateEventWidthOverlapping(events, index)
                : EventStyleManager.calculateEventWidth(events, index, columnAssignments);

            return (
              <div
                key={instanceId}
                data-instance={instanceId}
                class="mhCalendarDay__eventHolder"
                style={{
                  ...EventRenderer.getEventHolderStyle(
                    eventTopPosition,
                    positionStyle,
                    storeState.viewType,
                  ),
                  ...store.getInlineStyleForClass('mhCalendarDay__eventHolder'),
                }}
              >
                <mh-calendar-event
                  event={event}
                  dayHeight={this.calendarDayElementHeight}
                  eventTopPosition={eventTopPosition}
                  dayOfRendering={this.day}
                />
              </div>
            );
          });
        })}
      </>
    );
  }
}
