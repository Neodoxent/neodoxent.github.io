/* ==================================================
   state-engine.js — Neodoxent State Engine v1.4
   --------------------------------------------------
   Owns persistent local state for the Meta-Landing.
   Responsibilities:
   - resources, qBits, strata, module acceptance
   - segment completion and segment grants
   - dwell-time and resource-gated acceptance
   - derived values: complexity, aura, resonance, manifest factor
   ================================================== */

window.NEODOXENT_STATE = (function(){
  "use strict";

  const STORAGE_KEY = "neodoxent_state";

  const DEFAULT_STATE = {
    version: "1.4",
    time: 0,
    bits: 0,
    qbits: { symbolic:0, cognitive:0, poetic:0, architectural:0, cybernetic:0, regal:0, cathedral:0 },
    strata: { orientation:0, stabilization:0, semiotic:0, cartographic:0, cybernetic:0, regal:0, cathedral:0 },
    resources: { attention:0, orientation:0, signal:0, resonance:0, witness:0, trace:0 },
    vector: "zephyr",
    entanglement: 0,
    coherence: 0,
    orientation: 0,
    complexity: 0,
    aura: "Unformed",
    resonance: 0,
    manifestFactor: 0,
    accepted: [],
    acceptedAt: {},
    segments: {},
    enteredAt: {},
    lastAccepted: null
  };

  let state;
  let timerStarted = false;

  function clone(value){ return JSON.parse(JSON.stringify(value)); }
  function num(value, fallback=0){ return typeof value === "number" && Number.isFinite(value) ? value : fallback; }

  function mergeMap(base, incoming){
    const out = { ...base };
    Object.keys(base).forEach(key => { out[key] = num(incoming && incoming[key], base[key]); });
    return out;
  }

  function ensureShape(raw){
    raw = raw && typeof raw === "object" ? raw : {};
    const next = clone(DEFAULT_STATE);

    next.time = num(raw.time);
    next.bits = num(raw.bits);
    next.qbits = mergeMap(DEFAULT_STATE.qbits, raw.qbits);
    next.strata = mergeMap(DEFAULT_STATE.strata, raw.strata);
    next.resources = mergeMap(DEFAULT_STATE.resources, raw.resources);
    next.vector = typeof raw.vector === "string" ? raw.vector : DEFAULT_STATE.vector;
    next.entanglement = num(raw.entanglement);
    next.coherence = num(raw.coherence);
    next.orientation = num(raw.orientation);
    next.complexity = num(raw.complexity);
    next.aura = typeof raw.aura === "string" ? raw.aura : DEFAULT_STATE.aura;
    next.resonance = num(raw.resonance);
    next.manifestFactor = num(raw.manifestFactor);
    next.accepted = Array.isArray(raw.accepted) ? raw.accepted : [];
    next.acceptedAt = raw.acceptedAt && typeof raw.acceptedAt === "object" ? raw.acceptedAt : {};
    next.segments = raw.segments && typeof raw.segments === "object" ? raw.segments : {};
    next.enteredAt = raw.enteredAt && typeof raw.enteredAt === "object" ? raw.enteredAt : {};
    next.lastAccepted = raw.lastAccepted || null;

    return next;
  }

  function load(){
    try { state = ensureShape(JSON.parse(localStorage.getItem(STORAGE_KEY))); }
    catch(error){ state = clone(DEFAULT_STATE); }
  }

  function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

  function modules(){ return window.NEODOXENT_MODULES || []; }
  function moduleById(id){ return modules().find(module => module.id === id) || null; }
  function segmentById(module, segmentId){ return (module && module.segments || []).find(segment => segment.id === segmentId) || null; }

  function addMap(target, additions){
    if(!additions) return;
    Object.entries(additions).forEach(([key,value]) => { target[key] = num(target[key]) + num(value); });
  }

  function applyGrants(grants){
    grants = grants || {};
    state.bits += num(grants.bits);
    state.orientation += num(grants.orientation);
    state.coherence += num(grants.coherence);
    state.entanglement += num(grants.entanglement);
    addMap(state.qbits, grants.qbits);
    addMap(state.strata, grants.strata);
    addMap(state.resources, grants.resources);
    if(typeof grants.vector === "string") state.vector = grants.vector;
  }

  function segmentProgress(moduleId){
    const module = moduleById(moduleId);
    if(!module || !module.segments || module.segments.length === 0) return 1;
    const done = Object.keys(state.segments[moduleId] || {}).length;
    return done / module.segments.length;
  }

  function dwellElapsed(moduleId){
    const start = state.enteredAt[moduleId];
    if(!start) return 0;
    return Math.floor((Date.now() - start) / 1000);
  }

  function requiredDwell(module){ return num(module && (module.acceptRequires && module.acceptRequires.dwellSeconds || module.dwellSeconds)); }
  function dwellMet(moduleId){
    const module = moduleById(moduleId);
    const required = requiredDwell(module);
    if(!required) return true;
    return dwellElapsed(moduleId) >= required;
  }

  function resourcesMet(requirements){
    if(!requirements) return true;
    return Object.entries(requirements).every(([key,value]) => num(state.resources[key]) >= num(value));
  }

  function canAccept(moduleId){
    const module = moduleById(moduleId);
    if(!module || state.accepted.includes(moduleId)) return false;
    const acceptRequires = module.acceptRequires || {};
    return segmentProgress(moduleId) >= 1 && dwellMet(moduleId) && resourcesMet(acceptRequires.resources);
  }

  function enter(moduleId){
    if(!state.enteredAt[moduleId]) {
      state.enteredAt[moduleId] = Date.now();
      save();
    }
  }

  function completeSegment(moduleId, segmentId){
    const module = moduleById(moduleId);
    const segment = segmentById(module, segmentId);
    if(!module || !segment) return;

    state.segments[moduleId] = state.segments[moduleId] || {};
    if(state.segments[moduleId][segmentId]) return;

    state.segments[moduleId][segmentId] = true;
    applyGrants(segment.grants);
    update();
  }

  function accept(moduleId){
    const module = moduleById(moduleId);
    if(!module || !canAccept(moduleId)) return false;

    applyGrants(module.grants);
    state.accepted.push(moduleId);
    state.acceptedAt[moduleId] = Date.now();
    state.lastAccepted = moduleId;
    update();
    return true;
  }

  function computeResonance(){
    const acceptedCount = Math.max(1, state.accepted.length);
    const pace = Math.floor((state.time / acceptedCount) / 12);
    return Math.max(0, Math.min(8, pace) + Math.min(8, state.coherence) + Math.min(4, state.resources.resonance));
  }

  function computeManifestFactor(){
    const qSpread = Object.values(state.qbits).filter(value => value > 0).length;
    const sSpread = Object.values(state.strata).filter(value => value > 0).length;
    const rSpread = Object.values(state.resources).filter(value => value > 0).length;
    return qSpread + sSpread + rSpread + Math.floor(state.entanglement / 2);
  }

  function computeComplexity(){
    const qSum = Object.values(state.qbits).reduce((sum,value)=>sum+num(value),0);
    const sSum = Object.values(state.strata).reduce((sum,value)=>sum+num(value),0);
    const rSum = Object.values(state.resources).reduce((sum,value)=>sum+num(value),0);
    return state.bits + qSum + sSum + rSum + state.entanglement*2 + state.coherence*3 + state.orientation*2 + state.manifestFactor;
  }

  function computeAura(){
    if(state.complexity >= 70 && state.manifestFactor >= 14) return "Cathedral";
    if(state.complexity >= 55 && state.resonance >= 10) return "Architectonic";
    if(state.complexity >= 38) return "Liminal";
    if(state.complexity >= 20) return "Structured";
    if(state.orientation > 0 || state.resources.orientation > 0) return "Nascent";
    return "Unformed";
  }

  function update(){
    state.entanglement = Math.max(state.entanglement, Math.max(0, state.accepted.length - 1));
    state.resonance = computeResonance();
    state.manifestFactor = computeManifestFactor();
    state.complexity = computeComplexity();
    state.aura = computeAura();
    save();
  }

  function reset(){
    state = clone(DEFAULT_STATE);
    save();
  }

  function start(){
    if(timerStarted) return;
    timerStarted = true;
    setInterval(() => {
      state.time += 1;
      update();
      window.dispatchEvent(new CustomEvent("neodoxent:tick", { detail: state }));
    }, 1000);
  }

  load();
  update();
  start();

  return { get:()=>state, accept, enter, completeSegment, segmentProgress, dwellElapsed, dwellMet, canAccept, reset, update };
})();
