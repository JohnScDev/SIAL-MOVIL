# Mapeo de HU activas contra vistas web y móvil

Fecha de corte: 2026-08-20 (America/Bogota).

## Alcance y criterio

- Fuente de HU, estado, iteración y canal: Azure DevOps `banasanti / Proyecto SIAL`, consultado por REST/CLI autenticado.
- Ventana operativa: Sprint 12 actual y los dos sprints inmediatamente próximos, Sprint 13 y Sprint 14.
- HU activa: `Product Backlog Item` cuyo estado no es `Done` ni `Removed`.
- Fuente de cobertura UI: catálogos locales `SIAL Web - Propuesta` y `SIAL Movil - Propuesta`.
- `Sí`: existe una vista que cubre el flujo requerido.
- `Parcial`: existe apoyo o cobertura semántica, pero falta una vista requerida o trazabilidad explícita con el ID de la HU.
- `No aplica`: HU de despliegue, arquitectura, backend o proceso técnico sin pantalla propia.

## Resumen ejecutivo

| Resultado | HU | Cantidad |
| --- | --- | ---: |
| Cobertura suficiente para el canal requerido | 290, 659, 660, 826, 1491, 546, 547, 662, 669, 670, 681, 682 | 12 |
| Brecha de vista requerida | 337, 342, 344, 347, 350 | 5 |
| No requiere vista propia | 2232, 2237, 2238, 2239 | 4 |
| Total evaluado |  | 21 |

Brechas prioritarias:

1. HU337 necesita una vista web dedicada para generar/consultar POMA. La vista móvil existente genera una referencia POMA como parte de HU332, pero no implementa HU337 de forma trazable.
2. HU342, HU344 y HU347 tienen operación móvil, pero Azure también exige gestión y línea de tiempo web; no se encontró esa cobertura web.
3. HU350 tiene la ejecución móvil implementada semánticamente, pero carece de consulta/trazabilidad web y el archivo móvil no declara `HU350`.

## Sprint 12 — actual

Periodo: 2026-08-17 a 2026-08-28.

| HU | Estado | Canal según Azure | Vista web | Vista móvil | Resultado |
| --- | --- | --- | --- | --- | --- |
| [HU290](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/290) Gestión de aviso de corte | In Progress | Web; móvil solo si un rol operativo lo requiere | `Gestion de Planeacion/crear-aviso-corte.html` y gestión asociada | No requerida actualmente | Cubierta |
| [HU337](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/337) Generar documento POMA | In Progress | Web; apoyo móvil operativo | No encontrada | `pallets/cargar-pallets.html` solo genera una referencia POMA dentro de HU332 | **Brecha web; móvil parcial no trazable** |
| [HU342](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/342) Descargar pallets en ZE | In Progress | Web de gestión + móvil en campo | No encontrada | `puerto-ze/hu342-descarga-pallets.html` | **Brecha web** |
| [HU344](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/344) Rearmar pallets en ZE | In Progress | Web de gestión + móvil en campo | No encontrada | `pallets/rearmar-pallet.html` | **Brecha web** |
| [HU347](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/347) Cargue consolidado en ZE | Approved | Web de gestión + móvil en campo | No encontrada | `puerto-ze/hu347-cargue-consolidado.html` | **Brecha web** |
| [HU659](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/659) Pedido sugerido por finca | Approved | Web; consulta móvil opcional | `Materiales y Suministros/gestion-pedidos-materiales.html` | `materiales/pedido-sugerido.html` | Cubierta en ambos canales |
| [HU660](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/660) Ajustar pedido sugerido | Approved | Web; consulta móvil opcional | `Materiales y Suministros/ajustar-pedido-sugerido.html` | No requerida por el alcance actual | Cubierta web |
| [HU826](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/826) Gestionar materiales por referencia | Approved | Web | `Materiales y Suministros/gestion-materiales.html` | No requerida | Cubierta; falta declarar `HU826` en la vista/catálogo |
| [HU1491](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/1491) Disponibilidad de vehículos | In Progress | Web; móvil opcional | `Gestion de Transporte/disponibilidad-operativa.html` | No requerida actualmente | Cubierta; falta declarar `HU1491` en la vista/catálogo |
| [HU2232](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/2232) Despliegue piloto | In Progress | Despliegue web, móvil y backend ya existentes | Usa las vistas del flujo desplegado | Usa las vistas del flujo desplegado | No aplica vista nueva |

## Sprint 13 — próximo 1

Periodo: 2026-08-31 a 2026-09-11.

