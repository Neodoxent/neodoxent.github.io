/* ==================================================
   requirements.js — Requirement Evaluation Layer
   ================================================== */

window.NEODOXENT_REQUIREMENTS = (function(){
  "use strict";

  function meets(module, state){
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

  function snapshotVisible(modules){
    const visible = new Set();
    modules.forEach(module => {
      const node = document.querySelector(`[data-module="${module.id}"]`);
      if(node && !node.classList.contains('hidden')) visible.add(module.id);
    });
    return visible;
  }

  return { meets, snapshotVisible };
})();
