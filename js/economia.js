/* ============================= ECONOMY ============================= */
// Fija y centra la barra de navegación inferior sin tapar los modales
(function fixBottomNavCSS(){
  if(document.getElementById('fix-bnav-style')) return;
  const st = document.createElement('style');
  st.id = 'fix-bnav-style';
  st.textContent = `
    #bottomNav {
      position: fixed !important;
      bottom: 0 !important;
      left: 50% !important;
      right: auto !important;
      transform: translateX(-50%) !important;
      width: 100% !important;
      max-width: 480px !important;
      margin: 0 !important;
      box-sizing: border-box !important;
      z-index: 40 !important;
      background: var(--crema, #FDF8EE);
      border-top: 1.5px solid #E7DCC3;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.06);
    }
    #bottomNav:empty { display: none !important; }
    #bottomNav:not(:empty) { display: flex !important; }
    .overlay { z-index: 1000 !important; }
    #main { padding-bottom: 95px !important; }
  `;
  document.head.appendChild(st);
})();

function openPinModal(){
  const root = document.getElementById('modalRoot');
  let entered = "";
  const cfgPin = ((STATE.config && STATE.config.pin) || "0406").toString();
  root.innerHTML = `<div class="overlay" id="ov"><div class="sheet" style="text-align:center;"><span class="close-x" id="closeX">✕</span><h3>EconomyTeam</h3><p class="muted">Ingresá el PIN del equipo</p><div class="pin-dots" id="pinDots">${[0,1,2,3].map(()=>`<div class="pin-dot"></div>`).join("")}</div><div class="keypad" id="keypad">${[1,2,3,4,5,6,7,8,9,'','0','⌫'].map(k=>`<div class="key" data-k="${k}">${k}</div>`).join("")}</div></div></div>`;
  document.getElementById('closeX').onclick = ()=> root.innerHTML="";
  document.getElementById('ov').onclick = (e)=>{ if(e.target.id==='ov') root.innerHTML=""; };
  const dots = ()=>document.querySelectorAll('.pin-dot');
  document.querySelectorAll('.key').forEach(k=>{
    k.onclick = ()=>{
      const val = k.dataset.k; if(val==='') return;
      if(val==='⌫'){ entered = entered.slice(0,-1); } else if(entered.length<4){ entered += val; }
      dots().forEach((d,i)=> d.classList.toggle('filled', i<entered.length));
      if(entered.length===4){
        setTimeout(()=>{
          if(entered === cfgPin){
            STATE.economiaOn = true;
            STATE.ecoArea = "feria";
            STATE.ecoTab = "ventas";
            root.innerHTML="";
            render();
          } else {
            toast("PIN incorrecto", true);
            entered="";
            dots().forEach(d=>d.classList.remove('filled'));
          }
        }, 150);
      }
    };
  });
}

function renderTopAreaSwitchEconomia(){
  const area = STATE.ecoArea || "feria";
  return `
    <div style="display:flex; gap:6px; background:#E7DCC3; padding:5px; border-radius:14px; margin-bottom:16px;">
      <button class="btn-area-eco" data-area="feria" style="flex:1; border:none; padding:9px 4px; border-radius:10px; font-weight:800; font-size:11.5px; cursor:pointer; text-transform:uppercase; letter-spacing:0.03em; background:${area==='feria'?'var(--rojo)':'transparent'}; color:${area==='feria'?'var(--blanco)':'var(--tinta)'};">🥟 Feria</button>
      <button class="btn-area-eco" data-area="mision" style="flex:1; border:none; padding:9px 4px; border-radius:10px; font-weight:800; font-size:11.5px; cursor:pointer; text-transform:uppercase; letter-spacing:0.03em; background:${area==='mision'?'var(--rojo)':'transparent'}; color:${area==='mision'?'var(--blanco)':'var(--tinta)'};">⛺ Misión</button>
      <button class="btn-area-eco" data-area="config" style="flex:1; border:none; padding:9px 4px; border-radius:10px; font-weight:800; font-size:11.5px; cursor:pointer; text-transform:uppercase; letter-spacing:0.03em; background:${area==='config'?'var(--rojo)':'transparent'}; color:${area==='config'?'var(--blanco)':'var(--tinta)'};">⚙️ Config</button>
    </div>
  `;
}

function wireTopAreaSwitchEconomia(){
  document.querySelectorAll('.btn-area-eco').forEach(b => {
    b.onclick = () => {
      const nuevaArea = b.dataset.area;
      STATE.ecoArea = nuevaArea;
      if(nuevaArea === 'feria') STATE.ecoTab = 'ventas';
      else if(nuevaArea === 'mision') STATE.ecoTab = 'inventario';
      else if(nuevaArea === 'config') STATE.ecoTab = 'config';
      render();
    };
  });
}

