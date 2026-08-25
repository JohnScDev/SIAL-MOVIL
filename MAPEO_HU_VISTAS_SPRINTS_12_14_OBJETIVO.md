# Mapeo objetivo de HU activas contra vistas web y móvil

Fecha de corte: 2026-08-21 (America/Bogota)

## Alcance

Se revisaron por CLI/REST autenticado las HU activas de `Proyecto SIAL` en el Sprint 12 (actual), Sprint 13 y Sprint 14 (próximos). Se contrastó el canal declarado en Azure con los catálogos locales:

- `SIAL Web - Propuesta`
- `SIAL Movil - Propuesta`

Se evaluó la necesidad de la vista según el rol y el paso operativo, no por simetría de plataformas.

## Criterio de decisión

- **Web requerida:** planeación, maestros, configuración, gestión administrativa, consulta y trazabilidad para coordinador/supervisor.
- **Móvil requerida:** ejecución en finca, ZE, ruta o entrega; captura de escaneo, evidencia, firma, ubicación u operación offline.
- **Ambas requeridas:** la misma HU tiene una responsabilidad de ejecución móvil y otra de consulta/gestión web. No significa duplicar el formulario.
- **Complementaria:** la plataforma aporta consulta o seguimiento útil, pero Azure no exige que la operación se ejecute allí.
- **No aplica:** despliegue, backend, seguridad, transaccionalidad o auditoría técnica sin pantalla de negocio.
- **Cobertura suficiente:** existe una vista funcional para el canal requerido. La ausencia de `HU###` en el título o catálogo se reporta aparte como trazabilidad, no como ausencia de vista.

## Resumen ejecutivo

| Resultado | HUs | Cantidad |
| --- | --- | ---: |
| Cobertura suficiente sin decisión adicional | 290, 337, 546, 547, 659, 660, 662, 669, 670, 681, 682, 826, 1491 | 13 |
| Cobertura existente, pero requiere decisión sobre captura web transaccional | 342, 344, 347, 350 | 4 |
| Sin vista de negocio propia | 2232, 2237, 2238, 2239 | 4 |
| HU evaluadas | 290, 337, 342, 344, 347, 350, 546, 547, 659, 660, 662, 669, 670, 681, 682, 826, 1491, 2232, 2237, 2238, 2239 | 21 |

> Las cuatro HU de ZE/Puerto aparecen en ambos renglones porque tienen ejecución móvil cubierta y trazabilidad web existente, pero el catálogo no evidencia un formulario web independiente para registrar el evento. Esto no se considera una brecha confirmada hasta que producto defina que el supervisor debe capturarlo también desde web.

## Sprint 12 — actual (2026-08-17 a 2026-08-28)

| HU | Estado | Canal de Azure | Vista web encontrada | Vista móvil encontrada | Resultado objetivo |
| --- | --- | --- | --- | --- | --- |
| [HU290](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/290) Gestión de aviso de corte | In Progress | Web; consulta móvil solo si el rol lo requiere | `Gestion de Planeacion/crear-aviso-corte.html`, gestión y consulta de avisos | No necesaria para crear/publicar el aviso | Cubierta en web; no hay brecha móvil |
| [HU337](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/337) Generar documento POMA | In Progress | Web; consulta móvil opcional | `Trazabilidad/generar-documento-poma.html`, `documento-poma.html`, auditoría y `HU337-mapa-datos-poma.md` | El flujo móvil aporta datos/evidencias previas, no necesita generar el POMA | Cubierta en web; el resultado anterior “sin web” era falso |
| [HU342](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/342) Descargar pallets en ZE | In Progress | Web de gestión + móvil si ocurre en campo | `Gestion Operaciones Puerto/trazabilidad-pallets.html`, gestión de contenedores y auditoría para consulta/seguimiento | `puerto-ze/hu342-descarga-pallets.html` | Cubierta: móvil ejecuta; web consulta/traza. Captura web transaccional queda por decidir |
| [HU344](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/344) Rearmar pallets en ZE | In Progress | Web de gestión + móvil si ocurre en campo | Trazabilidad web de pallets/operación; no hay formulario web HU344 explícito | `pallets/rearmar-pallet.html` | Cubierta para el flujo operativo; decidir solo si se requiere registrar el rearme desde web |
| [HU347](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/347) Cargue del contenedor final consolidado ZE | Approved | Web de gestión + móvil si ocurre en campo | Trazabilidad de pallets, contenedores y eventos de cargue | `puerto-ze/hu347-cargue-consolidado.html` | Cubierta para ejecución y seguimiento; no abrir brecha web sin decisión de captura duplicada |
| [HU659](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/659) Generar pedido sugerido por finca | Approved | Web; consulta móvil opcional | `Materiales y Suministros/gestion-pedidos-materiales.html`, `sial-pedido-sugerido.js` | `materiales/pedido-sugerido.html` como apoyo de consulta | Cubierta en web; móvil es complementaria |
| [HU660](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/660) Ajustar y validar cantidades | Approved | Web; consulta móvil opcional | `Materiales y Suministros/ajustar-pedido-sugerido.html` | No requerida por el alcance de la HU | Cubierta en web; no hay brecha móvil |
| [HU826](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/826) Gestionar materiales por referencia | Approved | Web; consulta móvil opcional | `Materiales y Suministros/gestion-materiales.html` | No requerida | Cubierta en web; falta etiqueta HU826 en catálogo |
| [HU1491](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/1491) Vehículos disponibles/no disponibles | In Progress | Web; móvil opcional | `Gestion de Transporte/disponibilidad-operativa.html` y dashboard de transporte | No requerida actualmente | Cubierta en web; falta etiqueta HU1491 en catálogo |
| [HU2232](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/2232) Despliegue piloto de Inspección y Trazabilidad | In Progress | Despliega componentes existentes web, móvil y backend | Reutiliza las vistas web del flujo | Reutiliza las vistas móviles, offline y sincronización | No requiere vista nueva |

