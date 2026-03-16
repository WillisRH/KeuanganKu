export const theme = {
  light: {
    bg:      '#F2F4F8',
    surface: '#FFFFFF',
    surf2:   '#F8F9FC',
    border:  '#E4E7EF',
    text:    '#111827',
    sub:     '#9CA3AF',
    muted:   '#D1D5DB',
    accent:  '#5B6CF8',
    green:   '#22C55E',
    red:     '#EF4444',
    yellow:  '#F59E0B',
    shadow:  '0 4px 24px rgba(91,108,248,0.08)',
    shad2:   '0 2px 12px rgba(0,0,0,0.04)',
  },
  dark: {
    bg:      '#0C0E16',
    surface: '#141620',
    surf2:   '#1C1F2E',
    border:  '#252840',
    text:    '#EDF0F7',
    sub:     '#5B6380',
    muted:   '#3D4260',
    accent:  '#5B6CF8',
    green:   '#22C55E',
    red:     '#FF6B6B',
    yellow:  '#F59E0B',
    shadow:  '0 4px 32px rgba(0,0,0,0.5)',
    shad2:   '0 2px 12px rgba(0,0,0,0.3)',
  }
};

export const makeTheme = (dark: boolean) => dark ? theme.dark : theme.light;

export const CHART_COLORS = ['#5B6CF8', '#F97316', '#22C55E', '#F59E0B', '#EC4899', '#3B82F6', '#8B5CF6', '#10B981'];

export const commonStyles = {
  fontFamily: "'Outfit', system-ui, sans-serif",
  cardRadius: '24px',
  btnRadius: '16px',
};
