/* ─── STATE ─── */
const S = {
  rxnType:'acid-base', selChem:null,
  liquidLevel:0, liquidColor:'rgba(0,229,255,0.35)',
  ph:7.0, temp:25, conc:5.0, strength:50,
  rate:0, gas:0,
  isMixing:false, isPoured:false,
  chemAdded:[], logEntries:[], lastMsg:''
};

const $ = id => document.getElementById(id);

/* ─── NAV ─── */
function setNav(el, key) {
  addLog('Navigation target: ' + key.toUpperCase() + '. Chemistry Lab remains active.','info');
}

/* ─── FLOATING MOLECULES ─── */
const mols=['H₂O','CO₂','OH⁻','H⁺','Na⁺','Cl⁻','O₂','HCl','NaOH'];
const mf = $('mol-field');
function spawnMol() {
  const e=document.createElement('div'); e.className='mol-p';
  e.textContent=mols[Math.floor(Math.random()*mols.length)];
  e.style.left=Math.random()*90+'%'; e.style.bottom='-20px';
  const d=12+Math.random()*10; e.style.animationDuration=d+'s';
  e.style.animationDelay=Math.random()*4+'s';
  e.style.fontSize=(7+Math.random()*5)+'px';
  mf.appendChild(e); setTimeout(()=>e.remove(),(d+5)*1000);
}
setInterval(spawnMol,2800);
for(let i=0;i<4;i++) spawnMol();

/* ─── LOG ─── */
function addLog(msg, type='') {
  if(msg===S.lastMsg) return; S.lastMsg=msg;
  const now=new Date().toTimeString().slice(0,8);
  S.logEntries.push({now,msg,type});
  const el=document.createElement('div');
  el.className='log-entry'+(type?' log-'+type:'');
  el.innerHTML=`<span class="log-t">[${now}]</span><span class="log-m">${msg}</span>`;
  const lg=$('obs-log'); lg.appendChild(el); lg.scrollTop=lg.scrollHeight;
  $('log-cnt').textContent=`[${S.logEntries.length} entries]`;
}
addLog('Lab initialized. Ready to experiment.','info');

/* ─── HINT ─── */
const hints={idle:'Select a chemical source to begin.',selected:'Pour the selected chemical into the beaker.',poured:'Mix the reaction to analyze the result.',mixed:'Reset the chamber to start a new test.',indicator:'Add indicator to observe pH color change.'};
const setHint = k => $('hint-body').textContent = hints[k]||hints.idle;

