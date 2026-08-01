import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { IMHCalendarFullOptions, IMHCalendarViewType, MhCalendar } from '@mhcalendar/react';
import { boldTheme, corporateTheme, minimalTheme } from '../theme-config/calendarThemes';
import ThemeToggle from '../components/ThemeToggle';

type StyleVariant = 'light' | 'dark' | 'corporate' | 'minimal' | 'bold' | 'custom';

type ThemeConfig = {
  style: Record<string, unknown>;
  config?: Record<string, unknown>;
  events?: ReturnType<typeof buildEvents>;
};

const styleConfigs: Record<StyleVariant, ThemeConfig> = {
  light: { style: {}, config: { theme: 'light' } },
  dark: { style: {}, config: { theme: 'dark' } },
  corporate: { style: corporateTheme, config: {} },
  minimal: { style: minimalTheme, config: {} },
  bold: { style: boldTheme, config: {} },
  custom: { style: {}, config: {} },
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
  const [customTimeFrom, setCustomTimeFrom] = useState(12);
  const [customTimeTo, setCustomTimeTo] = useState(18);

  useEffect(() => {
    setMounted(true);
  }, []);

  const defaultEvents = useMemo(() => buildEvents(), []);
  const activeEvents = styleConfigs[activeStyle].events ?? defaultEvents;
  const config: IMHCalendarFullOptions = useMemo(
    () => ({
      viewType: 'WEEK' as IMHCalendarViewType,
      showCalendarNavigation: false,
      allowEventDragging: true,
      showTimeFrom: customTimeFrom,
      showTimeTo: customTimeTo,
      showAllDayTasks: false,
      theme: 'dark',
      ...styleConfigs[activeStyle].config,
      style: styleConfigs[activeStyle].style,
    }),
    [activeStyle, customTimeFrom, customTimeTo],
  );

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
              <span className="mh-demo-sidebar-label">Config</span>
              <label className="mh-demo-config-field">
                <span>Time from</span>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={customTimeFrom}
                  onChange={(event) => {
                    setCustomTimeFrom(Number(event.target.value));
                    setActiveStyle('custom');
                  }}
                />
              </label>
              <label className="mh-demo-config-field">
                <span>Time to</span>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={customTimeTo}
                  onChange={(event) => {
                    setCustomTimeTo(Number(event.target.value));
                    setActiveStyle('custom');
                  }}
                />
              </label>
            </div>
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
          {mounted ? <MhCalendar config={config} events={activeEvents} /> : null}
        </main>
      </div>
    </Layout>
  );
}
