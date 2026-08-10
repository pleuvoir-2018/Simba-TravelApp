# Japan · 17–27 November 2026 — Trip Command Center

A self-contained, two-person trip planner for an 11-day anniversary trip through
**Yokohama → Nara → Osaka (⇄ Kyoto) → Nagoya → Tokyo**. One HTML file, one
serverless sync endpoint, zero build step. Deployed on Vercel; state syncs
through Vercel Blob so both travelers see the same data on any device.

---

## What's inside

```
.
├── index.html     # the entire app: markup, styles, data, and logic
├── api/
│   └── sync.js    # Vercel serverless function — GET/POST shared state to Vercel Blob
├── package.json   # single dependency: @vercel/blob (used by api/sync.js)
└── README.md
```

There is intentionally no framework, bundler, or package install for the
frontend. `index.html` is the app; edit it, push, and Vercel redeploys.

---

## Features by tab

Navigation lives in a **collapsible left sidebar** — collapse it to an
icon rail with the `«` button (remembered per device), or on mobile open it
as a drawer with the `☰` button.

**Today** — a live day view pinned to Asia/Tokyo. Before the trip it shows
the countdown and a "Still to book" list aggregated across all cities (tap
any row to jump to that meal). During the trip it shows the day number,
today's city, today's meals, today's flights and trains, tonight's hotel,
and the local weather. After the trip, a welcome-home card with total spend.

**City tabs (Yokohama · Nara · Osaka · Kyoto · Nagoya · Tokyo)**
- Interactive Leaflet map: hotel, numbered meal stops, POI pins (⛩ sights,
  ☕ cafés, 🛍 shopping, 🎁 omiyage, 🏪 konbini), day-loop polylines, the NRT
  arrival route on Yokohama, GPS "you are here" dot, and per-pin
  "Open in Google Maps" links on every POI and meal pin (resolved by place name, not raw coordinates).
- Meal cards with hours, price plan, booking status (`Booked / To book /
  Walk-in`), booking time/platform, actual-spend capture, and free-text notes — including the blue info and red warning boxes, all editable in edit mode.
- Getting there & away (intercity legs), Getting around (local transit),
  hotel card, and a live weather strip (Open-Meteo) that shows your actual
  trip dates once they enter the 16-day forecast window.

**Things to do** — a prep tracker on its own tab, with **list** and
**calendar** views. Each item has a date, category (entry ticket / booking /
transportation / hotel-concierge / shopping / admin / other), title, optional
link, and notes. Items can be checked off, edited and removed; overdue items
flag in clay and anything due within 7 days flags amber. The calendar is a
month grid (‹ › to move) that shades the trip window and lists that day's
items when you tap a cell. Seeded once with the trip's real deadlines
(Ghibli Park's 14:00 JST release, Aoniyoshi seat opening, the Menzou
TableCheck drop, hotel emails); after that it is entirely your data and
syncs like everything else.

**Day plans** — a per-city daily itinerary builder at the top of every city
tab. Each item has a date, approximate time, category (sightseeing / cafe /
food / shopping / transit / other), a name, an optional Google Maps link
(auto-generated from the name if blank), and an optional ¥ cost with card.
Items can be added, edited, removed, and checked off freely; they group by
day, sort by time, sync to the cloud, and surface on the Today view. A ¥
amount logs a linked **planned estimate** on the Expenses tab (via a `pid`
back-reference) that is excluded from all totals; once actually paid, edit
the amount to the real figure and hit "✓ Make actual" — from then on the
plan item can't overwrite the recorded amount. Clearing ¥ or deleting the
item removes the expense.

**Flights / Rail** — flight and Shinkansen legs with timing notes and warnings.

**Vault** — free-text confirmation numbers / seat assignments for every
flight, train, hotel, and restaurant. Saves on change, syncs to cloud.

