/* ============================= ECONOMY ============================= */
function openPinModal(){
  const root = document.getElementById('modalRoot'); let entered = ""; const cfgPin = (STATE.config.pin || "0406").toString();
  root.innerHTML = `<div class="overlay" id="ov"><div class="sheet" style="text-align:center;"><span class="close-x" id="closeX">✕</span><h3>EconomyTeam</h3><p class="muted">Ingresá el PIN del equipo</p><div class="pin-dots" id="pinDots">${[0,1,2,3].map(()=>`<div class="pin-dot"></div>`).join("")}</div><div class="keypad" id="keypad">${[1,2,3,4,5,6,7,8,9,'','0','⌫'].map(k=>`<div class="key" data-k="${k}">${k}</div>`).join("")}</div></div></div>`;
  document.getElementById('closeX').onclick = ()=> root.innerHTML=""; document.getElementById('ov').onclick = (e)=>{ if(e.target.id==='ov') root.innerHTML=""; };
  const dots = ()=>document.querySelectorAll('.pin-dot');
  document.querySelectorAll('.key').forEach(k=>{
    k.onclick = ()=>{
      const val = k.dataset.k; if(val==='') return;
      if(val==='⌫'){ entered = entered.slice(0,-1); } else if(entered.length<4){ entered += val; }
      dots().forEach((d,i)=> d.classList.toggle('filled', i<entered.length));
      if(entered.length===4){ setTimeout(()=>{ if(entered === cfgPin){ STATE.economiaOn = true; STATE.ecoTab="ventas"; root.innerHTML=""; render(); } else { toast("PIN incorrecto", true); entered=""; dots().forEach(d=>d.classList.remove('filled')); } }, 150); }
    };
  });
}

function renderBottomNavEconomia(){
  const items = [
    {id:"ventas", label:"Ventas", icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2l1.5 4h9L18 2"/><path d="M3.5 6h17l-1.6 12.5A2 2 0 0117 20H7a2 2 0 01-1.9-1.5L3.5 6z"/></svg>`},
    {id:"compras", label:"Compras", icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`},
    {id:"liquidacion", label:"Liquid.", icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`},
    {id:"resultados", label:"Resultados", icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`},
    {id:"config", label:"Config", icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6c.57-.24 1-.77 1-1.51V3a2 2 0 114 0v.09c0 .74.43 1.27 1 1.51.62.26 1.35.14 1.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06c-.47.47-.59 1.2-.33 1.82.24.57.77 1 1.51 1H21a2 2 0 110 4h-.09c-.74 0-1.27.43-1.51 1z"/></svg>`}
  ];
  document.getElementById('bottomNav').innerHTML = items.map(it=>`<button class="nav-btn ${STATE.ecoTab===it.id?'active':''}" data-etab="${it.id}">${it.icon}<span>${it.label}</span></button>`).join(""); document.querySelectorAll('.nav-btn').forEach(b=>{ b.onclick = ()=>{ STATE.ecoTab = b.dataset.etab; render(); }; });
}

function renderEconomia(){
  renderBottomNavEconomia(); const main = document.getElementById('main');
  if(STATE.ecoTab==="config") return renderEcoConfig(main); if(STATE.ecoTab==="compras") return renderEcoCompras(main); if(STATE.ecoTab==="ventas") return renderEcoVentas(main); if(STATE.ecoTab==="liquidacion") return renderEcoLiquidacion(main); if(STATE.ecoTab==="resultados") return renderEcoResultados(main);
}

function renderEcoConfig(main){
  const c = STATE.config;
  main.innerHTML = `<h2 class="section-title">Parámetros de la misión</h2><div class="card"><label>Mínimo de misión ($)</label><input type="number" id="cMinimo" value="${c.pagoMinimo}"><label>Horas para pagar la misión</label><input type="number" id="cHorasObj" value="${c.horasObjetivo}"><label>Valor 1 hora ($)</label><input type="number" id="cHora" value="${c.valorHora}"><label>Precio 1 docena ($)</label><input type="number" id="cDocena" value="${c.valorDocena}"><label>Precio 1/2 docena ($)</label><input type="number" id="cMedia" value="${c.valorMediaDocena}"><label>Porcentaje Solidario (%)</label><input type="number" id="cPorc" value="${c.porcentajeSolidario}"><label>PIN del panel EconomyTeam</label><input type="text" id="cPin" value="${escapeHTML(c.pin)}" maxlength="4"><button class="btn btn-primary" id="btnGuardarConfig">Guardar cambios</button></div>`;
  document.getElementById('btnGuardarConfig').onclick = () => {
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
    STATE.config = { ...STATE.config, ...valores, pin };
    toast('Guardando configuración…'); render();
    apiBackground('SET_SYS', { key: 'config', value: STATE.config }, () => { STATE.config = prevConfig; });
  };
}

function renderEcoCompras(main){
  const docCoc = STATE.docenasCocinar;
  const rows = STATE.receta.map((r,i) => {
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
      const parts = r.ing.split(' - ');
      const name = parts[0];
      const unit = parts[1] ? `<span style="font-size:10.5px; opacity:.6; font-weight:700;"> - ${escapeHTML(parts[1])}</span>` : '';
      tableHTML += `<tr><td style="line-height:1.2;">${escapeHTML(name)}${unit}</td><td><input type="number" min="0" step="any" class="stockInput" data-i="${r.idx}" value="${Number(r.stock)||0}" style="width:48px; padding:6px; font-size:12px; margin:0;"></td><td style="font-weight:800; color:var(--rojo); text-align:center;">${r.totalComprar===null?'—':r.totalComprar}</td><td><input type="number" min="0" step="any" class="gastoInput" data-i="${r.idx}" value="${Number(r.gasto)||0}" style="width:60px; padding:6px; font-size:12px; margin:0;"></td></tr>`;
    });
  });

  main.innerHTML = `<h2 class="section-title">Calculadora de compras</h2><div class="card"><label>Docenas a cocinar esta feria</label><input type="number" id="cocDoc" value="${docCoc}"><button class="btn btn-gold btn-sm" id="btnRecalc" style="width:100%">Recalcular cantidades</button></div><div class="card"><table class="mini"><thead><tr><th>Ítem</th><th>Stock</th><th>Comprar</th><th>Gasto $</th></tr></thead><tbody>${tableHTML}</tbody></table><div style="height:1px; background:#EEE1C4; margin:14px 0;"></div><div class="row-between"><strong>Gasto total feria</strong><strong style="color:var(--rojo); font-size:18px;">${fmt$(totalGasto)}</strong></div><button class="btn btn-primary" id="btnGuardarCompras" style="margin-top:14px;">Guardar cambios en tabla</button></div>`;
  
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

