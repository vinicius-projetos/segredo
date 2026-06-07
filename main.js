import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

// ==========================================================
// 💌 CARTINHA DA MALU — texto que aparece ao tocar no coração
// ==========================================================
const LOVE_LETTER = `Quando eu te conheci, minha vida mudou completamente, você é minha luz, meu universo.

Cada eu te amo aqui na tela é um jeito diferente de tentar dizer o que eu sinto, mas nenhum dá conta. Por isso eu te VIVO. Te vivo em cada respiração, em cada pensamento, em cada dia de nossas vidas!

Você é o meu infinito.`;

// ----- Frases de amor flutuando pelo universo -----
const LOVE_MESSAGES = [
  // 💖 EU TE AMO em vários idiomas
  "EU TE AMO",
  "EU TE AMO MUITO",
  "TE AMO DEMAIS",
  "TE AMO INFINITO",
  "AMO-TE",
  "I LOVE YOU",
  "I LOVE YOU SO MUCH",
  "TE AMO",
  "TE QUIERO",
  "TE ADORO",
  "JE T'AIME",
  "JE T'AIME FORT",
  "TI AMO",
  "TI VOGLIO BENE",
  "ICH LIEBE DICH",
  "IK HOU VAN JOU",
  "JAG ÄLSKAR DIG",
  "JEG ELSKER DIG",
  "EU TE IUBESC",
  "MILUJI TĚ",
  "KOCHAM CIĘ",
  "VOLIM TE",
  "SZERETLEK",
  "S'AGAPO",
  "SENI SEVIYORUM",
  "ЛЮБЛЮ ТЕБЯ",
  "Я ТЕБЕ КОХАЮ",
  "أحبك",
  "אני אוהב אותך",
  "愛してる",
  "大好きだよ",
  "我爱你",
  "사랑해",
  "ฉันรักเธอ",
  "ANH YÊU EM",
  "MAHAL KITA",
  "AKU CINTA KAMU",

  // ✨ EU TE VIVO (frase de gente apaixonado de verdade)
  "EU TE VIVO",
  "TE VIVO",
  "TE VIVO INTEIRO",
  "TE VIVO SEMPRE",
  "I LIVE YOU",
  "TE VIVO MI VIDA",
  "JE TE VIS",
  "TI VIVO",
  "ICH LEBE DICH",
  "IK LEEF JOU",
  "Я ЖИВУ ТОБОЮ",
  "君を生きる",

  // 💍 outras docinhas
  "MEU AMOR ∞",
  "PRA SEMPRE",
  "MINHA VIDA",
  "MI VIDA",
  "MON AMOUR",
  "AMORE MIO",
  "SÓ VOCÊ",
  "VOCÊ É TUDO",
  "MEU MUNDO",
  "MEU CÉU",
];

// ==========================================================
// 📸 SUAS FOTOS, PATRÃO!
// Coloque as imagens na pasta "assets/fotos/" e escreva os
// nomes dos arquivos aqui embaixo. Elas vão flutuar como
// polaroids pelo universo. Ex: "nos.jpg", "viagem.png"
// ==========================================================
const PHOTOS = [
  // "foto1.jpg",
  // "foto2.jpg",
  // "foto3.jpg",
];
const PHOTOS_DIR = "assets/fotos/";

// ----- Detecção de celular pra ajustar performance -----
const IS_MOBILE =
  /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(
    navigator.userAgent
  ) || window.matchMedia("(max-width: 768px)").matches;

// ==========================================================
// 🎀 STICKERS (figurinhas tipo Hello Kitty, Spider-Man, etc)
// Arquivos com fundo transparente flutuam soltinhos no espaço.
// ==========================================================
const STICKERS = ["kitty1.png", "kitty2.png", "kitty3.png"];
const STICKERS_DIR = "assets/stickers/";
// Quantas cópias de cada figurinha vão flutuar pela cena
const STICKER_COPIES = IS_MOBILE ? 2 : 3;

// Quantidades de partículas adaptadas ao aparelho
const Q = {
  galaxy: IS_MOBILE ? 18000 : 45000,
  heart: IS_MOBILE ? 4000 : 9000,
  trail: IS_MOBILE ? 700 : 1500,
  stars: IS_MOBILE ? 600 : 1200,
  texts: IS_MOBILE ? 50 : 80,
  hearts: IS_MOBILE ? 60 : 120,
  shootingStars: IS_MOBILE ? 6 : 12,
};

