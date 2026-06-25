# Intro de marca SIAL Movil

## Proposito

La intro de marca es un patron breve de acceso al app. Se usa para reforzar identidad al abrir login, sin comunicar carga tecnica ni bloquear tareas operativas mas tiempo del necesario.

## Uso

- Usar al abrir `index.html` y variantes de login.
- Usar una sola vez por entrada de sesion visual.
- El login debe quedar oculto desde el primer paint con `data-sial-intro="pending"`.
- Mantener duracion objetivo cercana a 2200 ms para permitir lectura fugaz del descriptor.
- Mantener reduced motion con version estatica y fade breve.

## No usar

- No usar como loader de red, sincronizacion o guardado.
- No repetir dentro de vistas internas.
- No reemplazar estados de espera, skeleton, banner offline o feedback de formulario.

## API

```js
SialMobileUI.playLogoIntro({
  logoSrc: "assets/brand/isotipo-sial.svg",
  title: "SIAL",
  caption: "Sistema de Informacion Agrologistico",
  duration: 2200,
  reducedDuration: 980
});
```

## Coreografia

1. La superficie full-screen inicia en blanco limpio, sin barra ni loader.
2. El isotipo oficial aparece de golpe desde arriba y el texto `SIAL` aparece de golpe desde abajo.
3. Ambos elementos chocan, hacen un ajuste breve y quedan centrados como lockup.
4. El descriptor aparece despues con efecto fantasma, sin contenedor visual.
5. El overlay cierra y recien entonces se revela el login con transicion breve.

## Criterio de implementacion

El runtime usa CSS y DOM nativo desde `shared/sial-mobile-core.js`; no agrega dependencias pesadas. Figma documenta el storyboard editable. HyperFrames se toma como criterio de ritmo y capas. Remotion queda como referencia para un render futuro si se requiere video de presentacion. Si el recurso de marca falla, el fallback del runtime debe revelar el login para no dejar la pantalla bloqueada.

## Storyboard Figma

Archivo editable: https://www.figma.com/design/6de8tf0Idiw0tfFRb3SsJa
