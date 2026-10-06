/**
 * Deterministic starting-point recipes for manual use in Cubase.
 * This module never reads audio, calls a service, or changes a DAW session.
 */

export const genreProfiles = Object.freeze({
  pop: {
    label: "팝",
    retune: 22,
    ratio: 3,
    decay: 1.6,
    delay: "eighth",
    width: 8,
    presence: 1,
    attack: 12,
  },
  hiphop: {
    label: "힙합",
    retune: 12,
    ratio: 4,
    decay: 1.0,
    delay: "eighth",
    width: 5,
    presence: 0.7,
    attack: 8,
  },
  rnb: {
    label: "R&B",
    retune: 28,
    ratio: 2.8,
    decay: 1.9,
    delay: "dottedEighth",
    width: 7,
    presence: 0.6,
    attack: 16,
  },
  ballad: {
    label: "발라드",
    retune: 50,
    ratio: 2.2,
    decay: 2.4,
    delay: "quarter",
    width: 4,
    presence: 0.5,
    attack: 22,
  },
  edm: {
    label: "EDM",
    retune: 10,
    ratio: 3.5,
    decay: 1.8,
    delay: "dottedEighth",
    width: 14,
    presence: 1.2,
    attack: 10,
  },
  rock: {
    label: "록",
    retune: 32,
    ratio: 3.5,
    decay: 1.3,
    delay: "eighth",
    width: 6,
    presence: 0.9,
    attack: 15,
  },
});

export const moodProfiles = Object.freeze({
  warm: {
    label: "따뜻한",
    presence: -0.4,
    air: -0.3,
    decay: 0.1,
    highCut: 6500,
    send: -1,
    feedback: 0,
  },
  bright: {
    label: "밝은",
    presence: 0.5,
    air: 0.6,
    decay: -0.1,
    highCut: 10000,
    send: 0,
    feedback: -2,
  },
  dark: {
    label: "어두운",
    presence: -0.7,
    air: -0.8,
    decay: 0.15,
    highCut: 5000,
    send: -1,
    feedback: 2,
  },
  dreamy: {
    label: "몽환적인",
    presence: -0.3,
    air: 0.2,
    decay: 0.6,
    highCut: 8000,
    send: 2,
    feedback: 8,
  },
  energetic: {
    label: "에너지 있는",
    presence: 0.5,
    air: 0.4,
    decay: -0.25,
    highCut: 9000,
    send: -1,
    feedback: -5,
  },
  sad: {
    label: "쓸쓸한",
    presence: -0.3,
    air: -0.2,
    decay: 0.35,
    highCut: 6000,
    send: 1,
    feedback: 5,
  },
});

export const pluginBundles = Object.freeze([
  {
    id: "antares",
    name: "Auto-Tune Unlimited",
    version: "2023.12",
    description: "키·스케일 기반 보컬 피치 보정",
  },
  {
    id: "fabfilter",
    name: "FabFilter Total Bundle",
    version: "v2026",
    description: "EQ, 컴프레서, 디에서",
  },
  {
    id: "waves",
    name: "Waves Ultimate 16",
    version: "v2025.08",
    description: "드럼과 믹스 버스의 다이내믹 제어",
  },
  {
    id: "valhalla",
    name: "Valhalla DSP Plugins Bundle",
    version: "v2024.03",
    description: "박자에 맞춘 딜레이와 공간감",
  },
  {
    id: "ozone",
    name: "iZotope Ozone 12 Advanced",
    version: "v12.0.0",
    description: "스테레오 폭과 최종 음량",
  },
  {
    id: "rx",
    name: "iZotope RX 11 Advanced",
    version: "v11.2.0",
    description: "필요한 클립의 노이즈·클릭 전처리",
  },
  {
    id: "kilohearts",
    name: "Kilohearts kHs Bundle",
    version: "사용자 보유 · 버전 미지정",
    description: "공간계 FX Return의 저역 정리",
  },
  {
    id: "soundtoys",
    name: "Soundtoys",
    version: "사용자 보유 · 버전 미지정",
    description: "MicroShift 보컬 AUX와 LittleAlterBoy 폼란트",
  },
  {
    id: "melda",
    name: "MeldaProduction MAutoPitch",
    version: "사용자 보유 · 버전 미지정",
    description: "피치 보정을 끈 선택적 폼란트 변경",
  },
]);

export const exampleSongs = Object.freeze([
  {
    id: "midnight",
    label: "새벽의 R&B",
    title: "새벽 두 시",
    key: "F#",
    scale: "minor",
    bpm: 88,
    gender: "female",
    range: "mid",
    genre: "rnb",
    mood: "dreamy",
    intensity: "balanced",
    target: "streaming",
    lyrics:
      "아직 네 목소리가 남아\n불 꺼진 거리 위에\n오늘도 나는 여기\n아직 네 목소리가 남아",
  },
  {
    id: "bright-pop",
    label: "밝은 팝 보컬",
    title: "우리의 계절",
    key: "D",
    scale: "major",
    bpm: 118,
    gender: "male",
    range: "high",
    genre: "pop",
    mood: "bright",
    intensity: "balanced",
    target: "streaming",
    lyrics: "너와 걷는 모든 길이 빛나\n오늘을 기억해\n우리의 계절이 시작돼",
  },
  {
    id: "close-ballad",
    label: "자연스러운 발라드",
    title: "남겨진 편지",
    key: "A",
    scale: "minor",
    bpm: 72,
    gender: "female",
    range: "low",
    genre: "ballad",
    mood: "sad",
    intensity: "natural",
    target: "dynamic",
    lyrics: "천천히 접어 둔 마음\n말하지 못한 그 한마디\n이제는 바람에 보내",
  },
  {
    id: "club",
    label: "클럽 인스트루멘털",
    title: "Afterglow",
    key: "G",
    scale: "minor",
    bpm: 128,
    gender: "instrumental",
    range: "mid",
    genre: "edm",
    mood: "energetic",
    intensity: "hard",
    target: "club",
    lyrics: "",
  },
]);

const KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const ENHARMONICS = { DB: "C#", EB: "D#", GB: "F#", AB: "G#", BB: "A#" };
const GENDERS = ["female", "male", "mixed", "instrumental"];
const RANGES = ["low", "mid", "high"];
const INTENSITIES = ["natural", "balanced", "hard"];
const TARGETS = ["streaming", "club", "dynamic"];
const rangeSettings = {
  low: {
    label: "낮은 음역",
    inputType: "Low Male",
    highPass: 65,
    body: 220,
    presence: 3200,
    sibilance: 4500,
  },
  mid: {
    label: "중간 음역",
    inputType: "Alto/Tenor",
    highPass: 85,
    body: 300,
    presence: 3800,
    sibilance: 5500,
  },
  high: {
    label: "높은 음역",
    inputType: "Soprano",
    highPass: 110,
    body: 400,
    presence: 4500,
    sibilance: 6500,
  },
};
const targetSettings = {
  streaming: { label: "스트리밍", lufs: -14, truePeak: -1, headroom: 6 },
  club: { label: "클럽 / 높은 밀도", lufs: -9, truePeak: -1, headroom: 6 },
  dynamic: { label: "다이내믹 보존", lufs: -16, truePeak: -1, headroom: 6 },
};
const intensitySettings = {
  natural: {
    label: "자연스럽게",
    retune: 2,
    humanize: 65,
    flex: 35,
    ratio: -0.4,
    range: 2,
    width: -2,
  },
  balanced: {
    label: "균형 있게",
    retune: 1,
    humanize: 35,
    flex: 15,
    ratio: 0,
    range: 3,
    width: 0,
  },
  hard: {
    label: "강하게",
    retune: 0.25,
    humanize: 5,
    flex: 0,
    ratio: 0.7,
    range: 4,
    width: 3,
  },
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round = (value, places = 1) => Number(value.toFixed(places));
const option = (value, allowed, fallback) =>
  allowed.includes(value) ? value : fallback;
const cleanText = (value, maxLength) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";
const param = (name, value, unit, note) => ({
  name,
  value,
  ...(unit ? { unit } : {}),
  ...(note ? { note } : {}),
});
const routingLocations = {
  "vocal-tune": { kind: "insert", destination: "보컬 트랙 Insert" },
  "vocal-eq": { kind: "insert", destination: "보컬 트랙 Insert" },
  "vocal-compressor": { kind: "insert", destination: "보컬 트랙 Insert" },
  "vocal-deesser": { kind: "insert", destination: "보컬 트랙 Insert" },
  "vocal-formant": { kind: "insert", destination: "보컬 트랙 Insert" },
  "vocal-reverb": { kind: "aux", destination: "별도 FX 채널 · 보컬 Send" },
  "vocal-delay": { kind: "aux", destination: "별도 FX 채널 · 보컬 Send" },
  "vocal-microshift": { kind: "aux", destination: "별도 FX 채널 · 보컬 Send" },
  "vocal-reverb-filter": { kind: "insert", destination: "리버브 FX Return" },
  "vocal-delay-filter": { kind: "insert", destination: "딜레이 FX Return" },
  "mix-drums": { kind: "bus", destination: "드럼 Group" },
  "mix-eq": { kind: "bus", destination: "믹스 Group" },
  "mix-glue": { kind: "bus", destination: "믹스 Group" },
  "master-imager": { kind: "insert", destination: "Stereo Out" },
  "master-dynamics": { kind: "insert", destination: "Stereo Out" },
  "master-maximizer": { kind: "insert", destination: "Stereo Out" },
  "repair-noise": { kind: "offline", destination: "RX 오프라인 전처리" },
  "repair-clicks": { kind: "offline", destination: "RX 오프라인 전처리" },
};
const step = (id, plugin, bundle, purpose, params, tip) => ({
  id,
  plugin,
  bundle,
  purpose,
  params,
  tip,
  routing: { ...routingLocations[id] },
});

export function normalizeInput(value = {}) {
  const input =
    value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const rawKey = cleanText(input.key, 2)
    .toUpperCase()
    .replace("♯", "#")
    .replace("♭", "B");
  const key = ENHARMONICS[rawKey] || rawKey;
  const parsedBpm =
    typeof input.bpm === "number" ||
    (typeof input.bpm === "string" && input.bpm.trim())
      ? Number(input.bpm)
      : NaN;
  return {
    title: cleanText(input.title, 80) || "나의 믹스 레시피",
    key: option(key, KEYS, "C"),
    scale: option(input.scale, ["major", "minor"], "minor"),
    bpm: round(clamp(Number.isFinite(parsedBpm) ? parsedBpm : 100, 40, 240), 1),
    gender: option(input.gender, GENDERS, "mixed"),
    range: option(input.range, RANGES, "mid"),
    genre: option(input.genre, Object.keys(genreProfiles), "pop"),
    mood: option(input.mood, Object.keys(moodProfiles), "warm"),
    lyrics: cleanText(input.lyrics, 4000),
    intensity: option(input.intensity, INTENSITIES, "balanced"),
    target: option(input.target, TARGETS, "streaming"),
    formantEngine: option(
      input.formantEngine,
      ["littlealterboy", "mautopitch"],
      "littlealterboy",
    ),
    formantMode: option(input.formantMode, ["off", "lower", "higher"], "off"),
    useMicroShift:
      typeof input.useMicroShift === "boolean" ? input.useMicroShift : true,
    useKilohearts:
      typeof input.useKilohearts === "boolean" ? input.useKilohearts : true,
  };
}

export function analyzeLyrics(lyrics) {
  const text = cleanText(lyrics, 4000);
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const hangulSyllables = (text.match(/[가-힣]/g) || []).length;
  const latinWordCount = (text.match(/[A-Za-z]+(?:['’\-][A-Za-z]+)*/g) || [])
    .length;
  const countedUnits = hangulSyllables + latinWordCount;
  const unitsPerLine = lines.length ? round(countedUnits / lines.length) : 0;
  const canonicalLines = lines.map((line) =>
    line.toLowerCase().replace(/[\s\p{P}]/gu, ""),
  );
  const repeatedLines = canonicalLines.length - new Set(canonicalLines).size;
  const repeatRatio = lines.length
    ? round((repeatedLines / lines.length) * 100)
    : 0;
  const hasLyrics = Boolean(text);
  const measurable = countedUnits > 0;
  const density = !hasLyrics
    ? "none"
    : !measurable
      ? "unknown"
      : unitsPerLine >= 18
        ? "dense"
        : unitsPerLine <= 7
          ? "sparse"
          : "moderate";
  const labels = {
    none: "가사 없음",
    unknown: "계산 대상 문자 없음",
    dense: "행당 글자 수가 많음",
    sparse: "행당 글자 수가 적음",
    moderate: "중간 길이의 가사",
  };
  const adjustments =
    density === "dense"
      ? [
          "행당 발음 단위가 많아 보컬 리버브 Decay를 20% 줄이고 AUX Send를 2 dB 낮춥니다.",
          "딜레이 AUX Send를 3 dB 낮춰 다음 단어와 겹칠 가능성을 줄입니다.",
        ]
      : density === "sparse"
        ? [
            "행당 발음 단위가 적어 보컬 리버브 Decay를 10% 늘립니다. 실제 프레이즈 간격을 들으며 되돌리세요.",
          ]
        : [];
  return {
    hasLyrics,
    lineCount: lines.length,
    hangulSyllables,
    latinWordCount,
    unitsPerLine,
    density,
    label: labels[density],
    repeatRatio,
    method:
      "빈 행을 제외하고 한글 완성형 음절과 영문 단어를 셉니다. 다른 문자, 박자별 음절 배치와 실제 발음 속도는 분석하지 않습니다.",
    summary: hasLyrics
      ? `${lines.length}개 행 · 행당 ${unitsPerLine}개 단위 · 반복 행 ${repeatRatio}%`
      : "가사를 입력하면 행 길이에 따른 공간계 제안을 추가합니다.",
    adjustments,
  };
}

function stableId(input) {
  let hash = 2166136261;
  for (const character of JSON.stringify(input)) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `recipe-${(hash >>> 0).toString(16)}`;
}

function vocalOrderPlan(input) {
  const deEssFirst =
    ["edm", "rock"].includes(input.genre) ||
    ["bright", "energetic"].includes(input.mood) ||
    input.intensity === "hard";
  if (input.gender === "instrumental") {
    return {
      deEssFirst: false,
      subtitle: "보컬 없는 곡이므로 이 체인은 생략합니다.",
      reason:
        "보컬 없는 곡을 선택했으므로 보컬 Insert와 보컬 FX 채널을 제안하지 않습니다.",
    };
  }
  return {
    deEssFirst,
    subtitle: deEssFirst
      ? "Auto-Tune → 선택적 폼란트 → 다이내믹 EQ → 디에서 → 압축. 선택한 장르·분위기·강도에 따라 압축 전 치찰음 정리를 우선합니다. FX는 별도 병렬 채널입니다."
      : "Auto-Tune → 선택적 폼란트 → 다이내믹 EQ → 압축 → 디에서. 먼저 레벨을 정리한 뒤 치찰음을 억제합니다. FX는 별도 병렬 채널입니다.",
    reason: deEssFirst
      ? `EQ에서 약한 기본 감쇄로 꾸준한 뭉침을 정리하고 순간적인 강조에는 추가 다이내믹 감쇄를 적용합니다. ${genreProfiles[input.genre].label} · ${moodProfiles[input.mood].label} 분위기 · ${intensitySettings[input.intensity].label} 강도를 바탕으로, 압축에서 치찰음이 강조될 가능성을 고려해 디에서를 먼저 제안합니다. 음원을 분석한 결과는 아니며 실제 치찰음이 없으면 디에서를 생략하거나 압축 뒤로 옮겨 비교하세요.`
      : "EQ에서 약한 기본 감쇄와 필요한 순간의 추가 다이내믹 감쇄로 뭉침을 정리한 뒤, 컴프레서로 레벨 편차를 맞추고 그 결과의 치찰음을 억제하는 시작 순서입니다. 음원을 분석한 결과는 아니며 압축에서 치찰음이 과하게 강조되면 디에서를 앞에 옮겨 비교하세요.",
  };
}

function vocalSteps(input, genre, mood, intensity, timing, lyrics) {
  if (input.gender === "instrumental") return [];
  const range = rangeSettings[input.range];
  const cleanupGain = ["edm", "hiphop", "rock"].includes(input.genre)
    ? -1
    : -0.8;
  const cleanupDynamicRange = { natural: -1.2, balanced: -1.5, hard: -2 }[
    input.intensity
  ];
  const dense = lyrics.density === "dense";
  const decayMultiplier = dense ? 0.8 : lyrics.density === "sparse" ? 1.1 : 1;
  const reverbDecay = round(
    clamp((genre.decay + mood.decay) * decayMultiplier, 0.5, 4),
  );
  const reverbSend = clamp(-18 + mood.send - (dense ? 2 : 0), -26, -10);
  const delaySend = clamp(-20 + mood.send - (dense ? 3 : 0), -28, -12);
  const delayNote = {
    quarter: "1/4",
    eighth: "1/8",
    dottedEighth: "1/8 D",
    sixteenth: "1/16",
  }[genre.delay];
  const output = [
    step(
      "vocal-tune",
      "Auto-Tune Pro",
      "antares",
      "곡의 조성과 보컬 음역에 맞춰 피치를 정리합니다.",
      [
        param("Key", input.key),
        param("Scale", input.scale === "major" ? "Major" : "Minor"),
        param(
          "Input Type",
          range.inputType,
          undefined,
          "플러그인 분류명입니다. 실제 음역·톤에 맞는 모드를 먼저 선택하세요.",
        ),
        param(
          "Retune Speed",
          round(clamp(genre.retune * intensity.retune, 0, 100)),
          "ms",
        ),
        param("Humanize", intensity.humanize),
        param("Flex-Tune", intensity.flex),
      ],
      "추천 음역을 우선 사용했습니다. 성별은 EQ나 보정 속도를 결정하지 않습니다. mixed 보컬은 트랙별로 음역과 보정량을 다시 선택하세요.",
    ),
    step(
      "vocal-eq",
      "FabFilter Pro-Q 4",
      "fabfilter",
      "약한 기본 감쇄로 꾸준한 뭉침을 정리하고, 강조되는 순간에는 추가 다이내믹 감쇄로 처리량을 제한합니다.",
      [
        param(
          "High-pass Enable",
          "Off",
          undefined,
          "정적 필터입니다. 저역 떨림·잡음이 실제로 들릴 때만 선택적으로 활성화",
        ),
        param(
          "High-pass Frequency",
          range.highPass,
          "Hz",
          "HPF를 켜야 할 때 참고하는 시작 주파수",
        ),
        param("High-pass Slope", 12, "dB/oct"),
        param("Bell 1 Frequency", range.body, "Hz"),
        param(
          "Bell 1 Gain",
          cleanupGain,
          "dB",
          "지속적인 뭉침을 위한 약한 기본 감쇄",
        ),
        param("Bell 1 Q", 1.1),
        param(
          "Bell 1 Dynamic Range",
          cleanupDynamicRange,
          "dB",
          "밴드를 다이내믹으로 활성화하고 음수 범위로 Downward Dynamic 설정 · 기본 Gain에 더해지는 최대 추가 감쇄",
        ),
        param(
          "Bell 1 Dynamic Threshold",
          "Auto",
          undefined,
          "다이내믹 밴드의 Auto Threshold부터 시작하고 실제 작동량을 확인",
        ),
        param("Bell 2 Frequency", range.presence, "Hz"),
        param(
          "Bell 2 Gain",
          round(Math.max(0, genre.presence + mood.presence)),
          "dB",
          "가사의 존재감을 위한 톤 조정이며 클린업 감쇄와 별도",
        ),
        param("Bell 2 Q", 0.8),
      ],
      `밴드 1을 다이내믹으로 활성화하세요. 기본 ${cleanupGain} dB + 다이내믹 최대 추가 ${cleanupDynamicRange} dB로, 이 대역의 총 감쇄 상한은 ${round(cleanupGain + cleanupDynamicRange)} dB입니다. Auto Threshold 결과를 실제 음원에서 듣고, 불필요하게 계속 줄어들면 Dynamic Range를 줄이거나 Threshold를 수동 조정하세요. HPF는 정적 필터로 처음에는 꺼 두고 저역 잡음이 있을 때만 켜세요. 다이내믹이 작동하는 동안에도 톤은 바뀌므로 반주와 함께 원음과 비교하세요.`,
    ),
    step(
      "vocal-compressor",
      "FabFilter Pro-C",
      "fabfilter",
      "가사가 일정하게 들리도록 보컬 레벨의 편차를 줄입니다.",
      [
        param(
          "Style",
          "Clean",
          undefined,
          "Ratio·Knee를 수동으로 조절할 수 있는 스타일",
        ),
        param("Threshold", -18, "dB", "입력 레벨에 따라 반드시 조정"),
        param(
          "Ratio",
          round(clamp(genre.ratio + intensity.ratio, 1.5, 6)),
          ":1",
        ),
        param(
          "Attack",
          dense ? Math.max(5, genre.attack - 4) : genre.attack,
          "ms",
        ),
        param("Release", round(clamp(timing.sixteenth, 50, 180)), "ms"),
        param("Auto Release", "Off"),
        param("Knee", 6, "dB"),
      ],
      "Threshold는 고정 정답이 아닙니다. 자연스러운 설정은 2–3 dB, 균형 설정은 3–4 dB, 강한 설정은 4–6 dB 정도의 Gain Reduction을 보며 조정하고 레벨을 맞춰 비교하세요.",
    ),
    step(
      "vocal-deesser",
      "FabFilter Pro-DS",
      "fabfilter",
      "치찰음만 줄여 보컬의 밝기를 유지합니다.",
      [
        param("Detection", "Single Vocal"),
        param("Processing", "Split Band"),
        param("Detection Low", range.sibilance, "Hz"),
        param("Detection High", 11000, "Hz"),
        param("Range", intensity.range, "dB"),
        param("Threshold", -30, "dB", "치찰음에서만 작동하도록 청취하며 조절"),
      ],
      "Audition으로 검출되는 소리를 확인하세요. 모음과 숨까지 계속 줄어들면 Threshold를 올리거나 검출 대역을 좁히세요.",
    ),
    step(
      "vocal-reverb",
      "Valhalla VintageVerb",
      "valhalla",
      "보컬 뒤에 공간을 만들되 중심과 자음의 명료도를 유지합니다.",
      [
        param(
          "Mode",
          input.mood === "dreamy" || input.genre === "ballad"
            ? "Concert Hall"
            : "Plate",
        ),
        param("Mix", 100, "%", "Cubase FX 채널의 AUX 구성"),
        param("Decay", reverbDecay, "s"),
        param("PreDelay", round(clamp(timing.sixteenth / 3, 20, 80)), "ms"),
        param(
          "LowCut",
          input.useKilohearts ? 20 : 200,
          "Hz",
          input.useKilohearts
            ? "추가 저역 정리는 뒤의 kHs Filter에서 수행"
            : undefined,
        ),
        param("HighCut", mood.highCut, "Hz"),
        param(
          "Cubase AUX Send",
          reverbSend,
          "dB",
          "플러그인 노브가 아닌 FX 채널로 보내는 레벨",
        ),
      ],
      "FX 채널을 만든 뒤 Send로 양을 조절하세요. 플러그인을 인서트로 쓰면 Mix 100%를 그대로 적용하지 말고 Dry/Wet을 별도로 정하세요.",
    ),
    step(
      "vocal-delay",
      "Valhalla Delay",
      "valhalla",
      "템포에 맞는 반복을 더해 빈 공간과 프레이즈 끝을 연결합니다.",
      [
        param("Mix", 100, "%", "Cubase FX 채널의 AUX 구성"),
        param(
          "Delay",
          delayNote,
          undefined,
          `Tempo Sync 음표 모드 기준 ${timing[genre.delay]} ms · Cubase 프로젝트 BPM ${input.bpm}`,
        ),
        param("Feedback", clamp(22 + mood.feedback, 12, 40), "%"),
        param(
          "LowCut",
          input.useKilohearts ? 20 : 250,
          "Hz",
          input.useKilohearts
            ? "추가 저역 정리는 뒤의 kHs Filter에서 수행"
            : undefined,
        ),
        param("HighCut", Math.min(7000, mood.highCut), "Hz"),
        param(
          "Cubase AUX Send",
          delaySend,
          "dB",
          "플러그인 노브가 아닌 FX 채널로 보내는 레벨",
        ),
      ],
      "딜레이 시간 표시를 음표 모드로 선택하고 Cubase 템포에 동기화하세요. 가창 중에는 Send를 낮추고 프레이즈 끝에서 올리는 자동화부터 시도하세요. 피드백이 쌓이면 Send보다 Feedback을 먼저 줄이세요.",
    ),
  ];
  if (input.formantMode !== "off") {
    const shift = input.formantMode === "lower" ? -1 : 1;
    const mauto = input.formantEngine === "mautopitch";
    output.splice(
      1,
      0,
      step(
        "vocal-formant",
        mauto ? "MAutoPitch" : "Soundtoys LittleAlterBoy",
        mauto ? "melda" : "soundtoys",
        "Auto-Tune의 피치 보정 뒤에서 음높이를 유지하며 폼란트만 소폭 변경합니다.",
        mauto
          ? [
              param("Depth", 0, "%", "MAutoPitch의 자동 피치 보정을 해제"),
              param("Detune", 0, "cents"),
              param("Formant shift", shift, "semitones"),
              param("Dry/Wet", 100, "%"),
            ]
          : [
              param("Mode", "Transpose"),
              param("Pitch", 0, "semitones"),
              param("Formant", shift, "semitones"),
              param(
                "Mix",
                100,
                "%",
                "원보컬 Insert에서 폼란트 처리된 신호를 사용",
              ),
              param(
                "Drive",
                "최소",
                undefined,
                "드라이브를 추가하지 않고 시작",
              ),
            ],
        mauto
          ? "피치 보정은 Auto-Tune만 수행합니다. MAutoPitch Depth 0%, Detune 0을 유지하고 설치판에서 독립 Formant shift가 활성화되는지 확인하세요. Keep formants와의 관계는 설치판 매뉴얼을 확인하고 실제 음높이가 변하지 않는지 원음과 비교하세요."
          : "Transpose 모드에서 Pitch 0을 유지하세요. Quantize·Robot은 사용하지 않습니다. 작은 폼란트 이동도 발음과 음색을 바꾸므로 원음과 같은 음량으로 비교하고 부자연스러우면 Formant를 0으로 되돌리세요.",
      ),
    );
  }
  if (vocalOrderPlan(input).deEssFirst) {
    const deEsser = output.splice(
      output.findIndex((item) => item.id === "vocal-deesser"),
      1,
    )[0];
    output.splice(
      output.findIndex((item) => item.id === "vocal-compressor"),
      0,
      deEsser,
    );
  }
  if (input.useMicroShift) {
    output.push(
      step(
        "vocal-microshift",
        "Soundtoys MicroShift",
        "soundtoys",
        "별도 보컬 FX 채널에 가벼운 더블링을 더하고 원보컬의 중심은 유지합니다.",
        [
          param(
            "Style",
            input.intensity === "natural"
              ? "I"
              : input.mood === "dreamy" || input.intensity === "hard"
                ? "III"
                : "II",
          ),
          param("Mix", 100, "%", "별도 Cubase FX 채널에서 사용"),
          param("Focus", { low: 300, mid: 500, high: 700 }[input.range], "Hz"),
          param(
            "Detune",
            100,
            "%",
            "선택한 Style 기본 디튠량의 배율이며 100 cents가 아님",
          ),
          param(
            "Delay",
            100,
            "%",
            "선택한 Style 기본 지연의 배율이며 100 ms가 아님",
          ),
          param(
            "Cubase AUX Send",
            clamp(-20 + mood.send - (dense ? 2 : 0), -28, -14),
            "dB",
            "플러그인 노브가 아닌 FX 채널로 보내는 레벨",
          ),
        ],
        "원보컬에 직접 Insert하지 말고 별도 FX 채널에서 Send로 양을 조절하세요. MicroShift 지연은 BPM 동기화 딜레이와 다릅니다. Focus 아래 대역의 중복과 모노 합산 시 얇아지는 소리를 확인하고 문제가 들리면 Send를 낮추세요.",
      ),
    );
  }
  if (input.useKilohearts) {
    for (const [id, destination, frequency] of [
      ["vocal-reverb-filter", "리버브", 200],
      ["vocal-delay-filter", "딜레이", 250],
    ]) {
      output.push(
        step(
          id,
          "kHs Filter",
          "kilohearts",
          `${destination} FX Return의 저역만 정리해 보컬과 베이스의 중심을 비워 둡니다.`,
          [
            param(
              "Filter Type",
              "High Pass",
              undefined,
              "필터 유형 아이콘에서 하이패스 선택",
            ),
            param("Frequency", frequency, "Hz"),
          ],
          `${destination} 플러그인 뒤, 같은 FX 채널의 Insert에 놓으세요. 공명은 최소부터 시작하고 증폭하지 마세요. 공간계 내장 LowCut과 강하게 중복 적용하지 않도록 내장 LowCut은 20 Hz로 제안했습니다. 효과가 얇아지면 Frequency를 낮추세요.`,
        ),
      );
    }
  }
  return output;
}

function mixSteps(input, genre, mood, intensity, timing) {
  const heavyLowMids = ["edm", "hiphop"].includes(input.genre);
  const cleanupGain = heavyLowMids
    ? -0.5
    : input.genre === "rock"
      ? -0.4
      : -0.3;
  const cleanupDynamicRange =
    input.intensity === "hard" ? -1 : heavyLowMids ? -0.8 : -0.5;
  return [
    step(
      "mix-eq",
      "FabFilter Pro-Q 4",
      "fabfilter",
      "믹스의 꾸준한 저중역 뭉침은 약하게 깎고, 순간적인 쌓임에는 다이내믹 감쇄를 추가합니다.",
      [
        param(
          "High-pass Enable",
          "Off",
          undefined,
          "정적 필터입니다. 불필요한 극저역이 실제로 있을 때만 선택적으로 활성화",
        ),
        param("High-pass Frequency", 20, "Hz", "HPF를 켜야 할 때의 참고값"),
        param("High-pass Slope", 12, "dB/oct"),
        param("Bell Frequency", 250, "Hz"),
        param("Bell Gain", cleanupGain, "dB", "약한 기본 감쇄"),
        param("Bell Q", 0.7),
        param(
          "Bell Dynamic Range",
          cleanupDynamicRange,
          "dB",
          "Downward Dynamic · 기본 Gain에 더해지는 최대 추가 감쇄",
        ),
        param(
          "Bell Dynamic Threshold",
          "Auto",
          undefined,
          "실제 대역 작동량을 확인하고 수동 Threshold도 비교",
        ),
        param("High-shelf Frequency", 10000, "Hz"),
        param("High-shelf Gain", mood.air, "dB"),
      ],
      `250 Hz 밴드의 기본 감쇄 ${cleanupGain} dB에 다이내믹 최대 추가 ${cleanupDynamicRange} dB를 제안합니다. 이 대역의 총 감쇄 상한은 ${round(cleanupGain + cleanupDynamicRange)} dB입니다. 다이내믹 밴드를 활성화하고 Auto Threshold가 불필요하게 계속 반응하면 범위를 줄이거나 Threshold를 수동 조정하세요. HPF는 저역 잡음이 있을 때만 켜는 정적 필터입니다. 킥과 베이스가 충돌하면 개별 트랙과 사이드체인도 확인하세요.`,
    ),
    step(
      "mix-drums",
      "Waves CLA-76",
      "waves",
      "드럼 버스의 피크를 제어해 그루브와 타격감을 정리합니다.",
      [
        param("Ratio", 4, ":1"),
        param("Attack", input.intensity === "hard" ? 4 : 3, "1–7"),
        param("Release", input.genre === "ballad" ? 4 : 6, "1–7"),
        param("Input", "Gain Reduction 1–3 dB에 맞춰 조절"),
        param("Output", "바이패스와 같은 체감 음량"),
      ],
      "드럼이 있는 프로젝트에서 선택적으로 사용하세요. CLA-76의 1–7은 ms가 아니며 큰 숫자가 빠릅니다. 킥 어택이 사라지면 Attack을 낮추세요.",
    ),
    step(
      "mix-glue",
      "Waves SSL G-Master Buss Compressor",
      "waves",
      "믹스 전체의 움직임을 가볍게 묶습니다.",
      [
        param("Ratio", 2, ":1"),
        param("Attack", 30, "ms"),
        param("Release", "Auto"),
        param(
          "Threshold",
          -6,
          "dB",
          "자연스러움: 0.5–1 dB / 균형: 1–2 dB / 강함: 최대 3 dB의 GR에 맞춰 조절",
        ),
        param("Makeup", 0, "dB", "바이패스와 같은 체감 음량으로 최종 조절"),
      ],
      `BPM ${input.bpm}의 1/4박은 ${timing.quarter} ms입니다. 버스가 숨 쉬는 타이밍을 듣고 Release를 결정하세요. 마스터 Dynamics와 누적 압축량도 확인하세요.`,
    ),
  ];
}

function masterSteps(input, genre, mood, intensity, targets, timing) {
  const dynamic = input.target === "dynamic";
  const width = clamp(
    genre.width + intensity.width + (input.mood === "dreamy" ? 4 : 0),
    0,
    22,
  );
  return [
    step(
      "master-imager",
      "Ozone 12 Imager",
      "ozone",
      "저역은 좁게 유지하고 중·고역의 폭만 조금 확장합니다.",
      [
        param("Band 1 Upper Crossover", 120, "Hz"),
        param("Band 2 Upper Crossover", 4000, "Hz"),
        param("Band 1 Width", -100, "%"),
        param("Band 2 Width", dynamic ? Math.min(width, 6) : width, "%"),
        param(
          "Band 3 Width",
          dynamic ? Math.min(width + 2, 8) : width + 2,
          "%",
        ),
        param("Stereoize", "Off"),
      ],
      "저역의 -100은 모노 출발점입니다. 원래의 스테레오 저역이 중요한 곡이면 좁히는 양을 줄이세요. Cubase 모노 합산과 상관계로 소실·위상 변화를 반드시 확인하세요.",
    ),
    step(
      "master-dynamics",
      "Ozone 12 Dynamics",
      "ozone",
      "필요한 경우에만 전체 다이내믹을 아주 조금 정리합니다.",
      [
        param(
          "Band Configuration",
          "1 band",
          undefined,
          "크로스오버 없이 전체 대역을 압축하는 구성",
        ),
        param("Compressor Threshold", -18, "dB", "입력 레벨에 따라 조정"),
        param(
          "Ratio",
          dynamic ? 1.2 : input.target === "club" ? 1.5 : 1.3,
          ":1",
        ),
        param("Attack", 30, "ms"),
        param("Release", round(clamp(timing.eighth, 80, 300)), "ms"),
      ],
      "처음에는 바이패스로 비교하세요. 이미 SSL 버스에서 압축했다면 생략할 수 있습니다. 켠 경우에도 추가 Gain Reduction은 약 0.5–1 dB로 제한하고 Dynamics의 별도 Limiter는 사용하지 마세요. 최종 피크 제어는 Maximizer에서 수행합니다.",
    ),
    step(
      "master-maximizer",
      "Ozone 12 Maximizer",
      "ozone",
      "True Peak를 제한하면서 선택한 출력의 평균 음량을 확인합니다.",
      [
        param("Mode", "IRC IV", undefined, "설치된 버전의 제공 모드를 확인"),
        param(
          "Gain",
          0,
          "dB",
          `${targets.lufs} LUFS-I 참고 목표까지 청취하며 올림`,
        ),
        param("Output Level", targets.truePeak, "dB"),
        param("True Peak", "On"),
      ],
      `${targets.lufs} LUFS-I는 곡 전체를 재생해 측정하는 참고 목표입니다. ${input.target === "club" ? "Gain Reduction이 지속적으로 4 dB를 넘거나 킥이 일그러지면 입력 Gain을 줄이고 목표 음량을 낮추세요." : "Gain Reduction은 대략 1–3 dB부터 비교하고 펌핑·치찰음·트랜지언트 손상을 들으세요."} 최종 리미터는 하나부터 사용하세요.`,
    ),
  ];
}

function repairSteps(input) {
  const noVocal = input.gender === "instrumental";
  const output = noVocal
    ? []
    : [
        step(
          "repair-noise",
          "RX 11 Voice De-noise",
          "rx",
          "녹음에 실제 지속 노이즈가 있을 때 보컬 클립을 먼저 정리합니다.",
          [
            param("Reduction", 3, "dB"),
            param("Threshold", "Preview로 노이즈만 반응하도록 설정"),
          ],
          "선택 처리입니다. 노이즈가 없는 녹음은 생략하세요. RX에서 클립 복사본을 Preview하고, 숨·말끝·고역 손상이 없는 수준으로 적용한 뒤 Cubase에 가져오세요.",
        ),
      ];
  output.push(
    step(
      "repair-clicks",
      "RX 11 De-click",
      "rx",
      "개별 클릭·디지털 잡음이 들리는 클립에만 전처리를 적용합니다.",
      [param("Sensitivity", 2, "0–10")],
      "선택 처리입니다. 클릭이 들리는 구간만 선택하고 원본 복사본을 남기세요. 킥·스네어·자음이 둔해지면 Sensitivity를 낮추거나 처리를 취소하세요.",
    ),
  );
  return output;
}

export function formatRecipe(recipe) {
  const { input, summary, timing, targets, lyricAnalysis, sections, notes } =
    recipe;
  const lines = [
    `# ${input.title}`,
    "",
    summary.headline,
    summary.description,
    "",
    `입력: ${summary.tags.join(" · ")}`,
    `보컬 옵션: Auto-Tune 피치 보정 유지 · 폼란트 ${input.formantEngine === "mautopitch" ? "MAutoPitch" : "LittleAlterBoy"} ${input.formantMode === "off" ? "OFF" : `${input.formantMode === "lower" ? "-1" : "+1"} semitone`} · MicroShift ${input.useMicroShift ? "ON" : "OFF"} · kHs FX Return Filter ${input.useKilohearts ? "ON" : "OFF"}${input.gender === "instrumental" ? " (악기곡: 보컬 옵션 적용 생략)" : ""}`,
    `출력 참고 목표: ${targets.lufs} LUFS-I · ${targets.truePeak} dBTP · 프리마스터 피크 ≤ -${targets.headroom} dBFS`,
    `박자 시간: 1/4 ${timing.quarter} ms · 1/8 ${timing.eighth} ms · 1/8 D ${timing.dottedEighth} ms · 1/16 ${timing.sixteenth} ms`,
    "",
    `가사 통계: ${lyricAnalysis.summary}`,
    lyricAnalysis.method,
    ...lyricAnalysis.adjustments,
    "",
  ];
  for (const section of sections) {
    lines.push(`## ${section.title}`, section.subtitle, "");
    if (section.orderReason)
      lines.push(`순서 이유: ${section.orderReason}`, "");
    if (!section.steps.length)
      lines.push("보컬 없는 곡: 보컬 체인을 생략합니다.", "");
    for (const item of section.steps) {
      const bundle = pluginBundles.find((value) => value.id === item.bundle);
      lines.push(
        `### ${item.plugin}`,
        bundle ? `${bundle.name} ${bundle.version}` : "",
        `적용 위치: ${item.routing.destination} (${item.routing.kind})`,
        item.purpose,
      );
      for (const setting of item.params) {
        lines.push(
          `- ${setting.name}: ${setting.value}${setting.unit ? ` ${setting.unit}` : ""}${setting.note ? ` (${setting.note})` : ""}`,
        );
      }
      lines.push(`청취: ${item.tip}`, "");
    }
  }
  lines.push(
    "## 적용 전 확인",
    ...summary.warnings.map((note) => `- ${note}`),
    ...notes.map((note) => `- ${note}`),
    "",
  );
  return lines.join("\n");
}

export function generateRecipe(rawInput = {}) {
  const input = normalizeInput(rawInput);
  const genre = genreProfiles[input.genre];
  const mood = moodProfiles[input.mood];
  const intensity = intensitySettings[input.intensity];
  const target = targetSettings[input.target];
  const timing = {
    quarter: round(60000 / input.bpm),
    eighth: round(30000 / input.bpm),
    dottedEighth: round(45000 / input.bpm),
    sixteenth: round(15000 / input.bpm),
  };
  const targets = {
    lufs: target.lufs,
    truePeak: target.truePeak,
    headroom: target.headroom,
  };
  const lyricAnalysis = analyzeLyrics(input.lyrics);
  const vocalOrder = vocalOrderPlan(input);
  if (input.gender === "instrumental") {
    lyricAnalysis.adjustments = [];
    if (lyricAnalysis.hasLyrics) {
      lyricAnalysis.summary += " · 악기곡에서는 통계만 표시합니다.";
    }
  } else if (lyricAnalysis.density === "dense" && input.useMicroShift) {
    lyricAnalysis.adjustments.push(
      "행당 발음 단위가 많아 MicroShift AUX Send를 추가로 2 dB 낮춥니다.",
    );
  }
  const warnings = [
    "음원은 분석하지 않았습니다. EQ·Threshold·LUFS는 실제 녹음을 듣고 측정해 조정하는 출발점입니다.",
    "Cubase에 자동 적용하는 프리셋이 아닙니다. 플러그인을 열어 각 값을 직접 입력하세요.",
  ];
  if (input.target === "club")
    warnings.push(
      "높은 음량 목표는 킥·베이스의 왜곡과 다이내믹 손실을 늘릴 수 있습니다. 손상이 들리면 LUFS 목표를 낮추세요.",
    );
  if (input.gender === "mixed")
    warnings.push(
      "여러 보컬은 같은 체인을 일괄 복사하지 말고 트랙마다 실제 음역·치찰음·레벨을 확인하세요.",
    );
  if (input.gender !== "instrumental" && input.formantMode !== "off") {
    warnings.push(
      "폼란트 변경은 음색과 발음을 바꿉니다. 피치는 Auto-Tune에서만 보정하고, 별도 폼란트 플러그인으로 음높이가 변하지 않는지 원음과 비교하세요.",
    );
  }
  if (input.gender === "instrumental" && lyricAnalysis.hasLyrics)
    warnings.push(
      "보컬 없는 곡을 선택해 가사 통계는 보컬 체인 설정에 반영하지 않았습니다.",
    );
  if (
    rawInput &&
    typeof rawInput === "object" &&
    (typeof rawInput.bpm === "number" || typeof rawInput.bpm === "string")
  ) {
    const bpm = Number(rawInput.bpm);
    if (Number.isFinite(bpm) && (bpm < 40 || bpm > 240))
      warnings.push(`BPM은 지원 범위 40–240 안의 ${input.bpm}로 조정했습니다.`);
  }
  const recipe = {
    id: stableId(input),
    input,
    summary: {
      headline: `${mood.label} ${genre.label}, ${intensity.label} 다듬기`,
      description: `${input.gender === "instrumental" ? "인스트루멘털 믹스와 마스터" : `${rangeSettings[input.range].label} 보컬부터 믹스와 마스터`}까지 이어지는 수동 적용용 시작 설정입니다. ${target.label} 출력에 맞춰 청취와 측정으로 완성하세요.`,
      tags: [
        `${input.key} ${input.scale === "major" ? "Major" : "Minor"}`,
        `${input.bpm} BPM`,
        genre.label,
        mood.label,
        intensity.label,
        target.label,
      ],
      warnings,
    },
    timing,
    targets,
    lyricAnalysis,
    sections: [
      {
        id: "vocal",
        title: "보컬 체인",
        subtitle: vocalOrder.subtitle,
        orderReason: vocalOrder.reason,
        steps: vocalSteps(input, genre, mood, intensity, timing, lyricAnalysis),
      },
      {
        id: "mix",
        title: "믹스 & 버스",
        subtitle:
          "믹스 Group은 다이내믹 EQ → SSL로 뭉침을 정리한 뒤 가볍게 압축합니다. CLA-76은 독립된 드럼 Group에 적용합니다.",
        orderReason:
          "버스 EQ의 약한 기본 감쇄와 순간적인 추가 다이내믹 감쇄로 뭉침을 정리한 뒤 SSL이 전체 움직임을 다루도록 제안합니다. 드럼의 CLA-76은 별도 드럼 Group에 있으므로 EQ와 SSL 사이의 직렬 처리로 연결하지 않습니다.",
        steps: mixSteps(input, genre, mood, intensity, timing),
      },
      {
        id: "master",
        title: "마스터 체인",
        subtitle:
          "Imager → 선택적 Dynamics → Maximizer. 폭과 다이내믹을 정리한 뒤 최종 피크를 제한합니다.",
        orderReason:
          "스테레오 폭을 먼저 확인하고 필요한 경우에만 추가 압축한 뒤 Maximizer로 출력 피크를 제한합니다. 이 시작 순서는 선택한 장르의 음원 분석 결과가 아니며 같은 음량의 바이패스 비교로 결정하세요.",
        steps: masterSteps(input, genre, mood, intensity, targets, timing),
      },
      {
        id: "repair",
        title: "녹음 전처리",
        subtitle:
          "잡음이 들리는 클립만 믹스 전에 정리합니다. 원본 복사본에서 먼저 결과를 비교하세요.",
        orderReason:
          "노이즈와 클릭이 압축·공간계에서 강조되지 않도록 필요한 클립만 RX로 먼저 정리합니다. 이 목록 위치와 관계없이 Cubase Insert 체인 앞에서 수행하는 오프라인 단계입니다.",
        steps: repairSteps(input),
      },
    ],
    notes: [
      "Cubase 프로젝트 BPM과 조성을 먼저 맞추고 개별 트랙의 레벨·팬을 잡으세요. 프리마스터 피크 약 -6 dBFS는 여유를 잡기 위한 참고치이며 파일을 강제 노멀라이즈할 필요는 없습니다.",
      "보컬 성별은 참고 정보로만 보관합니다. 실제 음역 선택이 Auto-Tune Input Type, EQ와 치찰음 검출 대역을 결정합니다.",
      "가사의 글자 수는 실제 발음 속도나 감정 분석이 아닙니다. 줄바꿈에 따라 통계가 달라지며 사용자가 선택한 분위기를 우선합니다.",
      "리버브와 딜레이는 Cubase FX 채널에서 Mix 100%로 사용하고 Send로 양을 조정합니다. 인서트 사용 시 Dry/Wet을 따로 정하세요.",
      "스트리밍 -14 LUFS-I는 정규화 참고값이며 제출 의무 규격이 아닙니다. 실제 음원, 플랫폼과 장르에 맞춰 목표를 수정하세요.",
      "EQ는 실제 음색에, 컴프레서 Threshold는 입력 레벨에 맞춰 조정하세요. 각 단계의 Gain Reduction과 전체 누적 압축량을 확인하세요.",
      "Pro-Q 4 클린업은 약한 기본 Bell Gain 감쇄에 음수 Dynamic Range의 추가 감쇄를 더합니다. 지속적인 뭉침과 순간적인 공명을 나눠 과한 고정 감쇄를 줄이는 시작 설정입니다.",
      "다이내믹 EQ도 작동하는 동안에는 음색이 변합니다. Auto Threshold가 실제 녹음에서 필요한 순간만 반응하는지 듣고 기본 Gain·Dynamic Range·Threshold를 조정하세요. 손실을 최소화하는 것이 목표이며 원음과 같은 음량으로 비교하세요.",
      "High-pass는 다이내믹 Bell과 별개의 정적 필터입니다. 저역 떨림이나 불필요한 극저역이 들릴 때만 활성화하세요.",
      "명시된 번들의 설치 파일과 버전별 UI를 검증하지 않았습니다. 일부 컨트롤명·제공 모드가 설치판과 다르면 해당 플러그인 매뉴얼을 확인하세요.",
      "추가 보유한 Kilohearts, Soundtoys, MAutoPitch의 버전은 미지정입니다. MAutoPitch는 Auto-Tune 대체가 아니라 선택적 폼란트 처리용으로만 사용합니다.",
      "MicroShift는 보컬 FX 채널에서만 적용합니다. 마스터의 Ozone Imager와 폭 증가가 겹치므로 모노 합산과 전체 스테레오 폭을 확인하고 필요한 쪽의 양을 줄이세요.",
      "모노 합산, 낮은 청취 음량, 헤드폰과 스피커를 번갈아 확인하고 전체 곡의 LUFS-I·True Peak를 측정한 뒤 출력하세요.",
    ],
  };
  recipe.exportText = formatRecipe(recipe);
  return recipe;
}
