"use strict";
(function() {
  const { useState, useRef, useEffect, useLayoutEffect } = React;
  const API_ENDPOINT = "/api/contact";
  const THANKYOU_URL = "/dekujeme.html";
  const HOMEPAGE_URL = "/index.html";
  const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  const PHONE_RE = /^(\+?420[\s\-]?)?[1-9][0-9]{2}[\s\-]?[0-9]{3}[\s\-]?[0-9]{3}$/;
  const PHOTO_MAX_BYTES = 4 * 1024 * 1024;
  function proposalUrlFor(cfg) {
    const params = new URLSearchParams();
    params.set("cfg", btoa(unescape(encodeURIComponent(JSON.stringify(cfg)))));
    return window.location.origin + window.location.pathname + "?" + params.toString();
  }
  function trackEvent() {}
  function buildInquirySummary(cfg) {
    var _a, _b, _c;
    const find = (arr, id) => arr.find((x) => x.id === id);
    const inquiryInscription = inscriptionForInquiry(cfg.inscription);
    const typeObj = find(window.TYPES, cfg.type);
    const styleObj = find(window.STYLES, cfg.style);
    const shapeObj = find(window.SHAPES, cfg.shape);
    const fontObj = find(window.FONTS, cfg.font);
    const tcObj = find(window.TEXT_COLORS, cfg.textColor);
    const matLabel = (compId) => {
      var _a2;
      return ((_a2 = find(window.MATERIALS, cfg.materials[compId])) == null ? void 0 : _a2.name) || "\u2014";
    };
    const hasContrastInserts = (_b = (_a = window.getHeadstoneDesign) == null ? void 0 : _a.call(window, cfg.shape, cfg.type)) == null ? void 0 : _b.parts.some((p) => p.role === "pillar");
    const matRows = window.COMPONENTS.filter((c) => (c.id !== "sokl" || cfg.hasSokl) && (c.id !== "kryci_deska" || cfg.hasCover)).map((c) => `  \u2022 ${c.name}: ${matLabel(c.id)}`).concat(hasContrastInserts ? [`  \u2022 Vlo\u017Eky mezi sloupkem a n\xE1pisov\xFDmi deskami: Viscont White`] : []).join("\n");
    const styleLabel = (s) => s === "plech-cerna" ? "plech \u010Dern\xE1" : s === "plech-stribrna" ? "plech st\u0159\xEDbrn\xE1" : "\u017Eulov\xE1 (jako n\xE1pisov\xE1 deska)";
    const hasAccessorySet = !!(cfg.accessories.vase || cfg.accessories.lantern);
    const accessorySetStyle = cfg.vaseStyle || cfg.lanternStyle || "granit";
    const symbolLabel = shapeObj && shapeObj.ornamentAsset ? "dle p\u0159edlohy tvaru (rytina z fotky)" : cfg.ornamentType === "cross" ? "k\u0159\xED\u017E podle barvy n\xE1pisu" : cfg.ornamentType === "rose" ? "b\xEDl\xE1 r\u016F\u017Ee" : cfg.ornamentType === "custom" ? "vlastn\xED motiv (up\u0159esn\xEDme p\u0159i zam\u011B\u0159en\xED)" : null;
    const accs = [
      hasAccessorySet ? `Lampa + v\xE1za (${styleLabel(accessorySetStyle)})` : null,
      symbolLabel ? `Grav\xEDrov\xE1n\xED: ${symbolLabel}` : null
    ].filter(Boolean).join(", ") || "\u017E\xE1dn\xE9";
    const edgeInsetCm = cfg.type === "urnovy" ? 3 : 5;
    const edgeMode = (cfg.edgeMode || "presah") === "odskok" ? `s odskokem ${edgeInsetCm} cm` : "s p\u0159esahem 2 cm";
    const construction = [
      cfg.hasSokl ? "s podstavcem" : "bez podstavce",
      cfg.hasCover ? "s kryc\xED deskou" : "bez kryc\xED desky (hl\xEDna / zahr\xE1dka)",
      cfg.hasSokl && cfg.hasWindow ? "s ok\xFDnkem v soklu \u2014 " + (cfg.windowFrame === "cerna" ? "\u010Dern\xFD r\xE1me\u010Dek" : "st\u0159\xEDbrn\xFD r\xE1me\u010Dek") : null,
      cfg.hasCover ? edgeMode : null
    ].filter(Boolean).join(" \xB7 ");
    return [
      "=== Konfigurace pomn\xEDku (online konfigur\xE1tor) ===",
      `Typ: ${(typeObj == null ? void 0 : typeObj.name) || cfg.type} (${cfg.dimW} \xD7 ${cfg.dimD} cm)`,
      `Styl: ${(styleObj == null ? void 0 : styleObj.name) || "Vlastn\xED"}`,
      `Tvar n\xE1pisov\xE9 desky: ${(shapeObj == null ? void 0 : shapeObj.name) || cfg.shape}`,
      `Konstrukce: ${construction}`,
      `Materi\xE1ly:
${matRows}`,
      `P\xEDsmo: ${(fontObj == null ? void 0 : fontObj.name) || cfg.font} \xB7 ${(tcObj == null ? void 0 : tcObj.name) || cfg.textColor}`,
      cfg.type === "dvojhrob" ? `Rozvr\u017Een\xED n\xE1pisu: ${(shapeObj == null ? void 0 : shapeObj.split) ? "samostatn\xE9 desky, po\u0159ad\xED osob st\u0159\xEDdav\u011B vlevo / vpravo po \u0159ad\xE1ch" : cfg.inscriptionLayout === "stacked" ? "osoby pod sebou" : "osoby vedle sebe, po\u0159ad\xED st\u0159\xEDdav\u011B vlevo / vpravo po \u0159ad\xE1ch"}` : null,
      cfg.type === "dvojhrob" && ((_c = cfg.reservedRows) == null ? void 0 : _c.some(Boolean)) ? `Rezervovan\xE1 m\xEDsta pro budouc\xED n\xE1pis: ${cfg.reservedRows.map((reserved, i) => reserved ? i + 1 : null).filter(Boolean).join(", ")} (po\u0159ad\xED osob; ponechat pr\xE1zdn\xE1)` : null,
      inquiryInscription.family ? `Rodina (naho\u0159e): ${inquiryInscription.family}` : null,
      `N\xE1pis: ${inquiryInscription.name || "dopln\xEDme spole\u010Dn\u011B"}`,
      `Data: ${inquiryInscription.dates || "\u2014"}`,
      inquiryInscription.sub ? `V\u011Bnov\xE1n\xED: ${inquiryInscription.sub}` : null,
      (cfg.photoRows || []).some(Boolean) ? `Fotokeramika 7 \xD7 9 cm: ano (u ${(cfg.photoRows || []).filter(Boolean).length === 1 ? "jednoho jm\xE9na" : "v\xEDce jmen"})` : null,
      `Dopl\u0148ky: ${accs}`,
      "Doprava a mont\xE1\u017E: sou\u010D\xE1st nab\xEDdky",
      `Star\xFD pomn\xEDk k demont\xE1\u017Ei: ${cfg.services && cfg.services.demontaz ? "ano \u2014 zahrnout do nab\xEDdky" : "neuvedeno"}`
    ].filter(Boolean).join("\n");
  }
  function buildInquiryMessage(cfg, intent, note = "") {
    const purpose = intent === "advice" ? "\u017D\xE1dost z\xE1kazn\xEDka: pot\u0159ebuji poradit s n\xE1vrhem. Konfigurace je rozpracovan\xE1; detaily domluv\xEDme spole\u010Dn\u011B." : "\u017D\xE1dost z\xE1kazn\xEDka: pros\xEDm o p\u0159esnou cenovou nab\xEDdku k p\u0159ilo\u017Een\xE9mu n\xE1vrhu.";
    return [purpose, buildInquirySummary(cfg), note.trim() ? `--- Dopln\u011Bn\xED od z\xE1kazn\xEDka ---
${note.trim()}` : ""].filter(Boolean).join("\n\n");
  }
  const Ico = {
    arrow: /* @__PURE__ */ React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.4", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("path", { d: "M5 12h14M12 5l7 7-7 7" })),
    arrowL: /* @__PURE__ */ React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.4", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("path", { d: "M19 12H5M12 19l-7-7 7-7" })),
    phone: /* @__PURE__ */ React.createElement("svg", { width: "13", height: "13", fill: "none", stroke: "currentColor", strokeWidth: "2.2", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.97 9.81 19.79 19.79 0 0 1 .9 1.18 2 2 0 0 1 2.88 0h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" })),
    mail: /* @__PURE__ */ React.createElement("svg", { width: "13", height: "13", fill: "none", stroke: "currentColor", strokeWidth: "2.2", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" }), /* @__PURE__ */ React.createElement("polyline", { points: "22,6 12,13 2,6" })),
    share: /* @__PURE__ */ React.createElement("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("circle", { cx: "18", cy: "5", r: "3" }), /* @__PURE__ */ React.createElement("circle", { cx: "6", cy: "12", r: "3" }), /* @__PURE__ */ React.createElement("circle", { cx: "18", cy: "19", r: "3" }), /* @__PURE__ */ React.createElement("path", { d: "M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" })),
    fullscreen: /* @__PURE__ */ React.createElement("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("path", { d: "M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m13-5v3a2 2 0 0 1-2 2h-3" })),
    rotate: /* @__PURE__ */ React.createElement("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ React.createElement("path", { d: "M3 12a9 9 0 1 0 9-9", strokeLinecap: "round" }), /* @__PURE__ */ React.createElement("path", { d: "M3 3v6h6" })),
    check: /* @__PURE__ */ React.createElement("svg", { width: "13", height: "13", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "2.4" }, /* @__PURE__ */ React.createElement("path", { d: "M3 8.5l3.2 3.2L13 5", strokeLinecap: "round", strokeLinejoin: "round" })),
    info: /* @__PURE__ */ React.createElement("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "9" }), /* @__PURE__ */ React.createElement("path", { d: "M12 16v-4M12 8h.01" })),
    warn: /* @__PURE__ */ React.createElement("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("path", { d: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" }), /* @__PURE__ */ React.createElement("path", { d: "M12 9v4M12 17h.01" })),
    download: /* @__PURE__ */ React.createElement("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("path", { d: "M12 3v12" }), /* @__PURE__ */ React.createElement("path", { d: "m7 10 5 5 5-5" }), /* @__PURE__ */ React.createElement("path", { d: "M5 21h14" })),
    camera: /* @__PURE__ */ React.createElement("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("path", { d: "M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3z" }), /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "13", r: "3.5" }))
  };
  const STEP_ICON = {
    type: '<path d="M4 20h16M6 20V9l6-4 6 4v11M9 20v-5h6v5"/>',
    size: '<path d="M3 8h18M3 8v8M21 8v8M3 16h18M7 11v2M11 11v2M15 11v2"/>',
    style: '<path d="M12 2 2 8l10 6 10-6-10-6z"/><path d="M2 12l10 6 10-6"/><path d="M2 16l10 6 10-6"/>',
    material: '<path d="M12 22a10 10 0 1 1 10-10c0 5-5 4-5 7s-3 3-5 3z"/><circle cx="8" cy="10" r="1"/><circle cx="12" cy="6.5" r="1"/><circle cx="16" cy="10" r="1"/>',
    text: '<path d="M4 7V5h16v2M12 5v14M9 19h6"/>',
    extras: '<path d="M12 3l2.1 4.7L19 8.3l-3.5 3.4.9 4.9L12 14.3 7.6 16.6l.9-4.9L5 8.3l4.9-.6z"/>',
    summary: '<path d="M20 6L9 17l-5-5"/>'
  };
  function StepIcon({ id }) {
    return /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", dangerouslySetInnerHTML: { __html: STEP_ICON[id] || "" } });
  }
  const SHAPE_GLYPH = {
    rovny: '<rect x="5" y="3" width="14" height="18"/>',
    zkosene: '<path d="M5 3 H19 L17 21 H7 Z"/>',
    "dvoj-sloupek": '<rect x="2" y="5" width="8.4" height="16"/><rect x="10.4" y="3" width="3.2" height="18"/><rect x="13.6" y="5" width="8.4" height="16"/>',
    "dvoj-sloupek-vlna": '<path d="M2 8 C4.8 5.2 7.2 8.6 10.4 5 V21 H2 Z"/><rect x="10.4" y="3" width="3.2" height="18"/><path d="M22 8 C19.2 5.2 16.8 8.6 13.6 5 V21 H22 Z"/>',
    "dvoj-mezera": '<rect x="2" y="4" width="8.5" height="17"/><rect x="13.5" y="4" width="8.5" height="17"/>'
  };
  function ShapeGlyph({ id, type }) {
    const design = typeof window.getHeadstoneDesign === "function" ? window.getHeadstoneDesign(id, type) : null;
    const shape = (window.SHAPES || []).find((s) => s.id === id);
    const svgPath = shape && shape.svgPath;
    const pathRef = useRef(null);
    const [pathViewBox, setPathViewBox] = useState("0 0 24 24");
    useLayoutEffect(() => {
      if (!pathRef.current) return;
      const box = pathRef.current.getBBox();
      if (box.width > 0 && box.height > 0) setPathViewBox(`${box.x} ${box.y} ${box.width} ${box.height}`);
    }, [svgPath, design]);
    if (design && design.widthMm > 0 && design.heightMm > 0 && design.parts && design.parts.length) {
      return /* @__PURE__ */ React.createElement("svg", { viewBox: `0 0 ${design.widthMm} ${design.heightMm}`, fill: "currentColor", preserveAspectRatio: "xMidYMid meet", "aria-hidden": "true" }, design.parts.slice().sort((a, b) => (a.role === "backing" ? 0 : 1) - (b.role === "backing" ? 0 : 1)).map((part, index) => /* @__PURE__ */ React.createElement(
        "polygon",
        {
          key: part.id || index,
          points: part.points.map(([x, y]) => `${x * design.widthMm},${y * design.heightMm}`).join(" "),
          fillOpacity: part.role === "backing" ? 0.35 : part.role === "pillar" ? 1 : 0.82
        }
      )));
    }
    if (svgPath) return /* @__PURE__ */ React.createElement("svg", { viewBox: pathViewBox, fill: "currentColor", preserveAspectRatio: "xMidYMid meet", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { ref: pathRef, d: svgPath }));
    return /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", fill: "currentColor", preserveAspectRatio: "xMidYMid meet", "aria-hidden": "true", dangerouslySetInnerHTML: { __html: SHAPE_GLYPH[id] || SHAPE_GLYPH.rovny } });
  }
  function InfoDot({ hint }) {
    const [open, setOpen] = useState(false);
    return /* @__PURE__ */ React.createElement("span", { className: "info-wrap" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "info-dot",
        "aria-label": hint,
        "aria-expanded": open,
        onClick: (e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        },
        onBlur: () => setOpen(false)
      },
      Ico.info
    ), open && /* @__PURE__ */ React.createElement("span", { className: "info-bubble", role: "tooltip" }, hint));
  }
  const assetUrl = (path) => path + (path.includes("?") ? "&" : "?") + "v=" + (window.ADAMEK_ASSET_VERSION || window.ADAMEK_CACHE_BUST || Date.now());
  const backgroundImageUrl = (path) => `url("${assetUrl(path).replace(/"/g, "%22")}")`;
  const materialStyle = (m) => m && m.texture ? { backgroundImage: backgroundImageUrl(m.texture), backgroundSize: "cover", backgroundPosition: "center" } : { background: `linear-gradient(135deg, ${m && m.c1 || "#777"}, ${m && m.c2 || "#555"} 55%, ${m && m.c3 || "#333"})` };
  const fmt = (n) => typeof n === "number" ? n.toLocaleString("cs-CZ").replace(/ /g, " ") : n;
  const htmlEscape = (value) => String(value != null ? value : "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
  function DimensionField({ label, value, min, max, onCommit }) {
    const [draft, setDraft] = useState(String(value));
    const [notice, setNotice] = useState("");
    useEffect(() => {
      setDraft(String(value));
    }, [value]);
    const commit = () => {
      const parsed = draft.trim() === "" ? value : Number(draft);
      const next = Number.isFinite(parsed) ? Math.max(min, Math.min(max, parsed)) : value;
      setDraft(String(next));
      onCommit(next);
      setNotice(next !== parsed ? `Pro tento typ lze zadat ${min}\u2013${max} cm.` : "");
    };
    return /* @__PURE__ */ React.createElement("label", { className: "field" }, /* @__PURE__ */ React.createElement("span", null, label, " (cm)"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        inputMode: "decimal",
        value: draft,
        min,
        max,
        onChange: (e) => {
          setDraft(e.target.value);
          setNotice("");
        },
        onBlur: commit,
        onKeyDown: (e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }
      }
    ), notice && /* @__PURE__ */ React.createElement("small", { role: "status" }, notice));
  }
  function GraveTypeGlyph({ type }) {
    const wide = type === "dvojhrob";
    const short = type === "urnovy";
    return /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 88 76", fill: "none", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: wide ? "M8 34 55 28 81 56 29 66Z" : short ? "M15 38 57 31 75 52 32 63Z" : "M17 30 46 25 73 59 37 68Z", fill: "#ddd6cb", stroke: "#9d9589", strokeWidth: "1.4" }), /* @__PURE__ */ React.createElement("path", { d: wide ? "M16 35 53 31 73 54 31 61Z" : short ? "M23 40 55 35 67 51 34 58Z" : "M24 33 45 29 65 57 39 63Z", fill: "#f8f5ef", stroke: "#b2aa9e" }), /* @__PURE__ */ React.createElement("path", { d: wide ? "M18 34V12L52 8V30Z" : "M25 35V12L49 8V31Z", fill: "#444541", stroke: "#2b302e", strokeWidth: "1.4" }), /* @__PURE__ */ React.createElement("path", { d: "m31 20 12-2m-12 6 12-2", stroke: "#d8c6a0", strokeWidth: "1.2" }));
  }
  function isSamplePerson(name, dates) {
    const sampleNames = INSCR_DOUBLE.name.split("\n");
    const sampleDates = INSCR_DOUBLE.dates.split("\n");
    return sampleNames.some((sample, i) => (name == null ? void 0 : name.trim()) === sample && (dates == null ? void 0 : dates.trim()) === sampleDates[i]);
  }
  function isSampleInscription(inscription) {
    const dates = String((inscription == null ? void 0 : inscription.dates) || "").split("\n");
    return String((inscription == null ? void 0 : inscription.name) || "").split("\n").some((name, i) => isSamplePerson(name, dates[i]));
  }
  function inscriptionForInquiry(inscription) {
    const names = String((inscription == null ? void 0 : inscription.name) || "").split("\n");
    const dates = String((inscription == null ? void 0 : inscription.dates) || "").split("\n");
    const sampleRows = names.map((name, i) => isSamplePerson(name, dates[i]));
    const hasSample = sampleRows.some(Boolean);
    return {
      ...inscription,
      family: hasSample && inscription.family === INSCR_SINGLE.family ? "" : inscription.family,
      name: names.map((name, i) => sampleRows[i] ? "[uk\xE1zkov\xE9 jm\xE9no \u2014 dopln\xEDme se z\xE1kazn\xEDkem]" : name).join("\n"),
      dates: dates.map((date, i) => sampleRows[i] ? "[datum dopln\xEDme]" : date).join("\n")
    };
  }
  function TrustStrip() {
    return /* @__PURE__ */ React.createElement("div", { className: "trust-strip", "aria-label": "V\xFDhody nez\xE1vazn\xE9 popt\xE1vky" }, /* @__PURE__ */ React.createElement("span", null, Ico.check, " Nez\xE1vazn\u011B"), /* @__PURE__ */ React.createElement("span", null, Ico.check, " Zam\u011B\u0159en\xED zdarma"), /* @__PURE__ */ React.createElement("span", null, Ico.check, " Rodinné kamenictví"));
  }
  function InquiryFormModal({ cfg, typeObj, styleObj, onCancel, initialPhoto, intent = "quote" }) {
    var _a;
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [locality, setLocality] = useState("");
    const [preferredContact, setPreferredContact] = useState("telefon");
    const [userNote, setUserNote] = useState("");
    const [sitePhoto, setSitePhoto] = useState(initialPhoto || null);
    const [sitePhotoPreview, setSitePhotoPreview] = useState(() => initialPhoto ? URL.createObjectURL(initialPhoto) : "");
    const [sitePhotoError, setSitePhotoError] = useState("");
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [deliveryAvailable, setDeliveryAvailable] = useState(null);
    const submissionId = useRef(crypto.randomUUID());
    useEffect(() => {
      let cancelled = false;
      fetch(API_ENDPOINT).then((res) => res.json()).then((data) => {
        if (!cancelled) setDeliveryAvailable(data.available === true);
      }).catch(() => { if (!cancelled) setDeliveryAvailable(false); });
      return () => { cancelled = true; };
    }, []);
    const honeypotRef = useRef("");
    const fieldRefs = useRef({});
    const detailsRef = useRef(null);
    const serverErrorRef = useRef(null);
    const submittingRef = useRef(false);
    useEffect(() => {
      const timer = window.setTimeout(() => {
        const target = window.matchMedia("(max-width: 900px)").matches ? document.getElementById("inquiry-modal-title") : fieldRefs.current.name;
        target == null ? void 0 : target.focus({ preventScroll: true });
      }, 40);
      return () => window.clearTimeout(timer);
    }, []);
    useEffect(() => () => {
      if (sitePhotoPreview) URL.revokeObjectURL(sitePhotoPreview);
    }, [sitePhotoPreview]);
    useEffect(() => {
      var _a2;
      if (serverError) (_a2 = serverErrorRef.current) == null ? void 0 : _a2.focus();
    }, [serverError]);
    const summary = buildInquiryMessage(cfg, intent, userNote);
    const hasBothContacts = Boolean(phone.trim() && email.trim());
    function validateInquiryFields({ name: name2 = "", phone: phone2 = "", email: email2 = "", preferredContact: preferredContact2 = "telefon", sitePhotoError: sitePhotoError2 = "" }) {
      const errors2 = {};
      const trimmedName = name2.trim();
      const trimmedPhone = phone2.trim();
      const trimmedEmail = email2.trim();
      const phoneDigits = trimmedPhone.replace(/[\s().-]/g, "");
      if (trimmedName.length < 2 || trimmedName.length > 100) errors2.name = "Napi\u0161te pros\xEDm sv\xE9 jm\xE9no (2\u2013100 znak\u016F).";
      if (!trimmedPhone && !trimmedEmail) errors2.phone = "Vypl\u0148te pros\xEDm telefon nebo e-mail. Sta\u010D\xED jeden kontakt.";
      else if (trimmedPhone && (trimmedPhone.length > 30 || !/^\+?[1-9][0-9]{8,14}$/.test(phoneDigits))) errors2.phone = "Zkontrolujte \u010D\xEDslo v\u010Detn\u011B p\u0159edvolby, nap\u0159\xEDklad +420 602 123 456.";
      if (trimmedEmail && (trimmedEmail.length > 200 || !EMAIL_RE.test(trimmedEmail))) errors2.email = "Zkontrolujte e-mail, nap\u0159\xEDklad jmeno@seznam.cz.";
      if (sitePhotoError2) errors2.sitePhoto = sitePhotoError2;
      const effectiveContact = trimmedPhone && trimmedEmail ? preferredContact2 === "email" ? "email" : "telefon" : trimmedPhone ? "telefon" : "email";
      return { errors: errors2, effectiveContact };
    }
    function handlePhotoChange(file) {
      setSitePhoto(null);
      setSitePhotoPreview("");
      setSitePhotoError("");
      setErrors((previous) => {
        const next = { ...previous };
        delete next.sitePhoto;
        return next;
      });
      if (!file) return;
      if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) {
        setSitePhotoError("Nahrajte pros\xEDm JPG, PNG nebo WEBP fotku.");
        return;
      }
      if (file.size > PHOTO_MAX_BYTES) {
        setSitePhotoError("Fotka je moc velk\xE1. Maxim\xE1ln\xED velikost je 4 MB.");
        return;
      }
      setSitePhoto(file);
      setSitePhotoPreview(URL.createObjectURL(file));
      trackEvent("photo_selected", { size: file.size, type: file.type });
    }
    async function handleSubmit(ev) {
      var _a2;
      ev.preventDefault();
      if (submittingRef.current || deliveryAvailable !== true) return;
      setServerError(null);
      const result = validateInquiryFields({ name, phone, email, preferredContact, sitePhotoError });
      setErrors(result.errors);
      const invalidFields = Object.keys(result.errors);
      if (invalidFields.length) {
        trackEvent("inquiry_submit_error", { stage: "validation", fields: invalidFields.join(",") });
        if (result.errors.sitePhoto && detailsRef.current) detailsRef.current.open = true;
        window.requestAnimationFrame(() => {
          var _a3;
          return (_a3 = fieldRefs.current[invalidFields[0]]) == null ? void 0 : _a3.focus();
        });
        return;
      }
      submittingRef.current = true;
      setSubmitting(true);
      trackEvent("inquiry_submit_attempt", { hasPhoto: !!sitePhoto, preferredContact: result.effectiveContact });
      try {
        const fd = new FormData();
        fd.append("submissionId", submissionId.current);
        fd.append("name", name.trim());
        fd.append("email", email.trim());
        fd.append("phone", phone.trim());
        fd.append("orderType", "Pomn\xEDk / hrobka");
        fd.append("locality", locality.trim());
        fd.append("dimensions", `${cfg.dimW} \xD7 ${cfg.dimD} cm`);
        fd.append("deadline", "");
        fd.append("preferredContact", result.effectiveContact);
        fd.append("message", summary);
        if (sitePhoto) fd.append("files", sitePhoto, sitePhoto.name || "foto-mista.jpg");
        try {
          fd.append("designUrl", proposalUrlFor(cfg));
        } catch (e) {
        }
        const galleryShape = (window.SHAPES || []).find((s) => s.gallery && s.id === cfg.shape);
        if (galleryShape && galleryShape.thumb) fd.append("customShapeUrl", window.location.origin + "/konfigurator/Tvary/thumbs/" + galleryShape.thumb);
        fd.append("honeypot", honeypotRef.current || "");
        const res = await fetch(API_ENDPOINT, { method: "POST", body: fd });
        const accepted = res.ok && ((_a2 = await res.json().catch(() => null)) == null ? void 0 : _a2.ok) === true;
        if (!accepted) {
          trackEvent("inquiry_submit_error", { stage: "server", status: res.status });
          setServerError(res.status === 429 ? "Odeslali jste v\xEDce po\u017Eadavk\u016F za sebou. Chv\xEDli po\u010Dkejte a zkuste to znovu. Vypln\u011Bn\xE9 \xFAdaje zde z\u016Fst\xE1vaj\xED." : res.status === 413 ? "P\u0159\xEDloha je p\u0159\xEDli\u0161 velk\xE1. Vyberte fotku do 4 MB nebo ji odeberte. Vypln\u011Bn\xE9 \xFAdaje zde z\u016Fst\xE1vaj\xED." : "Popt\xE1vku se nepoda\u0159ilo odeslat. Vypln\u011Bn\xE9 \xFAdaje zde z\u016Fst\xE1vaj\xED \u2014 zkuste to znovu nebo n\xE1m zavolejte.");
        } else {
          trackEvent("inquiry_submit_success", { hasPhoto: !!sitePhoto });
          window.location.href = THANKYOU_URL;
          return;
        }
      } catch (e) {
        trackEvent("inquiry_submit_error", { stage: "network" });
        setServerError("Odesl\xE1n\xED se nezda\u0159ilo. Zkontrolujte p\u0159ipojen\xED a zkuste to znovu. Vypln\u011Bn\xE9 \xFAdaje zde z\u016Fst\xE1vaj\xED.");
      } finally {
        submittingRef.current = false;
        setSubmitting(false);
      }
    }
    const errStyle = { fontSize: 13, color: "#b3261e", marginTop: 4, display: "block" };
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h3", { id: "inquiry-modal-title", tabIndex: -1 }, intent === "advice" ? "Porad\xEDme v\xE1m s n\xE1vrhem" : "Nez\xE1vazn\xE1 cenov\xE1 nab\xEDdka"), /* @__PURE__ */ React.createElement("p", { className: "modal-lead" }, intent === "advice" ? "Nemus\xEDte m\xEDt v\u0161e rozhodnut\xE9. Ozveme se a spole\u010Dn\u011B dolad\xEDme v\xE1\u0161 n\xE1vrh." : "Sta\u010D\xED jm\xE9no a jeden kontakt. N\xE1vrh p\u0159ilo\u017E\xEDme automaticky, detaily m\u016F\u017Eeme doplnit spole\u010Dn\u011B.", " Odesl\xE1n\xEDm nic neobjedn\xE1v\xE1te."), /* @__PURE__ */ React.createElement("div", { className: "modal-mini-summary" }, /* @__PURE__ */ React.createElement("div", { className: "mms-row" }, /* @__PURE__ */ React.createElement("span", null, typeObj.name, " \xB7 ", ((_a = window.SHAPES.find((shape) => shape.id === cfg.shape)) == null ? void 0 : _a.name) || "Vlastn\xED n\xE1vrh"), /* @__PURE__ */ React.createElement("span", null, cfg.dimW, " \xD7 ", cfg.dimD, " cm")), /* @__PURE__ */ React.createElement("div", { className: "mms-row" }, /* @__PURE__ */ React.createElement("span", null, "V\xE1\u0161 n\xE1vrh"), /* @__PURE__ */ React.createElement("span", null, "P\u0159ilo\u017E\xEDme automaticky"))), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSubmit, noValidate: true, "aria-busy": submitting }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        tabIndex: -1,
        autoComplete: "off",
        "aria-hidden": "true",
        onChange: (e) => {
          honeypotRef.current = e.target.value;
        },
        style: { position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }
      }
    ), /* @__PURE__ */ React.createElement("label", { htmlFor: "inquiry-name" }, "Va\u0161e jm\xE9no", /* @__PURE__ */ React.createElement(
      "input",
      {
        ref: (el) => {
          fieldRefs.current.name = el;
        },
        id: "inquiry-name",
        name: "name",
        type: "text",
        required: true,
        autoComplete: "name",
        maxLength: 100,
        placeholder: "Jm\xE9no a p\u0159\xEDjmen\xED",
        value: name,
        onChange: (e) => setName(e.target.value),
        "aria-invalid": !!errors.name,
        "aria-describedby": errors.name ? "inquiry-error-name" : void 0
      }
    ), errors.name && /* @__PURE__ */ React.createElement("span", { id: "inquiry-error-name", style: errStyle }, errors.name)), /* @__PURE__ */ React.createElement("p", { className: "inquiry-contact-help", id: "inquiry-contact-help" }, "Telefon nebo e-mail \u2014 ", /* @__PURE__ */ React.createElement("strong", null, "sta\u010D\xED jeden kontakt.")), /* @__PURE__ */ React.createElement("div", { className: "modal-contact-grid" }, /* @__PURE__ */ React.createElement("label", { className: "modal-field modal-field--phone", htmlFor: "inquiry-phone" }, /* @__PURE__ */ React.createElement("span", null, "Telefon"), /* @__PURE__ */ React.createElement("span", { className: "modal-input-wrap" }, /* @__PURE__ */ React.createElement("span", { className: "modal-input-ico", "aria-hidden": "true" }, Ico.phone), /* @__PURE__ */ React.createElement(
      "input",
      {
        ref: (el) => {
          fieldRefs.current.phone = el;
        },
        id: "inquiry-phone",
        name: "phone",
        type: "tel",
        autoComplete: "tel",
        maxLength: 30,
        placeholder: "602 123 456",
        value: phone,
        onChange: (e) => setPhone(e.target.value),
        "aria-invalid": !!errors.phone,
        "aria-describedby": "inquiry-contact-help" + (errors.phone ? " inquiry-error-phone" : "")
      }
    )), errors.phone && /* @__PURE__ */ React.createElement("span", { id: "inquiry-error-phone", style: errStyle }, errors.phone)), /* @__PURE__ */ React.createElement("label", { className: "modal-field modal-field--email", htmlFor: "inquiry-email" }, /* @__PURE__ */ React.createElement("span", null, "E-mail"), /* @__PURE__ */ React.createElement("span", { className: "modal-input-wrap" }, /* @__PURE__ */ React.createElement("span", { className: "modal-input-ico", "aria-hidden": "true" }, Ico.mail), /* @__PURE__ */ React.createElement(
      "input",
      {
        ref: (el) => {
          fieldRefs.current.email = el;
        },
        id: "inquiry-email",
        name: "email",
        type: "email",
        autoComplete: "email",
        maxLength: 200,
        placeholder: "jmeno@seznam.cz",
        value: email,
        onChange: (e) => setEmail(e.target.value),
        "aria-invalid": !!errors.email,
        "aria-describedby": "inquiry-contact-help" + (errors.email ? " inquiry-error-email" : "")
      }
    )), errors.email && /* @__PURE__ */ React.createElement("span", { id: "inquiry-error-email", style: errStyle }, errors.email))), hasBothContacts && /* @__PURE__ */ React.createElement("fieldset", { style: { border: "none", padding: 0, margin: 0, display: "grid", gap: 6 } }, /* @__PURE__ */ React.createElement("legend", { style: { fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 } }, "Jak v\xE1s m\xE1me kontaktovat?"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 16, flexWrap: "wrap" } }, ["telefon", "email"].map((val) => /* @__PURE__ */ React.createElement("label", { key: val, style: { display: "flex", flexDirection: "row", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, fontWeight: 500 } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "radio",
        name: "preferredContact",
        value: val,
        checked: preferredContact === val,
        onChange: () => setPreferredContact(val),
        style: { accentColor: "var(--accent)", width: 16, height: 16 }
      }
    ), val === "telefon" ? "Telefonicky" : "E-mailem")))), /* @__PURE__ */ React.createElement("details", { className: "inquiry-details", ref: detailsRef }, /* @__PURE__ */ React.createElement("summary", null, sitePhoto ? "Fotka je p\u0159ilo\u017Eena \xB7 doplnit m\xEDsto nebo pozn\xE1mku" : "Doplnit m\xEDsto, pozn\xE1mku nebo fotku", " ", /* @__PURE__ */ React.createElement("span", null, "(nepovinn\xE9)")), /* @__PURE__ */ React.createElement("div", { className: "inquiry-details-body" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "inquiry-locality" }, "M\u011Bsto h\u0159bitova", /* @__PURE__ */ React.createElement(
      "input",
      {
        id: "inquiry-locality",
        name: "locality",
        type: "text",
        maxLength: 100,
        placeholder: "Např. Jeseník",
        value: locality,
        onChange: (e) => setLocality(e.target.value)
      }
    )), /* @__PURE__ */ React.createElement("label", { htmlFor: "inquiry-note" }, "Pozn\xE1mka nebo dotaz", /* @__PURE__ */ React.createElement(
      "textarea",
      {
        id: "inquiry-note",
        name: "message",
        maxLength: 2e3,
        placeholder: "Nap\u0159\xEDklad term\xEDn nebo zvl\xE1\u0161tn\xED p\u0159\xE1n\xED\u2026",
        rows: 3,
        value: userNote,
        onChange: (e) => setUserNote(e.target.value)
      }
    )), /* @__PURE__ */ React.createElement("label", { className: "upload-box", htmlFor: "inquiry-photo" }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, Ico.camera), /* @__PURE__ */ React.createElement("strong", null, sitePhoto ? sitePhoto.name : "P\u0159ilo\u017Eit fotku hrobov\xE9ho m\xEDsta"), /* @__PURE__ */ React.createElement("small", { id: "inquiry-photo-help" }, "Pom\u016F\u017Ee n\xE1m posoudit m\xEDsto a p\u0159\xEDstup. JPG, PNG nebo WEBP, nejv\xFD\u0161e 4 MB."), sitePhotoPreview && /* @__PURE__ */ React.createElement("img", { src: sitePhotoPreview, alt: "N\xE1hled p\u0159ilo\u017Een\xE9 fotky" }), /* @__PURE__ */ React.createElement(
      "input",
      {
        ref: (el) => {
          fieldRefs.current.sitePhoto = el;
        },
        id: "inquiry-photo",
        type: "file",
        accept: "image/jpeg,image/png,image/webp",
        "aria-invalid": !!(sitePhotoError || errors.sitePhoto),
        "aria-describedby": "inquiry-photo-help" + (sitePhotoError || errors.sitePhoto ? " inquiry-error-photo" : ""),
        onChange: (e) => {
          var _a2;
          return handlePhotoChange(((_a2 = e.target.files) == null ? void 0 : _a2[0]) || null);
        }
      }
    )), (sitePhotoError || errors.sitePhoto) && /* @__PURE__ */ React.createElement("span", { id: "inquiry-error-photo", role: "alert", style: errStyle }, sitePhotoError || errors.sitePhoto), (sitePhoto || sitePhotoError) && /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-ghost", onClick: () => {
      handlePhotoChange(null);
      if (fieldRefs.current.sitePhoto) fieldRefs.current.sitePhoto.value = "";
    } }, "Odebrat fotku"))), /* @__PURE__ */ React.createElement("p", { style: { margin: "4px 0 0", fontSize: 13, lineHeight: 1.55, color: "var(--muted)", fontWeight: 400 } }, "Údaje, návrh a případnou fotku předáte Kamenictví Adámek pro vyřízení poptávky. Dotazy ke zpracování: info@kamenictvi-adamek.cz."), deliveryAvailable === false && React.createElement("p", { className: "inquiry-feedback", role: "status" }, "Online odesílání nyní není dostupné. Návrh můžete uložit jako PDF nebo nám zavolat na ", React.createElement("a", { href: "tel:+420602277869" }, "602 277 869"), "."), serverError && /* @__PURE__ */ React.createElement("p", { ref: serverErrorRef, className: "inquiry-feedback", role: "alert", tabIndex: -1 }, serverError, " ", /* @__PURE__ */ React.createElement("a", { href: "tel:+420602277869" }, "Zavolat 602 277 869")), /* @__PURE__ */ React.createElement("div", { className: "modal-actions" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-ghost", onClick: onCancel, disabled: submitting }, "Zp\u011Bt k n\xE1vrhu"), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary", disabled: submitting || deliveryAvailable !== true }, submitting ? "Odes\xEDl\xE1me\u2026" : /* @__PURE__ */ React.createElement(React.Fragment, null, intent === "advice" ? "Po\u017E\xE1dat o radu" : "Po\u017E\xE1dat o cenovou nab\xEDdku", " ", Ico.arrow))), /* @__PURE__ */ React.createElement("p", { style: { margin: 0, fontSize: 12, color: "var(--muted)", lineHeight: 1.55, textAlign: "center" } }, "Poptávku s vámi projdeme osobně. ", /* @__PURE__ */ React.createElement("a", { href: "tel:+420602277869", style: { color: "var(--accent)", fontWeight: 600 } }, "Rad\u011Bji zavolat: 602 277 869"))));
  }
  const MATERIAL_GROUPS = [
    { id: "face", shortName: "N\xE1pisov\xE1 deska", desc: "Hlavn\xED pohledov\xE1 \u010D\xE1st u n\xE1pisu. Materi\xE1l se pou\u017Eije na svislou n\xE1pisovou desku i horn\xED podlo\u017Eku.", componentIds: ["napisova_deska", "podlozka_1"] },
    { id: "frames", shortName: "R\xE1my", desc: "Or\xE1mov\xE1n\xED hrobov\xE9ho m\xEDsta \u2014 pohledov\u011B nejv\xFDrazn\u011Bj\u0161\xED vodorovn\xFD prvek. Materi\xE1l se pou\u017Eije i na navazuj\xEDc\xED spodn\xED podlo\u017Eku.", componentIds: ["ram", "podlozka_2"] },
    { id: "base", shortName: "Podstavec", desc: "Spodn\xED vyv\xFD\u0161en\xE1 \u010D\xE1st (sokl) pod deskami.", componentIds: ["sokl"] },
    { id: "covers", shortName: "Kryc\xED deska", desc: "Vodorovn\xE9 kryc\xED plochy hrobu. U dvojhrobu sem m\u016F\u017Ee pat\u0159it i prost\u0159edn\xED kryc\xED deska.", componentIds: ["kryci_deska"] }
  ];
  const GROUP_RECOMMENDED = { face: "impala", frames: "tarn", base: "tarn", covers: "tarn" };
  const recommendedMatFor = (mode, groupId) => mode === "cely" ? "tarn" : GROUP_RECOMMENDED[groupId] || "tarn";
  const INSCR_SINGLE = { family: "Rodina Nov\xE1kova", name: "Franti\u0161ek Nov\xE1k", dates: "* 12. 3. 1948    \u2020 4. 9. 2024", sub: "S l\xE1skou vzpom\xEDn\xE1me" };
  const INSCR_DOUBLE = { family: "Rodina Nov\xE1kova", name: "Franti\u0161ek Nov\xE1k\nAnna Nov\xE1kov\xE1", dates: "* 12. 3. 1948    \u2020 4. 9. 2024\n* 7. 6. 1950    \u2020 18. 2. 2023", sub: "S l\xE1skou vzpom\xEDn\xE1me" };
  const SIZE_PRESETS = {
    urnovy: [{ w: 90, d: 120 }, { w: 70, d: 90 }],
    jednohrob: [{ w: 90, d: 200 }, { w: 120, d: 250 }],
    dvojhrob: [{ w: 200, d: 250 }, { w: 230, d: 280 }]
  };
  const ANGLES = [["perspective", "Prostorový"], ["front", "Zepředu"], ["side", "Z boku"], ["top", "Půdorys"], ["detail", "Nápis zblízka"]];
  function App() {
    var _a, _b;
    const urlParams = new URLSearchParams(window.location.search);
    const layoutParam = urlParams.get("layout");
    const isSplit = layoutParam === "split" || layoutParam === "2col";
    const isHeroEmbed = urlParams.get("embed") === "hero";
    const heroVariant = urlParams.get("variant") || "base";
    const defaultStyle = window.STYLES[0];
    const buildHeroConfig = () => {
      const base = {
        type: "urnovy",
        dimW: 90,
        dimD: 120,
        style: "custom",
        shape: defaultStyle.shape,
        materials: { ...defaultStyle.materials },
        hasSokl: false,
        hasCover: true,
        hasWindow: true,
        windowFrame: "nerez",
        edgeMode: "presah",
        inscription: { ...INSCR_SINGLE },
        textColor: "zlata",
        accessories: { vase: true, lantern: true },
        vaseStyle: "granit",
        lanternStyle: "granit",
        ornamentType: "rose"
      };
      if (heroVariant === "aurora-wave") {
        return {
          ...base,
          type: "jednohrob",
          dimW: 90,
          dimD: 200,
          shape: "vlna-sikma",
          hasSokl: true,
          hasWindow: true,
          accessories: { vase: true, lantern: true },
          vaseStyle: "granit",
          lanternStyle: "granit",
          materials: {
            napisova_deska: "aurora-natural",
            podlozka_1: "aurora-natural",
            podlozka_2: "aurora-natural",
            sokl: "aurora-natural",
            ram: "aurora-natural",
            kryci_deska: "aurora-natural"
          }
        };
      }
      if (heroVariant === "nero-double") {
        return {
          ...base,
          type: "dvojhrob",
          dimW: 200,
          dimD: 200,
          shape: "rovny",
          // Bez soklu. Bez-soklový DH model nemá vlastní vaza/lampa uzly — doplňky
          // se naroubují z donor sokl-modelu (viz graftHeroDvojhrobAccessories).
          hasSokl: false,
          hasWindow: false,
          inscription: { ...INSCR_DOUBLE },
          textColor: "stribrna",
          accessories: { vase: true, lantern: true },
          vaseStyle: "granit",
          lanternStyle: "granit",
          ornamentType: "cross",
          materials: {
            napisova_deska: "aurora",
            podlozka_1: "aurora",
            podlozka_2: "aurora",
            sokl: "aurora",
            ram: "aurora",
            kryci_deska: "aurora"
          }
        };
      }
      if (heroVariant === "vizag-tarn-double") {
        return {
          ...base,
          type: "dvojhrob",
          dimW: 200,
          dimD: 200,
          shape: "vlna-sikma",
          hasSokl: true,
          hasWindow: false,
          inscription: { ...INSCR_DOUBLE },
          accessories: { vase: true, lantern: true },
          vaseStyle: "granit",
          lanternStyle: "granit",
          materials: {
            napisova_deska: "vizag-blue",
            podlozka_1: "vizag-blue",
            podlozka_2: "tarn",
            sokl: "tarn",
            ram: "tarn",
            kryci_deska: "tarn"
          }
        };
      }
      return base;
    };
    const heroCfgFromUrl = (() => {
      if (!isHeroEmbed) return null;
      const raw = urlParams.get("cfg");
      if (!raw) return null;
      try {
        const parsed = JSON.parse(decodeURIComponent(escape(atob(raw))));
        if (!parsed || typeof parsed !== "object") return null;
        if (!window.TYPES.some((t) => t.id === parsed.type)) return null;
        return parsed;
      } catch (e) {
        return null;
      }
    })();
    const heroConfig = heroCfgFromUrl ? { ...buildHeroConfig(), ...heroCfgFromUrl } : buildHeroConfig();
    const initialCfg = {
      sourceModel: isHeroEmbed ? heroConfig.sourceModel : void 0,
      type: isHeroEmbed ? heroConfig.type : "urnovy",
      dimW: isHeroEmbed ? heroConfig.dimW : 90,
      dimD: isHeroEmbed ? heroConfig.dimD : 120,
      style: isHeroEmbed ? heroConfig.style : defaultStyle.id,
      shape: isHeroEmbed ? heroConfig.shape : defaultStyle.shape,
      materials: isHeroEmbed ? heroConfig.materials : { ...defaultStyle.materials },
      hasSokl: isHeroEmbed ? heroConfig.hasSokl : false,
      hasCover: isHeroEmbed ? heroConfig.hasCover : true,
      fillType: isHeroEmbed && heroConfig.fillType === "gravel" ? "gravel" : "soil",
      hasWindow: isHeroEmbed ? heroConfig.hasWindow : true,
      windowFrame: isHeroEmbed ? heroConfig.windowFrame : "nerez",
      edgeMode: isHeroEmbed ? heroConfig.edgeMode : "presah",
      font: "byron-rr",
      textColor: isHeroEmbed ? heroConfig.textColor : "zlata",
      inscription: isHeroEmbed ? heroConfig.inscription : { ...INSCR_SINGLE },
      photoRows: [],
      reservedRows: [],
      inscriptionLayout: "paired",
      accessories: isHeroEmbed ? heroConfig.accessories : { vase: true, lantern: true },
      vaseStyle: isHeroEmbed ? heroConfig.vaseStyle : "granit",
      lanternStyle: isHeroEmbed ? heroConfig.lanternStyle : "granit",
      ornamentType: isHeroEmbed ? heroConfig.ornamentType : "rose",
      services: { montaz: false, demontaz: false }
    };
    const [cfg, setCfg] = useState(initialCfg);
    const [step, setStep] = useState(isHeroEmbed ? 2 : 0);
    const [angle, setAngle] = useState(isHeroEmbed && urlParams.get("view") !== "perspective" ? "front" : "perspective");
    const [sceneMode, setSceneMode] = useState(urlParams.get("scene") === "cemetery" ? "cemetery" : "studio");
    const exploded = false;
    const [selectedPart, setSelectedPart] = useState("");
    const [copied, setCopied] = useState(false);
    const [modal, setModal] = useState(false);
    const [inquiryIntent, setInquiryIntent] = useState("quote");
    const openInquiry = (intent = "quote") => {
      trackEvent("inquiry_open", { step: window.STEPS[step].id, intent });
      setInquiryIntent(intent);
      setModal(true);
    };
    const closeInquiry = () => {
      trackEvent("inquiry_close", { step: window.STEPS[step].id, intent: inquiryIntent });
      setModal(false);
    };
    const [editingMobileInput, setEditingMobileInput] = useState(false);
    const [shapeGallery, setShapeGallery] = useState(false);
    useEffect(() => {
      if (!shapeGallery) return;
      const previousFocus = document.activeElement;
      const dialog = document.querySelector('.modal--gallery');
      const siblings = [...document.querySelectorAll('.app--studio > :not(.modal-backdrop)')];
      const previousInert = siblings.map((node) => node.inert);
      siblings.forEach((node) => { node.inert = true; });
      dialog?.querySelector('button')?.focus();
      const onKey = (event) => {
        if (event.key === 'Escape') { setShapeGallery(false); return; }
        if (event.key !== 'Tab' || !dialog) return;
        const items = [...dialog.querySelectorAll('button:not(:disabled), a[href]')];
        if (!items.length) return;
        if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1).focus(); }
        else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
      };
      document.addEventListener('keydown', onKey);
      return () => {
        document.removeEventListener('keydown', onKey);
        siblings.forEach((node, i) => { node.inert = previousInert[i]; });
        previousFocus?.focus?.();
      };
    }, [shapeGallery]);
    const [shareOpen, setShareOpen] = useState(false);
    const [earlyPhoto, setEarlyPhoto] = useState(null);
    const [earlyPhotoPreview, setEarlyPhotoPreview] = useState("");
    const handleEarlyPhoto = (file) => {
      if (earlyPhotoPreview) URL.revokeObjectURL(earlyPhotoPreview);
      if (!file || !/^image\/(jpeg|png|webp)$/i.test(file.type) || file.size > PHOTO_MAX_BYTES) {
        setEarlyPhoto(null);
        setEarlyPhotoPreview("");
        if (file) {
          setToast("Nahrajte pros\xEDm JPG/PNG/WEBP do 4 MB");
          setTimeout(() => setToast(""), 2600);
        }
        return;
      }
      setEarlyPhoto(file);
      setEarlyPhotoPreview(URL.createObjectURL(file));
      trackEvent("early_photo_selected", { size: file.size });
      setToast("Fotka m\xEDsta ulo\u017Eena \u2014 p\u0159ilo\u017E\xEDme ji k popt\xE1vce");
      setTimeout(() => setToast(""), 2600);
    };
    const [activeMatGroup, setActiveMatGroup] = useState("face");
    const [matModeState, setMatModeState] = useState(null);
    const [resetArmed, setResetArmed] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [showAllMaterials, setShowAllMaterials] = useState(false);
    const [toast, setToast] = useState("");
    const nameInputRef = useRef(null);
    const personInputRefs = useRef([]);
    const [editingPersonIndex, setEditingPersonIndex] = useState(null);
    const resetTimerRef = useRef(0);
    const editorBodyRef = useRef(null);
    const editorHeadRef = useRef(null);
    const firstStepRun = useRef(true);
    function sanitizeCfg(parsed) {
      if (typeof parsed !== "object" || parsed === null) return null;
      const typeObj2 = TYPES.find((t) => t.id === parsed.type);
      if (!typeObj2) return null;
      const cfg2 = { ...initialCfg, ...parsed, type: typeObj2.id };
      const num = (v, lo, hi, fallback) => {
        const n = Number(v);
        return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fallback;
      };
      cfg2.dimW = num(cfg2.dimW, typeObj2.dims.minW, typeObj2.dims.maxW, typeObj2.dims.w);
      cfg2.dimD = num(cfg2.dimD, typeObj2.dims.minD, typeObj2.dims.maxD, typeObj2.dims.d);
      const shapeDef = SHAPES.find((s) => s.id === cfg2.shape);
      if (!shapeDef || cfg2.type === "dvojhrob" && shapeDef.noDvojhrob || cfg2.type !== "dvojhrob" && shapeDef.dvojhrobOnly) cfg2.shape = "rovny";
      cfg2.materials = Object.fromEntries(COMPONENTS.map(({ id }) => [id,
        MATERIALS.some((m) => m.id === parsed.materials?.[id]) ? parsed.materials[id] : initialCfg.materials[id]]));
      cfg2.font = FONTS.some((f) => f.id === parsed.font) ? parsed.font : initialCfg.font;
      cfg2.textColor = TEXT_COLORS.some((c) => c.id === parsed.textColor) ? parsed.textColor : initialCfg.textColor;
      cfg2.style = STYLES.some((s) => s.id === parsed.style) ? parsed.style : initialCfg.style;
      const lines = (value, limit) => typeof value === "string" ? value.split("\n").slice(0, 50).map((v) => v.slice(0, limit)).join("\n") : "";
      cfg2.inscription = { family: lines(parsed.inscription?.family, 40).split("\n")[0],
        name: lines(parsed.inscription?.name, 80), dates: lines(parsed.inscription?.dates, 100),
        sub: lines(parsed.inscription?.sub, 48).split("\n")[0] };
      cfg2.accessories = { vase: parsed.accessories?.vase === true, lantern: parsed.accessories?.lantern === true };
      cfg2.services = { ...initialCfg.services, demontaz: parsed.services?.demontaz === true };
      cfg2.photoRows = Array.isArray(parsed.photoRows) ? parsed.photoRows.slice(0, 50).map((v) => v === true) : [];
      cfg2.reservedRows = Array.isArray(parsed.reservedRows) ? parsed.reservedRows.slice(0, 50).map((v, i) =>
        v === true && !cfg2.inscription.name.split("\n")[i]?.trim() && !cfg2.inscription.dates.split("\n")[i]?.trim() && !cfg2.photoRows[i]) : [];
      ["hasSokl", "hasCover", "hasWindow"].forEach((key) => { cfg2[key] = typeof parsed[key] === "boolean" ? parsed[key] : initialCfg[key]; });
      cfg2.edgeMode = parsed.edgeMode === "odskok" ? "odskok" : "presah";
      cfg2.windowFrame = parsed.windowFrame === "cerna" ? "cerna" : "nerez";
      cfg2.ornamentType = ["none", "rose", "cross", "custom"].includes(parsed.ornamentType) ? parsed.ornamentType : "none";
      ["vaseStyle", "lanternStyle"].forEach((key) => { cfg2[key] = ["granit", "plech-cerna", "plech-stribrna"].includes(parsed[key]) ? parsed[key] : "granit"; });
      delete cfg2.ornamentScale;
      delete cfg2.ornamentOffsetY;
      if (!["paired", "stacked"].includes(cfg2.inscriptionLayout)) cfg2.inscriptionLayout = "paired";
      return cfg2;
    }
    useEffect(() => {
      if (isHeroEmbed) return;
      try {
        const saved = localStorage.getItem("adamek_cfg_cockpit_v2");
        if (saved) {
          const clean = sanitizeCfg(JSON.parse(saved));
          if (clean) setCfg(clean);
        }
      } catch (e) {
      }
    }, [isHeroEmbed]);
    useEffect(() => {
      if (isHeroEmbed) return;
      try {
        localStorage.setItem("adamek_cfg_cockpit_v2", JSON.stringify(cfg));
      } catch (e) {
      }
    }, [cfg, isHeroEmbed]);
    useEffect(() => {
      if (isHeroEmbed) return;
      try {
        const urlCfg = new URLSearchParams(window.location.search).get("cfg");
        if (urlCfg && urlCfg.length < 50000) {
          const clean = sanitizeCfg(JSON.parse(decodeURIComponent(escape(atob(urlCfg)))));
          if (clean) setCfg(clean);
          window.history.replaceState({}, "", window.location.pathname);
        }
      } catch (e) {
      }
    }, [isHeroEmbed]);
    useEffect(() => {
      if (!modal && !expanded) return;
      const onKey = (e) => {
        if (e.key === "Escape") {
          if (modal) closeInquiry();
          setExpanded(false);
        }
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [modal, expanded, inquiryIntent, step]);
    useEffect(() => {
      if (!modal) return;
      const previousFocus = document.activeElement;
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const trapFocus = (event) => {
        if (event.key !== "Tab") return;
        const dialog = document.querySelector('[aria-labelledby="inquiry-modal-title"]');
        if (!dialog) return;
        const items = [...dialog.querySelectorAll('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), summary, a[href], [tabindex="0"]')].filter((item) => item.tabIndex >= 0 && item.getClientRects().length && getComputedStyle(item).visibility !== "hidden");
        const first = items[0], last = items[items.length - 1];
        if (!first) return;
        if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
          event.preventDefault();
          first.focus();
        }
      };
      document.addEventListener("keydown", trapFocus);
      return () => {
        document.body.style.overflow = previousOverflow;
        document.removeEventListener("keydown", trapFocus);
        if (previousFocus == null ? void 0 : previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
      };
    }, [modal]);
    useEffect(() => {
      if (editorBodyRef.current) editorBodyRef.current.scrollTop = 0;
      if (!isHeroEmbed) trackEvent("step_view", { step: cur.id, index: step + 1 });
      if (firstStepRun.current) {
        firstStepRun.current = false;
        return;
      }
      if (editorHeadRef.current && window.matchMedia("(max-width: 900px)").matches) {
        editorHeadRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, [step]);
    useEffect(() => {
      var _a2;
      let frame = 0;
      const syncInput = () => {
        var _a3;
        cancelAnimationFrame(frame);
        const field = document.activeElement;
        const active = window.matchMedia("(max-width: 900px)").matches && ((_a3 = editorBodyRef.current) == null ? void 0 : _a3.contains(field)) && (field == null ? void 0 : field.matches("textarea, input:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=range])"));
        setEditingMobileInput(!!active);
        if (active) frame = requestAnimationFrame(() => field.scrollIntoView({ block: "center", behavior: "instant" }));
      };
      document.addEventListener("focusin", syncInput);
      document.addEventListener("focusout", syncInput);
      window.addEventListener("resize", syncInput);
      (_a2 = window.visualViewport) == null ? void 0 : _a2.addEventListener("resize", syncInput);
      return () => {
        var _a3;
        cancelAnimationFrame(frame);
        document.removeEventListener("focusin", syncInput);
        document.removeEventListener("focusout", syncInput);
        window.removeEventListener("resize", syncInput);
        (_a3 = window.visualViewport) == null ? void 0 : _a3.removeEventListener("resize", syncInput);
      };
    }, []);
    const set = (patch) => setCfg((c) => ({ ...c, ...patch }));
    const selectType = (t) => setCfg((c) => {
      const patch = { ...c, type: t.id, dimW: t.dims.w, dimD: t.dims.d };
      const ins = c.inscription;
      const isSingleDefault = ins.name === INSCR_SINGLE.name && ins.dates === INSCR_SINGLE.dates;
      const isDoubleDefault = ins.name === INSCR_DOUBLE.name && ins.dates === INSCR_DOUBLE.dates;
      if (t.id === "dvojhrob" && isSingleDefault) {
        patch.inscription = { ...ins, name: INSCR_DOUBLE.name, dates: INSCR_DOUBLE.dates };
      } else if (t.id !== "dvojhrob" && isDoubleDefault) {
        patch.inscription = { ...ins, name: INSCR_SINGLE.name, dates: INSCR_SINGLE.dates };
      }
      if (t.id === "dvojhrob") {
        const sd = (window.SHAPES || []).find((s) => s.id === c.shape);
        if (sd && sd.noDvojhrob) {
          patch.shape = defaultStyle.shape;
          patch.style = defaultStyle.id;
        }
      } else {
        const sd = (window.SHAPES || []).find((s) => s.id === c.shape);
        if (sd && sd.dvojhrobOnly) {
          patch.shape = defaultStyle.shape;
          patch.style = defaultStyle.id;
        }
      }
      return patch;
    });
    const setMatGroup = (componentIds, matId) => setCfg((c) => {
      const next2 = { ...c.materials };
      componentIds.forEach((id) => {
        next2[id] = matId;
      });
      trackEvent("material_selected", { mode: "parts", material: matId, components: componentIds });
      return { ...c, style: "custom", materials: next2 };
    });
    const setAllStoneMaterial = (matId) => setCfg((c) => {
      const next2 = { ...c.materials };
      window.COMPONENTS.forEach((cmp) => {
        next2[cmp.id] = matId;
      });
      trackEvent("material_selected", { mode: "all", material: matId });
      return { ...c, style: "custom", materials: next2 };
    });
    const setAccessorySet = (enabled) => setCfg((c) => ({ ...c, accessories: { ...c.accessories, vase: enabled, lantern: enabled } }));
    const setAccessorySetStyle = (s) => setCfg((c) => ({ ...c, vaseStyle: s, lanternStyle: s }));
    const toggleService = (id) => setCfg((c) => ({ ...c, services: { ...c.services || {}, [id]: !(c.services || {})[id] } }));
    const setInscr = (k, v) => setCfg((c) => ({ ...c, inscription: { ...c.inscription, [k]: v } }));
    const applyStyle = (s) => set({ style: s.id, shape: s.shape, materials: { ...s.materials } });
    const lineArray = (value) => String(value || "").split(/\n/);
    const personRows = (() => {
      const names = lineArray(cfg.inscription.name);
      const dates = lineArray(cfg.inscription.dates);
      const count = Math.max(1, names.length, dates.length, (cfg.photoRows || []).length, (cfg.reservedRows || []).length);
      return Array.from({ length: count }, (_, i) => {
        var _a2;
        return { name: names[i] || "", dates: dates[i] || "", photo: !!(cfg.photoRows && cfg.photoRows[i]), reserved: ((_a2 = cfg.reservedRows) == null ? void 0 : _a2[i]) === true };
      });
    })();
    const sourceInscriptionDesign = (_a = window.getHeadstoneDesign) == null ? void 0 : _a.call(window, cfg.shape, cfg.type);
    const pairedInscription = !!sourceInscriptionDesign && (sourceInscriptionDesign.parts.filter((part) => part.role === "plate").length > 1 || (cfg.inscriptionLayout || "paired") === "paired" && personRows.length > 1);
    const moveInscriptionPerson = (index, direction) => setCfg((c) => {
      const names = lineArray(c.inscription.name), dates = lineArray(c.inscription.dates), photos = (c.photoRows || []).slice(), reserved = (c.reservedRows || []).slice();
      const count = Math.max(names.length, dates.length, photos.length, reserved.length), target = index + direction;
      if (target < 0 || target >= count) return c;
      [names, dates, photos, reserved].forEach((rows) => {
        while (rows.length < count) rows.push(rows === photos || rows === reserved ? false : "");
        [rows[index], rows[target]] = [rows[target], rows[index]];
      });
      return { ...c, photoRows: photos, reservedRows: reserved, inscription: { ...c.inscription, name: names.join("\n"), dates: dates.join("\n") } };
    });
    const togglePersonPhoto = (index) => setCfg((c) => {
      const rows = (c.photoRows || []).slice();
      while (rows.length <= index) rows.push(false);
      rows[index] = !rows[index];
      return { ...c, photoRows: rows };
    });
    const setPersonLine = (index, key, value) => setCfg((c) => {
      const names = lineArray(c.inscription.name);
      const dates = lineArray(c.inscription.dates);
      const count = Math.max(index + 1, names.length, dates.length, (c.reservedRows || []).length, 1);
      while (names.length < count) names.push("");
      while (dates.length < count) dates.push("");
      if (key === "name") names[index] = value;
      if (key === "dates") dates[index] = value;
      let end = count;
      while (end > 1 && !names[end - 1].trim() && !dates[end - 1].trim() && !(c.photoRows || [])[end - 1] && !(c.reservedRows || [])[end - 1]) end--;
      return { ...c, reservedRows: (c.reservedRows || []).map((reserved, i) => i === index && value.trim() ? false : reserved), inscription: { ...c.inscription, name: names.slice(0, end).join("\n"), dates: dates.slice(0, end).join("\n") } };
    });
    const removeInscriptionPerson = (index) => setCfg((c) => {
      const names = lineArray(c.inscription.name);
      const dates = lineArray(c.inscription.dates);
      const count = Math.max(1, names.length, dates.length, (c.photoRows || []).length, (c.reservedRows || []).length);
      while (names.length < count) names.push("");
      while (dates.length < count) dates.push("");
      names.splice(index, 1);
      dates.splice(index, 1);
      const rows = (c.photoRows || []).slice();
      rows.splice(index, 1);
      const reserved = (c.reservedRows || []).slice();
      reserved.splice(index, 1);
      return { ...c, photoRows: rows, reservedRows: reserved, inscription: { ...c.inscription, name: (names.length ? names : [""]).join("\n"), dates: (dates.length ? dates : [""]).join("\n") } };
    });
    const selectInscriptionPerson = (index) => {
      setEditingPersonIndex(index);
      window.requestAnimationFrame(() => {
        const input = personInputRefs.current[index];
        input == null ? void 0 : input.scrollIntoView({ behavior: "smooth", block: "center" });
        input == null ? void 0 : input.focus({ preventScroll: true });
      });
    };
    const addInscriptionPerson = (reserve = false) => {
      setCfg((c) => {
        const names = lineArray(c.inscription.name), dates = lineArray(c.inscription.dates);
        const count = Math.max(names.length, dates.length, (c.photoRows || []).length, (c.reservedRows || []).length);
        const reserved = Array.from({ length: count + 1 }, (_, i) => {
          var _a2;
          return i === count ? reserve : !!((_a2 = c.reservedRows) == null ? void 0 : _a2[i]);
        });
        while (names.length <= count) names.push("");
        while (dates.length <= count) dates.push("");
        return { ...c, reservedRows: reserved, inscription: { ...c.inscription, name: names.join("\n"), dates: dates.join("\n") } };
      });
      if (!reserve) window.requestAnimationFrame(() => {
        var _a2;
        return (_a2 = nameInputRef.current) == null ? void 0 : _a2.focus();
      });
    };
    const STEPS = window.STEPS;
    const total = STEPS.length;
    const cur = STEPS[step];
    const isLast = step === total - 1;
    const go = (i) => {
      const target = Math.max(0, Math.min(total - 1, i));
      setStep(target);
      if (STEPS[target].id === "text") setAngle("front");
      if (STEPS[target].id === "summary") setAngle("perspective");
    };
    const next = () => isLast ? openInquiry() : go(step + 1);
    const handlePick = (pick) => {
      if (!pick) return;
      if (pick.kind === "acc") {
        const ei = STEPS.findIndex((s) => s.id === "extras");
        if (ei >= 0) go(ei);
        return;
      }
      const group = MATERIAL_GROUPS.find((g) => g.componentIds.includes(pick.id));
      if (!group) return;
      setSelectedPart(pick.id);
      setMatModeState("parts");
      setActiveMatGroup(group.id);
      const mi = STEPS.findIndex((s) => s.id === "material");
      if (mi >= 0) go(mi);
    };
    const hoverHint = (pick) => {
      if (!pick) return "";
      if (pick.kind === "acc") return "Lampa a v\xE1za \u2014 kliknut\xEDm vyberete proveden\xED";
      const group = MATERIAL_GROUPS.find((g) => g.componentIds.includes(pick.id));
      let label = group ? group.shortName : "D\xEDl pomn\xEDku";
      if (group && group.id === "base" && !cfg.hasSokl) label = "Podlo\u017Eka";
      return label + " \u2014 kliknut\xEDm vyberete materi\xE1l";
    };
    const typeObj = window.TYPES.find((x) => x.id === cfg.type);
    const styleObj = window.STYLES.find((x) => x.id === cfg.style);
    const shapeObj = window.SHAPES.find((x) => x.id === cfg.shape);
    const fontObj = window.FONTS.find((x) => x.id === cfg.font);
    const tcObj = window.TEXT_COLORS.find((x) => x.id === cfg.textColor) || window.TEXT_COLORS[0];
    const edgeInsetCm = cfg.type === "urnovy" ? 3 : 5;
    const edgeLabel = (cfg.edgeMode || "presah") === "odskok" ? `s odskokem ${edgeInsetCm} cm` : "s p\u0159esahem 2 cm";
    const sampleInscription = isSampleInscription(cfg.inscription);
    const inscriptionMissing = !String(cfg.inscription.name || "").trim();
    const recommendedSizes = SIZE_PRESETS[cfg.type] || [{ w: typeObj.dims.w, d: typeObj.dims.d }];
    const matVisibleGroups = MATERIAL_GROUPS.filter((g) => (g.id !== "base" || cfg.hasSokl) && (g.id !== "covers" || cfg.hasCover));
    const allMatIds = window.COMPONENTS.map((c) => cfg.materials[c.id]);
    const matUniform = allMatIds.every((m) => m === allMatIds[0]);
    const matMode = matModeState || (matUniform ? "cely" : "parts");
    const activeMatGroupObj = matVisibleGroups.find((g) => g.id === activeMatGroup) || matVisibleGroups[0];
    const celySwatchMat = window.MATERIALS.find((m) => m.id === (matUniform ? allMatIds[0] : cfg.materials.napisova_deska));
    const proposalUrl = () => proposalUrlFor(cfg);
    const openProposalPrint = () => {
      const rows = buildInquirySummary(cfg).split("\n").map((line) => line.trim()).filter(Boolean);
      const dialog = document.createElement("dialog");
      dialog.className = "proposal-print";
      dialog.setAttribute("aria-label", "Tiskový návrh pomníku");
      dialog.innerHTML = `<style>
        .proposal-print{width:min(850px,94vw);max-height:90dvh;box-sizing:border-box;padding:32px;border:0;border-radius:8px;font-family:Arial,sans-serif;color:#1d2620;background:#fff;overflow:auto}
        .proposal-print::backdrop{background:rgba(15,24,18,.75)}
        .proposal-print .brand{font-size:24px;font-weight:700}.proposal-print .brand span{color:#98702c}
        .proposal-print h1{font-size:28px;margin:28px 0 8px}.proposal-print p{color:#435047;line-height:1.55}
        .proposal-print .grid{display:grid;gap:8px;margin-top:20px}.proposal-print .row{display:grid;grid-template-columns:190px 1fr;gap:14px;padding:10px 0;border-bottom:1px solid #ddd}
        .proposal-print .row span:first-child{font-weight:700;color:#435047}.proposal-print .foot{margin-top:28px;font-size:13px;color:#435047}
        .proposal-print .no-print{display:flex;gap:12px;flex-wrap:wrap;justify-content:space-between;margin-top:20px}.proposal-print button{min-height:44px;padding:12px 18px;border-radius:3px;border:1px solid #435047;background:#e2a64a;color:#1d2620;font-weight:700;cursor:pointer}
        @media(max-width:600px){.proposal-print{padding:20px}.proposal-print .row{grid-template-columns:1fr;gap:4px}}
        @media print{body>#root{display:none!important}body>.proposal-print{display:block!important;position:static;width:auto;max-width:none;max-height:none;margin:0;padding:0;border:0;overflow:visible}.proposal-print::backdrop{display:none}.proposal-print .no-print{display:none}}
      </style>
        <div class="brand">KAMENICTVÍ <span>ADÁMEK</span></div>
        <h1>Návrh pomníku</h1>
        <p>${htmlEscape(typeObj.name)} · ${htmlEscape(cfg.dimW)} × ${htmlEscape(cfg.dimD)} cm · ${htmlEscape((styleObj == null ? void 0 : styleObj.name) || "Vlastní")}</p>
        <p>Cenovou nabídku připravíme individuálně podle tohoto návrhu.</p>
        <div class="grid">${rows.map((line) => {
          const idx = line.indexOf(":");
          return idx > 0 ? `<div class="row"><span>${htmlEscape(line.slice(0, idx))}</span><span>${htmlEscape(line.slice(idx + 1).trim())}</span></div>` : `<div class="row"><span></span><span>${htmlEscape(line)}</span></div>`;
        }).join("")}</div>
        <p class="foot">Tento dokument je návrh pomníku. Individuální cenovou nabídku připravíme po upřesnění materiálu a zaměření. Kontakt: +420 602 277 869</p>
        <div class="no-print"><button type="button" data-print>Uložit jako PDF / tisk</button><form method="dialog"><button aria-label="Zavřít tiskový náhled">Zavřít</button></form></div>`;
      document.body.appendChild(dialog);
      dialog.addEventListener("close", () => dialog.remove(), { once: true });
      dialog.querySelector("[data-print]").addEventListener("click", () => window.print());
      dialog.showModal();
    };
    const downloadProposalPdf = () => {
      trackEvent("proposal_pdf_opened", {});
      setToast("P\u0159ipravuji tiskovou nab\xEDdku pro PDF");
      window.setTimeout(() => setToast(""), 2200);
      openProposalPrint();
    };
    const adjustDim = (key, delta) => {
      const dims = typeObj.dims;
      const min = key === "dimW" ? dims.minW : dims.minD;
      const max = key === "dimW" ? dims.maxW : dims.maxD;
      const current = key === "dimW" ? cfg.dimW : cfg.dimD;
      set({ [key]: Math.max(min, Math.min(max, current + delta)) });
    };
    const shareWhatsApp = () => {
      trackEvent("proposal_shared_whatsapp", {});
      const text = "Pod\xEDvej se na n\xE1\u0161 n\xE1vrh pomn\xEDku od Kamenictví Adámek: " + proposalUrl();
      window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank", "noopener");
    };
    const copyLink = () => {
      try {
        const url = proposalUrl();
        navigator.clipboard.writeText(url).then(() => {
          trackEvent("proposal_link_copied", {});
          setCopied(true);
          setToast("Odkaz na n\xE1vrh je zkop\xEDrovan\xFD");
          setTimeout(() => {
            setCopied(false);
            setToast("");
          }, 2200);
        }).catch(() => {
          setCopied(true);
          setToast("Odkaz na n\xE1vrh je p\u0159ipraven\xFD ke sd\xEDlen\xED");
          setTimeout(() => {
            setCopied(false);
            setToast("");
          }, 2200);
        });
      } catch (e) {
        setCopied(true);
        setToast("Odkaz na n\xE1vrh je p\u0159ipraven\xFD ke sd\xEDlen\xED");
        setTimeout(() => {
          setCopied(false);
          setToast("");
        }, 2200);
      }
    };
    function renderControls() {
      var _a2;
      if (cur.id === "type") {
        const dims = typeObj.dims;
        return /* @__PURE__ */ React.createElement("div", { className: "ed-stack" }, /* @__PURE__ */ React.createElement("p", { className: "step-lead" }, cur.lead), /* @__PURE__ */ React.createElement("div", { className: "grave-types", "aria-label": "Typ hrobov\xE9ho m\xEDsta" }, window.TYPES.map((t) => /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            key: t.id,
            className: "grave-type" + (cfg.type === t.id ? " sel" : ""),
            "aria-pressed": cfg.type === t.id,
            onClick: () => selectType(t)
          },
          /* @__PURE__ */ React.createElement("span", { className: "grave-type-visual" }, /* @__PURE__ */ React.createElement(GraveTypeGlyph, { type: t.id })),
          /* @__PURE__ */ React.createElement("span", { className: "grave-type-copy" }, /* @__PURE__ */ React.createElement("strong", null, t.id === "urnovy" ? "Urnov\xFD hrob" : t.name), /* @__PURE__ */ React.createElement("small", null, t.desc), /* @__PURE__ */ React.createElement("span", null, cfg.type === t.id ? cfg.dimW : t.dims.w, " \xD7 ", cfg.type === t.id ? cfg.dimD : t.dims.d, " cm \xB7 rozm\u011Br lze upravit")),
          /* @__PURE__ */ React.createElement("span", { className: "choice-check" }, cfg.type === t.id ? Ico.check : null)
        ))), /* @__PURE__ */ React.createElement("div", { className: "reassurance" }, Ico.check, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("strong", null, "Rozm\u011Bry nemus\xEDte zn\xE1t."), " P\u0159i zam\u011B\u0159en\xED je spole\u010Dn\u011B ov\u011B\u0159\xEDme.")), /* @__PURE__ */ React.createElement("details", { className: "config-details", key: cfg.type }, /* @__PURE__ */ React.createElement("summary", null, "Upravit rozm\u011Bry ", /* @__PURE__ */ React.createElement("span", null, cfg.dimW, " \xD7 ", cfg.dimD, " cm")), /* @__PURE__ */ React.createElement("div", { className: "config-details-body" }, /* @__PURE__ */ React.createElement("div", { className: "grid2" }, /* @__PURE__ */ React.createElement(DimensionField, { label: "\u0160\xED\u0159ka", value: cfg.dimW, min: dims.minW, max: dims.maxW, onCommit: (dimW) => set({ dimW }) }), /* @__PURE__ */ React.createElement(DimensionField, { label: "D\xE9lka", value: cfg.dimD, min: dims.minD, max: dims.maxD, onCommit: (dimD) => set({ dimD }) })), /* @__PURE__ */ React.createElement("div", { className: "opt-row" }, recommendedSizes.map((p) => /* @__PURE__ */ React.createElement(
          "button",
          {
            key: p.w + "x" + p.d,
            type: "button",
            className: "tile" + (cfg.dimW === p.w && cfg.dimD === p.d ? " sel" : ""),
            "aria-pressed": cfg.dimW === p.w && cfg.dimD === p.d,
            onClick: () => set({ dimW: p.w, dimD: p.d })
          },
          /* @__PURE__ */ React.createElement("strong", null, p.w, " \xD7 ", p.d, " cm")
        ))), /* @__PURE__ */ React.createElement("p", { className: "ed-q" }, "M\xE1te jin\xFD rozm\u011Br? Po\u0161lete n\xE1m n\xE1vrh a rozm\u011Br dopl\u0148te do pozn\xE1mky."))), /* @__PURE__ */ React.createElement("details", { className: "config-details" }, /* @__PURE__ */ React.createElement("summary", null, earlyPhoto ? "Fotka m\xEDsta je p\u0159ilo\u017Een\xE1" : "P\u0159idat fotku m\xEDsta", /* @__PURE__ */ React.createElement("span", null, "nepovinn\xE9")), /* @__PURE__ */ React.createElement("div", { className: "config-details-body" }, /* @__PURE__ */ React.createElement("div", { className: "upload-tile" }, /* @__PURE__ */ React.createElement("span", { className: "upload-ph", "aria-hidden": "true" }, earlyPhotoPreview ? /* @__PURE__ */ React.createElement("img", { src: earlyPhotoPreview, alt: "" }) : /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8" }, /* @__PURE__ */ React.createElement("path", { d: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" }), /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "13", r: "4" }))), /* @__PURE__ */ React.createElement("span", { className: "upload-txt" }, /* @__PURE__ */ React.createElement("b", null, earlyPhoto ? "Fotka m\xEDsta nahran\xE1 \u2713" : "M\xE1te fotku hrobov\xE9ho m\xEDsta?"), /* @__PURE__ */ React.createElement("small", null, earlyPhoto ? "P\u0159ilo\u017E\xEDme ji k va\u0161\xED popt\xE1vce." : "Nahrajte ji \u2014 pom\u016F\u017Ee n\xE1m p\u0159ipravit p\u0159esn\u011Bj\u0161\xED nab\xEDdku. Nepovinn\xE9.")), /* @__PURE__ */ React.createElement("label", { className: "upload-btn" }, earlyPhoto ? "Zm\u011Bnit" : "Nahr\xE1t fotku", /* @__PURE__ */ React.createElement(
          "input",
          {
            type: "file",
            accept: "image/jpeg,image/png,image/webp",
            style: { display: "none" },
            onChange: (e) => handleEarlyPhoto(e.target.files && e.target.files[0])
          }
        ))))));
      }
      if (cur.id === "style") {
        const selGalleryShape = window.SHAPES.find((s) => s.gallery && s.id === cfg.shape);
        const galleryAvailable = window.SHAPES.some((s) => s.gallery && !(cfg.type === "dvojhrob" && s.noDvojhrob));
        return /* @__PURE__ */ React.createElement("div", { className: "ed-stack" }, /* @__PURE__ */ React.createElement("div", { className: "shape-chooser" }, /* @__PURE__ */ React.createElement("div", { className: "ed-sublabel" }, "Tvar n\xE1pisov\xE9 desky"), /* @__PURE__ */ React.createElement("div", { className: "shape-options" }, window.SHAPES.filter((s) => !s.gallery && !(cfg.type === "dvojhrob" && s.noDvojhrob) && !(s.dvojhrobOnly && cfg.type !== "dvojhrob")).map((s) => /* @__PURE__ */ React.createElement("button", { key: s.id, type: "button", className: "tile shape-option" + (cfg.shape === s.id ? " sel" : ""), "aria-pressed": cfg.shape === s.id, onClick: () => {
          set({ shape: s.id, style: "custom" });
          setAngle("perspective");
        } }, /* @__PURE__ */ React.createElement("span", { className: "shape-glyph" }, /* @__PURE__ */ React.createElement(ShapeGlyph, { id: s.id, type: cfg.type })), /* @__PURE__ */ React.createElement("strong", null, s.name))), galleryAvailable && /* @__PURE__ */ React.createElement("button", { type: "button", className: "tile shape-option tile--more" + (selGalleryShape ? " sel" : ""), "aria-haspopup": "dialog", onClick: () => setShapeGallery(true) }, selGalleryShape ? /* @__PURE__ */ React.createElement("span", { className: "shape-glyph shape-glyph--photo", style: { backgroundImage: `url("Tvary/thumbs/${selGalleryShape.thumb}")` } }) : /* @__PURE__ */ React.createElement("span", { className: "shape-glyph" }, /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", fill: "currentColor" }, /* @__PURE__ */ React.createElement("rect", { x: "3", y: "3", width: "7", height: "7", rx: "1" }), /* @__PURE__ */ React.createElement("rect", { x: "14", y: "3", width: "7", height: "7", rx: "1" }), /* @__PURE__ */ React.createElement("rect", { x: "3", y: "14", width: "7", height: "7", rx: "1" }), /* @__PURE__ */ React.createElement("rect", { x: "14", y: "14", width: "7", height: "7", rx: "1" }))), /* @__PURE__ */ React.createElement("strong", null, "Dal\u0161\xED tvary"))), shapeObj && shapeObj.description && /* @__PURE__ */ React.createElement("p", { className: "shape-description", role: "status" }, shapeObj.description), /* @__PURE__ */ React.createElement("button", { type: "button", className: "shape-view-toggle", onClick: () => setAngle(angle === "detail" ? "perspective" : "detail") }, angle === "detail" ? "Prohl\xE9dnout cel\xFD pomn\xEDk" : "P\u0159ibl\xED\u017Eit n\xE1pisovou desku")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "ed-sublabel" }, "Z \u010Deho se pomn\xEDk skl\xE1d\xE1"), /* @__PURE__ */ React.createElement("p", { className: "ed-q" }, "N\xE1pisov\xE1 deska stoj\xED na podlo\u017Ece, r\xE1my ohrani\u010Duj\xED hrob. Vyberte, zda m\xE1 b\xFDt m\xEDsto zakryt\xE9 a vyv\xFD\u0161en\xE9."), /* @__PURE__ */ React.createElement("div", { className: "con-grid" }, /* @__PURE__ */ React.createElement("button", { className: "check" + (cfg.hasCover ? " on" : ""), "aria-pressed": cfg.hasCover, onClick: () => set({ hasCover: !cfg.hasCover }) }, /* @__PURE__ */ React.createElement("span", { className: "box" }, Ico.check), /* @__PURE__ */ React.createElement("span", { className: "ci" }, /* @__PURE__ */ React.createElement("b", null, "Kryc\xED deska"), /* @__PURE__ */ React.createElement("small", null, "Bez n\xED z\u016Fstane mezi r\xE1my zahr\xE1dka."))), /* @__PURE__ */ React.createElement("div", { className: "check-group" + (cfg.hasSokl ? " on" : "") }, /* @__PURE__ */ React.createElement("button", { className: "check-head", "aria-pressed": cfg.hasSokl, onClick: () => set({ hasSokl: !cfg.hasSokl }) }, /* @__PURE__ */ React.createElement("span", { className: "box" }, Ico.check), /* @__PURE__ */ React.createElement("span", { className: "ci" }, /* @__PURE__ */ React.createElement("b", null, "Podstavec"), /* @__PURE__ */ React.createElement("small", null, "Spodn\xED vyv\xFD\u0161en\xE1 \u010D\xE1st pod deskami."))), cfg.hasSokl && /* @__PURE__ */ React.createElement("div", { className: "check-subwrap" }, /* @__PURE__ */ React.createElement("label", { className: "check-sub" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: cfg.hasWindow, onChange: () => set({ hasWindow: !cfg.hasWindow }) }), /* @__PURE__ */ React.createElement("span", null, "Ok\xFDnko v podstavci")), cfg.hasWindow && /* @__PURE__ */ React.createElement("div", { className: "frame-opts" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "frame-opt" + ((cfg.windowFrame || "nerez") === "nerez" ? " sel" : ""), onClick: () => set({ windowFrame: "nerez" }) }, /* @__PURE__ */ React.createElement("span", { className: "fo-sw fo-sw--silver" }), " St\u0159\xEDbrn\xE9"), /* @__PURE__ */ React.createElement("button", { type: "button", className: "frame-opt" + (cfg.windowFrame === "cerna" ? " sel" : ""), onClick: () => set({ windowFrame: "cerna" }) }, /* @__PURE__ */ React.createElement("span", { className: "fo-sw fo-sw--black" }), " \u010Cern\xE9")))))), cfg.hasCover && /* @__PURE__ */ React.createElement("details", { className: "config-details" }, /* @__PURE__ */ React.createElement("summary", null, "Detail okraje desky", /* @__PURE__ */ React.createElement("span", null, (cfg.edgeMode || "presah") === "presah" ? "p\u0159esah" : "zapu\u0161t\u011Bn\xED")), /* @__PURE__ */ React.createElement("div", { className: "config-details-body" }, /* @__PURE__ */ React.createElement("div", { className: "ed-sublabel" }, "Okraj kryc\xED desky ", /* @__PURE__ */ React.createElement(InfoDot, { hint: "Bu\u010F deska m\xEDrn\u011B p\u0159e\u010Dn\xEDv\xE1 p\u0159es r\xE1m, nebo je zasazen\xE1 kousek dovnit\u0159. Jde jen o vzhled okraje." })), /* @__PURE__ */ React.createElement("div", { className: "opt-row" }, /* @__PURE__ */ React.createElement("button", { className: "tile" + ((cfg.edgeMode || "presah") === "presah" ? " sel" : ""), onClick: () => set({ edgeMode: "presah" }) }, /* @__PURE__ */ React.createElement("strong", null, "Deska p\u0159esahuje"), /* @__PURE__ */ React.createElement("small", null, "P\u0159e\u010Dn\xEDv\xE1 2 cm p\u0159es r\xE1m")), /* @__PURE__ */ React.createElement("button", { className: "tile" + (cfg.edgeMode === "odskok" ? " sel" : ""), onClick: () => set({ edgeMode: "odskok" }) }, /* @__PURE__ */ React.createElement("strong", null, "Deska zapu\u0161t\u011Bn\xE1"), /* @__PURE__ */ React.createElement("small", null, "Zasazen\xE1 ", edgeInsetCm, " cm dovnit\u0159"))))));
      }
      if (cur.id === "material") {
        const activeGroup = activeMatGroupObj;
        const activeMatId = activeGroup.componentIds.map((id) => cfg.materials[id]).find(Boolean);
        const byGroup = window.MATERIALS.reduce((acc, m) => {
          (acc[m.group] = acc[m.group] || []).push(m);
          return acc;
        }, {});
        const gridSelId = matMode === "cely" ? matUniform ? allMatIds[0] : null : activeMatId;
        const recommendedMatId = recommendedMatFor(matMode, activeGroup.id);
        const pickMat = (mid) => matMode === "cely" ? setAllStoneMaterial(mid) : setMatGroup(activeGroup.componentIds, mid);
        return /* @__PURE__ */ React.createElement("div", { className: "ed-stack" }, /* @__PURE__ */ React.createElement("div", { className: "stone-combinations" }, /* @__PURE__ */ React.createElement("div", { className: "ed-sublabel" }, "Slad\u011Bn\xE9 kombinace pro za\u010D\xE1tek"), /* @__PURE__ */ React.createElement("div", { className: "combination-grid" }, window.STYLES.slice(0, 3).map((preset) => {
          const active = window.COMPONENTS.every((part) => cfg.materials[part.id] === preset.materials[part.id]);
          return /* @__PURE__ */ React.createElement(
            "button",
            {
              type: "button",
              key: preset.id,
              className: "combination-card" + (active ? " sel" : ""),
              "aria-pressed": active,
              title: preset.desc,
              onClick: () => {
                set({ style: "custom", materials: { ...preset.materials } });
                setMatModeState(null);
                trackEvent("material_combination_selected", { combination: preset.id });
              }
            },
            /* @__PURE__ */ React.createElement("span", { className: "combination-swatches" }, ["napisova_deska", "ram", "kryci_deska"].map((id) => /* @__PURE__ */ React.createElement("span", { key: id, style: materialStyle(window.MATERIALS.find((m) => m.id === preset.materials[id])) }))),
            /* @__PURE__ */ React.createElement("strong", null, { klasik: "Sv\u011Btl\xE1 a tmav\xE1", mono: "Jednotn\xE1 \u0161ed\xE1", kontrast: "\u010Cern\xE1 a sv\u011Btl\xE1" }[preset.id]),
            /* @__PURE__ */ React.createElement("small", null, active ? "Vybr\xE1no" : "Pou\u017E\xEDt kombinaci")
          );
        })), /* @__PURE__ */ React.createElement("p", { className: "ed-q" }, "Nebo n\xED\u017Ee vyberte vlastn\xED \u017Eulu. Barvu ka\u017Ed\xE9ho d\xEDlu m\u016F\u017Eete zm\u011Bnit zvl\xE1\u0161\u0165.")), /* @__PURE__ */ React.createElement("div", { className: "mat-parts-mobile" }, /* @__PURE__ */ React.createElement("div", { className: "ed-sublabel" }, "\u010C\xE1st pomn\xEDku"), /* @__PURE__ */ React.createElement("div", { className: "opt-row" }, /* @__PURE__ */ React.createElement("button", { className: "tile" + (matMode === "cely" ? " sel" : ""), onClick: () => setMatModeState("cely") }, /* @__PURE__ */ React.createElement("strong", { style: { fontSize: 13 } }, "Cel\xFD pomn\xEDk"), /* @__PURE__ */ React.createElement("small", null, "jedna \u017Eula")), matVisibleGroups.map((g) => {
          const m = window.MATERIALS.find((x) => x.id === cfg.materials[g.componentIds[0]]);
          const active = matMode === "parts" && g.id === activeGroup.id;
          return /* @__PURE__ */ React.createElement("button", { key: g.id, className: "tile" + (active ? " sel" : ""), onClick: () => {
            setMatModeState("parts");
            setActiveMatGroup(g.id);
          } }, /* @__PURE__ */ React.createElement("span", { className: "sw", style: materialStyle(m) }), /* @__PURE__ */ React.createElement("strong", { style: { fontSize: 13 } }, g.shortName));
        }))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "ed-sublabel" }, matMode === "cely" ? "\u017Dula pro cel\xFD pomn\xEDk" : "\u017Dula \u2014 " + activeGroup.shortName, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 600, textTransform: "none", letterSpacing: 0, color: "var(--muted)" } }, " \xB7 ", window.MATERIALS.length, " druh\u016F")), matMode === "parts" && /* @__PURE__ */ React.createElement("p", { className: "ed-q", style: { margin: "0 0 12px" } }, activeGroup.desc), /* @__PURE__ */ React.createElement("p", { className: "material-sample-note" }, "P\u0159\xEDrodn\xED kresba se u ka\u017Ed\xE9 desky li\u0161\xED. Konkr\xE9tn\xED k\xE1men si potvrd\xEDme p\u0159ed v\xFDrobou."), /* @__PURE__ */ React.createElement("div", { className: "mat-grid" }, Object.entries(byGroup).map(([label, mats]) => /* @__PURE__ */ React.createElement(React.Fragment, { key: label }, /* @__PURE__ */ React.createElement("div", { className: "mat-group" }, label), mats.map((m) => /* @__PURE__ */ React.createElement("button", { key: m.id, className: "mat-card" + (gridSelId === m.id ? " sel" : ""), title: `${m.name} \u2014 ${m.desc}`, "aria-pressed": gridSelId === m.id, onClick: () => pickMat(m.id) }, /* @__PURE__ */ React.createElement("span", { className: "sw", style: materialStyle(m) }), /* @__PURE__ */ React.createElement("span", { className: "ml" }, m.name, m.id === recommendedMatId && /* @__PURE__ */ React.createElement("span", { className: "tag" }, "Doporu\u010Deno")))))))));
      }
      if (cur.id === "text") {
        return /* @__PURE__ */ React.createElement("div", { className: "ed-stack" }, /* @__PURE__ */ React.createElement("div", { className: "reassurance" }, Ico.info, /* @__PURE__ */ React.createElement("span", null, sampleInscription ? "N\xE1hled obsahuje uk\xE1zkov\xE1 jm\xE9na. Nahra\u010Fte je vlastn\xEDmi, nebo n\xE1pis dopln\xEDme spole\u010Dn\u011B." : "Text m\u016F\u017Eete doplnit i pozd\u011Bji. P\u0159ed v\xFDrobou si n\xE1pis spole\u010Dn\u011B odsouhlas\xEDme.")), personRows.map((p, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "field", style: { gap: 8, padding: 12, border: "1.5px solid var(--line)", borderRadius: 13, background: "var(--surface)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, textTransform: "uppercase", letterSpacing: ".14em", color: "var(--muted)", fontWeight: 700 } }, p.reserved ? "Rezervovan\xE9 m\xEDsto" : "Jm\xE9no", " ", i + 1), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center" } }, !p.reserved && /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            className: "dock-btn",
            style: { padding: "4px 10px", fontSize: 12, display: "flex", alignItems: "center", gap: 5, ...p.photo ? { borderColor: "var(--accent, #d97757)", color: "var(--accent, #d97757)" } : {} },
            onClick: () => togglePersonPhoto(i),
            title: "Fotokeramika 7 \xD7 9 cm k tomuto jm\xE9nu"
          },
          /* @__PURE__ */ React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8" }, /* @__PURE__ */ React.createElement("rect", { x: "3", y: "5", width: "18", height: "14", rx: "2" }), /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "3.2" })),
          p.photo ? "Fotka" : "P\u0159idat fotku"
        ), personRows.length > 1 && /* @__PURE__ */ React.createElement("button", { type: "button", className: "dock-btn", style: { padding: "4px 10px", fontSize: 12 }, onClick: () => removeInscriptionPerson(i) }, "Odebrat"))), pairedInscription && /* @__PURE__ */ React.createElement("div", { className: "person-placement" }, /* @__PURE__ */ React.createElement("span", null, i % 2 === 0 ? "Vlevo" : "Vpravo", " \xB7 ", Math.floor(i / 2) + 1, ". \u0159ada"), /* @__PURE__ */ React.createElement("div", null, i > 0 && /* @__PURE__ */ React.createElement("button", { type: "button", "aria-label": `Posunout osobu ${i + 1} nahoru`, onClick: () => moveInscriptionPerson(i, -1) }, "\u2191"), i < personRows.length - 1 && /* @__PURE__ */ React.createElement("button", { type: "button", "aria-label": `Posunout osobu ${i + 1} dol\u016F`, onClick: () => moveInscriptionPerson(i, 1) }, "\u2193"))), p.reserved && editingPersonIndex !== i ? /* @__PURE__ */ React.createElement("div", { className: "inscription-reserve-note" }, /* @__PURE__ */ React.createElement("p", null, "Nech\xE1me prostor pro jm\xE9no a data. Zat\xEDm z\u016Fstane pr\xE1zdn\xFD."), /* @__PURE__ */ React.createElement("button", { type: "button", className: "dock-btn", onClick: () => selectInscriptionPerson(i) }, "Doplnit jm\xE9no")) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("input", { ref: (node) => {
          personInputRefs.current[i] = node;
          if (i === personRows.length - 1) nameInputRef.current = node;
        }, type: "text", "aria-label": `Jm\xE9no zesnul\xE9ho ${i + 1}`, maxLength: "80", value: p.name, placeholder: "Franti\u0161ek Nov\xE1k", onChange: (e) => setPersonLine(i, "name", e.target.value) }), /* @__PURE__ */ React.createElement("input", { type: "text", "aria-label": `Data narozen\xED a \xFAmrt\xED ${i + 1}`, maxLength: "100", value: p.dates, placeholder: "* 12. 3. 1948    \u2020 4. 9. 2024", onChange: (e) => setPersonLine(i, "dates", e.target.value) })))), /* @__PURE__ */ React.createElement("div", { className: "inscription-add-actions" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "dock-btn", onClick: () => addInscriptionPerson(false) }, "+ P\u0159idat dal\u0161\xED jm\xE9no"), sourceInscriptionDesign && personRows.length < 12 && /* @__PURE__ */ React.createElement("button", { type: "button", className: "dock-btn", onClick: () => addInscriptionPerson(true) }, "+ Rezervovat m\xEDsto")), inscriptionMissing && /* @__PURE__ */ React.createElement("div", { className: "advice warn", role: "status" }, Ico.warn, /* @__PURE__ */ React.createElement("span", null, "Zat\xEDm nem\xE1te vypln\u011Bn\xE9 ", /* @__PURE__ */ React.createElement("strong", null, "jm\xE9no"), ". M\u016F\u017Eete pokra\u010Dovat i bez n\u011Bj \u2014 text dopln\xEDme spole\u010Dn\u011B p\u0159i zam\u011B\u0159en\xED.")), sourceInscriptionDesign && /* @__PURE__ */ React.createElement("div", { className: "inscription-motif-choice" }, /* @__PURE__ */ React.createElement("div", { className: "ed-sublabel" }, "Motiv na desce"), (shapeObj == null ? void 0 : shapeObj.ornamentAsset) ? /* @__PURE__ */ React.createElement("p", { className: "ed-q" }, "Motiv je sou\u010D\xE1st\xED zvolen\xE9ho tvaru.") : /* @__PURE__ */ React.createElement("div", { className: "opt-row" }, [["none", "Bez motivu"], ["rose", "R\u016F\u017Ee"], ["cross", "K\u0159\xED\u017E"], ["custom", "Vlastn\xED motiv"]].map(([id, label]) => /* @__PURE__ */ React.createElement("button", { type: "button", key: id, className: "tile" + (cfg.ornamentType === id ? " sel" : ""), "aria-pressed": cfg.ornamentType === id, onClick: () => set({ ornamentType: id }) }, label))), /* @__PURE__ */ React.createElement("p", { className: "ed-q" }, cfg.ornamentType === "custom" ? "Vlastn\xED motiv domluv\xEDme spole\u010Dn\u011B. V n\xE1hledu se zat\xEDm nezobrazuje." : "O velikost a um\xEDst\u011Bn\xED se postar\xE1me.")), sourceInscriptionDesign && /* @__PURE__ */ React.createElement(window.InscriptionProof, { cfg, onSelect: selectInscriptionPerson }), /* @__PURE__ */ React.createElement("details", { className: "inscription-options" }, /* @__PURE__ */ React.createElement("summary", null, "P\xEDsmo, v\u011Bnov\xE1n\xED a rozvr\u017Een\xED"), /* @__PURE__ */ React.createElement("div", { className: "ed-stack" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "ed-sublabel" }, "P\xEDsmo"), /* @__PURE__ */ React.createElement("div", { className: "opt-row opt-row--fonts" }, window.FONTS.map((f) => /* @__PURE__ */ React.createElement("button", { key: f.id, className: "tile" + (cfg.font === f.id ? " sel" : ""), onClick: () => set({ font: f.id }) }, f.id === "byron-rr" && /* @__PURE__ */ React.createElement("span", { className: "rec-badge" }, "pietn\xED"), /* @__PURE__ */ React.createElement("span", { className: "font-sample", style: { fontFamily: f.family, fontSize: Math.round(24 * (f.previewScale || 1)), fontWeight: f.previewWeight || 400, lineHeight: 1, color: "var(--dark)" } }, f.sample), /* @__PURE__ */ React.createElement("small", null, f.name))))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "ed-sublabel" }, "Barva p\xEDsma"), /* @__PURE__ */ React.createElement("div", { className: "opt-row" }, window.TEXT_COLORS.map((c) => /* @__PURE__ */ React.createElement("button", { key: c.id, className: "tile" + (cfg.textColor === c.id ? " sel" : ""), style: { minWidth: 0 }, onClick: () => set({ textColor: c.id }) }, /* @__PURE__ */ React.createElement("span", { className: "dot", style: { background: c.hex, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.12)" } }), /* @__PURE__ */ React.createElement("strong", null, c.name))))), cfg.type === "dvojhrob" && ((_a2 = window.getHeadstoneDesign) == null ? void 0 : _a2.call(window, cfg.shape, cfg.type)) && /* @__PURE__ */ React.createElement("div", { className: "inscription-layout-controls" }, /* @__PURE__ */ React.createElement("div", { className: "ed-sublabel" }, "Rozvr\u017Een\xED n\xE1pisu"), window.getHeadstoneDesign(cfg.shape, cfg.type).parts.filter((p) => p.role === "plate").length > 1 ? /* @__PURE__ */ React.createElement("p", { className: "ed-q" }, "Jm\xE9na st\u0159\xEDd\xE1me na levou a pravou desku. Rodinn\xFD nadpis a v\u011Bnov\xE1n\xED jsou na ka\u017Ed\xE9 desce cel\xE9; motiv pat\u0159\xED na st\u0159edov\xFD sloupek, pokud jej sestava m\xE1.") : /* @__PURE__ */ React.createElement("div", { className: "opt-row" }, [["paired", "Vedle sebe"], ["stacked", "Pod sebou"]].map(([id, label]) => /* @__PURE__ */ React.createElement("button", { type: "button", className: "tile" + ((cfg.inscriptionLayout || "paired") === id ? " sel" : ""), "aria-pressed": (cfg.inscriptionLayout || "paired") === id, key: id, onClick: () => set({ inscriptionLayout: id }) }, label))), /* @__PURE__ */ React.createElement("p", { className: "ed-q" }, "Ka\u017Ed\xE9 jm\xE9no m\xE1 vlastn\xED data a fotografii. Nov\xE9 osoby p\u0159ib\xFDvaj\xED pod st\xE1vaj\xEDc\xEDmi.")), /* @__PURE__ */ React.createElement("label", { className: "field" }, /* @__PURE__ */ React.createElement("span", null, "Rodinn\xFD nadpis (nepovinn\xE9)"), /* @__PURE__ */ React.createElement("input", { type: "text", maxLength: "40", value: cfg.inscription.family || "", placeholder: "Rodina Nov\xE1kova", onChange: (e) => setInscr("family", e.target.value) })), /* @__PURE__ */ React.createElement("label", { className: "field" }, /* @__PURE__ */ React.createElement("span", null, "V\u011Bnov\xE1n\xED (nepovinn\xE9)"), /* @__PURE__ */ React.createElement("input", { type: "text", maxLength: "48", value: cfg.inscription.sub, placeholder: "S l\xE1skou vzpom\xEDn\xE1me", onChange: (e) => setInscr("sub", e.target.value) })))));
      }
      if (cur.id === "extras") {
        const deskaMat = window.MATERIALS.find((m) => m.id === cfg.materials.napisova_deska);
        const lockedOrnamentShape = window.SHAPES.find((s) => s.id === cfg.shape && s.ornamentAsset);
        const hasSet = !!(cfg.accessories.vase || cfg.accessories.lantern);
        const setStyle = cfg.vaseStyle || cfg.lanternStyle || "granit";
        const svc = cfg.services || {};
        const styleOpts = [
          { id: "granit", label: "\u017Dulov\xE1", desc: deskaMat ? `Stejn\xE1 \u017Eula jako deska (${deskaMat.name})` : "Stejn\xE1 \u017Eula jako deska" },
          { id: "plech-cerna", label: "Plechov\xE1 \u010Dern\xE1", desc: "Matn\xE1 \u010Dern\xE1 pro lampu i v\xE1zu." },
          { id: "plech-stribrna", label: "Plechov\xE1 st\u0159\xEDbrn\xE1", desc: "Leskl\xE9 chromov\xE9 proveden\xED." }
        ];
        const ornOpts = [
          {
            id: "none",
            label: "Bez grav\xEDrov\xE1n\xED",
            desc: "\u010Cist\xE1 n\xE1pisov\xE1 deska.",
            glyph: /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6" }, /* @__PURE__ */ React.createElement("rect", { x: "5", y: "3.5", width: "14", height: "17", rx: "1.5" }))
          },
          {
            id: "cross",
            label: "K\u0159\xED\u017E",
            desc: "Ve stejn\xE9 barv\u011B jako n\xE1pis.",
            glyph: /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", fill: "currentColor" }, /* @__PURE__ */ React.createElement("path", { d: "M10.6 2h2.8v6h5v2.8h-5V22h-2.8V10.8h-5V8h5z" }))
          },
          {
            id: "rose",
            label: "R\u016F\u017Ee",
            desc: "V\u017Edy b\xEDl\xE1 rytina.",
            glyph: /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "8", r: "4.2" }), /* @__PURE__ */ React.createElement("path", { d: "M13.7 7c-.5-.6-1.5-.7-2.2-.1-.7.6-.8 1.5-.2 2.2.5.5 1.1.6 1.7.3" }), /* @__PURE__ */ React.createElement("path", { d: "M12 12.2V21" }), /* @__PURE__ */ React.createElement("path", { d: "M12 17.2c-2.4 0-3.9-1.4-3.9-3.4" }), /* @__PURE__ */ React.createElement("path", { d: "M12 19c2 0 3.3-1.2 3.3-3" }))
          },
          {
            id: "custom",
            label: "Vlastn\xED motiv",
            desc: "Vlastn\xED motiv up\u0159esn\xEDme spole\u010Dn\u011B p\u0159i zam\u011B\u0159en\xED.",
            glyph: /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("path", { d: "M4 20l1.2-4.2L16 5l3 3L8.2 18.8z" }), /* @__PURE__ */ React.createElement("path", { d: "M14 7l3 3" }))
          }
        ];
        return /* @__PURE__ */ React.createElement("div", { className: "ed-stack" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "ed-sublabel" }, "Dopl\u0148ky"), /* @__PURE__ */ React.createElement("button", { className: "check" + (hasSet ? " on" : ""), "aria-pressed": hasSet, onClick: () => setAccessorySet(!hasSet) }, /* @__PURE__ */ React.createElement("span", { className: "box" }, Ico.check), /* @__PURE__ */ React.createElement("span", { className: "ci" }, /* @__PURE__ */ React.createElement("b", null, "Lampa + v\xE1za"), /* @__PURE__ */ React.createElement("small", null, "Voliteln\xFD komplet lampy a v\xE1zy")))), hasSet && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "ed-sublabel" }, "Proveden\xED kompletu"), /* @__PURE__ */ React.createElement("div", { className: "opt-row" }, styleOpts.map((o) => {
          const sw = o.id === "granit" ? materialStyle(deskaMat) : o.id === "plech-cerna" ? { background: "linear-gradient(135deg,#3c3c3e,#1b1b1d 60%,#0d0d0e)" } : { background: "linear-gradient(135deg,#eef1f4,#c4cad1 55%,#9aa2ab)" };
          return /* @__PURE__ */ React.createElement("button", { key: o.id, className: "tile" + ((setStyle || "granit") === o.id ? " sel" : ""), title: o.desc, onClick: () => setAccessorySetStyle(o.id) }, /* @__PURE__ */ React.createElement("span", { className: "sw", style: sw }), /* @__PURE__ */ React.createElement("strong", { style: { fontSize: 13 } }, o.label));
        }))), !sourceInscriptionDesign && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "ed-sublabel" }, "Grav\xEDrov\xE1n\xED ", /* @__PURE__ */ React.createElement(InfoDot, { hint: "Motiv vyryt\xFD do n\xE1pisov\xE9 desky \u2014 k\u0159\xED\u017E, r\u016F\u017Ee nebo v\xE1\u0161 vlastn\xED." })), lockedOrnamentShape ? (
          /* Tvar dle fotky má gravírování z předlohy — volba je zamčená. */
          /* @__PURE__ */ React.createElement("div", { className: "orn-locked" }, /* @__PURE__ */ React.createElement("span", { className: "orn-locked-thumb", style: { backgroundImage: `url("Tvary/thumbs/${lockedOrnamentShape.thumb || ""}")` } }), /* @__PURE__ */ React.createElement("span", { className: "orn-locked-txt" }, /* @__PURE__ */ React.createElement("b", null, "Grav\xEDrov\xE1n\xED dle p\u0159edlohy"), /* @__PURE__ */ React.createElement("small", null, "Tvar \u201E", lockedOrnamentShape.name, '" m\xE1 rytinu z fotky \u2014 je sou\u010D\xE1st\xED n\xE1vrhu a nelze ji zm\u011Bnit. Jin\xFD motiv? Zvolte jin\xFD tvar desky.')))
        ) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "opt-row orn-row" }, ornOpts.map((o) => /* @__PURE__ */ React.createElement("button", { key: o.id, className: "tile" + ((cfg.ornamentType || "none") === o.id ? " sel" : ""), title: o.desc, onClick: () => set({ ornamentType: o.id }) }, /* @__PURE__ */ React.createElement("span", { className: "orn-glyph" }, o.glyph), /* @__PURE__ */ React.createElement("strong", { style: { fontSize: 13 } }, o.label)))), cfg.ornamentType === "custom" && /* @__PURE__ */ React.createElement("p", { className: "ed-q", style: { margin: "10px 0 0" } }, "Vlastn\xED motiv (nap\u0159. konkr\xE9tn\xED symbol nebo obr\xE1zek) up\u0159esn\xEDme spole\u010Dn\u011B p\u0159i bezplatn\xE9m zam\u011B\u0159en\xED."))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "ed-sublabel" }, "Slu\u017Eby"), /* @__PURE__ */ React.createElement("p", { className: "ed-q", style: { margin: "0 0 8px" } }, "Dopravu a montáž upřesníme v nabídce podle místa a rozsahu zakázky."), /* @__PURE__ */ React.createElement("div", { className: "con-grid" }, /* @__PURE__ */ React.createElement("button", { className: "check" + (svc.demontaz ? " on" : ""), "aria-pressed": svc.demontaz, onClick: () => toggleService("demontaz") }, /* @__PURE__ */ React.createElement("span", { className: "box" }, Ico.check), /* @__PURE__ */ React.createElement("span", { className: "ci" }, /* @__PURE__ */ React.createElement("b", null, "Na m\xEDst\u011B je star\xFD pomn\xEDk"), /* @__PURE__ */ React.createElement("small", null, "Demont\xE1\u017E a odvoz zahrneme do nab\xEDdky."))))));
      }
      if (cur.id === "summary") {
        const compactRows = SUMMARY_ROWS.filter((row) => ["Tvar", "Materi\xE1l", "N\xE1pis"].includes(row.label) || row.k === "reservation");
        const recap = (rows) => /* @__PURE__ */ React.createElement("div", { className: "spec-list sum-recap-list" }, rows.map((row) => /* @__PURE__ */ React.createElement("button", { key: row.k || row.id, className: "srow", onClick: () => go(STEP_TO_INDEX(row.id)) }, /* @__PURE__ */ React.createElement("span", { className: "sk" }, row.label), /* @__PURE__ */ React.createElement("span", { className: "sv" }, row.swatch && /* @__PURE__ */ React.createElement("span", { className: "mini-sw", style: materialStyle(row.swatch) }), row.value), /* @__PURE__ */ React.createElement("span", { className: "edit" }, "Upravit"))));
        return /* @__PURE__ */ React.createElement("div", { className: "ed-stack sum-step" }, /* @__PURE__ */ React.createElement("div", { className: "proposal-head" }, /* @__PURE__ */ React.createElement("span", { className: "soft-label" }, "v\xE1\u0161 n\xE1vrh"), /* @__PURE__ */ React.createElement("h3", null, typeObj.name, " \xB7 ", cfg.dimW, " \xD7 ", cfg.dimD, " cm"), /* @__PURE__ */ React.createElement("p", null, "N\xE1vrh nemus\xED b\xFDt fin\xE1ln\xED. Detaily dolad\xEDme spole\u010Dn\u011B.")), recap(compactRows), (inscriptionMissing || sampleInscription) && /* @__PURE__ */ React.createElement("button", { type: "button", className: "summary-inscription-note", onClick: () => go(STEP_TO_INDEX("text")) }, Ico.info, /* @__PURE__ */ React.createElement("span", null, sampleInscription ? "Jm\xE9na v n\xE1hledu jsou uk\xE1zkov\xE1." : "N\xE1pis je\u0161t\u011B nen\xED vypln\u011Bn\xFD.", " Vlastn\xED text m\u016F\u017Eete doplnit i pozd\u011Bji.")), /* @__PURE__ */ React.createElement("div", { className: "summary-estimate" }, /* @__PURE__ */ React.createElement("strong", null, "Nab\xEDdka podle va\u0161eho n\xE1vrhu"), /* @__PURE__ */ React.createElement("p", null, "Rozsah výroby, dopravu a montáž upřesníme v individuální nabídce. Dostanete ji před objednáním.")), /* @__PURE__ */ React.createElement("p", { className: "summary-next" }, "Po odeslání s vámi projdeme návrh a domluvíme další postup. Poptávka je nezávazná."), /* @__PURE__ */ React.createElement("button", { type: "button", className: "summary-advice", onClick: () => openInquiry("advice") }, "Nejsem si jist\xFD, pot\u0159ebuji poradit \u2192"), /* @__PURE__ */ React.createElement("details", { className: "summary-full-details" }, /* @__PURE__ */ React.createElement("summary", null, "V\u0161echny detaily a ulo\u017Een\xED n\xE1vrhu"), recap(SUMMARY_ROWS), /* @__PURE__ */ React.createElement("div", { className: "proposal-actions" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: downloadProposalPdf }, Ico.download, /* @__PURE__ */ React.createElement("span", null, "Ulo\u017Eit PDF")), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: copyLink }, Ico.share, /* @__PURE__ */ React.createElement("span", null, copied ? "Zkop\xEDrov\xE1no" : "Sd\xEDlet odkaz")))));
      }
      return null;
    }
    const construction = [
      cfg.hasSokl ? "s podstavcem" : "bez podstavce",
      cfg.hasCover ? "s kryc\xED deskou" : "bez kryc\xED desky",
      cfg.hasSokl ? cfg.hasWindow ? "s ok\xFDnkem" : "bez ok\xFDnka" : null,
      cfg.hasCover ? edgeLabel : null
    ].filter(Boolean).join(" \xB7 ");
    const accSummary = (() => {
      const hasSet = !!(cfg.accessories.vase || cfg.accessories.lantern);
      const ornLocked = window.SHAPES.find((s) => s.id === cfg.shape && s.ornamentAsset);
      const orn = ornLocked ? "dle p\u0159edlohy tvaru" : cfg.ornamentType === "cross" ? "k\u0159\xED\u017E" : cfg.ornamentType === "rose" ? "r\u016F\u017Ee" : cfg.ornamentType === "custom" ? "vlastn\xED motiv" : null;
      const parts = [hasSet ? "lampa + v\xE1za" : null, orn ? "grav\xEDrov\xE1n\xED: " + orn : null].filter(Boolean);
      return parts.length ? parts.join(" \xB7 ") : "\u017E\xE1dn\xE9";
    })();
    const svcSummary = (() => {
      const s = cfg.services || {};
      const parts = ["doprava a mont\xE1\u017E", s.demontaz ? "demont\xE1\u017E star\xE9ho" : null].filter(Boolean);
      return parts.join(" \xB7 ");
    })();
    const faceMat = window.MATERIALS.find((m) => m.id === cfg.materials.napisova_deska);
    const SUMMARY_ROWS = [
      { id: "type", label: "Velikost", value: `${typeObj.name} \xB7 ${cfg.dimW} \xD7 ${cfg.dimD} cm` },
      { id: "style", label: "Tvar", value: (shapeObj == null ? void 0 : shapeObj.gallery) ? `${shapeObj.name} \u2014 atypick\xFD dle fotky` : `${(shapeObj == null ? void 0 : shapeObj.name) || cfg.shape}` },
      { id: "style", label: "Konstrukce", value: construction, k: "construction" },
      { id: "material", label: "Materi\xE1l", value: (faceMat == null ? void 0 : faceMat.name) || "\u2014", swatch: faceMat },
      { id: "text", label: "N\xE1pis", value: `${sampleInscription ? "Uk\xE1zkov\xFD text" : cfg.inscription.name ? cfg.inscription.name.split("\n")[0] : "Dopln\xEDme spole\u010Dn\u011B"} \xB7 ${fontObj.name}, ${tcObj.name}` },
      ...sourceInscriptionDesign && ((_b = cfg.reservedRows) == null ? void 0 : _b.some(Boolean)) ? [{ id: "text", k: "reservation", label: "Voln\xE1 m\xEDsta", value: `${cfg.reservedRows.filter(Boolean).length} pro budouc\xED n\xE1pis` }] : [],
      { id: "extras", label: "Dopl\u0148ky", value: accSummary },
      { id: "extras", label: "Slu\u017Eby", value: svcSummary, k: "services" }
    ];
    const STEP_TO_INDEX = (id) => STEPS.findIndex((s) => s.id === id);
    const resetAll = () => {
      setStep(0);
      setActiveMatGroup("face");
      setResetArmed(false);
      applyStyle(defaultStyle);
      set({ type: "urnovy", dimW: 90, dimD: 120, hasSokl: false, hasCover: true, hasWindow: true, windowFrame: "nerez", edgeMode: "presah", font: "byron-rr", textColor: "zlata", photoRows: [], reservedRows: [], inscriptionLayout: "paired", accessories: { vase: true, lantern: true }, vaseStyle: "granit", lanternStyle: "granit", ornamentType: "rose", services: { montaz: false, demontaz: false }, inscription: { ...INSCR_SINGLE } });
    };
    const handleResetClick = () => {
      if (resetArmed) {
        window.clearTimeout(resetTimerRef.current);
        resetAll();
        return;
      }
      setResetArmed(true);
      resetTimerRef.current = window.setTimeout(() => setResetArmed(false), 3500);
    };
    const topbar = /* @__PURE__ */ React.createElement("header", { className: "topbar" }, /* @__PURE__ */ React.createElement("a", { className: "brand", href: HOMEPAGE_URL, "aria-label": "Zpět na web Kamenictví Adámek" }, /* @__PURE__ */ React.createElement("img", { className: "brand-logo", src: "../img/adamek-logo-dark-crop.svg", alt: "Kamenictví Adámek" }), /* @__PURE__ */ React.createElement("span", { className: "brand-sep" }, "\xB7"), /* @__PURE__ */ React.createElement("span", { className: "brand-sub" }, "Ateliér pomníků")), /* @__PURE__ */ React.createElement("div", { className: "top-spacer" }), /* @__PURE__ */ React.createElement("div", { className: "top-help" }, "Porad\xEDme s v\xFDb\u011Brem \xB7 ", /* @__PURE__ */ React.createElement("a", { href: "tel:+420602277869" }, /* @__PURE__ */ React.createElement("b", null, "602 277 869"))), /* @__PURE__ */ React.createElement("a", { className: "top-link", href: HOMEPAGE_URL }, Ico.arrowL, " Zp\u011Bt na web"));
    const editorHead = /* @__PURE__ */ React.createElement("div", { className: "editor-head", ref: editorHeadRef }, /* @__PURE__ */ React.createElement("div", { className: "ed-toprow" }, /* @__PURE__ */ React.createElement("span", { className: "rail-kicker" }, "Va\u0161e konfigurace"), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "editor-reset" + (resetArmed ? " armed" : ""),
        onClick: handleResetClick,
        "aria-label": resetArmed ? "Potvrdit a za\u010D\xEDt znovu" : "Za\u010D\xEDt znovu"
      },
      resetArmed ? "Opravdu za\u010D\xEDt znovu?" : "\u21BB Za\u010D\xEDt znovu"
    )), /* @__PURE__ */ React.createElement("div", { className: "ed-stepline" }, /* @__PURE__ */ React.createElement("span", { className: "ed-num" }, String(step + 1).padStart(2, "0")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "ed-title" }, cur.short), /* @__PURE__ */ React.createElement("div", { className: "ed-count" }, "Krok ", step + 1, " z ", total))), /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "rail-track",
        role: "progressbar",
        "aria-label": "Postup konfigurace",
        "aria-valuemin": 1,
        "aria-valuemax": total,
        "aria-valuenow": step + 1,
        "aria-valuetext": "Krok " + (step + 1) + " z " + total + " \u2014 " + cur.short
      },
      /* @__PURE__ */ React.createElement("div", { className: "rail-fill", style: { width: (step + 1) / total * 100 + "%" } })
    ), /* @__PURE__ */ React.createElement("div", { className: "stepper" }, STEPS.map((s, i) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: s.id,
        className: "stepper-item" + (i === step ? " active" : "") + (i < step ? " done" : ""),
        title: i + 1 + ". " + s.short,
        "aria-label": i + 1 + ". " + s.short,
        "aria-current": i === step ? "step" : void 0,
        onClick: () => go(i)
      },
      /* @__PURE__ */ React.createElement(StepIcon, { id: s.id }),
      /* @__PURE__ */ React.createElement("span", { className: "stepper-label" }, s.short)
    ))));
    const navFoot = /* @__PURE__ */ React.createElement("div", { className: "editor-foot" }, /* @__PURE__ */ React.createElement("p", { className: "foot-note" }, "Cenovou nab\xEDdku p\u0159iprav\xEDme podle va\u0161eho n\xE1vrhu."), /* @__PURE__ */ React.createElement("div", { className: "foot-nav" }, /* @__PURE__ */ React.createElement("button", { className: "dock-btn", onClick: () => go(step - 1), style: { visibility: step === 0 ? "hidden" : "visible" } }, "\u2190 Zp\u011Bt"), /* @__PURE__ */ React.createElement("button", { className: "dock-btn primary", onClick: next }, isLast ? "Chci p\u0159esnou cenovou nab\xEDdku" : "Pokra\u010Dovat \u2192")));
    const stage = /* @__PURE__ */ React.createElement("main", { className: "stage" + (expanded ? " stage--expanded" : "") + (cur.id === "text" ? " stage--inscription" : "") + (isLast ? " stage--summary" : "") }, /* @__PURE__ */ React.createElement("div", { className: "scene" }), /* @__PURE__ */ React.createElement("div", { className: "stage-3d" }, /* @__PURE__ */ React.createElement(window.StonePreview, { cfg, angle, sceneMode, exploded, selectedPart, onPick: handlePick, hoverHint })), /* @__PURE__ */ React.createElement("div", { className: "watermark", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("img", { src: "../img/adamek-logo-dark-crop.svg", alt: "" })), !isHeroEmbed && /* @__PURE__ */ React.createElement("div", { className: "stage-caption" }, /* @__PURE__ */ React.createElement("span", null, "V\xE1\u0161 n\xE1vrh ve 3D"), /* @__PURE__ */ React.createElement("strong", null, typeObj.name), /* @__PURE__ */ React.createElement("small", null, cfg.dimW, " \xD7 ", cfg.dimD, " cm \xB7 ", (shapeObj == null ? void 0 : shapeObj.name) || "Vlastn\xED tvar")), /* @__PURE__ */ React.createElement("div", { className: "stage-top" }, /* @__PURE__ */ React.createElement("span", { className: "glass" }, Ico.rotate, " Ta\u017Een\xEDm oto\u010D\xEDte \xB7 kliknut\xEDm vyberete d\xEDl")), /* @__PURE__ */ React.createElement("button", { className: "glass btn model-expand" + (expanded ? " copied" : ""), title: expanded ? "Zmen\u0161it n\xE1hled" : "Zv\u011Bt\u0161it n\xE1hled", "aria-label": expanded ? "Zmen\u0161it n\xE1hled" : "Zv\u011Bt\u0161it n\xE1hled", "aria-pressed": expanded, onClick: () => setExpanded((v) => !v) }, expanded ? Ico.arrowL : Ico.fullscreen, /* @__PURE__ */ React.createElement("span", null, expanded ? "Zav\u0159\xEDt" : "Zv\u011Bt\u0161it")), /* @__PURE__ */ React.createElement("div", { className: "model-share-wrap" }, shareOpen && /* @__PURE__ */ React.createElement("div", { className: "share-menu", role: "menu" }, /* @__PURE__ */ React.createElement("button", { type: "button", role: "menuitem", onClick: () => {
      copyLink();
      setShareOpen(false);
    } }, Ico.share, /* @__PURE__ */ React.createElement("span", null, "Kop\xEDrovat odkaz")), /* @__PURE__ */ React.createElement("button", { type: "button", role: "menuitem", onClick: () => {
      shareWhatsApp();
      setShareOpen(false);
    } }, /* @__PURE__ */ React.createElement("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5 13.6c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1a13 13 0 0 1-5.9-5.2c-.6-1-.9-2-.9-2.6 0-.6.3-1.2.7-1.5.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.6c-.2.2-.3.4-.1.7.5.9 1.9 2.4 3.4 3 .3.1.5.1.7-.1l.7-.8c.2-.3.4-.2.7-.1l1.9.9c.3.2.5.3.6.4 0 .1 0 .5-.2 1z" })), /* @__PURE__ */ React.createElement("span", null, "Poslat p\u0159es WhatsApp"))), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "glass btn model-share",
        "aria-haspopup": "menu",
        "aria-expanded": shareOpen,
        onClick: () => setShareOpen((v) => !v)
      },
      Ico.share,
      /* @__PURE__ */ React.createElement("span", null, "Sd\xEDlet n\xE1vrh")
    )), !isHeroEmbed && /* @__PURE__ */ React.createElement("div", { className: "scene-choice", role: "group", "aria-label": "Prost\u0159ed\xED n\xE1hledu" }, /* @__PURE__ */ React.createElement("button", { type: "button", "aria-pressed": sceneMode === "studio", onClick: () => setSceneMode("studio") }, "Studio"), /* @__PURE__ */ React.createElement("button", { type: "button", "aria-pressed": sceneMode === "cemetery", onClick: () => setSceneMode("cemetery") }, "Na h\u0159bitov\u011B"), /* @__PURE__ */ React.createElement("span", null, "Ilustra\u010Dn\xED okol\xED")), /* @__PURE__ */ React.createElement("div", { className: "angles" }, ANGLES.map(([id, label]) => /* @__PURE__ */ React.createElement("button", { key: id, className: "angle" + (angle === id ? " active" : ""), "aria-pressed": angle === id, style: { width: "auto", padding: "0 14px", fontSize: 13, fontWeight: 600, color: angle === id ? "var(--accent)" : "var(--text)" }, onClick: () => setAngle(id) }, label))));
    const modalJsx = modal && /* @__PURE__ */ React.createElement("div", { className: "modal-backdrop", onClick: (e) => {
      if (e.target.classList.contains("modal-backdrop")) closeInquiry();
    } }, /* @__PURE__ */ React.createElement("div", { className: "modal", style: { position: "relative" }, role: "dialog", "aria-modal": "true", "aria-labelledby": "inquiry-modal-title" }, /* @__PURE__ */ React.createElement("button", { className: "modal-close", onClick: closeInquiry, "aria-label": "Zav\u0159\xEDt formul\xE1\u0159" }, "Zav\u0159\xEDt"), /* @__PURE__ */ React.createElement(InquiryFormModal, { cfg, typeObj, styleObj, onCancel: closeInquiry, initialPhoto: earlyPhoto, intent: inquiryIntent })));
    const shapeGalleryJsx = shapeGallery && /* @__PURE__ */ React.createElement("div", { className: "modal-backdrop", onClick: (e) => {
      if (e.target.classList.contains("modal-backdrop")) setShapeGallery(false);
    } }, /* @__PURE__ */ React.createElement("div", { className: "modal modal--gallery", role: "dialog", "aria-modal": "true", "aria-label": "Atypick\xE9 pomn\xEDky" }, /* @__PURE__ */ React.createElement("button", { className: "modal-close", onClick: () => setShapeGallery(false), "aria-label": "Zav\u0159\xEDt okno" }, "Zav\u0159\xEDt"), /* @__PURE__ */ React.createElement("div", { className: "gallery-head" }, /* @__PURE__ */ React.createElement("h3", null, "Tvary s osobitým charakterem"), /* @__PURE__ */ React.createElement("p", null, "Vyberte tvar podle fotky \u2014 n\xE1pisov\xE1 deska se p\u0159izp\u016Fsob\xED ve 3D n\xE1hledu. Detaily proveden\xED up\u0159esn\xEDme p\u0159i zam\u011B\u0159en\xED.")), /* @__PURE__ */ React.createElement("div", { className: "gallery-grid" }, window.SHAPES.filter((s) => s.gallery && !(cfg.type === "dvojhrob" && s.noDvojhrob)).map((s) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: s.id,
        type: "button",
        className: "gallery-item" + (cfg.shape === s.id ? " sel" : ""),
        onClick: () => {
          trackEvent("gallery_shape_selected", { shape: s.id });
          set({ shape: s.id, style: "custom" });
          setAngle("perspective");
          setShapeGallery(false);
        }
      },
      /* @__PURE__ */ React.createElement("img", { src: "Tvary/thumbs/" + s.thumb, loading: "lazy", alt: s.name })
    )))));
    if (isHeroEmbed) {
      return /* @__PURE__ */ React.createElement("div", { className: "app app--hero-embed" }, stage);
    }
    const studioTopbar = /* @__PURE__ */ React.createElement("header", { className: "topbar topbar--studio" }, /* @__PURE__ */ React.createElement("a", { className: "brand", href: HOMEPAGE_URL, "aria-label": "Zpět na web Kamenictví Adámek" }, /* @__PURE__ */ React.createElement("img", { className: "brand-logo", src: "../img/adamek-logo-dark-crop.svg", alt: "Kamenictví Adámek" }), /* @__PURE__ */ React.createElement("span", { className: "brand-sep" }, "\xB7"), /* @__PURE__ */ React.createElement("span", { className: "brand-sub" }, "Ateliér pomníků")), /* @__PURE__ */ React.createElement("div", { className: "top-spacer" }), /* @__PURE__ */ React.createElement("a", { className: "top-phone", href: "tel:+420602277869", "aria-label": "Zavolat 602 277 869" }, Ico.phone, /* @__PURE__ */ React.createElement("b", null, "602 277 869")), /* @__PURE__ */ React.createElement("span", { className: "top-assurance" }, "S vaším návrhem pomůžeme osobně"), !isLast && /* @__PURE__ */ React.createElement("button", { type: "button", className: "top-cta", onClick: () => openInquiry() }, "Probrat návrh ", Ico.arrow));
    const leftRail = /* @__PURE__ */ React.createElement("nav", { className: "leftrail", "aria-label": "Kroky konfigurace" }, /* @__PURE__ */ React.createElement("span", { className: "leftrail-kicker" }, "V\xE1\u0161 n\xE1vrh"), /* @__PURE__ */ React.createElement("div", { className: "leftrail-steps" }, STEPS.map((s, i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: s.id }, /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "railstep" + (i === step ? " active" : "") + (i < step ? " done" : ""),
        "aria-current": i === step ? "step" : void 0,
        title: i + 1 + ". " + s.short,
        "aria-label": "Krok " + (i + 1) + ": " + s.short,
        onClick: () => go(i)
      },
      /* @__PURE__ */ React.createElement("span", { className: "railstep-number", "aria-hidden": "true" }, String(i + 1).padStart(2, "0")),
      /* @__PURE__ */ React.createElement("span", { className: "railstep-label" }, s.short),
      i < step && /* @__PURE__ */ React.createElement("span", { className: "railstep-check" }, Ico.check)
    ), s.id === "material" && i === step && /* @__PURE__ */ React.createElement("div", { className: "rail-sub", "aria-label": "\u010C\xE1st pomn\xEDku pro v\xFDb\u011Br \u017Euly" }, /* @__PURE__ */ React.createElement("button", { className: "rail-subitem" + (matMode === "cely" ? " sel" : ""), onClick: () => setMatModeState("cely") }, /* @__PURE__ */ React.createElement("span", { className: "sw", style: materialStyle(celySwatchMat) }), /* @__PURE__ */ React.createElement("span", { className: "rs-label" }, "Cel\xFD pomn\xEDk")), matVisibleGroups.map((g) => {
      const m = window.MATERIALS.find((x) => x.id === cfg.materials[g.componentIds[0]]);
      const active = matMode === "parts" && g.id === activeMatGroupObj.id;
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: g.id,
          className: "rail-subitem" + (active ? " sel" : ""),
          onClick: () => {
            setMatModeState("parts");
            setActiveMatGroup(g.id);
          }
        },
        /* @__PURE__ */ React.createElement("span", { className: "sw", style: materialStyle(m) }),
        /* @__PURE__ */ React.createElement("span", { className: "rs-label" }, g.shortName)
      );
    }))))));
    const studioPanel = /* @__PURE__ */ React.createElement("aside", { className: "studio-panel" }, /* @__PURE__ */ React.createElement("div", { className: "stage-mobilebar" }, /* @__PURE__ */ React.createElement("span", { className: "smb-tip" }, Ico.rotate, " Ta\u017Een\xEDm ot\xE1\u010D\xEDte \xB7 \u0165uknut\xEDm vyberete d\xEDl")), /* @__PURE__ */ React.createElement("div", { className: "sp-head", ref: editorHeadRef }, /* @__PURE__ */ React.createElement("div", { className: "ed-stepline" }, /* @__PURE__ */ React.createElement("span", { className: "ed-num" }, String(step + 1).padStart(2, "0")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "ed-count" }, "Krok ", step + 1, " z ", total, " \xB7 ", cur.short), /* @__PURE__ */ React.createElement("h1", { className: "ed-title" }, cur.title))), /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "rail-track",
        role: "progressbar",
        "aria-label": "Postup konfigurace",
        "aria-valuemin": 1,
        "aria-valuemax": total,
        "aria-valuenow": step + 1,
        "aria-valuetext": "Krok " + (step + 1) + " z " + total + " \u2014 " + cur.short
      },
      /* @__PURE__ */ React.createElement("div", { className: "rail-fill", style: { width: (step + 1) / total * 100 + "%" } })
    )), /* @__PURE__ */ React.createElement("div", { className: "sp-body", ref: editorBodyRef }, renderControls(), cur.id === "type" && /* @__PURE__ */ React.createElement("button", { type: "button", className: "mobile-reset", onClick: handleResetClick }, Ico.rotate, resetArmed ? "Potvrdit nov\xFD n\xE1vrh" : "Za\u010D\xEDt nov\xFD n\xE1vrh"), !isLast && /* @__PURE__ */ React.createElement("div", { className: "helpbar" }, /* @__PURE__ */ React.createElement("span", { className: "helpbar-ic", "aria-hidden": "true" }, Ico.phone), /* @__PURE__ */ React.createElement("span", { className: "helpbar-txt" }, /* @__PURE__ */ React.createElement("b", null, "Nemus\xEDte m\xEDt v\u0161e rozhodnut\xE9."), /* @__PURE__ */ React.createElement("small", null, "Zavolejte ", /* @__PURE__ */ React.createElement("a", { href: "tel:+420602277869" }, "602 277 869"), " \u2014 nebo n\xE1m po\u0161lete n\xE1vrh tak, jak je.")), /* @__PURE__ */ React.createElement("button", { type: "button", className: "helpbar-btn", onClick: () => {
      trackEvent("inquiry_from_helpbar", { step: cur.id });
      openInquiry("advice");
    } }, "Poradit s n\xE1vrhem \u2192"))), /* @__PURE__ */ React.createElement("div", { className: "sp-foot" + (isLast ? " sp-foot--summary" : "") + (editingMobileInput ? " sp-foot--editing" : "") }, !isLast && /* @__PURE__ */ React.createElement("div", { className: "sp-foot-meta" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "sp-reset" + (resetArmed ? " armed" : ""),
        onClick: handleResetClick,
        "aria-label": resetArmed ? "Potvrdit a za\u010D\xEDt znovu" : "Za\u010D\xEDt znovu"
      },
      Ico.rotate,
      /* @__PURE__ */ React.createElement("span", null, resetArmed ? "Opravdu za\u010D\xEDt znovu?" : "Za\u010D\xEDt znovu")
    )), /* @__PURE__ */ React.createElement("p", { className: "price-scope" }, isLast ? "V\xE1\u0161 n\xE1vrh p\u0159ilo\u017E\xEDme automaticky. Odesl\xE1n\xEDm nic neobjedn\xE1v\xE1te." : "P\u0159esnou cenu za v\xE1\u0161 v\xFDb\u011Br z\xEDsk\xE1te v nab\xEDdce."), /* @__PURE__ */ React.createElement("button", { type: "button", className: "mobile-preview-link", onClick: () => setExpanded(true) }, Ico.fullscreen, " Prohl\xE9dnout n\xE1vrh"), /* @__PURE__ */ React.createElement("div", { className: "sp-foot-nav" }, /* @__PURE__ */ React.createElement("button", { className: "dock-btn", onClick: () => go(step - 1), style: { display: step === 0 ? "none" : void 0 } }, "\u2190 Zp\u011Bt"), /* @__PURE__ */ React.createElement("button", { className: "dock-btn primary", onClick: next }, isLast ? "Chci p\u0159esnou cenovou nab\xEDdku" : `Další krok: ${STEPS[step + 1].short} →`))));
    if (!isSplit) {
      return /* @__PURE__ */ React.createElement("div", { className: "app app--studio" }, studioTopbar, leftRail, stage, studioPanel, toast && /* @__PURE__ */ React.createElement("div", { className: "toast", role: "status" }, Ico.check, /* @__PURE__ */ React.createElement("span", null, toast)), modalJsx, shapeGalleryJsx);
    }
    return /* @__PURE__ */ React.createElement("div", { className: "app app--split" }, topbar, /* @__PURE__ */ React.createElement("aside", { className: "editor editor--split" }, /* @__PURE__ */ React.createElement("div", { className: "stage-mobilebar" }, /* @__PURE__ */ React.createElement("span", { className: "smb-tip" }, Ico.rotate, " Ta\u017Een\xEDm ot\xE1\u010D\xEDte \xB7 \u0165uknut\xEDm vyberete d\xEDl")), editorHead, /* @__PURE__ */ React.createElement("div", { className: "editor-body", ref: editorBodyRef }, /* @__PURE__ */ React.createElement("div", { className: "ed-q" }, cur.title), renderControls()), navFoot), stage, toast && /* @__PURE__ */ React.createElement("div", { className: "toast", role: "status" }, Ico.check, /* @__PURE__ */ React.createElement("span", null, toast)), modalJsx, shapeGalleryJsx);
  }
  try {
    ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));
  } catch (err) {
    console.error(err);
    const root = document.getElementById("root");
    if (root) {
      root.innerHTML = '<div style="padding:24px;font-family:Inter,Arial,sans-serif;color:#7a2415">Konfigur\xE1tor narazil na chybu p\u0159i vykreslen\xED. Zkuste str\xE1nku obnovit.</div>';
    }
  }
})();
