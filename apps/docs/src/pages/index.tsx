import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { MhCalendar } from '@mhcalendar/react';
import {
  boldTheme,
  corporateTheme,
  darkTheme,
  minimalTheme,
  scrollTheme,
  timezoneTheme,
} from '../theme-config/calendarThemes';

type StyleVariant = 'corporate' | 'minimal' | 'dark' | 'bold' | 'scroll' | 'timezone';

type ThemeConfig = {
  style: Record<string, unknown>;
  config?: Record<string, unknown>;
  events?: ReturnType<typeof buildEvents>;
};

const styleConfigs: Record<StyleVariant, ThemeConfig> = {
  corporate: { style: corporateTheme, config: { showTimeFrom: 8, showTimeTo: 18 } },
  minimal: { style: minimalTheme, config: { showTimeFrom: 9, showTimeTo: 17 } },
  dark: { style: darkTheme, config: { showTimeFrom: 7, showTimeTo: 22 } },
  bold: { style: boldTheme, config: { showTimeFrom: 6, showTimeTo: 20 } },
  scroll: {
    style: scrollTheme,
    config: {
      showTimeFrom: 1,
      showTimeTo: 24,
      fixedHeight: '580px',
      virtualScrollHeight: '1800px',
    },
  },
  timezone: {
    style: timezoneTheme,
    config: {
      showTimeFrom: 7,
      showTimeTo: 20,
      showAllDayTasks: false,
      timezones: ['America/Los_Angeles', 'America/New_York', 'Europe/London'],
    },
    events: buildTimezoneEvents(),
  },
};

const features = [
  'Multiple Views',
  'Drag & Drop',
  'Event Resizing',
  'Resources (Shift Plan Coming Soon)',
  'Business Hours',
  'Multi-Timezone',
  'Overlap Modes',
  'Custom Event Rendering',
  'All-Day Events',
  'Event Callbacks',
  'Ready-Made Themes',
  'Current Time Indicator',
];

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
    { id: '1', title: 'Sprint Planning', startDate: makeDate(0, 9), endDate: makeDate(0, 11) },
    { id: '2', title: 'Design Review', startDate: makeDate(1, 10), endDate: makeDate(1, 11) },
    { id: '3', title: 'Team Standup', startDate: makeDate(2, 9), endDate: makeDate(2, 10) },
    { id: '4', title: '1:1 with Manager', startDate: makeDate(2, 14), endDate: makeDate(2, 15) },
    { id: '5', title: 'Code Review', startDate: makeDate(3, 13), endDate: makeDate(3, 15) },
    { id: '6', title: 'Client Call', startDate: makeDate(4, 11), endDate: makeDate(4, 12) },
    { id: '7', title: 'Retrospective', startDate: makeDate(4, 15), endDate: makeDate(4, 16) },
  ];
}

function buildTimezoneEvents() {
  const { makeDate } = getWeekDates();
  return [
    { id: 't1', title: 'LA Kickoff', startDate: makeDate(0, 9), endDate: makeDate(0, 10) },
    { id: 't2', title: 'NY All-hands', startDate: makeDate(1, 12), endDate: makeDate(1, 14) },
    { id: 't3', title: 'London Sync', startDate: makeDate(2, 8), endDate: makeDate(2, 9) },
    {
      id: 't4',
      title: 'Cross-region Review',
      startDate: makeDate(2, 14),
      endDate: makeDate(2, 16),
    },
  ];
}

export default function Home(): ReactNode {
  const logoUrl = useBaseUrl('/img/logo.svg');
  const [activeStyle, setActiveStyle] = useState<StyleVariant>('corporate');
  const [mounted, setMounted] = useState(false);
  const [compactHeader, setCompactHeader] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setCompactHeader((prev) => {
        if (prev) {
          return y > 20;
        }
        return y > 44;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const defaultEvents = useMemo(() => buildEvents(), []);
  const activeEvents = styleConfigs[activeStyle].events ?? defaultEvents;
  const config = useMemo(
    () => ({
      viewType: 'WEEK',
      showCalendarNavigation: false,
      allowEventDragging: false,
      showTimeFrom: 8,
      showTimeTo: 18,
      ...styleConfigs[activeStyle].config,
      style: styleConfigs[activeStyle].style,
    }),
    [activeStyle],
  );

  return (
    <Layout title="MH Calendar" description="Modern JavaScript calendar component">
      <main className="mh-home-page">
        <header
          className={compactHeader ? 'mh-home-topbar mh-home-topbarCompact' : 'mh-home-topbar'}
        >
          <a className="mh-home-brand" href="/">
            <img src={logoUrl} alt="MH Calendar logo" />
            <span
              className={
                compactHeader ? 'mh-home-brandText mh-home-brandTextHidden' : 'mh-home-brandText'
              }
            >
              MH Calendar
            </span>
          </a>
          <nav className="mh-home-nav">
            <a href="#demo">{'<Demo />'}</a>
            <a href="#features">{'<Features />'}</a>
            <a href="#pricing">{'<Pricing />'}</a>
            <Link to="/docs/intro">{'<Docs />'}</Link>
          </nav>
        </header>

        <section id="demo" className="mh-home-hero">
          <h1>A Fully Customizable JavaScript Calendar</h1>
          <p>Built with Stencil.js, with a first-class React wrapper included.</p>
          <div className="mh-home-previewLayout">
            <div className="mh-home-switcher">
              {(Object.keys(styleConfigs) as StyleVariant[]).map((variant) => (
                <button
                  key={variant}
                  type="button"
                  className={variant === activeStyle ? 'mh-home-switchActive' : 'mh-home-switchBtn'}
                  onClick={() => setActiveStyle(variant)}
                >
                  {`--${variant}`}
                </button>
              ))}
            </div>
            <div className="mh-home-preview">
              {mounted ? <MhCalendar config={config} events={activeEvents} /> : null}
            </div>
          </div>
        </section>

        <section id="features" className="mh-home-section">
          <h2>Built for Developers</h2>
          <div className="mh-home-featureGrid">
            {features.map((feature) => (
              <div key={feature} className="mh-home-card">
                <strong>{feature}</strong>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="mh-home-section">
          <h2>Free.</h2>
          <p>We are in early access - use everything, no strings attached.</p>
          <div className="mh-home-pricingRow">
            <div className="mh-home-priceCard">
              <h3>{'<Free />'}</h3>
              <div className="mh-home-price">$0</div>
              <p>Everything you need to ship a great calendar.</p>
              <Link className="mh-home-cta" to="/docs/intro">
                Get Started
              </Link>
            </div>
            <div className="mh-home-priceCardMuted">
              <h3>{'<Pro />'}</h3>
              <div className="mh-home-price">TBD</div>
              <p>For teams that need more.</p>
            </div>
          </div>
        </section>

        <footer className="mh-home-footer">
          <p>© 2026 MH Calendar. MIT License.</p>
          <a href="https://github.com/mh-calendar/mh-calendar" target="_blank" rel="noreferrer">
            {'<GitHub />'}
          </a>
        </footer>
      </main>
    </Layout>
  );
}
