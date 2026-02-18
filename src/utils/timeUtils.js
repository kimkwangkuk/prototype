export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h < 12 ? '오전' : '오후';
  const hour = h % 12 || 12;
  return `${period} ${hour}:${String(m).padStart(2, '0')}`;
}

export function reverseFormatTime(displayTime) {
  if (!displayTime) return '';
  const match = displayTime.match(/(오전|오후)\s*(\d+):(\d+)/);
  if (!match) return '';

  const [, period, hour, minute] = match;
  let h = parseInt(hour);
  if (period === '오후' && h !== 12) h += 12;
  if (period === '오전' && h === 12) h = 0;

  return `${String(h).padStart(2, '0')}:${minute}`;
}

export function formatDuration(minutes) {
  if (!minutes) return '';
  if (minutes < 60) {
    return `${minutes}분`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
}

export function reverseDuration(displayDuration) {
  if (!displayDuration) return null;

  const hourMatch = displayDuration.match(/(\d+)시간/);
  const minMatch = displayDuration.match(/(\d+)분/);

  let totalMinutes = 0;
  if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60;
  if (minMatch) totalMinutes += parseInt(minMatch[1]);

  return totalMinutes || null;
}
