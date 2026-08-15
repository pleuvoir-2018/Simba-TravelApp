/* Trip DATA only — loaded before the engine in index.html.
   No behaviour lives in this file; add cities, hotels, POIs and meals here. */
window.TRIPS_REGISTRY=window.TRIPS_REGISTRY||{};

var HOTELS = {
 parq:{n:"JW Marriott Parq Vancouver",lat:49.2756,lng:-123.1148,addr:"39 Smithe St, Vancouver, BC V6B 0R3, Canada",tel:"+1 604-676-0888",mail:"— Marriott app chat",stn:"Yaletown–Roundhouse (Canada Line) · 7 min walk — direct train to YVR ~25 min (board a YVR-bound train, not Richmond)",note:"Night of Nov 15 only. ZG021 departs 10:30 — leave the hotel by ~7:45 for a 2-hour international cushion."},
 westin:{n:"The Westin Yokohama",lat:35.4620,lng:139.6300,addr:"4-2-8 Minatomirai, Nishi-ku, Yokohama 220-0012",tel:"+81 45-577-0888",mail:"ays.yokohama@westin.com",stn:"Shin-Takashima (Minatomirai line) · 5 min walk — Yokohama Stn · 10 min walk",note:"Check-in 23F. Reservations: reservations.yokohama@westin.com"},
 shisui:{n:"Shisui, a Luxury Collection Hotel",lat:34.6857,lng:135.8340,addr:"62 Noborioji-chō, Nara 630-8213 (west edge of Nara Park)",tel:"+81 75-744-0951",mail:"reservation-sh@suihotels.com",stn:"Kintetsu-Nara (Kintetsu line) · 12 min walk — Kenchō-Higashi bus stop · 3 min",note:"Phone = SUI Customer Engagement Center. Garden Delight champagne hour at dusk, free."},
 miyako:{n:"Osaka Marriott Miyako",lat:34.6462,lng:135.5136,addr:"1-1-43 Abenosuji, Abeno-ku, Osaka 545-0052 (Abeno Harukas 38–57F)",tel:"+81 6-6628-6111",mail:"— Marriott app chat / hotel web form",stn:"Tennōji (JR · Midōsuji) & Ōsaka-Abenobashi (Kintetsu) · direct elevator, 0 min",note:"Harukas 300 observatory is upstairs in the same tower."},
 tiad:{n:"TIAD, Autograph Collection",lat:35.1638,lng:136.9098,addr:"5-15-19 Sakae, Naka-ku, Nagoya 460-0008 (Hisaya Ōdōri Park)",tel:"+81 52-252-2288",mail:"— form at hotel-tiad.com/en/contact",stn:"Yabachō (Meijō line) · 4 min walk — Sakae (Higashiyama line) · 9 min walk",note:"Toll-free (JP): 0120-390-011. SHUHARI is on 5F."},
 hyatt:{n:"Grand Hyatt Tokyo",lat:35.6601,lng:139.7290,addr:"6-10-3 Roppongi, Minato-ku, Tokyo 106-0032 (Roppongi Hills)",tel:"+81 3-4333-1234",mail:"tokyo.grand@hyatt.com",stn:"Roppongi (Hibiya · Ōedo lines) · 3 min, connected via Roppongi Hills",note:"FHR booking: upgrade + breakfast + $125 credit (used at Roku Roku)."},
};var CITIES=[
{id:"today",city:"Today",sub:"live day view",today:true},
{id:"todo",city:"To-do",sub:"Prep & deadlines",todo:true},
{id:"vancouver",city:"Vancouver",sub:"11/15–11/16 · repositioning",hotel:"parq",
 legs:[
  {r:"✈ YVR → JW Marriott Parq",m:"11/15 · Canada Line ~25 min, or 20-min taxi",n:"Off DL3748, clear Canadian customs, then Canada Line from the airport to Yaletown–Roundhouse and a 7-min walk. Taxi is ~C$40 and simpler with luggage after a long day."},
  {r:"JW Marriott Parq → YVR ✈",m:"11/16 · Canada Line ~25 min from Yaletown–Roundhouse",n:"Leave the hotel ~7:45 for ZG021 at 10:30 — a 2-hour international cushion. Board a YVR-bound train, NOT a Richmond–Brighouse one; they alternate."}],
 lounges:[
  {n:"Plaza Premium Lounge — International Departures",loc:"Airside · Level 4, Pier D — opposite the food court and duty free, between gates D67 and D68",
   access:"Amex Platinum direct access: 3-hour limit · via the Priority Pass card: 2 hours",
   note:"The bigger of the two at ~10,500 sq ft — floor-to-ceiling windows with mountain and apron views, congee with condiments, salads, noodles. Use the Amex card at the desk, not Priority Pass, for the longer stay."},
  {n:"SkyTeam Lounge",loc:"Airside · International Terminal, near gate D53",
   access:"Priority Pass · 3-hour limit",
   note:"Half the size but refurbished in 2025 — made-to-order noodle station and a congee bar, solid breakfast spread. No full bar in the mornings. Reviewers who tried both preferred it for the noodles."}],
 metro:[["Canada Line","Yaletown–Roundhouse is 7 min on foot · YVR direct ~25 min · trains alternate YVR / Richmond, check the front"],
        ["On foot","The Victor is upstairs in the same complex · Yaletown and the False Creek seawall are 5–10 min · Gastown ~20 min"]],
 pois:[
 // ── the evening you actually have ──
 {c:"sight",ic:"🌊",n:"False Creek seawall (Yaletown)",d:"5 min from the hotel — lit water and the Science World dome after dark; the one walk that fits",a:"The Victor",lat:49.2731,lng:-123.1211},
 {c:"sight",ic:"🏙",n:"Vancouver Lookout",d:"360° deck, 9:30–18:30 · sunset is ~16:30 in mid-November, so a 17:00 visit is a city-lights view — tight after a 15:45 landing",a:"downtown",lat:49.28492,lng:-123.11223},
 {c:"sight",ic:"🕰",n:"Gastown steam clock",d:"20-min walk or a short taxi — cobbles, whistle on the quarter hour",a:"downtown",lat:49.2844,lng:-123.1089},
 {c:"sight",ic:"🏟",n:"BC Place & Rogers Arena",d:"both are next door to Parq — check if anything is on the night you land",a:"hotel",lat:49.2768,lng:-123.1119},
 // ── food & drink ──
 {c:"cafe",ic:"☕",n:"Nine Bar Coffee",d:"477 Davie St · opens 07:00 — the one good coffee that beats your 7:45 departure",a:"hotel",lat:49.27576,lng:-123.12374},
 {c:"cafe",ic:"🍸",n:"Parker Rooftop",d:"1379 Howe St, 9F · 15:00–23:00 · a drink with a view if The Victor runs early",a:"downtown",lat:49.27616,lng:-123.13019},
 // ── practical ──
 {c:"shop",ic:"🛍",n:"Yaletown (Mainland & Hamilton St)",d:"brick warehouses, boutiques and patios — the pleasant 20 minutes before dinner",a:"The Victor",lat:49.2755,lng:-123.1213},
 {c:"conv",ic:"🏪",n:"London Drugs (Granville)",d:"late-night pharmacy & sundries — last chance for anything forgotten before Japan",a:"downtown",lat:49.2812,lng:-123.1206}],
 stops:[
  {id:30,d:"11/15 Sun",m:"Dinner",name:"The Victor",dish:"Steakhouse — dry-aged beef, seafood tower",
   hrs:"Sun 17:00–23:00",res:"book",jpy:0,cost:"~C$250 for two, before the FHR credit",lat:49.27523,lng:-123.11313,area:"Parq Vancouver, 6F rooftop — upstairs from your room",
   note:"Reviews single out the onion milk bread, beef tartare and the sauce trio with the striploin. Charge it to the room so the FHR dining credit applies.",
   warn:"BOOK IT — 778-370-8600 or victor@parqvancouver.com, or let the JW concierge place it with the anniversary noted. Confirm the folio charge reaches the FHR credit."}]},
{id:"yokohama",city:"Yokohama",sub:"11/17–11/19",hotel:"westin",showNRT:true,
 legs:[
  {r:"✈ NRT → Westin Yokohama",m:"11/17 · N'EX 30 ✓ · dep Narita T1 14:45 → arr Yokohama 16:16",n:"Land 12:45 → landside ~14:15 → Platform 1/2. Arr Platform 6, then 5-min taxi to the Westin. Door-to-door ~16:45 — booked on Japan Rail Tickets."},
  {r:"Shin-Yokohama → Kyoto",m:"11/19 · Nozomi 73 · dep 14:07 → arr 16:00",n:"Lunch done by ~12:50 → JR Yokohama line Yokohama → Shin-Yokohama, 12 min. Bags: coin lockers at Yokohama Stn, or carry."}],
 metro:[["Minatomirai Line","Shin-Takashima / Minatomirai (5 min walk) → Yokohama Stn 2 min · → Motomachi-Chūkagai 8 min"],["On foot","Shirahara is 3 min from the hotel · Hana Yori is at Yokohama Stn · Tenshichi is at Kannai (JR Negishi line, 2 stops from Sakuragichō)"]],
 pois:[
 // ── sights ──
 {c:"sight",ic:"🧱",n:"Red Brick Warehouse",d:"waterfront landmark + shops",a:"Afuri",lat:35.4527,lng:139.6425},
 {c:"sight",ic:"🏮",n:"Chinatown + Yamashita Park",d:"Japan's biggest Chinatown",a:"Motomachi",lat:35.4427,lng:139.6459},
 {c:"sight",ic:"🗼",n:"Landmark Tower Sky Garden",d:"69F observatory — same building as Afuri, stack with dinner 11/18",a:"Afuri",lat:35.4546,lng:139.6317},
 {c:"sight",ic:"🍜",n:"Cup Noodles Museum",d:"make your own cup — book timed slot online ~mid-Aug for Nov",a:"Afuri",lat:35.4553,lng:139.6389},
 {c:"sight",ic:"🎡",n:"Cosmo Clock 21",d:"harbor ferris wheel — best after dark",a:"Afuri",lat:35.4553,lng:139.6365},
 {c:"sight",ic:"🚗",n:"Nissan Global HQ Gallery",d:"free showroom, GT-R heritage cars",a:"hotel",lat:35.4634,lng:139.6256},
 {c:"sight",ic:"🍥",n:"Shin-Yokohama Ramen Museum",d:"1958 streetscape underground — AT your 11/19 departure station",a:"Shin-Yokohama",lat:35.5100,lng:139.6152},
 {c:"sight",ic:"🚡",n:"Yokohama Air Cabin",d:"urban ropeway Sakuragicho → Unga Park (¥1,000) — lands at Cup Noodles",a:"Afuri",lat:35.4511,lng:139.6320},   // NEW
 {c:"sight",ic:"🐋",n:"Osanbashi Pier rooftop",d:"free 360° wood-deck 'whale's back' — best night skyline shot in the city",a:"Chinatown",lat:35.4489,lng:139.6480},   // NEW
 {c:"sight",ic:"🌃",n:"OMO5 Bashamichi 46F lobby",q:"OMO5横浜馬車道",d:"free 150m observation floor, opened Jan 2026 — Bashamichi Stn direct",a:"Afuri",lat:35.4507,lng:139.6352},   // NEW
 {c:"sight",ic:"⛵",n:"Nippon Maru + Port Museum",q:"日本丸メモリアルパーク",d:"1930 tall ship in dry dock, 2-min from Landmark Tower",a:"Afuri",lat:35.4538,lng:139.6292},   // NEW
 // ── cafés ──
 {c:"cafe",ic:"☕",n:"Zou-no-hana Terrace",d:"harbor-view café — DAYTIME ONLY 10:00–18:00, food LO 17:00",a:"Chinatown",lat:35.4494,lng:139.6437},
 {c:"cafe",ic:"🥐",n:"Pompadour Motomachi (1969)",d:"Yokohama's classic bakery, main store",a:"Chinatown",lat:35.4407,lng:139.6473},
 {c:"cafe",ic:"🍩",n:"Yokohama Timber Wharf",d:"new (Oct '25) wooden waterfront hub in Rinko Park — I'm donut? & dacō · 8-min walk from Westin",a:"hotel",lat:35.4612,lng:139.6353},   // NEW
 // ── shopping ──
 {c:"shop",ic:"🛍",n:"Motomachi Shopping Street",d:"old-money boutiques & zakka",a:"Chinatown",lat:35.4413,lng:139.6485},
 {c:"shop",ic:"🎮",n:"Pokémon Center Yokohama",d:"Yokohama Sky Building 8F (ex-Marui City), station east exit · 10:30–20:30",a:"hotel",lat:35.4649,lng:139.6246},
 {c:"shop",ic:"🛍",n:"MARK IS Minatomirai",d:"zakka & stationery floors",a:"hotel",lat:35.4573,lng:139.6304},
 {c:"shop",ic:"⚓",n:"Yokohama Hammerhead",d:"pier mall — chocolate & craft-beer makers",a:"Afuri",lat:35.4562,lng:139.6448},
 {c:"shop",ic:"👕",n:"Colette Mare (Uniqlo + GU)",q:"コレットマーレ 桜木町",d:"Uniqlo AND GU both on 3F · 11:00–20:00 · 5 min from Afuri — shop BEFORE dinner",a:"Afuri",lat:35.4522,lng:139.6307},
 {c:"shop",ic:"🌊",n:"Marine & Walk Yokohama",d:"open-air seaside mall between Red Brick & Hammerhead — angel-wings mural",a:"Afuri",lat:35.4545,lng:139.6427},   // NEW
 // ── gifts ──
 {c:"gift",ic:"🍰",n:"Francais (Takashimaya B1F)",q:"フランセ 横浜高島屋",d:"mille-feuille — ex-Yokohama Francais, rebranded 2018 · Takashimaya B1F; Sogo (east side) has a counter too",a:"Yokohama Stn",lat:35.4661,lng:139.6218},
 {c:"gift",ic:"⛵",n:"Ariake Harbour (Motomachi honkan)",q:"ありあけ本館",d:"boat-shaped harbour cakes — the Yokohama omiyage",a:"Chinatown",lat:35.4415,lng:139.6470},
 // ── konbini ──
 {c:"conv",ic:"🏪",n:"FamilyMart Minatomirai",d:"closest to the Westin, 24h — breakfast run",a:"hotel",lat:35.4615,lng:139.6295},
 {c:"conv",ic:"🏪",n:"7-Eleven Shin-Takashima",d:"by your metro station, 24h · best konbini ATM for foreign cards",a:"hotel",lat:35.4630,lng:139.6270},
 {c:"conv",ic:"🏪",n:"Lawson Minatomirai",d:"toward MARK IS — famous karaage-kun",a:"hotel",lat:35.4585,lng:139.6315}],
 stops:[
  {id:1,d:"11/17 Tue",m:"Dinner",name:"Shirahara (しらはら)",q:"貝・刺身専門店 しらはら みなとみらい一番街",dish:"Shellfish & sashimi",hrs:"Tue 17:00–23:00 (lunch to 14:00)",res:"book",jpy:12000,lat:35.4615,lng:139.6281,area:"Yokohama Shinfoster East Tower, 3-min walk",note:"Arrival-night pick — 3 min from the Westin. English menu via QR code. Counter seats face the chef.",warn:"Ask the Westin to book 17:30–18:00 for two."},
  {id:2,d:"11/18 Wed",m:"Lunch",name:"Tenshichi Kannai Honten",q:"天七 関内本店 横浜",dish:"Edomae tempura counter",
   hrs:"11:00–15:00 · 17:00–22:30 daily",res:"book",jpy:12000,lat:35.44705,lng:139.63509,area:"5-57 Tokiwachō, Naka-ku · Kannai",
   note:"Counter tempura since the mid-1960s — chef fries in front of you and explains each piece; English spoken. Oyster and anago singled out in reviews.",
   warn:"Book ahead — 045-681-3376, or ask the Westin. Verify the lunch course price when you book."},
  {
    "id": 3,
    "d": "11/18 Wed",
    "m": "Dinner",
    "name": "Afuri Yokohama Landmark Tower",
    "dish": "Ramen",
    "hrs": "11:00–23:00 daily",
    "res": "walk",
    "jpy": 6000,
    "lat": 35.4547,
    "lng": 139.6317,
    "area": "Minato Mirai"
  },
  {id:4,d:"11/19 Thu",m:"Lunch",name:"Hana Yori Hanbagu",q:"花より肉バーグ 横浜",dish:"Grill-your-own hamburg",
   hrs:"11:30–22:00 daily",res:"walk",jpy:5000,lat:35.46816,lng:139.62292,area:"Tsuruyachō 2-16-4, 2F · Yokohama Stn west",
   note:"Departure-day lunch: check out, Minatomirai Line to Yokohama Stn (2 min), eat, then JR to Shin-Yokohama. You grill the patty yourself at the table.",
   warn:"Be seated at 11:30 opening and done by ~12:50 for the 14:07 Nozomi. The Yokohama Front branch (THE YOKOHAMA FRONT 2F, east side) is closer to the JR gates if you are running tight."}]},

{id:"nara",city:"Nara",sub:"11/19–11/21",hotel:"shisui",
 legs:[
  {r:"Arrive: Kyoto → Kintetsu-Nara",m:"11/19 · Kintetsu Ltd. Express ~35 min (16:20 → 16:55)",n:"Off the Nozomi at 16:00, Kintetsu platform is beneath Kyoto Stn. Shisui is a 12-min walk or short taxi."},
  {r:"Depart: Kintetsu-Nara → Ōsaka-Namba",m:"11/21 · Aoniyoshi sightseeing ltd. exp · dep 17:34 → arr 18:12 (Sat/hol)",n:"Full final day in Nara — Fuku Sushi lunch, afternoon free. Aoniyoshi is all-reserved: seats open on Kintetsu ~1 month out (Oct 21). At Namba: Midōsuji to Tennōji, drop bags, then Ondoriya."}],
 metro:[["On foot","Shisui sits inside Nara Park — Tōdai-ji 12 min, Kōfuku-ji 10 min, Kintetsu-Nara 12 min"],["Loop bus","Nara City Loop stops at Kenchō-Higashi, 3 min from the hotel"]],
 pois:[
  {c:"sight",ic:"⛩",n:"Tōdai-ji Great Buddha",d:"go at 8:00 open",a:"hotel",lat:34.6890,lng:135.8398},
  {c:"sight",ic:"🦌",n:"Nara Park + Kasuga Taisha",d:"lantern-lined approach",a:"hotel",lat:34.6811,lng:135.8483},
  {c:"sight",ic:"🌿",n:"Yoshiki-en Garden",d:"next door, usually near-empty",a:"hotel",lat:34.6849,lng:135.8378},
  {c:"sight",ic:"🏯",n:"Kōfuku-ji five-story pagoda",d:"Nara's postcard",a:"hotel",lat:34.6832,lng:135.8317},
  {c:"sight",ic:"🪷",n:"Isui-en Garden",d:"borrowed-scenery masterpiece beside Yoshiki-en — Tōdai-ji gate as backdrop",a:"hotel",lat:34.6857,lng:135.8365},
  {c:"sight",ic:"🌙",n:"Sarusawa Pond at dusk",d:"pagoda reflection; deer wander down at golden hour",a:"Poku-Poku",lat:34.6800,lng:135.8306},
  {c:"sight",ic:"🌅",n:"Nigatsu-dō",d:"free wooden balcony above Tōdai-ji — the sunset view over Nara; lantern corridor",a:"hotel",lat:34.6892,lng:135.8455},
  {c:"sight",ic:"⛰",n:"Wakakusa-yama",d:"grass-slope mini-mountain behind the park — deer on the hillside, city panorama (gates close ~17:00)",a:"hotel",lat:34.6842,lng:135.8506},
  {c:"sight",ic:"🏮",n:"Ukimidō pavilion",d:"hexagonal pavilion floating on Sagi-ike — quietly lantern-lit after dark",a:"Poku-Poku",lat:34.6788,lng:135.8396},
  {c:"sight",ic:"🏘",n:"Naramachi Koshi-no-Ie",d:"free preserved lattice townhouse — 5 min from your tonkatsu dinner",a:"Poku-Poku",lat:34.6755,lng:135.8297},
  {c:"cafe",ic:"🍵",n:"Mizuya Chaya",d:"thatched teahouse between Tōdai-ji & Kasuga",a:"hotel",lat:34.6858,lng:135.8443},
  {c:"cafe",ic:"☕",n:"Rokumei Coffee",d:"Nara's specialty roaster",a:"Kintetsu Stn",lat:34.6822,lng:135.8262},
  {c:"shop",ic:"🛍",n:"Nakagawa Masashichi (Naramachi)",d:"300-yr-old textiles & zakka",a:"Poku-Poku",lat:34.6779,lng:135.8293},
  {c:"shop",ic:"🍡",n:"Nakatanidou",d:"the flying-mochi-pounding shop",a:"Kintetsu Stn",lat:34.6822,lng:135.8272},
  {c:"shop",ic:"🍣",n:"Hiraso (kakinoha sushi)",d:"persimmon-leaf pressed sushi to go",a:"Poku-Poku",lat:34.6795,lng:135.8280},
  {c:"shop",ic:"🏮",n:"Higashimuki arcade",d:"covered street from Kintetsu Stn — everything in one line",a:"Kintetsu Stn",lat:34.6822,lng:135.8285},
  {c:"gift",ic:"🐾",n:"Naramachi Chirimen",d:"Traditional fabric cat collars for Simba & Ahri",a:"Naramachi",lat:34.6780,lng:135.8290},
  {c:"gift",ic:"🦌",n:"Tōdai-ji Monzen shops",d:"deer-everything: senbei, plushes, washi",a:"hotel",lat:34.6868,lng:135.8375},
  {c:"conv",ic:"🏪",n:"Lawson Kintetsu-Nara Ekimae",d:"nearest cluster to Shisui (~10 min) — Nara Park itself has none",a:"hotel",lat:34.6845,lng:135.8270},
  {c:"conv",ic:"🏪",n:"7-Eleven Higashimuki",d:"inside the arcade, 24h",a:"Kintetsu Stn",lat:34.6832,lng:135.8283},
  {c:"conv",ic:"🏪",n:"FamilyMart Konishi-dōri",d:"one street west, 24h",a:"Kintetsu Stn",lat:34.6825,lng:135.8260}],
 stops:[
  {id:5,d:"11/19 Thu",m:"Dinner",name:"Poku-Poku",dish:"Tonkatsu",hrs:"17:30–20:00 · closed Tue & Fri",res:"book",jpy:7500,lat:34.6788,lng:135.8304,area:"Shōnamichō",warn:"CALL AHEAD. Closes 20:00; you arrive ~17:00."},
  {id:6,d:"11/20 Fri",m:"Lunch",name:"Suiyō",dish:"Kaiseki",hrs:"12:00–14:30 daily",res:"ok",jpy:15180,lat:34.6854,lng:135.8354,area:"Inside Shisui"},
  {id:7,d:"11/20 Fri",m:"Dinner",name:"Kitsune",dish:"Sukiyaki",hrs:"17:00–21:00 · closed Wed",res:"book",jpy:31900,lat:34.6811,lng:135.8299,area:"Ganriinchō",warn:"Tablecheck booking still on 11/19 — move it."},
  {id:20,d:"11/21 Sat",m:"Lunch",name:"Fuku Sushi",q:"福寿司 奈良",dish:"Nigiri & chirashi sets",hrs:"11:30–13:30 L · closed Thu",res:"book",jpy:10000,lat:34.6779,lng:135.8295,area:"Shimomikado arcade / Naramachi",warn:"Tiny 15-seat couple-run counter — call 0742-26-5677 ahead.",note:"Lunch ends 13:30 → whole afternoon free in Nara before the 17:34 Aoniyoshi."}]},

{id:"osaka",city:"Osaka",sub:"11/21–11/24",hotel:"miyako",
 legs:[
  {r:"Arrive: Ōsaka-Namba → Tennōji",m:"11/21 eve · Midōsuji line 6 min",n:"Aoniyoshi lands Namba 18:12. The Miyako has a direct elevator from Tennōji / Ōsaka-Abenobashi — bags first, then back up for dinner."},
  {r:"Depart: Tennōji → Shin-Ōsaka → Nagoya",m:"11/24 · Kuroshio 12 ✓ dep 10:35 → Shin-Ōsaka 10:51 · Nozomi 90 dep 11:30",n:"Booked — ride JR from Tennōji (Platform 18), not the Midōsuji. Arr Shin-Ōsaka Platform 1 with a 39-min cushion to the Nozomi. Leave the hotel by ~10:15; Nagoya 12:19, Keitei inside the station."}],
 metro:[["Midōsuji Line (red)","Tennōji → Namba 6 min · → Umeda 15 min · every 2–4 min"],["JR Osaka Loop","backup ring from Tennōji; Osaka-jō 12 min"]],
 pois:[
  {c:"sight",ic:"🌃",n:"Hōzenji Yokochō",d:"lantern alley + moss-covered Fudō",a:"Namba",lat:34.6678,lng:135.5031},
  {c:"sight",ic:"🏙",n:"Harukas 300 Observatory",d:"in your own building — go at sunset",a:"hotel",lat:34.6461,lng:135.5136},
  {c:"sight",ic:"🗼",n:"Shinsekai + Tsūtenkaku",d:"retro Osaka at night",a:"hotel",lat:34.6525,lng:135.5063},
  {c:"sight",ic:"🦁",n:"Namba Yasaka lion shrine",d:"the giant lion-head stage",a:"Namba",lat:34.6620,lng:135.4970},
  {c:"sight",ic:"🐙",n:"Kuromon Ichiba Market",d:"morning grazing",a:"Namba",lat:34.6656,lng:135.5065},
  {c:"sight",ic:"🎰",n:"Janjan Yokochō",d:"time-capsule arcade alley — kushikatsu counters & shōgi parlors, 10 min from hotel",a:"hotel",lat:34.6503,lng:135.5060},
  {c:"sight",ic:"🏞",n:"Namba Parks rooftop",d:"canyon garden in autumn color above the mall",a:"Namba",lat:34.6617,lng:135.5019},
  {c:"sight",ic:"🏯",n:"Osaka Castle + Nishinomaru",d:"the keep over autumn moats — JR Loop from Tennōji, 12 min",a:"JR Loop",lat:34.6873,lng:135.5262},
  {c:"sight",ic:"🌇",n:"Umeda Sky Building",d:"twin-tower rooftop ring — pairs with your Umeda sushi lunch",a:"Umeda",lat:34.7052,lng:135.4899},
  {c:"sight",ic:"🏃",n:"Ebisubashi + Glico sign",d:"the Dōtonbori runner — best lit at night, 5 min from Dōguyasuji",a:"Namba",lat:34.6686,lng:135.5012},
  {c:"sight",ic:"🛕",n:"Shitennō-ji",d:"Japan's oldest official temple (593 AD) — 15-min walk from Harukas, open 8:30",a:"hotel",lat:34.6534,lng:135.5163},
  {c:"cafe",ic:"☕",n:"Lilo Coffee Roasters",d:"Amerikamura standing-room favorite",a:"Ondoriya",lat:34.6729,lng:135.4986},
  {c:"cafe",ic:"🍵",n:"Wad Omotenashi Cafe",d:"serene matcha & ceramics upstairs",a:"Ondoriya",lat:34.6741,lng:135.5017},
  {c:"cafe",ic:"🍷",n:"Takamura Wine & Coffee",d:"cathedral-sized warehouse of beans & bottles, Utsubo",a:"Umeda",lat:34.6796,lng:135.4919},
  {c:"cafe",ic:"🫘",n:"Marufuku Coffee (Sennichimae, 1934)",d:"Osaka's kissaten original — thick dark house blend, hotcakes",a:"Namba",lat:34.6656,lng:135.5043},
  {c:"shop",ic:"🛍",n:"Shinsaibashi-suji arcade",d:"end-to-end covered shopping",a:"Ondoriya",lat:34.6717,lng:135.5012},
  {c:"shop",ic:"👕",n:"Amerikamura",d:"vintage & streetwear grid",a:"Ondoriya",lat:34.6726,lng:135.4980},
  {c:"shop",ic:"🕹",n:"Den Den Town",d:"Osaka's Akihabara, near Kuromon",a:"Namba",lat:34.6602,lng:135.5062},
  {c:"shop",ic:"🔪",n:"Sennichimae Dōguyasuji",q:"千日前道具屋筋商店街",d:"THE 11/22 afternoon — kitchenware arcade, knives, takoyaki pans, food-sample magnets · 10:00–18:00, ~150 m, not every shop is tax-free · Midōsuji back to Tennōji ~10 min",a:"Namba",lat:34.6640,lng:135.5035},
  {c:"gift",ic:"🥨",n:"Bâton d'or",d:"The 'Hermès of Pocky', upscale snacks",a:"Hankyu Umeda",lat:34.7029,lng:135.4984},
  {c:"gift",ic:"🥟",n:"551 Hōrai (Tennōji)",d:"steamed pork buns in your own station — buy for the 11/24 Shinkansen",a:"hotel",lat:34.6465,lng:135.5133},
  {c:"gift",ic:"🍮",n:"Rikuro Ojisan (Namba honten)",d:"the jiggly cheesecake, stamped fresh out of the oven",a:"Namba",lat:34.6656,lng:135.5010},
  {c:"conv",ic:"🏪",n:"7-Eleven Abeno Harukas",d:"inside the tower complex — closest to your room",a:"hotel",lat:34.6460,lng:135.5140},
  {c:"conv",ic:"🏪",n:"FamilyMart Abenobashi",d:"street level by the Kintetsu entrance, 24h",a:"hotel",lat:34.6470,lng:135.5120},
  {c:"conv",ic:"🏪",n:"Lawson (Q's Mall side)",d:"across the crossing, 24h",a:"hotel",lat:34.6455,lng:135.5105}],
 stops:[
  {id:9,d:"11/21 Sat",m:"Dinner",name:"Ondoriya",dish:"Yakitori",hrs:"18:00–03:00 daily",res:"ok",jpy:7500,lat:34.6732,lng:135.5034,area:"Shinsaibashi",note:"Aoniyoshi lands 18:12 → bags at the Miyako → aim ~19:30. Open to 03:00, zero pressure."},
  {id:21,d:"11/22 Sun",m:"Lunch",name:"Gyukatsu Kyoto Katsugyu",q:"牛カツ京都勝牛 あべの新宿ごちそうビル店",dish:"Beef katsu — grill it yourself",
   hrs:"11:00–22:00 daily (LO 21:30)",res:"walk",jpy:5000,lat:34.6459,lng:135.5151,area:"Shinjuku Gochiso Bldg 1F, next to Harukas",
   note:"2 min from the Miyako — rice, cabbage & miso are free refills. Six sauces; the tongue katsu is the standout.",warn:"Counter-heavy and very popular — arrive by 11:15 or expect a queue."},
  {id:10,d:"11/22 Sun",m:"Dinner",name:"Harukas depachika → in-room",q:"あべのハルカス近鉄本店 あべのフード・シティ",dish:"Sōzai, bentō & pastries — eaten upstairs",
   hrs:"B1/B2 food halls 10:00–20:30 · Abeno Ichiba Shokudō to 22:00",res:"walk",jpy:6000,lat:34.6458,lng:135.5136,area:"Kintetsu Abeno Harukas B1–B2 — directly below the hotel",
   note:"B2 = sōzai, bentō, sashimi, fresh food · B1 = bakery, wagashi, patisserie. One of Japan's largest depachika and it's in your own building.",
   warn:"Go after ~19:00 — sōzai counters mark down unsold food (半額 stickers) in the last hour before 20:30 close."}]},

{id:"kyoto",city:"Kyoto",sub:"11/23 · day trip from Osaka",hotel:"miyako",
 legs:[
  {r:"Out 11/23: Tennōji → Kyoto",m:"Haruka 12 ✓ · dep 10:20 → arr 11:04 (44 min)",n:"Booked on Japan Rail Tickets. Dep Platform 18 · arr Platform 30. Elevator down from the Miyako straight to Tennōji JR."},
  {r:"Cheaper: via Osaka Stn",m:"Loop 15 min → Special Rapid 29 min",n:"~50 min total; trains every ~8 min."},
  {r:"Return 11/23 after dinner",m:"Haruka 59 ✓ · dep Kyoto 20:30 → arr Tennōji 21:16 (46 min)",n:"Booked — replaces the old Keihan/Tōfukuji route. Dep Platform 30 · arr Platform 15. From Tousuiro, Kyoto Stn is ~12 min by taxi: a 19:30–19:45 finish is comfortable; don't linger past 20:00."}],
 // 11/22 is a full Osaka day (Katsugyu → Dōguyasuji/Namba → depachika in-room) — Kyoto is 11/23 only.
 metro:[["To Kiyomizu / Gion","Keihan via Tōfukuji → Kiyomizu-Gojō / Gion-Shijō · or bus 86/206 from Kyoto Stn"],["Higashiyama on foot","Menzou (Okazaki) → Kiyomizu → Ishibei-kōji is walkable; bus 100/206 if legs give out"]],
 pois:[
 // ── sights · Okazaki / Nanzen-ji cluster — near Menzou, optional 11/23 add-ons ──
 {c:"sight",ic:"🍁",n:"Eikan-dō night illumination",d:"Kyoto's best autumn light-up — buy night ticket on-site, expect a queue · clashes with the 17:00 dinner",a:"Menzou",lat:35.0146,lng:135.7937},
 {c:"sight",ic:"🚶",n:"Philosopher's Path → Ginkaku-ji",d:"north of Menzou — only if you skip the Higashiyama afternoon",a:"Menzou",lat:35.0270,lng:135.7982},
 {c:"sight",ic:"🤫",n:"Hōnen-in",d:"mossy gate, almost no one goes",a:"Menzou",lat:35.0208,lng:135.7965},
 {c:"sight",ic:"🏛",n:"Murin-an",d:"Meiji villa garden — timed entry, book online ahead, tea on the veranda",a:"Menzou",lat:35.0093,lng:135.7887},
 {c:"sight",ic:"🌉",n:"Nanzen-ji Suirokaku aqueduct",d:"1888 brick aqueduct through the temple grounds — free, inside Nanzen-ji",a:"Menzou",lat:35.0107,lng:135.7937},   // NEW
 {c:"sight",ic:"🍂",n:"Shinnyo-dō",d:"free foliage that rivals Eikan-dō, a fraction of the crowd — 15 min N via Kurodani",a:"Menzou",lat:35.0225,lng:135.7930},   // NEW
 // ── sights · 11/23 Higashiyama day (Tousuiro) ──
 {c:"sight",ic:"⛩",n:"Kiyomizu-dera",d:"07:00 arrival — night session exists but Kōdai-ji is the better post-dinner call",a:"Tousuiro",lat:34.9949,lng:135.7850},
 {c:"sight",ic:"🏮",n:"Ninenzaka / Sannenzaka",d:"preserved lanes up to the temple",a:"Tousuiro",lat:34.9986,lng:135.7807},
 {c:"sight",ic:"🕍",n:"Kōdai-ji",d:"5 min from Tousuiro · night viewing to 21:30 (close 22:00) — the after-dinner move",a:"Tousuiro",lat:35.0007,lng:135.7815},
 {c:"sight",ic:"🎋",n:"Yasaka Kōshin-dō",d:"rainbow kukurizaru wish-balls",a:"Tousuiro",lat:34.9983,lng:135.7789},
 {c:"sight",ic:"🐉",n:"Kennin-ji",d:"twin-dragon ceiling, Kyoto's oldest Zen temple",a:"Tousuiro",lat:35.0007,lng:135.7735},
 {c:"sight",ic:"⛩",n:"Yasaka Shrine + Maruyama Park",d:"lantern-lit at night, between Gion and Kōdai-ji",a:"Tousuiro",lat:35.0037,lng:135.7787},
 {c:"sight",ic:"🔷",n:"Shōren-in",d:"blue night illumination in a bamboo-and-camphor garden — the quiet light-up",a:"Tousuiro",lat:35.0064,lng:135.7828},   // NEW
 // ── sights · Okazaki cluster (Menzou) ──
 {c:"sight",ic:"⛩",n:"Heian Shrine + Shin'en garden",d:"3 min from Menzou — do the paid stroll garden, not just the courtyard",a:"Menzou",lat:35.0163,lng:135.7823},   // NEW
 {c:"sight",ic:"🖼",n:"Kyoto City KYOCERA Museum of Art",d:"1933 building, 2020 renovation — between Menzou and the canal",a:"Menzou",lat:35.0125,lng:135.7845},   // NEW
 // ── sights · transfer opportunity ──
 {c:"sight",ic:"🍁",n:"Tōfuku-ji (Tsūten-kyō)",d:"THE foliage temple — sits on your 11/23 Keihan transfer; gates ~16:00, so only as an early-arrival detour",a:"transfer",lat:34.9764,lng:135.7739},   // NEW
 // ── cafés ──
 {c:"cafe",ic:"☕",n:"Blue Bottle Kyoto",d:"100-yr machiya by Nanzen-ji",a:"Menzou",lat:35.0110,lng:135.7877},
 {c:"cafe",ic:"☕",n:"% Arabica Higashiyama",d:"under Yasaka Pagoda — before 9:00",a:"Tousuiro",lat:34.9987,lng:135.7795},
 {c:"cafe",ic:"🍵",n:"Ippodo Tea Kaboku",d:"renovated 2023 tearoom, whisk-it-yourself matcha · 10:00–17:00, LO 16:00",a:"Teramachi",lat:35.0125,lng:135.7671},
 {c:"cafe",ic:"☕",n:"Weekenders Coffee Tominokōji",d:"hidden behind a parking lot; Kyoto's cult roaster",a:"Teramachi",lat:35.0058,lng:135.7654},
 {c:"cafe",ic:"🍮",n:"Kagizen Yoshifusa (Shijō honten)",d:"Edo-era Gion tea house — kuzukiri in the back room",a:"Tousuiro",lat:35.0037,lng:135.7736},   // NEW
 // ── shopping ──
 {c:"shop",ic:"👜",n:"Ichizawa Shinzaburō Hanpu",d:"cult canvas bags, one shop worldwide",a:"Menzou",lat:35.0059,lng:135.7830},
 {c:"shop",ic:"🌺",n:"Kazurasei (Gion)",d:"camellia-oil hair & skin gifts",a:"Tousuiro",lat:35.0037,lng:135.7752},
 {c:"shop",ic:"🛍",n:"Teramachi–Sanjō arcades",d:"stationery, tea, prints",a:"Ippodo",lat:35.0070,lng:135.7670},
 {c:"shop",ic:"🔪",n:"Nishiki Market + Aritsugu",d:"the kitchen street — 1560s knife maker at the west end · go before 11:00",a:"Teramachi",lat:35.0050,lng:135.7649},   // NEW
 // ── gifts ──
 {c:"gift",ic:"🍵",n:"Ippodo Tea Co.",d:"premium matcha powder and tea tools",a:"Teramachi",lat:35.0125,lng:135.7671},
 {c:"gift",ic:"🍪",n:"Malebranche Cha no Ka (Kiyomizu-zaka)",d:"matcha langue-de-chat — on the 07:00 walk up",a:"Tousuiro",lat:34.9958,lng:135.7818},
 {c:"gift",ic:"🍬",n:"Nikiniki (Shijō)",d:"yatsuhashi as tiny edible art, by Kawaramachi",a:"Teramachi",lat:35.0037,lng:135.7692},
 // ── konbini ──
 {c:"conv",ic:"🏪",n:"7-Eleven Higashiyama Yasaka",d:"day-trip supply stop between Kōdai-ji and Yasaka",a:"Tousuiro",lat:35.0009,lng:135.7760},
 {c:"conv",ic:"🏪",n:"Lawson Gion-Shijō",d:"by the Keihan station for the ride home",a:"Tousuiro",lat:35.0037,lng:135.7745},
 {c:"conv",ic:"🏪",n:"FamilyMart Kawaramachi-Sanjō",d:"corner of the arcades, 24h",a:"Teramachi",lat:35.0089,lng:135.7687}],
 stops:[
  {id:12,d:"11/23 Mon·hol",m:"Lunch",name:"Yamamoto Menzou",dish:"Udon · tsuchi-gobō tempura",
 hrs:"10:00–17:00 LO (hol) · sells out · closed Thu",res:"book",pay:"cash",
 jpy:5000,lat:35.0140,lng:135.7866,area:"Okazaki",warn:"Book on TableCheck — slots open 00:00 JST on 11/20 (3 days out). CC to hold, pay cash on the day.",note:"Backup: Okakita next door, walk-in."},
  {id:13,d:"11/23 Mon",m:"Dinner",name:"Tousuiro Gion",q:"豆水楼 祇園店",dish:"Yudōfu & tofu kaiseki",
   hrs:"11:30–14:00 · 17:00–21:00 daily",res:"book",jpy:24000,lat:34.99979,lng:135.77750,area:"4-38-1 Bishamonchō, Higashiyama-ku · Gion",
   note:"Multi-course tofu — house-made yudōfu with free refills, yuba, seasonal plates; vegetarian course available and English explained at the table.",
   warn:"THE ANNIVERSARY DINNER — ¥24,000 for two. Small room (roughly 8 seats plus a table) — book well ahead: 075-561-0035. A 17:00–17:30 seating leaves Kōdai-ji's light-up (to 21:30) afterwards."}]},

{id:"nagoya",city:"Nagoya",sub:"11/24–11/26",hotel:"tiad",
 legs:[
  {r:"Arrive: Shin-Ōsaka → Nagoya",m:"11/24 · Nozomi 90 · dep 11:30 → arr 12:19",n:"Keitei lunch is inside the station complex, then Higashiyama line to Sakae."},
  {r:"Depart: Nagoya → Tokyo",m:"11/26 · Nozomi 24 · dep 14:36 → arr 16:15",n:"SHUHARI must end by 14:05 — book 11:30/12:00 and mention the train."}],
 metro:[["Higashiyama Line (yellow)","Sakae → Nagoya Stn 5 min (Keitei, Kikukawa)"],["Meijō Line (purple)","Yabachō 4-min walk; one stop to Kamimaezu for Ōsu"],["On foot","Takara ~15 min; Moumoutei ~12 min from TIAD"]],
 pois:[
  {c:"sight",ic:"🌳",n:"Hisaya Ōdōri Park + Mirai Tower",d:"TIAD's front yard, lit at night",a:"hotel",lat:35.1720,lng:136.9083},
  {c:"sight",ic:"🏯",n:"Nagoya Castle",d:"gold shachihoko",a:"hotel",lat:35.1856,lng:136.8997},
  {c:"sight",ic:"🛸",n:"Oasis 21 'Spaceship-Aqua'",d:"glass roof-deck, free, lit at night",a:"hotel",lat:35.1710,lng:136.9089},
  {c:"sight",ic:"🌆",n:"Midland Square Sky Promenade",d:"44–46F open-air deck — same tower as Kikukawa; go straight after dinner",a:"Kikukawa",lat:35.1697,lng:136.8850},
  {c:"sight",ic:"🏮",n:"Banshō-ji",d:"neon-lit temple glowing in the middle of the Ōsu arcades",a:"Takara",lat:35.1604,lng:136.9060},
  {c:"sight",ic:"⛩",n:"Atsuta Jingū",d:"one of Shinto's holiest shrines, in a cypress forest — Meijō line direct from Yabachō",a:"hotel",lat:35.1278,lng:136.9086},
  {c:"sight",ic:"🍁",n:"Tokugawaen + Tokugawa Art Museum",d:"daimyō stroll garden — late-Nov foliage light-up most years; museum holds the Genji scrolls",a:"hotel",lat:35.1848,lng:136.9330},
  {c:"sight",ic:"🏘",n:"Shikemichi + Endōji arcade",d:"Edo merchant lane + retro shopping street, 10 min NE of the station",a:"Nagoya Stn",lat:35.1747,lng:136.8912},
  {c:"cafe",ic:"🐤",n:"Café Gentiane",d:"home of the pyorin chick pudding",a:"Keitei",lat:35.1707,lng:136.8823},
  {c:"cafe",ic:"🍤",n:"Konparu (since 1947)",d:"retro kissaten; ebi-fry sando is the order",a:"Takara",lat:35.1607,lng:136.9046},
  {c:"cafe",ic:"☕",n:"Komeda's Coffee (Sakae)",d:"Nagoya's kissaten institution — order the shiro-noir",a:"hotel",lat:35.1680,lng:136.9065},
  {c:"cafe",ic:"🍞",n:"Coffee House Kako (1972)",d:"the ogura-toast kissaten — siphon coffee, near Shikemichi",a:"Nagoya Stn",lat:35.1741,lng:136.8895},
  {c:"shop",ic:"🛍",n:"Ōsu Shōtengai arcades",d:"vintage & retro-game heaven",a:"Takara",lat:35.1598,lng:136.9052},
  {c:"shop",ic:"🏬",n:"Nagoya PARCO",d:"youth fashion + character floors",a:"hotel",lat:35.1655,lng:136.9080},
  {c:"shop",ic:"⌚",n:"Komehyo (Ōsu flagship)",d:"Japan's biggest secondhand-luxury store — watches to kimono, sharp prices",a:"Takara",lat:35.1590,lng:136.9034},
  {c:"gift",ic:"🦐",n:"Bankaku Sohonpo",d:"Famous Yukari shrimp crackers",a:"Nagoya Stn",lat:35.1709,lng:136.8826},
  {c:"gift",ic:"🍡",n:"Aoyagi Sōhonke",d:"uirō — Nagoya's chewy rice-flour classic, station stands",a:"Nagoya Stn",lat:35.1710,lng:136.8820},
  {c:"conv",ic:"🏪",n:"FamilyMart Sakae 5-chōme",d:"around the corner from TIAD, 24h",a:"hotel",lat:35.1642,lng:136.9092},
  {c:"conv",ic:"🏪",n:"Lawson Yabachō",d:"by your metro station, 24h",a:"hotel",lat:35.1630,lng:136.9080},
  {c:"conv",ic:"🏪",n:"7-Eleven Sakae Hirokōji",d:"on the walk to Moumoutei",a:"hotel",lat:35.1670,lng:136.9060}],
 stops:[
  {id:14,d:"11/24 Tue",m:"Lunch",name:"Keitei",dish:"Miso katsu",hrs:"11:00–23:00 daily",res:"walk",jpy:5000,lat:35.1710,lng:136.8826,area:"Nagoya Stn"},
  {id:15,d:"11/24 Tue",m:"Dinner",name:"Moumoutei Hirokoji",dish:"Beef hitsumabushi",hrs:"18:00–22:30 · closed Sun",res:"ok",jpy:20000,lat:35.1679,lng:136.8954,area:"Sakae",note:"Signature set is reservation-only — confirm the course."},
  {id:16,d:"11/25 Wed",m:"Lunch",name:"Takara",dish:"Miso nikomi udon",hrs:"11:30–14:45 · closed Thu",res:"walk",jpy:5000,lat:35.1595,lng:136.9016,area:"Ōsu"},
  {id:17,d:"11/25 Wed",m:"Dinner",name:"Unagi Yondaime Kikukawa",dish:"Unagi hitsumabushi",hrs:"17:00–22:00 daily",res:"book",jpy:15000,lat:35.1697,lng:136.8853,area:"Midland Square 4F",warn:"Book 18:30/19:00 on Tabelog — fix the 7/29 date filter."},
  {id:18,d:"11/26 Thu",m:"Lunch",name:"SHUHARI",dish:"Kaiseki",hrs:"11:30–14:30 · closed Wed",res:"book",jpy:24000,lat:35.1639,lng:136.9098,area:"TIAD 5F",warn:"Book 12:00 latest — Nozomi 24 leaves 14:36; be done by 14:05."}]},

{id:"tokyo",city:"Tokyo",sub:"11/26–11/27",hotel:"hyatt",
 legs:[
  {r:"Arrive: Tokyo Stn → Roppongi",m:"11/26 · Marunouchi → Kasumigaseki → Hibiya line ~25 min",n:"Off the Nozomi 16:15, at the hotel ~17:00. Roku Roku 18:00–19:00."},
  {r:"Depart: Grand Hyatt → NRT",m:"11/27 · leave 11:45 · N'EX from Tokyo Stn ~60 min",n:"ZG022 departs 16:00 — at NRT by 13:30. Bricolage at 10:30 is your send-off bite. TAX REFUND: from 11/1/26 Japan refunds at the airport, not the register — keep every receipt, allow 45–60 min extra at NRT, consider leaving the Hyatt before 11:45."}],
 metro:[["Hibiya Line","Roppongi is under the Hills; Ginza 10 min, Tsukiji 14 min"],["Ōedo Line","Roppongi → Shinjuku 9 min"]],
 pois:[
  {c:"sight",ic:"✨",n:"Keyakizaka winter illumination",d:"blue LED avenue, live late Nov",a:"hotel",lat:35.6591,lng:139.7291},
  {c:"sight",ic:"🎨",n:"Mori Art Museum + City View",d:"52F, open late",a:"hotel",lat:35.6605,lng:139.7292},
  {c:"sight",ic:"🖼",n:"teamLab Borderless (Azabudai)",d:"10-min walk; book timed entry",a:"hotel",lat:35.6620,lng:139.7413},
  {c:"sight",ic:"🗼",n:"Tokyo Tower + Zōjō-ji",d:"15-min walk from Azabudai",a:"hotel",lat:35.6586,lng:139.7454},
  {c:"sight",ic:"🪷",n:"Mōri Garden",d:"Edo pond garden hidden inside Roppongi Hills — free, autumn color, 2 min from your room",a:"hotel",lat:35.6597,lng:139.7312},
  {c:"sight",ic:"🏛",n:"The National Art Center",d:"Kurokawa's glass wave — the building alone is worth the walk",a:"hotel",lat:35.6652,lng:139.7263},
  {c:"sight",ic:"💡",n:"Tokyo Midtown + Hinokichō Park",d:"garden foliage + Midtown Winter Lights (usually on from mid-Nov) — 8-min walk",a:"hotel",lat:35.6664,lng:139.7309},
  {c:"sight",ic:"🔺",n:"21_21 Design Sight",d:"Tadao Andō's sunken design museum in Midtown's garden",a:"hotel",lat:35.6667,lng:139.7275},
  {c:"cafe",ic:"🥐",n:"Bricolage Bread & Co.",d:"your 11/27 send-off, ~10:30",a:"hotel",lat:35.6588,lng:139.7300},
  {c:"cafe",ic:"☕",n:"Blue Bottle Azabudai Hills",d:"inside the new complex",a:"teamLab",lat:35.6614,lng:139.7405},
  {c:"shop",ic:"📚",n:"Tsutaya Roppongi Hills",d:"books + design, open to 23:00",a:"hotel",lat:35.6597,lng:139.7300},
  {c:"shop",ic:"🛍",n:"Azabudai Hills Market",d:"food-gift floor for omiyage",a:"teamLab",lat:35.6618,lng:139.7410},
  {c:"shop",ic:"🛒",n:"Don Quijote Roppongi",d:"24h chaos emporium — last-night omiyage sweep after Roku Roku",a:"hotel",lat:35.6630,lng:139.7364},
  {c:"gift",ic:"🎮",n:"Nintendo Tokyo & Capcom",d:"Exclusive gaming merch",a:"Shibuya PARCO",lat:35.6620,lng:139.6986},
  {c:"gift",ic:"🍌",n:"Tokyo Banana (Gransta, Tokyo Stn)",d:"grab before boarding the N'EX on 11/27",a:"Tokyo Stn",lat:35.6812,lng:139.7671},
  {c:"gift",ic:"🧈",n:"Press Butter Sand (Tokyo Stn)",d:"the other station omiyage — often a queue, moves fast",a:"Tokyo Stn",lat:35.6809,lng:139.7668},
  {c:"gift",ic:"🍡",n:"Toraya (Akasaka flagship)",q:"とらや 赤坂店",d:"1586 wagashi house — yōkan as omiyage royalty, café upstairs",a:"hotel",lat:35.6742,lng:139.7350},
  {c:"conv",ic:"🏪",n:"FamilyMart Roppongi Hills",d:"inside the complex, directly below your hotel — 24h",a:"hotel",lat:35.6603,lng:139.7297},
  {c:"conv",ic:"🏪",n:"7-Eleven Roppongi 6-chōme",d:"across Roppongi-dōri, 24h · reliable foreign-card ATM",a:"hotel",lat:35.6608,lng:139.7318},
  {c:"conv",ic:"🏪",n:"Lawson Nishi-Azabu",d:"quiet side, on the Keyakizaka end",a:"hotel",lat:35.6588,lng:139.7260}],
 stops:[
  {id:19,d:"11/26 Thu",m:"Dinner",name:"Roku Roku",dish:"Omakase sushi",hrs:"18:00–21:00 daily",res:"ok",jpy:39160,lat:35.6601,lng:139.7283,area:"Grand Hyatt",note:"$125 FHR dining credit applies here."}]},

{id:"flights",city:"Flights",sub:"Zip Air",flights:true},
{id:"rail",city:"Rail",sub:"Shinkansen legs",rail_only:true},
{id:"vault",city:"Vault",sub:"Confirmations",vault:true},
{id:"expenses",city:"Expenses",sub:"USD Tracker",expenses:true},
{id:"calc",city:"Calc",sub:"Live Converter",calc:true}
];var FLIGHTS=[
 {d:"Sun Nov 15",t:"07:00 → 10:05 · 13:30 → 15:45",route:"Washington IAD → Seattle → Vancouver YVR",train:"Delta 1015 + 3748 · Delta First Classic (Z)",note:"Positioning day. 3h25 connection in SEA. DL3748* is a codeshare — confirm the operating carrier at check-in. Overnight at JW Marriott Parq Vancouver; ZG021 departs 10:30 the next morning."},
 {d:"Mon Nov 16 → Tue Nov 17",t:"10:30 → 12:45 (+1)",route:"Vancouver YVR → Tokyo Narita",train:"Zip Air ZG021 · US$1,221.33",note:"Lands 12:45 on the 17th. Immigration + bags ≈ 1.5–2 h → landside ~14:15 → N'EX direct to Yokohama (see Yokohama tab)."},
 {d:"Fri Nov 27",t:"16:00 → 08:30 same day",route:"Tokyo Narita → Vancouver YVR",train:"Zip Air ZG022 · US$1,007.89",note:"At NRT by ~13:30 → leave Grand Hyatt by ~11:45. You land YVR the morning of the same calendar date — plan pickups for Nov 27, not 28.",warn:true},
 {d:"Fri Nov 27",t:"13:16 → 23:05 same day",route:"Vancouver YVR → Virginia IAD",train:"United UA2470 & UA2408 · US$1,104.90",note:"Access to Premium Plaza Lounge in Transborder Terminal (YVR). Access to AMEX Centurion Lounge near Gate 46 in Concourse C (DEN)."}
];var WX_CFG = {
  vancouver:{lat:49.2756,lng:-123.1148,from:"2026-11-15",to:"2026-11-16"},
  yokohama:{lat:35.4620,lng:139.6300,from:"2026-11-17",to:"2026-11-19"},
  nara:    {lat:34.6857,lng:135.8340,from:"2026-11-19",to:"2026-11-21"},
  osaka:   {lat:34.6462,lng:135.5136,from:"2026-11-21",to:"2026-11-24"},
  kyoto:   {lat:35.0116,lng:135.7681,from:"2026-11-22",to:"2026-11-23"}, // Kyoto city, not the Osaka hotel
  nagoya:  {lat:35.1638,lng:136.9098,from:"2026-11-24",to:"2026-11-26"},
  tokyo:   {lat:35.6601,lng:139.7290,from:"2026-11-26",to:"2026-11-27"},
};var TODAY_CITY={15:'vancouver',16:'vancouver',17:'yokohama',18:'yokohama',19:'nara',20:'nara',21:'nara',22:'osaka',23:'kyoto',24:'nagoya',25:'nagoya',26:'tokyo',27:'tokyo'};
var TONIGHT={15:'parq',16:['On the plane ✈','ZG021 YVR → NRT · lands 12:45 on the 17th'],17:'westin',18:'westin',19:'shisui',20:'shisui',21:'miyako',22:'miyako',23:'miyako',24:'tiad',25:'tiad',26:'hyatt',27:['Homeward ✈','ZG022 NRT → YVR, then United on to IAD — plan pickups for Nov 27, not 28']};

