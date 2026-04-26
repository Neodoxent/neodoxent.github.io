(function(){
"use strict";

const M = window.NEODOXENT_MODULES;
const S = window.NEODOXENT_STATE;

function el(q){ return document.querySelector(q); }

function meetsRequirements(module,state){
  const req = module.requires || {};

  if(req.accepted && !req.accepted.every(id => state.accepted.includes(id))) return false;

  if(req.strata){
    if(!Object.entries(req.strata).every(([k,v]) => (state.strata[k]||0)>=v)) return false;
  }

  if(req.qbits){
    if(!Object.entries(req.qbits).every(([k,v]) => (state.qbits[k]||0)>=v)) return false;
  }

  if(req.resources){
    if(!Object.entries(req.resources).every(([k,v]) => (state.resources[k]||0)>=v)) return false;
  }

  if(req.coherence && state.coherence < req.coherence) return false;
  if(req.complexity && state.complexity < req.complexity) return false;
  if(req.entanglement && state.entanglement < req.entanglement) return false;

  return true;
}

function renderModules(){
  const state = S.get();

  M.forEach(module => {
    const node = el(`[data-module="${module.id}"]`);
    if(!node) return;

    const eligible = meetsRequirements(module,state);

    if(state.accepted.includes(module.id)){
      node.classList.remove('hidden');
      node.classList.add('accepted');
    } else if(eligible){
      node.classList.remove('hidden');
      node.classList.add('revealed');
    }
  });
}

function render(){
  renderModules();

  M.forEach(module => {
    const node = el(`[data-module="${module.id}"]`);
    if(!node) return;

    if(node.classList.contains('hidden')) return;

    const btn = node.querySelector(`[data-accept]`);
    if(btn){
      btn.disabled = !S.canAccept(module.id);
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