// ----------------------------------------------------------
// Configuração básica da cena
// ----------------------------------------------------------
const canvas = document.getElementById("scene");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, IS_MOBILE ? 1.5 : 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 1);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.012);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.set(0, 28, 70);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 40;
controls.maxDistance = 180;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.35;
controls.target.set(0, 8, 0);
controls.enablePan = false;
controls.zoomSpeed = 0.6;
controls.rotateSpeed = 0.6;
// No celular: 1 dedo gira, 2 dedos dão pinça (zoom). No desktop: roda dá zoom.
controls.touches = {
  ONE: THREE.TOUCH.ROTATE,
  TWO: THREE.TOUCH.DOLLY_PAN,
};
// Evita o zoom da página inteira (Ctrl+roda ou pinça do navegador)
window.addEventListener(
  "wheel",
  (e) => {
    if (e.ctrlKey) e.preventDefault();
  },
  { passive: false }
);
document.addEventListener("gesturestart", (e) => e.preventDefault());
document.addEventListener("gesturechange", (e) => e.preventDefault());
document.addEventListener("dblclick", (e) => e.preventDefault());

// Afasta a câmera em telas verticais (retrato) pra caber a cena toda
function frameCamera() {
  const aspect = window.innerWidth / window.innerHeight;
  // quanto mais "em pé" a tela, mais longe colocamos a câmera
  const dist = aspect < 1 ? THREE.MathUtils.lerp(120, 78, aspect) : 70;
  const height = aspect < 1 ? 26 : 28;
  const dir = new THREE.Vector3(0, height, dist);
  camera.position.copy(dir);
  camera.updateProjectionMatrix();
}
frameCamera();

// ----------------------------------------------------------
// Textura circular suave para as partículas (glow)
// ----------------------------------------------------------
function makeParticleTexture() {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.2, "rgba(255,210,220,0.9)");
  g.addColorStop(0.5, "rgba(255,40,80,0.5)");
  g.addColorStop(1, "rgba(255,0,40,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  return tex;
}
const particleTexture = makeParticleTexture();

// ----------------------------------------------------------
// Galáxia espiral / disco de acreção do buraco negro
// ----------------------------------------------------------
function createGalaxy() {
  const count = Q.galaxy;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const arms = 3;
  const radiusMax = 55;
  const spin = 1.1;
  const randomness = 0.45;

  const inside = new THREE.Color(0xfff0f3);
  const mid = new THREE.Color(0xff1a3c);
  const outside = new THREE.Color(0x3a0008);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const radius = Math.pow(Math.random(), 1.7) * radiusMax + 3;
    const branch = ((i % arms) / arms) * Math.PI * 2;
    const spinAngle = radius * spin * 0.06;

    const rndPow = (v) => Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * v * radius;
    const rx = rndPow(randomness);
    const ry = rndPow(randomness) * 0.18;
    const rz = rndPow(randomness);

    const angle = branch + spinAngle;
    positions[i3] = Math.cos(angle) * radius + rx;
    positions[i3 + 1] = ry - 1;
    positions[i3 + 2] = Math.sin(angle) * radius + rz;

    const color = inside.clone();
    if (radius < 22) {
      color.lerpColors(inside, mid, radius / 22);
    } else {
      color.lerpColors(mid, outside, (radius - 22) / (radiusMax - 22));
    }
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.45,
    map: particleTexture,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  return new THREE.Points(geo, mat);
}
const galaxy = createGalaxy();
scene.add(galaxy);

// ----------------------------------------------------------
// Buraco negro central (esfera escura + halo)
// ----------------------------------------------------------
const blackHole = new THREE.Mesh(
  new THREE.SphereGeometry(4.5, 64, 64),
  new THREE.MeshBasicMaterial({ color: 0x000000 })
);
blackHole.position.y = -1;
scene.add(blackHole);

