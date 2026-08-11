/* Trip DATA only — Icon Class group cruise. Loaded before the engine. */
window.TRIPS_REGISTRY=window.TRIPS_REGISTRY||{};

var CR_TABS=[
 {id:'csum',city:'Overview',sub:'summary & reminders',cruiseTab:'csum'},
 {id:'board',city:'Board',sub:'announcements',cruiseTab:'board'},
 {id:'sched',city:'Schedule',sub:'day by day',cruiseTab:'sched'},
 {id:'ship',city:'The ship',sub:'Star of the Seas',cruiseTab:'ship'},
 {id:'rooms',city:'Rooms',sub:'cabin picker',cruiseTab:'rooms'},
 {id:'cexp',city:'Expenses',sub:'yours + invoice',cruiseTab:'cexp'},
 {id:'clog',city:'Logistics',sub:'flights & rides',cruiseTab:'clog'},
 {id:'cadmin',city:'Admin',sub:'users & codes',cruiseTab:'cadmin',adminOnly:true}
];
/* Star of the Seas · 7-night Eastern Caribbean & Perfect Day skeleton.
   The Jan 9 2028 variant isn't published precisely — admin can edit any day. */
var CR_ITIN=[
 {day:1,date:'Sun · Jan 9',port:'Port Canaveral (Orlando) — embark',hrs:'boarding from ~11:00 · sails 4:30 PM',lat:28.4058,lng:-80.6266},
 {day:2,date:'Mon · Jan 10',port:'Perfect Day at CocoCay, Bahamas',hrs:'confirm times against the booking',lat:25.8199,lng:-77.9384},
 {day:3,date:'Tue · Jan 11',port:'At sea',hrs:'—'},
 {day:4,date:'Wed · Jan 12',port:'Charlotte Amalie, St. Thomas',hrs:'confirm — Eastern variant',lat:18.3419,lng:-64.9307},
 {day:5,date:'Thu · Jan 13',port:'Philipsburg, St. Maarten',hrs:'confirm — Eastern variant',lat:18.0237,lng:-63.0458},
 {day:6,date:'Fri · Jan 14',port:'At sea',hrs:'—'},
 {day:7,date:'Sat · Jan 15',port:'At sea',hrs:'—'},
 {day:8,date:'Sun · Jan 16',port:'Port Canaveral — disembark',hrs:'morning arrival',lat:28.4058,lng:-80.6266}
];

/* Stateroom categories — names and specs from Royal's public material for the
   Icon class. No Royal imagery is copied; each category renders as its own
   drawn swatch. Star of the Seas has ~2,805 staterooms across 28 categories;
   these are the ones a group like this actually books. */
var CR_CATS=[
 {id:'interior',n:'Interior',sq:'156 sq ft · sleeps 2',d:'The standard interior — relaxing retreat at a great value. Royal King converts to two twins.',tone:'#5D7185',img:'https://assets.widgety.co.uk/2022/10/24/09/43/10/f3ccfb46-4aee-4665-9299-5068bef5751d/RCI%20Icon%20of%20the%20Seas%20Interior.jpeg'},
 {id:'insideplus',n:'Inside Plus',sq:'157 sq ft · sleeps 2',d:'Interior with a walk-in closet with vanity plus a lounge chair and ottoman — no such thing as overpacking.',tone:'#6B7F94',img:'https://assets.widgety.co.uk/2022/10/24/09/41/31/3bcfef5e-db7b-4f17-bea2-52ff750bc0ba/RCI%20Icon%20of%20the%20Seas%20Interior%20Plus.jpeg'},
 {id:'oceanview',n:'Ocean View',sq:'160–187 sq ft · up to 4',d:'Picture window over the sea, no balcony; sofa bed configurations for 3–4.',tone:'#2E6E8E',img:'https://assets.widgety.co.uk/2022/10/24/09/30/02/afc0b87d-1618-4d0d-b1b7-0e7bba785ee1/RCI%20Icon%20of%20the%20Seas%20Ocean%20View.jpeg'},
 {id:'panoramic',n:'Panoramic Ocean View',sq:'258 sq ft · up to 3',d:'Prime top decks with a floor-to-ceiling panoramic window and a dedicated seating nook.',tone:'#1D5C8F',img:'https://assets.widgety.co.uk/2022/10/24/10/33/43/af55eebe-ff21-4aa7-b94b-e1f47f7ccaf3/RCI%20Icon%20of%20the%20Seas%20Panoramic%20Ocean%20View.jpeg'},
 {id:'infinite',n:'Infinite Balcony',sq:'250 sq ft incl 50 convertible',d:'The window-wall drops at a button-press, turning the seating area open-air. Extra indoor space when closed.',tone:'#0E7C86',img:'https://assets.widgety.co.uk/2022/10/24/09/11/28/031ed4d7-1a2b-43c4-a2d5-94593592fef3/RCI%20Icon%20of%20the%20Seas%20Infinite%20Ocean%20View%20Balcony.jpeg'},
 {id:'balcony',n:'Ocean View Balcony',sq:'204 sq ft + 50 balcony',d:'The classic step-out balcony with chairs and a table — the most common choice aboard.',tone:'#0F6E7A',img:'https://assets.widgety.co.uk/2022/10/24/09/07/24/ab9d4dc6-7b0a-45df-8f8e-54c61ed7e6bc/RCI%20Icon%20of%20the%20Seas%20Ocean%20View%20Balcony.jpeg'},
 {id:'centralpark',n:'Infinite Central Park View',sq:'250 sq ft incl 50 convertible',d:'Convertible balcony over the tree-lined Central Park neighbourhood. Great people-watching, no sea view.',tone:'#3E7D5A',img:'https://assets.widgety.co.uk/2022/10/24/09/20/41/e49505b0-3e07-41ea-9cc3-e6a33510208a/RCI%20Icon%20of%20the%20Seas%20Infinite%20Central%20Park%20View%20Balcony.jpeg'},
 {id:'surfside',n:'Surfside Family View',sq:'196 sq ft + 50 balcony',d:'Balcony over the Surfside family neighbourhood, aft — all the action below.',tone:'#B0761F',img:'https://assets.widgety.co.uk/2022/10/24/08/55/45/848df165-a4ee-4571-9c23-62fe0ed1f513/RCI%20Icon%20of%20the%20Seas%20Surfside%20Family%20View%20Balcony%20H2.jpeg'},
 {id:'junior',n:'Junior Suite',sq:'322 sq ft + 80 balcony',d:'The suite life, intimately: full bath with tub, Coastal Kitchen dinner by reservation, priority boarding.',tone:'#7A4F8C',img:'https://assets.widgety.co.uk/2022/10/21/10/10/17/48359f8d-7dd6-4360-bf5f-0ea3859b3c42/RCI%20Icon%20of%20the%20Seas%20Junior%20Suite.jpeg'},
 {id:'suite',n:'Suite (Sky / Star)',sq:'431+ sq ft · varies',d:'Grand, Sunset, Icon Loft and above — Coastal Kitchen, Suite Lounge, concierge or Genie service.',tone:'#8C3F52',img:'https://assets.widgety.co.uk/2022/10/21/09/06/15/21634a29-2d31-4bd5-b3b7-10ce4fea5d07/RCI%20Icon%20of%20the%20Seas%20Grand%20Suite.jpeg'}
];