**Expenses** — USD tracker with:
- category and per-card summaries (AMEX Platinum/Gold/Bonvoy Brilliant,
  Venture X, United Quest, Cash),
- **partial payments**: each expense has a `Paid $` field; the checkbox is
  a shortcut for "fully paid", cash is auto-settled, and the By Card summary
  splits PAID / UNPAID by the partial amounts,
- **planned vs. actual**: any expense can be flagged Planned (day-plan
  estimates start that way automatically); planned items live in their own
  amber section, count toward nothing, and promote to actual with one tap,
- a food budget vs. actual bar (planned-meal total at the live FX rate vs.
  logged Food + POI & Cafe spend),
- JPY→USD entry at the live rate, edit/delete, and automatic linkage from
  meal cards (entering "Actual ¥ spent" on a meal creates/updates a matching
  expense via a `mid` back-reference).

**Calc** — big-type JPY→USD converter at the live rate.

**Edit mode** (✎ button) — exposes inline fields on meal cards (price plan,
status, booking time/platform, actual spend, card, note). The save bar has
**Save** (cloud sync), **Export** (downloads a JSON backup of all edits),
and **Reset all**.

---

## Architecture

```
┌───────────────┐         GET/POST /api/sync         ┌──────────────┐
│  index.html   │ ─────────────────────────────────▶ │  api/sync.js │
│  (browser)    │ ◀───────────────────────────────── │  (Vercel fn) │
└──────┬────────┘                                     └──────┬───────┘
       │ fallback: localStorage("japan_trip_v2")             │ put/list
       │ last resort: in-memory                              ▼
       │                                          Vercel Blob store
       │                                          japan_trip_v2.json
       │
       ├── Leaflet 1.9.4 + Esri World Street Map tiles (maps)
       ├── Open-Meteo forecast API (weather, no key)
       └── fawazahmed0 currency API (live USD/JPY, no key,
           offline fallback rate ¥150)
```

### State model

All **base data** (cities, hotels, meals, POIs, flights, trains) is hardcoded
in `index.html` as the `CITIES`, `HOTELS`, `FLIGHTS`, `TRAINS` constants.
All **user edits** live in a single `overrides` object that is what actually
syncs:

```js
overrides = {
  // per-meal overrides, keyed by stop id (1..19)
  12: { jpy: 5000, res: "ok", btime: "13:00", bplat: "TableCheck",
        actualJpy: 5400, actualCard: "AMEX Gold", unote: "..." },

  // reservation vault, keyed by row
  vault: { t_n261: "car 7 seats 11A/11B", m_13: "conf #...", ... },

  // expense ledger
  expenses: [{
    date: "2026-11-23", usd: "36.00", cat: "Food",
    card: "AMEX Gold", desc: "Yamamoto Menzou",
    mid: 12,            // present only when linked to a meal card
    paidUsd: 20,        // partial-payment amount — source of truth
    paid: false         // legacy boolean, kept in sync for back-compat
  }],

  // prep to-dos (seeded on first load, then yours)
  todos: [{
    id: "t1", d: "2026-09-10", cat: "ticket",   // ticket|booking|transport|concierge|shop|admin|other
    title: "Ghibli Park tickets", url: "https://…",
    desc: "…", done: false
  }],

  // day plans, per city
  plans: [{
    id: "p17234...", city: "kyoto", d: "11/22", t: "10:30",
    cat: "sight",             // sight|cafe|food|shop|transit|other
    name: "Eikan-do", url: "https://maps.app.goo.gl/...",
    jpy: 1200, card: "Cash",  // optional — auto-syncs to expenses via pid
    done: false
  }]
}
```

`eff(stop)` merges a base stop with its override at render time.
Rendering reads `paidUsd` first and falls back to the legacy `paid` boolean,
so expenses logged before the partial-payment feature still display correctly.

### Sync semantics

- **Save** fetches the remote state first, then merges `{...remote, ...local}`
  — local wins per top-level key. The `vault` object is additionally merged
  per-row so two devices editing different vault rows don't clobber each other.
