import test from "node:test";
import assert from "node:assert/strict";
import {
  analyzeLyrics,
  exampleSongs,
  formatRecipe,
  generateRecipe,
  normalizeInput,
  pluginBundles,
} from "../src/engine.js";

const section = (recipe, id) =>
  recipe.sections.find((value) => value.id === id);
const setting = (recipe, stepId, name) =>
  recipe.sections
    .flatMap((value) => value.steps)
    .find((value) => value.id === stepId)
    .params.find((value) => value.name === name).value;

test("tempo math uses exact musical subdivision ratios and rounds once", () => {
  const recipe = generateRecipe({ bpm: 120 });
  assert.deepEqual(recipe.timing, {
    quarter: 500,
    eighth: 250,
    dottedEighth: 375,
    sixteenth: 125,
  });
  const oddTempo = generateRecipe({ bpm: 137 });
  assert.equal(oddTempo.timing.dottedEighth, Number((45000 / 137).toFixed(1)));
  assert.equal(setting(recipe, "vocal-delay", "Delay"), "1/8");
  assert.match(
    section(recipe, "vocal")
      .steps.find((step) => step.id === "vocal-delay")
      .params.find((param) => param.name === "Delay").note,
    /250 ms/,
  );
});

test("normalization handles unsafe types, invalid enums, bounds, text limits and flat keys", () => {
  assert.deepEqual(normalizeInput(null), normalizeInput({}));
  assert.deepEqual(normalizeInput([]), normalizeInput({}));
  const result = normalizeInput({
    key: "Db",
    scale: "wrong",
    bpm: "999",
    range: "wrong",
    genre: "unknown",
    mood: null,
    intensity: 99,
    target: "radio",
    lyrics: " x ".repeat(2000),
    title: " Test ",
  });
  assert.equal(result.key, "C#");
  assert.equal(result.bpm, 240);
  assert.equal(result.scale, "minor");
  assert.equal(result.range, "mid");
  assert.equal(result.genre, "pop");
  assert.equal(result.target, "streaming");
  assert.equal(result.title, "Test");
  assert.equal(result.lyrics.length, 4000);
  for (const bpm of [NaN, Infinity, undefined, "no", "", true])
    assert.equal(normalizeInput({ bpm }).bpm, 100);
  assert.equal(normalizeInput({ bpm: 10 }).bpm, 40);
  assert.equal(normalizeInput({ bpm: "119.52" }).bpm, 119.5);
});

test("voice range controls tone settings independent of gender", () => {
  const femaleLow = generateRecipe({ gender: "female", range: "low" });
  const maleLow = generateRecipe({ gender: "male", range: "low" });
  assert.deepEqual(
    section(femaleLow, "vocal").steps,
    section(maleLow, "vocal").steps,
  );
  const high = generateRecipe({ gender: "male", range: "high" });
  assert.equal(setting(femaleLow, "vocal-tune", "Input Type"), "Low Male");
  assert.equal(setting(high, "vocal-tune", "Input Type"), "Soprano");
  assert.ok(
    setting(high, "vocal-eq", "High-pass Frequency") >
      setting(femaleLow, "vocal-eq", "High-pass Frequency"),
  );
  assert.ok(
    setting(high, "vocal-deesser", "Detection Low") >
      setting(femaleLow, "vocal-deesser", "Detection Low"),
  );
});

