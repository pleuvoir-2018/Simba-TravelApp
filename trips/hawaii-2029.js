/* Trip DATA only — loaded before the engine in index.html.
   HAWAIʻI · SPRING SKELETON: structure mirrors Japan/Korea so the engine renders fully.
   Everything marked TBD is a placeholder to overwrite as real bookings land. */
window.TRIPS_REGISTRY=window.TRIPS_REGISTRY||{};

var HI29_HOTELS = {
 hi29_hotel:{n:"Hotel TBD — Waikīkī",lat:21.2793,lng:-157.8294,addr:"Waikīkī, Honolulu, Oʻahu — placeholder pin",
   tel:"—",mail:"—",
   stn:"No rail to Waikīkī — airport taxi/shuttle ~25 min, or TheBus. Skyline rail does not reach Waikīkī.",
   note:"Not booked. Bonvoy options on the beach: Royal Hawaiian, Moana Surfrider, Sheraton Waikiki — Platinum upgrades are strongest at the Sheraton. Decide island split first."}
};
var HI29_FLIGHTS=[
 {d:"Mar 9",r:"IAD → HNL",f:"not booked",t:"—",n:"~11 hrs with one stop westbound (or IAD→LAX/SFO→HNL). Award space is tight for spring break — book early."},
 {d:"Mar 18",r:"HNL → IAD",f:"not booked",t:"—",n:"Red-eye eastbound is standard; lands next day."}
];
var HI29_WX = {
 oahu:{lat:21.3069,lng:-157.8583,from:"2029-03-09",to:"2029-03-18"}
};
var HI29_TODAY_CITY={9:'oahu',10:'oahu',11:'oahu',12:'oahu',13:'oahu',14:'oahu',15:'oahu',16:'oahu',17:'oahu',18:'oahu'};
var HI29_TONIGHT={9:'hi29_hotel',10:'hi29_hotel',11:'hi29_hotel',12:'hi29_hotel',13:'hi29_hotel',14:'hi29_hotel',15:'hi29_hotel',16:'hi29_hotel',17:'hi29_hotel',18:['Homeward \u2708','HNL \u2192 IAD']};
var HI29_CITIES=[
{id:"today",city:"Today",sub:"live day view",today:true},
{id:"todo",city:"To-do",sub:"Prep & deadlines",todo:true},
{id:"oahu",city:"Oʻahu",sub:"3/9–3/18 · island TBD",hotel:"hi29_hotel",
 legs:[
  {r:"✈ HNL → Waikīkī",m:"3/9 · taxi/shuttle ~25 min",n:"Uber/Lyft pick up on the second level. TheBus runs but is slow with luggage."},
  {r:"Waikīkī → HNL ✈",m:"3/18 · allow 2 hrs before departure",n:"Ag inspection for checked bags with fruit/plants."}],
 metro:[["Getting around","Rental car for North Shore / east side days; Waikīkī itself is walkable"],
        ["TheBus","$3 flat with HOLO card — Route 8/20/23 cover Waikīkī–Ala Moana"],
        ["Biki","Bikeshare docks all over Waikīkī and Kakaʻako"]],
 pois:[
 {c:"sight",ic:"🏖",n:"Waikīkī Beach",d:"the classic stretch — Duke statue, surf lessons, sunset catamarans",a:"Waikīkī",lat:21.2765,lng:-157.8256},
 {c:"sight",ic:"🌋",n:"Diamond Head (Lēʻahi)",d:"crater-rim hike, ~1.5 hrs round trip — reservations required for out-of-state visitors",a:"east",lat:21.2606,lng:-157.8046},
 {c:"sight",ic:"⚓",n:"Pearl Harbor — USS Arizona",d:"timed tickets release 8 weeks out on recreation.gov and go fast",a:"west",lat:21.3649,lng:-157.9507},
 {c:"sight",ic:"🐠",n:"Hanauma Bay",d:"snorkel preserve — online reservations, closed Mon/Tue",a:"east",lat:21.2690,lng:-157.6938},
 {c:"sight",ic:"🏝",n:"Lanikai / Kailua",d:"the postcard beach on the windward side — go early, parking is scarce",a:"windward",lat:21.3925,lng:-157.7126},
 {c:"sight",ic:"🌊",n:"North Shore — Haleʻiwa",d:"March still catches late-winter swell some years; whale season runs through March",a:"north",lat:21.5928,lng:-158.1030},
 {c:"food",ic:"🍩",n:"Leonard's Bakery",d:"malasadas since 1952 — get them hot, plain or haupia-filled",a:"Kapahulu",lat:21.2846,lng:-157.8134},
 {c:"food",ic:"🍜",n:"Marukame Udon",d:"the famous Waikīkī queue — fast, cheap, worth it once",a:"Waikīkī",lat:21.2790,lng:-157.8270},
 {c:"food",ic:"🥩",n:"Poke — Ono Seafood / Foodland",d:"proper poke by the pound, eaten from the container",a:"Kapahulu",lat:21.2870,lng:-157.8110},
 {c:"cafe",ic:"🥭",n:"KCC Farmers Market",d:"Saturday mornings under Diamond Head — breakfast stalls and fruit",a:"east",lat:21.2699,lng:-157.8009}],
 stops:[]},
{id:"flights",city:"Flights",sub:"all legs",flights:true},
{id:"vault",city:"Vault",sub:"confirmations",vault:true},
{id:"expenses",city:"Expenses",sub:"budget tracker",expenses:true}
];