var TRAINS=[
 {d:"Nov 17",t:"14:45",route:"Narita T1 \u2192 Yokohama",train:"Narita Express 30 \u2713 Japan Rail Tickets",note:"Arr 16:16 (1h31m). Dep Platform 1/2 \u00b7 arr Platform 6. Then 5-min taxi to the Westin."},
 {d:"Nov 19",t:"14:07",route:"Shin-Yokohama → Kyoto",train:"Nozomi 73 ✓ Smart EX",note:"Arr 16:00 → Kintetsu ltd. exp 16:20 → Nara 16:55 → Shisui → Poku-Poku by 18:00. Seats not finalized — pick them on Smart EX (E side for Fuji)."},
 {d:"Nov 21",t:"17:34",route:"Kintetsu-Nara → Ōsaka-Namba",train:"Aoniyoshi sightseeing ltd. exp",note:"Sat/hol slot · arr Namba 18:12. All-reserved — booking opens on Kintetsu ~1 month out (Oct 21); window-facing twin seats, onboard sales counter. Then Midōsuji to Tennōji, bags, Ondoriya ~19:30."},
 {d:"Nov 23",t:"10:20",route:"Tenn\u014dji \u2192 Kyoto",train:"Haruka 12 \u2713 Japan Rail Tickets",note:"Arr 11:04 (44 min). Dep Platform 18 \u00b7 arr Platform 30. Kyoto day trip out."},
 {d:"Nov 23",t:"20:30",route:"Kyoto \u2192 Tenn\u014dji",train:"Haruka 59 \u2713 Japan Rail Tickets",note:"Arr 21:16 (46 min). Dep Platform 30 \u00b7 arr Platform 15. Return after dinner \u2014 replaces the Keihan/T\u014dfukuji plan on the Kyoto tab."},
 {d:"Nov 24",t:"10:35",route:"Tenn\u014dji \u2192 Shin-\u014csaka",train:"Kuroshio 12 \u2713 Japan Rail Tickets",note:"Arr 10:51 (16 min). Dep Platform 18 \u00b7 arr Platform 1. Connects to Nozomi 90 dep 11:30."},
 {d:"Nov 24",t:"11:30",route:"Shin-Ōsaka → Nagoya",train:"Nozomi 90 ✓ Smart EX",note:"Arr 12:19 — Keitei inside the station. Leave hotel 10:40. Seats not finalized."},
 {d:"Nov 26",t:"14:36",route:"Nagoya → Tokyo",train:"Nozomi 24 ✓ Smart EX",note:"Arr 16:15, Roppongi ~17:00. SHUHARI ends 14:05 latest. Seats not finalized."}
];

