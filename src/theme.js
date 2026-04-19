const THEME_STORAGE_KEY = 'littiwale_theme';
const THEMES = {
  light: 'light',
  dark: 'dark',
};

const getSavedTheme = () => {
  const theme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return theme === THEMES.dark || theme === THEMES.light ? theme : null;
};

const getPreferredTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.dark : THEMES.light;

const updateMetaThemeColor = (theme) => {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;
  meta.content = theme === THEMES.dark ? '#0d0d0d' : '#f7f3ed';
};

const updateToggleButtons = (theme) => {
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.textContent = theme === THEMES.dark ? '☀️' : '🌙';
    button.setAttribute(
      'aria-label',
      theme === THEMES.dark ? 'Switch to light theme' : 'Switch to dark theme'
    );
  });
};

const applyTheme = (theme) => {
  const normalizedTheme = theme === THEMES.dark ? THEMES.dark : THEMES.light;
  document.documentElement.setAttribute('data-theme', normalizedTheme);
  window.localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme);
  updateMetaThemeColor(normalizedTheme);
  updateToggleButtons(normalizedTheme);
};

const toggleTheme = () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === THEMES.dark ? THEMES.light : THEMES.dark);
};

const initTheme = () => {
  const savedTheme = getSavedTheme();
  const theme = savedTheme || getPreferredTheme();
  applyTheme(theme);
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', toggleTheme);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTheme);
} else {
  initTheme();
}
