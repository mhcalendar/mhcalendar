import type { ReactNode } from 'react';
import { codepenExamples } from '@site/src/examples';

export type TryOnCodePenProps = {
  /** Key into codepenExamples, e.g. "quick-start". */
  topic: string;
};

export default function TryOnCodePen({ topic }: TryOnCodePenProps): ReactNode {
  const example = codepenExamples[topic];
  if (!example) {
    throw new Error(`TryOnCodePen: unknown topic "${topic}"`);
  }

  const data = JSON.stringify({
    title: example.title,
    html: example.html,
    css: example.css,
    // HTML + CSS editors open, no JS pane used.
    editors: '110',
    // Editors on top, preview spanning the full width below — better fit for
    // a wide weekly calendar grid than the default side-by-side split.
    layout: 'top',
  });

  return (
    <form
      action="https://codepen.io/pen/define"
      method="POST"
      target="_blank"
      style={{ margin: '0.5rem 0 1.5rem' }}
    >
      <input type="hidden" name="data" value={data} />
      <button
        type="submit"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.5rem 0.9rem',
          borderRadius: '6px',
          border: '1px solid var(--ifm-color-emphasis-300)',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: 'pointer',
          background: 'transparent',
          color: 'inherit',
        }}
      >
        ▲ Try on CodePen
      </button>
    </form>
  );
}
