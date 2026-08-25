# SIAL Movil - Propuesta UI/UX

Prototipo navegable de la version movil de SIAL. El alcance movil no replica SIAL Web: prioriza operacion en campo y Zona Externa, trazabilidad, evidencias, formularios tactiles y escenarios con conectividad limitada.

## Estructura

- `index.html`: entrada de login.
- `login/`: variantes de acceso.
- `app/`: seleccion de empresa, finca o sector, y home operativo.
- `puerto-ze/`, `finca/`, `pallets/`, `trazabilidad/`: vistas funcionales de la propuesta.
- `shared/`: estilos, scripts y patrones reutilizables.
- `libreria/`: catalogo de componentes y patrones moviles.
- `assets/brand`: activos de identidad usados por la propuesta.
- `qa/`: contratos de validacion.

## Patrones Compartidos

- Tema claro/oscuro persistente con `localStorage`.
- `SialMobileUI` centraliza feedback, modales, selectores moviles, camara e intro de marca.
- Login con intro inicial antes de revelar la vista.
- Captura fotografica global con camara directa, titulo por evidencia y galeria de fotos.
- Formularios tactiles con areas interactivas minimas de 44px a 48px.

## Flujo Base

`login -> seleccion de empresa -> seleccion de finca/sector -> home -> eventos operativos`

## Reglas De Trabajo

- Reutilizar `shared/` y `libreria/` antes de crear estilos locales.
- Revisar `assets/brand` antes de ajustar logos.
- Mantener las vistas como prototipo funcional, sin cambios backend.
- No forzar avance automatico entre vistas cuando la HU solo requiere revisar diseno y comportamiento.

## Catalogo visual de libreria movil

`libreria/index.html` es la referencia unica para crear o modificar componentes emergentes. Conserva los tokens, temas y medidas tactiles de la propuesta y documenta los patrones disponibles en `SialMobileUI`.

La libreria integrada incluye demostraciones funcionales de navegacion por tabs, segmented controls, OTP, firma tactil, progreso de evidencias, estados de sincronizacion, recuperacion de acceso, selectores, feedback, capas, camara y escaner. La seccion `API integrada` se genera desde la superficie publica real de `SialMobileUI`, evitando que el catalogo documente capacidades inexistentes o deje APIs compartidas sin referencia.

Los patrones operativos compuestos —operacion activa, prioridad, consulta, evidencia y firma— muestran como ensamblar los componentes base sin duplicar estilos o comportamiento en cada vista.

## Reglas de uso por componente

- Toast flotante: confirmaciones breves que no requieren una decision.
- Alerta inline: errores corregibles dentro de la vista; debe orientar y mover el foco al dato o accion pendiente.
- Banner persistente: conexion, sincronizacion, conflictos o bloqueos generales. Puede incluir una accion contextual como `Reintentar`.
- Modal o bottom sheet: decisiones bloqueantes, confirmaciones criticas o captura contextual.
- Selector movil: seleccion contextual con controles tactiles y foco administrado.
- Empty state: ausencia de datos con orientacion y siguiente accion cuando aplique.
- Loading skeleton: espera breve sin bloquear ni alterar el contenido final.
- Camara, escaner y visor: capas de dialogo administradas por el nucleo compartido.

Toda capa emergente debe tener nombre y descripcion accesibles, foco inicial, trampa y retorno de foco. Solo la capa superior puede cerrarse y `dismissible: false` impide cierre por Escape, backdrop o controles indirectos.

## Modelo offline y sincronizacion como patron de interfaz

La ausencia de conexion se comunica mediante un banner persistente. Durante la sincronizacion, el banner se reemplaza por identificador para mostrar progreso, error o conflicto sin acumular mensajes. Al resolver el estado se retira el banner y una sincronizacion completada puede confirmarse con toast.

## Validacion

Comandos habituales:

```powershell
node qa/mobile-barcode-scanner-contract.js
node --check shared/sial-mobile-core.js
node --check shared/sial-mobile-flow.js
node --check login/sial-mobile-login.js
node qa/mobile-motion-contract.js
node qa/mobile-brand-assets-contract.js
node qa/mobile-library-catalog-contract.js
node qa/mobile-library-integration-contract.js
git diff --check
```
