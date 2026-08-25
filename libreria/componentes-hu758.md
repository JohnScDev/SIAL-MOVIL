# Componentes promovidos · HU758

Estado: **referencia canónica de composición para captura móvil**  
Origen: `puerto-ze/recepcion-ze.html`  
Plataforma: mobile

## Propósito

Consolidar los patrones calibrados en Recepción en ZE para que las siguientes HUs puedan reutilizar la misma jerarquía sin copiar estilos locales.

## Inventario

| Componente | Rol | Estados mínimos | Regla de uso |
| --- | --- | --- | --- |
| `sial-operation-ticket` | Operación y contenedor (sincronización solo si la vista la exige) | datos presentes, vacío, truncado | Presentar solo los datos de contexto que la tarea necesita; no agregar un rótulo de contexto redundante ni estados no visibles en la fuente de verdad. |
| `sial-section-heading` + `sial-section-icon` | Identificar visualmente una sección | normal, foco, modo oscuro | Usar un icono semántico junto al título; el icono no reemplaza el texto. |
| `sial-confirmation-card` | Separar la revisión y la acción primaria | revisión, error inline, envío | Ubicarlo como bloque hermano al final del formulario; no anidarlo dentro de otra card. |
| `sial-select-control` | Selección contextual | cerrado, abierto, seleccionado, foco, teclado | Mantener el menú acoplado al trigger y conservar un `select` funcional como contrato. |
| `sial-datetime-control` | Fecha/hora de captura | cerrado, abierto, semana anterior/siguiente, Hoy, futuro bloqueado | Mostrar una semana navegable; la semana inicial corresponde a la fecha seleccionada. |

## Regla de cierre para la familia de captura HU758/HU759

Toda vista móvil de captura que termine en una acción de registro debe cerrar con la siguiente composición:

`formulario de captura` → `sial-confirmation-card hermana` → `texto breve de verificación` → `un único botón primario full-width`.

La card no se anida dentro del formulario ni dentro de otra card. El botón conserva la validación y el submit del formulario mediante `form="<form-id>"`. No se agrega un segundo botón primario, un círculo interno ni una sección automática de Trazabilidad después del CTA en esta familia. Este contrato no se impone a consultas, dashboards, listados ni otras familias; una vista diferente debe registrar su propia composición.

## Patrones de composición identificados

- El resumen operativo solo muestra datos que la HU y el flujo actual respaldan; la sincronización es opcional, no decorativa.
- Los encabezados de sección usan icono semántico a la izquierda y título en la misma fila; el texto puede envolver, el icono no se desplaza a una fila independiente.
- Los inputs de texto conservan el control base neutral. Solo selects y fecha/hora reciben una capa especializada de interacción.
- El select conserva un elemento funcional como fuente de valor y acopla el menú al trigger.
- El selector de fecha/hora no duplica título ni icono dentro del control; muestra el valor, permite navegar la semana sin cerrar el popover y respeta restricciones de fecha.
- La propuesta se limita a los campos y estados evidenciados por el backend; no se agregan checklists, evidencias o estados simulados por intención visual.

## Evidencia de origen

- HU: `HU758 · Registrar llegada de vehículo`.
- Vista: `puerto-ze/recepcion-ze.html`.
- Decisión: `.sial-design-map/runs/20260825-hu758-mobile/decision.md`.
- Validación visual: `output/playwright/hu758-separated-confirmation.png`.

## Promoción

La sección **Componentes promovidos · HU758** en `libreria/index.html` se genera desde `sial-mobile-library.js` y muestra los estados visuales de ticket, encabezado, selección, semana y confirmación. La librería funciona como catálogo y contrato de reutilización; la extracción de los componentes interactivos a `shared/` queda como siguiente paso de implementación cuando se apruebe su uso transversal.