| HU | Estado | Canal según Azure | Vista web | Vista móvil | Resultado |
| --- | --- | --- | --- | --- | --- |
| [HU350](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/350) Despacho de ZE a Puerto | New | Móvil para ejecución; web para consulta/trazabilidad | No encontrada | `puerto-ze/despacho-puerto.html` | **Brecha web; móvil funcional sin etiqueta HU350** |
| [HU546](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/546) Orden de transporte de insumos | New | Web de gestión; móvil solo para hitos de campo | `Materiales y Suministros/ordenes-transporte-insumos.html` | Flujo posterior en `materiales/ordenes-asignadas.html` | Cubierta para el canal requerido |
| [HU547](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/547) Confirmar entrega en finca | New | Móvil para ejecución; web para seguimiento | `Materiales y Suministros/seguimiento-entregas.html` | `materiales/registrar-entrega.html` | Cubierta en ambos canales |
| [HU662](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/662) Consultar inventario en finca | New | Web; consulta móvil cuando el rol lo requiera | `Materiales y Suministros/inventario-materiales-finca.html` | `materiales/inventario-finca.html` | Cubierta en ambos canales |
| [HU2237](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/2237) Permisos y Guards con Redis | Approved | Backend/arquitectura | No aplica | No aplica | No requiere vista propia |
| [HU2238](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/2238) Transaccionalidad entre microservicios | New | Backend/arquitectura | No aplica | No aplica | No requiere vista propia |
| [HU2239](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/2239) ChangeLog | New | CI/CD y documentación | No aplica como pantalla de negocio | No aplica | No requiere vista propia |

## Sprint 14 — próximo 2

Periodo: 2026-09-14 a 2026-09-25.

| HU | Estado | Canal según Azure | Vista web | Vista móvil | Resultado |
| --- | --- | --- | --- | --- | --- |
| [HU669](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/669) Notificar despacho a transporte | New | Web de gestión; móvil si existe hito de campo | `Materiales y Suministros/ordenes-transporte-insumos.html` incluye estado y notificaciones | No requerida para emitir la notificación | Cubierta web |
| [HU670](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/670) Notificar al conductor | New | Web de gestión + móvil para el conductor | `Materiales y Suministros/ordenes-transporte-insumos.html` | `materiales/ordenes-asignadas.html` y `materiales/detalle-orden.html` | Cubierta en ambos canales |
| [HU681](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/681) Registrar entrega desde app móvil | New | Móvil para ejecución; web para seguimiento | `Materiales y Suministros/seguimiento-entregas.html` | `materiales/registrar-entrega.html` | Cubierta en ambos canales |
| [HU682](https://dev.azure.com/banasanti/Proyecto%20SIAL/_workitems/edit/682) Evidencia/firma como POD | New | Móvil para captura; web para consulta | `Materiales y Suministros/seguimiento-entregas.html` | `materiales/registrar-entrega.html` y `materiales/pod.html` | Cubierta en ambos canales |

## Correcciones de trazabilidad recomendadas

Estas correcciones no implican diseñar una vista nueva, pero evitan falsos negativos en futuros mapeos automáticos:

- Añadir `HU826` a `Materiales y Suministros/gestion-materiales.html` y a su entrada en `sial-catalogo.js`.
- Añadir `HU1491` a `Gestion de Transporte/disponibilidad-operativa.html` y a su entrada de catálogo.
- Añadir `HU350` a `puerto-ze/despacho-puerto.html`, al menú móvil y al mapa de flujo.
- Mantener en cada vista al menos una referencia estable `HU###` en título, metadato, encabezado o registro del catálogo.

## Iteraciones futuras fuera de la ventana inmediata

Azure también marca como futuras las iteraciones Sprint 15 a Sprint 22. Contienen 54 HU activas planificadas: Sprint 15 (4), Sprint 16 (4), Sprint 17 (4), Sprint 18 (3), Sprint 19 (16), Sprint 20 (4), Sprint 21 (4) y Sprint 22 (15). No se mezclan con esta matriz para conservar el foco en el sprint actual y los dos siguientes; deben auditarse en una segunda ventana antes de entrar en preparación.

## Conclusión operativa

Crear o completar vistas para HU337 web, HU342 web, HU344 web, HU347 web y HU350 web. Las demás HU de Sprint 12–14 tienen cobertura suficiente para el canal exigido o no requieren pantalla propia. Antes de abrir tareas UI en Azure, validar si las cinco brechas ya tienen tarea hija asignada para evitar duplicados.
