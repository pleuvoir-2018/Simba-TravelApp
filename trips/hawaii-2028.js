/* Trip DATA only — loaded before the engine in index.html.
   HAWAIʻI · NEW YEAR SKELETON: structure mirrors Japan/Korea so the engine renders fully.
   Everything marked TBD is a placeholder to overwrite as real bookings land. */
window.TRIPS_REGISTRY=window.TRIPS_REGISTRY||{};

var HI28_HOTELS = {
 hi28_hotel:{n:"Hotel TBD — Waikīkī",lat:21.2793,lng:-157.8294,addr:"Waikīkī, Honolulu, Oʻahu — placeholder pin",
   tel:"—",mail:"—",
   stn:"No rail to Waikīkī — airport taxi/shuttle ~25 min, or TheBus. Skyline rail does not reach Waikīkī.",
   note:"Not booked. Bonvoy options on the beach: Royal Hawaiian, Moana Surfrider, Sheraton Waikiki — Platinum upgrades are strongest at the Sheraton. Decide island split first."}
};
var HI28_FLIGHTS=[
 {d:"Dec 29",r:"IAD → HNL",f:"not booked",t:"—",n:"~11 hrs with one stop westbound (or IAD→LAX/SFO→HNL). Award space is tight for the New Year peak — book early."},
 {d:"Jan 5",r:"HNL → IAD",f:"not booked",t:"—",n:"Red-eye eastbound is standard; lands next day."}
];
var HI28_WX = {
 oahu:{lat:21.3069,lng:-157.8583,from:"2028-12-29",to:"2029-01-05"}
};
var HI28_TODAY_CITY={29:'oahu',30:'oahu',31:'oahu',1:'oahu',2:'oahu',3:'oahu',4:'oahu',5:'oahu'};
var HI28_TONIGHT={29:'hi28_hotel',30:'hi28_hotel',31:'hi28_hotel',1:'hi28_hotel',2:'hi28_hotel',3:'hi28_hotel',4:'hi28_hotel',5:['Homeward \u2708','HNL \u2192 IAD']};
var HI28_CITIES=[
{id:"today",city:"Today",sub:"live day view",today:true},
{id:"todo",city:"To-do",sub:"Prep & deadlines",todo:true},
{id:"oahu",city:"Oʻahu",sub:"12/29–1/5 · island TBD",hotel:"hi28_hotel",
 legs:[
  {r:"✈ HNL → Waikīkī",m:"12/29 · taxi/shuttle ~25 min",n:"Uber/Lyft pick up on the second level. TheBus runs but is slow with luggage."},
  {r:"Waikīkī → HNL ✈",m:"1/5 · allow 2 hrs before departure",n:"Ag inspection for checked bags with fruit/plants."}],
 metro:[["Getting around","Rental car for North Shore / east side days; Waikīkī itself is walkable"],
        ["TheBus","$3 flat with HOLO card — Route 8/20/23 cover Waikīkī–Ala Moana"],
        ["Biki","Bikeshare docks all over Waikīkī and Kakaʻako"]],
 pois:[
 {c:"sight",ic:"🏖",n:"Waikīkī Beach",d:"the classic stretch — Duke statue, surf lessons, sunset catamarans",a:"Waikīkī",lat:21.2765,lng:-157.8256},
 {c:"sight",ic:"🌋",n:"Diamond Head (Lēʻahi)",d:"crater-rim hike, ~1.5 hrs round trip — reservations required for out-of-state visitors",a:"east",lat:21.2606,lng:-157.8046},
 {c:"sight",ic:"⚓",n:"Pearl Harbor — USS Arizona",d:"timed tickets release 8 weeks out on recreation.gov and go fast",a:"west",lat:21.3649,lng:-157.9507},
 {c:"sight",ic:"🐠",n:"Hanauma Bay",d:"snorkel preserve — online reservations, closed Mon/Tue",a:"east",lat:21.2690,lng:-157.6938},
 {c:"sight",ic:"🏝",n:"Lanikai / Kailua",d:"the postcard beach on the windward side — go early, parking is scarce",a:"windward",lat:21.3925,lng:-157.7126},
 {c:"sight",ic:"🌊",n:"North Shore — Haleʻiwa",d:"winter is BIG-wave season — Pipeline and Waimea are spectator sport in December",a:"north",lat:21.5928,lng:-158.1030},
 {c:"food",ic:"🍩",n:"Leonard's Bakery",d:"malasadas since 1952 — get them hot, plain or haupia-filled",a:"Kapahulu",lat:21.2846,lng:-157.8134},
 {c:"food",ic:"🍜",n:"Marukame Udon",d:"the famous Waikīkī queue — fast, cheap, worth it once",a:"Waikīkī",lat:21.2790,lng:-157.8270},
 {c:"food",ic:"🥩",n:"Poke — Ono Seafood / Foodland",d:"proper poke by the pound, eaten from the container",a:"Kapahulu",lat:21.2870,lng:-157.8110},
 {c:"cafe",ic:"🥭",n:"KCC Farmers Market",d:"Saturday mornings under Diamond Head — breakfast stalls and fruit",a:"east",lat:21.2699,lng:-157.8009}],
 stops:[]},
{id:"flights",city:"Flights",sub:"all legs",flights:true},
{id:"vault",city:"Vault",sub:"confirmations",vault:true},
{id:"expenses",city:"Expenses",sub:"budget tracker",expenses:true}
];

