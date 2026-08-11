/* Trip DATA only — Icon Class group cruise. Loaded before the engine. */
window.TRIPS_REGISTRY=window.TRIPS_REGISTRY||{};

var CR_TABS=[
 {id:'board',city:'Board',sub:'announcements',cruiseTab:'board'},
 {id:'sched',city:'Schedule',sub:'day by day',cruiseTab:'sched'},
 {id:'rooms',city:'Rooms',sub:'cabin picker',cruiseTab:'rooms'},
 {id:'cexp',city:'Expenses',sub:'yours + invoice',cruiseTab:'cexp'},
 {id:'clog',city:'Logistics',sub:'flights & rides',cruiseTab:'clog'},
 {id:'cadmin',city:'Admin',sub:'users & codes',cruiseTab:'cadmin',adminOnly:true}
];
/* Star of the Seas · 7-night Eastern Caribbean & Perfect Day skeleton.
   The Jan 9 2028 variant isn't published precisely — admin can edit any day. */
var CR_ITIN=[
 {day:1,date:'Sun · Jan 9',port:'Port Canaveral (Orlando) — embark',hrs:'boarding from ~11:00 · sails 4:30 PM'},
 {day:2,date:'Mon · Jan 10',port:'Perfect Day at CocoCay, Bahamas',hrs:'confirm times against the booking'},
 {day:3,date:'Tue · Jan 11',port:'At sea',hrs:'—'},
 {day:4,date:'Wed · Jan 12',port:'Charlotte Amalie, St. Thomas',hrs:'confirm — Eastern variant'},
 {day:5,date:'Thu · Jan 13',port:'Philipsburg, St. Maarten',hrs:'confirm — Eastern variant'},
 {day:6,date:'Fri · Jan 14',port:'At sea',hrs:'—'},
 {day:7,date:'Sat · Jan 15',port:'At sea',hrs:'—'},
 {day:8,date:'Sun · Jan 16',port:'Port Canaveral — disembark',hrs:'morning arrival'}
];

/* Stateroom categories — names and specs from Royal's public material for the
   Icon class. No Royal imagery is copied; each category renders as its own
   drawn swatch. Star of the Seas has ~2,805 staterooms across 28 categories;
   these are the ones a group like this actually books. */
var CR_CATS=[
 {id:'interior',n:'Interior',sq:'~156 sq ft',d:'The standard interior. Four interior sub-categories exist, up to 187 sq ft Surfside Family.',tone:'#5D7185'},
 {id:'insideplus',n:'Inside Plus',sq:'~160 sq ft',d:'New for Icon class — an interior with a virtual view screen.',tone:'#6B7F94'},
 {id:'oceanview',n:'Ocean View',sq:'~180 sq ft',d:'Porthole or picture window, no balcony.',tone:'#2E6E8E'},
 {id:'panoramic',n:'Panoramic Ocean View',sq:'~258 sq ft',d:'Deck 14, floor-to-ceiling window. A view without a balcony.',tone:'#1D5C8F'},
 {id:'infinite',n:'Infinite Balcony',sq:'200 sq ft + 50',d:'Floor-to-ceiling window whose top half drops to make the space open-air. ~615 cabins.',tone:'#0E7C86'},
 {id:'balcony',n:'Ocean View Balcony',sq:'204 sq ft + 50',d:'The classic step-out balcony. ~908 cabins — the most common choice.',tone:'#0F6E7A'},
 {id:'centralpark',n:'Infinite Central Park View',sq:'~200 sq ft',d:'Faces inward over the open-air Central Park neighbourhood. Good people-watching, no sea view.',tone:'#3E7D5A'},
 {id:'surfside',n:'Surfside Family View',sq:'~200 sq ft',d:'Faces the Surfside family neighbourhood, aft on Deck 7.',tone:'#B0761F'},
 {id:'junior',n:'Junior Suite',sq:'322–330 + 115',d:'Ocean-facing with the bed toward the water; Sea/Sky tier perks vary.',tone:'#7A4F8C'},
 {id:'suite',n:'Suite (Sky / Star)',sq:'varies',d:'Grand, Sunset, Icon Loft and above — Coastal Kitchen, Suite Lounge, concierge or Genie service.',tone:'#8C3F52'}
];

window.TRIPS_REGISTRY['cruise-2028']={cruise:true,cities:CR_TABS,hotels:{},flights:[],wx:{},todayCity:{},tonight:{},
 itinerary:CR_ITIN,cats:CR_CATS,ship:'Star of the Seas',
 emoji:'🚢',brand:"Icon Cruise · Jan '28",foot:'Jan 9–16 2028 · Star of the Seas',
 title:'Icon Class Cruise, January 2028',kicker:'Star of the Seas · Port Canaveral · departs Jan 9, 2028',
 depart:[2028,0,9],arrive:[2028,0,9],end:[2028,0,16],
 tz:'America/New_York',mon:1,cur:{code:'USD',sym:'$',key:'usd',fallback:1,name:'dollars'},
 navIcons:{board:'📣',sched:'🗓️',rooms:'🛏️',cexp:'💳',clog:'✈️',cadmin:'🛠️'},navSecs:{},
 seedTodos:[],vault:[]};
