/* Utilidades de visualización y componentes compartidos. */
const fmt$ = n => '$' + (Number.isFinite(Number(n)) ? Math.round(Number(n)) : 0).toLocaleString('es-AR');
const escapeHTML = valor => String(valor ?? '').replace(/[&<>"']/g, caracter => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[caracter]);
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
function docenasEquiv(v) { return (Number(v.docenas) || 0) + (Number(v.medias) || 0) * 0.5; }
function totalDocenasDe(nombre) { return misVentas(nombre).reduce((a, v) => a + docenasEquiv(v), 0); }
function totalHorasDe(nombre) { return STATE.asistencia.filter(a => a.pincel === nombre).reduce((a, r) => a + (Number(r.horas) || 0), 0); }
function localISOTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '';
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

window.cerrarSesion = () => {
  STATE.miNombre = null; STATE.economiaOn = false; STATE.tab = 'estado';
  try { localStorage.removeItem('mi_nombre'); } catch (e) { /* navegador privado */ }
  render();
};

function metodoPagoHTML(idPrefix, metodoInit, quienInit) {
  return `
    <div id="${idPrefix}_wrap">
      <label>Forma de pago</label>
      <div class="toggle-row" id="${idPrefix}_metodo">
        <button type="button" class="toggle-opt ${metodoInit === 'Transferencia' ? 'active' : ''}" data-v="Transferencia">Transferencia</button>
        <button type="button" class="toggle-opt ${metodoInit === 'Efectivo' ? 'active' : ''}" data-v="Efectivo">Efectivo</button>
      </div>
      <div id="${idPrefix}_quien_wrap" style="${metodoInit === 'Efectivo' ? '' : 'display:none;'}">
        <label>¿A quién?</label>
        <select id="${idPrefix}_quien">
          <option value="" ${!quienInit ? 'selected' : ''} disabled>Elegí a quién</option>
          ${RECEPTORES.map(r => `<option value="${escapeHTML(r)}" ${quienInit === r ? 'selected' : ''}>${escapeHTML(r)}</option>`).join('')}
        </select>
      </div>
    </div>`;
}
function wireMetodoPago(idPrefix) {
  let metodo = document.querySelector(`#${idPrefix}_metodo .toggle-opt.active`)?.dataset.v || null;
  document.querySelectorAll(`#${idPrefix}_metodo .toggle-opt`).forEach(el => {
    el.onclick = () => {
      document.querySelectorAll(`#${idPrefix}_metodo .toggle-opt`).forEach(x => x.classList.remove('active'));
      el.classList.add('active');
      metodo = el.dataset.v;
      const qw = document.getElementById(`${idPrefix}_quien_wrap`);
      if (qw) qw.style.display = metodo === 'Efectivo' ? '' : 'none';
    };
  });
  return {
    getMetodo: () => metodo,
    getQuien: () => document.getElementById(`${idPrefix}_quien`)?.value || ''
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
