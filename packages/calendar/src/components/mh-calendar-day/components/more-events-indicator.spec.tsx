import { describe, expect, h, it, render } from '@stencil/vitest';

describe('mh-calendar-more-events-indicator', () => {
  it('renders the hidden count', async () => {
    const { root } = await render(<mh-calendar-more-events-indicator hiddenCount={3} />);
    expect(root.textContent).toBe('+3 more');
  });
});
