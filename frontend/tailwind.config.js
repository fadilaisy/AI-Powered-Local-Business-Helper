/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        bot: {
          DEFAULT: '#3157d5',
          hover: '#2447c4',
          dim: 'rgba(49, 87, 213, 0.12)'
        },
        ink: '#11110f',
        canvas: '#f7f7f3',
        action: '#ffdc35',
        coral: '#ff715b',
        success: '#169b63',
        danger: '#c43d35'
      },
      fontFamily: {
        sans: ['Figtree', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace']
      },
      boxShadow: {
        card: '7px 7px 0 rgba(17,17,15,0.16)'
      }
    }
  },
  plugins: []
};
