import { PEN_CSS, LOADER_IMPORT, type CodePenExample } from './shared';

const locale: CodePenExample = {
  title: 'mhcalendar — Locale & labels',
  css: PEN_CSS,
  html: `<mh-calendar id="calendar"></mh-calendar>

<script type="module">
  ${LOADER_IMPORT}
  import plLocale from 'https://esm.sh/dayjs@1.11.21/locale/pl';

  const calendar = document.getElementById('calendar');
  calendar.config = {
    viewType: 'MONTH',
    // Pass the imported locale OBJECT, not the 'pl' string — mhcalendar bundles its own
    // Day.js instance, so a side-effect-only "import 'dayjs/locale/pl'" would register the
    // locale on a different instance and have no effect. Passing the object works because
    // Day.js self-registers whatever locale object it's given at the point of use.
    locale: plLocale,
    labels: {
      today: 'Dzisiaj',
      moreEvents: (hiddenCount) => \`+\${hiddenCount} więcej\`,
      views: { WEEK: 'Tydzień', MONTH: 'Miesiąc', AGENDA: 'Plan dnia' },
    },
  };

  const today = new Date();
  const at = (h, m = 0) => {
    const d = new Date(today);
    d.setHours(h, m, 0, 0);
    return d;
  };

  calendar.events = [
    // Several events on today to show the "+N więcej" overflow indicator (via the moreEvents label).
    { id: '1', title: 'Codzienna odprawa', startDate: at(9), endDate: at(9, 30) },
    { id: '2', title: 'Przegląd sprintu', startDate: at(11), endDate: at(12) },
    { id: '3', title: 'Lunch', startDate: at(12, 30), endDate: at(13) },
    { id: '4', title: 'Rozmowa z klientem', startDate: at(14), endDate: at(15) },
    { id: '5', title: 'Planowanie', startDate: at(15, 30), endDate: at(16, 30) },
  ];
</script>`,
};

export default locale;
