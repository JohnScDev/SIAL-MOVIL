# Materiales y Suministros Movil - Propuesta SIAL

Flujo móvil para consultar pedidos sugeridos y stock, ejecutar hitos que ocurren en campo, registrar recepción efectiva y capturar POD.

La gestión administrativa web es la fuente primaria para planeación, maestras, ajustes, solicitudes y notificaciones. Este paquete es complementario y no sustituye las vistas de [`SIAL Web - Propuesta`](../../SIAL%20Web%20-%20Propuesta/Materiales%20y%20Suministros/MATRIZ_HU_CANALES.md).

## Historias cubiertas

- `HU659`: pedido sugerido visible para finca/productor.
- `HU660`: ajuste operativo separado del cálculo sugerido; en móvil solo se consulta el resultado.
- `HU662`: inventario o stock disponible en finca.
- `HU666`: solo captura móvil cuando la necesidad adicional ocurre en campo; la creación y gestión administrativa se realiza en web.
- `HU546`: consulta y seguimiento de la orden de transporte de suministros.
- `HU670`: orden asignada visible para conductor o transportista.
- `HU681`: registro de entrega efectiva desde app movil.
- `HU682`: foto y/o firma digital como POD.
- `HU547`: confirmacion de entrega de insumos en finca.
- `HU559`, `HU560`: consulta compacta de pallets completos y mochos.

## Reglas de propuesta

- El cierre de entrega se bloquea si no existe foto POD y firma digital.
- La recepción se concilia por línea: solicitado, recibido, devuelto y faltante/rechazo; las diferencias requieren observación.
- Cuando HU666 se habilite por un evento de campo, la captura móvil no se limita artificialmente a una por semana; cada registro conserva material, cantidad, motivo, pedido base, estado y clave idempotente. La bandeja y validación siguen siendo web.
- La app móvil no administra la receta/versionado de HU826 ni aplica tolerancias de HU660; solo consulta el resultado que web/backend haya autorizado.
- No se duplican en móvil los formularios web de pedido sugerido, ajuste, maestra, clasificación documental u orden de transporte.
- El pedido sugerido y el inventario muestran su contexto de finca, aviso, receta, fecha de inventario y origen del saldo.
- La orden activa y el borrador de recepción se conservan en `localStorage` como simulación local; la implementación real debe reemplazarlo por outbox durable y sincronización transaccional.
- El flujo de pallets existente no se duplica; esta vista resume y enlaza al flujo actual.
- La trazabilidad completa de inspecciones y evidencias se mantiene en Seguridad/Auditoria Operativa.
