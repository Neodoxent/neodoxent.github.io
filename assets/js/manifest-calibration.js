(function(){
  'use strict';

  function n(v){return typeof v==='number'&&isFinite(v)?v:0}
  function weighted(o,w){return Object.entries(w).reduce((a,[k,v])=>a+n(o&&o[k])*v,0)}

  function manifestSeed(st){
    const accepted=st.accepted||[];
    const milestones=['cards','glyphs','atlas','cybernetic-primer','frameworks','drunemeton','cathedral'].filter(id=>accepted.includes(id)).length;
    const q=weighted(st.qbits,{symbolic:.18,poetic:.14,architectural:.14,cybernetic:.28,regal:.22,cathedral:.45,cognitive:.03});
    const s=weighted(st.strata,{semiotic:.28,cartographic:.26,cybernetic:.34,regal:.28,cathedral:.55,orientation:.015,stabilization:.025});
    const reading=Math.floor(n(st.field&&st.field.reading)/24);
    const trace=n(st.coupling&&st.coupling.traceMemory)*.22;
    return Math.max(0,Math.min(60,Number((q+s+milestones*1.1+reading+trace).toFixed(2))));
  }

  window.NEODOXENT_MANIFEST={seed:manifestSeed};

  function replaceIndexical(idx,seed){
    if(!idx)return;
    const html=idx.innerHTML;
    const next=html
      .replace(/<strong>Manifest Seed:<\/strong>\s*[^|]+/,'<strong>Manifest Seed:</strong> '+seed+' ')
      .replace(/<strong>Manifest:<\/strong>\s*[^|]+/,'<strong>Manifest Seed:</strong> '+seed+' ');
    if(next!==html)idx.innerHTML=next;
  }

  function apply(){
    const S=window.NEODOXENT_STATE;
    if(!S||!S.get)return;
    const st=S.get();
    const seed=manifestSeed(st);
    replaceIndexical(document.querySelector('#indexical'),seed);
    const pill=document.querySelector('#field-reading-pill');
    if(pill&&st.field){
      pill.title='Field Reading '+(st.field.reading||0)+'/64 · Manifest Seed '+seed+' · Signature '+(st.field.signature||0);
    }
  }

  function observeIndexical(){
    const idx=document.querySelector('#indexical');
    if(!idx||idx.dataset.manifestObserved)return;
    idx.dataset.manifestObserved='1';
    new MutationObserver(()=>apply()).observe(idx,{childList:true,subtree:true,characterData:true});
  }

  function boot(){
    apply();
    observeIndexical();
    setInterval(()=>{apply();observeIndexical()},250);
  }

  document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,150));
  window.addEventListener('neodoxent:tick',apply);
})();
