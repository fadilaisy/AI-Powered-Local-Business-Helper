/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Every semantic color resolves to a CSS variable defined in index.css,
        // so light/dark switching is driven by one token swap instead of a
        // hand-maintained list of dark-mode overrides.
        canvas: 'var(--canvas)',
        surface: 'var(--surface)',
        'surface-soft': 'var(--surface-soft)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        faint: 'var(--faint)',
        line: 'var(--line)',
        'line-soft': 'var(--line-soft)',
        'on-ink': 'var(--on-ink)',
        accent: 'var(--accent)',
        'accent-ink': 'var(--accent-ink)',
        'on-accent': 'var(--on-accent)',
        'accent-soft': 'var(--accent-soft)',
        brand: 'var(--brand)',
        'brand-hover': 'var(--brand-hover)',
        'brand-text': 'var(--brand-text)',
        'on-brand': 'var(--on-brand)',
        success: 'var(--success)',
        'success-soft': 'var(--success-soft)',
        'success-ink': 'var(--success-ink)',
        danger: 'var(--danger)',
        'danger-soft': 'var(--danger-soft)',
        'danger-ink': 'var(--danger-ink)',
        'warn-soft': 'var(--warn-soft)',
        'warn-ink': 'var(--warn-ink)',
        bot: {
          DEFAULT: '#3157d5',
          hover: '#2447c4',
          dim: 'rgba(49, 87, 213, 0.12)'
        }
      },
      fontFamily: {
        sans: ['Figtree', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace']
      },
      boxShadow: {
        // Hard offset shadows keyed to the theme token so they invert with the UI.
        'pop-sm': '2px 2px 0 var(--line)',
        pop: '4px 4px 0 var(--line)'
      }
    }
  },
  plugins: []
};
