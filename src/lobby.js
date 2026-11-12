const cue={at:-30,said:false,buffer:null,decoding:null};
const lobbyActive=()=>mode==='garage'&&tab==='pilot';
const ease=(a,b,t)=>{const x=clamp((t-a)/(b-a),0,1);return x*x*(3-2*x)};
function lobbyMotion(){
 const t=lobbyActive()&&!referenceView?time-cue.at:99;
 const hold=ease(.03,.35,t)*(1-ease(1.96,2.55,t));
 const salute=ease(.41,.89,t)*(1-ease(1.49,1.97,t));
 const voice=t>=.92&&t<1.50;
 return {t,hold,salute,mouth:voice?Math.max(0,Math.sin((t-.92)/.58*Math.PI))*(.70+.30*Math.cos((t-.92)*14)):0,voice}
}
function primeYes(){
 if(muted)return;
 try{
  if(!audio)audio=new (window.AudioContext||window.webkitAudioContext)();
  if(audio.state==='suspended')audio.resume().catch(()=>{});
  if(!cue.buffer&&!cue.decoding){
   const raw=Uint8Array.from(atob('__INLINE_YES_WAV__'),c=>c.charCodeAt(0));
   cue.decoding=audio.decodeAudioData(raw.buffer).then(b=>{cue.buffer=b},()=>{}).finally(()=>cue.decoding=null)
  }
 }catch{}
}
function speakYes(){
 if(muted||!audio||!cue.buffer)return;
 try{
  const src=audio.createBufferSource(),volume=audio.createGain();
  src.buffer=cue.buffer;src.playbackRate.value=profile.sex==='male'?.91:1.035;volume.gain.value=.64;
  src.connect(volume);volume.connect(audio.destination);src.start()
 }catch{}
}
function saluteStart(){
 if(!lobbyActive())return;
 clearReference();cue.from=previewAngle;cue.at=time;cue.said=false;primeYes()
}
function saluteStop(){cue.at=-30;$('yesCaption').hidden=true;$('app').classList.remove('saluting')}
function updateLobby(){
 const active=lobbyActive(),p=lobbyMotion(),yes=$('yesCaption');
 $('app').classList.toggle('pilot-lobby',mode==='garage');
 $('app').dataset.stage=mode==='garage'?tab:'race';
 if(mode==='garage')$('rain').hidden=tab!=='map'||!['port','jungle'].includes(profile.map);
 $('app').classList.toggle('saluting',active&&p.t>=0&&p.t<2.55);
 yes.hidden=!active||p.t<.90||p.t>1.93;
 if(!active||p.t<0||p.t>2.55)return;
 if(p.t<.56){const k=ease(0,.54,p.t),diff=Math.atan2(Math.sin(.26-cue.from),Math.cos(.26-cue.from));previewAngle=cue.from+diff*k}
 if(p.t>=.92&&!cue.said&&(muted||cue.buffer||p.t>=1.23)){cue.said=true;speakYes()}
}
function lobbyBackdrop(){
 let g=ctx.createLinearGradient(0,0,0,H);
 g.addColorStop(0,'#10171a');g.addColorStop(.52,'#222b2d');g.addColorStop(1,'#3f4039');
 ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 const x=originX,y=H*.34,r=Math.max(W,H)*.47;
 g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#ffd69c45');g.addColorStop(.38,'#a4ae8d24');g.addColorStop(1,'#17212500');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
}
function lobbySet(){
 if(referenceView)return;
 for(let z=-12;z<10;z+=2){
  rect(-27,27,z,z+2,-.034,z%4===0?'#323737':'#353937',4000,7);
  if(z<3)for(const x of [-2.5,2.5])rect(x,x+.028,z+.05,z+1.95,-.023,'#6d6652',3000)
 }
 for(const x of [-3.1,3.1])rect(x,x+.06,-11,10,-.021,'#9c8254',3000);
 if(tab==='vehicle'){rect(-1.95,1.95,-1.83,1.83,.0,'#454a44',2000,7);for(const x of [-1.93,1.88])rect(x,x+.046,-1.83,1.83,.006,'#b78b55',1000)}
 box(0,3.55,-7.9,22,7.1,.15,'#303737');
 box(0,3.52,-7.72,9.65,7.12,.17,'#39413e');
 for(let x=-10;x<11;x+=2.5){
  box(x,3.38,-7.54,.195,6.8,.28,'#4b5350');
  box(x+.14,3.38,-7.36,.030,6.8,.023,'#66736b');
  if(Math.abs(x)>2.2)box(x+.92,1.1,-7.52,1.60,.85,.06,'#404641');
 }
 for(const x of [-3.8,3.8]){
  box(x,3.31,-6.82,.29,6.65,.39,'#444c48');
  box(x,3.20,-6.59,.059,2.6,.022,'#e4b36f');
  box(x,1.11,-5.99,1.13,1.54,.75,'#4b514a');
  box(x,1.82,-5.57,1.1,.082,.10,'#c69859')
 }
 box(0,5.81,-7.27,9.8,.34,.38,'#4c5650');
 box(0,5.59,-7.03,3.5,.081,.08,'#ffcd85');
 for(const x of [-2.5,2.5])box(x,5.32,-7.03,1.7,.044,.076,'#8ba8a2');
}
function lobbyPodium(){
 tube([0,-.035,0],[0,.022,0],.83,.83,'#252e2d',id,54);
 tube([0,.022,0],[0,.038,0],.831,.831,'#cd9d61',id,54);
 tube([0,.038,0],[0,.057,0],.83,.79,'#5c6158',id,54);
 for(let i=0;i<16;i++){
  const a=i*TAU/16;
  poly([[.766,.060,a],[.80,.060,a],[.80,.060,a+.063],[.766,.060,a+.063]].map(([r,y,k])=>[r*Math.cos(k),y,r*Math.sin(k)]),i%4===0?'#ffe0a0':'#857b5e')
 }
}
function routeStage(){
 const m=profile.map,night=m==='port',wet=night||m==='jungle',snow=m==='alpine';
 for(let z=-48;z<12;z+=4){
  const edge=m==='coast'?-7.5:-45;
  rect(-46,38,z,z+4,-.16,night?'#36454f':snow?'#9fbbc4':m==='coast'?'#649e99':m==='canyon'?'#a87c69':'#516f61',8000,m==='coast'?5:snow?3:4);
  rect(edge,39,z,z+4,-.065,snow?'#b6ccd0':m==='canyon'?'#aa836b':wet?'#4c6459':'#acb88f',7000,snow?3:4);
  rect(-4.1,4.2,z,z+4,0,night?'#3c4a57':snow?'#455966':m==='canyon'?'#685b59':wet?'#3e514b':'#536a68',5000,wet?2:1);
  for(const x of [-3.97,4.04])rect(x,x+.082,z,z+4,.009,night?'#70adad':'#dec69a',1000);
  if(Math.abs(z)%8===4)rect(-.043,.043,z+.3,z+3.45,.009,night?'#9eb0b8':'#d9d4ac',1000);
 }
 // Framing props are placed behind the preview subject from the selection camera.
 if(m==='coast'){
  lighthouse(-7.8,-14.5);
  palm(3.35,-10,1.35,1.5);palm(5.9,-19,1.02,.9);palm(-4.6,-23,1.15,2.8);
  for(let z=-34;z<-5;z+=4){box(-5.2,.35,z,.10,.72,.11,'#ddd2ad');box(-5.2,.49,z+.9,.08,.073,3.99,'#c6b184')}
 }else if(m==='canyon'){
  rock(-7.2,-11,3.25);rock(6.3,-10,3.5);rock(7.7,-19,4.8);rock(-10.6,-26,5.15);rock(1.8,-32,4);
  for(let z=-28;z<-7;z+=6){routePost(-4.4,z);routePost(4.55,z)}
 }else if(m==='port'){
  container(-5.9,-9,1.35,'#536b77');container(5.4,-12,1.5,'#a37878');container(-9.2,-18,1.6,'#716984');berthCrane(4.5,-21,1.45);
  lamp(-4.7,-7);lamp(4.7,-16);lamp(-5,-25);
 }else if(m==='jungle'){
  canopyTree(-5.8,-8,1.02,4);canopyTree(5.3,-12,.93,12);canopyTree(-5,-18,1.27,29);canopyTree(6.2,-23,1.08,55);canopyTree(-12,-24,1.32,63,false);
  fern(-4.6,-5,.98,3);fern(4.5,-7,1.16,9);fern(4.7,-16,1.32,10);
 }else{
  mountain(-15,-24,9,5);mountain(10,-24,9,2);mountain(-4,-39,11,4);
  pine(-5.0,-8,1,1);pine(5.3,-10,1.1,4);pine(-6.3,-17,1.1,7);pine(7.1,-20,.93,19);
  for(let z=-26;z<-6;z+=5){routePost(-4.39,z,false,true);routePost(4.45,z,false,true)}
 }
}
