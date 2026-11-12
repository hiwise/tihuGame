function poseYaw(a){return ([x,y,z])=>[x*Math.cos(a)+z*Math.sin(a),y,z*Math.cos(a)-x*Math.sin(a)]}
function tilt(T, x,y,z, ang){return ([a,b,c])=>T([x+a,y+b*Math.cos(ang)-c*Math.sin(ang),z+c*Math.cos(ang)+b*Math.sin(ang)])}
// Tailored cross sections: pelvis, waist, rib cage, shoulder and collar.
const torsoRows=[[1.032,.083,-.139,.125],[1.087,.187,-.137,.169],[1.156,.205,-.123,.164],[1.227,.161,-.129,.146],[1.299,.170,-.129,.152],[1.387,.216,-.122,.170],[1.472,.270,-.106,.188],[1.562,.296,-.104,.177],[1.641,.261,-.087,.143],[1.704,.153,-.043,.117],[1.737,.095,-.005,.096]];
function cubic(a,b,c,d,t){return .5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t)}
function sampleRings(rows,n){
 const out=[];for(let j=0;j<rows.length-1;j++)for(let i=0;i<n;i++)out.push(rows[j].map((v,k)=>cubic(rows[Math.max(0,j-1)][k],v,rows[j+1][k],rows[Math.min(j+2,rows.length-1)][k],i/n)));
 out.push(rows.at(-1));return out
}
function verticalShape(T,rows,seg,material){
 const P=(j,i)=>{const [y,w,z,d]=rows[j],a=i*TAU/seg;return T([Math.cos(a)*w,y,z+Math.sin(a)*d])};
 const rings=rows.map((_,j)=>Array.from({length:seg},(_,i)=>P(j,i)));
 const N=(j,i)=>{const k=(i+seg)%seg,r=rings[j],u=sub(r[(k+1)%seg],r[(k+seg-1)%seg]),v=sub(rings[Math.min(j+1,rows.length-1)][k],rings[Math.max(j-1,0)][k]);return unit(cross(v,u))};
 const norms=rings.map((r,j)=>r.map((_,i)=>N(j,i)));
 for(let j=0;j<rows.length-1;j++)for(let i=0;i<seg;i++){const k=(i+1)%seg;
  poly([rings[j][i],rings[j+1][i],rings[j+1][k],rings[j][k]],typeof material==='function'?material(rows[j][0],i,seg):material,true,0,[norms[j][i],norms[j+1][i],norms[j+1][k],norms[j][k]])
 }
}
function frontAt(y,x,size=1){
 let i=1;while(i<torsoRows.length-1&&torsoRows[i][0]<y)i++;
 const a=torsoRows[i-1],b=torsoRows[i],t=clamp((y-a[0])/(b[0]-a[0]),0,1),w=size*lerp(a[1],b[1],t);
 return lerp(a[2],b[2],t)+lerp(a[3],b[3],t)*Math.sqrt(Math.max(.018,1-(x/w)**2))
}
function coat(T,size,kind){
 const colors={hero:['#303e56','#414b64','#28354d'],post:['#f3e6ca','#337c72','#28665f'],sail:['#fff0d6','#f47b68','#fff1d1'],neon:['#eee4cf','#5651a0','#7ecdbf']}[kind];
 verticalShape(T,sampleRings(torsoRows,2).map(([y,w,z,d])=>[y,w*size,z,d]),24,(y,i,n)=>y>1.69?colors[0]:kind==='sail'?(Math.floor(y*23)%3===0?colors[2]:colors[1]):y<1.2?colors[2]:colors[1]);
 if(kind!=='sail'){
  const P=(x,y)=>[x,y,frontAt(y,x,size)+.012],trim=kind==='hero'?'#c9a36c':colors[2];
  for(let j=0;j<7;j++)segment(P(0,1.23+j*.063),P(0,1.23+(j+1)*.063),.0058,trim,T,6);
  for(const side of [-1,1]){
   const points=[[.080,1.238],[.113,1.365],[.159,1.473],[.226,1.563],[.238,1.614]];
   for(let i=1;i<points.length;i++){const [x,y]=points[i-1],[u,v]=points[i];segment(P(side*x*size,y),P(side*u*size,v),.007,i===4?trim:'#737a8d',T,6)}
  }
 }
}
function beakShape(H,f,mouth=0){
 const keys=[[.136,-.018,.113,.047,.065],[.258,-.024,.155,.049,.146],[.381,-.036,.156,.045,.187],[.530,-.042,.120,.035,.137],[.667,-.046,.077,.025,.075],[.762,-.061,.039,.018,.028],[.796,-.088,.018,.011,.015],[.800,-.108,.002,.003,.003]], n=32, rings=[];
 const curve=(a,b,c,d,t)=>.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);
 for(let j=0;j<keys.length-1;j++)for(let i=0;i<3;i++)rings.push(keys[j].map((v,k)=>curve(keys[Math.max(0,j-1)][k],v,keys[j+1][k],keys[Math.min(j+2,keys.length-1)][k],i/3)));
 rings.push(keys.at(-1));
 const q=(j,i)=>{let [z,y,w,hi,low]=rings[j],a=i*TAU/n,s=Math.sin(a);return H([Math.cos(a)*w*(f?.94:1),y+s*(s>0?hi:low)+Math.min(s,0)*mouth*.055,z])};
 const root=H([0,0,0]),normal=(j,i)=>{let a=i*TAU/n;return unit(sub(H([Math.cos(a),Math.sin(a),j>4?(j-4)*.23:.02]),root))};
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<n;i++){
  let c=i<n/2?(j>10?'#f3b354':'#ffcc77'):(i===n/2||i===n-1)?'#bd754b':j<5?'#f4ad83':'#f0a473';
  poly([q(j,i),q(j,i+1),q(j+1,i+1),q(j+1,i)],c,true,0,[normal(j,i),normal(j,i+1),normal(j+1,i+1),normal(j+1,i)])
 }
}
function feather(T,a,b,w,d,c){
 const dir=unit(sub(b,a)),u=unit(cross([0,0,1],dir)),v=cross(dir,u),mid=mul(add(a,b),.5),len=Math.hypot(...sub(b,a))*.54;
 const F=([x,y,z])=>T(add(mid,add(mul(u,x),add(mul(dir,y),mul(v,z)))));
 ball(0,0,0,w,len,d,c,F,13,8)
}
function guardianCape(T,show){
 const flow=show?.28:clamp(state.v/24,0,1), nr=12,nc=10;
 const point=(a,b)=>{
  const t=(b-.5)*2, wave=Math.sin(a*7-time*(show?3.1:8)+t*1.7);
  return T([t*(.319+a*.18),1.69-a*(show?.83:.35-flow*.12)+.063*a*wave+.061*t*t,-.30-.11*t*t-a*(show?.37:.37+flow*.63)+.088*a*Math.cos(t*6+a*4)+.07*a*wave]);
 };
 for(let i=0;i<nr;i++)for(let j=0;j<nc;j++){
  const a=i/nr,b=(i+1)/nr,l=j/nc,r=(j+1)/nc,p=[point(a,l),point(b,l),point(b,r),point(a,r)];
  const n=unit(cross(sub(p[1],p[0]),sub(p[2],p[0]))),face=dot(n,sub(eye,worldPoint(p[0])))>0?n:mul(n,-1);
  poly(p,i===nr-1?'#a94149':j===0||j===nc-1?'#e6ad63':'#a83146',true,0,[face,face,face,face])
 }
}
function chestBadge(T,size){
 const x0=.116*size,y0=1.529;
 const p=(x,y,d=.018)=>T([x0+x,y0+y,frontAt(y0+y,x0+x,size)+d]);
 const rim=[p(0,.072),p(.066,.043),p(.054,-.024),p(0,-.065),p(-.054,-.024),p(-.066,.043)];
 poly(rim,'#e8b76d');
 poly([p(0,.059,.023),p(.053,.035,.023),p(.044,-.020,.023),p(0,-.052,.023),p(-.044,-.020,.023),p(-.053,.035,.023)],'#303d53');
 poly([p(-.035,.019,.028),p(.040,.012,.028),p(-.014,-.028,.028),p(-.008,.002,.028)],'#ffe2a1')
}
function standingLeg(side){return {hip:[side*.106,1.121,-.128],knee:[side*.158,.902,-.094],foot:[side*.208,.665,-.136]}}
function crestFeather(H,side,index,ivory){
 const from=[side*(.036+index*.029),.164-index*.046,.018-index*.021],len=.293-index*.023;
 const P=(i,j)=>{const t=i/9,a=TAU*j/9,w=Math.sin(Math.PI*(.12+.88*t))*(.065-index*.006), y=from[1]+.087*Math.sin(t*Math.PI*.74)+t*t*.035;
 return H([from[0]+side*t*(.064+index*.019)+Math.cos(a)*w,y+Math.sin(a)*w*.49,from[2]-t*len])};
 for(let i=0;i<9;i++)for(let j=0;j<9;j++){
  const n=(k,l)=>unit(cross(sub(P(Math.min(k+1,9),l),P(Math.max(k-1,0),l)),sub(P(k,l+1),P(k,l-1))));
  poly([P(i,j),P(i+1,j),P(i+1,j+1),P(i,j+1)],ivory,true,0,[n(i,j),n(i+1,j),n(i+1,j+1),n(i,j+1)])
 }
}
function pelican(T,pose={}){
 const {kind,down=0,lean=0}=pose,pedaling=kind==='bike', skating=kind==='skate';
 const f=profile.sex==='female',clothes=profile.wear,show=mode==='garage'&&(tab==='pilot'||kind==='beside'),hero=clothes.top==='hero';
 const gesture=show?lobbyMotion():{hold:0,salute:0,mouth:0};
 const bob=pedaling?Math.sin(state.pedal*2)*.014:Math.sin(time*2.1)*.012;
 const ivory=f?'#fff3e7':'#fff1db',warm='#e6dfcb',steel='#63858e',deep='#294752';
 const high=(x,y,z,rx,ry,rz,c,U=T)=>ball(x,y,z,rx,ry,rz,c,U,Math.max(rx,ry,rz)>.20?24:14,Math.max(rx,ry,rz)>.20?14:8);
 const bend=tilt(id,gesture.hold*.028,1.27+bob+gesture.hold*.024,0,lean-gesture.hold*.036),B=([x,y,z])=>bend([x,y-1.27,z]);
 const body=q=>T(B(q)),size=f?.92:1;
 if(clothes.cape==='on'&&(!show||referenceView===0))guardianCape(body,show);
 coat(body,size,clothes.top);
 const beltY=1.219;
 verticalShape(body,[[beltY-.026,.174*size,-.129,.154],[beltY-.021,.181*size,-.129,.158],[beltY+.023,.182*size,-.129,.158],[beltY+.026,.176*size,-.129,.154]],20,hero?'#795641':'#805b47');
 if(hero){
  roundedBox(0,beltY,.035,.083,.061,.030,'#d9a860',body,.012);roundedBox(0,beltY,.050,.047,.034,.007,'#624733',body,.003);
  roundedBox(-.182*size,1.164,-.039,.134,.143,.103,'#8b644a',body,.029);
  roundedBox(-.181*size,1.203,.018,.127,.061,.027,'#a17b55',body,.011);
  high(-.180*size,1.189,.037,.018,.016,.010,'#d0a565',body);
  chestBadge(body,size)
 }
 for(let side of [-1,1]){
  const w=side*size, shoulder=B([w*.245,1.596,-.103]);
  let wrist,elbow;
  if(pedaling||kind==='moto'){
   const g=gripPoint(kind,side);wrist=[g[0],g[1]+down+.025,g[2]];
   elbow=[lerp(shoulder[0],wrist[0],.56)+side*.062,lerp(shoulder[1],wrist[1],.55)-.105,lerp(shoulder[2],wrist[2],.46)]
  }else if(skating){
   wrist=[side*.69,1.402+side*Wob*.19+Math.abs(Wob)*.035,-side*.265];elbow=[side*.53,1.52+side*Wob*.06,-side*.14]
  }else{
   wrist=kind==='beside'?[side*.380,1.17,-.047]:[side*.642,1.160,-.129];elbow=kind==='beside'?[side*.354,1.410,-.116]:[side*.430,1.441,-.132];
   if(gesture.hold){const readyW=[side*.38,1.18,.018],readyE=[side*.43,1.415,-.066];wrist=wrist.map((v,i)=>lerp(v,readyW[i],gesture.hold));elbow=elbow.map((v,i)=>lerp(v,readyE[i],gesture.hold));}
   if(side<0&&gesture.salute){const W=[-.184,2.169,.237],E=[-.543,1.914,.052];wrist=wrist.map((v,i)=>lerp(v,W[i],gesture.salute));elbow=elbow.map((v,i)=>lerp(v,E[i],gesture.salute));}
  }
  const sleeve=hero?'#3a465f':clothes.top==='sail'?'#f37b66':clothes.top==='neon'?'#545792':'#30796e';
  high(shoulder[0],shoulder[1],shoulder[2],.099,.106,.115,sleeve);
  feather(T,shoulder,elbow,.086,.089,sleeve);
  const cuff=elbow.map((v,i)=>lerp(shoulder[i],v,.80));
  tube(cuff,elbow,.086,.083,hero?'#525c74':sleeve,T,14);
  feather(T,elbow,wrist,.087,.064,ivory);
  const salute=side<0?gesture.salute:0, spread=skating?.14:show&&kind!=='beside'?.16:.073;
  for(let i=0;i<7;i++){
   const t=.14+i*.113;
   const root=[lerp(elbow[0],wrist[0],t)-side*.014,lerp(elbow[1],wrist[1],t)+.016,lerp(elbow[2],wrist[2],t)-.003];
   const natural=[root[0]+side*(spread+.021+i*.018),root[1]-.108-i*.033,root[2]-.050-i*.015];
   const up=[lerp(root[0],wrist[0]+.06-i*.013,.73),lerp(root[1],wrist[1]+.014+i*.004,.82),wrist[2]+.021-i*.005];
   const tip=natural.map((v,j)=>lerp(v,up[j],salute));
   feather(T,root,tip,.041-i*.0019,.018,i>3?'#e0cfb4':'#f7ead5');
   if(i<5)feather(T,[root[0]-side*.019,root[1]+.014,root[2]+.044],root.map((v,k)=>lerp(v,tip[k],.59)+(k===2?.043:0)),.032,.016,'#fff0d9')
  }
  if(pedaling||kind==='moto')high(wrist[0],wrist[1],wrist[2],.066,.059,.073,'#f2dfbc');
  let foot,knee;
  if(pedaling){
   const p=pedalPoint(side);foot=[p[0],p[1]+.022+down,p[2]-.023];
   knee=[side*.229,lerp(1.191,foot[1],.45)+.062,lerp(-.36,foot[2],.54)+.177]
  }else if(kind==='moto'){
   const p=fittings.moto.peg;foot=[side*p[0],p[1]+down,p[2]];
   knee=[side*.292,.927+down,.092];
   if(pose.parked&&side<0){foot=[-.407,.034+down,-.194];knee=[-.314,.598+down,-.051]}
  }else if(skating){
   const a=fittings.skate.stance[side>0?0:1], push=side<0&&mode==='play'&&state.push>0&&!state.action?Math.sin(state.push*Math.PI/.62):0;
   foot=[a[0]+side*.24*push,a[1]+down-.135*push,a[2]-.39*push];
   knee=[foot[0]+side*.068,lerp(1.14,foot[1],.54)+.073,foot[2]+.098];
  }else{
   ({foot,knee}=standingLeg(side));
   foot[0]+=side*gesture.hold*.033;foot[2]+=(side<0?.040:-.036)*gesture.hold;knee[0]+=side*gesture.hold*.020;
  }
  const hip=show?standingLeg(side).hip:B([side*.156,1.164,pedaling||kind==='moto'?-.309:-.125]);
  feather(T,hip,knee,.079,.080,hero?'#364257':'#586778');
  const trouserCuff=knee.map((v,i)=>lerp(v,foot[i],.48));
  feather(T,knee,trouserCuff,.057,.053,hero?'#354056':'#526477');
  feather(T,trouserCuff,foot,.042,.041,'#e8a05c');
  if(hero)high(knee[0],knee[1]+.023,knee[2]+.019,.057,.078,.057,'#434e64');
  const F=skating?spin(T,...foot,side>0?.46:.77):spin(T,...foot,side*.115);
  high(0,0,.033,show?.093:.080,.032,.114,'#e6a15a',F);
  if(show)high(0,-.012,.107,.095,.017,.075,'#eba75c',F);
  for(let j=-1;j<=1;j++)high(j*(show?.055:.044),-.003,.123-Math.abs(j)*.018,.033,.026,.061,'#f3b978',F)
 }
 for(let i=-2;i<=2;i++)feather(body,[i*.035,1.182,-.259],[i*.040,.984+Math.abs(i)*.026,-.402],.043,.023,i%2?warm:ivory);
 verticalShape(body,sampleRings([[1.672,.133,-.001,.107],[1.748,.103,.015,.097],[1.823,.084,.042,.090],[1.924,.092,.067,.105],[2.028,.117,.099,.133],[2.081,.093,.103,.114]],3),24,ivory);
 const H=tilt(spin(body,0,2.058,.100,(show&&!referenceView?.18:Wob*.12)+Math.sin(time*1.55)*.028),0,0,0,.045);
 high(0,.019,-.006,f?.172:.181,f?.170:.179,.187,ivory,H);
 high(0,-.059,.058,.134,.115,.123,'#f7e8cd',H);
 beakShape(H,f,gesture.mouth);
 for(let side of [-1,1]){
  const blink=time%5.2>5.08?.16:1,hx=side*(f?.111:.117), E=spin(H,hx,.055,.130,side*.68);
  high(0,0,0,.052,.048,.029,'#d4b895',E);
  high(0,.001,.012,.044,.037*blink,.020,'#fff9e7',E);
  high(side*.003,.002,.033,.024,.029*blink,.008,'#317d84',E);
  high(side*.004,.002,.040,.014,.021*blink,.006,'#152e3b',E);
  if(blink>.9)high(side*.000,.014,.045,.007,.008,.004,'#ffffff',E);
  feather(E,[-.041,.041,.011],[.039,.040,.007],.014,.020,ivory);
  if(clothes.glasses!=='none'){
   const c=clothes.glasses==='sunset'?'#d39a69':clothes.glasses==='pilot'?'#6c9daa':'#463c64';
   high(0,.002,.042,.053,clothes.glasses==='cat'?.037:.044,.015,c,E);
   feather(H,[hx+side*.039,.071,.162],[hx+side*.035,.067,.021],.009,.009,'#343849');
   high(-.014,.017,.056,.020,.006,.002,'#acc9ca',E)
  }
 }
 if(clothes.hat==='post'){
  high(0,.213,-.036,.212,.061,.212,'#22655e',H);high(0,.170,.129,.208,.024,.181,'#397e70',H);high(0,.221,.162,.048,.032,.020,'#f4c67d',H)
 }else if(clothes.hat==='visor'){
  high(0,.169,.121,.218,.022,.248,'#f58a6c',H);high(0,.190,-.026,.207,.034,.179,'#fff0d2',H)
 }else if(clothes.hat==='helmet'){
  high(0,.168,-.058,.224,.117,.216,'#6053a4',H);high(0,.153,.135,.213,.026,.181,'#a8eed6',H)
 }else{
  for(const side of [-1,1])for(let i=0;i<3;i++)crestFeather(H,side,i,i===2?'#e6d5b6':ivory)
 }
 if(clothes.scarf!=='none'){
  const c={red:'#d95555',mint:'#62c6ae',gold:'#f2ba63'}[clothes.scarf];
  verticalShape(body,[[1.707,.117,.004,.106],[1.723,.124,.004,.109],[1.777,.112,.017,.108],[1.784,.106,.018,.103]],24,c);
  if(!hero)for(let j=0;j<6;j++){
   const F=(q,k)=>body([.139+q*.24+k*.077,1.699-q*.15+Math.sin(time*7+q*7)*q*.052,-.05-q*.59]);
   poly([F(j/6,0),F(j/6,1),F((j+1)/6,1),F((j+1)/6,0)],c)
  }
 }
}

