/* Trip DATA only. JEJU · MAY 2027 — the group leg, split out of the Korea trip.
   This is a "group land trip": everyone with a grant collaborates on the car,
   flights, schedule/map, money and files. Accommodation is fixed (Parnas). */
window.TRIPS_REGISTRY=window.TRIPS_REGISTRY||{};

var JJ_CITIES=[
 {id:'jsum', city:'Overview', sub:'stay & status',  jjTab:'jsum'},
 {id:'jvote',city:'Decisions',sub:'car & flights',  jjTab:'jvote'},
 {id:'jsched',city:'Schedule',sub:'map & plans',    jjTab:'jsched'},
 {id:'jexp', city:'Money',    sub:'group vs mine',  jjTab:'jexp'},
 {id:'jlinks',city:'Files',   sub:'confirmations',  jjTab:'jlinks'}
];

window.TRIPS_REGISTRY['jeju-2027']={accent:'#E8871E',cities:JJ_CITIES,hotels:{},flights:[],wx:{jeju:{lat:33.2500,lng:126.4100,from:'2027-05-10',to:'2027-05-14'}},
 todayCity:{},tonight:{},group:true,
 emoji:'🍊',brand:"Jeju · May '27",foot:'10–14 May · group trip',
 title:'Jeju, May 2027',kicker:'10–14 May 2027 · the group leg',
 depart:[2027,4,10],arrive:[2027,4,10],end:[2027,4,14],
 navIcons:{jsum:'🧭',jvote:'🗳️',jsched:'🗺️',jexp:'💳',jlinks:'📁'},navSecs:{},
 tz:'Asia/Seoul',mon:5,cur:{code:'KRW',sym:'₩',key:'krw',fallback:1350,name:'won'},
 stay:{n:'Parnas Hotel Jeju',lat:33.24460,lng:126.40596,addr:'100 Jungmungwangwang-ro 72beon-gil, Seogwipo',
   tel:'+82 64-801-5555',
   note:'Set — no change. Jungmun resort area, 10 min walk to the beach; heated outdoor infinity pool. Newer wing gets the better reviews; ocean-view rooms are the ones to ask for.'},
 flag:'<svg class="flag" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg"><rect width="900" height="600" fill="#ffffff"/><circle cx="450" cy="300" r="120" fill="#cd2e3a"/><path d="M330 300a120 120 0 0 1 240 0a60 60 0 0 0-120 0a60 60 0 0 1-120 0" fill="#0047a0"/></svg>'};
