/* Comunicación con Google Apps Script.
   Todas las escrituras de ESTE navegador se envían en orden para evitar que
   dos respuestas simultáneas reemplacen cambios más recientes en la UI.
   La concurrencia entre distintos usuarios requiere LockService en Apps Script. */

let mutacionesPendientes = [];
let procesandoMutaciones = false;
let esperandoMutaciones = [];
let colaSolicitudes = Promise.resolve();
let procesandoSolicitud = false;
let versionOperaciones = 0;
const operacionesConBackendActualizado = new Set([
  'SET_PINCEL_PAYMENT', 'SET_DEUDA_ASIGNADA', 'SAVE_VENTAS', 'BULK_UPDATE_VENTAS',
  'UPDATE_CONFIG', 'SET_VENTAS_CERRADAS', 'ADJUST_COCINA', 'RESET_MISSION'
]);

function showLoading(show) {
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = show ? 'flex' : 'none';
}

function snapshot(obj) { return JSON.parse(JSON.stringify(obj)); }

async function solicitarAPI(action, payload = {}) {
  if (operacionesConBackendActualizado.has(action) && versionOperaciones !== 1) {
    throw Object.assign(new Error('Hace falta actualizar Google Apps Script para guardar este cambio.'), { code: 'ACTUALIZAR_APPS_SCRIPT' });
  }
  const control = new AbortController();
  const limite = setTimeout(() => control.abort(), 30000);
  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action, payload }),
      signal: control.signal
      // Sin Content-Type: application/json para no disparar un preflight CORS.
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const db = await res.json();
    if (!db || typeof db !== 'object' || Array.isArray(db)) throw new Error('Respuesta inválida');
    if (db.error) throw Object.assign(new Error(String(db.error)), { code: db.code });
    return db;
  } finally {
    clearTimeout(limite);
  }
}

function esperarMutaciones() {
  if (!procesandoMutaciones && mutacionesPendientes.length === 0) return Promise.resolve();
  return new Promise(resolve => esperandoMutaciones.push(resolve));
}

function api(action, payload = {}, { silenciosa = false } = {}) {
  const datos = snapshot(payload);
  const solicitud = colaSolicitudes.then(async () => {
    while (procesandoMutaciones || mutacionesPendientes.length) await esperarMutaciones();
    procesandoSolicitud = true;
    if (!silenciosa) showLoading(true);
    try {
      const db = await solicitarAPI(action, datos);
      aplicarDB(db);
      return db;
    } catch (e) {
      console.error(`Error de API (${action}):`, e);
      if (!silenciosa && action !== 'SYNC') {
        toast(e.code ? e.message : 'No se pudo confirmar el guardado. Intentá de nuevo.', true);
      }
      throw e;
    } finally {
      if (!silenciosa) showLoading(false);
      procesandoSolicitud = false;
      if (mutacionesPendientes.length) void procesarMutaciones();
    }
  });
  colaSolicitudes = solicitud.catch(() => {});
  return solicitud;
}

// Las acciones de fondo son optimistas: si falla algo se reconcilia con Google.
function apiBackground(action, payload = {}, onError = null) {
  mutacionesPendientes.push({ action, payload: snapshot(payload), onError });
  if (!procesandoMutaciones && !procesandoSolicitud) void procesarMutaciones();
}

async function procesarMutaciones() {
  if (procesandoMutaciones) return;
  procesandoMutaciones = true;
  let ultimaRespuesta = null;
  let fallo = false;
  try {
    while (mutacionesPendientes.length > 0) {
      const operacion = mutacionesPendientes.shift();
      try {
        const db = await solicitarAPI(operacion.action, operacion.payload);
        if (Array.isArray(db.ventas) || Array.isArray(db.pinceles) || Array.isArray(db.asistencia)) {
          ultimaRespuesta = db;
        }
      } catch (e) {
        console.error(`No se guardó ${operacion.action}:`, e);
        mutacionesPendientes = [];
        fallo = true;
        try {
          aplicarDB(await solicitarAPI('SYNC'));
        } catch (syncError) {
          console.error('Tampoco se pudo reconciliar con Google:', syncError);
          if (operacion.onError) operacion.onError();
        }
        toast(e.code ? e.message : 'No se guardaron todos los cambios. Revisá los datos antes de seguir.', true);
        render();
        break;
      }
    }
    if (!fallo && ultimaRespuesta) {
      aplicarDB(ultimaRespuesta);
      render();
    }
  } finally {
    procesandoMutaciones = false;
    const esperan = esperandoMutaciones;
    esperandoMutaciones = [];
    esperan.forEach(resolve => resolve());
    if (mutacionesPendientes.length) void procesarMutaciones();
  }
}

