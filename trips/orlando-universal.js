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

var UO_ATTR=[
 /* park: usf | ioa | epic | vb · type: coaster | dark | water | show | family */
 {n:'Harry Potter and the Escape from Gringotts',park:'usf',type:'coaster',d:'Coaster–dark-ride hybrid under Diagon Alley — the headliner of the original park',ht:'42"'},
 {n:'Revenge of the Mummy',park:'usf',type:'coaster',d:'Indoor launch coaster with fire effects',ht:'48"'},
 {n:'Hollywood Rip Ride Rockit',park:'usf',type:'coaster',d:'Pick-your-own-soundtrack launch coaster',ht:'51"'},
 {n:'Transformers: The Ride 3D',park:'usf',type:'dark',d:'Screen-based battle ride, single-rider line moves fast',ht:'40"'},
 {n:'Men in Black: Alien Attack',park:'usf',type:'dark',d:'Interactive shooter — spin the car for points',ht:'42"'},
 {n:'The Simpsons Ride',park:'usf',type:'dark',d:'Motion-simulator tour of Krustyland',ht:'40"'},
 {n:'E.T. Adventure',park:'usf',type:'family',d:'The 1990 original, still flying bikes',ht:'34"'},
 {n:'The Bourne Stuntacular',park:'usf',type:'show',d:'Live stunt show blended with a giant LED wall — genuinely great'},
 {n:'VelociCoaster',park:'ioa',type:'coaster',d:'Top-3 coaster in the US — 70 mph, two launches, the barrel roll over the lagoon',ht:'51"'},
 {n:'Hagrid\'s Magical Creatures Motorbike Adventure',park:'ioa',type:'coaster',d:'Story coaster with 7 launches — longest queue in the resort, ride at rope drop',ht:'48"'},
 {n:'Harry Potter and the Forbidden Journey',park:'ioa',type:'dark',d:'Robotic-arm flight through Hogwarts',ht:'48"'},
 {n:'The Incredible Hulk Coaster',park:'ioa',type:'coaster',d:'Tunnel launch into seven inversions',ht:'54"'},
 {n:'The Amazing Adventures of Spider-Man',park:'ioa',type:'dark',d:'The 3D dark ride that defined the genre',ht:'40"'},
 {n:'Skull Island: Reign of Kong',park:'ioa',type:'dark',d:'Trackless truck expedition',ht:'36"'},
 {n:'Jurassic Park River Adventure',park:'ioa',type:'water',d:'85-ft splashdown — you will get wet',ht:'42"'},
 {n:'Dudley Do-Right\'s Ripsaw Falls',park:'ioa',type:'water',d:'Flume with the resort\'s soakiest drop',ht:'44"'},
 {n:'Stardust Racers',park:'epic',type:'coaster',d:'Dual-launch racing coaster — Epic\'s thrill anchor, 62 mph side by side',ht:'48"'},
 {n:'Harry Potter and the Battle at the Ministry',park:'epic',type:'dark',d:'The new-generation Potter ride — elevator portals into the Ministry',ht:'40"'},
 {n:'Mario Kart: Bowser\'s Challenge',park:'epic',type:'dark',d:'AR headset racing through Super Nintendo World',ht:'40"'},
 {n:'Mine-Cart Madness',park:'epic',type:'coaster',d:'Donkey Kong \"jump-the-track\" boom coaster',ht:'40"'},
 {n:'Yoshi\'s Adventure',park:'epic',type:'family',d:'Slow omnimover above Super Nintendo World — great views, kid-first'},
 {n:'Hiccup\'s Wing Gliders',park:'epic',type:'coaster',d:'Family launch coaster through Isle of Berk',ht:'40"'},
 {n:'Fyre Drill',park:'epic',type:'water',d:'Interactive boat-blaster battle — expect splash'},
 {n:'Curse of the Werewolf',park:'epic',type:'coaster',d:'Spinning family coaster in Dark Universe',ht:'48"'},
 {n:'Monsters Unchained: The Frankenstein Experiment',park:'epic',type:'dark',d:'KUKA-arm monsters showcase — Dark Universe headliner',ht:'40"'},
 {n:'Krakatau Aqua Coaster',park:'vb',type:'water',d:'Launched water coaster through the volcano',ht:'42"'},
 {n:'Ko\'okiri Body Plunge',park:'vb',type:'water',d:'70° drop through a trapdoor',ht:'48"'},
 {n:'TeAwa the Fearless River',park:'vb',type:'water',d:'Rapids river you wear a vest for'}
];
var UO_REST=[
 /* where: usf | ioa | epic | vb | citywalk · kind: table | quick · res: reservations taken */
 {n:'Mythos',where:'ioa',kind:'table',cui:'Contemporary',d:'Multi-year \"best theme-park restaurant\" winner in a sea-god grotto',res:true},
 {n:'Three Broomsticks',where:'ioa',kind:'quick',cui:'British',d:'Hogsmeade tavern — Great Feast platter + Butterbeer'},
 {n:'Leaky Cauldron',where:'usf',kind:'quick',cui:'British',d:'Diagon Alley pub fare — bangers and mash, fisherman\'s pie'},
 {n:'Finnegan\'s Bar & Grill',park:'usf',where:'usf',kind:'table',cui:'Irish pub',d:'Table service in the New York lot',res:true},
 {n:'Lombard\'s Seafood Grille',where:'usf',kind:'table',cui:'Seafood',d:'Lagoon-side, quieter than it deserves',res:true},
 {n:'Atlantic',where:'epic',kind:'table',cui:'Seafood',d:'Epic\'s showpiece dining room in Celestial Park',res:true},
 {n:'Blue Dragon Pan-Asian',where:'epic',kind:'table',cui:'Pan-Asian',d:'Under the dragon in Celestial Park',res:true},
 {n:'Toadstool Cafe',where:'epic',kind:'quick',cui:'Japanese-ish',d:'Super Nintendo World — Toad chef windows, book a return time'},
 {n:'Das Stakehaus',where:'epic',kind:'table',cui:'Steak',d:'Dark Universe steakhouse staffed by \"vampire familiars\"',res:true},
 {n:'Toothsome Chocolate Emporium',where:'citywalk',kind:'table',cui:'American + shakes',d:'Steampunk chocolate factory — the milkshakes are the point',res:true},
 {n:'The Cowfish',where:'citywalk',kind:'table',cui:'Burger + sushi',d:'Burgushi. It works. Ask for the balcony',res:true},
 {n:'Antojitos Authentic Mexican',where:'citywalk',kind:'table',cui:'Mexican',d:'Tableside guac, live mariachi some nights',res:true},
 {n:'Vivo Italian Kitchen',where:'citywalk',kind:'table',cui:'Italian',d:'Fresh pasta pulled in the window',res:true},
 {n:'Bigfire',where:'citywalk',kind:'table',cui:'American grill',d:'Open-fire cooking, tabletop s\'mores',res:true},
 {n:'Kohola Reef Restaurant',where:'vb',kind:'quick',cui:'Island BBQ',d:'Volcano Bay\'s main counter — mango BBQ ribs'}
];
var UO_PARKS={usf:{n:'Universal Studios Florida',c:'#2E5EAA',lat:28.4794,lng:-81.4685},
 ioa:{n:'Islands of Adventure',c:'#0E7C86',lat:28.4718,lng:-81.4707},
 epic:{n:'Epic Universe',c:'#7A4FA3',lat:28.4471,lng:-81.4692},
 vb:{n:'Volcano Bay',c:'#B8552A',lat:28.4623,lng:-81.4717},
 citywalk:{n:'CityWalk',c:'#5E7F4C',lat:28.4739,lng:-81.4691}};
