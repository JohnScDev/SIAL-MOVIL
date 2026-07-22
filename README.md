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
git diff --check
```