function aplicarDB(db) {
  if (db.versionOperaciones !== undefined) versionOperaciones = db.versionOperaciones;
  if (Array.isArray(db.pinceles)) STATE.pinceles = db.pinceles;
  if (Array.isArray(db.ventas)) STATE.ventas = db.ventas.map(venta => ({ ...venta, retirado: verdadero(venta.retirado) }));
  if (Array.isArray(db.asistencia)) STATE.asistencia = db.asistencia;
  if (Array.isArray(db.historial)) {
    if (idMisionActual(STATE.historial) !== idMisionActual(db.historial)) {
      cambiosVentas.clear();
      actualizarAvisoCambiosVentas();
    }
    STATE.historial = db.historial;
    STATE.estadisticasArchivadas = db.estadisticasArchivadas === true;
  }
  if (db.config && typeof db.config === 'object') {
    STATE.config = { ...DEFAULT_CONFIG, ...Object.fromEntries(
      Object.entries(db.config).filter(([, v]) => v !== null && v !== undefined && v !== '')
    ), ventasCerradas: verdadero(db.config.ventasCerradas) };
  }
  if (db.sesiones && typeof db.sesiones === 'object') STATE.sesiones = db.sesiones;
  if (db.minimoPagos && typeof db.minimoPagos === 'object') STATE.minimoPagos = db.minimoPagos;
  if (db.postFeriaPagos && typeof db.postFeriaPagos === 'object') STATE.postFeriaPagos = db.postFeriaPagos;
  if (db.deudaAsignada && typeof db.deudaAsignada === 'object') STATE.deudaAsignada = db.deudaAsignada;
  if (db.ventasMisas && typeof db.ventasMisas === 'object') STATE.ventasMisas = db.ventasMisas;

  if (Array.isArray(db.receta) && db.receta.length > 0) {
    const receta = db.receta.map(r => ({ ...r }));
    receta.forEach(r => {
      const def = DEFAULT_RECETA.find(d => d.ing.split(' - ')[0] === String(r.ing || '').split(' - ')[0]);
      if (def) {
        r.cat = def.cat;
        if (def.fixed !== undefined) { r.fixed = def.fixed; delete r.c50; }
        else if (def.c50 !== undefined) { r.c50 = def.c50; delete r.fixed; }
      } else if (!r.cat) r.cat = 'Otros';
    });
    const nombres = receta.map(r => String(r.ing || '').split(' - ')[0]);
    DEFAULT_RECETA.forEach(def => {
      if (!nombres.includes(def.ing.split(' - ')[0])) receta.push({ ...def, stock: 0, gasto: 0 });
    });
    const orden = ['Ingredientes', 'Descartables', 'Limpieza', 'Otros'];
    receta.sort((a, b) => orden.indexOf(a.cat) - orden.indexOf(b.cat));
    STATE.receta = receta;
  }
  if (db.docenasCocinar !== undefined && db.docenasCocinar !== null) {
    STATE.docenasCocinar = Number(db.docenasCocinar) || 0;
  }
  if (db.cocinaDescuentos && typeof db.cocinaDescuentos === 'object') {
    STATE.cocinaDescuentos = db.cocinaDescuentos;
  }
  if (db.inventario && typeof db.inventario === 'object') {
    STATE.inventario = {
      fecha: typeof db.inventario.fecha === 'string' ? db.inventario.fecha : '',
      items: Array.isArray(db.inventario.items) ? db.inventario.items.filter(item => item && typeof item === 'object') : []
    };
  }
  if (db.comprasMision && typeof db.comprasMision === 'object') {
    STATE.comprasMision = db.comprasMision;
  }
}
