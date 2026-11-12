const stage3d=(()=>{
 try{
  const gl=mesh.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});if(!gl)return null;
  const make=(kind,src)=>{const s=gl.createShader(kind);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s};
  const p=gl.createProgram();
  gl.attachShader(p,make(gl.VERTEX_SHADER,`
   attribute vec3 p;attribute vec3 c;attribute vec3 uv;
   varying vec3 color;varying vec3 surface;varying float distanceZ;
   void main(){gl_Position=vec4(p.xy,1.0018*p.z-.401,p.z);color=c;surface=uv;distanceZ=p.z;}
  `));
  gl.attachShader(p,make(gl.FRAGMENT_SHADER,`
   precision highp float;
   varying vec3 color;varying vec3 surface;varying float distanceZ;
   uniform float flow;
   float hash(vec2 x){vec3 p=fract(vec3(x.xyx)*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
   float field(vec2 x){vec2 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
   void main(){
    float kind=surface.z;
    vec2 p=surface.xy;
    vec3 c=color;
    if(kind>.5){
     float fade=1.-smoothstep(18.,108.,distanceZ), grain=hash(floor(p*31.)), broad=field(p*.49), mid=field(p*2.25);
     if(kind<2.5){
      float rut=max(exp(-pow(abs(abs(p.x-1.55)-.75)*8.,2.)),exp(-pow(abs(abs(p.x+1.55)-.75)*8.,2.)));
      c*=1.+fade*((grain-.5)*.135+(mid-.5)*.12+(broad-.5)*.18-rut*.045);
      if(kind>1.5){
       float sheen=pow(field(p*vec2(2.4,.44)),3.)*(.58+.42*broad);
       c+=fade*(sheen*.14+rut*.014)*vec3(.74,.95,1.);
      }
     }else if(kind<3.5){c*=.95+(broad-.4)*.21+(mid-.5)*.095+(grain-.5)*.053;}
     else if(kind<4.5){c*=.91+(broad-.4)*.31+(mid-.5)*.16+(grain-.5)*.08;}
     else if(kind<5.5){
      float ripple=sin(p.y*15.+field(p*.35)*9.-flow*2.1),scatter=pow(max(0.,ripple),12.)*pow(broad,2.);
      c=c*(.93+(broad-.4)*.24)+vec3(.62,.78,.75)*scatter*.21*fade;
     }else if(kind<6.5){
      c*=1.+(field(p*vec2(13.,.47))-.5)*.20*fade; c-=vec3(.036)*step(.96,fract(p.y*1.25))*fade;
     }else{c*=.95+(grain-.5)*.11+(mid-.5)*.08;}
    }
    gl_FragColor=vec4(c,1.);
   }
  `));
  gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));
  const b=gl.createBuffer(),a=gl.getAttribLocation(p,'p'),c=gl.getAttribLocation(p,'c'),u=gl.getAttribLocation(p,'uv'),flow=gl.getUniformLocation(p,'flow');
  gl.useProgram(p);gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.enableVertexAttribArray(a);gl.enableVertexAttribArray(c);gl.enableVertexAttribArray(u);
  gl.vertexAttribPointer(a,3,gl.FLOAT,false,36,0);gl.vertexAttribPointer(c,3,gl.FLOAT,false,36,12);gl.vertexAttribPointer(u,3,gl.FLOAT,false,36,24);
  gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
  return {draw(data){gl.viewport(0,0,mesh.width,mesh.height);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniform1f(flow,time);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.DYNAMIC_DRAW);gl.drawArrays(gl.TRIANGLES,0,data.length/9)}}
 }catch{return null}
})();
let objectLayer=false,verts=[];
function gpuPoly(ps,color,lit,n,normals,material){
 const pts=ps.map(project), near=.23;
 if(pts.every(a=>a[2]<near)||pts.every(a=>a[2]>160))return;
 const base=rgb(color),fogCol=map().fog, light=[-.46,.81,-.36],shade=nn=>.62+Math.max(0,dot(nn,light))*.34+Math.max(0,nn[1])*.065+Math.max(0,nn[0]*.69+nn[2]*.63)*.12;
 let verts0=pts.map((p,i)=>[...p,lit?shade(normals?normals[i]:n):1,ps[i][0],ps[i][2]]),out=[];
 for(let i=0;i<verts0.length;i++){
  const a=verts0[i],b=verts0[(i+1)%verts0.length],ain=a[2]>=near,bin=b[2]>=near;
  if(ain)out.push(a);if(ain!==bin){let t=(near-a[2])/(b[2]-a[2]);out.push(a.map((v,j)=>lerp(v,b[j],t)))}
 }
 if(out.length<3)return;
 const packs=out.map(([x,y,z,s,u,v])=>{
  const fog=clamp((z-24)/117,0,.82);
  const lens=orthographic?orthographic*z:focal;
  return [x*lens/(W*.5)+(originX/(W*.5)-1)*z,y*lens/(H*.5)+(1-originY/(H*.5))*z,z,...base.map((v,i)=>clamp(lerp(v*s,fogCol[i],fog)/255,0,1)),u,v,material]
 });
 for(let j=1;j<packs.length-1;j++)verts.push(...packs[0],...packs[j],...packs[j+1])
}
function finishObjects(){flush();if(stage3d){stage3d.draw(verts);verts.length=0}objectLayer=false}

