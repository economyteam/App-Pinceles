function renderBottomNavPincel(){
  const items = [ {id:"estado", label:"Mi estado", icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 15l4-6 3 3 5-7"/></svg>`}, {id:"ventas", label:"Ventas", icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2l1.5 4h9L18 2"/><path d="M3.5 6h17l-1.6 12.5A2 2 0 0117 20H7a2 2 0 01-1.9-1.5L3.5 6z"/><path d="M9 10a3 3 0 006 0"/></svg>`}, {id:"asistencia", label:"Asistencia", icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>`}, {id:"minimo", label:"Mínimo", icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/></svg>`} ];
  document.getElementById('bottomNav').innerHTML = items.map(it=>`<button class="nav-btn ${STATE.tab===it.id?'active':''}" data-tab="${it.id}">${it.icon}<span>${it.label}</span></button>`).join("");
  document.querySelectorAll('.nav-btn').forEach(b=>{ b.onclick = ()=>{ STATE.tab = b.dataset.tab; render(); }; });
}

function renderPincelApp(){
  renderBottomNavPincel(); const main = document.getElementById('main');
  if(STATE.tab==="estado") return renderTabEstado(main); if(STATE.tab==="ventas") return renderTabVentas(main); if(STATE.tab==="asistencia") return renderTabAsistencia(main); if(STATE.tab==="minimo") return renderTabMinimo(main);
}

function renderTabEstado(main){
  const docenas = totalDocenasDe(STATE.miNombre), horas = totalHorasDe(STATE.miNombre), min = STATE.minimoPagos[STATE.miNombre];
  main.innerHTML = `<h2 class="section-title">Mi estado en la feria</h2><div class="stat-grid"><div class="stat-box"><div class="stat-num">${docenas}</div><div class="stat-label">Docenas vendidas</div></div><div class="stat-box gold"><div class="stat-num">${horas.toFixed(1)}</div><div class="stat-label">Horas trabajadas</div></div></div><div class="card" style="margin-top:16px; text-align:center;"><div class="li-sub" style="margin-bottom:6px;">Aporte al mínimo de misión</div><span class="badge ${min && min.pagado ? 'badge-ok':'badge-pend'}">${min && min.pagado ? 'Mínimo abonado' : 'Mínimo pendiente'}</span></div><p class="muted" style="text-align:center; margin-top:14px;">¡Seguí así, Pincel! Cada docena y cada hora suman un montón para la misión 🎨🥟</p>`;
}

function guardarCambioVentaAuto(venta, prevVentas, msg) {
  render();
  if (msg) toast(msg);
  apiBackground('EDIT_VENTA', venta, () => {
    STATE.ventas = prevVentas;
    render();
  });
}

function abrirModalMetodoPagoRapido(venta, onConfirm, onCancel) {
  const root = document.getElementById('modalRoot');
  const receptores = (typeof RECEPTORES !== 'undefined' && Array.isArray(RECEPTORES)) ? RECEPTORES : [];
  root.innerHTML = `
    <div class="overlay" id="ovPagoRapido">
      <div class="sheet">
        <span class="close-x" id="closePagoRapido">✕</span>
        <h3 style="margin-bottom:4px;">Confirmar pago</h3>
        <p class="muted" style="margin-top:0; font-size:12px;">${escapeHTML(venta.cliente)} · ¿Cómo le pagaste a Economía?</p>
        <div style="display:flex; flex-direction:column; gap:10px; margin-top:14px;">
          <button class="btn btn-primary" id="btnRapidoTransf">💳 Transferencia</button>
          <button class="btn btn-outline" id="btnRapidoEfec">💵 Efectivo</button>
        </div>
        <div id="boxReceptoresRapido" style="display:none; margin-top:14px; padding-top:12px; border-top:1px solid #EEE1C4;">
          <p class="muted" style="font-size:12px; margin:0 0 8px;">¿A quién le entregaste el efectivo?</p>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${receptores.map(r => `<button class="btn btn-gold btn-sm btn-rec-rapido" data-rec="${escapeHTML(r)}">${escapeHTML(r)}</button>`).join("")}
          </div>
        </div>
      </div>
    </div>
  `;

  const cerrar = () => { root.innerHTML = ""; if (onCancel) onCancel(); };
  document.getElementById('closePagoRapido').onclick = cerrar;
  document.getElementById('ovPagoRapido').onclick = (e) => { if (e.target.id === 'ovPagoRapido') cerrar(); };

  document.getElementById('btnRapidoTransf').onclick = () => {
    root.innerHTML = "";
    onConfirm("Transferencia", "");
  };
  document.getElementById('btnRapidoEfec').onclick = () => {
    document.getElementById('boxReceptoresRapido').style.display = 'block';
  };
  document.querySelectorAll('.btn-rec-rapido').forEach(b => {
    b.onclick = () => {
      root.innerHTML = "";
      onConfirm("Efectivo", b.dataset.rec);
    };
  });
}

function renderTabVentas(main){
  const mias = misVentas(STATE.miNombre).slice().reverse(), impagas = mias.filter(v=>v.estado==='Falta Pagar');
  const adeudaDocs = impagas.reduce((a,v)=>a + (Number(v.docenas)||0), 0), adeudaMeds = impagas.reduce((a,v)=>a + (Number(v.medias)||0), 0);
  const montoAdeudado = Calculos.totalPendiente(mias, STATE.config);
  const cerradas = !!STATE.config.ventasCerradas;
  
  main.innerHTML = `
    <h2 class="section-title">Mis ventas</h2>
    ${montoAdeudado > 0 ? `<div class="banner-min" style="background:var(--rojo); color:var(--blanco); padding:12px; margin-bottom:16px; margin-top:-6px;"><div style="font-size:12px; font-weight:700; opacity:.9;">Adeudás a Economía por tus ventas:</div><div class="stat-num" style="font-size:26px; margin:4px 0;">${fmt$(montoAdeudado)}</div><div style="font-size:11px; opacity:.8;">Corresponde a ${adeudaDocs} docenas y ${adeudaMeds} medias.</div></div>` : ''}
    ${cerradas ? `<div class="card" style="background:#FBE7DA; border:1.5px solid #B4551D; color:#B4551D; text-align:center; font-weight:700; font-size:13px; padding:12px;">🔒 Las ventas están cerradas.<br><span style="font-weight:500; font-size:11.5px;">Ya no se pueden anotar ni editar pedidos, pero podés seguir marcando abajo los pagos y retiros.</span></div>` : `<button class="btn btn-primary" id="btnNuevaVenta">＋ Registrar venta</button>`}
    <p class="muted" style="text-align:center; margin-top:12px; font-size:11.5px;">Podés ir transfiriendo el dinero de tus ventas a <b>${escapeHTML(STATE.config.alias ?? DEFAULT_CONFIG.alias)}</b> (Paulina Rocío García) o pagar todo junto al final.</p>
    
    <h2 class="section-title" style="margin-top:20px;">Mis clientes</h2>
    <p class="muted" style="font-size:11px; margin:-5px 0 10px 4px;">${cerradas ? 'Marcá las casillas de Pagado o Retirado (se guarda automáticamente).' : 'Tocá el nombre para editar cantidades, o marcá las casillas (se guarda automáticamente).'}</p>
    
    <div class="card">
      ${mias.length===0 ? `<div class="empty">Todavía no registraste ninguna venta.</div>` : `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:0 4px 8px; border-bottom:2px solid var(--crema-2); font-size:10.5px; font-weight:800; text-transform:uppercase; opacity:.6;">
          <div style="flex:1;">Cliente / Pedido</div>
          <div style="width:58px; text-align:center;">Pagado</div>
          <div style="width:58px; text-align:center;">Retirado</div>
        </div>
        ${mias.map(v=>`
          <div class="list-item" style="padding:10px 4px;">
            <div class="${cerradas ? '' : 'venta-editable'}" data-venta-id="${escapeHTML(v.id)}" style="flex:1; ${cerradas ? '' : 'cursor:pointer;'} padding-right:8px;">
              <div class="li-name" style="display:flex; align-items:center; gap:6px;">
                ${escapeHTML(v.cliente)}
                ${cerradas ? '' : `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--tinta)" stroke-width="2" opacity="0.35"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`}
              </div>
              <div class="li-sub">${Number(v.docenas)? Number(v.docenas)+' doc. ':''}${Number(v.medias)? Number(v.medias)+' 1/2 doc. ':''}· ${escapeHTML(v.tipo)}${v.estado==='Pagado' && v.metodoPago ? ' · '+escapeHTML(v.metodoPago)+(v.metodoPago==='Efectivo' && v.recibidoPor ? ' ('+escapeHTML(v.recibidoPor)+')' : '') : ''}</div>
            </div>
            <div style="width:58px; display:flex; justify-content:center;">
              <input type="checkbox" class="chk-venta-pagado" data-id="${escapeHTML(v.id)}" ${v.estado==='Pagado'?'checked':''} style="width:20px; height:20px; margin:0; accent-color:var(--oliva); cursor:pointer;">
            </div>
            <div style="width:58px; display:flex; justify-content:center;">
              <input type="checkbox" class="chk-venta-retirado" data-id="${escapeHTML(v.id)}" ${v.retirado?'checked':''} style="width:20px; height:20px; margin:0; accent-color:var(--rojo); cursor:pointer;">
            </div>
          </div>
        `).join("")}
      `}
    </div>
  `;

  const btnNueva = document.getElementById('btnNuevaVenta');
  if(btnNueva) btnNueva.onclick = () => openModalVenta();
  if(!cerradas){
    document.querySelectorAll('.venta-editable').forEach(el => {
      el.onclick = () => openModalVenta(el.dataset.ventaId);
    });
  }

  document.querySelectorAll('.chk-venta-retirado').forEach(chk => {
    chk.onchange = () => {
      const venta = STATE.ventas.find(x => String(x.id) === String(chk.dataset.id));
      if (!venta) return;
      const prevVentas = snapshot(STATE.ventas);
      venta.retirado = chk.checked;
      guardarCambioVentaAuto(venta, prevVentas, chk.checked ? 'Marcado como retirado ✅' : 'Retiro desmarcado');
    };
  });

  document.querySelectorAll('.chk-venta-pagado').forEach(chk => {
    chk.onchange = () => {
      const venta = STATE.ventas.find(x => String(x.id) === String(chk.dataset.id));
      if (!venta) return;
      if (chk.checked) {
        abrirModalMetodoPagoRapido(
          venta,
          (metodo, receptor) => {
            const prevVentas = snapshot(STATE.ventas);
            venta.estado = 'Pagado';
            venta.metodoPago = metodo;
            venta.recibidoPor = receptor || null;
            guardarCambioVentaAuto(venta, prevVentas, 'Pago guardado ✅');
          },
          () => { chk.checked = false; }
        );
      } else {
        const prevVentas = snapshot(STATE.ventas);
        venta.estado = 'Falta Pagar';
        venta.metodoPago = null;
        venta.recibidoPor = null;
        guardarCambioVentaAuto(venta, prevVentas, 'Marcado como falta pagar');
      }
    };
  });
}
window.openModalVenta = (idEdit = null) => {
  const root = document.getElementById('modalRoot'); 
  let reg = idEdit ? STATE.ventas.find(v=>v.id===idEdit) : null;
  
  // Si estamos editando, solo cargamos los números de ese registro específico. Si no, arranca todo en 0.
  let docC = (reg && reg.tipo==='Crudas') ? (reg.docenas||0) : 0;
  let medC = (reg && reg.tipo==='Crudas') ? (reg.medias||0) : 0;
  let docO = (reg && reg.tipo==='Cocidas') ? (reg.docenas||0) : 0;
  let medO = (reg && reg.tipo==='Cocidas') ? (reg.medias||0) : 0;
  
  let estado = reg ? reg.estado : "Falta Pagar", cName = reg ? reg.cliente : "";
  let metodoInit = reg ? (reg.metodoPago||null) : null, quienInit = reg ? (reg.recibidoPor||null) : null;
  
  root.innerHTML = `<div class="overlay" id="ov"><div class="sheet"><span class="close-x" id="closeX">✕</span><h3>${reg ? 'Editar Venta' : 'Registrar Venta'}</h3>
    <label>Nombre o apodo del cliente</label>
    <input id="vCliente" value="${escapeHTML(cName)}" placeholder="Ej: Marta (vecina)">
    
    <div style="background:var(--blanco); border:1.5px solid #E7DCC3; border-radius:16px; padding:12px 14px 4px; margin-bottom:16px;">
      <label style="color:var(--rojo); font-size:14px; margin-bottom:12px; text-transform:none; opacity:1;">🥟 Crudas</label>
      <div class="row-between" style="margin-bottom:10px;">
        <span style="font-size:13.5px; font-weight:700; opacity:.8;">Docenas</span>
        <div class="quantity-stepper" style="margin:0;"><button class="qty-btn" id="dcM">−</button><div class="qty-val" id="dcV">${docC}</div><button class="qty-btn" id="dcP">+</button></div>
      </div>
      <div class="row-between" style="margin-bottom:10px;">
        <span style="font-size:13.5px; font-weight:700; opacity:.8;">Medias docenas</span>
        <div class="quantity-stepper" style="margin:0;"><button class="qty-btn" id="mcM">−</button><div class="qty-val" id="mcV">${medC}</div><button class="qty-btn" id="mcP">+</button></div>
      </div>
    </div>

    <div style="background:var(--blanco); border:1.5px solid #E7DCC3; border-radius:16px; padding:12px 14px 4px; margin-bottom:16px;">
      <label style="color:var(--dorado); font-size:14px; margin-bottom:12px; text-transform:none; opacity:1;">🥟 Cocidas</label>
      <div class="row-between" style="margin-bottom:10px;">
        <span style="font-size:13.5px; font-weight:700; opacity:.8;">Docenas</span>
        <div class="quantity-stepper" style="margin:0;"><button class="qty-btn" id="doM">−</button><div class="qty-val" id="doV">${docO}</div><button class="qty-btn" id="doP">+</button></div>
      </div>
      <div class="row-between" style="margin-bottom:10px;">
        <span style="font-size:13.5px; font-weight:700; opacity:.8;">Medias docenas</span>
        <div class="quantity-stepper" style="margin:0;"><button class="qty-btn" id="moM">−</button><div class="qty-val" id="moV">${medO}</div><button class="qty-btn" id="moP">+</button></div>
      </div>
    </div>

    <label>¿Ya transferiste el dinero a Economía?</label>
    <div class="toggle-row" id="estadoRow"><div class="toggle-opt ${estado==='Falta Pagar'?'active':''}" data-v="Falta Pagar">Falta pagar</div><div class="toggle-opt ${estado==='Pagado'?'active':''}" data-v="Pagado">Pagado</div></div>
    <div id="pagoExtra"></div>
    <p class="muted" style="font-size:11px; margin-top:-6px; margin-bottom:12px; line-height:1.3;">"Pagado" significa que vos ya le mandaste esa plata a Economía. No importa si tu cliente todavía no te pagó a vos.</p>
    <button class="btn btn-primary" id="btnGuardarVenta" style="margin-bottom:8px;">${reg ? 'Guardar Cambios' : 'Guardar Venta'}</button>
    ${reg ? `<button class="btn btn-outline" id="btnBorrarVenta" style="color:#B4551D; border-color:#B4551D;">Eliminar Venta</button>` : ''}
  </div></div>`;
  
  // Botones +/- Crudas
  document.getElementById('dcM').onclick=()=>{ docC=Math.max(0,docC-1); document.getElementById('dcV').textContent=docC; };
  document.getElementById('dcP').onclick=()=>{ docC=Math.min(100000,docC+1); document.getElementById('dcV').textContent=docC; };
  document.getElementById('mcM').onclick=()=>{ medC=Math.max(0,medC-1); document.getElementById('mcV').textContent=medC; };
  document.getElementById('mcP').onclick=()=>{ medC=Math.min(100000,medC+1); document.getElementById('mcV').textContent=medC; };
  
  // Botones +/- Cocidas
  document.getElementById('doM').onclick=()=>{ docO=Math.max(0,docO-1); document.getElementById('doV').textContent=docO; };
  document.getElementById('doP').onclick=()=>{ docO=Math.min(100000,docO+1); document.getElementById('doV').textContent=docO; };
  document.getElementById('moM').onclick=()=>{ medO=Math.max(0,medO-1); document.getElementById('moV').textContent=medO; };
  document.getElementById('moP').onclick=()=>{ medO=Math.min(100000,medO+1); document.getElementById('moV').textContent=medO; };

  let pagoWire = null;
  function refreshPagoExtra(){
    const cont = document.getElementById('pagoExtra');
    if(estado === 'Pagado'){ cont.innerHTML = metodoPagoHTML('vpago', metodoInit, quienInit); pagoWire = wireMetodoPago('vpago'); }
    else { cont.innerHTML = ""; pagoWire = null; }
  }
  refreshPagoExtra();
  document.querySelectorAll('#estadoRow .toggle-opt').forEach(el=>el.onclick=()=>{ document.querySelectorAll('#estadoRow .toggle-opt').forEach(x=>x.classList.remove('active')); el.classList.add('active'); estado = el.dataset.v; refreshPagoExtra(); });

  document.getElementById('closeX').onclick = ()=> root.innerHTML=""; document.getElementById('ov').onclick = (e)=>{ if(e.target.id==='ov') root.innerHTML=""; };
  
  document.getElementById('btnGuardarVenta').onclick = ()=>{
    const cliente = document.getElementById('vCliente').value.trim(); if(!cliente){ toast("Escribí el nombre del cliente"); return; } 
    const crudasActivas = docC > 0 || medC > 0;
    const cocidasActivas = docO > 0 || medO > 0;
    if(!crudasActivas && !cocidasActivas){ toast("Cargá al menos una docena o media"); return; }
    
    let metodoFinal = null, quienFinal = null;
    if(estado === 'Pagado'){
      metodoFinal = pagoWire ? pagoWire.getMetodo() : null; if(!metodoFinal){ toast("Elegí si fue por transferencia o efectivo"); return; }
      if(metodoFinal === 'Efectivo'){ quienFinal = pagoWire.getQuien(); if(!quienFinal){ toast("Elegí a quién le diste el efectivo"); return; } }
    }
    
    const prevVentas = snapshot(STATE.ventas);
    let aBorrar = null, aEditar = null, aAgregar = [];

    if(reg){
      if(reg.tipo === 'Crudas'){
        if(crudasActivas) aEditar = {...reg, cliente, docenas: docC, medias: medC, estado, metodoPago: metodoFinal, recibidoPor: quienFinal};
        else aBorrar = reg;
        if(cocidasActivas) aAgregar.push({...reg, id: Date.now()+"_co", cliente, docenas: docO, medias: medO, tipo: "Cocidas", estado, metodoPago: metodoFinal, recibidoPor: quienFinal});
      } else {
        if(cocidasActivas) aEditar = {...reg, cliente, docenas: docO, medias: medO, estado, metodoPago: metodoFinal, recibidoPor: quienFinal};
        else aBorrar = reg;
        if(crudasActivas) aAgregar.push({...reg, id: Date.now()+"_cr", cliente, docenas: docC, medias: medC, tipo: "Crudas", estado, metodoPago: metodoFinal, recibidoPor: quienFinal});
      }
    } else {
      const baseId = Date.now()+"_"+Math.random().toString(36).slice(2,7);
      if(crudasActivas) aAgregar.push({ id: baseId+"_cr", fecha: new Date().toISOString(), pincel: STATE.miNombre, cliente, docenas: docC, medias: medC, tipo: "Crudas", estado, metodoPago: metodoFinal, recibidoPor: quienFinal });
      if(cocidasActivas) aAgregar.push({ id: baseId+"_co", fecha: new Date().toISOString(), pincel: STATE.miNombre, cliente, docenas: docO, medias: medO, tipo: "Cocidas", estado, metodoPago: metodoFinal, recibidoPor: quienFinal });
    }

    if(aBorrar) STATE.ventas = STATE.ventas.filter(v => v.id !== aBorrar.id);
    if(aEditar) { const idx = STATE.ventas.findIndex(v => v.id === aEditar.id); if(idx>=0) STATE.ventas[idx] = aEditar; }
    aAgregar.forEach(nueva => STATE.ventas.push(nueva));

    root.innerHTML=""; toast(reg ? "Cambios cargados · sincronizando…" : "Venta cargada · sincronizando…"); render();

    if(aBorrar) apiBackground('DEL_VENTA', { id: aBorrar.id }, () => STATE.ventas = prevVentas);
    if(aEditar) apiBackground('EDIT_VENTA', aEditar, () => STATE.ventas = prevVentas);
    aAgregar.forEach(nueva => apiBackground('ADD_VENTA', nueva, () => STATE.ventas = prevVentas));
  };
  
  const btnBorrar = document.getElementById('btnBorrarVenta'); 
  if(btnBorrar){ 
    btnBorrar.onclick = ()=>{ 
      if(confirm("¿Seguro que querés borrar esta venta?")){ 
        const prevVentas = snapshot(STATE.ventas); 
        STATE.ventas = STATE.ventas.filter(v=>v.id!==idEdit); 
        root.innerHTML=""; toast("Eliminando venta…"); render(); 
        apiBackground('DEL_VENTA', { id: idEdit }, ()=>{ STATE.ventas = prevVentas; }); 
      } 
    }; 
  }
}

function renderTabAsistencia(main){
  const activa = STATE.sesiones[STATE.miNombre], misRegistros = STATE.asistencia.filter(a=>a.pincel===STATE.miNombre).slice().reverse();
  main.innerHTML = `<h2 class="section-title">Mi asistencia</h2><div style="display:flex; gap:12px; margin-bottom:20px;">${activa ? `<div style="flex:1; text-align:center;"><p class="muted" style="margin-bottom:8px;">Entraste a las ${new Date(activa).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}</p><button class="btn btn-primary" id="btnSalida" style="flex-direction:column; padding:20px; border-radius:24px; font-size:18px;"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom:8px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Marcar Salida</button></div>` : `<button class="btn btn-gold" id="btnEntrada" style="flex:1; flex-direction:column; padding:24px 10px; border-radius:24px; font-size:18px;"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom:8px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Marcar Entrada</button>`}</div><h2 class="section-title">Mis registros</h2><p class="muted" style="font-size:11px; margin:-5px 0 10px 4px;">Tocá el lápiz si te olvidaste de marcar o querés corregir la hora.</p><div class="card">${misRegistros.length===0 ? `<div class="empty">Todavía no tenés horas cargadas.</div>` : misRegistros.map(r=>`<div class="list-item asistencia-editable" style="cursor:pointer;" data-asistencia-id="${escapeHTML(r.id)}"><div><div class="li-name">${new Date(r.fecha).toLocaleDateString('es-AR',{weekday:'long', day:'numeric', month:'short'})}</div><div class="li-sub">${new Date(r.entrada).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})} → ${new Date(r.salida).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}</div></div><div style="display:flex; align-items:center; gap:8px;"><span class="badge badge-neutral">${Number(r.horas).toFixed(1)} hs</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--tinta)" stroke-width="2" opacity="0.4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></div></div>`).join("")}</div>`;
  document.querySelectorAll('.asistencia-editable').forEach(el => {
    el.onclick = () => openEditAsistencia(el.dataset.asistenciaId);
  });
  const be = document.getElementById('btnEntrada'); if(be) be.onclick = async ()=>{
    const prevSesiones = snapshot(STATE.sesiones);
    // NUEVO: Sincronizamos primero
    try { await api('SYNC'); } catch(e) {}
    STATE.sesiones[STATE.miNombre] = new Date().toISOString();
    toast("Registrando entrada…"); render();
    apiBackground('SET_SYS', { key: 'sesiones', value: STATE.sesiones }, ()=>{ STATE.sesiones = prevSesiones; });
  };
  const bs = document.getElementById('btnSalida'); if(bs) bs.onclick = async ()=>{
    const entrada = STATE.sesiones[STATE.miNombre], salida = new Date().toISOString(), horas = Math.max(0, Math.round(((new Date(salida) - new Date(entrada)) / 3600000)*10)/10), asistenciaObj = { id: Date.now()+"_"+Math.random().toString(36).slice(2,7), pincel: STATE.miNombre, fecha: entrada, entrada, salida, horas };
    const prevSesiones = snapshot(STATE.sesiones), prevAsistencia = snapshot(STATE.asistencia);
    // NUEVO: Sincronizamos primero
    try { await api('SYNC'); } catch(e) {}
    delete STATE.sesiones[STATE.miNombre]; STATE.asistencia.push(asistenciaObj);
    toast("Registrando salida…"); render();
    apiBackground('CHECK_OUT', { pincel: STATE.miNombre, asistencia: asistenciaObj }, ()=>{ STATE.sesiones = prevSesiones; STATE.asistencia = prevAsistencia; });
  };
}
window.openEditAsistencia = (id) => {
  const root = document.getElementById('modalRoot'); const reg = STATE.asistencia.find(a=>a.id === id); if(!reg) return;
  root.innerHTML = `<div class="overlay" id="ov"><div class="sheet"><span class="close-x" id="closeX">✕</span><h3>Editar Horario</h3><label>Hora de llegada</label><input type="datetime-local" id="editEntrada" value="${escapeHTML(localISOTime(reg.entrada))}"><label>Hora de salida</label><input type="datetime-local" id="editSalida" value="${escapeHTML(localISOTime(reg.salida))}"><button class="btn btn-primary" id="btnGuardarEdit">Guardar cambios</button></div></div>`;
  document.getElementById('closeX').onclick = ()=> root.innerHTML=""; document.getElementById('ov').onclick = (e)=>{ if(e.target.id==='ov') root.innerHTML=""; };
  document.getElementById('btnGuardarEdit').onclick = ()=>{
    const valIn = document.getElementById('editEntrada').value, valOut = document.getElementById('editSalida').value; if(!valIn || !valOut){ toast("Completá ambas fechas"); return; } const dIn = new Date(valIn), dOut = new Date(valOut), horas = (dOut - dIn) / 3600000; if(!Number.isFinite(horas) || horas < 0){ toast("La salida debe ser igual o posterior a la entrada"); return; }
    const prevAsistencia = snapshot(STATE.asistencia);
    reg.entrada = dIn.toISOString(); reg.salida = dOut.toISOString(); reg.fecha = dIn.toISOString(); reg.horas = Math.max(0, Math.round(horas*10)/10);
    root.innerHTML=""; toast("Actualizando registro…"); render();
    apiBackground('EDIT_ASISTENCIA', reg, ()=>{ STATE.asistencia = prevAsistencia; });
  };
}

function renderTabMinimo(main){
  const min = STATE.minimoPagos[STATE.miNombre], postFeria = STATE.postFeriaPagos[STATE.miNombre], deuda = STATE.deudaAsignada[STATE.miNombre] || 0;
  main.innerHTML = `
    <h2 class="section-title">Transferencias a Economía</h2><p class="muted" style="margin-bottom:18px; text-align:center;">Datos: <b>Paulina Rocío García</b><br>Alias: <span style="color:var(--rojo); font-weight:bold; font-family:monospace; font-size:16px;">${escapeHTML(STATE.config.alias ?? DEFAULT_CONFIG.alias)}</span></p>
    <div class="banner-min"><div style="font-size:13px; font-weight:700; opacity:.8; text-transform:uppercase;">Mínimo base de misión</div><div class="stat-num" style="color:var(--tinta); font-size:36px; margin:4px 0;">${fmt$(STATE.config.pagoMinimo)}</div>${min && min.pagado ? `<div style="margin-top:12px;"><span class="badge badge-ok" style="font-size:12px;">Ya registraste el pago del mínimo ✅</span>${min.metodoPago ? `<div class="muted" style="margin-top:6px;">${escapeHTML(min.metodoPago)}${min.metodoPago==='Efectivo' && min.recibidoPor ? ' a '+escapeHTML(min.recibidoPor) : ''}</div>` : ''}</div>` : `<button class="btn btn-outline btn-sm" id="btnPagueMinimo" style="margin-top:8px; border-color:var(--tinta); color:var(--tinta); font-weight:800;">Avisar que ya pagué el mínimo</button>`}</div>
    ${deuda > 0 ? `<div class="banner-min" style="background:var(--rojo); color:var(--blanco); margin-top:20px;"><div style="font-size:13px; font-weight:700; opacity:.9; text-transform:uppercase;">Deuda post feria</div><div class="stat-num" style="font-size:36px; margin:4px 0;">${fmt$(deuda)}</div>${postFeria && postFeria.pagado ? `<div style="margin-top:12px;"><span class="badge badge-ok" style="font-size:12px; background:var(--blanco); color:var(--rojo);">Ya registraste el pago del saldo post feria ✅</span>${postFeria.metodoPago ? `<div style="margin-top:6px; font-size:12px; opacity:.85;">${escapeHTML(postFeria.metodoPago)}${postFeria.metodoPago==='Efectivo' && postFeria.recibidoPor ? ' a '+escapeHTML(postFeria.recibidoPor) : ''}</div>` : ''}</div>` : `<button class="btn btn-outline btn-sm" id="btnPaguePostFeria" style="margin-top:8px; border-color:var(--blanco); color:var(--blanco); font-weight:800;">Avisar que ya pagué el saldo post feria</button>`}</div>` : ''}
  `;
  const bMin = document.getElementById('btnPagueMinimo'); if(bMin) bMin.onclick = ()=>{
    openModalMetodoPago('¿Cómo pagaste el mínimo?', async (metodo, quien)=>{
      const prev = STATE.minimoPagos[STATE.miNombre];
      // NUEVO: Traemos la base fresca antes de guardar para no pisar el pago de otro Pincel
      try { await api('SYNC'); } catch(e) {}
      STATE.minimoPagos[STATE.miNombre] = {pagado:true, fecha:new Date().toISOString(), metodoPago: metodo, recibidoPor: quien};
      toast("Registrando pago…"); render();
      apiBackground('SET_SYS', { key: 'minimo_pagos', value: STATE.minimoPagos }, ()=>{ STATE.minimoPagos[STATE.miNombre] = prev; });
    });
  };
  const bPost = document.getElementById('btnPaguePostFeria'); if(bPost) bPost.onclick = ()=>{
    openModalMetodoPago('¿Cómo pagaste el saldo post feria?', async (metodo, quien)=>{
      const prev = STATE.postFeriaPagos[STATE.miNombre];
      // NUEVO: Traemos la base fresca antes de guardar para no pisar el pago de otro Pincel
      try { await api('SYNC'); } catch(e) {}
      STATE.postFeriaPagos[STATE.miNombre] = {pagado:true, fecha:new Date().toISOString(), metodoPago: metodo, recibidoPor: quien};
      toast("Registrando pago…"); render();
      apiBackground('SET_SYS', { key: 'postferia_pagos', value: STATE.postFeriaPagos }, ()=>{ STATE.postFeriaPagos[STATE.miNombre] = prev; });
    });
  };
}
