(function(){
  'use strict';

  const DRAWER_KEY='neodoxent_drawer_open';
  const VIEW_KEY='neodoxent_view_mode';
  const PANEL_KEY='neodoxent_panel_visibility';
  const FOCUS_KEY='neodoxent_focus_mode';
  const WARN_KEY='neodoxent_warnings_seen';

  const SEM={gold:'#c2a15a',brine:'#b2905e',green:'#6a8f8a',amber:'#d1a66a',teal:'#9bc7c1',violet:'#c7b8ff',red:'#a86f5f',pearl:'#e7e1d6'};

  const PANEL_SELECTORS={
    resources:'#resource-panel',
    symbolic:'.console-grid > section:first-child .panel:first-child',
    notice:'.console-grid > section:first-child .panel:nth-child(2)',
    field:'.hero-status'
  };

  const PANEL_LABELS={
    resources:'Field Resources',
    symbolic:'Symbolic Readout',
    notice:'Instrument Notice',
    field:'Field State'
  };

  const WARNING_TITLES={
    welcome:'Instrument Boundary',
    zephyr:'Traversal Caution',
    aperture:'Interpretive Caution',
    cards:'Symbol Projection Caution',
    glyphs:'Compression Caution',
    regalia:'Regalia Caution',
    atlas:'Map/Territory Caution',
    drunemeton:'Cathedral Depth Caution',
    cathedral:'Cathedral Boundary'
  };

  function $(q){return document.querySelector(q)}
  function getJson(k,f){try{return JSON.parse(localStorage.getItem(k))??f}catch(e){return f}}
  function setJson(k,v){localStorage.setItem(k,JSON.stringify(v))}

  function injectStyle(){
    if($('#interface-drawer-style'))return;
    const style=document.createElement('style');
    style.id='interface-drawer-style';
    style.textContent=`
      #interface-menu-button{position:absolute;left:.75rem;top:50%;transform:translateY(-50%);z-index:1;width:2rem;height:2rem;border-radius:999px;border:1px solid rgba(194,161,90,.42);background:rgba(0,0,0,.22);color:${SEM.gold};font-size:1rem;display:grid;place-items:center;cursor:pointer;pointer-events:auto;}
      #interface-menu-button:hover{background:rgba(194,161,90,.12);border-color:rgba(194,161,90,.7)}
      #interface-drawer-backdrop{position:fixed;inset:0;z-index:2147483500;background:rgba(0,0,0,.42);backdrop-filter:blur(4px);display:none;}
      #interface-drawer{position:fixed;top:42px;left:0;bottom:42px;z-index:2147483550;width:min(390px,calc(100vw - 1.25rem));transform:translateX(-105%);transition:transform .22s ease;background:rgba(7,7,8,.96);border-right:1px solid rgba(194,161,90,.34);box-shadow:18px 0 70px rgba(0,0,0,.45);color:${SEM.pearl};font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow-y:auto;}
      #interface-drawer.open{transform:translateX(0)}
      #interface-drawer-backdrop.open{display:block}
      .drawer-inner{padding:1rem 1rem 1.25rem;}
      .drawer-head{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1rem;border-bottom:1px solid rgba(255,255,255,.08);padding-bottom:.85rem;}
      .drawer-title{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.09em;text-transform:uppercase;color:${SEM.gold};font-size:.76rem;}
      .drawer-close{border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);color:${SEM.pearl};border-radius:999px;width:1.8rem;height:1.8rem;cursor:pointer;}
      .drawer-section{border:1px solid rgba(255,255,255,.08);border-radius:14px;background:rgba(255,255,255,.025);padding:.85rem;margin-bottom:.85rem;}
      .drawer-section h4{margin:0 0 .65rem;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;color:${SEM.brine};}
      .drawer-row{display:flex;align-items:center;justify-content:space-between;gap:.75rem;padding:.45rem 0;border-bottom:1px solid rgba(255,255,255,.045);font-size:.86rem;}
      .drawer-row:last-child{border-bottom:0}
      .drawer-button{width:100%;text-align:left;border:1px solid rgba(255,255,255,.08);background:rgba(0,0,0,.16);color:${SEM.pearl};border-radius:10px;padding:.55rem .65rem;margin:.2rem 0;cursor:pointer;}
      .drawer-button.active{border-color:rgba(194,161,90,.55);color:${SEM.gold};background:rgba(194,161,90,.08)}
      .drawer-link{display:block;color:${SEM.pearl};text-decoration:none;border-left:3px solid rgba(194,161,90,.35);padding:.35rem .6rem;margin:.25rem 0;background:rgba(255,255,255,.025);border-radius:0 8px 8px 0;}
      .drawer-link:hover{color:${SEM.gold};background:rgba(194,161,90,.07)}
      body.view-reading .console-grid{grid-template-columns:minmax(0,.72fr) minmax(0,1.72fr)!important;}
      body.view-reading .console-grid > section:nth-child(3){display:none!important;}
      body.view-reading .module{padding:1.15rem 1.25rem;}
      body.view-compact .callout,body.view-compact .admonition,body.view-compact .progressive-warning{font-size:.86rem;}
      body.view-compact .module{padding:.85rem;}
      body.focus-mode .module.accepted{opacity:.55;}
      body.focus-mode .module:not(.accepted):not(.hidden){box-shadow:0 0 0 1px rgba(194,161,90,.2),0 22px 80px rgba(0,0,0,.36);}
      .panel-hidden-by-drawer{display:none!important;}
      @media(max-width:760px){#interface-drawer{width:calc(100vw - .75rem)}#interface-menu-button{left:.45rem}}
    `;
    document.head.appendChild(style);
  }

  function ensureDrawer(){
    injectStyle();
    const directive=$('#field-directive');
    if(directive&&!$('#interface-menu-button')){
      directive.style.pointerEvents='auto';
      directive.style.position='fixed';
      const btn=document.createElement('button');
      btn.id='interface-menu-button';
      btn.type='button';
      btn.title='Open Interface Drawer';
      btn.innerHTML='☰';
      btn.onclick=toggleDrawer;
      directive.appendChild(btn);
    }
    if(!$('#interface-drawer-backdrop')){
      const backdrop=document.createElement('div');
      backdrop.id='interface-drawer-backdrop';
      backdrop.onclick=()=>setDrawer(false);
      document.body.appendChild(backdrop);
    }
    if(!$('#interface-drawer')){
      const drawer=document.createElement('aside');
      drawer.id='interface-drawer';
      drawer.setAttribute('aria-label','Interface Drawer');
      document.body.appendChild(drawer);
    }
  }

  function setDrawer(open){
    setJson(DRAWER_KEY,!!open);
    $('#interface-drawer')?.classList.toggle('open',!!open);
    $('#interface-drawer-backdrop')?.classList.toggle('open',!!open);
    if(open)renderDrawer();
  }

  function toggleDrawer(){setDrawer(!$('#interface-drawer')?.classList.contains('open'))}

  function setViewMode(mode){
    localStorage.setItem(VIEW_KEY,mode);
    applyViewMode();
    renderDrawer();
  }

  function applyViewMode(){
    const mode=localStorage.getItem(VIEW_KEY)||'console';
    document.body.classList.remove('view-console','view-reading','view-compact');
    document.body.classList.add('view-'+mode);
    document.body.classList.toggle('focus-mode',getJson(FOCUS_KEY,false));
  }

  function togglePanel(key){
    const state=getJson(PANEL_KEY,{});
    state[key]=state[key]===false?true:false;
    setJson(PANEL_KEY,state);
    applyPanelVisibility();
    renderDrawer();
  }

  function applyPanelVisibility(){
    const state=getJson(PANEL_KEY,{});
    Object.entries(PANEL_SELECTORS).forEach(([key,sel])=>{
      const node=$(sel);
      if(node)node.classList.toggle('panel-hidden-by-drawer',state[key]===false);
    });
  }

  function toggleFocus(){
    setJson(FOCUS_KEY,!getJson(FOCUS_KEY,false));
    applyViewMode();
    renderDrawer();
  }

  function modules(){return window.NEODOXENT_MODULES||[]}
  function state(){return window.NEODOXENT_STATE&&window.NEODOXENT_STATE.get?window.NEODOXENT_STATE.get():{accepted:[]}}

  function renderDrawer(){
    ensureDrawer();
    const drawer=$('#interface-drawer');
    if(!drawer)return;
    const mode=localStorage.getItem(VIEW_KEY)||'console';
    const panels=getJson(PANEL_KEY,{});
    const warnings=getJson(WARN_KEY,{});
    const st=state();
    const visibleModules=modules().filter(m=>(st.accepted||[]).includes(m.id)||document.querySelector('[data-module="'+m.id+'"]:not(.hidden)'));

    drawer.innerHTML=`
      <div class="drawer-inner">
        <div class="drawer-head">
          <div>
            <div class="drawer-title">Interface Drawer</div>
            <div style="font-size:.8rem;opacity:.65;margin-top:.25rem">Control surface · view · warnings · return</div>
          </div>
          <button class="drawer-close" type="button" aria-label="Close drawer">×</button>
        </div>
        <section class="drawer-section"><h4>View Mode</h4>${['console','reading','compact'].map(v=>`<button class="drawer-button ${mode===v?'active':''}" data-view="${v}">${v.charAt(0).toUpperCase()+v.slice(1)} Mode</button>`).join('')}</section>
        <section class="drawer-section"><h4>Panel Visibility</h4>${Object.entries(PANEL_LABELS).map(([key,label])=>`<div class="drawer-row"><span>${label}</span><input type="checkbox" data-panel="${key}" ${panels[key]===false?'':'checked'} /></div>`).join('')}</section>
        <section class="drawer-section"><h4>Focus</h4><div class="drawer-row"><span>Focus current chamber</span><input type="checkbox" data-focus="1" ${getJson(FOCUS_KEY,false)?'checked':''}/></div></section>
        <section class="drawer-section"><h4>Warnings Index</h4>${Object.keys(warnings).length?Object.keys(warnings).map(id=>`<a class="drawer-link" href="#${id}">${WARNING_TITLES[id]||id}</a>`).join(''):'<div style="opacity:.62;font-size:.84rem">No progressive warnings surfaced yet.</div>'}</section>
        <section class="drawer-section"><h4>Return Map</h4>${visibleModules.map(m=>`<a class="drawer-link" href="#${m.id}">${m.title||m.id}</a>`).join('')||'<div style="opacity:.62;font-size:.84rem">No returnable chambers yet.</div>'}</section>
      </div>`;

    drawer.querySelector('.drawer-close')?.addEventListener('click',()=>setDrawer(false));
    drawer.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setViewMode(b.dataset.view)));
    drawer.querySelectorAll('[data-panel]').forEach(cb=>cb.addEventListener('change',()=>togglePanel(cb.dataset.panel)));
    drawer.querySelector('[data-focus]')?.addEventListener('change',toggleFocus);
    drawer.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setDrawer(false)));
  }

  function boot(){
    ensureDrawer();
    applyViewMode();
    applyPanelVisibility();
    renderDrawer();
    setDrawer(getJson(DRAWER_KEY,false));
    window.addEventListener('resize',()=>{applyViewMode();applyPanelVisibility();});
    window.addEventListener('neodoxent:tick',()=>{if($('#interface-drawer')?.classList.contains('open'))renderDrawer();});
  }

  document.addEventListener('DOMContentLoaded',boot);
})();
