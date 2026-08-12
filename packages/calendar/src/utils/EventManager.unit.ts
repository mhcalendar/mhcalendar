import { afterEach, describe, expect, it } from '@stencil/vitest';
import '../global/global';
import { EventManager } from './EventManager';
import { store } from '../store/mh-calendar-store';
import { DateUtils } from './DateUtils';
import { IMHCalendarEvent } from '../types';

function buildEvent(overrides: Partial<IMHCalendarEvent> = {}): IMHCalendarEvent {
  return {
    id: 'evt-1',
    title: 'Test event',
    startDate: new Date('2024-01-01T10:00:00'),
    endDate: new Date('2024-01-01T11:00:00'),
    allDay: false,
    ...overrides,
  };
}

describe('EventManager.handleEventDateChange', () => {
  afterEach(() => {
    store.state.reactiveEvents = new Map();
    store.state.draggedEvent = null;
  });

  it('removes the event from its original date bucket when moved to a different day, even when the caller passes an event object that already carries the new dates', () => {
    const original = buildEvent();
    const originalDateKey = DateUtils.convertDateToString(original.startDate);
    store.state.reactiveEvents = new Map([[originalDateKey, new Map([[original.id, original]])]]);

    const newStartDate = new Date('2024-01-05T10:00:00');
    const newEndDate = new Date('2024-01-05T11:00:00');

    // Mirrors mh-calendar-resource-view.tsx's onDrop, which builds a preview event whose
    // startDate/endDate/resourceId are already the drop-target values.
    const droppedEventShape = {
      ...original,
      startDate: newStartDate,
      endDate: newEndDate,
      resourceId: 'resource-2',
    };

    EventManager.handleEventDateChange(newStartDate, newEndDate, droppedEventShape);

    const newDateKey = DateUtils.convertDateToString(newStartDate);

    expect(store.state.reactiveEvents.has(originalDateKey)).toBe(false);
    const movedEvent = store.state.reactiveEvents.get(newDateKey)?.get(original.id);
    expect(movedEvent?.resourceId).toBe('resource-2');
    expect(movedEvent?.isHidden).toBe(false);
  });

  it('falls back to the store-tracked draggedEvent when no event override is passed', () => {
    const original = buildEvent();
    const originalDateKey = DateUtils.convertDateToString(original.startDate);
    store.state.reactiveEvents = new Map([[originalDateKey, new Map([[original.id, original]])]]);
    store.state.draggedEvent = original;

    const newStartDate = new Date('2024-01-02T10:00:00');
    const newEndDate = new Date('2024-01-02T11:00:00');

    EventManager.handleEventDateChange(newStartDate, newEndDate);

    const newDateKey = DateUtils.convertDateToString(newStartDate);
    expect(store.state.reactiveEvents.has(originalDateKey)).toBe(false);
    expect(store.state.reactiveEvents.get(newDateKey)?.has(original.id)).toBe(true);
    expect(store.state.draggedEvent).toBeNull();
  });
});
