"use strict";
(function() {
  const { useEffect, useRef, useCallback, useState } = React;
  const ASSET_VERSION = window.ADAMEK_ASSET_VERSION || window.ADAMEK_CACHE_BUST || String(Date.now());
  const texCache = {};
  const randomizedTexCache = {};
  const proceduralTexCache = {};
  const imageAssetCache = {};
  function makeTexturePlaceholder() {
    const cv = document.createElement("canvas");
    cv.width = 1;
    cv.height = 1;
    const ctx = cv.getContext("2d");
    ctx.fillStyle = "#d8d1c7";
    ctx.fillRect(0, 0, 1, 1);
    return cv;
  }
  function versionedAsset(path) {
    return path + (path.includes("?") ? "&" : "?") + "v=" + ASSET_VERSION;
  }
  function loadImageAsset(path) {
    const src = versionedAsset(path);
    if (imageAssetCache[src]) return imageAssetCache[src];
    const img = new Image();
    const entry = { image: img, loaded: false, failed: false };
    img.onload = () => {
      entry.loaded = true;
      window.dispatchEvent(new CustomEvent("adamek:ornament-asset-ready", { detail: { src } }));
    };
    img.onerror = () => {
      entry.failed = true;
      window.dispatchEvent(new CustomEvent("adamek:ornament-asset-ready", { detail: { src, failed: true } }));
    };
    img.src = src;
    imageAssetCache[src] = entry;
    return entry;
  }
  function loadTexture(path) {
    const src = versionedAsset(path);
    if (texCache[src]) return texCache[src];
    const configure = (tex2) => {
      tex2.wrapS = tex2.wrapT = THREE.RepeatWrapping;
      tex2.encoding = THREE.sRGBEncoding;
      tex2.minFilter = THREE.LinearMipmapLinearFilter;
      tex2.magFilter = THREE.LinearFilter;
      tex2.generateMipmaps = true;
      tex2.anisotropy = 8;
      tex2.needsUpdate = true;
    };
    const tex = new THREE.TextureLoader().load(src, (loaded) => {
      tex.userData.loaded = true;
      configure(tex);
      window.dispatchEvent(new CustomEvent("adamek:stone-texture-ready", { detail: { src } }));
    });
    tex.userData = { src, loaded: false };
    texCache[src] = tex;
    return tex;
  }
  function hashSeed(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function seededRandom(seed) {
    let state = seed >>> 0;
    return function() {
      state = Math.imul(1664525, state) + 1013904223;
      return (state >>> 0) / 4294967296;
    };
  }
  function drawRotatedTile(ctx, image, x, y, size, rand) {
    const rotation = Math.floor(rand() * 4);
    const flipX = rand() > 0.5 ? -1 : 1;
    const flipY = rand() > 0.72 ? -1 : 1;
    const sourceSize = Math.min(image.naturalWidth || image.width, image.naturalHeight || image.height);
    const jitter = Math.max(0, sourceSize * 0.08);
    const sx = Math.max(0, Math.min(sourceSize * 0.16, rand() * jitter));
    const sy = Math.max(0, Math.min(sourceSize * 0.16, rand() * jitter));
    const sw = Math.max(1, sourceSize - sx * 2);
    const sh = Math.max(1, sourceSize - sy * 2);
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate(rotation * Math.PI / 2);
    ctx.scale(flipX, flipY);
    ctx.drawImage(image, sx, sy, sw, sh, -size / 2, -size / 2, size, size);
    ctx.restore();
  }
  function makeRandomizedStoneTexture(baseTexture, seedText) {
    const image = baseTexture.image;
    if (!image || !(image.width || image.naturalWidth)) return null;
    const canvasSize = 2048;
    const tileSize = 512;
    const cv = document.createElement("canvas");
    cv.width = canvasSize;
    cv.height = canvasSize;
    const ctx = cv.getContext("2d");
    const rand = seededRandom(hashSeed(seedText));
    for (let y = 0; y < canvasSize; y += tileSize) {
      for (let x = 0; x < canvasSize; x += tileSize) {
        drawRotatedTile(ctx, image, x, y, tileSize, rand);
      }
    }
    ctx.globalAlpha = 0.08;
    ctx.drawImage(cv, -tileSize / 2, 0, canvasSize, canvasSize);
    ctx.drawImage(cv, tileSize / 2, 0, canvasSize, canvasSize);
    ctx.drawImage(cv, 0, -tileSize / 2, canvasSize, canvasSize);
    ctx.drawImage(cv, 0, tileSize / 2, canvasSize, canvasSize);
    ctx.globalAlpha = 1;
    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.encoding = THREE.sRGBEncoding;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
    return tex;
  }
  function isNeroAssoluto(matObj) {
    return !!matObj && (matObj.id === "aurora" || /nero\s+assoluto/i.test(matObj.name || ""));
  }
  function makeNeroAssolutoTexture() {
    const key = "nero-assoluto-procedural-v2";
    if (proceduralTexCache[key]) return proceduralTexCache[key];
    const canvasSize = 2048;
    const cv = document.createElement("canvas");
    cv.width = canvasSize;
    cv.height = canvasSize;
    const ctx = cv.getContext("2d");
    const rand = seededRandom(hashSeed(key));
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    const image = ctx.getImageData(0, 0, canvasSize, canvasSize);
    const data = image.data;
    for (let i = 0; i < data.length; i += 4) {
      const shade = 4 + Math.floor(rand() * 8);
      data[i] = shade;
      data[i + 1] = shade;
      data[i + 2] = shade;
      data[i + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
    for (let i = 0; i < 115; i += 1) {
      const x = rand() * canvasSize;
      const y = rand() * canvasSize;
      const radius = rand() < 0.88 ? 0.45 + rand() * 0.9 : 1.2 + rand() * 1.5;
      const alpha = rand() < 0.82 ? 0.22 + rand() * 0.28 : 0.52 + rand() * 0.28;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius * 3.2);
      grad.addColorStop(0, `rgba(245,248,246,${alpha})`);
      grad.addColorStop(0.28, `rgba(210,218,214,${alpha * 0.36})`);
      grad.addColorStop(1, "rgba(210,218,214,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius * 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.encoding = THREE.sRGBEncoding;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
    proceduralTexCache[key] = tex;
    return tex;
  }
  function loadMaterialTexture(matObj) {
    if (!matObj || !matObj.texture) return null;
    if (isNeroAssoluto(matObj)) return makeNeroAssolutoTexture();
    const shouldRandomize = false;
    if (!shouldRandomize) return loadTexture(matObj.texture);
    const src = versionedAsset(matObj.texture);
    const key = src + "::random-rot90";
    if (randomizedTexCache[key]) return randomizedTexCache[key];
    const base = loadTexture(matObj.texture);
    const holder = base;
    holder.wrapS = holder.wrapT = THREE.RepeatWrapping;
    randomizedTexCache[key] = holder;
    const applyRandomized = () => {
      const randomized = makeRandomizedStoneTexture(base, matObj.id + ":" + matObj.texture);
      if (!randomized) return;
      holder.image = randomized.image;
      holder.wrapS = holder.wrapT = THREE.RepeatWrapping;
      holder.encoding = THREE.sRGBEncoding;
      holder.minFilter = THREE.LinearMipmapLinearFilter;
      holder.magFilter = THREE.LinearFilter;
      holder.generateMipmaps = true;
      holder.anisotropy = 8;
      holder.needsUpdate = true;
    };
    const scheduleRandomize = (fn) => window.requestIdleCallback ? window.requestIdleCallback(fn, { timeout: 400 }) : window.setTimeout(fn, 0);
    if (base.image && (base.image.width || base.image.naturalWidth)) {
      scheduleRandomize(applyRandomized);
    } else if (base.image && base.image.addEventListener) {
      base.image.addEventListener("load", () => scheduleRandomize(applyRandomized), { once: true });
    } else {
      const onReady = (ev) => {
        if (!ev.detail || ev.detail.src !== src) return;
        window.removeEventListener("adamek:stone-texture-ready", onReady);
        scheduleRandomize(applyRandomized);
      };
      window.addEventListener("adamek:stone-texture-ready", onReady);
    }
    return holder;
  }
  function makeStoneMaterial(matObj) {
    const tex = matObj.texture ? loadMaterialTexture(matObj) : null;
    const nero = isNeroAssoluto(matObj);
    const rosso = matObj.id === "rosso-africa";
    if (tex) {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 1);
      tex.anisotropy = 8;
      if (tex.image && (tex.image.width || tex.image.naturalWidth)) tex.needsUpdate = true;
    }
    const material = new THREE.MeshPhysicalMaterial({
      map: tex,
      bumpMap: null,
      bumpScale: 0,
      color: rosso && tex ? 14927031 : matObj.id === "labrador" && tex ? 15658734 : nero ? 16777215 : tex ? 16777215 : new THREE.Color(matObj.c2 || "#888"),
      roughness: rosso ? 0.3 : nero ? 0.16 : 0.22,
      metalness: 0,
      clearcoat: 0.06,
      clearcoatRoughness: 0.2,
      envMapIntensity: rosso ? 0.22 : nero ? 0.72 : 0.62
    });
    return material;
  }
  let concreteTexCache = null;
  function makeConcreteMaterial() {
    if (!concreteTexCache) {
      concreteTexCache = loadTexture("textures/beton.jpg").clone();
      concreteTexCache.wrapS = concreteTexCache.wrapT = THREE.RepeatWrapping;
      concreteTexCache.repeat.set(1, 1);
      concreteTexCache.anisotropy = 8;
    }
    const concreteFile = concreteTexCache;
    if (concreteFile.image && (concreteFile.image.width || concreteFile.image.naturalWidth)) concreteFile.needsUpdate = true;
    const mat = new THREE.MeshStandardMaterial({
      map: concreteFile,
      bumpMap: concreteFile,
      bumpScale: 3e-3,
      color: 12105135,
      roughness: 0.96,
      metalness: 0,
      envMapIntensity: 0.04
    });
    mat.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <map_fragment>",
        "#include <map_fragment>\ndiffuseColor.rgb = clamp((diffuseColor.rgb - vec3(.3)) * 1.55 + vec3(.3), vec3(0.), vec3(1.));"
      );
    };
    mat.customProgramCacheKey = () => "adamek-concrete-grain-v2";
    mat.userData.materialId = "concrete";
    return mat;
  }
  function pseudoRand(n) {
    const s = Math.sin(n * 12.9898) * 43758.5453;
    return s - Math.floor(s);
  }
  function makeStudioBackdrop() {
    const cv = document.createElement("canvas");
    cv.width = 16;
    cv.height = 1024;
    const ctx = cv.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, cv.height);
    gradient.addColorStop(0, "#dedede");
    gradient.addColorStop(0.48, "#f0f0f0");
    gradient.addColorStop(1, "#ffffff");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, cv.width, cv.height);
    const texture = new THREE.CanvasTexture(cv);
    texture.encoding = THREE.sRGBEncoding;
    texture.needsUpdate = true;
    return texture;
  }
  function makeOutdoorEnvironment(renderer, equirect) {
    try {
      const pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();
      const rt = pmrem.fromEquirectangular(equirect);
      pmrem.dispose();
      rt.texture.userData.renderTarget = rt;
      return rt.texture;
    } catch (e) {
      return equirect;
    }
  }
  function makeStudioFloorTexture() {
    const cv = document.createElement("canvas");
    cv.width = 512;
    cv.height = 512;
    const ctx = cv.getContext("2d");
    ctx.fillStyle = "#e3e6e1";
    ctx.fillRect(0, 0, 512, 512);
    const r = ctx.createRadialGradient(256, 256, 30, 256, 256, 300);
    r.addColorStop(0, "#eff1ed");
    r.addColorStop(0.66, "#dfe3dc");
    r.addColorStop(1, "#cdd3ca");
    ctx.fillStyle = r;
    ctx.fillRect(0, 0, 512, 512);
    const tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    tex.needsUpdate = true;
    return tex;
  }
  function makeGroundTexture(kind) {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 512;
    const ctx = cv.getContext("2d");
    const rand = seededRandom(hashSeed("garden-" + kind));
    ctx.fillStyle = kind === "grass" ? "#737d5d" : kind === "paving" ? "#b4b4a9" : "#9d9888";
    ctx.fillRect(0, 0, 512, 512);
    const count = kind === "gravel" ? 10500 : 22e3;
    for (let i = 0; i < count; i++) {
      const x = rand() * 512, y = rand() * 512, n = Math.round(rand() * 60);
      const radius = kind === "gravel" ? 1.3 + rand() * 2.8 : 0.35 + rand() * 1.1;
      ctx.fillStyle = kind === "grass" ? `rgba(${56 + n},${70 + n},${38 + n},.5)` : kind === "paving" ? `rgba(${116 + n},${116 + n},${106 + n},.18)` : `rgb(${120 + n},${117 + n},${105 + n})`;
      ctx.beginPath();
      ctx.ellipse(x, y, radius, radius * 0.68, rand() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
      if (kind === "gravel") {
        ctx.fillStyle = "rgba(240,230,209,.16)";
        ctx.beginPath();
        ctx.ellipse(x - radius * 0.24, y - radius * 0.24, radius * 0.48, radius * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = 8;
    return tex;
  }
  function makeReflectionEnvironment() {
    const cv = document.createElement("canvas");
    cv.width = 1024;
    cv.height = 512;
    const ctx = cv.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, "#edf0f3");
    gradient.addColorStop(0.5, "#a8b0b1");
    gradient.addColorStop(1, "#656963");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 512);
    [[210, 130, 105, 155], [730, 170, 62, 130]].forEach(([x, y, rx, ry]) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(rx, ry);
      const soft = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      soft.addColorStop(0, "rgba(255,255,255,1)");
      soft.addColorStop(0.6, "rgba(255,255,255,.8)");
      soft.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = soft;
      ctx.fillRect(-1, -1, 2, 2);
      ctx.restore();
    });
    const tex = new THREE.CanvasTexture(cv);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }
  function createContactShadow() {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 256;
    const ctx = cv.getContext("2d");
    ctx.shadowColor = "#252b25";
    ctx.shadowBlur = 22;
    ctx.fillStyle = "#252b25";
    ctx.fillRect(40, 40, 176, 176);
    const texture = new THREE.CanvasTexture(cv);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.19,
      depthWrite: false,
      toneMapped: false
    }));
    shadow.name = "ground_contact_shadow";
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -1e-3;
    shadow.renderOrder = 1;
    return shadow;
  }
  function createCemeteryContext() {
    const group = new THREE.Group();
    group.name = "cemetery_context";
    const grassTex = makeGroundTexture("grass");
    grassTex.repeat.set(30, 30);
    const grass = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({
      map: grassTex,
      color: 9015670,
      roughness: 1,
      envMapIntensity: 0.12
    }));
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.026;
    grass.receiveShadow = true;
    group.add(grass);
    const gravelTex = makeGroundTexture("gravel");
    const gravel = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({
      map: gravelTex,
      color: 11052183,
      roughness: 0.96,
      envMapIntensity: 0.16
    }));
    gravel.rotation.x = -Math.PI / 2;
    gravel.position.y = -8e-3;
    gravel.receiveShadow = true;
    group.add(gravel);
    const edgeMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(7830642).convertSRGBToLinear(), roughness: 0.86, envMapIntensity: 0.15 });
    const edging = Array.from({ length: 4 }, () => {
      const edge = new THREE.Mesh(new THREE.BoxGeometry(1, 0.025, 1), edgeMat);
      edge.position.y = -0.016;
      edge.receiveShadow = true;
      group.add(edge);
      return edge;
    });
    const pavingTex = makeGroundTexture("paving");
    const pathMat = new THREE.MeshStandardMaterial({ map: pavingTex, color: 11053728, roughness: 0.94, envMapIntensity: 0.16 });
    const tileGeo = new THREE.BoxGeometry(0.595, 0.018, 0.645);
    const path = new THREE.InstancedMesh(tileGeo, pathMat, 62);
    const tileTransform = new THREE.Object3D();
    let tileIndex = 0;
    for (let row = 0; row < 2; row++) for (let col = -15; col <= 15; col++) {
      tileTransform.position.set(col * 0.6 + (row ? 0.3 : 0), -0.016, row * 0.65);
      tileTransform.updateMatrix();
      path.setMatrixAt(tileIndex, tileTransform.matrix);
      path.setColorAt(tileIndex, new THREE.Color().setScalar(0.94 + pseudoRand(tileIndex + 4) * 0.06));
      tileIndex++;
    }
    path.receiveShadow = true;
    group.add(path);
    const rand = seededRandom(1487);
    const leafGeo = new THREE.BufferGeometry();
    leafGeo.setAttribute("position", new THREE.Float32BufferAttribute([
      0,
      0,
      0,
      -0.45,
      0.45,
      0.08,
      0,
      1,
      0,
      0.45,
      0.45,
      0.08,
      0,
      0.5,
      0.16
    ], 3));
    leafGeo.setIndex([0, 1, 4, 1, 2, 4, 2, 3, 4, 3, 0, 4]);
    leafGeo.computeVertexNormals();
    const leafMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(5399619).convertSRGBToLinear(),
      roughness: 0.91,
      side: THREE.DoubleSide,
      envMapIntensity: 0.18
    });
    const shrubs = [
      [-3.4, -3, 0.64, 0.58],
      [-4.3, -4.5, 0.94, 0.9],
      [-2.35, -5.9, 0.8, 0.75],
      [0.8, -6.4, 1, 0.8],
      [5.4, -4.9, 0.85, 0.95],
      [4.7, -2.6, 0.6, 0.55],
      [-6, -8.8, 1.25, 1.1],
      [5.7, -9.3, 1.3, 1.2]
    ];
    const leafCounts = shrubs.map((shrub) => Math.ceil(shrub[2] * shrub[2] * 5e3));
    const foliage = new THREE.InstancedMesh(leafGeo, leafMat, leafCounts.reduce((sum, n) => sum + n, 0));
    foliage.name = "garden_foliage";
    const transform = new THREE.Object3D();
    let leafIndex = 0;
    shrubs.forEach(([x, z, radius, height], shrubIndex) => {
      for (let i = 0; i < leafCounts[shrubIndex]; i++) {
        const phi = rand() * Math.PI * 2, v = rand() * 2 - 1;
        const r = 0.76 + rand() * 0.24, horizontal = Math.sqrt(1 - v * v);
        transform.position.set(
          x + Math.cos(phi) * horizontal * r * radius,
          0.06 + (v * r + 1) * height * 0.5,
          z + Math.sin(phi) * horizontal * r * radius
        );
        const size = 0.065 + rand() * 0.035;
        transform.scale.set(size, size * (1 + rand() * 0.5), size);
        transform.rotation.set(rand() * Math.PI, rand() * Math.PI * 2, rand() * Math.PI);
        transform.updateMatrix();
        foliage.setMatrixAt(leafIndex, transform.matrix);
        foliage.setColorAt(leafIndex, new THREE.Color().setHSL(0.21 + rand() * 0.035, 0.14 + rand() * 0.16, 0.47 + rand() * 0.25));
        leafIndex++;
      }
    });
    foliage.receiveShadow = true;
    group.add(foliage);
    const core = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(1, 2),
      new THREE.MeshStandardMaterial({ color: new THREE.Color(3886383).convertSRGBToLinear(), roughness: 1, envMapIntensity: 0.12 }),
      shrubs.length * 9
    );
    core.name = "garden_shrub_volume";
    shrubs.forEach(([x, z, radius, height], index) => {
      for (let j = 0; j < 9; j++) {
        const phi = j / 9 * Math.PI * 2;
        transform.position.set(x + Math.cos(phi) * radius * 0.24, 0.06 + height * 0.43, z + Math.sin(phi) * radius * 0.24);
        transform.scale.set(radius * 0.43, height * (0.27 + rand() * 0.06), radius * 0.43);
        transform.rotation.set(rand() * 0.2, rand() * Math.PI, rand() * 0.2);
        transform.updateMatrix();
        core.setMatrixAt(index * 9 + j, transform.matrix);
      }
    });
    core.receiveShadow = true;
    group.add(core);
    const trees = [[-5.2, -6.8, 4.8, 1.75], [5.8, -8, 5.2, 1.9], [-1.7, -13.8, 5.8, 2]];
    const clustersPerTree = 28, leavesPerCluster = 240;
    const treeLeaves = new THREE.InstancedMesh(leafGeo, leafMat, trees.length * clustersPerTree * leavesPerCluster);
    treeLeaves.name = "garden_tree_leaves";
    const treeCore = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(1, 2),
      new THREE.MeshStandardMaterial({ color: new THREE.Color(5464903).convertSRGBToLinear(), roughness: 1, envMapIntensity: 0.15 }),
      trees.length * clustersPerTree
    );
    treeCore.name = "garden_tree_crowns";
    const barkCanvas = document.createElement("canvas");
    barkCanvas.width = 64;
    barkCanvas.height = 256;
    const barkCtx = barkCanvas.getContext("2d");
    barkCtx.fillStyle = "#746d60";
    barkCtx.fillRect(0, 0, 64, 256);
    for (let i = 0; i < 120; i++) {
      barkCtx.fillStyle = i % 3 ? "rgba(35,31,26,.22)" : "rgba(210,202,175,.18)";
      barkCtx.fillRect(rand() * 64, rand() * 256, 1 + rand() * 2, 12 + rand() * 60);
    }
    const barkTex = new THREE.CanvasTexture(barkCanvas);
    barkTex.encoding = THREE.sRGBEncoding;
    const wood = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.6, 1, 1, 9),
      new THREE.MeshStandardMaterial({ map: barkTex, roughness: 1, envMapIntensity: 0.12 }),
      trees.length * 8
    );
    wood.name = "garden_tree_branches";
    const up = new THREE.Vector3(0, 1, 0), a = new THREE.Vector3(), b = new THREE.Vector3(), delta = new THREE.Vector3();
    const branch = (index, start, end, radius) => {
      delta.subVectors(end, start);
      transform.position.copy(start).add(end).multiplyScalar(0.5);
      transform.quaternion.setFromUnitVectors(up, delta.clone().normalize());
      transform.scale.set(radius, delta.length(), radius);
      transform.updateMatrix();
      wood.setMatrixAt(index, transform.matrix);
    };
    let treeLeafIndex = 0;
    trees.forEach(([x, z, height, radius], treeIndex) => {
      branch(treeIndex * 8, a.set(x, 0, z), b.set(x + 0.1, height * 0.7, z), 0.19);
      for (let j = 0; j < 7; j++) {
        const phi = j * 2.399 + treeIndex;
        branch(
          treeIndex * 8 + j + 1,
          a.set(x, height * (0.32 + j * 0.035), z),
          b.set(x + Math.cos(phi) * radius * 0.75, height * (0.66 + j * 0.032), z + Math.sin(phi) * radius * 0.75),
          0.075 - j * 5e-3
        );
      }
      for (let j = 0; j < clustersPerTree; j++) {
        const phi = j * 2.399 + treeIndex, v = -0.75 + 1.65 * j / (clustersPerTree - 1);
        const spread = Math.sqrt(1 - v * v) * radius * (0.78 + rand() * 0.22);
        const cx = x + Math.cos(phi) * spread, cy = height * 0.72 + v * height * 0.27, cz = z + Math.sin(phi) * spread;
        const r = 0.48 + rand() * 0.25;
        transform.position.set(cx, cy, cz);
        transform.rotation.set(rand(), rand(), rand());
        transform.scale.set(r * 0.52, r * 0.48, r * 0.56);
        transform.updateMatrix();
        treeCore.setMatrixAt(treeIndex * clustersPerTree + j, transform.matrix);
        treeCore.setColorAt(treeIndex * clustersPerTree + j, new THREE.Color().setHSL(0.23, 0.2, 0.58 + rand() * 0.15));
        for (let k = 0; k < leavesPerCluster; k++) {
          const theta = rand() * Math.PI * 2, h = rand() * 2 - 1, sphere = Math.sqrt(1 - h * h), shell = 0.68 + rand() * 0.32;
          transform.position.set(cx + Math.cos(theta) * sphere * r * shell, cy + h * r * 0.85 * shell, cz + Math.sin(theta) * sphere * r * shell);
          const size = 0.09 + rand() * 0.055;
          transform.scale.set(size, size * 1.22, size);
          transform.rotation.set(rand() * Math.PI, rand() * Math.PI * 2, rand() * Math.PI);
          transform.updateMatrix();
          treeLeaves.setMatrixAt(treeLeafIndex, transform.matrix);
          treeLeaves.setColorAt(treeLeafIndex++, new THREE.Color().setHSL(0.21 + rand() * 0.05, 0.18 + rand() * 0.16, 0.5 + rand() * 0.28));
        }
      }
      const mulch = new THREE.Mesh(
        new THREE.CircleGeometry(0.65, 32),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(5854275).convertSRGBToLinear(), roughness: 1 })
      );
      mulch.rotation.x = -Math.PI / 2;
      mulch.position.set(x, -0.02, z);
      group.add(mulch);
    });
    wood.castShadow = true;
    wood.receiveShadow = true;
    treeCore.receiveShadow = true;
    treeLeaves.receiveShadow = true;
    group.add(wood, treeCore, treeLeaves);
    const bedMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(4802104).convertSRGBToLinear(), roughness: 1, envMapIntensity: 0.08 });
    shrubs.forEach(([x, z, radius]) => {
      const bed = new THREE.Mesh(new THREE.CircleGeometry(radius * 1.06, 40), bedMat);
      bed.rotation.x = -Math.PI / 2;
      bed.position.set(x, -0.021, z);
      bed.receiveShadow = true;
      group.add(bed);
    });
    group.userData.layout = { gravel, edging, path };
    return group;
  }
  function groundedFootprint(group) {
    const footprint = new THREE.Box3();
    group.updateMatrixWorld(true);
    group.traverseVisible((node) => {
      if (!node.isMesh || !node.geometry || !node.userData.compId) return;
      node.geometry.computeBoundingBox();
      const box = node.geometry.boundingBox.clone().applyMatrix4(node.matrixWorld);
      if (box.min.y < 0.12) footprint.union(box);
    });
    if (footprint.isEmpty()) footprint.setFromObject(group);
    return footprint;
  }
  function fitGroundContext(st, group) {
    const box = groundedFootprint(group);
    const size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
    if (st.contactShadow) {
      st.contactShadow.scale.set(size.x * 1.36, size.z * 1.36, 1);
      st.contactShadow.position.set(center.x, -1e-3, center.z);
    }
    const layout = st.cemeteryContext && st.cemeteryContext.userData.layout;
    if (!layout) return;
    const width = size.x + 0.8, depth = size.z + 0.8;
    layout.gravel.scale.set(width, depth, 1);
    layout.gravel.position.set(center.x, -8e-3, center.z);
    layout.gravel.material.map.repeat.set(width / 0.65, depth / 0.65);
    layout.edging.forEach((edge, i) => {
      const side = i < 2, sign = i % 2 ? 1 : -1;
      edge.scale.set(side ? 0.055 : width + 0.055, 1, side ? depth + 0.055 : 0.055);
      edge.position.set(center.x + (side ? sign * width / 2 : 0), -0.016, center.z + (side ? 0 : sign * depth / 2));
    });
    layout.path.position.z = center.z + depth / 2 + 0.45;
  }
  const BASE_TEXTURE_TILE_SIZE = 0.42;
  const COMPONENT_TEXTURE_SCALE = {
    napisova_deska: 1,
    podlozka_1: 1,
    podlozka_2: 1,
    sokl: 1,
    ram: 1,
    kryci_deska: 1,
    zaklad: 1.7
  };
  const MATERIAL_TEXTURE_SCALE = {
    // Jemnozrnné žuly → přirozené zrno (nemění se). Směrované/žilnaté žuly →
    // roztažené, aby se kresba na velkých plochách viditelně neopakovala.
    impala: 0.9,
    aurora: 4.8,
    paradiso: 2,
    // žilnatá → roztažená
    viscont: 3.2,
    // broad flowing veins rather than small repeated patches
    kashmir: 0.95,
    multicolor: 2,
    // žilnatá → roztažená
    tarn: 0.96,
    labrador: 0.5 / BASE_TEXTURE_TILE_SIZE,
    // New square scan covers 50 × 50 cm
    balmoral: 0.92,
    "aurora-natural": 3.2,
    // hodně roztažené — směrované žíly se jinak viditelně opakují
    "baltic-brown": 1.18,
    "butterfly-blue": 1.15,
    "cats-eyes": 0.92,
    "rosa-beta": 0.92,
    "rosa-porino": 0.95,
    "rosso-africa": 1.8,
    // Owner-provided square granite photograph
    shivakashi: 1.8,
    // bohatší kresba → roztažená
    "verde-olive": 1.8,
    // kresba → roztažená
    "vizag-blue": 1.12
    // členitá, podle zpětné vazby vypadá dobře → ponecháno
  };
  const STONE_TEXTURE_ASPECT = {
    impala: 1444 / 857,
    labrador: 1,
    "verde-olive": 1536 / 898,
    tarn: 4 / 3,
    kashmir: 4 / 3,
    viscont: 4 / 3,
    paradiso: 4 / 3,
    multicolor: 4 / 3,
    "rosa-beta": 4 / 3,
    "rosso-africa": 1,
    shivakashi: 4 / 3,
    "vizag-blue": 4 / 3
  };
  const DIRECTIONAL_STONES = /* @__PURE__ */ new Set([
    "viscont",
    "paradiso",
    "multicolor",
    "aurora-natural",
    "shivakashi",
    "vizag-blue"
  ]);
  function textureTileSizeFor(mesh, compId, materialId) {
    const compScale = COMPONENT_TEXTURE_SCALE[compId || mesh.userData.compId] || 1;
    const matScale = MATERIAL_TEXTURE_SCALE[materialId || mesh.userData.materialId] || 1;
    return BASE_TEXTURE_TILE_SIZE * compScale * matScale;
  }
  function ensureBoxUVs(mesh, compId, materialId) {
    if (mesh.userData.sourceUVMaterialId && mesh.userData.sourceUVMaterialId === (materialId || mesh.userData.materialId)) return;
    let geo = mesh.geometry;
    if (!geo || !geo.attributes || !geo.attributes.position) return;
    if (geo.index) {
      geo = geo.toNonIndexed();
      mesh.geometry = geo;
    }
    const pos = geo.attributes.position;
    const uvSource = mesh.userData.stoneUVReference || mesh;
    const tileSize = textureTileSizeFor(uvSource, compId, materialId);
    const stoneId = materialId || mesh.userData.materialId;
    const textureAspect = mesh.userData.sourceAccessoryTextureAspect || STONE_TEXTURE_ASPECT[stoneId] || 1;
    const directional = DIRECTIONAL_STONES.has(stoneId);
    const uvs = new Float32Array(pos.count * 2);
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const c = new THREE.Vector3();
    const p = new THREE.Vector3();
    const ab = new THREE.Vector3();
    const ac = new THREE.Vector3();
    const faceNormal = new THREE.Vector3();
    mesh.updateWorldMatrix(true, false);
    const worldMatrix = mesh.matrixWorld;
    const worldBox = new THREE.Box3().setFromObject(uvSource);
    const centerX = (worldBox.min.x + worldBox.max.x) / 2;
    const centerY = (worldBox.min.y + worldBox.max.y) / 2;
    const centerZ = (worldBox.min.z + worldBox.max.z) / 2;
    const seed = hashSeed(
      (compId || mesh.userData.compId || "?") + ":" + (materialId || mesh.userData.materialId || "?") + ":" + Math.round(centerX * 1e3) + ":" + Math.round(centerY * 1e3) + ":" + Math.round(centerZ * 1e3)
    );
    const rand = seededRandom(seed);
    const rotSteps = directional ? 0 : Math.floor(rand() * 4);
    const sinR = Math.sin(rotSteps * Math.PI / 2);
    const cosR = Math.cos(rotSteps * Math.PI / 2);
    const flipU = directional ? 1 : rand() > 0.5 ? -1 : 1;
    const flipV = directional ? 1 : rand() > 0.5 ? -1 : 1;
    const offsetU = rand();
    const offsetV = rand();
    function setUV(vertexIndex, projection) {
      p.fromBufferAttribute(pos, vertexIndex).applyMatrix4(worldMatrix);
      let u, v;
      if (projection === "top") {
        u = (p.x - centerX) / tileSize;
        v = (p.z - centerZ) / tileSize;
      } else if (projection === "front") {
        u = (p.x - centerX) / tileSize;
        v = (p.y - centerY) / tileSize;
      } else {
        u = (p.z - centerZ) / tileSize;
        v = (p.y - centerY) / tileSize;
      }
      const uRot = u * cosR - v * sinR;
      const vRot = u * sinR + v * cosR;
      uvs[vertexIndex * 2] = uRot * flipU / textureAspect + offsetU;
      uvs[vertexIndex * 2 + 1] = vRot * flipV + offsetV;
    }
    for (let i = 0; i < pos.count; i += 3) {
      a.fromBufferAttribute(pos, i).applyMatrix4(worldMatrix);
      b.fromBufferAttribute(pos, i + 1).applyMatrix4(worldMatrix);
      c.fromBufferAttribute(pos, i + 2).applyMatrix4(worldMatrix);
      ab.subVectors(b, a);
      ac.subVectors(c, a);
      faceNormal.crossVectors(ab, ac).normalize();
      const nx = Math.abs(faceNormal.x);
      const ny = Math.abs(faceNormal.y);
      const nz = Math.abs(faceNormal.z);
      const projection = ny >= nx && ny >= nz ? "top" : nz >= nx ? "front" : "side";
      setUV(i, projection);
      setUV(i + 1, projection);
      setUV(i + 2, projection);
    }
    geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geo.attributes.uv.needsUpdate = true;
    mesh.userData.boxUVReady = true;
  }
  const DARK_STONE = new THREE.MeshStandardMaterial({ color: 1710102, roughness: 0.55, metalness: 0.08 });
  const EDGE_DARK_MATERIAL = new THREE.LineBasicMaterial({
    color: 1511950,
    transparent: true,
    opacity: 0.13,
    depthTest: true
  });
  const EDGE_LIGHT_MATERIAL = new THREE.LineBasicMaterial({
    color: 16773595,
    transparent: true,
    opacity: 0.035,
    depthTest: true
  });
  const HIGHLIGHT_EDGE_MATERIAL = new THREE.LineBasicMaterial({
    color: 15557162,
    transparent: true,
    opacity: 0.95,
    depthTest: true
  });
  const HIGHLIGHT_GLOW_MATERIAL = new THREE.LineBasicMaterial({
    color: 16763048,
    transparent: true,
    opacity: 0.55,
    depthTest: true
  });
  const EDGE_WIRE_MATERIAL = new THREE.LineBasicMaterial({
    color: 13225426,
    transparent: true,
    opacity: 0.6,
    depthTest: true
  });
  const EDGE_WIRE_DARK_MATERIAL = new THREE.LineBasicMaterial({
    color: 4211786,
    transparent: true,
    opacity: 0.6,
    depthTest: true
  });
  let soilMaterial = null;
  function makeSoilMaterial() {
    if (soilMaterial) return soilMaterial;
    const size = 384;
    const cv = document.createElement("canvas");
    cv.width = size;
    cv.height = size;
    const ctx = cv.getContext("2d");
    const img = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const wave = Math.sin(x * 0.045) * 13 + Math.cos(y * 0.052) * 11 + Math.sin((x + y) * 0.018) * 16;
        const grain = Math.random() * 52 - 26;
        const green = Math.random() > 0.93;
        const base = Math.max(22, Math.min(78, 48 + wave + grain));
        img.data[i] = green ? base * 0.48 : base * 0.78;
        img.data[i + 1] = green ? base * 0.82 : base * 0.5;
        img.data[i + 2] = green ? base * 0.34 : base * 0.25;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(0.85, 0.85);
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
    soilMaterial = new THREE.MeshLambertMaterial({ map: tex, color: 16777215, side: THREE.DoubleSide });
    return soilMaterial;
  }
  let gravelFillMaterial = null;
  function makeFillMaterial(cfg) {
    if (cfg.fillType !== "gravel") return makeSoilMaterial();
    if (!gravelFillMaterial) {
      const texture = makeGroundTexture("gravel");
      texture.repeat.set(3, 3);
      gravelFillMaterial = new THREE.MeshStandardMaterial({ map: texture, color: 13947080, roughness: 0.95, side: THREE.DoubleSide });
    }
    return gravelFillMaterial;
  }
  function getCompMat(cfg, compId) {
    if (compId === "zaklad") return makeConcreteMaterial();
    const matId = cfg.materials && (cfg.materials[compId] || (compId === "podlozka_1" || compId === "podlozka_2" ? cfg.materials.podlozka : null));
    const matObj = matId && window.MATERIALS.find((m) => m.id === matId);
    if (!matObj) return DARK_STONE;
    const mat = makeStoneMaterial(matObj);
    mat.userData.materialId = matObj.id;
    return mat;
  }
  function makeAccessoryMaterial(cfg, style) {
    if (style === "plech-cerna") {
      return new THREE.MeshPhysicalMaterial({
        color: 526344,
        roughness: 0.9,
        metalness: 0.12,
        clearcoat: 0,
        clearcoatRoughness: 1,
        envMapIntensity: 0.3,
        reflectivity: 0.08
      });
    }
    if (style === "plech-stribrna") {
      return new THREE.MeshPhysicalMaterial({
        color: 13028046,
        roughness: 0.36,
        metalness: 0.85,
        clearcoat: 0.4,
        clearcoatRoughness: 0.28,
        envMapIntensity: 0.85,
        ior: 2.1,
        reflectivity: 0.5
      });
    }
    return getCompMat(cfg, "napisova_deska");
  }
  function makeAccessoryAccentMaterial(style) {
    if (style === "plech-cerna") {
      return new THREE.MeshPhysicalMaterial({
        color: 921102,
        roughness: 0.9,
        metalness: 0.12,
        clearcoat: 0,
        clearcoatRoughness: 1,
        envMapIntensity: 0.3,
        reflectivity: 0.08
      });
    }
    return new THREE.MeshPhysicalMaterial({
      color: 14080735,
      roughness: 0.2,
      metalness: 0.9,
      clearcoat: 0.6,
      clearcoatRoughness: 0.16,
      envMapIntensity: 1.2,
      ior: 2.3,
      reflectivity: 0.7
    });
  }
  function applyStoneMaterialToNode(rootNode, cfg) {
    if (!rootNode) return;
    let material = null;
    rootNode.traverse((child) => {
      var _a;
      if (!child.isMesh) return;
      if (cfg.sourceModel === "dvojhrob-premium-20261005" && child.userData.sourcePreserveMaterial && child.userData.sourceMaterialId === ((_a = cfg.materials) == null ? void 0 : _a.napisova_deska)) {
        child.material = child.material.clone();
        child.material.userData.materialId = child.userData.sourceMaterialId;
        child.userData.skipAutoTexture = true;
        child.castShadow = true;
        child.receiveShadow = true;
        return;
      }
      if (!material) material = makeAccessoryMaterial(cfg, "granit");
      child.userData.skipAutoTexture = false;
      child.material = material;
      child.castShadow = true;
      child.receiveShadow = true;
    });
  }
  function replaceWithMetalAccessory(rootNode, group, cfg, kind, style) {
    if (!rootNode) return;
    rootNode.updateWorldMatrix(true, false);
    const bbox = new THREE.Box3().setFromObject(rootNode);
    if (bbox.isEmpty()) return;
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    bbox.getSize(size);
    bbox.getCenter(center);
    rootNode.traverse((c) => {
      if (c.isMesh) c.visible = false;
    });
    const material = makeAccessoryMaterial(cfg, style);
    const accentMat = makeAccessoryAccentMaterial(style);
    const metal = new THREE.Group();
    metal.userData.isMetalReplacement = true;
    metal.userData.accId = kind;
    if (kind === "vase") {
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(size.x * 0.78, size.y * 0.85, size.z * 0.78),
        material
      );
      body.position.y = size.y * 0.425;
      body.castShadow = true;
      body.receiveShadow = true;
      body.userData.skipAutoTexture = true;
      metal.add(body);
      const rim = new THREE.Mesh(
        new THREE.BoxGeometry(size.x * 0.88, size.y * 0.06, size.z * 0.88),
        accentMat
      );
      rim.position.y = size.y * 0.85 + size.y * 0.03;
      rim.castShadow = true;
      rim.userData.skipAutoTexture = true;
      metal.add(rim);
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(size.x * 0.92, size.y * 0.04, size.z * 0.92),
        accentMat
      );
      base.position.y = size.y * 0.02;
      base.castShadow = true;
      base.receiveShadow = true;
      base.userData.skipAutoTexture = true;
      metal.add(base);
    } else {
      const bodyH = size.y * 0.58;
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(size.x * 0.82, bodyH, size.z * 0.82),
        material
      );
      body.position.y = size.y * 0.18 + bodyH / 2;
      body.castShadow = true;
      body.receiveShadow = true;
      body.userData.skipAutoTexture = true;
      metal.add(body);
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 16773320,
        emissive: 16757319,
        emissiveIntensity: 0.65,
        roughness: 0.25,
        metalness: 0,
        transmission: 0.4,
        transparent: true,
        opacity: 0.85
      });
      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(size.x * 0.62, bodyH * 0.6, size.z * 0.62),
        glassMat
      );
      glass.position.y = body.position.y - bodyH * 0.05;
      glass.userData.skipAutoTexture = true;
      glass.userData.isGlass = true;
      metal.add(glass);
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(size.x * 0.95, size.y * 0.18, size.z * 0.95),
        material
      );
      base.position.y = size.y * 0.09;
      base.castShadow = true;
      base.receiveShadow = true;
      base.userData.skipAutoTexture = true;
      metal.add(base);
      const roofH = size.y * 0.22;
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(size.x * 0.55, roofH, 4),
        accentMat
      );
      roof.rotation.y = Math.PI / 4;
      roof.position.y = body.position.y + bodyH / 2 + roofH / 2;
      roof.castShadow = true;
      roof.userData.skipAutoTexture = true;
      metal.add(roof);
    }
    if (style === "plech-cerna" || style === "plech-stribrna") {
      const wireMat = style === "plech-cerna" ? EDGE_WIRE_MATERIAL : EDGE_WIRE_DARK_MATERIAL;
      metal.traverse((c) => {
        if (c.isMesh && !c.userData.isGlass && c.geometry) {
          const wire = new THREE.LineSegments(new THREE.EdgesGeometry(c.geometry, 1), wireMat);
          wire.renderOrder = 4;
          c.add(wire);
        }
      });
    }
    metal.position.copy(center);
    metal.position.y = bbox.min.y;
    group.add(metal);
  }
  function applyAccessoryStyle(rootNode, group, cfg, kind) {
    if (!rootNode) return;
    const style = (kind === "vase" ? cfg.vaseStyle : cfg.lanternStyle) || "granit";
    if (rootNode.userData.sourceAccessory && ["plech-stribrna", "plech-cerna"].includes(style)) {
      rootNode.traverse((node) => {
        if (!node.isMesh) return;
        node.visible = true;
        node.material = makeAccessoryMaterial(cfg, style);
        node.userData.skipAutoTexture = true;
      });
      rootNode.userData.accId = kind;
      return;
    }
    if (style === "granit") {
      rootNode.traverse((c) => {
        if (c.isMesh) c.visible = true;
      });
      applyStoneMaterialToNode(rootNode, cfg);
      rootNode.userData.accId = kind;
    } else {
      replaceWithMetalAccessory(rootNode, group, cfg, kind, style);
    }
  }
  function tagComponentMesh(mesh, compId, material) {
    mesh.userData.compId = compId;
    mesh.userData.materialId = material && material.userData ? material.userData.materialId : void 0;
    return mesh;
  }
  const EXPLODE_OFFSETS = {
    napisova_deska: new THREE.Vector3(0, 0.18, -0.08),
    podlozka_1: new THREE.Vector3(0, 0.1, -0.04),
    podlozka_2: new THREE.Vector3(0, 0.06, 0.02),
    sokl: new THREE.Vector3(0, 0.04, 0.07),
    ram: new THREE.Vector3(0, 0, 0.14),
    kryci_deska: new THREE.Vector3(0, 0.08, 0.16),
    zaklad: new THREE.Vector3(0, -0.02, 0)
  };
  function applyExplodedLayout(group, enabled) {
    group.traverse((node) => {
      if (!node.isMesh || !node.userData || !node.userData.compId) return;
      if (!node.userData.basePosition) node.userData.basePosition = node.position.clone();
      node.position.copy(node.userData.basePosition);
      if (enabled) node.position.add(EXPLODE_OFFSETS[node.userData.compId] || new THREE.Vector3());
    });
  }
  function setHighlightOnGroup(group, selectedCompId) {
    if (!group) return;
    group.traverse((node) => {
      if (!node.isMesh || !node.userData) return;
      const isSelected = !!selectedCompId && node.userData.compId === selectedCompId;
      if (node.userData.outline) node.userData.outline.material = isSelected ? HIGHLIGHT_EDGE_MATERIAL : EDGE_DARK_MATERIAL;
      if (node.userData.outlineHighlight) node.userData.outlineHighlight.material = isSelected ? HIGHLIGHT_GLOW_MATERIAL : EDGE_LIGHT_MATERIAL;
    });
  }
  function addOutline(mesh) {
    if (mesh.userData.outline) return;
    const edges = new THREE.EdgesGeometry(mesh.geometry, 10);
    const darkLines = new THREE.LineSegments(edges, EDGE_DARK_MATERIAL);
    const lightLines = new THREE.LineSegments(edges, EDGE_LIGHT_MATERIAL);
    darkLines.renderOrder = 3;
    lightLines.renderOrder = 4;
    mesh.add(darkLines);
    mesh.add(lightLines);
    mesh.userData.outline = darkLines;
    mesh.userData.outlineHighlight = lightLines;
  }
  function finishTexturedStoneMeshes(group) {
    group.updateMatrixWorld(true);
    group.traverse((node) => {
      if (node.userData && node.userData.skipAutoTexture) return;
      if (!node.isMesh || !node.material || !node.material.map || node.material.transparent) return;
      ensureBoxUVs(node, node.userData.compId, node.userData.materialId);
      if (!node.userData.headstonePartId) addOutline(node);
      node.castShadow = true;
      node.receiveShadow = true;
    });
  }
  const MODEL_VARIANTS = {
    urnovy: [
      { w: 70, d: 90, url: "models/UP_krycideska_podlozka.glb", sokl: false, cover: true, edge: "presah" },
      { w: 70, d: 90, url: "models/UP_podlozka_hlina.glb", sokl: false, cover: false, edge: "presah" },
      { w: 70, d: 90, url: "models/UP_sokl_okno_deska.glb", sokl: true, cover: true, edge: "presah" },
      { w: 70, d: 90, url: "models/UP_sokl_okno_hlina.glb", sokl: true, cover: false, edge: "presah" },
      { w: 70, d: 90, url: "models/UP_odskok.glb", sokl: true, edge: "odskok" },
      { w: 70, d: 90, url: "models/UP_odskok_bezsoklu.glb", sokl: false, edge: "odskok" }
    ],
    jednohrob: [
      { w: 90, d: 200, url: "models/JH_sokl.glb", sokl: true, edge: "presah" },
      { w: 90, d: 200, url: "models/JH_podlozka_deska.glb", sokl: false, edge: "presah" },
      { w: 90, d: 200, url: "models/JH_sokl_odskok.glb", sokl: true, edge: "odskok" },
      { w: 90, d: 200, url: "models/JH_podlozka_deska_odskok.glb", sokl: false, edge: "odskok" }
    ],
    dvojhrob: [
      { w: 200, d: 200, url: "models/DH_napisovka_sokl_predlozka_presah.glb", sokl: true, edge: "presah" },
      { w: 200, d: 200, url: "models/DH_1napisovka_presah_predlozka.glb", sokl: false, edge: "presah" },
      { w: 200, d: 200, url: "models/DH_napisovka_sokl_predlozka_odskok.glb", sokl: true, edge: "odskok" },
      { w: 200, d: 200, url: "models/DH_1napisovka_presah_predlozka_odskok.glb", sokl: false, edge: "odskok" }
    ]
  };
  function pickModelUrl(type, dimW, dimD, cfg) {
    var _a, _b, _c, _d;
    if (cfg.sourceModel === "dvojhrob-exclusive-20261005" && type === "dvojhrob" && Number(dimW) === 200 && Number(dimD) === 200 && cfg.hasSokl && cfg.hasCover !== false && cfg.edgeMode === "presah") {
      return "models/dvojhrob-exclusive-20261005.glb";
    }
    if (cfg.sourceModel === "dvojhrob-premium-20261005" && type === "dvojhrob" && Number(dimW) === 200 && Number(dimD) === 200 && !cfg.hasSokl && cfg.hasCover !== false && cfg.edgeMode === "odskok") {
      return "models/dvojhrob-premium-20261005.glb";
    }
    if (cfg.sourceModel === "dvojhrob-classic-20261005" && type === "dvojhrob" && Number(dimW) === 200 && Number(dimD) === 200 && !cfg.hasSokl && cfg.hasCover !== false && cfg.edgeMode === "odskok") {
      return "models/dvojhrob-classic-20261005.glb";
    }
    if (cfg.sourceModel === "dvojhrob-standard-20261005" && type === "dvojhrob" && Number(dimW) === 200 && Number(dimD) === 200 && !cfg.hasSokl && cfg.hasCover === false && cfg.edgeMode === "odskok") {
      return "models/dvojhrob-standard-20261005.glb";
    }
    if (cfg.sourceModel === "jednohrob-exclusive-20261005" && type === "jednohrob" && Number(dimW) === 90 && Number(dimD) === 200 && cfg.hasSokl && cfg.hasCover !== false && cfg.edgeMode === "odskok") {
      return "models/jednohrob-exclusive-20261005.glb";
    }
    if (cfg.sourceModel === "jednohrob-exclusive-20261003" && type === "jednohrob" && Number(dimW) === 90 && Number(dimD) === 200 && cfg.hasSokl && cfg.hasCover !== false && cfg.edgeMode === "odskok") {
      return "models/jednohrob-exclusive-20261003.glb";
    }
    if (cfg.sourceModel === "jednohrob-premium-20261003" && type === "jednohrob" && Number(dimW) === 90 && Number(dimD) === 200 && !cfg.hasSokl && cfg.hasCover !== false && cfg.edgeMode === "odskok") {
      return "models/jednohrob-premium-20261003.glb";
    }
    if (cfg.sourceModel === "jednohrob-classic-20261003" && type === "jednohrob" && Number(dimW) === 90 && Number(dimD) === 200 && !cfg.hasSokl && cfg.hasCover !== false && cfg.edgeMode === "odskok") {
      return "models/jednohrob-classic-20261003.glb";
    }
    if (cfg.sourceModel === "jednohrob-standard-20261003" && type === "jednohrob" && Number(dimW) === 90 && Number(dimD) === 200 && !cfg.hasSokl && cfg.hasCover !== false && cfg.edgeMode === "odskok" && !((_a = cfg.accessories) == null ? void 0 : _a.vase) && !((_b = cfg.accessories) == null ? void 0 : _b.lantern)) {
      return "models/jednohrob-standard-20261003.glb";
    }
    if (cfg.sourceModel === "urnovy-exclusive-20261002" && type === "urnovy" && Number(dimW) === 90 && Number(dimD) === 120 && !cfg.hasSokl && cfg.hasCover !== false && cfg.edgeMode === "presah") {
      return "models/urnovy-exclusive-20261002.glb";
    }
    if (cfg.sourceModel === "urnovy-premium-20261002" && type === "urnovy" && Number(dimW) === 90 && Number(dimD) === 120 && !cfg.hasSokl && cfg.hasCover !== false && cfg.edgeMode === "odskok") {
      return "models/urnovy-premium-20261002.glb";
    }
    if (cfg.sourceModel === "urnovy-classic-20261002" && type === "urnovy" && Number(dimW) === 90 && Number(dimD) === 120 && !cfg.hasSokl && cfg.hasCover !== false && cfg.edgeMode === "odskok") {
      return "models/urnovy-classic-20261002.glb";
    }
    if (cfg.sourceModel === "urnovy-standard-20261002" && type === "urnovy" && Number(dimW) === 70 && Number(dimD) === 90 && !cfg.hasSokl && cfg.hasCover !== false && cfg.edgeMode === "odskok" && !((_c = cfg.accessories) == null ? void 0 : _c.vase) && !((_d = cfg.accessories) == null ? void 0 : _d.lantern)) {
      return "models/urnovy-standard-20261002.glb";
    }
    const variants = MODEL_VARIANTS[type];
    if (!variants || variants.length === 0) return null;
    const filtered = variants.filter(
      (v) => (v.sokl === void 0 || v.sokl === !!cfg.hasSokl) && (v.cover === void 0 || v.cover === (cfg.hasCover !== false)) && (v.edge === void 0 || v.edge === (cfg.edgeMode || "presah"))
    );
    const candidates = filtered.length ? filtered : variants;
    let best = candidates[0];
    let bestDist = Math.hypot(dimW - best.w, dimD - best.d);
    for (let i = 1; i < candidates.length; i++) {
      const dist = Math.hypot(dimW - candidates[i].w, dimD - candidates[i].d);
      if (dist < bestDist) {
        best = candidates[i];
        bestDist = dist;
      }
    }
    return best.url;
  }
  function normalizeNodeName(name) {
    return (name || "").replace(/#\d+$/, "");
  }
  const NODE_TO_COMPONENT = {
    zaklad: "zaklad",
    ram: "ram",
    oblozeni: "podlozka_1",
    podlozka_1: "podlozka_1",
    podlozka_2: "podlozka_2",
    podlozka_3: "podlozka_2",
    predlozka: "kryci_deska",
    stredovka: "kryci_deska",
    krycidesky: "kryci_deska",
    kryci_deska: "kryci_deska",
    napisova_deska: "napisova_deska",
    sokl: "sokl"
  };
  const NODE_ACCESSORIES = {
    vaza: "vase",
    lampa: "lantern"
  };
  const glbCache = {};
  function loadGLB(url) {
    if (glbCache[url]) return glbCache[url];
    const promise = new Promise((resolve, reject) => {
      const loader = new THREE.GLTFLoader();
      loader.load(url, (gltf) => resolve(gltf.scene), void 0, reject);
    });
    glbCache[url] = promise;
    return promise;
  }
  function findNodeRole(name) {
    const cleanName = normalizeNodeName(name);
    for (const [nodeName, comp] of Object.entries(NODE_TO_COMPONENT)) {
      if (cleanName === nodeName || cleanName === "Geom3D_" + nodeName) return { type: "comp", compId: comp, nodeName };
    }
    for (const [nodeName, accId] of Object.entries(NODE_ACCESSORIES)) {
      if (cleanName === nodeName || cleanName === "Geom3D_" + nodeName) return { type: "acc", accId, nodeName };
    }
    if (cleanName === "hlina" || cleanName === "Geom3D_hlina") return { type: "soil", nodeName: "hlina" };
    if (cleanName === "okno" || cleanName === "okno_1") return { type: "window", nodeName: "okno" };
    return null;
  }
  function findNodeRoleDeep(node) {
    var _a;
    let n = node;
    while (n) {
      const role = findNodeRole(n.name || "") || findNodeRole(((_a = n.userData) == null ? void 0 : _a.name) || "");
      if (role) return role;
      n = n.parent;
    }
    return null;
  }
  const ACCESSORY_DONOR_URL = "models/DH_napisovka_sokl_predlozka_presah.glb";
  let accessoryDonorScene = null;
  function graftDvojhrobAccessories(group, cfg, getNamedNode) {
    if (!accessoryDonorScene) return;
    let surfaceY = 0.38;
    let premiumPadBox = null;
    const baseNode = getNamedNode("podlozka_1", "podlozka_2", "podlozka_3", "krycidesky");
    if (baseNode) {
      const cb = new THREE.Box3().setFromObject(baseNode);
      if (!cb.isEmpty()) {
        surfaceY = cb.max.y;
        if (["urnovy-premium-20261002", "urnovy-exclusive-20261002", "jednohrob-premium-20261003", "jednohrob-exclusive-20261003", "jednohrob-exclusive-20261005", "dvojhrob-classic-20261005", "dvojhrob-exclusive-20261005"].includes(cfg.sourceModel)) premiumPadBox = cb;
      }
    }
    const donor = accessoryDonorScene.clone(true);
    donor.updateMatrixWorld(true);
    const graft = (accName, kind, want) => {
      if (!want || getNamedNode(accName)) return;
      let src = null;
      donor.traverse((n) => {
        if (!src && normalizeNodeName(n.name) === accName) src = n;
      });
      if (!src) return;
      src.updateWorldMatrix(true, false);
      const m = src.matrixWorld.clone();
      group.add(src);
      m.decompose(src.position, src.quaternion, src.scale);
      src.updateWorldMatrix(true, false);
      const b = new THREE.Box3().setFromObject(src);
      if (!b.isEmpty()) {
        src.position.y += surfaceY - b.min.y;
        if (premiumPadBox) {
          const cx = (premiumPadBox.min.x + premiumPadBox.max.x) / 2;
          let x = cx + (kind === "vase" ? 0.33 : -0.33);
          let z = premiumPadBox.min.z + 0.175;
          if (["dvojhrob-classic-20261005", "dvojhrob-exclusive-20261005"].includes(cfg.sourceModel)) {
            const sideOffset = cfg.sourceModel === "dvojhrob-exclusive-20261005" ? 0.78 : 0.67;
            x = cx + (kind === "vase" ? sideOffset : -sideOffset);
            z = premiumPadBox.max.z - 0.07;
          }
          if (["jednohrob-exclusive-20261005", "dvojhrob-classic-20261005", "dvojhrob-exclusive-20261005"].includes(cfg.sourceModel)) {
            const halfW = (b.max.x - b.min.x) / 2, halfD = (b.max.z - b.min.z) / 2;
            x = Math.max(premiumPadBox.min.x + halfW + 0.01, Math.min(x, premiumPadBox.max.x - halfW - 0.01));
            z = Math.max(premiumPadBox.min.z + halfD + 0.01, Math.min(z, premiumPadBox.max.z - halfD - 0.01));
          }
          src.position.x += x - (b.min.x + b.max.x) / 2;
          src.position.z += z - (b.min.z + b.max.z) / 2;
        }
        src.updateWorldMatrix(true, false);
      }
      applyAccessoryStyle(src, group, cfg, kind);
      if (cfg.sourceModel === "dvojhrob-exclusive-20261005" && ((kind === "vase" ? cfg.vaseStyle : cfg.lanternStyle) || "granit") === "granit") {
        let sourceStone = null;
        group.traverse((node) => {
          var _a;
          if (!sourceStone && node.isMesh && node.userData.sourcePreserveMaterial && !node.userData.sourceUnpaintedBackFace && node.userData.sourceMaterialRole === "napisova_deska" && node.userData.sourceMaterialId === ((_a = cfg.materials) == null ? void 0 : _a.napisova_deska)) sourceStone = node.material;
        });
        if (sourceStone) src.traverse((node) => {
          var _a;
          if (!node.isMesh) return;
          node.material = sourceStone.clone();
          node.material.side = THREE.DoubleSide;
          node.userData.materialId = cfg.materials.napisova_deska;
          node.userData.sourceAccessoryMaterial = true;
          const image = (_a = sourceStone.map) == null ? void 0 : _a.image;
          node.userData.sourceAccessoryTextureAspect = (image == null ? void 0 : image.width) && (image == null ? void 0 : image.height) ? image.width / image.height : 1;
        });
      }
    };
    graft("vaza", "vase", cfg.accessories && cfg.accessories.vase);
    graft("lampa", "lantern", cfg.accessories && cfg.accessories.lantern);
  }
  function buildFromGLB(sourceScene, cfg) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    const group = new THREE.Group();
    const clone = sourceScene.clone(true);
    const namedNodes = {};
    clone.traverse((node) => {
      if (node.name) namedNodes[node.name] = node;
    });
    function getNamedNode(...names) {
      for (const name of names) {
        if (namedNodes[name]) return namedNodes[name];
        const foundKey = Object.keys(namedNodes).find((key) => normalizeNodeName(key) === name);
        if (foundKey) return namedNodes[foundKey];
      }
      return null;
    }
    function setNamedVisibility(visible, ...names) {
      names.forEach((name) => {
        Object.entries(namedNodes).forEach(([key, node]) => {
          if (normalizeNodeName(key) === name) node.visible = visible;
        });
      });
    }
    clone.traverse((node) => {
      var _a2, _b2, _c2, _d2, _e2, _f2;
      if (!node.isMesh) return;
      const ownName = node.name || "";
      if (((_a2 = sourceScene.userData) == null ? void 0 : _a2.sourceModel) === "dvojhrob-premium-20261005" && node.userData.sourcePhysicalCross) {
        node.userData.skipAutoTexture = true;
        node.castShadow = true;
        node.receiveShadow = true;
        return;
      }
      let role = findNodeRoleDeep(node);
      if (!role && cfg.type === "jednohrob" && ownName === "Geom3D_" && cfg.hasCover !== false) {
        role = { type: "comp", compId: "podlozka_2", nodeName: "podlozka_2" };
      }
      if (role && role.type === "soil") {
        node.visible = cfg.hasCover === false;
        node.material = makeFillMaterial(cfg);
        node.userData.skipAutoTexture = true;
        node.castShadow = false;
        node.receiveShadow = true;
        return;
      }
      if (role && role.type === "window") {
        node.visible = cfg.hasWindow !== false;
        const matName = (node.material && (node.material.name || "")).toLowerCase();
        const vertCount = node.geometry && node.geometry.attributes.position ? node.geometry.attributes.position.count : 0;
        const isGlass = matName.indexOf("sree") >= 0 || vertCount <= 8;
        if (!isGlass && node.material && cfg.windowFrame === "cerna") {
          const frameMat = node.material.clone();
          frameMat.color = new THREE.Color(0);
          if ("metalness" in frameMat) frameMat.metalness = 0.15;
          if ("roughness" in frameMat) frameMat.roughness = 0.62;
          if ("envMapIntensity" in frameMat) frameMat.envMapIntensity = 0.25;
          if ("clearcoat" in frameMat) frameMat.clearcoat = 0;
          frameMat.map = null;
          frameMat.needsUpdate = true;
          node.material = frameMat;
          node.userData.skipAutoTexture = true;
        }
        return;
      }
      if (role && role.type === "comp") {
        if (role.nodeName === "podlozka_2" && cfg.hasSokl && !node.userData.sourcePreserveMaterial) {
          role = { ...role, compId: "sokl" };
        }
        const sourceMaterialRole = ["jednohrob-premium-20261003", "dvojhrob-premium-20261005", "dvojhrob-exclusive-20261005"].includes((_b2 = sourceScene.userData) == null ? void 0 : _b2.sourceModel) ? node.userData.sourceMaterialRole : null;
        const preserveSourceMaterial = ["dvojhrob-premium-20261005", "dvojhrob-exclusive-20261005"].includes((_c2 = sourceScene.userData) == null ? void 0 : _c2.sourceModel) && node.userData.sourcePreserveMaterial && (role.compId === "zaklad" || node.userData.sourceUnpaintedBackFace || node.userData.sourceMaterialId === ((_d2 = cfg.materials) == null ? void 0 : _d2[sourceMaterialRole || role.compId]));
        const material = preserveSourceMaterial ? node.material.clone() : getCompMat(cfg, sourceMaterialRole || role.compId);
        if (preserveSourceMaterial) material.userData.materialId = node.userData.sourceMaterialId;
        if (["dvojhrob-premium-20261005", "dvojhrob-exclusive-20261005"].includes((_e2 = sourceScene.userData) == null ? void 0 : _e2.sourceModel)) node.userData.skipAutoTexture = !!preserveSourceMaterial;
        tagComponentMesh(node, role.compId, material);
        if (material.map) ensureBoxUVs(node, role.compId, material.userData && material.userData.materialId);
        node.material = material;
        if (!node.userData.headstonePartId) addOutline(node);
        node.castShadow = true;
        node.receiveShadow = true;
      }
      if (role && role.type === "acc") {
        const show = cfg.accessories && cfg.accessories[role.accId];
        node.visible = !!show;
        if (["urnovy-classic-20261002", "jednohrob-classic-20261003"].includes((_f2 = sourceScene.userData) == null ? void 0 : _f2.sourceModel)) {
          node.userData.sourceAccessory = true;
        }
      }
    });
    for (const [nodeName, accId] of Object.entries(NODE_ACCESSORIES)) {
      const n = getNamedNode(nodeName);
      if (n) n.visible = !!(cfg.accessories && cfg.accessories[accId]);
    }
    if (cfg.accessories && cfg.accessories.vase) {
      const vaseNode = getNamedNode("vaza");
      if (vaseNode) applyAccessoryStyle(vaseNode, group, cfg, "vase");
    }
    if (cfg.accessories && cfg.accessories.lantern) {
      const lanternNode = getNamedNode("lampa");
      if (lanternNode) applyAccessoryStyle(lanternNode, group, cfg, "lantern");
    }
    setNamedVisibility(cfg.hasCover !== false, "kryci_deska", "krycidesky", "predlozka", "stredovka");
    setNamedVisibility(cfg.hasCover === false, "hlina");
    setNamedVisibility(cfg.hasSokl !== false, "sokl");
    setNamedVisibility(cfg.hasWindow !== false, "okno", "okno_1");
    group.add(clone);
    if (["urnovy-premium-20261002", "urnovy-exclusive-20261002", "jednohrob-premium-20261003", "jednohrob-exclusive-20261003", "jednohrob-exclusive-20261005", "dvojhrob-exclusive-20261005"].includes((_a = sourceScene.userData) == null ? void 0 : _a.sourceModel)) {
      graftDvojhrobAccessories(group, cfg, getNamedNode);
    }
    if (cfg.type === "dvojhrob" && cfg.hasSokl === false && cfg.accessories && (cfg.accessories.vase || cfg.accessories.lantern) && (!getNamedNode("vaza") || !getNamedNode("lampa"))) {
      graftDvojhrobAccessories(group, cfg, getNamedNode);
    }
    const preserveSourceFill = ((_b = sourceScene.userData) == null ? void 0 : _b.sourceModel) === "dvojhrob-standard-20261005" && getNamedNode("hlina");
    if (cfg.hasCover === false && cfg.fillType === "gravel" && !preserveSourceFill) {
      const originalFill = getNamedNode("hlina");
      if (originalFill) originalFill.visible = false;
      addGardenFillToGLB(group, namedNodes, cfg);
    } else if (cfg.hasCover === false && !getNamedNode("hlina")) {
      addGardenFillToGLB(group, namedNodes, cfg);
    }
    const deskaNode = getNamedNode("napisova_deska") || namedNodes["Geom3D_napisova_deska"];
    if (deskaNode) {
      const deskaBox = new THREE.Box3();
      deskaNode.traverse((c) => {
        if (c.isMesh) {
          c.updateWorldMatrix(true, false);
          deskaBox.union(new THREE.Box3().setFromObject(c));
        }
      });
      if (cfg.type === "dvojhrob" && !["dvojhrob-standard-20261005", "dvojhrob-classic-20261005", "dvojhrob-premium-20261005", "dvojhrob-exclusive-20261005"].includes((_c = sourceScene.userData) == null ? void 0 : _c.sourceModel) && !deskaBox.isEmpty()) {
        const cx = (deskaBox.min.x + deskaBox.max.x) / 2;
        deskaBox.min.x = cx - 0.6;
        deskaBox.max.x = cx + 0.6;
      }
      const preserveImportedShape = ((_d = sourceScene.userData) == null ? void 0 : _d.sourceModel) === "dvojhrob-exclusive-20261005" && cfg.shape === "dvoj-sloupek" || ((_e = sourceScene.userData) == null ? void 0 : _e.sourceModel) === "dvojhrob-premium-20261005" && cfg.shape === "dvoj-sloupek" || ((_f = sourceScene.userData) == null ? void 0 : _f.sourceModel) === "jednohrob-exclusive-20261005" && cfg.shape === "deleny-kriz" || ((_g = sourceScene.userData) == null ? void 0 : _g.sourceModel) === "jednohrob-premium-20261003" && cfg.shape === "atyp-05" || ["urnovy-standard-20261002", "jednohrob-standard-20261003", "dvojhrob-standard-20261005"].includes((_h = sourceScene.userData) == null ? void 0 : _h.sourceModel) && cfg.shape === "rovny" || ["urnovy-classic-20261002", "urnovy-premium-20261002", "jednohrob-classic-20261003", "dvojhrob-classic-20261005"].includes((_i = sourceScene.userData) == null ? void 0 : _i.sourceModel) && cfg.shape === "vlna-sikma";
      const sourceDesign = preserveImportedShape ? null : sourceHeadstoneDesign(cfg);
      if (sourceDesign && !deskaBox.isEmpty()) {
        fitSourceHeadstoneBox(deskaBox, sourceDesign);
      }
      if (!preserveImportedShape) {
        reshapeDeska(group, deskaNode, cfg, deskaBox);
      }
      addHonedDetailToGLB(group, cfg, deskaBox);
      addInscriptionToGLB(group, cfg, deskaBox);
    }
    finishTexturedStoneMeshes(group);
    return group;
  }
  function addGardenFillToGLB(group, namedNodes, cfg) {
    const refNode = namedNodes.kryci_deska || namedNodes.ram || namedNodes.zaklad;
    if (!refNode) return;
    const wasVisible = refNode.visible;
    refNode.visible = true;
    const box = new THREE.Box3().setFromObject(refNode);
    refNode.visible = wasVisible;
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const insetX = size.x * 0.08;
    const insetZ = size.z * 0.08;
    const w = Math.max(0.1, size.x - insetX * 2);
    const d = Math.max(0.1, size.z - insetZ * 2);
    const geo = new THREE.PlaneGeometry(w, d);
    const soil = new THREE.Mesh(geo, makeFillMaterial(cfg));
    soil.rotation.x = -Math.PI / 2;
    soil.position.set(center.x, box.max.y + 0.012, center.z);
    soil.userData.skipAutoTexture = true;
    soil.receiveShadow = true;
    group.add(soil);
  }
  function fitFontSize(ctx, text, weight, family, maxWidth, basePx, minPx) {
    let size = basePx;
    ctx.font = `${weight} ${size}px ${family}`;
    while (size > minPx && ctx.measureText(text).width > maxWidth) {
      size -= 2;
      ctx.font = `${weight} ${size}px ${family}`;
    }
    return size;
  }
  let inscriptionStoneLuma = 0;
  function inscriptionContourStrength() {
    return Math.max(0, Math.min(1, (inscriptionStoneLuma - 0.22) / 0.12));
  }
  function hexLuma(hex) {
    const h = String(hex || "").replace("#", "");
    if (h.length < 6) return 0;
    const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }
  function paintInscriptionLine(ctx, text, x, y, weight, fontPx, family, textColorId) {
    if (!text) return;
    ctx.font = `${weight} ${fontPx}px ${family}`;
    const isMetallic = textColorId === "zlata" || textColorId === "stribrna";
    if (isMetallic) {
      if (textColorId === "zlata") {
        const ascent2 = fontPx * 0.78;
        const descent2 = fontPx * 0.22;
        const goldContour = inscriptionContourStrength();
        if (goldContour > 0.02) {
          ctx.save();
          ctx.lineJoin = "round";
          ctx.miterLimit = 2;
          ctx.shadowColor = "rgba(0,0,0," + (0.5 * goldContour).toFixed(3) + ")";
          ctx.shadowBlur = Math.max(2, fontPx * 0.05);
          ctx.lineWidth = Math.max(2.4, fontPx * 0.075);
          ctx.strokeStyle = "rgba(12,9,5," + (0.92 * goldContour).toFixed(3) + ")";
          ctx.strokeText(text, x, y);
          ctx.restore();
        }
        ctx.save();
        ctx.lineJoin = "round";
        ctx.miterLimit = 2;
        ctx.shadowColor = "rgba(20,12,3,0.72)";
        ctx.shadowBlur = Math.max(1.2, fontPx * 0.018);
        ctx.shadowOffsetX = Math.max(0.7, fontPx * 0.012);
        ctx.shadowOffsetY = Math.max(1.1, fontPx * 0.022);
        ctx.lineWidth = Math.max(1.3, fontPx * 0.038);
        ctx.strokeStyle = "rgba(38,22,5,0.72)";
        ctx.strokeText(text, x, y);
        ctx.restore();
        ctx.save();
        ctx.lineJoin = "round";
        ctx.miterLimit = 2;
        ctx.lineWidth = Math.max(0.8, fontPx * 0.018);
        ctx.strokeStyle = "rgba(132,82,17,0.78)";
        ctx.strokeText(text, x, y);
        ctx.restore();
        const grad2 = ctx.createLinearGradient(0, y - ascent2, 0, y + descent2);
        grad2.addColorStop(0, "#fff3bd");
        grad2.addColorStop(0.18, "#f8d877");
        grad2.addColorStop(0.42, "#e5b447");
        grad2.addColorStop(0.64, "#c88925");
        grad2.addColorStop(0.82, "#ffe092");
        grad2.addColorStop(1, "#9f6419");
        ctx.save();
        ctx.shadowColor = "rgba(255,221,124,0.18)";
        ctx.shadowBlur = Math.max(0.6, fontPx * 8e-3);
        ctx.fillStyle = grad2;
        ctx.fillText(text, x, y);
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = 0.58;
        ctx.fillStyle = "#fff8d5";
        ctx.fillText(text, x - Math.max(0.45, fontPx * 6e-3), y - Math.max(0.9, fontPx * 0.017));
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = "#5d3508";
        ctx.fillText(text, x + Math.max(0.35, fontPx * 5e-3), y + Math.max(0.6, fontPx * 0.011));
        ctx.restore();
        return;
      }
      const silverContour = inscriptionContourStrength();
      if (silverContour > 0.02) {
        ctx.save();
        ctx.lineJoin = "round";
        ctx.miterLimit = 2;
        ctx.shadowColor = "rgba(0,0,0," + (0.5 * silverContour).toFixed(3) + ")";
        ctx.shadowBlur = Math.max(2, fontPx * 0.05);
        ctx.lineWidth = Math.max(2.4, fontPx * 0.075);
        ctx.strokeStyle = "rgba(8,9,11," + (0.92 * silverContour).toFixed(3) + ")";
        ctx.strokeText(text, x, y);
        ctx.restore();
      }
      ctx.save();
      ctx.fillStyle = "rgba(24,27,31,0.38)";
      ctx.shadowColor = "rgba(10,12,16,0.42)";
      ctx.shadowBlur = Math.max(2, fontPx * 0.035);
      ctx.shadowOffsetX = Math.max(0.5, fontPx * 8e-3);
      ctx.shadowOffsetY = Math.max(1, fontPx * 0.018);
      ctx.fillText(text, x, y);
      ctx.restore();
      ctx.save();
      ctx.lineWidth = Math.max(0.7, fontPx * 0.012);
      ctx.strokeStyle = "rgba(36,40,46,0.36)";
      ctx.strokeText(text, x, y);
      ctx.restore();
      const ascent = fontPx * 0.78;
      const descent = fontPx * 0.22;
      const grad = ctx.createLinearGradient(0, y - ascent, 0, y + descent);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.24, "#f3f7fb");
      grad.addColorStop(0.54, "#d6dde5");
      grad.addColorStop(0.78, "#a7b0ba");
      grad.addColorStop(1, "#f8fbff");
      ctx.fillStyle = grad;
      ctx.fillText(text, x, y);
      ctx.save();
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = "#ffffff";
      ctx.fillText(text, x - Math.max(0.5, fontPx * 6e-3), y - Math.max(1, fontPx * 0.018));
      ctx.restore();
    } else {
      const dark = textColorId === "vyryto-tmava";
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.4)";
      ctx.shadowBlur = Math.max(3, fontPx * 0.04);
      ctx.shadowOffsetX = Math.max(1, fontPx * 0.012);
      ctx.shadowOffsetY = Math.max(1, fontPx * 0.018);
      ctx.fillStyle = dark ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.55)";
      ctx.fillText(text, x, y);
      ctx.restore();
      ctx.fillStyle = dark ? "#0e0d0c" : "#f6f3ed";
      ctx.fillText(text, x, y);
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = dark ? "#5a544a" : "#1a1815";
      ctx.fillText(text, x - 0.6, y - 0.6);
      ctx.restore();
    }
  }
  function dateTextSegments(text, weight, fontPx, family) {
    const symbolFamily = "Georgia, 'Times New Roman', serif";
    const symbolPx = Math.round(fontPx * 0.86);
    return String(text || "").split(/([*†])/g).filter(Boolean).map((part) => ({
      text: part,
      weight,
      fontPx: part === "*" || part === "\u2020" ? symbolPx : fontPx,
      family: part === "*" || part === "\u2020" ? symbolFamily : family,
      isSymbol: part === "*" || part === "\u2020"
    }));
  }
  function measureDateText(ctx, text, weight, fontPx, family) {
    return dateTextSegments(text, weight, fontPx, family).reduce((width, part) => {
      ctx.font = `${part.weight} ${part.fontPx}px ${part.family}`;
      return width + ctx.measureText(part.text).width;
    }, 0);
  }
  function paintDateLine(ctx, text, x, y, weight, fontPx, family, textColorId) {
    if (!text) return;
    const segments = dateTextSegments(text, weight, fontPx, family);
    const totalW = measureDateText(ctx, text, weight, fontPx, family);
    let cursorX = x - totalW / 2;
    ctx.save();
    ctx.textAlign = "left";
    segments.forEach((part) => {
      ctx.font = `${part.weight} ${part.fontPx}px ${part.family}`;
      const w = ctx.measureText(part.text).width;
      const symbolY = part.isSymbol ? y + fontPx * 0.035 : y;
      paintInscriptionLine(ctx, part.text, cursorX, symbolY, part.weight, part.fontPx, part.family, textColorId);
      cursorX += w;
    });
    ctx.restore();
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
  function drawPhotoPlaceholder(ctx, x, y, w, h) {
    ctx.save();
    const radius = Math.min(w, h) * 0.08;
    const border = Math.max(2, Math.min(w, h) * 0.035);
    ctx.fillStyle = "rgba(40, 32, 22, 0.85)";
    roundRect(ctx, x - border, y - border, w + 2 * border, h + 2 * border, radius + border * 0.6);
    ctx.fill();
    ctx.fillStyle = "rgba(238, 228, 208, 0.95)";
    roundRect(ctx, x, y, w, h, radius);
    ctx.fill();
    ctx.fillStyle = "rgba(95, 80, 65, 0.32)";
    const cx = x + w / 2;
    const headY = y + h * 0.34;
    const headR = w * 0.2;
    ctx.beginPath();
    ctx.arc(cx, headY, headR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx, y + h * 1.02, w * 0.46, h * 0.55, 0, Math.PI, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = "rgba(80, 65, 50, 0.5)";
    ctx.font = `600 ${Math.round(w * 0.1)}px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("7 \xD7 9 cm", cx, y + h - Math.round(h * 0.04));
    ctx.restore();
  }
  function drawLeftOrnament(ctx, x, top, height, tint, src) {
    const roseAsset = loadImageAsset(src || "assets/rose-engraving-white.png");
    if (roseAsset.loaded && roseAsset.image) {
      const img = roseAsset.image;
      const frame = sourceOrnamentFrame(img, src);
      const aspect = frame.w / frame.h;
      const drawH = height;
      const drawW = drawH * aspect;
      const dx = x - drawW / 2;
      const dy = top;
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.filter = "brightness(0)";
      ctx.drawImage(img, frame.x, frame.y, frame.w, frame.h, dx + Math.max(0.8, drawW * 4e-3), dy + Math.max(0.8, drawH * 3e-3), drawW, drawH);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.96;
      ctx.drawImage(img, frame.x, frame.y, frame.w, frame.h, dx, dy, drawW, drawH);
      ctx.restore();
      return;
    }
    ctx.save();
    ctx.translate(x, top);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const h = height;
    const line = Math.max(1.8, h * 95e-4);
    const carve = "rgba(18,18,16,0.56)";
    const main = tint || "rgba(248,246,240,0.9)";
    const highlight = "rgba(255,255,255,0.78)";
    const soft = "rgba(236,232,222,0.64)";
    const drawStemPath = () => {
      ctx.beginPath();
      ctx.moveTo(-h * 0.015, h * 0.05);
      ctx.bezierCurveTo(h * 0.035, h * 0.21, -h * 0.045, h * 0.42, h * 0.018, h * 0.61);
      ctx.bezierCurveTo(h * 0.06, h * 0.75, -h * 0.035, h * 0.88, h * 0.035, h * 0.99);
      ctx.stroke();
    };
    ctx.shadowColor = "rgba(0,0,0,0.26)";
    ctx.shadowBlur = Math.max(1.2, h * 6e-3);
    ctx.shadowOffsetX = Math.max(0.4, h * 3e-3);
    ctx.shadowOffsetY = Math.max(0.8, h * 5e-3);
    ctx.globalAlpha = 0.72;
    ctx.lineWidth = line * 2.1;
    ctx.strokeStyle = carve;
    drawStemPath();
    ctx.shadowColor = "transparent";
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = line;
    ctx.strokeStyle = main;
    drawStemPath();
    ctx.globalAlpha = 0.38;
    ctx.lineWidth = Math.max(0.8, line * 0.38);
    ctx.strokeStyle = highlight;
    ctx.translate(-line * 0.28, -line * 0.18);
    drawStemPath();
    ctx.translate(line * 0.28, line * 0.18);
    const strokeShape = (draw, width = line, stroke = main, alpha = 0.9) => {
      ctx.save();
      ctx.globalAlpha = alpha * 0.68;
      ctx.lineWidth = width * 2.4;
      ctx.strokeStyle = carve;
      draw();
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.lineWidth = width;
      ctx.strokeStyle = stroke;
      draw();
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = alpha * 0.36;
      ctx.lineWidth = Math.max(0.65, width * 0.36);
      ctx.strokeStyle = highlight;
      ctx.translate(-width * 0.3, -width * 0.22);
      draw();
      ctx.stroke();
      ctx.restore();
    };
    const leaf = (cx, cy, sx, sy, flip) => {
      strokeShape(() => {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.bezierCurveTo(cx + sx * 0.35 * flip, cy - sy * 0.95, cx + sx * 1.35 * flip, cy - sy * 1.05, cx + sx * 1.82 * flip, cy - sy * 0.08);
        ctx.bezierCurveTo(cx + sx * 1.18 * flip, cy + sy * 0.78, cx + sx * 0.22 * flip, cy + sy * 0.64, cx, cy);
      }, line * 0.86, soft, 0.86);
      strokeShape(() => {
        ctx.beginPath();
        ctx.moveTo(cx + sx * 0.1 * flip, cy - sy * 0.02);
        ctx.lineTo(cx + sx * 1.35 * flip, cy - sy * 0.08);
        ctx.moveTo(cx + sx * 0.55 * flip, cy - sy * 0.05);
        ctx.lineTo(cx + sx * 0.88 * flip, cy - sy * 0.36);
        ctx.moveTo(cx + sx * 0.78 * flip, cy - sy * 0.04);
        ctx.lineTo(cx + sx * 1.05 * flip, cy + sy * 0.26);
      }, line * 0.48, highlight, 0.62);
    };
    const rose = (cx, cy, r, rotation = 0) => {
      const petal = (angle, scaleX, scaleY, offset) => {
        strokeShape(() => {
          ctx.beginPath();
          const px = cx + Math.cos(angle) * r * offset;
          const py = cy + Math.sin(angle) * r * offset;
          ctx.ellipse(px, py, r * scaleX, r * scaleY, angle + rotation, 0, Math.PI * 2);
        }, line * 0.72, main, 0.92);
      };
      for (let i = 0; i < 7; i++) {
        const a = rotation + i * (Math.PI * 2 / 7);
        petal(a, i % 2 ? 0.34 : 0.42, i % 2 ? 0.18 : 0.22, 0.28);
      }
      strokeShape(() => {
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2);
        ctx.moveTo(cx - r * 0.15, cy + r * 0.03);
        ctx.bezierCurveTo(cx - r * 0.02, cy - r * 0.16, cx + r * 0.16, cy - r * 0.02, cx + r * 0.04, cy + r * 0.14);
      }, line * 0.62, highlight, 0.75);
    };
    const bud = (cx, cy, r, flip) => {
      strokeShape(() => {
        ctx.beginPath();
        ctx.moveTo(cx, cy + r * 0.75);
        ctx.bezierCurveTo(cx - r * 0.92 * flip, cy + r * 0.18, cx - r * 0.52 * flip, cy - r * 0.92, cx, cy - r * 1.05);
        ctx.bezierCurveTo(cx + r * 0.78 * flip, cy - r * 0.64, cx + r * 0.62 * flip, cy + r * 0.28, cx, cy + r * 0.75);
      }, line * 0.76, main, 0.86);
      strokeShape(() => {
        ctx.beginPath();
        ctx.moveTo(cx, cy + r * 0.42);
        ctx.bezierCurveTo(cx - r * 0.22 * flip, cy - r * 0.12, cx - r * 0.1 * flip, cy - r * 0.58, cx + r * 0.12 * flip, cy - r * 0.85);
      }, line * 0.48, highlight, 0.58);
    };
    leaf(h * 5e-3, h * 0.23, h * 0.07, h * 0.06, -1);
    leaf(-h * 0.01, h * 0.39, h * 0.082, h * 0.068, 1);
    leaf(h * 5e-3, h * 0.54, h * 0.074, h * 0.06, -1);
    leaf(h * 0.01, h * 0.71, h * 0.082, h * 0.07, 1);
    bud(h * 0.018, h * 0.16, h * 0.055, 1);
    rose(-h * 0.025, h * 0.58, h * 0.078, -0.25);
    rose(h * 0.025, h * 0.74, h * 0.068, 0.28);
    strokeShape(() => {
      ctx.beginPath();
      ctx.moveTo(h * 0.015, h * 0.87);
      ctx.lineTo(-h * 0.085, h * 1);
      ctx.moveTo(h * 0.015, h * 0.87);
      ctx.lineTo(h * 0.085, h * 0.985);
    }, line * 0.74, soft, 0.68);
    ctx.restore();
  }
  function drawLeftCross(ctx, x, top, height, textColorId) {
    ctx.save();
    ctx.translate(x, top);
    ctx.lineCap = "butt";
    ctx.lineJoin = "round";
    const h = height;
    const w = h * 0.18;
    const mainX = 0;
    const topY = h * 0.08;
    const bottomY = h * 0.92;
    const armY = h * 0.28;
    const baseLine = Math.max(2, h * 0.012);
    const darkStroke = textColorId === "zlata" ? "rgba(38,22,5,0.72)" : textColorId === "stribrna" ? "rgba(25,28,32,0.58)" : textColorId === "vyryto-tmava" ? "rgba(0,0,0,0.62)" : "rgba(255,255,255,0.74)";
    const draw = () => {
      ctx.beginPath();
      ctx.moveTo(mainX, topY);
      ctx.lineTo(mainX, bottomY);
      ctx.moveTo(-w, armY);
      ctx.lineTo(w, armY);
      ctx.stroke();
    };
    ctx.globalAlpha = 0.86;
    ctx.shadowColor = "rgba(0,0,0,0.26)";
    ctx.shadowBlur = Math.max(1.2, h * 7e-3);
    ctx.shadowOffsetX = Math.max(0.6, h * 4e-3);
    ctx.shadowOffsetY = Math.max(1, h * 6e-3);
    ctx.lineWidth = baseLine * 1.55;
    ctx.strokeStyle = darkStroke;
    draw();
    ctx.shadowColor = "transparent";
    const grad = ctx.createLinearGradient(0, topY, 0, bottomY);
    if (textColorId === "zlata") {
      grad.addColorStop(0, "#fff3bd");
      grad.addColorStop(0.34, "#e5b447");
      grad.addColorStop(0.68, "#b7771f");
      grad.addColorStop(1, "#ffe092");
    } else if (textColorId === "stribrna") {
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.38, "#d7dde5");
      grad.addColorStop(0.7, "#9da6b0");
      grad.addColorStop(1, "#f8fbff");
    } else if (textColorId === "vyryto-tmava") {
      grad.addColorStop(0, "#24211d");
      grad.addColorStop(1, "#090807");
    } else {
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(1, "#e8e2d7");
    }
    ctx.lineWidth = baseLine;
    ctx.strokeStyle = grad;
    draw();
    ctx.globalAlpha = 0.32;
    ctx.lineWidth = Math.max(1, baseLine * 0.34);
    ctx.strokeStyle = textColorId === "vyryto-tmava" ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.72)";
    ctx.translate(-baseLine * 0.22, -baseLine * 0.25);
    draw();
    ctx.restore();
  }
  function sourceHeadstoneDesign(cfg) {
    const imported = typeof window.getImportedHeadstoneDesign === "function" && window.getImportedHeadstoneDesign(cfg.sourceModel, cfg.shape);
    if (imported) return imported;
    if (["urnovy-classic-20261002", "urnovy-premium-20261002", "jednohrob-classic-20261003"].includes(cfg.sourceModel) && cfg.shape === "vlna-sikma") return null;
    const design = typeof window.getHeadstoneDesign === "function" && window.getHeadstoneDesign(cfg.shape, cfg.type);
    if (!design || !(design.widthMm > 0) || !(design.heightMm > 0) || !Array.isArray(design.parts)) return null;
    if (!design.parts.length || !design.parts.every((p) => p.id && Array.isArray(p.points) && p.points.length >= 3 && p.points.every((xy) => xy.length === 2 && xy.every(Number.isFinite)))) return null;
    return design;
  }
  function sourcePartBounds(part) {
    return part.points.reduce(
      (b, p) => ({
        minX: Math.min(b.minX, p[0]),
        maxX: Math.max(b.maxX, p[0]),
        minY: Math.min(b.minY, p[1]),
        maxY: Math.max(b.maxY, p[1])
      }),
      { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
    );
  }
  function sourcePartMaterialId(cfg, design, part) {
    var _a, _b, _c;
    if (part.materialComponentId) return ((_a = cfg.materials) == null ? void 0 : _a[part.materialComponentId]) || ((_b = cfg.materials) == null ? void 0 : _b.napisova_deska);
    return part.role === "backing" && design.parts.some((p) => p.role === "pillar") ? "viscont" : (_c = cfg.materials) == null ? void 0 : _c.napisova_deska;
  }
  function fitSourceHeadstoneBox(box, design) {
    const cx = (box.min.x + box.max.x) / 2;
    const width = (box.max.x - box.min.x) * (design.fitWidthScale || 1);
    box.min.x = cx - width / 2;
    box.max.x = cx + width / 2;
    box.max.y = box.min.y + width * design.heightMm / design.widthMm;
    return box;
  }
  function sourcePartShape(part, w, h) {
    const shape = new THREE.Shape();
    part.points.forEach(([x, y], i) => shape[i ? "lineTo" : "moveTo"]((x - 0.5) * w, (1 - y) * h));
    shape.closePath();
    return shape;
  }
  function sourceIntervalsAtY(part, y) {
    const crossings = [];
    const points = part.points;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const a = points[j], b = points[i];
      if (a[1] <= y && b[1] > y || b[1] <= y && a[1] > y) {
        crossings.push(a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
      }
    }
    crossings.sort((a, b) => a - b);
    const intervals = [];
    for (let i = 0; i + 1 < crossings.length; i += 2) intervals.push([crossings[i], crossings[i + 1]]);
    return intervals;
  }
  function sourceIntersectIntervals(a, b) {
    return a.flatMap((left) => b.map((right) => [Math.max(left[0], right[0]), Math.min(left[1], right[1])]).filter(([lo, hi]) => hi > lo));
  }
  function sourceSubtractIntervals(intervals, blockers) {
    return blockers.reduce((remaining, [lo, hi]) => remaining.flatMap(([a, b]) => {
      if (hi <= a || lo >= b) return [[a, b]];
      return [[a, Math.min(b, lo)], [Math.max(a, hi), b]].filter(([x, y]) => y > x);
    }), intervals);
  }
  function sourceFrontParts(design, part) {
    return design.parts.filter((p) => p !== part && (p.frontOffsetMm || 0) > (part.frontOffsetMm || 0) + 0.01);
  }
  function sourcePartBand(design, part, y0, y1, options = {}) {
    if (!(y1 > y0)) return null;
    const inset = options.insetX || 0;
    const blockers = sourceFrontParts(design, part);
    const ys = [y0, y1, (y0 + y1) / 2];
    [part, ...blockers].forEach((p) => p.points.forEach((xy) => {
      if (xy[1] > y0 && xy[1] < y1) ys.push(Math.max(y0, xy[1] - 1e-8), Math.min(y1, xy[1] + 1e-8));
    }));
    let available = [[options.minX == null ? 0 : options.minX, options.maxX == null ? 1 : options.maxX]];
    for (const y of ys) {
      let spans = sourceIntervalsAtY(part, y).map(([a, b]) => [a + inset, b - inset]).filter(([a, b]) => b > a);
      blockers.forEach((blocker) => {
        spans = sourceSubtractIntervals(spans, sourceIntervalsAtY(blocker, y).map(([a, b]) => [a - inset, b + inset]));
      });
      available = sourceIntersectIntervals(available, spans);
      if (!available.length) return null;
    }
    const exclusions = (options.obstacles || []).filter((box) => box.minY < y1 && box.maxY > y0).map((box) => [box.minX - inset, box.maxX + inset]);
    if (options.engraving) exclusions.push(...sourceEngravingExclusions(options.engraving, y0, y1, inset));
    available = sourceSubtractIntervals(available, exclusions);
    if (!available.length) return null;
    const desired = options.desiredX == null ? 0.5 : options.desiredX;
    available.sort((a, b) => {
      const distance = (v) => Math.max(v[0] - desired, desired - v[1], 0);
      return distance(a) - distance(b) || b[1] - b[0] - (a[1] - a[0]);
    });
    const bands = available.map(([minX, maxX]) => ({ minX, maxX }));
    return options.all ? bands : bands[0];
  }
  function sourcePersonEntries(inscription, photoRows, upper, reservedRows = []) {
    const names = String(inscription.name || "").split(/\r?\n/);
    const dates = String(inscription.dates || "").split(/\r?\n/);
    return Array.from({ length: Math.max(names.length, dates.length, (photoRows || []).length, reservedRows.length) }, (_, i) => ({
      name: upper((names[i] || "").trim()),
      dates: upper((dates[i] || "").trim()),
      photo: !!(photoRows && photoRows[i]),
      reserved: reservedRows[i] === true,
      index: i
    })).filter((p) => p.name || p.dates || p.photo || p.reserved);
  }
  function sourceCanvasPath(ctx, part, cw, ch) {
    ctx.beginPath();
    part.points.forEach(([x, y], i) => ctx[i ? "lineTo" : "moveTo"](x * cw, y * ch));
    ctx.closePath();
  }
  function maskSourceCanvas(ctx, design, part, cw, ch) {
    ctx.save();
    ctx.globalCompositeOperation = "destination-in";
    ctx.fillStyle = "#fff";
    sourceCanvasPath(ctx, part, cw, ch);
    ctx.fill();
    ctx.globalCompositeOperation = "destination-out";
    sourceFrontParts(design, part).forEach((front) => {
      sourceCanvasPath(ctx, front, cw, ch);
      ctx.fill();
    });
    ctx.restore();
  }
  function sourceOrnamentFrame(image, src) {
    const w = image.naturalWidth || image.width || 1, h = image.naturalHeight || image.height || 1;
    if (!src || /(?:^|\/)rose-engraving-white\.png$/.test(src))
      return { x: w * 190 / 887, y: h * 111 / 1774, w: w * 491 / 887, h: h * 1558 / 1774 };
    return { x: 0, y: 0, w, h };
  }
  const inscriptionInkCache = /* @__PURE__ */ new WeakMap();
  function sourceInkProfile(data, width, height) {
    const rows = [];
    for (let y = 0; y < height; y++) {
      const spans = [];
      let start = -1;
      for (let x = 0; x <= width; x++) {
        const occupied = x < width && data[(y * width + x) * 4 + 3] > 40;
        if (occupied && start < 0) start = x;
        if (!occupied && start >= 0) {
          spans.push([start / width, x / width]);
          start = -1;
        }
      }
      rows.push(spans);
    }
    return rows;
  }
  function sourceOrnamentInkProfile(src) {
    const asset = loadImageAsset(src);
    if (!asset.loaded || !asset.image) return null;
    if (inscriptionInkCache.has(asset.image)) return inscriptionInkCache.get(asset.image);
    const cv = document.createElement("canvas");
    cv.width = 256;
    cv.height = 512;
    const ctx = cv.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(asset.image, 0, 0, cv.width, cv.height);
    const rows = sourceInkProfile(ctx.getImageData(0, 0, cv.width, cv.height).data, cv.width, cv.height);
    inscriptionInkCache.set(asset.image, rows);
    return rows;
  }
  function sourceEngravingExclusions(art, y0, y1, inset) {
    if (!art.rows || y1 <= art.minY || y0 >= art.maxY) return [];
    const first = Math.max(0, Math.floor((y0 - art.minY) / (art.maxY - art.minY) * art.rows.length));
    const last = Math.min(art.rows.length - 1, Math.floor((y1 - art.minY) / (art.maxY - art.minY) * art.rows.length));
    const spans = art.rows.slice(first, last + 1).flat().map(([a, b]) => [art.minX + a * (art.maxX - art.minX) - inset, art.minX + b * (art.maxX - art.minX) + inset]);
    spans.sort((a, b) => a[0] - b[0]);
    const merged = [];
    spans.forEach((span) => {
      const previous = merged[merged.length - 1];
      if (previous && span[0] <= previous[1]) previous[1] = Math.max(previous[1], span[1]);
      else merged.push(span);
    });
    return merged;
  }
  function sourceFitLine(ctx, text, baseline, basePx, font, isDate, design, part, region, cw, ch, insetX, insetY) {
    let px = basePx;
    for (let attempt = 0; attempt < 45 && px > 1; attempt++, px *= 0.9) {
      ctx.font = `${font.weight} ${px}px ${font.family}`;
      const metrics = ctx.measureText(text);
      const ascent = Math.max(px * 0.86, metrics.actualBoundingBoxAscent || 0);
      const descent = Math.max(px * 0.2, metrics.actualBoundingBoxDescent || 0);
      const band = sourcePartBand(
        design,
        part,
        baseline - ascent / ch - insetY,
        baseline + descent / ch + insetY,
        { ...region, insetX }
      );
      if (!band) continue;
      const width = isDate ? measureDateText(ctx, text, font.weight, px, font.family) : Math.max(
        metrics.width,
        (metrics.actualBoundingBoxLeft || 0) + (metrics.actualBoundingBoxRight || 0)
      );
      const visualWidth = width + px * 0.16;
      if (visualWidth <= (band.maxX - band.minX) * cw) {
        const half = visualWidth / cw / 2;
        const desiredX = region.desiredX == null ? (band.minX + band.maxX) / 2 : region.desiredX;
        return { px, x: Math.max(band.minX + half, Math.min(band.maxX - half, desiredX)) * cw, y: baseline * ch };
      }
    }
    return null;
  }
  function alignInscriptionColumn(ctx, lines, preferredX, font, design, part, cw, ch, insetX, insetY) {
    const candidates = lines.filter((line) => line.align !== false).map((line) => {
      ctx.font = `${font.weight} ${line.px}px ${font.family}`;
      const metrics = ctx.measureText(line.text);
      const ascent = Math.max(line.px * 0.86, metrics.actualBoundingBoxAscent || 0);
      const descent = Math.max(line.px * 0.2, metrics.actualBoundingBoxDescent || 0);
      const bands = sourcePartBand(
        design,
        part,
        (line.y - ascent) / ch - insetY,
        (line.y + descent) / ch + insetY,
        { ...line.region.centeringRegion || line.region, insetX, all: true }
      ) || [];
      const width = line.date ? measureDateText(ctx, line.text, font.weight, line.px, font.family) : Math.max(metrics.width, (metrics.actualBoundingBoxLeft || 0) + (metrics.actualBoundingBoxRight || 0));
      const half = (width + line.px * 0.16) / cw / 2;
      const intervals = bands.map((band) => [band.minX + half, band.maxX - half]).filter(([a, b]) => a <= b);
      return { line, intervals };
    }).filter((item) => item.intervals.length);
    const primary = candidates.filter((item) => !item.line.date);
    if (!primary.length) return;
    const common = primary.reduce((remaining, item) => remaining.flatMap(([a, b]) => item.intervals.map(([lo, hi]) => [Math.max(a, lo), Math.min(b, hi)]).filter(([lo, hi]) => lo <= hi)), [[0, 1]]);
    const nearest = (intervals, target) => intervals.map(([a, b]) => Math.max(a, Math.min(b, target))).reduce((best, x) => Math.abs(x - target) < Math.abs(best - target) ? x : best);
    const axis = common.length ? nearest(common, preferredX) : preferredX;
    candidates.forEach(({ line, intervals }) => {
      line.x = nearest(intervals, axis) * cw;
    });
  }
  function sourceNameLayout(ctx, text, rowTop, rowH, targetPx, datePx, hasDates, font, design, part, region, cw, ch, insetX, insetY) {
    const baseline = rowTop + rowH * (hasDates ? 0.48 : 0.62);
    const single = sourceFitLine(ctx, text, baseline, targetPx, font, false, design, part, region, cw, ch, insetX, insetY);
    const original = { lines: single ? [{ text, ...single }] : [], dateY: rowTop + rowH * 0.81, datePx };
    const words = text.trim().split(/\s+/);
    if (words.length < 2 || single && single.px >= targetPx * 0.72) return original;
    const wrappedDateY = rowTop + rowH * 0.92;
    const wrappedDatePx = Math.min(datePx, rowH * ch * 0.18);
    const top = rowTop + rowH * 0.035;
    const bottom = hasDates ? wrappedDateY - wrappedDatePx * 1.1 / ch - rowH * 0.035 : rowTop + rowH * 0.95;
    let best = null;
    for (let split = 1; split < words.length; split++) {
      const texts = [words.slice(0, split).join(" "), words.slice(split).join(" ")];
      let px = targetPx;
      for (let attempt = 0; attempt < 12 && px > 1; attempt++) {
        ctx.font = `${font.weight} ${px}px ${font.family}`;
        const metrics = texts.map((value) => ctx.measureText(value));
        const ascent = Math.max(px * 0.86, ...metrics.map((m) => m.actualBoundingBoxAscent || 0));
        const descent = Math.max(px * 0.2, ...metrics.map((m) => m.actualBoundingBoxDescent || 0));
        const gap = px * 0.12;
        const blockH = 2 * (ascent + descent) + gap;
        const availableH = (bottom - top) * ch;
        if (blockH > availableH) {
          px *= availableH / blockH * 0.995;
          continue;
        }
        const firstY = top + ((availableH - blockH) / 2 + ascent) / ch;
        const fits = texts.map((value, i) => sourceFitLine(
          ctx,
          value,
          firstY + i * (ascent + descent + gap) / ch,
          px,
          font,
          false,
          design,
          part,
          region,
          cw,
          ch,
          insetX,
          insetY
        ));
        if (fits.some((fit) => !fit)) break;
        const sharedPx = Math.min(...fits.map((fit) => fit.px));
        if (sharedPx < px - 0.01) {
          px = sharedPx;
          continue;
        }
        const imbalance = Math.abs(metrics[0].width - metrics[1].width);
        if (!best || px > best.px + 0.01 || Math.abs(px - best.px) < 0.01 && imbalance < best.imbalance) {
          best = {
            px,
            imbalance,
            lines: texts.map((value, i) => ({ text: value, ...fits[i] })),
            dateY: wrappedDateY,
            datePx: wrappedDatePx
          };
        }
        break;
      }
    }
    return best && (!single || best.px > single.px * 1.04) ? best : original;
  }
  function sourceInscriptionGroups(design, entries, mode) {
    const plates = design.parts.filter((p) => p.role === "plate");
    const lanes = plates.length > 1 || entries.length > 1 && mode !== "stacked" ? 2 : 1;
    const groups = Array.from({ length: lanes }, () => []);
    entries.forEach((entry, i) => {
      const slot = lanes === 1 ? i : entry.index;
      groups[slot % lanes][Math.floor(slot / lanes)] = entry;
    });
    const rowCount = Math.max(1, ...groups.map((group) => group.length));
    const rowPhotos = Array.from({ length: rowCount }, (_, row) => groups.some((group) => group[row] && group[row].photo));
    return { groups, lanes, rowCount, rowPhotos };
  }
  function sourceDateLines(text) {
    const value = String(text || "").trim();
    return value ? [value] : [];
  }
  function paintSourceInscriptionCanvas(cfg, planeW, planeH, design, sourcePartId, regions) {
    var _a;
    const cv = document.createElement("canvas");
    const cw = 2048, ch = Math.max(256, Math.round(cw * planeH / planeW));
    cv.width = cw;
    cv.height = ch;
    const ctx = cv.getContext("2d");
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    const fontObj = window.FONTS.find((f) => f.id === cfg.font) || window.FONTS[0];
    const tc = window.TEXT_COLORS.find((c) => c.id === cfg.textColor) || window.TEXT_COLORS[0];
    const mat = cfg.materials && window.MATERIALS.find((m) => m.id === cfg.materials.napisova_deska);
    inscriptionStoneLuma = mat ? (hexLuma(mat.c1) + hexLuma(mat.c2)) / 2 : 0;
    const font = { family: fontObj.family, weight: fontObj.engraveWeight || "400" };
    const upper = (v) => fontObj.upper ? v.toUpperCase() : v;
    const inscription = cfg.inscription || {};
    const family = upper(String(inscription.family || "").trim()), sub = upper(String(inscription.sub || "").trim());
    const entries = sourcePersonEntries(inscription, cfg.photoRows, upper, cfg.reservedRows);
    const plates = design.parts.filter((p) => p.role === "plate").sort((a, b2) => sourcePartBounds(a).minX - sourcePartBounds(b2).minX);
    const part = design.parts.find((p) => p.id === sourcePartId) || plates[0];
    if (!part) return cv;
    const plan = sourceInscriptionGroups(design, entries, cfg.inscriptionLayout);
    const b = sourcePartBounds(part), bh = b.maxY - b.minY, bw = b.maxX - b.minX;
    const insetX = 0.022 / planeW, insetY = 0.012 / planeH;
    const pxCm = (n) => n * ch / (planeH * 100) / 0.72 * (fontObj.engraveScale || 1);
    const region = { minX: b.minX + insetX, maxX: b.maxX - insetX, desiredX: (b.minX + b.maxX) / 2 };
    const shapeDef = (window.SHAPES || []).find((shape) => shape.id === cfg.shape);
    const asset = cfg.sourceModel === "jednohrob-premium-20261003" ? null : shapeDef && shapeDef.ornamentAsset;
    const ornament = !!asset || cfg.ornamentType === "cross" || cfg.ornamentType === "rose";
    const pillar = design.parts.find((p) => p.role === "pillar");
    const paired = plates.length === 1 && plan.lanes === 2;
    const headingTop = (_a = design.inscriptionTop) != null ? _a : 0.2;
    const familyY = b.minY + bh * headingTop, namesTop = b.minY + bh * (family ? headingTop + 0.03 : 0.16);
    const footerY = b.minY + bh * 0.92;
    const bottom = sub ? b.minY + bh * 0.81 : b.maxY - Math.max(insetY * 2, bh * 0.09);
    const decorateHere = ornament && (pillar ? part.id === pillar.id : part.role === "plate");
    const centralMotif = paired && decorateHere;
    const index = plates.indexOf(part);
    const groups = plates.length > 1 ? [plan.groups[index] || []] : plan.groups;
    const hasPeople = groups.some((group) => group.some(Boolean));
    const textLines = [];
    const paintLine = (text, y, px, r = region, date = false) => {
      if (!text) return;
      const fit = sourceFitLine(ctx, text, y, px, font, date, design, part, r, cw, ch, insetX, insetY);
      if (fit) textLines.push({ text, ...fit, region: r, date });
    };
    let ornamentBox = null;
    if (decorateHere && (part.role === "pillar" || hasPeople || entries.length === 0)) {
      const src = asset || "assets/rose-engraving-white.png";
      const imageAsset = cfg.ornamentType === "cross" && !asset ? null : loadImageAsset(src);
      const frame = imageAsset && imageAsset.loaded ? sourceOrnamentFrame(imageAsset.image, src) : null;
      const aspect = frame ? frame.w / frame.h : 0.36;
      const isPillar = part.role === "pillar";
      const minX = isPillar ? region.minX : centralMotif ? b.minX + bw * 0.405 : region.minX;
      const maxX = isPillar ? region.maxX : centralMotif ? b.minX + bw * 0.595 : b.minX + bw * 0.24;
      const desiredX = (minX + maxX) / 2;
      const topLimit = isPillar ? b.minY + bh * 0.12 : namesTop + insetY;
      const bottomLimit = isPillar ? b.maxY - bh * 0.1 : bottom - insetY;
      let height = Math.min(bh * (isPillar ? 0.64 : centralMotif ? 0.52 : 0.56), bottomLimit - topLimit);
      const naturalCenter = isPillar ? b.minY + bh * 0.52 : topLimit + height / 2;
      for (let i = 0; i < 30; i++, height *= 0.92) {
        const centerY = Math.max(topLimit + height / 2, Math.min(bottomLimit - height / 2, naturalCenter));
        const y0 = centerY - height / 2, width = height * ch / cw * aspect;
        const band = sourcePartBand(design, part, y0 - insetY, y0 + height + insetY, { minX, maxX, desiredX, insetX });
        if (!band || band.maxX - band.minX < width) continue;
        const x = Math.max(band.minX + width / 2, Math.min(band.maxX - width / 2, desiredX));
        ornamentBox = { minX, maxX };
        if (cfg.ornamentType === "cross" && !asset) drawLeftCross(ctx, x * cw, y0 * ch, height * ch, tc.id);
        else drawLeftOrnament(ctx, x * cw, y0 * ch, height * ch, "rgba(248,246,240,.9)", src);
        break;
      }
    }
    if (part.role !== "plate") {
      maskSourceCanvas(ctx, design, part, cw, ch);
      return cv;
    }
    if (hasPeople || entries.length === 0) paintLine(family, familyY, pxCm(4.3));
    const textRegion = { ...region };
    if (ornamentBox && !centralMotif) textRegion.minX = Math.max(textRegion.minX, ornamentBox.maxX + insetX);
    const rowH = Math.min((bottom - namesTop) / plan.rowCount, 0.22 / planeH);
    const prepared = [];
    groups.forEach((rows, col) => {
      const r = { ...textRegion };
      if (paired) {
        const gap = centralMotif ? bw * 0.25 : bw * 0.055;
        const middle = (b.minX + b.maxX) / 2;
        if (col === 0) r.maxX = middle - gap / 2;
        else r.minX = middle + gap / 2;
      }
      r.desiredX = (r.minX + r.maxX) / 2;
      rows.forEach((entry, row) => {
        if (!entry) return;
        const rowTop = namesTop + row * rowH, rowRegion = { ...r };
        if (regions) {
          const top = rowTop + rowH * 0.06, bottom2 = rowTop + rowH * 0.9;
          const band = sourcePartBand(design, part, top, bottom2, { ...r, insetX });
          if (band) regions.push({
            kind: "person",
            index: entry.index,
            reserved: entry.reserved,
            name: entry.name,
            minX: band.minX,
            maxX: band.maxX,
            minY: top,
            maxY: bottom2
          });
        }
        if (entry.reserved && !entry.name && !entry.dates && !entry.photo) return;
        const ph = 0.09 / planeH, pw = 0.07 / planeW;
        if (plan.rowPhotos[row]) {
          const py = rowTop + (rowH - ph) / 2;
          const band = sourcePartBand(design, part, py - insetY, py + ph + insetY, { ...r, insetX });
          if (band && band.maxX - band.minX > pw + insetX * 3 && rowH >= ph) {
            const photoOnRight = plan.lanes === 2 && (plates.length > 1 ? index : col) === 1;
            const photoX = photoOnRight ? band.maxX - pw : band.minX;
            if (entry.photo) drawPhotoPlaceholder(ctx, photoX * cw, py * ch, pw * cw, ph * ch);
            if (photoOnRight) rowRegion.maxX = photoX - insetX;
            else rowRegion.minX = photoX + pw + insetX;
            rowRegion.desiredX = (rowRegion.minX + rowRegion.maxX) / 2;
          }
        }
        const dateLines = sourceDateLines(entry.dates);
        const datePx = Math.min(pxCm(2.2), rowH * ch * (plan.lanes === 1 ? 0.24 : 0.18));
        const dateGap = datePx * 1.4 / ch;
        const dateFirst = rowTop + rowH * (plan.lanes === 1 ? 0.83 : 0.68);
        const nameBottom = dateLines.length ? dateFirst - datePx * 1.35 / ch : rowTop + rowH * 0.84;
        const nameTop = rowTop + rowH * (plan.lanes === 1 ? 0.025 : 0.1);
        const nameH = nameBottom - nameTop;
        const namePx = Math.min(pxCm(5.1), nameH * ch * 0.7);
        const nameLayout = entry.name ? sourceNameLayout(
          ctx,
          entry.name,
          nameTop,
          nameH,
          namePx,
          datePx,
          false,
          font,
          design,
          part,
          rowRegion,
          cw,
          ch,
          insetX,
          insetY
        ) : { lines: [] };
        prepared.push({ entry, rowRegion, nameLayout, dateLines, datePx, dateFirst, dateGap, rowTop: nameTop, nameH, namePx });
      });
    });
    const sharedNamePx = Math.min(...prepared.flatMap((p) => p.nameLayout.lines.map((line) => line.px)));
    prepared.forEach((p) => {
      p.nameLayout.lines.forEach((line) => textLines.push({ ...line, px: Math.min(line.px, sharedNamePx), region: p.rowRegion }));
      p.dateLines.forEach((line, i) => {
        let y = p.dateFirst + i * p.dateGap;
        let fit = sourceFitLine(ctx, line, y, p.datePx, font, true, design, part, p.rowRegion, cw, ch, insetX, insetY);
        const last = p.nameLayout.lines[p.nameLayout.lines.length - 1];
        if (last && fit) {
          const namePx = Math.min(last.px, sharedNamePx);
          ctx.font = `${font.weight} ${namePx}px ${font.family}`;
          const descent = Math.max(namePx * 0.2, ctx.measureText(last.text).actualBoundingBoxDescent || 0);
          y = Math.min(y, (last.y + descent + fit.px * 0.86) / ch + 6e-3 / planeH);
          fit = sourceFitLine(ctx, line, y, fit.px, font, true, design, part, p.rowRegion, cw, ch, insetX, insetY);
        }
        if (fit) textLines.push({ text: line, ...fit, date: true, region: p.rowRegion });
      });
    });
    if (!paired) alignInscriptionColumn(
      ctx,
      textLines,
      region.desiredX,
      font,
      design,
      part,
      cw,
      ch,
      insetX,
      insetY
    );
    if (hasPeople || entries.length === 0) paintLine(sub, footerY, pxCm(3.1));
    textLines.forEach((l) => (l.date ? paintDateLine : paintInscriptionLine)(ctx, l.text, l.x, l.y, font.weight, l.px, font.family, tc.id));
    maskSourceCanvas(ctx, design, part, cw, ch);
    return cv;
  }
  function singleInscriptionProfile(cfg, planeW, planeH) {
    const authored = sourceHeadstoneDesign(cfg);
    if (authored) return authored;
    const shape = makeSteleShape(cfg.shape, planeW, planeH);
    const points = shape.getPoints(160).map((p) => [p.x / planeW + 0.5, 1 - p.y / planeH]);
    const part = { id: "single", role: "plate", points };
    return { parts: [part] };
  }
  function paintSingleInscriptionCanvas(cfg, planeW, planeH) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    const cv = document.createElement("canvas"), cw = 2048;
    const ch = Math.max(256, Math.round(cw * planeH / planeW));
    cv.width = cw;
    cv.height = ch;
    const ctx = cv.getContext("2d");
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    const definition = window.SHAPES.find((s) => s.id === cfg.shape) || {};
    const L = definition.layout || {};
    const design = singleInscriptionProfile(cfg, planeW, planeH), part = design.parts.find((p) => p.role === "plate") || design.parts[0];
    const fontObj = window.FONTS.find((f) => f.id === cfg.font) || window.FONTS[0];
    const font = { family: fontObj.family, weight: fontObj.engraveWeight || "400" };
    const tc = (window.TEXT_COLORS.find((c) => c.id === cfg.textColor) || window.TEXT_COLORS[0]).id;
    const material = window.MATERIALS.find((m) => {
      var _a2;
      return m.id === ((_a2 = cfg.materials) == null ? void 0 : _a2.napisova_deska);
    });
    inscriptionStoneLuma = material ? (hexLuma(material.c1) + hexLuma(material.c2)) / 2 : 0;
    const upper = (value) => fontObj.upper ? value.toUpperCase() : value;
    const inscription = cfg.inscription || {};
    const family = upper(String(inscription.family || "").trim());
    const sub = upper(String(inscription.sub || "").trim());
    const people = sourcePersonEntries(inscription, cfg.photoRows, upper, cfg.reservedRows);
    const insetX = 0.018 / planeW, insetY = 9e-3 / planeH;
    const pxCm = (cm) => cm / 100 / planeH * ch / 0.72 * (fontObj.engraveScale || 1);
    const inscriptionAxis = (_a = definition.inscriptionAxis) != null ? _a : 0.5;
    const partBounds = sourcePartBounds(part);
    const fullRegion = { minX: cfg.shape === "srdce-strom" ? 0.38 : Math.max(insetX, partBounds.minX + insetX), maxX: Math.min(1 - insetX, partBounds.maxX - insetX), desiredX: inscriptionAxis };
    const centeredRegion = { ...fullRegion, obstacles: [] };
    const familyY = Math.max(0.15, ((_b = L.family) == null ? void 0 : _b.y) || 0.19);
    const top = Math.max(((_c = L.names) == null ? void 0 : _c.y) || 0.24, family ? familyY + 0.055 : 0.17);
    const bottom = ((_d = L.names) == null ? void 0 : _d.bottom) || (sub ? 0.82 : 0.91);
    const rowH = Math.min((bottom - top) / Math.max(people.length, 1), 0.16 / planeH);
    const ornament = definition.decoration === "tree-relief" ? null : definition.ornamentAsset || ["rose", "cross"].includes(cfg.ornamentType) && "assets/rose-engraving-white.png";
    let ornamentBox = null;
    if (definition.ornamentAsset && L.ornament) {
      const height = Math.min(L.ornament.h, 1 - insetY - L.ornament.y);
      drawLeftOrnament(
        ctx,
        L.ornament.x * cw,
        L.ornament.y * ch,
        height * ch,
        "rgba(248,246,240,.9)",
        definition.ornamentAsset
      );
      ornamentBox = { minX: 0, maxX: Math.max(0.34, (((_e = L.names) == null ? void 0 : _e.x) || 0.6) - (((_f = L.names) == null ? void 0 : _f.w) || 0.52) / 2) };
      const asset = loadImageAsset(definition.ornamentAsset);
      if (asset.loaded) {
        const frame = sourceOrnamentFrame(asset.image, definition.ornamentAsset);
        const width = height * ch / cw * frame.w / frame.h;
        centeredRegion.engraving = {
          minX: L.ornament.x - width / 2,
          maxX: L.ornament.x + width / 2,
          minY: L.ornament.y,
          maxY: L.ornament.y + height,
          rows: sourceOrnamentInkProfile(definition.ornamentAsset)
        };
      } else centeredRegion.minX = ornamentBox.maxX + insetX;
    } else if (ornament) {
      const cross = cfg.ornamentType === "cross" && !definition.ornamentAsset;
      const image = cross ? null : loadImageAsset(ornament);
      const frame = (image == null ? void 0 : image.loaded) ? sourceOrnamentFrame(image.image, ornament) : null;
      const aspect = cross ? 0.36 : frame ? frame.w / frame.h : 0.5;
      const maxX = definition.ornamentAsset ? Math.min(0.46, Math.max(0.32, (((_g = L.names) == null ? void 0 : _g.x) || 0.6) - 0.22)) : 0.28;
      const region = { minX: insetX, maxX, desiredX: Math.min(((_h = L.ornament) == null ? void 0 : _h.x) || 0.16, maxX / 2) };
      let height = Math.min(0.6, bottom - top - insetY);
      for (let attempt = 0; attempt < 40; attempt++, height *= 0.94) {
        const y = Math.max(top, Math.min(((_i = L.ornament) == null ? void 0 : _i.y) || top, bottom - height - insetY));
        const width = height * ch / cw * aspect;
        const band = sourcePartBand(design, part, y - insetY, y + height + insetY, { ...region, insetX });
        if (!band || width > band.maxX - band.minX) continue;
        const x = Math.max(band.minX + width / 2, Math.min(band.maxX - width / 2, region.desiredX));
        ornamentBox = { minX: x - width / 2, maxX: x + width / 2 };
        centeredRegion.obstacles.push({ ...ornamentBox, minY: y, maxY: y + height });
        if (cross) drawLeftCross(ctx, x * cw, y * ch, height * ch, tc);
        else drawLeftOrnament(ctx, x * cw, y * ch, height * ch, "rgba(248,246,240,.9)", ornament);
        break;
      }
    }
    const textRegion = { ...fullRegion, centeringRegion: centeredRegion };
    if (ornamentBox) textRegion.minX = Math.max(textRegion.minX, ornamentBox.maxX + insetX);
    textRegion.desiredX = inscriptionAxis;
    const textLines = [];
    const line = (text, y, px, region, date = false, align = true) => {
      const fit = sourceFitLine(ctx, text, y, px, font, date, design, part, region, cw, ch, insetX, insetY);
      if (fit) textLines.push({ text, ...fit, region, date, align });
      return fit;
    };
    if (family) line(family, familyY, Math.min(pxCm(4.2), ch * 0.066), { ...definition.ornamentAsset ? textRegion : fullRegion, centeringRegion: centeredRegion });
    const photoGutter = people.some((person) => person.photo);
    const prepared = people.map((person, index) => {
      var _a2, _b2;
      const rowTop = top + index * rowH;
      const region = { ...textRegion };
      if (person.reserved && !person.name && !person.dates && !person.photo) return { person, lines: [] };
      if (photoGutter) {
        const ph = Math.min(0.09 / planeH, rowH * 0.8), pw = ph * ch / cw * 7 / 9;
        const py = rowTop + rowH * 0.06;
        const band = sourcePartBand(design, part, py - insetY, py + ph + insetY, { ...region, insetX });
        if (band) {
          const onRight = (((_a2 = L.photo) == null ? void 0 : _a2.x) || 0) > (((_b2 = L.names) == null ? void 0 : _b2.x) || 0.5);
          const x = onRight ? band.maxX - pw : band.minX;
          if (person.photo) {
            drawPhotoPlaceholder(ctx, x * cw, py * ch, pw * cw, ph * ch);
            centeredRegion.obstacles.push({ minX: x, maxX: x + pw, minY: py, maxY: py + ph });
          }
          if (onRight) region.maxX = x - insetX;
          else region.minX = x + pw + insetX;
          region.desiredX = (region.minX + region.maxX) / 2;
        }
      }
      const datePx = Math.min(pxCm(2.1), rowH * ch * 0.16);
      const nameTop = rowTop + rowH * 0.025;
      const nameH = rowH * (person.dates ? 0.58 : 0.83);
      const namePx = Math.min(pxCm(4.6), nameH * ch * 0.65);
      const layout = person.name ? sourceNameLayout(
        ctx,
        person.name,
        nameTop,
        nameH,
        namePx,
        datePx,
        false,
        font,
        design,
        part,
        region,
        cw,
        ch,
        insetX,
        insetY
      ) : { lines: [] };
      return { person, lines: layout.lines, region, datePx, dateY: rowTop + rowH * 0.81 };
    });
    const sharedNamePx = Math.min(...prepared.flatMap((p) => p.lines.map((l) => l.px)));
    prepared.forEach((p) => {
      p.lines.forEach((l) => textLines.push({ ...l, px: Math.min(l.px, sharedNamePx), region: p.region }));
      if (!p.person.dates) return;
      let dateY = p.dateY;
      let fit = sourceFitLine(ctx, p.person.dates, dateY, p.datePx, font, true, design, part, p.region, cw, ch, insetX, insetY);
      const last = p.lines[p.lines.length - 1];
      if (last && fit) {
        const px = Math.min(last.px, sharedNamePx);
        ctx.font = `${font.weight} ${px}px ${font.family}`;
        const descent = Math.max(px * 0.2, ctx.measureText(last.text).actualBoundingBoxDescent || 0);
        dateY = Math.min(dateY, (last.y + descent + fit.px * 0.86) / ch + Math.min(6e-3 / planeH, rowH * 0.06));
      }
      line(p.person.dates, dateY, fit ? fit.px : p.datePx, p.region, true);
    });
    alignInscriptionColumn(ctx, textLines, inscriptionAxis, font, design, part, cw, ch, insetX, insetY);
    if (sub) line(sub, Math.min(0.925, ((_j = L.sub) == null ? void 0 : _j.y) || 0.925), Math.min(pxCm(2.7), ch * 0.045), centeredRegion);
    textLines.forEach((l) => (l.date ? paintDateLine : paintInscriptionLine)(
      ctx,
      l.text,
      l.x,
      l.y,
      font.weight,
      l.px,
      font.family,
      tc
    ));
    maskSourceCanvas(ctx, design, part, cw, ch);
    return cv;
  }
  function paintInscriptionCanvas(cfg, planeW, planeH, sourcePartId) {
    if (cfg.type === "urnovy" || cfg.type === "jednohrob") return paintSingleInscriptionCanvas(cfg, planeW, planeH);
    const sourceDesign = sourceHeadstoneDesign(cfg);
    if (sourceDesign) return paintSourceInscriptionCanvas(cfg, planeW, planeH, sourceDesign, sourcePartId);
    const fontObj = window.FONTS.find((f) => f.id === cfg.font) || window.FONTS[0];
    const tcObj = window.TEXT_COLORS.find((c) => c.id === cfg.textColor) || window.TEXT_COLORS[0];
    const deskaMatObj = cfg.materials && window.MATERIALS.find((m) => m.id === cfg.materials.napisova_deska);
    inscriptionStoneLuma = deskaMatObj ? (hexLuma(deskaMatObj.c1) + hexLuma(deskaMatObj.c2)) / 2 : 0;
    const upper = fontObj.upper ? (s) => s.toUpperCase() : (s) => s;
    const weightFor = () => fontObj.engraveWeight || "400";
    const cw = 2048;
    const ch = Math.max(256, Math.round(cw * (planeH / planeW)));
    const cv = document.createElement("canvas");
    cv.width = cw;
    cv.height = ch;
    const ctx = cv.getContext("2d");
    ctx.clearRect(0, 0, cw, ch);
    ctx.textBaseline = "alphabetic";
    const planeH_cm = planeH * 100;
    const planeW_cm = planeW * 100;
    const pxPerCm = ch / planeH_cm;
    const cm = (n) => n * pxPerCm;
    const fontPxFromCm = (charHeightCm) => Math.round(cm(charHeightCm) / 0.72);
    const splitLines = (value) => String(value || "").split(/\n+/).map((line) => upper(line.trim())).filter(Boolean);
    const family = upper((cfg.inscription.family || "").trim());
    const nameLines = splitLines(cfg.inscription.name);
    const dateLines = splitLines(cfg.inscription.dates);
    const normalizeNamePart = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
    const familySurnameBase = (() => {
      const withoutRodina = family.replace(/^RODINA\s+/i, "").trim();
      const lastWord = withoutRodina.split(/\s+/).filter(Boolean).pop() || "";
      const normalized = normalizeNamePart(lastWord);
      return normalized.endsWith("ova") ? normalized.slice(0, -3) : normalized;
    })();
    const stripFamilySurname = (value) => {
      if (!familySurnameBase || !value) return value;
      const parts = value.trim().split(/\s+/);
      if (parts.length < 2) return value;
      const last = normalizeNamePart(parts[parts.length - 1]);
      if (last === familySurnameBase || last.replace(/ova$/, "") === familySurnameBase) {
        return parts.slice(0, -1).join(" ");
      }
      return value;
    };
    const displayNameLines = nameLines.map(stripFamilySurname);
    const name = displayNameLines[0] || "";
    const dates = dateLines[0] || "";
    const sub = upper((cfg.inscription.sub || "").trim());
    const personEntries = Array.from({ length: Math.max(nameLines.length, dateLines.length, 1) }, (_, i) => ({
      name: displayNameLines[i] || "",
      dates: dateLines[i] || "",
      photo: !!(cfg.photoRows && cfg.photoRows[i])
    })).filter((row) => row.name || row.dates);
    const ornamentType = cfg.ornamentType || "none";
    const shapeDef = (window.SHAPES || []).find((s) => s.id === cfg.shape);
    const shapeOrnamentAsset = cfg.sourceModel === "jednohrob-premium-20261003" ? null : shapeDef && shapeDef.ornamentAsset;
    const shapeScan = shapeScanFor(shapeDef);
    const lineBand = (baselineY, fontPx, reserveLeft) => {
      let x0, x1;
      if (shapeScan) {
        const y0 = Math.max(0, baselineY - fontPx * 0.85) / ch;
        const y1 = Math.min(ch, baselineY + fontPx * 0.18) / ch;
        const b = shapeScan(y0, y1);
        const inset = 0.045;
        x0 = (b.x0 + inset) * cw;
        x1 = (b.x1 - inset) * cw;
      } else {
        x0 = cm(sideMarginCm);
        x1 = cw - cm(sideMarginCm);
      }
      if (reserveLeft) x0 = Math.max(x0, cw * 0.36);
      if (x1 - x0 < cw * 0.18) x1 = x0 + cw * 0.18;
      return { cx: (x0 + x1) / 2, maxW: x1 - x0 };
    };
    const reserveForOrnament = !!shapeOrnamentAsset;
    const L = shapeDef && shapeDef.layout || null;
    const Lf = L && L.family;
    const Ln = L && L.names;
    const Ls = L && L.sub;
    const Lo = L && L.ornament;
    const Lp = L && L.photo;
    const hasFamily = !!family;
    const hasName = !!name;
    const hasDates = !!dates;
    const hasSub = !!sub;
    const hasPhoto = personEntries.some((e) => e.photo);
    const usesStackedMemorialLayout = cfg.type === "urnovy" || cfg.type === "jednohrob" || cfg.type === "dvojhrob";
    const TEXT_SCALE = 1.3;
    const familyCm = 5.2 * TEXT_SCALE;
    const nameCm = 4.8 * TEXT_SCALE;
    const datesCm = nameCm * 0.62 * 0.8;
    const subCm = nameCm * 0.72;
    const gapCm = 1.5;
    const narrowShape = /vlna|konvice|paprsky/i.test(cfg.shape || "");
    const sideMarginCm = narrowShape ? 4.5 : 2;
    const photoWCm = 7;
    const photoHCm = 9;
    const photoLeftCm = 3.5;
    const photoTextGapCm = 1.5;
    const eScale = fontObj.engraveScale || 1;
    const familyPx = Math.round(fontPxFromCm(familyCm) * eScale);
    const namePx = Math.round(fontPxFromCm(nameCm) * eScale);
    const datesPx = Math.round(fontPxFromCm(datesCm) * eScale);
    const subPx = Math.round(fontPxFromCm(subCm) * eScale);
    const fullWidthPx = cm(planeW_cm - 2 * sideMarginCm);
    const nameBlockLeftCm = hasPhoto ? photoLeftCm + photoWCm + photoTextGapCm : sideMarginCm;
    const nameBlockWidthCm = planeW_cm - nameBlockLeftCm - sideMarginCm;
    const nameBlockWidthPx = cm(nameBlockWidthCm);
    const familyWeight = weightFor("family");
    const nameWeight = weightFor("name");
    const dateWeight = weightFor("date");
    const subWeight = weightFor("sub");
    const familyActual = hasFamily ? fitFontSize(ctx, family, familyWeight, fontObj.family, fullWidthPx, familyPx, Math.round(familyPx * 0.58)) : familyPx;
    const nameActual = hasName ? fitFontSize(ctx, name, nameWeight, fontObj.family, nameBlockWidthPx, namePx, Math.round(namePx * 0.58)) : namePx;
    const datesActual = hasDates ? fitFontSize(ctx, dates, dateWeight, fontObj.family, nameBlockWidthPx, datesPx, Math.round(datesPx * 0.58)) : datesPx;
    const subActual = hasSub ? fitFontSize(ctx, sub, subWeight, fontObj.family, fullWidthPx, subPx, Math.round(subPx * 0.58)) : subPx;
    const textWidth = (text, weight, size) => {
      if (!text || !size) return 0;
      ctx.font = `${weight} ${size}px ${fontObj.family}`;
      return ctx.measureText(text).width;
    };
    if (usesStackedMemorialLayout) {
      if (cfg.type === "dvojhrob" && shapeDef && shapeDef.split) {
        const gapOnly = !!shapeDef.splitGapOnly;
        const innerU = gapOnly ? SPLIT_DH.gapOnly : SPLIT_DH.pillar / 2;
        const lC = (0.5 - innerU) / 2;
        const rC = 1 - lC;
        const colW = Math.max(cw * 0.2, (0.5 - innerU - 0.025) * cw);
        ctx.textAlign = "center";
        const famWords = family ? family.split(/\s+/) : [];
        const famL = famWords.length >= 2 ? famWords.slice(0, -1).join(" ") : family;
        const famR = famWords.length >= 2 ? famWords[famWords.length - 1] : "";
        const famY = ch * 0.17;
        if (famL) {
          const px = fitFontSize(ctx, famL, familyWeight, fontObj.family, colW, familyPx, Math.round(familyPx * 0.5));
          paintInscriptionLine(ctx, famL, lC * cw, famY, familyWeight, px, fontObj.family, tcObj.id);
        }
        if (famR) {
          const px = fitFontSize(ctx, famR, familyWeight, fontObj.family, colW, familyPx, Math.round(familyPx * 0.5));
          paintInscriptionLine(ctx, famR, rC * cw, famY, familyWeight, px, fontObj.family, tcObj.id);
        }
        const nL = Math.max(1, Math.floor(personEntries.length / 2));
        const sidesDef = [
          { cx: lC * cw, left: true, entries: personEntries.slice(0, nL) },
          { cx: rC * cw, left: false, entries: personEntries.slice(nL) }
        ];
        const rowGap2 = cm(0.55);
        const entryGap2 = cm(1);
        const useSub = hasSub && !gapOnly;
        const topY = family ? ch * 0.3 : ch * 0.16;
        const maxBottom = useSub ? ch * 0.86 : ch * 0.94;
        sidesDef.forEach((side) => {
          if (!side.entries.length) return;
          const sideHasPhoto = side.entries.some((e) => e.photo);
          const reserve = sideHasPhoto;
          const colWEff = reserve ? colW * 0.7 : colW;
          const cx = side.cx + (reserve ? (side.left ? -1 : 1) * colW * 0.15 : 0);
          const build = (sc) => side.entries.map((e) => {
            const npx = e.name ? fitFontSize(ctx, e.name, nameWeight, fontObj.family, colWEff, Math.round(namePx * sc), Math.round(namePx * 0.5)) : 0;
            const dpx = e.dates ? fitFontSize(ctx, e.dates, dateWeight, fontObj.family, colWEff, Math.round(datesPx * sc), Math.round(datesPx * 0.55)) : 0;
            return { ...e, npx, dpx, height: npx + (npx && dpx ? rowGap2 : 0) + dpx };
          });
          const totalOf = (rows3) => rows3.reduce((a, r) => a + r.height, 0) + entryGap2 * Math.max(0, rows3.length - 1);
          let scale2 = 1.05;
          let rows2 = build(scale2);
          while (scale2 > 0.6 && totalOf(rows2) > maxBottom - topY) {
            scale2 -= 0.05;
            rows2 = build(scale2);
          }
          let y3 = topY + Math.max(0, (maxBottom - topY - totalOf(rows2)) * 0.12);
          rows2.forEach((r) => {
            if (r.photo && r.height > 0) {
              const phH = r.height, phW = phH * (7 / 9);
              const px = side.left ? (0.5 - innerU) * cw - phW - cm(0.5) : (0.5 + innerU) * cw + cm(0.5);
              drawPhotoPlaceholder(ctx, px, y3, phW, phH);
            }
            if (r.name) {
              y3 += r.npx;
              paintInscriptionLine(ctx, r.name, cx, y3, nameWeight, r.npx, fontObj.family, tcObj.id);
            }
            if (r.name && r.dates) y3 += rowGap2;
            if (r.dates) {
              y3 += r.dpx;
              paintDateLine(ctx, r.dates, cx, y3, dateWeight, r.dpx, fontObj.family, tcObj.id);
            }
            y3 += entryGap2;
          });
        });
        if (useSub) {
          const spx = fitFontSize(ctx, sub, subWeight, fontObj.family, colW, subPx, Math.round(subPx * 0.4));
          paintInscriptionLine(ctx, sub, lC * cw, ch * 0.955, subWeight, spx, fontObj.family, tcObj.id);
        }
        return cv;
      }
      if (cfg.type === "dvojhrob") {
        const LD = shapeDef && shapeDef.layoutD || null;
        const Lf2 = LD && LD.family, Ln2 = LD && LD.names, Ls2 = LD && LD.sub, Lo2 = LD && LD.ornament;
        const hasOrnamentColumn2 = !!shapeOrnamentAsset || ornamentType === "cross" || ornamentType === "rose";
        const contentLeftCm = sideMarginCm;
        const contentRightCm = sideMarginCm;
        const contentWidthPx = cm(planeW_cm - contentLeftCm - contentRightCm);
        const columnGapPx = hasOrnamentColumn2 ? cm(Math.min(20, planeW_cm * 0.13)) : cm(2.5);
        const columnWidthPx = (contentWidthPx - columnGapPx) / 2;
        const leftCenterX = cm(contentLeftCm) + columnWidthPx / 2;
        const rightCenterX = leftCenterX + columnWidthPx + columnGapPx;
        const familyActual3 = hasFamily ? fitFontSize(ctx, family, familyWeight, fontObj.family, fullWidthPx, familyPx, Math.round(familyPx * 0.54)) : 0;
        const subActual3 = hasSub ? fitFontSize(ctx, sub, subWeight, fontObj.family, fullWidthPx, subPx, Math.round(subPx * 0.54)) : 0;
        const rowGap2 = cm(0.55);
        const pairGap = cm(personEntries.length > 2 ? 0.9 : 1.25);
        const maxEntryArea2 = ch * (hasSub ? 0.58 : 0.66);
        const buildEntryLayout2 = (scale3) => {
          const nameBase = Math.round(namePx * scale3);
          const dateBase = Math.round(datesPx * scale3);
          return personEntries.map((entry) => {
            const entryNamePx = entry.name ? fitFontSize(ctx, entry.name, nameWeight, fontObj.family, columnWidthPx, nameBase, Math.round(nameBase * 0.52)) : 0;
            const entryDatesPx = entry.dates ? fitFontSize(ctx, entry.dates, dateWeight, fontObj.family, columnWidthPx, dateBase, Math.round(dateBase * 0.56)) : 0;
            const height = entryNamePx + (entryNamePx && entryDatesPx ? rowGap2 : 0) + entryDatesPx;
            const width = Math.max(
              textWidth(entry.name, nameWeight, entryNamePx),
              measureDateText(ctx, entry.dates, dateWeight, entryDatesPx, fontObj.family)
            );
            return { ...entry, namePx: entryNamePx, datesPx: entryDatesPx, width, height };
          });
        };
        let scale2 = (personEntries.length > 2 ? 0.9 : 1) * 1.1 * (Ln2 && Ln2.size || 1);
        let rows2 = buildEntryLayout2(scale2);
        const pairHeight = () => {
          let height = 0;
          for (let i = 0; i < rows2.length; i += 2) {
            height += Math.max(rows2[i] ? rows2[i].height : 0, rows2[i + 1] ? rows2[i + 1].height : 0);
            if (i + 2 < rows2.length) height += pairGap;
          }
          return height;
        };
        let rowsHeight2 = pairHeight();
        while (scale2 > 0.6 && rowsHeight2 > maxEntryArea2) {
          scale2 -= 0.04;
          rows2 = buildEntryLayout2(scale2);
          rowsHeight2 = pairHeight();
        }
        ctx.textAlign = "center";
        if (hasOrnamentColumn2) {
          const ornamentX = Lo2 ? Lo2.x * cw : Ln2 ? Ln2.x * cw : cw / 2;
          if (shapeOrnamentAsset) {
            drawLeftOrnament(ctx, (Lo2 ? Lo2.x : 0.16) * cw, (Lo2 ? Lo2.y : 0.03) * ch, (Lo2 ? Lo2.h : 0.92) * ch, "rgba(248,246,240,0.9)", shapeOrnamentAsset);
          } else if (ornamentType === "cross") {
            drawLeftCross(ctx, ornamentX, (Lo2 ? Lo2.y : 0.24) * ch, (Lo2 ? Lo2.h : 0.5) * ch, tcObj.id);
          } else {
            drawLeftOrnament(ctx, ornamentX, (Lo2 ? Lo2.y : 0.24) * ch, (Lo2 ? Lo2.h : 0.5) * ch, "rgba(248,246,240,0.9)");
          }
        }
        if (hasFamily) {
          const famY = (Lf2 ? Lf2.y : 0.15) * ch;
          const famBase = Math.round(familyActual3 * (Lf2 && Lf2.size ? Lf2.size : 1));
          const fb = lineBand(famY, famBase, reserveForOrnament && !Lf2);
          const famPx = fitFontSize(ctx, family, familyWeight, fontObj.family, fb.maxW, famBase, Math.round(familyPx * 0.4));
          paintInscriptionLine(ctx, family, Lf2 ? Lf2.x * cw : fb.cx, famY, familyWeight, famPx, fontObj.family, tcObj.id);
        }
        const entriesTop2 = Ln2 ? Ln2.y * ch : hasFamily ? ch * 0.25 : ch * 0.14;
        const maxBottomY2 = hasSub ? ch * 0.8 : ch * 0.93;
        const availableH2 = Math.max(0, maxBottomY2 - entriesTop2);
        let y3 = entriesTop2 + Math.max(0, Math.min(cm(0.8), (availableH2 - rowsHeight2) * 0.12));
        for (let i = 0; i < rows2.length; i += 2) {
          const left = rows2[i];
          const right = rows2[i + 1];
          const pairH = Math.max(left ? left.height : 0, right ? right.height : 0);
          const bb = Ln2 ? { cx: Ln2.x * cw, maxW: (Ln2.w || 0.6) * cw } : lineBand(y3 + pairH, pairH, reserveForOrnament);
          const colW = Math.max(cw * 0.14, (bb.maxW - columnGapPx) / 2);
          const lCX = bb.cx - (columnGapPx + colW) / 2;
          const rCX = bb.cx + (columnGapPx + colW) / 2;
          const paintEntry = (entry, centerX) => {
            if (!entry) return;
            let entryY = y3 + Math.max(0, (pairH - entry.height) / 2);
            if (entry.name) {
              entryY += entry.namePx;
              const npx = fitFontSize(ctx, entry.name, nameWeight, fontObj.family, colW, entry.namePx, Math.round(entry.namePx * 0.55));
              paintInscriptionLine(ctx, entry.name, centerX, entryY, nameWeight, npx, fontObj.family, tcObj.id);
            }
            if (entry.name && entry.dates) entryY += rowGap2;
            if (entry.dates) {
              entryY += entry.datesPx;
              paintDateLine(ctx, entry.dates, centerX, entryY, dateWeight, entry.datesPx, fontObj.family, tcObj.id);
            }
          };
          if (left && left.photo && left.height > 0) {
            const photoH = left.height;
            const photoW = photoH * (7 / 9);
            const photoGap = cm(0.7);
            const photoX = Math.max(cm(sideMarginCm), lCX - left.width / 2 - photoGap - photoW);
            drawPhotoPlaceholder(ctx, photoX, y3 + (pairH - photoH) / 2, photoW, photoH);
          }
          if (right && right.photo && right.height > 0) {
            const photoH = right.height;
            const photoW = photoH * (7 / 9);
            const photoGap = cm(0.7);
            const photoX = Math.min(cw - cm(sideMarginCm) - photoW, rCX + right.width / 2 + photoGap);
            drawPhotoPlaceholder(ctx, photoX, y3 + (pairH - photoH) / 2, photoW, photoH);
          }
          paintEntry(left, lCX);
          paintEntry(right, rCX);
          y3 += pairH;
          if (i + 2 < rows2.length) y3 += pairGap;
        }
        if (hasSub) {
          const subY = (Ls2 ? Ls2.y : 0.985) * ch;
          const subBase = Math.round(subActual3 * (Ls2 && Ls2.size ? Ls2.size : 1));
          const sb = lineBand(subY, subBase, false);
          const spx = fitFontSize(ctx, sub, subWeight, fontObj.family, sb.maxW, subBase, Math.round(subPx * 0.4));
          paintInscriptionLine(ctx, sub, Ls2 ? Ls2.x * cw : sb.cx, subY, subWeight, spx, fontObj.family, tcObj.id);
        }
        return cv;
      }
      const hasOrnamentColumn = !!shapeOrnamentAsset || ornamentType === "cross" || ornamentType === "rose";
      const sideRoomCm = Math.min(planeW_cm * 0.42, Math.max(planeW_cm * 0.34, 14));
      const photoOnRight = hasPhoto && hasOrnamentColumn;
      const photoOnLeft = hasPhoto && !hasOrnamentColumn;
      const entryLeftCm = hasOrnamentColumn || photoOnLeft ? sideRoomCm : sideMarginCm;
      const entryRightCm = photoOnRight ? sideRoomCm : sideMarginCm;
      const entryWidthPx = Ln ? (Ln.w || 0.6) * cw : cm(planeW_cm - entryLeftCm - entryRightCm);
      const entryCenterX = Ln ? Ln.x * cw : hasOrnamentColumn && !hasPhoto ? cw / 2 : cm(entryLeftCm) + entryWidthPx / 2;
      const ornamentCenterX = cm(entryLeftCm * (hasPhoto ? 0.44 : 0.3));
      const familyActual2 = hasFamily ? fitFontSize(ctx, family, familyWeight, fontObj.family, fullWidthPx, familyPx, Math.round(familyPx * 0.54)) : 0;
      const subActual2 = hasSub ? fitFontSize(ctx, sub, subWeight, fontObj.family, fullWidthPx, subPx, Math.round(subPx * 0.54)) : 0;
      const rowGap = cm(0.55);
      const entryGap = cm(personEntries.length > 2 ? 0.85 : 1.15);
      const maxEntryArea = ch * (hasSub ? 0.56 : 0.64);
      const buildEntryLayout = (scale2) => {
        const nameBase = Math.round(namePx * scale2);
        const dateBase = Math.round(datesPx * scale2);
        return personEntries.map((entry) => {
          const entryNamePx = entry.name ? fitFontSize(ctx, entry.name, nameWeight, fontObj.family, entryWidthPx, nameBase, Math.round(nameBase * 0.52)) : 0;
          const entryDatesPx = entry.dates ? fitFontSize(ctx, entry.dates, dateWeight, fontObj.family, entryWidthPx, dateBase, Math.round(dateBase * 0.56)) : 0;
          const height = entryNamePx + (entryNamePx && entryDatesPx ? rowGap : 0) + entryDatesPx;
          const width = Math.max(
            textWidth(entry.name, nameWeight, entryNamePx),
            measureDateText(ctx, entry.dates, dateWeight, entryDatesPx, fontObj.family)
          );
          return { ...entry, namePx: entryNamePx, datesPx: entryDatesPx, width, height };
        });
      };
      let scale = Ln && Ln.size || 1;
      let rows = buildEntryLayout(scale);
      let rowsHeight = rows.reduce((sum, row) => sum + row.height, 0) + entryGap * Math.max(0, rows.length - 1);
      while (scale > 0.62 && rowsHeight > maxEntryArea) {
        scale -= 0.04;
        rows = buildEntryLayout(scale);
        rowsHeight = rows.reduce((sum, row) => sum + row.height, 0) + entryGap * Math.max(0, rows.length - 1);
      }
      ctx.textAlign = "center";
      if (hasOrnamentColumn) {
        if (shapeOrnamentAsset) {
          drawLeftOrnament(ctx, (Lo ? Lo.x : 0.16) * cw, (Lo ? Lo.y : 0.03) * ch, (Lo ? Lo.h : 0.92) * ch, "rgba(248,246,240,0.9)", shapeOrnamentAsset);
        } else {
          const autoX = Ln ? Math.max(cm(3), (Ln.x - (Ln.w || 0.6) / 2) * cw / 2) : ornamentCenterX;
          if (ornamentType === "cross") {
            drawLeftCross(ctx, Lo ? Lo.x * cw : autoX, (Lo ? Lo.y : 0.13) * ch, (Lo ? Lo.h : 0.62) * ch, tcObj.id);
          } else {
            drawLeftOrnament(ctx, Lo ? Lo.x * cw : autoX, (Lo ? Lo.y : 0.2) * ch, (Lo ? Lo.h : 0.62) * ch, "rgba(248,246,240,0.9)");
          }
        }
      }
      if (hasFamily) {
        const famY = (Lf ? Lf.y : 0.15) * ch;
        const famBase = Math.round(familyActual2 * (Lf && Lf.size ? Lf.size : 1));
        const fb = lineBand(famY, famBase, reserveForOrnament && !Lf);
        const famPx = fitFontSize(ctx, family, familyWeight, fontObj.family, fb.maxW, famBase, Math.round(familyPx * 0.4));
        const familyX = Lf ? Lf.x * cw : !shapeOrnamentAsset && ornamentType === "cross" ? Math.min(entryCenterX, cw * 0.58) : fb.cx;
        paintInscriptionLine(ctx, family, familyX, famY, familyWeight, famPx, fontObj.family, tcObj.id);
      }
      const entriesTop = Ln ? Ln.y * ch : hasFamily ? ch * 0.23 : ch * 0.12;
      const maxBottomY = hasSub ? ch * 0.79 : ch * 0.93;
      const availableH = Math.max(0, maxBottomY - entriesTop);
      let y2 = entriesTop + Math.max(0, Math.min(cm(0.6), (availableH - rowsHeight) * 0.08));
      rows.forEach((entry, index) => {
        const entryTop = y2;
        if (entry.photo && entry.height > 0) {
          if (Lp && index === 0) {
            const photoH = entry.height;
            const photoW = photoH * (7 / 9);
            drawPhotoPlaceholder(ctx, Lp.x * cw - photoW / 2, Lp.y * ch - photoH / 2, photoW, photoH);
          } else {
            const photoH = entry.height;
            const photoW = photoH * (7 / 9);
            const photoGap = cm(0.7);
            let photoX;
            if (photoOnRight) {
              photoX = Math.min(cw - cm(sideMarginCm) - photoW, entryCenterX + entry.width / 2 + photoGap);
            } else {
              const preferredX = entryCenterX - entry.width / 2 - photoGap - photoW;
              const minX = cm(sideMarginCm);
              const maxX = entryCenterX - photoW - photoGap;
              photoX = Math.max(minX, Math.min(preferredX, maxX));
            }
            drawPhotoPlaceholder(ctx, photoX, entryTop + (entry.height - photoH) / 2, photoW, photoH);
          }
        }
        if (entry.name) {
          y2 += entry.namePx;
          const nb = Ln ? { cx: entryCenterX, maxW: entryWidthPx } : lineBand(y2, entry.namePx, reserveForOrnament);
          const npx = fitFontSize(ctx, entry.name, nameWeight, fontObj.family, nb.maxW, entry.namePx, Math.round(entry.namePx * 0.55));
          const ncx = Ln || hasPhoto ? entryCenterX : nb.cx;
          paintInscriptionLine(ctx, entry.name, ncx, y2, nameWeight, npx, fontObj.family, tcObj.id);
        }
        if (entry.name && entry.dates) y2 += rowGap;
        if (entry.dates) {
          y2 += entry.datesPx;
          const db = Ln ? { cx: entryCenterX, maxW: entryWidthPx } : lineBand(y2, entry.datesPx, reserveForOrnament);
          const dcx = Ln || hasPhoto ? entryCenterX : db.cx;
          paintDateLine(ctx, entry.dates, dcx, y2, dateWeight, entry.datesPx, fontObj.family, tcObj.id);
        }
        if (index < rows.length - 1) y2 += entryGap;
      });
      if (hasSub) {
        const subY = (Ls ? Ls.y : 0.985) * ch;
        const subBase = Math.round(subActual2 * (Ls && Ls.size ? Ls.size : 1));
        const sb = lineBand(subY, subBase, false);
        const spx = fitFontSize(ctx, sub, subWeight, fontObj.family, sb.maxW, subBase, Math.round(subPx * 0.4));
        paintInscriptionLine(ctx, sub, Ls ? Ls.x * cw : sb.cx, subY, subWeight, spx, fontObj.family, tcObj.id);
      }
      return cv;
    }
    let nameBlockH = 0;
    if (hasName) nameBlockH += nameActual;
    if (hasName && hasDates) nameBlockH += cm(gapCm * 0.5);
    if (hasDates) nameBlockH += datesActual;
    const nameRowH = nameBlockH;
    let totalH = 0;
    if (hasFamily) totalH += familyActual + cm(gapCm * 1.3);
    totalH += nameRowH;
    if (hasSub) totalH += cm(gapCm * 1.3) + subActual;
    const topPadding = Math.max(cm(gapCm), (ch - totalH) / 2);
    let y = topPadding;
    if (hasFamily) {
      ctx.textAlign = "center";
      y += familyActual;
      paintInscriptionLine(ctx, family, cw / 2, y, familyWeight, familyActual, fontObj.family, tcObj.id);
      y += cm(gapCm * 1.3);
    }
    const nameRowTop = y;
    const nameLineWidth = textWidth(name, nameWeight, nameActual);
    const dateLineWidth = measureDateText(ctx, dates, dateWeight, datesActual, fontObj.family);
    const nameTextCenterX = cw / 2;
    let textY = nameRowTop + (nameRowH - nameBlockH) / 2;
    if (personEntries[0] && personEntries[0].photo && nameBlockH > 0) {
      const photoH = nameBlockH;
      const photoW = photoH * (7 / 9);
      const photoGap = cm(0.7);
      const preferredX = nameTextCenterX - Math.max(nameLineWidth, dateLineWidth) / 2 - photoGap - photoW;
      const photoX = Math.max(cm(sideMarginCm), Math.min(preferredX, nameTextCenterX - photoW - photoGap));
      drawPhotoPlaceholder(ctx, photoX, nameRowTop + (nameBlockH - photoH) / 2, photoW, photoH);
    }
    if (hasName) {
      textY += nameActual;
      ctx.textAlign = "center";
      paintInscriptionLine(ctx, name, nameTextCenterX, textY, nameWeight, nameActual, fontObj.family, tcObj.id);
      if (hasDates) textY += cm(gapCm * 0.5);
    }
    if (hasDates) {
      textY += datesActual;
      ctx.textAlign = "center";
      paintDateLine(ctx, dates, nameTextCenterX, textY, dateWeight, datesActual, fontObj.family, tcObj.id);
    }
    y = nameRowTop + nameRowH;
    if (hasSub) {
      y = Math.max(y + cm(gapCm * 1.3) + subActual, ch - cm(2.2));
      ctx.textAlign = "center";
      paintInscriptionLine(ctx, sub, cw / 2, y, subWeight, subActual, fontObj.family, tcObj.id);
    }
    return cv;
  }
  function makeInscriptionTexture(cfg, planeW, planeH, sourcePartId) {
    const cv = paintInscriptionCanvas(cfg, planeW, planeH, sourcePartId);
    const tex = new THREE.CanvasTexture(cv);
    tex.userData.inscriptionTexture = true;
    tex.encoding = THREE.sRGBEncoding;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = 16;
    tex.generateMipmaps = true;
    tex.needsUpdate = true;
    return tex;
  }
  function makePillarOrnamentTexture(cfg, planeW, planeH) {
    const cv = document.createElement("canvas");
    const cw = 512;
    const ch = Math.max(256, Math.round(cw * (planeH / planeW)));
    cv.width = cw;
    cv.height = ch;
    const ctx = cv.getContext("2d");
    const tcObj = window.TEXT_COLORS.find((c) => c.id === cfg.textColor) || window.TEXT_COLORS[0];
    const shapeDef = (window.SHAPES || []).find((s) => s.id === cfg.shape);
    const asset = cfg.sourceModel === "jednohrob-premium-20261003" ? null : shapeDef && shapeDef.ornamentAsset;
    const ornamentType = cfg.ornamentType || "none";
    const drawImg = (src, desiredH) => {
      const a = loadImageAsset(src);
      let hpx = desiredH;
      if (a.loaded && a.image) {
        const asp = (a.image.naturalWidth || 1) / (a.image.naturalHeight || 1);
        hpx = Math.min(hpx, cw * 0.86 / asp);
      }
      drawLeftOrnament(ctx, cw / 2, Math.max(ch * 0.06, ch * 0.4 - hpx / 2), hpx, "rgba(248,246,240,0.9)", src);
    };
    if (asset) {
      drawImg(asset, ch * 0.86);
    } else if (ornamentType === "cross") {
      const hpx = Math.min(ch * 0.62, cw * 0.82 / 0.36);
      drawLeftCross(ctx, cw / 2, Math.max(ch * 0.08, ch * 0.36 - hpx / 2), hpx, tcObj.id);
    } else if (ornamentType === "rose") {
      drawImg("assets/rose-engraving-white.png", ch * 0.72);
    }
    const tex = new THREE.CanvasTexture(cv);
    tex.userData.inscriptionTexture = true;
    tex.encoding = THREE.sRGBEncoding;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = 16;
    tex.generateMipmaps = true;
    tex.needsUpdate = true;
    return tex;
  }
  function addInscriptionToGLB(group, cfg, box) {
    if (cfg.sourceModel === "jednohrob-premium-20261003" && cfg.shape === "atyp-05") {
      group.traverse((node) => {
        if (!node.isMesh || !node.userData.sourceHeadstoneRole) return;
        const bounds = new THREE.Box3().setFromObject(node);
        const size2 = bounds.getSize(new THREE.Vector3());
        const center2 = bounds.getCenter(new THREE.Vector3());
        const pillar = node.userData.sourceHeadstoneRole === "pillar";
        const map = pillar ? makePillarOrnamentTexture(cfg, size2.x, size2.y) : makeInscriptionTexture({ ...cfg, shape: "rovny", ornamentType: "none" }, size2.x, size2.y);
        const plane2 = new THREE.Mesh(new THREE.PlaneGeometry(size2.x, size2.y), new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
        plane2.userData.isInscription = true;
        plane2.position.set(center2.x, center2.y, bounds.max.z + 5e-3);
        group.add(plane2);
      });
      return;
    }
    if (!box || box.isEmpty()) return;
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const sourceDesign = sourceHeadstoneDesign(cfg);
    if (sourceDesign) {
      sourceDesign.parts.filter((part) => part.inscription !== false && (part.role === "plate" || part.role === "pillar")).forEach((part) => {
        const plane2 = new THREE.Mesh(new THREE.PlaneGeometry(size.x, size.y), new THREE.MeshBasicMaterial({
          map: makeInscriptionTexture(cfg, size.x, size.y, part.id),
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide
        }));
        plane2.userData.isInscription = true;
        plane2.userData.headstonePartId = part.id;
        plane2.userData.headstoneRole = part.role;
        plane2.position.set(center.x, center.y, box.max.z + (part.frontOffsetMm || 0) / 1e3 + 2e-3);
        group.add(plane2);
      });
      return;
    }
    const planeW = size.x;
    const planeH = size.y;
    const planeGeo = new THREE.PlaneGeometry(planeW, planeH);
    const planeMat = new THREE.MeshBasicMaterial({
      map: makeInscriptionTexture(cfg, planeW, planeH),
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.userData.isInscription = true;
    plane.position.set(center.x, center.y, box.max.z + 5e-3);
    group.add(plane);
    const splitDef = (window.SHAPES || []).find((s) => s.id === cfg.shape && s.split && !s.splitGapOnly);
    if (cfg.type === "dvojhrob" && splitDef) {
      const pw = SPLIT_DH.pillar * size.x * 0.92;
      const ph = SPLIT_DH.pillarTop * size.y;
      const pMat = new THREE.MeshBasicMaterial({
        map: makePillarOrnamentTexture(cfg, pw, ph),
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const pPlane = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), pMat);
      pPlane.userData.isInscription = true;
      pPlane.position.set(center.x, box.min.y + ph / 2, box.max.z + (SPLIT_DH.pillarD - SPLIT_DH.plateD) + 5e-3);
      group.add(pPlane);
    }
  }
  let treeBarkBumpTexture = null;
  function makeTreeBarkBumpTexture() {
    if (treeBarkBumpTexture) return treeBarkBumpTexture;
    const cv = document.createElement("canvas");
    cv.width = 256;
    cv.height = 1024;
    const ctx = cv.getContext("2d"), pixels = ctx.createImageData(cv.width, cv.height);
    for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) {
      const phase = x * 0.27 + Math.sin(y * 0.012) * 2.2 + Math.sin(y * 0.039 + x * 0.015) * 0.9;
      const ridge = Math.pow(Math.abs(Math.sin(phase)), 6);
      const fine = Math.sin(x * 1.19 + y * 0.31) * Math.cos(x * 0.23 - y * 0.73);
      const value = Math.max(0, Math.min(255, 125 + ridge * 78 + fine * 14));
      const i = (y * cv.width + x) * 4;
      pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = value;
      pixels.data[i + 3] = 255;
    }
    ctx.putImageData(pixels, 0, 0);
    treeBarkBumpTexture = new THREE.CanvasTexture(cv);
    treeBarkBumpTexture.wrapS = treeBarkBumpTexture.wrapT = THREE.RepeatWrapping;
    treeBarkBumpTexture.repeat.set(4, 1);
    treeBarkBumpTexture.anisotropy = 4;
    return treeBarkBumpTexture;
  }
  function makeTreeHonedMaterial(color = 6386043, bark = false) {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color).convertSRGBToLinear(),
      roughness: 0.84,
      metalness: 0,
      bumpMap: bark ? makeTreeBarkBumpTexture() : null,
      bumpScale: 18e-4,
      clearcoat: 0,
      envMapIntensity: 0.1,
      side: THREE.DoubleSide
    });
  }
  function makeTreeTrunkSurface(part, w, h) {
    const positions = [], uvs = [], colors = [], indices = [];
    const rows = 256, columns = 32;
    let previous = null;
    for (let row = 1; row < rows; row++) {
      const y = row / rows, spans = sourceIntervalsAtY(part, y);
      if (!spans.length) {
        previous = null;
        continue;
      }
      const [lo, hi] = spans.reduce((best, span) => span[1] - span[0] > best[1] - best[0] ? span : best);
      if (hi - lo < 1e-3) {
        previous = null;
        continue;
      }
      const start = positions.length / 3;
      for (let column = 0; column <= columns; column++) {
        const t = column / columns, x = lo + (hi - lo) * t;
        const furrow = Math.sin(t * 37 + Math.sin(y * 29) * 1.1);
        const bulge = Math.sin(Math.PI * t) * 65e-4;
        positions.push((x - 0.5) * w, (1 - y) * h, 25e-5 + bulge + furrow * 45e-5 * Math.sin(Math.PI * t));
        uvs.push(t * (hi - lo) * w, y * h);
        const shade = 0.84 + 0.07 * Math.sin(t * 37 + y * 9) + 0.035 * Math.sin(t * 91 - y * 73);
        colors.push(shade, shade, shade);
        if (previous !== null && column < columns) {
          const a = previous + column, b = start + column;
          indices.push(a, b, a + 1, b, b + 1, a + 1);
        }
      }
      previous = start;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }
  function addTreeRelief(group, cfg, box) {
    const w = box.max.x - box.min.x, h = box.max.y - box.min.y;
    const cx = (box.min.x + box.max.x) / 2;
    const relief = new THREE.Group();
    const stone = makeTreeHonedMaterial(), ridge = makeTreeHonedMaterial(8885918);
    const groove = makeTreeHonedMaterial(3755095);
    const point = (x, y, z = 0.012) => new THREE.Vector3(cx + (x - 0.5) * w, box.min.y + (1 - y) * h, box.max.z + z);
    function rib(points, radius, mat = stone, z = 0.012) {
      const curve = new THREE.CatmullRomCurve3(points.map((p) => point(p[0], p[1], z)), false, "centripetal");
      const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(12, points.length * 7), radius, 5, false), mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.skipAutoTexture = true;
      relief.add(mesh);
    }
    const trunk = [[0.235, 1], [0.28, 0.91], [0.287, 0.81], [0.26, 0.7], [0.205, 0.57], [0.145, 0.44], [0.1, 0.32], [0.105, 0.23], [0.17, 0.14], [0.26, 0.08], [0.32, 0.055]];
    for (let i = 0; i < 14; i++) {
      const offset = (i - 6.5) * 45e-4;
      rib(
        trunk.map(([x, y], j) => [x + offset * (1 - j / 16) + Math.sin(j * 0.9 + i) * 25e-4, y]),
        i % 3 === 0 ? 13e-4 : 65e-5,
        i % 2 ? ridge : groove,
        0.011 + Math.sin(i * Math.PI / 13) * 2e-3
      );
    }
    const branches = [
      [[0.105, 0.29], [0.155, 0.21], [0.22, 0.17], [0.285, 0.145]],
      [[0.15, 0.43], [0.185, 0.39], [0.205, 0.35], [0.25, 0.32]],
      [[0.205, 0.58], [0.23, 0.53], [0.27, 0.5], [0.31, 0.49]],
      [[0.26, 0.7], [0.27, 0.63], [0.265, 0.59]],
      [[0.145, 0.44], [0.09, 0.41], [0.055, 0.375]],
      [[0.105, 0.3], [0.072, 0.27], [0.048, 0.215]],
      [[0.18, 0.14], [0.255, 0.09], [0.34, 0.075], [0.43, 0.085], [0.51, 0.115]],
      [[0.19, 0.385], [0.23, 0.365], [0.27, 0.365]],
      [[0.245, 0.525], [0.285, 0.54], [0.325, 0.56]],
      [[0.31, 0.08], [0.34, 0.115], [0.36, 0.155]]
    ];
    branches.forEach((branch, i) => {
      rib(branch, i === 6 ? 45e-4 : 34e-4, stone);
      rib(branch, 9e-4, ridge, 0.016);
    });
    function leaf(x, y, dx, dy, width = 0.014) {
      const start = point(x, y, 0.015), end = point(x + dx, y + dy, 0.015);
      const axis = end.clone().sub(start), length = axis.length();
      const side = new THREE.Vector3(-axis.y, axis.x, 0).normalize();
      const positions = [], indices = [];
      const rows = 20;
      for (let i = 0; i <= rows; i++) {
        const t = i / rows, middle = start.clone().addScaledVector(axis, t);
        const breadth = width * w * Math.pow(Math.sin(Math.PI * t), 0.72) * (i % 2 ? 0.89 : 1);
        [-1, 0, 1].forEach((s) => {
          const p = middle.clone().addScaledVector(side, s * breadth);
          p.z += s === 0 ? 4e-3 * Math.sin(Math.PI * t) : 3e-4 + Math.sin(t * Math.PI) * 5e-4;
          positions.push(p.x, p.y, p.z);
        });
        if (i < rows) for (let k = 0; k < 2; k++) {
          const a = i * 3 + k, b = a + 3;
          indices.push(a, b, a + 1, b, b + 1, a + 1);
        }
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      const mesh = new THREE.Mesh(geometry, stone);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.skipAutoTexture = true;
      relief.add(mesh);
      rib([[x, y], [x + dx * 0.48, y + dy * 0.48], [x + dx, y + dy]], 65e-5, ridge, 0.019);
      for (let i = 3; i < 18; i += 3) {
        const t = i / rows, middle = start.clone().addScaledVector(axis, t);
        [-1, 1].forEach((s) => {
          const edge = start.clone().addScaledVector(axis, Math.min(1, t + 0.11)).addScaledVector(side, s * width * w * Math.sin(Math.PI * (t + 0.11)) * 0.85);
          const norm = (p) => [(p.x - cx) / w + 0.5, 1 - (p.y - box.min.y) / h];
          rib([norm(middle), norm(edge)], 35e-5, groove, 0.018);
        });
      }
    }
    [
      [0.22, 0.17, 0.035, -0.055],
      [0.22, 0.17, 0.055, 0.018],
      [0.28, 0.145, 0.045, -0.026],
      [0.18, 0.21, -0.025, -0.055],
      [0.18, 0.21, 0.052, 0.018],
      [0.2, 0.35, -0.018, -0.066],
      [0.2, 0.35, 0.055, 0.025],
      [0.25, 0.32, 0.045, -0.035],
      [0.18, 0.395, 0.053, -0.02],
      [0.185, 0.39, -0.027, -0.036],
      [0.27, 0.5, 0.055, 0.034],
      [0.27, 0.5, 0.015, -0.057],
      [0.31, 0.49, 0.025, 0.035],
      [0.265, 0.59, 0.052, 0.025],
      [0.265, 0.59, -5e-3, -0.049],
      [0.26, 0.09, 0.012, 0.06],
      [0.3, 0.078, 0.04, 0.04],
      [0.34, 0.075, 0.035, 0.055],
      [0.395, 0.08, 0.02, 0.05],
      [0.43, 0.085, 0.042, 0.045],
      [0.48, 0.1, 0.055, 0.031],
      [0.27, 0.365, 0.04, -0.03],
      [0.27, 0.365, 0.05, 0.029],
      [0.325, 0.56, 0.034, 0.036],
      [0.36, 0.155, 0.043, 0.015],
      [0.36, 0.155, -0.018, 0.045]
    ].forEach((p) => leaf(...p));
    const batches = /* @__PURE__ */ new Map();
    relief.children.forEach((node) => {
      const geo = node.geometry.index ? node.geometry.toNonIndexed() : node.geometry;
      if (!batches.has(node.material)) batches.set(node.material, []);
      batches.get(node.material).push(geo);
    });
    relief.clear();
    batches.forEach((geometries, material) => {
      const count = geometries.reduce((n, g) => n + g.attributes.position.count, 0);
      const positions = new Float32Array(count * 3), normals = new Float32Array(count * 3);
      let offset = 0;
      geometries.forEach((g) => {
        positions.set(g.attributes.position.array, offset);
        normals.set(g.attributes.normal.array, offset);
        offset += g.attributes.position.array.length;
        g.dispose();
      });
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geo.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
      const mesh = new THREE.Mesh(geo, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      tagComponentMesh(mesh, "napisova_deska", material);
      mesh.userData.skipAutoTexture = true;
      mesh.userData.headstoneRole = "relief";
      relief.add(mesh);
    });
    group.add(relief);
  }
  function reshapeDeska(group, deskaNode, cfg, box) {
    if (!box || box.isEmpty()) return;
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    deskaNode.traverse((child) => {
      if (child.isMesh) child.visible = false;
    });
    const w = size.x, h = size.y, d = Math.max(0.04, size.z);
    const sourceDesign = sourceHeadstoneDesign(cfg);
    if (sourceDesign) {
      sourceDesign.parts.forEach((part) => {
        const mat2 = part.role === "relief" ? makeTreeHonedMaterial(6386043, true) : getCompMat({ ...cfg, materials: {
          ...cfg.materials,
          napisova_deska: sourcePartMaterialId(cfg, sourceDesign, part)
        } }, "napisova_deska");
        const shape2 = sourcePartShape(part, w, h);
        const depth = (part.depthMm || 60) / 1e3;
        const bevel = 12e-4;
        const geo2 = new THREE.ExtrudeGeometry(shape2, {
          depth: depth - 2 * bevel,
          bevelEnabled: true,
          bevelThickness: bevel,
          bevelSize: bevel,
          bevelOffset: -bevel,
          bevelSegments: 2,
          curveSegments: 1
        });
        geo2.translate(0, 0, -depth + bevel);
        const mesh = new THREE.Mesh(geo2, part.role === "relief" ? [mat2, getCompMat(cfg, "napisova_deska")] : mat2);
        mesh.position.set(center.x, box.min.y, box.max.z + (part.frontOffsetMm || 0) / 1e3);
        tagComponentMesh(mesh, "napisova_deska", mat2);
        mesh.userData.headstonePartId = part.id;
        mesh.userData.headstoneRole = part.role;
        if (part.role === "relief") mesh.userData.skipAutoTexture = true;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
        if (part.role === "relief") {
          const skinMat = mat2.clone();
          skinMat.vertexColors = true;
          const skin = new THREE.Mesh(makeTreeTrunkSurface(part, w, h), skinMat);
          skin.position.copy(mesh.position);
          tagComponentMesh(skin, "napisova_deska", skinMat);
          skin.userData.headstonePartId = part.id;
          skin.userData.headstoneRole = "relief";
          skin.userData.skipAutoTexture = true;
          skin.castShadow = true;
          skin.receiveShadow = true;
          group.add(skin);
        }
      });
      if (sourceDesign.decoration === "tree-relief") addTreeRelief(group, cfg, box);
      return;
    }
    const splitDef = (window.SHAPES || []).find((x) => x.id === cfg.shape && x.split);
    if (splitDef) {
      const parts = makeSplitDeskaShapes(splitDef, w, h);
      const mat2 = getCompMat(cfg, "napisova_deska");
      const mkMesh = (shapes, depth, frontZ) => {
        const g = new THREE.ExtrudeGeometry(shapes, { depth, bevelEnabled: false, curveSegments: 48 });
        g.translate(0, 0, -depth);
        const m = new THREE.Mesh(g, mat2);
        m.position.set(center.x, box.min.y, frontZ);
        tagComponentMesh(m, "napisova_deska", mat2);
        m.castShadow = true;
        m.receiveShadow = true;
        return m;
      };
      group.add(mkMesh(parts.plates, SPLIT_DH.plateD, box.max.z));
      if (parts.pillar) {
        group.add(mkMesh([parts.pillar], SPLIT_DH.pillarD, box.max.z + (SPLIT_DH.pillarD - SPLIT_DH.plateD)));
      }
      return;
    }
    const shape = makeSteleShape(cfg.shape, w, h);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: d,
      bevelEnabled: false,
      curveSegments: 48
    });
    geo.computeBoundingBox();
    const gh = geo.boundingBox.max.y - geo.boundingBox.min.y;
    if (gh > 1e-4) geo.scale(1, h / gh, 1);
    geo.translate(0, 0, -d / 2);
    const mat = getCompMat(cfg, "napisova_deska");
    const deska = new THREE.Mesh(geo, mat);
    deska.position.set(center.x, box.min.y, center.z);
    tagComponentMesh(deska, "napisova_deska", mat);
    deska.castShadow = true;
    deska.receiveShadow = true;
    group.add(deska);
  }
  const SPLIT_DH = { pillar: 0.16, gapOnly: 0.055, outerTop: 0.84, pillarTop: 1.07, plateD: 0.06, pillarD: 0.1 };
  function makeSplitDeskaShapes(def, w, h) {
    const gapOnly = !!def.splitGapOnly;
    const xInAbs = (gapOnly ? SPLIT_DH.gapOnly : SPLIT_DH.pillar / 2) * w;
    const plates = [];
    [-1, 1].forEach((side) => {
      const xIn = side * xInAbs, xOut = side * (w / 2);
      if (/vlna/.test(def.id)) {
        const vlnaDef = (window.SHAPES || []).find((x) => x.id === "vlna-sikma");
        const plateW = Math.abs(xOut - xIn);
        const vs = vlnaDef && vlnaDef.svgPath ? shapeFromSvgPath(vlnaDef.svgPath, plateW, h) : null;
        if (vs) {
          const cx = (xIn + xOut) / 2;
          const pts = vs.getPoints(160);
          const s2 = new THREE.Shape();
          pts.forEach((q, i) => {
            const x = cx + (side === 1 ? q.x : -q.x);
            if (i === 0) s2.moveTo(x, q.y);
            else s2.lineTo(x, q.y);
          });
          s2.closePath();
          plates.push(s2);
          return;
        }
      }
      const s = new THREE.Shape();
      s.moveTo(xIn, 0);
      s.lineTo(xOut, 0);
      if (/sikm/.test(def.id)) {
        s.lineTo(xOut, h * SPLIT_DH.outerTop);
        s.lineTo(xIn, h);
      } else if (/vlna/.test(def.id)) {
        s.lineTo(xOut, h * 0.8);
        s.bezierCurveTo(
          xOut + (xIn - xOut) * 0.3,
          h * 0.99,
          xOut + (xIn - xOut) * 0.58,
          h * 0.8,
          xIn,
          h
        );
      } else {
        s.lineTo(xOut, h);
        s.lineTo(xIn, h);
      }
      s.closePath();
      plates.push(s);
    });
    let pillar = null;
    if (!gapOnly) {
      const pw = SPLIT_DH.pillar * w;
      const ph = h * SPLIT_DH.pillarTop;
      pillar = new THREE.Shape();
      pillar.moveTo(-pw / 2, 0);
      pillar.lineTo(pw / 2, 0);
      pillar.lineTo(pw / 2, ph);
      pillar.lineTo(-pw / 2, ph);
      pillar.closePath();
    }
    return { plates, pillar };
  }
  const shapeScanCache = {};
  function shapeScanFor(shapeDef) {
    if (!shapeDef || !shapeDef.svgPath || !THREE.SVGLoader) return null;
    if (shapeScanCache[shapeDef.id]) return shapeScanCache[shapeDef.id];
    try {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg"><path d="' + shapeDef.svgPath + '"/></svg>';
      const parsed = new THREE.SVGLoader().parse(svg);
      let best = null, bestArea = -1;
      parsed.paths.forEach((p) => {
        THREE.SVGLoader.createShapes(p).forEach((sh) => {
          const ps = sh.getPoints(600);
          let mnx = Infinity, mxx = -Infinity, mny = Infinity, mxy = -Infinity;
          ps.forEach((q) => {
            if (q.x < mnx) mnx = q.x;
            if (q.x > mxx) mxx = q.x;
            if (q.y < mny) mny = q.y;
            if (q.y > mxy) mxy = q.y;
          });
          const area = (mxx - mnx) * (mxy - mny);
          if (area > bestArea) {
            bestArea = area;
            best = { ps, mnx, mxx, mny, mxy };
          }
        });
      });
      if (!best) return null;
      const N = 96;
      const sw = best.mxx - best.mnx, sh2 = best.mxy - best.mny;
      if (sw <= 0 || sh2 <= 0) return null;
      const rowsArr = new Array(N);
      for (let i = 0; i < N; i++) {
        const y = best.mny + (i + 0.5) / N * sh2;
        const xs = [];
        const pts = best.ps;
        for (let k = 0; k < pts.length; k++) {
          const a = pts[k], b = pts[(k + 1) % pts.length];
          if (a.y <= y && b.y > y || b.y <= y && a.y > y) {
            const t = (y - a.y) / (b.y - a.y);
            xs.push(a.x + t * (b.x - a.x));
          }
        }
        if (xs.length >= 2) {
          xs.sort((p, q) => p - q);
          rowsArr[i] = { x0: (xs[0] - best.mnx) / sw, x1: (xs[xs.length - 1] - best.mnx) / sw };
        } else {
          rowsArr[i] = null;
        }
      }
      for (let i = 0; i < N; i++) if (!rowsArr[i]) rowsArr[i] = rowsArr[i - 1] || rowsArr[i + 1] || { x0: 0, x1: 1 };
      const fn = (y0N, y1N) => {
        const i0 = Math.max(0, Math.floor(Math.min(y0N, y1N) * N));
        const i1 = Math.min(N - 1, Math.ceil(Math.max(y0N, y1N) * N));
        let X0 = 0, X1 = 1;
        for (let i = i0; i <= i1; i++) {
          X0 = Math.max(X0, rowsArr[i].x0);
          X1 = Math.min(X1, rowsArr[i].x1);
        }
        return { x0: X0, x1: X1 };
      };
      shapeScanCache[shapeDef.id] = fn;
      return fn;
    } catch (e) {
      return null;
    }
  }
  function shapeFromSvgPath(d, w, h) {
    if (!d || !THREE.SVGLoader) return null;
    try {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg"><path d="' + d + '"/></svg>';
      const parsed = new THREE.SVGLoader().parse(svg);
      let best = null, bestArea = -1;
      parsed.paths.forEach((p) => {
        THREE.SVGLoader.createShapes(p).forEach((sh2) => {
          const ps = sh2.getPoints(400);
          let mnx = Infinity, mxx = -Infinity, mny = Infinity, mxy = -Infinity;
          ps.forEach((q) => {
            if (q.x < mnx) mnx = q.x;
            if (q.x > mxx) mxx = q.x;
            if (q.y < mny) mny = q.y;
            if (q.y > mxy) mxy = q.y;
          });
          const area = (mxx - mnx) * (mxy - mny);
          if (area > bestArea) {
            bestArea = area;
            best = { ps, mnx, mxx, mny, mxy };
          }
        });
      });
      if (!best) return null;
      const sw = best.mxx - best.mnx, sh = best.mxy - best.mny;
      if (sw <= 0 || sh <= 0) return null;
      const out = new THREE.Shape();
      best.ps.forEach((q, i) => {
        const nx = ((q.x - best.mnx) / sw - 0.5) * w;
        const ny = (1 - (q.y - best.mny) / sh) * h;
        if (i === 0) out.moveTo(nx, ny);
        else out.lineTo(nx, ny);
      });
      out.closePath();
      return out;
    } catch (e) {
      return null;
    }
  }
  function svgOutlineBbox(d) {
    if (!d || !THREE.SVGLoader) return null;
    try {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg"><path d="' + d + '"/></svg>';
      const parsed = new THREE.SVGLoader().parse(svg);
      let best = null, bestArea = -1;
      parsed.paths.forEach((p) => {
        THREE.SVGLoader.createShapes(p).forEach((sh) => {
          const ps = sh.getPoints(400);
          let mnx = Infinity, mxx = -Infinity, mny = Infinity, mxy = -Infinity;
          ps.forEach((q) => {
            if (q.x < mnx) mnx = q.x;
            if (q.x > mxx) mxx = q.x;
            if (q.y < mny) mny = q.y;
            if (q.y > mxy) mxy = q.y;
          });
          const area = (mxx - mnx) * (mxy - mny);
          if (area > bestArea) {
            bestArea = area;
            best = { mnx, mxx, mny, mxy };
          }
        });
      });
      return best;
    } catch (e) {
      return null;
    }
  }
  function detailShapesFromSvgPath(d, ref, w, h) {
    if (!d || !ref || !THREE.SVGLoader) return [];
    const sw = ref.mxx - ref.mnx, sh = ref.mxy - ref.mny;
    if (sw <= 0 || sh <= 0) return [];
    try {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg"><path d="' + d + '"/></svg>';
      const parsed = new THREE.SVGLoader().parse(svg);
      const shapes = [];
      parsed.paths.forEach((p) => {
        THREE.SVGLoader.createShapes(p).forEach((sh0) => {
          const ps = sh0.getPoints(400);
          if (ps.length < 3) return;
          const out = new THREE.Shape();
          ps.forEach((q, i) => {
            const nx = ((q.x - ref.mnx) / sw - 0.5) * w;
            const ny = (1 - (q.y - ref.mny) / sh) * h;
            if (i === 0) out.moveTo(nx, ny);
            else out.lineTo(nx, ny);
          });
          out.closePath();
          shapes.push(out);
        });
      });
      return shapes;
    } catch (e) {
      return [];
    }
  }
  function buildHonedDetailMesh(cfg, w, h) {
    const def = (window.SHAPES || []).find((x) => x.id === cfg.shape);
    if (!def || !def.detailPath || !def.svgPath) return null;
    const ref = svgOutlineBbox(def.svgPath);
    if (!ref) return null;
    const shapes = detailShapesFromSvgPath(def.detailPath, ref, w, h);
    if (!shapes.length) return null;
    const geo = new THREE.ShapeGeometry(shapes, 24);
    const honed = getCompMat(cfg, "napisova_deska").clone();
    honed.map = null;
    honed.color = new THREE.Color(16777215);
    honed.transparent = true;
    honed.opacity = 0.5;
    honed.depthWrite = false;
    if ("normalMap" in honed) honed.normalMap = null;
    if ("roughnessMap" in honed) honed.roughnessMap = null;
    honed.roughness = 1;
    honed.metalness = 0;
    if ("clearcoat" in honed) honed.clearcoat = 0;
    if ("envMapIntensity" in honed) honed.envMapIntensity = 0.15;
    honed.polygonOffset = true;
    honed.polygonOffsetFactor = -2;
    honed.polygonOffsetUnits = -2;
    const mesh = new THREE.Mesh(geo, honed);
    tagComponentMesh(mesh, "napisova_deska", honed);
    mesh.userData.headstonePartId = "honed-detail";
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    return mesh;
  }
  function addHonedDetailToGLB(group, cfg, box) {
    if (!box || box.isEmpty()) return;
    if (sourceHeadstoneDesign(cfg)) return;
    const size = new THREE.Vector3(), center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const mesh = buildHonedDetailMesh(cfg, size.x, size.y);
    if (!mesh) return;
    mesh.position.set(center.x, box.min.y, box.max.z + 45e-4);
    group.traverse((node) => {
      var _a;
      if (!mesh.userData.stoneUVReference && node.isMesh && node.visible && node.userData.compId === "napisova_deska" && !((_a = node.material) == null ? void 0 : _a.transparent)) {
        mesh.userData.stoneUVReference = node;
      }
    });
    group.add(mesh);
  }
  function makeSteleShape(shape, w, h) {
    const def = (window.SHAPES || []).find((x) => x.id === shape);
    if (def && def.svgPath) {
      const svgShape = shapeFromSvgPath(def.svgPath, w, h);
      if (svgShape) return svgShape;
    }
    const s = new THREE.Shape();
    const hw = w / 2;
    if (shape === "rovny") {
      s.moveTo(-hw, 0);
      s.lineTo(hw, 0);
      s.lineTo(hw, h);
      s.lineTo(-hw, h);
      s.lineTo(-hw, 0);
    } else if (shape === "zkosene") {
      const inset = 0.05;
      s.moveTo(-hw + inset, 0);
      s.lineTo(hw - inset, 0);
      s.lineTo(hw, h);
      s.lineTo(-hw, h);
      s.lineTo(-hw + inset, 0);
    } else if (shape === "spicka") {
      const tipH = h * 0.18;
      s.moveTo(-hw, 0);
      s.lineTo(hw, 0);
      s.lineTo(hw, h - tipH);
      s.lineTo(0, h);
      s.lineTo(-hw, h - tipH);
      s.lineTo(-hw, 0);
    } else if (shape === "vlna") {
      s.moveTo(-hw, 0);
      s.lineTo(hw, 0);
      s.lineTo(hw, h * 0.85);
      s.bezierCurveTo(hw * 0.5, h * 0.78, hw * 0.15, h, 0, h * 0.88);
      s.bezierCurveTo(-hw * 0.15, h * 0.78, -hw * 0.5, h, -hw, h * 0.85);
      s.lineTo(-hw, 0);
    } else if (shape === "vlna-sikma") {
      s.moveTo(-hw, 0);
      s.lineTo(hw, 0);
      s.lineTo(hw, h * 0.6);
      s.bezierCurveTo(hw * 0.55, h * 0.78, hw * 0.2, h * 0.96, -hw * 0.3, h * 0.99);
      s.bezierCurveTo(-hw * 0.6, h * 1, -hw * 0.92, h * 0.99, -hw, h * 0.82);
      s.lineTo(-hw, 0);
    } else {
      s.moveTo(-hw, 0);
      s.lineTo(hw, 0);
      s.lineTo(hw, h * 0.78);
      s.absarc(0, h * 0.78, hw, 0, Math.PI, false);
      s.lineTo(-hw, 0);
    }
    return s;
  }
  function buildProcedural(cfg) {
    const group = new THREE.Group();
    const deskaMat = getCompMat(cfg, "napisova_deska");
    const podlozkaMat = getCompMat(cfg, "podlozka_1");
    const soklMat = getCompMat(cfg, "sokl");
    const ramMat = getCompMat(cfg, "ram");
    const kryciMat = getCompMat(cfg, "kryci_deska");
    const wScale = cfg.dimW / 110;
    const dScale = cfg.dimD / 200;
    const soklW = 1.05 * wScale, soklH = 0.06, soklD = 0.55;
    if (cfg.hasSokl !== false) {
      for (let i = 0; i < 3; i++) {
        const s = new THREE.Mesh(new THREE.BoxGeometry(soklW, soklH, soklD), soklMat);
        tagComponentMesh(s, "sokl", soklMat);
        s.position.set(0, soklH / 2 + i * soklH, -0.12);
        s.castShadow = true;
        s.receiveShadow = true;
        group.add(s);
      }
    }
    const soklTop = cfg.hasSokl === false ? 0 : 3 * soklH;
    const podH = 0.06;
    const podW = 0.9 * wScale, podD = 0.35;
    const podlozka = new THREE.Mesh(new THREE.BoxGeometry(podW, podH, podD), podlozkaMat);
    tagComponentMesh(podlozka, "podlozka_1", podlozkaMat);
    podlozka.position.set(0, soklTop + podH / 2, -0.12);
    podlozka.castShadow = true;
    podlozka.receiveShadow = true;
    group.add(podlozka);
    const deskaBase = soklTop + podH;
    const sourceDesign = sourceHeadstoneDesign(cfg);
    const w = sourceDesign && cfg.type !== "dvojhrob" ? Math.min(sourceDesign.widthMm / 1e3, cfg.dimW / 100 - 0.08) : sourceDesign ? 1.2 : 0.85 * (cfg.dimW / 110);
    const h = 1.25 * (cfg.type === "urnovy" ? 0.78 : 1);
    const d = 0.18;
    if (sourceDesign) {
      const box = new THREE.Box3(
        new THREE.Vector3(-w / 2, deskaBase, -0.21),
        new THREE.Vector3(w / 2, deskaBase + h, -0.03)
      );
      fitSourceHeadstoneBox(box, sourceDesign);
      reshapeDeska(group, new THREE.Group(), cfg, box);
      addInscriptionToGLB(group, cfg, box);
    } else {
      const shape = makeSteleShape(cfg.shape, w, h);
      const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: true, bevelThickness: 8e-3, bevelSize: 8e-3, bevelSegments: 2, curveSegments: 24 });
      geo.translate(0, 0, -d / 2);
      const deska = new THREE.Mesh(geo, deskaMat);
      tagComponentMesh(deska, "napisova_deska", deskaMat);
      deska.position.set(0, deskaBase, -0.12);
      deska.castShadow = true;
      deska.receiveShadow = true;
      group.add(deska);
      const honedProc = buildHonedDetailMesh(cfg, w, h);
      if (honedProc) {
        honedProc.position.set(0, deskaBase, -0.12 + d / 2 + 45e-4);
        group.add(honedProc);
      }
      const inscription = makeInscriptionMesh(cfg, w, h);
      inscription.position.set(0, deskaBase + h / 2, -0.12 + d / 2 + 0.012);
      group.add(inscription);
    }
    const fw = 1.7 * wScale, fd = 2.2 * dScale, ft = 0.08, fh = 0.1;
    const sides = [
      [fw, fh, ft, 0, fh / 2, fd / 2 - ft / 2],
      [fw, fh, ft, 0, fh / 2, -fd / 2 + ft / 2],
      [ft, fh, fd - ft * 2, fw / 2 - ft / 2, fh / 2, 0],
      [ft, fh, fd - ft * 2, -fw / 2 + ft / 2, fh / 2, 0]
    ];
    sides.forEach(([w2, h2, d2, x, y, z]) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w2, h2, d2), ramMat);
      tagComponentMesh(m, "ram", ramMat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      group.add(m);
    });
    if (cfg.hasCover === false) {
      const soil = new THREE.Mesh(new THREE.PlaneGeometry(fw - ft * 2.7, fd - ft * 2.7), makeFillMaterial(cfg));
      soil.rotation.x = -Math.PI / 2;
      soil.position.set(0, fh + 4e-3, 0);
      soil.userData.skipAutoTexture = true;
      soil.receiveShadow = true;
      group.add(soil);
    } else {
      const cover = new THREE.Mesh(new THREE.BoxGeometry(fw - ft * 2, 0.04, fd - ft * 2), kryciMat);
      tagComponentMesh(cover, "kryci_deska", kryciMat);
      cover.position.set(0, 0.04, 0.2);
      cover.receiveShadow = true;
      group.add(cover);
    }
    const acc = cfg.accessories || {};
    if (acc.vase) {
      const style = cfg.vaseStyle || "granit";
      const vaseMat = makeAccessoryMaterial(cfg, style);
      const x = -0.5 * wScale, z = 0.1;
      if (style === "granit") {
        const v = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.22, 24), vaseMat);
        tagComponentMesh(v, "napisova_deska", vaseMat);
        v.position.set(x, 0.29, z);
        v.castShadow = true;
        group.add(v);
      } else {
        const accentMat = makeAccessoryAccentMaterial(style);
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.2, 0.14), vaseMat);
        body.position.set(x, 0.29, z);
        body.castShadow = true;
        body.userData.skipAutoTexture = true;
        const rim = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.018, 0.16), accentMat);
        rim.position.set(x, 0.395, z);
        rim.userData.skipAutoTexture = true;
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.014, 0.17), accentMat);
        base.position.set(x, 0.195, z);
        base.userData.skipAutoTexture = true;
        group.add(body, rim, base);
      }
    }
    if (acc.lantern) {
      const style = cfg.lanternStyle || "granit";
      const x = 0.5 * wScale, z = 0.1;
      const lampMat = makeAccessoryMaterial(cfg, style);
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 16773320,
        emissive: 16757319,
        emissiveIntensity: 0.65,
        roughness: 0.25,
        metalness: 0,
        transparent: true,
        opacity: 0.85
      });
      if (style === "granit") {
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.06, 16), lampMat);
        tagComponentMesh(base, "napisova_deska", lampMat);
        base.position.set(x, 0.21, z);
        base.castShadow = true;
        const top = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.18, 0.13), glassMat);
        top.position.set(x, 0.33, z);
        top.castShadow = true;
        top.userData.skipAutoTexture = true;
        group.add(base, top);
      } else {
        const accentMat = makeAccessoryAccentMaterial(style);
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.16), lampMat);
        base.position.set(x, 0.205, z);
        base.castShadow = true;
        base.userData.skipAutoTexture = true;
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.16, 0.13), lampMat);
        body.position.set(x, 0.31, z);
        body.castShadow = true;
        body.userData.skipAutoTexture = true;
        const glass = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.11, 0.1), glassMat);
        glass.position.set(x, 0.3, z);
        glass.userData.skipAutoTexture = true;
        const roof = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.05, 4), accentMat);
        roof.rotation.y = Math.PI / 4;
        roof.position.set(x, 0.415, z);
        roof.castShadow = true;
        roof.userData.skipAutoTexture = true;
        group.add(base, body, glass, roof);
      }
    }
    finishTexturedStoneMeshes(group);
    return group;
  }
  function makeInscriptionMesh(cfg, w, h) {
    const planeW = w;
    const planeH = h;
    const planeGeo = new THREE.PlaneGeometry(planeW, planeH);
    const planeMat = new THREE.MeshBasicMaterial({
      map: makeInscriptionTexture(cfg, planeW, planeH),
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.userData.isInscription = true;
    return mesh;
  }
  function createPreviewRenderLoop(controls, renderer, scene, camera) {
    let frame = null, stopped = false;
    function requestRender() {
      if (stopped || frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        if (stopped) return;
        controls.update();
        renderer.render(scene, camera);
      });
    }
    controls.addEventListener("change", requestRender);
    return { requestRender, dispose() {
      stopped = true;
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      controls.removeEventListener("change", requestRender);
    } };
  }
  const CAMERA_PRESETS = {
    // Three-quarter view shows the assembly depth and its immediate setting.
    perspective: { offset: [2.6, 1.65, 3.5], fit: 1.18 },
    front: { offset: [0, 0.36, 2.55] },
    side: { offset: [2.45, 0.36, 0.7] },
    top: { offset: [0, 2.7, 0.95] },
    // Detail nápisu: téměř zepředu (jen mírně shora) a těsný fit — záběr se
    // fituje přímo na nápisovou desku (viz applyCameraFit), takže je v okně
    // opravdu jen ona. Menší fit = menší okraj kolem desky.
    detail: { offset: [0, 0.08, 1.2], fit: 1.08 }
  };
  function deskaInfoFor(group) {
    if (!group) return null;
    group.updateMatrixWorld(true);
    const box = new THREE.Box3();
    let found = false;
    group.traverse((c) => {
      if (c.isMesh && c.visible && c.userData && c.userData.compId === "napisova_deska") {
        c.updateWorldMatrix(true, false);
        box.union(new THREE.Box3().setFromObject(c));
        found = true;
      }
    });
    if (!found || box.isEmpty()) return null;
    const focus = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(focus);
    box.getSize(size);
    return { focus, size };
  }
  function visibleMonumentBounds(group) {
    const box = new THREE.Box3();
    group.updateMatrixWorld(true);
    group.traverseVisible((node) => {
      if (node.isMesh && node.geometry) {
        if (!node.geometry.boundingBox) node.geometry.computeBoundingBox();
        box.union(node.geometry.boundingBox.clone().applyMatrix4(node.matrixWorld));
      }
    });
    return box;
  }
  function frameMonumentGroup(group) {
    group.updateMatrixWorld(true);
    const box = visibleMonumentBounds(group);
    if (box.isEmpty()) return { focus: new THREE.Vector3(0, 0.7, 0), size: new THREE.Vector3(1, 1.4, 1) };
    const center = new THREE.Vector3();
    box.getCenter(center);
    group.position.x -= center.x;
    group.position.z -= center.z;
    group.position.y -= box.min.y;
    group.updateMatrixWorld(true);
    const framedBox = visibleMonumentBounds(group);
    const framedCenter = new THREE.Vector3();
    framedBox.getCenter(framedCenter);
    const size = new THREE.Vector3();
    framedBox.getSize(size);
    return { focus: new THREE.Vector3(0, framedCenter.y, 0), size };
  }
  const CAMERA_FOV = 38;
  const CAMERA_FIT = 1.24;
  function projectedFitSize(size, dir) {
    const s = size || new THREE.Vector3(1, 1.4, 1);
    const viewDir = dir.clone().normalize();
    const worldUp = Math.abs(viewDir.y) > 0.92 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(worldUp, viewDir).normalize();
    const up = new THREE.Vector3().crossVectors(viewDir, right).normalize();
    const half = new THREE.Vector3(s.x / 2, s.y / 2, s.z / 2);
    const projectedWidth = 2 * (Math.abs(right.x) * half.x + Math.abs(right.y) * half.y + Math.abs(right.z) * half.z);
    const projectedHeight = 2 * (Math.abs(up.x) * half.x + Math.abs(up.y) * half.y + Math.abs(up.z) * half.z);
    const projectedDepth = 2 * (Math.abs(viewDir.x) * half.x + Math.abs(viewDir.y) * half.y + Math.abs(viewDir.z) * half.z);
    return { horiz: projectedWidth, vert: projectedHeight, recede: projectedDepth };
  }
  const HERO_STUDIO_PRESET = { offset: [2.6, 1.5, 3.5], fit: 0.9 };
  function cameraPresetFor(angle, focus, size, aspect, sceneMode) {
    const gardenOverview = sceneMode === "cemetery" && angle === "perspective";
    const heroStudio = typeof window !== "undefined" && window.ADAMEK_EMBED_MODE === "hero" && sceneMode === "studio" && angle === "perspective";
    const preset = gardenOverview ? { offset: [2.4, 1.65, 3.8], fit: 1.17 } : heroStudio ? HERO_STUDIO_PRESET : CAMERA_PRESETS[angle] || CAMERA_PRESETS.front;
    const dir = new THREE.Vector3(...preset.offset).normalize();
    const s = size || new THREE.Vector3(1, 1.4, 1);
    const a = aspect || 1.5;
    const focusAdj = focus.clone();
    const { horiz, vert, recede } = projectedFitSize(s, dir);
    const tv = Math.tan(CAMERA_FOV / 2 * Math.PI / 180);
    const th = tv * a;
    const distV = vert / 2 / tv;
    const distH = horiz / 2 / th;
    const dist = Math.max(distV, distH) * (preset.fit || CAMERA_FIT) + recede / 2;
    return {
      pos: focusAdj.clone().add(dir.multiplyScalar(dist)),
      target: focusAdj.clone()
    };
  }
  function applyCameraFit(st, angle, animate) {
    if (!st || !st.camera || !st.controls) return;
    const revision = st.cameraFitRevision = (st.cameraFitRevision || 0) + 1;
    const useDeska = angle === "detail" && st.deskaFocus && st.deskaSize;
    const fitFocus = useDeska ? st.deskaFocus : st.modelFocus || new THREE.Vector3(0, 0.7, 0);
    const fitSize = useDeska ? st.deskaSize : st.modelSize || new THREE.Vector3(1, 1.4, 1);
    const preset = cameraPresetFor(
      angle || "front",
      fitFocus,
      fitSize,
      st.camera.aspect,
      st.sceneMode
    );
    if (!animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      st.controls.target.copy(preset.target);
      st.camera.position.copy(preset.pos);
      st.controls.update();
      return;
    }
    st.controls.autoRotate = false;
    const startPos = st.camera.position.clone();
    const endPos = preset.pos;
    const startTarget = st.controls.target.clone();
    const endTarget = preset.target;
    const duration = 280;
    const startTime = performance.now();
    function ease(x) {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }
    function animateFit() {
      if (st.cameraFitRevision !== revision) return;
      const t = Math.min(1, (performance.now() - startTime) / duration);
      const e = ease(t);
      st.camera.position.lerpVectors(startPos, endPos, e);
      st.controls.target.lerpVectors(startTarget, endTarget, e);
      st.controls.update();
      if (t < 1) requestAnimationFrame(animateFit);
    }
    animateFit();
  }
  function softenStoneReflections(group) {
    const materials = /* @__PURE__ */ new Map();
    group.traverse((node) => {
      if (!node.isMesh || node.userData.sourcePhysicalCross) return;
      const role = findNodeRoleDeep(node);
      if (!node.userData.compId && !node.userData.sourceAccessoryMaterial && (role == null ? void 0 : role.type) !== "comp" && (role == null ? void 0 : role.type) !== "acc") return;
      const soften = (material) => {
        if (!(material == null ? void 0 : material.isMeshStandardMaterial) || material.transparent || material.metalness > 0.3) return material;
        if (material.envMapIntensity <= 0.06 && (!("clearcoat" in material) || material.clearcoat === 0)) return material;
        if (!materials.has(material)) {
          const finish = material.clone();
          finish.envMapIntensity = Math.min(material.envMapIntensity, 0.06);
          if ("clearcoat" in finish) finish.clearcoat = 0;
          materials.set(material, finish);
        }
        return materials.get(material);
      };
      node.material = Array.isArray(node.material) ? node.material.map(soften) : soften(node.material);
    });
  }
  function StonePreview3D({ cfg, angle, onPick, hoverHint, sceneMode, exploded, selectedPart }) {
    const mountRef = useRef(null);
    const stateRef = useRef(null);
    const monumentRef = useRef(null);
    const angleRef = useRef(angle || "front");
    const glbSceneRef = useRef(null);
    const loadingModelUrlRef = useRef(null);
    const onPickRef = useRef(onPick);
    const hoverHintRef = useRef(hoverHint);
    useEffect(() => {
      onPickRef.current = onPick;
      hoverHintRef.current = hoverHint;
    });
    useEffect(() => {
      angleRef.current = angle || "front";
    }, [angle]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [fontsReady, setFontsReady] = useState(false);
    const [ornamentAssetsReady, setOrnamentAssetsReady] = useState(0);
    useEffect(() => {
      if (!document.fonts) {
        setFontsReady(true);
        return;
      }
      let cancelled = false;
      const engravingFonts = [
        "400 32px 'Byron RR Adamek'",
        "400 32px 'Snell Roundhand Adamek'",
        "400 32px 'Kokila Adamek'",
        "200 32px 'Inter'"
        // tenké moderní písmo (gravírování)
      ];
      Promise.all(engravingFonts.map((f) => document.fonts.load(f).catch(() => {
      }))).then(() => document.fonts.ready).then(() => {
        if (!cancelled) setFontsReady(true);
      });
      return () => {
        cancelled = true;
      };
    }, []);
    useEffect(() => {
      const onReady = () => setOrnamentAssetsReady((value) => value + 1);
      window.addEventListener("adamek:ornament-asset-ready", onReady);
      return () => window.removeEventListener("adamek:ornament-asset-ready", onReady);
    }, []);
    useEffect(() => {
      const mount = mountRef.current;
      if (!mount) return;
      let alive = true;
      const scene = new THREE.Scene();
      const w = mount.clientWidth, h = mount.clientHeight;
      const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
      camera.position.set(1.8, 1.3, 2.4);
      let renderer;
      try {
        const captureMode = /[?&]capture=1/.test(window.location.search);
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: captureMode });
      } catch (err) {
        console.error(err);
        setLoading(false);
        setLoadError("3D n\xE1hled se v tomto prohl\xED\u017Ee\u010Di nepoda\u0159ilo spustit. Zkuste obnovit str\xE1nku nebo pou\u017E\xEDt b\u011B\u017En\xFD prohl\xED\u017Ee\u010D s podporou WebGL.");
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.shadowMap.autoUpdate = false;
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      renderer.domElement.setAttribute("role", "img");
      renderer.domElement.setAttribute("aria-label", "3D n\xE1hled pomn\xEDku. Volby se ovl\xE1daj\xED v kroc\xEDch vlevo.");
      mount.appendChild(renderer.domElement);
      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minDistance = 0.75;
      controls.maxDistance = 12;
      controls.maxPolarAngle = Math.PI / 2 - 0.04;
      controls.enablePan = false;
      controls.target.set(0, 0.7, 0);
      controls.autoRotate = false;
      controls.autoRotateSpeed = 0.45;
      controls.addEventListener("start", () => {
        controls.autoRotate = false;
        const st = stateRef.current;
        if (st) st.cameraFitRevision = (st.cameraFitRevision || 0) + 1;
      });
      renderer.domElement.style.touchAction = "pan-y";
      const raycaster = new THREE.Raycaster();
      const pointerNDC = new THREE.Vector2();
      let downX = 0, downY = 0, downT = 0;
      const pickAt = (clientX, clientY) => {
        const root = monumentRef.current;
        if (!root) return null;
        const rect = renderer.domElement.getBoundingClientRect();
        pointerNDC.x = (clientX - rect.left) / rect.width * 2 - 1;
        pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointerNDC, camera);
        const hits = raycaster.intersectObject(root, true);
        for (const h2 of hits) {
          let visible = true;
          for (let p = h2.object; p && p !== root; p = p.parent) {
            if (p.visible === false) {
              visible = false;
              break;
            }
          }
          if (!visible) continue;
          let o = h2.object;
          while (o && o !== root) {
            if (o.userData && o.userData.compId) return { kind: "comp", id: o.userData.compId };
            if (o.userData && o.userData.accId) return { kind: "acc", id: o.userData.accId };
            o = o.parent;
          }
        }
        return null;
      };
      const tip = document.createElement("div");
      tip.style.cssText = "position:fixed;z-index:9999;pointer-events:none;display:none;padding:7px 11px;border-radius:10px;background:rgba(17,16,15,.9);color:#fff;font:600 12.5px/1.35 Inter,system-ui,sans-serif;box-shadow:0 8px 22px rgba(0,0,0,.28);max-width:200px;white-space:normal;overflow-wrap:break-word;text-align:center;";
      document.body.appendChild(tip);
      const hideTip = () => {
        tip.style.display = "none";
      };
      const showTip = (pick, clientX, clientY) => {
        tip.textContent = hoverHintRef.current ? hoverHintRef.current(pick) : "Kliknut\xEDm vyberete materi\xE1l";
        tip.style.display = "block";
        const w2 = tip.offsetWidth || 180;
        let tx = clientX + 14;
        if (tx + w2 > window.innerWidth - 8) tx = clientX - w2 - 14;
        tip.style.left = tx + "px";
        tip.style.top = clientY + 16 + "px";
      };
      const isHeroEmbed = typeof window !== "undefined" && window.ADAMEK_EMBED_MODE === "hero";
      const onPointerDown = (e) => {
        downX = e.clientX;
        downY = e.clientY;
        downT = performance.now();
        hideTip();
      };
      const onPointerUp = (e) => {
        if (isHeroEmbed) return;
        if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;
        if (performance.now() - downT > 600) return;
        const pick = pickAt(e.clientX, e.clientY);
        if (pick && onPickRef.current) onPickRef.current(pick);
      };
      const onPointerMove = (e) => {
        if (isHeroEmbed) {
          hideTip();
          return;
        }
        if (e.buttons) {
          hideTip();
          return;
        }
        const pick = pickAt(e.clientX, e.clientY);
        renderer.domElement.style.cursor = pick ? "pointer" : "";
        if (pick) showTip(pick, e.clientX, e.clientY);
        else hideTip();
      };
      const onPointerLeave = () => {
        hideTip();
        renderer.domElement.style.cursor = "";
      };
      renderer.domElement.addEventListener("pointerdown", onPointerDown);
      renderer.domElement.addEventListener("pointerup", onPointerUp);
      renderer.domElement.addEventListener("pointermove", onPointerMove);
      renderer.domElement.addEventListener("pointerleave", onPointerLeave);
      const studioEquirect = makeStudioBackdrop();
      scene.background = studioEquirect;
      const reflectionEquirect = makeReflectionEnvironment();
      scene.environment = makeOutdoorEnvironment(renderer, reflectionEquirect);
      scene.add(new THREE.HemisphereLight(16120063, 11974829, 0.408));
      const sun = new THREE.DirectionalLight(16775921, 0.936);
      sun.position.set(-3.5, 5.5, 3.5);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.radius = 3;
      sun.shadow.camera.left = -3;
      sun.shadow.camera.right = 3;
      sun.shadow.camera.top = 3;
      sun.shadow.camera.bottom = -3;
      sun.shadow.camera.near = 0.5;
      sun.shadow.camera.far = 20;
      sun.shadow.bias = -15e-5;
      sun.shadow.normalBias = 8e-3;
      scene.add(sun);
      const rim = new THREE.DirectionalLight(16777215, 0.12);
      rim.position.set(-2.6, 2.3, -1.6);
      scene.add(rim);
      const fill = new THREE.DirectionalLight(15331317, 0.12);
      fill.position.set(4, 2.6, 2);
      scene.add(fill);
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 60),
        new THREE.ShadowMaterial({ color: 3355443, opacity: 0.16 })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      ground.position.y = -0.01;
      scene.add(ground);
      const contactShadow = createContactShadow();
      scene.add(contactShadow);
      const cemeteryContext = createCemeteryContext();
      cemeteryContext.visible = sceneMode === "cemetery";
      scene.add(cemeteryContext);
      stateRef.current = { scene, camera, renderer, controls, ground, contactShadow, cemeteryContext, sceneMode, modelFocus: new THREE.Vector3(0, 0.7, 0), modelSize: new THREE.Vector3(1, 1.4, 1) };
      const renderLoop = createPreviewRenderLoop(controls, renderer, scene, camera);
      const requestRender = renderLoop.requestRender;
      stateRef.current.requestRender = requestRender;
      window.addEventListener("adamek:stone-texture-ready", requestRender);
      requestRender();
      let lastResizeW = 0, lastResizeLayout = "";
      const onResize = () => {
        const w2 = mount.clientWidth, h2 = mount.clientHeight;
        if (!w2 || !h2) return;
        camera.aspect = w2 / h2;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(w2, h2);
        const stage = mount.closest(".stage");
        const layout = stage ? [stage.classList.contains("stage--inscription"), stage.classList.contains("stage--summary"), stage.classList.contains("stage--expanded")].join(":") : "embed";
        if (w2 !== lastResizeW || layout !== lastResizeLayout) applyCameraFit(stateRef.current, angleRef.current, false);
        lastResizeW = w2;
        lastResizeLayout = layout;
        requestRender();
      };
      const ro = new ResizeObserver(onResize);
      ro.observe(mount);
      return () => {
        alive = false;
        stateRef.current.cameraFitRevision = (stateRef.current.cameraFitRevision || 0) + 1;
        renderLoop.dispose();
        window.removeEventListener("adamek:stone-texture-ready", requestRender);
        controls.dispose();
        const geometries = /* @__PURE__ */ new Set(), materials = /* @__PURE__ */ new Set(), textures = /* @__PURE__ */ new Set();
        [ground, contactShadow, cemeteryContext].forEach((root) => root.traverse((node) => {
          if (node.geometry) geometries.add(node.geometry);
          if (node.material) (Array.isArray(node.material) ? node.material : [node.material]).forEach((mat) => {
            materials.add(mat);
            if (mat.map) textures.add(mat.map);
          });
        }));
        geometries.forEach((geo) => geo.dispose());
        materials.forEach((mat) => mat.dispose());
        textures.forEach((tex) => tex.dispose());
        const environmentTarget = scene.environment && scene.environment.userData.renderTarget;
        if (environmentTarget) environmentTarget.dispose();
        studioEquirect.dispose();
        reflectionEquirect.dispose();
        if (sun.shadow.map) sun.shadow.map.dispose();
        ro.disconnect();
        renderer.domElement.removeEventListener("pointerdown", onPointerDown);
        renderer.domElement.removeEventListener("pointerup", onPointerUp);
        renderer.domElement.removeEventListener("pointermove", onPointerMove);
        renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
        if (tip.parentNode) tip.parentNode.removeChild(tip);
        renderer.dispose();
        if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      };
    }, []);
    useEffect(() => {
      const st = stateRef.current;
      if (!st) return;
      const cemetery = sceneMode === "cemetery";
      st.sceneMode = sceneMode;
      if (st.cemeteryContext) st.cemeteryContext.visible = cemetery;
      if (st.ground) st.ground.visible = !cemetery;
      st.scene.fog = cemetery ? new THREE.Fog(14476253, 16, 42) : null;
      if (angle === "perspective") applyCameraFit(st, angle, true);
      st.renderer.shadowMap.needsUpdate = true;
      if (st.requestRender) st.requestRender();
    }, [sceneMode]);
    const selectedPartRef = useRef(selectedPart);
    useEffect(() => {
      selectedPartRef.current = selectedPart;
      setHighlightOnGroup(monumentRef.current, selectedPart);
      const st = stateRef.current;
      if (st && st.requestRender) st.requestRender();
    }, [selectedPart]);
    useEffect(() => {
      const st = stateRef.current;
      if (!st || !angle) return;
      applyCameraFit(st, angle, true);
    }, [angle]);
    useEffect(() => {
      const st = stateRef.current;
      if (!st) return;
      let cancelled = false;
      function clearOld() {
        if (monumentRef.current) {
          st.scene.remove(monumentRef.current);
          const disposeMat = (m) => {
            if (m.map && m.map.isCanvasTexture && m.map.userData.inscriptionTexture) m.map.dispose();
            if (m.alphaMap && m.alphaMap.isCanvasTexture) m.alphaMap.dispose();
            m.dispose();
          };
          monumentRef.current.traverse((o) => {
            if (o.geometry) o.geometry.dispose();
            if (o.material) {
              if (Array.isArray(o.material)) o.material.forEach(disposeMat);
              else disposeMat(o.material);
            }
          });
          monumentRef.current = null;
        }
      }
      function placeMonument(g) {
        softenStoneReflections(g);
        const hadModel = !!monumentRef.current;
        const geometryKey = [cfg.type, cfg.shape, cfg.dimW, cfg.dimD, cfg.hasSokl, cfg.hasCover, cfg.fillType, cfg.edgeMode, !!exploded].join(":");
        const geometryChanged = geometryKey !== st.geometryKey;
        st.geometryKey = geometryKey;
        clearOld();
        applyExplodedLayout(g, !!exploded);
        const framed = frameMonumentGroup(g);
        st.scene.add(g);
        monumentRef.current = g;
        setHighlightOnGroup(g, selectedPartRef.current);
        st.modelFocus = framed.focus;
        st.modelSize = framed.size;
        fitGroundContext(st, g);
        st.renderer.shadowMap.needsUpdate = true;
        if (st.requestRender) st.requestRender();
        const deska = deskaInfoFor(g);
        st.deskaFocus = deska ? deska.focus : null;
        st.deskaSize = deska ? deska.size : null;
        if (!hadModel || geometryChanged) {
          applyCameraFit(st, angleRef.current || angle || "front", false);
        }
      }
      const modelUrl = pickModelUrl(cfg.type, cfg.dimW, cfg.dimD, cfg);
      window.__lastModelUrl = modelUrl;
      const needsAccessoryDonor = cfg.type === "dvojhrob" && cfg.hasSokl === false || ["models/urnovy-premium-20261002.glb", "models/urnovy-exclusive-20261002.glb", "models/jednohrob-premium-20261003.glb", "models/jednohrob-exclusive-20261003.glb", "models/jednohrob-exclusive-20261005.glb", "models/dvojhrob-exclusive-20261005.glb"].includes(modelUrl);
      setLoadError(null);
      if (modelUrl) {
        if (glbSceneRef.current && loadingModelUrlRef.current === modelUrl && !(needsAccessoryDonor && !accessoryDonorScene)) {
          placeMonument(buildFromGLB(glbSceneRef.current, cfg));
        } else {
          loadingModelUrlRef.current = modelUrl;
          setLoading(true);
          loadGLB(modelUrl).then(async (scene) => {
            if (cancelled || loadingModelUrlRef.current !== modelUrl) return;
            glbSceneRef.current = scene;
            if (needsAccessoryDonor && !accessoryDonorScene) {
              accessoryDonorScene = await loadGLB(ACCESSORY_DONOR_URL);
              if (cancelled || loadingModelUrlRef.current !== modelUrl) return;
            }
            placeMonument(buildFromGLB(scene, cfg));
            setLoading(false);
          }).catch((err) => {
            console.error("Nepoda\u0159ilo se na\u010D\xEDst 3D model:", modelUrl, err);
            if (cancelled || loadingModelUrlRef.current !== modelUrl) return;
            setLoading(false);
            setLoadError("3D model se nepoda\u0159ilo na\u010D\xEDst. Zobrazujeme p\u0159ibli\u017En\xFD n\xE1hled.");
            glbSceneRef.current = null;
            placeMonument(buildProcedural(cfg));
          });
        }
      } else {
        glbSceneRef.current = null;
        loadingModelUrlRef.current = null;
        placeMonument(buildProcedural(cfg));
      }
      return () => {
        cancelled = true;
      };
    }, [cfg, fontsReady, ornamentAssetsReady, exploded]);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { ref: mountRef, style: { position: "absolute", inset: 0 } }), loading && /* @__PURE__ */ React.createElement("div", { className: "viewer-loading", role: "status", "aria-live": "polite" }, /* @__PURE__ */ React.createElement("div", { className: "viewer-loading-spinner", "aria-hidden": "true" }), /* @__PURE__ */ React.createElement("span", { className: "viewer-loading-text" }, "Na\u010D\xEDt\xE1me model\u2026")), loadError && !loading && /* @__PURE__ */ React.createElement("div", { className: "viewer-error", role: "alert" }, loadError));
  }
  function InscriptionProof({ cfg, onSelect }) {
    var _a;
    const [proof, setProof] = useState(null);
    const [zoom, setZoom] = useState(false);
    const dialogRef = useRef(null);
    useEffect(() => {
      var _a2, _b;
      let active = true;
      const draw = () => {
        if (!active) return;
        const design = sourceHeadstoneDesign(cfg);
        if (!design) {
          setProof(null);
          return;
        }
        const w = (cfg.type !== "dvojhrob" ? design.widthMm / 1e3 : 1.2) * (design.fitWidthScale || 1), h = w * design.heightMm / design.widthMm;
        const cv = document.createElement("canvas");
        cv.width = 2048;
        cv.height = Math.round(cv.width * h / w);
        const ctx = cv.getContext("2d"), regions = [];
        [...design.parts].sort((a, b) => (a.frontOffsetMm || 0) - (b.frontOffsetMm || 0)).forEach((part) => {
          const mat = window.MATERIALS.find((m) => m.id === sourcePartMaterialId(cfg, design, part));
          const texture = (mat == null ? void 0 : mat.texture) ? loadImageAsset(mat.texture) : null;
          ctx.save();
          sourceCanvasPath(ctx, part, cv.width, cv.height);
          ctx.clip();
          ctx.fillStyle = part.role === "relief" ? "#61717b" : (mat == null ? void 0 : mat.c2) || "#343638";
          ctx.fillRect(0, 0, cv.width, cv.height);
          if ((texture == null ? void 0 : texture.loaded) && part.role !== "relief") {
            ctx.globalAlpha = 0.65;
            ctx.drawImage(texture.image, 0, 0, cv.width, cv.height);
            ctx.globalAlpha = 1;
          }
          ctx.strokeStyle = "rgba(0,0,0,.4)";
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.restore();
          if (part.inscription !== false && (part.role === "plate" || part.role === "pillar")) ctx.drawImage(cfg.type !== "dvojhrob" ? paintInscriptionCanvas(cfg, w, h, part.id) : paintSourceInscriptionCanvas(cfg, w, h, design, part.id, regions), 0, 0);
        });
        setProof({ url: cv.toDataURL(), regions, ratio: design.widthMm / design.heightMm });
      };
      draw();
      (_a2 = document.fonts) == null ? void 0 : _a2.ready.then(draw);
      (_b = document.fonts) == null ? void 0 : _b.addEventListener("loadingdone", draw);
      window.addEventListener("adamek:ornament-asset-ready", draw);
      return () => {
        var _a3;
        active = false;
        (_a3 = document.fonts) == null ? void 0 : _a3.removeEventListener("loadingdone", draw);
        window.removeEventListener("adamek:ornament-asset-ready", draw);
      };
    }, [cfg]);
    const select = (index) => {
      var _a2;
      (_a2 = dialogRef.current) == null ? void 0 : _a2.close();
      onSelect(index);
    };
    const drawing = (enlarged = false) => /* @__PURE__ */ React.createElement("div", { className: "inscription-proof-surface" + (enlarged && zoom ? " is-zoomed" : ""), tabIndex: enlarged && zoom ? 0 : void 0, "aria-label": enlarged && zoom ? "P\u0159ibl\xED\u017Een\xFD n\xE1hled \u2014 posouvejte do stran" : void 0 }, /* @__PURE__ */ React.createElement("div", { className: "inscription-proof-image", style: { aspectRatio: (proof == null ? void 0 : proof.ratio) || 1.4 } }, proof && /* @__PURE__ */ React.createElement("img", { src: proof.url, alt: "\u010Celn\xED n\xE1hled rozvr\u017Een\xED n\xE1pisu na skute\u010Dn\xE9m tvaru desky" }), proof == null ? void 0 : proof.regions.map((r) => /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        key: r.index,
        className: "inscription-proof-region" + (r.reserved ? " is-reserved" : ""),
        "aria-label": r.reserved ? `Doplnit rezervovan\xE9 m\xEDsto ${r.index + 1}` : `Upravit n\xE1pis: ${r.name || `osoba ${r.index + 1}`}`,
        title: r.reserved ? "Doplnit jm\xE9no do rezervovan\xE9ho m\xEDsta" : "Upravit jm\xE9no a data",
        onClick: () => select(r.index),
        style: { left: r.minX * 100 + "%", top: r.minY * 100 + "%", width: (r.maxX - r.minX) * 100 + "%", height: (r.maxY - r.minY) * 100 + "%" }
      },
      r.reserved && /* @__PURE__ */ React.createElement("span", null, "Voln\xE9 m\xEDsto")
    ))));
    return /* @__PURE__ */ React.createElement("section", { className: "inscription-proof", "aria-label": "\u010Celn\xED n\xE1hled n\xE1pisu" }, /* @__PURE__ */ React.createElement("div", { className: "inscription-proof-heading" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, "Rozvr\u017Een\xED na desce"), /* @__PURE__ */ React.createElement("small", null, "Takto bude vypadat v\xE1\u0161 n\xE1pis"))), drawing(), /* @__PURE__ */ React.createElement("button", { type: "button", className: "dock-btn inscription-proof-expand", onClick: () => {
      setZoom(false);
      dialogRef.current.showModal();
    } }, "Zv\u011Bt\u0161it \u010Deln\xED n\xE1hled \u2197"), ((_a = cfg.reservedRows) == null ? void 0 : _a.some(Boolean)) && /* @__PURE__ */ React.createElement("p", { className: "ed-q" }, "Voln\xE9 m\xEDsto se negrav\xEDruje. Rezerva z\u016Fst\xE1v\xE1 i ve 3D n\xE1hledu."), /* @__PURE__ */ React.createElement("dialog", { ref: dialogRef, className: "inscription-proof-dialog", "aria-labelledby": "inscription-proof-title", onClick: (e) => {
      if (e.target === e.currentTarget) e.currentTarget.close();
    } }, /* @__PURE__ */ React.createElement("div", { className: "inscription-proof-dialog-heading" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { id: "inscription-proof-title" }, "N\xE1pisov\xE1 deska zep\u0159edu"), /* @__PURE__ */ React.createElement("p", null, "Rozm\xEDst\u011Bn\xED n\xE1pis\u016F a motivu upravujeme automaticky.")), /* @__PURE__ */ React.createElement("button", { type: "button", className: "dock-btn", onClick: () => dialogRef.current.close() }, "Zav\u0159\xEDt")), /* @__PURE__ */ React.createElement("div", { className: "inscription-proof-zoom" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "dock-btn", "aria-pressed": zoom, onClick: () => setZoom((v) => !v) }, zoom ? "Zobrazit celou desku" : "P\u0159ibl\xED\u017Eit 2\xD7"), zoom && /* @__PURE__ */ React.createElement("span", null, "Posouvejte n\xE1hled do stran.")), drawing(true)));
  }
  window.InscriptionProof = InscriptionProof;
  window.StonePreview = StonePreview3D;
})();
