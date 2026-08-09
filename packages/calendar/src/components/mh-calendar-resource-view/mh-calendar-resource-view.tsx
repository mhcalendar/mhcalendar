import { Component, Element, State, h } from '@stencil/core';
import dayjs from 'dayjs';
import { store, storeState } from '../../store/mh-calendar-store';
import { IMHCalendarResource } from '../../types';
import { IMHCalendarEvent } from '../../types';
import { DateUtils } from '../../utils/DateUtils';
import { DaysGenerator } from '../../utils/DaysGenerator';
import { EventManager } from '../../utils/EventManager';
import { VIEW_HEIGHT } from '../../const/default-theme';
import { LabelUtils } from '../../utils/LabelUtils';
import { IMHCalendarPopoverAnchorRect } from '../../utils/PopoverPositionUtils';

const MAX_VISIBLE_EVENTS = 2;

interface DragOverCell {
  resourceId: string;
  dateKey: string;
}

@Component({
  tag: 'mh-calendar-resource-view',
  styleUrl: 'mh-calendar-resource-view.css',
  shadow: false,
})
export class MHCalendarResourceView {
  @Element() el?: HTMLElement;

  @State() dragOverCell: DragOverCell | null = null;
  @State() dates: Date[] = [];
  @State() resources: IMHCalendarResource[] = [];
  @State() eventMap: Map<string, IMHCalendarEvent[]> = new Map();
  @State() morePopover: {
    anchorRect: IMHCalendarPopoverAnchorRect;
    date: Date;
    resourceId: string;
  } | null = null;

  private storeUnsubscribers: (() => void)[] = [];

  componentWillLoad() {
    this.updateView();

    this.storeUnsubscribers.push(
      store.onChange('calendarDateRange', () => {
        this.updateView();
      }),
    );

    this.storeUnsubscribers.push(
      store.onChange('reactiveEvents', () => {
        this.updateEventMap();
      }),
    );
  }

  disconnectedCallback() {
    this.storeUnsubscribers.forEach((unsubscribe) => unsubscribe());
    this.storeUnsubscribers = [];
  }

  private updateView() {
    this.resources = (store.state as any).resources ?? [];
    this.dates = this.generateDates();
    this.updateEventMap();
  }

  private generateDates(): Date[] {
    const { fromDate, toDate } = storeState.calendarDateRange;
    if (!fromDate || !toDate) return [];

    return DaysGenerator.generateDateRange(fromDate, toDate);
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

  private onMoreClick = (date: Date, resourceId: string, e: MouseEvent) => {
    e.stopPropagation();

    const target = e.currentTarget as HTMLElement;
    const { top, left, width, height } = target.getBoundingClientRect();

    this.morePopover = { anchorRect: { top, left, width, height }, date, resourceId };
  };

  private closeMorePopover = () => {
    this.morePopover = null;
  };

  render() {
    const containerHeight = storeState.fixedHeight ?? VIEW_HEIGHT;

    if (this.resources.length === 0) {
      return (
        <div
          class="mhCalendarResource mhCalendarResource--empty"
          style={{ height: containerHeight }}
        >
          <div class="mhCalendarResource__emptyMessage">No resources configured</div>
        </div>
      );
    }

    const colCount = this.dates.length;

    return (
      <div
        class="mhCalendarResource"
        style={
          {
            height: containerHeight,
            '--resource-cols': `${colCount}`,
          } as any
        }
      >
        <div class="mhCalendarResource__grid">
          {/* Header row */}
          <div class="mhCalendarResource__headerRow">
            <div class="mhCalendarResource__cornerCell" />
            {this.dates.map((date) => {
              const isToday = DateUtils.isToday(date);
              const isWeekend = DateUtils.isWeekend(date);
              return (
                <div
                  key={DateUtils.convertDateToString(date)}
                  class={{
                    mhCalendarResource__dateCell: true,
                    'mhCalendarResource__dateCell--today': isToday,
                    'mhCalendarResource__dateCell--weekend': isWeekend,
                  }}
                >
                  <span class="mhCalendarResource__dateDayName">
                    {dayjs(date).locale(storeState.locale).format('ddd')}
                  </span>
                  <span class="mhCalendarResource__dateNumber">{dayjs(date).format('D')}</span>
                </div>
              );
            })}
          </div>

          {/* Resource rows */}
          {this.resources.map((resource) => (
            <div key={resource.id} class="mhCalendarResource__row">
              <div class="mhCalendarResource__resourceLabel">{resource.title}</div>
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
                      mhCalendarResource__cell: true,
                      'mhCalendarResource__cell--dragOver': isDragOver,
                      'mhCalendarResource__cell--weekend': isWeekend,
                      'mhCalendarResource__cell--today': isToday,
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
                        class="mhCalendarResource__moreBtn"
                        onClick={(e: MouseEvent) => this.onMoreClick(date, resource.id, e)}
                      >
                        {LabelUtils.moreEvents(hiddenCount)}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {this.morePopover && (
          <mh-calendar-event-list-popup
            anchorRect={this.morePopover.anchorRect}
            date={this.morePopover.date}
            events={this.getEventsForCell(this.morePopover.resourceId, this.morePopover.date)}
            onClosePopover={this.closeMorePopover}
          />
        )}
      </div>
    );
  }
}
