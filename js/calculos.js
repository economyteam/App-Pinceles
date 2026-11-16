/* Reglas de negocio independientes de la interfaz y de Google Apps Script.
   Una sola fuente para importes, compras, liquidaciones e informes. */
const Calculos = Object.freeze({
  importeVenta(venta, config = DEFAULT_CONFIG) {
    const docenas = Math.max(0, Number(venta.docenas) || 0);
    const medias = Math.max(0, Number(venta.medias) || 0);
    return docenas * (Number(config.valorDocena ?? DEFAULT_CONFIG.valorDocena))
         + medias * (Number(config.valorMediaDocena ?? DEFAULT_CONFIG.valorMediaDocena));
  },
  totalPendiente(ventas, config = DEFAULT_CONFIG) {
    return ventas.filter(v => v.estado === 'Falta Pagar')
      .reduce((total, venta) => total + Calculos.importeVenta(venta, config), 0);
  },
  montoLiquidacion(config, horas, docenas) {
    const objetivo = Number(config.horasObjetivo ?? DEFAULT_CONFIG.horasObjetivo);
    const valorHora = Number(config.valorHora ?? DEFAULT_CONFIG.valorHora);
    const solidario = Number(config.porcentajeSolidario ?? DEFAULT_CONFIG.porcentajeSolidario);
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
  resumenFinanciero(ventas, misas, receta, config = DEFAULT_CONFIG) {
    const ingresosPinceles = ventas.reduce((total, venta) => total + Calculos.importeVenta(venta, config), 0);
    const ingresosMisas = Calculos.importeVenta(misas, config);
    const donaciones = Number(misas.donaciones) || 0;
    const egresos = receta.reduce((total, item) => total + (Number(item.gasto) || 0), 0);
    const ingresos = ingresosPinceles + ingresosMisas + donaciones;
    return { ingresosPinceles, ingresosMisas, donaciones, egresos, ingresos, ganancia: ingresos - egresos };
  }
});
