let feriaSeleccionada = null;
let seccionFeria = 'resumen';
let feriasComparadas = null;
const informesArchivados = new Map();

const diasFeria = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const fechaLocalFeria = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'America/Argentina/Buenos_Aires'
});
const numeroFeria = valor => valor != null && valor !== '' && Number.isFinite(Number(valor)) ? Number(valor) : null;
const cantidadFeria = valor => numeroFeria(valor)?.toLocaleString('es-AR', { maximumFractionDigits: 2 }) ?? '—';
const dineroFeria = valor => numeroFeria(valor) == null ? '—' : fmt$(valor);

function diaLocalDeFeria(fecha) {
  const partes = Object.fromEntries(fechaLocalFeria.formatToParts(fecha).map(({ type, value }) => [type, value]));
  return [partes.year, partes.month, partes.day].join('-');
}

function fechaVisibleFeria(fecha) {
  const valor = String(fecha ?? '');
  if (!/^\d{4}-\d{2}-\d{2}/.test(valor)) return valor;
  const dia = new Date(valor.slice(0, 10));
  return Number.isFinite(dia.getTime()) ? diasFeria.format(dia) : valor;
}

function volverAListaFerias() {
  feriaSeleccionada = null;
  feriasComparadas = null;
}

function renderEcoResultados(main) {
  const resultadoActual = Calculos.resumenFinanciero(STATE.ventas, STATE.ventasMisas, STATE.receta, STATE.config);
  const ferias = [{ ...resultadoActual, clave: 'actual', nombre: 'Feria actual',
    fecha: STATE.config.ventasCerradas ? 'Ventas cerradas' : 'Ventas abiertas',
    docPinceles: STATE.ventas.reduce((total, venta) => total + docenasEquiv(venta), 0),
    docMisas: docenasEquiv(STATE.ventasMisas)
  }, ...STATE.historial.map((feria, indice) => ({
    ...feria, clave: `archivo-${feria.idOperacion || indice}`,
    fecha: fechaVisibleFeria(feria.fecha),
    nombre: feria.nombre || (feria.fecha ? `Feria del ${fechaVisibleFeria(feria.fecha)}` : 'Feria archivada')
  })).reverse()];
  const seleccion = ferias.find(feria => feria.clave === feriaSeleccionada);
  if (seleccion) { mostrarInformeFeria(main, seleccion); return; }
  if (feriasComparadas?.every(clave => ferias.some(feria => feria.clave === clave))) {
    mostrarComparacionFerias(main, ferias);
    return;
  }

  main.innerHTML = `
    <div class="resultados-acciones">
      <h1 class="titulo-resultados" tabindex="-1">Resultados de ferias</h1>
      ${ferias.length > 1 ? '<button type="button" class="btn btn-outline btn-sm" id="compararFerias">Comparar ferias</button>' : ''}
    </div>
    <div class="ferias-lista">
      ${ferias.map(feria => `<button type="button" class="card feria-selector" data-feria="${escapeHTML(feria.clave)}">
        <span class="feria-selector-nombre">${escapeHTML(feria.nombre)}</span>
        ${feria.fecha ? `<span class="feria-selector-fecha">${escapeHTML(feria.fecha)}</span>` : ''}
        <span class="feria-selector-indicadores">
          <span><strong>${dineroFeria(feria.ganancia)}</strong> Ganancia feria</span>
          <span><strong>${cantidadFeria(docenasTotalesFeria(feria))}</strong> Docenas vendidas</span>
        </span>
        <span class="feria-selector-ver">Ver estadísticas</span>
      </button>`).join('')}
    </div>
    ${ferias.length === 1 ? '<p class="muted">Las ferias que archives desde Configuración aparecerán acá.</p>' : ''}`;
  main.querySelectorAll('[data-feria]').forEach(boton => {
    boton.onclick = () => {
      feriaSeleccionada = boton.dataset.feria;
      seccionFeria = 'resumen';
      render();
      document.querySelector('.titulo-resultados')?.focus();
    };
  });
  const comparar = main.querySelector('#compararFerias');
  if (comparar) comparar.onclick = () => {
    feriasComparadas = ferias.length > 2 ? [ferias[2].clave, ferias[1].clave] : [ferias[1].clave, ferias[0].clave];
    render();
    document.querySelector('.titulo-resultados')?.focus();
  };
}

