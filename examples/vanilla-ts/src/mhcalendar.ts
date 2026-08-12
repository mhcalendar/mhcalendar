import type { IMHCalendarEvent, IMHCalendarViewType } from '@mhcalendar/calendar';

const mhcalendar = document.getElementById('my-calendar') as HTMLMhCalendarElement;

mhcalendar.config = {
  viewType: 'MONTH' as IMHCalendarViewType,
  theme: 'dark',
};

const today = new Date();
const at = (dayOffset: number, hour: number, minute = 0) => {
  const date = new Date(today);
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const events: IMHCalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Team standup',
    startDate: at(0, 9),
    endDate: at(0, 9, 30),
    color: '#4f46e5',
  },
  { id: 'evt-2', title: 'Client call', startDate: at(0, 13), endDate: at(0, 14), color: '#0891b2' },
  {
    id: 'evt-3',
    title: 'Design review',
    startDate: at(1, 11),
    endDate: at(1, 12),
    color: '#7c3aed',
  },
  {
    id: 'evt-4',
    title: 'Lunch with Ana',
    startDate: at(2, 12),
    endDate: at(2, 13),
    color: '#059669',
  },
  {
    id: 'evt-5',
    title: 'Sprint planning',
    startDate: at(3, 10),
    endDate: at(3, 11, 30),
    color: '#4f46e5',
  },
  {
    id: 'evt-6',
    title: 'Company offsite',
    startDate: at(4, 0),
    endDate: at(4, 23, 59),
    allDay: true,
    color: '#dc2626',
  },
  {
    id: 'evt-7',
    title: '1:1 with manager',
    startDate: at(5, 15),
    endDate: at(5, 15, 30),
    color: '#0891b2',
  },
  { id: 'evt-8', title: 'Code review', startDate: at(6, 16), endDate: at(6, 17), color: '#059669' },
  {
    id: 'evt-9',
    title: 'Dentist appointment',
    startDate: at(-1, 8),
    endDate: at(-1, 9),
    color: '#ea580c',
  },
  {
    id: 'evt-10',
    title: 'Product demo',
    startDate: at(2, 17),
    endDate: at(2, 18),
    color: '#7c3aed',
  },
];

mhcalendar.events = events;