test("Pro-Q 4 cleanup combines gentle base cuts with bounded additional dynamic attenuation", () => {
  for (const genre of ["pop", "hiphop", "rnb", "ballad", "edm", "rock"]) {
    for (const intensity of ["natural", "balanced", "hard"]) {
      const recipe = generateRecipe({ genre, intensity, mood: "dark" });
      for (const [
        stepId,
        gainName,
        dynamicName,
        thresholdName,
        baseLimits,
        dynamicLimits,
      ] of [
        [
          "vocal-eq",
          "Bell 1 Gain",
          "Bell 1 Dynamic Range",
          "Bell 1 Dynamic Threshold",
          [-1, -0.7],
          [-2, -1.2],
        ],
        [
          "mix-eq",
          "Bell Gain",
          "Bell Dynamic Range",
          "Bell Dynamic Threshold",
          [-0.5, -0.3],
          [-1, -0.5],
        ],
      ]) {
        const item = recipe.sections
          .flatMap((section) => section.steps)
          .find((step) => step.id === stepId);
        const baseGain = setting(recipe, stepId, gainName);
        const additionalRange = setting(recipe, stepId, dynamicName);
        assert.equal(item.plugin, "FabFilter Pro-Q 4");
        assert.ok(baseGain >= baseLimits[0] && baseGain <= baseLimits[1]);
        assert.ok(
          additionalRange >= dynamicLimits[0] &&
            additionalRange <= dynamicLimits[1],
        );
        assert.equal(setting(recipe, stepId, thresholdName), "Auto");
        assert.match(
          item.params.find((param) => param.name === dynamicName).note,
          /Downward Dynamic/,
        );
        assert.match(
          item.params.find((param) => param.name === dynamicName).note,
          /추가 감쇄/,
        );
        const maximumTotalCut = Number((baseGain + additionalRange).toFixed(1));
        assert.ok(item.tip.includes(`총 감쇄 상한은 ${maximumTotalCut} dB`));
        assert.equal(setting(recipe, stepId, "High-pass Enable"), "Off");
        assert.match(
          item.params.find((param) => param.name === "High-pass Enable").note,
          /정적 필터/,
        );
        assert.match(item.tip, /Auto Threshold/);
        assert.ok(recipe.exportText.includes(`${gainName}: ${baseGain} dB`));
        assert.ok(
          recipe.exportText.includes(`${dynamicName}: ${additionalRange} dB`),
        );
      }
      assert.ok(setting(recipe, "vocal-eq", "Bell 2 Gain") >= 0);
    }
  }
  const natural = generateRecipe({ intensity: "natural" });
  const hard = generateRecipe({ intensity: "hard" });
  assert.ok(
    setting(hard, "vocal-eq", "Bell 1 Dynamic Range") <
      setting(natural, "vocal-eq", "Bell 1 Dynamic Range"),
  );
  assert.match(
    hard.exportText,
    /다이내믹 EQ도 작동하는 동안에는 음색이 변합니다/,
  );
});

test("genre, mood, intensity and output each alter an applicable recommendation", () => {
  const ballad = generateRecipe({
    genre: "ballad",
    mood: "warm",
    intensity: "natural",
    target: "dynamic",
  });
  const edm = generateRecipe({
    genre: "edm",
    mood: "energetic",
    intensity: "hard",
    target: "club",
  });
  assert.ok(
    setting(ballad, "vocal-tune", "Retune Speed") >
      setting(edm, "vocal-tune", "Retune Speed"),
  );
  assert.ok(
    setting(ballad, "vocal-compressor", "Ratio") <
      setting(edm, "vocal-compressor", "Ratio"),
  );
  assert.equal(setting(ballad, "vocal-delay", "Delay"), "1/4");
  assert.equal(setting(edm, "vocal-delay", "Delay"), "1/8 D");
  assert.equal(ballad.targets.lufs, -16);
  assert.equal(edm.targets.lufs, -9);
  assert.equal(generateRecipe({ target: "streaming" }).targets.lufs, -14);
  const warm = generateRecipe({ mood: "warm" });
  const dreamy = generateRecipe({ mood: "dreamy" });
  assert.ok(
    setting(dreamy, "vocal-reverb", "Decay") >
      setting(warm, "vocal-reverb", "Decay"),
  );
  assert.ok(
    setting(dreamy, "vocal-delay", "Feedback") >
      setting(warm, "vocal-delay", "Feedback"),
  );
  assert.ok(
    setting(
      generateRecipe({ intensity: "hard" }),
      "vocal-tune",
      "Retune Speed",
    ) <
      setting(
        generateRecipe({ intensity: "natural" }),
        "vocal-tune",
        "Retune Speed",
      ),
  );
});

