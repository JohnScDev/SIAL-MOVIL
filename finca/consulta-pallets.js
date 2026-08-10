(function () {
  "use strict";

  var defaultStatus = "LISTO_PARA_CARGUE";

  function $(selector) {
    return document.querySelector(selector);
  }

  function statusTitle(status) {
    if (status === "CARGADO") return "Pallets cargados";
    if (status === "all") return "Todos los pallets";
    return "Pallets disponibles";
  }

  function syncControls() {
    var status = $("[data-pallet-status]");
    var week = $("[data-pallet-week]");
    if (!status || !week) return;

    document.querySelectorAll("[data-farm-pallet-status]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.farmPalletStatus === status.value));
    });

    var title = $("[data-farm-pallet-results-title]");
    if (title) title.textContent = statusTitle(status.value);

    var weekLabel = $("[data-farm-pallet-week]");
    if (weekLabel) weekLabel.textContent = week.value === "all" ? "Todas" : week.value;

    var summary = $("[data-pallet-summary]");
    var result = $("[data-farm-pallet-result]");
    if (summary && result) {
      var text = summary.textContent.trim();
      result.textContent = text.indexOf("Consultando") >= 0
        ? "Consultando"
        : (text.split("·")[0].trim() || "0 pallets");
    }
  }

  function setStatus(value, dispatch) {
    var status = $("[data-pallet-status]");
    if (!status) return;
    status.value = Array.from(status.options).some(function (option) {
      return option.value === value;
    }) ? value : defaultStatus;
    syncControls();
    if (dispatch !== false) status.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function requestedStatus() {
    var value = new URLSearchParams(window.location.search).get("status");
    if (value === "CARGADO" || value === "all" || value === "LISTO_PARA_CARGUE") return value;
    return defaultStatus;
  }

  function init() {
    var status = $("[data-pallet-status]");
    var week = $("[data-pallet-week]");
    var summary = $("[data-pallet-summary]");
    if (!status || !week || !summary) return;

    setStatus(requestedStatus(), true);

    document.querySelectorAll("[data-farm-pallet-status]").forEach(function (button) {
      button.addEventListener("click", function () {
        setStatus(button.dataset.farmPalletStatus, true);
      });
    });

    status.addEventListener("change", syncControls);
    week.addEventListener("change", syncControls);

    var clear = $("[data-pallet-clear]");
    if (clear) {
      clear.addEventListener("click", function () {
        window.setTimeout(function () {
          setStatus(defaultStatus, true);
        }, 0);
      });
    }

    var observer = new MutationObserver(syncControls);
    observer.observe(summary, { childList: true, characterData: true, subtree: true });
    syncControls();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
