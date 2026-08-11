/* Trip DATA only — loaded before the engine in index.html.
   No behaviour lives in this file; add cities, hotels, POIs and meals here. */
window.TRIPS_REGISTRY=window.TRIPS_REGISTRY||{};

/* ================= KOREA · MAY 2027 =================
   Hotels confirmed from Marriott/Google. Flights and restaurants are stubs
   on purpose — they get filled in as they are actually booked. */
var KR_HOTELS = {
 westin_parnas:{n:"The Westin Seoul Parnas",lat:37.51293,lng:127.05745,addr:"524 Bongeunsa-ro, Gangnam-gu, Seoul 06164",
   tel:"+82 2-3452-2500",mail:"— Marriott app chat",
   stn:"Bongeunsa (Line 9) Exit 7 · 5 min walk — Samseong (Line 2) Exit 6 · 13 min · airport limousine 6703 stops at COEX North Gate",
   note:"Two stays: 7–10 and 14–18 May. Reopened Sept 2025 as a Westin after a full rebuild of the old InterContinental COEX — 564 rooms, and one of the largest club lounges in Seoul, which your Platinum status should open. Ask for a Bongeunsa temple view."}
};
var KR_FLIGHTS=[
 {d:"May 7",r:"IAD → ICN",f:"not booked",t:"—",n:"Award options researched earlier: Amex MR → Aeroplan/Asiana, or Virgin Atlantic → Korean Air, both from Dulles."},
 {d:"May 10",r:"Seoul → CJU",f:"not booked",t:"—",n:"Gimpo (GMP) is far quicker to reach from Gangnam than Incheon. ~70 min flight; Korean Air, Asiana and the LCCs run it constantly."},
 {d:"May 14",r:"CJU → Seoul",f:"not booked",t:"—",n:"Back for the second Westin Parnas stay."},
 {d:"May 18",r:"ICN → IAD",f:"not booked",t:"—",n:"Homeward."}
];
var KR_WX = {
 seoul:{lat:37.5665,lng:126.9780,from:"2027-05-07",to:"2027-05-18"}
};
var KR_TODAY_CITY={7:'seoul',8:'seoul',9:'seoul',10:'seoul',11:'seoul',12:'seoul',13:'seoul',14:'seoul',15:'seoul',16:'seoul',17:'seoul',18:'seoul'};
var KR_TONIGHT={7:'westin_parnas',8:'westin_parnas',9:'westin_parnas',
 10:['On Jeju \ud83c\udf4a','see the Jeju group trip'],11:['On Jeju \ud83c\udf4a','see the Jeju group trip'],12:['On Jeju \ud83c\udf4a','see the Jeju group trip'],13:['On Jeju \ud83c\udf4a','see the Jeju group trip'],
 14:'westin_parnas',15:'westin_parnas',16:'westin_parnas',17:'westin_parnas',18:['Homeward \u2708','ICN \u2192 IAD']};