async function cargarInformeArchivado(feria) {
  informesArchivados.set(feria.clave, { estado: 'cargando' });
  try {
    const respuesta = await api('GET_FERIA_ESTADISTICAS', { idOperacion: feria.idOperacion }, { silenciosa: true });
    informesArchivados.set(feria.clave, { estado: 'listo', datos: respuesta.estadisticas });
  } catch (_) {
    informesArchivados.set(feria.clave, { estado: 'error' });
  }
  const informeAbierto = feriaSeleccionada === feria.clave || feriasComparadas?.includes(feria.clave);
  if (STATE.economiaOn && STATE.ecoArea === 'feria' && STATE.ecoTab === 'resultados' && informeAbierto) {
    const foco = document.activeElement;
    render();
    if (foco?.dataset.informeSeccion) {
      document.querySelector(`[data-informe-seccion="${foco.dataset.informeSeccion}"]`)?.focus();
    } else if (foco?.dataset.comparacion !== undefined) {
      document.getElementById(foco.id)?.focus();
    }
  }
}

function informeDeFeria(feria) {
  const actual = feria.clave === 'actual';
  const conConsulta = !actual && feria.idOperacion && STATE.estadisticasArchivadas;
  if (conConsulta && !informesArchivados.has(feria.clave)) void cargarInformeArchivado(feria);
  const consulta = informesArchivados.get(feria.clave);
  const detalle = actual ? Calculos.estadisticasFeria(STATE, diaLocalDeFeria) : consulta?.datos;
  return { consulta, detalle, datos: detalle || feria };
}

function mostrarInformeFeria(main, feria) {
  const { detalle, datos, consulta } = informeDeFeria(feria);
  const pestanas = [
    ['resumen', 'Resumen'], ['ventas', 'Ventas'], ['finanzas', 'Finanzas'], ['pinceles', 'Pinceles']
  ];
  let contenido;
  if (seccionFeria === 'ventas') contenido = ventasInformeFeria(datos, detalle);
  else if (seccionFeria === 'finanzas') contenido = finanzasInformeFeria(datos, detalle, feria);
  else if (seccionFeria === 'pinceles') contenido = pincelesInformeFeria(detalle);
  else contenido = resumenInformeFeria(datos, detalle);

  main.innerHTML = `
    <button type="button" class="btn btn-outline btn-sm feria-volver" id="volverFerias">Volver a ferias</button>
    <header class="feria-encabezado">
      <h1 class="titulo-resultados" tabindex="-1">${escapeHTML(feria.nombre)}</h1>
      ${feria.fecha ? `<p class="feria-selector-fecha">${escapeHTML(feria.fecha)}</p>` : ''}
    </header>
    <nav class="feria-pestanas" aria-label="Estadísticas de la feria">
      ${pestanas.map(([id, etiqueta]) => `<button type="button" data-informe-seccion="${id}" aria-pressed="${seccionFeria === id}">${etiqueta}</button>`).join('')}
    </nav>
    ${consulta?.estado === 'cargando' ? '<p class="feria-aviso" role="status">Cargando el detalle de la feria…</p>'
      : consulta?.estado === 'error' ? '<div class="feria-aviso">El detalle no se pudo cargar. <button type="button" id="reintentarInforme">Reintentar</button></div>'
      : !detalle ? '<p class="feria-aviso">Esta feria se archivó con un resumen de totales.</p>' : ''}
    ${consulta?.estado === 'cargando' && seccionFeria === 'pinceles' ? '' : contenido}`;
  main.querySelector('#volverFerias').onclick = () => {
    volverAListaFerias();
    render();
    document.querySelector('.titulo-resultados')?.focus();
  };
  main.querySelectorAll('[data-informe-seccion]').forEach(boton => {
    boton.onclick = () => {
      seccionFeria = boton.dataset.informeSeccion;
      render();
      document.querySelector(`[data-informe-seccion="${seccionFeria}"]`)?.focus();
    };
  });
  const reintentar = main.querySelector('#reintentarInforme');
  if (reintentar) reintentar.onclick = () => { void cargarInformeArchivado(feria); render(); };
  if (seccionFeria === 'pinceles' && detalle) activarFiltrosPincelesFeria(main, detalle);
}

