function render(){
  try {
    const actions = document.getElementById('headerActions');
    if(!STATE.miNombre){ actions.innerHTML = ``; renderSelector(); return; }
    
    actions.innerHTML = `<button class="btn-logout" onclick="cerrarSesion()">Salir</button><div class="icon-btn" id="btnGear" title="Panel EconomyTeam"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--rojo)" stroke-width="2"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6c.57-.24 1-.77 1-1.51V3a2 2 0 114 0v.09c0 .74.43 1.27 1 1.51.62.26 1.35.14 1.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06c-.47.47-.59 1.2-.33 1.82.24.57.77 1 1.51 1H21a2 2 0 110 4h-.09c-.74 0-1.27.43-1.51 1z"/></svg></div><img src="logo.jpg" alt="Logo" class="logo-header">`;
    document.getElementById('btnGear').onclick = ()=>{ if(STATE.economiaOn){ STATE.economiaOn = false; render(); return; } openPinModal(); };
    document.getElementById('topTitle').textContent = STATE.economiaOn ? "EconomyTeam" : "Bienvenido/a"; document.getElementById('topSub').textContent = STATE.economiaOn ? "Panel de gestión" : STATE.miNombre;
    if(STATE.economiaOn){ renderEconomia(); } else { renderPincelApp(); }
  } catch(err) {
    console.error('No se pudo mostrar la pantalla:', err);
    toast('Hubo un problema al mostrar esta pantalla.', true);
  }
}

function renderSelector(){
  document.getElementById('bottomNav').innerHTML = ""; document.getElementById('topTitle').textContent = "Pinceles"; document.getElementById('topSub').textContent = "La app ignaciana";
  document.getElementById('main').innerHTML = `
    <div class="selector-wrap"><img src="logo.jpg" alt="Logo Pinceles" class="logo-inicio"><h1>¡Hola, Pincel!</h1><p class="tag">Elegí tu nombre para empezar</p><input list="lista-pinceles" id="selNombre" placeholder="Buscá tu nombre..." autocomplete="off"><datalist id="lista-pinceles">${STATE.pinceles.map(n=>`<option value="${escapeHTML(n)}">`).join("")}</datalist><button class="btn btn-primary" id="btnEntrar" style="margin-top:6px;">Iniciar Sesión</button></div>
  `;
  document.getElementById('btnEntrar').onclick = async ()=>{
    const v = document.getElementById('selNombre').value.trim();
    if(!v){ toast("Escribí o elegí tu nombre"); return; }
    const match = STATE.pinceles.find(p => p.trim().toLowerCase() === v.toLowerCase());
    if(!match){ toast("Perdón! tu nombre no está cargado, comunicate con alguien del EconomyTeam", true); return; }
    try { localStorage.setItem('mi_nombre', match); } catch(e){} STATE.miNombre = match; STATE.tab = "estado"; render();
    try { await api('SYNC'); } catch(e) { toast('No se pudieron actualizar los datos.', true); }
    render();
  };
}


/* ============================= INIT ============================= */
(async function init(){
  try { STATE.miNombre = localStorage.getItem('mi_nombre'); } catch(e){}
  try { render(); } catch(e) {}
  try {
    await api('SYNC');
    if (STATE.miNombre && !STATE.pinceles.includes(STATE.miNombre)) {
      STATE.miNombre = null;
      try { localStorage.removeItem('mi_nombre'); } catch (_) {}
    }
  } catch(e) {
    toast('No se pudieron cargar los datos de Google. Revisá tu conexión y recargá.', true);
  }
  render();
})();
