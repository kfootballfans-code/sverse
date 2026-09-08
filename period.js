(function () {
  var now = new Date();
  var selectedYear = now.getFullYear();
  var selectedMonth = now.getMonth() + 1;
  var selectedRange = "";

  function els() {
    return {
      yearWrap: document.getElementById("yearWrap"),
      yearBtn: document.getElementById("yearBtn"),
      yearMenu: document.getElementById("yearMenu"),
      monthWrap: document.getElementById("monthWrap"),
      monthBtn: document.getElementById("monthBtn"),
      monthMenu: document.getElementById("monthMenu"),
      totalWrap: document.getElementById("totalWrap"),
      totalBtn: document.getElementById("totalBtn")
    };
  }
  function isFuture(year, month) {
    if (year > now.getFullYear()) return true;
    if (year === now.getFullYear() && month > now.getMonth() + 1) return true;
    return false;
  }
  function fitMenu(wrap, btn) {
    if (!wrap || !btn) return;
    var menu = wrap.querySelector(".period-total-menu");
    if (!menu) return;
    menu.style.width = "auto";
    menu.style.minWidth = "100%";
    menu.style.left = "0";
    menu.style.boxSizing = "border-box";
  }
  function closeAll(x) {
    if (x.yearWrap) x.yearWrap.classList.remove("open");
    if (x.monthWrap) x.monthWrap.classList.remove("open");
    if (x.totalWrap) x.totalWrap.classList.remove("open");
  }
  function paint() {
    var x = els();
    fitMenu(x.yearWrap, x.yearBtn);
    fitMenu(x.monthWrap, x.monthBtn);
    fitMenu(x.totalWrap, x.totalBtn);
    if (x.yearBtn) {
      x.yearBtn.textContent = selectedYear + "년";
      if (selectedRange) {
        x.yearBtn.classList.remove("year-active", "active");
        x.yearBtn.classList.add("dim");
      } else {
        x.yearBtn.classList.add("year-active");
        x.yearBtn.classList.remove("dim");
      }
    }
    if (x.monthBtn) {
      x.monthBtn.textContent = selectedMonth + "월";
      if (selectedRange) {
        x.monthBtn.classList.remove("active");
        x.monthBtn.classList.add("dim");
      } else {
        x.monthBtn.classList.add("active");
        x.monthBtn.classList.remove("dim");
      }
    }
    if (x.yearMenu) {
      x.yearMenu.innerHTML = "";
      for (var y = now.getFullYear(); y >= 2025; y--) {
        var ybtn = document.createElement("button");
        ybtn.type = "button";
        ybtn.setAttribute("data-year", String(y));
        ybtn.textContent = y + "년";
        if (y === selectedYear) ybtn.classList.add("active");
        x.yearMenu.appendChild(ybtn);
      }
    }
    if (!selectedRange && x.totalBtn) {
      x.totalBtn.textContent = "선택";
      x.totalBtn.style.letterSpacing = "2px";
      x.totalBtn.classList.add("dim");
      x.totalBtn.classList.remove("active");
    }
    if (x.monthMenu) {
      x.monthMenu.innerHTML = "";
      for (var m = 1; m <= 12; m++) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.setAttribute("data-month", String(m));
        btn.textContent = m + "월";
        if (m === selectedMonth && !selectedRange) btn.classList.add("active");
        if (isFuture(selectedYear, m)) btn.disabled = true;
        x.monthMenu.appendChild(btn);
      }
    }
  }

    function parseYm(s) {
    var m = String(s || "").match(/(\d{2,4})\D+(\d{1,2})/);
    if (!m) return 0;
    var y = parseInt(m[1], 10);
    if (y < 100) y += 2000;
    var mo = parseInt(m[2], 10);
    if (!y || !mo) return 0;
    return y * 100 + mo;
  }
  function shiftYm(ym, delta) {
    var y = Math.floor(ym / 100);
    var m = (ym % 100) + delta;
    while (m <= 0) { m += 12; y -= 1; }
    while (m > 12) { m -= 12; y += 1; }
    return y * 100 + m;
  }
  function periodHit(dateStr) {
    var n = parseYm(dateStr);
    if (!n) return false;
    if (!selectedRange) return n === selectedYear * 100 + selectedMonth;
    var nowN = now.getFullYear() * 100 + (now.getMonth() + 1);
    if (selectedRange === "this-year") {
      return Math.floor(n / 100) === now.getFullYear() && n <= nowN;
    }
    if (selectedRange === "last-year") {
      return Math.floor(n / 100) === now.getFullYear() - 1;
    }
    var back = selectedRange === "6m" ? 5 : selectedRange === "12m" ? 11 : 2;
    var fromN = shiftYm(nowN, -back);
    return n >= fromN && n <= nowN;
  }
  window.getPeriod = function () {
    return { year: selectedYear, month: selectedMonth, range: selectedRange };
  };
  window.periodHit = periodHit;
  window.initPeriod = paint;
  paint();

  document.addEventListener("click", function (e) {
    var x = els();
    if (!x.yearBtn && !x.monthBtn && !x.totalBtn) return;
    var t = e.target;
    if (x.yearBtn && x.yearBtn.contains(t)) {
      e.stopPropagation();
      paint();
      var on = !x.yearWrap.classList.contains("open");
      closeAll(x);
      if (on) {
        x.yearWrap.classList.add("open");
        fitMenu(x.yearWrap, x.yearBtn);
      }
      return;
    }
    if (x.monthBtn && x.monthBtn.contains(t)) {
      e.stopPropagation();
      paint();
      var onM = !x.monthWrap.classList.contains("open");
      closeAll(x);
      if (onM) {
        x.monthWrap.classList.add("open");
        fitMenu(x.monthWrap, x.monthBtn);
      }
      return;
    }
    if (x.totalBtn && x.totalBtn.contains(t)) {
      e.stopPropagation();
      var onT = !x.totalWrap.classList.contains("open");
      closeAll(x);
      if (onT) {
        x.totalWrap.classList.add("open");
        fitMenu(x.totalWrap, x.totalBtn);
      }
      return;
    }
    var yPick = t.closest && t.closest("#yearMenu button");
    if (yPick && !yPick.disabled) {
      e.stopPropagation();
      selectedYear = parseInt(yPick.getAttribute("data-year"), 10);
      if (isFuture(selectedYear, selectedMonth)) {
        selectedMonth = (selectedYear === now.getFullYear() ? now.getMonth() + 1 : 12);
      }
      selectedRange = "";
      closeAll(x);
            paint();
      if (typeof window.onPeriodChange === "function") window.onPeriodChange(window.getPeriod());
      return;
    }
    var mPick = t.closest && t.closest("#monthMenu button");
    if (mPick && !mPick.disabled) {
      e.stopPropagation();
      selectedMonth = parseInt(mPick.getAttribute("data-month"), 10);
      selectedRange = "";
      document.querySelectorAll("#totalMenu button").forEach(function (b) { b.classList.remove("active"); });
      closeAll(x);
            paint();
      if (typeof window.onPeriodChange === "function") window.onPeriodChange(window.getPeriod());
      return;
    }
    var tPick = t.closest && t.closest("#totalMenu button");
    if (tPick) {
      e.stopPropagation();
      selectedRange = tPick.getAttribute("data-range") || "";
      document.querySelectorAll("#totalMenu button").forEach(function (b) { b.classList.remove("active"); });
      tPick.classList.add("active");
      if (x.totalBtn) {
        x.totalBtn.textContent = tPick.textContent;
        x.totalBtn.style.letterSpacing = "0";
        x.totalBtn.classList.remove("dim");
        x.totalBtn.classList.add("active");
      }
      closeAll(x);
            paint();
      if (typeof window.onPeriodChange === "function") window.onPeriodChange(window.getPeriod());
      return;
    }
    closeAll(x);
  });
})();
