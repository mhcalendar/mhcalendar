import { Component, Element, Listen, Prop, State, h, Watch } from '@stencil/core';
import dayjs from 'dayjs';
import { DayUtils } from './mh-calendar-day.utils';
import { IMHCalendarEvent } from '../../types';
import { IMHCalendarViewType } from '../../store/mh-calendar-store.types';
import { store, storeState } from '../../store/mh-calendar-store';
import { EventManager } from '../../utils/EventManager';
import { DateUtils } from '../../utils/DateUtils';
import { DragDropHandler, DragDropState } from '../../utils/DragDropHandler';
import { MonthViewCalculator } from '../../utils/MonthViewCalculator';
import { DayClickHandler } from '../../utils/DayClickHandler';

@Component({
  tag: 'mh-calendar-day',
  styleUrl: 'mh-calendar-day.css',
  shadow: false,
})
export class MHCalendarDay {
  @Prop() day?: Date;
  @Prop() showCurrentDate: boolean = false;

  @State() calendarDayElementHeight?: number;
  @State() isToday: boolean = false;
  @State() currentTimePosition?: { top: string };
  @State() groupedEvents: Map<string, IMHCalendarEvent[]> | IMHCalendarEvent[] = new Map();
  @State() allDayEvents: IMHCalendarEvent[] = [];
  @State() dragDropState: DragDropState = {
    isDraggedOver: null,
    isDraggedOverAllDay: false,
    isDraggedOverBlocked: false,
    draggedOverOffsetY: null,
    isOverTarget: false,
    entered: false,
  };
  @State() isDayHovered: boolean = false;
  @State() maxVisibleEventsInMonthView: number = 3; // Default: start with conservative value

  @Element() el?: HTMLElement;

  // Drag and drop handler instance
  private dragDropHandler!: DragDropHandler; // Initialized in componentWillLoad
  private intervalId?: number;
  private storeUnsubscribers: (() => void)[] = [];
  private resizeTimerId?: number;

  private groupedEventsRafId: number | null = null;
  private lastRenderedViewType?: IMHCalendarViewType;

  private processDragPosition = (clientY: number): void => {
    const newState = this.dragDropHandler.processDragPosition(clientY, this.dragDropState);
    if (newState !== this.dragDropState) {
      this.dragDropState = newState;
    }
  };

  private dispatchDropEvent = (clientY: number): void => {
    this.dragDropHandler.dispatchDropEvent(clientY, this.el || null, this.showCurrentDate);
    this.dragDropState = this.dragDropHandler.resetDragState();
    store.setDraggedOverAllDayDate(null);
  };

  private resetDragState = (): void => {
    this.dragDropState = this.dragDropHandler.resetDragState();
    store.setDraggedOverAllDayDate(null);
  };

  // Touch event handlers
  @Listen('touchmove', { target: 'window' })
  handleTouchMove(e: TouchEvent): void {
    if (!this.el) return;

    const newState = this.dragDropHandler.handleTouchMove(e, this.dragDropState);
    if (newState !== this.dragDropState) {
      this.dragDropState = newState;
    }
  }

  @Listen('touchend', { target: 'window' })
  handleTouchEnd(e: TouchEvent): void {
    if (!this.el || !this.dragDropState.isOverTarget) return;

    try {
      this.dragDropHandler.handleTouchEnd(e, this.el, this.showCurrentDate);
      this.dragDropState = this.dragDropHandler.resetDragState();
      store.setDraggedOverAllDayDate(null);
    } catch (error) {
      console.error('Error handling touch end:', error);
      this.dragDropState = this.dragDropHandler.resetDragState();
      store.setDraggedOverAllDayDate(null);
    }
  }

  @Listen('dragstart', { target: 'window' })
  handleDragStart(): void {
    this.isDayHovered = false;
  }

  private scheduleGetGroupedEvents(): void {
    if (this.groupedEventsRafId !== null) {
      cancelAnimationFrame(this.groupedEventsRafId);
    }
    this.groupedEventsRafId = requestAnimationFrame(() => {
      this.getGroupedEvents();
      this.groupedEventsRafId = null;
    });
  }

  // Component lifecycle and data management
  private getGroupedEvents(): void {
    if (!this.day) return;

    const eventsArray = EventManager.getEventsForDate(this.day);
    const isMonthView = storeState.viewType === IMHCalendarViewType.MONTH;

    this.lastRenderedViewType = storeState.viewType;

    if (isMonthView) {
      this.groupedEvents = eventsArray;
      this.allDayEvents = [];
      return;
    }

    const groupedEvents = DayUtils.groupEvents(eventsArray);
    this.allDayEvents = groupedEvents.allDayEvents;
    this.groupedEvents = groupedEvents.dayEvents;
  }

