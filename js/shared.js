/* Utilidades de visualización y componentes compartidos. */
const fmt$ = n => '$' + (Number.isFinite(Number(n)) ? Math.round(Number(n)) : 0).toLocaleString('es-AR');
const escapeHTML = valor => String(valor ?? '').replace(/[&<>"']/g, caracter => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[caracter]);
const limpiarNombre = nombre => String(nombre ?? '').trim().replace(/\s+/g, ' ');
const claveNombre = nombre => limpiarNombre(nombre).toLocaleLowerCase('es-AR');
const verdadero = valor => valor === true || valor === 1 || /^(true|1)$/i.test(String(valor ?? '').trim());
const idMisionActual = historial => historial.at(-1)?.idOperacion ?? '';
const nuevoIdOperacion = () => globalThis.crypto?.randomUUID?.() ?? Date.now() + '_' + Math.random().toString(36).slice(2);
let toastTimer = null;
function toast(msg, warn = false) {
  const t = document.getElementById('toast');
  if (!t) return;
  clearTimeout(toastTimer);
  t.textContent = msg;
  t.classList.toggle('warn', !!warn);
  t.classList.add('show');
  toastTimer = setTimeout(() => t.classList.remove('show'), warn ? 5000 : 2000);
}
function misVentas(nombre) { return STATE.ventas.filter(v => v.pincel === nombre); }
function docenasEquiv(v) { return Calculos.docenasEquivalentes(v); }
function totalDocenasDe(nombre) { return misVentas(nombre).reduce((a, v) => a + docenasEquiv(v), 0); }
function totalHorasDe(nombre) { return STATE.asistencia.filter(a => a.pincel === nombre).reduce((a, r) => a + (Number(r.horas) || 0), 0); }
function localISOTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '';
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function advertirCambiosPendientes(event) {
  if (!cambiosVentas.size) return;
  event.preventDefault();
  event.returnValue = true;
}

function actualizarAvisoCambiosVentas() {
  if (cambiosVentas.size) window.addEventListener('beforeunload', advertirCambiosPendientes);
  else window.removeEventListener('beforeunload', advertirCambiosPendientes);
}

window.cerrarSesion = () => {
  if (cambiosVentas.size && !confirm('Tenés cambios de ventas sin confirmar. ¿Querés salir sin guardarlos?')) return;
  STATE.miNombre = null; STATE.economiaOn = false; STATE.tab = 'estado';
  cambiosVentas.clear();
  actualizarAvisoCambiosVentas();
  document.getElementById('modalRoot').innerHTML = '';
  try { localStorage.removeItem('mi_nombre'); } catch (e) { /* navegador privado */ }
  render();
};

function metodoPagoHTML(idPrefix, metodoInit, quienInit) {
  return `
    <div id="${idPrefix}_wrap">
      <label id="${idPrefix}_etiqueta">Forma de pago</label>
      <div class="toggle-row" id="${idPrefix}_metodo" role="group" aria-labelledby="${idPrefix}_etiqueta">
        <button type="button" class="toggle-opt ${metodoInit === 'Transferencia' ? 'active' : ''}" data-v="Transferencia" aria-pressed="${metodoInit === 'Transferencia'}">Transferencia</button>
        <button type="button" class="toggle-opt ${metodoInit === 'Efectivo' ? 'active' : ''}" data-v="Efectivo" aria-pressed="${metodoInit === 'Efectivo'}">Efectivo</button>
      </div>
      <div class="pago-receptor" id="${idPrefix}_quien_wrap" ${metodoInit === 'Efectivo' ? '' : 'hidden'}>
        <label for="${idPrefix}_quien">¿A quién?</label>
        <select id="${idPrefix}_quien">
          <option value="" ${!quienInit ? 'selected' : ''} disabled>Elegí a quién</option>
          ${RECEPTORES.map(r => `<option value="${escapeHTML(r)}" ${quienInit === r ? 'selected' : ''}>${escapeHTML(r)}</option>`).join('')}
        </select>
      </div>
    </div>`;
}
function wireMetodoPago(idPrefix, onChange) {
  const metodos = document.querySelectorAll(`#${idPrefix}_metodo .toggle-opt`);
  const receptor = document.getElementById(`${idPrefix}_quien`);
  const campoReceptor = document.getElementById(`${idPrefix}_quien_wrap`);
  let metodo = [...metodos].find(opcion => opcion.classList.contains('active'))?.dataset.v || null;
  const avisar = () => onChange?.(metodo, metodo === 'Efectivo' ? receptor.value : '');
  metodos.forEach(opcion => {
    opcion.onclick = () => {
      metodo = opcion.dataset.v;
      metodos.forEach(boton => {
        const elegido = boton === opcion;
        boton.classList.toggle('active', elegido);
        boton.setAttribute('aria-pressed', elegido);
      });
      campoReceptor.hidden = metodo !== 'Efectivo';
      avisar();
    };
  });
  receptor.onchange = avisar;
  return {
    getMetodo: () => metodo,
    getQuien: () => receptor.value
  };
}
function openModalMetodoPago(titulo, onConfirm) {
  const root = document.getElementById('modalRoot');
  root.innerHTML = `<div class="overlay" id="ov"><div class="sheet"><button class="close-x" id="closeX" aria-label="Cerrar">✕</button><h3>${escapeHTML(titulo)}</h3>${metodoPagoHTML('genpago', null, null)}<button class="btn btn-primary" id="btnConfirmPagoMetodo" style="margin-top:6px;">Confirmar</button></div></div>`;
  document.getElementById('closeX').onclick = () => root.innerHTML = '';
  document.getElementById('ov').onclick = e => { if (e.target.id === 'ov') root.innerHTML = ''; };
  const wire = wireMetodoPago('genpago');
  document.getElementById('btnConfirmPagoMetodo').onclick = () => {
    const metodo = wire.getMetodo();
    if (!metodo) { toast('Elegí transferencia o efectivo'); return; }
    let quien = null;
    if (metodo === 'Efectivo') {
      quien = wire.getQuien();
      if (!quien) { toast('Elegí a quién se lo diste'); return; }
    }
    root.innerHTML = '';
    onConfirm(metodo, quien);
  };
}
