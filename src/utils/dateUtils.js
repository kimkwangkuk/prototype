const DAY_KR = ['일', '월', '화', '수', '목', '금', '토'];

export function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getWeekDates(base) {
  const d = new Date(base);
  const dow = d.getDay();
  const mon = new Date(d);
  mon.setDate(d.getDate() - ((dow + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(mon);
    dt.setDate(mon.getDate() + i);
    return dt;
  });
}

export function isSameDate(d1, d2) {
  return formatDate(d1) === formatDate(d2);
}

export function isToday(dateStr) {
  return dateStr === formatDate(new Date());
}

export function formatDisplayDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${month}.${String(day).padStart(2, '0')}`;
}

export function getDayOfWeekKR(date) {
  return DAY_KR[date.getDay()];
}