function mostrarComparacionFerias(main, ferias) {
  const [base, comparada] = feriasComparadas.map(clave => ferias.find(feria => feria.clave === clave));
  const informes = [informeDeFeria(base), informeDeFeria(comparada)];
  const indicadores = [
    ['Docenas vendidas', ({ datos }) => docenasTotalesFeria(datos), cantidadFeria],
    ['Horas trabajadas', ({ detalle }) => detalle?.participantes?.reduce((total, p) => total + p.horas, 0), cantidadFeria],
    ['Ventas pendientes de pago', ({ detalle }) => detalle?.importePendiente, dineroFeria],
    ['Docenas por retirar', ({ detalle }) => {
      const vendidas = numeroFeria(detalle?.docPinceles);
      const retiradas = numeroFeria(detalle?.docRetiradas);
      return vendidas === null || retiradas === null ? null : Math.max(0, vendidas - retiradas);
    }, cantidadFeria]
  ].map(([etiqueta, leer, formato]) => ({ etiqueta, valores: informes.map(info => numeroFeria(leer(info))), formato }));
  const hayDatosFaltantes = indicadores.some(({ valores }) => valores.includes(null));
  const cargando = informes.some(info => info.consulta?.estado === 'cargando');
  const conError = [base, comparada].filter((_, i) => informes[i].consulta?.estado === 'error');
  const selector = (id, etiqueta, indice) => `<div>
    <label for="${id}">${etiqueta}</label>
    <div class="selector-redondeado"><select id="${id}" data-comparacion="${indice}">
      ${ferias.map(feria => `<option value="${escapeHTML(feria.clave)}"
        ${feria.clave === feriasComparadas[indice] ? 'selected' : ''}>${escapeHTML(feria.nombre)}${feria.clave !== 'actual' && feria.fecha ? ' · ' + escapeHTML(feria.fecha) : ''}</option>`).join('')}
    </select></div>
    <p class="comparacion-nombre-movil">${escapeHTML((indice === 0 ? base : comparada).nombre)}</p>
  </div>`;

  main.innerHTML = `
    <button type="button" class="btn btn-outline btn-sm feria-volver" id="volverFerias">Volver a ferias</button>
    <h1 class="titulo-resultados" tabindex="-1">Comparar ferias</h1>
    <section class="card comparacion-panel">
      <div class="comparacion-selectores">
        ${selector('feriaBase', 'Feria base', 0)}
        ${selector('feriaComparada', 'Comparar con', 1)}
      </div>
      ${cargando ? '<p role="status" class="feria-aviso">Cargando informes archivados…</p>' : ''}
      ${conError.length ? '<div class="feria-aviso">Hubo un problema al cargar un informe. <button type="button" id="reintentarComparacion">Reintentar</button></div>' : ''}
      <table class="comparacion-ferias" aria-label="Indicadores de las ferias seleccionadas">
        <thead><tr>
          <th scope="col">Indicador</th>
          <th scope="col"><span class="comparacion-rotulo-completo">${escapeHTML(base.nombre)}</span><span class="comparacion-rotulo-breve">Base</span></th>
          <th scope="col"><span class="comparacion-rotulo-completo">${escapeHTML(comparada.nombre)}</span><span class="comparacion-rotulo-breve">Comparada</span></th>
          <th scope="col"><span class="comparacion-rotulo-completo">Diferencia</span><span class="comparacion-rotulo-breve">Cambio</span></th>
        </tr></thead>
        <tbody>${indicadores.map(({ etiqueta, valores: [a, b], formato }) => {
          let diferencia = '—';
          if (a !== null && b !== null) {
            const valor = formato(Math.abs(b - a));
            diferencia = (valor === formato(0) ? '' : b > a ? '+' : '−') + valor;
          }
          return `<tr><th scope="row">${etiqueta}</th>
            <td>${formato(a)}</td><td>${formato(b)}</td><td>${diferencia}</td></tr>`;
        }).join('')}</tbody>
      </table>
      ${hayDatosFaltantes && !cargando && !conError.length ? '<p class="muted">— indica que ese dato no quedó registrado.</p>' : ''}
    </section>`;
  main.querySelector('#volverFerias').onclick = () => {
    volverAListaFerias();
    render();
    document.querySelector('#compararFerias')?.focus();
  };
  main.querySelectorAll('[data-comparacion]').forEach(campo => {
    campo.onchange = () => {
      const indice = Number(campo.dataset.comparacion);
      if (campo.value === feriasComparadas[1 - indice]) feriasComparadas.reverse();
      else feriasComparadas[indice] = campo.value;
      render();
      document.getElementById(campo.id)?.focus();
    };
  });
  const reintentar = main.querySelector('#reintentarComparacion');
  if (reintentar) reintentar.onclick = () => {
    conError.forEach(feria => { void cargarInformeArchivado(feria); });
    render();
  };
}