window.TRIPS_REGISTRY['hawaii-2028']={accent:'#C2497B',cities:HI28_CITIES,hotels:HI28_HOTELS,flights:HI28_FLIGHTS,wx:HI28_WX,todayCity:HI28_TODAY_CITY,tonight:HI28_TONIGHT,
   emoji:'🌺',brand:"Hawaii · NYE '29",foot:"Dec 29 – Jan 5 · Oʻahu (TBD)",
   title:"Hawaii, December 2028",kicker:"Dec 29 – Jan 5 · New Year in the islands · dates TBD",depart:[2028,11,29],arrive:[2028,11,29],end:[2029,0,5],
   navIcons:{today:'🗓️',todo:'✅',oahu:'🌺',flights:'✈️',vault:'🗂️',expenses:'💳'},
   navSecs:{oahu:'Itinerary',flights:'Tools'},
   tz:'Pacific/Honolulu',mon:12,cur:{code:'USD',sym:'$',key:'usd',fallback:1,name:'dollars'},
   departNote:'IAD → HNL · Dec 29',preLabel:'Travel day',transitLabel:'In transit ✈',
   seedTodos:[
     {id:'hi281',d:'2028-02-01',cat:'transport',title:'Book IAD → HNL',desc:'~330 days out for award space. NYE week is the most expensive week of the year in Waikīkī — book the moment the calendar opens.'},
     {id:'hi282',d:'2028-03-01',cat:'stay',title:'Pick the hotel (and island split)',desc:'Bonvoy beachfront: Royal Hawaiian / Moana Surfrider / Sheraton Waikiki. Decide Oʻahu-only vs. adding a neighbor island before booking.'},
     {id:'hi283',d:'2028-11-03',cat:'admin',title:'Pearl Harbor tickets',desc:'USS Arizona timed tickets release 8 weeks out, 3 PM ET on recreation.gov — they go in minutes.'}],
   vault:[['Flights',[['hi28f_out','IAD → HNL','Dec 29 · conf / seats'],['hi28f_home','HNL → IAD','Jan 5 · conf / seats']]]],
   flag:'<svg class="flag" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg"><rect width="900" height="600" fill="#fff"/><g><rect y="0" width="900" height="75" fill="#fff"/><rect y="75" width="900" height="75" fill="#c8102e"/><rect y="150" width="900" height="75" fill="#003087"/><rect y="225" width="900" height="75" fill="#fff"/><rect y="300" width="900" height="75" fill="#c8102e"/><rect y="375" width="900" height="75" fill="#003087"/><rect y="450" width="900" height="75" fill="#fff"/><rect y="525" width="900" height="75" fill="#c8102e"/><rect width="450" height="300" fill="#003087"/><path d="M0 0l450 300M450 0L0 300" stroke="#fff" stroke-width="55"/><path d="M0 0l450 300M450 0L0 300" stroke="#c8102e" stroke-width="22"/><path d="M225 0v300M0 150h450" stroke="#fff" stroke-width="90"/><path d="M225 0v300M0 150h450" stroke="#c8102e" stroke-width="55"/></g></svg>'};
