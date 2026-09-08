(function () {
  var ROSTER_CSV = "https://docs.google.com/spreadsheets/d/1eYeyvdrd07PUmLAUeEXocF2N7wGRsGODqiul9YquAcY/export?format=csv&gid=0";
  var cache = null;

  function normName(s) {
    return String(s || "").replace(/\s+/g, "").toLowerCase();
  }
  function crewAlias(name) {
    var s = String(name || "").replace(/\s+/g, "");
    if (s === "츠캄몬스타즈" || s === "츠캄" || s === "캄몬") return "캄몬스타즈";
    if (s === "드림") return "드림즈";
    return s;
  }
  function parseRoster(text) {
    var lines = String(text || "").split("\n").map(function (l) { return l.trim(); }).filter(Boolean);
    var list = [];
    for (var i = 1; i < lines.length; i++) {
      var cols = (window.splitCsvLine ? window.splitCsvLine(lines[i]) : (lines[i].match(/(?:[^",]*|"[^"]*")+/g) || []));
      var c = cols.map(function (x) { return String(x || "").replace(/^"|"$/g, "").trim(); });
      var id = c[0] || "";
      var name = c[1] || "";
      if (!id && !name) continue;
      var aliases = (c[2] || "").split(",").map(function (x) { return x.trim(); }).filter(Boolean);
      var g = (c[5] || "").trim();
      if (g[0] === "남") g = "남";
      else if (g[0] === "여") g = "여";
      else g = "";
      list.push({
        id: id,
        name: name,
        aliases: aliases,
        race: c[3] || "",
        crew: c[4] || "FA",
        gender: g
      });
    }
    return list;
  }
  function findRoster(nick, roster) {
    var n = normName(nick);
    if (!n) return null;
    roster = roster || cache || [];
    for (var i = 0; i < roster.length; i++) {
      var r = roster[i];
      if (normName(r.name) === n) return r;
      for (var j = 0; j < (r.aliases || []).length; j++) {
        if (normName(r.aliases[j]) === n) return r;
      }
    }
    return null;
  }
  function loadRoster() {
    return fetch(ROSTER_CSV).then(function (res) {
      if (!res.ok) throw new Error("roster");
      return res.text();
    }).then(function (text) {
      cache = parseRoster(text);
      return cache;
    });
  }

  window.ROSTER_CSV = ROSTER_CSV;
  window.normName = normName;
  window.crewAlias = crewAlias;
  window.parseRoster = parseRoster;
  window.findRoster = findRoster;
  window.loadRoster = loadRoster;
  window.getRoster = function () { return cache || []; };
})();
