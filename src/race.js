/* Closed-course challenge; all opponents and timing run locally. */
const grid=[
 {name:'赤隼',color:'#ce6251',x:2.85,z:6.2,pace:42.2},
 {name:'苔影',color:'#76ae9f',x:-2.85,z:4.0,pace:40.1},
 {name:'琥珀',color:'#c49652',x:0,z:9.2,pace:38.3}
];
const sectors=[475,1015,1540];
const canRace=()=>profile.map==='jungle'&&profile.vehicle==='car';
const roadBend=z=>(roadX(z+8)-2*roadX(z)+roadX(z-8))/64;
function newRace(){
 return {clock:3.25,light:4,launch:0,rev:0,rivals:grid.map((a,i)=>({...a,i,v:0,target:a.x,decision:.4+i*.23,finish:null,behind:false,lastPass:-12})),
 rank:4,passes:0,splits:[],lastSplit:0,splitUntil:0,draft:0,edge:0,turn:0,clean:0,apexUntil:0,bump:0,spray:0,overrun:0}
}
function raceTrack(items){
 // Keep one predictable opening through each group, with extra room for side-by-side driving.
 return items.filter((o,i)=>o.kind==='puddle'||o.kind==='coin'&&i%4===1||
  o.kind==='cone'&&o.z>90&&i%3===0||o.kind==='barrier'&&i%9===0||
  o.kind==='pickup'&&Math.floor(o.z)%5===1);
}
function countdown(s,dt,gas){
 const r=s.race;if(!r||r.clock<=0)return false;
 r.rev=lerp(r.rev,gas?1:0,1-Math.exp(-dt*5.2));r.clock=Math.max(0,r.clock-dt);
 const now=Math.ceil(r.clock);
 if(now!==r.light){r.light=now;tone(now?'count':'launch')}
 if(!r.clock){
  const good=r.rev>.56&&r.rev<.983;
  r.launch=good?1.15:.22;s.v=good?12:gas?7:3;r.goUntil=time+.85;for(const a of r.rivals)a.v=9.3+a.i*.78;
  if(good){s.charge+=11;notify('漂亮起步 · 氮气 +11')}else if(r.rev>=.983)notify('起步空转 · 下次在倒计时最后一秒加速')
 }
 return true
}
function aiLane(s,r){
 const pool=[-3,0,3],all=s.race.rivals,ahead=r.z+Math.max(28,r.v*1.48);
 let best=r.target,cost=Infinity;
 for(const x of pool){
  let c=Math.abs(x-r.x)*.59+Math.abs(x)*.23;
  for(const o of obstacles){
   if(o.z<r.z+2)continue;if(o.z>ahead)break;
   if(o.done||['coin','pickup'].includes(o.kind))continue;
   if(Math.abs(o.x-x)<1.30)c+=(o.kind==='puddle'?6:14)*(1-.52*(o.z-r.z)/(ahead-r.z))
  }
  for(const b of all){
   if(b===r||b.finish!==null||Math.abs(b.x-x)>1.42)continue;
   const dz=b.z-r.z;
   if(dz>-5&&dz<26)c+=dz<10?12:6
  }
  const gap=s.z-r.z;if(Math.abs(s.x-x)<1.47&&gap>-4&&gap<19)c+=gap<8?8:3;
  if(x===r.target)c-=1.4;
  c+=rand(r.i*26+Math.floor(r.z/21)+x)*1.4;
  if(c<cost){cost=c;best=x}
 }
 return best
}
function updateRivals(s,dt,prev,unclamped){
 const r=s.race;if(!r)return;
 for(const a of r.rivals){
  if(a.finish!==null)continue;
  a.decision-=dt;
  if(a.decision<=0){a.target=aiLane(s,a);a.decision=.39+a.i*.075}
  const b=Math.abs(roadBend(a.z+19)),slow=clamp((b-.0027)*760,0,5.8);
  let pace=a.pace-slow+Math.sin(a.z*.023+a.i*3)*1.35;
  for(const o of obstacles){
   let dz=o.z-a.z;if(dz<0)continue;if(dz>18)break;
   if(o.done||['coin','pickup'].includes(o.kind)||Math.abs(o.x-a.x)>1.04)continue;
   if(dz<9)pace=Math.min(pace,o.kind==='puddle'?22:19)
  }
  for(const other of r.rivals)if(a!==other&&other.finish===null&&Math.abs(a.x-other.x)<1.3&&other.z-a.z>0&&other.z-a.z<6.2)pace=Math.min(pace,Math.max(12,other.v-3));
  if(Math.abs(a.x-s.x)<1.30&&s.z-a.z>0&&s.z-a.z<6.0)pace=Math.min(pace,Math.max(12,s.v-4));
  if(a.z>1335)pace+=2.2;
  a.v=lerp(a.v,pace,1-Math.exp(-dt*(pace<a.v?3.1:1.32)));
  const dx=clamp(a.target-a.x,-dt*(5+a.v*.038),dt*(5+a.v*.038));a.x+=dx;a.steer=dx/Math.max(dt,.001);
  const z=a.z;a.z+=a.v*dt;
  if(a.z>=distGoal())a.finish=s.t-dt+dt*(distGoal()-z)/(a.z-z);
  const gap=a.z-s.z,lateral=Math.abs(a.x-s.x);
  if(gap>2.35)a.behind=true;
  if(gap< -2.35&&a.behind){
   a.behind=false;
   if(s.t>.55&&s.t-a.lastPass>1.8){r.passes++;a.lastPass=s.t;s.charge=clamp(s.charge+9,0,100);tone('pass');notify('超越 '+a.name+' · 氮气 +9')}
  }
  if(a.finish===null&&Math.abs(gap)<2.05&&lateral<1.18&&s.v>a.v-3&&r.bump<=0){
   r.bump=.72;s.v*=.83;s.vx+=(s.x<a.x?-1:1)*1.85;flash=Math.max(flash,.35);tone('crash');notify('发生擦碰 · 稳住方向')
  }
 }
 r.rank=1+r.rivals.filter(a=>a.finish!==null||a.z>s.z).length;
 for(let i=r.splits.length;i<sectors.length&&s.z>=sectors[i];i++){
  const split=s.t-dt+dt*clamp((sectors[i]-prev)/(unclamped-prev||1),0,1);
  r.splits.push(split-r.lastSplit);r.lastSplit=split;r.splitUntil=time+2.55;
 }
}
function racingPace(s,dt,gas,brake,steer,desired){
 const r=s.race;
 r.bump=Math.max(0,r.bump-dt);r.launch=Math.max(0,r.launch-dt);
 const leader=r.rivals.find(a=>a.finish===null&&a.z-s.z>3.3&&a.z-s.z<25&&Math.abs(a.x-s.x)<1.13);
 r.draft=lerp(r.draft,leader&&s.v>20&&!brake?1:0,1-Math.exp(-dt*4.4));
 const curve=roadBend(s.z+10),turning=Math.abs(curve)>.0041,limit=43-clamp(Math.abs(curve)*1350,0,11);
 const inside=Math.sign(curve)*s.x;
 r.edge=lerp(r.edge,Math.abs(s.x)>3.67&&s.v>19?1:0,1-Math.exp(-dt*12));
 r.overrun=turning&&s.v>limit+3&&!brake?Math.min(1,(s.v-limit-3)/11):0;
 if(turning){
  r.turn+=dt;
  if(s.v>22&&s.v<limit+2.0&&inside>.28&&inside<3.30&&!s.inv&&r.bump<=0)r.clean+=dt;
 }else if(r.turn>0){
  if(r.turn>.45&&r.clean/r.turn>.56){s.charge=clamp(s.charge+11,0,100);r.apexUntil=time+1.25;tone('apex')}
  r.turn=0;r.clean=0
 }
 s.charge=clamp(s.charge+dt*(1.65+7.6*r.draft),0,100);
 if(!brake){desired+=r.draft*3.4+r.launch*3.1;desired-=r.edge*4.9+r.overrun*2.2}
 return desired
}
function paintRivals(){
 const s=state,r=s.race;if(!r)return;
 for(const a of r.rivals){
  const gap=a.z-s.z;if(gap<-.8||gap>88||a.z>distGoal()+14)continue;
  const yaw=clamp((a.steer||0)*.021,-.18,.18),T=spin(id,a.x,.008,a.z,yaw);
  shadow(a.x,a.z,.79,1.6,'#2c4143');carModel(T,a.color,gap>34);
  const red=a.v<25?'#ff896f':'#e35f54';
  for(const side of [-1,1])ball(side*.48,.515,-1.457,.111,.030,.022,red,T,8,5);
  if(a.v>19&&gap<48){
   for(let i=0;i<3;i++){
    const k=(time*2.4+i/3+a.i*.19)%1;
    for(const side of [-1,1]){const z=a.z-1.18-k*3.2,x=a.x+side*(.63+k*.27),h=.16+k*.13;
     poly([[x-.038,h,z],[x+.04,h+.018,z],[x+.19,h+.08,z-.64-k*.22],[x-.06,h-.05,z-.44]],i===0?'#89aaa1':'#62857d')
    }
   }
  }
 }
}
function raceHud(s){
 const r=s.race,node=$('racePanel'),count=$('raceCount');node.hidden=!r||mode!=='play';count.hidden=true;if(!r||mode!=='play')return;
 $('racePlace').textContent=r.rank+' / 4';$('raceTime').textContent=s.t.toFixed(2)+' 秒';$('raceBoost').textContent=s.action>0?'氮气冲刺':'氮气 '+Math.floor(s.charge)+'%';
 $('raceStatus').textContent=r.clock>0?(r.rev>=.983?'转速过高 · 松油再踩':r.rev>.56?'起步转速就绪':'最后半秒按住加速'):r.draft>.42?'跟车补氮 · '+Math.round(r.draft*100)+'%':r.edge>.38?'路肩减速':r.overrun>.16?'入弯过快 · 松油或刹车':time<r.apexUntil?'干净出弯 · 氮气 +11':time<r.splitUntil?'分段 '+r.splits.length+' · '+r.splits.at(-1).toFixed(2)+' 秒':r.passes+' 次超车';
 if(r.clock>0||time<(r.goUntil||0)){count.hidden=false;const text=r.clock>0?String(Math.min(3,Math.ceil(r.clock))):'出发！';if(count.textContent!==text)count.textContent=text}
 const app=$('app');app.style.setProperty('--road-rumble',(Math.sin(time*68)*r.edge*1.6).toFixed(2)+'px');app.style.setProperty('--speed-edge',String(clamp((s.v-33)/26,0,1)*.30))
}
function raceFinish(win){
 const s=state,r=s.race;mode=win?'win':'lost';keys.clear();$('toast').hidden=true;
 const order=win?1+r.rivals.filter(a=>a.finish!==null&&a.finish<=r.lastSplit).length:r.rank;
 const total=win?r.lastSplit:s.t,fast=r.splits.length?Math.min(...r.splits):null;
 const old=profile.raceBest,record=win&&(!old||total<old.time);
 if(record){profile.raceBest={time:total,place:order};save()}
 tone(win?'win':'crash');
 results(win?(order===1?'雨林冠军':'追逐赛完赛'):'退赛','翡翠雨林 / 赛车追逐赛',
 [win?'第 '+order+' 名':'未完赛',total.toFixed(2)+' 秒',fast===null?'无有效分段':'最快分段 '+fast.toFixed(2)+' 秒',r.passes+' 次超车'],
 (r.splits.length?'各分段：'+r.splits.map(x=>x.toFixed(2)+'s').join(' / ')+'。':'')+(record?'刷新追逐赛个人纪录。':''),
 win?'第 '+order+' / 4 名':'未完赛','再跑一场 →');
}
