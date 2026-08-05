import { DayUtils } from '../components/mh-calendar-day/mh-calendar-day.utils';
import { BusinessHoursUtils } from './BusinessHoursUtils';
import { store, storeState } from '../store/mh-calendar-store';

export interface DragDropState {
  isDraggedOver: number | null;
  isDraggedOverAllDay: boolean;
  isDraggedOverBlocked: boolean;
  draggedOverOffsetY: number | null;
  isOverTarget: boolean;
  entered: boolean;
}

export class DragDropHandler {
  private day: Date | undefined;
  private calendarDayElementHeight: number | undefined;
  private targetElement: HTMLElement | null = null;
  private targetRect: DOMRect | null = null;
  private lastProcessedTime: number = 0;
  private readonly THROTTLE_MS = 16; // ~60fps

  constructor(day: Date | undefined, calendarDayElementHeight: number | undefined) {
    this.day = day;
    this.calendarDayElementHeight = calendarDayElementHeight;
  }

  updateDay(day: Date | undefined): void {
    this.day = day;
    this.targetRect = null;
  }

  updateHeight(height: number | undefined): void {
    this.calendarDayElementHeight = height;
  }

  setTargetElement(element: HTMLElement | null): void {
    this.targetElement = element;
  }

  updateTargetRect(): DOMRect | null {
    if (this.targetElement) {
      this.targetRect = this.targetElement.getBoundingClientRect();
    }
    return this.targetRect;
  }

  isPointInside(clientX: number, clientY: number, rect: DOMRect): boolean {
    return (
      clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom
    );
  }

  processDragPosition(clientY: number, dragState: DragDropState): DragDropState {
    const target = this.targetElement;
    if (!target) return dragState;

    const newRect = target.getBoundingClientRect();
    const touchOffsetY = clientY - newRect.top;

    if (
      dragState.draggedOverOffsetY !== null &&
      Math.abs(touchOffsetY - dragState.draggedOverOffsetY) < 2
    ) {
      return dragState;
    }

    if (!this.calendarDayElementHeight) {
      throw new Error('Init error');
    }

    const calcBlockPosition = DayUtils.getDragEventTopPosition(
      touchOffsetY,
      this.calendarDayElementHeight,
    );

    const isBlocked = BusinessHoursUtils.isDragPositionBlockedByBusinessHours(
      calcBlockPosition,
      this.day,
      storeState.draggedEvent,
      storeState.blockBusinessHours ?? false,
      storeState.businessHours,
    );

    if (dragState.isDraggedOver !== calcBlockPosition || dragState.isDraggedOverBlocked !== isBlocked) {
      return {
        ...dragState,
        draggedOverOffsetY: touchOffsetY,
        isDraggedOver: calcBlockPosition,
        isDraggedOverBlocked: isBlocked,
      };
    }

    return dragState;
  }

  dispatchDropEvent(clientY: number, el: HTMLElement | null, showCurrentDate: boolean): void {
    const target = this.targetElement;
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const dropOffsetY = clientY - rect.top;

    if (!this.calendarDayElementHeight) {
      throw new Error('Init error');
    }

    const allDayHolder = el?.querySelector('.mhCalendarDay_allDaysEventHolder') as HTMLElement;
    let isAllDay = false;

    if (allDayHolder && storeState.showAllDayTasks && !showCurrentDate) {
      const allDayRect = allDayHolder.getBoundingClientRect();

      if (clientY >= allDayRect.top && clientY <= allDayRect.bottom) {
        isAllDay = true;
      }
    }

    const dropTopPosition = isAllDay
      ? 0
      : DayUtils.getDragEventTopPosition(dropOffsetY, this.calendarDayElementHeight);

    if (
      !isAllDay &&
      BusinessHoursUtils.isDragPositionBlockedByBusinessHours(
        dropTopPosition,
        this.day,
        storeState.draggedEvent,
        storeState.blockBusinessHours ?? false,
        storeState.businessHours,
      )
    ) {
      return;
    }

    if (!this.day) return;
    store.dropEvent({ topPosition: dropTopPosition, date: this.day, isAllDay });
  }

  handleTouchMove(e: TouchEvent, dragState: DragDropState): DragDropState {
    const now = performance.now();
    if (now - this.lastProcessedTime < this.THROTTLE_MS) {
      return dragState;
    }
    this.lastProcessedTime = now;

    const touch = e.touches[0];
    if (!touch) return dragState;

    const rect = this.targetRect || this.updateTargetRect();
    if (!rect) return dragState;

    const isInside = this.isPointInside(touch.clientX, touch.clientY, rect);

    if (isInside) {
      const newState = {
        ...dragState,
        isOverTarget: true,
        entered: true,
      };
      return this.processDragPosition(touch.clientY, newState);
    } else if (!isInside && dragState.isOverTarget) {
      return this.resetDragState();
    }

    return dragState;
  }

  handleTouchEnd(e: TouchEvent, el: HTMLElement | null, showCurrentDate: boolean): void {
    const touch = e.changedTouches[0];
    if (!touch) return;

    try {
      this.dispatchDropEvent(touch.clientY, el, showCurrentDate);
    } catch (error) {
      console.error('Error handling touch end:', error);
    }
  }

  resetDragState(): DragDropState {
    return {
      isDraggedOver: null,
      isDraggedOverAllDay: false,
      draggedOverOffsetY: null,
      isOverTarget: false,
      entered: false,
      isDraggedOverBlocked: false,
    };
  }
}
