import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {
  IMHCalendarEvent,
  IMHCalendarFullOptions,
  IMHCalendarViewType,
  MhCalendar,
} from '@mhcalendar/react';
// Bare import so TypeScript loads Day.js's ambient locale module declarations
// (`declare module 'dayjs/locale/*'`) before resolving the locale imports below.
import 'dayjs';
import localeDe from 'dayjs/locale/de';
import localeEs from 'dayjs/locale/es';
import localeFr from 'dayjs/locale/fr';
import localePl from 'dayjs/locale/pl';
import { boldTheme, corporateTheme, minimalTheme } from '../theme-config/calendarThemes';
import ThemeToggle from '../components/ThemeToggle';

type StyleVariant = 'light' | 'dark' | 'corporate' | 'minimal' | 'bold' | 'custom' | 'saved';

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
  saved: { style: {}, config: {} },
};

const SAVED_CONFIG_STORAGE_KEY = 'mh-try-saved-config';

const VIEW_TYPES: Array<{ value: string; label: string }> = [
  { value: 'DAY', label: 'Day' },
  { value: 'WEEK', label: 'Week' },
  { value: 'MONTH', label: 'Month' },
  { value: 'AGENDA', label: 'Agenda' },
  { value: 'RESOURCE', label: 'Resource' },
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

type PropertyField = { key: string; label: string; type: 'color' | 'text'; placeholder: string };

const PROPERTY_FIELDS: PropertyField[] = [
  { key: 'eventBackgroundColor', label: 'Event background', type: 'color', placeholder: '#8a79ff' },
  {
    key: 'headerTodayBackgroundColor',
    label: 'Today highlight',
    type: 'color',
    placeholder: '#8a79ff',
  },
  {
    key: 'currentTimeColor',
    label: 'Current time indicator',
    type: 'color',
    placeholder: '#db372d',
  },
  { key: 'bordersColor', label: 'Grid borders', type: 'color', placeholder: '#2a2a36' },
  { key: 'eventResizeHandleColor', label: 'Resize handle', type: 'color', placeholder: '#8a79ff' },
  {
    key: 'eventTimeLabelBg',
    label: 'Resize tooltip background',
    type: 'color',
    placeholder: '#ffffff',
  },
  {
    key: 'eventTimeLabelColor',
    label: 'Resize tooltip text',
    type: 'color',
    placeholder: '#222222',
  },
  {
    key: 'eventTimeDiffColor',
    label: 'Duration diff label',
    type: 'color',
    placeholder: '#3578fa',
  },
  { key: 'mainBackgroundColor', label: 'Main background', type: 'color', placeholder: '#131314' },
  {
    key: 'navigationBackgroundColor',
    label: 'Navigation background',
    type: 'color',
    placeholder: '#1b1b1b',
  },
  { key: 'fontColor', label: 'Font color', type: 'color', placeholder: '#d4d4d4' },
  { key: 'dateFontColor', label: 'Date font color', type: 'color', placeholder: '#82828e' },
  { key: 'buttonsColor', label: 'Buttons color', type: 'color', placeholder: '#232323' },
  { key: 'holidayDateColor', label: 'Holiday date color', type: 'color', placeholder: '#8a2929' },
  {
    key: 'nonBusinessHoursOverlayColor',
    label: 'Non-business hours overlay',
    type: 'text',
    placeholder: 'rgba(0, 0, 0, 0.03)',
  },
  { key: 'fontFamily', label: 'Font family', type: 'text', placeholder: 'system-ui' },
  {
    key: 'eventHoverFilter',
    label: 'Event hover filter',
    type: 'text',
    placeholder: 'brightness(0.88)',
  },
  { key: 'timeSlotWidth', label: 'Time column width', type: 'text', placeholder: '60px' },
  { key: 'viewHeaderHeight', label: 'View header height', type: 'text', placeholder: '70px' },
  { key: 'monthEventHeight', label: 'Month event height', type: 'text', placeholder: '20px' },
  {
    key: 'calendarNavigationHeight',
    label: 'Navigation bar height',
    type: 'text',
    placeholder: '80px',
  },
];

const MAIN_BACKGROUND_PROPERTY_FIELD = PROPERTY_FIELDS.find(
  (property) => property.key === 'mainBackgroundColor',
)!;

const DARK_PROPERTY_DEFAULTS: Record<string, string> = {
  bordersColor: '#2a2a36',
  mainBackgroundColor: '#131314',
  navigationBackgroundColor: '#1b1b1b',
  fontColor: '#d4d4d4',
  dateFontColor: '#82828e',
  buttonsColor: '#232323',
  holidayDateColor: '#8a2929',
};

const LIGHT_PROPERTY_DEFAULTS: Record<string, string> = {
  bordersColor: '#e2e2e8',
  mainBackgroundColor: '#ffffff',
  navigationBackgroundColor: '#f5f5f7',
  fontColor: '#1a1a1a',
  dateFontColor: '#6e6e80',
  buttonsColor: '#ebebef',
  holidayDateColor: '#c0392b',
};

function getPropertyThemeDefault(property: PropertyField, activeStyle: StyleVariant): string {
  const baseDefaults = activeStyle === 'light' ? LIGHT_PROPERTY_DEFAULTS : DARK_PROPERTY_DEFAULTS;
  const themeProperties = (
    styleConfigs[activeStyle].style as { properties?: Record<string, string> }
  ).properties;
  return themeProperties?.[property.key] ?? baseDefaults[property.key] ?? property.placeholder;
}

const LOCALE_PRESETS: Array<{ value: string; label: string; locale: string | ILocale }> = [
  { value: 'en', label: 'English', locale: 'en' },
  { value: 'pl', label: 'Polski', locale: localePl },
  { value: 'de', label: 'Deutsch', locale: localeDe },
  { value: 'es', label: 'Español', locale: localeEs },
  { value: 'fr', label: 'Français', locale: localeFr },
];

const VIEW_LABEL_FIELDS: Array<{ key: keyof DemoFormState; view: IMHCalendarViewType; label: string }> =
  [
    { key: 'labelViewMonth', view: 'MONTH' as IMHCalendarViewType, label: 'Month' },
    { key: 'labelViewWeek', view: 'WEEK' as IMHCalendarViewType, label: 'Week' },
    { key: 'labelViewDay', view: 'DAY' as IMHCalendarViewType, label: 'Day' },
    { key: 'labelViewAgenda', view: 'AGENDA' as IMHCalendarViewType, label: 'Agenda' },
    { key: 'labelViewResource', view: 'RESOURCE' as IMHCalendarViewType, label: 'Resource' },
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
  resourceCount: number;
  resourceDays: number;
  startDate: string;
  fixedHeight: string;
  virtualScrollHeight: string;
  properties: Record<string, string>;
  localePreset: string;
  labelToday: string;
  labelMoreEvents: string;
  labelViewMonth: string;
  labelViewWeek: string;
  labelViewDay: string;
  labelViewAgenda: string;
  labelViewResource: string;
};

const DEFAULT_FORM_STATE: DemoFormState = {
  viewType: 'WEEK',
  availableViews: [],
  showDateSwitcher: true,
  showViewTypeSwitcher: true,
  showCalendarNavigation: true,
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
  resourceCount: 4,
  resourceDays: 7,
  startDate: '',
  fixedHeight: '',
  virtualScrollHeight: '',
  properties: {},
  localePreset: 'en',
  labelToday: '',
  labelMoreEvents: '',
  labelViewMonth: '',
  labelViewWeek: '',
  labelViewDay: '',
  labelViewAgenda: '',
  labelViewResource: '',
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

function getResourceDates() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const makeDate = (dayOffset: number, hour: number, minutes = 0) => {
    const d = new Date(today);
    d.setDate(today.getDate() + dayOffset);
    d.setHours(hour, minutes, 0, 0);
    return d;
  };

  return { makeDate };
}

function buildEvents() {
  const { makeDate } = getWeekDates();
  const { makeDate: makeResourceDate } = getResourceDates();
  return [
    {
      id: '1',
      title: 'Design review',
      startDate: makeDate(0, 12),
      endDate: makeDate(0, 13),
      resourceId: 'resource-1',
    },
    {
      id: '2',
      title: 'Standup',
      startDate: makeDate(1, 13),
      endDate: makeDate(1, 14),
      resourceId: 'resource-2',
    },
    {
      id: '3',
      title: 'Customer call',
      startDate: makeDate(2, 9),
      endDate: makeDate(2, 10),
      resourceId: 'resource-3',
    },
    {
      id: '4',
      title: 'Pair on theming',
      startDate: makeDate(2, 14),
      endDate: makeDate(2, 16),
      resourceId: 'resource-4',
    },
    {
      id: '5',
      title: 'Release sync',
      startDate: makeDate(3, 15),
      endDate: makeDate(3, 18),
      resourceId: 'resource-1',
    },
    {
      id: 'shift-1',
      title: 'Morning shift',
      startDate: makeResourceDate(0, 8),
      endDate: makeResourceDate(0, 12),
      color: '#F59E0B',
      resourceId: 'resource-1',
    },
    {
      id: 'shift-2',
      title: 'Afternoon shift',
      startDate: makeResourceDate(0, 13),
      endDate: makeResourceDate(0, 17),
      resourceId: 'resource-2',
    },
    {
      id: 'shift-3',
      title: 'Evening shift',
      startDate: makeResourceDate(1, 14),
      endDate: makeResourceDate(1, 18),
      resourceId: 'resource-3',
    },
    {
      id: 'shift-4',
      title: 'Warehouse check',
      startDate: makeResourceDate(2, 9),
      endDate: makeResourceDate(2, 11),
      resourceId: 'resource-4',
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
  const [configSaved, setConfigSaved] = useState(false);
  const [savedConfig, setSavedConfig] = useState<DemoFormState | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = window.localStorage.getItem(SAVED_CONFIG_STORAGE_KEY);
      if (raw) setSavedConfig(JSON.parse(raw));
    } catch {
      // ignore malformed/unavailable storage
    }
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

  const setProperty = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, properties: { ...prev.properties, [key]: value } }));
  };

  const resetProperty = (key: string) => {
    setForm((prev) => {
      const properties = { ...prev.properties };
      delete properties[key];
      return { ...prev, properties };
    });
  };

  const [events, setEvents] = useState<IMHCalendarEvent[]>(() => buildEvents());

  const handleEventUpdated = useCallback((updated: IMHCalendarEvent) => {
    setEvents((prev) =>
      prev.map((event) => (event.id === updated.id ? { ...event, ...updated } : event)),
    );
  }, []);

  const handleEventCreated = useCallback((created: IMHCalendarEvent) => {
    setEvents((prev) => [...prev, created]);
  }, []);

  const config: IMHCalendarFullOptions = useMemo(() => {
    const businessHours = form.businessHoursEnabled
      ? [{ dayOfWeek: [1, 2, 3, 4, 5], start: form.businessHoursStart, end: form.businessHoursEnd }]
      : [];

    const timezones = [form.timezoneMain, form.timezoneRef2, form.timezoneRef3].filter(Boolean);

    const resources = Array.from({ length: form.resourceCount }, (_, index) => ({
      id: `resource-${index + 1}`,
      title: `Resource ${index + 1}`,
    }));

    const baseStyle = styleConfigs[activeStyle].style as Record<string, unknown>;
    const propertyOverrides = Object.fromEntries(
      Object.entries(form.properties).filter(([, value]) => value !== ''),
    );
    const style = Object.keys(propertyOverrides).length
      ? { ...baseStyle, properties: { ...(baseStyle.properties as object), ...propertyOverrides } }
      : baseStyle;

    const localePreset =
      LOCALE_PRESETS.find((preset) => preset.value === form.localePreset) ?? LOCALE_PRESETS[0];

    const viewLabels = Object.fromEntries(
      VIEW_LABEL_FIELDS.filter((field) => form[field.key]).map((field) => [
        field.view,
        form[field.key],
      ]),
    );

    const labels = {
      today: form.labelToday || undefined,
      moreEvents: form.labelMoreEvents
        ? (hiddenCount: number) => form.labelMoreEvents.replace('{count}', String(hiddenCount))
        : undefined,
      views: viewLabels,
    };

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
      resourceDays: form.resourceDays,
      startDate: form.startDate ? new Date(form.startDate) : undefined,
      fixedHeight: form.fixedHeight || undefined,
      virtualScrollHeight: form.virtualScrollHeight || undefined,
      locale: localePreset.locale,
      labels,
      onEventUpdated: handleEventUpdated,
      onEventCreated: handleEventCreated,
      theme: 'dark',
      ...styleConfigs[activeStyle].config,
      style,
    };
  }, [form, activeStyle, handleEventUpdated, handleEventCreated]);

  const mainBackgroundColor = useMemo(
    () =>
      form.properties.mainBackgroundColor ||
      getPropertyThemeDefault(MAIN_BACKGROUND_PROPERTY_FIELD, activeStyle),
    [form.properties, activeStyle],
  );

  const handleCopyConfig = () => {
    const {
      onEventUpdated: _onEventUpdated,
      onEventCreated: _onEventCreated,
      ...serializableConfig
    } = config;
    navigator.clipboard.writeText(JSON.stringify(serializableConfig, null, 2));
    setConfigCopied(true);
    setTimeout(() => setConfigCopied(false), 1500);
  };

  const handleSaveConfig = () => {
    const flattenedProperties = Object.fromEntries(
      PROPERTY_FIELDS.map((property) => [
        property.key,
        form.properties[property.key] || getPropertyThemeDefault(property, activeStyle),
      ]),
    );
    const snapshot: DemoFormState = { ...form, properties: flattenedProperties };
    window.localStorage.setItem(SAVED_CONFIG_STORAGE_KEY, JSON.stringify(snapshot));
    setSavedConfig(snapshot);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 1500);
  };

  const handleStyleChange = (variant: StyleVariant) => {
    if (variant === 'saved' && savedConfig) {
      setForm(savedConfig);
    }
    setActiveStyle(variant);
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
                onChange={(event) => handleStyleChange(event.target.value as StyleVariant)}
              >
                {(Object.keys(styleConfigs) as StyleVariant[])
                  .filter((variant) => variant !== 'saved' || savedConfig)
                  .map((variant) => (
                    <option key={variant} value={variant}>
                      {variant === 'saved' ? 'Saved config' : variant}
                    </option>
                  ))}
              </select>
            </div>

            <div className="mh-demo-sidebar-section">
              <span className="mh-demo-sidebar-label">Custom config</span>
              <span className="mh-demo-sidebar-hint">
                Below you can check how each option affects the calendar.
              </span>
              <div className="mh-demo-config-actions">
                <button
                  type="button"
                  className="mh-demo-btn mh-demo-btn-outline"
                  onClick={handleSaveConfig}
                >
                  {configSaved ? 'Saved!' : 'Save config'}
                </button>
                <button
                  type="button"
                  className="mh-demo-btn mh-demo-btn-filled"
                  onClick={handleCopyConfig}
                >
                  {configCopied ? 'Copied!' : 'Copy config'}
                </button>
              </div>
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

            <details className="mh-demo-sidebar-group">
              <summary className="mh-demo-sidebar-label">Locale &amp; labels</summary>
              <div className="mh-demo-sidebar-group-body">
                <label className="mh-demo-config-field">
                  <span>Day.js locale</span>
                  <select
                    value={form.localePreset}
                    onChange={(event) => setField('localePreset', event.target.value)}
                  >
                    {LOCALE_PRESETS.map((preset) => (
                      <option key={preset.value} value={preset.value}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </label>
                <span className="mh-demo-sidebar-hint">
                  Controls day/month names (e.g. weekday headers, date range label).
                </span>
                <label className="mh-demo-config-field">
                  <span>"Today" label</span>
                  <input
                    type="text"
                    placeholder="Today"
                    value={form.labelToday}
                    onChange={(event) => setField('labelToday', event.target.value)}
                  />
                </label>
                <label className="mh-demo-config-field">
                  <span>"+N more" label</span>
                  <input
                    type="text"
                    placeholder="+{count} more"
                    value={form.labelMoreEvents}
                    onChange={(event) => setField('labelMoreEvents', event.target.value)}
                  />
                </label>
                <span className="mh-demo-sidebar-hint">
                  Use <code>{'{count}'}</code> as a placeholder for the hidden event count.
                </span>
                <span className="mh-demo-sidebar-label">View switcher names</span>
                {VIEW_LABEL_FIELDS.map((field) => (
                  <label key={field.key} className="mh-demo-config-field">
                    <span>{field.label}</span>
                    <input
                      type="text"
                      placeholder={field.label}
                      value={form[field.key] as string}
                      onChange={(event) => setField(field.key, event.target.value)}
                    />
                  </label>
                ))}
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
                    onChange={(event) =>
                      setField('slotIntervalMinutes', Number(event.target.value))
                    }
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
                        form.hiddenDays.includes(day.value)
                          ? 'mh-demo-day-chip active'
                          : 'mh-demo-day-chip'
                      }
                      onClick={() => toggleListValue('hiddenDays', day.value)}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                <span className="mh-demo-sidebar-hint">
                  Tap a day to hide it from week/day view.
                </span>
              </div>
            </details>

            <details className="mh-demo-sidebar-group">
              <summary className="mh-demo-sidebar-label">Properties</summary>
              <div className="mh-demo-sidebar-group-body">
                <span className="mh-demo-sidebar-hint">
                  Overrides the CSS properties exposed by the selected theme. Clear a field to fall
                  back to the theme default.
                </span>
                {PROPERTY_FIELDS.map((property) => {
                  const themeValue = getPropertyThemeDefault(property, activeStyle);

                  return (
                    <label key={property.key} className="mh-demo-property-field">
                      <span>{property.label}</span>
                      <span className="mh-demo-property-controls">
                        {property.type === 'color' ? (
                          <input
                            type="color"
                            value={form.properties[property.key] || themeValue}
                            onChange={(event) => setProperty(property.key, event.target.value)}
                          />
                        ) : null}
                        <input
                          type="text"
                          placeholder={themeValue}
                          value={form.properties[property.key] || ''}
                          onChange={(event) => setProperty(property.key, event.target.value)}
                        />
                        {form.properties[property.key] ? (
                          <button
                            type="button"
                            className="mh-demo-property-reset"
                            title="Reset to theme default"
                            aria-label={`Reset ${property.label} to theme default`}
                            onClick={() => resetProperty(property.key)}
                          >
                            ×
                          </button>
                        ) : null}
                      </span>
                    </label>
                  );
                })}
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
                        onChange={(event) =>
                          setField('businessHoursStart', Number(event.target.value))
                        }
                      />
                    </label>
                    <label className="mh-demo-config-field">
                      <span>End</span>
                      <input
                        type="number"
                        min={1}
                        max={24}
                        value={form.businessHoursEnd}
                        onChange={(event) =>
                          setField('businessHoursEnd', Number(event.target.value))
                        }
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

            {form.viewType === 'RESOURCE' ? (
              <details className="mh-demo-sidebar-group" open>
                <summary className="mh-demo-sidebar-label">Resource</summary>
                <div className="mh-demo-sidebar-group-body">
                  <label className="mh-demo-config-field">
                    <span>Resources</span>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={form.resourceCount}
                      onChange={(event) =>
                        setField('resourceCount', Number(event.target.value))
                      }
                    />
                  </label>
                  <label className="mh-demo-config-field">
                    <span>Days shown</span>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={form.resourceDays}
                      onChange={(event) => setField('resourceDays', Number(event.target.value))}
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
          {mounted ? (
            <div
              className="mh-demo-calendar-wrapper"
              style={{ backgroundColor: mainBackgroundColor }}
            >
              <MhCalendar config={config} events={events} />
            </div>
          ) : null}
        </main>
      </div>
    </Layout>
  );
}
