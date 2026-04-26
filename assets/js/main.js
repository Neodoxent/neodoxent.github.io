(function(){
"use strict";

const M = window.NEODOXENT_MODULES || [];
const S = window.NEODOXENT_STATE;
const LOG_KEY = 'neodoxent_field_log';
const COLLAPSE_KEY = 'neodoxent_collapsed_modules';
const LAST_STATE_KEY = 'neodoxent_last_field_signature';

if(!S){ console.error('NEODOXENT_STATE missing.'); return; }

function el(q){ return document.querySelector(q); }
function setText(id,value){ const node=document.getElementById(id); if(node) node.textContent=String(value); }
function getJson(key,fallback){ try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch(e){ return fallback; } }
function setJson(key,value){ localStorage.setItem(key, JSON.stringify(value)); }
function getLog(){ return getJson(LOG_KEY, []); }
function saveLog(log){ setJson(LOG_KEY, log.slice(-260)); }
function stamp(){ return new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', second:'2-digit' }); }
function pct(value,max){ return Math.max(0, Math.min(100, Math.round((Number(value||0)/max)*100))); }
function clamp(value,min,max){ return Math.max(min, Math.min(max, value)); }

function deriveResponse(state){
  const r = state.resources || {};
  const c = state.coupling || {};
  const qSpread = Object.values(state.qbits || {}).filter(v=>v>0).length;
  const sSpread = Object.values(state.strata || {}).filter(v=>v>0).length;
  const accepted = (state.accepted || []).length;
  const pace = Math.floor(accepted / Math.max(1, (state.time || 1) / 90));
  const imbalance = Math.max(0, (state.coherence||0) - ((r.signal||0) + (r.attention||0)));
  const stability = clamp((c.orientationDamping||0) + (c.traceMemory||0) + Math.floor((r.witness||0)/2), 0, 12);
  const tension = clamp((state.entanglement||0) + imbalance + pace - (c.orientationDamping||0), 0, 18);
  const readiness = clamp((c.attentionSignal||0) + (c.signalCoherence||0) + (c.coherenceResonance||0) + stability - Math.floor(tension/3), 0, 18);
  const pressure = clamp(tension - stability + Math.floor((qSpread+sSpread)/3), 0, 12);
  let mode = 'Listening';
  if(tension >= 12 && readiness <= 3) mode = 'Overloaded';
  else if(pressure >= 7) mode = 'Resistant';
  else if(readiness >= 9 && stability >= 5) mode = 'Receptive';
  else if(stability >= 5) mode = 'Stabilizing';
  return { mode, tension, readiness, pressure, stability };
}

function ensureFieldLog(){
  let terminal = el('#field-log-terminal');
  if(terminal) return terminal;
  terminal = document.createElement('div');
  terminal.id = 'field-log-terminal';
  terminal.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:2147483647;background:#030303;color:#d8d2c6;border-top:1px solid rgba(194,161,90,.55);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;box-shadow:0 -16px 50px rgba(0,0,0,.65);';
  terminal.innerHTML = '<div id="field-log-bar" style="height:42px;display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:0 1rem;cursor:pointer;user-select:none;"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"><span style="color:#c2a15a;letter-spacing:.08em;">FIELD LOG</span> <span id="field-log-latest" style="opacity:.72;">— Online.</span></div><div id="field-log-toggle" style="opacity:.72;flex:0 0 auto;">+</div></div><div id="field-log-body" style="display:none;height:280px;overflow-y:auto;overflow-x:hidden;padding:0 1rem 1rem;"></div>';
  document.body.appendChild(terminal);
  document.body.style.paddingBottom = '3.25rem';
  terminal.querySelector('#field-log-bar').onclick = () => {
    terminal.classList.toggle('open');
    const open = terminal.classList.contains('open');
    terminal.querySelector('#field-log-body').style.display = open ? 'block' : 'none';
    terminal.querySelector('#field-log-toggle').textContent = open ? '−' : '+';
  };
  return terminal;
}

function writeLog(message,type='field'){
  const log = getLog();
  const last = log[log.length-1];
  if(last && last.message === message && last.type === type) return;
  log.push({ time: stamp(), message, type });
  saveLog(log);
  renderLog();
}

function renderLog(){
  const terminal = ensureFieldLog();
  const log = getLog();
  const latest = log[log.length-1];
  const latestNode = terminal.querySelector('#field-log-latest');
  const body = terminal.querySelector('#field-log-body');
  latestNode.textContent = latest ? '— ' + latest.message : '— Online.';
  body.innerHTML = log.slice().reverse().map(entry => {
    const color = entry.type === 'unlock' ? '#6a8f8a' : entry.type === 'accept' ? '#c2a15a' : entry.type === 'segment' ? '#e7e1d6' : entry.type === 'coupling' ? '#9bc7c1' : entry.type === 'response' ? '#d9b46f' : entry.type === 'audit' ? '#d1a66a' : '#9c958b';
    return '<div style="padding:.32rem 0;border-bottom:1px solid rgba(255,255,255,.05);"><span style="opacity:.55;">'+entry.time+'</span> <span style="color:'+color+';">'+entry.message+'</span></div>';
  }).join('') || '<div style="opacity:.65;padding:.4rem 0;">No events recorded yet.</div>';
}

function snapshotVisible(){ const visible = new Set(); M.forEach(module => { const node = el('[data-module="'+module.id+'"]'); if(node && !node.classList.contains('hidden')) visible.add(module.id); }); return visible; }
let booted = false;

function meetsRequirements(module,state){
  const req = module.requires || {};
  if(req.accepted && !req.accepted.every(id => state.accepted.includes(id))) return false;
  if(req.strata && !Object.entries(req.strata).every(([k,v]) => (state.strata[k]||0) >= v)) return false;
  if(req.qbits && !Object.entries(req.qbits).every(([k,v]) => (state.qbits[k]||0) >= v)) return false;
  if(req.resources && !Object.entries(req.resources).every(([k,v]) => (state.resources[k]||0) >= v)) return false;
  if(req.coherence && state.coherence < req.coherence) return false;
  if(req.complexity && state.complexity < req.complexity) return false;
  if(req.entanglement && state.entanglement < req.entanglement) return false;
  if(req.orientation && state.orientation < req.orientation) return false;
  return true;
}

function auditSystem(state){
  const issues = [];
  if(!Array.isArray(M) || M.length === 0) issues.push('No modules loaded.');
  M.forEach(module => {
    const node = el('[data-module="'+module.id+'"]');
    if(!node) issues.push('Missing DOM node for '+module.id+'.');
    if(module.segments && module.segments.length && !module.acceptRequires) issues.push(module.id+' has segments but no acceptRequires.');
  });
  if(!S.canAccept || !S.completeSegment) issues.push('State engine API incomplete.');
  if(issues.length) writeLog('Systems-check: '+issues.length+' issue(s): '+issues.join(' '),'audit');
  else writeLog('Systems-check complete: shell, engine, modules, log, and gates online.','audit');
}

function signature(state){
  const response = deriveResponse(state);
  return { aura: state.aura, vector: state.vector, complexity: state.complexity, resonance: state.resonance, manifestFactor: state.manifestFactor, acceptedCount: state.accepted.length, coupling: state.coupling || {}, response };
}

function observeField(state){
  const previous = getJson(LAST_STATE_KEY, null);
  const current = signature(state);
  if(previous){
    if(previous.aura !== current.aura) writeLog('Aura shifted: '+previous.aura+' → '+current.aura+'.','coupling');
    if(previous.vector !== current.vector) writeLog('Vector shifted: '+previous.vector+' → '+current.vector+'.','coupling');
    if(previous.response && previous.response.mode !== current.response.mode) writeLog('Response shifted: '+previous.response.mode+' → '+current.response.mode+'.','response');
    Object.entries(current.coupling || {}).forEach(([key,value]) => { const old = previous.coupling ? previous.coupling[key] : undefined; if(value > 0 && value !== old) writeLog('Coupling adjusted: '+key+' = '+value+'.','coupling'); });
  }
  setJson(LAST_STATE_KEY, current);
}

function renderIndex(state){
  const response = deriveResponse(state);
  let idx = el('#indexical');
  if(!idx){ idx = document.createElement('div'); idx.id='indexical'; idx.style.cssText='padding:.5rem 1rem;font-size:.8rem;opacity:.72;border-bottom:1px solid rgba(255,255,255,.08);'; document.body.prepend(idx); }
  idx.innerHTML = '<strong>Node:</strong> Meta-Landing | <strong>Vector:</strong> '+(state.vector||'zephyr')+' | <strong>Aura:</strong> '+(state.aura||'Unformed')+' | <strong>Complexity:</strong> '+(state.complexity||0)+' | <strong>Manifest:</strong> '+(state.manifestFactor||0)+' | <strong>Response:</strong> '+response.mode;
}

function renderResources(state){
  let panel = el('#resource-panel');
  if(!panel){ panel=document.createElement('div'); panel.id='resource-panel'; panel.style.cssText='margin:0 1rem 1rem;padding:.75rem 1rem;font-size:.85rem;border-bottom:1px solid rgba(255,255,255,.08);'; document.body.insertBefore(panel, document.body.children[1] || null); }
  const r=state.resources||{}, c=state.coupling||{}, response=deriveResponse(state);
  panel.innerHTML='<strong>Field Resources</strong><br>Attention: '+(r.attention||0)+' | Orientation: '+(r.orientation||0)+' | Signal: '+(r.signal||0)+'<br>Resonance: '+(r.resonance||0)+' | Witness: '+(r.witness||0)+' | Trace: '+(r.trace||0)+'<br><span style="opacity:.72">Couplings: AS '+(c.attentionSignal||0)+' · SC '+(c.signalCoherence||0)+' · CR '+(c.coherenceResonance||0)+' · OD '+(c.orientationDamping||0)+' · TM '+(c.traceMemory||0)+'</span><br><span style="opacity:.72">Response: '+response.mode+' · tension '+response.tension+' · readiness '+response.readiness+' · pressure '+response.pressure+' · stability '+response.stability+'</span>';
}

function setGauge(id,value,max){ const text=document.getElementById(id); if(text) text.textContent=String(value||0); const gauge=text && text.closest('.gauge'); const fill=gauge && gauge.querySelector('.gauge-fill'); if(fill) fill.style.setProperty('--value', pct(value,max)+'%'); }
function renderFieldState(state){ setText('state-complexity', state.complexity||0); setText('state-aura', state.aura||'Unformed'); setText('state-vector', state.vector||'zephyr'); setText('state-entanglement', state.entanglement||0); setGauge('state-bits', state.bits||0, 32); setGauge('state-coherence', state.coherence||0, 16); setGauge('state-orientation', state.orientation||0, 10); }
function dwellText(module){ const required=(module.acceptRequires&&module.acceptRequires.dwellSeconds)||module.dwellSeconds||0; if(!required) return ''; const elapsed=S.dwellElapsed?S.dwellElapsed(module.id):0; return elapsed>=required?'Field stabilized. ('+elapsed+'s / '+required+'s)':'Field stabilizing… ('+elapsed+'s / '+required+'s)'; }

function renderSegments(module,node){
  if(!module.segments||!module.segments.length) return;
  S.enter(module.id);
  let wrap=node.querySelector('.segments'); if(!wrap){ wrap=document.createElement('div'); wrap.className='segments'; wrap.style.marginTop='1rem'; node.appendChild(wrap); }
  const state=S.get(), completed=Object.keys((state.segments&&state.segments[module.id])||{}).length, total=module.segments.length;
  wrap.innerHTML='';
  const meta=document.createElement('div'); meta.style.cssText='font-size:.78rem;opacity:.76;margin-bottom:.75rem;'; meta.textContent='Progress: '+completed+' / '+total+(dwellText(module)?' · '+dwellText(module):''); wrap.appendChild(meta);
  module.segments.forEach(seg=>{ const done=!!(state.segments&&state.segments[module.id]&&state.segments[module.id][seg.id]); const box=document.createElement('div'); box.style.cssText='border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:.8rem;margin-bottom:.65rem;background:'+(done?'rgba(106,143,138,.07)':'rgba(255,255,255,.025)')+';'; const title=document.createElement('div'); title.textContent=seg.title; title.style.cssText='font-weight:700;margin-bottom:.35rem;'; const text=document.createElement('div'); text.textContent=seg.text; text.style.cssText='line-height:1.55;margin-bottom:.65rem;'; const btn=document.createElement('button'); btn.className='btn'; btn.textContent=done?'Acknowledged':'Acknowledge'; btn.disabled=done; btn.onclick=()=>{ S.completeSegment(module.id,seg.id); writeLog(module.title+': '+seg.title+' acknowledged.','segment'); render(); }; box.appendChild(title); box.appendChild(text); box.appendChild(btn); wrap.appendChild(box); });
}

function ensureCollapseControl(module,node,accepted){
  let control=node.querySelector('.module-collapse-control');
  if(!accepted){ if(control) control.remove(); node.classList.remove('module-collapsed'); node.style.position=''; return; }
  node.style.position='relative';
  if(!control){ control=document.createElement('button'); control.className='module-collapse-control'; control.style.cssText='position:absolute;top:.75rem;right:.75rem;width:1.85rem;height:1.85rem;border-radius:50%;border:1px solid rgba(194,161,90,.38);background:rgba(0,0,0,.28);color:#c2a15a;font-size:1.1rem;line-height:1;cursor:pointer;z-index:3;'; node.appendChild(control); control.onclick=(event)=>{ event.stopPropagation(); const collapsed=getJson(COLLAPSE_KEY,{}); collapsed[module.id]=!collapsed[module.id]; setJson(COLLAPSE_KEY,collapsed); render(); }; }
  const collapsed=getJson(COLLAPSE_KEY,{}), isCollapsed=collapsed[module.id]!==false; control.textContent=isCollapsed?'+':'−'; control.title=isCollapsed?'Expand accepted chamber':'Collapse accepted chamber'; node.classList.toggle('module-collapsed',isCollapsed);
  Array.from(node.children).forEach(child=>{ if(child.classList.contains('badge')||child.tagName==='H2'||child.tagName==='H3'||child.classList.contains('module-collapse-control')) return; child.style.display=isCollapsed?'none':''; });
}

function renderModules(state){
  const before=snapshotVisible();
  M.forEach(module=>{ const node=el('[data-module="'+module.id+'"]'); if(!node) return; const eligible=meetsRequirements(module,state), accepted=state.accepted.includes(module.id); node.classList.remove('accepted'); if(accepted){ node.classList.remove('hidden'); node.classList.add('revealed','accepted'); } else if(eligible){ node.classList.remove('hidden'); node.classList.add('revealed'); } else if(module.initialStatus==='deferred'){ node.classList.remove('hidden'); node.classList.add('deferred'); } else { node.classList.add('hidden'); } if(!node.classList.contains('hidden')) renderSegments(module,node); const btn=node.querySelector('[data-accept="'+module.id+'"]'); if(btn){ btn.disabled=accepted||!S.canAccept(module.id); btn.textContent=accepted?'Accepted':(btn.dataset.originalText||btn.textContent); } ensureCollapseControl(module,node,accepted); });
  const after=snapshotVisible(); after.forEach(id=>{ if(!before.has(id)&&booted){ const m=M.find(x=>x.id===id); writeLog((m?m.title:id)+' unlocked.','unlock'); }});
}

function bindButtons(){
  document.querySelectorAll('[data-accept]').forEach(button=>{ if(!button.dataset.originalText) button.dataset.originalText=button.textContent; button.onclick=()=>{ const id=button.dataset.accept, module=M.find(m=>m.id===id), before=S.get().accepted.includes(id), ok=S.accept(id), after=S.get().accepted.includes(id); if(after&&!before) writeLog((module?module.title:id)+' accepted.','accept'); else if(!ok&&!after&&!before) writeLog((module?module.title:id)+' is not ready yet.','field'); render(); }; });
  const reset=document.getElementById('reset-state'); if(reset){ reset.onclick=()=>{ if(S.reset) S.reset(); localStorage.removeItem('neodoxent_state'); localStorage.removeItem(LOG_KEY); localStorage.removeItem(COLLAPSE_KEY); localStorage.removeItem(LAST_STATE_KEY); location.reload(); }; }
}

function render(){ const state=S.get(); renderLog(); renderIndex(state); renderResources(state); renderFieldState(state); renderModules(state); observeField(state); }

document.addEventListener('DOMContentLoaded',()=>{ ensureFieldLog(); bindButtons(); if(getLog().length===0) writeLog('Meta-Landing initialized.','field'); render(); auditSystem(S.get()); booted=true; setInterval(render,1000); });
})();
