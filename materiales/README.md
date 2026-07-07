# Materiales y Suministros Movil - Propuesta SIAL

Flujo movil para consultar pedidos sugeridos, stock por finca, ordenes asignadas, entrega efectiva y POD.

## Historias cubiertas

- `HU659`: pedido sugerido visible para finca/productor.
- `HU662`: inventario o stock disponible en finca.
- `HU670`: orden asignada visible para conductor o transportista.
- `HU681`: registro de entrega efectiva desde app movil.
- `HU682`: foto y/o firma digital como POD.
- `HU547`: confirmacion de entrega de insumos en finca.
- `HU559`, `HU560`: consulta compacta de pallets completos y mochos.

## Reglas de propuesta

- El cierre de entrega se bloquea si no existe foto POD y firma digital.
- La orden activa se conserva en `localStorage` como simulacion local.
- El flujo de pallets existente no se duplica; esta vista resume y enlaza al flujo actual.
- La trazabilidad completa de inspecciones y evidencias se mantiene en Seguridad/Auditoria Operativa.
