import type { ReactNode } from 'react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
  IMHCalendarEvent,
  IMHCalendarFullOptions,
  IMHCalendarViewType,
  MhCalendar,
} from '@mhcalendar/react';
import ThemeToggle from '../components/ThemeToggle';
import { useColorMode } from '@docusaurus/theme-common';

// Official brand marks (path data from simple-icons, CC0), each with its brand color.
// Next.js's mark is monochrome black/white in the source, so it uses currentColor to
// invert with the page's light/dark text color instead of a fixed hex.
const INTEGRATIONS: { name: string; color?: string; path: string }[] = [
  {
    name: 'JavaScript',
    color: '#F7DF1E',
    path: 'M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z',
  },
  {
    name: 'TypeScript',
    color: '#3178C6',
    path: 'M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z',
  },
  {
    name: 'React',
    color: '#61DAFB',
    path: 'M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z',
  },
  {
    name: 'Web Components',
    color: '#29ABE2',
    path: 'M11.731 2.225l-.01.016H5.618L0 11.979l5.618 9.736h12.8l.04.06 2.134-3.735.518-.893h-.008l.008-.014-.626-.75h.895l.006-.01.008.01L24 11.994l-2.607-4.39-.003.005-.011-.02h-.945l.63-.763-2.606-4.57-.006.01-.024-.04H11.73zM9.107 6.824h6.19l-.53.764h-.023l2.398 4.015h.875l-.277.328.357.435h-.956l-2.398 4.015h.027l.523.764H9.074l-2.99-5.168 3.022-5.155z',
  },
  {
    name: 'Next.js',
    path: 'M18.665 21.978C16.758 23.255 14.465 24 12 24 5.377 24 0 18.623 0 12S5.377 0 12 0s12 5.377 12 12c0 3.583-1.574 6.801-4.067 9.001L9.219 7.2H7.2v9.596h1.615V9.251l9.85 12.727Zm-3.332-8.533 1.6 2.061V7.2h-1.6v6.245Z',
  },
  {
    name: 'Astro',
    color: '#BC52EE',
    path: 'M8.358 20.162c-1.186-1.07-1.532-3.316-1.038-4.944.856 1.026 2.043 1.352 3.272 1.535 1.897.283 3.76.177 5.522-.678.202-.098.388-.229.608-.36.166.473.209.95.151 1.437-.14 1.185-.738 2.1-1.688 2.794-.38.277-.782.525-1.175.787-1.205.804-1.531 1.747-1.078 3.119l.044.148a3.158 3.158 0 0 1-1.407-1.188 3.31 3.31 0 0 1-.544-1.815c-.004-.32-.004-.642-.048-.958-.106-.769-.472-1.113-1.161-1.133-.707-.02-1.267.411-1.415 1.09-.012.053-.028.104-.045.165h.002zm-5.961-4.445s3.24-1.575 6.49-1.575l2.451-7.565c.092-.366.36-.614.662-.614.302 0 .57.248.662.614l2.45 7.565c3.85 0 6.491 1.575 6.491 1.575L16.088.727C15.93.285 15.663 0 15.303 0H8.697c-.36 0-.615.285-.784.727l-5.516 14.99z',
  },
];

