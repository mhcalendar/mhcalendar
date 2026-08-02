import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { IMHCalendarEvent, IMHCalendarFullOptions, IMHCalendarViewType, MhCalendar } from '@mhcalendar/react';
import { boldTheme, corporateTheme, minimalTheme } from '../theme-config/calendarThemes';
import ThemeToggle from '../components/ThemeToggle';

type StyleVariant = 'light' | 'dark' | 'corporate' | 'minimal' | 'bold' | 'custom';

type ThemeConfig = {
  style: Record<string, unknown>;
  config?: Record<string, unknown>;
};

const styleConfigs: Record<StyleVariant, ThemeConfig> = {
  light: { style: {}, config: { theme: 'light' } },
  dark: { style: {}, config: { theme: 'dark' } },
  corporate: { style: corporateTheme, config: {} },
  minimal: { style: minimalTheme, config: {} },
  bold: { style: boldTheme, config: {} },
  custom: { style: {}, config: {} },
};

const VIEW_TYPES: Array<{ value: string; label: string }> = [
  { value: 'DAY', label: 'Day' },
  { value: 'WEEK', label: 'Week' },
  { value: 'MONTH', label: 'Month' },
  { value: 'AGENDA', label: 'Agenda' },
  { value: 'SHIFTPLAN', label: 'Shift plan' },
];

const DAYS: Array<{ value: number; label: string }> = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

const SLOT_INTERVALS: Array<{ value: number; label: string }> = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
];

const HOUR_FORMATS: Array<{ value: string; label: string }> = [
  { value: 'h A', label: '8 AM' },
  { value: 'HH:mm', label: '08:00' },
  { value: 'h:mm A', label: '8:00 AM' },
];

const EVENT_DISPLAY_MODES: Array<{ value: string; label: string }> = [
  { value: 'side-by-side', label: 'Side by side' },
  { value: 'overlapping', label: 'Overlapping' },
];

const TIMEZONE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'None' },
  { value: 'Europe/Warsaw', label: 'Europe/Warsaw' },
  { value: 'Europe/London', label: 'Europe/London' },
  { value: 'America/New_York', label: 'America/New_York' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney' },
  { value: 'UTC', label: 'UTC' },
];

type DemoFormState = {
  viewType: string;
  availableViews: string[];
  showDateSwitcher: boolean;
  showViewTypeSwitcher: boolean;
  showCalendarNavigation: boolean;
  showViewHeader: boolean;
  timeFrom: number;
  timeTo: number;
  slotIntervalMinutes: number;
  hoursDisplayFormat: string;
  showTimeIndicator: boolean;
  allowEventDragging: boolean;
  allowEventResize: boolean;
  createEventOnClick: boolean;
  minEventDuration: number;
  eventDisplayMode: string;
  showAllDayTasks: boolean;
  allDayEventsHeight: number;
  makeAllDaysSticky: boolean;
  hiddenDays: number[];
  businessHoursEnabled: boolean;
  businessHoursStart: number;
  businessHoursEnd: number;
  blockBusinessHours: boolean;
  timezoneMain: string;
  timezoneRef2: string;
  timezoneRef3: string;
  timezoneLabel: string;
  shiftplanResourceCount: number;
  shiftplanDays: number;
  startDate: string;
  fixedHeight: string;
  virtualScrollHeight: string;
};

const DEFAULT_FORM_STATE: DemoFormState = {
  viewType: 'WEEK',
  availableViews: [],
  showDateSwitcher: true,
  showViewTypeSwitcher: true,
  showCalendarNavigation: false,
  showViewHeader: true,
  timeFrom: 12,
  timeTo: 18,
  slotIntervalMinutes: 60,
  hoursDisplayFormat: 'h A',
  showTimeIndicator: true,
  allowEventDragging: true,
  allowEventResize: true,
  createEventOnClick: false,
  minEventDuration: 15,
  eventDisplayMode: 'side-by-side',
  showAllDayTasks: false,
  allDayEventsHeight: 100,
  makeAllDaysSticky: false,
  hiddenDays: [],
  businessHoursEnabled: false,
  businessHoursStart: 9,
  businessHoursEnd: 17,
  blockBusinessHours: false,
  timezoneMain: '',
  timezoneRef2: '',
  timezoneRef3: '',
  timezoneLabel: '',
  shiftplanResourceCount: 4,
  shiftplanDays: 7,
  startDate: '',
  fixedHeight: '',
  virtualScrollHeight: '',
};

