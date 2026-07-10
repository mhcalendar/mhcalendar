// Loads the built lazy-loader so spec tests can render our real custom elements.
// Requires `npm run build` (or `stencil build`) to have run first.
await import('./dist/mhcalendar/mhcalendar.esm.js');

export {};