test("selected genre, mood and intensity can place de-essing before compression", () => {
  const baselineInput = {
    genre: "ballad",
    mood: "warm",
    intensity: "natural",
    formantMode: "lower",
  };
  const baseline = generateRecipe(baselineInput);
  const baselineIds = section(baseline, "vocal").steps.map((step) => step.id);
  assert.ok(
    baselineIds.indexOf("vocal-compressor") <
      baselineIds.indexOf("vocal-deesser"),
  );
  for (const variant of [
    { mood: "bright" },
    { mood: "energetic" },
    { intensity: "hard" },
    { genre: "edm" },
    { genre: "rock" },
  ]) {
    const recipe = generateRecipe({ ...baselineInput, ...variant });
    const vocal = section(recipe, "vocal");
    const ids = vocal.steps.map((step) => step.id);
    assert.deepEqual(ids.slice(0, 3), [
      "vocal-tune",
      "vocal-formant",
      "vocal-eq",
    ]);
    assert.ok(ids.indexOf("vocal-deesser") < ids.indexOf("vocal-compressor"));
    assert.match(vocal.subtitle, /EQ → 디에서 → 압축/);
    assert.match(vocal.orderReason, /음원을 분석한 결과는 아니며/);
    for (const item of vocal.steps.filter((step) =>
      step.params.some((param) => param.name === "Cubase AUX Send"),
    )) {
      assert.equal(item.routing.kind, "aux");
    }
    for (const group of recipe.sections) {
      assert.ok(group.orderReason.length > 0);
      assert.ok(recipe.exportText.includes(`순서 이유: ${group.orderReason}`));
    }
    assert.equal(
      section(recipe, "mix").steps.find(
        (step) => step.plugin === "Waves CLA-76",
      ).routing.destination,
      "드럼 Group",
    );
  }
});

test("instrumental songs omit all vocal processing and voice repair", () => {
  const recipe = generateRecipe({
    gender: "instrumental",
    lyrics: "가사 텍스트가 있어도 보컬이 없는 곡",
  });
  assert.equal(section(recipe, "vocal").steps.length, 0);
  assert.ok(section(recipe, "master").steps.length > 0);
  assert.ok(
    section(recipe, "repair").steps.every(
      (step) => step.plugin !== "RX 11 Voice De-noise",
    ),
  );
  assert.ok(
    recipe.summary.warnings.some((warning) => warning.includes("반영하지")),
  );
  const withoutLyrics = generateRecipe({ gender: "instrumental" });
  assert.deepEqual(recipe.sections, withoutLyrics.sections);
  assert.deepEqual(recipe.lyricAnalysis.adjustments, []);
  assert.match(recipe.lyricAnalysis.summary, /통계만 표시/);
});

test("every plugin identifies its actual Cubase or offline processing location", () => {
  for (const song of exampleSongs) {
    const recipe = generateRecipe(song);
    for (const group of recipe.sections) {
      for (const item of group.steps) {
        assert.ok(
          ["insert", "aux", "bus", "offline"].includes(item.routing.kind),
          item.id,
        );
        assert.ok(item.routing.destination.length > 0, item.id);
        assert.ok(
          recipe.exportText.includes(
            `적용 위치: ${item.routing.destination} (${item.routing.kind})`,
          ),
        );
        if (item.params.some((param) => param.name === "Cubase AUX Send")) {
          assert.deepEqual(item.routing, {
            kind: "aux",
            destination: "별도 FX 채널 · 보컬 Send",
          });
          assert.equal(
            item.params.find((param) => param.name === "Mix").value,
            100,
          );
        } else if (item.plugin === "kHs Filter") {
          assert.equal(item.routing.kind, "insert");
          assert.ok(
            ["리버브 FX Return", "딜레이 FX Return"].includes(
              item.routing.destination,
            ),
          );
          assert.equal(item.bundle, "kilohearts");
        } else if (group.id === "vocal") {
          assert.deepEqual(item.routing, {
            kind: "insert",
            destination: "보컬 트랙 Insert",
          });
        } else if (group.id === "master") {
          assert.deepEqual(item.routing, {
            kind: "insert",
            destination: "Stereo Out",
          });
        } else if (group.id === "repair") {
          assert.deepEqual(item.routing, {
            kind: "offline",
            destination: "RX 오프라인 전처리",
          });
          assert.equal(item.bundle, "rx");
        } else if (item.plugin === "Waves CLA-76") {
          assert.deepEqual(item.routing, {
            kind: "bus",
            destination: "드럼 Group",
          });
        } else {
          assert.deepEqual(item.routing, {
            kind: "bus",
            destination: "믹스 Group",
          });
        }
      }
    }
  }
});

