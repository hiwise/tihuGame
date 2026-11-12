'use strict';
const $=id=>document.getElementById(id),cv=$('view'),ctx=cv.getContext('2d',{alpha:false}),mesh=$('mesh');
const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
const palette={tire:'#203238',rim:'#d4ead7',bike:'#e9563e',cream:'#fff0d3',white:'#fff8e7',wing:'#e1dfca',ink:'#293c42',bill:'#f8b652',pouch:'#f28f55',metal:'#789b98',post:'#9fefcc',dark:'#245752'};
const items={shield:{name:'泡泡护盾',color:'#46e0c7',msg:'护盾 · 抵挡一次撞击'},magnet:{name:'船票磁铁',color:'#ee8ed2',msg:'磁铁 · 6 秒自动吸票'},boost:{name:'气泡氮气',color:'#ffb644',msg:'氮气 · 4 秒加速与护体'}};
const maps={
 coast:{n:'珊瑚湾',tag:'01 / CORAL BAY',copy:'晴日海岸 · 栈道捷径',goal:1500,base:1,curve:1,sky:['#4997a5','#9bd9ce','#ffe3a8'],fog:[164,216,202]},
 canyon:{n:'落霞峡谷',tag:'02 / AMBER CANYON',copy:'盘山红岩 · 落石预警',goal:1280,base:2,curve:2.35,sky:['#944d65','#dd8b68','#ffd29a'],fog:[221,153,109]},
 port:{n:'霓虹港',tag:'03 / NEON HARBOR',copy:'雨夜集装箱 · 信号闸门',goal:1380,base:3,curve:1.48,sky:['#10223f','#2e4868','#68628b'],fog:[71,89,126]},
 jungle:{n:'翡翠雨林',tag:'04 / EMERALD FOREST',copy:'湿地雾林 · 水坑与瀑布桥',goal:1540,base:4,curve:2.05,sky:['#375c60','#7fa69a','#c6cda7'],fog:[127,158,137]},
 alpine:{n:'银脊山道',tag:'05 / SILVER RIDGE',copy:'雪峰隧道 · 冰面漂移',goal:1460,base:5,curve:2.7,sky:['#2b658e','#87b9d1','#dbe6df'],fog:[164,194,211]}
};
const vehicles={
 bike:{n:'自行车',tag:'01 / COURIER BICYCLE',copy:'轻快好控 · 兔跳越过路锥',action:'兔跳',base:14,max:20,acc:2.5,steer:8.4},
 moto:{n:'摩托车',tag:'02 / SUNSET SCRAMBLER',copy:'加速敏锐 · 压弯冲刺',action:'压弯',base:19,max:28,acc:3.25,steer:8.6},
 car:{n:'赛车',tag:'03 / HARBOR GT',copy:'第一人称驾驶舱 · 蓄能氮气',action:'氮气',base:26,max:42,acc:2.7,steer:9.0},
 skate:{n:'街式滑板',tag:'04 / STREET SKATE',copy:'站板蹬地 · 豚跳越过路锥',action:'豚跳',base:15,max:22,acc:2.3,steer:10.2}
};
const wardrobe={
 hat:{none:'不戴帽',post:'经典邮差帽',visor:'复古遮阳帽',helmet:'霓虹护盔'},
 glasses:{none:'不戴眼镜',cat:'猫眼墨镜',pilot:'飞行护目镜',sunset:'夕阳护目镜'},
 top:{hero:'深蓝飞行邮差服',post:'邮差短夹克',sail:'露肩海滨装',neon:'霓虹车手服'},
 scarf:{none:'不系围巾',red:'珊瑚红围巾',mint:'海风薄荷飘带',gold:'金色纪念围巾'},
 cape:{off:'不戴披风',on:'红色金边披风'},
 paint:{coral:'珊瑚红车漆',mint:'海湾绿车漆',sun:'夕阳金车漆',neon:'霓虹紫车漆'}
};
const presets={hero:{hat:'none',glasses:'none',top:'hero',scarf:'red'},post:{hat:'post',glasses:'none',top:'post',scarf:'red'},sail:{hat:'visor',glasses:'cat',top:'sail',scarf:'mint'},neon:{hat:'helmet',glasses:'pilot',top:'neon',scarf:'none'}};
const paint={coral:'#ec664b',mint:'#55ae9a',sun:'#e7ab51',neon:'#ad83ed'};
const defaults={name:'',sex:'male',map:'coast',vehicle:'bike',wear:{...presets.hero,paint:'coral',cape:'off'},bests:{},unlocks:{},medals:{},raceBest:null,sound:true};
function load(){
 try{
  const a=JSON.parse(localStorage.getItem('tihu-game-v1')||'{}'),o={...defaults,...a,wear:{...defaults.wear,...a.wear}};
  if(!maps[o.map])o.map='coast';if(o.vehicle==='stool'){o.vehicle='skate';for(const k of Object.keys(o.bests||{}))if(k.endsWith('-stool'))delete o.bests[k]}if(!vehicles[o.vehicle])o.vehicle='bike';if(typeof o.name!=='string')o.name='';o.sex=o.sex==='female'?'female':'male';
  for(const k in wardrobe)if(!wardrobe[k][o.wear[k]])o.wear[k]=defaults.wear[k];
  o.bests=o.bests&&typeof o.bests==='object'?o.bests:{};o.unlocks=o.unlocks&&typeof o.unlocks==='object'?o.unlocks:{};o.medals=o.medals&&typeof o.medals==='object'?o.medals:{};return o
 }catch{return {...defaults,wear:{...defaults.wear},bests:{},unlocks:{},medals:{}}}
}
const profile=load();function save(){try{localStorage.setItem('tihu-game-v1',JSON.stringify(profile));return true}catch{return false}}
const map=()=>maps[profile.map], ride=()=>vehicles[profile.vehicle];
let W,H,DPR,originX,originY,focal,faces=[],eye,basis,time=0,last=0,mode='garage',cam=0,camPose=null,Wob=0,toastUntil=0,flash=0,muted=!profile.sound,audio;
let keys=new Set(),obstacles=[],scene=[],sparks=[],state,previewAngle=.48,referenceView=0,orthographic=0,tab='pilot',ghostEnabled=true;
const distGoal=()=>map().goal;
function roadX(z){return mode==='garage'?0:map().curve*(9*Math.sin(z*.012)+5*Math.sin(z*.022))}

function elevation(z){
 if(mode==='garage')return 0;
 if(profile.map==='canyon')return 4.2*Math.sin(z*.023)+2.2*Math.sin(z*.043)+3.4*Math.exp(-(((z-556)/88)**2));
 if(profile.map==='jungle')return 3.2*Math.sin(z*.020)+1.6*Math.sin(z*.041);
 if(profile.map==='alpine')return 5.5*Math.sin(z*.019)+2.1*Math.sin(z*.034);
 if(profile.map==='port')return 1.50*Math.sin(z*.024)+.70*Math.sin(z*.041);
 return 1.95*Math.sin(z*.025)+.80*Math.sin(z*.049);
}
function roadY(z){
 const a=Math.floor(z/4)*4;
 return lerp(elevation(a),elevation(a+4),(z-a)/4)
}
function worldPoint([x,y,z]){return [x+roadX(z),y+roadY(z),z]}
