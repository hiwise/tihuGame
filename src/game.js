function burst(x,y,z,color,count){
 for(let i=0;i<count;i++)sparks.push({x,y,z,vx:(rand(i+time*41)-.5)*3.2,vy:1+rand(i+13)*3.3,vz:(rand(i+77)-.5)*2,color,ttl:.46+i%4*.045})
}
function drawSparks(){
 for(const {x,y,z,color,ttl} of sparks){
  let d=.030+ttl*.078;
  poly([[x-d,y,z],[x,y+d*1.7,z],[x+d,y,z],[x,y-d*1.7,z]],color)
 }
}
function notify(msg){$('toast').textContent=msg;$('toast').hidden=false;toastUntil=time+1.8}
function tone(kind){
 if(muted)return;
 try{if(!audio)audio=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume().catch(()=>{});let now=audio.currentTime;
 for(const [i,f] of ({coin:[720,1050],pickup:[440,660,890],item:[240,400,640],crash:[155,68],count:[460],launch:[490,725,1040],pass:[380,680,970],apex:[525,790],hop:[190,310],trick:[410,540,740,950],win:[420,525,650,840],start:[350,520]}[kind]||[]).entries()){
  let o=audio.createOscillator(),g=audio.createGain(),t=now+i*.072;o.type=kind==='crash'?'triangle':'sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*.78,t+.14);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.075,t+.018);g.gain.exponentialRampToValueAtTime(.0001,t+.17);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.18)
 }}catch{}
}
function use(){
 if(mode!=='play'||!state.bag||state.race?.clock>0)return;
 let type=state.bag;state.bag=null;
 if(type==='shield')state.shield=true;
 if(type==='magnet')state.magnet=6;
 if(type==='boost')state.boost=4;
 notify(items[type].msg);tone('item');hud()
}
const roadKeys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyA','KeyD','KeyW','KeyS'];
const coarse=()=>matchMedia('(pointer:coarse)').matches;
function reset(racing=false){
 state={x:0,z:0,v:0,vx:0,coins:0,hp:3,bag:null,shield:false,magnet:0,boost:0,inv:0,pedal:0,t:0,action:0,push:0,pushCooldown:0,charge:35,combo:0,ttl:0,topCombo:0,tricks:0,shortcut:0,signals:0,surfaces:0,surface:0,race:racing?newRace():null,samples:[],nextSample:0};
 obstacles=track();if(racing)obstacles=raceTrack(obstacles);sparks=[];keys.clear();Wob=0;flash=0;camPose=null;toastUntil=0;$('toast').hidden=true;
}
function camera(dt){
 const s=state,x=s.x,z=s.z,mobile=W<=700, garage=mode==='garage', car=profile.vehicle==='car'&&!garage;
 originX=W*(garage&&!mobile?.74:.50);
 originY=H*(garage&&mobile?.23:car?.41:.48);
 orthographic=garage&&tab==='pilot'&&referenceView?Math.min(H*(mobile?.18:.268),W*(mobile?.29:.26)):0;
 const target=(x,y,z)=>worldPoint([x,y,z]);
 const poses=[
  [target(x*.86,3.15,z-6.4),target(x*.80,.88,z+8.8)],
  [target(x*.95,2.17,z-3.95),target(x*.84,.94,z+8)],
  [target(x+5.9,2.84,z-4.12),target(x,1.16,z+5.5)]
 ];
 let [a,b]=garage?(tab==='pilot'?[[0,1.07,3.60],[0,1.07,.03]]:[[3.33,profile.vehicle==='skate'?1.74:2.11,4.17],[0,profile.vehicle==='skate'?.23:profile.vehicle==='car'?.48:.83,0]]):car?[target(x+.027*Wob,1.32+Math.sin(z*1.08)*Math.min(.018,s.v*.00075),z+.46),target(x+Wob*.12,1.25,z+13)]:poses[cam];
 let f=Math.min(W*(mobile?1.02:.86),H*(garage?1.0:1.09));
 if(lobbyActive()&&!referenceView&&!mobile)f*=1.15;
 if(garage&&mobile)f=Math.min(W*.79,H*.47);
 if(garage&&tab!=='pilot'){
  a=mobile?[2.8,1.64,4.6]:[3.50,1.96,4.25];b=[profile.vehicle==='car'?.22:0,profile.vehicle==='skate'?1.03:.96,0];
  f*=mobile?.96:1.08;
 }
 if(car)f=Math.min(W*.92,H*1.34)*(1-clamp((s.v-23)/75,0,.24));
 if(!camPose)camPose=[a,b,f];else{let k=1-Math.exp(-dt*13);camPose=[camPose[0].map((v,i)=>lerp(v,a[i],k)),camPose[1].map((v,i)=>lerp(v,b[i],k)),lerp(camPose[2],f,k)]}
 [eye]=camPose;focal=camPose[2];const fw=unit(sub(camPose[1],eye)),rt=unit(cross([0,1,0],fw));basis=[rt,cross(fw,rt),fw]
}
function ghost(){
 if(!ghostEnabled)return;const g=profile.bests[profile.map+'-'+profile.vehicle]?.ghost,i=Math.floor(state.t/.35);
 if(!g||i>=g.length)return;
 const a=g[i],b=g[i+1]||a,k=(state.t/.35)%1,x=lerp(a[0],b[0],k),z=lerp(a[1],b[1],k);
 if(z<state.z+2||z>state.z+75)return;
 const c='#a8ecd8';for(let s of [-1,1])tube([x+s*.27,.07,z-.48],[x+s*.27,.08,z+.44],.031,.031,c,id,6);
 ball(x,.29,z,.33,.061,.38,c,id,10,5);ball(x,.94,z,.105,.106,.105,c,id,9,6);
}
function render(dt){
 camera(dt);objectLayer=true;if(mode==='garage'&&tab==='vehicle'){lobbyBackdrop();lobbySet()}else if(mode==='garage'&&tab==='map'){sky();routeStage()}else if(lobbyActive()&&!referenceView){lobbyBackdrop();lobbySet()}else{sky();ground();if(!lobbyActive())terrain();if(mode!=='garage')roadsideDetail()}
 if(mode!=='garage'){
  if(state.race)paintRivals();else ghost();for(const o of obstacles)if(!o.done&&o.z>state.z-12&&o.z<state.z+103)hazard(o);
  drawSparks()
 }
 if(mode==='garage'||!(state.inv>0&&Math.floor(time*15)%3===0))drawRider();
 finishObjects()
}
const jumpHeight=s=>s.action>0?(profile.vehicle==='bike'?1.32*Math.sin(Math.PI*s.action/.92):profile.vehicle==='skate'?1.13*Math.sin(Math.PI*s.action/.83):0):0;
function action(){
 if(mode!=='play'||state.action>0||state.v<3||state.race?.clock>0)return;
 const s=state,k=profile.vehicle;
 if(k==='car'){
  if(s.charge<64){notify('氮气不足 · 干净过弯可蓄能');return}
  s.charge-=64;s.action=2.05;notify('氮气冲刺！')
 }else if(k==='moto'){s.action=.92;notify('压弯中 · 保持转向')}
 else if(k==='skate'){s.action=.83;s.push=0;notify('豚跳 · 越过路锥')}
 else s.action=.92;
 tone('item');burst(s.x,.1,s.z-.55,'#d9e2be',8);
}
function trick(msg){
 const s=state;s.combo++;s.tricks++;s.topCombo=Math.max(s.topCombo,s.combo);s.ttl=10;
 const n=Math.min(12,s.combo*3);s.coins+=n;
 notify(msg+(s.combo>1?' ×'+s.combo:'')+' · 船票 +'+n);tone('trick');burst(s.x,.65+jumpHeight(s),s.z,'#ffc975',13)
}
function advance(dt){
 if(mode==='garage'){state.pedal+=dt*2.7;return}
 if(mode!=='play')return;
 const s=state,c=ride(),k=profile.vehicle,held=(...ks)=>ks.some(key=>keys.has(key)), steer=Number(held('ArrowRight','KeyD'))-Number(held('ArrowLeft','KeyA')), brake=held('ArrowDown','KeyS');
 const gas=held('ArrowUp','KeyW');if(countdown(s,dt,gas))return;
 let desired=brake?Math.max(4,c.base*.27):gas?c.max:c.base;
 if(s.surface>0&&profile.map==='jungle')desired*=.82;
 if(!brake){
  if(s.boost>0)desired=c.max+7;
  if(k==='car'&&s.action>0)desired=c.max+11;
  if(k==='moto'&&s.action>0&&Math.abs(steer))desired=Math.max(desired,c.max*.9);
  if(s.x<-5.40&&boardWidth(s.z)>1.5){desired+=4;s.shortcut+=s.v*dt}
 }
 if(s.race)desired=racingPace(s,dt,gas,brake,steer,desired);
 const prev=s.z;
 s.v=lerp(s.v,desired,1-Math.exp(-dt*(brake?5:c.acc)));
 let slip=s.surface>0?(profile.map==='alpine'?3.9:5.2):profile.map==='port'?7:profile.map==='jungle'?9:profile.map==='alpine'?8:13;if(k==='skate')slip*=.70;
 s.vx=lerp(s.vx,steer*(c.steer+s.v*.048),1-Math.exp(-dt*slip));
 if(k==='skate'&&s.action>0)s.vx*=1-Math.min(.12,dt*2);
 if(k==='skate'&&!s.action&&!s.pushCooldown&&!brake&&held('ArrowUp','KeyW')&&s.v>4){s.push=.62;s.pushCooldown=1.06}
 const unclamped=s.z+s.v*dt;s.z=Math.min(distGoal(),unclamped);
 const bend=(roadX(s.z+8)-2*roadX(s.z)+roadX(s.z-8))/64;
 const overspeed=Math.max(0,s.v-c.base*1.18), drift=-bend*overspeed*overspeed*dt*(s.race?1.40+s.race.overrun*1.23:profile.map==='port'?1.68:1.12);
 s.x=clamp(s.x+s.vx*dt+drift,-4.13-boardWidth(s.z),4.13+dockWidth(s.z));
 Wob=lerp(Wob,steer,1-Math.exp(-dt*11));s.t+=dt;s.pedal+=s.v*dt*1.12;
 const active=s.action>0;
 for(const n of ['action','boost','inv','magnet','ttl','push','pushCooldown','surface'])s[n]=Math.max(0,s[n]-dt);
 if(!s.ttl)s.combo=0;
 if((k==='bike'||k==='skate')&&active&&!s.action)burst(s.x,.04,s.z-.65,'#e2dab6',8);
 if(k==='moto'&&active&&!s.action&&Math.abs(steer)&&s.v>c.base&&!brake){s.boost=Math.max(s.boost,.73);trick('压弯出弯')}
 if(k==='car'&&!s.race&&s.inv===0&&!active){
  const curve=Math.abs(roadX(s.z+13)-2*roadX(s.z)+roadX(s.z-13));
  s.charge=clamp(s.charge+dt*(curve>.38&&Math.abs(s.x)<3.7?11:2.2),0,100)
 }
 for(const b of sparks){b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;b.vy-=8*dt;b.ttl-=dt}
 sparks=sparks.filter(b=>b.ttl>0&&b.y>=0);
 while(s.t>=s.nextSample){s.samples.push([+s.x.toFixed(2),+s.z.toFixed(1)]);s.nextSample+=.35}
 for(const o of obstacles){
  if(o.done||o.z<s.z-5)continue;if(o.z>s.z+7)break;
  const dz=o.z-s.z,dx=Math.abs(o.x-s.x);
  if(o.kind==='coin'){if((Math.abs(dz)<1.35&&dx<(k==='car'?.99:.76))||(s.magnet>0&&Math.hypot(dx,dz*.80)<4.8)){s.coins+=o.value||1;o.done=true;tone('coin')}continue}
  if(o.kind==='pickup'){if(Math.abs(dz)<1.30&&dx<.86){s.bag=o.type;o.done=true;tone('pickup');notify('捡到 '+items[o.type].name+' · '+(coarse()?'点击道具栏':'空格使用'))}continue}
  if(o.passed||o.z<prev-.80||dz>(k==='car'?1.29:.94)||dx>(o.kind==='barrier'||o.kind==='rail'||o.kind==='gate'?1.14:k==='car'?1.04:.87))continue;
  o.passed=true;
  if(o.kind==='puddle'||o.kind==='ice'){s.surfaces++;s.surface=o.kind==='ice'?1.25:.65;const side=Math.sign(s.vx)||1;if(o.kind==='ice')s.vx+=side*Math.min(3.5,s.v*.14);else{s.v*=.79;burst(s.x,.14,s.z,'#b3d3c5',15)}notify(o.kind==='ice'?'冰面打滑 · 轻刹稳方向':'压过积水 · 速度下降');continue}
  if(o.kind==='gate'&&gateOpen(o)){s.signals++;trick(o.x>5?'装卸区穿闸':'绿灯穿闸');continue}
  if((k==='bike'||k==='skate')&&o.kind==='cone'&&jumpHeight(s)>.78){trick(k==='skate'?'豚跳过锥':'兔跳过锥');continue}
  if(s.inv>0)continue;
  if(s.boost>0||(k==='car'&&active)){o.done=true;notify('氮气冲开路障');continue}
  if(s.shield){s.shield=false;s.inv=.67;o.done=true;notify('泡泡护盾挡住了撞击');tone('item');continue}
  s.hp--;s.inv=1.4;s.v*=.47;s.ttl=0;s.combo=0;s.charge=Math.max(0,s.charge-17);o.done=true;flash=.83;tone('crash');
  if(!s.hp){finish(false);return}notify('碰撞 · 耐久 −1')
 }
 if(s.race)updateRivals(s,dt,prev,unclamped);
 if(s.z>=distGoal())finish(true)
}
function skillText(){
 const s=state,k=profile.vehicle;
 if(k==='car')return '氮气 '+Math.floor(s.charge)+'%'+(s.action?' · 冲刺中':s.charge>=64?' · 可用':'');
 let target=obstacles.find(o=>!o.done&&!o.passed&&Math.abs(o.x-s.x)<.9&&o.z-s.z>1+s.v*.20&&o.z-s.z<1+s.v*.61&&((k==='bike'||k==='skate')&&o.kind==='cone'));
 return target&&!s.action?(coarse()?'现在':'Shift · 现在')+ride().action:s.combo?'技巧连招 ×'+s.combo+' · '+Math.ceil(s.ttl)+' 秒':(coarse()?'特技 · ':'Shift · ')+ride().action
}
function hud(){
 const s=state,k=profile.vehicle;$('speed').textContent=Math.round(s.v*3.6)+' km/h';if(k==='car')cockpitHud(s);else if(engine)updateEngine(890);
 $('coins').textContent=String(s.coins).padStart(2,'0');
 $('hearts').textContent='♥'.repeat(s.hp)+'♡'.repeat(3-s.hp);$('meter').textContent=Math.floor(s.z)+' / '+distGoal()+' m';$('fill').style.width=s.z/distGoal()*100+'%';
 $('item').textContent=s.bag?items[s.bag].name:'空口袋';
 $('hint').textContent=s.boost?'氮气 '+Math.ceil(s.boost)+' 秒':s.magnet?'磁铁 '+Math.ceil(s.magnet)+' 秒':s.shield?'护盾生效中':s.bag?'空格 / 点击使用':'拾取补给箱';
 $('use').classList.toggle('ready',!!s.bag);$('skill').textContent=skillText();raceHud(s)
}
function visibility(){
 const garage=mode==='garage',active=!garage;
 $('garage').hidden=!garage;$('progress').hidden=!active;$('dash').hidden=!active;$('pause').hidden=!active;
 $('cam').hidden=!active||profile.vehicle==='car';$('cockpit').hidden=!active||profile.vehicle!=='car';$('rain').hidden=!['port','jungle'].includes(profile.map)||garage;$('app').classList.toggle('car-run',active&&profile.vehicle==='car');if(!active)updateEngine(890);$('touch').hidden=mode!=='play';
 $('raceFx').hidden=garage||!state.race||mode!=='play';raceHud(state);
 $('modal').hidden=mode!=='pause'&&mode!=='win'&&mode!=='lost';
}
function start(racing=false){
 if(!profile.name.trim()){chooseTab('pilot');$('nameInput').focus();return}
 saluteStop();racing=Boolean(racing&&canRace());reset(racing);cam=0;mode='play';$('cam').textContent='◉ 追尾';$('routeLabel').textContent=map().n+' · '+(racing?'追逐赛':ride().n);
 $('again').blur();$('next').blur();save();visibility();hud();tone('start');if(!racing)notify(profile.name+'，本单发往'+map().n+'！')
}
function results(title,copy,stats,extra,grade,again){
 $('resultTitle').textContent=title;$('resultCopy').textContent=copy;$('resultExtra').textContent=extra;$('grade').textContent=grade;$('again').textContent=again;
 $('resultStats').replaceChildren(...stats.map(s=>{let e=document.createElement('span');e.textContent=s;return e}));visibility();$('again').focus()
}
function finish(win){
 if(state.race){raceFinish(win);return}
 mode=win?'win':'lost';keys.clear();$('toast').hidden=true;
 const s=state,key=profile.map+'-'+profile.vehicle,old=profile.bests[key],record=win&&(!old||s.t<old.time),grade=!win?'—':s.hp===3&&s.coins>=60?'S':s.hp>=2&&s.coins>=34?'A':'B',rewards=[];
 if(record)profile.bests[key]={time:s.t,ghost:s.samples,grade};
 const medals=profile.medals[profile.map]||=([]);
 const medal=(id,when)=>{if(win&&when&&!medals.includes(id))medals.push(id)};
 if(profile.map==='coast'){medal('route',s.shortcut>64);medal('skill',s.tricks>=3)}
 if(profile.map==='canyon'){medal('route',s.hp===3);medal('skill',s.coins>=100)}
 if(profile.map==='port'){medal('route',grade==='S');medal('skill',s.signals>=2)}
 if(profile.map==='jungle'||profile.map==='alpine'){medal('route',s.surfaces===0);medal('skill',grade==='S')}
 const unlock=(key,label)=>{if(!profile.unlocks[key]){profile.unlocks[key]=true;rewards.push(label)}};
 if(win){
  if(profile.map==='canyon'&&s.hp===3)unlock('sunset','夕阳护目镜');
  if(profile.map==='coast'&&s.shortcut>64)unlock('gold','金色纪念围巾');
  if(profile.map==='port'&&grade==='S')unlock('neon','霓虹紫车漆');
  save();tone('win')
 }
 const objective=profile.map==='coast'?'栈道挑战 · 在捷径骑行 64 米':profile.map==='canyon'?'峡谷挑战 · 无伤送达':profile.map==='jungle'?'雨林挑战 · 避开全部水坑':profile.map==='alpine'?'高山挑战 · 避开全部冰面':'霓虹挑战 · 获得 S 级';
 results(win?'送达成功':'派送中断',profile.name+' / '+map().n+' / '+ride().n,[Math.floor(s.z)+' 米',s.t.toFixed(1)+' 秒',s.coins+' 张船票',s.hp+'/3 耐久','连招 ×'+s.topCombo,'路线挑战 '+medals.length+'/2'],rewards.length?'解锁：'+rewards.join('、'):record?'个人新纪录 · 下次可追逐幽灵车':objective,win?grade+' 级':'未送达',win?'再跑一单 →':'重新出发 →')
}
function pause(){
 if(mode==='play'){mode='pause';keys.clear();$('toast').hidden=true;results('靠边歇会','信还在车上。准备好就继续送达。',[],'P / Esc 可继续','暂停','继续送信 →')}
 else if(mode==='pause'){mode='play';visibility();$('again').blur()}
}
function back(){
 mode='garage';reset();visibility();chooseTab('vehicle');$('next').focus()
}
function cameraNext(){
 if(mode!=='play'||profile.vehicle==='car')return;cam=(cam+1)%3;$('cam').textContent='◉ '+['追尾','近距','侧后'][cam]
}