test("new vocal options normalize safely and default to no formant processing", () => {
  const defaults = normalizeInput({});
  assert.equal(defaults.formantEngine, "littlealterboy");
  assert.equal(defaults.formantMode, "off");
  assert.equal(defaults.useMicroShift, true);
  assert.equal(defaults.useKilohearts, true);
  assert.equal(Object.hasOwn(defaults, "pitchEngine"), false);
  const invalid = normalizeInput({
    formantEngine: "unknown",
    formantMode: "unknown",
    useMicroShift: "false",
    useKilohearts: 1,
  });
  assert.equal(invalid.formantEngine, "littlealterboy");
  assert.equal(invalid.formantMode, "off");
  assert.equal(invalid.useMicroShift, true);
  assert.equal(invalid.useKilohearts, true);
  for (const formantEngine of ["littlealterboy", "mautopitch"]) {
    const recipe = generateRecipe({ formantEngine, formantMode: "off" });
    assert.ok(
      section(recipe, "vocal").steps.every(
        (step) => step.id !== "vocal-formant",
      ),
    );
    assert.match(recipe.exportText, /폼란트 (LittleAlterBoy|MAutoPitch) OFF/);
  }
});

test("LittleAlterBoy changes only selected formant and remains after Auto-Tune", () => {
  for (const [formantMode, expectedShift] of [
    ["lower", -1],
    ["higher", 1],
  ]) {
    const recipe = generateRecipe({
      formantEngine: "littlealterboy",
      formantMode,
    });
    const vocal = section(recipe, "vocal").steps;
    assert.equal(vocal[0].plugin, "Auto-Tune Pro");
    assert.equal(vocal[1].plugin, "Soundtoys LittleAlterBoy");
    assert.equal(vocal[2].id, "vocal-eq");
    assert.equal(vocal.filter((step) => step.id === "vocal-tune").length, 1);
    assert.equal(vocal.filter((step) => step.id === "vocal-formant").length, 1);
    assert.ok(vocal.every((step) => step.plugin !== "MAutoPitch"));
    assert.equal(setting(recipe, "vocal-formant", "Pitch"), 0);
    assert.equal(setting(recipe, "vocal-formant", "Formant"), expectedShift);
    assert.equal(setting(recipe, "vocal-formant", "Mix"), 100);
    assert.equal(setting(recipe, "vocal-formant", "Mode"), "Transpose");
    assert.deepEqual(vocal[1].routing, {
      kind: "insert",
      destination: "보컬 트랙 Insert",
    });
  }
});

test("MAutoPitch is a formant-only insert and never replaces Auto-Tune", () => {
  for (const [formantMode, expectedShift] of [
    ["lower", -1],
    ["higher", 1],
  ]) {
    const recipe = generateRecipe({ formantEngine: "mautopitch", formantMode });
    const vocal = section(recipe, "vocal").steps;
    assert.equal(vocal[0].plugin, "Auto-Tune Pro");
    assert.equal(vocal[1].plugin, "MAutoPitch");
    assert.equal(vocal[2].id, "vocal-eq");
    assert.equal(
      vocal.filter((step) => step.plugin === "Auto-Tune Pro").length,
      1,
    );
    assert.ok(
      vocal.every((step) => step.plugin !== "Soundtoys LittleAlterBoy"),
    );
    assert.equal(setting(recipe, "vocal-formant", "Depth"), 0);
    assert.equal(setting(recipe, "vocal-formant", "Detune"), 0);
    assert.equal(
      setting(recipe, "vocal-formant", "Formant shift"),
      expectedShift,
    );
    assert.equal(setting(recipe, "vocal-formant", "Dry/Wet"), 100);
    assert.ok(
      vocal[1].params.every(
        (param) => !["Speed", "Key", "Scale"].includes(param.name),
      ),
    );
    assert.match(recipe.exportText, /MAutoPitch는 Auto-Tune 대체가 아니라/);
  }
});