- The `expenses` array is **last-write-wins as a whole**: if both phones log
  expenses without saving in between, the second save overwrites the first's
  new entries. Practical rule: hit Save right after logging.
- If the cloud is unreachable, state falls back to `localStorage` and syncs
  on the next successful Save.
- The sidebar's collapsed/expanded preference is a per-device setting
  (`localStorage: jt_nav_mini`) and is deliberately not synced.

### `api/sync.js` contract

- `GET /api/sync` → `{ value: <overrides object> | null }`
- `POST /api/sync` (JSON body) → `{ success: true }`; the body replaces the
  blob wholesale. Non-object bodies are coerced to `{}` (this is how
  Reset all clears the cloud).
- `GET /api/sync?test=1` → runs a write/overwrite/list/read-back self-test
  against the blob store and returns a report. Useful after (re)deploying.

---

## Deployment

1. Push to `main` — Vercel builds and deploys automatically.
2. The project needs a **Vercel Blob store** attached (Storage → Blob →
   connect to project). Vercel injects `BLOB_READ_WRITE_TOKEN` automatically;
   there is no manual env var to set and **no secret lives in this repo**.
3. Verify sync with `https://<your-app>.vercel.app/api/sync?test=1` — every
   field in the report should read `ok`.

### Local development

- `vercel dev` gives you the full app including `/api/sync`.
- Any static server (`python3 -m http.server`) also works: the sync fetch
  fails gracefully and the app runs on `localStorage` alone.

---

## Security notes (read this)

- **`/api/sync` is unauthenticated** and the blob is written with
  `access: 'public'`. Anyone who learns the deployment URL can read *and
  overwrite* the shared state — which includes Vault confirmation numbers.
  Mitigations, in order of effort:
  1. Keep the deployment URL private (it is not linked from anywhere).
  2. Turn on **Vercel Deployment Protection** (password / Vercel Auth) for
     the production deployment — this shields both the page and the API.
  3. Use the **Export** button before/during the trip so you always hold a
     local JSON backup; restoring is a paste into the blob or a re-entry.
- Don't put passport numbers, full card numbers, or credentials in the Vault
  or notes fields. Booking references and seat numbers are the intended
  scope.
- User-entered text (notes, expense descriptions, vault rows) is HTML-escaped
  at render time.

---

## Editing the itinerary

Everything is data-first — find the constant, edit, push.

- **Add/only change a meal**: edit the city's `stops` array. Fields:
  `id` (unique int — also the map pin number and the overrides key), `d`
  ("11/23 Mon"), `m` (Lunch/Dinner), `name`, `dish`, `hrs`, `res`
  (`ok|book|walk`), `jpy` (planned price for two), `lat/lng`, `area`,
  optional `note` / `warn`.
- **Add a POI**: edit the city's `pois` array — `c` (`sight|cafe|shop|gift|conv`),
  `ic` (emoji), `n`, `d`, `a` (the anchor shown as "near X"), `lat/lng`.
- **Add a whole city**: append to `CITIES` (with `id`, `city`, `sub`,
  `hotel` key into `HOTELS`, `legs`, `metro`, `pois`, `stops`), add the hotel
  to `HOTELS`, a weather entry to `WX_CFG`, and an icon to `NAV_ICO`.
  The sidebar builds itself from `CITIES` order.
- **Trip dates**: the countdown constants live in the `COUNTDOWN` IIFE near
  the bottom; weather date windows in `WX_CFG`.

## Known limitations

- Expense array sync is last-write-wins (see Sync semantics).
- Live FX rate loads asynchronously; anything computed before it resolves
  uses the ¥150 fallback and corrects on the next render.
- Weather only covers a 16-day horizon (Open-Meteo free tier) — city tabs
  show the next 5 days until trip dates enter range.
- Esri tiles and the currency API are free public endpoints with no SLA.
