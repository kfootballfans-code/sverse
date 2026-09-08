// mapdata.js
const RAW_MAPS = {
  "컬러리스 페이트": "map_colorlessfate",
  "아이올로스": "map_aiolos",
  "백룸": "map_backrooms",
  "녹아웃": "map_knockout",
  "애티튜드": "map_attitude",
  "옥타곤": "map_octagon",
  "매치포인트": "map_matchpoint",
  "제인 도": "map_janedoe",
  "리트머스": "map_litmus",
  "울돌목": "map_roaringcurrents",
  "오디세이": "map_odyssey",
  "폴스타": "map_polestar",
  "메트로폴리스": "map_metropolis",
  "데자뷰": "map_dejavu",
  "도미네이터": "map_dominator",
  "이클립스": "map_eclipse",
  "데스밸리": "map_deathvalley",
  "트로이": "map_troyse",
  "킥백": "map_kickback",
  "레트로": "map_retro",
  "라데온": "map_radeon",
  "시타델": "map_citadel",
  "아포칼립스": "map_apocalypse",
  "네오다크오리진": "map_neodarkorigin",
  "투혼": "map_fightingspirit",
  "블리츠": "map_blitzy",
  "안드로메다": "map_andromeda",
  "몬티홀": "map_montyhall",
  "폴리포이드": "map_polypoid",
  "써킷 브레이커": "map_circuitbreakers",
  "판테온": "map_pantheon",
  "카멜롯": "map_camelot",
  "아카디아": "map_arcadia",
  "글라디에이터": "map_gladiator",
  "로드킬": "map_roadkill",
  "블루스톰": "map_bluestorm",
  "포트리스": "map_thefortress",
  "폴라리스 랩소디": "map_polaris_rhapsody",
  "트랜지스터": "map_transistor",
  "제3세계": "map_thirdworld",
  "스파클": "map_sparkle",
  "크로싱필드": "map_crossingfield",
  "골드러시": "map_goldrush",
  "데스티네이션": "map_destination",
  "네오실피드": "map_neosylphid",
  "단장의능선": "map_heartbreakridge",
  "민스트럴": "map_minstrel",
  "파워본드": "map_powerbond",
  "트레스패스": "map_trespass",
  "블록체인": "map_blockchain",
  "에디": "map_eddy",
  "실피드": "map_sylphid",
  "크로스게임": "map_crossgame",
  "오버워치": "map_overwatch"
};

function getMapImagePath(koreanName) {
  if (!koreanName) return "";
  
  if (RAW_MAPS[koreanName]) {
    return `map/${RAW_MAPS[koreanName]}.webp`;
  }
  
  const cleanKey = koreanName.replace(/\s+/g, "");
  for (const [name, file] of Object.entries(RAW_MAPS)) {
    if (name.replace(/\s+/g, "") === cleanKey) {
      return `map/${file}.webp`;
    }
  }

  return `map/${koreanName}.webp`;
}