test("MicroShift is a wet AUX and optional kHs filters process only FX returns", () => {
  const recipe = generateRecipe({ useMicroShift: true, useKilohearts: true });
  assert.equal(setting(recipe, "vocal-microshift", "Mix"), 100);
  assert.equal(setting(recipe, "vocal-microshift", "Detune"), 100);
  assert.equal(setting(recipe, "vocal-microshift", "Delay"), 100);
  assert.ok(
    ["I", "II", "III"].includes(setting(recipe, "vocal-microshift", "Style")),
  );
  assert.equal(setting(recipe, "vocal-reverb-filter", "Frequency"), 200);
  assert.equal(setting(recipe, "vocal-delay-filter", "Frequency"), 250);
  for (const item of section(recipe, "vocal").steps.filter(
    (step) => step.plugin === "kHs Filter",
  )) {
    assert.equal(item.routing.kind, "insert");
    assert.ok(item.routing.destination.endsWith("FX Return"));
    assert.equal(
      item.params.find((param) => param.name === "Filter Type").value,
      "High Pass",
    );
    assert.ok(item.params.every((param) => param.name !== "Q"));
  }
  assert.equal(setting(recipe, "vocal-reverb", "LowCut"), 20);
  assert.equal(setting(recipe, "vocal-delay", "LowCut"), 20);
  const disabled = generateRecipe({
    useMicroShift: false,
    useKilohearts: false,
  });
  assert.ok(
    section(disabled, "vocal").steps.every(
      (step) => !["Soundtoys MicroShift", "kHs Filter"].includes(step.plugin),
    ),
  );
  assert.equal(setting(disabled, "vocal-reverb", "LowCut"), 200);
  assert.equal(setting(disabled, "vocal-delay", "LowCut"), 250);
  assert.match(
    disabled.exportText,
    /MicroShift OFF · kHs FX Return Filter OFF/,
  );
  for (const id of ["kilohearts", "soundtoys", "melda"]) {
    assert.equal(
      pluginBundles.find((bundle) => bundle.id === id).version,
      "사용자 보유 · 버전 미지정",
    );
  }
});

test("long lyric lines lower MicroShift send without selecting a formant effect", () => {
  const baseline = generateRecipe({ useMicroShift: true, lyrics: "" });
  const dense = generateRecipe({
    useMicroShift: true,
    lyrics: "오늘밤끝없이이어지는이야기를우리함께노래하며걸어가요",
  });
  assert.equal(dense.lyricAnalysis.density, "dense");
  assert.equal(
    setting(dense, "vocal-microshift", "Cubase AUX Send"),
    setting(baseline, "vocal-microshift", "Cubase AUX Send") - 2,
  );
  assert.ok(
    dense.lyricAnalysis.adjustments.some((note) => note.includes("MicroShift")),
  );
  assert.ok(
    section(dense, "vocal").steps.every((step) => step.id !== "vocal-formant"),
  );
  const withoutMicroShift = generateRecipe({
    useMicroShift: false,
    lyrics: dense.input.lyrics,
  });
  assert.ok(
    withoutMicroShift.lyricAnalysis.adjustments.every(
      (note) => !note.includes("MicroShift"),
    ),
  );
});

test("instrumentals skip every added vocal plugin despite enabled options", () => {
  for (const formantEngine of ["littlealterboy", "mautopitch"]) {
    const recipe = generateRecipe({
      gender: "instrumental",
      formantEngine,
      formantMode: "higher",
      useMicroShift: true,
      useKilohearts: true,
    });
    assert.deepEqual(section(recipe, "vocal").steps, []);
    assert.ok(
      recipe.sections
        .flatMap((section) => section.steps)
        .every(
          (step) => !["soundtoys", "melda", "kilohearts"].includes(step.bundle),
        ),
    );
    assert.ok(
      recipe.summary.warnings.every((note) => !note.startsWith("폼란트 변경")),
    );
    assert.match(recipe.exportText, /악기곡: 보컬 옵션 적용 생략/);
  }
});

