export const SAVED_KEY = 'cliplish:saved:v1';
export const PROGRESS_KEY = 'cliplish:daily-progress:v1';
export const FEED_KEY = 'cliplish:daily-feed:v1';
export function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
export function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}
export function getProgress(date) {
  const state = read(PROGRESS_KEY, null);
  return state?.date === date && Number.isInteger(state.currentIndex) && state.currentIndex >= 0 && state.currentIndex < 10
    ? { ...state, completed: state.completed === true } : { date, currentIndex: 0, completed: false };
}
export function getSaved() {
  const data = read(SAVED_KEY, {})?.videos;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
  return Object.fromEntries(Object.entries(data).filter(([id, v]) => v && v.id === id && typeof v.title === 'string' && typeof v.savedAt === 'string'));
}
