const svgNS='http://www.w3.org/2000/svg';
function dialNode(parent,tag,a,text){
 const n=document.createElementNS(svgNS,tag);for(const [k,v] of Object.entries(a))n.setAttribute(k,v);if(text!=null)n.textContent=text;parent.append(n);return n
}
const dialXY=(x,y,r,a)=>[x+Math.sin(a*Math.PI/180)*r,y-Math.cos(a*Math.PI/180)*r];
function makeDial(id,x,y,limit,major,label){
 const g=$('dashDials'),a=-125,b=125,r=63;
 dialNode(g,'circle',{cx:x,cy:y,r:r+4,fill:'url(#dashMetal)'});
 dialNode(g,'circle',{cx:x,cy:y,r:r,fill:'url(#dialFace)',stroke:'#0b1218','stroke-width':3});
 for(let i=0;i<=major*5;i++){
  let t=i/(major*5),ang=lerp(a,b,t),long=i%5===0,red=id==='rpmNeedle'&&t>=.80,c=red?'#e37861':long?'#dcdfd7':'#82969a';
  const [x1,y1]=dialXY(x,y,57,ang),[x2,y2]=dialXY(x,y,long?48:53,ang);
  dialNode(g,'line',{x1,y1,x2,y2,stroke:c,'stroke-width':long?2:1});
  if(long){const [xx,yy]=dialXY(x,y,39,ang);dialNode(g,'text',{x:xx,y:yy+3,fill:c,'font-size':9},Math.round(t*limit))}
 }
 dialNode(g,'text',{x,y:y+32,fill:'#94acab','font-size':8,'letter-spacing':'.45'},label);
 const needle=dialNode(g,'g',{id});
 dialNode(needle,'path',{d:'M'+(x-2)+' '+(y+9)+' L'+x+' '+(y-49)+' L'+(x+2)+' '+(y+9)+' Z',fill:'#f08465'});
 dialNode(g,'circle',{cx:x,cy:y,r:5,fill:'#6b858b',stroke:'#14212a','stroke-width':2});
}
makeDial('speedNeedle',472,143,240,6,'km/h');
makeDial('rpmNeedle',728,143,8,8,'×1000 RPM');
for(let i=0;i<8;i++)dialNode($('shiftLights'),'rect',{x:562+i*10.4,y:83,width:7,height:4,rx:1.5,id:'shift'+i,fill:'#293b40'});
const gearSteps=[0,9,16,23,31,39,56];
function carTelemetry(s){
 if(s.v<.85)return {speed:Math.round(s.v*3.6),gear:'N',rpm:Math.round(890+(s.race?.rev||0)*6220)};
 let gear=1;while(gear<6&&s.v>=gearSteps[gear])gear++;
 const t=clamp((s.v-gearSteps[gear-1])/(gearSteps[gear]-gearSteps[gear-1]),0,1);
 return {speed:Math.round(s.v*3.6),gear,rpm:Math.round((gear===1?1100:3800)+t*(gear===1?6200:3750))}
}
let engine=null;
function cockpitHud(s){
 const {speed,gear,rpm}=carTelemetry(s),rpmFrac=rpm/8000, rain=profile.map==='port'||profile.map==='jungle';
 $('dashSpeed').textContent=speed+' km/h';$('gearDisplay').textContent=gear;
 $('speedNeedle').setAttribute('transform','rotate('+lerp(-125,125,clamp(speed/240,0,1))+' 472 143)');
 $('rpmNeedle').setAttribute('transform','rotate('+lerp(-125,125,clamp(rpmFrac,0,1))+' 728 143)');
 $('revBar').setAttribute('width',String(s.charge*.68));
 $('steering').setAttribute('transform','rotate('+Wob*42+' 600 268)');
 $('wiperGlass').toggleAttribute('hidden',!rain);
 if(rain)$('wiper').setAttribute('transform','rotate('+((.5-.5*Math.cos(state.t*4.9))*64)+' 609 514)');
 for(let i=0;i<8;i++)$('shift'+i).setAttribute('fill',rpmFrac>(i+1)/8?(i>5?'#ed7d61':'#7ecbb4'):'#293b40');
 updateEngine(rpm)
}
function updateEngine(rpm){
 if(!audio||audio.state!=='running')return;
 try{
  if(!engine&&mode==='play'&&profile.vehicle==='car'&&!muted){
   const osc=audio.createOscillator(),filter=audio.createBiquadFilter(),gain=audio.createGain();
   osc.type='sawtooth';filter.type='lowpass';filter.Q.value=.9;gain.gain.value=0;osc.connect(filter);filter.connect(gain);gain.connect(audio.destination);osc.start();engine={osc,filter,gain};
  }
  if(!engine)return;
  const t=audio.currentTime,active=mode==='play'&&profile.vehicle==='car'&&!muted, throttle=keys.has('ArrowUp')||keys.has('KeyW')||state.action>0;
  engine.osc.frequency.setTargetAtTime(24+rpm*.017,t,.10);engine.filter.frequency.setTargetAtTime(88+rpm*.068,t,.12);engine.gain.gain.setTargetAtTime(active?(throttle?.024:.011):0,t,.09)
 }catch{}
}
