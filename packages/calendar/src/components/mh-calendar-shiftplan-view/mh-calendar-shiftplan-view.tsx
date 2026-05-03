import { Component, Element, State, h } from '@stencil/core';
import dayjs from 'dayjs';
import { store, storeState } from '../../store/mh-calendar-store';
import { IMHCalendarResource } from '../../types';
import { IMHCalendarEvent } from '../../types';
import { DateUtils } from '../../utils/DateUtils';
import { EventManager } from '../../utils/EventManager';
import { VIEW_HEIGHT } from '../../const/default-theme';

const MAX_VISIBLE_EVENTS = 2;

interface DragOverCell {
  resourceId: string;
  dateKey: string;
}

@Component({
  tag: 'mh-calendar-shiftplan-view',
  styleUrl: 'mh-calendar-shiftplan-view.css',
  shadow: false,
})
export class MHCalendarShiftplanView {
  @Element() el?: HTMLElement;

  @State() dragOverCell: DragOverCell | null = null;
  @State() dates: Date[] = [];
  @State() resources: IMHCalendarResource[] = [];
  @State() eventMap: Map<string, IMHCalendarEvent[]> = new Map();

  componentWillLoad() {
    this.updateView();

    store.onChange('calendarDateRange', () => {
      this.updateView();
    });

    store.onChange('reactiveEvents', () => {
      this.updateEventMap();
    });
  }

  private updateView() {
    this.resources = (store.state as any).resources ?? [];
    this.dates = this.generateDates();
    this.updateEventMap();
  }

  private generateDates(): Date[] {
    const { fromDate, toDate } = storeState.calendarDateRange;
    if (!fromDate || !toDate) return [];

    const dates: Date[] = [];
    let current = dayjs(fromDate);
    const end = dayjs(toDate);

    while (current.isBefore(end, 'day') || current.isSame(end, 'day')) {
      dates.push(current.toDate());
      current = current.add(1, 'day');
    }

    return dates;
  }

  private updateEventMap() {
    const map = new Map<string, IMHCalendarEvent[]>();
    const reactiveEvents = storeState.reactiveEvents;

    this.dates.forEach((date) => {
      const dateKey = DateUtils.convertDateToString(date);
      const dailyEvents = reactiveEvents.get(dateKey);
      if (!dailyEvents) return;

      for (const event of dailyEvents.values()) {
        if (event.resourceId) {
          const key = `${event.resourceId}_${dateKey}`;
          const list = map.get(key) ?? [];
          list.push(event);
          map.set(key, list);
        }
      }
    });

    this.eventMap = map;
  }

  private getCellKey(resourceId: string, date: Date): string {
    return `${resourceId}_${DateUtils.convertDateToString(date)}`;
  }

  private getEventsForCell(resourceId: string, date: Date): IMHCalendarEvent[] {
    return this.eventMap.get(this.getCellKey(resourceId, date)) ?? [];
  }

  // Drag & Drop on cells

  private onDragOver = (resourceId: string, date: Date, e: DragEvent) => {
    e.preventDefault();
    const dateKey = DateUtils.convertDateToString(date);

    if (
      !this.dragOverCell ||
      this.dragOverCell.resourceId !== resourceId ||
      this.dragOverCell.dateKey !== dateKey
    ) {
      this.dragOverCell = { resourceId, dateKey };
    }
  };

  private onDragLeave = () => {
    this.dragOverCell = null;
  };

  private onDrop = (resourceId: string, date: Date, e: DragEvent) => {
    e.preventDefault();
    this.dragOverCell = null;

    const draggedEvent = storeState.draggedEvent;
    if (!draggedEvent) return;

    const originalStart = draggedEvent.startDate;
    const originalEnd = draggedEvent.endDate;
    const durationMs = originalEnd.getTime() - originalStart.getTime();

    const newStartDate = new Date(date);
    newStartDate.setHours(
      originalStart.getHours(),
      originalStart.getMinutes(),
      originalStart.getSeconds(),
      originalStart.getMilliseconds(),
    );

    const newEndDate = new Date(newStartDate.getTime() + durationMs);

    const updatedEvent = {
      ...draggedEvent,
      resourceId,
    };

    EventManager.handleEventDateChange(newStartDate, newEndDate, updatedEvent);
  };

