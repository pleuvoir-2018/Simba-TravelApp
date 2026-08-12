/* Trip DATA only — loaded before the engine in index.html.
   ORLANDO · UNIVERSAL SCAFFOLD: dates TBD — every dated field is a
   placeholder to overwrite once the trip is scheduled. Structure mirrors the
   Hawaii skeletons so the engine renders fully when the card is opened. */
window.TRIPS_REGISTRY=window.TRIPS_REGISTRY||{};

var UO_HOTELS = {
 uo_hotel:{n:"Hotel TBD — Universal Orlando",lat:28.4743,lng:-81.4678,addr:"Universal Orlando Resort area — placeholder pin",
   tel:"—",mail:"—",
   stn:"On-site hotels walk or water-taxi to the parks; Endless Summer runs shuttles. MCO ~20 min by car.",
   note:"Not booked. On-site perks to weigh: Premier tier (Portofino/Hard Rock/Royal Pacific) includes Unlimited Express — often worth more than the room-rate gap. Epic Universe access favours Helios Grand."}
};
var UO_FLIGHTS=[
 {d:"TBD",r:"IAD → MCO",f:"not booked",t:"—",n:"~2.5 hrs nonstop; hourly options. Book once dates land."},
 {d:"TBD",r:"MCO → IAD",f:"not booked",t:"—",n:"Evening return keeps a final park morning."}
];
var UO_WX = {
 orlando:{lat:28.4743,lng:-81.4678,from:"2029-01-01",to:"2029-01-05"}  /* placeholder window — update with real dates */
};
var UO_TODAY_CITY={1:'orlando',2:'orlando',3:'orlando',4:'orlando',5:'orlando'};
var UO_TONIGHT={1:'uo_hotel',2:'uo_hotel',3:'uo_hotel',4:'uo_hotel',5:['Homeward \u2708','MCO \u2192 IAD']};

var UO_CITIES=[
 {id:'orlando',city:'Universal Orlando',dates:'Dates TBD',
  center:[28.4743,-81.4678],zoom:15,
  stops:[],
  pois:[
   {n:'Universal Studios Florida',c:'sights',d:'The original movie park — Diagon Alley lives here',lat:28.4794,lng:-81.4685},
   {n:'Islands of Adventure',c:'sights',d:'Hagrid\u2019s, VelociCoaster, Hogsmeade — the coaster park',lat:28.4718,lng:-81.4707},
   {n:'Epic Universe',c:'sights',d:'The 2025 park — Super Nintendo World, Ministry of Magic; needs its own day',lat:28.4471,lng:-81.4692},
   {n:'Volcano Bay',c:'sights',d:'Water park — tapu-tapu virtual queues',lat:28.4623,lng:-81.4717},
   {n:'CityWalk',c:'shopping',d:'Dining and shops between the gates — no ticket needed',lat:28.4739,lng:-81.4691}
  ],
  trains:[]}
];

window.TRIPS_REGISTRY['orlando-universal']={
 accent:'#1F4FA3',
 cities:UO_CITIES,hotels:UO_HOTELS,flights:UO_FLIGHTS,wx:UO_WX,
 todayCity:UO_TODAY_CITY,tonight:UO_TONIGHT,
 emoji:'🎬',brand:'ORLANDO',foot:'Universal Orlando · dates TBD',
 title:'Orlando — Universal',kicker:'THEME-PARK TRIP · DATES TBD',
 depart:[2029,0,1],arrive:[2029,0,1],end:[2029,0,5],   /* placeholder — update with real dates */
 navIcons:{orlando:'🎬'},navSecs:{},
 tz:'America/New_York',mon:'1',cur:'USD',
 departNote:'Dates TBD — scaffold only. Flights, hotel and park days to be planned once timing lands.',
 preLabel:'UNTIL THE PARKS',transitLabel:'GETTING THERE & AWAY',
 seedTodos:[
  {cat:'book',name:'Pick dates',desc:'Crowd calendars favour late Jan / early Feb and late Aug — avoid spring break and holiday weeks'},
  {cat:'book',name:'Park tickets + Express strategy',desc:'Decide multi-park days vs one park per day; Premier hotel stay may replace Express purchase'},
  {cat:'book',name:'Hotel',desc:'On-site Premier tier vs Endless Summer value — Express Pass math decides'},
  {cat:'book',name:'Flights IAD → MCO',desc:'Book once dates land'}
 ],
 vault:[],flag:'scaffold'
};