function FeatureIcon({ children }: { children: ReactNode }): ReactNode {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const FEATURES: { title: string; description: string; icon: ReactNode }[] = [
  {
    title: 'Drag and drop scheduling',
    description:
      'Move events between days and time slots, resize them, or drag to create new ones directly on the grid.',
    icon: (
      <FeatureIcon>
        <polyline points="5 9 2 12 5 15" />
        <polyline points="9 5 12 2 15 5" />
        <polyline points="15 19 12 22 9 19" />
        <polyline points="19 9 22 12 19 15" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="12" y1="2" x2="12" y2="22" />
      </FeatureIcon>
    ),
  },
  {
    title: 'Five views in one component',
    description: 'Week, day, month, agenda, and resource. Switch between them with a single prop.',
    icon: (
      <FeatureIcon>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </FeatureIcon>
    ),
  },
  {
    title: 'Multi timezone support',
    description:
      'Show events across multiple timezones side by side, with each timezone rendered as its own column.',
    icon: (
      <FeatureIcon>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </FeatureIcon>
    ),
  },
  {
    title: 'Theming with CSS variables',
    description:
      'Restyle colors, spacing, and fonts through plain CSS custom properties. No proprietary theming API.',
    icon: (
      <FeatureIcon>
        <line x1="4" y1="21" x2="4" y2="14" />
        <line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" />
        <line x1="20" y1="12" x2="20" y2="3" />
        <line x1="1" y1="14" x2="7" y2="14" />
        <line x1="9" y1="8" x2="15" y2="8" />
        <line x1="17" y1="16" x2="23" y2="16" />
      </FeatureIcon>
    ),
  },
];

// Official brand marks (path data from simple-icons, CC0).
const GITHUB_ICON_PATH =
  'M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.04-3.34.72-4.04-1.61-4.04-1.61-.55-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.02 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22 0 1.6-.02 2.89-.02 3.29 0 .32.22.7.83.58A12 12 0 0 0 12 .5z';

const NPM_ICON_PATH =
  'M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z';

const OPEN_SOURCE_SECTION: {
  id: string;
  eyebrow: string;
  heading: string;
  description: string;
  links: { label: string; href: string; logoPath: string; logoColor?: string }[];
} = {
  id: 'open-source',
  eyebrow: 'Open Source',
  heading: 'Built in the open.',
  description:
    'MIT licensed and published on npm as @mhcalendar/calendar and @mhcalendar/react. Browse the code, open an issue, or add it to your project with one command.',
  links: [
    {
      label: 'View on npm',
      href: 'https://www.npmjs.com/package/@mhcalendar/react',
      logoPath: NPM_ICON_PATH,
      logoColor: '#CB3837',
    },
    {
      label: 'View on GitHub',
      href: 'https://github.com/mhcalendar/mhcalendar',
      logoPath: GITHUB_ICON_PATH,
    },
  ],
};

const FAQS: { question: string; answer: string }[] = [
  {
    question: 'Is mhcalendar free to use?',
    answer:
      "Yes. It's open source under the MIT license, for personal and commercial projects alike.",
  },
  {
    question: 'Does it work outside of React?',
    answer:
      'Yes. The core, @mhcalendar/calendar, is a framework-agnostic Web Component. @mhcalendar/react is a thin wrapper around it.',
  },
  {
    question: 'How do I customize the styling?',
    answer:
      'Through plain CSS custom properties, or the style prop for deeper overrides. No proprietary theming API to learn.',
  },
  {
    question: 'Which views are supported?',
    answer: 'Week, day, month, agenda, and resource, switchable with a single prop.',
  },
  {
    question: 'Is TypeScript supported?',
    answer: 'Yes. Both packages are written in TypeScript and ship full type definitions.',
  },
  {
    question: 'Where do I report bugs or request features?',
    answer: 'Open an issue on GitHub. The repository is linked in the Open Source section above.',
  },
];

const ROTATING_WORDS: { label: string; color: string }[] = [
  { label: 'React', color: '#61DAFB' },
  { label: 'Vue', color: '#42B883' },
  { label: 'Angular', color: '#DD0031' },
  { label: 'Mobile', color: '#8A79FF' },
];

function RotatingWord(): ReactNode {
  const idCounterRef = useRef(0);
  const makeItem = (word: (typeof ROTATING_WORDS)[number]) => ({
    ...word,
    id: idCounterRef.current++,
  });

  const cursorRef = useRef(2 % ROTATING_WORDS.length);
  const trackRef = useRef<HTMLSpanElement>(null);
  const [words, setWords] = useState(() => [
    makeItem(ROTATING_WORDS[0]),
    makeItem(ROTATING_WORDS[1]),
  ]);
  const [sliding, setSliding] = useState(false);
  const [suspendTransition, setSuspendTransition] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setSliding(true), 2200);
    return () => clearInterval(id);
  }, []);

  // Forces a reflow so the disabled transition is committed before it gets
  // re-enabled, otherwise the browser can animate the instant reset below.
  useLayoutEffect(() => {
    if (!suspendTransition || !trackRef.current) {
      return;
    }
    void trackRef.current.getBoundingClientRect();
    setSuspendTransition(false);
  }, [suspendTransition]);

  const handleTransitionEnd = () => {
    setWords((prev) => {
      const nextWord = makeItem(ROTATING_WORDS[cursorRef.current]);
      cursorRef.current = (cursorRef.current + 1) % ROTATING_WORDS.length;
      return [prev[1], nextWord];
    });
    setSuspendTransition(true);
    setSliding(false);
  };

  return (
    <span className="mh-rotating-word">
      <span
        className="mh-rotating-word-track"
        ref={trackRef}
        onTransitionEnd={handleTransitionEnd}
        style={{
          transform: sliding ? 'translateY(-1.4em)' : 'translateY(0)',
          transition: suspendTransition ? 'none' : 'transform 0.5s cubic-bezier(0.65, 0, 0.35, 1)',
        }}
      >
        {words.map((word) => (
          <span className="mh-rotating-word-item" style={{ color: word.color }} key={word.id}>
            {word.label}
          </span>
        ))}
      </span>
    </span>
  );
}

function makeTryItDate(dayOffset: number, hour: number, minutes = 0): Date {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + dayOffset);
  monday.setHours(hour, minutes, 0, 0);
  return monday;
}