window.TRIPS_REGISTRY['hawaii-2029']={accent:'#2E7D5B',cities:HI29_CITIES,hotels:HI29_HOTELS,flights:HI29_FLIGHTS,wx:HI29_WX,todayCity:HI29_TODAY_CITY,tonight:HI29_TONIGHT,
   emoji:'🏝',brand:"Hawaii · Mar '29",foot:"9–18 Mar · Oʻahu (TBD)",
   title:"Hawaii, March 2029",kicker:"9–18 March 2029 · spring trip",depart:[2029,2,9],arrive:[2029,2,9],end:[2029,2,18],
   navIcons:{today:'🗓️',todo:'✅',oahu:'🌺',flights:'✈️',vault:'🗂️',expenses:'💳'},
   navSecs:{oahu:'Itinerary',flights:'Tools'},
   tz:'Pacific/Honolulu',mon:3,cur:{code:'USD',sym:'$',key:'usd',fallback:1,name:'dollars'},
   departNote:'IAD → HNL · Mar 9',preLabel:'Travel day',transitLabel:'In transit ✈',
   seedTodos:[
     {id:'hi291',d:'2028-04-20',cat:'transport',title:'Book IAD → HNL',desc:'~330 days out for award space. Spring break pushes prices — mid-March books early.'},
     {id:'hi292',d:'2028-06-01',cat:'stay',title:'Pick the hotel (and island split)',desc:'Bonvoy beachfront: Royal Hawaiian / Moana Surfrider / Sheraton Waikiki. Decide Oʻahu-only vs. adding a neighbor island before booking.'},
     {id:'hi293',d:'2029-01-19',cat:'admin',title:'Pearl Harbor tickets',desc:'USS Arizona timed tickets release 8 weeks out, 3 PM ET on recreation.gov — they go in minutes.'}],
   vault:[['Flights',[['hi29f_out','IAD → HNL','Mar 9 · conf / seats'],['hi29f_home','HNL → IAD','Mar 18 · conf / seats']]]],
   flag:'<svg class="flag" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg"><rect width="900" height="600" fill="#fff"/><g><rect y="0" width="900" height="75" fill="#fff"/><rect y="75" width="900" height="75" fill="#c8102e"/><rect y="150" width="900" height="75" fill="#003087"/><rect y="225" width="900" height="75" fill="#fff"/><rect y="300" width="900" height="75" fill="#c8102e"/><rect y="375" width="900" height="75" fill="#003087"/><rect y="450" width="900" height="75" fill="#fff"/><rect y="525" width="900" height="75" fill="#c8102e"/><rect width="450" height="300" fill="#003087"/><path d="M0 0l450 300M450 0L0 300" stroke="#fff" stroke-width="55"/><path d="M0 0l450 300M450 0L0 300" stroke="#c8102e" stroke-width="22"/><path d="M225 0v300M0 150h450" stroke="#fff" stroke-width="90"/><path d="M225 0v300M0 150h450" stroke="#c8102e" stroke-width="55"/></g></svg>'};