function renderEcoVentas(main){
  const crudasMap = Object.create(null), cocidasMap = Object.create(null);
  STATE.ventas.forEach(v => {
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
  const renderDetalle = (arr) => arr.length===0 ? `<tr><td colspan="3" style="text-align:center; opacity:.5;">No hay ventas</td></tr>` : arr.map(([p, v]) => `<tr><td>${escapeHTML(p)}</td><td style="text-align:center; font-weight:700;">${v.d}</td><td style="text-align:center; font-weight:700;">${v.m}</td></tr>`).join("");

  const totCrudasDoc = STATE.ventas.filter(v=>v.tipo==='Crudas').reduce((a,v)=>a+(Number(v.docenas)||0),0), totCrudasMed = STATE.ventas.filter(v=>v.tipo==='Crudas').reduce((a,v)=>a+(Number(v.medias)||0),0), totCocidasDoc = STATE.ventas.filter(v=>v.tipo==='Cocidas').reduce((a,v)=>a+(Number(v.docenas)||0),0), totCocidasMed = STATE.ventas.filter(v=>v.tipo==='Cocidas').reduce((a,v)=>a+(Number(v.medias)||0),0);
  
  const fN = n => Number.isInteger(n) ? n : n.toFixed(1);
  const crudasDocEq = totCrudasDoc + totCrudasMed*0.5;
  const cocidasDocEq = totCocidasDoc + totCocidasMed*0.5;
  const totalEq = crudasDocEq + cocidasDocEq;

  main.innerHTML = `
    <h2 class="section-title">Ventas en Misas</h2><div class="card" style="border-left: 4px solid var(--oliva);"><label>Docenas vendidas</label><input type="number" id="misasDocenas" value="${Number(STATE.ventasMisas.docenas) || 0}"><label>Medias docenas vendidas</label><input type="number" id="misasMedias" value="${Number(STATE.ventasMisas.medias) || 0}"><label>Donaciones recibidas ($)</label><input type="number" id="misasDonaciones" value="${Number(STATE.ventasMisas.donaciones) || 0}"><button class="btn btn-primary" id="btnGuardarMisas" style="margin-top:8px;">Guardar datos de misas</button></div>
    
    <h2 class="section-title" style="margin-top:24px; font-size:14px; color:var(--rojo);">Ventas Pinceles: ${fN(crudasDocEq)} crudas + ${fN(cocidasDocEq)} cocidas = ${fN(totalEq)}</h2>
    <div class="stat-grid">
      <div class="stat-box" style="cursor:pointer; position:relative;" onclick="const e=document.getElementById('det-crudas'); e.style.display=e.style.display==='none'?'block':'none';">
        <div class="stat-num">${totCrudasDoc}<span style="font-size:18px;">+${totCrudasMed}½</span></div>
        <div class="stat-label">Crudas <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle; margin-bottom:2px;"><polyline points="6 9 12 15 18 9"></polyline></svg></div>
      </div>
      <div class="stat-box gold" style="cursor:pointer; position:relative;" onclick="const e=document.getElementById('det-cocidas'); e.style.display=e.style.display==='none'?'block':'none';">
        <div class="stat-num">${totCocidasDoc}<span style="font-size:18px;">+${totCocidasMed}½</span></div>
        <div class="stat-label">Cocidas <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle; margin-bottom:2px;"><polyline points="6 9 12 15 18 9"></polyline></svg></div>
      </div>
    </div>

    <div id="det-crudas" class="card" style="display:none; margin-top:12px; border-left:4px solid var(--rojo); padding:14px;">
      <h3 style="margin:0 0 10px; font-size:12px; color:var(--rojo); text-transform:uppercase; font-weight:800; letter-spacing:0.04em;">Detalle Crudas</h3>
      <table class="mini">
        <thead><tr><th>Pincel</th><th style="text-align:center; width:60px;">Doc.</th><th style="text-align:center; width:60px;">1/2 Doc.</th></tr></thead>
        <tbody>${renderDetalle(arrCrudas)}</tbody>
      </table>
    </div>

    <div id="det-cocidas" class="card" style="display:none; margin-top:12px; border-left:4px solid var(--dorado); padding:14px;">
      <h3 style="margin:0 0 10px; font-size:12px; color:var(--tinta); text-transform:uppercase; font-weight:800; letter-spacing:0.04em;">Detalle Cocidas</h3>
      <table class="mini">
        <thead><tr><th>Pincel</th><th style="text-align:center; width:60px;">Doc.</th><th style="text-align:center; width:60px;">1/2 Doc.</th></tr></thead>
        <tbody>${renderDetalle(arrCocidas)}</tbody>
      </table>
    </div>

    <h2 class="section-title" style="margin-top:20px;">Detalle de pagos por Pincel</h2>
    <div class="card">${[...new Set(STATE.ventas.map(v=>v.pincel))].length===0 ? `<div class="empty">Todavía no hay ventas cargadas.</div>` : [...new Set(STATE.ventas.map(v=>v.pincel))].map(p=>{ const vs = STATE.ventas.filter(x=>x.pincel===p), impagas = vs.filter(x=>x.estado==='Falta Pagar'); const dImp = impagas.reduce((a,x)=>a+(Number(x.docenas)||0),0), mImp = impagas.reduce((a,x)=>a+(Number(x.medias)||0),0); const plataImpaga = Calculos.totalPendiente(vs, STATE.config); return `<div class="list-item" style="flex-direction:column; align-items:flex-start; gap:6px;"><div class="row-between" style="width:100%;"><div class="li-name">${escapeHTML(p)}</div><span class="badge badge-neutral">${totalDocenasDe(p)} doc. vendidas</span></div>${plataImpaga > 0 ? `<div style="font-size:11.5px; color:#B4551D; background:#FBE7DA; padding:4px 8px; border-radius:6px; width:100%;">Adeuda transferir: <b>${fmt$(plataImpaga)}</b> (${dImp} doc, ${mImp} meds)</div>` : `<div style="font-size:11.5px; color:var(--oliva); font-weight:700;">Transferencias al día ✅</div>`}</div>` }).join("")}</div>
  `;
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

window.asignarDeuda = (pincel, monto) => {
  const prevDeuda = snapshot(STATE.deudaAsignada), prevPostFeria = snapshot(STATE.postFeriaPagos);
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
  const todos = [...new Set([...STATE.pinceles, ...STATE.ventas.map(v=>v.pincel), ...STATE.asistencia.map(a=>a.pincel), ...Object.keys(STATE.minimoPagos)])].sort();
  
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
  
  const confStr = `Mínimo: ${fmt$(c.pagoMinimo)} • Hs Misión: ${c.horasObjetivo} hs • Valor 1hr: ${fmt$(c.valorHora)} • Docena: ${fmt$(c.valorDocena)} • 1/2 Doc: ${fmt$(c.valorMediaDocena)} • Solidario: ${c.porcentajeSolidario}%`;

  const summary = {
    nombre: nombreMision.trim(),
    fecha: new Date().toLocaleDateString('es-AR'),
    docPinceles: docPinceles + (medPinceles*0.5), docMisas: docMisas + (medMisas*0.5),
    ingresos: finanzas.ingresos, egresos: finanzas.egresos, ganancia: finanzas.ganancia, config: confStr
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
    <div class="card"><div class="row-between" style="color:var(--rojo);"><strong>Total Gastos (Compras)</strong><strong style="font-size:18px;">${fmt$(egresosTotales)}</strong></div></div>
    
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