/* ─── REACTION TYPE ─── */
const rxnFormulas = {
  'acid-base':'<div class="formula-head">▸ CONCEPT FORMULA</div><div class="formula-line"><span class="f-hl">Acid</span> <span class="f-eq">+</span> <span class="f-hl">Base</span> <span class="f-eq">→</span> Salt <span class="f-eq">+</span> H₂O</div><div class="formula-head" style="margin-top:5px">▸ ION REACTION</div><div class="formula-line"><span class="f-hl">H⁺</span> <span class="f-eq">+</span> <span class="f-hl">OH⁻</span> <span class="f-eq">→</span> H₂O</div>',
  'ph-test':'<div class="formula-head">▸ PH INDICATOR</div><div class="formula-line">Indicator detects <span class="f-hl">H⁺</span> / <span class="f-hl">OH⁻</span> concentration</div><div class="formula-head" style="margin-top:5px">▸ COLOR CHANGE</div><div class="formula-line"><span class="f-hl">pH &lt;7</span> <span class="f-eq">→</span> Red (Acidic)</div><div class="formula-line"><span class="f-hl">pH =7</span> <span class="f-eq">→</span> Green (Neutral)</div><div class="formula-line"><span class="f-hl">pH &gt;7</span> <span class="f-eq">→</span> Blue (Basic)</div>',
  'gas-reaction':'<div class="formula-head">▸ GAS FORMULA</div><div class="formula-line"><span class="f-hl">Acid</span> <span class="f-eq">+</span> Carbonate <span class="f-eq">→</span> CO₂ <span class="f-eq">+</span> H₂O</div><div class="formula-head" style="margin-top:5px">▸ GAS OUTPUT</div><div class="formula-line">Bubble rate <span class="f-hl">↑</span> with concentration</div>'
};
const rxnBadges={'acid-base':'ACID BASE MODE','ph-test':'PH TEST MODE','gas-reaction':'GAS REACTION MODE'};
function setRxn(btn) {
  document.querySelectorAll('.tgl-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  S.rxnType=btn.dataset.rxn;
  $('formula-box').innerHTML=rxnFormulas[S.rxnType];
  $('mode-badge').textContent=rxnBadges[S.rxnType];
  $('sb-mode').textContent=S.rxnType.toUpperCase().replace('-',' ');
  addLog('Mode set: '+rxnBadges[S.rxnType],'info');
  resetChamber(true); setHint('idle');
}

/* ─── CHEM SELECT ─── */
function selectChem(btn) {
  document.querySelectorAll('.reagent-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
  S.selChem=btn.dataset.chem;
  highlightBottle(S.selChem);
  $('sel-label').textContent='▸ '+S.selChem.toUpperCase()+' SELECTED';
  $('sel-label').classList.add('on');
  addLog(S.selChem.charAt(0).toUpperCase()+S.selChem.slice(1)+' selected.','warn');
  setHint(S.selChem==='indicator'?'indicator':'selected');
}
function selectChem2(chem) {
  S.selChem=chem;
  document.querySelectorAll('.reagent-btn').forEach(b=>b.classList.toggle('selected',b.dataset.chem===chem));
  highlightBottle(chem);
  $('sel-label').textContent='▸ '+chem.toUpperCase()+' SELECTED';
  $('sel-label').classList.add('on');
  addLog(chem.charAt(0).toUpperCase()+chem.slice(1)+' selected.','warn');
  setHint(chem==='indicator'?'indicator':'selected');
}
function highlightBottle(chem) {
  ['acid','base','indicator','water'].forEach(c=>{
    const b=$('bot-'+c);
    if(b) b.classList.toggle('sel',c===chem);
  });
}

/* ─── SLIDERS ─── */
function onConc(sl){
  S.conc=parseFloat((sl.value/10).toFixed(1));
  $('sv-conc').textContent=S.conc.toFixed(1)+' mol/L';
  if(S.isMixing) recalc();
}
function onTemp(sl){
  S.temp=parseInt(sl.value);
  $('sv-temp').textContent=S.temp+'°C';
  $('m-temp').textContent=S.temp+'°C';
  $('sb-temp').textContent=S.temp+'°C';
  updateTempStatus(S.temp);
  updateBarTemp(S.temp);
  if(S.temp>60){addLog('High temperature detected.','danger');showVapor(true,true);}
  else if(S.temp>30) showVapor(true,false);
  else showVapor(false,false);
}
function onStr(sl){
  S.strength=parseInt(sl.value);
  $('sv-str').textContent=S.strength+'%';
  if(S.isMixing) recalc();
}
function updateTempStatus(v) {
  const t=v<30?'LOW':v<=60?'NORMAL':'HIGH';
  const c=v<30?'pill-low':v<=60?'pill-normal':'pill-high';
  [$('sp-temp'),$('sp-temp2')].forEach(e=>{e.textContent=t;e.className='status-pill '+c;});
}
function updateBarTemp(v) {
  const bar=$('bar-temp');
  bar.style.width=(v)+'%';
  bar.style.background=v<30?'linear-gradient(90deg,var(--blue-accent),var(--cyan))':v<=60?'linear-gradient(90deg,var(--cyan-dim),var(--green))':'linear-gradient(90deg,var(--yellow),var(--orange))';
}

/* ─── VAPOR ─── */
function showVapor(show,intense){
  const v=$('vapor-wrap');
  v.style.display=show?'block':'none';
  v.querySelectorAll('.vap').forEach(p=>p.style.background=intense?'rgba(180,220,255,0.14)':'rgba(180,220,255,0.06)');
}

/* ─── LIQUID ─── */
let surfInt=null;
function setLiquid(pct, color) {
  const h=(pct/100)*147, y=165-h;
  const lr=$('liq-rect'), ls=$('liq-surface'), lsh=$('liq-shimmer');
  lr.setAttribute('y',y); lr.setAttribute('height',h); lr.setAttribute('fill',color);
  lsh.setAttribute('y',y); lsh.setAttribute('opacity',pct>5?'1':'0');
  if(surfInt) clearInterval(surfInt);
  let ph=0;
  surfInt=setInterval(()=>{
    ph+=0.07;
    const w1=8*Math.sin(ph), w2=7*Math.sin(ph*1.3+1);
    ls.setAttribute('d',`M20 ${y+w1} Q55 ${y-4+w2} 75 ${y+w1} Q100 ${y+4+w2} 130 ${y+w1} L130 ${y+3} Q100 ${y+7+w2} 75 ${y+3} Q55 ${y-1+w2} 20 ${y+3} Z`);
    ls.setAttribute('fill',color.replace(/[\d.]+\)$/,'0.4)'));
  },50);
}

/* ─── BUBBLES ─── */
const canvas=$('bubble-canvas'), ctx=canvas.getContext('2d');
let bubbles=[], bubbleInt=null;
function spawnBubble(){
  const n=S.rxnType==='gas-reaction'?3:1;
  for(let i=0;i<n;i++) bubbles.push({x:28+Math.random()*94,y:175,r:2+Math.random()*3.5,speed:0.5+Math.random()*1.4,opacity:0.7+Math.random()*0.3,drift:(Math.random()-0.5)*0.4});
}
function drawBubbles(){
  ctx.clearRect(0,0,150,190);
  bubbles=bubbles.filter(b=>b.y>0);
  bubbles.forEach(b=>{
    b.y-=b.speed; b.x+=b.drift; b.opacity*=0.996;
    const ly=165-((S.liquidLevel/100)*147);
    if(b.y<ly+5){b.opacity=0;return;}
    ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
    ctx.strokeStyle=`rgba(0,229,255,${b.opacity*0.65})`; ctx.lineWidth=1; ctx.stroke();
    ctx.beginPath(); ctx.arc(b.x-b.r*0.3,b.y-b.r*0.3,b.r*0.3,0,Math.PI*2);
    ctx.fillStyle=`rgba(255,255,255,${b.opacity*0.45})`; ctx.fill();
  });
}
function startBubbles(iv){
  stopBubbles();
  bubbleInt={s:setInterval(spawnBubble,iv),d:setInterval(drawBubbles,30)};
}
function stopBubbles(){
  if(bubbleInt){clearInterval(bubbleInt.s);clearInterval(bubbleInt.d);bubbleInt=null;ctx.clearRect(0,0,150,190);bubbles=[];}
}

/* ─── pH ─── */
function calcPH(){
  const fx={acid:-3.5,base:3.5,indicator:0,water:0};
  let d=0; S.chemAdded.forEach(c=>d+=fx[c]||0);
  const cf=(S.conc/5)*0.5, sf=(S.strength/100)*0.5;
  d*=(cf+sf);
  return Math.max(0,Math.min(14,7+d));
}
function updatePHDisplay(ph){
  $('m-ph').textContent=ph.toFixed(1);
  $('sb-ph').textContent=ph.toFixed(1);
  const pct=(ph/14)*100;
  const bar=$('bar-ph'), sp=$('sp-ph'), r=$('r-phst');
  bar.style.width=pct+'%';
  if(ph<7){bar.style.background='linear-gradient(90deg,var(--red),var(--orange))';sp.textContent='ACIDIC';sp.className='status-pill pill-acidic';r.textContent='ACIDIC';r.style.color='var(--red)';}
  else if(ph===7){bar.style.background='linear-gradient(90deg,var(--green),var(--cyan))';sp.textContent='NEUTRAL';sp.className='status-pill pill-neutral';r.textContent='NEUTRAL';r.style.color='var(--green)';}
  else{bar.style.background='linear-gradient(90deg,var(--purple),var(--blue-accent))';sp.textContent='BASIC';sp.className='status-pill pill-basic';r.textContent='BASIC';r.style.color='var(--purple)';}
}
function calcColor(){
  if(S.chemAdded.includes('indicator')){
    const ph=S.ph;
    if(ph<5) return 'rgba(255,61,90,0.5)'; if(ph<7) return 'rgba(255,140,0,0.4)';
    if(ph===7) return 'rgba(0,255,136,0.4)'; if(ph<=9) return 'rgba(79,195,247,0.4)';
    return 'rgba(168,85,247,0.45)';
  }
  if(S.chemAdded.includes('acid')) return 'rgba(255,80,60,0.3)';
  if(S.chemAdded.includes('base')) return 'rgba(168,85,247,0.3)';
  if(S.chemAdded.includes('water')) return 'rgba(79,195,247,0.25)';
  return 'rgba(0,229,255,0.35)';
}
function getColorName(){
  const ph=S.ph;
  if(S.chemAdded.includes('indicator')){
    if(ph<5)return'DEEP RED';if(ph<7)return'ORANGE';if(ph===7)return'GREEN';if(ph<=9)return'CYAN-BLUE';return'VIOLET';
  }
  if(S.chemAdded.includes('acid'))return'PALE RED';if(S.chemAdded.includes('base'))return'PALE VIOLET';if(S.chemAdded.includes('water'))return'CLEAR BLUE';return'CLEAR';
}

/* ─── RECALC ─── */
function recalc(){
  S.ph=calcPH();
  const tb=Math.max(1,S.temp/30), cb=S.conc/5;
  S.rate=parseFloat(Math.min(9.9,(S.strength/100)*cb*tb*2.5).toFixed(1));
  S.gas=S.rxnType==='gas-reaction'?parseFloat(Math.min(99,S.rate*10*cb).toFixed(1)):parseFloat((S.rate*2).toFixed(1));
  updatePHDisplay(S.ph);
  $('m-rate').textContent=S.rate.toFixed(1);
  $('bar-rate').style.width=(S.rate/9.9*100)+'%';
  $('sb-rate').textContent=S.rate.toFixed(1)+' mol/s';
  const rs=S.rate<1?'SLOW':S.rate<5?'STABLE':'FAST';
  const rsp=$('sp-rate'); rsp.textContent=rs; rsp.className='status-pill '+(rs==='SLOW'?'pill-low':rs==='STABLE'?'pill-normal':'pill-high');
  $('m-gas').textContent=S.gas.toFixed(1);
  $('bar-gas').style.width=Math.min(100,S.gas)+'%';
  const gs=S.gas<1?'NONE':S.gas<30?'LOW':'HIGH';
  const gsp=$('sp-gas'); gsp.textContent=gs; gsp.style.color=gs==='NONE'?'var(--text-muted)':gs==='LOW'?'var(--green)':'var(--orange)';
  S.liquidColor=calcColor();
  setLiquid(S.liquidLevel,S.liquidColor);
  $('r-col').textContent=getColorName();
}

/* ─── BEAKER GLOW ─── */
const setGlow=on=>$('glow-ring').classList.toggle('on',on);

/* ─── POUR ─── */
function pourChem(){
  if(!S.selChem){addLog('Select a chemical source first.','warn');return;}
  if(S.liquidLevel>=90){addLog('Beaker is full.','warn');return;}
  const ps=$('ps-'+S.selChem);
  if(ps){ps.style.display='block';setTimeout(()=>ps.style.display='none',800);}
  S.chemAdded.push(S.selChem);
  S.isPoured=true;
  S.liquidLevel=Math.min(90,S.liquidLevel+20+Math.random()*8);
  S.liquidColor=calcColor();
  setLiquid(S.liquidLevel,S.liquidColor);
  setGlow(true);
  const nm={acid:'Acid',base:'Base',indicator:'Indicator',water:'Water'};
  addLog(nm[S.selChem]+' poured into chamber.','warn');
  if(S.selChem==='acid') startBubbles(S.rxnType==='gas-reaction'?280:580);
  if(S.selChem==='indicator') addLog('Indicator added. Observe color shift.','info');
  const ph=calcPH();
  if(ph<7) addLog('pH dropped to acidic range.','danger');
  else if(ph>7) addLog('pH elevated to basic range.','info');
  $('rxn-badge').textContent='CHEMICAL ADDED';$('rxn-badge').classList.add('on');
  $('r-sol').textContent=S.chemAdded.map(c=>c.toUpperCase()).join(' + ');
  setHint('poured');
}

/* ─── MIX ─── */
function runMix(){
  if(!S.isPoured&&S.liquidLevel===0){addLog('Pour a chemical before mixing.','warn');return;}
  S.isMixing=true;
  addLog('Initiating reaction mix...','info');
  $('rxn-badge').textContent='REACTING...'; $('rxn-badge').classList.add('on');
  recalc();
  const ph=S.ph;
  if(ph<7) addLog(`pH stabilized at ${ph.toFixed(1)} — acidic.`,'danger');
  else if(ph===7) addLog('pH balanced at neutral 7.0.','ok');
  else addLog(`pH stabilized at ${ph.toFixed(1)} — basic.`,'info');
  if(S.temp>60) addLog('High temp accelerates reaction.','danger');
  if(S.rxnType==='gas-reaction'){startBubbles(190);addLog('CO₂ gas output rising.','warn');}
  if(S.chemAdded.includes('indicator')) addLog('Color shift observed with indicator.','ok');
  addLog('Reaction completed.','ok');
  $('r-rxn').textContent=S.rxnType==='acid-base'?'NEUTRALIZATION':S.rxnType==='ph-test'?'PH DETECTION':'GAS EVOLUTION';
  setHint('mixed');
  setTimeout(()=>$('rxn-badge').textContent='REACTION COMPLETE',1000);
}

/* ─── RESET ─── */
function resetChamber(silent=false){
  S.selChem=null; S.liquidLevel=0; S.liquidColor='rgba(0,229,255,0.35)';
  S.ph=7.0; S.rate=0; S.gas=0; S.isMixing=false; S.isPoured=false;
  S.chemAdded=[]; S.lastMsg='';
  setLiquid(0,S.liquidColor);
  if(surfInt) clearInterval(surfInt);
  stopBubbles(); showVapor(false,false); setGlow(false);
  document.querySelectorAll('.reagent-btn').forEach(b=>b.classList.remove('selected'));
  ['acid','base','indicator','water'].forEach(c=>{const b=$('bot-'+c);if(b)b.classList.remove('sel');});
  $('sel-label').textContent='— NO CHEMICAL SELECTED —'; $('sel-label').classList.remove('on');
  updatePHDisplay(7.0);
  $('m-temp').textContent='25°C'; $('m-rate').textContent='0.0'; $('m-gas').textContent='0.0';
  $('bar-rate').style.width='0%'; $('bar-gas').style.width='0%';
  $('r-sol').textContent='DISTILLED H₂O'; $('r-col').textContent='CLEAR'; $('r-rxn').textContent='NONE';
  $('rxn-badge').textContent='CHAMBER IDLE'; $('rxn-badge').classList.remove('on');
  $('sb-ph').textContent='7.0'; $('sb-rate').textContent='0.0 mol/s'; $('sb-temp').textContent='25°C';
  if(!silent) addLog('Chamber reset. Ready for new experiment.','info');
  setHint('idle');
}

/* ─── INIT ─── */
setLiquid(0,S.liquidColor);
updatePHDisplay(7.0);
updateTempStatus(25);
updateBarTemp(25);
