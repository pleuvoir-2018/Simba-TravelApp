# Trip Command Center

A self-contained, multi-trip travel planner. One HTML shell, seven classic-script
modules, per-trip data files, one serverless sync endpoint, zero build step.
Deployed on Vercel; shared state syncs through Vercel Blob so everyone on a trip
sees the same data on any device.

Built by a four-member team: **Wesley Cho** (Product Lead), **Jayden We**
(UI/UX Designer), **Fable 5 / Claude** (Developer, an AI assistant by
Anthropic) and **Gemini** (Travel Planner, an AI assistant by Google, on
restaurant and itinerary research) — largely in late-night
screenshot-driven sessions. There's an
About-us page in the app itself, linked from the landing footer.

## Current trips

| Trip | Dates | Kind |
|---|---|---|
| ⛩ **Japan** — Vancouver → Yokohama → Nara → Osaka (⇄ Kyoto) → Nagoya → Tokyo | 15–27 Nov 2026 | Anniversary trip for two |
| 🏯 **Korea** — Seoul | 7–18 May 2027 | Fully booked couple trip |
| 🍊 **Jeju** | 10–14 May 2027 | Group trip (headcount 6) |
| 🚢 **Icon Class Cruise** — Star of the Seas, Port Canaveral | 9–16 Jan 2028 | Group trip with rooms, quotes & billing |
| 🌺 **Hawaii — the 10th anniversary** | 10–19 Dec 2028 | Work in progress |
| 🌺 **Hawaii — spring break** | 9–18 Mar 2029 | Work in progress |

## Layout

```
.
├── index.html            # shell markup + versioned asset links (?v=<build>)
├── css/app.css           # the entire design system
├── js/
│   ├── 01-core.js        # state, sync client, merge semantics (owned lists, tombstones)
│   ├── 02-ui-shell.js    # sidebar/nav, meal cards, weather, header chrome
│   ├── 03-identity-home.js  # sign-in, IAM, landing page, About us
│   ├── 04-planner.js     # plans, to-dos, expenses, Add-restaurant (organizer tool)
│   ├── 05-cruise.js      # cruise + Jeju group modules, city maps
│   ├── 06-engine.js      # per-city itinerary engine + Today dashboard
│   └── 07-boot.js        # boot order
├── trips/                # DATA only — one file per trip
│   ├── japan-2026.js  korea-2027.js  jeju-2027.js
│   ├── cruise-2028.js    # + stateroom catalogue, seeded quotes, deck plans, dining/activities, fees
│   └── hawaii-2028.js  hawaii-2029.js
└── api/sync.js           # Vercel function — GET/POST shared state to Vercel Blob
```

No bundler, no framework. Modules are classic scripts loaded in order; every
asset link carries a `?v=<build>` stamp that is bumped on each deploy, so a
plain reload always fetches the current build.

## Identity & access

Everyone signs in with a personal login code (self-serviceable; display names
are Korean-mandated, 2–7 Hangul syllables). Roles:

| Role | Can |
|---|---|
| **App admin** (organizer) | Everything: all trips, Admin panel, grants, quotes, restaurant editing |
| **Member** | Trips they're granted, with editing where the trip allows |
| **Guest** (cruise) | Their own cruise data: cabin slot, requests, expenses |
| **Designer** | Opens every trip read-only for design review; all writes hard-blocked |

The Admin panel manages people, codes and per-trip grants, and includes
**View-as** (👁): impersonate any user read-only, with a banner, to see exactly
what they see. Locked trips grey out on the landing. Guest-facing copy always
says "the organizer", never a personal name.

## The Today dashboard (pre-trip)

A two-column dashboard (designed by Jayden, from his mock): hero card with the
trip photo, accent-coloured countdown and flight chips; **To Book** list with
one-line booking notes; prep to-dos; walk-ins. Right rail: **Trip Overview**,
a live mini **Calendar** (trip days dotted — tap a day for a popover of that
day's city and meals), and a 7-day **Weather** card for the longest-stay city
(Open-Meteo, cached, 8s timeout). In-trip and post-trip states have their own
hero layouts.

## Group modules

**Cruise (Star of the Seas)** — Rooms tab: 16-category stateroom catalogue
with official photos and specs; organizer quotes at 2- and 4-adult occupancy
(Royal's live pricing seeded, fully editable — tombstones stop deleted seeds
resurrecting); per-person maths on every card; occupancy filter; Fees & extras
(deposit, gratuities). Cabins with slot claiming, room-type change requests,
per-person billing with deposits, expense splitting. The Ship tab: facts,
neighborhoods, dining (included vs specialty), things to do, and an
interactive deck-plan explorer (18 official plans, native resolution, your
cabin's deck badged).

**Jeju** — shared schedule with day pins, votes, per-person flights, car
splits, group expenses with insights, and a two-way linked island map
(starter ideas ⇄ markers, Google Maps links everywhere).

## Design system

Lora + Inter (from the design proposal), warm washi/indigo/clay palette,
7px radii, chip family with 1px ink borders, first-class dark mode (every
note flavour, nav, calendar and card has a dark variant). City maps never
scroll-jack; popovers and drawers are mobile-safe. The engine renders
everything from data — adding a trip is adding a `trips/*.js` file.

## Development notes

- **Deploys**: push to `main` → Vercel. Always re-stamp the `?v=` build query
  in `index.html` in the same commit as any css/js change.
- **State**: one Blob document; `mergeApp`/`mergeCruise` in `01-core.js` do
  role-aware merging — owned lists per user, admin-owned wholesale fields,
  deletion tombstones (`removedUids`, `qSeedSkip`).
- **Async in re-rendering panels** must resolve DOM targets at write time
  (see `loadTodayWx` for the pattern and the bug it fixes).
- Anything fetched can fail: inline it (About-page logo is an SVG data URI)
  or fail beautifully (image `onerror` fallbacks everywhere).

Photos via Wikimedia Commons under their stated licences; stateroom and
deck-plan imagery via Royal Caribbean's distributor assets.
