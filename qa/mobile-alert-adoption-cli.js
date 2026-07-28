async (page) => {
  const currentUrl = page.url();
  const baseUrl = currentUrl.startsWith("http")
    ? currentUrl.replace(/^(https?:\/\/[^/]+\/).*$/, "$1")
    : "http://127.0.0.1:8893/";
  const paths = [
    "demo-camara.html", "index.html",
    "app/home.html", "app/seleccion-finca.html", "app/seleccion-empresa.html",
    "pallets/cargar-pallets.html", "pallets/armar-pallet.html",
    "libreria/index.html",
    "trazabilidad/consultar-contenedor.html", "trazabilidad/sincronizacion.html", "trazabilidad/consultar-operacion.html",
    "login/login-04-contexto-operativo.html", "login/login-05-minimal-operativo.html", "login/login-01-institucional.html",
    "materiales/ordenes-asignadas.html", "materiales/inventario-finca.html", "materiales/pedido-sugerido.html", "materiales/index.html",
    "materiales/registrar-entrega.html", "materiales/detalle-orden.html", "materiales/pod.html", "materiales/pallets.html",
    "puerto-ze/hu1431-despacho-contenedor-finca.html", "puerto-ze/index.html", "puerto-ze/inspeccion-interna.html",
    "puerto-ze/inspeccion-externa.html", "puerto-ze/recepcion-ze.html", "puerto-ze/recepcion-puerto.html",
    "puerto-ze/recepcion-ze-retorno.html", "puerto-ze/entrega-puerto.html", "puerto-ze/despacho-puerto.html", "puerto-ze/despacho-finca.html",
    "finca/recepcion-finca.html", "finca/inspeccion-externa.html", "finca/inspeccion-interna.html",
    "finca/sesion-responsabilidad.html", "finca/despacho-ze.html", "finca/cierre-contenedor.html"
  ];
  const urls = paths.map((path) => baseUrl + path);
  const results = [];

  for (const url of urls) {
    try {
      const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 10000 });
      await page.waitForTimeout(120);
      const metrics = await page.evaluate(() => {
        const statuses = [...document.querySelectorAll(".sial-status")];
        return {
          title: document.title,
          core: Boolean(window.SialMobileUI),
          statuses: statuses.length,
          hydrated: statuses.filter((node) => node.classList.contains("sial-alert-card")).length,
          missingIcons: statuses.filter((node) => (
            node.classList.contains("sial-alert-card")
            && !node.querySelector("svg.sial-feedback-symbol")
          )).length,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
        };
      });
      results.push({ url, status: response ? response.status() : 0, ...metrics });
    } catch (error) {
      results.push({ url, error: String(error.message || error) });
    }
  }

  return {
    total: results.length,
    pagesWithAlerts: results.filter((result) => result.statuses > 0).length,
    hydratedAlerts: results.reduce((total, result) => total + (result.hydrated || 0), 0),
    failures: results.filter((result) => (
      result.error
      || result.status >= 400
      || !result.core
      || result.hydrated !== result.statuses
      || result.missingIcons
      || result.overflow > 1
    ))
  };
}
