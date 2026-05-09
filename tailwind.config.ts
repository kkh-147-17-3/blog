import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: ['selector', 'body[data-mode="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        body: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'Apple SD Gothic Neo', 'sans-serif'],
        display: ['IBM Plex Sans KR', 'Pretendard', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '1.5' }],
        sm: ['13px', { lineHeight: '1.5' }],
        md: ['15px', { lineHeight: '1.75' }],
        lg: ['17px', { lineHeight: '1.4' }],
        xl: ['22px', { lineHeight: '1.4' }],
        '2xl': ['30px', { lineHeight: '1.2' }],
        '3xl': ['40px', { lineHeight: '1.2' }],
        '4xl': ['56px', { lineHeight: '1.2' }],
      },
      lineHeight: {
        tight: '1.2',
        snug: '1.4',
        body: '1.75',
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
        20: '80px',
        24: '96px',
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '10px',
        pill: '999px',
      },
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        'bg-elev': 'rgb(var(--bg-elev) / <alpha-value>)',
        'bg-tint': 'rgb(var(--bg-tint) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        'ink-2': 'rgb(var(--ink-2) / <alpha-value>)',
        'ink-3': 'rgb(var(--ink-3) / <alpha-value>)',
        'ink-4': 'rgb(var(--ink-4) / <alpha-value>)',
        rule: 'rgb(var(--rule) / <alpha-value>)',
        'rule-soft': 'rgb(var(--rule-soft) / <alpha-value>)',
        cat: 'rgb(var(--cat) / <alpha-value>)',
        'cat-knowledge': 'rgb(var(--cat-knowledge) / <alpha-value>)',
        'cat-diary': 'rgb(var(--cat-diary) / <alpha-value>)',
        'cat-memo': 'rgb(var(--cat-memo) / <alpha-value>)',
        'tint-knowledge': 'rgb(var(--tint-knowledge) / <alpha-value>)',
        'tint-diary': 'rgb(var(--tint-diary) / <alpha-value>)',
        'tint-memo': 'rgb(var(--tint-memo) / <alpha-value>)',
      },
      backgroundColor: {
        hl: 'var(--hl)',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
      },
      maxWidth: {
        prose: '720px',
        wide: '1080px',
      },
      keyframes: {
        'scrim-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'modal-in': {
          from: { transform: 'translateY(-8px)', opacity: '0' },
          to: { transform: 'none', opacity: '1' },
        },
        'screen-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'none' },
        },
        'tocfab-in': {
          from: { opacity: '0', transform: 'translateY(8px) scale(.96)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        'scrim-in': 'scrim-in 180ms ease-out',
        'modal-in': 'modal-in 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        'screen-in': 'screen-in 240ms ease-out',
        'tocfab-in': 'tocfab-in 200ms cubic-bezier(.2,.8,.2,1)',
      },
      letterSpacing: {
        display: '-0.02em',
        wider2: '0.06em',
        wider3: '0.08em',
      },
      backdropBlur: {
        nav: '10px',
      },
    },
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant('cat-knowledge', 'body[data-cat="knowledge"] &');
      addVariant('cat-diary', 'body[data-cat="diary"] &');
      addVariant('cat-memo', 'body[data-cat="memo"] &');
      addVariant('cat-none', 'body[data-cat="none"] &');
    }),
  ],
};

export default config;