window.TRIPS_REGISTRY['japan-2026']={accent:'#B8552A',cities:CITIES,hotels:HOTELS,flights:FLIGHTS,trains:TRAINS,wx:WX_CFG,todayCity:TODAY_CITY,tonight:TONIGHT,
   emoji:'⛩',brand:"Japan · Nov '26",foot:"15–27 Nov · 6 cities · 19 meals",
   title:"Japan, November 2026",kicker:"Anniversary trip · 15–27 Nov 2026",depart:[2026,10,15],arrive:[2026,10,17],end:[2026,10,27],
   navIcons:{today:'🗓️',todo:'✅',vancouver:'🍁',yokohama:'⚓',nara:'🦌',osaka:'🐙',kyoto:'⛩️',nagoya:'🏯',tokyo:'🗼',flights:'✈️',rail:'🚄',vault:'🗂️',expenses:'💳',calc:'💱'},
   navSecs:{yokohama:'Itinerary',flights:'Tools'},
   tz:'Asia/Tokyo',mon:11,cur:{code:'JPY',sym:'¥',key:'jpy',fallback:150,name:'yen'},
   departNote:'Delta 1015 · IAD 07:00 · Nov 15',preLabel:'Positioning day',transitLabel:'In transit ✈',
   seedTodos:[
     {id:'t6',d:'2026-10-01',cat:'transport',title:'Smart EX — pick seats on all three Nozomi',url:'https://smart-ex.jp/',desc:'Res 2005/2006/2007 still say "seats not finalized". Take E seats — Fuji side on the Tōkaidō in both directions.'},
     {id:'t8',d:'2026-10-21',cat:'transport',title:'Aoniyoshi seats open — Kintetsu',url:'https://www.kintetsu.co.jp/foreign/english/',desc:'11/21 · 17:34 Kintetsu-Nara → Namba 18:12. Booking opens 10:30 JST, one month out.'}],
   vault:[['Flights',[['f_dl1015','Delta 1015 · IAD→SEA','Nov 15 · 07:00 · conf / seats'],['f_dl3748','Delta 3748 · SEA→YVR','Nov 15 · 13:30 · conf / seats · codeshare'],['f_zg021','Zip Air ZG021 · YVR→NRT','Nov 16 · booking ref / seats'],['f_zg022','Zip Air ZG022 · NRT→YVR','Nov 27 · booking ref / seats'],['f_ua2470','United UA2470 · YVR→DEN','Nov 27 · booking ref / seats'],['f_ua2408','United UA2408 · DEN→IAD','Nov 27 · booking ref / seats']]],
          ['Trains',[['t_nex1',"N'EX · NRT→Yokohama",'Nov 17 · car / seats'],['t_n261','Nozomi 73 · Shin-Yokohama→Kyoto','Nov 19 · 14:07 · Smart EX res # / seats'],['t_aoni','Aoniyoshi · Kintetsu-Nara→Ōsaka-Namba','Nov 21 · 17:34 · Kintetsu res # / seats'],['t_n14','Nozomi 90 · Shin-Ōsaka→Nagoya','Nov 24 · 11:30 · Smart EX res # / seats'],['t_n254','Nozomi 24 · Nagoya→Tokyo','Nov 26 · 14:36 · Smart EX res # / seats'],['t_nex2',"N'EX · Tokyo→NRT",'Nov 27 · car / seats']]]],
   flag:'<svg class="flag" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg"><rect width="900" height="600" fill="#ffffff"/><circle cx="450" cy="300" r="180" fill="#bc002d"/></svg>'};
