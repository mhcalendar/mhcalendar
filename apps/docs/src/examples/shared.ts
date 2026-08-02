export type CodePenExample = {
  title: string;
  html: string;
  css: string;
};

export const PEN_CSS = `html, body { height: 100%; margin: 0; }
mh-calendar { display: block; height: 100vh; }`;

export const LOADER_IMPORT = `import { defineCustomElements } from 'https://esm.sh/@mhcalendar/calendar@0.2.4/loader';
  defineCustomElements();`;