function indicadoresFeria(filas) {
  return `<dl class="feria-indicadores">
    ${filas.map(([etiqueta, valor]) => `<div><dt>${escapeHTML(etiqueta)}</dt><dd>${escapeHTML(valor)}</dd></div>`).join('')}
  </dl>`;
}

function barrasFeria(titulo, series, formato = cantidadFeria, sinDatos = 'Sin datos registrados.') {
  const filas = series.filter(([, valor]) => numeroFeria(valor) !== null);
  const maximo = Math.max(1, ...filas.map(([, valor]) => Number(valor)));
  return `<section class="card feria-panel">
    <h2>${escapeHTML(titulo)}</h2>
    ${filas.length ? `<ul class="feria-barras">${filas.map(([etiqueta, valor]) => `<li>
      <div><span>${escapeHTML(etiqueta)}</span><strong>${escapeHTML(formato(valor))}</strong></div>
      <span class="feria-barra" aria-hidden="true"><i style="width:${Math.max(0, Number(valor)) / maximo * 100}%"></i></span>
    </li>`).join('')}</ul>` : `<p class="muted">${escapeHTML(sinDatos)}</p>`}
  </section>`;
}

function docenasTotalesFeria(datos) {
  const pinceles = numeroFeria(datos.docPinceles);
  const misas = numeroFeria(datos.docMisas);
  return pinceles === null || misas === null ? null : pinceles + misas;
}

function resumenInformeFeria(datos, detalle) {
  const docenas = docenasTotalesFeria(datos);
  const ingresos = numeroFeria(datos.ingresos);
  const ganancia = numeroFeria(datos.ganancia);
  const margen = ingresos > 0 && ganancia !== null ? cantidadFeria(ganancia / ingresos * 100) + '%' : '—';
  const pendientes = detalle && detalle.participantes.filter(p =>
    p.actividad && detalle.config.horasObjetivo > 0 && p.horas + p.docenas < detalle.config.horasObjetivo);
  const alertas = detalle ? [
    detalle.importePendiente > 0 && `${fmt$(detalle.importePendiente)} de ventas de Pinceles pendientes de pago a Economía.`,
    detalle.docPinceles > detalle.docRetiradas && `${cantidadFeria(detalle.docPinceles - detalle.docRetiradas)} docenas de Pinceles pendientes de retiro.`,
    pendientes.length > 0 && `${pendientes.length} ${pendientes.length === 1 ? 'Pincel con actividad quedó' : 'Pinceles con actividad quedaron'} por debajo del objetivo.`
  ].filter(Boolean) : [];
  return `
    ${indicadoresFeria([
      ['Ganancia feria', dineroFeria(ganancia)], ['Margen sobre ingresos', margen],
      ['Docenas equivalentes vendidas', cantidadFeria(docenas)],
      ['Egresos feria', dineroFeria(datos.egresos)]
    ])}
    <div class="informe-columnas">
      ${barrasFeria('Docenas por canal', [['Pinceles', datos.docPinceles], ['Misas', datos.docMisas]])}
      ${detalle ? `<section class="card feria-panel"><h2>Para revisar</h2>
        ${alertas.length ? `<ul class="feria-revisar">${alertas.map(texto => `<li>${escapeHTML(texto)}</li>`).join('')}</ul>`
          : `<p class="muted">${detalle.participantes.some(p => p.actividad)
            ? 'Los registros de Pinceles están al día.'
            : 'Todavía no hay actividad de Pinceles registrada.'}</p>`}</section>`
        : barrasFeria('Balance de la feria', [['Ingresos', datos.ingresos], ['Egresos', datos.egresos]], dineroFeria)}
    </div>`;
}

