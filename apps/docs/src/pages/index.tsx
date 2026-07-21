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
    config: { showTimeFrom: 1, showTimeTo: 24, fixedHeight: '580px', virtualScrollHeight: '1800px' },
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
    { id: '1', title: 'Design review', startDate: makeDate(0, 9), endDate: makeDate(0, 11) },
    { id: '2', title: 'Standup', startDate: makeDate(1, 10), endDate: makeDate(1, 11) },
    { id: '3', title: 'Customer call', startDate: makeDate(2, 9), endDate: makeDate(2, 10) },
    { id: '4', title: 'Pair on theming', startDate: makeDate(2, 14), endDate: makeDate(2, 15) },
    { id: '5', title: 'Release sync', startDate: makeDate(3, 13), endDate: makeDate(3, 15) },
    { id: '6', title: 'Demo prep', startDate: makeDate(4, 11), endDate: makeDate(4, 12) },
  ];
}

function buildTimezoneEvents() {
  const { makeDate } = getWeekDates();
  return [
    { id: 't1', title: 'LA Kickoff', startDate: makeDate(0, 9), endDate: makeDate(0, 10) },
    { id: 't2', title: 'NY All-hands', startDate: makeDate(1, 12), endDate: makeDate(1, 14) },
    { id: 't3', title: 'London Sync', startDate: makeDate(2, 8), endDate: makeDate(2, 9) },
    { id: 't4', title: 'Cross-region Review', startDate: makeDate(2, 14), endDate: makeDate(2, 16) },
  ];
}

export default function Home(): ReactNode {
  const markUrl = useBaseUrl('/img/mh-mark.png');
  const [activeStyle, setActiveStyle] = useState<StyleVariant>('corporate');
  const [mounted, setMounted] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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
    <Layout title="MH Calendar" description="Fully customizable scheduling component">
      <main className="mh-landing">
        <nav className={navScrolled ? 'mh-nav scrolled' : 'mh-nav'}>
          <div className="container mh-nav-inner">
            <a className="mh-logo" href="#top">
              <img src={markUrl} alt="mh logo" />
              <span>mhcalendar</span>
            </a>
            <div className="mh-nav-links">
              <a href="#views">Views</a>
              <a href="#theming">Theming</a>
              <a href="#install">Install</a>
              <a href="#faq">FAQ</a>
            </div>
            <div className="mh-nav-cta">
              <button className="mh-btn ghost" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
              <Link className="mh-btn primary" to="/docs/intro">
                Get started
              </Link>
            </div>
          </div>
        </nav>

        <section className="mh-hero" id="top">
          <div className="mh-hero-grid-bg" />
          <div className="container mh-hero-inner">
            <div className="mh-hero-copy">
              <span className="mh-eyebrow">v1.4 - Shiftplan view is here</span>
              <h1>
                The calendar component you stop forking <span>theming.</span>
              </h1>
              <p>
                A full-sized, drag-and-drop calendar for React and Web Components. Built on Stencil,
                themed with plain CSS variables.
              </p>
              <div className="mh-install" id="install">npm i @mhcalendar/react</div>
              <div className="mh-style-switcher">
                {(Object.keys(styleConfigs) as StyleVariant[]).map((variant) => (
                  <button
                    key={variant}
                    type="button"
                    className={variant === activeStyle ? 'active' : ''}
                    onClick={() => setActiveStyle(variant)}
                  >
                    {variant}
                  </button>
                ))}
              </div>
            </div>
            <div className="mh-hero-demo">{mounted ? <MhCalendar config={config} events={activeEvents} /> : null}</div>
          </div>
        </section>

        <section className="mh-strip" id="views">
          <div className="container mh-strip-inner">
            <span>Works with</span>
            <div>
              <span>React 18/19</span>
              <span>Web Components</span>
              <span>Vanilla JS</span>
              <span>Next/Remix/Astro</span>
            </div>
          </div>
        </section>

        <section className="mh-sections" id="theming">
          <div className="container">
            <h2>Every way your team needs to see time.</h2>
            <p>Switch views, style tokens, and behavior in one API surface.</p>
            <div className="mh-cards">
              <article><h3>Week/Day</h3><p>Drag and drop with clear time-grid ergonomics.</p></article>
              <article><h3>Month/Agenda</h3><p>High-density planning and readable list timeline.</p></article>
              <article><h3>Shiftplan</h3><p>Resource scheduling with vertical team lanes.</p></article>
            </div>
          </div>
        </section>

        <section className="mh-faq" id="faq">
          <div className="container">
            <h2>FAQ</h2>
            <p>Need examples? Check docs and full API in the sidebar.</p>
          </div>
        </section>
      </main>
    </Layout>
  );
}
