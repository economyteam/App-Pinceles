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
    <p class="muted" style="font-size:11px; margin:-5px 0 10px 4px;">${cerradas ? 'Marcá las casillas de Pagado o Retirado y confirmá abajo.' : 'Tocá el nombre para editar cantidades, o marcá las casillas y confirmá abajo.'}</p>
    
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
        <button class="btn btn-gold" id="btnConfirmarCambiosVentas" style="margin-top:14px; display:none;">Confirmar cambios</button>
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
