# Pinceles — versión ordenada

Frontend de Pinceles, sin frameworks ni dependencias de Node. Se puede publicar directamente en **Vercel (sitio estático)** y conserva el mismo Google Apps Script como API.

## Archivos

```text
pinceles/
├── index.html              # Estructura de la página y carga de scripts
├── logo.jpg                # Copialo de tu proyecto anterior; NO incluido en este ZIP
├── css/
│   └── styles.css          # Diseño visual
├── js/
│   ├── config.js           # URL del Apps Script, valores iniciales y receta
│   ├── state.js            # Estado temporal de la interfaz
│   ├── api.js              # Comunicación y sincronización con Google
│   ├── calculos.js         # Cálculos de dinero, ventas y compras
│   ├── shared.js           # Utilidades y componentes comunes
│   ├── pincel.js           # Ventas, asistencias y pagos de cada participante
│   ├── economia.js         # Panel de administración EconomyTeam
│   └── app.js              # Navegación y arranque de la aplicación
└── README.md
```

## Cómo subirlo a Vercel

1. Hacé una copia de seguridad de tu repositorio actual.
2. Descomprimí el ZIP y copiá **los archivos y carpetas dentro de `pinceles/` a la raíz del repositorio** donde estaba `index.html`.
3. **Conservá `logo.jpg`** de tu repositorio actual, en la misma raíz que `index.html`. No fue adjuntado para esta refactorización y no está en el ZIP.
4. Subí los cambios al mismo repositorio de GitHub, por ejemplo mediante un commit. Si el proyecto está conectado a Vercel, el deploy se dispara normalmente al hacer push a la rama configurada.
5. Para una importación nueva, elegí `Other`/sitio estático sin comando de build ni carpeta de salida. No necesitás `package.json`, `npm install`, ni un plan pago.
6. Probá iniciar sesión, cargar y editar una venta, registrar un pago, marcar asistencia y consultar EconomyTeam **en una copia de prueba antes de usarlo con registros reales**.

Si conservás el proyecto existente y solo cambiás estos archivos, la dirección pública y el backend de Google Apps Script se mantienen.

## Cambios frente al HTML original

- Separación de HTML, CSS, configuración, cálculos, API, interfaz común, pantallas de usuario y administración.
- Corrección del cálculo de ventas pendientes para usar los precios configurados, no precios viejos codificados.
- Evitar que valores numéricos legítimos de cero sean reemplazados por un valor predeterminado en cálculos.
- Protección de campos de texto al insertarlos en HTML (para evitar inyección de etiquetas o scripts).
- Validación básica de importes, cantidades, gastos, porcentaje y PIN al editar desde el navegador.
- Las escrituras desde **un mismo navegador** se encolan y se procesan en orden. Si falla un guardado, se intenta volver a consultar el servidor.
- Mejor manejo visible de algunos errores y ajustes de navegación en pantalla móvil.

## Límites importantes / trabajo pendiente

- **No se modificó el Google Apps Script**, ya que no forma parte del HTML adjunto. La compatibilidad con su respuesta y las reglas del servidor debe verificarse con una copia de prueba.
- **El PIN de EconomyTeam sigue en el código del navegador y no es una autorización real.** Cualquiera con acceso al sitio puede inspeccionar el JavaScript. La autenticación/autorización real y los controles de quién puede editar o borrar datos deben hacerse en el servidor, no solo en el frontend.
- **Si dos celulares modifican registros a la vez, todavía puede haber conflictos.** Para resolverlos de verdad hace falta validar y usar bloqueos/operaciones atómicas en Apps Script (por ejemplo LockService), además de evitar sobrescrituras de objetos compartidos.
- La pantalla de *Ingresos* muestra ventas registradas, no necesariamente dinero efectivamente cobrado. Para un estado de caja real, hace falta modelar pagos y cobros por separado.
- Los cambios optimistas de interfaz no son confirmación bancaria; comprobá los pagos manualmente antes de dar cuentas por cerradas.

## Para probar localmente

En la carpeta `pinceles/` ejecutá:

```bash
python -m http.server 8000
```

Abrí `http://localhost:8000` en el navegador. Esto no modifica los datos hasta que se realice una acción desde la app; **la API sigue conectada al Google Apps Script real**.

> Recomendación: para pruebas que creen, editen o borren datos, apuntá primero a una copia de prueba del Apps Script y de la hoja de datos.