function ventasInformeFeria(datos, detalle) {
  const canales = barrasFeria('Docenas equivalentes por canal', [['Pinceles', datos.docPinceles], ['Misas', datos.docMisas]]);
  if (!detalle) return canales;
  const porTipo = Object.entries(detalle.tipos).filter(([tipo, v]) => tipo !== 'Otros' || docenasEquiv(v) > 0);
  return `
    ${indicadoresFeria([
      ['Docenas Pinceles retiradas', cantidadFeria(detalle.docRetiradas)],
      ['Docenas Pinceles por retirar', cantidadFeria(Math.max(0, detalle.docPinceles - detalle.docRetiradas))],
      ['Ventas Pinceles marcadas como pagadas', dineroFeria(detalle.importePagado)],
      ['Ventas Pinceles pendientes de pago', dineroFeria(detalle.importePendiente)]
    ])}
    <div class="informe-columnas">
      ${canales}
      ${barrasFeria('Pedidos de Pinceles por tipo', porTipo.map(([tipo, v]) => [
        `${tipo} · ${cantidadFeria(v.docenas)} enteras y ${cantidadFeria(v.medias)} medias`, docenasEquiv(v)
      ]))}
    </div>
    ${barrasFeria('Docenas de Pinceles por día de carga', detalle.porDia.map(([fecha, docenas]) => [
      fechaVisibleFeria(fecha), docenas
    ]), cantidadFeria, 'Todavía no hay ventas con fecha registrada.')}`;
}

function finanzasInformeFeria(datos, detalle, feria) {
  const docenas = docenasTotalesFeria(datos);
  const egresos = numeroFeria(datos.egresos);
  const rubros = Object.entries({
    super: 'Supermercado', carniceria: 'Carnicería', verduleria: 'Verdulería',
    limpieza: 'Limpieza', transporte: 'Transporte', otros: 'Otros'
  }).map(([clave, nombre]) => [nombre, datos.comprasMision?.[clave]]);
  return `
    ${indicadoresFeria([
      ['Ingresos registrados', dineroFeria(datos.ingresos)],
      ['Compras de feria', dineroFeria(egresos)],
      ['Ganancia feria', dineroFeria(datos.ganancia)],
      ['Costo feria por docena vendida', docenas > 0 && egresos !== null ? dineroFeria(egresos / docenas) : '—']
    ])}
    <div class="informe-columnas">
      ${detalle ? barrasFeria('Ingresos por origen', [
        ['Ventas Pinceles', detalle.ingresosPinceles], ['Ventas Misas', detalle.ingresosMisas], ['Donaciones', detalle.donaciones]
      ], dineroFeria) : barrasFeria('Balance de la feria', [['Ingresos', datos.ingresos], ['Egresos', datos.egresos]], dineroFeria)}
      ${barrasFeria('Compras de misión por rubro', rubros, dineroFeria, 'Sin gastos de misión archivados por rubro.')}
    </div>
    ${detalle ? barrasFeria('Gastos de feria por categoría', detalle.gastosFeria, dineroFeria, 'Todavía no hay compras de feria cargadas.') : ''}
    ${!detalle && feria.config ? `<details class="card feria-panel"><summary>Parámetros archivados</summary><p>${escapeHTML(feria.config)}</p></details>` : ''}`;
}

