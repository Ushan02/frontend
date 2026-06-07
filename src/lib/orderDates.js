export function toDateKey(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDateKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayDateKey() {
  return toDateKey(new Date());
}

export function formatDateKeyLabel(key, options = {}) {
  const d = parseDateKey(key);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

export function formatOrderTime(date) {
  if (!date) return "—";
  return new Date(date).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function shiftDateKey(key, days) {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

export function getMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(toDateKey(new Date(year, month, day)));
  }
  return cells;
}

export function countOrdersByDate(orders) {
  const map = {};
  for (const order of orders) {
    const key = toDateKey(order.date);
    if (!key) continue;
    map[key] = (map[key] || 0) + 1;
  }
  return map;
}

export function filterOrdersByDate(orders, dateKey) {
  return orders.filter((order) => toDateKey(order.date) === dateKey);
}
