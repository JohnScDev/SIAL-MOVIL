(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", callback, { once: true });
    else callback();
  }

  var monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  var weekDays = ["lu", "ma", "mi", "ju", "vi", "sá", "do"];

  function pad(value) { return String(value).padStart(2, "0"); }
  function isoDate(date) { return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()); }
  function inputValue(date) { return isoDate(date) + "T" + pad(date.getHours()) + ":" + pad(date.getMinutes()); }
  function parseInput(value) {
    var match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value || "");
    if (!match) return new Date();
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4]), Number(match[5]));
  }
  function startOfToday() {
    var now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  function startOfWeek(date) {
    var result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
    return result;
  }
  function weekLabel(start) {
    var end = new Date(start);
    end.setDate(end.getDate() + 6);
    if (start.getMonth() === end.getMonth()) return start.getDate() + " – " + end.getDate() + " de " + monthNames[end.getMonth()] + " de " + end.getFullYear();
    return start.getDate() + " de " + monthNames[start.getMonth()] + " – " + end.getDate() + " de " + monthNames[end.getMonth()] + " de " + end.getFullYear();
  }
  function formatTime(date) {
    var hour = date.getHours();
    var meridiem = hour >= 12 ? "p. m." : "a. m.";
    hour = hour % 12 || 12;
    return pad(hour) + ":" + pad(date.getMinutes()) + " " + meridiem;
  }
  function formatDateTime(date) {
    return pad(date.getDate()) + "/" + pad(date.getMonth() + 1) + "/" + date.getFullYear() + " · " + formatTime(date);
  }
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }

  function initSelect(root) {
    if (root.dataset.sialSelectInitialized === "true") return;
    var nativeSelect = root.querySelector(".sial-select-native");
    var trigger = root.querySelector(".sial-select-trigger");
    var valueNode = root.querySelector("[data-sial-select-value]");
    var menu = root.querySelector(".sial-select-menu");
    if (!nativeSelect || !trigger || !valueNode || !menu) return;
    root.dataset.sialSelectInitialized = "true";

    function selectedIndex() { return Math.max(0, nativeSelect.selectedIndex); }
    function render() {
      menu.innerHTML = Array.from(nativeSelect.options).map(function (option, index) {
        var selected = index === selectedIndex();
        return '<button class="sial-select-option" type="button" role="option" data-value="' + escapeHtml(option.value) + '" aria-selected="' + selected + '">' + escapeHtml(option.textContent) + '</button>';
      }).join("");
      valueNode.textContent = nativeSelect.options[selectedIndex()]?.textContent || "Seleccionar";
    }
    function setOpen(open) {
      root.classList.toggle("is-open", open);
      menu.hidden = !open;
      trigger.setAttribute("aria-expanded", String(open));
      if (open) {
        var selected = menu.querySelector('[aria-selected="true"]');
        if (selected) selected.focus();
      }
    }
    function choose(button) {
      nativeSelect.value = button.dataset.value || "";
      nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));
      render();
      setOpen(false);
      trigger.focus();
    }
    if (!trigger.getAttribute("aria-label")) trigger.setAttribute("aria-label", "Seleccionar opción");
    trigger.addEventListener("click", function () { setOpen(menu.hidden); });
    trigger.addEventListener("keydown", function (event) {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setOpen(true);
      }
    });
    menu.addEventListener("click", function (event) {
      var option = event.target.closest("[data-value]");
      if (option) choose(option);
    });
    menu.addEventListener("keydown", function (event) {
      var options = Array.from(menu.querySelectorAll("[data-value]"));
      var current = options.indexOf(document.activeElement);
      if (event.key === "Escape") { setOpen(false); trigger.focus(); return; }
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        var next = event.key === "ArrowDown" ? current + 1 : current - 1;
        options[(next + options.length) % options.length]?.focus();
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (document.activeElement?.dataset?.value !== undefined) choose(document.activeElement);
      }
    });
    nativeSelect.addEventListener("change", render);
    document.addEventListener("click", function (event) {
      if (!root.contains(event.target)) setOpen(false);
    });
    render();
  }

  function initDateTimePicker(root) {
    var input = root.querySelector(".sial-datetime-input-native");
    var trigger = root.querySelector(".sial-datetime-trigger");
    var valueNode = root.querySelector("[data-sial-datetime-value]");
    var popover = root.querySelector(".sial-datetime-popover");
    if (!input || !trigger || !valueNode || !popover) return;

    popover.addEventListener("click", function (event) { event.stopPropagation(); });
    var selected = parseInput(input.value);
    var weekStart = startOfWeek(selected);

    function syncTrigger() {
      valueNode.textContent = input.value ? formatDateTime(selected) : "Selecciona fecha y hora";
    }
    function setOpen(open) {
      popover.hidden = !open;
      trigger.setAttribute("aria-expanded", String(open));
      root.classList.toggle("is-open", open);
      if (open) render();
    }
    function selectDate(value) {
      var parts = value.split("-");
      selected = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), selected.getHours(), selected.getMinutes());
      weekStart = startOfWeek(selected);
      render();
    }
    function render() {
      var today = startOfToday();
      var days = [];
      for (var index = 0; index < 7; index += 1) {
        var dayDate = new Date(weekStart);
        dayDate.setDate(dayDate.getDate() + index);
        var isSelected = isoDate(dayDate) === isoDate(selected);
        var isToday = isoDate(dayDate) === isoDate(today);
        var disabled = dayDate > today;
        days.push('<button class="sial-picker-day' + (isSelected ? ' is-selected' : '') + (isToday ? ' is-today' : '') + '" type="button" data-date="' + isoDate(dayDate) + '" aria-pressed="' + isSelected + '"' + (disabled ? ' disabled' : '') + '>' + dayDate.getDate() + '</button>');
      }
      var hour12 = selected.getHours() % 12 || 12;
      var minute = selected.getMinutes();
      var minutes = [];
      for (var minuteValue = 0; minuteValue < 60; minuteValue += 5) minutes.push(minuteValue);
      if (!minutes.includes(minute)) minutes.push(minute);
      minutes.sort(function (a, b) { return a - b; });
      var hourOptions = Array.from({ length: 12 }, function (_, index) { return index + 1; }).map(function (hour) { return '<option value="' + hour + '"' + (hour === hour12 ? ' selected' : '') + '>' + pad(hour) + '</option>'; }).join("");
      var minuteOptions = minutes.map(function (value) { return '<option value="' + value + '"' + (value === minute ? ' selected' : '') + '>' + pad(value) + '</option>'; }).join("");
      var meridiem = selected.getHours() >= 12 ? "PM" : "AM";
      popover.innerHTML = '<div class="sial-picker-header"><button class="sial-picker-nav" type="button" data-week="prev" aria-label="Semana anterior">‹</button><strong>' + weekLabel(weekStart) + '</strong><button class="sial-picker-nav" type="button" data-week="next" aria-label="Semana siguiente">›</button></div>' +
        '<div class="sial-picker-calendar">' + weekDays.map(function (day) { return '<span class="sial-picker-weekday">' + day + '</span>'; }).join("") + days.join("") + '</div>' +
        '<div class="sial-picker-time"><div class="sial-picker-time-head"><span>Hora de recepción</span><span>' + escapeHtml(formatTime(selected)) + '</span></div><div class="sial-picker-time-grid"><select data-time="hour" aria-label="Hora">' + hourOptions + '</select><select data-time="minute" aria-label="Minutos">' + minuteOptions + '</select><select data-time="meridiem" aria-label="Meridiano"><option value="AM"' + (meridiem === "AM" ? ' selected' : '') + '>a. m.</option><option value="PM"' + (meridiem === "PM" ? ' selected' : '') + '>p. m.</option></select></div></div>' +
        '<div class="sial-picker-actions"><button class="sial-picker-action" type="button" data-picker-action="clear">Borrar</button><span></span><button class="sial-picker-action" type="button" data-picker-action="today">Hoy</button><button class="sial-picker-action is-primary" type="button" data-picker-action="apply">Aplicar</button></div>';

      popover.querySelectorAll("[data-date]").forEach(function (button) { button.addEventListener("click", function () { selectDate(button.dataset.date); }); });
      popover.querySelector("[data-week='prev']").addEventListener("click", function () { weekStart.setDate(weekStart.getDate() - 7); render(); });
      popover.querySelector("[data-week='next']").addEventListener("click", function () { weekStart.setDate(weekStart.getDate() + 7); render(); });
      popover.querySelectorAll("[data-time]").forEach(function (select) { select.addEventListener("change", function () {
        var hour = Number(popover.querySelector("[data-time='hour']").value) % 12;
        var meridiemValue = popover.querySelector("[data-time='meridiem']").value;
        if (meridiemValue === "PM") hour += 12;
        selected.setHours(hour, Number(popover.querySelector("[data-time='minute']").value), 0, 0);
        render();
      }); });
      popover.querySelector("[data-picker-action='clear']").addEventListener("click", function () { input.value = ""; syncTrigger(); setOpen(false); });
      popover.querySelector("[data-picker-action='today']").addEventListener("click", function () { selected = new Date(); weekStart = startOfWeek(selected); render(); });
      popover.querySelector("[data-picker-action='apply']").addEventListener("click", function () { input.value = inputValue(selected); input.dispatchEvent(new Event("change", { bubbles: true })); syncTrigger(); setOpen(false); trigger.focus(); });
    }

    trigger.setAttribute("aria-label", "Fecha y hora de llegada");
    trigger.addEventListener("click", function () { setOpen(popover.hidden); });
    trigger.addEventListener("keydown", function (event) { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setOpen(popover.hidden); } });
    input.addEventListener("change", function () { selected = parseInput(input.value); weekStart = startOfWeek(selected); syncTrigger(); });
    document.addEventListener("click", function (event) { if (!root.contains(event.target)) setOpen(false); });
    document.addEventListener("keydown", function (event) { if (event.key === "Escape" && !popover.hidden) { setOpen(false); trigger.focus(); } });
    syncTrigger();
  }

  ready(function () {
    document.querySelectorAll("[data-sial-select]").forEach(initSelect);
    document.querySelectorAll("[data-sial-datetime-picker]").forEach(initDateTimePicker);
  });
}());
