# Decisión — Inspecciones ZE con selección rápida

## Alcance y trazabilidad

- **HU → módulo:** HU557 / HU558 → `puerto-ze`.
- **Acción → vistas:** finalizar inspección externa e interna ZE → `puerto-ze/inspeccion-externa.html` y `puerto-ze/inspeccion-interna.html`.
- **Componentes:** `sial-checkpoint`, `sial-cp-options`, captura de evidencia, captura individual de etiquetas, resultado y `sial-confirmation-card`.
- **Evidencia:** la inspección externa ya tenía la secuencia completa; la solicitud actual pide terminarla y replicarla en interna ZE. La imagen adjunta evidencia el problema visual: los puntos se presentan como desplegable.

## Alternativas

### A — conservadora

Mantener la estructura, tokens, nueve puntos, estados `Pendiente`/`Verificado`/`No aplica`, sello manual, escáner individual, daño, deduplicación, resultado, observaciones y confirmación existentes. Exponer únicamente las acciones `Verificado` y `No aplica` como botones rápidos en cada fila y retirar el montaje dinámico del selector compacto. Replicar la misma composición en interna ZE.

### B — dos acciones con estado implícito (descartada)

Mantener solo `Verificado` y `No aplica`, interpretando dos botones neutrales como `Pendiente`. Se descarta porque la revisión solicitó que el estado quedara explícito.

### C — evolutiva seleccionada

Usar un selector segmentado de tres estados siempre visible con `Pendiente`, `Verificado` y `No aplica`, integrado en la misma fila del punto. El estado queda expresado por el botón activo y se evita una etiqueta de estado duplicada.

## Decisiones de interacción

1. Los puntos permanecen juntos, sin desplegable. Cada fila muestra un selector explícito de tres estados: `Pendiente`, `Verificado` y `No aplica`; no se repite el estado en un chip separado.
2. El tipo de etiqueta es contextual a la vista: externa ZE registra `EXTERNA` e interna ZE registra `INTERNA`. Se elimina el selector redundante; el resumen y el contexto explicitan el tipo.
3. Interna ZE adopta la secuencia `evidencia → puntos → sello/dispositivo → etiquetas → resultado/observaciones → confirmación`, con los nueve puntos disponibles por no existir un catálogo interno separado en la fuente entregada. Esto es una suposición declarada y debe contrastarse si aparece un formato específico de inspección interna.
4. La persistencia de puntos, sello y etiquetas sigue siendo `proposal-only` / `pending-persistence`; no se presenta como DTO ni se realizan cambios backend.

## Validación y riesgos

- Validar que el click de cada punto actualice su estado, el campo oculto y la persistencia local del prototipo.
- Validar que las lecturas de cada vista queden tipadas por contexto, admitan daño y rechacen duplicados.
- Validar visualmente a 390 px y en escritorio de revisión que no exista control desplegable de puntos.
- Riesgo funcional: los nueve puntos se replican por solicitud explícita, pero el formato interno específico podría requerir nombres diferentes.
