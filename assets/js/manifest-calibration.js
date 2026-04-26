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

  function currentSeed(){
    const S=window.NEODOXENT_STATE;
    if(!S||!S.get)return null;
    return manifestSeed(S.get());
  }

  function rewriteIndexicalHtml(html){
    const seed=currentSeed();
    if(seed===null||typeof html!=='string')return html;
    return html
      .replace(/<strong>Manifest Seed:<\/strong>\s*[^|]+/,'<strong>Manifest Seed:</strong> '+seed+' ')
      .replace(/<strong>Manifest:<\/strong>\s*[^|]+/,'<strong>Manifest Seed:</strong> '+seed+' ');
  }

  function patchInnerHTMLSetter(){
    const proto=Element.prototype;
    const desc=Object.getOwnPropertyDescriptor(proto,'innerHTML');
    if(!desc||!desc.set||proto.__neodoxentManifestPatched)return;
    Object.defineProperty(proto,'innerHTML',{
      configurable:true,
      enumerable:desc.enumerable,
      get:desc.get,
      set:function(value){
        if(this&&this.id==='indexical'){
          return desc.set.call(this,rewriteIndexicalHtml(value));
        }
        return desc.set.call(this,value);
      }
    });
    proto.__neodoxentManifestPatched=true;
  }

  function apply(){
    const idx=document.querySelector('#indexical');
    if(idx){
      const next=rewriteIndexicalHtml(idx.innerHTML);
      if(next!==idx.innerHTML)idx.innerHTML=next;
    }
    const S=window.NEODOXENT_STATE;
    const st=S&&S.get?S.get():null;
    const pill=document.querySelector('#field-reading-pill');
    if(pill&&st&&st.field){
      const seed=manifestSeed(st);
      pill.title='Field Reading '+(st.field.reading||0)+'/64 · Manifest Seed '+seed+' · Signature '+(st.field.signature||0);
    }
  }

  patchInnerHTMLSetter();
  document.addEventListener('DOMContentLoaded',()=>setTimeout(apply,50));
  window.addEventListener('neodoxent:tick',apply);
})();
