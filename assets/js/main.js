(function(){
"use strict";

const M = window.NEODOXENT_MODULES || [];
const S = window.NEODOXENT_STATE;
const LOG_KEY = 'neodoxent_field_log';

if(!S){
  console.error('NEODOXENT_STATE missing.');
  return;
}

function el(q){ return document.querySelector(q); }
function setText(id,value){ const node=document.getElementById(id); if(node) node.textContent=String(value); }
function getLog(){ try { return JSON.parse(localStorage.getItem(LOG_KEY)) || []; } catch(e){ return []; } }
function saveLog(log){ localStorage.setItem(LOG_KEY, JSON.stringify(log.slice(-160))); }
function stamp(){ return new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', second:'2-digit' }); }

function writeLog(message,type='field'){
  const log = getLog();
  log.push({ time: stamp(), message, type });
  saveLog(log);
  renderLog();
}

function renderLog(){
  let terminal = el('#field-log');
  if(!terminal){
    terminal = document.createElement('div');
    terminal.id = 'field-log';
    terminal.style.position = 'fixed';
    terminal.style.left = '0';
    terminal.style.right = '0';
    terminal.style.bottom = '0';
    terminal.style.zIndex = '9999';
    terminal.style.background = 'rgba(0,0,0,0.94)';
    terminal.style.color = '#d8d2c6';
    terminal.style.borderTop = '1px solid rgba(194,161,90,0.38)';
    terminal.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    terminal.style.boxShadow = '0 -12px 40px rgba(0,0,0,0.45)';

    terminal.innerHTML = `
      <div id="field-log-bar" style="display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:0.55rem 1rem;cursor:pointer;">
        <div><span style="color:#c2a15a;">FIELD LOG</span> <span id="field-log-latest" style="opacity:.72;"></span></div>
        <div id="field-log-toggle" style="opacity:.72;">expand</div>
      </div>
      <div id="field-log-body" style="display:none;max-height:38vh;overflow:auto;padding:0 1rem 1rem;"></div>
    `;

    document.body.appendChild(terminal);
    document.body.style.paddingBottom = '3rem';

    terminal.querySelector('#field-log-bar').onclick = () => {
      terminal.classList.toggle('open');
      const open = terminal.classList.contains('open');
      terminal.querySelector('#field-log-body').style.display = open ? 'block' : 'none';
      terminal.querySelector('#field-log-toggle').textContent = open ? 'collapse' : 'expand';
    };
  }

  const log = getLog();
  const latest = log[log.length-1];
  const latestNode = terminal.querySelector('#field-log-latest');
  const body = terminal.querySelector('#field-log-body');

  latestNode.textContent = latest ? `— ${latest.message}` : '— Awaiting signal.';
  body.innerHTML = log.slice().reverse().map(entry => {
    const color = entry.type === 'unlock' ? '#6a8f8a' : entry.type === 'accept' ? '#c2a15a' : entry.type === 'segment' ? '#d8d2c6' : '#9c958b';
    return `<div style="padding:.28rem 0;border-bottom:1px solid rgba(255,255,255,0.045);"><span style="opacity:.55;">${entry.time}</span> <span style="color:${color};">${entry.message}</span></div>`;
  }).join('');
}

function snapshotVisible(){
  const visible = new Set();
  M.forEach(module => {
    const node = el(`[data-module="${module.id}"]`);
    if(node && !node.classList.contains('hidden')) visible.add(module.id);
  });
  return visible;
}

let previousVisible = new Set();
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

function renderIndex(state){
  let idx = el('#indexical');
  if(!idx){
    idx = document.createElement('div');
    idx.id = 'indexical';
    idx.style.padding = '0.5rem 1rem';
    idx.style.fontSize = '0.8rem';
    idx.style.opacity = '0.72';
    idx.style.borderBottom = '1px solid rgba(255,255,255,0.08)';
    document.body.prepend(idx);
  }
  idx.innerHTML = `<strong>Node:</strong> Meta-Landing | <strong>Vector:</strong> ${state.vector || 'zephyr'} | <strong>Aura:</strong> ${state.aura || 'Unformed'} | <strong>Complexity:</strong> ${state.complexity || 0}`;
}

function renderResources(state){
  let panel = el('#resource-panel');
  if(!panel){
    panel = document.createElement('div');
    panel.id = 'resource-panel';
    panel.style.margin = '0 1rem 1rem';
    panel.style.padding = '0.75rem 1rem';
    panel.style.fontSize = '0.85rem';
    panel.style.borderBottom = '1px solid rgba(255,255,255,0.08)';
    document.body.insertBefore(panel, document.body.children[1] || null);
  }
  const r = state.resources || {};
  panel.innerHTML = `<strong>Field Resources</strong><br>Attention: ${r.attention||0} | Orientation: ${r.orientation||0} | Signal: ${r.signal||0}<br>Resonance: ${r.resonance||0} | Witness: ${r.witness||0} | Trace: ${r.trace||0}`;
}

function renderFieldState(state){
  setText('state-complexity', state.complexity || 0);
  setText('state-aura', state.aura || 'Unformed');
  setText('state-vector', state.vector || 'zephyr');
  setText('state-entanglement', state.entanglement || 0);
  setText('state-bits', state.bits || 0);
  setText('state-coherence', state.coherence || 0);
  setText('state-orientation', state.orientation || 0);
}

function dwellText(module){
  const required = (module.acceptRequires && module.acceptRequires.dwellSeconds) || module.dwellSeconds || 0;
  if(!required) return '';
  const elapsed = S.dwellElapsed ? S.dwellElapsed(module.id) : 0;
  return elapsed >= required ? `Field stabilized. (${elapsed}s / ${required}s)` : `Field stabilizing… (${elapsed}s / ${required}s)`;
}

function renderSegments(module,node){
  if(!module.segments || !module.segments.length) return;
  S.enter(module.id);

  let wrap = node.querySelector('.segments');
  if(!wrap){
    wrap = document.createElement('div');
    wrap.className = 'segments';
    wrap.style.marginTop = '1rem';
    node.appendChild(wrap);
  }

  const state = S.get();
  const completed = Object.keys((state.segments && state.segments[module.id]) || {}).length;
  const total = module.segments.length;

  wrap.innerHTML = '';

  const meta = document.createElement('div');
  meta.style.fontSize = '0.78rem';
  meta.style.opacity = '0.76';
  meta.style.marginBottom = '0.75rem';
  meta.textContent = `Progress: ${completed} / ${total}${dwellText(module) ? ' · ' + dwellText(module) : ''}`;
  wrap.appendChild(meta);

  module.segments.forEach(seg => {
    const done = !!(state.segments && state.segments[module.id] && state.segments[module.id][seg.id]);

    const box = document.createElement('div');
    box.style.border = '1px solid rgba(255,255,255,0.08)';
    box.style.borderRadius = '10px';
    box.style.padding = '0.8rem';
    box.style.marginBottom = '0.65rem';
    box.style.background = done ? 'rgba(106,143,138,0.07)' : 'rgba(255,255,255,0.025)';

    const title = document.createElement('div');
    title.textContent = seg.title;
    title.style.fontWeight = '700';
    title.style.marginBottom = '0.35rem';

    const text = document.createElement('div');
    text.textContent = seg.text;
    text.style.lineHeight = '1.55';
    text.style.marginBottom = '0.65rem';

    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = done ? 'Acknowledged' : 'Acknowledge';
    btn.disabled = done;
    btn.onclick = () => {
      S.completeSegment(module.id, seg.id);
      writeLog(`${module.title}: ${seg.title} acknowledged.`, 'segment');
      render();
    };

    box.appendChild(title);
    box.appendChild(text);
    box.appendChild(btn);
    wrap.appendChild(box);
  });
}

function renderModules(state){
  const before = snapshotVisible();

  M.forEach(module => {
    const node = el(`[data-module="${module.id}"]`);
    if(!node) return;

    const eligible = meetsRequirements(module,state);
    const accepted = state.accepted.includes(module.id);

    node.classList.remove('accepted');

    if(accepted){
      node.classList.remove('hidden');
      node.classList.add('revealed','accepted');
    } else if(eligible){
      node.classList.remove('hidden');
      node.classList.add('revealed');
    } else if(module.initialStatus === 'deferred'){
      node.classList.remove('hidden');
      node.classList.add('deferred');
    } else {
      node.classList.add('hidden');
    }

    if(!node.classList.contains('hidden')){
      renderSegments(module,node);
    }

    const btn = node.querySelector(`[data-accept="${module.id}"]`);
    if(btn){
      btn.disabled = accepted || !S.canAccept(module.id);
      btn.textContent = accepted ? 'Accepted' : (btn.dataset.originalText || btn.textContent);
    }
  });

  const after = snapshotVisible();
  after.forEach(id => {
    if(!before.has(id) && booted){
      const module = M.find(m => m.id === id);
      writeLog(`${module ? module.title : id} unlocked.`, 'unlock');
    }
  });
  previousVisible = after;
}

function bindButtons(){
  document.querySelectorAll('[data-accept]').forEach(button => {
    if(!button.dataset.originalText) button.dataset.originalText = button.textContent;
    button.onclick = () => {
      const id = button.dataset.accept;
      const module = M.find(m => m.id === id);
      const before = S.get().accepted.includes(id);
      const ok = S.accept(id);
      const after = S.get().accepted.includes(id);
      if(after && !before){
        writeLog(`${module ? module.title : id} accepted.`, 'accept');
      } else if(!ok && !after && !before){
        writeLog(`${module ? module.title : id} is not ready yet.`, 'field');
      }
      render();
    };
  });

  const reset = document.getElementById('reset-state');
  if(reset){
    reset.onclick = () => {
      if(S.reset) S.reset();
      localStorage.removeItem('neodoxent_state');
      localStorage.removeItem(LOG_KEY);
      location.reload();
    };
  }
}

function render(){
  const state = S.get();
  renderLog();
  renderIndex(state);
  renderResources(state);
  renderFieldState(state);
  renderModules(state);
}

document.addEventListener('DOMContentLoaded', () => {
  bindButtons();
  render();
  if(getLog().length === 0) writeLog('Meta-Landing initialized.', 'field');
  previousVisible = snapshotVisible();
  booted = true;
  setInterval(render,1000);
});
})();
