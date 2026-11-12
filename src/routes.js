function palm(x,z,s,angle){
 const T=spin(p=>[x+p[0]*s,p[1]*s,z+p[2]*s],0,0,0,angle);
 tube([0,0,0],[.08,1.25,0],.17,.13,'#a18258',T,7);tube([.08,1.25,0],[.26,2.65,0],.13,.08,'#bc9c68',T,7);
 for(let i=0;i<7;i++){let a=i*TAU/7,L=1.22+rand(i)*.47,u=Math.cos(a),v=Math.sin(a),P=(t,y,w)=>T([.26+u*t-v*w,y,v*t+u*w]);
  const p=P(0,2.59,0),q=P(L*.51,2.96,0),r=P(L,2.35,0);
  poly([p,P(L*.45,2.73,.24),r,q],i%2?'#438d62':'#5a9a61');poly([p,q,r,P(L*.47,2.74,-.23)],i%2?'#79ad69':'#70ae70')
 }
 ball(.26,2.53,0,.15,.13,.15,'#725d41',T,7,4)
}
function lighthouse(x,z){
 let T=p=>[p[0]+x,p[1],p[2]+z];box(0,.11,0,4,.35,4,'#b2a47e',T);tube([0,.27,0],[0,.77,0],1.61,1.43,'#5c8c82',T,12);
 for(let i=0;i<6;i++)tube([0,.77+i*.69,0],[0,.77+(i+1)*.69,0],1.17-i*.077,1.17-(i+1)*.077,i%2?'#de694f':'#fbebc4',T,12);
 tube([0,4.91,0],[0,5.1,0],.94,.94,'#2b555a',T,12);tube([0,5.09,0],[0,5.81,0],.61,.61,'#ffdd86',T,10);
 for(let i=0;i<8;i++){let a=i*TAU/8;let xx=Math.cos(a)*.61,zz=Math.sin(a)*.61;tube([xx,5.10,zz],[xx,5.85,zz],.044,.044,'#355d60',T,5)}
 tube([0,5.78,0],[0,6.58,0],.93,.028,'#d6634c',T,12);ball(0,6.61,0,.11,.11,.11,'#efb65c',T,8,4);box(0,1.08,-1.125,.50,1.27,.07,'#2e575b',T);
}
function finishGate(){
 for(let s of [-1,1]){box(s*5.22,1.65,distGoal(),.25,3.4,.30,'#22565a');box(s*5.22,.26,distGoal(),.42,.52,.45,'#ff895e')}
 box(0,3.35,distGoal(),10.7,.58,.30,'#23575a');
 for(let i=0;i<18;i++)for(let j=0;j<2;j++)box(-4.85+i*.57,3.21+j*.28,distGoal()-.167,.55,.26,.027,(i+j)%2?'#27595c':'#fdf0c8')
}
function prop(o){
 const {x,z,kind}=o,p=palette;
 if(kind==='coin'){
  let y=.80+Math.sin(time*4+z)*.095,T=spin(id,x,y,z,time*3+z*.12);
  tube([0,0,-.036],[0,0,.036],.224,.224,'#ffb94c',T,12);
  tube([0,0,-.042],[0,0,.042],.169,.169,'#ffe48b',T,12);
  box(0,0,0,.078,.227,.093,'#f0a437',T);return
 }
 if(kind==='pickup'){
  let y=.82+Math.sin(time*4+z)*.11,T=spin(id,x,y,z,time*1.5+z*.09);
  shadow(x,z,.48,.46);box(0,0,0,.60,.60,.60,items[o.type].color,T);
  for(let s of [-1,1]){box(0,0,s*.307,.35,.085,.022,p.cream,T);box(0,0,s*.308,.088,.35,.023,p.cream,T)}
  box(0,.309,0,.35,.025,.094,p.cream,T);box(0,.31,0,.095,.025,.35,p.cream,T);
  for(let j=0;j<3;j++){let a=time*2+j*TAU/3;ball(x+Math.cos(a)*.56,y+Math.sin(a*2)*.23,z+Math.sin(a)*.56,.048,.048,.048,'#fff5cc',id,6,4)}return
 }
 shadow(x,z,kind==='barrier'?.95:.71,.63);
 const T=q=>[q[0]+x,q[1],q[2]+z];
 if(kind==='cone'){
  for(let s of [-1,1]){let U=q=>T([q[0]+s*.34,q[1],q[2]+s*.16]);box(0,.058,0,.48,.11,.48,'#324d4e',U);tube([0,.11,0],[0,.38,0],.20,.135,'#ed7044',U);tube([0,.38,0],[0,.52,0],.135,.098,'#f8e4bc',U);tube([0,.52,0],[0,.80,0],.098,.024,'#ed7044',U)}
 }else if(kind==='crate'){
  box(0,.40,0,1.20,.80,.88,'#bd8252',T);
  for(let s of [-1,1]){box(s*.48,.40,-.455,.10,.80,.04,'#e7ae70',T);box(0,s*.31+.40,-.46,1.20,.098,.046,'#e7ae70',T)}
  poly([[-.46,.17,-.49],[-.34,.11,-.49],[.47,.64,-.49],[.34,.72,-.49]].map(T),'#edb97c');
 }else{
  for(let s of [-1,1]){box(s*.65,.10,0,.22,.20,.62,'#355453',T);box(s*.65,.43,0,.12,.79,.15,'#e7b875',T)}
  box(0,.68,0,1.65,.38,.16,'#f0d4a7',T);
  for(let i=0;i<4;i++){let a=-.82+i*.40;poly([[a,.50,-.086],[a+.17,.50,-.086],[a+.39,.87,-.086],[a+.22,.87,-.086]].map(T),'#e66d4b')}
 }
}
function sky(){
 if(mode==='garage'&&tab==='pilot'&&referenceView){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#dfdcd1');g.addColorStop(1,'#b9b9b0');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);return}
 const horizon=clamp(originY+focal*basis[2][1]/Math.max(.3,basis[1][1]),H*.07,H*.8), m=map(), night=profile.map==='port', jungle=profile.map==='jungle', alpine=profile.map==='alpine';
 let g=ctx.createLinearGradient(0,0,0,horizon+H*.09);m.sky.forEach((c,i)=>g.addColorStop(i/2,c));ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 const r=Math.min(W,H)*(night?.04:.064),sx=W*.78,sy=Math.max(r,horizon-H*.15);
 g=ctx.createRadialGradient(sx,sy,0,sx,sy,r*2.8);g.addColorStop(0,night?'#c2dbfc73':'#ffe4ab9e');g.addColorStop(1,'#ffe4ab00');ctx.fillStyle=g;ctx.fillRect(sx-r*3,sy-r*3,r*6,r*6);
 ctx.fillStyle=night?'#cbdafa':jungle?'#b9cba4':'#fff0bf';ctx.beginPath();ctx.arc(sx,sy,r,0,TAU);ctx.fill();
 for(let j=0;j<2;j++){
  ctx.fillStyle=(night?['#293952','#243349']:profile.map==='canyon'?['#bb806d','#a56864']:jungle?['#719485','#557b6f']:alpine?['#a3bccc','#6d98ae']:['#7eb3ad','#589596'])[j];ctx.beginPath();ctx.moveTo(0,horizon+20);
  for(let i=0;i<=90;i++){let x=i/90,u=x+basis[2][0]*.16, hill=.018+Math.max(0,Math.sin(u*15+j)+.42*Math.sin(u*36+4))* (profile.map==='canyon'||alpine?.135:jungle?.103:.054);ctx.lineTo(x*W,horizon-hill*H*(1-j*.36))}
  ctx.lineTo(W,horizon+20);ctx.fill();
 }
 ctx.fillStyle=night?'#334b5b':profile.map==='canyon'?'#ad7967':jungle?'#718b79':alpine?'#9bb7c3':'#80b8b1';ctx.fillRect(0,horizon+18,W,H);
 if(night||jungle){for(let i=0;i<(jungle?62:95);i++){let x=((rand(i)*W+time*190)%W),y=(rand(i+811)*H+time*(240+i%5*38))%H;ctx.strokeStyle=i%7?'#b9d3ed30':'#e0ebff67';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-8,y+16);ctx.stroke()}}
}
const shortcuts={a:288,b:438};
function boardWidth(z){return profile.map==='coast'?3.1*clamp(Math.min((z-shortcuts.a)/22,(shortcuts.b-z)/22),0,1):0}
const dock={a:346,b:474};
function dockWidth(z){return profile.map==='port'?2.9*clamp(Math.min((z-dock.a)/18,(dock.b-z)/18),0,1):0}
function ground(){
 const night=profile.map==='port', canyon=profile.map==='canyon', coast=profile.map==='coast',jungle=profile.map==='jungle',alpine=profile.map==='alpine';
 if(mode==='garage'){
  for(let q=-9;q<16;q+=2){rect(-45,45,q,q+2,-.034,q%4===1?'#77978e':'#809f94',4000,7)}
  for(let k=-4;k<=4;k++)rect(k*1.4,k*1.4+.025,-8,9,-.020,'#9cb7a0',3000);
  rect(-2.2,2.2,-1.95,1.95,-.013,'#658a7f',2000,7);
  for(const x of [-2.2,2.18])rect(x,x+.023,-1.96,1.96,-.011,'#c8d7b6',1000);
  flush();return
 }
 const first=Math.floor((state.z-20)/4)*4;
 for(let z=first;z<state.z+140;z+=4){
  let q=z/4, b=z+4, edge=boardWidth((z+b)/2), dockEdge=dockWidth((z+b)/2), a=night?'#384959':canyon?'#655457':jungle?'#394b48':alpine?'#425461':'#50696a';
  rect(-112,116,z,b,-.21,night?'#344450':canyon?'#b18067':jungle?'#48695a':alpine?'#a8bec6':'#66a9a6',8000,coast?5:alpine?3:4);
  rect(-8.4,73,z,b,-.125,night?'#4d5362':canyon?'#c09171':jungle?'#5c7459':alpine?'#c2d3d7':'#b7c48f',7000,alpine?3:4);
  if(coast)rect(-8.75,-4.7,z,b,-.073,'#d6c39b',6000,4);
  const forestCross=jungle&&z>=476&&z<541, bridge=canyon&&z>=524&&z<600;
  if(forestCross)rect(-20,17,z,b,-.102,q%2?'#739e91':'#6b998c',6000,5);
  if(bridge){
   poly([[-4.99,-.17,z],[-4.99,.0,z],[-4.99,.0,b],[-4.99,-.17,b]],'#684a43');
   poly([[4.99,-.17,z],[4.99,.0,z],[4.99,.0,b],[4.99,-.17,b]],'#684a43');
  }
  rect(-5,5,z,b,0,bridge?(q%2?'#9a7662':'#886756'):q%2?a:night?'#394b5b':canyon?'#675657':forestCross?'#566961':jungle?'#3e514d':alpine?'#495965':'#526b6b',5000,bridge?6:night||jungle?2:1);
  if(bridge)for(let t=0;t<4;t++)rect(-4.75,4.75,z+t+.04,z+t+.085,.011,'#74584f',1000);
  if(edge){
   rect(-5-edge,-4.83,z,b,.003,q%2?'#92764c':'#a68458',4500,6);
   rect(-5-edge,-4.95-edge,z,b,.008,'#f5d88e',4000);
  }
  if(dockEdge){
   rect(4.86,5+dockEdge,z,b,.004,q%2?'#594966':'#574761',4500,2);
   rect(4.95+dockEdge,5.03+dockEdge,z,b,.011,'#bd84cc',1000);
  }
  for(const sign of [-1,1]){
   const x=sign*4.91;rect(x-.10,x+.10,z,b,.009,night?(sign>0?'#b980bd':'#52b3bf'):q%2?'#f0d8a8':'#dc8665',1000);
   if(q%2===0){let d=sign*1.55;rect(d-.043,d+.043,z+.22,b-.05,.011,night?'#9aacbc':'#ddd9b8',1000)}
  }
  if(jungle||alpine){for(const sign of [-1,1]){const edge=sign*(5.21+rand(q+sign)*.27);rect(edge-.22,edge+.22,z,b,-.014,alpine?'#d1dedf':'#617d5c',1800)}}
  if((night||jungle)&&q%3===0){rect(2.1,4.7,z+.25,z+.46,.012,jungle?'#4c625b':'#655a78',1000);rect(-4.6,-2.7,z+.34,z+.45,.012,jungle?'#567367':'#527481',1000)}
  if(coast){let x=-11-rand(q+52)*40;rect(x-2,x+4,z+1,z+1.06,-.15,'#91c9bc',7500)}
 }
 for(let i=0;i<16;i++)for(let j=0;j<2;j++)rect(-4.96+i*.62,-4.34+i*.62,distGoal()+j*.44,distGoal()+(j+1)*.44,.018,(i+j)%2?'#263f47':'#fff0d0',1000);
 flush()
}
function terrain(){
 if(mode==='garage'){
  if(profile.map==='coast'){lighthouse(5,19);palm(-4,5,1.15,.1);palm(4,7,1.2,1.7)}
  else if(profile.map==='canyon'){rock(-6,9,3);rock(6,11,4)}
  else if(profile.map==='jungle'){canopyTree(-6,7,.92,4);canopyTree(6,12,1.12,12);fern(3,3,1.3,3);fern(-3,5,1.1,9)}
  else if(profile.map==='alpine'){mountain(13,24,9,2);mountain(-16,29,11,5);pine(-5,8,1,1);pine(6,12,1.2,4)}
  else{container(-5,8,1.4,'#5e688a');container(5,9,1.3,'#a97184');lamp(4,6)}
  return
 }
 if(profile.map==='jungle'||profile.map==='alpine'){biomeTerrain();if(state.z>distGoal()-100)finishGate();return}
 let first=Math.floor((state.z-15)/12)*12;
 for(let z=first;z<state.z+91;z+=12){
  const q=z/12,u=rand(q+44),x=6.8+u*4;
  if(profile.map==='coast'){
   palm(x,z+1,.75+rand(q+81)*.75,u*TAU);
   if(!boardWidth(z))for(let d of [0,6]){box(-6.7,.33,z+d,.12,.69,.15,'#ddcc9e');box(-6.7,.51,z+d+2.96,.076,.068,5.8,'#c3a674')}
  }else if(profile.map==='canyon'){
   if(z>=516&&z<600){for(const s of [-1,1]){box(s*5.07,.49,z+5.9,.16,.14,11.7,'#c49b74');for(let d of [0,4,8])box(s*5.08,.29,z+d,.19,.63,.19,'#9a7158')}}else{rock(-x,z+2,1.7+u*1.6);rock(x+1.5,z+7,2.1+u*2.5);}
   if(q%4===0)box(5.95,.53,z,.29,1.15,.28,'#edc68c')
  }else{
   let a=['#926270','#406976','#5d6585','#b07e68'];container((q%2?-1:1)*(x+1.5),z,1+u*.52,a[Math.abs(q)%4]);lamp(-5.8,z+5)
  }
 }
 if(profile.map==='coast'&&state.z<100)lighthouse(-13,31);
 if(state.z>distGoal()-100){finishGate();if(profile.map==='coast')lighthouse(-13,distGoal()+12);else if(profile.map==='port')container(-8,distGoal()+11,1.7,'#94748f')}
}
function rock(x,z,s){
 const T=p=>[x+p[0],p[1],z+p[2]];ball(0,.86*s,0,s*.73,s,s*.94,'#aa695b',T,7,4);ball(s*.38,.40*s,.44*s,s*.60,s*.53,s*.64,'#ca8c70',T,8,5)
}
function container(x,z,s,c){
 box(x,.8*s,z,1.9*s,1.6*s,4.3*s,c);
 for(let d of [-1,1])for(let i=-3;i<=3;i++)box(x+d*.96*s,.8*s,z+i*.53*s,.045*s,1.48*s,.074*s,'#657986');
 for(let d of [-1,1])box(x+d*.64*s,.80*s,z-2.16*s,.05*s,1.45*s,.045*s,'#9c9aa2');
}
function lamp(x,z){box(x,1.31,z,.12,2.65,.12,'#59717d');box(x+.27,2.62,z,.65,.105,.21,'#647d8a');box(x+.49,2.562,z,.18,.038,.17,'#a3f4ed')}
const lane=[-3.09,0,3.09],types=['shield','magnet','boost'];
function track(){
 const rows=[], put=(kind,l,z,extra={})=>rows.push({kind,x:lane[l],z,...extra});
 for(let j=0;j<5;j++)put('coin',1,17+j*2.4);
 put('pickup',2,35,{type:'shield'});put('cone',1,52);put('crate',2,52);for(let j=0;j<4;j++)put('coin',0,48+j*2.3);
 for(let i=0,z=84;z<distGoal()-37;i++,z+=Math.max(30,39-i*.21)){
  let clear=Math.floor(rand(i+98+map().base*53)*3);
  for(let l=0;l<3;l++)if(l!==clear&&(i%5!==0||l===(clear+1)%3)){
   let k=i%4===1&&l===(clear+1)%3?(profile.map==='canyon'?'fall':profile.map==='port'?'gate':profile.map==='jungle'?'puddle':profile.map==='alpine'?'ice':'rail'):['cone','crate','barrier'][Math.floor(rand(i*9+l+37)*3)];
   if(i%7===4&&l===(clear+1)%3)k='rail';
   put(k,l,z,{phase:i*.62});
  }
  for(let j=0;j<4;j++)put('coin',clear,z-4+j*2.3);
  if(i%3===1)put('pickup',clear,z+12,{type:types[i%types.length===1?Math.floor(rand(i+106)*3):0]});
 }
 if(profile.map==='coast')for(let z=308;z<=415;z+=8)rows.push({kind:'coin',x:-6.38,z,bonus:true});
 if(profile.map==='port'){
  for(let z=371;z<=455;z+=5)rows.push({kind:'coin',x:6.21,z,bonus:true,value:3});
  for(const z of [394,437])rows.push({kind:'gate',x:6.23,z,phase:z*.08});
 }
 return rows.sort((a,b)=>a.z-b.z)
}
function gateOpen(o){return (Math.floor(state.t*1.13+o.phase)%3)===1}
function hazard(o){
 if(o.kind==='puddle'||o.kind==='ice'){surfaceHazard(o);return}
 if(o.kind==='gate'||o.kind==='rail'){
  const open=o.kind==='gate'&&gateOpen(o),c=open?'#74e7b0':'#ee7372', y=open?2.39:1.29;
  for(const s of [-1,1]){box(o.x+s*1.04,.96,o.z,.14,1.94,.18,'#778492');ball(o.x+s*1.04,1.98,o.z,.113,.108,.113,c,id,9,5)}
  box(o.x,y,o.z,2.12,.20,.23,o.kind==='rail'?'#d6af74':c);return
 }
 if(o.kind==='fall'){
  const gap=o.z-state.z,y=gap>27?.16:Math.max(.38,(gap-5)*.13);
  shadow(o.x,o.z,.78,.76,'#745754');ball(o.x,y,o.z,.63,.55,.55,'#a56855',id,9,5);
  if(gap>5){rect(o.x-.58,o.x+.58,o.z-1.7,o.z-1.49,.028,'#f2ac58');rect(o.x-.29,o.x+.29,o.z-1.4,o.z-1.20,.03,'#f2ac58')}
  return
 }
 prop(o)
}
function canopyTree(x,z,s,seed,detail=true){
 const T=spin(id,x,0,z,rand(seed+10)*TAU), h=s*(5+rand(seed)*3),r=s*(.22+rand(seed+4)*.16), bend=(rand(seed+1)-.5)*s;
 tube([0,-.26,0],[bend*.42,h*.50,.12],r*1.19,r*.79,'#524b3c',T,8);
 tube([bend*.42,h*.50,.12],[bend,h,.03],r*.80,r*.36,'#615746',T,8);
 if(detail)for(let i=0;i<3;i++){
  const a=i*TAU/3; tube([0,h*.20,0],[Math.cos(a)*r*3.3,.017,Math.sin(a)*r*3.3],r*.49,r*.018,'#575242',T,6);
  const [a2,b2]=[Math.cos(a)*s*1.5,Math.sin(a)*s*1.47];
  tube([bend,h*.64,0],[a2,h*.88,b2],r*.50,r*.13,'#514839',T,6)
 }
 const colors=['#25483f','#345849','#426e51','#517d56','#315d47'];
 for(let i=0;i<(detail?5:3);i++){
  const a=i*2.39+seed, k=(i%3)*.65, y=h+(rand(seed+i+10)-.45)*s*1.8;
  ball(bend+Math.cos(a)*k*s,y,Math.sin(a)*k*s,s*(1.43+rand(seed+i)*.76),s*(.83+rand(seed+i+31)*.61),s*1.62,colors[(i+Math.abs(seed))%colors.length],T,detail?10:8,detail?6:4)
 }
}
function fern(x,z,s,seed){
 const T=spin(id,x,0,z,rand(seed)*TAU);
 for(let i=0;i<7;i++){
  let a=i*TAU/7, L=s*(.64+rand(seed+i)*.59),ux=Math.cos(a),uz=Math.sin(a);
  const P=(t,side)=>T([L*(ux*t-uz*side),s*(.074+.73*t-.66*t*t),L*(uz*t+ux*side)]);
  for(let j=0;j<3;j++){
   let q=j/3,w=(j+1)/3,c=j===2?'#689758':'#3b7449';
   poly([P(q,0),P(q+.13,.13*(1-q)),P(w,0),P(q+.13,-.14*(1-q))],c)
  }
 }
}
function mountain(x,z,s,seed){
 const T=spin(id,x,-1.1,z,rand(seed)*TAU),h=s*(1.4+rand(seed+8)*.48);
 const n=7,A=[],B=[],C=[];
 for(let i=0;i<n;i++){const a=TAU*i/n, r=.86+rand(seed+i)*.38;A.push(T([Math.cos(a)*s*r,0,Math.sin(a)*s*r]));B.push(T([Math.cos(a)*s*.70*r,h*.43,Math.sin(a)*s*.68*r]));C.push(T([Math.cos(a)*s*.32*r+.09*s,h*(.67+rand(seed+i+10)*.12),Math.sin(a)*s*.34*r]))}
 const p=T([.21*s,h,.09*s]);
 for(let i=0;i<n;i++){const j=(i+1)%n;
  poly([A[i],B[i],B[j],A[j]],i%2?'#6e8590':'#8498a2',true);
  poly([B[i],C[i],C[j],B[j]],i%2?'#748a96':'#92a6af',true);
  poly([C[i],p,C[j]],i%2?'#c5dce1':'#edf2e9',true)
 }
}
function pine(x,z,s,seed){
 const T=spin(id,x,0,z,rand(seed)*TAU),h=s*(2.5+rand(seed+5)*1.3);
 tube([0,0,0],[0,h*.86,0],s*.12,s*.07,'#645446',T,6);
 for(let j=0;j<4;j++){
  const y=h*(.27+j*.16),r=s*(.90-j*.158),t=y+h*.36;
  tube([0,y,0],[0,t,0],r,.012,j%2?'#406469':'#31535a',T,8);
  tube([0,y+h*.16,0],[0,t+.013,0],r*.61,.015,j%2?'#bdcfd1':'#d0dcdc',T,8)
 }
}
function forestBridge(z){
 for(const side of [-1,1]){
  box(side*5.07,.62,z+3.9,.117,.096,7.8,'#789c8f');
  for(const d of [0,4])box(side*5.09,.34,z+d,.159,.70,.181,'#42605a')
 }
}
function waterfall(){
 const center=501;
 for(let i=0;i<6;i++){
  const z=center+i*.75, x=-12.4-i*.20, w=.66, y=7.9-i*.38;
  box(x-.54,y*.47,z,1.05,y*.96,.81,'#50685b');
  poly([[x,y,z],[x,y,z+w],[x+1.34,-.16,z+w],[x+1.34,-.16,z]],i%2?'#a0cbb6':'#c4ddca');
  for(let j=0;j<3;j++){
   const v=(time*(1.6+i*.07)+j*.37+i*.17)%1;
   poly([[x+v*1.34,y*(1-v),z+.11],[x+v*1.34,y*(1-v),z+w-.10],[x+(v+.12)*1.34,y*(1-v-.12),z+w-.10],[x+(v+.12)*1.34,y*(1-v-.12),z+.11]],'#d7e9d7')
  }
 }
}
function tunnelSection(z){
 const pt=(a,b)=>[Math.cos(a)*6.45,Math.sin(a)*5.06+.07,b], n=10;
 for(let i=0;i<n;i++){const a=i*Math.PI/n,b=(i+1)*Math.PI/n;
  poly([pt(a,z),pt(a,z+7.98),pt(b,z+7.98),pt(b,z)],i%2?'#45575c':'#56686d');
  const p=pt(a,z),q=pt(b,z);segment(p,q,.083,'#788b8e',id,5)
 }
 for(const side of [-1,1])box(side*4.2,3.52,z+1.4,.76,.054,.14,'#ffdd9b')
}
function surfaceHazard(o){
 const {x,z}=o,ice=o.kind==='ice';
 for(let i=0;i<4;i++){
  const a=z-2.1+i*.95,r=[.62,1.08,1.02,.65][i];
  rect(x-r,x+r,a,a+.95,.025,ice?'#94b3c5':'#517a75',0,ice?3:5);
  rect(x-r*.72,x+r*.53,a+.18,a+.25,.031,ice?'#c2dbe0':'#86aba2')
 }
}

