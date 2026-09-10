// Wipe guard — pure functions shared by api/sync.js and tests/wipe-guard.test.mjs.
// A write that takes any per-trip lane from >=MIN_MEANINGFUL items to zero is a wipe, not an edit.
// Per-trip lane counts; a write that takes any lane from >=MIN_MEANINGFUL to 0
// is a wipe, not an edit, and is refused unless explicitly allowed.
export function laneCounts(store) {
  const out = {};
  const trips = (store && store.trips) || {};
  for (const k of Object.keys(trips)) {
    const t = trips[k] || {};
    out[k] = {
      expenses: Array.isArray(t.expenses) ? t.expenses.length : 0,
      plans: Array.isArray(t.plans) ? t.plans.length : 0,
      stops: Array.isArray(t.stops) ? t.stops.length : 0,
      todos: Array.isArray(t.todos) ? t.todos.length : 0,
      edits: Object.keys(t).filter(x => /^\d+$/.test(x)).length,
    };
  }
  return out;
}
export const MIN_MEANINGFUL = 3;
export function wipeBlocked(current, incoming) {
  const c = laneCounts(current), i = laneCounts(incoming), hits = [];
  for (const trip of Object.keys(c)) {
    for (const lane of Object.keys(c[trip])) {
      const before = c[trip][lane], after = (i[trip] || {})[lane] || 0;
      if (before >= MIN_MEANINGFUL && after === 0) hits.push({ trip, lane, before, after });
    }
  }
  return hits;
}
