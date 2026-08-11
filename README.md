# Trip Command Center

A self-contained, multi-trip travel planner. One HTML engine, per-trip data
files, one serverless sync endpoint, zero build step. Deployed on Vercel;
state syncs through Vercel Blob so everyone on a trip sees the same data on
any device.

Current trips:

| Trip | Dates | Status |
|---|---|---|
| 🇯🇵 **Japan** — Yokohama → Nara → Osaka (⇄ Kyoto) → Nagoya → Tokyo | 15–27 Nov 2026 | Planned, anniversary trip for two |
| 🇰🇷 **Korea** — Seoul ⇄ Jeju (Westin Seoul Parnas · Parnas Hotel Jeju) | 7–18 May 2027 | Work in progress, behind an access code |
| 🚢 **Icon Class Cruise** — Star of the Seas, Port Canaveral | 9–16 Jan 2028 | Group trip with per-person sign-in |
| 🌺 **Hawaii** | Dec 2028 | Someday card |

---

## Layout

```
.
├── index.html            # the engine: markup, styles, and all behaviour
├── trips/
│   ├── japan-2026.js     # DATA only: cities, hotels, meals, POIs, flights…
│   ├── korea-2027.js
│   └── cruise-2028.js    # cruise tabs, itinerary, stateroom categories
├── api/
│   └── sync.js           # Vercel function — GET/POST shared state to Vercel Blob
├── package.json          # single dependency: @vercel/blob
└── README.md
```

No framework, bundler, or install for the frontend. Each trip file is pure
data and self-registers into `window.TRIPS_REGISTRY`; the engine points its
live bindings (`CITIES`, `HOTELS`, `FLIGHTS`, weather, day maps, currency,
timezone, theme) at whichever trip is opened. **Adding a trip = adding one
file** and a landing-page card.

## Storage & sync

The synced blob is namespaced per trip:

```json
{ "_ts": 0, "trips": { "japan-2026": {…}, "korea-2027": {…}, "cruise-2028": {…} } }
```

`overrides` is a live reference into the open trip's namespace, so trips can
never see or overwrite each other; cloud merges happen per trip id. Saves are
two-stage — instant to `localStorage`, debounced to the cloud — and legacy
flat blobs migrate automatically.

Everything editable in the app is an **overlay** on the trip files: per-stop
field edits, tombstoned removals, in-app-added restaurants, day plans,
expenses, to-dos, vault entries. The files on disk are the canonical record
and are never mutated by the app, so any in-app change is reversible.

## The city engine (Japan · Korea)

Per-city tabs with a Leaflet map (meals, POIs, day-loop and transit lines),
meal cards with booking status / cash warnings / cost tracking, day plans
that flow into a planned-vs-actual expense tracker, live FX (¥ or ₩) with an
ECB trend chart, a to-do list with a calendar view and per-trip seeded
deadlines, weather, a flights board, and a Vault for confirmation numbers
(passcode-gated, per session). **Edit Mode** unlocks meal costs, statuses,
and actual spend for editing.

**Developer mode** (checkbox at the sidebar foot) reveals a 🛠 tab that
manages all restaurants without touching code: full-form adds with
coordinates parsed from a pasted Google Maps URL, prefill edits of built-ins
(stored as overrides), tombstone removals with one-tap restore.

Trips archive automatically two days after their end date: read-only, badge
on the landing card, data preserved.

## The cruise module (group trips)

A trip flagged `cruise: true` swaps in its own tab set, ocean theme, and a
per-person sign-in: the organizer uses a master code; guests use 6-character
codes generated (and revocable) on the Admin tab.

- **Board** — announcements; organizer posts, optionally pinging a Discord
  channel via a webhook configured on the Admin tab
- **Schedule** — the sailing's day-by-day; organizer adds/edits plans per day
- **Rooms** — numbered Room 1…N (actual cabin numbers optional, addable when
  Royal assigns them), each with a stateroom category and **two slots**
  claimed airline-seat style; claiming elsewhere releases your old slot
- **Expenses** — per-person: charges from the organizer as single lines with
  an itemized invoice view (categories, deposit milestone, PAID stamp), plus
  a personal tracker. The organizer gets a collection dashboard
  (billed / collected / outstanding), a line-item billing form, deposit
  tracking (UNPAID → DEPOSIT PAID → PAID), and payment recording
- **Logistics** — guests file their travel legs; the organizer sees all
  arrivals/departures sorted for shuttle planning
- **Admin** — guests & codes, Discord webhook (organizer only)

Cruise saves merge **role-aware** so simultaneous edits interleave: your own
expense/logistics slice always wins locally, organizer-owned collections
follow the organizer, and room slots merge individually so one person's
claim can't clobber another's.

## Deploy

Push to `main`; Vercel builds and serves. `BLOB_READ_WRITE_TOKEN` must be set
in the Vercel project for `api/sync.js`.

## Honest security model

Access codes, the vault passcode, and the Discord webhook all live
client-side or in the shared blob, and `/api/sync` is unauthenticated. This
keeps honest people organized; it is not a defense against a motivated
technical attacker. Don't store anything here that would matter if read.
