function element(tag,text,cls){
 const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e
}
function choice(label,copy,selected,fn){
 const b=element('button',null,'choice');b.type='button';b.setAttribute('aria-pressed',String(selected));b.append(element('b',label));if(copy)b.append(element('small',copy));b.onclick=fn;return b
}
function setStage(){
 const p=profile;
 const sections={pilot:['OPERATIONS / 01','珊瑚湾空勤站','PELICAN POST / FLIGHT DIVISION'],map:['ROUTE SELECT / 02','前线侦察','ROUTE PREVIEW / LIVE 3D'],vehicle:['MOTOR POOL / 03','车库检阅区','MOTOR POOL / LIVE 3D']};
 const section=sections[tab];$('lobbyKicker').textContent=section[0];$('lobbyZone').textContent=section[1];$('lobbySide').textContent=section[2];
 if(tab==='map'){
  $('stageTag').textContent=map().tag;$('stageTitle').textContent=map().n;$('stageCopy').textContent=(p.name||'邮差')+' · '+ride().n+' · '+map().copy;
 }else if(tab==='vehicle'){
  $('stageTag').textContent=ride().tag;$('stageTitle').textContent=ride().n;$('stageCopy').textContent=(p.name||'邮差')+' · '+ride().copy;
 }else{
  $('stageTag').textContent='COURIER / FITTING ROOM';$('stageTitle').textContent=p.name||'新邮差';$('stageCopy').textContent=(p.sex==='female'?'母鹈鹕':'公鹈鹕')+' · '+wardrobe.top[p.wear.top]
 }
 $('stageTag').textContent=tab==='pilot'?'3D / COURIER STUDIO':$('stageTag').textContent;
 $('saluteReplay').hidden=tab!=='pilot';$('refView').hidden=tab!=='pilot';$('orbitPad').hidden=false;$('spinL').hidden=false;$('spinR').hidden=false
}
function chooseTab(t,force=false){
 if(!force&&t!=='pilot'&&!profile.name.trim()){
  if(tab!=='pilot')chooseTab('pilot',true);
  const inp=$('nameInput');inp.setCustomValidity('先为邮差取个名字');inp.reportValidity();inp.focus();return
 }
 if(t!==tab){saluteStop();referenceView=0;previewAngle=t==='pilot'?.48:-.42;$('refView').textContent='三视图'}tab=t;setStage();
 for(const b of document.querySelectorAll('[data-tab]')){b.setAttribute('aria-selected',String(b.dataset.tab===t));b.setAttribute('role','tab')}
 const title=$('garageTitle'),subtitle=element('em',t==='pilot'?'空勤小队 · 选择你的出战角色':t==='map'?'在路线场景中预览你的角色和载具。':'检阅载具，准备发车。');
 title.replaceChildren(document.createTextNode(t==='pilot'?'出战大厅':t==='map'?'路线简报':'载具检阅'),subtitle);
 const c=$('garageContent');c.replaceChildren();$('garageHint').textContent=t==='vehicle'?'方向键 / WASD 行驶 · Shift 特技 · 空格道具 · C 视角':t==='pilot'?'点选角色即可敬礼 · 拖动预览可旋转':'键盘与触控 · 可完全离线游玩';
 const next=$('next');next.textContent=t==='pilot'?'下一步：选择地图 →':t==='map'?'下一步：选择载具 →':'开始派送 →';
 next.onclick=()=>t==='pilot'?chooseTab('map'):t==='map'?chooseTab('vehicle'):start();
 const entry=$('raceEntry');entry.hidden=t!=='vehicle';entry.textContent=profile.raceBest?'雨林追逐赛 · 最快 '+profile.raceBest.time.toFixed(2)+' 秒 →':'雨林追逐赛 · 直接发车 →';
 if(t==='pilot'){
  const lab=element('label','角色名称'),input=element('input');lab.htmlFor='nameInput';input.id='nameInput';input.maxLength=18;input.required=true;input.placeholder='例如：阿湾';input.value=profile.name;input.autocomplete='off';
  input.oninput=()=>{input.setCustomValidity('');profile.name=input.value.trim();save();setStage()};
  input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();chooseTab('map')}};
  c.append(lab,input);
  const sexes=element('div',null,'choices two');sexes.append(
   choice('公鹈鹕','01 / PILOT',profile.sex==='male',()=>setSex('male')),
   choice('母鹈鹕','02 / PILOT',profile.sex==='female',()=>setSex('female'))
  );sexes.style.marginTop='8px';c.append(sexes);
  const fits=element('div',null,'choices');fits.style.cssText='grid-template-columns:repeat(4,1fr);margin-top:8px';
  Object.entries({hero:'飞行邮差',post:'经典邮差',sail:'复古海滨',neon:'霓虹车手'}).forEach(([k,v])=>{
   const b=element('button',v);b.style.fontSize='11px';b.onclick=()=>{Object.assign(profile.wear,presets[k]);save();chooseTab('pilot')};fits.append(b)
  });c.append(fits);
  const options=element('div',null,'wardrobe');
  for(const [k,label] of Object.entries({hat:'帽子',glasses:'眼镜',top:'上衣',scarf:'围巾',cape:'披风'})){
   const l=element('label',label),sel=element('select');sel.setAttribute('aria-label',label);
   for(const [value,text] of Object.entries(wardrobe[k])){
    let op=element('option',text);op.value=value;
    if((value==='sunset'||value==='gold')&&!profile.unlocks[value]){op.disabled=true;op.textContent+='（挑战解锁）'}
    sel.append(op)
   }sel.value=profile.wear[k];sel.onchange=()=>{profile.wear[k]=sel.value;save();setStage()};l.append(sel);options.append(l)
  }c.append(options)
 }else{
  const set=t==='map'?maps:vehicles, wrap=element('div',null,'choices'+(t==='vehicle'?' two':''));
  for(const [k,d] of Object.entries(set)){
   let copy=d.copy;
   if(t==='map'){
    const challenge={coast:'64 米栈道 / 3 次特技',canyon:'无伤 / 100 张船票',port:'S 级 / 两次绿灯穿闸',jungle:'避开积水 / S 级',alpine:'避开冰面 / S 级'}[k];
    copy+=' · '+d.goal+' m · 挑战 '+(profile.medals[k]?.length||0)+'/2：'+challenge
   }
   wrap.append(choice(d.n,copy,profile[t]===k,()=>{
    profile[t]=k;save();reset();chooseTab(t)
   }))
  }c.append(wrap);
  if(t==='map'){
   const title=element('div','预览载具','routeRideLabel'),strip=element('div',null,'routeRides');
   for(const [k,v] of Object.entries(vehicles))strip.append(choice(k==='skate'?'滑板':v.n,null,profile.vehicle===k,()=>{profile.vehicle=k;save();chooseTab('map')}));
   c.append(title,strip);
  }
  if(t==='vehicle'){
   const label=element('label','车身涂装'),s=element('select');s.setAttribute('aria-label','车身涂装');
   for(const [k,n] of Object.entries(wardrobe.paint)){const op=element('option',n);op.value=k;if(k==='neon'&&!profile.unlocks.neon){op.disabled=true;op.textContent+='（挑战解锁）'}s.append(op)}
   s.value=profile.wear.paint;s.onchange=()=>{profile.wear.paint=s.value;save()};label.append(s);c.append(label);
   const r=profile.bests[profile.map+'-'+profile.vehicle];
   if(r){
    const l=element('label',' 追逐幽灵 · 纪录 '+r.time.toFixed(1)+' 秒 / '+r.grade+' 级'),box=element('input');
    box.type='checkbox';box.checked=ghostEnabled;box.style.width='auto';box.onchange=()=>ghostEnabled=box.checked;l.prepend(box);c.append(l)
   }
  }
 }
}
function setSex(s){
 if(profile.sex!==s){profile.sex=s;Object.assign(profile.wear,profile.wear.top==='hero'?presets.hero:s==='female'?presets.sail:presets.post);save();chooseTab('pilot')}
 saluteStart()
}
const refLabels=['三视图','正面','侧面','背面'];
function clearReference(){referenceView=0;$('refView').textContent=refLabels[0]}
$('saluteReplay').onclick=saluteStart;
$('refView').onclick=()=>{saluteStop();referenceView=(referenceView+1)%4;previewAngle=[.48,0,Math.PI*.5,Math.PI][referenceView];$('refView').textContent=refLabels[referenceView]};
let orbitDrag=null;
const orbitPad=$('orbitPad');
orbitPad.addEventListener('pointerdown',e=>{saluteStop();clearReference();orbitDrag={id:e.pointerId,x:e.clientX};orbitPad.setPointerCapture(e.pointerId)});
orbitPad.addEventListener('pointermove',e=>{if(orbitDrag?.id===e.pointerId){previewAngle+=(e.clientX-orbitDrag.x)*.013;orbitDrag.x=e.clientX}});
for(const name of ['pointerup','pointercancel','lostpointercapture'])orbitPad.addEventListener(name,()=>{orbitDrag=null});
$('spinL').onclick=()=>{saluteStop();clearReference();previewAngle-=Math.PI/5};$('spinR').onclick=()=>{clearReference();previewAngle+=Math.PI/5};
for(const b of document.querySelectorAll('[data-tab]'))b.onclick=()=>chooseTab(b.dataset.tab);
$('sound').onclick=()=>{
 muted=!muted;profile.sound=!muted;save();$('sound').textContent=muted?'×♪':'♪';$('sound').setAttribute('aria-pressed',String(!muted));if(!muted)tone('start')
};
$('sound').textContent=muted?'×♪':'♪';$('sound').setAttribute('aria-pressed',String(!muted));
$('pause').onclick=pause;$('cam').onclick=cameraNext;$('use').onclick=use;
$('raceEntry').onclick=()=>{profile.map='jungle';profile.vehicle='car';start(true)};
$('again').onclick=()=>mode==='pause'?pause():start(Boolean(state.race));$('back').onclick=back;
window.addEventListener('keydown',e=>{
 if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;
 if(roadKeys.includes(e.code)&&mode==='play'){e.preventDefault();keys.add(e.code);return}
 if(e.repeat)return;
 if(e.code==='Space'&&mode==='play'){e.preventDefault();use()}
 if(e.code==='ShiftLeft'||e.code==='ShiftRight'){if(mode==='play'){e.preventDefault();action()}}
 if(e.code==='KeyC')cameraNext();
 if(e.code==='Escape'||e.code==='KeyP')pause();
 if(e.code==='KeyM')$('sound').click()
});
window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{keys.clear();if(mode==='play')pause()});
for(const b of $('touch').querySelectorAll('button')){
 const k=b.dataset.key;
 b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);if(k==='action')action();else keys.add(k)});
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>keys.delete(k))
}
reset();visibility();chooseTab('pilot',true);
function loop(ms){
 let dt=last?Math.min(.05,(ms-last)/1000):.016;last=ms;
 if(mode==='garage'||mode==='play'){time+=dt;advance(dt);if(time>toastUntil)$('toast').hidden=true}
 updateLobby();flash=Math.max(0,flash-dt*2.6);$('flash').style.opacity=flash;render(dt);if(mode!=='garage')hud();
 requestAnimationFrame(loop)
}
requestAnimationFrame(loop);
