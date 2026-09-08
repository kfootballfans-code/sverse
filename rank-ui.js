(function () {
  var PAGE_SIZE = 35;

  function soopImg(id) {
    if (!id) return "";
    return "https://stimg.sooplive.com/LOGO/" + id.substring(0, 2).toLowerCase() + "/" + id + "/" + id + ".jpg";
  }
  function failHtml() {
    return "<li style='padding:28px 16px;color:#f87171;text-align:center;'>" +
      (window.failLabel ? window.failLabel() : "데이터 불러오지 못했습니다 F5 새로고침을 해주세요") +
      "</li>";
  }
  function emptyHtml() {
    return "<li style='padding:28px 16px;color:var(--text-muted);text-align:center;'>" +
      (window.emptyLabel ? window.emptyLabel() : "검색된 데이터가 없습니다") +
      "</li>";
  }
  function pageSlice(list, page, size) {
    size = size || PAGE_SIZE;
    var maxPage = Math.max(1, Math.ceil(list.length / size));
    if (page > maxPage - 1) page = maxPage - 1;
    if (page < 0) page = 0;
    var start = page * size;
    return {
      page: page,
      maxPage: maxPage,
      start: start,
      rows: list.slice(start, start + size)
    };
  }
  function fillEmptyRows(listEl, count) {
    for (var e = 0; e < count; e++) {
      var empty = document.createElement("li");
      empty.className = "rank-item empty";
      empty.innerHTML = '<span class="rank-num"></span><div class="avatar" style="border-color:transparent;background:transparent;"></div><div class="rank-info"></div><div class="rank-stat"></div>';
      listEl.appendChild(empty);
    }
  }
  function paintPager(page, maxPage, hide) {
    var nav = document.getElementById("listNav");
    if (!nav) return;
    if (hide) {
      nav.style.display = "none";
      return;
    }
    nav.style.display = "flex";
    var info = document.getElementById("pageInfo");
    var prevBtn = document.getElementById("prevPage");
    var nextBtn = document.getElementById("nextPage");
    if (info) info.textContent = (page + 1) + "/" + maxPage;
    if (prevBtn) prevBtn.disabled = page <= 0;
    if (nextBtn) nextBtn.disabled = page >= maxPage - 1;
  }
  function goListTop() {
    var el = document.getElementById("rankTitle") || document.getElementById("rankArea");
    if (!el) return;
    var y = el.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  }

  window.PAGE_SIZE = PAGE_SIZE;
  window.soopImg = soopImg;
  window.failHtml = failHtml;
  window.emptyHtml = emptyHtml;
  window.pageSlice = pageSlice;
  window.fillEmptyRows = fillEmptyRows;
  window.paintPager = paintPager;
  window.goListTop = goListTop;
})();