  private onCellClick = (date: Date, resourceId: string) => {
    if (typeof storeState.onDayClick === 'function') {
     storeState.onDayClick({ date, resourceId });
    }
  };

  private onMoreClick = (
    events: IMHCalendarEvent[],
    date: Date,
    _resourceId: string,
    e: MouseEvent,
  ) => {
    e.stopPropagation();

    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    const modalContent = (
      <div class="mhCalendarShiftplan__morePopup">
        <div class="mhCalendarShiftplan__morePopupHeader">{dayjs(date).format('ddd, MMM D')}</div>
        <div class="mhCalendarShiftplan__morePopupList">
          {events.map((event) => (
            <mh-calendar-event key={event.id} event={event} />
          ))}
        </div>
      </div>
    );

    store.openModal(modalContent, {
      rect,
      alignment: 'bottom',
    });
  };

  render() {
    const containerHeight = storeState.fixedHeight ?? VIEW_HEIGHT;

    if (this.resources.length === 0) {
      return (
        <div
          class="mhCalendarShiftplan mhCalendarShiftplan--empty"
          style={{ height: containerHeight }}
        >
          <div class="mhCalendarShiftplan__emptyMessage">No resources configured</div>
        </div>
      );
    }

    const colCount = this.dates.length;

    return (
      <div
        class="mhCalendarShiftplan"
        style={
          {
            height: containerHeight,
            '--shiftplan-cols': `${colCount}`,
          } as any
        }
      >
        <div class="mhCalendarShiftplan__grid">
          {/* Header row */}
          <div class="mhCalendarShiftplan__headerRow">
            <div class="mhCalendarShiftplan__cornerCell" />
            {this.dates.map((date) => {
              const isToday = DateUtils.isToday(date);
              const isWeekend = DateUtils.isWeekend(date);
              return (
                <div
                  key={DateUtils.convertDateToString(date)}
                  class={{
                    mhCalendarShiftplan__dateCell: true,
                    'mhCalendarShiftplan__dateCell--today': isToday,
                    'mhCalendarShiftplan__dateCell--weekend': isWeekend,
                  }}
                >
                  <span class="mhCalendarShiftplan__dateDayName">{dayjs(date).format('ddd')}</span>
                  <span class="mhCalendarShiftplan__dateNumber">{dayjs(date).format('D')}</span>
                </div>
              );
            })}
          </div>

          {/* Resource rows */}
          {this.resources.map((resource) => (
            <div key={resource.id} class="mhCalendarShiftplan__row">
              <div class="mhCalendarShiftplan__resourceLabel">{resource.title}</div>
              {this.dates.map((date) => {
                const events = this.getEventsForCell(resource.id, date);
                const dateKey = DateUtils.convertDateToString(date);
                const isDragOver =
                  this.dragOverCell?.resourceId === resource.id &&
                  this.dragOverCell?.dateKey === dateKey;
                const isWeekend = DateUtils.isWeekend(date);
                const isToday = DateUtils.isToday(date);

                const visibleEvents = events.slice(0, MAX_VISIBLE_EVENTS);
                const hiddenCount = events.length - MAX_VISIBLE_EVENTS;

                return (
                  <div
                    key={dateKey}
                    class={{
                      mhCalendarShiftplan__cell: true,
                      'mhCalendarShiftplan__cell--dragOver': isDragOver,
                      'mhCalendarShiftplan__cell--weekend': isWeekend,
                      'mhCalendarShiftplan__cell--today': isToday,
                    }}
                    onDragOver={(e: DragEvent) => this.onDragOver(resource.id, date, e)}
                    onDragLeave={this.onDragLeave}
                    onDrop={(e: DragEvent) => this.onDrop(resource.id, date, e)}
                    onClick={() => {
                      if (events.length === 0) this.onCellClick(date, resource.id);
                    }}
                  >
                    {visibleEvents.map(
                      (event) =>
                        !event.isHidden && <mh-calendar-event key={event.id} event={event} />,
                    )}
                    {hiddenCount > 0 && (
                      <button
                        class="mhCalendarShiftplan__moreBtn"
                        onClick={(e: MouseEvent) => this.onMoreClick(events, date, resource.id, e)}
                      >
                        +{hiddenCount} more
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
