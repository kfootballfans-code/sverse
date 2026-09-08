(function () {
  if (!document.querySelector('link[rel="icon"]')) {
    var fav = document.createElement("link");
    fav.rel = "icon";
    fav.href = "logo/starverse_logo.png";
    document.head.appendChild(fav);
  }
  var page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  var nav = [
    { href: "crew.html", label: "스타대학" },
    { href: "elo.html", label: "매치전적" },
    { href: "viewer.html", label: "뷰어십" },
    { href: "star.html", label: "별풍선" },
    { href: "asl.html", label: "ASL" }
  ];
  var navHtml = nav.map(function (item) {
    var on = page === item.href ? " active" : "";
    return '<a href="' + item.href + '" class="' + on.trim() + '">' + item.label + "</a>";
  }).join("");

  var top = document.getElementById("site-top");
  if (top) {
    top.innerHTML =
      '<header class="header"><div class="header-inner">' +
      '<a href="index.html" class="logo">' +
      '<img src="logo/starverse_logo.png" alt="로고">' +
      '<span class="logo-text">스버스 <span class="logo-sub">Starcraft Universe</span></span>' +
      "</a>" +
      '<div class="search-wrap">' +
      '<input type="text" class="search-input" id="searchInput" placeholder="스트리머 검색" autocomplete="off">' +
      '<svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>' +
      '<div class="search-drop" id="searchDrop"></div></div>' +
      '<label class="fa-switch-wrap" id="themeSwitchWrap" title="선택시 낮 화이트 모드 ">' +
      '<span class="theme-icon">' +
      '<svg class="theme-moon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
      '<path d="M16.2 3.1a8.6 8.6 0 1 0 4.8 15.3 7.4 7.4 0 1 1-4.8-15.3z"></path></svg>' +
      '<svg class="theme-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="3.3" fill="currentColor" stroke="none"></circle>' +
      '<line x1="12" y1="2" x2="12" y2="5.4"></line>' +
      '<line x1="12" y1="18.6" x2="12" y2="22"></line>' +
      '<line x1="2" y1="12" x2="5.4" y2="12"></line>' +
      '<line x1="18.6" y1="12" x2="22" y2="12"></line>' +
      '<line x1="5.5" y1="5.5" x2="7.6" y2="7.6"></line>' +
      '<line x1="16.4" y1="16.4" x2="18.5" y2="18.5"></line>' +
      '<line x1="18.5" y1="5.5" x2="16.4" y2="7.6"></line>' +
      '<line x1="7.6" y1="16.4" x2="5.5" y2="18.5"></line></svg></span>' +
      '<input type="checkbox" id="themeBtn" class="fa-switch-input">' +
      '<span class="fa-switch-slider"></span></label>' +
      "</div></header>" +
      '<nav class="sub-nav"><div class="sub-nav-inner">' + navHtml + "</div></nav>";
  }

  var bottom = document.getElementById("site-bottom");
  if (bottom) {
    bottom.innerHTML =
      '<footer class="footer"><div class="footer-inner">' +
      "<p>※ 본 사이트에서 제공하는 실시간 랭킹, 통계, 정보 등의 데이터는 플랫폼 내 누구나 접근 가능한 공개 데이터만 수집하며 이용자의 비공개 정보나 개인정보는 수집하지 않습니다.</p>" +
      "<p>※ 수집 개시일 : 2025년 9월 1일 | 집계 기준 : 00시 ~ 24시 (KST)" +
      '<span class="footer-dot">·</span><a href="terms.html" class="footer-doc">서비스 이용약관</a>' +
      '<span class="footer-dot">·</span><a href="privacy.html" class="footer-doc">개인정보 처리방침</a></p>' +
      '<div class="footer-row">' +
      "<span>※ 본 서비스는 SOOP (구 아프리카TV) 의 비공식 통계 사이트로, SOOP 와 직접적인 관계가 없습니다.</span>" +
      '<details class="partner-wrap"><summary class="partner-btn">문의</summary>' +
      '<div class="partner-pop">제휴 및 사이트 이용 문의는 starcraftverse@gmail.com<br></div>' +
      "</details></div>" +
      '<div class="footer-copyright">Copyright © 2026 스버스 All rights reserved.</div>' +
      "</div></footer>";
  }

  var root = document.documentElement;
  var themeBtn = document.getElementById("themeBtn");
  function paintTheme() {
    var light = root.classList.contains("light");
    if (themeBtn) themeBtn.checked = light;
    var wrap = document.getElementById("themeSwitchWrap");
    if (wrap) {
      wrap.title = light ? "클릭하면 밤 다크 모드" : "선택시 낮 화이트 모드 ";
    }
  }
  if (localStorage.getItem("starkwiki-theme") === "light") root.classList.add("light");
  paintTheme();
  if (themeBtn) {
    themeBtn.addEventListener("change", function () {
      if (themeBtn.checked) root.classList.add("light");
      else root.classList.remove("light");
      localStorage.setItem("starkwiki-theme", themeBtn.checked ? "light" : "dark");
      paintTheme();
    });
  }

  var ROSTER = "https://docs.google.com/spreadsheets/d/1eYeyvdrd07PUmLAUeEXocF2N7wGRsGODqiul9YquAcY/export?format=csv&gid=0";
  function sImg(id) {
    if (!id) return "";
    return "https://stimg.sooplive.com/LOGO/" + id.substring(0, 2).toLowerCase() + "/" + id + "/" + id + ".jpg";
  }
  function sNorm(s) {
    return String(s || "").toLowerCase().replace(/[^가-힣a-z0-9]/g, "");
  }
  var input = document.getElementById("searchInput");
  var drop = document.getElementById("searchDrop");
  if (!input || !drop) return;
  fetch(ROSTER).then(function (res) { return res.text(); }).then(function (text) {
    var lines = text.split("\n").map(function (l) { return l.trim(); }).filter(function (l) { return l; });
    var roster = [];
    for (var i = 1; i < lines.length; i++) {
      var cols = lines[i].match(/(?:[^",]+|"[^"]*")+/g) || [];
      var c = cols.map(function (x) { return x.replace(/^"|"$/g, "").trim(); });
      var id = (c[0] || "").trim();
      var name = (c[1] || "").trim();
      var aliases = (c[2] || "").split(",").map(function (x) { return x.trim(); }).filter(function (x) { return x; });
      if (name) roster.push({ id: id, name: name, aliases: aliases });
    }
    function paint(list) {
      if (!list.length) { drop.classList.remove("open"); drop.innerHTML = ""; return; }
      drop.innerHTML = list.slice(0, 12).map(function (r) {
        return '<div class="search-item" data-id="' + r.id + '">' +
          '<img src="' + sImg(r.id) + '" onerror="this.style.display=\'none\'">' +
          "<span>" + r.name + "</span>" +
          "<small>" + (r.id || "") + "</small></div>";
      }).join("");
      drop.classList.add("open");
      drop.querySelectorAll(".search-item").forEach(function (el) {
        el.addEventListener("mousedown", function (e) {
          e.preventDefault();
          var pid = el.getAttribute("data-id");
          if (pid) location.href = "profile.html?id=" + encodeURIComponent(pid);
        });
      });
    }
    input.addEventListener("input", function () {
      var q = sNorm(input.value);
      var raw = input.value.trim().toLowerCase();
      if (!q && !raw) { paint([]); return; }
      paint(roster.filter(function (r) {
        if (sNorm(r.name).indexOf(q) !== -1) return true;
        if (String(r.id).toLowerCase().indexOf(raw) !== -1) return true;
        return r.aliases.some(function (a) { return sNorm(a).indexOf(q) !== -1; });
      }));
    });
    input.addEventListener("blur", function () {
      setTimeout(function () { drop.classList.remove("open"); }, 150);
    });
  });
})();
(function () {
  var wrap = document.querySelector(".partner-wrap");
  if (!wrap) return;
  var timer = null;
  function closePartner() { wrap.open = false; }
  wrap.addEventListener("mouseenter", function () {
    if (timer) { clearTimeout(timer); timer = null; }
  });
  wrap.addEventListener("mouseleave", function () {
    timer = setTimeout(closePartner, 200);
  });
  window.addEventListener("scroll", closePartner, { passive: true });
  document.addEventListener("click", function (e) {
    if (!wrap.contains(e.target)) closePartner();
  });
})();

/* ============================================================
   [공통] 전 페이지 F5 새로고침 시 마지막 선택 탭 유지 기능
============================================================ */
(function() {
  var pageKey = "saved_tab_" + (location.pathname.split("/").pop() || "index.html").toLowerCase();

  // 탭 클릭할 때마다 현재 페이지 전용 키로 자동 저장
  document.addEventListener("click", function(e) {
    var tabBtn = e.target.closest(".crew-tab[data-tab]");
    if (tabBtn) {
      var tabName = tabBtn.getAttribute("data-tab");
      if (tabName) {
        sessionStorage.setItem(pageKey, tabName);
      }
    }
  });

  // 페이지 로드 완료 시 마지막 보던 탭 자동 클릭 복원 (페이지 이동 링크는 제외하여 무한루프 방지)
  window.addEventListener("DOMContentLoaded", function() {
    var savedTab = sessionStorage.getItem(pageKey);
    if (savedTab) {
      var targetBtn = document.querySelector('.crew-tab[data-tab="' + savedTab + '"]');
      if (targetBtn && !targetBtn.getAttribute("onclick") && !targetBtn.closest("a")) {
        targetBtn.click();
      }
    }
  });
})();