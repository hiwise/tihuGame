/* Editable modeling sources. Vehicle coordinates: X lateral, Y up, +Z forward. */
const fittings={
 bike:{axles:[-.94,.94],radius:.485,grip:[.397,1.526,.64],seat:[0,1.229,-.38],crank:[0,.507,-.147],arm:.167},
 moto:{axles:[-.93,.97],radius:.49,grip:[.412,1.561,.54],seat:[0,1.155,-.38],peg:[.258,.544,-.12]},
 skate:{axles:[-.48,.49],radius:.092,deckY:.218,stance:[[-.09,.240,.35],[.085,.240,-.29]]}
};
const alum='#b8c4bd', rubber='#263235', teal='#244f50', mint='#7cbba5', brass='#e5b067', dark='#243b44';
function segment(a,b,r,c,T=id,s=12){tube(a,b,r,r,c,T,s)}
function profileBand(T,x,z,y,contours,colors,segments=32){
 const q=(k,i)=>{const [l,r]=contours[k],a=TAU*i/segments;return T([x+l,y+Math.cos(a)*r,z+Math.sin(a)*r])};
 for(let i=0;i<segments;i++)for(let j=0;j<contours.length;j++){
  const k=(j+1)%contours.length;
  poly([q(j,i),q(j,i+1),q(k,i+1),q(k,i)],colors[j%colors.length],true)
 }
}
function cycleWheel(T,z,r,moto=false){
 const w=moto?.114:.039, y=r+.012, lip=r-(moto?.104:.038),inner=lip-.022;
 profileBand(T,0,z,y,[[-w*.72,lip],[-w*.99,r*.95],[-w*.59,r],[w*.59,r],[w*.99,r*.95],[w*.72,lip]],[moto?'#414443':'#e3ceb0',rubber,'#303739',rubber,moto?'#414443':'#e3ceb0',rubber],32);
 profileBand(T,0,z,y,[[-w*.60,inner],[-w*.65,lip],[-w*.38,lip+.002],[w*.38,lip+.002],[w*.65,lip],[w*.60,inner]],[alum,alum,'#52696d',alum,alum,'#657777'],28);
 const n=moto?14:16;
 for(let i=0;i<n;i++){
  const a=state.pedal+i*TAU/n,s=i%2?-1:1,b=a+s*.15;
  segment([s*w*.53,y+Math.cos(a)*inner,z+Math.sin(a)*inner],[-s*w*.48,y+Math.cos(b)*.039,z+Math.sin(b)*.039],moto?.006:.0046,alum,T,4)
 }
 segment([-w*1.35,y,z],[w*1.35,y,z],moto?.084:.051,alum,T,10);
 if(moto)for(const s of [-1,1])segment([s*.077,y,z],[s*.091,y,z],.122,'#657674',T,14)
}
function arcFender(T,z,r,width,color,front=false){
 const n=13,y=r+.012;
 const pt=(i,x)=>{const a=(front?-1.31:-1.80)+(front?2.25:2.85)*i/n;return T([x,y+(r+.034)*Math.cos(a),z+(r+.034)*Math.sin(a)])};
 for(let i=0;i<n;i++){
  poly([pt(i,-width),pt(i+1,-width),pt(i+1,width),pt(i,width)],color,true);
  for(const x of [-width,width])poly([pt(i,x),pt(i+1,x),add(pt(i+1,x),[0,-.023,0]),add(pt(i,x),[0,-.023,0])],color,true)
 }
}
function roundedBox(x,y,z,w,h,d,c,T=id,r=.045){
 const dx=w/2,dy=h/2,dz=d/2;const rr=Math.min(r,dx*.8,dy*.8,dz*.8);
 const pts=(height,cut)=>{
  const out=[];for(const [a,b,t] of [[1,1,0],[-1,1,Math.PI*.5],[-1,-1,Math.PI],[1,-1,Math.PI*1.5]])for(let i=0;i<=3;i++){
   const ang=t+i*Math.PI/6;out.push(T([x+a*(dx-rr)+Math.cos(ang)*cut,y+height,z+b*(dz-rr)+Math.sin(ang)*cut]))
  }return out
 };
 const A=pts(-dy,rr*.34),B=pts(-dy+rr*.62,rr),C=pts(dy-rr*.62,rr),D=pts(dy,rr*.34);
 for(const [u,v] of [[A,B],[B,C],[C,D]])for(let i=0;i<u.length;i++){const j=(i+1)%u.length;poly([u[i],u[j],v[j],v[i]],c,true)}
 poly(D.slice().reverse(),c,true);poly(A,c,true)
}
function mailCase(T,x,y,z,strap=false){
 roundedBox(x,y,z,.43,.305,.52,mint,T,.047);roundedBox(x,y+.145,z,.461,.081,.554,'#92c9ad',T,.024);
 roundedBox(x,y+.067,z-.267,.087,.080,.024,brass,T,.010);
 for(const side of [-1,1])if(strap){
  const a=x+side*.135;
  roundedBox(a,y+.190,z,.039,.012,.547,'#bd8555',T,.004);roundedBox(a,y+.011,z-.269,.040,.290,.015,'#bd8555',T,.005);
  roundedBox(a,y+.022,z-.279,.050,.048,.013,'#d5ad76',T,.005)
 }
}
function headlamp(T,y,z,r){
 segment([0,y,z-.043],[0,y,z+.015],r,'#435358',T,17);
 segment([0,y,z+.013],[0,y,z+.032],r*.94,brass,T,17);
 ball(0,y,z+.036,r*.80,r*.80,.018,'#ffe2a0',T,15,8)
}
function frontRig(T,z,pivot,angle){
 return p=>{const x=p[0],a=p[2]-pivot;return T([x*Math.cos(angle)+a*Math.sin(angle),p[1],pivot+a*Math.cos(angle)-x*Math.sin(angle)])}
}
function steerAngle(){return mode==='garage'?0:Wob*.21}
function gripPoint(k,side){
 const [x,y,z]=fittings[k].grip,p=k==='bike'?.77:.72;
 return frontRig(id,fittings[k].axles[1],p,steerAngle())([side*x,y,z])
}
function pedalPoint(side){
 const {crank,arm}=fittings.bike,a=state.pedal+(side>0?0:Math.PI);
 return [side*.172,crank[1]+arm*Math.cos(a),crank[2]+arm*Math.sin(a)]
}
function bikeModel(T,color){
 const d=fittings.bike,[rear,front]=d.axles, r=d.radius,y=r+.012;
 const F=frontRig(T,front,.77,steerAngle());
 cycleWheel(T,rear,r);cycleWheel(F,front,r);
 arcFender(T,rear,r,.042,color);arcFender(F,front,r,.042,color,true);
 const R=[0,y,rear],S=[0,1.105,-.39],A=d.crank,H=[0,1.182,.665],L=[0,1.028,.735];
 for(const [a,b,t] of [[S,H,.042],[A,L,.054],[A,S,.036],[R,A,.026],[R,S,.027],[L,H,.043]])segment(a,b,t,color,T);
 for(const s of [-1,1]){
  segment([s*.087,y,rear],[s*.096,1.065,-.66],.014,color,T);
  segment([s*.066,1.032,.755],[s*.056,y,front],.026,alum,F);
  segment([s*.05,1.462,.70],[s*.22,1.475,.693],.024,alum,F);
  segment([s*.22,1.475,.693],[s*.29,1.526,.661],.024,alum,F);
  segment([s*.29,1.526,.661],[s*.418,1.526,.635],.033,teal,F);
  const p=pedalPoint(s);segment([s*.081,A[1],A[2]],p,.020,alum,T,8);
  roundedBox(p[0],p[1]-.028,p[2],.119,.035,.071,'#455355',T,.009)
 }
 segment([0,1.10,-.39],[0,1.224,-.412],.030,alum,T);
 ball(0,1.223,-.43,.129,.047,.205,teal,T,18,9);
 segment([0,1.13,.70],[0,1.48,.700],.028,alum,F);
 segment([.067,A[1],A[2]],[.096,A[1],A[2]],.131,'#95a3a0',T,19);
 segment([.070,y,rear],[.094,y,rear],.059,'#95a3a0',T,14);
 segment([.098,A[1]+.123,A[2]],[.098,y+.054,rear],.010,'#4f5651',T,6);
 segment([.098,A[1]-.123,A[2]],[.098,y-.054,rear],.010,'#4f5651',T,6);
 roundedBox(0,1.074,-.928,.474,.045,.600,color,T,.013);
 mailCase(T,0,1.250,-.96);headlamp(F,1.276,.817,.078)
}
function motoModel(T,color){
 const {axles:[rear,front],radius:r}=fittings.moto,y=r+.012,F=frontRig(T,front,.72,steerAngle());
 cycleWheel(T,rear,r,true);cycleWheel(F,front,r,true);
 arcFender(T,rear,r,.104,alum);arcFender(F,front,r,.103,alum,true);
 for(const s of [-1,1]){
  const a=s*.112;
  segment([a,y,rear],[a,.558,-.02],.037,'#46504c',T);
  segment([a,y+.055,rear],[a,1.07,-.55],.039,alum,T);
  for(let j=0;j<6;j++){const t=.22+j*.079,l=lerp(y+.055,1.07,t),z=lerp(rear,-.55,t);segment([a,l,z],[a,l+.014,z+.008],.050,'#536067',T,9)}
  segment([s*.108,1.219,.65],[s*.111,y,front],.041,alum,F);
  segment([s*.13,1.528,.56],[s*.407,1.561,.54],.027,alum,F);
  segment([s*.305,1.556,.55],[s*.431,1.563,.54],.043,'#343b3b',F);
  segment([s*.299,1.568,.52],[s*.407,1.766,.51],.015,alum,F);
  ball(s*.414,1.775,.508,.070,.066,.022,'#879a96',F,15,7);
  segment([s*.14,.514,-.12],[s*.294,.514,-.12],.034,'#464d48',T)
 }
 for(const [a,b] of [[[0,.52,-.45],[0,1.03,-.66]],[[0,1.08,-.64],[0,1.12,.56]],[[0,.51,-.23],[0,1.02,.55]]])segment(a,b,.049,'#404b4a',T);
 ball(0,.669,.021,.246,.218,.296,'#656d69',T,19,10);
 for(let i=0;i<7;i++)roundedBox(0,.710+i*.048,.147,.408,.022,.242,'#7b8481',T,.009);
 const E=[[.155,.765,.285],[.241,.634,.342],[.265,.460,.247],[.267,.416,-.210],[.264,.428,-.816]];
 for(let i=1;i<E.length;i++)segment(E[i-1],E[i],.032,alum,T,12);
 segment([.265,.427,-.385],[.265,.445,-.903],.073,alum,T,16);
 segment([.265,.445,-.904],[.265,.445,-.922],.053,'#353e41',T,12);
 ball(0,1.083,.272,.257,.189,.381,color,T,28,15);
 ball(0,1.263,.266,.051,.022,.053,alum,T,12,6);
 roundedBox(0,1.122,-.397,.358,.098,.654,teal,T,.058);
 for(let i=0;i<7;i++)roundedBox(0,1.173,-.628+i*.073,.299,.009,.008,'#b6a479',T,.003);
 roundedBox(0,1.109,-.91,.482,.054,.574,'#475457',T,.018);mailCase(T,0,1.289,-.944,true);
 headlamp(F,1.362,.747,.126)
}
function loft(T,rows,c,n=24){
 const p=(j,i)=>{const [z,w,y,h]=rows[j],a=i*TAU/n;return T([Math.cos(a)*w,y+Math.sin(a)*h,z])};
 const o=T([0,0,0]),normal=i=>{const a=i*TAU/n;return unit(sub(T([Math.cos(a),Math.sin(a),0]),o))};
 for(let j=0;j<rows.length-1;j++)for(let i=0;i<n;i++)poly([p(j,i),p(j,i+1),p(j+1,i+1),p(j+1,i)],typeof c==='function'?c(j,i,n):c,true,0,[normal(i),normal(i+1),normal(i+1),normal(i)]);
 for(const j of [0,rows.length-1])poly(Array.from({length:n},(_,i)=>p(j,j===0?n-1-i:i)),typeof c==='function'?c(j,0,n):c,true);
}
function wheelArch(T,side,z,c){
 const strips=[[.411,.326],[.514,.369],[.611,.395],[.697,.383],[.750,.348],[.746,.326]], n=16;
 const P=(k,i)=>{const [x,r]=strips[k],a=lerp(-1.38,1.38,i/n);return T([side*x,.337+r*Math.cos(a),z+r*Math.sin(a)])};
 const origin=T([0,0,0]), N=(k,i)=>{const a=lerp(-1.38,1.38,i/n);return unit(sub(T([side*(k-1)*.16,Math.cos(a),Math.sin(a)]),origin))};
 for(let k=0;k<strips.length-1;k++)for(let i=0;i<n;i++)poly([P(k,i),P(k+1,i),P(k+1,i+1),P(k,i+1)],k===4?'#324954':c,true,0,[N(k,i),N(k+1,i),N(k+1,i+1),N(k,i+1)]);
}
function carModel(T,color,far=false){
 if(far){ball(0,.429,0,.71,.225,1.52,color,T,12,7);ball(0,.693,-.14,.446,.226,.724,'#324953',T,10,5);for(let x of [-.60,.60])for(let z of [-.98,1])segment([x-.10,.33,z],[x+.10,.33,z],.319,'#2a3337',T,10);box(0,.83,-1.38,1.31,.05,.23,'#263744',T);return}
 const ink='#263644',glass='#304a55',stripe='#ed7665';
 for(const s of [-1,1])for(const z of [-.984,1.006]){
  const x=s*.603,r=.322;
  segment([x-.116,.337,z],[x+.116,.337,z],r,'#292f34',T,24);
  segment([x-s*.04,.337,z],[x+s*.121,.337,z],.220,'#414e53',T,20);
  for(let j=0;j<6;j++){const a=TAU*j/6;segment([x+s*.127,.337,z],[x+s*.127,.337+.183*Math.sin(a),z+.183*Math.cos(a)],.015,'#859197',T,6)}
  segment([x+s*.118,.337,z],[x+s*.132,.337,z],.049,'#889195',T,10)
 }
 const chassis=[[-1.516,.446,.393,.087],[-1.441,.640,.452,.178],[-1.18,.735,.499,.213],[-.88,.746,.496,.202],[-.47,.682,.487,.188],[.42,.695,.478,.181],[.99,.751,.467,.182],[1.35,.687,.430,.140],[1.539,.533,.382,.093],[1.571,.418,.376,.073]];
 loft(T,chassis,(j,i,n)=>i>=n*.19&&i<n*.31?stripe:i>n*.55?ink:color,32);
 for(const side of [-1,1])for(const z of [-.984,1.006])wheelArch(T,side,z,color);
 const cabin=[[-.923,.22,.635,.038],[-.691,.432,.715,.121],[-.360,.462,.751,.176],[.06,.450,.759,.187],[.42,.394,.709,.130],[.72,.277,.660,.055]];
 loft(T,cabin,(j,i,n)=>i>=n*.195&&i<n*.305&&j<3?stripe:i<n*.19&&j===3?'#395e68':glass,32);
 for(const s of [-1,1]){
  const P=(x,y,z)=>T([s*(x+.024),y,z]);
  poly([P(.658,.451,-.49),P(.663,.570,-.41),P(.667,.590,.23),P(.682,.552,.52),P(.672,.421,.51),P(.663,.390,-.35)],'#f1dfb8');
  for(const z of [-1.42,1.369])for(let j=0;j<2;j++)ball(s*(.47+j*.111),z>0?.477:.531,z+(z>0?.033:-.021),.064,.043,.048,z>0?'#ffd082':'#d86751',T,12,8);
  roundedBox(s*.460,.731,-1.352,.068,.224,.142,ink,T,.019);
  roundedBox(s*.654,.830,-1.38,.029,.091,.300,ink,T,.010)
 }
 roundedBox(0,.842,-1.38,1.335,.052,.279,ink,T,.018);
 roundedBox(0,.268,1.393,1.123,.056,.288,ink,T,.018);
}
function skateProfile(z){
 const t=clamp((Math.abs(z)-.48)/.37,0,1);
 return fittings.skate.deckY+t*t*(z>0?.108:.092);
}
function skateModel(T,color){
 const {axles,radius:r}=fittings.skate,n=36;
 const edge=(i,y)=>{let a=TAU*i/n,z=.861*Math.sign(Math.cos(a))*Math.abs(Math.cos(a))**.67,x=.223*Math.sign(Math.sin(a))*Math.abs(Math.sin(a))**.66;return T([x,skateProfile(z)+y,z])};
 const center=y=>T([0,skateProfile(0)+y,0]);
 for(let i=0;i<n;i++){
  for(let j=0;j<3;j++){const y=-.037+j*.012;poly([edge(i,y),edge(i+1,y),edge(i+1,y+.012),edge(i,y+.012)],j%2?'#ae7447':'#ebbf83',true)}
  poly([center(0),edge(i,0),edge(i+1,0)],'#313c3a');
  poly([center(-.038),edge(i+1,-.038),edge(i,-.038)],Math.abs(Math.cos(TAU*i/n))>.73?'#dc7864':color);
 }
 for(const z of axles){
  roundedBox(0,.167,z,.190,.034,.118,alum,T,.008);
  segment([-.153,.105,z],[.153,.105,z],.028,alum,T,10);
  segment([0,.100,z],[0,.183,z+.026],.031,'#768585',T,9);
  for(const s of [-1,1]){
   segment([s*.138,.102,z],[s*.223,.102,z],r,'#e6b450',T,18);
   segment([s*.222,.102,z],[s*.229,.102,z],.027,alum,T,10)
  }
 }
 poly([[-.125,.220,-.06],[0,.220,.086],[.125,.220,-.06],[0,.220,.018]].map(T),'#e87964');
 poly([[-.159,.177,-.073],[0,.177,.11],[.159,.177,-.073],[0,.177,.017]].map(T),'#f3e0ac')
}