  @Watch('day')
  dayChanged(newDay: Date, oldDay?: Date): void {
    if (!newDay) return;

    if (oldDay && dayjs(newDay).isSame(oldDay, 'day')) {
      return;
    }

    this.isToday = DateUtils.isToday(newDay);
    this.scheduleGetGroupedEvents();
    this.updateCurrentTimePosition();
    this.dragDropHandler.updateDay(newDay);
  }

  componentWillLoad(): void {
    this.calendarDayElementHeight = 600; // Default fallback
    this.dragDropHandler = new DragDropHandler(this.day, this.calendarDayElementHeight);

    if (this.day) {
      this.isToday = DateUtils.isToday(this.day);
      this.scheduleGetGroupedEvents();
    }
  }

  componentDidLoad(): void {
    this.calendarDayElementHeight = this.el?.offsetHeight || 600;
    storeState.heightOfCalendarDay = this.el?.offsetHeight || 600;
    this.dragDropHandler.updateHeight(this.calendarDayElementHeight);

    // Set target element for drag handler
    const targetElement = this.el?.querySelector('.mhCalendarDay') as HTMLElement;
    this.dragDropHandler.setTargetElement(targetElement || null);

    this.updateCurrentTimePosition();
    this.calculateMaxVisibleEventsInMonthView();
    this.setupStoreSubscriptions();
    this.startTimeInterval();
    window.addEventListener('resize', this.handleResize);
  }

  componentDidUpdate(): void {
    const newHeight = this.el?.offsetHeight || 600;
    if (newHeight !== this.calendarDayElementHeight) {
      this.calendarDayElementHeight = newHeight;
      this.dragDropHandler.updateHeight(this.calendarDayElementHeight);
      this.updateCurrentTimePosition();
      this.calculateMaxVisibleEventsInMonthView();
      storeState.heightOfCalendarDay = this.el?.offsetHeight || 600;
    } else {
      // Recalculate even if height didn't change (view type might have changed)
      this.calculateMaxVisibleEventsInMonthView();
    }
  }

  private setupStoreSubscriptions(): void {
    this.storeUnsubscribers.push(
      store.onChange('calendarDateRange', () => {
        this.scheduleGetGroupedEvents();
        this.updateCurrentTimePosition();
        this.calculateMaxVisibleEventsInMonthView();
      }),
    );

    this.storeUnsubscribers.push(
      store.onChange('reactiveEvents', () => {
        this.scheduleGetGroupedEvents();
        // headerMargin (all-day row height) can change with the event count, which shifts
        // where the current-time line should render.
        this.updateCurrentTimePosition();
        setTimeout(() => {
          this.calculateMaxVisibleEventsInMonthView();
        }, 50);
      }),
    );

    this.storeUnsubscribers.push(
      store.onChange('viewType', () => {
        if (this.lastRenderedViewType !== storeState.viewType) {
          this.scheduleGetGroupedEvents();
        }
        this.updateCurrentTimePosition();
        this.calculateMaxVisibleEventsInMonthView();
      }),
    );
  }

  private handleResize = (): void => {
    if (this.resizeTimerId) {
      window.clearTimeout(this.resizeTimerId);
    }
    this.resizeTimerId = window.setTimeout(() => {
      const newHeight = this.el?.offsetHeight || 600;
      if (newHeight !== this.calendarDayElementHeight) {
        this.calendarDayElementHeight = newHeight;
        this.dragDropHandler.updateHeight(this.calendarDayElementHeight);
        this.updateCurrentTimePosition();
        this.calculateMaxVisibleEventsInMonthView();
        storeState.heightOfCalendarDay = newHeight;
      }
    }, 300);
  };

  private startTimeInterval(): void {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
    }