test("parameter proposals remain within known limits and stepped controls", () => {
  for (const song of exampleSongs) {
    for (const intensity of ["natural", "balanced", "hard"]) {
      const recipe = generateRecipe({ ...song, intensity });
      const steps = recipe.sections.flatMap((section) => section.steps);
      for (const item of steps)
        assert.ok(pluginBundles.some((bundle) => bundle.id === item.bundle));
      if (section(recipe, "vocal").steps.length) {
        for (const name of ["Humanize", "Flex-Tune", "Retune Speed"]) {
          const value = setting(recipe, "vocal-tune", name);
          assert.ok(value >= 0 && value <= 100, `${name}: ${value}`);
        }
        assert.equal(setting(recipe, "vocal-reverb", "Mix"), 100);
        assert.equal(setting(recipe, "vocal-delay", "Mix"), 100);
        assert.ok(setting(recipe, "vocal-delay", "Feedback") <= 40);
      }
      assert.ok(
        [0.1, 0.3, 1, 3, 10, 30].includes(
          setting(recipe, "mix-glue", "Attack"),
        ),
      );
      assert.ok([2, 4, 10].includes(setting(recipe, "mix-glue", "Ratio")));
      assert.ok(
        setting(recipe, "mix-drums", "Attack") >= 1 &&
          setting(recipe, "mix-drums", "Attack") <= 7,
      );
      assert.equal(setting(recipe, "master-maximizer", "Output Level"), -1);
      assert.equal(setting(recipe, "master-maximizer", "True Peak"), "On");
      assert.equal(setting(recipe, "master-maximizer", "Gain"), 0);
      assert.equal(setting(recipe, "master-imager", "Band 1 Width"), -100);
      assert.ok(setting(recipe, "master-imager", "Band 3 Width") <= 100);
    }
  }
});

test("lyrics analysis counts transparent units and lowers ambience for long lines", () => {
  const result = analyzeLyrics("하나 둘\nhello world\n하나 둘");
  assert.equal(result.lineCount, 3);
  assert.equal(result.hangulSyllables, 6);
  assert.equal(result.latinWordCount, 2);
  assert.equal(result.repeatRatio, 33.3);
  assert.equal(result.density, "sparse");
  assert.equal(analyzeLyrics("   ").density, "none");
  assert.equal(analyzeLyrics("1234 🎵").density, "unknown");
  const baseline = generateRecipe({ genre: "rnb", lyrics: "" });
  const dense = generateRecipe({
    genre: "rnb",
    lyrics:
      "오늘밤끝없이이어지는이야기를우리함께노래하며걸어가요\n내일도끝없이이어지는이야기를우리함께노래하며걸어가요",
  });
  assert.equal(dense.lyricAnalysis.density, "dense");
  assert.ok(
    setting(dense, "vocal-reverb", "Decay") <
      setting(baseline, "vocal-reverb", "Decay"),
  );
  assert.equal(
    setting(dense, "vocal-delay", "Cubase AUX Send"),
    setting(baseline, "vocal-delay", "Cubase AUX Send") - 3,
  );
  assert.equal(dense.input.mood, baseline.input.mood);
  assert.ok(dense.lyricAnalysis.adjustments.length > 0);
});

test("recipes are deterministic, preserve input and exports contain every setting", () => {
  const input = { ...exampleSongs[0] };
  const before = JSON.stringify(input);
  const first = generateRecipe(input);
  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(first, generateRecipe(input));
  assert.equal(first.exportText, formatRecipe(first));
  assert.ok(first.exportText.includes(`${first.targets.lufs} LUFS-I`));
  for (const section of first.sections) {
    assert.ok(first.exportText.includes(section.title));
    for (const step of section.steps) {
      assert.ok(first.exportText.includes(step.plugin));
      for (const param of step.params)
        assert.ok(first.exportText.includes(`${param.name}: ${param.value}`));
    }
  }
  assert.match(first.exportText, /음원은 분석하지 않았습니다/);
  assert.match(first.exportText, /버전별 UI를 검증하지 않았습니다/);
});
