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
  document.getElementById('bottomNav').innerHTML = ""; 
  document.getElementById('topTitle').textContent = "Pinceles"; 
  document.getElementById('topSub').textContent = "La app ignaciana";
  document.getElementById('main').innerHTML = `
    <div class="selector-wrap">
      <img src="logo.jpg" alt="Logo Pinceles" class="logo-inicio">
      <h1>¡Hola, Pincel!</h1>
      <form id="formEntrar">
        <label for="selNombre">Elegí tu nombre para empezar</label>
        <input list="lista-pinceles" id="selNombre" placeholder="Buscá tu nombre" autocomplete="off" required>
        <datalist id="lista-pinceles">${STATE.pinceles.map(n => `<option value="${escapeHTML(n)}">`).join("")}</datalist>
        <button class="btn btn-primary">Iniciar sesión</button>
      </form>
      <button class="btn btn-outline" id="btnSoyNuevo">Soy nuevo/a</button>
    </div>
  `;
  
  document.getElementById('formEntrar').onsubmit = event => {
    event.preventDefault();
    const nombre = buscarPincel(document.getElementById('selNombre').value);
    if (!nombre) { toast('Elegí tu nombre de la lista o tocá Soy nuevo/a.', true); return; }
    iniciarSesion(nombre);
  };
  document.getElementById('btnSoyNuevo').onclick = abrirRegistro;
}

function buscarPincel(nombre) {
  return STATE.pinceles.find(pincel => claveNombre(pincel) === claveNombre(nombre));
}

function iniciarSesion(nombre) {
  try { localStorage.setItem('mi_nombre', nombre); } catch (_) {}
  STATE.miNombre = nombre;
  STATE.tab = 'estado';
  render();
}

function abrirRegistro() {
  const root = document.getElementById('modalRoot');
  root.innerHTML = `<div class="overlay" id="registroOverlay"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="tituloRegistro">
    <button class="close-x" id="cerrarRegistro" aria-label="Cerrar">✕</button>
    <h3 id="tituloRegistro">Sumate a Pinceles</h3>
    <form id="formRegistro">
      <label for="nuevoNombre">Nombre y apellido</label>
      <input id="nuevoNombre" type="text" autocomplete="name" required>
      <button class="btn btn-primary" id="btnRegistrarPincel">Registrarme</button>
    </form>
  </div></div>`;
  const input = document.getElementById('nuevoNombre');
  const boton = document.getElementById('btnRegistrarPincel');
  const cerrar = () => { if (!boton.disabled) root.innerHTML = ''; };
  document.getElementById('cerrarRegistro').onclick = cerrar;
  document.getElementById('registroOverlay').onclick = event => { if (event.target === event.currentTarget) cerrar(); };
  input.focus();

  document.getElementById('formRegistro').onsubmit = async event => {
    event.preventDefault();
    const nombre = limpiarNombre(input.value);
    if (nombre.split(' ').length < 2) { toast('Escribí tu nombre y apellido.', true); return; }
    boton.disabled = true;
    try {
      // El servidor comprueba duplicados al guardar, incluso entre dos dispositivos.
      const respuesta = await api('ADD_PINCEL', { nombre });
      if (!Array.isArray(respuesta.pinceles)) await api('SYNC');
      const registrado = buscarPincel(nombre);
      if (!registrado) { toast('Google todavía no confirmó el registro. Intentá de nuevo.', true); return; }
      root.innerHTML = '';
      iniciarSesion(registrado);
      toast('¡Ya podés entrar a Pinceles!');
    } catch (_) {
      // El formulario queda disponible para reintentar.
    } finally {
      boton.disabled = false;
    }
  };
}

async function actualizarVentasAlVolver() {
  const enVentas = () => STATE.miNombre && (STATE.economiaOn
    ? STATE.ecoArea === 'feria' && STATE.ecoTab === 'ventas'
    : STATE.tab === 'ventas');
  if (!enVentas()) return;
  try {
    await api('SYNC', {}, { silenciosa: true });
    if (enVentas() && !document.getElementById('modalRoot').firstElementChild) {
      const ventaEnFoco = document.activeElement?.dataset.ventaFila;
      render();
      if (ventaEnFoco !== undefined) enfocarFilaVenta(ventaEnFoco);
    }
  } catch (_) {}
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) void actualizarVentasAlVolver();
});

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
