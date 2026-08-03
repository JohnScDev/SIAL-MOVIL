(function () {
  "use strict";

  function isoWeek(date) {
    var current = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    var day = current.getUTCDay() || 7;
    current.setUTCDate(current.getUTCDate() + 4 - day);
    var yearStart = new Date(Date.UTC(current.getUTCFullYear(), 0, 1));
    var week = Math.ceil((((current - yearStart) / 86400000) + 1) / 7);
    return current.getUTCFullYear() + "-W" + String(week).padStart(2, "0");
  }

  function renderDate() {
    var node = document.querySelector("[data-home-date]");
    if (!node) return;
    var now = new Date();
    var date = new Intl.DateTimeFormat("es-CO", {
      weekday: "long",
      day: "numeric",
      month: "long"
    }).format(now);
    node.textContent = date.charAt(0).toUpperCase() + date.slice(1) + " · " + isoWeek(now);
  }

  function renderConnectivity() {
    var pill = document.querySelector("[data-home-connectivity]");
    if (!pill) return;
    pill.className = "sial-pill " + (navigator.onLine ? "success" : "warning");
    pill.textContent = navigator.onLine ? "En línea" : "Sin conexión";
  }

  function init() {
    renderDate();
    renderConnectivity();
    window.addEventListener("online", renderConnectivity);
    window.addEventListener("offline", renderConnectivity);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
