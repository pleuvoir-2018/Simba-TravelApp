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
window.TRIPS_REGISTRY['cruise-2028']={cruise:true,cities:CR_TABS,hotels:{},flights:[],wx:{},todayCity:{},tonight:{},
 itinerary:CR_ITIN,ship:'Star of the Seas',
 emoji:'🚢',brand:"Icon Cruise · Jan '28",foot:'Jan 9–16 2028 · Star of the Seas',
 title:'Icon Class Cruise, January 2028',kicker:'Star of the Seas · Port Canaveral · departs Jan 9, 2028',
 depart:[2028,0,9],arrive:[2028,0,9],end:[2028,0,16],
 tz:'America/New_York',mon:1,cur:{code:'USD',sym:'$',key:'usd',fallback:1,name:'dollars'},
 navIcons:{board:'📣',sched:'🗓️',rooms:'🛏️',cexp:'💳',clog:'✈️',cadmin:'🛠️'},navSecs:{},
 seedTodos:[],vault:[]};
