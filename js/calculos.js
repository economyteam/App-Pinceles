/* Reglas de negocio independientes de la interfaz y de Google Apps Script.
   Una sola fuente para importes, compras, liquidaciones e informes. */
const PARAMETROS_FERIA = Object.freeze({
  pagoMinimo: 18000, horasObjetivo: 17, porcentajeSolidario: 40,
  valorHora: 7000, valorDocena: 16000, valorMediaDocena: 9000
});

const Calculos = Object.freeze({
  importeVenta(venta, config = PARAMETROS_FERIA) {
    const docenas = Math.max(0, Number(venta.docenas) || 0);
    const medias = Math.max(0, Number(venta.medias) || 0);
    return docenas * Number(config.valorDocena ?? PARAMETROS_FERIA.valorDocena)
         + medias * Number(config.valorMediaDocena ?? PARAMETROS_FERIA.valorMediaDocena);
  },
  totalPendiente(ventas, config = PARAMETROS_FERIA) {
    return ventas.filter(v => v.estado === 'Falta Pagar')
      .reduce((total, venta) => total + Calculos.importeVenta(venta, config), 0);
  },
  montoLiquidacion(config, horas, docenas) {
    const objetivo = Number(config.horasObjetivo ?? PARAMETROS_FERIA.horasObjetivo);
    const valorHora = Number(config.valorHora ?? PARAMETROS_FERIA.valorHora);
    const solidario = Number(config.porcentajeSolidario ?? PARAMETROS_FERIA.porcentajeSolidario);
    const faltante = objetivo - Number(horas) - Number(docenas);
    return Math.max(0, Math.round(faltante * valorHora * solidario / 100));
  },
  cantidadComprar(item, docenasCocinar) {
    const requeridas = item.fixed !== undefined
      ? Number(item.fixed)
      : item.c50 !== undefined && item.c50 !== null
        ? (Number(item.c50) / 50) * Number(docenasCocinar)
        : null;
    if (requeridas === null) return null;
    return Math.max(0, Math.round((requeridas - (Number(item.stock) || 0)) * 100) / 100);
  },
  resumenFinanciero(ventas, misas, receta, config = PARAMETROS_FERIA) {
    const ingresosPinceles = ventas.reduce((total, venta) => total + Calculos.importeVenta(venta, config), 0);
    const ingresosMisas = Calculos.importeVenta(misas, config);
    const donaciones = Number(misas.donaciones) || 0;
    const egresos = receta.reduce((total, item) => total + (Number(item.gasto) || 0), 0);
    const ingresos = ingresosPinceles + ingresosMisas + donaciones;
    return { ingresosPinceles, ingresosMisas, donaciones, egresos, ingresos, ganancia: ingresos - egresos };
  },
  docenasEquivalentes({ docenas, medias }) {
    return (Number(docenas) || 0) + (Number(medias) || 0) * 0.5;
  },
  estadisticasFeria(datos, diaLocal) {
    const {
      ventas = [], asistencia = [], pinceles = [], receta = [], ventasMisas = {},
      minimoPagos = {}, postFeriaPagos = {}, deudaAsignada = {}, comprasMision = {}
    } = datos;
    const config = Object.fromEntries(Object.entries(PARAMETROS_FERIA).map(([campo, defecto]) => {
      const valor = datos.config?.[campo];
      return [campo, valor != null && valor !== '' && Number.isFinite(Number(valor)) ? Number(valor) : defecto];
    }));
    const personas = new Map();
    const persona = nombre => {
      if (!personas.has(nombre)) personas.set(nombre, { nombre, docenas: 0, horas: 0, deudaVentas: 0 });
      return personas.get(nombre);
    };
    const porDia = new Map();
    const tipos = { Crudas: { docenas: 0, medias: 0 }, Cocidas: { docenas: 0, medias: 0 }, Otros: { docenas: 0, medias: 0 } };
    let docPinceles = 0, docRetiradas = 0, importePagado = 0, importePendiente = 0;
    for (const venta of ventas) {
      const docenas = Math.max(0, Number(venta.docenas) || 0);
      const medias = Math.max(0, Number(venta.medias) || 0);
      const cantidad = Calculos.docenasEquivalentes({ docenas, medias });
      const tipo = venta.tipo === 'Crudas' || venta.tipo === 'Cocidas' ? tipos[venta.tipo] : tipos.Otros;
      tipo.docenas += docenas;
      tipo.medias += medias;
      docPinceles += cantidad;
      if (venta.pincel) persona(venta.pincel).docenas += cantidad;
      if (venta.retirado === true) docRetiradas += cantidad;
      const importe = Calculos.importeVenta(venta, config);
      if (venta.estado === 'Pagado') importePagado += importe;
      if (venta.estado === 'Falta Pagar') {
        importePendiente += importe;
        if (venta.pincel) persona(venta.pincel).deudaVentas += importe;
      }
      const fecha = venta.fecha && new Date(venta.fecha);
      if (fecha && Number.isFinite(fecha.getTime()) && cantidad > 0) {
        const dia = /^\d{4}-\d{2}-\d{2}$/.test(venta.fecha) ? venta.fecha : diaLocal(fecha);
        porDia.set(dia, (porDia.get(dia) || 0) + cantidad);
      }
    }
    for (const registro of asistencia) {
      if (registro.pincel) persona(registro.pincel).horas += Math.max(0, Number(registro.horas) || 0);
    }
    const registrados = new Set([...pinceles, ...Object.keys(minimoPagos), ...Object.keys(deudaAsignada), ...Object.keys(postFeriaPagos)]);
    for (const nombre of registrados) if (nombre) persona(nombre);
    const abonado = pago => /^(true|1|s[ií])$/i.test(String(pago?.pagado ?? '').trim());
    const participantes = [...personas.values()].map(datosPincel => {
      const { nombre, horas, docenas } = datosPincel;
      const minimoPagado = abonado(minimoPagos[nombre]);
      const saldoPagado = abonado(postFeriaPagos[nombre]);
      const saldoAsignado = Math.max(0, Number(deudaAsignada[nombre]) || 0);
      return {
        ...datosPincel, minimoPagado, saldoPagado, saldoAsignado,
        actividad: horas > 0 || docenas > 0 || minimoPagado || saldoAsignado > 0 || saldoPagado
      };
    });
    const gastosFeria = new Map();
    for (const item of receta) {
      const categoria = item.cat || 'Otros';
      gastosFeria.set(categoria, (gastosFeria.get(categoria) || 0) + (Number(item.gasto) || 0));
    }
    return {
      ...Calculos.resumenFinanciero(ventas, ventasMisas, receta, config),
      docPinceles, docMisas: Calculos.docenasEquivalentes(ventasMisas),
      docRetiradas, importePagado, importePendiente, tipos,
      porDia: [...porDia].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0),
      gastosFeria: [...gastosFeria], comprasMision, config, participantes
    };
  }
});