const halo = new THREE.Mesh(
  new THREE.RingGeometry(4.6, 9, 80),
  new THREE.MeshBasicMaterial({
    map: particleTexture,
    color: 0xff1133,
    side: THREE.DoubleSide,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    opacity: 0.9,
  })
);
halo.rotation.x = -Math.PI / 2;
halo.position.y = -1;
scene.add(halo);

// ----------------------------------------------------------
// Coração de partículas (acima do buraco negro)
// ----------------------------------------------------------
function heartPoint(t) {
  // Equação paramétrica clássica do coração
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y =
    13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t);
  return { x, y };
}

function createHeart() {
  const count = Q.heart;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const c1 = new THREE.Color(0xff2b4e);
  const c2 = new THREE.Color(0xff8fa3);
  const scale = 0.95;

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const t = Math.random() * Math.PI * 2;
    const { x, y } = heartPoint(t);
    // espalha um pouco para dentro para dar volume
    const fill = Math.pow(Math.random(), 0.5);
    const px = x * fill;
    const py = y * fill;
    const jitter = 0.9;
    positions[i3] = px * scale + (Math.random() - 0.5) * jitter;
    positions[i3 + 1] = py * scale + (Math.random() - 0.5) * jitter;
    positions[i3 + 2] = (Math.random() - 0.5) * 6 * fill;

    const color = c1.clone().lerp(c2, Math.random() * 0.6);
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.55,
    map: particleTexture,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geo, mat);
  points.position.set(0, 34, 0);
  return points;
}
const heart = createHeart();
scene.add(heart);

// ----------------------------------------------------------
// 💖 Nome no centro do coração
// ----------------------------------------------------------
function makeNameSprite(name) {
  const fontSize = 150;
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  const font = `700 ${fontSize}px "Dancing Script", cursive`;
  ctx.font = font;
  const textWidth = ctx.measureText(name).width;
  c.width = textWidth + 120;
  c.height = fontSize + 120;

  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // brilho forte
  ctx.shadowColor = "rgba(255,255,255,0.95)";
  ctx.shadowBlur = 40;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(name, c.width / 2, c.height / 2);
  ctx.shadowColor = "rgba(255,40,80,0.9)";
  ctx.shadowBlur = 30;
  ctx.fillStyle = "#fff0f3";
  ctx.fillText(name, c.width / 2, c.height / 2);

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const sprite = new THREE.Sprite(mat);
  const aspect = c.width / c.height;
  const h = 6.5;
  sprite.scale.set(h * aspect, h, 1);
  sprite.renderOrder = 999;
  return sprite;
}

// Espera a fonte "Dancing Script" carregar pra desenhar o nome bonito
const nameSprite = makeNameSprite("Malu");
nameSprite.position.set(0, 1, 1); // no centrinho do coração
heart.add(nameSprite); // vira filho do coração: pulsa e flutua junto
function refreshNameWithFont() {
  const fontsApi = document.fonts;
  if (!fontsApi) return;
  fontsApi.ready.then(() => {
    const updated = makeNameSprite("Malu");
    nameSprite.material.map = updated.material.map;
    nameSprite.material.needsUpdate = true;
    nameSprite.scale.copy(updated.scale);
  });
}
refreshNameWithFont();

// trilha de partículas ligando o coração ao buraco negro
function createTrail() {
  const count = Q.trail;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const col = new THREE.Color(0xff2b4e);
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const t = Math.random();
    positions[i3] = (Math.random() - 0.5) * 2.5;
    positions[i3 + 1] = t * 34;
    positions[i3 + 2] = (Math.random() - 0.5) * 2.5;
    colors[i3] = col.r;
    colors[i3 + 1] = col.g;
    colors[i3 + 2] = col.b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.4,
    map: particleTexture,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    opacity: 0.8,
  });
  return new THREE.Points(geo, mat);
}
const trail = createTrail();
scene.add(trail);