function drawRider(){
 const s=state,k=profile.vehicle,preview=mode==='garage',color=profile.wear.paint==='coral'&&k==='car'?'#296578':paint[profile.wear.paint]||paint.coral;
 const rise=(k==='bike'||k==='skate')?jumpHeight(s):0;
 if(!preview&&k==='car')return;
 const lean=preview?0:Wob*(k==='moto'?.27:k==='skate'?.13:.12);
 const pitch=s.action>0&&(k==='bike'||k==='skate')?(k==='skate'?.155:.115)*Math.sin(s.action/(k==='skate'?.83:.92)*TAU):0;
 const T=preview?poseYaw(previewAngle):vehiclePose(k,s.x,s.z,lean,Wob*.14,rise,pitch);
 if(preview&&tab==='pilot'){
  if(referenceView===0)lobbyPodium();
  pelican(([x,y,z])=>{const lengthened=y<1.18?1.18+(y-1.18)*1.24:y;return T([x,lengthened-(referenceView?.499:.439),z])});return
 }
 if(preview)shadow(0,0,.82,1.34,tab==='map'?'#394542':'#2c3534');else shadow(s.x,s.z,.35+rise*.24,1.14,'#41595b');
 ({bike:bikeModel,moto:motoModel,car:carModel,skate:skateModel})[k](T,color);
 if(preview&&k==='car'){
  const near=poseYaw(.42), A=q=>{const [x,y,z]=near(q);return T([x+1.14,y,z-.35])};
  const [x,,z]=A([0,0,0]);shadow(x,z,.34,.30,'#323e3a');
  pelican(([x,y,z])=>A([x,(y<1.18?1.18+(y-1.18)*1.24:y)-.498,z]),{kind:'beside'});return
 }
 if(k!=='car'){
  const down=k==='skate'?.52+(s.action>0?.13*Math.sin(Math.PI*s.action/.83):0):k==='moto'?.05:-.08;
  pelican(q=>T([q[0],q[1]-down,q[2]]),{kind:k,down,parked:preview,lean:k==='moto'?.17+s.action*.055:k==='skate'?.12:.10})
 }
}
function vehiclePose(kind,x,z,lean,yaw,air,pitch){
 const ca=Math.cos(lean),sa=Math.sin(lean),cp=Math.cos(pitch),sp=Math.sin(pitch),cy=Math.cos(yaw),sy=Math.sin(yaw),d=fittings[kind];
 const extent=Math.hypot(cp*ca,sp*ca),side=kind==='skate'?.223:kind==='moto'?.114:.039;
 let floor=Infinity;
 for(const wheel of d.axles)for(const a of [-side,side])floor=Math.min(floor,((d.radius+.012)*cp+wheel*sp)*ca-a*sa-d.radius*extent);
 const lift=.013-floor+air;
 return ([a,b,c])=>{const B=b*cp+c*sp,C=c*cp-b*sp,A=a*ca+B*sa;return [x+A*cy+C*sy,B*ca-a*sa+lift,z+C*cy-A*sy]}
}
