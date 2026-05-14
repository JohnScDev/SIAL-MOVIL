# SIAL Movil - Propuesta UI/UX

Propuesta inicial para aplicacion movil SIAL.

## Enfoque

La propuesta movil se maneja como una aplicacion movil desde el inicio. No es una reduccion responsive de los modulos web administrativos.

El contexto funcional puede incluir operacion de campo, finca, trazabilidad, captura de evidencia y operacion logistica, pero las pantallas no deben tomar agro o puerto como lenguaje literal rigido. El foco es una experiencia operativa movil reutilizable.

## Arquitectura de libreria

La propuesta se organiza con una base compartida:

- `shared/sial-mobile-core.css`: tokens, light/dark mode, tipografia, formularios, botones, estados y componentes base.
- `shared/sial-mobile-core.js`: tema, toggle de contrasena y API `SialMobileUI` para feedback, banners, modales y bottom sheets.
- `libreria/index.html`: catalogo visual de componentes y patrones reutilizables.
- `libreria/sial-mobile-library.css`: estilos especificos del catalogo visual, sin reemplazar la libreria core.
- `libreria/sial-mobile-library.js`: demos interactivos del catalogo consumiendo `SialMobileUI`.
- `login/sial-mobile-login.css`: variantes visuales de login sobre la libreria.
- `login/sial-mobile-login.js`: interacciones locales del modulo login.

Nota temporal de validacion visual:

- Los fondos del login rotan cada 5 segundos entre las imagenes disponibles en `assets/login`.
- La rotacion queda limitada temporalmente a `Imagen 4.jpg` e `Imagen 1.jpg`.
- `Imagen 1.jpg` usa encuadre `82% 78%` para priorizar hojas y arboles de banano sobre el cielo.
- Esta rotacion existe solo para comparar alternativas visuales y elegir la foto definitiva.
- Cuando se cierre la seleccion de imagen, se debe dejar una sola imagen fija por variante de login.

Los futuros modulos moviles deben importar la libreria compartida antes de agregar estilos locales.

## Catalogo de libreria

El catalogo de `libreria/index.html` queda aterrizado como inventario reusable, no como una vista funcional del negocio. Su objetivo es revisar patrones antes de replicarlos en login, seleccion, home o modulos futuros.

Estructura actual:

- Fundamentos: tokens, superficies, radios, sombras, tipografia y estados semanticos.
- Navegacion: header movil, tabs, segmented control y drawer.
- Acciones: botones primarios, secundarios, ghost, iconos y jerarquia tactil.
- Formularios: campos de escritura, selector movil, textarea, captura de evidencia, firma y escaneo.
- Feedback: toast, banner persistente, alerta inline y estados de validacion.
- Capas: modal centrado y bottom sheet contextual.
- Estados: empty state, loading skeleton, badges y chips.
- Offline y sincronizacion: banner, estados pendientes, cola local y conflicto.

Cada patron debe indicar al menos proposito, cuando usarlo, cuando no usarlo y API o clase base asociada. El catalogo incluye una matriz inicial de `Reglas de uso` para revisar consistencia antes de crear o modificar vistas.

Regla movil de campos:

- Campo de escritura: abre teclado contextual y declara `inputmode`, `autocomplete`, `autocapitalize`, `spellcheck` y `enterkeyhint` cuando aplique.
- Campo de seleccion: se presenta como accion tactil. Para listas largas usa `SialMobileUI.openMobilePicker` con bottom sheet y busqueda opcional.
- Recuperar acceso: no es enlace decorativo; usa la misma logica del modulo web en tres pasos: usuario, codigo de 6 digitos y nueva contrasena. En movil se presenta como bottom sheet o pantalla dedicada, con titulos centrados, validacion inline, OTP tactil, reenvio de codigo, confirmacion no bloqueante y retorno automatico al login al finalizar.

## Vistas incluidas

