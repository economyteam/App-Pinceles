function renderBottomNavPincel(){
  const items = [ {id:"estado", label:"Mi estado", icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 15l4-6 3 3 5-7"/></svg>`}, {id:"ventas", label:"Ventas", icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2l1.5 4h9L18 2"/><path d="M3.5 6h17l-1.6 12.5A2 2 0 0117 20H7a2 2 0 01-1.9-1.5L3.5 6z"/><path d="M9 10a3 3 0 006 0"/></svg>`}, {id:"asistencia", label:"Asistencia", icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>`}, {id:"minimo", label:"Mínimo", icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/></svg>`} ];
  document.getElementById('bottomNav').innerHTML = items.map(it=>`<button class="nav-btn ${STATE.tab===it.id?'active':''}" data-tab="${it.id}">${it.icon}<span>${it.label}</span></button>`).join("");
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.onclick = () => irATabPincel(b.dataset.tab);
  });
}

function irATabPincel(tab, idVenta) {
  STATE.tab = tab;
  render();
  if (tab === 'ventas') {
    if (idVenta !== undefined) enfocarFilaVenta(idVenta);
    void actualizarVentasAlVolver();
  }
}

function enfocarFilaVenta(id) {
  const fila = [...document.querySelectorAll('[data-venta-fila]')].find(el => el.dataset.ventaFila === id);
  if (!fila) return;
  fila.scrollIntoView({ block: 'center' });
  fila.focus({ preventScroll: true });
}

function renderPincelApp(){
  renderBottomNavPincel(); const main = document.getElementById('main');
  if(STATE.tab==="estado") return renderTabEstado(main); if(STATE.tab==="ventas") return renderTabVentas(main); if(STATE.tab==="asistencia") return renderTabAsistencia(main); if(STATE.tab==="minimo") return renderTabMinimo(main);
}

function progresoDocenasHTML(id, etiqueta, estado, cantidad, total) {
  const porcentaje = total > 0 ? Math.min(100, Math.max(0, Math.floor(cantidad * 100 / total))) : 0;
  return `<div class="estado-progreso">
    <label for="${id}">${etiqueta}</label>
    <progress id="${id}" aria-valuetext="${porcentaje}% ${estado}" value="${cantidad}" max="${total || 1}"></progress>
    <span aria-hidden="true">${porcentaje}%</span>
  </div>`;
}

function renderTabEstado(main){
  const ventas = misVentas(STATE.miNombre);
  const pendientes = ventas.filter(venta => venta.estado !== 'Pagado').reverse();
  const docenas = ventas.reduce((total, venta) => total + docenasEquiv(venta), 0);
  const docenasPagadas = ventas.filter(venta => venta.estado === 'Pagado').reduce((total, venta) => total + docenasEquiv(venta), 0);
  const docenasRetiradas = ventas.filter(venta => venta.retirado).reduce((total, venta) => total + docenasEquiv(venta), 0);
  const horas = totalHorasDe(STATE.miNombre), min = STATE.minimoPagos[STATE.miNombre];
  const estadoMinimo = min?.pagado ? 'Mínimo abonado' : 'Mínimo pendiente';
  main.innerHTML = `
    <h2 class="section-title">Mi estado en la feria</h2>
    <div class="stat-grid">
      <button type="button" class="stat-box acceso-estado" data-destino="ventas" aria-label="${docenas} docenas vendidas. Ir a Ventas">
        <span class="stat-num">${docenas}</span>
        <span class="stat-label">Docenas vendidas</span>
      </button>
      <button type="button" class="stat-box gold acceso-estado" data-destino="asistencia" aria-label="${horas.toFixed(1)} horas trabajadas. Ir a Asistencia">
        <span class="stat-num">${horas.toFixed(1)}</span>
        <span class="stat-label">Horas trabajadas</span>
      </button>
    </div>
    <button type="button" class="card acceso-estado acceso-minimo" data-destino="minimo" aria-label="${estadoMinimo}. Ir a Mínimo">
      <span class="li-sub">Aporte al mínimo de misión</span>
      <span class="badge ${min?.pagado ? 'badge-ok' : 'badge-pend'}">${estadoMinimo}</span>
    </button>
    ${progresoDocenasHTML('progresoVentasPagadas', 'Docenas vendidas', 'pagadas', docenasPagadas, docenas)}
    ${progresoDocenasHTML('progresoVentasRetiradas', 'Docenas retiradas', 'retiradas', docenasRetiradas, docenas)}
    <section class="card estado-pagos" aria-labelledby="tituloEstadoPagos">
      <h2 id="tituloEstadoPagos">Ventas sin pagar</h2>
      ${pendientes.length ? `
      <div class="estado-ventas-columnas">
        <span>Cliente</span><span>Cantidad</span><span>Monto adeudado</span>
      </div>
      <ul class="estado-ventas-impagas">
        ${pendientes.map(venta => `<li>
          <button type="button" class="estado-venta-impaga" data-venta-pendiente="${escapeHTML(venta.id)}">
            <span>${escapeHTML(venta.cliente)}</span>
            <span>${docenasEquiv(venta).toLocaleString('es-AR')} doc.</span>
            <strong>${fmt$(Calculos.importeVenta(venta, STATE.config))}</strong>
          </button>
        </li>`).join('')}
      </ul>` : `<p class="muted">${ventas.length ? 'Tus ventas están al día.' : 'Todavía no registraste ventas.'}</p>`}
    </section>
    <p class="muted" style="text-align:center; margin-top:14px;">¡Seguí así, Pincel! Cada docena y cada hora suman un montón para la misión 🎨🥟</p>`;

  main.querySelectorAll('.acceso-estado').forEach(boton => {
    boton.onclick = () => irATabPincel(boton.dataset.destino);
  });
  main.querySelectorAll('[data-venta-pendiente]').forEach(boton => {
    boton.onclick = () => irATabPincel('ventas', boton.dataset.ventaPendiente);
  });
}

function actualizarConfirmacionVentas(main) {
  actualizarAvisoCambiosVentas();
  const acciones = main.querySelector('#confirmarVentasAcciones');
  if (!acciones) return;
  let cantidad = 0;
  for (const cambio of cambiosVentas.values()) {
    cantidad += Number('estado' in cambio) + Number('retirado' in cambio);
  }
  acciones.hidden = cantidad === 0;
  acciones.querySelector('button').textContent = `Confirmar ${cantidad} ${cantidad === 1 ? 'cambio' : 'cambios'}`;
}

function confirmarCambiosVentas(ventasPorId) {
  const cambios = [...cambiosVentas].map(([id, cambio]) => ({ id, ...cambio }));
  for (const cambio of cambios) {
    if (cambio.estado !== 'Pagado') continue;
    const cliente = ventasPorId.get(cambio.id)?.cliente;
    if (!cambio.metodoPago) {
      toast(`Elegí el medio de pago de ${cliente}.`, true);
      return;
    }
    if (cambio.metodoPago === 'Efectivo' && !cambio.recibidoPor) {
      toast(`Elegí quién recibió el efectivo de ${cliente}.`, true);
      return;
    }
  }
  return guardarCambiosVentas(cambios);
}

function mostrarMetodoPagoVenta(campo, id) {
  const cambio = cambiosVentas.get(id);
  campo.hidden = cambio?.estado !== 'Pagado';
  campo.innerHTML = campo.hidden ? '' : metodoPagoHTML(campo.id, cambio.metodoPago, cambio.recibidoPor);
  if (!campo.hidden) {
    wireMetodoPago(campo.id, (metodoPago, recibidoPor) => {
      Object.assign(cambio, { metodoPago, recibidoPor });
    });
  }
}

async function guardarCambiosVentas(cambios) {
  const boton = document.getElementById('btnConfirmarCambiosVentas');
  if (!boton || boton.disabled || !cambios.length) return;
  boton.disabled = true;
  try {
    const respuesta = await api('BULK_UPDATE_VENTAS', {
      pincel: STATE.miNombre, idMision: idMisionActual(STATE.historial), cambios
    });
    if (!Array.isArray(respuesta.ventas)) await api('SYNC');
    const ventas = new Map(misVentas(STATE.miNombre).map(venta => [String(venta.id), venta]));
    if (!cambios.every(cambio => {
      const venta = ventas.get(cambio.id);
      return venta && ['estado', 'retirado', 'metodoPago', 'recibidoPor'].every(campo =>
        !(campo in cambio) || (venta[campo] ?? '') === cambio[campo]);
    })) {
      toast('Google todavía no confirmó todos los cambios. Podés reintentar.', true);
      return;
    }
    cambios.forEach(({ id }) => cambiosVentas.delete(id));
    actualizarAvisoCambiosVentas();
    render();
    toast('Cambios guardados.');
  } catch (error) {
    if (['MISION_REINICIADA', 'VENTA_NO_DISPONIBLE'].includes(error.code)) {
      try { await api('SYNC'); render(); } catch (_) {}
    }
  } finally {
    boton.disabled = false;
  }
}

function renderTabVentas(main){
  const mias = misVentas(STATE.miNombre).slice().reverse(), impagas = mias.filter(v=>v.estado==='Falta Pagar');
  const adeudaDocs = impagas.reduce((a,v)=>a + (Number(v.docenas)||0), 0), adeudaMeds = impagas.reduce((a,v)=>a + (Number(v.medias)||0), 0);
  const montoAdeudado = Calculos.totalPendiente(mias, STATE.config);
  const cerradas = STATE.config.ventasCerradas;
  const iconoEditar = ` <svg class="venta-icono" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>`;
  const iconoEliminar = `<svg class="venta-icono" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 7h16m-10-3h4m-8 3 1 13h10l1-13m-8 3v6m4-6v6"/>
  </svg>`;
  const ventasPorId = new Map(mias.map(venta => [String(venta.id), venta]));
  for (const id of cambiosVentas.keys()) {
    if (!ventasPorId.has(id)) cambiosVentas.delete(id);
  }
  
  main.innerHTML = `
    <h2 class="section-title">Mis ventas</h2>
    ${montoAdeudado > 0 ? `<div class="banner-min" style="background:var(--rojo); color:var(--blanco); padding:12px; margin-bottom:16px; margin-top:-6px;"><div style="font-size:12px; font-weight:700; opacity:.9;">Adeudás a Economía por tus ventas:</div><div class="stat-num" style="font-size:26px; margin:4px 0;">${fmt$(montoAdeudado)}</div><div style="font-size:11px; opacity:.8;">Corresponde a ${adeudaDocs} docenas y ${adeudaMeds} medias.</div></div>` : ''}
    ${cerradas ? `<div class="card" style="background:#FBE7DA; border:1.5px solid #B4551D; color:#B4551D; text-align:center; font-weight:700; font-size:13px; padding:12px;">🔒 Las ventas están cerradas.<br><span style="font-weight:500; font-size:11.5px;">Ya no se pueden anotar ni editar pedidos, pero podés seguir marcando abajo los pagos y retiros.</span></div>` : `<button class="btn btn-primary" id="btnNuevaVenta">＋ Registrar venta</button>`}
    <p class="muted" style="text-align:center; margin-top:12px; font-size:11.5px;">Podés ir transfiriendo el dinero de tus ventas a <b>${escapeHTML(STATE.config.alias ?? DEFAULT_CONFIG.alias)}</b> (Paulina Rocío García) o pagar todo junto al final.</p>
    
    <h2 class="section-title" style="margin-top:20px;">Mis clientes</h2>
    <p class="muted">${cerradas ? '' : 'Tocá el nombre de un cliente para editar su pedido. '}Marcá pagos y retiros y confirmá los cambios para guardarlos.</p>
    
    <div class="card${cerradas ? '' : ' ventas-con-acciones'}">
      ${mias.length===0 ? `<div class="empty">Todavía no registraste ninguna venta.</div>` : `
        <div class="ventas-fila ventas-encabezado">
          <div>Cliente / Pedido</div>
          <div>Pagado</div>
          <div>Retirado</div>
          ${cerradas ? '' : '<div>Eliminar</div>'}
        </div>
        ${mias.map((v, indice) => {
          const borrador = cambiosVentas.get(String(v.id)) || {};
          const id = escapeHTML(v.id);
          const nombre = escapeHTML(v.cliente);
          const tipo = escapeHTML(v.tipo);
          const idPago = 'pagoPedido' + indice;
          const detallePedido = `
            <span class="li-name">${nombre}${cerradas ? '' : iconoEditar}</span>
            <span class="li-sub">${Number(v.docenas) ? Number(v.docenas) + ' doc. ' : ''}${Number(v.medias) ? Number(v.medias) + ' ½ doc. ' : ''}· ${tipo}${v.estado === 'Pagado' && v.metodoPago ? ' · ' + escapeHTML(v.metodoPago) + (v.metodoPago === 'Efectivo' && v.recibidoPor ? ' (' + escapeHTML(v.recibidoPor) + ')' : '') : ''}</span>`;
          return `<div class="list-item ventas-fila" data-venta-fila="${id}" tabindex="-1">
            <div class="venta-pedido">
              ${cerradas ? detallePedido : `<button type="button" class="venta-editable" data-venta-id="${id}" aria-label="Editar pedido de ${nombre}, ${tipo}">${detallePedido}</button>`}
            </div>
            <label class="venta-casilla">
              <input type="checkbox" aria-label="Pagado: ${nombre}, ${tipo}" aria-controls="${idPago}" class="chk-venta-pagado" data-campo="estado" data-id="${id}" ${(borrador.estado ?? v.estado) === 'Pagado' ? 'checked' : ''}>
            </label>
            <label class="venta-casilla">
              <input type="checkbox" aria-label="Retirado: ${nombre}, ${tipo}" class="chk-venta-retirado" data-campo="retirado" data-id="${id}" ${(borrador.retirado ?? v.retirado) ? 'checked' : ''}>
            </label>
            ${cerradas ? '' : `<button type="button" class="venta-eliminar" data-borrar-venta="${id}" aria-label="Eliminar venta de ${nombre}, ${tipo}">
              ${iconoEliminar}
            </button>`}
            <div class="pago-venta" id="${idPago}" role="group" aria-label="Pago de ${nombre}, ${tipo}" hidden></div>
          </div>
        `; }).join("")}
      `}
    </div>
    ${mias.length ? `<div class="ventas-confirmar" id="confirmarVentasAcciones" ${cambiosVentas.size ? '' : 'hidden'}>
      <button class="btn btn-primary" id="btnConfirmarCambiosVentas">Confirmar cambios</button>
    </div>` : ''}
  `;

  const btnNueva = document.getElementById('btnNuevaVenta');
  if(btnNueva) btnNueva.onclick = () => openModalVenta();
  if(!cerradas){
    main.querySelectorAll('.venta-editable').forEach(boton => {
      boton.onclick = () => openModalVenta(boton.dataset.ventaId, { origen: boton });
    });
    main.querySelectorAll('.venta-eliminar').forEach(boton => {
      boton.onclick = () => openModalVenta(boton.dataset.borrarVenta, { abrirConfirmacion: true, origen: boton });
    });
  }

  const confirmar = document.getElementById('btnConfirmarCambiosVentas');
  if (confirmar) confirmar.onclick = () => confirmarCambiosVentas(ventasPorId);
  actualizarConfirmacionVentas(main);
  main.querySelectorAll('.venta-casilla input').forEach(chk => {
    const { id, campo } = chk.dataset;
    const editorPago = campo === 'estado' ? document.getElementById(chk.getAttribute('aria-controls')) : null;
    if (editorPago) mostrarMetodoPagoVenta(editorPago, id);
    chk.onchange = () => {
      const venta = ventasPorId.get(id);
      const cambios = cambiosVentas.get(id) || {};
      const valor = campo === 'retirado' ? chk.checked : chk.checked ? 'Pagado' : 'Falta Pagar';
      const original = campo === 'estado' && venta.estado !== 'Pagado' ? 'Falta Pagar' : venta[campo];
      if (campo === 'estado') {
        delete cambios.metodoPago;
        delete cambios.recibidoPor;
      }
      if (valor === original) delete cambios[campo];
      else cambios[campo] = valor;
      if (Object.keys(cambios).length) cambiosVentas.set(id, cambios);
      else cambiosVentas.delete(id);
      if (editorPago) mostrarMetodoPagoVenta(editorPago, id);
      actualizarConfirmacionVentas(main);
    };
  });
}
window.openModalVenta = (idEdit = null, { abrirConfirmacion = false, origen = document.activeElement } = {}) => {
  if (STATE.config.ventasCerradas) { toast('Las ventas están cerradas.', true); return; }
  const root = document.getElementById('modalRoot');
  const pincel = STATE.miNombre;
  const idMision = idMisionActual(STATE.historial);
  const reg = idEdit ? misVentas(pincel).find(v => String(v.id) === String(idEdit)) : null;
  if (idEdit && !reg) { toast('El pedido ya no está disponible.', true); return; }
  const idVenta = nuevoIdOperacion();
  const fecha = new Date().toISOString();
  let ultimoIntento;
  let guardando = false;
  
  // Si estamos editando, solo cargamos los números de ese registro específico. Si no, arranca todo en 0.
  const docenas = Number(reg?.docenas) || 0;
  const medias = Number(reg?.medias) || 0;
  let docC = reg?.tipo === 'Crudas' ? docenas : 0;
  let medC = reg?.tipo === 'Crudas' ? medias : 0;
  let docO = reg?.tipo === 'Cocidas' ? docenas : 0;
  let medO = reg?.tipo === 'Cocidas' ? medias : 0;
  const cantidadOriginal = [
    docenas > 0 && `${docenas.toLocaleString('es-AR')} ${docenas === 1 ? 'docena' : 'docenas'}`,
    medias > 0 && `${medias.toLocaleString('es-AR')} ${medias === 1 ? 'media docena' : 'medias docenas'}`
  ].filter(Boolean).join(' y ');
  
  let estado = reg?.estado === 'Pagado' ? 'Pagado' : 'Falta Pagar';
  const cName = reg?.cliente ?? '';
  let metodoInit = reg ? (reg.metodoPago||null) : null, quienInit = reg ? (reg.recibidoPor||null) : null;
  
  root.innerHTML = `<div class="overlay" id="ov"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="tituloVenta">
    <div id="edicionVenta">
    <button type="button" class="close-x" id="closeX" aria-label="Cerrar">✕</button>
    <h3 id="tituloVenta">${reg ? 'Editar Venta' : 'Registrar Venta'}</h3>
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
    </div>
    ${reg ? `<div id="confirmacionBorrarVenta" hidden>
      <h3 id="tituloBorrarVenta">¿Eliminar esta venta?</h3>
      <div class="venta-confirmar-resumen">
        <strong>${escapeHTML(cName)}</strong>
        <span>${cantidadOriginal ? cantidadOriginal + ' · ' : ''}${escapeHTML(reg.tipo)}</span>
      </div>
      <div class="venta-confirmar-acciones">
        <button type="button" class="btn btn-outline" id="btnVolverVenta">Volver</button>
        <button type="button" class="btn btn-primary" id="btnConfirmarBorrarVenta">Eliminar venta</button>
      </div>
    </div>` : ''}
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

  const overlay = document.getElementById('ov');
  const sheet = overlay.firstElementChild;
  const edicion = document.getElementById('edicionVenta');
  const confirmacion = document.getElementById('confirmacionBorrarVenta');
  const confirmando = () => confirmacion && !confirmacion.hidden;
  const btnBorrar = document.getElementById('btnBorrarVenta');
  const btnVolver = document.getElementById('btnVolverVenta');
  const btnConfirmar = document.getElementById('btnConfirmarBorrarVenta');
  const mostrarConfirmacion = (mostrar) => {
    edicion.hidden = mostrar;
    confirmacion.hidden = !mostrar;
    sheet.classList.toggle('sheet-confirmar-venta', mostrar);
    sheet.setAttribute('aria-labelledby', mostrar ? 'tituloBorrarVenta' : 'tituloVenta');
    (mostrar ? btnVolver : btnBorrar).focus();
  };
  const cerrar = () => {
    if (guardando) return;
    if (confirmando() && !abrirConfirmacion) {
      mostrarConfirmacion(false);
      return;
    }
    root.innerHTML = '';
    if (origen?.isConnected) origen.focus({ preventScroll: true });
  };
  document.getElementById('closeX').onclick = cerrar;
  overlay.onclick = event => { if (event.target === event.currentTarget) cerrar(); };
  overlay.onkeydown = event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      cerrar();
    }
    if (event.key === 'Tab' && confirmando()) {
      const ultimo = event.shiftKey ? btnVolver : btnConfirmar;
      if (event.target === ultimo) {
        event.preventDefault();
        (event.shiftKey ? btnConfirmar : btnVolver).focus();
      }
    }
  };

  async function guardarPedido(cambio, mensaje) {
    if (guardando) return;
    const firma = JSON.stringify(cambio);
    if (ultimoIntento?.firma !== firma) ultimoIntento = { firma, id: nuevoIdOperacion() };
    guardando = true;
    const controles = [...root.querySelectorAll('input, select, button')].filter(el => !el.disabled);
    controles.forEach(el => { el.disabled = true; });
    try {
      const respuesta = await api('SAVE_VENTAS', { ...cambio, pincel, idMision, idOperacion: ultimoIntento.id });
      if (!Array.isArray(respuesta.ventas)) { toast('Google todavía no confirmó el pedido. Intentá de nuevo.', true); return; }
      root.innerHTML = '';
      render();
      toast(mensaje);
    } catch (error) {
      if (['VENTAS_CERRADAS', 'MISION_REINICIADA', 'VENTA_NO_DISPONIBLE'].includes(error.code)) {
        if (error.code === 'VENTAS_CERRADAS') STATE.config.ventasCerradas = true;
        root.innerHTML = '';
        try { await api('SYNC'); } catch (_) {}
        render();
      }
    } finally {
      controles.forEach(el => { el.disabled = false; });
      guardando = false;
    }
  }
  
  document.getElementById('btnGuardarVenta').onclick = ()=>{
    const cliente = document.getElementById('vCliente').value.trim(); if(!cliente){ toast("Escribí el nombre del cliente"); return; } 
    const crudasActivas = docC > 0 || medC > 0;
    const cocidasActivas = docO > 0 || medO > 0;
    if(!crudasActivas && !cocidasActivas){ toast("Cargá al menos una docena o media"); return; }
    
    let metodoFinal = null, quienFinal = null;
    if(estado === 'Pagado'){
      metodoFinal = pagoWire?.getMetodo() ?? null;
      const conservaPago = reg?.estado === 'Pagado' && metodoFinal === metodoInit &&
        (reg.tipo === 'Crudas' ? !cocidasActivas : !crudasActivas);
      if (!metodoFinal && !conservaPago) { toast('Elegí transferencia o efectivo.'); return; }
      if (metodoFinal === 'Efectivo') {
        quienFinal = pagoWire.getQuien() || null;
        if (!quienFinal && !conservaPago) { toast('Elegí a quién le diste el efectivo.'); return; }
      }
    }

    const pago = { estado, metodoPago: metodoFinal, recibidoPor: quienFinal };
    const pagoCambiado = !reg || estado !== (reg.estado || 'Falta Pagar') ||
      metodoFinal !== metodoInit || (quienFinal || null) !== quienInit;
    const filas = [
      { tipo: 'Crudas', docenas: docC, medias: medC },
      { tipo: 'Cocidas', docenas: docO, medias: medO }
    ].filter(({ docenas, medias }) => docenas > 0 || medias > 0);
    const filaOriginal = filas.find(fila => fila.tipo === reg?.tipo);
    const editar = filaOriginal ? {
      id: reg.id, cliente, ...filaOriginal, ...(pagoCambiado ? pago : {})
    } : null;
    const borrar = reg && !filaOriginal ? reg.id : null;
    const agregar = filas.filter(fila => fila !== filaOriginal).map(fila => ({
      id: idVenta + '_' + fila.tipo, fecha, cliente, ...fila, ...pago,
      retirado: Boolean(borrar && reg.retirado)
    }));
    return guardarPedido({ editar, borrar, agregar }, reg ? 'Pedido actualizado.' : 'Venta guardada.');
  };
  
  if (btnBorrar) {
    btnBorrar.onclick = () => mostrarConfirmacion(true);
    btnVolver.onclick = cerrar;
    btnConfirmar.onclick = async () => {
      btnConfirmar.textContent = 'Eliminando…';
      await guardarPedido({ borrar: reg.id, agregar: [] }, 'Venta eliminada.');
      btnConfirmar.textContent = 'Eliminar venta';
      if (btnConfirmar.isConnected) btnConfirmar.focus();
    };
    if (abrirConfirmacion) mostrarConfirmacion(true);
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
  const root = document.getElementById('modalRoot');
  const reg = STATE.asistencia.find(a => String(a.id) === String(id));
  if (!reg) return;
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
    openModalMetodoPago('¿Cómo pagaste el mínimo?', (metodo, quien) => guardarPagoPincel('minimo', metodo, quien));
  };
  const bPost = document.getElementById('btnPaguePostFeria'); if(bPost) bPost.onclick = ()=>{
    openModalMetodoPago('¿Cómo pagaste el saldo post feria?', (metodo, quien) => guardarPagoPincel('postFeria', metodo, quien, Number(deuda)));
  };
}

async function guardarPagoPincel(tipo, metodoPago, recibidoPor, monto) {
  const pincel = STATE.miNombre;
  try {
    const respuesta = await api('SET_PINCEL_PAYMENT', {
      pincel, tipo, metodoPago, recibidoPor, monto, idMision: idMisionActual(STATE.historial)
    });
    const campo = tipo === 'minimo' ? 'minimoPagos' : 'postFeriaPagos';
    if (!verdadero(respuesta[campo]?.[pincel]?.pagado)) {
      toast('Google todavía no confirmó el pago. Intentá de nuevo.', true);
      return;
    }
    render();
    toast('Pago guardado.');
  } catch (error) {
    if (['DEUDA_CAMBIO', 'MISION_REINICIADA'].includes(error.code)) {
      try { await api('SYNC'); render(); } catch (_) {}
    }
  }
}