var KR_CITIES=[
{id:"today",city:"Today",sub:"live day view",today:true},
{id:"todo",city:"To-do",sub:"Prep & deadlines",todo:true},
{id:"seoul",city:"Seoul",sub:"5/7–5/10 · 5/14–5/18",hotel:"westin_parnas",
 legs:[
  {r:"✈ ICN → Gangnam",m:"5/7 · AREX to Seoul Stn then Line 2, or the 6703 limousine bus",n:"The 6703 stops at COEX North Gate, two minutes from the hotel — easiest with luggage. A taxi runs about ₩70,000 and 60–80 min."},
  {r:"Seoul → Jeju",m:"5/10 · fly from Gimpo",n:"Line 9 runs express straight to Gimpo from Bongeunsa — one of the reasons this hotel is well placed."},
  {r:"Jeju → Seoul",m:"5/14 · CJU → Gimpo",n:"Straight back to the Westin Parnas for the second half."},
  {r:"Gangnam → ICN ✈",m:"5/18 · 6703 limousine or AREX",n:"Allow ~90 min door to gate."}],
 metro:[["Line 9 (gold)","Bongeunsa Exit 7 is 5 min away · express trains to Gimpo Airport and Yeouido"],
        ["Line 2 (green)","Samseong Exit 6, 13 min · the loop to Gangnam, City Hall, Hongdae"],
        ["Payment","T-money card from any convenience store — subway, buses and most taxis"]],
 pois:[
 {c:"sight",ic:"🛕",n:"Bongeunsa",d:"1,000-year-old temple directly across from the hotel — your room may look onto it",a:"hotel",lat:37.5147,lng:127.0577},
 {c:"sight",ic:"📚",n:"Starfield Library, COEX",d:"the giant atrium bookshelf, inside the mall you are connected to",a:"COEX",lat:37.5096,lng:127.0601},
 {c:"sight",ic:"🏯",n:"Gyeongbokgung",d:"the main palace — hanbok rental gets you in free; guard changing mid-morning",a:"Jongno",lat:37.5796,lng:126.9770},
 {c:"sight",ic:"🏘",n:"Bukchon Hanok Village",d:"lanes of traditional houses between two palaces — residents live here, so keep it quiet",a:"Jongno",lat:37.5826,lng:126.9830},
 {c:"sight",ic:"⛩",n:"Changdeokgung & Huwon",d:"the secret garden is a timed ticket, booked ahead",a:"Jongno",lat:37.5794,lng:126.9910},
 {c:"sight",ic:"🌉",n:"Banpo Hangang Park",d:"rainbow fountain on the bridge in the evenings from spring",a:"Banpo",lat:37.5130,lng:127.0000},
 {c:"food",ic:"🥘",n:"Gwangjang Market",d:"bindaetteok and mayak gimbap at the stalls — bring cash",a:"Jongno",lat:37.5701,lng:126.9997},
 {c:"shop",ic:"🛍",n:"Seongsu-dong",d:"old factories turned into coffee and flagship stores — the current fashionable quarter",a:"Seongsu",lat:37.5445,lng:127.0557},
 {c:"shop",ic:"🏬",n:"Hyundai Dept Store COEX",d:"next door — depachika-style food hall in the basement",a:"COEX",lat:37.5088,lng:127.0596},
 {c:"cafe",ic:"☕",n:"Ikseon-dong",d:"hanok alleys full of small cafés and restaurants",a:"Jongno",lat:37.5740,lng:126.9903}],
 stops:[]},
{id:"flights",city:"Flights",sub:"all legs",flights:true},
{id:"vault",city:"Vault",sub:"confirmations",vault:true},
{id:"expenses",city:"Expenses",sub:"budget tracker",expenses:true},
{id:"calc",city:"Calc",sub:"₩ ⇄ $",calc:true}
];

window.TRIPS_REGISTRY['korea-2027']={accent:'#2E5FA3',cities:KR_CITIES,hotels:KR_HOTELS,flights:KR_FLIGHTS,wx:KR_WX,todayCity:KR_TODAY_CITY,tonight:KR_TONIGHT,
   emoji:'🇰🇷',brand:"Korea · May '27",foot:"7–18 May · Seoul (Jeju is its own trip)",
   title:"Korea, May 2027",kicker:"7–18 May 2027",depart:[2027,4,7],arrive:[2027,4,7],end:[2027,4,18],
   navIcons:{today:'🗓️',todo:'✅',seoul:'🏯',flights:'✈️',vault:'🗂️',expenses:'💳',calc:'💱'},
   navSecs:{seoul:'Itinerary',flights:'Tools'},
   tz:'Asia/Seoul',mon:5,cur:{code:'KRW',sym:'₩',key:'krw',fallback:1350,name:'won'},
   departNote:'IAD → ICN · May 7',preLabel:'Travel day',transitLabel:'In transit ✈',
   seedTodos:[
     {id:'k1',d:'2027-02-07',cat:'transport',title:'Book IAD → ICN',desc:'Award space opens ~360 days out. Aeroplan/Asiana or Virgin Atlantic → Korean Air from Dulles.'},
     {id:'k2',d:'2027-03-01',cat:'admin',title:'International Driving Permit for Jeju',desc:'AAA issues it; required to rent a car on Jeju. Bring the IDP and your US licence.'},
     {id:'k3',d:'2027-04-07',cat:'transport',title:'Book the Gimpo ⇄ Jeju flights',desc:'One month out is plenty; Line 9 runs express from Bongeunsa to Gimpo.'}],
   vault:[['Flights',[['kf_out','IAD → ICN','May 7 · conf / seats'],['kf_cju1','Seoul → CJU','May 10 · conf / seats'],['kf_cju2','CJU → Seoul','May 14 · conf / seats'],['kf_home','ICN → IAD','May 18 · conf / seats']]]],
   flag:'<svg class="flag" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg"><rect width="900" height="600" fill="#ffffff"/><circle cx="450" cy="300" r="120" fill="#cd2e3a"/><path d="M330 300a120 120 0 0 1 240 0a60 60 0 0 0-120 0a60 60 0 0 1-120 0" fill="#0047a0"/></svg>'};