- `index.html`: entrada de login institucional.
- `libreria/index.html`: catalogo visual de libreria movil.
- `login/login-01-institucional.html`: login corporativo transversal.
- `login/login-04-contexto-operativo.html`: login con enfoque de contexto operativo multiple.
- `login/login-05-minimal-operativo.html`: login compacto para uso frecuente.
- `app/seleccion-finca.html`: seleccion interactiva de finca o unidad operativa posterior al login.
- `app/home.html`: torre de control movil con indicadores, criticidad operativa, siguiente accion y menu lateral.
- `puerto-ze/recepcion-ze.html`: llegada de vehiculo a Zona Externa.
- `puerto-ze/inspeccion-externa.html`: evidencia externa del contenedor.
- `puerto-ze/inspeccion-interna.html`: evidencia interna del contenedor.
- `puerto-ze/despacho-finca.html`: despacho del contenedor hacia finca.
- `finca/despacho-ze.html`: despacho del contenedor cerrado desde finca hacia ZE.
- `puerto-ze/recepcion-ze-retorno.html`: recepcion en ZE del contenedor que vuelve desde finca.
- `puerto-ze/despacho-puerto.html`: despacho desde ZE hacia puerto.
- `finca/recepcion-finca.html`: recepcion del vehiculo o contenedor en finca.
- `finca/inspeccion-externa.html`: inspeccion externa en finca.
- `finca/inspeccion-interna.html`: inspeccion interna en finca.
- `finca/sesion-responsabilidad.html`: responsabilidad conductor y supervisor de finca con firmas referenciales.
- `pallets/armar-pallet.html`: armado de pallet con registro referencial de cajas.
- `pallets/cargar-pallets.html`: cargue del pallet al contenedor.
- `finca/cierre-contenedor.html`: cierre de contenedor con sellos y evidencia.
- `puerto-ze/recepcion-puerto.html`: recepcion en puerto previa a entrega final.
- `puerto-ze/entrega-puerto.html`: entrega/exportacion y liberacion del vehiculo.
- `trazabilidad/consultar-contenedor.html`: linea de trazabilidad del contenedor.
- `trazabilidad/consultar-operacion.html`: resumen movil de la operacion.

## Reglas aplicadas

- Uso de tokens SIAL light/dark.
- Tema persistente en `localStorage` con clave `sial-mobile-theme`.
- Formularios tactiles con altura minima de 48px.
- Areas interactivas minimas de 44px.
- Estados visuales para login.
- Estructura preparada para continuar con seleccion de finca posterior al login.
- Navegacion alineada al flujo logistico real: recepcion ZE, inspecciones, despacho a finca, recepcion en finca, cargue, cierre, entrega en puerto y trazabilidad.
- Operacion online/offline contemplada desde la torre de control movil.
- La vista principal posterior a seleccion de empresa se maneja como torre de control: inspecciones rechazadas, contenedores en transito, pendientes de sincronizacion, vehiculos disponibles y siguiente evento.
- Lenguaje operativo sin limitar la app a una vertical visual literal.
- Los eventos se relacionan mediante `shared/sial-mobile-flow.js` y se conservan en `localStorage` con estado de operacion, contenedor, vehiculo, ubicacion, flags, timeline, cajas, pallets, fotos y alertas de propuesta.
- Cada vista incorpora los campos minimos de su HU, validaciones de propuesta, bloqueo por prerrequisitos, usuario, fecha/hora, observaciones y evento de trazabilidad.
- El cargue de pallets se habilita despues de la recepcion en finca.
- La entrega final en puerto exige despacho finca, recepcion retorno ZE, despacho puerto y recepcion previa en puerto.
- Las inspecciones rechazadas generan alerta automatica.
- La inspeccion interna portuaria valida rango de 15 a 23 fotos en el prototipo.
- El cierre de contenedor exige pallets cargados, referencias/cantidades, sellos y evidencia.
- La libreria se valida de forma independiente a los modulos funcionales mediante `qa/mobile-library-contract.js`, `qa/mobile-library-catalog-contract.js`, `qa/mobile-library-catalog-audit.js` y `qa/mobile-library-browser-audit.spec.js`.
- El catalogo debe mantener paridad entre secciones y navegacion rapida, no debe generar overflow horizontal y sus demos deben consumir `SialMobileUI`.
- Los componentes de feedback usan estructura semantica valida: no se permite anidar parrafos dentro de elementos inline.
- Los estados offline/sincronizacion responden al ancho del componente: en tarjetas angostas apilan titulo, descripcion y accion; en contenedores amplios pueden alinear descripcion a la derecha.
- Chips y acciones compactas no deben partir palabras; si el texto no cabe, se ajusta el contenedor antes de degradar la lectura.

## Pendientes siguientes

- Escalar el catalogo visual con nuevos componentes antes de replicarlos en vistas funcionales.
- Completar criterios de aceptacion visual por componente a medida que se agreguen patrones nuevos.
- Sustituir captura simulada por implementaciones reales cuando se defina la capa tecnica nativa/web.