const TRY_IT_RESOURCES = [
  { id: 'resource-1', title: 'Design team' },
  { id: 'resource-2', title: 'Marketing team' },
  { id: 'resource-3', title: 'Sales team' },
  { id: 'resource-4', title: 'Ops team' },
];

function buildTryItEvents(): IMHCalendarEvent[] {
  return [
    {
      id: 'try-1',
      title: 'Design review',
      startDate: makeTryItDate(0, 9),
      endDate: makeTryItDate(0, 10),
      color: '#6C5CE7',
    },
    {
      id: 'try-2',
      title: 'Standup',
      startDate: makeTryItDate(0, 10),
      endDate: makeTryItDate(0, 11),
      color: '#00B8A9',
    },
    {
      id: 'try-3',
      title: 'Customer call',
      startDate: makeTryItDate(1, 13),
      endDate: makeTryItDate(1, 14),
      color: '#FF6B6B',
    },
    {
      id: 'try-4',
      title: 'Pair on theming',
      startDate: makeTryItDate(2, 15),
      endDate: makeTryItDate(2, 17),
      color: '#4C9AFF',
    },
    {
      id: 'try-5',
      title: 'Release sync',
      startDate: makeTryItDate(3, 11),
      endDate: makeTryItDate(3, 12),
      color: '#F5A623',
    },
    {
      id: 'try-6',
      title: 'Retro',
      startDate: makeTryItDate(4, 13),
      endDate: makeTryItDate(4, 14),
      color: '#2ECC71',
    },
    {
      id: 'try-7',
      title: 'Sprint planning',
      startDate: makeTryItDate(0, 13),
      endDate: makeTryItDate(0, 14, 30),
      resourceId: 'resource-1',
      color: '#E84393',
    },
    {
      id: 'try-8',
      title: 'Marketing sync',
      startDate: makeTryItDate(1, 9),
      endDate: makeTryItDate(1, 10, 30),
      resourceId: 'resource-2',
      color: '#45AAF2',
    },
    {
      id: 'try-9',
      title: 'Vendor review',
      startDate: makeTryItDate(3, 15),
      endDate: makeTryItDate(3, 16, 30),
      resourceId: 'resource-3',
      color: '#FDCB6E',
    },
    {
      id: 'try-10',
      title: 'Ops handoff',
      startDate: makeTryItDate(4, 10),
      endDate: makeTryItDate(4, 11),
      resourceId: 'resource-4',
      color: '#A29BFE',
    },
    {
      id: 'try-11',
      title: 'Team offsite',
      startDate: makeTryItDate(2, 0),
      endDate: makeTryItDate(2, 23, 59),
      allDay: true,
      color: '#EF5350',
    },
    {
      id: 'try-12',
      title: 'Conference',
      startDate: makeTryItDate(3, 0),
      endDate: makeTryItDate(4, 23, 59),
      allDay: true,
      color: '#26C6DA',
    },
  ];
}

function TryItCalendar(): ReactNode {
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<IMHCalendarEvent[]>(() => buildTryItEvents());
  const { colorMode, setColorMode } = useColorMode();

  useEffect(() => setMounted(true), []);

  const handleEventUpdated = useCallback((updated: IMHCalendarEvent) => {
    setEvents((prev) =>
      prev.map((event) => (event.id === updated.id ? { ...event, ...updated } : event)),
    );
  }, []);

  const handleEventCreated = useCallback((created: IMHCalendarEvent) => {
    setEvents((prev) => [...prev, created]);
  }, []);

  const config: IMHCalendarFullOptions = useMemo(
    () => ({
      viewType: 'WEEK' as IMHCalendarViewType,
      showTimeFrom: 8,
      showTimeTo: 19,
      allowEventDragging: true,
      allowEventResize: true,
      createEventOnClick: true,
      resources: TRY_IT_RESOURCES,
      onEventUpdated: handleEventUpdated,
      onEventCreated: handleEventCreated,
      theme: colorMode,
    }),
    [handleEventUpdated, handleEventCreated, colorMode],
  );

  if (!mounted) {
    return <div className="mh-try-calendar" />;
  }

  return (
    <div
      className="mh-try-calendar"
      style={{ background: colorMode === 'dark' ? '#131314' : 'white' }}
    >
      <MhCalendar config={config} events={events} />
    </div>
  );
}