    this.intervalId = window.setInterval(() => {
      this.updateCurrentTimePosition();
    }, 60000); // 1 minute
  }

  private updateCurrentTimePosition(): void {
    if (this.calendarDayElementHeight && this.isToday && this.calendarDayElementHeight > 0) {
      const currentTimePosition = DayUtils.calculateCurrentTimePosition(
        this.calendarDayElementHeight,
      );
      this.currentTimePosition = currentTimePosition;
    }
  }

  /**
   * Calculates the maximum number of events that can fit in month view
   * based on available height in the day cell
   */
  private calculateMaxVisibleEventsInMonthView(): void {
    if (!this.el || !storeState.viewType || storeState.viewType !== IMHCalendarViewType.MONTH) {
      return;
    }

    // Use setTimeout to ensure calculation happens after layout is complete
    setTimeout(() => {
      if (!this.el) return;
      this.maxVisibleEventsInMonthView = MonthViewCalculator.calculateMaxVisibleEvents(this.el);
    }, 0);
  }

  private onDayClick = (event: MouseEvent, isContext = false): void => {
    DayClickHandler.handleDayClick(event, this.el || null, this.day, isContext);
  };

  disconnectedCallback(): void {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
    }
    if (this.resizeTimerId) {
      window.clearTimeout(this.resizeTimerId);
    }
    if (this.groupedEventsRafId !== null) {
      cancelAnimationFrame(this.groupedEventsRafId);
    }
    window.removeEventListener('resize', this.handleResize);

    this.storeUnsubscribers.forEach((unsubscribe) => unsubscribe());
    this.storeUnsubscribers = [];
  }

  render() {
    if (!storeState.viewType || !this.day || !this.calendarDayElementHeight) return;

    const dayOfMonth = dayjs(this.day).format('DD');
    const style = DayUtils.getDayStyles(this.day);
    const isTimeView = [IMHCalendarViewType.DAY, IMHCalendarViewType.WEEK].includes(
      storeState.viewType,
    );

    return (
      <div
        class={`mhCalendarDay ${style.join(' ')} ${this.isDayHovered ? 'day__hovered' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          this.isDayHovered = false;

          // If not dragging over all day holder, process normal drag
          if (!this.dragDropState.isDraggedOverAllDay) {
            this.processDragPosition(e.clientY);
            this.dragDropState = {
              ...this.dragDropState,
              isDraggedOverAllDay: false, // Clear all day preview if dragging elsewhere
            };
          }
        }}
        onDragLeave={() => {
          this.isDayHovered = false;
          // Don't reset if still dragging over all day holder
          if (!this.dragDropState.isDraggedOverAllDay) {
            this.resetDragState();
          }
        }}
        onMouseEnter={() => {
          if (storeState.draggedEvent) {
            this.isDayHovered = true;
          }
        }}
        onMouseLeave={() => {
          this.isDayHovered = false;
        }}
        onDrop={(e) => {
          e.preventDefault();
          this.dispatchDropEvent(e.clientY);
        }}
        onClick={this.onDayClick}
        onContextMenu={(e) => this.onDayClick(e, true)}
        style={{
          overflowY: storeState.makeAllDaysSticky ? 'visible' : 'hidden',
          overflowX: 'hidden',
          ...store.getInlineStyleForClass('mhCalendarDay'),
        }}
      >
        <mh-calendar-day-all-day-events-holder
          showCurrentDate={this.showCurrentDate}
          allDayEvents={this.allDayEvents}
          dragDropState={this.dragDropState}
          handleDragOver={(e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            // Show preview when dragging over all day holder
            if (storeState.draggedEvent) {
              this.dragDropState = {
                ...this.dragDropState,
                isDraggedOverAllDay: true,
                isDraggedOver: null, // Clear timed event preview
              };
              // Let the shared all-day row height account for this preview before drop.
              if (this.day) store.setDraggedOverAllDayDate(this.day);
            }
          }}
          handleDragLeave={(e: DragEvent) => {
            // Only reset if leaving the all day holder completely
            const relatedTarget = e.relatedTarget as HTMLElement;
            const allDayHolder = e.currentTarget as HTMLElement;
            if (!allDayHolder.contains(relatedTarget)) {
              this.dragDropState = {
                ...this.dragDropState,
                isDraggedOverAllDay: false,
              };
              store.setDraggedOverAllDayDate(null);
            }
          }}
          handleDrop={(e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            this.dispatchDropEvent(e.clientY);
          }}
        />
        {this.showCurrentDate && (
          <span
            class="mhCalendarDay_dayDate"
            style={{
              ...store.getInlineStyleForClass('mhCalendarDay_dayDate'),
            }}
          >
            {dayOfMonth}
          </span>
        )}
        <mh-calendar-day-time-view-overlays
          day={this.day!}
          calendarDayElementHeight={this.calendarDayElementHeight!}
          isToday={this.isToday}
          currentTimePosition={this.currentTimePosition}
          isTimeView={isTimeView}
        />
        {isTimeView && (
          <mh-calendar-day-dragged-event-preview
            dragDropState={this.dragDropState}
            day={this.day}
            calendarDayElementHeight={this.calendarDayElementHeight}
            viewType={storeState.viewType}
          />
        )}
        {isTimeView ? (
          <mh-calendar-day-time-view-events
            groupedEvents={this.groupedEvents as Map<string, IMHCalendarEvent[]>}
            calendarDayElementHeight={this.calendarDayElementHeight}
            day={this.day}
          />
        ) : (
          <mh-calendar-day-month-view-events
            groupedEvents={this.groupedEvents as IMHCalendarEvent[]}
            maxVisibleEventsInMonthView={this.maxVisibleEventsInMonthView}
            calendarDayElementHeight={this.calendarDayElementHeight}
            day={this.day}
            dragDropState={this.dragDropState}
          />
        )}
      </div>
    );
  }
}
