(function () {
  var DATER_CSV = "https://docs.google.com/spreadsheets/d/1eYeyvdrd07PUmLAUeEXocF2N7wGRsGODqiul9YquAcY/export?format=csv&gid=1588738461";

  function splitCsvLine(line) {
    var out = [], cur = "", q = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (q) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') q = false;
        else cur += ch;
      } else if (ch === '"') q = true;
      else if (ch === ",") { out.push(cur); cur = ""; }
      else cur += ch;
    }
    out.push(cur);
    return out;
  }
  function parseNum(v) {
    return parseInt(String(v || "").replace(/[^0-9]/g, ""), 10) || 0;
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
  function liveYm() {
    var n = new Date();
    return n.getFullYear() * 100 + (n.getMonth() + 1);
  }
  function isLiveYm(ym) {
    return ym === liveYm();
  }
  function resolveCrew(sheetCrew, who, ym) {
    if (isLiveYm(ym)) {
      if (who && who.crew) return who.crew;
      return sheetCrew || "FA";
    }
    return sheetCrew || "FA";
  }
  function sameCrew(a, b) {
    var alias = window.crewAlias || function (x) { return String(x || ""); };
    return alias(a) === alias(b);
  }
  function emptyLabel() {
    var p = window.getPeriod && window.getPeriod();
    if (!p) return "검색된 데이터가 없습니다";
    if (!p.range) return p.year + "년 " + p.month + "월에 검색된 데이터가 없습니다";
    var map = {
      "3m": "3개월",
      "6m": "6개월",
      "12m": "12개월",
      "this-year": "올해",
      "last-year": "작년"
    };
    var t = map[p.range] || "선택한 기간";
    return "오늘을 기준으로 " + t + "에 대한 검색된 데이터가 없습니다";
  }
  function failLabel() {
    return "데이터 불러오지 못했습니다 F5 새로고침을 해주세요";
  }

  function loadDaterRows(opts) {
    opts = opts || {};
    var metricCol = opts.metricCol == null ? 2 : opts.metricCol;
    var metricKey = opts.metricKey || "value";
    var roster = opts.roster || (window.getRoster && window.getRoster()) || [];
    var periodHit = window.periodHit;

    return fetch(DATER_CSV).then(function (res) {
      if (!res.ok) throw new Error("dater");
      return res.text();
    }).then(function (text) {
      var lines = text.split("\n").map(function (l) { return l.trim(); }).filter(Boolean);
      var periodRows = [];
      var liveRows = [];
      var nowN = liveYm();
      for (var i = 1; i < lines.length; i++) {
        var c = splitCsvLine(lines[i]).map(function (x) { return x.replace(/^"|"$/g, "").trim(); });
        var nick = (c[1] || "").trim();
        if (!nick || nick === "닉네임") continue;
        var who = window.findRoster ? window.findRoster(nick, roster) : null;
        if (!who) continue;
        if (!who.id) continue;
        if (!(who.gender || "").trim()) continue;
        var ym = parseYm(c[0]);
        var hit = typeof periodHit !== "function" || periodHit(c[0]);
        if (!hit && ym !== nowN) continue;
        var num = parseNum(c[metricCol]);
        var sheetCrew = (c[9] || "").trim();
        var row = {
          name: who.name || nick,
          crew: resolveCrew(sheetCrew, who, ym),
          liveCrew: (who && who.crew) || "FA",
          crewDisplay: sheetCrew || resolveCrew(sheetCrew, who, ym),
          id: who.id,
          gender: who.gender,
          race: who.race || "",
          ym: ym
        };
        row[metricKey] = num;
        if (hit) periodRows.push(row);
        if (ym === nowN) {
          var live = {
            name: row.name, crew: row.crew, crewDisplay: row.crewDisplay,
            id: row.id, gender: row.gender, race: row.race, ym: ym
          };
          live[metricKey] = num;
          liveRows.push(live);
        }
      }
      var period = mergePeople(periodRows, metricKey);
      var live = mergePeople(liveRows, metricKey);
      var p = window.getPeriod && window.getPeriod();
      if (p && p.range) {
        period.forEach(function (it) {
          it.crew = it.liveCrew || it.crew;
        });
      }
      return {
        period: period,
        live: live,
        periodRaw: periodRows,
        liveRaw: liveRows,
        crewAvgList: crewPeriodAvg(periodRows, metricKey)
      };
    });
  }

  function mergePeople(rows, metricKey) {
    var merged = {};
    rows.forEach(function (item) {
      var k = item.id || item.name;
      if (!merged[k]) {
        merged[k] = Object.assign({}, item);
        merged[k].monthCount = 1;
      } else {
        merged[k][metricKey] = (merged[k][metricKey] || 0) + (item[metricKey] || 0);
        merged[k].monthCount = (merged[k].monthCount || 1) + 1;
      }
    });
    var list = Object.keys(merged).map(function (k) { return merged[k]; });
    list.sort(function (a, b) { return (b[metricKey] || 0) - (a[metricKey] || 0); });
    var lastVal = null;
    var lastRank = 0;
    list.forEach(function (it, i) {
      var v = it[metricKey] || 0;
      if (v === lastVal) it.rank = lastRank;
      else { it.rank = i + 1; lastRank = it.rank; lastVal = v; }
    });
    return list;
  }

  function filterPeople(list, opt) {
    opt = opt || {};
    var metricKey = opt.metricKey || "value";
    var data = list.slice();
    data = data.filter(function (it) { return (it[metricKey] || 0) > 0; });
    if (!opt.showFa) data = data.filter(function (it) { return it.crew !== "FA"; });
    if (!opt.showMen) data = data.filter(function (it) { return (it.gender || "")[0] === "여"; });
    if (opt.selectedCrew) {
      data = data.filter(function (it) { return sameCrew(it.crew, opt.selectedCrew); });
    }
    data.sort(function (a, b) { return (b[metricKey] || 0) - (a[metricKey] || 0); });
    var lastVal = null;
    var lastRank = 0;
    data.forEach(function (it, i) {
      var v = it[metricKey] || 0;
      if (v === lastVal) it.rank = lastRank;
      else { it.rank = i + 1; lastRank = it.rank; lastVal = v; }
    });
    return data;
  }

  function womenCrewSource(list, metricKey) {
    metricKey = metricKey || "value";
    return list.filter(function (it) {
      if (it.crew === "FA" || !it.crew) return false;
      if ((it.gender || "")[0] !== "여") return false;
      if ((it[metricKey] || 0) <= 0) return false;
      return true;
    });
  }

  function shiftYm(ym, delta) {
    var y = Math.floor(ym / 100);
    var m = (ym % 100) + delta;
    while (m <= 0) { m += 12; y -= 1; }
    while (m > 12) { m -= 12; y += 1; }
    return y * 100 + m;
  }
  function periodMonths() {
    var p = window.getPeriod && window.getPeriod();
    var nowN = liveYm();
    if (!p || !p.range) {
      if (!p) return [nowN];
      return [p.year * 100 + p.month];
    }
    var list = [];
    var fromN;
    var toN;
    if (p.range === "this-year") {
      fromN = nowN - (nowN % 100) + 1;
      toN = nowN;
    } else if (p.range === "last-year") {
      var y = Math.floor(nowN / 100) - 1;
      fromN = y * 100 + 1;
      toN = y * 100 + 12;
    } else {
      var back = p.range === "6m" ? 5 : p.range === "12m" ? 11 : 2;
      fromN = shiftYm(nowN, -back);
      toN = nowN;
    }
    for (var n = fromN; n <= toN; n = shiftYm(n, 1)) list.push(n);
    return list;
  }
  function crewPeriodAvg(rawList, metricKey) {
    metricKey = metricKey || "value";
    var ranged = window.getPeriod && window.getPeriod() && window.getPeriod().range;
    var bag = {};
    (rawList || []).forEach(function (it) {
      if ((it.gender || "")[0] !== "여") return;
      if (!it.crew || it.crew === "FA") return;
      var v = Number(it[metricKey]) || 0;
      if (v <= 0) return;
      var ym = it.ym || 0;
      if (!ym) return;
      var crew = (window.crewAlias ? window.crewAlias(it.crew) : it.crew) || it.crew;
      if (!bag[crew]) bag[crew] = { name: it.crew, months: {}, people: 0 };
      if (!bag[crew].months[ym]) bag[crew].months[ym] = { sum: 0, n: 0 };
      bag[crew].months[ym].sum += v;
      bag[crew].months[ym].n += 1;
      bag[crew].people += 1;
    });
    return Object.keys(bag).map(function (crew) {
      var cells = Object.keys(bag[crew].months).map(function (ym) { return bag[crew].months[ym]; });
      if (!ranged) {
        var s = 0, n = 0;
        cells.forEach(function (c) { s += c.sum; n += c.n; });
        return { name: bag[crew].name, avg: n ? Math.round(s / n) : 0, count: n };
      }
      var totalMonthlyAvg = 0; // 각 달의 평균들을 합칠 변수
      var validMonthCount = 0; // 모수가 존재하는 달의 개수
      
      cells.forEach(function (c) { 
        if(c.n > 0) { // 그 달에 인원이 있는 경우에만
          totalMonthlyAvg += (c.sum / c.n); // 그 달의 평균을 구해서 더함
          validMonthCount += 1;
        }
      });
      
      return {
        name: bag[crew].name,
        // 각 달의 평균의 합을 유효한 달의 개수로 나눔
        avg: validMonthCount ? Math.round(totalMonthlyAvg / validMonthCount) : 0,
        count: bag[crew].people // 기존처럼 크루의 총 인원수를 반환하려면 bag[crew].people 활용
      };
    }).sort(function (a, b) { return b.avg - a.avg; });
  }

  window.DATER_CSV = DATER_CSV;
  window.splitCsvLine = splitCsvLine;
  window.parseNum = parseNum;
  window.parseYm = parseYm;
  window.liveYm = liveYm;
  window.resolveCrew = resolveCrew;
  window.sameCrew = sameCrew;
  window.emptyLabel = emptyLabel;
  window.failLabel = failLabel;
  window.loadDaterRows = loadDaterRows;
  window.mergePeople = mergePeople;
  window.filterPeople = filterPeople;
  window.womenCrewSource = womenCrewSource;
  window.periodMonths = periodMonths;
  window.crewPeriodAvg = crewPeriodAvg;
})();