function InstallCommand(): ReactNode {
  const command = 'npm i @mhcalendar/react';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mh-install-group">
      <div className="mh-install">
        <code>{command}</code>
      </div>
      <button
        type="button"
        className="mh-install-copy"
        onClick={handleCopy}
        title="Copy to clipboard"
        aria-label="Copy install command"
      >
        {copied ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 6 9 17l-5-5"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 9h10v10H9z M5 15V5h10"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  const reactPackageVersion = siteConfig.customFields?.reactPackageVersion as string;
  const markUrl = useBaseUrl('/img/mh-mark.png');
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <Layout title="mhcalendar" description="Fully customizable scheduling component">
      <main className="mh-landing">
        <nav className={navScrolled ? 'mh-nav scrolled' : 'mh-nav'}>
          <div className="container mh-nav-inner">
            <a className="mh-logo" href="#top">
              <img src={markUrl} alt="mh logo" />
              <span>mhcalendar</span>
            </a>
            <div className="mh-nav-links">
              <a href="#features">Features</a>
              <a href="#try">Try it</a>
              <Link to="/theme-builder">Theme builder</Link>
              <a href="#stack">Works with</a>
              <a href="#open-source">Open source</a>
              <a href="#faq">FAQ</a>
            </div>
            <div className="mh-nav-cta">
              <ThemeToggle />
              <Link className="mh-btn primary" to="/docs/introduction/">
                Docs
              </Link>
              <a
                className="mh-github-link"
                href="https://github.com/mhcalendar/mhcalendar"
                target="_blank"
                rel="noreferrer"
                title="View on GitHub"
                aria-label="View on GitHub"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d={GITHUB_ICON_PATH} />
                </svg>
              </a>
            </div>
          </div>
        </nav>
        <section className="mh-hero mh-bg-a" id="top">
          <div className="mh-hero-grid-bg" />
          <div className="container mh-hero-inner">
            <div className="mh-hero-copy">
              <span className="mh-eyebrow">v{reactPackageVersion}</span>
              <h1>
                A modern calendar solution for
                <br />
                <RotatingWord />
              </h1>
              <p>
                A full-sized, drag-and-drop calendar for React and Web Components, written in
                TypeScript.
              </p>
              <InstallCommand />
              <div className="mh-hero-actions">
                <a className="mh-btn primary" href="#try">
                  Try it!
                </a>
              </div>
            </div>
          </div>
        </section>
        <section className="mh-features mh-bg-b" id="features">
          <div className="container">
            <span className="mh-eyebrow">Features</span>
            <h2>What you get out of the box.</h2>
            <p className="mh-features-intro">
              The core features teams reach for most, no extra configuration needed.
            </p>
            <div className="mh-features-grid">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="mh-feature-card">
                  <span className="mh-feature-icon">{feature.icon}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="mh-try mh-bg-a" id="try">
          <div className="container">
            <div className="mh-try-text">
              <span className="mh-eyebrow">Try it</span>
              <h2>Play with it, right here.</h2>
              <p>
                Drag events around, resize them, or click an empty slot to create one. This is the
                real component, not a screenshot.
              </p>
              <Link className="mh-btn primary" to="/theme-builder">
                Theme builder
              </Link>
            </div>
            <TryItCalendar />
          </div>
        </section>
        <section className="mh-integrations mh-bg-b" id="stack">
          <div className="container">
            <span className="mh-eyebrow">Works with</span>
            <h2>Drop it into the stack you already have.</h2>
            <p>Ship the Web Component standalone, or reach for the React wrapper</p>
            <div className="mh-integrations-grid">
              {INTEGRATIONS.map(({ name, color, path }) => (
                <article key={name} className="mh-integration-card">
                  <span className="mh-integration-icon">
                    <svg
                      viewBox="0 0 24 24"
                      style={color ? { fill: color } : undefined}
                      role="img"
                      aria-label={name}
                    >
                      <path d={path} />
                    </svg>
                  </span>
                  <span>{name}</span>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="mh-cta mh-bg-a" id={OPEN_SOURCE_SECTION.id}>
          <div className="container mh-cta-inner">
            <div className="mh-cta-text">
              <span className="mh-eyebrow">{OPEN_SOURCE_SECTION.eyebrow}</span>
              <h2>{OPEN_SOURCE_SECTION.heading}</h2>
              <p>{OPEN_SOURCE_SECTION.description}</p>
              <div className="mh-cta-actions">
                {OPEN_SOURCE_SECTION.links.map((link) => (
                  <a
                    key={link.href}
                    className="mh-btn primary"
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="mh-cta-media">
              {OPEN_SOURCE_SECTION.links.map((link) => (
                <svg
                  key={link.href}
                  className="mh-cta-logo"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  style={link.logoColor ? { color: link.logoColor } : undefined}
                >
                  <path fill="currentColor" d={link.logoPath} />
                </svg>
              ))}
            </div>
          </div>
        </section>
        <section className="mh-faq mh-bg-a" id="faq">
          <div className="container">
            <span className="mh-eyebrow">FAQ</span>
            <h2>Questions, answered.</h2>
            <div className="mh-faq-list">
              {FAQS.map((faq) => (
                <details key={faq.question} className="mh-faq-item">
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