const rand=n=>{let v=Math.sin(n*127.1+81.7)*43758.5453123;return v-Math.floor(v)};
const hex={};
function rgb(c){return hex[c]||(hex[c]=[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)])}
const v=(x,y,z)=>[x,y,z], add=(a,b)=>a.map((x,i)=>x+b[i]), sub=(a,b)=>a.map((x,i)=>x-b[i]), mul=(a,s)=>a.map(x=>x*s), dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2], cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]], unit=a=>mul(a,1/(Math.hypot(...a)||1));
function resize(){W=cv.clientWidth;H=cv.clientHeight;DPR=Math.min(devicePixelRatio||1,1.75);cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);mesh.width=cv.width;mesh.height=cv.height;ctx.setTransform(DPR,0,0,DPR,0,0)}
window.addEventListener('resize',resize);resize();
const id=p=>p;
function project(p){let d=sub(worldPoint(p),eye);return [dot(d,basis[0]),dot(d,basis[1]),dot(d,basis[2])]}
function poly(ps,color,lit=false,bias=0,normals=null,material=0){
 let n=cross(sub(ps[1],ps[0]),sub(ps[2],ps[0]));
 if(lit&&bias&&!normals){const a=worldPoint(ps[0]);n=cross(sub(worldPoint(ps[1]),a),sub(worldPoint(ps[2]),a))}
 if(objectLayer&&stage3d){gpuPoly(ps,color,lit,unit(n),normals,material);return}
 if(lit && dot(n,sub(eye,worldPoint(ps[0])))<0)return;
 let pts=ps.map(project), out=[],near=.23;
 for(let i=0;i<pts.length;i++){let a=pts[i],b=pts[(i+1)%pts.length],ain=a[2]>=near,bin=b[2]>=near;if(ain)out.push(a);if(ain!==bin){let t=(near-a[2])/(b[2]-a[2]);out.push([lerp(a[0],b[0],t),lerp(a[1],b[1],t),near])}}
 if(out.length<3)return;
 let screen=out.map(p=>{const zoom=orthographic||focal/p[2];return [originX+p[0]*zoom,originY-p[1]*zoom]});
 if(screen.every(p=>p[0]<-3)||screen.every(p=>p[0]>W+3)||screen.every(p=>p[1]<-3)||screen.every(p=>p[1]>H+3))return;
 let depth=out.reduce((s,p)=>s+p[2],0)/out.length, shade=lit?.77+Math.max(0,dot(unit(n),[-.37,.86,.35]))*.27:1;
 faces.push({screen,color,shade,depth,bias});
}
function flush(){faces.sort((a,b)=>(b.depth+b.bias)-(a.depth+a.bias));for(const {screen,color,shade,depth} of faces){const a=rgb(color),fog=clamp((depth-26)/110,0,.80),c=a.map((x,i)=>Math.round(lerp(x*shade,map().fog[i],fog)));ctx.fillStyle=ctx.strokeStyle='rgb('+c.join(',')+')';ctx.beginPath();ctx.moveTo(...screen[0]);for(let i=1;i<screen.length;i++)ctx.lineTo(...screen[i]);ctx.closePath();ctx.fill();ctx.lineWidth=.55;ctx.stroke()}faces.length=0}
function box(x,y,z,w,h,d,c,T=id){
 const X=w/2,Y=h/2,Z=d/2, a=[[-X,-Y,-Z],[X,-Y,-Z],[X,Y,-Z],[-X,Y,-Z],[-X,-Y,Z],[X,-Y,Z],[X,Y,Z],[-X,Y,Z]].map(p=>T(add(p,[x,y,z])));
 for(const f of [[3,2,1,0],[4,5,6,7],[0,4,7,3],[1,2,6,5],[3,7,6,2],[0,1,5,4]])poly(f.map(i=>a[i]),c,true)
}
function tube(a,b,ra,rb,c,T=id,seg=8){
 let d=unit(sub(b,a)),u=unit(cross(d,Math.abs(d[1])>.92?[1,0,0]:[0,1,0])),v2=cross(d,u),A=[],B=[];
 for(let i=0;i<seg;i++){let p=add(mul(u,Math.cos(i*TAU/seg)),mul(v2,Math.sin(i*TAU/seg)));A.push(T(add(a,mul(p,ra))));B.push(T(add(b,mul(p,rb))))}
 for(let i=0;i<seg;i++){let j=(i+1)%seg;poly([A[i],A[j],B[j],B[i]],c,true)}poly(A.slice().reverse(),c,true);if(rb>.001)poly(B,c,true)
}
function ball(x,y,z,rx,ry,rz,c,T=id,seg=12,rings=8){
 const A=[],N=[],ref=T([x,y,z]);
 for(let j=0;j<=rings;j++){let t=Math.PI*j/rings;A.push([]);N.push([]);
  for(let i=0;i<seg;i++){let a=i*TAU/seg,dx=Math.sin(t)*Math.cos(a),dy=Math.cos(t),dz=Math.sin(t)*Math.sin(a);
   A[j].push(T([x+rx*dx,y+ry*dy,z+rz*dz]));
   N[j].push(unit(sub(T([x+dx/rx,y+dy/ry,z+dz/rz]),ref)));
  }}
 for(let j=0;j<rings;j++)for(let i=0;i<seg;i++){
  let k=(i+1)%seg,f=j===0?[[j,i],[j+1,k],[j+1,i]]:j===rings-1?[[j,i],[j,k],[j+1,i]]:[[j,i],[j,k],[j+1,k],[j+1,i]];
  poly(f.map(([a,b])=>A[a][b]),c,true,0,f.map(([a,b])=>N[a][b]))
 }
}
function rect(x1,x2,z1,z2,y,c,bias=0,material=0){poly([[x2,y,z1],[x1,y,z1],[x1,y,z2],[x2,y,z2]],c,y===0,bias,null,material)}
function shadow(x,z,rx,rz,c='#465557'){let ps=[];for(let i=0;i<14;i++)ps.push([x+Math.cos(i*TAU/14)*rx,.005,z+Math.sin(i*TAU/14)*rz]);poly(ps,c,false,5000)}
function spin(T,x,y,z,a){return p=>T([x+p[0]*Math.cos(a)+p[2]*Math.sin(a),y+p[1],z-p[0]*Math.sin(a)+p[2]*Math.cos(a)])}
const wheelCenters=[-.83,.86], wheelY=.46, tread=[
 [-.056,.366],[-.060,.408],[-.042,.436],[-.022,.445],
 [.022,.445],[.042,.436],[.060,.408],[.056,.366]
];
function wheel(z,T,rot){
 const seg=28, y=wheelY, a=(i)=>i*TAU/seg;
 const pt=(x,r,i)=>T([x,y+r*Math.cos(a(i)),z+r*Math.sin(a(i))]);
 for(let i=0;i<seg;i++){
  for(let k=0;k<tread.length;k++){
   let [x,r]=tread[k],[nx,nr]=tread[(k+1)%tread.length];
   const c=k===3?(i%2?'#29383b':'#253438'):k===1||k===5?'#505250':'#263639';
   poly([pt(x,r,i),pt(x,r,i+1),pt(nx,nr,i+1),pt(nx,nr,i)],c,true)
  }
  for(let s of [-1,1]){
   const q=[pt(s*.060,.367,i),pt(s*.060,.367,i+1),pt(s*.061,.342,i+1),pt(s*.061,.342,i)];
   poly(s>0?q:q.reverse(),'#e1caa5',true)
  }
 }
 for(let i=0;i<10;i++){let a=rot+TAU*i/10,s=i%2?-1:1;tube([s*.054,y,z],[s*.021,y+.349*Math.cos(a),z+.349*Math.sin(a)],.007,.007,'#adc3bd',T,4)}
 tube([-.125,y,z],[.125,y,z],.049,.049,palette.metal,T,10);
 for(let s of [-1,1])tube([s*.116,y,z],[s*.135,y,z],.032,.032,palette.rim,T,7);
}
function riderPose(x,z,lean,yaw,air,pitch){
 const ca=Math.cos(lean),sa=Math.sin(lean),cp=Math.cos(pitch),sp=Math.sin(pitch),cy=Math.cos(yaw),sy=Math.sin(yaw);
 const bankY=(a,b,c)=>(b*cp+c*sp)*ca-a*sa;
 // Exact lower support of the circular tire profiles after banking and pitching.
 const extent=Math.hypot(cp*ca,sp*ca);
 let base=Infinity;
 for(const w of wheelCenters)for(const [a,r] of tread)base=Math.min(base,bankY(a,wheelY,w)-r*extent);
 const lift=.012-base+air;
 return ([a,b,c])=>{
  let B=b*cp+c*sp,C=c*cp-b*sp,A=a*ca+B*sa;
  return [x+A*cy+C*sy,B*ca-a*sa+lift,z+C*cy-A*sy]
 };
}
