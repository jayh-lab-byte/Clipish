export function duration(seconds = 0) {
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}
export function views(count) {
  return count == null ? 'Views unavailable' : `${new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(count)} views`;
}
export function relativeDate(date) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86400000));
  if (!Number.isFinite(days)) return '';
  if (!days) return 'Today';
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
}
// One logical day across API, cache and progress: UTC.
export const today = () => new Date().toISOString().slice(0, 10);