function biomeTerrain(){
 const z0=state.z,jungle=profile.map==='jungle',step=jungle?8:11;
 for(let z=Math.floor((z0-12)/step)*step;z<z0+105;z+=step){
  const n=z/step,q=rand(n+7),near=z<z0+43;
  if(jungle){
   if(z>=476&&z<541){forestBridge(z);continue}
   canopyTree(-6.9-q*3.7,z,1+q*.35,n+50,near);
   canopyTree(7.1+rand(n+44)*4.1,z+3,.75+q*.63,n+123,near);
   if(n%2===0)canopyTree((q>.5?-1:1)*(13+q*5),z+5,1.38,n+224,false);
   if(near){
    fern(-5.37-q*.84,z+1,1+q*.65,n+72);fern(5.47+q*.63,z+4,.91+q*.68,n+24);
    const green=['#325544','#42624b','#2f5b48','#54734f'];
    for(const side of [-1,1])for(let j=0;j<2;j++){
     const r=rand(n*17+side*7+j);
     ball(side*(6.2+r*2.7+j*.7),.44+r*.37,z+1.3+j*3.1,.88+r*.79,.49+r*.44,1.05+r*.49,green[(Math.abs(n)+j)%4],id,8,5)
    }
    if(n%3===0){const x=q>.5?6.9:-6.9,Y=4+q*1.7;
     tube([x,Y+1.28,z],[x*.64,Y+.59,z+1],.041,.031,'#4a6041',id,5);
     tube([x*.64,Y+.59,z+1],[x*.54,Y-.35,z+1.46],.032,.014,'#648151',id,5)
    }
   }
  }else{
   if(z%33===0){mountain(-17-q*7,z+10,7.8+q*8,n+30);mountain(16+q*9,z+21,7.1+q*6,n+77)}
   pine((n%2===0?-1:1)*(6.1+q*4.8),z+4,.69+q*.75,n+30);
   if(near||n%2===0)pine((n%2===0?1:-1)*(6.5+q*3.1),z+7,.80+q*.64,n+2);
   for(const side of [-1,1]){box(side*5.24,.37,z,.086,.75,.097,'#9aadb1');box(side*5.24,.65,z,.092,.156,.104,'#d86a57')}
  }
 }
 if(jungle&&z0>408&&z0<526)waterfall();
 if(!jungle&&z0>510&&z0<678)for(let z=592;z<656;z+=8)if(z>z0-12&&z<z0+98)tunnelSection(z)
}
function routePost(x,z,night=false,snow=false){
 const c=night?'#6f878e':snow?'#d8ddd4':'#aba995';
 box(x,.27,z,.096,.56,.092,c);
 box(x,.46,z-.052,.073,.079,.011,night?'#d5b77b':snow?'#cf6750':'#dfd6b3')
}
function grassClump(x,z,s,t,shade){
 const T=spin(id,x,-.034,z,t);
 for(let i=0;i<5;i++){
  let a=i*2.4,k=.53+rand(i+t*3)*.6, dx=Math.cos(a)*s,dz=Math.sin(a)*s;
  poly([T([-.023*s,0,.02]),T([.025*s,0,.02]),T([dx*.60,s*.32*k,dz*.53]),T([dx,s*.38*k,dz])],i%2?shade:'#798b69')
 }
}
function berthCrane(x,z,s){
 const T=q=>[x+q[0]*s,q[1]*s,z+q[2]*s];
 for(const d of [-1,1]){
  box(d*1.7,2.65,0,.24,5.25,.31,'#637b80',T);
  segment([d*1.7,2.8,-.38],[d*1.7,.22,1.42],.115,'#576a74',T,6);
  segment([d*1.7,4.0,-.03],[0,5.14,-.03],.078,'#708b92',T,6);
  box(d*1.7,.095,0,.57,.18,.74,'#b28461',T)
 }
 box(0,5.24,-.04,3.8,.33,.44,'#779097',T);
 box(0,5.21,1.33,.21,.23,2.6,'#6f898c',T);
 segment([0,5.10,1.91],[0,2.4,1.91],.025,'#899c9a',T,6);
 box(0,2.36,1.91,.24,.10,.22,'#c69265',T);
 box(0,5.03,-.22,.34,.059,.12,'#a0e6d5',T)
}
function roadsideDetail(){
 const z0=state.z,m=profile.map;
 for(let z=Math.floor((z0-7)/8)*8;z<z0+64;z+=8){
  const q=z/8,r=rand(q+704),a=q%3===0;
  for(const side of [-1,1]){
   if(m==='coast'){
    if(side===1)grassClump(side*(5.65+r*1.6),z+2,.66+r*.36,r*TAU,'#78996f');
    else if(a&&boardWidth(z)<.1){const x=-10.4-r*2.6;ball(x,.22,z,.37,.36,.36,'#bd8460',id,8,5);box(x,.42,z,.14,.074,.15,'#f6dbaa')}
   }else if(m==='canyon'){
    if(a)routePost(side*5.21,z+1);
    let x=side*(5.96+r*2.6);
    ball(x,.11,z+.41,.47+r*.58,.21+r*.19,.55+r*.31,'#956d5e',id,8,5);
    if(r>.38)grassClump(side*(5.36+r*.8),z+3,.58,r*TAU,'#9a946a')
   }else if(m==='port'){
    if(a)routePost(side*5.24,z+4,true);
    for(let j=0;j<2;j++)rect(side*4.69-.040,side*4.69+.040,z+3.1+j*.13,z+3.17+j*.13,.022,side===1?'#e0a1a9':'#93cfc6');
   }else if(m==='alpine'){
    const x=side*(6.2+r*1.9);
    ball(x,.013,z+2,.84+r*.64,.22+r*.09,1.47+r*.69,'#e6ece5',id,10,6)
   }else if(m==='jungle'){
    if(z<476||z>541){
     if(a)routePost(side*5.32,z+4);
     grassClump(side*(5.37+r*.42),z+.8,.74,r*TAU,'#5b895a')
    }
   }
  }
 }
 if(m==='port')for(let z=Math.floor((z0+13)/56)*56;z<z0+108;z+=56)if(z>z0+6)berthCrane(14,z,1.03+rand(z)*.18)
}

