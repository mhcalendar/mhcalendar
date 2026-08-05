import { afterEach, describe, expect, it, vi } from '@stencil/vitest';
import '../global/global';
import { DragDropHandler, DragDropState } from './DragDropHandler';
import { DayUtils } from '../components/mh-calendar-day/mh-calendar-day.utils';
import { BusinessHoursUtils } from './BusinessHoursUtils';
import { store } from '../store/mh-calendar-store';

function createFakeElement(
  rect: Partial<DOMRect>,
  querySelectorResult: HTMLElement | null = null,
): HTMLElement {
  return {
    getBoundingClientRect: vi.fn().mockReturnValue({
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
      ...rect,
    }),
    querySelector: vi.fn().mockReturnValue(querySelectorResult),
  } as unknown as HTMLElement;
}

function baseDragState(overrides: Partial<DragDropState> = {}): DragDropState {
  return {
    isDraggedOver: null,
    isDraggedOverAllDay: false,
    isDraggedOverBlocked: false,
    draggedOverOffsetY: null,
    isOverTarget: false,
    entered: false,
    ...overrides,
  };
}

describe('DragDropHandler', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isPointInside', () => {
    const handler = new DragDropHandler(new Date(), 1000);
    const rect = { left: 10, right: 110, top: 20, bottom: 220 } as DOMRect;

    it('returns true for a point inside the rect', () => {
      expect(handler.isPointInside(50, 100, rect)).toBe(true);
    });

    it('is inclusive of the rect boundaries', () => {
      expect(handler.isPointInside(10, 20, rect)).toBe(true);
      expect(handler.isPointInside(110, 220, rect)).toBe(true);
    });

    it('returns false when outside on the left/right', () => {
      expect(handler.isPointInside(9, 100, rect)).toBe(false);
      expect(handler.isPointInside(111, 100, rect)).toBe(false);
    });

    it('returns false when outside on the top/bottom', () => {
      expect(handler.isPointInside(50, 19, rect)).toBe(false);
      expect(handler.isPointInside(50, 221, rect)).toBe(false);
    });
  });

  describe('resetDragState', () => {
    it('returns a fully cleared state', () => {
      const handler = new DragDropHandler(new Date(), 1000);
      expect(handler.resetDragState()).toEqual({
        isDraggedOver: null,
        isDraggedOverAllDay: false,
        draggedOverOffsetY: null,
        isOverTarget: false,
        entered: false,
        isDraggedOverBlocked: false,
      });
    });
  });

  describe('updateTargetRect', () => {
    it('returns null when no target element is set', () => {
      const handler = new DragDropHandler(new Date(), 1000);
      expect(handler.updateTargetRect()).toBeNull();
    });

    it('returns the target element rect and recomputes it on every call', () => {
      const handler = new DragDropHandler(new Date(), 1000);
      const el = createFakeElement({ top: 5 });
      handler.setTargetElement(el);

      handler.updateTargetRect();
      handler.updateTargetRect();

      expect(el.getBoundingClientRect).toHaveBeenCalledTimes(2);
    });
  });

  describe('updateDay', () => {
    it('invalidates the cached target rect', () => {
      const handler = new DragDropHandler(new Date(), 1000);
      const el = createFakeElement({ left: 0, right: 100, top: 0, bottom: 100 });
      handler.setTargetElement(el);
      handler.updateTargetRect();
      expect(el.getBoundingClientRect).toHaveBeenCalledTimes(1);

      handler.updateDay(new Date(2026, 6, 11));

      const touch = { clientX: 50, clientY: 50 } as Touch;
      vi.spyOn(handler, 'processDragPosition').mockReturnValue(baseDragState());
      handler.handleTouchMove({ touches: [touch] } as unknown as TouchEvent, baseDragState());

      // targetRect was cleared by updateDay, so handleTouchMove must recompute it
      expect(el.getBoundingClientRect).toHaveBeenCalledTimes(2);
    });
  });

  describe('processDragPosition', () => {
    it('returns the state unchanged when no target element is set', () => {
      const handler = new DragDropHandler(new Date(), 1000);
      const dragState = baseDragState();
      expect(handler.processDragPosition(100, dragState)).toBe(dragState);
    });

    it('throws when calendarDayElementHeight is not configured', () => {
      const handler = new DragDropHandler(new Date(), undefined);
      handler.setTargetElement(createFakeElement({ top: 0 }));
      expect(() => handler.processDragPosition(100, baseDragState())).toThrow('Init error');
    });

    it('skips recomputation when the position barely moved (throttling)', () => {
      const handler = new DragDropHandler(new Date(), 1000);
      handler.setTargetElement(createFakeElement({ top: 0 }));
      const getTopPositionSpy = vi.spyOn(DayUtils, 'getDragEventTopPosition');

      const dragState = baseDragState({ draggedOverOffsetY: 100 });
      const result = handler.processDragPosition(101, dragState);

      expect(result).toBe(dragState);
      expect(getTopPositionSpy).not.toHaveBeenCalled();
    });

    it('computes a new state when the drag position changes', () => {
      const day = new Date(2026, 6, 10);
      const handler = new DragDropHandler(day, 1000);
      handler.setTargetElement(createFakeElement({ top: 0 }));
      vi.spyOn(DayUtils, 'getDragEventTopPosition').mockReturnValue(300);
      const blockedSpy = vi
        .spyOn(BusinessHoursUtils, 'isDragPositionBlockedByBusinessHours')
        .mockReturnValue(false);

      const dragState = baseDragState();
      const result = handler.processDragPosition(250, dragState);

      expect(DayUtils.getDragEventTopPosition).toHaveBeenCalledWith(250, 1000);
      expect(blockedSpy).toHaveBeenCalledWith(
        300,
        day,
        store.state.draggedEvent,
        store.state.blockBusinessHours ?? false,
        store.state.businessHours,
      );
      expect(result).toEqual({
        ...dragState,
        draggedOverOffsetY: 250,
        isDraggedOver: 300,
        isDraggedOverBlocked: false,
      });
    });

    it('returns the same state reference when the computed position and blocked flag are unchanged', () => {
      const handler = new DragDropHandler(new Date(), 1000);
      handler.setTargetElement(createFakeElement({ top: 0 }));
      vi.spyOn(DayUtils, 'getDragEventTopPosition').mockReturnValue(300);
      vi.spyOn(BusinessHoursUtils, 'isDragPositionBlockedByBusinessHours').mockReturnValue(false);

      const dragState = baseDragState({
        isDraggedOver: 300,
        isDraggedOverBlocked: false,
        draggedOverOffsetY: 50,
      });

      expect(handler.processDragPosition(250, dragState)).toBe(dragState);
    });
  });

  describe('dispatchDropEvent', () => {
    it('does nothing when no target element is set', () => {
      const handler = new DragDropHandler(new Date(), 1000);
      const dropSpy = vi.spyOn(store, 'dropEvent').mockImplementation(() => undefined);
      handler.dispatchDropEvent(100, null, false);
      expect(dropSpy).not.toHaveBeenCalled();
    });

    it('throws when calendarDayElementHeight is not configured', () => {
      const handler = new DragDropHandler(new Date(), undefined);
      handler.setTargetElement(createFakeElement({ top: 0 }));
      expect(() => handler.dispatchDropEvent(100, null, false)).toThrow('Init error');
    });

    it('drops the event at the computed position when not all-day', () => {
      const day = new Date(2026, 6, 10);
      const handler = new DragDropHandler(day, 1000);
      handler.setTargetElement(createFakeElement({ top: 0 }));
      vi.spyOn(DayUtils, 'getDragEventTopPosition').mockReturnValue(240);
      vi.spyOn(BusinessHoursUtils, 'isDragPositionBlockedByBusinessHours').mockReturnValue(false);
      const dropSpy = vi.spyOn(store, 'dropEvent').mockImplementation(() => undefined);

      handler.dispatchDropEvent(250, null, false);

      expect(dropSpy).toHaveBeenCalledWith({ topPosition: 240, date: day, isAllDay: false });
    });

    it('drops into the all-day slot when dropped over the all-day holder', () => {
      const day = new Date(2026, 6, 10);
      const handler = new DragDropHandler(day, 1000);
      handler.setTargetElement(createFakeElement({ top: 0 }));

      const originalShowAllDayTasks = store.state.showAllDayTasks;
      const originalAllDayEventsHeight = store.state.allDayEventsHeight;
      store.state.showAllDayTasks = true;
      store.state.allDayEventsHeight = 50;

      const allDayHolder = createFakeElement({ top: 0, bottom: 50 });
      const container = createFakeElement({}, allDayHolder);
      const getTopPositionSpy = vi.spyOn(DayUtils, 'getDragEventTopPosition');
      const dropSpy = vi.spyOn(store, 'dropEvent').mockImplementation(() => undefined);

      handler.dispatchDropEvent(30, container, false);

      expect(dropSpy).toHaveBeenCalledWith({ topPosition: 0, date: day, isAllDay: true });
      expect(getTopPositionSpy).not.toHaveBeenCalled();

      store.state.showAllDayTasks = originalShowAllDayTasks;
      store.state.allDayEventsHeight = originalAllDayEventsHeight;
    });

    it('ignores the all-day holder when showCurrentDate is true', () => {
      const day = new Date(2026, 6, 10);
      const handler = new DragDropHandler(day, 1000);
      handler.setTargetElement(createFakeElement({ top: 0 }));

      const originalShowAllDayTasks = store.state.showAllDayTasks;
      const originalAllDayEventsHeight = store.state.allDayEventsHeight;
      store.state.showAllDayTasks = true;
      store.state.allDayEventsHeight = 50;

      const allDayHolder = createFakeElement({ top: 0 });
      const container = createFakeElement({}, allDayHolder);
      vi.spyOn(DayUtils, 'getDragEventTopPosition').mockReturnValue(120);
      vi.spyOn(BusinessHoursUtils, 'isDragPositionBlockedByBusinessHours').mockReturnValue(false);
      const dropSpy = vi.spyOn(store, 'dropEvent').mockImplementation(() => undefined);

      handler.dispatchDropEvent(30, container, true);

      expect(dropSpy).toHaveBeenCalledWith({ topPosition: 120, date: day, isAllDay: false });

      store.state.showAllDayTasks = originalShowAllDayTasks;
      store.state.allDayEventsHeight = originalAllDayEventsHeight;
    });

    it('does not drop the event when blocked by business hours', () => {
      const handler = new DragDropHandler(new Date(2026, 6, 10), 1000);
      handler.setTargetElement(createFakeElement({ top: 0 }));
      vi.spyOn(DayUtils, 'getDragEventTopPosition').mockReturnValue(100);
      vi.spyOn(BusinessHoursUtils, 'isDragPositionBlockedByBusinessHours').mockReturnValue(true);
      const dropSpy = vi.spyOn(store, 'dropEvent').mockImplementation(() => undefined);

      handler.dispatchDropEvent(150, null, false);

      expect(dropSpy).not.toHaveBeenCalled();
    });

    it('does not drop the event when the day is not set', () => {
      const handler = new DragDropHandler(undefined, 1000);
      handler.setTargetElement(createFakeElement({ top: 0 }));
      vi.spyOn(DayUtils, 'getDragEventTopPosition').mockReturnValue(100);
      vi.spyOn(BusinessHoursUtils, 'isDragPositionBlockedByBusinessHours').mockReturnValue(false);
      const dropSpy = vi.spyOn(store, 'dropEvent').mockImplementation(() => undefined);

      handler.dispatchDropEvent(150, null, false);

      expect(dropSpy).not.toHaveBeenCalled();
    });
  });

  describe('handleTouchMove', () => {
    it('throttles calls that happen within THROTTLE_MS of the last processed one', () => {
      const handler = new DragDropHandler(new Date(), 1000);
      const nowSpy = vi.spyOn(performance, 'now').mockReturnValue(5); // 5ms - 0ms(initial) < 16ms
      const dragState = baseDragState();

      const result = handler.handleTouchMove({ touches: [] } as unknown as TouchEvent, dragState);

      expect(result).toBe(dragState);
      nowSpy.mockRestore();
    });

    it('returns the state unchanged when there is no active touch', () => {
      const handler = new DragDropHandler(new Date(), 1000);
      vi.spyOn(performance, 'now').mockReturnValue(100);
      const dragState = baseDragState();

      const result = handler.handleTouchMove({ touches: [] } as unknown as TouchEvent, dragState);

      expect(result).toBe(dragState);
    });

    it('marks the drag as over-target and delegates to processDragPosition when inside the rect', () => {
      const handler = new DragDropHandler(new Date(), 1000);
      handler.setTargetElement(createFakeElement({ left: 0, right: 100, top: 0, bottom: 100 }));
      vi.spyOn(performance, 'now').mockReturnValue(100);
      const processed = baseDragState({ isDraggedOver: 42 });
      const processSpy = vi.spyOn(handler, 'processDragPosition').mockReturnValue(processed);

      const dragState = baseDragState();
      const touch = { clientX: 50, clientY: 50 } as Touch;
      const result = handler.handleTouchMove({ touches: [touch] } as unknown as TouchEvent, dragState);

      expect(processSpy).toHaveBeenCalledWith(50, { ...dragState, isOverTarget: true, entered: true });
      expect(result).toBe(processed);
    });

    it('resets the drag state when the touch leaves the target while it was over it', () => {
      const handler = new DragDropHandler(new Date(), 1000);
      handler.setTargetElement(createFakeElement({ left: 0, right: 100, top: 0, bottom: 100 }));
      vi.spyOn(performance, 'now').mockReturnValue(100);
      const reset = baseDragState({ isOverTarget: false });
      const resetSpy = vi.spyOn(handler, 'resetDragState').mockReturnValue(reset);

      const dragState = baseDragState({ isOverTarget: true });
      const touch = { clientX: 500, clientY: 500 } as Touch;
      const result = handler.handleTouchMove({ touches: [touch] } as unknown as TouchEvent, dragState);

      expect(resetSpy).toHaveBeenCalled();
      expect(result).toBe(reset);
    });

    it('returns the state unchanged when the touch is outside and was not previously over the target', () => {
      const handler = new DragDropHandler(new Date(), 1000);
      handler.setTargetElement(createFakeElement({ left: 0, right: 100, top: 0, bottom: 100 }));
      vi.spyOn(performance, 'now').mockReturnValue(100);

      const dragState = baseDragState({ isOverTarget: false });
      const touch = { clientX: 500, clientY: 500 } as Touch;
      const result = handler.handleTouchMove({ touches: [touch] } as unknown as TouchEvent, dragState);

      expect(result).toBe(dragState);
    });
  });

  describe('handleTouchEnd', () => {
    it('does nothing when there is no active touch', () => {
      const handler = new DragDropHandler(new Date(), 1000);
      const dispatchSpy = vi.spyOn(handler, 'dispatchDropEvent').mockImplementation(() => undefined);

      handler.handleTouchEnd({ changedTouches: [] } as unknown as TouchEvent, null, false);

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('dispatches the drop event using the ending touch position', () => {
      const handler = new DragDropHandler(new Date(), 1000);
      const dispatchSpy = vi.spyOn(handler, 'dispatchDropEvent').mockImplementation(() => undefined);
      const touch = { clientX: 10, clientY: 20 } as Touch;
      const el = createFakeElement({ top: 0 });

      handler.handleTouchEnd({ changedTouches: [touch] } as unknown as TouchEvent, el, true);

      expect(dispatchSpy).toHaveBeenCalledWith(20, el, true);
    });

    it('swallows errors thrown while dispatching the drop', () => {
      const handler = new DragDropHandler(new Date(), 1000);
      vi.spyOn(handler, 'dispatchDropEvent').mockImplementation(() => {
        throw new Error('boom');
      });
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const touch = { clientX: 10, clientY: 20 } as Touch;

      expect(() =>
        handler.handleTouchEnd({ changedTouches: [touch] } as unknown as TouchEvent, null, false),
      ).not.toThrow();
      expect(errorSpy).toHaveBeenCalledWith('Error handling touch end:', expect.any(Error));
    });
  });
});
