import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand roles. `action` is for things you click, `status` for things
        // that are true — see the note in index.css before mixing them.
        ink: 'var(--aero-ink)',
        'ink-700': 'var(--aero-ink-700)',
        'ink-500': 'var(--aero-ink-500)',
        'ink-300': 'var(--aero-ink-300)',
        action: 'var(--aero-action)',
        'action-700': 'var(--aero-action-700)',
        'action-300': 'var(--aero-action-300)',
        'action-soft': 'var(--aero-action-soft)',
        status: 'var(--aero-status)',
        'status-700': 'var(--aero-status-700)',
        'status-300': 'var(--aero-status-300)',
        'status-soft': 'var(--aero-status-soft)',
        no: 'var(--no)',
        'no-strong': 'var(--no-strong)',
        'no-soft': 'var(--no-soft)',
        warning: 'var(--warning)',
        info: 'var(--info)',
        success: 'var(--success)',

        bg: 'var(--background)',
        surface: 'var(--surface)',
        'surface-sunken': 'var(--surface-sunken)',
        'surface-muted': 'var(--surface-muted)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',

        fg: 'var(--fg-1)',
        'fg-2': 'var(--fg-2)',
        'fg-3': 'var(--fg-3)',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
      },
      borderRadius: {
        xs: 'var(--r-xs)',
        sm: 'var(--r-sm)',
        md: 'var(--r-md)',
        lg: 'var(--r-lg)',
        xl: 'var(--r-xl)',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        focus: 'var(--shadow-focus)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(.2,.7,.2,1)',
      },
      letterSpacing: {
        eyebrow: '0.14em',
        display: '-0.04em',
      },
    },
  },
  plugins: [typography],
};
