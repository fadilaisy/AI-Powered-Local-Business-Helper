/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        bot: {
          DEFAULT: '#00D4AA',
          hover: '#00F0C0',
          dim: 'rgba(0, 212, 170, 0.12)',
        },
        apple: {
          bg: '#000000',
          surface: '#121214',
          card: 'rgba(255, 255, 255, 0.04)',
          border: 'rgba(255, 255, 255, 0.08)',
          highlight: 'rgba(255, 255, 255, 0.12)',
          subtext: '#86868b',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"SF Pro"',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          '"SF Mono"',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace'
        ]
      },
      boxShadow: {
        'apple-card': '0 20px 40px -15px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'apple-glow': '0 0 25px rgba(0, 212, 170, 0.25)',
      },
      borderRadius: {
        'apple': '22px',
        'apple-sm': '14px',
        'apple-lg': '28px',
      }
    },
  },
  plugins: [],
}
