(function(){
  'use strict';

  function n(v){return typeof v==='number'&&isFinite(v)?v:0}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
  function copy(v){try{return JSON.parse(JSON.stringify(v))}catch(e){return v}}
  function weighted(o,w){return Object.entries(w).reduce((a,[k,v])=>a+n(o&&o[k])*v,0)}
  function compress(v,k,max){return max*(1-Math.exp(-Math.max(0,v)/k))}

  function maturity(st){
    const a=st.accepted||[];
    let m=.04;
    if(a.includes('welcome'))m=.08;
    if(a.includes('zephyr'))m=.14;
    if(a.includes('aperture'))m=.24;
    if(a.includes('cards'))m=.38;
    if(a.includes('glyphs'))m=.48;
    if(a.includes('regalia'))m=.58;
    if(a.includes('atlas'))m=.68;
    if(a.includes('complexity-primer'))m=.76;
    if(a.includes('cybernetic-primer'))m=.84;
    if(a.includes('frameworks'))m=.9;
    if(a.includes('drunemeton'))m=.96;
    if(a.includes('cathedral'))m=1;
    return m;
  }

  function manifestSeed(st){
    const accepted=st.accepted||[];
    const milestones=['cards','glyphs','atlas','cybernetic-primer','frameworks','drunemeton','cathedral'].filter(id=>accepted.includes(id)).length;
    const q=weighted(st.qbits,{symbolic:.18,poetic:.14,architectural:.14,cybernetic:.28,regal:.22,cathedral:.45,cognitive:.03});
    const s=weighted(st.strata,{semiotic:.28,cartographic:.26,cybernetic:.34,regal:.28,cathedral:.55,orientation:.015,stabilization:.025});
    const reading=Math.floor(n(st.field&&st.field.reading)/24);
    const trace=n(st.coupling&&st.coupling.traceMemory)*.22;
    return clamp(Number((q+s+milestones*1.1+reading+trace).toFixed(2)),0,60);
  }

  function calibratedState(raw){
    const st=copy(raw);
    if(!st||!st.field)return raw;
    const m=maturity(st);
    const strataDepth=weighted(st.strata,{orientation:.01,stabilization:.035,semiotic:.75,cartographic:1.05,cybernetic:1.45,regal:1.25,cathedral:2.25});
    const qDepth=weighted(st.qbits,{cognitive:.02,symbolic:.28,poetic:.24,architectural:.72,cybernetic:1.35,regal:1.15,cathedral:2.1});
    const seed=manifestSeed(st);
    const lateLoad=Math.max(0,(st.accepted||[]).length-3)*.22;
    const rawDepth=(strataDepth+qDepth+(seed*.08)+lateLoad)*m;
    const depth=clamp(compress(rawDepth,60,64),0,64);
    const strain=n(st.field.strain);
    const ent=n(st.entanglement);
    const load=(depth*1.65)+(strain*.75)+(seed*.42)+(ent*.45)+Math.max(0,(st.accepted||[]).length-3)*.9;
    const complexity=clamp(compress(load,420,220),0,220);
    st.manifestFactor=seed;
    st.field.depth=Number(depth.toFixed(2));
    st.complexity=Number(complexity.toFixed(2));
    if(st.field.signature!=null){
      st.field.signature=clamp(Math.round((n(st.field.reading)/64)*4096+seed*24+n(st.coupling&&st.coupling.traceMemory)*12+depth*6),0,8192);
    }
    return st;
  }

  window.NEODOXENT_MANIFEST={seed:manifestSeed,calibrate:calibratedState};

  function patchStateGet(){
    const S=window.NEODOXENT_STATE;
    if(!S||!S.get||S.__neodoxentCalibrated)return;
    const originalGet=S.get.bind(S);
    S.rawGet=originalGet;
    S.get=function(){return calibratedState(originalGet())};
    S.__neodoxentCalibrated=true;
  }

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
        if(this&&this.id==='indexical')return desc.set.call(this,rewriteIndexicalHtml(value));
        return desc.set.call(this,value);
      }
    });
    proto.__neodoxentManifestPatched=true;
  }

  function apply(){
    patchStateGet();
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
      pill.title='Field Reading '+(st.field.reading||0)+'/64 · Manifest Seed '+seed+' · Depth '+(st.field.depth||0)+' · Signature '+(st.field.signature||0);
    }
  }

  patchInnerHTMLSetter();
  patchStateGet();
  document.addEventListener('DOMContentLoaded',()=>setTimeout(apply,50));
  window.addEventListener('neodoxent:tick',apply);
})();