// ----------------------------------------------------------
// Textos de amor flutuando (sprites)
// ----------------------------------------------------------
function makeTextSprite(message) {
  const fontSize = 80;
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  ctx.font = `bold ${fontSize}px Montserrat, sans-serif`;
  const textWidth = ctx.measureText(message).width;
  c.width = textWidth + 60;
  c.height = fontSize + 50;

  ctx.font = `bold ${fontSize}px Montserrat, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(255,40,80,0.9)";
  ctx.shadowBlur = 25;
  ctx.fillStyle = "#ffd6de";
  ctx.fillText(message, c.width / 2, c.height / 2);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#ff3355";
  ctx.fillText(message, c.width / 2, c.height / 2);

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });
  const sprite = new THREE.Sprite(mat);
  const aspect = c.width / c.height;
  const h = 3.2;
  sprite.scale.set(h * aspect, h, 1);
  return sprite;
}

const textSprites = [];
const TEXT_COUNT = Q.texts;
for (let i = 0; i < TEXT_COUNT; i++) {
  const msg = LOVE_MESSAGES[i % LOVE_MESSAGES.length];
  const sprite = makeTextSprite(msg);
  const radius = 30 + Math.random() * 45;
  const angle = Math.random() * Math.PI * 2;
  const baseY = 2 + Math.random() * 28;
  sprite.userData = {
    radius,
    angle,
    baseY,
    speed: 0.05 + Math.random() * 0.12,
    bob: Math.random() * Math.PI * 2,
  };
  sprite.position.set(
    Math.cos(angle) * radius,
    baseY,
    Math.sin(angle) * radius
  );
  scene.add(sprite);
  textSprites.push(sprite);
}

// ----------------------------------------------------------
// 📸 Fotos flutuantes em estilo polaroid
// ----------------------------------------------------------
const photoSprites = [];

function makePolaroidTexture(img) {
  // Desenha a foto dentro de uma moldura branca (polaroid)
  const pad = 24;
  const bottom = 70;
  const maxW = 420;
  const ratio = img.height / img.width;
  const w = maxW;
  const h = Math.round(maxW * ratio);

  const c = document.createElement("canvas");
  c.width = w + pad * 2;
  c.height = h + pad + bottom;
  const ctx = c.getContext("2d");

  // moldura branca com cantos arredondados
  ctx.fillStyle = "#fff";
  const r = 14;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.arcTo(c.width, 0, c.width, c.height, r);
  ctx.arcTo(c.width, c.height, 0, c.height, r);
  ctx.arcTo(0, c.height, 0, 0, r);
  ctx.arcTo(0, 0, c.width, 0, r);
  ctx.closePath();
  ctx.fill();

  // a foto
  ctx.drawImage(img, pad, pad, w, h);

  // um coraçãozinho na borda de baixo
  ctx.fillStyle = "#ff2b4e";
  ctx.font = "32px serif";
  ctx.textAlign = "center";
  ctx.fillText("❤", c.width / 2, c.height - bottom / 2 + 10);

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return { tex, aspect: c.width / c.height };
}

function loadPhotos() {
  PHOTOS.forEach((file, idx) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const { tex, aspect } = makePolaroidTexture(img);
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      const h = IS_MOBILE ? 9 : 11;
      sprite.scale.set(h * aspect, h, 1);

      const radius = 26 + Math.random() * 30;
      const angle = (idx / Math.max(PHOTOS.length, 1)) * Math.PI * 2;
      const baseY = 6 + Math.random() * 24;
      sprite.userData = {
        radius,
        angle,
        baseY,
        speed: 0.03 + Math.random() * 0.06,
        bob: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.3,
      };
      sprite.position.set(
        Math.cos(angle) * radius,
        baseY,
        Math.sin(angle) * radius
      );
      scene.add(sprite);
      photoSprites.push(sprite);
    };
    img.onerror = () => {
      console.warn("Não consegui carregar a foto:", PHOTOS_DIR + file);
    };
    img.src = PHOTOS_DIR + file;
  });
}
loadPhotos();

// ----------------------------------------------------------
// 🎀 Stickers (Hello Kitty e companhia) flutuando
// ----------------------------------------------------------
const stickerSprites = [];

function makeStickerTexture(img) {
  // Desenha um glow rosa por trás pra figurinha brilhar no espaço
  const pad = 30;
  const w = img.width;
  const h = img.height;
  const c = document.createElement("canvas");
  c.width = w + pad * 2;
  c.height = h + pad * 2;
  const ctx = c.getContext("2d");

  // brilho rosado em vorta da figurinha
  ctx.shadowColor = "rgba(255, 80, 130, 0.85)";
  ctx.shadowBlur = 35;
  ctx.drawImage(img, pad, pad, w, h);
  // segundo passe pra dar mais glow
  ctx.shadowBlur = 18;
  ctx.drawImage(img, pad, pad, w, h);

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return { tex, aspect: c.width / c.height };
}

function spawnSticker(img, idx, copyIdx) {
  const { tex, aspect } = makeStickerTexture(img);
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(mat);
  const h = (IS_MOBILE ? 6 : 7.5) * (0.85 + Math.random() * 0.4);
  sprite.scale.set(h * aspect, h, 1);

  const radius = 28 + Math.random() * 35;
  const total = STICKERS.length * STICKER_COPIES;
  const angle =
    ((idx * STICKER_COPIES + copyIdx) / total) * Math.PI * 2 +
    Math.random() * 0.4;
  const baseY = 4 + Math.random() * 26;
  sprite.userData = {
    radius,
    angle,
    baseY,
    speed: 0.04 + Math.random() * 0.08,
    bob: Math.random() * Math.PI * 2,
    bobAmp: 1.5 + Math.random() * 2,
  };
  sprite.position.set(
    Math.cos(angle) * radius,
    baseY,
    Math.sin(angle) * radius
  );
  scene.add(sprite);
  stickerSprites.push(sprite);
}

function loadStickers() {
  STICKERS.forEach((file, idx) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      for (let k = 0; k < STICKER_COPIES; k++) {
        spawnSticker(img, idx, k);
      }
    };
    img.onerror = () => {
      console.warn("Sticker num carregô:", STICKERS_DIR + file);
    };
    img.src = STICKERS_DIR + file;
  });
}
loadStickers();

// ----------------------------------------------------------
// Estrelas de fundo
// ----------------------------------------------------------
function createStars() {
  const count = Q.stars;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const r = 200 + Math.random() * 600;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    positions[i3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = r * Math.cos(phi);
    positions[i3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    size: 1.1,
    color: 0xffaabb,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
  });
  return new THREE.Points(geo, mat);
}
scene.add(createStars());

// ----------------------------------------------------------
// 💕 Chuva de coraçõezinhos caindo pelo espaço
// ----------------------------------------------------------
function makeHeartTexture() {
  const s = 64;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d");
  ctx.translate(s / 2, s / 2 - 4);
  ctx.scale(0.022, 0.022);
  // mesma equação paramétrica do coração grande
  ctx.beginPath();
  for (let i = 0; i <= 360; i++) {
    const t = (i / 180) * Math.PI;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t)
    );
    if (i === 0) ctx.moveTo(x * 32, y * 32);
    else ctx.lineTo(x * 32, y * 32);
  }
  ctx.closePath();
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 500);
  grad.addColorStop(0, "#ffd1dc");
  grad.addColorStop(0.4, "#ff3355");
  grad.addColorStop(1, "#9a0020");
  ctx.fillStyle = grad;
  ctx.fill();
  return new THREE.CanvasTexture(c);
}
const heartTexture = makeHeartTexture();

function createFallingHearts() {
  const count = Q.hearts;
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const speeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 200;
    positions[i3 + 1] = Math.random() * 120 - 10;
    positions[i3 + 2] = (Math.random() - 0.5) * 200;
    sizes[i] = 0.8 + Math.random() * 1.6;
    speeds[i] = 4 + Math.random() * 8;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    size: 1.6,
    map: heartTexture,
    color: 0xff4466,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    opacity: 0.9,
  });
  const pts = new THREE.Points(geo, mat);
  pts.userData = { speeds };
  return pts;
}
const fallingHearts = createFallingHearts();
scene.add(fallingHearts);

// ----------------------------------------------------------
// 🌠 Estrelas cadentes
// ----------------------------------------------------------
const shootingStars = [];
function spawnShootingStar() {
  const geo = new THREE.BufferGeometry();
  const points = 20;
  const pos = new Float32Array(points * 3);
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.LineBasicMaterial({
    color: 0xffd6e0,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
  });
  const line = new THREE.Line(geo, mat);

  const startX = (Math.random() - 0.5) * 220;
  const startY = 60 + Math.random() * 40;
  const startZ = (Math.random() - 0.5) * 220;
  const dir = new THREE.Vector3(
    -1 - Math.random(),
    -0.5 - Math.random() * 0.5,
    -0.4 + Math.random() * 0.8
  ).normalize();

  line.userData = {
    start: new THREE.Vector3(startX, startY, startZ),
    dir,
    age: 0,
    life: 1.6 + Math.random() * 0.6,
    speed: 90 + Math.random() * 60,
    points,
  };
  scene.add(line);
  shootingStars.push(line);
}
function updateShootingStars(dt) {
  // dispara novas se tiver poucas
  while (shootingStars.length < Q.shootingStars && Math.random() < 0.04) {
    spawnShootingStar();
  }
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const star = shootingStars[i];
    const u = star.userData;
    u.age += dt;
    const pos = star.geometry.attributes.position.array;
    const head = u.start
      .clone()
      .addScaledVector(u.dir, u.speed * u.age);
    for (let p = 0; p < u.points; p++) {
      const trail = head
        .clone()
        .addScaledVector(u.dir, -p * 1.6);
      pos[p * 3] = trail.x;
      pos[p * 3 + 1] = trail.y;
      pos[p * 3 + 2] = trail.z;
    }
    star.geometry.attributes.position.needsUpdate = true;
    // fade in / out
    const k = u.age / u.life;
    star.material.opacity = Math.sin(Math.min(k, 1) * Math.PI);
    if (u.age >= u.life) {
      scene.remove(star);
      star.geometry.dispose();
      star.material.dispose();
      shootingStars.splice(i, 1);
    }
  }
}

// ----------------------------------------------------------
// 🌀 Anéis pulsantes ao redor do buraco negro
// ----------------------------------------------------------
const pulseRings = [];
for (let i = 0; i < 3; i++) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(5, 5.4, 96),
    new THREE.MeshBasicMaterial({
      color: 0xff2244,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = -1;
  ring.userData = { offset: i * 1.3 };
  scene.add(ring);
  pulseRings.push(ring);
}

// ----------------------------------------------------------
// Post-processing: Bloom (brilho)
// ----------------------------------------------------------
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  IS_MOBILE ? 0.95 : 1.1, // strength
  0.7, // radius
  0.12 // threshold
);
composer.addPass(bloom);

// ----------------------------------------------------------
// Loop de animação
// ----------------------------------------------------------
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  const dt = clock.getDelta();

  galaxy.rotation.y = t * 0.08;
  halo.rotation.z = t * 0.3;
  heart.rotation.y = Math.sin(t * 0.4) * 0.25;
  heart.position.y = 34 + Math.sin(t * 0.8) * 0.8;
  trail.rotation.y = t * 0.2;

  // pulsa o coração
  const pulse = 1 + Math.sin(t * 2.2) * 0.04;
  heart.scale.set(pulse, pulse, pulse);

  // chuva de coraçõezinhos descendo
  {
    const arr = fallingHearts.geometry.attributes.position.array;
    const speeds = fallingHearts.userData.speeds;
    for (let i = 0; i < speeds.length; i++) {
      const i3 = i * 3;
      arr[i3 + 1] -= speeds[i] * dt;
      if (arr[i3 + 1] < -30) {
        arr[i3] = (Math.random() - 0.5) * 200;
        arr[i3 + 1] = 90 + Math.random() * 40;
        arr[i3 + 2] = (Math.random() - 0.5) * 200;
      }
    }
    fallingHearts.geometry.attributes.position.needsUpdate = true;
  }

  // estrelas cadentes
  updateShootingStars(dt);

  // anéis pulsantes
  for (const ring of pulseRings) {
    const k = ((t + ring.userData.offset) % 3.5) / 3.5;
    const r = 5 + k * 22;
    ring.scale.set(r / 5, r / 5, 1);
    ring.material.opacity = (1 - k) * 0.7;
    ring.rotation.z = t * 0.4 + ring.userData.offset;
  }

  // textos orbitando
  for (const s of textSprites) {
    const u = s.userData;
    u.angle += u.speed * 0.01;
    s.position.x = Math.cos(u.angle) * u.radius;
    s.position.z = Math.sin(u.angle) * u.radius;
    s.position.y = u.baseY + Math.sin(t * 0.6 + u.bob) * 1.5;
  }

  // fotos orbitando suavemente
  for (const s of photoSprites) {
    const u = s.userData;
    u.angle += u.speed * 0.01;
    s.position.x = Math.cos(u.angle) * u.radius;
    s.position.z = Math.sin(u.angle) * u.radius;
    s.position.y = u.baseY + Math.sin(t * 0.5 + u.bob) * 2;
  }

  // stickers (Hello Kitty e amigos) dançando pelo espaço
  for (const s of stickerSprites) {
    const u = s.userData;
    u.angle += u.speed * 0.01;
    s.position.x = Math.cos(u.angle) * u.radius;
    s.position.z = Math.sin(u.angle) * u.radius;
    s.position.y = u.baseY + Math.sin(t * 0.7 + u.bob) * u.bobAmp;
  }

  controls.update();
  composer.render();
}
animate();

// ----------------------------------------------------------
// Responsividade
// ----------------------------------------------------------
function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  frameCamera();
}
window.addEventListener("resize", handleResize);
// alguns celulares disparam isso ao girar a tela
window.addEventListener("orientationchange", () =>
  setTimeout(handleResize, 200)
);

// ----------------------------------------------------------
// Intro / botão de entrada (necessário para tocar áudio)
// ----------------------------------------------------------
const overlay = document.getElementById("overlay");
const startBtn = document.getElementById("startBtn");
const hint = document.getElementById("hint");
const bgm = document.getElementById("bgm");

startBtn.addEventListener("click", () => {
  overlay.classList.add("hidden");
  hint.classList.add("show");
  if (bgm) {
    bgm.volume = 0.6;
    bgm.play().catch(() => {
      /* sem música? sem problema, patrão */
    });
  }
  setTimeout(() => hint.classList.remove("show"), 6000);
});

// ----------------------------------------------------------
// 💌 Cartinha — toque/clique no coração
// ----------------------------------------------------------
const loveLetterEl = document.getElementById("loveLetter");
const letterTextEl = document.getElementById("letterText");
const letterCloseBtn = document.getElementById("letterClose");
const raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 10;
const pointer = new THREE.Vector2();
const heartScreenPos = new THREE.Vector3();
let letterOpen = false;

function openLoveLetter() {
  letterTextEl.textContent = LOVE_LETTER;
  loveLetterEl.classList.remove("hidden");
  controls.autoRotate = false;
  letterOpen = true;
}

function closeLoveLetter() {
  loveLetterEl.classList.add("hidden");
  controls.autoRotate = true;
  letterOpen = false;
}

letterCloseBtn.addEventListener("click", closeLoveLetter);
loveLetterEl.addEventListener("click", (e) => {
  if (e.target === loveLetterEl) closeLoveLetter();
});

function setPointer(clientX, clientY) {
  pointer.x = (clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(clientY / window.innerHeight) * 2 + 1;
}

function isHeartHit(clientX, clientY) {
  setPointer(clientX, clientY);
  raycaster.setFromCamera(pointer, camera);

  if (raycaster.intersectObject(heart, true).length > 0) return true;

  // fallback: área maior no celular pra facilitar o toque
  heart.getWorldPosition(heartScreenPos);
  heartScreenPos.project(camera);
  if (heartScreenPos.z > 1) return false;

  const sx = (heartScreenPos.x * 0.5 + 0.5) * window.innerWidth;
  const sy = (-heartScreenPos.y * 0.5 + 0.5) * window.innerHeight;
  const tapRadius = IS_MOBILE ? 90 : 70;
  return Math.hypot(clientX - sx, clientY - sy) < tapRadius;
}

function handleHeartTap(clientX, clientY) {
  if (letterOpen || !overlay.classList.contains("hidden")) return;
  if (isHeartHit(clientX, clientY)) openLoveLetter();
}

renderer.domElement.addEventListener("click", (e) => {
  handleHeartTap(e.clientX, e.clientY);
});

renderer.domElement.addEventListener(
  "touchend",
  (e) => {
    if (e.changedTouches.length !== 1) return;
    const touch = e.changedTouches[0];
    handleHeartTap(touch.clientX, touch.clientY);
  },
  { passive: true }
);