function getWeekDates() {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);

  const makeDate = (dayOffset: number, hour: number, minutes = 0) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + dayOffset);
    d.setHours(hour, minutes, 0, 0);
    return d;
  };

  return { makeDate };
}

function buildEvents() {
  const { makeDate } = getWeekDates();
  return [
    {
      id: '1',
      title: 'Design review',
      startDate: makeDate(0, 12),
      endDate: makeDate(0, 13),
      color: '#F87171',
    },
    {
      id: '2',
      title: 'Standup',
      color: '#EC4899',
      startDate: makeDate(1, 13),
      endDate: makeDate(1, 14),
    },
    {
      id: '3',
      title: 'Customer call',
      startDate: makeDate(2, 9),
      endDate: makeDate(2, 10),
      color: '#22C55E',
    },
    { id: '4', title: 'Pair on theming', startDate: makeDate(2, 14), endDate: makeDate(2, 16) },
    {
      id: '5',
      title: 'Release sync',
      color: '#3B82F6',
      startDate: makeDate(3, 15),
      endDate: makeDate(3, 18),
    },
  ];
}

export default function TryPage(): ReactNode {
  const markUrl = useBaseUrl('/img/mh-mark.png');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeStyle, setActiveStyle] = useState<StyleVariant>('corporate');
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<DemoFormState>(DEFAULT_FORM_STATE);
  const [configCopied, setConfigCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const setField = <K extends keyof DemoFormState>(key: K, value: DemoFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleListValue = (key: 'availableViews' | 'hiddenDays', value: string | number) => {
    setForm((prev) => {
      const list = prev[key] as Array<string | number>;
      const next = list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
      return { ...prev, [key]: next };
    });
  };

  const [events, setEvents] = useState<IMHCalendarEvent[]>(() => buildEvents());

  const handleEventUpdated = useCallback((updated: IMHCalendarEvent) => {
    setEvents((prev) => prev.map((event) => (event.id === updated.id ? { ...event, ...updated } : event)));
  }, []);

  const handleEventCreated = useCallback((created: IMHCalendarEvent) => {
    setEvents((prev) => [...prev, created]);
  }, []);

  const config: IMHCalendarFullOptions = useMemo(() => {
    const businessHours = form.businessHoursEnabled
      ? [{ dayOfWeek: [1, 2, 3, 4, 5], start: form.businessHoursStart, end: form.businessHoursEnd }]
      : [];

    const timezones = [form.timezoneMain, form.timezoneRef2, form.timezoneRef3].filter(Boolean);

    const resources =
      form.viewType === 'SHIFTPLAN'
        ? Array.from({ length: form.shiftplanResourceCount }, (_, index) => ({
            id: `resource-${index + 1}`,
            title: `Resource ${index + 1}`,
          }))
        : [];

    return {
      viewType: form.viewType as IMHCalendarViewType,
      availableViews: form.availableViews.length ? form.availableViews : undefined,
      showDateSwitcher: form.showDateSwitcher,
      showViewTypeSwitcher: form.showViewTypeSwitcher,
      showCalendarNavigation: form.showCalendarNavigation,
      showViewHeader: form.showViewHeader,
      allowEventDragging: form.allowEventDragging,
      allowEventResize: form.allowEventResize,
      createEventOnClick: form.createEventOnClick,
      minEventDuration: form.minEventDuration,
      eventDisplayMode: form.eventDisplayMode as IMHCalendarFullOptions['eventDisplayMode'],
      showTimeFrom: form.timeFrom,
      showTimeTo: form.timeTo,
      slotInterval: {
        hours: Math.floor(form.slotIntervalMinutes / 60),
        minutes: form.slotIntervalMinutes % 60,
      },
      hoursDisplayFormat: form.hoursDisplayFormat,
      showTimeIndicator: form.showTimeIndicator,
      showAllDayTasks: form.showAllDayTasks,
      allDayEventsHeight: form.allDayEventsHeight,
      makeAllDaysSticky: form.makeAllDaysSticky,
      hiddenDays: form.hiddenDays,
      businessHours,
      blockBusinessHours: form.blockBusinessHours,
      timezones,
      timezoneLabel: form.timezoneLabel || undefined,
      resources,
      shiftplanDays: form.shiftplanDays,
      startDate: form.startDate ? new Date(form.startDate) : undefined,
      fixedHeight: form.fixedHeight || undefined,
      virtualScrollHeight: form.virtualScrollHeight || undefined,
      onEventUpdated: handleEventUpdated,
      onEventCreated: handleEventCreated,
      theme: 'dark',
      ...styleConfigs[activeStyle].config,
      style: styleConfigs[activeStyle].style,
    };
  }, [form, activeStyle, handleEventUpdated, handleEventCreated]);

  const handleCopyConfig = () => {
    const { onEventUpdated: _onEventUpdated, onEventCreated: _onEventCreated, ...serializableConfig } = config;
    navigator.clipboard.writeText(JSON.stringify(serializableConfig, null, 2));
    setConfigCopied(true);
    setTimeout(() => setConfigCopied(false), 1500);
  };

  return (
    <Layout title="Try mhcalendar" description="Try the mhcalendar component live">
      <div className="mh-demo">
        <aside className={sidebarOpen ? 'mh-demo-sidebar open' : 'mh-demo-sidebar'}>
          <div className="mh-demo-sidebar-inner">
            <div className="mh-demo-sidebar-header">
              <Link className="mh-logo" to="/">
                <img src={markUrl} alt="mh logo" />
                <span>mhcalendar</span>
              </Link>
              <ThemeToggle />
            </div>

            <div className="mh-demo-sidebar-section">
              <span className="mh-demo-sidebar-label">Calendar theme</span>
              <select
                className="mh-style-select"
                value={activeStyle}
                onChange={(event) => setActiveStyle(event.target.value as StyleVariant)}
              >
                {(Object.keys(styleConfigs) as StyleVariant[]).map((variant) => (
                  <option key={variant} value={variant}>
                    {variant}
                  </option>
                ))}
              </select>
            </div>

            <div className="mh-demo-sidebar-section">
              <span className="mh-demo-sidebar-label">Custom config</span>
              <span className="mh-demo-sidebar-hint">
                Below you can check how each option affects the calendar.
              </span>
              <button type="button" className="mh-install-copy mh-demo-copy-config" onClick={handleCopyConfig}>
                {configCopied ? 'Copied!' : 'Copy config'}
              </button>
            </div>

            <details className="mh-demo-sidebar-group" open>
              <summary className="mh-demo-sidebar-label">Layout &amp; navigation</summary>
              <div className="mh-demo-sidebar-group-body">
                <label className="mh-demo-config-field">
                  <span>View type</span>
                  <select
                    value={form.viewType}
                    onChange={(event) => setField('viewType', event.target.value)}
                  >
                    {VIEW_TYPES.map((view) => (
                      <option key={view.value} value={view.value}>
                        {view.label}
                      </option>
                    ))}
                  </select>
                </label>
                <span className="mh-demo-sidebar-label">Available views</span>
                <div className="mh-demo-day-row">
                  {VIEW_TYPES.map((view) => (
                    <button
                      key={view.value}
                      type="button"
                      className={
                        form.availableViews.includes(view.value)
                          ? 'mh-demo-day-chip active'
                          : 'mh-demo-day-chip'
                      }
                      onClick={() => toggleListValue('availableViews', view.value)}
                    >
                      {view.label}
                    </button>
                  ))}
                </div>
                <span className="mh-demo-sidebar-hint">
                  None selected means every view is available in the switcher.
                </span>
                <label className="mh-demo-checkbox-field">
                  <input
                    type="checkbox"
                    checked={form.showDateSwitcher}
                    onChange={(event) => setField('showDateSwitcher', event.target.checked)}
                  />
                  <span>Show date switcher</span>
                </label>
                <label className="mh-demo-checkbox-field">
                  <input
                    type="checkbox"
                    checked={form.showViewTypeSwitcher}
                    onChange={(event) => setField('showViewTypeSwitcher', event.target.checked)}
                  />
                  <span>Show view type switcher</span>
                </label>
                <label className="mh-demo-checkbox-field">
                  <input
                    type="checkbox"
                    checked={form.showCalendarNavigation}
                    onChange={(event) => setField('showCalendarNavigation', event.target.checked)}
                  />
                  <span>Show calendar navigation</span>
                </label>
                <label className="mh-demo-checkbox-field">
                  <input
                    type="checkbox"
                    checked={form.showViewHeader}
                    onChange={(event) => setField('showViewHeader', event.target.checked)}
                  />
                  <span>Show view header</span>
                </label>
              </div>
            </details>

            <details className="mh-demo-sidebar-group" open>
              <summary className="mh-demo-sidebar-label">Time grid</summary>
              <div className="mh-demo-sidebar-group-body">
                <label className="mh-demo-config-field">
                  <span>Time from</span>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={form.timeFrom}
                    onChange={(event) => setField('timeFrom', Number(event.target.value))}
                  />
                </label>
                <label className="mh-demo-config-field">
                  <span>Time to</span>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={form.timeTo}
                    onChange={(event) => setField('timeTo', Number(event.target.value))}
                  />
                </label>
                <label className="mh-demo-config-field">
                  <span>Slot interval</span>
                  <select
                    value={form.slotIntervalMinutes}
                    onChange={(event) => setField('slotIntervalMinutes', Number(event.target.value))}
                  >
                    {SLOT_INTERVALS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="mh-demo-config-field">
                  <span>Hour format</span>
                  <select
                    value={form.hoursDisplayFormat}
                    onChange={(event) => setField('hoursDisplayFormat', event.target.value)}
                  >
                    {HOUR_FORMATS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="mh-demo-checkbox-field">
                  <input
                    type="checkbox"
                    checked={form.showTimeIndicator}
                    onChange={(event) => setField('showTimeIndicator', event.target.checked)}
                  />
                  <span>Show current time indicator</span>
                </label>
              </div>
            </details>

            <details className="mh-demo-sidebar-group" open>
              <summary className="mh-demo-sidebar-label">Events</summary>
              <div className="mh-demo-sidebar-group-body">
                <label className="mh-demo-checkbox-field">
                  <input
                    type="checkbox"
                    checked={form.allowEventDragging}
                    onChange={(event) => setField('allowEventDragging', event.target.checked)}
                  />
                  <span>Allow dragging</span>
                </label>
                <label className="mh-demo-checkbox-field">
                  <input
                    type="checkbox"
                    checked={form.allowEventResize}
                    onChange={(event) => setField('allowEventResize', event.target.checked)}
                  />
                  <span>Allow resize</span>
                </label>
                <label className="mh-demo-checkbox-field">
                  <input
                    type="checkbox"
                    checked={form.createEventOnClick}
                    onChange={(event) => setField('createEventOnClick', event.target.checked)}
                  />
                  <span>Create event on click</span>
                </label>
                <label className="mh-demo-config-field">
                  <span>Min duration (min)</span>
                  <input
                    type="number"
                    min={5}
                    step={5}
                    value={form.minEventDuration}
                    onChange={(event) => setField('minEventDuration', Number(event.target.value))}
                  />
                </label>
                <label className="mh-demo-config-field">
                  <span>Overlap display</span>
                  <select
                    value={form.eventDisplayMode}
                    onChange={(event) => setField('eventDisplayMode', event.target.value)}
                  >
                    {EVENT_DISPLAY_MODES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </details>

            <details className="mh-demo-sidebar-group" open>
              <summary className="mh-demo-sidebar-label">All-day row</summary>
              <div className="mh-demo-sidebar-group-body">
                <label className="mh-demo-checkbox-field">
                  <input
                    type="checkbox"
                    checked={form.showAllDayTasks}
                    onChange={(event) => setField('showAllDayTasks', event.target.checked)}
                  />
                  <span>Show all-day row</span>
                </label>
                <label className="mh-demo-config-field">
                  <span>Row height (px)</span>
                  <input
                    type="number"
                    min={40}
                    step={10}
                    value={form.allDayEventsHeight}
                    onChange={(event) => setField('allDayEventsHeight', Number(event.target.value))}
                  />
                </label>
                <label className="mh-demo-checkbox-field">
                  <input
                    type="checkbox"
                    checked={form.makeAllDaysSticky}
                    onChange={(event) => setField('makeAllDaysSticky', event.target.checked)}
                  />
                  <span>Make all-day row sticky</span>
                </label>
              </div>
            </details>

            <details className="mh-demo-sidebar-group" open>
              <summary className="mh-demo-sidebar-label">Hidden days</summary>
              <div className="mh-demo-sidebar-group-body">
                <div className="mh-demo-day-row">
                  {DAYS.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      className={
                        form.hiddenDays.includes(day.value) ? 'mh-demo-day-chip active' : 'mh-demo-day-chip'
                      }
                      onClick={() => toggleListValue('hiddenDays', day.value)}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                <span className="mh-demo-sidebar-hint">Tap a day to hide it from week/day view.</span>
              </div>
            </details>

            <details className="mh-demo-sidebar-group">
              <summary className="mh-demo-sidebar-label">Business hours</summary>
              <div className="mh-demo-sidebar-group-body">
                <label className="mh-demo-checkbox-field">
                  <input
                    type="checkbox"
                    checked={form.businessHoursEnabled}
                    onChange={(event) => setField('businessHoursEnabled', event.target.checked)}
                  />
                  <span>Enable business hours (Mon–Fri)</span>
                </label>
                {form.businessHoursEnabled ? (
                  <>
                    <label className="mh-demo-config-field">
                      <span>Start</span>
                      <input
                        type="number"
                        min={0}
                        max={23}
                        value={form.businessHoursStart}
                        onChange={(event) => setField('businessHoursStart', Number(event.target.value))}
                      />
                    </label>
                    <label className="mh-demo-config-field">
                      <span>End</span>
                      <input
                        type="number"
                        min={1}
                        max={24}
                        value={form.businessHoursEnd}
                        onChange={(event) => setField('businessHoursEnd', Number(event.target.value))}
                      />
                    </label>
                  </>
                ) : null}
                <label className="mh-demo-checkbox-field">
                  <input
                    type="checkbox"
                    checked={form.blockBusinessHours}
                    onChange={(event) => setField('blockBusinessHours', event.target.checked)}
                  />
                  <span>Block dropping outside business hours</span>
                </label>
              </div>
            </details>

            <details className="mh-demo-sidebar-group">
              <summary className="mh-demo-sidebar-label">Timezones</summary>
              <div className="mh-demo-sidebar-group-body">
                <label className="mh-demo-config-field">
                  <span>Main</span>
                  <select
                    value={form.timezoneMain}
                    onChange={(event) => setField('timezoneMain', event.target.value)}
                  >
                    {TIMEZONE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="mh-demo-config-field">
                  <span>Reference 2</span>
                  <select
                    value={form.timezoneRef2}
                    onChange={(event) => setField('timezoneRef2', event.target.value)}
                  >
                    {TIMEZONE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="mh-demo-config-field">
                  <span>Reference 3</span>
                  <select
                    value={form.timezoneRef3}
                    onChange={(event) => setField('timezoneRef3', event.target.value)}
                  >
                    {TIMEZONE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="mh-demo-config-field">
                  <span>Custom label</span>
                  <input
                    type="text"
                    placeholder="auto"
                    value={form.timezoneLabel}
                    onChange={(event) => setField('timezoneLabel', event.target.value)}
                  />
                </label>
              </div>
            </details>

            {form.viewType === 'SHIFTPLAN' ? (
              <details className="mh-demo-sidebar-group" open>
                <summary className="mh-demo-sidebar-label">Shift plan</summary>
                <div className="mh-demo-sidebar-group-body">
                  <label className="mh-demo-config-field">
                    <span>Resources</span>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={form.shiftplanResourceCount}
                      onChange={(event) =>
                        setField('shiftplanResourceCount', Number(event.target.value))
                      }
                    />
                  </label>
                  <label className="mh-demo-config-field">
                    <span>Days shown</span>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={form.shiftplanDays}
                      onChange={(event) => setField('shiftplanDays', Number(event.target.value))}
                    />
                  </label>
                </div>
              </details>
            ) : null}

            <details className="mh-demo-sidebar-group">
              <summary className="mh-demo-sidebar-label">Advanced</summary>
              <div className="mh-demo-sidebar-group-body">
                <label className="mh-demo-config-field">
                  <span>Start date</span>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(event) => setField('startDate', event.target.value)}
                  />
                </label>
                <label className="mh-demo-config-field">
                  <span>Fixed height</span>
                  <input
                    type="text"
                    placeholder="e.g. 600px"
                    value={form.fixedHeight}
                    onChange={(event) => setField('fixedHeight', event.target.value)}
                  />
                </label>
                <label className="mh-demo-config-field">
                  <span>Virtual scroll height</span>
                  <input
                    type="text"
                    placeholder="e.g. 800px"
                    value={form.virtualScrollHeight}
                    onChange={(event) => setField('virtualScrollHeight', event.target.value)}
                  />
                </label>
              </div>
            </details>
          </div>
        </aside>
        <button
          type="button"
          className="mh-demo-sidebar-toggle"
          onClick={() => setSidebarOpen((open) => !open)}
          title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        >
          {sidebarOpen ? '‹' : '›'}
        </button>
        <main className="mh-demo-main">
          {mounted ? <MhCalendar config={config} events={events} /> : null}
        </main>
      </div>
    </Layout>
  );
}