var UO_POINTS={mco:{n:'MCO — Orlando International',lat:28.4312,lng:-81.3081},
 hotel:{n:'JW Marriott Orlando Bonnet Creek',lat:28.4023,lng:-81.5157}};

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
card:{ord:7,country:'Theme-Park Trip',emoji:'🎬',title:'Orlando — Universal',dates:'Dates TBD',photo:'Universal_Studios_Florida_Gate.JPG',credit:'Universal Studios Florida gate · Malpass93, public domain',status:'wip',theme:'ocean'}, group:true, theme:'ocean',
 attr:UO_ATTR, rest:UO_REST, parks:UO_PARKS, points:UO_POINTS,
 hotelDefault:{name:'JW Marriott Orlando Bonnet Creek',addr:'14900 Chelonia Pkwy, Orlando, FL 32821',
   lat:28.4023,lng:-81.5157,nights:3,roomCost:0,note:'Bonvoy property — Platinum breakfast + upgrade odds good. ~15 min drive to Universal; budget rideshare or rental.'},
 accent:'#1F4FA3',
 cities:[
  {id:'uotoday',city:'Today',      sub:'countdown & prep',  uoTab:'uotoday'},
  {id:'uosched',city:'Schedule',   sub:'3 nights · 4 days', uoTab:'uosched'},
  {id:'uoattr', city:'Attractions',sub:'all four parks',    uoTab:'uoattr'},
  {id:'uorest', city:'Restaurants',sub:'book into the plan',uoTab:'uorest'},
  {id:'uofly',  city:'Flights',    sub:'from the organizer',uoTab:'uofly'},
  {id:'uohotel',city:'Hotel',      sub:'JW Bonnet Creek',   uoTab:'uohotel'},
  {id:'uoexp',  city:'Expenses',   sub:'group vs mine',     uoTab:'uoexp'}
 ],hotels:UO_HOTELS,flights:UO_FLIGHTS,wx:UO_WX,
 todayCity:UO_TODAY_CITY,tonight:UO_TONIGHT,
 emoji:'🎬',brand:'ORLANDO',foot:'Universal Orlando · dates TBD',
 title:'Orlando — Universal',kicker:'THEME-PARK TRIP · DATES TBD',
 depart:[2029,0,1],arrive:[2029,0,1],end:[2029,0,5],   /* placeholder — update with real dates */
 navIcons:{orlando:'🎬'},navSecs:{},
 tz:'America/New_York',mon:1,cur:{code:'USD',sym:'$',key:'usd',fallback:1,name:'dollars'},
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
