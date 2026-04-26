(function(){
"use strict";

const M = window.NEODOXENT_MODULES;
const S = window.NEODOXENT_STATE;

function el(q){ return document.querySelector(q); }

/* ===============================
   INDEXICAL MARKER
   -------------------------------
   Keeps the reader oriented to node, vector, aura, and
   complexity. This is the first lightweight indexical
   safety layer for the Meta-Landing.
================================ */
function renderIndex(state){
  let idx = el('#indexical');
  if(!idx){
    idx = document.createElement('div');
    idx.id = 'indexical';
    idx.style.padding = '0.5rem 1rem';
    idx.style.fontSize = '0.8rem';
    idx.style.opacity = '0.7';
    document.body.prepend(idx);
  }

  idx.innerHTML = `
  <strong>Node:</strong> Meta-Landing |
  <strong>Vector:</strong> ${state.vector} |
  <strong>Aura:</strong> ${state.aura} |
  <strong>Complexity:</strong> ${state.complexity}
  `;
}

/* ===============================
   RESOURCE PANEL
   -------------------------------
   Displays the interpretive resources that gate the
   protocol chambers. These are not points or currency;
   they are field capacities.
================================ */
function renderResources(state){
  let panel = el('#resource-panel');
  if(!panel){
    panel = document.createElement('div');
    panel.id = 'resource-panel';
    panel.style.margin = '1rem';
    panel.style.fontSize = '0.85rem';
    document.body.prepend(panel);
  }

  const r = state.resources || {};

  panel.innerHTML = `
  <strong>Field Resources</strong><br>
  Attention: ${r.attention||0} | Orientation: ${r.orientation||0} | Signal: ${r.signal||0}<br>
  Resonance: ${r.resonance||0} | Witness: ${r.witness||0} | Trace: ${r.trace||0}
  `;
}

/* ===============================
   DWELL FEEDBACK
   -------------------------------
   Makes time perceptible without turning time into a
   game timer. The language remains chamber-like.
================================ */
function renderDwell(module){
  let dwell = document.querySelector(`#dwell-${module.id}`);
  if(!dwell){
    dwell = document.createElement('div');
    dwell.id = `dwell-${module.id}`;
    dwell.style.fontSize = '0.75rem';
    dwell.style.opacity = '0.6';
    dwell.style.margin = '0.35rem 0 0.75rem';
  }

  const start = S.get().enteredAt[module.id];
  const required = module.acceptRequires?.dwellSeconds || module.dwellSeconds || 0;

  if(!required){
    dwell.textContent = "No dwell gate assigned.";
    return dwell;
  }

  if(!start){
    dwell.textContent = "Entering field...";
    return dwell;
  }

  const elapsed = Math.floor((Date.now() - start)/1000);

  if(elapsed < required){
    dwell.textContent = `Field stabilizing… (${elapsed}s / ${required}s)`;
  } else {
    dwell.textContent = "Field stabilized.";
  }

  return dwell;
}

/* ===============================
   SEGMENTS — FULL CHAMBER
   -------------------------------
   Renders nested module segments as readable chamber
   blocks with text and acknowledgments.
================================ */
function renderSegments(module,node){
  if(!module.segments) return;

  S.enter(module.id);

  let wrap = node.querySelector('.segments');
  if(!wrap){
    wrap = document.createElement('div');
    wrap.className = 'segments';
    wrap.style.marginTop = '1rem';
    node.appendChild(wrap);
  }

  wrap.innerHTML = '';

  const state = S.get();
  const completed = Object.keys(state.segments[module.id] || {}).length;
  const total = module.segments.length;

  const progress = document.createElement('div');
  progress.style.fontSize = '0.75rem';
  progress.style.marginBottom = '0.5rem';
  progress.style.opacity = '0.7';
  progress.textContent = `Progress: ${completed} / ${total}`;
  wrap.appendChild(progress);

  wrap.appendChild(renderDwell(module));

  module.segments.forEach(seg => {
    const box = document.createElement('div');
    box.style.border = '1px solid rgba(255,255,255,0.08)';
    box.style.padding = '0.75rem';
    box.style.marginBottom = '0.5rem';
    box.style.borderRadius = '6px';
    box.style.background = 'rgba(255,255,255,0.025)';

    const title = document.createElement('div');
    title.textContent = seg.title;
    title.style.fontWeight = 'bold';

    const text = document.createElement('div');
    text.textContent = seg.text;
    text.style.margin = '0.5rem 0';
    text.style.lineHeight = '1.55';

    const btn = document.createElement('button');
    btn.textContent = 'Acknowledge';

    const done = state.segments[module.id]?.[seg.id];
    btn.disabled = done;

    btn.onclick = () => {
      S.completeSegment(module.id, seg.id);

      if(seg.grants){
        const st = S.get();
        st.resources = st.resources || {};

        Object.entries(seg.grants.resources || {}).forEach(([k,v])=>{
          st.resources[k] = (st.resources[k]||0)+v;
        });
      }

      render();
    };

    box.appendChild(title);
    box.appendChild(text);
    box.appendChild(btn);
    wrap.appendChild(box);
  });
}

/* ===============================
   ACCEPT GATE
================================ */
function canAcceptWithResources(module,state){
  if(!S.canAccept(module.id)) return false;
  if(!module.acceptRequires) return true;

  const r = state.resources || {};

  return Object.entries(module.acceptRequires.resources || {})
    .every(([k,v]) => (r[k]||0) >= v);
}

/* ===============================
   RENDER LOOP
================================ */
function render(){
  const state = S.get();

  renderIndex(state);
  renderResources(state);

  M.forEach(m => {
    const node = el(`[data-module="${m.id}"]`);
    if(!node) return;

    renderSegments(m,node);

    const btn = node.querySelector(`[data-accept]`);
    if(btn){
      btn.disabled = !canAcceptWithResources(m,state) || state.accepted.includes(m.id);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-accept]').forEach(b => {
    b.onclick = () => {
      S.accept(b.dataset.accept);
      render();
    };
  });

  render();
  setInterval(render,1000);
});

})();
