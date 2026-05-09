'use client';

import { useTheme } from './theme-provider';

export function ThemeToggle() {
  const { mode, setMode } = useTheme();
  return (
    <button
      className="icon-btn"
      onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
      aria-label="모드 전환"
      title={mode === 'light' ? '다크 모드' : '라이트 모드'}
    >
      {mode === 'light' ? (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M13 9.5A5 5 0 0 1 6.5 3a5 5 0 1 0 6.5 6.5z" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
          <circle cx="8" cy="8" r="3" />
          <path d="M8 1.5v1.8M8 12.7v1.8M14.5 8h-1.8M3.3 8H1.5M12.6 3.4l-1.3 1.3M4.7 11.3l-1.3 1.3M12.6 12.6l-1.3-1.3M4.7 4.7 3.4 3.4" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}