## Sprint 13 — próximo (2026-08-31 a 2026-09-11)

| HU | Estado | Canal de Azure | Vista web encontrada | Vista móvil encontrada | Resultado objetivo |
| --- | --- | --- | --- | --- | --- |
| [HU350](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/350) Despacho de ZE a Puerto | New | Móvil para ejecución/captura; web para consulta, trazabilidad y gestión | `Gestion Operaciones Puerto/trazabilidad-pallets.html`, eventos de despacho y auditoría | `puerto-ze/despacho-puerto.html` | Cubierta por canales; falta etiqueta HU350 en el flujo móvil y confirmar si web debe editar el evento |
| [HU546](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/546) Orden de transporte de insumos | New | Web de gestión + móvil si el evento ocurre en campo | `Materiales y Suministros/ordenes-transporte-insumos.html` | `materiales/ordenes-asignadas.html` y `detalle-orden.html` como apoyo al transportador | Cubierta; web es el canal de gestión y móvil el de campo |
| [HU547](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/547) Confirmar entrega de insumos en finca | New | Móvil para ejecución/captura; web para consulta y trazabilidad | `Materiales y Suministros/seguimiento-entregas.html` | `materiales/registrar-entrega.html` | Cubierta en ambos canales, sin duplicar la captura |
| [HU662](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/662) Consultar inventario/stock en finca | New | Web; consulta móvil si el rol lo requiere | `Materiales y Suministros/inventario-materiales-finca.html` | `materiales/inventario-finca.html` | Cubierta en web; móvil complementaria, no obligatoria |
| [HU2237](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/2237) Permisos y Guards con Redis | Approved | Backend/seguridad | No aplica | No aplica | Sin vista de negocio propia |
| [HU2238](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/2238) Transaccionalidad TX con Prisma | New | Backend/arquitectura | No aplica | No aplica | Sin vista de negocio propia |
| [HU2239](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/2239) ChangeLog | New | Trazabilidad técnica/entrega | No aplica como pantalla operativa | No aplica | Sin vista de negocio propia |

## Sprint 14 — próximo (2026-09-14 a 2026-09-25)

| HU | Estado | Canal de Azure | Vista web encontrada | Vista móvil encontrada | Resultado objetivo |
| --- | --- | --- | --- | --- | --- |
| [HU669](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/669) Notificar despacho a transporte | New | Web de gestión + móvil si ocurre en campo | `Materiales y Suministros/ordenes-transporte-insumos.html` registra estado, notificación y reenvío | No necesaria para emitir la notificación | Cubierta en web; móvil solo complementaria |
| [HU670](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/670) Notificar al conductor asignado | New | Web de gestión + móvil si ocurre en campo | Vista de órdenes y asignaciones | `materiales/ordenes-asignadas.html`, `detalle-orden.html` | Cubierta en ambos canales, con responsabilidades distintas |
| [HU681](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/681) Registrar entrega desde app móvil | New | Móvil para ejecución/captura; web para seguimiento | `Materiales y Suministros/seguimiento-entregas.html` | `materiales/registrar-entrega.html` | Cubierta en ambos canales |
| [HU682](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/682) Foto/firma como POD | New | Móvil para captura; web para consulta y trazabilidad | `Materiales y Suministros/seguimiento-entregas.html` y `pod.html` | `materiales/registrar-entrega.html`, `materiales/pod.html` | Cubierta en ambos canales |

## Acciones reales que se desprenden del mapeo

Estas acciones son de trazabilidad o definición, no cinco nuevas vistas:

1. Etiquetar explícitamente `HU350` en `puerto-ze/despacho-puerto.html`, el menú y el mapa de flujo móvil.
2. Etiquetar `HU826` en `gestion-materiales.html` y su entrada de `sial-catalogo.js`.
3. Etiquetar `HU1491` en `disponibilidad-operativa.html` y su entrada de catálogo.
4. Asociar en el catálogo web las vistas de trazabilidad ZE/Puerto con HU342, HU344, HU347 y HU350 para que un mapeo automático no las reporte como ausentes.
5. Tomar una decisión de producto —no asumirla— sobre si el supervisor debe **registrar** desde web los eventos HU342/HU344/HU347/HU350. Azure exige web de gestión/consulta, pero las propuestas actuales concentran la captura física en móvil.

## Conclusión

No hay una brecha confirmada que justifique crear cinco vistas web nuevas. La cobertura actual sigue el flujo: web para planear, configurar, asignar y consultar; móvil para ejecutar en campo y capturar evidencia. Las únicas pendientes objetivas son mejorar la relación HU–vista y decidir explícitamente si la gestión web de ZE/Puerto debe ser solo seguimiento o también captura transaccional.