function pincelesInformeFeria(detalle) {
  if (!detalle) return '<p class="empty">Sin registros individuales para esta feria.</p>';
  const { participantes, config } = detalle;
  const activos = participantes.filter(p => p.actividad);
  const horas = participantes.reduce((total, p) => total + p.horas, 0);
  const objetivo = config.horasObjetivo;
  const cumplieron = activos.filter(p => p.horas + p.docenas >= objetivo).length;
  const pagaronMinimo = participantes.filter(p => p.minimoPagado).length;
  const ordenar = (campo) => (a, b) => b[campo] - a[campo] || a.nombre.localeCompare(b.nombre, 'es-AR');
  const destacados = campo => participantes.filter(p => p[campo] > 0).sort(ordenar(campo))
    .slice(0, 5).map(p => [p.nombre, p[campo]]);
  return `
    ${indicadoresFeria([
      ['Pinceles con actividad', `${activos.length} de ${participantes.length}`], ['Horas registradas', cantidadFeria(horas)],
      ['Objetivo cumplido (con actividad)', objetivo > 0 && activos.length ? `${cumplieron} de ${activos.length}` : '—'],
      ['Mínimos marcados como pagados', `${pagaronMinimo} de ${participantes.length}`]
    ])}
    <div class="informe-columnas">
      ${barrasFeria('Más docenas vendidas', destacados('docenas'), cantidadFeria, 'Todavía no hay ventas registradas.')}
      ${barrasFeria('Más horas registradas', destacados('horas'), cantidadFeria, 'Todavía no hay asistencia registrada.')}
    </div>
    <section class="card feria-panel">
      <h2>Detalle por Pincel</h2>
      ${objetivo > 0 ? `<p class="muted">Objetivo de ${cantidadFeria(objetivo)} puntos. Cada hora trabajada y cada docena vendida suman un punto.</p>` : ''}
      <div class="filtros-pinceles-feria">
        <div><label for="buscarPincelFeria">Buscar Pincel</label><input type="search" id="buscarPincelFeria" placeholder="Nombre"></div>
        <div><label for="ordenPincelFeria">Ordenar por</label><div class="selector-redondeado"><select id="ordenPincelFeria">
          <option value="nombre">Pincel (A–Z)</option><option value="docenas">Más docenas</option>
          <option value="horas">Más horas</option><option value="deudaVentas">Mayor deuda de ventas</option>
        </select></div></div>
      </div>
      <div id="participantesFeria"></div>
    </section>`;
}

function activarFiltrosPincelesFeria(main, { participantes, config }) {
  const buscar = main.querySelector('#buscarPincelFeria');
  const orden = main.querySelector('#ordenPincelFeria');
  const lista = main.querySelector('#participantesFeria');
  const clave = texto => claveNombre(texto).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const mostrar = () => {
    const filtro = clave(buscar.value);
    const campo = orden.value;
    const visibles = participantes.filter(p => clave(p.nombre).includes(filtro))
      .sort((a, b) => (campo === 'nombre' ? 0 : b[campo] - a[campo]) || a.nombre.localeCompare(b.nombre, 'es-AR'));
    lista.innerHTML = visibles.length ? visibles.map(p => {
      const objetivo = config.horasObjetivo;
      const puntos = p.docenas + p.horas;
      const estadoMinimo = p.minimoPagado ? 'Pagado' : 'Pendiente';
      const minimo = config.pagoMinimo > 0 ? `${dineroFeria(config.pagoMinimo)} · ${estadoMinimo}`
        : p.minimoPagado ? estadoMinimo : 'Sin mínimo asignado';
      const saldo = p.saldoAsignado > 0 ? `${dineroFeria(p.saldoAsignado)} · ${p.saldoPagado ? 'Pagado' : 'Pendiente'}` : 'Sin saldo asignado';
      return `<details class="pincel-feria">
        <summary><span>${escapeHTML(p.nombre)}</span><span>${cantidadFeria(p.docenas)} doc. · ${cantidadFeria(p.horas)} hs</span></summary>
        ${indicadoresFeria([
          ['Objetivo', objetivo > 0 ? `${cantidadFeria(puntos)} de ${cantidadFeria(objetivo)}` : '—'],
          ['Deuda por ventas', dineroFeria(p.deudaVentas)], ['Mínimo', minimo], ['Saldo post feria', saldo]
        ])}
      </details>`;
    }).join('') : '<p class="empty">No hay Pinceles para mostrar.</p>';
  };
  buscar.oninput = mostrar;
  orden.onchange = mostrar;
  mostrar();
}
