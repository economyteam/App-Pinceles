# Pinceles — versión ordenada
 
Frontend estático de Pinceles para Vercel, con Google Apps Script como API.

## Archivos

```text
pinceles/
├── index.html              # Estructura de la página y carga de scripts
├── logo.jpg                # Logo de Pinceles
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
│   ├── resultados.js       # Informes de ferias activas y archivadas
│   └── app.js              # Navegación y arranque de la aplicación
├── .gitignore              # Excluye la copia local del backend y sus pruebas
└── README.md
```

## Cómo subirlo a Vercel

1. Probá primero el Apps Script y el frontend contra una copia de la base.
2. Actualizá el despliegue de Apps Script de la app y verificá que responda a `SYNC` desde su misma URL `/exec`. Después podés publicar el frontend por GitHub. El backend también acepta el formato de guardado de la versión anterior de la web.
3. Para una importación nueva de Vercel, elegí `Other`/sitio estático sin comando de build ni carpeta de salida.

## Integración con Google Apps Script

La copia local de Apps Script se guarda en `apps-script/`, una carpeta ignorada por Git.

El backend usa las pestañas `VENTAS`, `ASISTENCIA`, `HISTORIAL`, `PINCELES` y `SISTEMA` del script original. Al archivar completa el encabezado de compras si está vacío y agrega `ID Operación` para identificar reintentos. Los informes nuevos se guardan en `FERIA_ESTADISTICAS`, que se crea automáticamente. El informe, el historial y la limpieza se guardan en una sola [actualización atómica de Sheets](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/batchUpdate).

1. Creá una copia de la planilla y abrí **Extensiones → Apps Script** desde esa copia. En Google se usa un solo archivo `Código.gs`. Para prepararlo manualmente, pegá en ese archivo el contenido de [calculos.js](js/calculos.js), `apps-script/OperacionesPinceles.gs` y `apps-script/Code.gs`, en ese orden y separados por una línea en blanco. El proyecto debe tener un único `doPost`.
2. En **Servicios** agregá **Google Sheets API** con el identificador `Sheets` y la versión `v4`. La misma dependencia está en el archivo local `apps-script/appsscript.json`. [Cómo habilitar servicios avanzados](https://developers.google.com/apps-script/guides/services/advanced)
3. En el editor ejecutá `configurarPlanillaPinceles` y aceptá los permisos que pida Google. Esa función toma el ID de la planilla abierta. Si el script es independiente de la planilla, configurá la propiedad de secuencia de comandos `PINCELES_SPREADSHEET_ID` con el ID de la copia.
4. Desplegá una aplicación web de prueba para esa copia. Para el frontend de prueba, usá su URL `/exec` como `SCRIPT_URL` en [js/config.js](js/config.js). Una respuesta de `SYNC` con `versionOperaciones: 1` confirma que el navegador está conectado al backend actualizado.
5. Probá el alta, dos pagos desde dos sesiones, el cierre de ventas, el inventario y el reinicio. Entrá a **Feria → Resultados** y abrí la feria archivada para verificar su informe. Para publicar, aplicá la misma configuración en el proyecto que usa la planilla real y asigná una nueva versión al despliegue existente. [Cómo actualizar un despliegue](https://developers.google.com/apps-script/concepts/deployments)

Las ferias que se archivaron antes de guardar informes detallados muestran los totales y los rubros de misión disponibles en el historial. Los informes nuevos guardan ventas agregadas, asistencia, pagos y avance por Pincel al momento del reinicio.

## Cambios frente al HTML original

- Separación de HTML, CSS, configuración, cálculos, API, interfaz común, pantallas de usuario y administración.
- Corrección del cálculo de ventas pendientes para usar los precios configurados, no precios viejos codificados.
- Evitar que valores numéricos legítimos de cero sean reemplazados por un valor predeterminado en cálculos.
- Protección de campos de texto al insertarlos en HTML (para evitar inyección de etiquetas o scripts).
- Validación básica de importes, cantidades, gastos, porcentaje y PIN al editar desde el navegador.
- Las escrituras desde **un mismo navegador** se encolan y se procesan en orden. Si falla un guardado, se intenta volver a consultar el servidor.
- Mejor manejo visible de algunos errores y ajustes de navegación en pantalla móvil.

## Límites importantes / trabajo pendiente

- El backend está implementado y probado con Sheets simulado. Quedan pendientes la prueba con una copia en Google y la publicación.
- **El PIN de EconomyTeam sigue en el código del navegador y no es una autorización real.** Cualquiera con acceso al sitio puede inspeccionar el JavaScript. La autenticación/autorización real y los controles de quién puede editar o borrar datos deben hacerse en el servidor, no solo en el frontend.
- La pantalla de *Ingresos* muestra ventas registradas, no necesariamente dinero efectivamente cobrado. Para un estado de caja real, hace falta modelar pagos y cobros por separado.
- Los cambios optimistas de interfaz no son confirmación bancaria; comprobá los pagos manualmente antes de dar cuentas por cerradas.

## Para probar localmente

En la carpeta `pinceles/` ejecutá:

```bash
python -m http.server 8000
```

Abrí `http://localhost:8000` en el navegador. Esto no modifica los datos hasta que se realice una acción desde la app; **la API sigue conectada al Google Apps Script real**.

> Recomendación: para pruebas que creen, editen o borren datos, apuntá primero a una copia de prueba del Apps Script y de la hoja de datos.

Las pruebas del backend también se guardan de forma local. Con la copia de `apps-script/` y los archivos de prueba en `tests/`, ejecutá `node --test tests/*.test.cjs` para probar contra una planilla simulada.
