import { Config } from '@stencil/core';
import { reactOutputTarget } from '@stencil/react-output-target';

export const config: Config = {
  namespace: 'mhcalendar',
  buildDist: true,
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'www',
    },
    {
      type: 'dist-custom-elements',
      externalRuntime: false,
    },
    reactOutputTarget({
      outDir: '../react/src/components',
      excludeComponents: [
        'mh-calendar-agenda-view',
        'mh-calendar-day',
        'mh-calendar-day-all-day-events-holder',
        'mh-calendar-day-dragged-event-preview',
        'mh-calendar-day-month-view-events',
        'mh-calendar-day-time-view-events',
        'mh-calendar-day-time-view-overlays',
        'mh-calendar-event',
        'mh-calendar-event-form',
        'mh-calendar-event-full',
        'mh-calendar-event-list-popup',
        'mh-calendar-event-small',
        'mh-calendar-header',
        'mh-calendar-modal',
        'mh-calendar-month',
        'mh-calendar-more-events-indicator',
        'mh-calendar-multi-view',
        'mh-calendar-navigation',
        'mh-calendar-resize-event-handler',
        'mh-calendar-resource-view',
        'mh-calendar-time-slots',
      ],
    }),
  ],
};
