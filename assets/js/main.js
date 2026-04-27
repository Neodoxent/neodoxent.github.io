(function(){
"use strict";
window.NEODOXENT_VERSION = 'v1.3.3-j(p)';
const VERSION = window.NEODOXENT_VERSION;
const M=window.NEODOXENT_MODULES||[],S=window.NEODOXENT_STATE;
const LOG_KEY='neodoxent_field_log',COLLAPSE_KEY='neodoxent_collapsed_modules',LAST_STATE_KEY='neodoxent_last_field_signature',WARN_KEY='neodoxent_warnings_seen',DYN_KEY='neodoxent_dynamics_open';
if(!S){console.error('NEODOXENT_STATE missing.');return;}
const SEM={gold:'#c2a15a',brine:'#b2905e',green:'#6a8f8a',amber:'#d1a66a',teal:'#9bc7c1',violet:'#c7b8ff',red:'#a86f5f',pearl:'#e7e1d6'};
const CARDS=[
 {name:'Threshold',role:'The first agreement between reader and instrument.',distinction:'Entry is not arrival; approach is not possession.',relation:'Binds Zephyr to Aperture by requiring orientation before depth.'},
 {name:'Signal',role:'The first clarified line drawn out of noise.',distinction:'Noise becomes useful only when it is distinguished.',relation:'Feeds Cards and Glyphs through semiotic recognition.'},
 {name:'Trace',role:'The memory left by return, rereading, and revision.',distinction:'What is revisited becomes structurally real.',relation:'Binds action history to future visibility.'},
 {name:'Lattice',role:'The architecture of relation between symbolic nodes.',distinction:'Meaning appears between nodes, not only inside them.',relation:'Prepares Atlas, Frameworks, and Drunemeton.'}
];
const WARNINGS={
 welcome:{title:'Instrument Boundary',body:'This interface is symbolic and interpretive. It is not diagnosis, therapy, command authority, or empirical measurement. The reader remains responsible for pace, meaning, and use.'},
 zephyr:{title:'Traversal Caution',body:'Movement should preserve return. Pushing forward without orientation converts traversal into drift.'},
 aperture:{title:'Interpretive Caution',body:'Aperture teaches perception before interpretation. Do not mistake the first impression for settled meaning.'},
 cards:{title:'Symbol Projection Caution',body:'Cards reveal semiotic relations. They do not declare fate, authority, certainty, or external command.'},
 glyphs:{title:'Compression Caution',body:'Glyphs compress meaning. Compression is powerful, but can hide ambiguity if used too quickly.'},
 regalia:{title:'Regalia Caution',body:'Role-symbols carry responsibility. Presentation is not license; mantle requires proportion.'},
 atlas:{title:'Map/Territory Caution',body:'Maps clarify relation, but the map is not the territory. Use diagrams to orient judgment, not replace it.'},
 drunemeton:{title:'Cathedral Depth Caution',body:'The Cathedral is deferred because depth requires pacing, return, and structural readiness.'},
 cathedral:{title:'Cathedral Boundary',body:'The books are housed, not consumed. Entry requires sustained coherence, trace, and orientation.'}
};
function el(q){return document.querySelector(q)}
function setText(id,v){const n=document.getElementById(id);if(n)n.textContent=String(v)}
function getJson(k,f){try{return JSON.parse(localStorage.getItem(k))??f}catch(e){return f}}
function setJson(k,v){localStorage.setItem(k,JSON.stringify(v))}
function getLog(){return getJson(LOG_KEY,[])}
function saveLog(l){setJson(LOG_KEY,l.slice(-340))}
function stamp(){return new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'})}
function pct(v,m){return Math.max(0,Math.min(100,Math.round((Number(v||0)/m)*100)))}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function updateVersionLabels(){document.querySelectorAll('.command-mark .muted').forEach(n=>{if(n.textContent.includes('Meta-Landing Console'))n.textContent='Meta-Landing Console '+VERSION});document.querySelectorAll('footer .micro').forEach(n=>{if(n.textContent.includes('Meta-Landing'))n.textContent='Meta-Landing · Infotech Interface Layer · '+VERSION});const meta=document.querySelector('meta[name="neodoxent-version"]');if(meta)meta.setAttribute('content',VERSION.replace('v',''))}

function syncVersionToDOM(){
  const v = window.NEODOXENT_VERSION || VERSION;
  document.querySelectorAll('.neodoxent-version').forEach(el => {
    el.textContent = v;
  });
}

function deriveResponse(st){const r=st.resources||{},c=st.coupling||{},q=Object.values(st.qbits||{}).filter(v=>v>0).length,ss=Object.values(st.strata||{}).filter(v=>v>0).length,accepted=(st.accepted||[]).length,pace=Math.floor(accepted/Math.max(1,(st.time||1)/90)),imb=Math.max(0,(st.coherence||0)-((r.signal||0)+(r.attention||0))),stability=clamp((c.orientationDamping||0)+(c.traceMemory||0)+Math.floor((r.witness||0)/2),0,12),tension=clamp((st.entanglement||0)+imb+pace-(c.orientationDamping||0),0,18),readiness=clamp((c.attentionSignal||0)+(c.signalCoherence||0)+(c.coherenceResonance||0)+stability-Math.floor(tension/3),0,18),pressure=clamp(tension-stability+Math.floor((q+ss)/3),0,12);let mode='Listening';if(tension>=12&&readiness<=3)mode='Overloaded';else if(pressure>=7)mode='Resistant';else if(readiness>=9&&stability>=5)mode='Receptive';else if(stability>=5)mode='Stabilizing';return{mode,tension,readiness,pressure,stability}}
// rest of file unchanged

function render(){const st=S.get();renderLog();renderIndex(st);renderResources(st);renderFieldState(st);renderDirective(st);renderReturnRail(st);renderModules(st);observeField(st)}

document.addEventListener('DOMContentLoaded',()=>{
  updateVersionLabels();
  syncVersionToDOM();
  ensureDirective();
  ensureFieldLog();
  bindButtons();
  if(getLog().length===0)writeLog('Stable Factor engaged: '+VERSION+' presence refinement.','field');
  render();
  auditSystem();
  booted=true;
  setInterval(render,1000)
});
})();