/* ==================================================
   state-engine.js — Infotech State Engine v1.1
   --------------------------------------------------
   Tracks all multidimensional state and computes:
   - complexity index
   - aura
   - entanglement
   - coherence
   - persistence via localStorage
   ================================================== */

window.NEODOXENT_STATE = (function(){

  const defaultState = {
    time: 0,
    bits: 0,
    qbits: {
      symbolic: 0,
      cognitive: 0,
      poetic: 0,
      architectural: 0,
      cybernetic: 0,
      regal: 0,
      cathedral: 0
    },
    strata: {
      orientation: 0,
      stabilization: 0,
      semiotic: 0,
      cartographic: 0,
      cybernetic: 0,
      regal: 0,
      cathedral: 0
    },
    vector: "zephyr",
    entanglement: 0,
    coherence: 0,
    orientation: 0,
    complexity: 0,
    aura: "Unformed",
    accepted: []
  };

  let state;

  function load(){
    try {
      state = JSON.parse(localStorage.getItem("neodoxent_state")) || structuredClone(defaultState);
    } catch(e){
      state = structuredClone(defaultState);
    }
  }

  function save(){
    localStorage.setItem("neodoxent_state", JSON.stringify(state));
  }

  function computeComplexity(){
    const qsum = Object.values(state.qbits).reduce((a,b)=>a+b,0);
    return state.bits + qsum + state.entanglement*2 + state.coherence*3 + state.orientation*2;
  }

  function computeAura(){
    if(state.complexity > 50) return "Architectonic";
    if(state.complexity > 30) return "Liminal";
    if(state.complexity > 15) return "Structured";
    return "Nascent";
  }

  function update(){
    state.complexity = computeComplexity();
    state.aura = computeAura();
    save();
  }

  function accept(module){
    if(state.accepted.includes(module)) return;
    state.accepted.push(module);
    state.bits += 1;
    state.entanglement = state.accepted.length - 1;
    state.coherence = Math.max(1, Math.floor(state.accepted.length/2));
    update();
  }

  load();
  update();

  return {
    get: () => state,
    accept
  };

})();
