/* ============================= ECONOMY ============================= */
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
            void actualizarVentasAlVolver();
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
    <nav class="eco-areas" aria-label="Áreas de Economía">
      ${[['feria', 'Feria'], ['mision', 'Misión'], ['config', 'Configuración']].map(([id, etiqueta]) =>
        `<button class="btn-area-eco" data-area="${id}" aria-pressed="${area === id}">${etiqueta}</button>`).join('')}
    </nav>
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
      if (STATE.ecoTab === 'ventas') void actualizarVentasAlVolver();
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
      {id:"control_docenas", label:"Control de docenas", icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>`}
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
    nav.querySelectorAll('.nav-btn').forEach(b => {
      b.onclick = () => {
        STATE.ecoTab = b.dataset.etab;
        if (STATE.ecoTab === 'resultados') volverAListaFerias();
        render();
        if (STATE.ecoTab === 'ventas') void actualizarVentasAlVolver();
      };
    });
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
  const campos = [
    ['pagoMinimo', 'cMinimo', 'Mínimo de misión ($)'],
    ['horasObjetivo', 'cHorasObj', 'Horas para pagar la misión'],
    ['valorHora', 'cHora', 'Valor de 1 hora ($)'],
    ['valorDocena', 'cDocena', 'Precio de 1 docena ($)'],
    ['valorMediaDocena', 'cMedia', 'Precio de ½ docena ($)'],
    ['porcentajeSolidario', 'cPorc', 'Porcentaje solidario (%)']
  ];
  main.innerHTML = `
    <h2 class="section-title">Parámetros de la misión</h2>
    <div class="card">
      <div class="form-grid">
        ${campos.map(([clave, id, etiqueta]) => `<div><label for="${id}">${etiqueta}</label><input type="number" id="${id}" min="0" step="any" value="${escapeHTML(c[clave] ?? 0)}"></div>`).join('')}
        <div><label for="cPin">PIN del panel EconomyTeam</label><input type="text" id="cPin" inputmode="numeric" value="${escapeHTML(c.pin || '0406')}" maxlength="4"></div>
      </div>
      <button class="btn btn-primary" id="btnGuardarConfig">Guardar cambios</button>
    </div>
    <h2 class="section-title">Reiniciar misión</h2>
    <div class="card">
      <p>El reinicio conserva el padrón y archiva un resumen con los gastos de Misión. Se vacían las ventas, las horas, los pagos y el inventario actual.</p>
      <button class="btn btn-outline" id="btnReiniciarMision">${reinicioPendiente ? 'Reintentar reinicio' : 'Archivar y reiniciar misión'}</button>
    </div>`;
  document.getElementById('btnReiniciarMision').onclick = reiniciarMision;
  document.getElementById('btnGuardarConfig').onclick = async () => {
    const valores = {};
    for (const [clave, id] of campos) {
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
    try {
      await api('UPDATE_CONFIG', { cambios: { ...valores, pin } });
      render();
      toast('Configuración guardada.');
    } catch (_) {}
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
  const cerradas = STATE.config.ventasCerradas;
  const ventasPorPincel = new Map();
  for (const venta of ventas) {
    if (!ventasPorPincel.has(venta.pincel)) ventasPorPincel.set(venta.pincel, []);
    ventasPorPincel.get(venta.pincel).push(venta);
  }
  const detalle = [...ventasPorPincel].map(([nombre, pedidos]) => ({
    nombre,
    pedidos,
    deuda: Calculos.totalPendiente(pedidos, STATE.config),
    docenas: pedidos.reduce((total, pedido) => total + docenasEquiv(pedido), 0)
  }));

  main.innerHTML = `
    <div class="card estado-ventas" style="background:${cerradas ? '#FBE7DA' : '#E8F3E8'}; border:1.5px solid ${cerradas ? '#B4551D' : 'var(--oliva)'};">
      <div>
        <div style="font-weight:800; font-size:13.5px; color:${cerradas ? '#B4551D' : 'var(--oliva)'};">${cerradas ? '🔒 Ventas de Pinceles CERRADAS' : '🟢 Ventas de Pinceles ABIERTAS'}</div>
        <div style="font-size:11px; opacity:.85;">${cerradas ? 'Pueden eliminar ventas y marcar pagos y retiros.' : 'Pueden anotar y editar ventas.'}</div>
      </div>
      <button type="button" class="btn btn-sm" id="btnToggleVentas" aria-haspopup="dialog" style="width:auto; padding:8px 12px; font-size:12px; background:${cerradas ? 'var(--oliva)' : 'var(--rojo)'}; color:white; white-space:nowrap;">
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

    <div class="detalle-ventas-encabezado">
      <h2 class="section-title">Detalle por Pincel</h2>
      <div class="orden-ventas">
        <label for="ordenVentasPinceles">Ordenar por</label>
        <div class="selector-redondeado">
          <select id="ordenVentasPinceles" ${detalle.length ? '' : 'disabled'}>
            <option value="deuda">Mayor deuda</option>
            <option value="docenas">Más docenas vendidas</option>
            <option value="nombre">Pincel (A–Z)</option>
          </select>
        </div>
      </div>
    </div>
    <div class="card" id="detalleVentasPinceles"></div>
  `;

  const orden = main.querySelector('#ordenVentasPinceles');
  const lista = main.querySelector('#detalleVentasPinceles');
  orden.value = STATE.ecoOrdenVentas;
  function mostrarDetalle() {
    const campo = STATE.ecoOrdenVentas;
    detalle.sort((a, b) => (campo === 'nombre' ? 0 : b[campo] - a[campo]) ||
      String(a.nombre).localeCompare(String(b.nombre), 'es-AR'));
    lista.innerHTML = detalle.length ? detalle.map(({ nombre, pedidos, deuda, docenas }) => {
      const impagas = pedidos.filter(pedido => pedido.estado === 'Falta Pagar');
      const retiradas = pedidos.filter(pedido => pedido.retirado);
      const dImp = impagas.reduce((a, x) => a + (Number(x.docenas) || 0), 0), mImp = impagas.reduce((a, x) => a + (Number(x.medias) || 0), 0);
      const dRet = retiradas.reduce((a, x) => a + (Number(x.docenas) || 0), 0), mRet = retiradas.reduce((a, x) => a + (Number(x.medias) || 0), 0);
      const dTot = pedidos.reduce((a, x) => a + (Number(x.docenas) || 0), 0), mTot = pedidos.reduce((a, x) => a + (Number(x.medias) || 0), 0);
      return `
        <div class="list-item" style="flex-direction:column; align-items:flex-start; gap:6px;">
          <div class="row-between" style="width:100%;">
            <div class="li-name">${escapeHTML(nombre)}</div>
            <span class="badge badge-neutral">${docenas} doc. vendidas</span>
          </div>
          <div style="font-size:11.5px; color:var(--tinta); opacity:.85;">
            📦 Retiró: <b>${dRet} doc.</b> y <b>${mRet} medias</b> <span style="opacity:.7;">(de ${dTot} doc. y ${mTot} medias)</span>
          </div>
          ${deuda > 0 ? `<div style="font-size:11.5px; color:#B4551D; background:#FBE7DA; padding:4px 8px; border-radius:6px; width:100%;">Adeuda pagar: <b>${fmt$(deuda)}</b> (${dImp} doc, ${mImp} meds)</div>` : `<div style="font-size:11.5px; color:var(--oliva); font-weight:700;">Pagos al día ✅</div>`}
        </div>`;
    }).join('') : '<div class="empty">Todavía no hay ventas cargadas.</div>';
  }
  orden.onchange = () => {
    STATE.ecoOrdenVentas = orden.value;
    mostrarDetalle();
  };
  mostrarDetalle();

  document.getElementById('btnToggleVentas').onclick = () => abrirConfirmacionEstadoVentas(!cerradas);

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

function abrirConfirmacionEstadoVentas(cerrarVentas) {
  const root = document.getElementById('modalRoot');
  const accion = cerrarVentas ? 'Cerrar ventas' : 'Reabrir ventas';
  const descripcion = cerrarVentas
    ? 'Se bloqueará el registro y la edición de pedidos para todos los Pinceles. Podrán seguir eliminando pedidos y marcando pagos y retiros.'
    : 'Todos los Pinceles podrán volver a registrar y editar pedidos.';
  const idMision = idMisionActual(STATE.historial);
  root.innerHTML = `<dialog class="sheet sheet-confirmar-venta estado-ventas-dialogo" aria-labelledby="tituloEstadoVentas" aria-describedby="descripcionEstadoVentas">
    <h3 id="tituloEstadoVentas">¿${accion}?</h3>
    <p id="descripcionEstadoVentas">${descripcion}</p>
    <p class="estado-ventas-respuesta" role="status"></p>
    <div class="venta-confirmar-acciones">
      <button type="button" class="btn btn-outline" id="cancelarEstadoVentas" autofocus>Cancelar</button>
      <button type="button" class="btn btn-primary${cerrarVentas ? '' : ' estado-ventas-reabrir'}" id="confirmarEstadoVentas">${accion}</button>
    </div>
  </dialog>`;

  const dialogo = root.querySelector('dialog');
  const cancelar = dialogo.querySelector('#cancelarEstadoVentas');
  const confirmar = dialogo.querySelector('#confirmarEstadoVentas');
  const mensaje = dialogo.querySelector('[role="status"]');
  cancelar.onclick = () => dialogo.close();
  dialogo.addEventListener('cancel', event => {
    if (confirmar.disabled) event.preventDefault();
  });
  dialogo.addEventListener('close', () => {
    dialogo.remove();
    document.getElementById('btnToggleVentas')?.focus({ preventScroll: true });
  });

  confirmar.onclick = async () => {
    if (confirmar.disabled) return;
    confirmar.disabled = cancelar.disabled = true;
    dialogo.setAttribute('closedby', 'none');
    mensaje.textContent = 'Guardando…';
    try {
      const respuesta = await api('SET_VENTAS_CERRADAS', { cerradas: cerrarVentas, idMision }, { silenciosa: true });
      if (!respuesta.config || STATE.config.ventasCerradas !== cerrarVentas) {
        mensaje.textContent = 'Google todavía no confirmó el cambio. Intentá de nuevo.';
        return;
      }
      dialogo.close();
      render();
      toast(cerrarVentas ? 'Ventas cerradas.' : 'Ventas reabiertas.');
    } catch (error) {
      mensaje.textContent = error.code ? error.message : 'No se pudo guardar el cambio. Intentá de nuevo.';
    } finally {
      confirmar.disabled = cancelar.disabled = false;
      dialogo.removeAttribute('closedby');
      if (dialogo.open) confirmar.focus();
    }
  };

  dialogo.showModal();
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

  const hechoEnRango = (valor, max) => Math.min(max, Math.max(0, Number(valor) || 0));
  const prepararFilas = (mapa, tipo) => Object.entries(mapa).map(([p, tot]) => {
    const key = `${tipo}_${p}`;
    const hecho = STATE.cocinaDescuentos[key] || { d: 0, m: 0 };
    const restD = tot.d - hechoEnRango(hecho.d, tot.d);
    const restM = tot.m - hechoEnRango(hecho.m, tot.m);
    const listoTodo = restD === 0 && restM === 0;
    return { p, tot, key, restD, restM, listoTodo };
  }).sort((a, b) => Number(a.listoTodo) - Number(b.listoTodo) || a.p.localeCompare(b.p));

  const filasCrudas = prepararFilas(crudasMap, 'Crudas');
  const filasCocidas = prepararFilas(cocidasMap, 'Cocidas');

  const calcTotales = (filas) => {
    let totD = 0, totM = 0, restD = 0, restM = 0;
    filas.forEach(({ tot, restD: faltanD, restM: faltanM }) => {
      totD += tot.d; totM += tot.m;
      restD += faltanD; restM += faltanM;
    });
    return { totD, totM, restD, restM };
  };

  const tCr = calcTotales(filasCrudas);
  const tCo = calcTotales(filasCocidas);

  const renderTablaControl = (filas, tipoKey, colorBorde, titulo) => {
    let rowsHTML = "";
    if(filas.length === 0){
      rowsHTML = `<div class="empty">No hay pedidos registrados.</div>`;
    } else {
      rowsHTML = filas.map(({ p, tot, key, restD, restM, listoTodo }) => {
        return `
          <div class="list-item" style="flex-direction:column; align-items:stretch; gap:8px; opacity:${listoTodo ? '0.55' : '1'};">
            <div class="row-between cocina-fila-titulo">
              <div class="li-name" style="display:flex; align-items:center; gap:6px;">
                ${escapeHTML(p)}
                ${listoTodo ? `<span class="badge badge-ok" style="font-size:10px;">¡Listo! ✅</span>` : ''}
              </div>
              <span style="font-size:11px; opacity:.7;">Total pedido: ${tot.d} doc · ${tot.m} med</span>
            </div>
            <div class="cocina-contadores">
              ${tot.d > 0 ? `
                <div class="cocina-contador">
                  <div>
                    <div style="font-size:10px; font-weight:800; text-transform:uppercase; opacity:.7;">Faltan Doc.</div>
                    <div style="font-size:18px; font-weight:900; color:${restD===0?'var(--oliva)':'var(--rojo)'};">${restD} <span style="font-size:11px; font-weight:600; opacity:.6;">/ ${tot.d}</span></div>
                  </div>
                  <div class="cocina-acciones">
                    <button class="btn-desc-cocina" data-key="${escapeHTML(key)}" data-pincel="${escapeHTML(p)}" data-tipo="${tipoKey}" data-field="d" data-max="${tot.d}" data-delta="1" aria-label="Marcar una docena ${tipoKey.toLowerCase()} de ${escapeHTML(p)}" ${restD === 0 ? 'disabled' : ''}>−1</button>
                    <button class="btn-desc-cocina" data-key="${escapeHTML(key)}" data-pincel="${escapeHTML(p)}" data-tipo="${tipoKey}" data-field="d" data-max="${tot.d}" data-delta="-1" aria-label="Deshacer una docena ${tipoKey.toLowerCase()} de ${escapeHTML(p)}" ${restD === tot.d ? 'disabled' : ''}>+1</button>
                  </div>
                </div>
              ` : ''}
              ${tot.m > 0 ? `
                <div class="cocina-contador">
                  <div>
                    <div style="font-size:10px; font-weight:800; text-transform:uppercase; opacity:.7;">Faltan 1/2</div>
                    <div style="font-size:18px; font-weight:900; color:${restM===0?'var(--oliva)':'var(--rojo)'};">${restM} <span style="font-size:11px; font-weight:600; opacity:.6;">/ ${tot.m}</span></div>
                  </div>
                  <div class="cocina-acciones">
                    <button class="btn-desc-cocina" data-key="${escapeHTML(key)}" data-pincel="${escapeHTML(p)}" data-tipo="${tipoKey}" data-field="m" data-max="${tot.m}" data-delta="1" aria-label="Marcar una media docena ${tipoKey.toLowerCase()} de ${escapeHTML(p)}" ${restM === 0 ? 'disabled' : ''}>−1</button>
                    <button class="btn-desc-cocina" data-key="${escapeHTML(key)}" data-pincel="${escapeHTML(p)}" data-tipo="${tipoKey}" data-field="m" data-max="${tot.m}" data-delta="-1" aria-label="Deshacer una media docena ${tipoKey.toLowerCase()} de ${escapeHTML(p)}" ${restM === tot.m ? 'disabled' : ''}>+1</button>
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
    <div class="eco-columnas">
      ${renderTablaControl(filasCrudas, 'Crudas', 'var(--rojo)', 'Detalle crudas')}
      ${renderTablaControl(filasCocidas, 'Cocidas', 'var(--dorado)', 'Detalle cocidas')}
    </div>
  `;

  document.querySelectorAll('.btn-desc-cocina').forEach(btn => {
    btn.onclick = () => {
      const { key, field, pincel, tipo } = btn.dataset;
      const max = Number(btn.dataset.max) || 0;
      const delta = Number(btn.dataset.delta) || 0;
      const prev = snapshot(STATE.cocinaDescuentos);

      if(!STATE.cocinaDescuentos[key]) STATE.cocinaDescuentos[key] = {d:0, m:0};
      const actualHecho = hechoEnRango(STATE.cocinaDescuentos[key][field], max);
      const nuevoHecho = hechoEnRango(actualHecho + delta, max);
      STATE.cocinaDescuentos[key][field] = nuevoHecho;

      render();
      apiBackground('ADJUST_COCINA', {
        pincel, tipo, campo: field, delta, idMision: idMisionActual(STATE.historial), idOperacion: nuevoIdOperacion()
      }, () => { STATE.cocinaDescuentos = prev; });
    };
  });
}

/* --------------------- MISIÓN: INVENTARIO --------------------- */
function renderEcoInventario(main){
  const inv = STATE.inventario;
  const idMision = idMisionActual(STATE.historial);

  main.innerHTML = `
    <h2 class="section-title">Inventario de Misión</h2>
    <div class="card">
      <label for="invFecha">Fecha del inventario</label>
      <input type="date" id="invFecha" value="${escapeHTML(inv.fecha || '')}">
      <p class="empty" id="invVacio">Todavía no hay ítems en el inventario.</p>
      <div id="invLista"></div>
      <button class="btn btn-outline" id="btnAddInvItem" style="margin-top:8px;">＋ Agregar ítem</button>
      <button class="btn btn-primary" id="btnGuardarInventario" style="margin-top:12px;">Guardar inventario</button>
    </div>`;

  const lista = document.getElementById('invLista');
  const vacio = document.getElementById('invVacio');
  function agregarFila(item = {}) {
    lista.insertAdjacentHTML('beforeend', `<div class="inv-fila">
      <label class="inv-campo inv-item">Ítem<input class="inv-nombre" value="${escapeHTML(item.nombre)}" placeholder="Ej: Arroz"></label>
      <label class="inv-campo">U. de medida<input class="inv-unidad" value="${escapeHTML(item.unidad)}" placeholder="kg / u / L"></label>
      <label class="inv-campo">Cantidad<input type="number" min="0" step="any" class="inv-cantidad" value="${escapeHTML(item.cantidad)}"></label>
      <button type="button" class="btn-del-inv" aria-label="Quitar ítem">✕</button>
    </div>`);
    const fila = lista.lastElementChild;
    fila.querySelector('.btn-del-inv').onclick = () => {
      fila.remove();
      vacio.hidden = Boolean(lista.children.length);
    };
    vacio.hidden = true;
    return fila;
  }

  (inv.items || []).forEach(agregarFila);
  document.getElementById('btnAddInvItem').onclick = () => agregarFila().querySelector('.inv-nombre').focus();
  document.getElementById('btnGuardarInventario').onclick = async () => {
    const fecha = document.getElementById('invFecha').value;
    const items = [];
    for (const fila of lista.children) {
      const campoNombre = fila.querySelector('.inv-nombre');
      const nombre = campoNombre.value.trim();
      const unidad = fila.querySelector('.inv-unidad').value.trim();
      const campoCantidad = fila.querySelector('.inv-cantidad');
      const cantidad = Number(campoCantidad.value);
      if (!campoCantidad.validity.valid || !Number.isFinite(cantidad)) {
        toast('Ingresá una cantidad igual o mayor a cero.', true);
        campoCantidad.focus();
        return;
      }
      if (!nombre && !unidad && campoCantidad.value === '') continue;
      if (!nombre) { toast('Completá el nombre del ítem.', true); campoNombre.focus(); return; }
      items.push({ nombre, unidad, cantidad });
    }
    try {
      const respuesta = await api('SET_SYS', { key: 'inventario', value: { fecha, items }, idMision });
      if (!respuesta.inventario) { toast('Google todavía no confirmó el inventario. Intentá de nuevo.', true); return; }
      render();
      toast('Inventario guardado.');
    } catch (_) {}
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
    <div class="card">
      <div class="form-grid">
        ${rubros.map(r => `<div>
          <label for="compra-${r.k}">${r.label} ($)</label>
          <input type="number" min="0" step="any" id="compra-${r.k}" class="inp-compra-mision" data-k="${r.k}" value="${Number(cm[r.k])||0}">
        </div>`).join("")}
      </div>
      <div style="height:1px; background:#EEE1C4; margin:14px 0;"></div>
      <div class="row-between">
        <strong>Total gastado en Misión</strong>
        <strong id="totalComprasMision" style="color:var(--rojo); font-size:18px;">${fmt$(total)}</strong>
      </div>
      <button class="btn btn-primary" id="btnGuardarComprasMision" style="margin-top:14px;">Guardar gastos de misión</button>
    </div>
  `;

  const idMision = idMisionActual(STATE.historial);
  const campos = main.querySelectorAll('.inp-compra-mision');
  for (const campo of campos) {
    campo.oninput = () => {
      document.getElementById('totalComprasMision').textContent = fmt$([...campos].reduce((suma, input) => suma + (Number(input.value) || 0), 0));
    };
  }
  document.getElementById('btnGuardarComprasMision').onclick = async () => {
    const nuevo = {};
    for(const inp of campos){
      const val = Number(inp.value);
      if(inp.value.trim() === '' || !Number.isFinite(val) || val < 0){
        toast("Ingresá montos mayores o iguales a cero.", true);
        inp.focus(); return;
      }
      nuevo[inp.dataset.k] = val;
    }
    try {
      const respuesta = await api('SET_SYS', { key: 'compras_mision', value: nuevo, idMision });
      if (!respuesta.comprasMision) { toast('Google todavía no confirmó los gastos. Intentá de nuevo.', true); return; }
      render();
      toast('Gastos de misión guardados.');
    } catch (_) {}
  };
}

/* --------------------- MISIÓN: LIQUIDACIÓN --------------------- */
window.asignarDeuda = async (pincel, monto) => {
  try {
    const respuesta = await api('SET_DEUDA_ASIGNADA', { pincel, monto, idMision: idMisionActual(STATE.historial) });
    if (Number(respuesta.deudaAsignada?.[pincel]) !== monto) {
      toast('Google todavía no confirmó la deuda asignada. Intentá de nuevo.', true); return;
    }
    render();
    toast(`Deuda asignada a ${pincel}.`);
  } catch (error) {
    if (error.code === 'DEUDA_PAGADA') {
      try { await api('SYNC'); render(); } catch (_) {}
    }
  }
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
let reinicioPendiente = null;
let reinicioEnCurso = false;

async function reiniciarMision() {
  if (reinicioEnCurso) return;
  if (!reinicioPendiente) {
    if (!confirm('¿Querés archivar la misión y empezar una nueva? Se vaciarán los datos de la misión actual.')) return;
    const nombre = prompt('Nombre de la feria o misión para el historial:')?.trim();
    if (!nombre) { toast('Ingresá un nombre para archivar la misión.', true); return; }
    if (prompt('Escribí BORRAR para confirmar el reinicio:') !== 'BORRAR') {
      toast('Reinicio cancelado.');
      return;
    }
    reinicioPendiente = { nombre, idMision: idMisionActual(STATE.historial), idOperacion: nuevoIdOperacion() };
  }

  reinicioEnCurso = true;
  try {
    const respuesta = await api('RESET_MISSION', reinicioPendiente);
    if (!respuesta.historial?.some(mision => mision.idOperacion === reinicioPendiente.idOperacion)) {
      toast('Google todavía no confirmó el reinicio. Podés reintentar.', true);
      return;
    }
    reinicioPendiente = null;
    toast('Misión archivada y reiniciada.');
  } catch (error) {
    if (error.code === 'MISION_REINICIADA') {
      reinicioPendiente = null;
      try { await api('SYNC'); } catch (_) {}
    }
  } finally {
    reinicioEnCurso = false;
    render();
  }
}