function renderBottomNavEconomia(){
  const area = STATE.ecoArea || "feria";
  let items = [];
  if(area === "feria"){
    items = [
      {id:"ventas", label:"Ventas", icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2l1.5 4h9L18 2"/><path d="M3.5 6h17l-1.6 12.5A2 2 0 0117 20H7a2 2 0 01-1.9-1.5L3.5 6z"/></svg>`},
      {id:"compras", label:"Compras", icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`},
      {id:"resultados", label:"Resultados", icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`},
      {id:"control_docenas", label:"Control Doc.", icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>`}
    ];
  } else if(area === "mision"){
    items = [
      {id:"inventario", label:"Inventario", icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`},
      {id:"compras_mision", label:"Compras", icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`},
      {id:"liquidacion", label:"Liquidación", icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`}
    ];
  }
  const nav = document.getElementById('bottomNav');
  if(!nav) return;
  nav.style.display = "";
  if(items.length === 0){
    nav.innerHTML = "";
  } else {
    nav.innerHTML = items.map(it=>`<button class="nav-btn ${STATE.ecoTab===it.id?'active':''}" data-etab="${it.id}">${it.icon}<span>${it.label}</span></button>`).join("");
    document.querySelectorAll('.nav-btn').forEach(b=>{ b.onclick = ()=>{ STATE.ecoTab = b.dataset.etab; render(); }; });
  }
}

function renderEconomia(){
  if(!STATE.ecoArea) STATE.ecoArea = "feria";
  renderBottomNavEconomia();
  const main = document.getElementById('main');
  main.innerHTML = renderTopAreaSwitchEconomia() + `<div id="ecoSubView"></div>`;
  wireTopAreaSwitchEconomia();
  const sub = document.getElementById('ecoSubView');

  if(STATE.ecoArea === "config") renderEcoConfig(sub);
  else if(STATE.ecoArea === "feria"){
    if(STATE.ecoTab==="compras") renderEcoCompras(sub);
    else if(STATE.ecoTab==="resultados") renderEcoResultados(sub);
    else if(STATE.ecoTab==="control_docenas") renderEcoControlDocenas(sub);
    else renderEcoVentas(sub);
  } else if(STATE.ecoArea === "mision"){
    if(STATE.ecoTab==="compras_mision") renderEcoComprasMision(sub);
    else if(STATE.ecoTab==="liquidacion") renderEcoLiquidacion(sub);
    else renderEcoInventario(sub);
  }
}

/* --------------------- CONFIGURACIÓN --------------------- */
function renderEcoConfig(main){
  const c = STATE.config || {};
  main.innerHTML = `<h2 class="section-title">Parámetros de la misión</h2><div class="card"><label>Mínimo de misión ($)</label><input type="number" id="cMinimo" value="${c.pagoMinimo ?? 0}"><label>Horas para pagar la misión</label><input type="number" id="cHorasObj" value="${c.horasObjetivo ?? 0}"><label>Valor 1 hora ($)</label><input type="number" id="cHora" value="${c.valorHora ?? 0}"><label>Precio 1 docena ($)</label><input type="number" id="cDocena" value="${c.valorDocena ?? 0}"><label>Precio 1/2 docena ($)</label><input type="number" id="cMedia" value="${c.valorMediaDocena ?? 0}"><label>Porcentaje Solidario (%)</label><input type="number" id="cPorc" value="${c.porcentajeSolidario ?? 0}"><label>PIN del panel EconomyTeam</label><input type="text" id="cPin" value="${escapeHTML(c.pin || '0406')}" maxlength="4"><button class="btn btn-primary" id="btnGuardarConfig">Guardar cambios</button></div>`;
  document.getElementById('btnGuardarConfig').onclick = async () => {
    const campos = {
      pagoMinimo: 'cMinimo', horasObjetivo: 'cHorasObj', valorHora: 'cHora',
      valorDocena: 'cDocena', valorMediaDocena: 'cMedia', porcentajeSolidario: 'cPorc'
    };
    const valores = {};
    for (const [clave, id] of Object.entries(campos)) {
      const input = document.getElementById(id);
      const n = Number(input.value);
      if (input.value.trim() === '' || !Number.isFinite(n) || n < 0) {
        toast('Completá los números con valores mayores o iguales a cero.', true);
        input.focus(); return;
      }
      valores[clave] = n;
    }
    if (valores.porcentajeSolidario > 100) {
      toast('El porcentaje solidario debe estar entre 0 y 100.', true); return;
    }
    const pin = document.getElementById('cPin').value.trim();
    if (!/^\d{4}$/.test(pin)) {
      toast('El PIN debe tener exactamente 4 números.', true); return;
    }
    const prevConfig = snapshot(STATE.config);
    try { await api('SYNC'); } catch(e){}
    STATE.config = { ...STATE.config, ...valores, pin };
    toast('Guardando configuración…'); render();
    apiBackground('SET_SYS', { key: 'config', value: STATE.config }, () => { STATE.config = prevConfig; });
  };
}

/* --------------------- FERIA: COMPRAS --------------------- */
function renderEcoCompras(main){
  const docCoc = Number(STATE.docenasCocinar) || 0;
  const receta = Array.isArray(STATE.receta) ? STATE.receta : [];
  const rows = receta.map((r,i) => {
    const totalComprar = Calculos.cantidadComprar(r, docCoc);
    return {...r, idx:i, totalComprar};
  });
  const totalGasto = rows.reduce((a,r)=>a+(Number(r.gasto)||0),0);
  
  const groups = Object.assign(Object.create(null), { "Ingredientes": [], "Descartables": [], "Limpieza": [], "Otros": [] });
  rows.forEach(r => { let cat = r.cat || "Otros"; if(!groups[cat]) groups[cat] = []; groups[cat].push(r); });

  let tableHTML = "";
  Object.keys(groups).forEach(cat => {
    if(groups[cat].length === 0) return;
    tableHTML += `<tr><td colspan="4" style="background:#E7DCC3; font-weight:800; font-size:11px; text-transform:uppercase; letter-spacing:0.04em; padding:6px 8px; color:var(--tinta);">${escapeHTML(cat)}</td></tr>`;
    groups[cat].forEach(r => {
      const parts = String(r.ing || '').split(' - ');
      const name = parts[0];
      const unit = parts[1] ? `<span style="font-size:10.5px; opacity:.6; font-weight:700;"> - ${escapeHTML(parts[1])}</span>` : '';
      tableHTML += `<tr><td style="line-height:1.2;">${escapeHTML(name)}${unit}</td><td><input type="number" min="0" step="any" class="stockInput" data-i="${r.idx}" value="${Number(r.stock)||0}" style="width:48px; padding:6px; font-size:12px; margin:0;"></td><td style="font-weight:800; color:var(--rojo); text-align:center;">${r.totalComprar===null?'—':r.totalComprar}</td><td><input type="number" min="0" step="any" class="gastoInput" data-i="${r.idx}" value="${Number(r.gasto)||0}" style="width:60px; padding:6px; font-size:12px; margin:0;"></td></tr>`;
    });
  });

  main.innerHTML = `<h2 class="section-title">Calculadora de compras (Feria)</h2><div class="card"><label>Docenas a cocinar esta feria</label><input type="number" id="cocDoc" value="${docCoc}"><button class="btn btn-gold btn-sm" id="btnRecalc" style="width:100%">Recalcular cantidades</button></div><div class="card"><table class="mini"><thead><tr><th>Ítem</th><th>Stock</th><th>Comprar</th><th>Gasto $</th></tr></thead><tbody>${tableHTML}</tbody></table><div style="height:1px; background:#EEE1C4; margin:14px 0;"></div><div class="row-between"><strong>Gasto total feria</strong><strong style="color:var(--rojo); font-size:18px;">${fmt$(totalGasto)}</strong></div><button class="btn btn-primary" id="btnGuardarCompras" style="margin-top:14px;">Guardar cambios en tabla</button></div>`;
  
  document.getElementById('btnRecalc').onclick = () => {
    const stock = [...document.querySelectorAll('.stockInput')];
    const gasto = [...document.querySelectorAll('.gastoInput')];
    const hayPendientes = stock.some(inp => Number(inp.value) !== (Number(STATE.receta[Number(inp.dataset.i)].stock) || 0)) ||
      gasto.some(inp => Number(inp.value) !== (Number(STATE.receta[Number(inp.dataset.i)].gasto) || 0));
    if (hayPendientes) {
      toast('Primero guardá los cambios en stock y gastos para no perderlos.', true);
      return;
    }
    const campo = document.getElementById('cocDoc');
    const nuevoValor = Number(campo.value);
    if (campo.value.trim() === '' || !Number.isFinite(nuevoValor) || nuevoValor < 0) {
      toast('Ingresá una cantidad de docenas válida.', true); return;
    }
    const prevDoc = STATE.docenasCocinar;
    STATE.docenasCocinar = nuevoValor;
    render();
    apiBackground('SET_SYS', { key: 'docenas_cocinar', value: nuevoValor }, () => { STATE.docenasCocinar = prevDoc; });
  };
  document.getElementById('btnGuardarCompras').onclick = () => {
    const prevReceta = snapshot(STATE.receta);
    const nuevos = snapshot(STATE.receta);
    for (const [selector, campo] of [['.stockInput', 'stock'], ['.gastoInput', 'gasto']]) {
      for (const inp of document.querySelectorAll(selector)) {
        const n = Number(inp.value);
        if (inp.value.trim() === '' || !Number.isFinite(n) || n < 0) {
          toast('Stock y gastos deben ser números mayores o iguales a cero.', true);
          inp.focus(); return;
        }
        nuevos[Number(inp.dataset.i)][campo] = n;
      }
    }
    STATE.receta = nuevos;
    toast('Guardando compras…'); render();
    apiBackground('SET_SYS', { key: 'receta', value: nuevos }, () => { STATE.receta = prevReceta; });
  };
}

/* --------------------- FERIA: VENTAS --------------------- */
function renderEcoVentas(main){
  const ventas = Array.isArray(STATE.ventas) ? STATE.ventas : [];
  const ventasMisas = STATE.ventasMisas || {docenas: 0, medias: 0, donaciones: 0};
  const totCrudasDoc = ventas.filter(v=>v.tipo==='Crudas').reduce((a,v)=>a+(Number(v.docenas)||0),0);
  const totCrudasMed = ventas.filter(v=>v.tipo==='Crudas').reduce((a,v)=>a+(Number(v.medias)||0),0);
  const totCocidasDoc = ventas.filter(v=>v.tipo==='Cocidas').reduce((a,v)=>a+(Number(v.docenas)||0),0);
  const totCocidasMed = ventas.filter(v=>v.tipo==='Cocidas').reduce((a,v)=>a+(Number(v.medias)||0),0);
  
  const fN = n => Number.isInteger(n) ? n : n.toFixed(1);
  const crudasDocEq = totCrudasDoc + totCrudasMed*0.5;
  const cocidasDocEq = totCocidasDoc + totCocidasMed*0.5;
  const totalEq = crudasDocEq + cocidasDocEq;
  const cerradas = !!(STATE.config && STATE.config.ventasCerradas);
  const pincelesConVentas = [...new Set(ventas.map(v=>v.pincel))].sort((a,b)=>String(a).localeCompare(String(b)));

  main.innerHTML = `
    <div class="card" style="display:flex; justify-content:space-between; align-items:center; gap:10px; background:${cerradas ? '#FBE7DA' : '#E8F3E8'}; border:1.5px solid ${cerradas ? '#B4551D' : 'var(--oliva)'};">
      <div>
        <div style="font-weight:800; font-size:13.5px; color:${cerradas ? '#B4551D' : 'var(--oliva)'};">${cerradas ? '🔒 Ventas de Pinceles CERRADAS' : '🟢 Ventas de Pinceles ABIERTAS'}</div>
        <div style="font-size:11px; opacity:.85;">${cerradas ? 'Solo pueden marcar pagos y retiros.' : 'Pueden anotar y editar ventas.'}</div>
      </div>
      <button class="btn btn-sm" id="btnToggleVentas" style="width:auto; padding:8px 12px; font-size:12px; background:${cerradas ? 'var(--oliva)' : 'var(--rojo)'}; color:white; white-space:nowrap;">
        ${cerradas ? 'Reabrir ventas' : 'Cerrar ventas'}
      </button>
    </div>

    <h2 class="section-title">Ventas en Misas</h2>
    <div class="card" style="border-left: 4px solid var(--oliva);">
      <label>Docenas vendidas</label><input type="number" id="misasDocenas" value="${Number(ventasMisas.docenas) || 0}">
      <label>Medias docenas vendidas</label><input type="number" id="misasMedias" value="${Number(ventasMisas.medias) || 0}">
      <label>Donaciones recibidas ($)</label><input type="number" id="misasDonaciones" value="${Number(ventasMisas.donaciones) || 0}">
      <button class="btn btn-primary" id="btnGuardarMisas" style="margin-top:8px;">Guardar datos de misas</button>
    </div>
    
    <h2 class="section-title" style="margin-top:24px; font-size:14px; color:var(--rojo);">Ventas Pinceles: ${fN(crudasDocEq)} crudas + ${fN(cocidasDocEq)} cocidas = ${fN(totalEq)}</h2>
    <div class="stat-grid">
      <div class="stat-box">
        <div class="stat-num">${totCrudasDoc}<span style="font-size:18px;">+${totCrudasMed}½</span></div>
        <div class="stat-label">Crudas</div>
      </div>
      <div class="stat-box gold">
        <div class="stat-num">${totCocidasDoc}<span style="font-size:18px;">+${totCocidasMed}½</span></div>
        <div class="stat-label">Cocidas</div>
      </div>
    </div>

    <h2 class="section-title" style="margin-top:20px;">Detalle por Pincel</h2>
    <div class="card">
      ${pincelesConVentas.length===0 ? `<div class="empty">Todavía no hay ventas cargadas.</div>` : pincelesConVentas.map(p=>{
        const vs = ventas.filter(x=>x.pincel===p);
        const impagas = vs.filter(x=>x.estado==='Falta Pagar');
        const retiradas = vs.filter(x=>x.retirado);
        const dImp = impagas.reduce((a,x)=>a+(Number(x.docenas)||0),0), mImp = impagas.reduce((a,x)=>a+(Number(x.medias)||0),0);
        const dRet = retiradas.reduce((a,x)=>a+(Number(x.docenas)||0),0), mRet = retiradas.reduce((a,x)=>a+(Number(x.medias)||0),0);
        const dTot = vs.reduce((a,x)=>a+(Number(x.docenas)||0),0), mTot = vs.reduce((a,x)=>a+(Number(x.medias)||0),0);
        const plataImpaga = Calculos.totalPendiente(vs, STATE.config);
        return `
          <div class="list-item" style="flex-direction:column; align-items:flex-start; gap:6px;">
            <div class="row-between" style="width:100%;">
              <div class="li-name">${escapeHTML(p)}</div>
              <span class="badge badge-neutral">${totalDocenasDe(p)} doc. vendidas</span>
            </div>
            <div style="font-size:11.5px; color:var(--tinta); opacity:.85;">
              📦 Retiró: <b>${dRet} doc.</b> y <b>${mRet} medias</b> <span style="opacity:.7;">(de ${dTot} doc. y ${mTot} medias)</span>
            </div>
            ${plataImpaga > 0 ? `<div style="font-size:11.5px; color:#B4551D; background:#FBE7DA; padding:4px 8px; border-radius:6px; width:100%;">Adeuda pagar: <b>${fmt$(plataImpaga)}</b> (${dImp} doc, ${mImp} meds)</div>` : `<div style="font-size:11.5px; color:var(--oliva); font-weight:700;">Pagos al día ✅</div>`}
          </div>
        `;
      }).join("")}
    </div>
  `;

  document.getElementById('btnToggleVentas').onclick = async () => {
    const accion = cerradas ? "reabrir" : "cerrar";
    if(!confirm(`¿Seguro que querés ${accion} las ventas para todos los Pinceles?`)) return;
    const prevConfig = snapshot(STATE.config);
    try { await api('SYNC'); } catch(e){}
    STATE.config.ventasCerradas = !cerradas;
    toast(STATE.config.ventasCerradas ? "Ventas cerradas 🔒" : "Ventas reabiertas 🟢");
    render();
    apiBackground('SET_SYS', { key: 'config', value: STATE.config }, () => { STATE.config = prevConfig; });
  };

  document.getElementById('btnGuardarMisas').onclick = ()=>{
    const prevMisas = snapshot(STATE.ventasMisas);
    const inputs = ['misasDocenas', 'misasMedias', 'misasDonaciones'].map(id => document.getElementById(id));
    const valores = inputs.map(input => Number(input.value));
    if (inputs.some((input,i) => input.value.trim() === '' || !Number.isFinite(valores[i]) || valores[i] < 0) ||
        !Number.isInteger(valores[0]) || !Number.isInteger(valores[1])) {
      toast('Completá docenas y medias enteras, y donaciones mayores o iguales a cero.', true); return;
    }
    STATE.ventasMisas = { docenas: valores[0], medias: valores[1], donaciones: valores[2] };
    toast("Guardando datos…"); render();
    apiBackground('SET_SYS', { key: 'ventas_misas', value: STATE.ventasMisas }, ()=>{ STATE.ventasMisas = prevMisas; });
  };
}

/* --------------------- FERIA: CONTROL DOCENAS --------------------- */
function renderEcoControlDocenas(main){
  if(!STATE.cocinaDescuentos) STATE.cocinaDescuentos = {};
  const ventas = Array.isArray(STATE.ventas) ? STATE.ventas : [];
  const crudasMap = Object.create(null), cocidasMap = Object.create(null);

  ventas.forEach(v => {
    const d = Number(v.docenas)||0, m = Number(v.medias)||0;
    if(d===0 && m===0) return;
    if(v.tipo === 'Crudas') {
      if(!crudasMap[v.pincel]) crudasMap[v.pincel] = {d:0, m:0};
      crudasMap[v.pincel].d += d; crudasMap[v.pincel].m += m;
    } else if(v.tipo === 'Cocidas') {
      if(!cocidasMap[v.pincel]) cocidasMap[v.pincel] = {d:0, m:0};
      cocidasMap[v.pincel].d += d; cocidasMap[v.pincel].m += m;
    }
  });

  const arrCrudas = Object.entries(crudasMap).sort((a,b)=>a[0].localeCompare(b[0]));
  const arrCocidas = Object.entries(cocidasMap).sort((a,b)=>a[0].localeCompare(b[0]));

  const calcTotales = (arr, tipoKey) => {
    let totD = 0, totM = 0, restD = 0, restM = 0;
    arr.forEach(([p, tot]) => {
      const h = STATE.cocinaDescuentos[`${tipoKey}_${p}`] || {d:0, m:0};
      totD += tot.d; totM += tot.m;
      restD += Math.max(0, tot.d - (Number(h.d)||0));
      restM += Math.max(0, tot.m - (Number(h.m)||0));
    });
    return { totD, totM, restD, restM };
  };

  const tCr = calcTotales(arrCrudas, 'Crudas');
  const tCo = calcTotales(arrCocidas, 'Cocidas');

  const renderTablaControl = (arr, tipoKey, colorBorde, titulo) => {
    let rowsHTML = "";
    if(arr.length === 0){
      rowsHTML = `<div class="empty">No hay pedidos registrados.</div>`;
    } else {
      rowsHTML = arr.map(([p, tot]) => {
        const key = `${tipoKey}_${p}`;
        const hecho = STATE.cocinaDescuentos[key] || {d:0, m:0};
        const restD = Math.max(0, tot.d - (Number(hecho.d)||0));
        const restM = Math.max(0, tot.m - (Number(hecho.m)||0));
        const listoTodo = restD === 0 && restM === 0;

        return `
          <div class="list-item" style="flex-direction:column; align-items:stretch; gap:8px; opacity:${listoTodo ? '0.55' : '1'};">
            <div class="row-between">
              <div class="li-name" style="display:flex; align-items:center; gap:6px;">
                ${escapeHTML(p)}
                ${listoTodo ? `<span class="badge badge-ok" style="font-size:10px;">¡Listo! ✅</span>` : ''}
              </div>
              <span style="font-size:11px; opacity:.7;">Total pedido: ${tot.d} doc · ${tot.m} med</span>
            </div>
            <div style="display:flex; gap:10px;">
              ${tot.d > 0 ? `
                <div style="flex:1; background:var(--crema-2); padding:8px; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <div style="font-size:10px; font-weight:800; text-transform:uppercase; opacity:.7;">Faltan Doc.</div>
                    <div style="font-size:18px; font-weight:900; color:${restD===0?'var(--oliva)':'var(--rojo)'};">${restD} <span style="font-size:11px; font-weight:600; opacity:.6;">/ ${tot.d}</span></div>
                  </div>
                  <div style="display:flex; gap:4px;">
                    <button class="btn-desc-cocina" data-key="${escapeHTML(key)}" data-field="d" data-max="${tot.d}" data-delta="1" title="Descontar 1 hecha" style="width:36px; height:32px; background:var(--rojo); color:white; border:none; border-radius:8px; font-weight:800; font-size:13px; padding:0; display:inline-flex; align-items:center; justify-content:center; cursor:pointer;">−1</button>
                    <button class="btn-desc-cocina" data-key="${escapeHTML(key)}" data-field="d" data-max="${tot.d}" data-delta="-1" title="Deshacer" style="width:30px; height:32px; background:#E7DCC3; color:var(--tinta); border:none; border-radius:8px; font-weight:700; font-size:12px; padding:0; display:inline-flex; align-items:center; justify-content:center; cursor:pointer;">+1</button>
                  </div>
                </div>
              ` : ''}
              ${tot.m > 0 ? `
                <div style="flex:1; background:var(--crema-2); padding:8px; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <div style="font-size:10px; font-weight:800; text-transform:uppercase; opacity:.7;">Faltan 1/2</div>
                    <div style="font-size:18px; font-weight:900; color:${restM===0?'var(--oliva)':'var(--rojo)'};">${restM} <span style="font-size:11px; font-weight:600; opacity:.6;">/ ${tot.m}</span></div>
                  </div>
                  <div style="display:flex; gap:4px;">
                    <button class="btn-desc-cocina" data-key="${escapeHTML(key)}" data-field="m" data-max="${tot.m}" data-delta="1" title="Descontar 1 hecha" style="width:36px; height:32px; background:var(--rojo); color:white; border:none; border-radius:8px; font-weight:800; font-size:13px; padding:0; display:inline-flex; align-items:center; justify-content:center; cursor:pointer;">−1</button>
                    <button class="btn-desc-cocina" data-key="${escapeHTML(key)}" data-field="m" data-max="${tot.m}" data-delta="-1" title="Deshacer" style="width:30px; height:32px; background:#E7DCC3; color:var(--tinta); border:none; border-radius:8px; font-weight:700; font-size:12px; padding:0; display:inline-flex; align-items:center; justify-content:center; cursor:pointer;">+1</button>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        `;
      }).join("");
    }
    return `
      <div class="card" style="border-left:4px solid ${colorBorde};">
        <h3 style="margin:0 0 10px; font-size:13px; color:var(--tinta); text-transform:uppercase; font-weight:800; letter-spacing:0.04em;">${titulo}</h3>
        ${rowsHTML}
      </div>
    `;
  };

  main.innerHTML = `
    <h2 class="section-title">Control de Docenas (Cocina)</h2>
    <div class="stat-grid" style="margin-bottom:14px;">
      <div class="stat-box">
        <div class="stat-num">${tCr.restD}<span style="font-size:18px;">+${tCr.restM}½</span></div>
        <div class="stat-label">Faltan Crudas</div>
        <div style="font-size:10.5px; opacity:.8; margin-top:2px;">Total: ${tCr.totD} doc + ${tCr.totM}½</div>
      </div>
      <div class="stat-box gold">
        <div class="stat-num">${tCo.restD}<span style="font-size:18px;">+${tCo.restM}½</span></div>
        <div class="stat-label">Faltan Cocidas</div>
        <div style="font-size:10.5px; opacity:.8; margin-top:2px;">Total: ${tCo.totD} doc + ${tCo.totM}½</div>
      </div>
    </div>
    <p class="muted" style="font-size:11.5px; margin:-4px 0 12px;">Tocá <b>−1</b> a medida que vayan armando cada docena o media docena hasta llegar a 0 (tocá +1 si te pasaste).</p>
    ${renderTablaControl(arrCrudas, 'Crudas', 'var(--rojo)', '🥟 Detalle Crudas')}
    ${renderTablaControl(arrCocidas, 'Cocidas', 'var(--dorado)', '🥟 Detalle Cocidas')}
  `;

  document.querySelectorAll('.btn-desc-cocina').forEach(btn => {
    btn.onclick = () => {
      const key = btn.dataset.key;
      const field = btn.dataset.field;
      const max = Number(btn.dataset.max) || 0;
      const delta = Number(btn.dataset.delta) || 0;
      const prev = snapshot(STATE.cocinaDescuentos);

      if(!STATE.cocinaDescuentos[key]) STATE.cocinaDescuentos[key] = {d:0, m:0};
      const actualHecho = Number(STATE.cocinaDescuentos[key][field]) || 0;
      const nuevoHecho = Math.min(max, Math.max(0, actualHecho + delta));
      STATE.cocinaDescuentos[key][field] = nuevoHecho;

      render();
      apiBackground('SET_SYS', { key: 'cocina_descuentos', value: STATE.cocinaDescuentos }, () => { STATE.cocinaDescuentos = prev; });
    };
  });
}

/* --------------------- MISIÓN: INVENTARIO --------------------- */
function renderEcoInventario(main){
  if(!STATE.inventario || !Array.isArray(STATE.inventario.items)){
    STATE.inventario = { fecha: new Date().toISOString().slice(0,10), items: [] };
  }
  const inv = STATE.inventario;

  main.innerHTML = `
    <h2 class="section-title">Inventario de Misión</h2>
    <div class="card">
      <label>Fecha en la que se inventarió</label>
      <input type="date" id="invFecha" value="${escapeHTML(inv.fecha || '')}">
      
      <div style="display:flex; gap:6px; font-size:10.5px; font-weight:800; text-transform:uppercase; opacity:.65; margin:10px 0 6px; padding:0 2px;">
        <div style="flex:2;">Ítem</div>
        <div style="flex:1;">U. Medida</div>
        <div style="width:70px; text-align:center;">Cantidad</div>
        <div style="width:28px;"></div>
      </div>
      
      <div id="invLista">
        ${inv.items.length === 0 ? `<div class="empty" style="padding:12px 0;">Lista en blanco. Tocá "+ Agregar ítem" abajo para empezar.</div>` : inv.items.map((it, idx) => `
          <div style="display:flex; gap:6px; align-items:center; margin-bottom:8px;">
            <input class="inv-nombre" data-idx="${idx}" value="${escapeHTML(it.nombre || '')}" placeholder="Ej: Arroz" style="flex:2; margin:0; padding:8px;">
            <input class="inv-unidad" data-idx="${idx}" value="${escapeHTML(it.unidad || '')}" placeholder="kg / u / L" style="flex:1; margin:0; padding:8px;">
            <input type="number" step="any" class="inv-cantidad" data-idx="${idx}" value="${it.cantidad ?? ''}" placeholder="0" style="width:70px; margin:0; padding:8px; text-align:center;">
            <button class="btn-del-inv" data-idx="${idx}" style="width:28px; height:34px; border:none; background:#FBE7DA; color:#B4551D; border-radius:8px; font-weight:800; cursor:pointer;">✕</button>
          </div>
        `).join("")}
      </div>

      <button class="btn btn-outline btn-sm" id="btnAddInvItem" style="margin-top:8px; width:100%;">＋ Agregar ítem</button>
      <button class="btn btn-primary" id="btnGuardarInventario" style="margin-top:12px;">Guardar inventario</button>
    </div>
  `;

  const syncInputsToMemory = () => {
    STATE.inventario.fecha = document.getElementById('invFecha').value;
    document.querySelectorAll('.inv-nombre').forEach(inp => {
      const i = Number(inp.dataset.idx);
      if(STATE.inventario.items[i]) STATE.inventario.items[i].nombre = inp.value;
    });
    document.querySelectorAll('.inv-unidad').forEach(inp => {
      const i = Number(inp.dataset.idx);
      if(STATE.inventario.items[i]) STATE.inventario.items[i].unidad = inp.value;
    });
    document.querySelectorAll('.inv-cantidad').forEach(inp => {
      const i = Number(inp.dataset.idx);
      if(STATE.inventario.items[i]) STATE.inventario.items[i].cantidad = inp.value === '' ? 0 : Number(inp.value);
    });
  };

  document.getElementById('btnAddInvItem').onclick = () => {
    syncInputsToMemory();
    STATE.inventario.items.push({ nombre: "", unidad: "", cantidad: 0 });
    render();
  };

  document.querySelectorAll('.btn-del-inv').forEach(b => {
    b.onclick = () => {
      syncInputsToMemory();
      STATE.inventario.items.splice(Number(b.dataset.idx), 1);
      render();
    };
  });

  document.getElementById('btnGuardarInventario').onclick = () => {
    syncInputsToMemory();
    const prevInv = snapshot(STATE.inventario);
    STATE.inventario.items = STATE.inventario.items.filter(x => x.nombre.trim() !== '' || x.unidad.trim() !== '' || Number(x.cantidad) > 0);
    toast("Guardando inventario…"); render();
    apiBackground('SET_SYS', { key: 'inventario', value: STATE.inventario }, () => { STATE.inventario = prevInv; });
  };
}

/* --------------------- MISIÓN: COMPRAS --------------------- */
function renderEcoComprasMision(main){
  const cm = STATE.comprasMision || {super:0, carniceria:0, verduleria:0, limpieza:0, transporte:0, otros:0};
  const rubros = [
    {k:'super', label:'🛒 Supermercado'},
    {k:'carniceria', label:'🥩 Carnicería'},
    {k:'verduleria', label:'🥬 Verdulería'},
    {k:'limpieza', label:'🧹 Limpieza'},
    {k:'transporte', label:'🚚 Transporte'},
    {k:'otros', label:'📦 Otros'}
  ];
  const total = rubros.reduce((acc, r) => acc + (Number(cm[r.k])||0), 0);

  main.innerHTML = `
    <h2 class="section-title">Compras de la Misión</h2>
    <p class="muted" style="font-size:11.5px; margin:-6px 0 12px;">Cargá acá los gastos generales para la misión. Al reiniciar la misión, quedan archivados en la base de datos para control.</p>
    <div class="card">
      ${rubros.map(r => `
        <label>${r.label} ($)</label>
        <input type="number" min="0" step="any" class="inp-compra-mision" data-k="${r.k}" value="${Number(cm[r.k])||0}">
      `).join("")}
      <div style="height:1px; background:#EEE1C4; margin:14px 0;"></div>
      <div class="row-between">
        <strong>Total gastado en Misión</strong>
        <strong style="color:var(--rojo); font-size:18px;">${fmt$(total)}</strong>
      </div>
      <button class="btn btn-primary" id="btnGuardarComprasMision" style="margin-top:14px;">Guardar gastos de misión</button>
    </div>
  `;

  document.getElementById('btnGuardarComprasMision').onclick = () => {
    const prev = snapshot(STATE.comprasMision);
    const nuevo = {};
    for(const inp of document.querySelectorAll('.inp-compra-mision')){
      const val = Number(inp.value);
      if(inp.value.trim() === '' || !Number.isFinite(val) || val < 0){
        toast("Ingresá montos mayores o iguales a cero.", true);
        inp.focus(); return;
      }
      nuevo[inp.dataset.k] = val;
    }
    STATE.comprasMision = nuevo;
    toast("Gastos de misión guardados ✅"); render();
    apiBackground('SET_SYS', { key: 'compras_mision', value: nuevo }, () => { STATE.comprasMision = prev; });
  };
}

/* --------------------- MISIÓN: LIQUIDACIÓN --------------------- */
window.asignarDeuda = async (pincel, monto) => {
  const prevDeuda = snapshot(STATE.deudaAsignada), prevPostFeria = snapshot(STATE.postFeriaPagos);
  try { await api('SYNC'); } catch(e){}
  STATE.deudaAsignada[pincel] = monto;
  if(STATE.postFeriaPagos[pincel]){ STATE.postFeriaPagos[pincel].pagado = false; }
  toast(`Asignando deuda a ${pincel}…`); render();
  apiBackground('SET_SYS', { key: 'deuda_asignada', value: STATE.deudaAsignada }, ()=>{ STATE.deudaAsignada = prevDeuda; });
  if(STATE.postFeriaPagos[pincel]){ apiBackground('SET_SYS', { key: 'postferia_pagos', value: STATE.postFeriaPagos }, ()=>{ STATE.postFeriaPagos = prevPostFeria; }); }
};

function calcularLiquidacion(nombre){
  const c = STATE.config, horas = totalHorasDe(nombre), docenasVendidas = totalDocenasDe(nombre);
  const deudaMonto = Calculos.montoLiquidacion(c, horas, docenasVendidas);
  return {horas, docenasVendidas, deudaMonto};
}

function renderEcoLiquidacion(main){
  const todos = [...new Set([...(STATE.pinceles||[]), ...(STATE.ventas||[]).map(v=>v.pincel), ...(STATE.asistencia||[]).map(a=>a.pincel), ...Object.keys(STATE.minimoPagos||{})])].sort();
  
  const activos = todos.filter(n => {
    const r = calcularLiquidacion(n);
    const pagomin = STATE.minimoPagos[n] && STATE.minimoPagos[n].pagado;
    const pagopost = STATE.postFeriaPagos[n] && STATE.postFeriaPagos[n].pagado;
    const deuda = STATE.deudaAsignada[n] && STATE.deudaAsignada[n] > 0;
    return r.horas > 0 || r.docenasVendidas > 0 || pagomin || pagopost || deuda;
  });

  main.innerHTML = `
    <h2 class="section-title">Liquidación Post Feria</h2><p class="muted" style="margin:0 0 12px; font-size:11.5px;">Cálculo: (Horas misión - hs - docenas) * ${fmt$(STATE.config.valorHora ?? DEFAULT_CONFIG.valorHora)} * ${STATE.config.porcentajeSolidario ?? DEFAULT_CONFIG.porcentajeSolidario}%</p>
    <div class="card">
      ${activos.length===0 ? `<div class="empty">Nadie registró horas ni ventas todavía.</div>` : activos.map(n=>{
        const r = calcularLiquidacion(n), yaAsignada = STATE.deudaAsignada[n] || 0, postFeriaOk = STATE.postFeriaPagos[n] && STATE.postFeriaPagos[n].pagado;
        const pagomin = STATE.minimoPagos[n] && STATE.minimoPagos[n].pagado;
        return `
          <div class="list-item" style="flex-direction:column; align-items:flex-start; gap:8px;">
            <div class="row-between" style="width:100%;">
              <div>
                <div class="li-name">${escapeHTML(n)}</div>
                <div class="li-sub">${r.horas.toFixed(1)} hs · ${r.docenasVendidas} doc.</div>
              </div>
              <div style="text-align:right;">
                <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px; margin-bottom:6px;">
                  <span class="badge ${r.deudaMonto>0?'badge-pend':'badge-ok'}" style="white-space:nowrap; display:block;">Debe: ${fmt$(r.deudaMonto)}</span>
                  ${pagomin ? `<span style="font-size:9.5px; background:var(--oliva); color:white; padding:3px 6px; border-radius:8px; font-weight:700; text-transform:uppercase; letter-spacing:0.03em;">Mínimo ✅</span>` : `<span style="font-size:9.5px; background:#FBE7DA; color:#B4551D; padding:3px 6px; border-radius:8px; font-weight:700; text-transform:uppercase; letter-spacing:0.03em;">Mínimo ❌</span>`}
                </div>
                ${yaAsignada > 0 ? `<span style="font-size:10px; color:var(--oliva); font-weight:800; display:block; margin-bottom:4px;">Ya asignado: ${fmt$(yaAsignada)}</span>${postFeriaOk ? `<span style="font-size:10px; background:var(--oliva); color:white; padding:2px 6px; border-radius:10px; font-weight:700;">Pagó deuda ✅</span>` : `<span style="font-size:10px; background:#B4551D; color:white; padding:2px 6px; border-radius:10px; font-weight:700;">Aún no pagó</span>`}` : ''}
              </div>
            </div>
            ${(r.deudaMonto > 0 && !postFeriaOk) ? `<button class="btn btn-outline btn-sm asignar-deuda" style="width:100%; padding:6px; font-size:12px;" data-nombre="${escapeHTML(n)}" data-monto="${r.deudaMonto}">${yaAsignada > 0 ? 'Actualizar deuda asignada' : 'Confirmar y asignar deuda a su perfil'}</button>` : ''}
          </div>
        `;
      }).join("")}
    </div>
  `;
  document.querySelectorAll('.asignar-deuda').forEach(el => {
    el.onclick = () => asignarDeuda(el.dataset.nombre, Number(el.dataset.monto));
  });
}

/* --------------------- FERIA: RESULTADOS Y REINICIO --------------------- */
window.reiniciarMision = async () => {
  const confirm1 = confirm("⚠️ ATENCIÓN: Estás por guardar el historial y borrar TODAS las ventas, horas y gastos para iniciar una nueva feria. ¿Estás seguro?");
  if(!confirm1) return;

  const nombreMision = prompt("Ponele un nombre a esta feria/misión para guardarla en el Historial (ej: 'Feria Julio 2026'):");
  if(!nombreMision || !nombreMision.trim()){ toast("Reinicio cancelado: hace falta un nombre para archivarla.", true); return; }

  const confirm2 = prompt("Escribí la palabra BORRAR (en mayúsculas) para confirmar:");
  if(confirm2 !== "BORRAR") { toast("Reinicio cancelado.", true); return; }
  
  const c = STATE.config;
  const finanzas = Calculos.resumenFinanciero(STATE.ventas, STATE.ventasMisas, STATE.receta, c);
  const docPinceles = STATE.ventas.reduce((a,v) => a + (Number(v.docenas)||0), 0);
  const medPinceles = STATE.ventas.reduce((a,v) => a + (Number(v.medias)||0), 0);
  const docMisas = Number(STATE.ventasMisas.docenas)||0;
  const medMisas = Number(STATE.ventasMisas.medias)||0;
  
  const cm = STATE.comprasMision || {};
  const totalComprasMision = Object.values(cm).reduce((a,b)=>a+(Number(b)||0), 0);
  const confStr = `Mínimo: ${fmt$(c.pagoMinimo)} • Hs Misión: ${c.horasObjetivo} hs • Valor 1hr: ${fmt$(c.valorHora)} • Docena: ${fmt$(c.valorDocena)} • 1/2 Doc: ${fmt$(c.valorMediaDocena)} • Solidario: ${c.porcentajeSolidario}% • Compras Misión: ${fmt$(totalComprasMision)}`;

  const summary = {
    nombre: nombreMision.trim(),
    fecha: new Date().toLocaleDateString('es-AR'),
    docPinceles: docPinceles + (medPinceles*0.5), docMisas: docMisas + (medMisas*0.5),
    ingresos: finanzas.ingresos, egresos: finanzas.egresos, ganancia: finanzas.ganancia,
    config: confStr,
    comprasMision: cm
  };

  try { await api('RESET_MISSION', summary); toast("Misión archivada y reiniciada 🗂️"); render(); }
  catch(e) { toast("No se pudo reiniciar la misión, intentá de nuevo.", true); }
};

function renderEcoResultados(main) {
  const { ingresosPinceles, ingresosMisas, donaciones: totalDonaciones, ingresos: ingresosTotales, egresos: egresosTotales, ganancia: gananciaNeta } =
    Calculos.resumenFinanciero(STATE.ventas, STATE.ventasMisas, STATE.receta, STATE.config);
  const historial = STATE.historial || [];
  
  main.innerHTML = `
    <h2 class="section-title">Resultados de la Feria Actual</h2><div class="banner-min" style="background:${gananciaNeta >= 0 ? 'var(--oliva)' : 'var(--rojo)'}; color:var(--blanco); padding:18px;"><div style="font-size:13px; font-weight:700; text-transform:uppercase; opacity:.9;">Ganancia Neta</div><div class="stat-num" style="font-size:42px; margin:4px 0;">${fmt$(gananciaNeta)}</div><div style="font-size:12px; font-weight:500; opacity:.8;">(Ingresos totales menos Egresos totales)</div></div>
    <div class="card"><div class="row-between" style="margin-bottom:8px;"><span class="muted">Ventas Pinceles</span><strong>${fmt$(ingresosPinceles)}</strong></div><div class="row-between" style="margin-bottom:8px;"><span class="muted">Ventas en Misas</span><strong>${fmt$(ingresosMisas)}</strong></div><div class="row-between" style="margin-bottom:8px;"><span class="muted">Donaciones (Misas)</span><strong>${fmt$(totalDonaciones)}</strong></div><div style="height:1px; background:#EEE1C4; margin:14px 0;"></div><div class="row-between" style="color:var(--oliva);"><strong>Total Ingresos</strong><strong style="font-size:18px;">${fmt$(ingresosTotales)}</strong></div></div>
    <div class="card"><div class="row-between" style="color:var(--rojo);"><strong>Total Gastos (Compras Feria)</strong><strong style="font-size:18px;">${fmt$(egresosTotales)}</strong></div></div>
    
    <div style="margin-top:40px; padding-top:20px; border-top:2px dashed #E7DCC3;">
      <h2 class="section-title" style="color:var(--rojo);">⚠️ Zona de Peligro</h2>
      <p class="muted" style="font-size:11.5px; margin-bottom:10px;">Esto guardará un resumen en el Historial (con el nombre que le pongas) y borrará las ventas y horas de la feria actual.</p>
      <button class="btn btn-outline" style="border-color:var(--rojo); color:var(--rojo);" onclick="reiniciarMision()">Archivar y Reiniciar Misión</button>
    </div>

    <h2 class="section-title" style="margin-top:30px;">Historial de Misiones</h2>
    <div class="card">
      ${historial.length===0 ? `<div class="empty">Todavía no hay misiones archivadas.</div>` : historial.slice().reverse().map(h=>`
        <div style="border-bottom:1px solid #F0E4C8; padding-bottom:12px; margin-bottom:12px;">
          <div class="row-between" style="margin-bottom:2px;"><strong style="color:var(--rojo); font-size:15.5px;">${h.nombre ? escapeHTML(h.nombre) : ('Feria del '+escapeHTML(h.fecha))}</strong><span class="badge ${h.ganancia >= 0 ? 'badge-ok' : 'badge-pend'}" style="font-size:11px;">Neta: ${fmt$(Number(h.ganancia))}</span></div>
          <div class="muted" style="margin-bottom:8px;">${h.nombre ? escapeHTML(h.fecha) : ''}</div>
          <div class="row-between" style="font-size:12px; margin-bottom:4px;"><span class="muted">Ingresos Totales:</span><strong>${fmt$(Number(h.ingresos))}</strong></div>
          <div class="row-between" style="font-size:12px; margin-bottom:4px;"><span class="muted">Egresos Totales:</span><strong>${fmt$(Number(h.egresos))}</strong></div>
          <div class="row-between" style="font-size:12px; margin-bottom:4px;"><span class="muted">Ventas Pinceles:</span><strong>${Number(h.docPinceles)||0} doc.</strong></div>
          <div class="row-between" style="font-size:12px; margin-bottom:8px;"><span class="muted">Ventas Misas:</span><strong>${Number(h.docMisas)||0} doc.</strong></div>
          <div style="font-size:11px; background:var(--crema-2); padding:8px; border-radius:8px; color:var(--tinta); opacity:0.9; line-height:1.4;"><strong>Parámetros usados:</strong><br>${escapeHTML(h.config)}</div>
        </div>
      `).join("")}
    </div>
  `;
}
