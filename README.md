# Pinceles

Pinceles registra ventas, pagos, retiros y asistencia de la feria. El sitio se publica en Vercel y guarda los datos en Google Sheets mediante Google Apps Script.

## Feria

- **Ventas.** EconomyTeam puede cerrar y reabrir las ventas de los Pinceles. Durante el cierre, cada Pincel puede eliminar sus pedidos y marcar pagos y retiros. Las altas y ediciones de pedidos quedan bloqueadas hasta la reapertura.
- **Control de docenas.** Las listas de crudas y cocidas muestran primero a quienes tienen docenas o medias pendientes. Cuando un Pincel queda en **¡Listo!**, pasa al final de esa lista. Si deshacés un descuento, vuelve al grupo de pendientes.
- **Resultados.** Podés consultar la feria actual y comparar ferias archivadas. Al archivar la misión se guarda un informe con ventas, pagos y asistencia por Pincel. Las ferias archivadas sin informe detallado muestran el resumen disponible en el historial. Los ingresos incluyen las ventas registradas aunque estén pendientes de pago.

## Probar en local

Desde la raíz del repositorio, levantá el sitio con Python y abrí <http://127.0.0.1:8000>.

```sh
python -m http.server 8000 --bind 127.0.0.1
```

El sitio local usa el `SCRIPT_URL` de [js/config.js](js/config.js). Para probar guardados, prepará un despliegue de Apps Script vinculado a una copia de la planilla y poné su URL `/exec` en esa configuración.

Con los archivos locales del backend y sus pruebas, podés probar los guardados con una planilla simulada.

```sh
node --test tests/operaciones.test.cjs tests/planilla.test.cjs
```

## Configurar Google Apps Script

La copia del backend en `apps-script/` y sus pruebas están ignoradas por Git. Necesitás esos archivos locales para preparar y probar cambios del backend.

1. Desde la planilla que se va a usar, abrí **Extensiones → Apps Script**.
2. Pegá en `Código.gs` el contenido de [js/calculos.js](js/calculos.js), `apps-script/OperacionesPinceles.gs` y `apps-script/Code.gs`, en ese orden y separados por una línea en blanco. El proyecto debe tener un único `doPost`.
3. En **Servicios**, agregá **Google Sheets API** versión `v4` con el identificador `Sheets`. [Servicios avanzados de Google](https://developers.google.com/apps-script/guides/services/advanced?hl=es-419)
4. En el proyecto vinculado a la planilla, ejecutá `configurarPlanillaPinceles` y concedé los permisos que pide Google. La función prepara las pestañas y registra qué planilla usa el proyecto. Si usás un proyecto independiente con una planilla ya preparada, guardá el ID de esa planilla en la propiedad `PINCELES_SPREADSHEET_ID`.
5. Para un entorno nuevo, creá una implementación de tipo **App web** y copiá su URL `/exec`. Configurá el acceso en Apps Script. El PIN de EconomyTeam solo se valida en el navegador. [Apps web de Google Apps Script](https://developers.google.com/apps-script/guides/web?hl=es-419)

## Publicar cambios

1. Probá los cambios con la copia de la planilla. Para verificar el cierre, eliminá un pedido de prueba con las ventas cerradas y comprobá que agregar y editar sigan bloqueados.
2. Si cambió el backend, guardá el código en el proyecto de Apps Script de producción. En **Implementar → Administrar implementaciones**, editá la implementación activa y publicá una versión nueva para conservar su URL `/exec`. [Actualizar una implementación de Apps Script](https://developers.google.com/apps-script/concepts/deployments?hl=es-419)
3. Verificá que [js/config.js](js/config.js) apunte a la URL de producción y subí los cambios del sitio a la rama conectada a Vercel. Para una primera importación, elegí **Other**, usá la raíz del repositorio, dejá vacío el comando de build y conservá el directorio de salida predeterminado. [Sitios estáticos en Vercel](https://vercel.com/docs/builds#skipping-the-build-step)
