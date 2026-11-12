const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{spawn}=require('node:child_process'),{pathToFileURL}=require('node:url');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'tihu-qa-'));
const entry=pathToFileURL(path.resolve(__dirname,'../index.html')).href;
const chrome=process.env.CHROME_BIN||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const child=spawn(chrome,['--headless=new','--no-sandbox','--enable-unsafe-swiftshader','--disable-background-networking','--disable-component-update','--disable-sync','--no-first-run','--host-resolver-rules=MAP * ~NOTFOUND','--remote-debugging-pipe','--window-size=1440,900','--user-data-dir='+tmp,entry],{stdio:['ignore','ignore','ignore','pipe','pipe'],windowsHide:true});
let buf='',sessionId,seq=0;const pending=new Map(),errors=[],requests=[];
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const watchdog=setTimeout(()=>{console.error('Browser test timed out');child.kill();process.exit(1)},55000);
child.stdio[4].on('data',d=>{buf+=d;let i;while((i=buf.indexOf('\0'))>=0){const m=JSON.parse(buf.slice(0,i));buf=buf.slice(i+1);if(m.method==='Runtime.exceptionThrown')errors.push(m.params);if(m.method==='Network.requestWillBeSent')requests.push(m.params.request.url);if(m.id){const [ok,no]=pending.get(m.id);pending.delete(m.id);m.error?no(m.error):ok(m.result)}}});
const send=(method,params={})=>new Promise((ok,no)=>{const id=++seq;pending.set(id,[ok,no]);child.stdio[3].write(JSON.stringify({id,method,params,sessionId})+'\0')});
(async()=>{
 const {targetInfos}=await send('Target.getTargets');({sessionId}=await send('Target.attachToTarget',{targetId:targetInfos.find(t=>t.type==='page').targetId,flatten:true}));
 await send('Runtime.enable');await send('Network.enable');await send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
 const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
 const shot=async n=>{if(!process.env.TIHU_QA_IMAGES)return;fs.writeFileSync(path.join(process.env.TIHU_QA_IMAGES,n+'.png'),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'))};
 await delay(1000);assert.equal(await ev('mode'), 'garage');assert.equal(await ev('Boolean(stage3d)'), true,'WebGL path');
 await shot('garage');
 await shot('lobby');
 const until=async predicate=>{for(let i=0;i<60;i++){if(await ev(predicate))return;await delay(75)}throw Error('Timed out: '+predicate)};
 const select=await send('Runtime.evaluate',{expression:"window.__yesPlays=0;const originalYes=AudioBufferSourceNode.prototype.start;AudioBufferSourceNode.prototype.start=function(...args){if(this.buffer)window.__yesPlays++;return originalYes.apply(this,args)};document.querySelector('#garageContent .choice').click();",userGesture:true});
 assert.equal(select.exceptionDetails,undefined);
 await until('Boolean(cue.buffer)&&lobbyMotion().hold>.75');await shot('lobby-ready');
 await until("lobbyMotion().salute>.85&&!document.getElementById('yesCaption').hidden&&window.__yesPlays===1");
 assert.equal(await ev("document.getElementById('yesCaption').querySelector('strong').textContent"),'Yes!');
 assert.equal(await ev("audio.state"),'running');await shot('lobby-salute');
 await until("lobbyMotion().t>2.55&&document.getElementById('yesCaption').hidden");assert.equal(await ev('window.__yesPlays'),1);
 console.log('Lobby: selecting a character poses, salutes, decodes and plays embedded Yes audio once, then returns to idle.');

 await ev("document.getElementById('next').click()");assert.equal(await ev('tab'),'pilot','Name required');
 await ev("muted=true;document.getElementById('nameInput').value='湾湾';document.getElementById('nameInput').dispatchEvent(new Event('input'));document.querySelectorAll('#garageContent .choice')[1].click()");
 assert.deepEqual(await ev('[profile.name,profile.sex,profile.wear.top,profile.wear.glasses]'),['湾湾','female','hero','none']);
 await ev("document.getElementById('refView').click()");await delay(90);assert.equal(await ev('referenceView'),1);assert.ok(await ev('orthographic>0'));await shot('hero-front');await ev("document.getElementById('refView').click()");await delay(90);await shot('hero-side');await ev("document.getElementById('refView').click()");await delay(90);await shot('hero-back');
 const angle=await ev('previewAngle');await ev("document.getElementById('spinR').click()");assert.ok(await ev('previewAngle')>angle);
 await ev("document.querySelectorAll('#garageContent button')[4].click()");
 assert.deepEqual(await ev('[profile.wear.top,profile.wear.glasses]'),['sail','cat']);
 await delay(350);await shot('fitting');
 const mapPoses=await ev(`(()=>{const old=profile.vehicle;chooseTab('map');document.querySelectorAll('#garageContent>.choices .choice')[3].click();
  const list=[],original=pelican;
  try{for(let i=0;i<4;i++){
   document.querySelectorAll('.routeRides .choice')[i].click();
   pelican=(T,p)=>{list.push([profile.map,profile.vehicle,p.kind]);original(T,p)};render(.016);pelican=original;
  }}finally{pelican=original}
  profile.vehicle=old;chooseTab('pilot');return list})()`);
 assert.deepEqual(mapPoses,[['jungle','bike','bike'],['jungle','moto','moto'],['jungle','car','beside'],['jungle','skate','skate']]);
 await ev("chooseTab('map');document.querySelectorAll('.routeRides .choice')[0].click()");await delay(200);await shot('route-jungle-bike');
 await ev("document.querySelectorAll('#garageContent>.choices .choice')[2].click();document.querySelectorAll('.routeRides .choice')[2].click()");await delay(200);await shot('route-port-car');
 await ev("profile.vehicle='bike';chooseTab('pilot')");
 console.log('Route selection: four character poses render with their selected vehicle, including a standing companion beside the race car.');

 await ev("document.getElementById('next').click();document.querySelectorAll('#garageContent .choice')[2].click();document.getElementById('next').click();document.querySelectorAll('#garageContent .choice')[2].click();document.getElementById('next').click()");
 assert.deepEqual(await ev("[mode,profile.map,profile.vehicle,document.getElementById('cockpit').hidden]"),['play','port','car',false]);await delay(400);await shot('cockpit');
 const dashboard=await ev(`(()=>{state.v=34;hud();return [document.getElementById('gearDisplay').textContent,document.getElementById('dashSpeed').textContent,document.getElementById('rpmNeedle').getAttribute('transform'),document.getElementById('wiperGlass').hasAttribute('hidden')]})()`);
 assert.deepEqual(dashboard.slice(0,2),['5','122 km/h']);assert.match(dashboard[2],/^rotate\(/);assert.equal(dashboard[3],false);
 await ev("profile.map='jungle';profile.vehicle='car';start();state.z=22;state.v=26");await delay(420);await shot('jungle');
 await ev("state.z=470;state.v=26;camPose=null");await delay(420);await shot('bridge');
 await ev("profile.map='alpine';profile.vehicle='car';start();state.z=556;state.v=27");await delay(350);assert.equal(await ev("document.getElementById('wiperGlass').hasAttribute('hidden')"),true);await shot('alpine');
 const planted=await ev("[-1,1].every(i=>{const a=standingLeg(i);return Math.abs(a.foot[2]-a.hip[2])<.03&&a.foot[1]<a.knee[1]&&a.knee[1]<a.hip[1]})");
 assert.ok(planted);
 const surfaces=await ev(`['jungle','alpine'].map(m=>{profile.map=m;profile.vehicle='car';start();const o=obstacles.find(o=>['puddle','ice'].includes(o.kind));state.x=o.x;state.z=o.z-1.2;state.v=20;advance(.03);return [state.surfaces,state.hp,state.surface>0]})`);
 assert.deepEqual(surfaces,[[1,3,true],[1,3,true]]);
 const height=await ev("(()=>{profile.map='canyon';const ys=Array.from({length:70},(_,i)=>roadY(i*4));return [Math.min(...ys),Math.max(...ys),worldPoint([0,0,40])[1]]})()");
 assert.ok(height[1]-height[0]>9);assert.notEqual(height[2],0);
 await ev("profile.map='canyon';profile.vehicle='bike';Object.assign(profile.wear,presets.hero);start();state.z=47;cam=2");
 await delay(350);await shot('canyon');
 await ev("back();profile.map='coast';profile.vehicle='bike';chooseTab('vehicle')");await delay(350);await shot('bicycle');
 await ev("profile.vehicle='moto';chooseTab('vehicle')");await delay(150);await shot('motorcycle');
 await ev("profile.vehicle='car';chooseTab('vehicle')");await delay(150);await shot('racecar');
 await ev("profile.vehicle='skate';chooseTab('vehicle')");await delay(150);await shot('skateboard');
 await ev("start();cameraNext();cameraNext();state.z=10;state.v=14");await delay(380);await shot('skating');
 await ev("Object.assign(profile.wear,presets.sail)");
 const all=await ev(`(()=>{let all=[];for(let m in maps)for(let v in vehicles){
  profile.map=m;profile.vehicle=v;start();
  for(let i=0;i<15000&&mode==='play';i++){
   const target=obstacles.find(o=>o.kind==='coin'&&!o.bonus&&o.z>state.z+1.5);
   let aim=target?target.x:0;keys.clear();if(Math.abs(aim-state.x)>.20)keys.add(aim>state.x?'ArrowRight':'ArrowLeft');advance(.02);
  }
  all.push({m,v,mode,hp:state.hp,coins:state.coins,z:state.z});
 }return all})()`);
 assert.equal(all.length,20);for(const x of all){assert.equal(x.mode,'win',JSON.stringify(x));assert.equal(x.hp,3,JSON.stringify(x));assert.ok(x.coins>=70,JSON.stringify(x))}
 console.log('20 map/vehicle combinations completed without collisions.');
 const cape=await ev("(()=>{back();chooseTab('pilot');const e=document.querySelector('select[aria-label=披风]');let from=e.value;e.value='on';e.dispatchEvent(new Event('change'));const saved=load().wear.cape;e.value=from;e.dispatchEvent(new Event('change'));return [from,saved]})()");assert.deepEqual(cape,['off','on']);
 for(const [mapId,at] of [['coast',69],['canyon',509],['port',121],['jungle',31],['alpine',557]]){
  await ev("profile.map="+JSON.stringify(mapId)+";profile.vehicle='car';start();state.z="+at+";state.v=25");await delay(170);await shot('map-'+mapId)
 }

 await ev("back();document.getElementById('raceEntry').click()");
 assert.deepEqual(await ev("[mode,profile.map,profile.vehicle,state.race.rivals.length,state.z,document.getElementById('raceCount').hidden]"),['play','jungle','car',3,0,false]);
 await shot('race-grid');
 const launch=await ev(`(()=>{start(true);const s=state;while(s.race.clock>0){if(s.race.clock<.44)keys.add('ArrowUp');advance(.02)}return [s.v,s.z,s.t,s.charge]})()`);
 assert.deepEqual(launch,[12,0,0,46]);
 await delay(500);await shot('race-chase');
 const strategy=await ev(`(()=>{let s;start(true);s=state;const r=s.race;for(let i=0;i<12000&&mode==='play';i++){
  keys.clear();
  if(r.clock>0){if(r.clock<.42)keys.add('ArrowUp');advance(.02);continue}
  const options=[-3,0,3], ahead=Math.max(32,s.v*1.35);
  const cost=x=>{let c=Math.abs(x-s.x)*.75;
   for(const o of obstacles){const d=o.z-s.z;if(d<-.7)continue;if(d>ahead)break;if(o.done||o.passed||Math.abs(o.x-x)>1.13)continue;if(o.kind==='coin'||o.kind==='pickup')continue;c+=(o.kind==='puddle'?8:28)*(1-.36*d/ahead)}
   for(const a of r.rivals){const d=a.z-s.z;if(a.finish===null&&d>-3&&d<18&&Math.abs(a.x-x)<1.13)c+=d<7?7:2}
   return c
  };
  let aim=options.sort((a,b)=>cost(a)-cost(b))[0];if(Math.abs(aim-s.x)>.33)keys.add(aim>s.x?'ArrowRight':'ArrowLeft');
  keys.add('ArrowUp');
  if(s.charge>=64&&!s.action&&s.z>100)action();
  advance(.02);
 }return {mode,hp:s.hp,rank:document.getElementById('grade').textContent,order:r.rank,splits:r.splits,passes:r.passes,ai:r.rivals.map(a=>[a.x,a.z,a.finish]),stored:profile.raceBest}})()`);
 assert.equal(strategy.mode,'win',JSON.stringify(strategy));assert.equal(strategy.splits.length,3);assert.ok(strategy.passes>0,JSON.stringify(strategy));assert.equal(strategy.stored.place,1,JSON.stringify(strategy));await shot('race-result');
 const draft=await ev(`(()=>{start(true);const s=state,r=s.race;r.clock=0;s.z=200;s.v=30;s.x=0;r.rivals[0].z=213;r.rivals[0].x=0;const before=s.charge;for(let i=0;i<25;i++)racingPace(s,.02,true,false,0,35);return [r.draft,s.charge-before]})()`);
 assert.ok(draft[0]>.82&&draft[1]>2.5);
 const corner=await ev(`(()=>{start(true);const s=state,r=s.race;r.clock=0;s.charge=0;s.v=29;let reached=false,understeer=false;
 for(let z=0;z<1200;z+=1.4){s.z=z;const bend=roadBend(z+10);s.x=Math.sign(bend)*1.5;s.v=29;racingPace(s,.05,false,false,0,29);if(r.apexUntil>0)reached=true;
 if(Math.abs(bend)>.005){s.v=48;racingPace(s,.01,true,false,0,48);understeer ||= r.overrun>.15}
 }return [reached,understeer]})()`);assert.deepEqual(corner,[true,true]);
 const second=await ev(`(()=>{start(true);const r=state.race;r.lastSplit=47;r.splits=[15,16,16];r.rivals[0].finish=46;r.rivals[1].finish=48;raceFinish(true);return document.getElementById('grade').textContent})()`);
 assert.equal(second,'第 2 / 4 名');console.log('Rainforest chase: countdown, timed launch, AI passing, slipstream, three splits and first-place result passed.');

 const migration=await ev(`(()=>{const key='tihu-game-v1',stored=localStorage.getItem(key);localStorage.setItem(key,JSON.stringify({vehicle:'stool',name:'旧档案',bests:{'coast-stool':{time:51},'coast-bike':{time:73}}}));const old=load();localStorage.setItem(key,stored);return [old.vehicle,old.name,Boolean(old.bests['coast-stool']),old.bests['coast-bike'].time]})()`);assert.deepEqual(migration,['skate','旧档案',false,73]);
 const tricks=await ev(`(()=>{
 const setup=(m,v)=>{profile.map=m;profile.vehicle=v;start();state.v=ride().base};
 setup('coast','bike');let o=obstacles.find(o=>o.kind==='cone');state.x=o.x;state.z=o.z-5.7;action();for(let i=0;i<32;i++)advance(.02);let bike=state.tricks===1&&state.hp===3;
 setup('canyon','moto');state.v=ride().max;keys.add('ArrowRight');action();for(let i=0;i<48;i++)advance(.02);let moto=state.boost>0&&state.tricks===1;
 setup('port','car');state.charge=80;action();let car=state.action>2&&state.charge===16;advance(.12);car=car&&state.v>ride().base;
 setup('canyon','skate');o=obstacles.find(o=>o.kind==='cone');state.x=o.x;state.z=o.z-6.2;action();for(let i=0;i<32;i++)advance(.02);let skate=state.tricks===1&&state.hp===3;
 setup('coast','skate');keys.add('ArrowUp');advance(.04);let kick=state.push>0;
 setup('port','bike');o=obstacles.find(o=>o.kind==='gate');state.t=(1.3-o.phase)/1.13+3/1.13;state.x=o.x;state.z=o.z-.91;advance(.02);let gate=state.signals===1;
 setup('coast','bike');state.x=-6.39;state.z=320;advance(.03);let shortcut=state.shortcut>0;
 const unlocked=Boolean(profile.unlocks.sunset&&profile.unlocks.neon),ghost=profile.bests['coast-bike'].ghost.length>100;
 return {bike,moto,car,skate,kick,gate,shortcut,unlocked,ghost}
 })()`);
 for(const [k,v] of Object.entries(tricks))assert.equal(v,true,k);console.log('Four special moves, gate timing, shortcut, unlocks, and replay recording passed.');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:2});
 await send('Page.reload');await delay(900);
 assert.deepEqual(await ev('[profile.name,profile.sex,profile.wear.top,mode]'),['湾湾','female','sail','garage']);await shot('mobile');await shot('lobby-mobile');
 await ev("muted=true;profile.vehicle='bike';start();state.v=13");await delay(100);
 const pt=await ev("(()=>{let r=document.querySelector('[data-key=action]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()");
 await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[pt]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.ok(await ev('state.action>0'));
 await ev("back();document.getElementById('raceEntry').click()");assert.equal(await ev('Boolean(state.race)&&!document.getElementById(\'touch\').hidden'),true);
 await ev('state.race.clock=.43');const gas=await ev("(()=>{let r=document.querySelector('[data-key=ArrowUp]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()");
 await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[gas]});await delay(180);assert.ok(await ev('state.race.rev>0'));await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert.deepEqual(errors,[]);assert.ok(requests.every(s=>!/^https?:/i.test(s)));console.log('Offline reload, profile persistence, and mobile input passed.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{clearTimeout(watchdog);child.kill();setTimeout(()=>{try{const resolved=fs.realpathSync(tmp),tempRoot=fs.realpathSync(os.tmpdir());if(path.dirname(resolved)===tempRoot&&path.basename(resolved).startsWith('tihu-qa-'))fs.rmSync(resolved,{recursive:true,force:true})}catch{}},500)});

