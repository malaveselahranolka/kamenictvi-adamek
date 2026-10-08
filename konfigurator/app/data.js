"use strict";
const TYPES = [
  {
    id: "urnovy",
    name: "Urnov\xFD",
    sub: "90 \xD7 120 cm",
    price: "od 28 000 K\u010D",
    base: 28e3,
    dims: { w: 90, d: 120, minW: 70, maxW: 100, minD: 90, maxD: 120 },
    desc: "Kompaktn\xED pietn\xED m\xEDsto pro urnu."
  },
  {
    id: "jednohrob",
    name: "Jednohrob",
    sub: "od 90 \xD7 200 cm",
    price: "od 52 000 K\u010D",
    base: 52e3,
    dims: { w: 90, d: 200, minW: 90, maxW: 120, minD: 200, maxD: 250 },
    desc: "Klasick\xFD jednohrob s r\xE1mem a kryc\xED deskou."
  },
  {
    id: "dvojhrob",
    name: "Dvojhrob",
    sub: "od 200 \xD7 200 cm",
    price: "od 86 000 K\u010D",
    base: 86e3,
    dims: { w: 200, d: 200, minW: 200, maxW: 300, minD: 200, maxD: 300 },
    desc: "Prostorn\xFD dvojhrob pro spole\u010Dn\xE9 m\xEDsto."
  }
];
const MATERIALS = [
  {
    id: "tarn",
    name: "Bianco Tarn",
    group: "Nejpou\u017E\xEDvan\u011Bj\u0161\xED",
    desc: "Ocelov\u011B \u0161ed\xE1 \u017Eula s decentn\xEDm zrnem, vhodn\xE1 pro modern\xED kombinace.",
    texture: "textures/Bianco Tarn .jpg",
    recommended: true,
    c1: "#62656a",
    c2: "#43464b",
    c3: "#2a2c30"
  },
  {
    id: "impala",
    name: "Impala Nero",
    group: "Nejpou\u017E\xEDvan\u011Bj\u0161\xED",
    desc: "St\u0159edn\u011B tmav\xE1 \u0161ed\xE1 \u017Eula s jemn\xFDm zrnem, klidn\xE1 a univerz\xE1ln\xED.",
    texture: "textures/Impala Nero.jpg",
    c1: "#5a5a60",
    c2: "#3a3a3f",
    c3: "#222226"
  },
  {
    id: "vizag-blue",
    name: "Vizag Blue",
    group: "Nejpou\u017E\xEDvan\u011Bj\u0161\xED",
    desc: "Modro\u0161ed\xE1 \u017Eula s kresbou, dobr\xE1 pro modern\xED tmav\u0161\xED sestavy.",
    texture: "textures/Vizag Blue.jpg",
    c1: "#4a5a68",
    c2: "#283643",
    c3: "#141d26"
  },
  {
    id: "aurora-natural",
    name: "Aurora India",
    group: "Nejpou\u017E\xEDvan\u011Bj\u0161\xED",
    desc: "Hn\u011Bdo\u010Derven\xE1 kreslen\xE1 \u017Eula s p\u0159\xEDrodn\xEDm, tepl\xFDm charakterem.",
    texture: "textures/Aurora.jpg",
    c1: "#7b5b4f",
    c2: "#4b3934",
    c3: "#231b19"
  },
  {
    id: "kashmir",
    name: "Bianco Sardo",
    group: "Levn\u011Bj\u0161\xED alternativa",
    desc: "Sv\u011Btl\xFD smetanovo-\u0161ed\xFD k\xE1men s jemn\xFDm pravideln\xFDm zrnem.",
    texture: "textures/Bianco Sardo.jpg",
    c1: "#efe9df",
    c2: "#ddd3c4",
    c3: "#bdb19c"
  },
  {
    id: "rosa-beta",
    name: "Rosa Beta",
    group: "Levn\u011Bj\u0161\xED alternativa",
    desc: "Sv\u011Btl\xE1 \u0161edor\u016F\u017Eov\xE1 \u017Eula s jemn\xFDm zrnem, m\u011Bk\u010D\xED a klidn\xFD vzhled.",
    texture: "textures/Rosa Beta.jpg",
    c1: "#d9d2c9",
    c2: "#bdb5aa",
    c3: "#91887d"
  },
  {
    id: "verde-olive",
    name: "Verde Olive",
    group: "Barevn\xE9 \u017Euly",
    desc: "Zelen\u011B olivov\xE1 \u017Eula s p\u0159\xEDrodn\xED kresbou, m\xE9n\u011B obvykl\xE1 a osobit\xE1.",
    texture: "textures/Verde Olive.jpg",
    c1: "#68745a",
    c2: "#404a36",
    c3: "#22291d"
  },
  {
    id: "shivakashi",
    name: "Shivakashi",
    group: "Barevn\xE9 \u017Euly",
    desc: "Kr\xE9mov\u011B r\u016F\u017Eov\xE1 \u017Eula s bohat\u0161\xED kresbou pro tepl\xFD, dekorativn\xED vzhled.",
    texture: "textures/Shivakashi.jpg",
    c1: "#e3d0bd",
    c2: "#c6a68d",
    c3: "#8a6a58"
  },
  {
    id: "paradiso",
    name: "Paradiso Classic",
    group: "Barevn\xE9 \u017Euly",
    desc: "Tmav\u0161\xED kreslen\xE1 \u017Eula s v\xEDnovo-fialov\xFDm t\xF3nem, p\u016Fsob\xED teple a dekorativn\u011B.",
    texture: "textures/Paradiso Classic.jpg",
    c1: "#6a5560",
    c2: "#473a44",
    c3: "#2c2329"
  },
  {
    id: "rosso-africa",
    name: "Rosso Africa",
    group: "Barevn\xE9 \u017Euly",
    desc: "\u010Cervenohn\u011Bd\xE1 \u017Eula s tmav\u0161\xED kresbou, v\xFDrazn\xE1 a slavnostn\xED.",
    texture: "textures/Rosso Africa.jpg",
    c1: "#bd6249",
    c2: "#79716b",
    c3: "#383630"
  },
  {
    id: "multicolor",
    name: "Multicolor Red",
    group: "Barevn\xE9 \u017Euly",
    desc: "\u010Cervenohn\u011Bd\xE1 \u017Eula s \u017Eivou kresbou pro v\xFDrazn\u011Bj\u0161\xED, teplej\u0161\xED pomn\xEDk.",
    texture: "textures/Multicolor Red.jpg",
    c1: "#7a4438",
    c2: "#552c25",
    c3: "#341a16"
  },
  {
    id: "aurora",
    name: "Nero Assoluto",
    group: "Pr\xE9miov\xE9",
    desc: "Hlubok\xFD \u010Dern\xFD k\xE1men pro v\xFDraznou n\xE1pisovou desku a siln\xFD kontrast.",
    texture: "textures/Nero Assoluto.jpg",
    c1: "#33312f",
    c2: "#1c1b1a",
    c3: "#0c0b0b"
  },
  {
    id: "viscont",
    name: "Viscont White",
    group: "Pr\xE9miov\xE9",
    desc: "Sv\u011Btl\xE1 \u017Eula s elegantn\xED \u0161edou kresbou, dobr\xE1 pro kryc\xED desky a sokly.",
    texture: "textures/Viscont White.jpg",
    c1: "#eceae5",
    c2: "#d4d1c9",
    c3: "#b2aea4"
  },
  {
    id: "labrador",
    name: "Labrador Blue Pearl",
    group: "Pr\xE9miov\xE9",
    desc: "Pr\xE9miov\xE1 tmav\xE1 \u017Eula s modrav\xFDmi odlesky, velmi reprezentativn\xED vzhled.",
    texture: "textures/labrador-blue-pearl-studio-blue-20261003.jpg",
    c1: "#3a4a55",
    c2: "#243038",
    c3: "#141c22"
  }
];
const COMPONENTS = [
  { id: "napisova_deska", name: "N\xE1pisov\xE1 deska", desc: "Hlavn\xED svisl\xE1 deska s n\xE1pisy" },
  { id: "podlozka_1", name: "Podlo\u017Eka \u010D. 1", desc: "Horn\xED podlo\u017Eka p\u0159\xEDmo pod n\xE1pisovou deskou" },
  { id: "podlozka_2", name: "Podlo\u017Eka \u010D. 2", desc: "Spodn\xED podlo\u017Eka \u2014 p\u0159eb\xEDr\xE1 materi\xE1l r\xE1m\u016F" },
  { id: "sokl", name: "Sokl", desc: "Slo\u017Een\xED ze 3 kus\u016F kv\xE1dru" },
  { id: "ram", name: "R\xE1my", desc: "Or\xE1mov\xE1n\xED hrobov\xE9ho m\xEDsta" },
  { id: "kryci_deska", name: "Kryc\xED deska", desc: "Deska zakr\xFDvaj\xEDc\xED hrob" }
];
const STYLES = [
  {
    id: "klasik",
    name: "Klasik",
    desc: "Sv\u011Btl\xFD spodek, tmav\xE1 n\xE1pisov\xE1 deska. Nad\u010Dasov\xFD a \u010Dist\xFD.",
    shape: "rovny",
    materials: { napisova_deska: "impala", podlozka_1: "impala", podlozka_2: "tarn", sokl: "tarn", ram: "tarn", kryci_deska: "tarn" }
  },
  {
    id: "mono",
    name: "Monolit",
    desc: "Celobarevn\xFD \u2014 jeden materi\xE1l na v\u0161e. Modern\xED minimalistick\xFD.",
    shape: "rovny",
    materials: { napisova_deska: "impala", podlozka_1: "impala", podlozka_2: "impala", sokl: "impala", ram: "impala", kryci_deska: "impala" }
  },
  {
    id: "kontrast",
    name: "Kontrast",
    desc: "Tmav\xE1 n\xE1pisov\xE1 deska a r\xE1my, sv\u011Btl\xE1 kryc\xED deska a sokl.",
    shape: "rovny",
    materials: { napisova_deska: "aurora", podlozka_1: "aurora", podlozka_2: "aurora", sokl: "kashmir", ram: "aurora", kryci_deska: "kashmir" }
  },
  {
    id: "premium",
    name: "Premium",
    desc: "Pr\xE9miov\xFD Labrador Blue na v\u0161e. Exkluzivn\xED a p\u016Fsobiv\xFD.",
    shape: "vlna-sikma",
    materials: { napisova_deska: "labrador", podlozka_1: "labrador", podlozka_2: "labrador", sokl: "labrador", ram: "labrador", kryci_deska: "labrador" }
  },
  {
    id: "elegance",
    name: "Elegance",
    desc: "Tepl\xFD Paradiso s tmavou podlo\u017Ekou. Jemn\xFD a d\u016Fstojn\xFD.",
    shape: "zkosene",
    materials: { napisova_deska: "paradiso", podlozka_1: "paradiso", podlozka_2: "aurora", sokl: "aurora", ram: "aurora", kryci_deska: "paradiso" }
  }
];
const SHAPES = [
  {
    id: "rovny",
    name: "Rovn\xFD",
    description: "\u010Cist\xE1 rovn\xE1 deska s klidn\xFDmi proporcemi.",
    layout: { family: { x: 0.5, y: 0.148, size: 0.71 }, names: { x: 0.505, y: 0.209, w: 0.52, size: 0.75 }, sub: { x: 0.52, y: 0.955, size: 0.75 }, ornament: { x: 0.18, y: 0.2, h: 0.62 }, photo: { x: 0.814, y: 0.274, h: 0.108 } },
    layoutD: { family: { x: 0.5, y: 0.151, size: 0.8 }, names: { x: 0.5, y: 0.266, w: 0.85, size: 0.6 }, sub: { x: 0.5, y: 0.932, size: 0.71 }, ornament: { x: 0.5, y: 0.2, h: 0.62 }, photo: { x: 0.5, y: 0.326, h: 0.095 } }
  },
  {
    id: "zkosene",
    name: "Zkosen\xFD",
    description: "Rovn\xE1 horn\xED hrana a jemn\u011B z\xFA\u017Een\xE9 boky.",
    // ornament výš a dál od šikmé hrany (dole se tvar zužuje), fotka vpravo od jmen,
    layout: { family: { x: 0.5, y: 0.15, size: 0.8 }, names: { x: 0.5, y: 0.196, w: 0.52, size: 0.6 }, sub: { x: 0.5, y: 0.942, size: 0.7 }, ornament: { x: 0.194, y: 0.191, h: 0.62 }, photo: { x: 0.77, y: 0.245, h: 0.086 } },
    layoutD: { family: { x: 0.5, y: 0.15, size: 0.8 }, names: { x: 0.495, y: 0.224, w: 0.64, size: 0.6 }, sub: { x: 0.5, y: 0.936, size: 0.8 }, ornament: { x: 0.163, y: 0.226, h: 0.62 }, photo: { x: 0.487, y: 0.287, h: 0.095 } }
  },
  {
    id: "vlna-sikma",
    name: "Vlna",
    description: "Plynul\xE1 vlna a m\u011Bkce tvarovan\xE9 spodn\xED rohy.",
    // Přesný obrys z dodané SVG (vlna.svg). Konvertor normalizuje podle bbox, takže
    // translace/měřítko nevadí. Stačí vyměnit svgPath za jinou cestu a tvar se změní.
    svgPath: "M454.425,1646.946L1431.147,1646.946C1431.147,1646.946 1535.585,1439.304 1532.905,1135.711C1530.224,832.117 1577.336,241.368 1577.336,241.368C1577.336,241.368 1447.268,274.056 1138.441,209.523C650.054,107.47 564.489,108.304 310.065,204.705C310.065,204.705 348.963,891.866 381.554,1289.646C399.854,1513.009 454.425,1646.946 454.425,1646.946Z",
    layout: { family: { x: 0.5, y: 0.193, size: 0.8 }, names: { x: 0.5, y: 0.257, w: 0.52, size: 0.6 }, sub: { x: 0.501, y: 0.955, size: 0.7 }, ornament: { x: 0.16, y: 0.229, h: 0.62 }, photo: { x: 0.781, y: 0.313, h: 0.086 } },
    layoutD: { family: { x: 0.5, y: 0.171, size: 0.8 }, names: { x: 0.5, y: 0.286, w: 0.75, size: 0.6 }, sub: { x: 0.501, y: 0.955, size: 0.7 } }
  },
  { id: "foto-oblouk", name: "Oblouk se z\xFA\u017Een\xEDm", dvojhrobOnly: true, description: "\u0160irok\xFD horn\xED oblouk a boky zu\u017Euj\xEDc\xED se sm\u011Brem k podlo\u017Ece." },
  { id: "vlna-dvojita", name: "Dvojit\xE1 vlna", dvojhrobOnly: true, description: "Dva jemn\xE9 vrcholy propojen\xE9 do jedn\xE9 spole\u010Dn\xE9 desky." },
  {
    id: "konvice",
    name: "Konvice",
    // Obrys z Konvice.svg (translace v původním SVG nevadí — normalizuje se podle bbox).
    // Pro dvojhrob se nenabízí (roztažený do šířky nevypadá dobře).
    svgPath: "M136.438,320L323.431,320C323.431,320 360.457,271.694 351.254,181.467C345.288,122.971 360.712,52.072 360.712,52.072C310.18,55.615 283.528,56.303 253.04,46.077C191.002,25.269 165.615,32.423 165.615,32.423L162.065,16.248L111.082,29.585C111.082,29.585 122.632,83.994 123.864,117.229C124.983,147.417 115.933,168.274 112.483,210.827C108.254,262.995 136.438,320 136.438,320Z",
    noDvojhrob: true,
    layout: { family: { x: 0.546, y: 0.249, size: 0.7 }, names: { x: 0.526, y: 0.295, w: 0.52, size: 0.7 }, sub: { x: 0.494, y: 0.956, size: 0.7 }, ornament: { x: 0.159, y: 0.282, h: 0.61 }, photo: { x: 0.818, y: 0.352, h: 0.101 } },
    layoutD: { family: { x: 0.508, y: 0.237, size: 0.81 }, names: { x: 0.505, y: 0.314, w: 0.6, size: 0.61 }, sub: { x: 0.48, y: 0.954, size: 0.69 }, photo: { x: 0.232, y: 0.361, h: 0.097 } }
  },
  {
    id: "svitek",
    name: "Svitek",
    // Přesný obrys z fotky (pixelový obtah, viz predloha.jpg) — Svitek.svg.
    // ornamentAsset = rytina z předlohy; kreslí se u ornamentu „růže" podél levého okraje.
    ornamentAsset: "assets/svitek-rytina-mr5ehc7j.png",
    svgPath: "M296.0,300.0 L298.3,305.0 L302.7,310.0 L303.0,314.0 L302.3,317.0 L304.0,321.0 L302.0,324.0 L304.0,328.0 L306.3,330.0 L429.7,333.0 L517.7,358.0 L534.0,362.0 L560.3,366.0 L643.7,370.0 L652.7,371.0 L658.0,373.0 L661.7,379.0 L663.0,383.0 L663.0,388.0 L662.0,391.0 L662.0,397.0 L660.0,408.0 L659.0,425.0 L657.0,435.0 L657.0,441.0 L655.0,453.0 L655.0,461.0 L654.0,464.0 L652.0,485.0 L650.0,495.0 L649.0,508.0 L647.0,516.0 L645.0,531.0 L642.0,543.0 L642.0,547.0 L639.7,559.0 L633.0,580.0 L628.0,601.0 L622.0,621.0 L604.0,675.0 L596.3,702.0 L585.0,737.0 L585.0,740.0 L580.0,763.0 L578.0,780.0 L577.0,783.0 L577.0,789.0 L576.0,792.0 L576.0,807.0 L575.0,813.0 L293.0,813.0 L295.3,811.0 L295.0,805.0 L293.7,799.0 L291.0,793.0 L292.0,790.0 L291.0,784.0 L288.0,772.0 L281.7,754.0 L281.0,750.0 L267.3,711.0 L259.0,669.0 L237.3,655.0 L233.0,651.0 L232.3,645.0 L233.0,643.0 L233.0,636.0 L234.0,633.0 L233.3,629.0 L234.0,626.0 L232.0,618.0 L232.0,608.0 L233.0,605.0 L233.0,601.0 L236.0,594.0 L236.0,591.0 L232.0,581.0 L232.0,570.0 L233.0,567.0 L232.7,562.0 L233.7,559.0 L233.0,555.0 L234.0,550.0 L233.0,544.0 L235.0,537.0 L235.0,534.0 L233.0,526.0 L233.0,520.0 L232.0,517.0 L232.7,506.0 L230.0,488.0 L230.0,478.0 L232.0,473.0 L230.3,469.0 L227.0,466.0 L226.7,464.0 L224.7,461.0 L224.0,449.0 L222.0,443.0 L222.0,431.0 L220.7,426.0 L217.3,421.0 L217.7,418.0 L216.7,415.0 L216.3,408.0 L214.0,404.0 L214.0,391.0 L210.0,383.0 L208.7,377.0 L207.0,374.0 L207.0,368.0 L205.3,363.0 L194.7,360.0 L191.3,356.0 L189.0,348.0 L189.0,338.0 L189.7,336.0 L194.3,333.0 L196.7,328.0 L198.3,327.0 L208.3,324.0 L243.3,316.0 L262.7,308.0 L285.0,300.0 Z",
    noDvojhrob: true,
    layout: { family: { x: 0.627, y: 0.244, size: 0.8 }, names: { x: 0.632, y: 0.287, w: 0.52, size: 0.6 }, sub: { x: 0.579, y: 0.934, size: 0.6 }, ornament: { x: 0.367, y: -0.03, h: 1.09 }, photo: { x: 0.405, y: 0.328, h: 0.086 } },
    layoutD: { family: { x: 0.577, y: 0.239, size: 0.79 }, names: { x: 0.567, y: 0.322, w: 0.57, size: 0.61 }, sub: { x: 0.517, y: 0.922, size: 0.65 }, ornament: { x: 0.265, y: -7e-3, h: 1.03 }, photo: { x: 0.298, y: 0.371, h: 0.097 } }
  },
  {
    id: "paprsky",
    name: "Paprsky",
    noDvojhrob: true,
    // svgPath = obrys desky. detailPath = vybroušený paprsek: stejná žula, jen vybroušená
    // (světlý matný detail). V 3D ho kreslí addHonedDetail / buildHonedDetailMesh —
    // detailPath se zarovná podle bboxu obrysu (svgPath), takže sedí přesně do desky.
    svgPath: "M476.692,1819.886l1033.332,0c0,0 240.978,-350.506 159.862,-685.032c-100.726,-415.397 47.93,-821.222 47.93,-821.222c0,0 -419.117,85.241 -995.28,-208.679c0,0 -236.838,104.153 -313.657,109.525l23.647,116.055l-79.45,33.521l50.271,133.836l-94.536,24.241c0,0 33.005,266.388 -13.47,510.087c-28.026,589.009 181.351,787.668 181.351,787.668Z",
    detailPath: "M348.683,360.449l83.313,-31.836c0,0 96.406,180.938 -33.297,677.345c-95.111,547.062 99.336,818.108 99.336,818.108l-18.847,0.283c0,0 -218.323,-363.077 -134.767,-825.213c93.453,-516.874 4.262,-638.686 4.262,-638.686Z",
    // ornament: růže/kříž mezi vybroušeným pruhem a blokem jmen (aby symbol nelezl do pruhu),
    // fotka vpravo od jmen (vlevo by se tlačila s růží a pruhem),
    layout: { family: { x: 0.555, y: 0.267, size: 0.7 }, names: { x: 0.539, y: 0.338, w: 0.52, size: 0.65 }, sub: { x: 0.489, y: 0.955, size: 0.62 }, ornament: { x: 0.209, y: 0.259, h: 0.54 }, photo: { x: 0.81, y: 0.4, h: 0.093 } },
    layoutD: { family: { x: 0.554, y: 0.252, size: 0.8 }, names: { x: 0.569, y: 0.326, w: 0.73, size: 0.6 }, sub: { x: 0.515, y: 0.964, size: 0.68 }, ornament: { x: 0.226, y: 0.272, h: 0.59 }, photo: { x: 0.536, y: 0.388, h: 0.095 } }
  },
  // ── Dělené dvojhroby: dvě nápisové desky + prostřední sloupek ──
  //    (na kříž / gravírku — dle předlohy z fotky). split → geometrii staví
  //    reshapeDeska, nápis má vlastní větev v paintInscriptionCanvas.
  //    dvojhrobOnly → nabízí se jen pro dvojhrob. splitGapOnly → bez
  //    sloupku, jen dvě desky s větší mezerou.
  { id: "dvoj-sloupek", name: "D\u011Blen\xFD se sloupkem", description: "Dv\u011B vyv\xE1\u017Een\xE9 desky a vystup\u0148ovan\xFD st\u0159ed pro zvolen\xFD motiv.", split: true, dvojhrobOnly: true },
  { id: "dvoj-sloupek-vlna", name: "D\u011Blen\xE1 vlna", description: "Zrcadlov\xE9 vlny po stran\xE1ch spole\u010Dn\xE9ho st\u0159edov\xE9ho d\xEDlu.", split: true, dvojhrobOnly: true },
  { id: "dvoj-mezera", name: "Dv\u011B desky", description: "Dv\u011B samostatn\xE9 desky v p\u0159irozen\xFDch proporc\xEDch s voln\xFDm st\u0159edem.", split: true, splitGapOnly: true, dvojhrobOnly: true },
  {
    id: "deleny-kriz",
    name: "D\u011Blen\xE1 deska s v\xFD\u0159ezem k\u0159\xED\u017Ee",
    description: "Dva d\xEDly \u017Euly Labrador s k\u0159\xED\u017Eem tvo\u0159en\xFDm voln\xFDm prostorem mezi deskou a sloupkem.",
    noDvojhrob: true,
    gallery: true,
    thumb: "deleny-kriz.svg",
    decoration: "cross-cutout",
    inscriptionAxis: 0.69,
    svgPath: "M250 0H800V900H250V230H350V180H250Z M0 20H200V180H100V230H200V900H0Z",
    layout: { family: { x: 0.69, y: 0.34, size: 0.68 }, names: { x: 0.69, y: 0.43, w: 0.6, bottom: 0.78, size: 0.62 }, sub: { x: 0.69, y: 0.88, size: 0.5 }, photo: { x: 0.85, y: 0.36, h: 0.1 } }
  },
  {
    id: "srdce-strom",
    name: "Srdce se stromem",
    description: "Deska ve tvaru srdce s plastick\xFDm stromem a odd\u011Blenou spodn\xED \u010D\xE1st\xED.",
    noDvojhrob: true,
    gallery: true,
    thumb: "srdce-strom.svg",
    decoration: "tree-relief",
    inscriptionAxis: 0.62,
    svgPath: "M248.0 900 C290.4 813.6 444.8 711.0 597.6 657.0 C675.2 607.5 734.4 525.6 764.0 429.3 C789.6 347.4 800 284.4 800 247.5 C798.4 179.1 777.6 130.5 730.4 100.8 C656.0 53.1 576.8 77.4 520.0 125.1 C500.0 141.3 488.0 156.6 478.4 165.6 C452.8 105.3 415.2 65.7 361.6 54.9 C283.2 39.6 204.0 64.8 144.8 121.5 C90.4 172.8 76.8 245.7 93.6 315.9 C110.4 388.8 178.4 486.0 212.0 576.0 C244.8 657.9 255.2 726.3 236.8 797.4 C225.6 848.7 212.8 882.9 213.6 900 Z M260.8 900 C301.6 826.2 453.6 721.8 600.0 669.6 C620.0 734.4 631.2 804.6 672.0 900 Z M136.0 900 C180.0 810.9 184.0 719.1 152.8 642.6 C120.0 563.4 61.6 465.3 32.0 377.1 L0 355.5 L12.8 324.0 L45.6 358.2 C24.8 294.3 23.2 243.0 33.6 196.2 L20.8 180.0 L39.2 171.0 L49.6 214.2 C60.0 155.7 80.0 123.3 112.0 93.6 L115.2 54.9 L136.8 51.3 L134.4 90.0 C171.2 45.0 211.2 17.1 248.0 0 L274.4 13.5 L248.0 32.4 C315.2 14.4 364.0 40.5 408.0 68.4 L401.6 81.0 C352.0 61.2 312.0 45.0 257.6 54.9 C201.6 77.4 150.4 110.7 122.4 156.6 C94.4 198.9 84.0 258.3 107.2 322.2 C132.0 390.6 184.8 466.2 214.4 545.4 C245.6 629.1 261.6 713.7 248.0 794.7 C239.2 848.7 243.2 879.3 253.6 900 Z",
    layout: { family: { x: 0.62, y: 0.26, size: 0.68 }, names: { x: 0.62, y: 0.33, w: 0.53, bottom: 0.64, size: 0.62 }, sub: { x: 0.55, y: 0.72, size: 0.5 }, photo: { x: 0.84, y: 0.35, h: 0.1 } }
  },
  // ── Atypicke tvary z fotek (galerie Dalsi) ──
  //    Obtazeno nastrojem tvar-z-fotky; thumb = fotka s vodoznakem v Tvary/thumbs,
  //    ornamentAsset = rytina z predlohy (kresli se u ornamentu ruze).
  {
    id: "atyp-02",
    name: "Atypick\xFD 2",
    gallery: true,
    thumb: "tvar-02.jpg",
    ornamentAsset: "assets/atyp-02-rytina-white.png",
    svgPath: "M369.0,281.0 L396.7,294.0 L428.3,298.0 L509.0,301.0 L600.0,335.0 L671.7,353.0 L674.0,379.0 L674.0,439.0 L663.0,547.0 L650.0,606.0 L607.0,730.0 L595.0,793.0 L594.0,814.0 L616.0,816.0 L249.0,816.0 L252.0,776.0 L252.0,738.0 L249.0,705.0 L233.0,635.0 L192.0,513.0 L189.0,487.0 L190.0,473.0 L200.0,444.0 L194.0,425.0 L206.7,418.0 L208.0,394.0 L213.7,372.0 L222.0,357.0 L233.0,345.0 L257.0,331.0 L272.7,326.0 L298.3,322.0 L303.3,311.0 L313.7,298.0 L332.0,286.0 L347.0,281.0 Z",
    noDvojhrob: true,
    layout: { family: { x: 0.716, y: 0.24, size: 0.6 }, names: { x: 0.758, y: 0.297, w: 0.52, size: 0.61 }, sub: { x: 0.483, y: 0.955, size: 0.61 }, ornament: { x: 0.198, y: -0.111, h: 1.01 }, photo: { x: 0.539, y: 0.339, h: 0.088 } }
  },
  {
    id: "atyp-04",
    name: "Atypick\xFD 4",
    gallery: true,
    thumb: "tvar-04.jpg",
    ornamentAsset: "assets/atyp-04-rytina-white.png",
    svgPath: "M242.0,299.0 L320.0,329.0 L327.0,340.0 L400.7,364.0 L448.3,372.0 L527.3,375.0 L566.7,405.0 L620.3,432.0 L591.0,563.0 L588.0,677.0 L604.0,803.0 L639.0,805.0 L273.0,805.0 L284.0,761.0 L280.0,700.0 L218.3,524.0 L212.3,473.0 L214.3,367.0 L225.0,299.0 Z",
    noDvojhrob: true,
    layout: { family: { x: 0.554, y: 0.275, size: 0.7 }, names: { x: 0.556, y: 0.314, w: 0.52, size: 0.55 }, sub: { x: 0.536, y: 0.955, size: 0.6 }, ornament: { x: 0.106, y: -0.141, h: 1.19 }, photo: { x: 0.348, y: 0.355, h: 0.079 } }
  },
  {
    id: "atyp-05",
    name: "Atypick\xFD 5",
    gallery: true,
    thumb: "tvar-05.jpg",
    ornamentAsset: "assets/atyp-05-rytina-mr5e4ibg.png",
    svgPath: "M974.0,364.0 L981.0,441.0 L982.0,518.0 L977.0,581.0 L968.0,643.0 L955.0,703.0 L940.0,757.0 L871.0,966.0 L848.0,1045.0 L837.0,1094.0 L827.0,1160.0 L240.0,1160.0 L368.7,1158.0 L389.0,1051.0 L352.7,989.0 L332.7,948.0 L319.0,905.0 L315.0,876.0 L316.0,824.0 L343.0,658.0 L346.0,619.0 L347.0,545.0 L349.0,536.0 L355.3,532.0 L443.3,507.0 L468.0,495.0 L518.0,465.0 L631.0,459.0 L733.7,438.0 L822.0,414.0 L888.0,392.0 L961.0,364.0 Z",
    noDvojhrob: true,
    layout: { family: { x: 0.636, y: 0.272, size: 0.71 }, names: { x: 0.628, y: 0.314, w: 0.52, size: 0.55 }, sub: { x: 0.633, y: 0.92, size: 0.5 }, ornament: { x: 0.262, y: 0.096, h: 0.92 }, photo: { x: 0.428, y: 0.356, h: 0.079 } }
  },
  {
    id: "atyp-08",
    name: "Atypick\xFD 8",
    gallery: true,
    thumb: "tvar-08.jpg",
    ornamentAsset: "assets/atyp-08-rytina-white.png",
    svgPath: "M231.0,276.0 L265.3,288.0 L318.3,302.0 L322.0,306.0 L317.3,329.0 L319.0,331.0 L398.7,366.0 L463.0,388.0 L513.3,397.0 L639.7,400.0 L645.0,451.0 L646.0,515.0 L634.0,682.0 L619.0,781.0 L611.0,815.0 L600.0,848.0 L280.0,848.0 L256.0,773.0 L238.0,704.0 L222.0,613.0 L213.0,545.0 L207.0,433.0 L207.0,357.0 L210.0,321.0 L218.0,276.0 Z",
    noDvojhrob: true,
    layout: { family: { x: 0.605, y: 0.299, size: 0.8 }, names: { x: 0.613, y: 0.345, w: 0.52, size: 0.6 }, sub: { x: 0.648, y: 0.953, size: 0.6 }, ornament: { x: 0.226, y: 0.093, h: 0.92 }, photo: { x: 0.386, y: 0.387, h: 0.086 } }
  },
  {
    id: "atyp-09",
    name: "Atypick\xFD 9",
    gallery: true,
    thumb: "tvar-09.jpg",
    svgPath: "M234.0,292.0 L369.7,316.0 L491.7,332.0 L653.0,337.0 L657.0,412.0 L656.0,454.0 L646.0,567.0 L633.0,640.0 L623.0,681.0 L607.3,733.0 L588.7,783.0 L632.7,786.0 L634.0,788.0 L282.0,788.0 L261.7,734.0 L243.0,673.0 L226.0,585.0 L218.0,504.0 L215.0,428.0 L218.0,340.0 L223.0,292.0 Z",
    noDvojhrob: true,
    layout: { family: { x: 0.5, y: 0.207, size: 0.8 }, names: { x: 0.496, y: 0.3, w: 0.52, size: 0.6 }, sub: { x: 0.496, y: 0.955, size: 0.6 }, photo: { x: 0.282, y: 0.343, h: 0.086 } }
  },
  {
    id: "atyp-10",
    name: "Atypick\xFD 10",
    gallery: true,
    thumb: "tvar-10.jpg",
    ornamentAsset: "assets/atyp-10-rytina-mr5ejvye.png",
    svgPath: "M308.0,269.0 L371.7,298.0 L399.3,308.0 L472.7,328.0 L549.3,338.0 L672.7,341.0 L649.0,432.0 L633.0,522.0 L620.0,648.0 L617.0,709.0 L619.0,785.0 L626.0,844.0 L658.0,847.0 L230.0,847.0 L245.7,786.0 L230.0,776.0 L209.0,757.0 L196.3,737.0 L191.0,717.0 L193.0,678.0 L219.0,554.0 L225.0,484.0 L224.0,448.0 L219.0,402.0 L201.0,315.0 L205.3,311.0 L246.3,294.0 L297.0,269.0 Z",
    noDvojhrob: true,
    layout: { family: { x: 0.583, y: 0.228, size: 0.8 }, names: { x: 0.579, y: 0.282, w: 0.52, size: 0.6 }, sub: { x: 0.651, y: 0.97, size: 0.6 }, ornament: { x: 0.176, y: 0.033, h: 0.97 }, photo: { x: 0.366, y: 0.325, h: 0.086 } }
  },
  {
    id: "atyp-12",
    name: "Atypick\xFD 12",
    gallery: true,
    thumb: "tvar-12.jpg",
    ornamentAsset: "assets/atyp-12-rytina-mr5embpv.png",
    svgPath: "M272.0,302.0 L274.0,319.0 L361.7,322.0 L381.0,325.0 L528.3,370.0 L652.0,375.0 L624.0,484.0 L616.0,546.0 L616.0,602.0 L625.0,677.0 L623.0,727.0 L612.0,772.0 L590.0,827.0 L254.0,827.0 L227.0,787.0 L184.7,744.0 L177.0,690.0 L176.0,648.0 L185.0,555.0 L185.0,479.0 L178.0,417.0 L165.0,340.0 L169.0,336.0 L199.3,323.0 L258.0,302.0 Z",
    noDvojhrob: true,
    layout: { family: { x: 0.606, y: 0.225, size: 0.7 }, names: { x: 0.604, y: 0.263, w: 0.52, size: 0.6 }, sub: { x: 0.634, y: 0.964, size: 0.6 }, ornament: { x: 0.203, y: -0.052, h: 1 }, photo: { x: 0.385, y: 0.307, h: 0.086 } }
  },
  {
    id: "atyp-13",
    name: "Atypick\xFD 13",
    gallery: true,
    thumb: "tvar-13.jpg",
    ornamentAsset: "assets/atyp-13-rytina-mr5esp3y.png",
    svgPath: "M309.0,258.0 L410.0,311.0 L446.0,326.0 L490.3,340.0 L556.3,352.0 L671.0,355.0 L642.0,476.0 L630.0,547.0 L621.0,648.0 L621.0,720.0 L624.0,777.0 L631.7,830.0 L675.0,832.0 L227.0,832.0 L238.0,782.0 L244.0,729.0 L246.0,667.0 L245.0,583.0 L232.0,449.0 L204.0,309.0 L211.0,303.0 L298.0,258.0 Z",
    noDvojhrob: true,
    layout: { family: { x: 0.592, y: 0.255, size: 0.7 }, names: { x: 0.596, y: 0.288, w: 0.52, size: 0.6 }, sub: { x: 0.646, y: 0.957, size: 0.6 }, ornament: { x: 0.177, y: -0.06, h: 1.08 }, photo: { x: 0.374, y: 0.333, h: 0.086 } }
  },
  {
    id: "atyp-14",
    name: "Atypick\xFD 14",
    gallery: true,
    thumb: "tvar-14.jpg",
    ornamentAsset: "assets/atyp-14-rytina-mr5eu84n.png",
    svgPath: "M421.0,365.0 L430.7,410.0 L468.3,415.0 L579.0,436.0 L699.3,444.0 L762.7,452.0 L823.0,467.0 L869.3,484.0 L892.3,496.0 L890.0,518.0 L872.0,597.0 L866.0,658.0 L867.0,738.0 L879.0,825.0 L885.0,890.0 L885.0,976.0 L877.0,1042.0 L866.0,1087.0 L846.3,1143.0 L820.3,1197.0 L840.0,1199.0 L191.0,1199.0 L192.7,1197.0 L334.0,1193.0 L313.7,1138.0 L298.0,1086.0 L290.0,1052.0 L280.0,985.0 L278.0,954.0 L279.0,890.0 L289.0,804.0 L305.0,704.0 L306.0,647.0 L303.0,608.0 L295.0,566.0 L296.7,560.0 L292.0,549.0 L293.0,541.0 L282.0,496.0 L284.3,474.0 L281.0,468.0 L281.0,454.0 L270.7,451.0 L265.0,437.0 L264.0,423.0 L270.7,417.0 L271.3,409.0 L275.7,406.0 L410.0,365.0 Z",
    noDvojhrob: true,
    layout: { family: { x: 0.671, y: 0.233, size: 0.71 }, names: { x: 0.661, y: 0.279, w: 0.52, size: 0.6 }, sub: { x: 0.631, y: 0.967, size: 0.6 }, ornament: { x: 0.287, y: -0.011, h: 0.94 }, photo: { x: 0.466, y: 0.322, h: 0.086 } }
  },
  {
    id: "atyp-15",
    name: "Atypick\xFD 15",
    gallery: true,
    thumb: "tvar-15.jpg",
    ornamentAsset: "assets/atyp-15-rytina-white.png",
    svgPath: "M398.0,364.0 L437.7,391.0 L471.0,411.0 L494.3,422.0 L513.0,428.0 L526.3,431.0 L562.3,437.0 L613.0,444.0 L746.0,450.0 L769.3,452.0 L792.3,455.0 L827.7,463.0 L858.3,473.0 L876.3,480.0 L905.0,493.0 L917.7,500.0 L920.3,503.0 L921.0,507.0 L896.0,591.0 L887.0,626.0 L887.0,630.0 L883.0,649.0 L882.0,665.0 L880.0,677.0 L880.0,714.0 L881.0,717.0 L881.0,723.0 L883.0,735.0 L884.0,752.0 L886.0,760.0 L887.0,773.0 L889.0,780.0 L889.0,784.0 L891.0,792.0 L891.0,797.0 L894.0,809.0 L896.0,824.0 L898.0,830.0 L899.0,839.0 L902.0,852.0 L903.0,862.0 L905.0,870.0 L906.0,884.0 L907.0,887.0 L907.0,893.0 L908.0,896.0 L908.0,903.0 L909.0,906.0 L909.0,916.0 L910.0,919.0 L910.0,942.0 L911.0,945.0 L911.0,979.0 L910.0,982.0 L910.0,1002.0 L909.0,1005.0 L909.0,1011.0 L908.0,1014.0 L908.0,1019.0 L907.0,1022.0 L905.0,1038.0 L898.0,1065.0 L890.3,1088.0 L881.3,1111.0 L862.3,1150.0 L845.3,1179.0 L835.0,1195.0 L329.0,1195.0 L321.7,1177.0 L306.0,1131.0 L297.0,1094.0 L293.0,1072.0 L293.0,1068.0 L290.7,1058.0 L274.7,1046.0 L264.3,1042.0 L263.3,1041.0 L262.3,1036.0 L263.0,1024.0 L264.0,1019.0 L269.0,1007.0 L269.0,1002.0 L271.0,997.0 L269.7,995.0 L263.7,990.0 L260.0,981.0 L259.0,976.0 L259.0,959.0 L259.7,957.0 L259.0,948.0 L260.0,945.0 L259.0,941.0 L259.0,930.0 L255.3,923.0 L252.0,913.0 L252.0,908.0 L251.0,905.0 L251.0,862.0 L255.0,852.0 L254.3,848.0 L251.0,840.0 L251.0,826.0 L255.0,814.0 L255.0,812.0 L251.0,807.0 L248.3,802.0 L246.0,791.0 L246.0,751.0 L245.0,748.0 L245.0,744.0 L248.0,732.0 L244.0,721.0 L244.0,700.0 L244.7,697.0 L241.7,692.0 L240.0,684.0 L241.0,678.0 L241.0,647.0 L239.0,635.0 L239.0,622.0 L241.0,616.0 L241.0,613.0 L236.7,605.0 L235.0,600.0 L233.0,589.0 L232.0,568.0 L231.0,565.0 L231.0,560.0 L230.0,557.0 L230.0,552.0 L228.0,541.0 L227.0,526.0 L224.0,513.0 L224.0,501.0 L226.0,498.0 L232.0,494.0 L267.0,477.0 L271.7,473.0 L272.0,468.0 L270.0,460.0 L269.0,449.0 L266.0,436.0 L266.0,430.0 L264.0,423.0 L262.0,411.0 L262.3,408.0 L264.0,405.0 L267.3,403.0 L273.3,401.0 L311.0,391.0 L337.7,383.0 L374.7,369.0 L386.0,364.0 Z",
    noDvojhrob: true,
    layout: { family: { x: 0.584, y: 0.236, size: 0.7 }, names: { x: 0.59, y: 0.264, w: 0.52, size: 0.6 }, sub: { x: 0.555, y: 0.965, size: 0.6 }, ornament: { x: 0.15, y: 7e-3, h: 0.92 }, photo: { x: 0.373, y: 0.307, h: 0.086 } }
  },
  {
    id: "atyp-16",
    name: "Atypick\xFD 16",
    gallery: true,
    thumb: "tvar-16.jpg",
    ornamentAsset: "assets/atyp-16-rytina-mr5exkyi.png",
    svgPath: "M477.0,364.0 L575.3,407.0 L660.3,437.0 L701.0,449.0 L770.0,462.0 L852.3,467.0 L868.7,470.0 L850.0,568.0 L841.0,636.0 L826.0,778.0 L818.0,903.0 L818.0,974.0 L822.0,1054.0 L831.0,1131.0 L846.0,1201.0 L289.0,1201.0 L327.0,1078.0 L309.0,1065.0 L291.0,1048.0 L271.7,1021.0 L263.0,996.0 L262.0,964.0 L270.0,922.0 L301.0,826.0 L312.0,784.0 L327.0,693.0 L332.0,617.0 L332.0,540.0 L327.0,467.0 L319.0,400.0 L323.3,396.0 L401.0,383.0 L463.0,364.0 Z",
    noDvojhrob: true,
    layout: { family: { x: 0.602, y: 0.236, size: 0.8 }, names: { x: 0.611, y: 0.266, w: 0.52, size: 0.6 }, sub: { x: 0.596, y: 0.956, size: 0.6 }, ornament: { x: 0.199, y: -0.035, h: 0.92 }, photo: { x: 0.403, y: 0.309, h: 0.086 } }
  },
  {
    id: "atyp-17",
    name: "Atypick\xFD 17",
    gallery: true,
    thumb: "tvar-17.jpg",
    ornamentAsset: "assets/atyp-17-rytina-mr5f127u.png",
    svgPath: "M495.0,362.0 L525.3,366.0 L562.3,375.0 L662.0,411.0 L743.0,436.0 L785.7,442.0 L883.0,445.0 L890.0,447.0 L898.3,459.0 L900.0,507.0 L898.0,571.0 L890.0,644.0 L875.0,720.0 L833.0,870.0 L810.0,977.0 L801.0,1046.0 L798.0,1115.0 L342.0,1115.0 L320.3,1052.0 L258.7,932.0 L245.7,901.0 L232.0,858.0 L217.0,791.0 L209.0,725.0 L209.0,646.0 L213.0,601.0 L220.0,560.0 L231.7,516.0 L357.0,513.0 L373.0,417.0 L377.7,374.0 L382.7,370.0 L392.7,368.0 L451.0,362.0 Z",
    noDvojhrob: true,
    layout: { family: { x: 0.608, y: 0.236, size: 0.7 }, names: { x: 0.609, y: 0.264, w: 0.52, size: 0.6 }, sub: { x: 0.63, y: 0.96, size: 0.61 }, ornament: { x: 0.302, y: 0.167, h: 0.83 }, photo: { x: 0.393, y: 0.306, h: 0.086 } }
  },
  {
    id: "atyp-18",
    name: "Atypick\xFD 18",
    gallery: true,
    thumb: "tvar-18.jpg",
    ornamentAsset: "assets/atyp-18-rytina-white.png",
    svgPath: "M386.0,364.0 L469.0,420.0 L507.0,439.0 L555.3,457.0 L596.0,469.0 L659.3,482.0 L775.7,495.0 L817.0,503.0 L894.7,529.0 L913.7,537.0 L921.7,543.0 L923.0,548.0 L921.0,558.0 L895.0,659.0 L886.0,720.0 L884.0,813.0 L889.0,910.0 L883.0,974.0 L872.0,1025.0 L858.3,1068.0 L844.3,1102.0 L825.0,1140.0 L329.0,1140.0 L328.0,1100.0 L317.0,1026.0 L297.0,935.0 L259.0,791.0 L241.0,691.0 L230.0,577.0 L229.0,438.0 L230.7,426.0 L239.7,411.0 L375.0,364.0 Z",
    noDvojhrob: true,
    layout: { family: { x: 0.589, y: 0.278, size: 0.79 }, names: { x: 0.582, y: 0.317, w: 0.52, size: 0.6 }, sub: { x: 0.587, y: 0.964, size: 0.6 }, ornament: { x: 0.194, y: -7e-3, h: 0.92 }, photo: { x: 0.361, y: 0.357, h: 0.086 } }
  },
  {
    id: "atyp-19",
    name: "Atypick\xFD 19",
    inscriptionAxis: 0.6,
    gallery: true,
    thumb: "tvar-19.jpg",
    ornamentAsset: "assets/atyp-19-rytina-white.png",
    svgPath: "M441.0,364.0 L444.0,368.0 L445.7,385.0 L524.0,389.0 L608.7,398.0 L650.0,406.0 L724.7,425.0 L778.7,433.0 L830.0,437.0 L924.0,440.0 L925.0,448.0 L899.0,552.0 L894.0,593.0 L892.0,638.0 L895.0,709.0 L918.0,856.0 L919.0,911.0 L916.0,960.0 L910.0,1015.0 L901.0,1065.0 L885.3,1120.0 L861.7,1183.0 L350.0,1185.0 L344.3,1165.0 L328.7,1136.0 L305.0,1067.0 L294.0,1018.0 L289.0,979.0 L287.0,913.0 L290.0,864.0 L319.0,691.0 L324.0,643.0 L322.0,542.0 L316.0,495.0 L301.0,415.0 L306.0,410.0 L327.3,401.0 L429.0,364.0 Z",
    noDvojhrob: true,
    layout: { family: { x: 0.558, y: 0.208, size: 0.7 }, names: { x: 0.552, y: 0.239, w: 0.52, size: 0.6 }, sub: { x: 0.528, y: 0.966, size: 0.6 }, ornament: { x: 0.147, y: -0.029, h: 0.98 }, photo: { x: 0.332, y: 0.282, h: 0.086 } }
  },
  {
    id: "atyp-23",
    name: "Atypick\xFD 23",
    gallery: true,
    thumb: "tvar-23.jpg",
    ornamentAsset: "assets/atyp-23-rytina-mr5f5hpz.png",
    svgPath: "M346.0,364.0 L410.0,389.0 L491.7,412.0 L494.0,416.0 L480.0,458.0 L481.3,461.0 L605.3,511.0 L638.0,522.0 L711.7,541.0 L768.7,550.0 L943.0,555.0 L937.0,696.0 L928.0,808.0 L910.0,939.0 L890.0,1042.0 L879.3,1085.0 L845.0,1120.0 L827.0,1142.0 L802.0,1191.0 L390.0,1191.0 L363.0,1087.0 L351.0,1026.0 L335.0,922.0 L325.0,802.0 L321.0,701.0 L322.0,590.0 L327.0,465.0 L335.0,364.0 Z",
    noDvojhrob: true,
    layout: { family: { x: 0.613, y: 0.319, size: 0.7 }, names: { x: 0.602, y: 0.354, w: 0.52, size: 0.6 }, sub: { x: 0.57, y: 0.968, size: 0.6 }, ornament: { x: 0.123, y: 0.055, h: 0.92 }, photo: { x: 0.378, y: 0.396, h: 0.086 } }
  },
  {
    id: "atyp-27",
    name: "Atypick\xFD 27",
    gallery: true,
    thumb: "tvar-27.jpg",
    svgPath: "M305.0,365.0 L444.7,416.0 L635.0,466.0 L713.7,476.0 L859.0,479.0 L833.0,645.0 L825.0,730.0 L821.0,823.0 L821.0,906.0 L825.0,986.0 L849.0,1186.0 L318.0,1186.0 L331.0,1120.0 L337.0,1062.0 L341.0,895.0 L339.0,772.0 L335.0,699.0 L319.0,520.0 L309.0,448.0 L294.0,365.0 Z",
    noDvojhrob: true,
    layout: { family: { x: 0.513, y: 0.238, size: 0.7 }, names: { x: 0.509, y: 0.286, w: 0.52, size: 0.55 }, sub: { x: 0.517, y: 0.955, size: 0.6 }, photo: { x: 0.313, y: 0.326, h: 0.079 } }
  },
  {
    id: "atyp-28",
    name: "Atypick\xFD 28",
    gallery: true,
    thumb: "tvar-28.jpg",
    ornamentAsset: "assets/atyp-28-rytina-white.png",
    svgPath: "M461.0,365.0 L464.3,374.0 L576.0,377.0 L598.3,381.0 L661.0,400.0 L741.0,430.0 L788.3,445.0 L838.3,456.0 L916.0,466.0 L925.3,469.0 L925.0,481.0 L903.0,576.0 L895.0,658.0 L895.0,753.0 L902.0,842.0 L905.0,918.0 L901.0,1004.0 L894.0,1057.0 L885.0,1098.0 L869.3,1149.0 L852.0,1193.0 L344.0,1193.0 L326.7,1150.0 L310.0,1095.0 L300.0,1048.0 L294.0,996.0 L293.0,919.0 L297.0,868.0 L309.0,781.0 L322.0,708.0 L318.0,698.0 L321.0,673.0 L309.3,656.0 L307.0,643.0 L311.0,630.0 L302.3,620.0 L300.0,610.0 L303.0,590.0 L293.7,576.0 L291.0,566.0 L290.0,554.0 L293.0,548.0 L293.0,536.0 L289.0,526.0 L289.0,519.0 L294.3,513.0 L329.0,495.0 L309.0,420.0 L311.3,413.0 L402.3,382.0 L495.7,377.0 L423.7,374.0 L448.0,365.0 Z",
    noDvojhrob: true,
    layout: { family: { x: 0.589, y: 0.254, size: 0.8 }, names: { x: 0.591, y: 0.286, w: 0.52, size: 0.65 }, sub: { x: 0.604, y: 0.96, size: 0.7 }, ornament: { x: 0.196, y: 0.114, h: 0.89 }, photo: { x: 0.367, y: 0.332, h: 0.093 } }
  },
  {
    id: "atyp-32",
    name: "Atypick\xFD 32",
    gallery: true,
    thumb: "tvar-32.jpg",
    ornamentAsset: "assets/atyp-32-rytina-white.png",
    svgPath: "M121.0,222.0 L166.3,234.0 L199.0,241.0 L271.0,253.0 L272.0,254.0 L272.0,259.0 L271.0,262.0 L270.3,270.0 L271.0,274.0 L310.7,282.0 L359.0,290.0 L392.0,294.0 L421.0,296.0 L554.7,299.0 L559.7,310.0 L562.3,314.0 L778.7,317.0 L779.0,344.0 L778.0,350.0 L778.0,375.0 L777.0,378.0 L777.0,391.0 L776.0,394.0 L776.0,401.0 L775.0,404.0 L774.0,420.0 L773.0,423.0 L772.0,435.0 L770.0,443.0 L770.0,447.0 L764.0,472.0 L762.0,484.0 L754.0,516.0 L721.0,634.0 L715.0,660.0 L711.0,684.0 L711.0,688.0 L710.0,691.0 L710.0,698.0 L708.0,707.0 L708.0,719.0 L707.0,722.0 L707.0,739.0 L706.0,742.0 L706.0,766.0 L707.0,769.0 L707.0,780.0 L709.0,792.0 L710.0,811.0 L711.0,814.0 L711.0,819.0 L713.0,828.0 L714.0,839.0 L198.0,839.0 L194.0,810.0 L183.0,761.0 L169.3,717.0 L155.3,681.0 L142.7,653.0 L132.7,628.0 L120.0,592.0 L108.0,543.0 L100.0,499.0 L100.0,494.0 L98.0,483.0 L98.0,476.0 L97.0,473.0 L97.0,467.0 L96.0,464.0 L95.0,446.0 L94.0,443.0 L94.0,435.0 L93.0,432.0 L92.0,409.0 L91.0,406.0 L91.0,389.0 L90.0,386.0 L90.0,341.0 L91.0,338.0 L91.0,321.0 L92.0,318.0 L92.0,310.0 L93.0,307.0 L93.0,300.0 L94.0,297.0 L95.0,284.0 L102.0,247.0 L102.0,243.0 L105.0,232.0 L106.0,224.0 L107.0,222.0 Z",
    noDvojhrob: true,
    layout: { family: { x: 0.598, y: 0.277, size: 0.74 }, names: { x: 0.596, y: 0.312, w: 0.52, size: 0.6 }, sub: { x: 0.528, y: 0.981, size: 0.61 }, ornament: { x: 0.219, y: -1e-3, h: 0.95 }, photo: { x: 0.381, y: 0.356, h: 0.086 } }
  }
];
const HEADSTONE_DESIGNS_D = { "rovny": { "widthMm": 1200, "heightMm": 900, "source": "DH source GLB rectangle", "parts": [{ "id": "plate", "role": "plate", "points": [[0, 0], [1, 0], [1, 1], [0, 1]], "depthMm": 60, "frontOffsetMm": 0 }] }, "zkosene": { "widthMm": 1300, "heightMm": 900, "source": "skp21_rectangle_wide", "parts": [{ "id": "plate", "role": "plate", "points": [[0.0153846, 1], [0.9846154, 1], [1, 0], [0, 0]], "depthMm": 60, "frontOffsetMm": 0, "sourceInstanceId": 1581171 }] }, "vlna-sikma": { "widthMm": 1200, "heightMm": 820, "source": "skp26_wave_wide", "parts": [{ "id": "plate", "role": "plate", "points": [[0.3752775, 61049e-7], [0.3335525, 27134e-7], [0.2917867, 678e-6], [0.25, 0], [0.2082133, 678e-6], [0.1664475, 27134e-7], [0.1247225, 61049e-7], [0.0830592, 0.0108488], [0.0414783, 0.0169451], [0, 0.0243902], [0.0355083, 0.8558134], [0.0367067, 0.8675634], [0.03914, 0.8839744], [0.0423025, 0.9001171], [0.04618, 0.915922], [0.0507567, 0.9313207], [0.0560125, 0.9462488], [0.0619242, 0.9606415], [0.0684675, 0.9744366], [0.0756142, 0.9875744], [0.0833333, 1], [0.9045825, 1], [0.9131575, 0.987978], [0.921195, 0.9751866], [0.9286625, 0.9616744], [0.9355308, 0.9474988], [0.9417717, 0.9327146], [0.94736, 0.9173817], [0.9522742, 0.901561], [0.9564933, 0.8853171], [0.9600017, 0.8687146], [0.9627842, 0.8518207], [0.96483, 0.8347024], [0.9661308, 0.8174293], [1, 0.0853659], [0.9581208, 0.091489], [0.9161267, 0.0955732], [0.8740625, 0.0976146], [0.831975, 0.0976085], [0.7899108, 0.0955585], [0.7479167, 0.0914634], [0.7060383, 0.0853293], [0.6643225, 0.0771634], [0.622815, 0.0669744], [0.5815617, 0.0547732], [0.5406083, 0.0405732], [0.5, 0.0243902], [0.4585217, 0.0169451], [0.4169408, 0.0108488]], "depthMm": 60, "frontOffsetMm": 0, "sourceInstanceId": 1585945 }] }, "vlna-dvojita": { "widthMm": 1200, "heightMm": 820, "source": "skp18_wave_wide", "parts": [{ "id": "plate", "role": "plate", "points": [[0.2300492, 0.0348061], [0.2098033, 0.0439232], [0.1893017, 0.051722], [0.168585, 0.0581878], [0.1476925, 0.0633085], [0.1266667, 0.0670732], [0.1055475, 0.0694756], [0.0843767, 0.070511], [0.063195, 0.0701756], [0.0420442, 0.0684732], [0.0209658, 0.0654037], [0, 0.0609756], [0.0583333, 1], [0.9416667, 1], [1, 0.0609756], [0.979035, 0.0654037], [0.9579558, 0.0684732], [0.936805, 0.0701756], [0.9156233, 0.070511], [0.8944525, 0.0694756], [0.8733333, 0.0670732], [0.8523075, 0.0633085], [0.8314158, 0.0581878], [0.8106992, 0.051722], [0.7901975, 0.0439232], [0.7699517, 0.0348061], [0.75, 0.0243902], [0.7295417, 0.0169683], [0.7088792, 0.0108756], [0.6880533, 61244e-7], [0.6671042, 27244e-7], [0.6460725, 6817e-7], [0.625, 0], [0.6039275, 6817e-7], [0.5828967, 27244e-7], [0.5619467, 61244e-7], [0.5411208, 0.0108756], [0.5204583, 0.0169683], [0.5, 0.0243902], [0.4795417, 0.0169683], [0.4588792, 0.0108756], [0.4380533, 61244e-7], [0.4171042, 27244e-7], [0.3960725, 6817e-7], [0.375, 0], [0.3539275, 6817e-7], [0.3328967, 27244e-7], [0.3119467, 61244e-7], [0.2911208, 0.0108756], [0.2704583, 0.0169683], [0.25, 0.0243902]], "depthMm": 60, "frontOffsetMm": 0, "sourceInstanceId": null }] }, "dvoj-sloupek": { "widthMm": 1900, "heightMm": 1e3, "source": "skp16_three_parts", "parts": [{ "id": "left", "role": "plate", "points": [[0, 1], [0.3684211, 1], [0.3684211, 0.1], [0, 0.1]], "depthMm": 60, "frontOffsetMm": 0, "sourceInstanceId": 1203986 }, { "id": "right", "role": "plate", "points": [[0.6315789, 1], [1, 1], [1, 0.1], [0.6315789, 0.1]], "depthMm": 60, "frontOffsetMm": 0, "sourceInstanceId": 1203956 }, { "id": "backing", "role": "backing", "points": [[0.6315789, 1], [0.6315789, 0.05], [0.3684211, 0.05], [0.3684211, 1]], "depthMm": 30, "frontOffsetMm": -30, "sourceInstanceId": 1204962 }, { "id": "pillar", "role": "pillar", "points": [[0.5789474, 1], [0.5789474, 0], [0.4210526, 0], [0.4210526, 1]], "depthMm": 30, "frontOffsetMm": 0, "sourceInstanceId": 1205036 }], "fitWidthScale": 1.15 }, "dvoj-sloupek-vlna": { "widthMm": 1900, "heightMm": 1e3, "source": "adapted: skp16_three_parts + mirrored skp10_soft_wave", "parts": [{ "id": "left", "role": "plate", "points": [[0.3684211, 1], [0, 1], [0, 0.15], [0.0151474, 0.156093], [0.0304058, 0.16109], [0.0457531, 0.164984], [0.0611668, 0.167769], [0.0766247, 0.169442], [0.0921053, 0.17], [0.1075858, 0.169442], [0.1230442, 0.167769], [0.1384579, 0.164984], [0.1538047, 0.16109], [0.1690632, 0.156093], [0.1993579, 0.143907], [0.2048763, 0.1421], [0.2146163, 0.13891], [0.2299637, 0.135016], [0.2453774, 0.132231], [0.2608353, 0.130558], [0.2685758, 0.130279], [0.2840563, 0.130279], [0.2917963, 0.130558], [0.3072547, 0.132231], [0.3226684, 0.135016], [0.3380153, 0.13891], [0.3477552, 0.1421], [0.3532737, 0.143907], [0.3684211, 0.15]], "depthMm": 60, "frontOffsetMm": 0, "sourceInstanceId": 1112126 }, { "id": "right", "role": "plate", "points": [[0.6315789, 1], [1, 1], [1, 0.15], [0.9848526, 0.156093], [0.9695942, 0.16109], [0.9542469, 0.164984], [0.9388332, 0.167769], [0.9233753, 0.169442], [0.9078947, 0.17], [0.8924142, 0.169442], [0.8769558, 0.167769], [0.8615421, 0.164984], [0.8461953, 0.16109], [0.8309368, 0.156093], [0.8006421, 0.143907], [0.7951237, 0.1421], [0.7853837, 0.13891], [0.7700363, 0.135016], [0.7546226, 0.132231], [0.7391647, 0.130558], [0.7314242, 0.130279], [0.7159437, 0.130279], [0.7082037, 0.130558], [0.6927453, 0.132231], [0.6773316, 0.135016], [0.6619847, 0.13891], [0.6522448, 0.1421], [0.6467263, 0.143907], [0.6315789, 0.15]], "depthMm": 60, "frontOffsetMm": 0, "sourceInstanceId": 1112126 }, { "id": "backing", "role": "backing", "points": [[0.6315789, 1], [0.6315789, 0.05], [0.3684211, 0.05], [0.3684211, 1]], "depthMm": 30, "frontOffsetMm": -30, "sourceInstanceId": 1204962 }, { "id": "pillar", "role": "pillar", "points": [[0.5789474, 1], [0.5789474, 0], [0.4210526, 0], [0.4210526, 1]], "depthMm": 30, "frontOffsetMm": 0, "sourceInstanceId": 1205036 }], "fitWidthScale": 1.15 }, "dvoj-mezera": { "widthMm": 1573.0337078651685, "heightMm": 900, "fitWidthScale": 1.15, "source": "adapted: skp16 700x900 panels; existing 11% gap", "parts": [{ "id": "left", "role": "plate", "points": [[0, 0], [0.445, 0], [0.445, 1], [0, 1]], "depthMm": 60, "frontOffsetMm": 0, "sourceInstanceId": 1203986 }, { "id": "right", "role": "plate", "points": [[0.5549999999999999, 0], [1, 0], [1, 1], [0.5549999999999999, 1]], "depthMm": 60, "frontOffsetMm": 0, "sourceInstanceId": 1203956 }] } };
HEADSTONE_DESIGNS_D["foto-oblouk"] = { "widthMm": 1200, "heightMm": 1e3, "source": "photo-reference: supplied image 7; interpreted contour, dimensions illustrative", "parts": [{ "id": "plate", "role": "plate", "depthMm": 60, "frontOffsetMm": 0, "points": [[0, 0.08], [0.0380064, 0.0672222], [0.0769676, 0.0555555], [0.1167969, 0.045], [0.1574074, 0.0355555], [0.1987124, 0.0272222], [0.240625, 0.02], [0.2830584, 0.0138889], [0.3259259, 88889e-7], [0.3691406, 5e-3], [0.4126157, 22222e-7], [0.4562645, 5555e-7], [0.5, -0], [0.5437355, 5555e-7], [0.5873843, 22222e-7], [0.6308594, 5e-3], [0.6740741, 88889e-7], [0.7169416, 0.0138889], [0.759375, 0.02], [0.8012876, 0.0272222], [0.8425926, 0.0355555], [0.8832031, 0.045], [0.9230324, 0.0555555], [0.9619936, 0.0672222], [1, 0.08], [0.9992419, 0.1236408], [0.998206, 0.1670428], [0.996875, 0.2101758], [0.9952315, 0.2530093], [0.9932581, 0.2955129], [0.9909375, 0.3376562], [0.9882523, 0.379409], [0.9851852, 0.4207407], [0.9817187, 0.4616211], [0.9778356, 0.5020197], [0.9735185, 0.5419061], [0.96875, 0.58125], [0.9635127, 0.620021], [0.9577894, 0.6581887], [0.9515625, 0.6957227], [0.9448148, 0.7325926], [0.9375289, 0.7687681], [0.9296875, 0.8042187], [0.9212731, 0.8389142], [0.9122685, 0.8728241], [0.9026563, 0.905918], [0.892419, 0.9381655], [0.8815394, 0.9695363], [0.87, 1], [0.8409968, 1], [0.8115162, 1], [0.7816016, 1], [0.7512963, 1], [0.7206438, 1], [0.6896875, 1], [0.6584708, 1], [0.627037, 1], [0.5954297, 1], [0.5636921, 1], [0.5318678, 1], [0.5, 1], [0.4681322, 1], [0.4363079, 1], [0.4045703, 1], [0.372963, 1], [0.3415292, 1], [0.3103125, 1], [0.2793562, 1], [0.2487037, 1], [0.2183984, 1], [0.1884838, 1], [0.1590032, 1], [0.13, 1], [0.1184606, 0.9695363], [0.107581, 0.9381655], [0.0973438, 0.905918], [0.0877315, 0.8728241], [0.0787269, 0.8389142], [0.0703125, 0.8042187], [0.0624711, 0.7687681], [0.0551852, 0.7325926], [0.0484375, 0.6957227], [0.0422106, 0.6581887], [0.0364873, 0.620021], [0.03125, 0.58125], [0.0264815, 0.5419061], [0.0221644, 0.5020197], [0.0182813, 0.4616211], [0.0148148, 0.4207407], [0.0117477, 0.379409], [90625e-7, 0.3376562], [67419e-7, 0.2955129], [47685e-7, 0.2530093], [3125e-6, 0.2101758], [1794e-6, 0.1670428], [7581e-7, 0.1236408]] }] };
const HEADSTONE_DESIGNS_SINGLE = { "srdce-strom": { "widthMm": 800, "heightMm": 900, "decoration": "tree-relief", "inscriptionAxis": 0.62, "inscriptionTop": 0.22, "source": "photo-reference: customer supplied heart with carved tree; proportions interpreted within existing Exclusive 800 \xD7 900 mm envelope", "parts": [{ "id": "heart", "role": "plate", "depthMm": 60, "frontOffsetMm": 0, "points": [[0.31, 1], [0.3189822, 0.985474], [0.329958, 0.970732], [0.3428208, 0.955828], [0.357464, 0.940816], [0.3737813, 0.92575], [0.391666, 0.910684], [0.4110118, 0.895672], [0.431712, 0.880768], [0.4536603, 0.866026], [0.47675, 0.8515], [0.5008748, 0.837244], [0.525928, 0.823312], [0.5518033, 0.809758], [0.578394, 0.796636], [0.6055937, 0.784], [0.633296, 0.771904], [0.6613943, 0.760402], [0.689782, 0.749548], [0.7183527, 0.739396], [0.747, 0.73], [0.7613757, 0.7214825], [0.775396, 0.71244], [0.7890502, 0.7028875], [0.802328, 0.69284], [0.8152187, 0.6823125], [0.827712, 0.67132], [0.8397972, 0.6598775], [0.851464, 0.648], [0.8627018, 0.6357025], [0.8735, 0.623], [0.8838483, 0.6099075], [0.893736, 0.59644], [0.9031528, 0.5826125], [0.912088, 0.56844], [0.9205313, 0.5539375], [0.928472, 0.53912], [0.9358997, 0.5240025], [0.942804, 0.5086], [0.9491742, 0.4929275], [0.955, 0.477], [0.9596583, 0.4635085], [0.964036, 0.450338], [0.9681377, 0.4374945], [0.971968, 0.424984], [0.9755312, 0.4128125], [0.978832, 0.400986], [0.9818748, 0.3895105], [0.984664, 0.378392], [0.9872043, 0.3676365], [0.9895, 0.35725], [0.9915557, 0.3472385], [0.993376, 0.337608], [0.9949652, 0.3283645], [0.996328, 0.319514], [0.9974688, 0.3110625], [0.998392, 0.303016], [0.9991022, 0.2953805], [0.999604, 0.288162], [0.9999018, 0.2813665], [1, 0.275], [0.9995189, 0.2637649], [0.998671, 0.252859], [0.9974496, 0.2422816], [0.995848, 0.232032], [0.9938594, 0.2221094], [0.991477, 0.212513], [0.9886941, 0.2032421], [0.985504, 0.194296], [0.9818999, 0.1856739], [0.977875, 0.177375], [0.9734226, 0.1693986], [0.968536, 0.161744], [0.9632084, 0.1544104], [0.957433, 0.147397], [0.9512031, 0.1407031], [0.944512, 0.134328], [0.9373529, 0.1282709], [0.929719, 0.122531], [0.9216036, 0.1171076], [0.913, 0.112], [0.8990092, 0.1046432], [0.884954, 0.098446], [0.8708597, 0.0933677], [0.856752, 0.089368], [0.8426562, 0.0864063], [0.828598, 0.084442], [0.8146027, 0.0834348], [0.800696, 0.083344], [0.7869033, 0.0841293], [0.77325, 0.08575], [0.7597618, 0.0881658], [0.746464, 0.091336], [0.7333823, 0.0952203], [0.720542, 0.099778], [0.7079688, 0.1049687], [0.695688, 0.110752], [0.6837252, 0.1170873], [0.672106, 0.123934], [0.6608557, 0.1312518], [0.65, 0.139], [0.6463241, 0.1416918], [0.642793, 0.144364], [0.6394014, 0.1470123], [0.636144, 0.149632], [0.6330156, 0.1522187], [0.630011, 0.154768], [0.6271249, 0.1572753], [0.624352, 0.159736], [0.6216871, 0.1621458], [0.619125, 0.1645], [0.6166604, 0.1667942], [0.614288, 0.169024], [0.6120026, 0.1711847], [0.609799, 0.173272], [0.6076719, 0.1752812], [0.605616, 0.177208], [0.6036261, 0.1790478], [0.601697, 0.180796], [0.5998234, 0.1824483], [0.598, 0.184], [0.5930869, 0.1741236], [0.587945, 0.164599], [0.5825706, 0.1554329], [0.57696, 0.146632], [0.5711094, 0.1382031], [0.565015, 0.130153], [0.5586731, 0.1224884], [0.55208, 0.115216], [0.5452319, 0.1083426], [0.538125, 0.101875], [0.5307556, 0.0958199], [0.52312, 0.090184], [0.5152144, 0.0849741], [0.507035, 0.080197], [0.4985781, 0.0758594], [0.48984, 0.071968], [0.4808169, 0.0685296], [0.471505, 0.065551], [0.4619006, 0.0630389], [0.452, 0.061], [0.4372957, 0.0587862], [0.422596, 0.05724], [0.4079202, 0.0563537], [0.393288, 0.05612], [0.3787188, 0.0565312], [0.364232, 0.05758], [0.3498472, 0.0592587], [0.335584, 0.06156], [0.3214618, 0.0644763], [0.3075, 0.068], [0.2937183, 0.0721238], [0.280136, 0.07684], [0.2667728, 0.0821412], [0.253648, 0.08802], [0.2407813, 0.0944688], [0.228192, 0.10148], [0.2158998, 0.1090462], [0.203924, 0.11716], [0.1922842, 0.1258138], [0.181, 0.135], [0.1711809, 0.1437266], [0.162117, 0.152793], [0.1537986, 0.1621789], [0.146216, 0.171864], [0.1393594, 0.1818281], [0.133219, 0.192051], [0.1277851, 0.2025124], [0.123048, 0.213192], [0.1189979, 0.2240696], [0.115625, 0.235125], [0.1129196, 0.2463379], [0.110872, 0.257688], [0.1094724, 0.2691551], [0.108711, 0.280719], [0.1085781, 0.2923594], [0.109064, 0.304056], [0.1101589, 0.3157886], [0.111853, 0.327537], [0.1141366, 0.3392809], [0.117, 0.351], [0.1206166, 0.3633481], [0.125113, 0.376075], [0.1304089, 0.3891544], [0.136424, 0.40256], [0.1430781, 0.4162656], [0.150291, 0.430245], [0.1579824, 0.4444719], [0.166072, 0.45892], [0.1744796, 0.4735631], [0.183125, 0.488375], [0.1919279, 0.5033294], [0.200808, 0.5184], [0.2096851, 0.5335606], [0.218479, 0.548785], [0.2271094, 0.5640469], [0.235496, 0.57932], [0.2435586, 0.5945781], [0.251217, 0.609795], [0.2583909, 0.6249444], [0.265, 0.64], [0.270939, 0.6535398], [0.276452, 0.666868], [0.281533, 0.6799982], [0.286176, 0.692944], [0.290375, 0.7057187], [0.294124, 0.718336], [0.297417, 0.7308093], [0.300248, 0.743152], [0.302611, 0.7553778], [0.3045, 0.7675], [0.305909, 0.7795322], [0.306832, 0.791488], [0.307263, 0.8033808], [0.307196, 0.815224], [0.306625, 0.8270313], [0.305544, 0.838816], [0.303947, 0.8505917], [0.301828, 0.862372], [0.299181, 0.8741703], [0.296, 0.886], [0.2938874, 0.8944075], [0.291759, 0.90253], [0.2896291, 0.9103675], [0.287512, 0.91792], [0.2854219, 0.9251875], [0.283373, 0.93217], [0.2813796, 0.9388675], [0.279456, 0.94528], [0.2776164, 0.9514075], [0.275875, 0.95725], [0.2742461, 0.9628075], [0.272744, 0.96808], [0.2713829, 0.9730675], [0.270177, 0.97777], [0.2691406, 0.9821875], [0.268288, 0.98632], [0.2676334, 0.9901675], [0.267191, 0.99373], [0.2669751, 0.9970075], [0.267, 1]] }, { "id": "lower-base", "role": "base", "depthMm": 60, "frontOffsetMm": -3, "points": [[0.326, 1], [0.3371558, 0.984249], [0.3513555, 0.9678359], [0.3683853, 0.9508955], [0.3880313, 0.9335625], [0.4100796, 0.9159717], [0.4343164, 0.8982578], [0.4605278, 0.8805557], [0.4885, 0.863], [0.518019, 0.8457256], [0.5488711, 0.8288672], [0.5808423, 0.8125596], [0.6137187, 0.7969375], [0.6472866, 0.7821357], [0.681332, 0.7682891], [0.7156411, 0.7555322], [0.75, 0.744], [0.7545703, 0.7575757], [0.7589531, 0.7713242], [0.7632187, 0.7852778], [0.7674375, 0.7994688], [0.7716797, 0.8139292], [0.7760156, 0.8286914], [0.7805156, 0.8437876], [0.78525, 0.85925], [0.7902891, 0.8751108], [0.7957031, 0.8914023], [0.8015625, 0.9081567], [0.8079375, 0.9254062], [0.8148984, 0.9431831], [0.8225156, 0.9615195], [0.8308594, 0.9804478], [0.84, 1]] }, { "id": "tree-trunk", "role": "relief", "depthMm": 60, "frontOffsetMm": 8, "points": [[0.17, 1], [0.179728, 0.9814072], [0.188293, 0.9627734], [0.1957036, 0.9441279], [0.2019688, 0.9255], [0.2070972, 0.9069189], [0.2110977, 0.8884141], [0.213979, 0.8700146], [0.21575, 0.85175], [0.2164194, 0.8336494], [0.2159961, 0.8157422], [0.2144888, 0.7980576], [0.2119062, 0.780625], [0.2082573, 0.7634736], [0.2035508, 0.7466328], [0.1977954, 0.7301318], [0.191, 0.714], [0.1829541, 0.6972617], [0.1742578, 0.6800781], [0.1650107, 0.6624961], [0.1553125, 0.6445625], [0.1452627, 0.6263242], [0.1349609, 0.6078281], [0.1245068, 0.5891211], [0.114, 0.57025], [0.10354, 0.5512617], [0.0932266, 0.5322031], [0.0831592, 0.5131211], [0.0734375, 0.4940625], [0.0641611, 0.4750742], [0.0554297, 0.4562031], [0.0473428, 0.4374961], [0.04, 0.419], [0, 0.395], [0.016, 0.36], [0.057, 0.398], [0.0524041, 0.3848494], [0.0483574, 0.3720137], [0.0448469, 0.3594797], [0.0418594, 0.3472344], [0.0393816, 0.3352644], [0.0374004, 0.3235566], [0.0359026, 0.3120979], [0.034875, 0.300875], [0.0343044, 0.2898748], [0.0341777, 0.279084], [0.0344817, 0.2684895], [0.0352031, 0.2580781], [0.0363289, 0.2478367], [0.0378457, 0.237752], [0.0397405, 0.2278108], [0.042, 0.218], [0.026, 0.2], [0.049, 0.19], [0.062, 0.238], [0.0645789, 0.226146], [0.0674434, 0.2149336], [0.0705979, 0.2043247], [0.0740469, 0.1942812], [0.0777947, 0.1847651], [0.0818457, 0.1757383], [0.0862043, 0.1671626], [0.090875, 0.159], [0.0958621, 0.1512124], [0.1011699, 0.1437617], [0.106803, 0.1366099], [0.1127656, 0.1297187], [0.1190623, 0.1230503], [0.1256973, 0.1165664], [0.132675, 0.110229], [0.14, 0.104], [0.144, 0.061], [0.171, 0.057], [0.168, 0.1], [0.1766699, 0.0908459], [0.1854219, 0.082127], [0.1942441, 0.0738328], [0.203125, 0.0659531], [0.2120527, 0.0584778], [0.2210156, 0.0513965], [0.230002, 0.044699], [0.239, 0.038375], [0.247998, 0.0324143], [0.2569844, 0.0268066], [0.2659473, 0.0215417], [0.274875, 0.0166094], [0.2837559, 0.0119993], [0.2925781, 77012e-7], [0.3013301, 37048e-7], [0.31, 0], [0.343, 0.015], [0.31, 0.036], [0.3254846, 0.0328127], [0.3404551, 0.0307051], [0.3549363, 0.0296082], [0.3689531, 0.0294531], [0.3825305, 0.0301711], [0.3956934, 0.0316934], [0.4084666, 0.0339509], [0.420875, 0.036875], [0.4329436, 0.0403967], [0.4446973, 0.0444473], [0.4561609, 0.0489578], [0.4673594, 0.0538594], [0.4783176, 0.0590833], [0.4890605, 0.0645605], [0.499613, 0.0702224], [0.51, 0.076], [0.502, 0.09], [0.4905083, 0.085928], [0.4792539, 0.0819863], [0.4681929, 0.0782117], [0.4572813, 0.0746406], [0.4464751, 0.0713098], [0.4357305, 0.0682559], [0.4250034, 0.0655154], [0.41425, 0.063125], [0.4034263, 0.0611213], [0.3924883, 0.059541], [0.3813921, 0.0584207], [0.3700937, 0.0577969], [0.3585493, 0.0577063], [0.3467148, 0.0581855], [0.3345464, 0.0592712], [0.322, 0.061], [0.3089509, 0.0658286], [0.2960762, 0.0709414], [0.2834094, 0.0763413], [0.2709844, 0.0820312], [0.2588347, 0.0880142], [0.2469941, 0.094293], [0.2354963, 0.1008706], [0.224375, 0.10775], [0.2136638, 0.1149341], [0.2033965, 0.1224258], [0.1936067, 0.130228], [0.1843281, 0.1383437], [0.1755945, 0.1467759], [0.1674395, 0.1555273], [0.1598967, 0.1646011], [0.153, 0.174], [0.1467002, 0.1830317], [0.1409453, 0.1924883], [0.1357646, 0.2023491], [0.1311875, 0.2125937], [0.1272432, 0.2232017], [0.1239609, 0.2341523], [0.1213701, 0.2454253], [0.1195, 0.257], [0.1183799, 0.268856], [0.1180391, 0.2809727], [0.1185068, 0.2933296], [0.1198125, 0.3059062], [0.1219854, 0.3186821], [0.1250547, 0.3316367], [0.1290498, 0.3447495], [0.134, 0.358], [0.140207, 0.3723428], [0.1471406, 0.3868672], [0.154707, 0.4015674], [0.1628125, 0.4164375], [0.1713633, 0.4314717], [0.1802656, 0.4466641], [0.1894258, 0.4620088], [0.19875, 0.4775], [0.2081445, 0.4931318], [0.2175156, 0.5088984], [0.2267695, 0.5247939], [0.2358125, 0.5408125], [0.2445508, 0.5569482], [0.2528906, 0.5731953], [0.2607383, 0.5895479], [0.268, 0.606], [0.2750854, 0.623448], [0.2816992, 0.6409121], [0.2878149, 0.658385], [0.2934062, 0.6758594], [0.2984468, 0.6933279], [0.3029102, 0.7107832], [0.30677, 0.728218], [0.31, 0.745625], [0.3125737, 0.7629968], [0.3144648, 0.7803262], [0.315647, 0.7976057], [0.3160937, 0.8148281], [0.3157788, 0.8319861], [0.3146758, 0.8490723], [0.3127583, 0.8660793], [0.31, 0.883], [0.308123, 0.893949], [0.3066094, 0.9043105], [0.3054473, 0.9141067], [0.304625, 0.9233594], [0.3041309, 0.9320906], [0.3039531, 0.9403223], [0.3040801, 0.9480764], [0.3045, 0.955375], [0.3052012, 0.96224], [0.3061719, 0.9686934], [0.3074004, 0.9747571], [0.308875, 0.9804531], [0.310584, 0.9858035], [0.3125156, 0.9908301], [0.3146582, 0.9955549], [0.317, 1]] }], "inscriptionArea": { "minX": 0.38, "maxX": 0.92, "minY": 0.25, "maxY": 0.64, "footerY": 0.72 } } };
HEADSTONE_DESIGNS_SINGLE["deleny-kriz"] = {
  widthMm: 800,
  heightMm: 900,
  decoration: "cross-cutout",
  inscriptionAxis: 0.69,
  inscriptionTop: 0.32,
  source: "1H_Exclusive.skp: measured right plate and left pillar, x 50\u2013850 mm / z 660\u20131560 mm",
  parts: [
    { id: "right-plate", role: "plate", depthMm: 60, frontOffsetMm: 0, points: [[0.3125, 0], [1, 0], [1, 1], [0.3125, 1], [0.3125, 0.2555555556], [0.4375, 0.2555555556], [0.4375, 0.2], [0.3125, 0.2]] },
    { id: "left-pillar", role: "pillar", depthMm: 60, frontOffsetMm: 0, inscription: false, points: [[0, 0.0222222222], [0.25, 0.0222222222], [0.25, 0.2], [0.125, 0.2], [0.125, 0.2555555556], [0.25, 0.2555555556], [0.25, 1], [0, 1]] }
  ],
  inscriptionArea: { minX: 0.34, maxX: 0.97, minY: 0.32, maxY: 0.8, footerY: 0.88 }
};
function getHeadstoneDesign(shapeId, type) {
  if (type === "jednohrob" || type === "urnovy") return HEADSTONE_DESIGNS_SINGLE[shapeId] || null;
  return type === "dvojhrob" ? HEADSTONE_DESIGNS_D[shapeId] || null : null;
}
const IMPORTED_HEADSTONE_DESIGNS = {
  "dvojhrob-premium-20261005": {
    shapeId: "dvoj-sloupek",
    design: {
      widthMm: 1640,
      heightMm: 900,
      source: "2H - Premium .skp: measured x 180\u20131820 mm / z 340\u20131240 mm; front offsets include the physical cross",
      parts: [
        { id: "left", role: "plate", depthMm: 60, frontOffsetMm: -33, points: [[0, 1 / 9], [700 / 1640, 1 / 9], [700 / 1640, 1], [0, 1]] },
        { id: "right", role: "plate", depthMm: 60, frontOffsetMm: -33, points: [[940 / 1640, 1 / 9], [1, 1 / 9], [1, 1], [940 / 1640, 1]] },
        { id: "pillar", role: "pillar", depthMm: 30, frontOffsetMm: -3, inscription: false, materialComponentId: "sloupek", points: [[650 / 1640, 0], [990 / 1640, 0], [990 / 1640, 1], [650 / 1640, 1]] }
      ]
    }
  },
  "dvojhrob-exclusive-20261005": {
    shapeId: "dvoj-sloupek",
    design: {
      widthMm: 1548,
      heightMm: 850,
      source: "2H - Exclusive.skp: measured x 211.82438303167945\u20131759.8243830316787 mm / z 730\u20131580 mm; five rectangular source pieces",
      parts: [
        { id: "left", role: "plate", depthMm: 60, frontOffsetMm: 0, points: [[0, 2 / 17], [600 / 1548, 2 / 17], [600 / 1548, 1], [0, 1]] },
        { id: "right", role: "plate", depthMm: 60, frontOffsetMm: 0, points: [[948 / 1548, 2 / 17], [1, 2 / 17], [1, 1], [948 / 1548, 1]] },
        { id: "left-backing", role: "backing", depthMm: 30, frontOffsetMm: -28.5, inscription: false, materialComponentId: "stredova_deska", points: [[600 / 1548, 1 / 17], [700 / 1548, 1 / 17], [700 / 1548, 1], [600 / 1548, 1]] },
        { id: "right-backing", role: "backing", depthMm: 30, frontOffsetMm: -30, inscription: false, materialComponentId: "stredova_deska", points: [[848 / 1548, 1 / 17], [948 / 1548, 1 / 17], [948 / 1548, 1], [848 / 1548, 1]] },
        { id: "pillar", role: "pillar", depthMm: 60, frontOffsetMm: 0, inscription: false, materialComponentId: "napisova_deska", points: [[698 / 1548, 0], [848 / 1548, 0], [848 / 1548, 1], [698 / 1548, 1]] }
      ]
    }
  }
};
function getImportedHeadstoneDesign(sourceModel, shapeId) {
  const imported = IMPORTED_HEADSTONE_DESIGNS[sourceModel];
  return imported && imported.shapeId === shapeId ? imported.design : null;
}
const FONTS = [
  { id: "snell-roundhand", name: "Ozdobn\xE9 psac\xED", family: "'Snell Roundhand Adamek', 'Snell Roundhand', 'Apple Chancery', cursive", sample: "Aa" },
  { id: "byron-rr", name: "Jemn\xE9 pietn\xED", family: "'Byron RR Adamek', 'Byron RR', 'ByronRR', 'Apple Chancery', cursive", sample: "Aa" },
  { id: "kokila", name: "Renesan\u010Dn\xED patkov\xE9", family: "'Kokila Adamek', 'Kokila', 'Noto Serif Devanagari', 'Cormorant Garamond', serif", sample: "AA", previewScale: 0.92, upper: true },
  { id: "roboto", name: "Modern\xED jednoduch\xE9", family: "'Inter', 'Roboto', system-ui, sans-serif", sample: "AA", previewScale: 0.85, previewWeight: 200, engraveWeight: "200", engraveScale: 0.6, upper: true }
];
const TEXT_COLORS = [
  { id: "zlata", name: "24k Zlato", hex: "#d9a42f" },
  { id: "stribrna", name: "St\u0159\xEDbrn\xE1", hex: "#e7edf3" },
  { id: "vyryto-tmava", name: "\u010Cern\xE1", hex: "#161514" }
];
const ACCESSORIES = [
  { id: "vase", name: "V\xE1za", desc: "\u017Dulov\xE1 nebo plechov\xE1 v\xE1za.", price: 3200 },
  { id: "lantern", name: "Lampa", desc: "\u017Dulov\xE1 nebo plechov\xE1 lampa na sv\xED\u010Dku.", price: 2800 }
];
const STEPS = [
  { id: "type", short: "Místo", kicker: "Místo", title: "Vzpomínka v kameni.", lead: "Začněme místem, které máte k dispozici. Rozměry společně doladíme při zaměření." },
  { id: "style", short: "Podoba", kicker: "Podoba", title: "Tvar, který vám bude blízký.", lead: "Prohlédněte si tvary desky. Podstavec, zakrytí i ostatní konstrukční detaily si upravíte níže." },
  { id: "material", short: "Kámen", kicker: "Kámen", title: "Vyberte si svůj kámen.", lead: "Přirozená kresba, světlý nebo tmavý odstín. Použijte jeden kámen, nebo slaďte jednotlivé části." },
  { id: "text", short: "Nápis", kicker: "Nápis", title: "Slova, která zůstanou.", lead: "Doplňte jména a data. Pak vyberte písmo, barvu a případně fotografii." },
  { id: "extras", short: "Detaily", kicker: "Detaily", title: "Malé detaily. Osobní vzpomínka.", lead: "Váza, světlo svíčky, růže nebo kříž. Vyberte prvky, které jsou vám blízké." },
  { id: "summary", short: "Váš návrh", kicker: "Váš návrh", title: "Vaše představa má podobu.", lead: "Projděte si celý návrh. S provedením a přesnou cenou vám pomůžeme osobně." }
];
Object.assign(window, { TYPES, MATERIALS, COMPONENTS, STYLES, SHAPES, FONTS, TEXT_COLORS, ACCESSORIES, STEPS, getHeadstoneDesign, getImportedHeadstoneDesign });