/* Ship facts — Icon-class figures from public sources; worth re-checking
   against Royal's page before quoting them to anyone. */
var CR_SHIP={
 facts:[["Class","Icon class — sister ship to Icon of the Seas (the class that took the 'world's largest' title)"],
  ["Entered service","August 2025, homeported at Port Canaveral"],
  ["Size","~250,000 gross tons · 365 m long · 48.5 m beam"],
  ["Guests","~5,610 at double occupancy (up to ~7,600) · ~2,350 crew"],
  ["Staterooms","2,805 across 28 categories — about 70% have some form of balcony"],
  ["Builder","Meyer Turku, Finland"]],
 hoods:[["Thrill Island","Category 6 — the largest waterpark at sea — plus the rock wall and sports court"],
  ["Chill Island","Four pools across multiple decks, including a swim-up bar"],
  ["Surfside","The young-family neighborhood aft on Deck 7 — kid-height everything"],
  ["Central Park","Open-air garden with live plants, flanked by specialty dining"],
  ["AquaDome","The glass dome forward — aqua theater shows, wraparound views"],
  ["The Hideaway","Adults-ish suspended infinity pool with its own DJ deck"],
  ["Royal Promenade","The indoor main street — bars, shops, and the Pearl sphere"],
  ["Suite Neighborhood","Dedicated decks with Coastal Kitchen and the suite sun deck"]],
 note:"Details worth confirming on Royal's site once your sailing's brochure is out — venues occasionally differ between sisters."};

window.TRIPS_REGISTRY['cruise-2028']={accent:'#0E7C86',cruise:true,cities:CR_TABS,hotels:{},flights:[],wx:{},todayCity:{},tonight:{},
 itinerary:CR_ITIN,cats:CR_CATS,ship:'Star of the Seas',shipInfo:CR_SHIP,
 airport:{n:'Orlando International (MCO)',lat:28.4312,lng:-81.3081,note:'~45 min drive to the port'},
 emoji:'🚢',brand:"Icon Cruise · Jan '28",foot:'Jan 9–16 2028 · Star of the Seas',
 title:'Icon Class Cruise, January 2028',kicker:'Star of the Seas · Port Canaveral · departs Jan 9, 2028',
 depart:[2028,0,9],arrive:[2028,0,9],end:[2028,0,16],
 tz:'America/New_York',mon:1,cur:{code:'USD',sym:'$',key:'usd',fallback:1,name:'dollars'},
 navIcons:{csum:'🧭',board:'📣',sched:'🗓️',ship:'🛳️',rooms:'🛏️',cexp:'💳',clog:'✈️',cadmin:'🛠️'},navSecs:{},
 seedTodos:[],vault:[]};
