import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Copy,
  Disc3,
  FolderOpen,
  Gauge,
  Headphones,
  Info,
  Layers3,
  ListMusic,
  Mic2,
  Music2,
  Plus,
  Radio,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Volume2,
  Waves,
  X,
} from "lucide-react";
import {
  generateRecipe,
  normalizeInput,
  genreProfiles,
  moodProfiles,
  pluginBundles,
  exampleSongs,
} from "./engine.js";
import ChatPanel from "./ChatPanel.jsx";

const DRAFT_KEY = "mix-master:draft:v1";
const SESSIONS_KEY = "mix-master:sessions:v1";
const DEFAULT_INPUT = {
  title: "Midnight in Seoul",
  key: "A",
  scale: "minor",
  bpm: 88,
  gender: "female",
  range: "high",
  genre: "rnb",
  mood: "warm",
  lyrics: "",
  intensity: "balanced",
  target: "streaming",
};
const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const genreIcons = {
  pop: Music2,
  hiphop: Radio,
  rnb: Waves,
  ballad: Mic2,
  edm: Disc3,
  rock: AudioLines,
};
const sectionIcons = {
  vocal: Mic2,
  mix: Layers3,
  master: Gauge,
  repair: ShieldCheck,
};
const sectionLabels = {
  vocal: "보컬 체인",
  mix: "믹스 버스",
  master: "마스터링",
  repair: "RX 정리",
};

function readStored(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      /* Try the local fallback. */
    }
  }
  const field = document.createElement("textarea");
  field.value = value;
  field.style.cssText = "position:fixed;left:-9999px;top:0";
  document.body.append(field);
  field.select();
  const success = document.execCommand("copy");
  field.remove();
  if (!success)
    throw new Error(
      "클립보드에 접근할 수 없습니다. 파일로 내보내기를 사용해 주세요.",
    );
}

function downloadRecipe(recipe, format) {
  const text =
    format === "json" ? JSON.stringify(recipe, null, 2) : recipe.exportText;
  const blob = new Blob([text], {
    type:
      format === "json"
        ? "application/json;charset=utf-8"
        : "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const name =
    recipe.input.title.replace(/[^\p{L}\p{N}\s_-]/gu, "").trim() ||
    "mix-master";
  link.href = url;
  link.download = `${name}-settings.${format === "json" ? "json" : "txt"}`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Waveform({ compact = false }) {
  const bars = Array.from(
    { length: compact ? 23 : 67 },
    (_, i) =>
      9 +
      Math.abs(Math.sin(i * 1.47) * Math.cos(i * 0.21)) * 59 +
      Math.abs(Math.sin(i * 0.73)) * 16,
  );
  return (
    <div className={`waveform ${compact ? "compact" : ""}`} aria-hidden="true">
      {bars.map((height, i) => (
        <span
          key={i}
          style={{
            height: `${height}%`,
            opacity: i < bars.length * 0.62 ? 1 : 0.28,
          }}
        />
      ))}
    </div>
  );
}

function Modal({ title, subtitle, children, onClose }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const previousFocus = document.activeElement;
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => {
      dialog.close();
      previousFocus?.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialogRef}
      className="modal"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-inner">
        <div className="modal-heading">
          <div>
            <span className="eyebrow">YOUR WORKSPACE</span>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <button className="icon-button" aria-label="닫기" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

function SignalFlow({ steps }) {
  const groups = new Map();
  steps.forEach((step, i) => {
    const destination = step.routing.destination;
    if (!groups.has(destination)) groups.set(destination, []);
    groups.get(destination).push({ step, index: i + 1 });
  });
  return (
    <div className="routing-flows">
      {[...groups].map(([destination, items]) => {
        const parallel = ["aux", "offline"].includes(
          items[0].step.routing.kind,
        );
        return (
          <div className="routing-flow" key={destination}>
            <span className="route-label">
              {destination}
              {parallel && <small>독립 처리</small>}
            </span>
            <div className="signal-flow">
              <span className="flow-source">
                <Volume2 size={13} />
                {parallel ? "SEND" : "IN"}
              </span>
              {items.map(({ step, index }) => (
                <React.Fragment key={step.id}>
                  {parallel ? <Plus size={10} /> : <ChevronRight size={11} />}
                  <span title={step.plugin}>
                    {String(index).padStart(2, "0")}
                    <small>
                      {step.plugin.replace(
                        /FabFilter |Waves |iZotope |Valhalla /g,
                        "",
                      )}
                    </small>
                  </span>
                </React.Fragment>
              ))}
              {!parallel && (
                <>
                  <ChevronRight size={11} />
                  <span className="flow-out">OUT</span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StepCard({ step, index, onCopy }) {
  const [open, setOpen] = useState(true);
  const [showTip, setShowTip] = useState(false);
  return (
    <article className="step-card">
      <div className="step-heading">
        <span className="step-number">
          {String(index + 1).padStart(2, "0")}
        </span>
        <button
          className="step-toggle"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          <div>
            <span className="plugin-name">{step.plugin}</span>
            <span className="step-purpose">{step.purpose}</span>
            <span className="routing-badge">{step.routing.destination}</span>
          </div>
          <ChevronDown size={17} className={open ? "chevron-open" : ""} />
        </button>
        <button
          className="icon-button step-copy"
          aria-label={`${step.plugin} 설정 복사`}
          title="이 플러그인 설정 복사"
          onClick={() =>
            onCopy(
              `${step.plugin}\n적용 위치: ${step.routing.destination}\n${step.purpose}\n${step.params.map((p) => `${p.name}: ${p.value}${p.unit ? ` ${p.unit}` : ""}${p.note ? ` — ${p.note}` : ""}`).join("\n")}\n${step.tip || ""}`,
            )
          }
        >
          <Copy size={15} />
        </button>
      </div>
      {open && (
        <div className="step-body">
          <div className="parameter-grid">
            {step.params.map((p, i) => (
              <div className="parameter" key={`${p.name}-${i}`}>
                <span className="parameter-name">{p.name}</span>
                <strong>
                  {p.value}
                  <small>{p.unit ? ` ${p.unit}` : ""}</small>
                </strong>
                {p.note && <span className="parameter-note">{p.note}</span>}
              </div>
            ))}
          </div>
          {step.tip && (
            <>
              <button
                className="tip-toggle"
                onClick={() => setShowTip(!showTip)}
                aria-expanded={showTip}
              >
                <Info size={13} />
                조정 가이드
                <ChevronRight
                  size={12}
                  className={showTip ? "turn-down" : ""}
                />
              </button>
              {showTip && <p className="step-tip">{step.tip}</p>}
            </>
          )}
        </div>
      )}
    </article>
  );
}

function Guide() {
  return (
    <section className="secondary-page">
      <div className="page-title">
        <span className="eyebrow">FROM IDEA TO SESSION</span>
        <h1>Cubase에서 시작하기</h1>
        <p>추천값을 출발점으로, 귀와 미터로 완성하세요.</p>
      </div>
      <div className="guide-grid">
        {[
          [
            "01",
            "트랙의 DNA 입력",
            "정확한 키와 스케일, BPM을 입력하세요. 보컬의 실제 음역과 장르·분위기를 고르면 해당 방향에 맞는 체인을 제안합니다. 가사는 한 줄당 음절·단어 수를 세어 공간계의 복잡도를 조정합니다.",
          ],
          [
            "02",
            "RX로 소스 먼저 정리",
            "노이즈·입소리 문제가 있는 경우 RX를 오프라인으로 먼저 적용하고 정리한 파일을 Cubase로 가져오세요. 깨끗한 소스에는 불필요한 복원을 적용하지 않아도 됩니다.",
          ],
          [
            "03",
            "보컬·믹스 버스 구성",
            "보컬 체인의 순서대로 Insert 슬롯을 구성하세요. 리버브와 딜레이는 FX 채널을 만들고 100% Wet으로 설정한 뒤, 트랙의 Send 양을 조절합니다. 버스 플러그인은 해당 Group 트랙에 넣습니다.",
          ],
          [
            "04",
            "레벨에 맞춰 임계값 조정",
            "컴프레서 Threshold와 De-esser 입력값은 소스 레벨에 따라 달라집니다. 추천 감쇄량을 보며 조절하고, 바이패스 전후의 체감 음량을 맞춰 비교하세요.",
          ],
          [
            "05",
            "마스터·출력 확인",
            "마스터 체인은 Stereo Out에 적용하세요. LUFS·True Peak를 계측하고, 작은 볼륨·모노·여러 재생 기기에서 확인합니다. 곡이 필요로 하는 다이내믹이 목표 숫자보다 우선입니다.",
          ],
          [
            "06",
            "세션 보관·공유",
            "전체 세팅을 복사하거나 텍스트·JSON으로 내려받을 수 있습니다. 저장된 세션은 현재 브라우저에 보관됩니다. 내보낸 파일은 Cubase 프리셋 파일이 아니라 수동 적용용 가이드입니다.",
          ],
        ].map(([num, title, text]) => (
          <article className="guide-card" key={num}>
            <span className="guide-number">{num}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <div className="notice">
        <Info size={19} />
        <p>
          이 프로그램은 오디오를 분석하거나 DAW·플러그인을 제어하지 않습니다.
          번들 표기는 요청하신 버전 기준이며, 세부 컨트롤은 설치한 플러그인
          버전에 맞춰 확인하세요.
        </p>
      </div>
    </section>
  );
}

function Library() {
  const icons = [
    Mic2,
    SlidersHorizontal,
    AudioLines,
    Waves,
    Gauge,
    ShieldCheck,
  ];
  return (
    <section className="secondary-page">
      <div className="page-title">
        <span className="eyebrow">THE TOOLS BEHIND YOUR SOUND</span>
        <h1>플러그인 라이브러리</h1>
        <p>익숙한 도구를, 곡에 어울리는 순서로.</p>
      </div>
      <div className="library-grid">
        {pluginBundles.map((bundle, i) => {
          const Icon = icons[i % icons.length];
          return (
            <article className="library-card" key={bundle.id}>
              <div className="library-card-top">
                <span className={`library-icon color-${i}`}>
                  <Icon size={25} />
                </span>
                <span className="small-pill">지원 체인</span>
              </div>
              <h2>{bundle.name}</h2>
              <span className="library-version">{bundle.version}</span>
              <p>{bundle.description}</p>
              <div className="library-card-foot">
                <Check size={14} />
                세팅 가이드 포함
              </div>
            </article>
          );
        })}
      </div>
      <div className="notice">
        <Info size={19} />
        <p>
          플러그인을 설치하거나 라이선스를 제공하지 않습니다. 표기된 번들과
          버전은 사용자가 지정한 대상이며, 실제 설치 상태·버전 호환성은
          Cubase에서 확인해야 합니다.
        </p>
      </div>
    </section>
  );
}

export default function App() {
  const [input, setInput] = useState(() =>
    normalizeInput(readStored(DRAFT_KEY, DEFAULT_INPUT)),
  );
  const [recipe, setRecipe] = useState(() =>
    generateRecipe(normalizeInput(readStored(DRAFT_KEY, DEFAULT_INPUT))),
  );
  const [sectionId, setSectionId] = useState("vocal");
  const [page, setPage] = useState("workspace");
  const [sessions, setSessions] = useState(() => {
    const list = readStored(SESSIONS_KEY, []);
    return Array.isArray(list)
      ? list
          .filter(
            (item) =>
              item &&
              typeof item.id === "string" &&
              item.input &&
              typeof item.input === "object",
          )
          .slice(0, 20)
          .map((item) => ({
            ...item,
            input: normalizeInput(item.input),
            title: normalizeInput(item.input).title,
            createdAt: Number.isNaN(Date.parse(item.createdAt))
              ? new Date().toISOString()
              : item.createdAt,
          }))
      : [];
  });
  const [showSessions, setShowSessions] = useState(false);
  const [toast, setToast] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lyricsOpen, setLyricsOpen] = useState(Boolean(input.lyrics));
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const resultRef = useRef(null);
  const exportRef = useRef(null);
  const toastTimer = useRef(null);
  const generationTimer = useRef(null);
  const currentSection =
    recipe.sections.find((s) => s.id === sectionId) || recipe.sections[0];
  const dirty = useMemo(
    () =>
      JSON.stringify(normalizeInput(input)) !== JSON.stringify(recipe.input),
    [input, recipe.input],
  );
  const inputGenre = genreProfiles[input.genre]?.label || input.genre;
  const outputGenre =
    genreProfiles[recipe.input.genre]?.label || recipe.input.genre;
  const sectionCount = recipe.sections.reduce(
    (total, s) => total + s.steps.length,
    0,
  );

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(input));
    } catch {
      /* Editing still works when persistence is unavailable. */
    }
  }, [input]);
  useEffect(
    () => () => {
      clearTimeout(toastTimer.current);
      clearTimeout(generationTimer.current);
    },
    [],
  );
  useEffect(() => {
    const closeMenu = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target))
        setExportOpen(false);
    };
    const closeEscape = (e) => {
      if (e.key === "Escape") setExportOpen(false);
    };
    document.addEventListener("pointerdown", closeMenu);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("pointerdown", closeMenu);
      document.removeEventListener("keydown", closeEscape);
    };
  }, []);

  const notify = (message, error = false) => {
    clearTimeout(toastTimer.current);
    setToast({ message, error });
    toastTimer.current = setTimeout(() => setToast(null), 4200);
  };
  const update = (name, value) =>
    setInput((prev) => ({ ...prev, [name]: value }));
  const handleCopy = async (text) => {
    try {
      await copyText(text);
      notify("세팅을 클립보드에 복사했어요.");
    } catch (error) {
      notify(error.message, true);
    }
  };
  const generate = (e) => {
    e?.preventDefault();
    if (busy) return;
    setBusy(true);
    generationTimer.current = setTimeout(() => {
      try {
        const next = generateRecipe(input);
        setRecipe(next);
        setInput(next.input);
        setSectionId(next.input.gender === "instrumental" ? "mix" : "vocal");
        setAnalysisOpen(false);
        notify("곡에 맞는 새로운 체인을 준비했어요.");
        if (window.innerWidth < 850)
          resultRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      } catch {
        notify("세팅을 생성하지 못했어요. 입력값을 확인해 주세요.", true);
      }
      setBusy(false);
    }, 350);
  };
  const saveSession = () => {
    if (dirty) {
      notify("변경한 입력으로 세팅을 먼저 생성해 주세요.", true);
      return;
    }
    const entry = {
      id: globalThis.crypto?.randomUUID?.() || `${Date.now()}`,
      title: recipe.input.title,
      createdAt: new Date().toISOString(),
      input: recipe.input,
    };
    const next = [entry, ...sessions].slice(0, 20);
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
      setSessions(next);
      notify("이 브라우저에 세션을 저장했어요.");
    } catch {
      notify(
        "브라우저 저장 공간에 접근할 수 없어요. 파일로 내보내 주세요.",
        true,
      );
    }
  };
  const loadSession = (entry) => {
    const normalized = normalizeInput(entry.input);
    setInput(normalized);
    setRecipe(generateRecipe(normalized));
    setLyricsOpen(Boolean(normalized.lyrics));
    setSectionId(normalized.gender === "instrumental" ? "mix" : "vocal");
    setShowSessions(false);
    setPage("workspace");
    notify("저장한 세션을 불러왔어요.");
  };
  const deleteSession = (id) => {
    const next = sessions.filter((s) => s.id !== id);
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
      setSessions(next);
      notify("세션을 삭제했어요.");
    } catch {
      notify("세션을 삭제하지 못했어요.", true);
    }
  };
  const useExample = () => {
    const example =
      exampleSongs.find((song) => song.genre !== input.genre) ||
      exampleSongs[0];
    if (!example) return;
    const next = normalizeInput(example);
    setInput(next);
    setLyricsOpen(Boolean(next.lyrics));
    notify("예시 곡을 불러왔어요. 세팅 생성으로 적용하세요.");
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <button
            className="brand"
            onClick={() => setPage("workspace")}
            aria-label="MIX MASTER 워크스페이스"
          >
            <span className="brand-mark">
              <AudioLines size={23} strokeWidth={2.3} />
            </span>
            <span>
              MIX<span className="brand-slash">/</span>MASTER
              <small>YOUR SOUND, REFINED.</small>
            </span>
          </button>
          <nav className="main-nav" aria-label="메인 메뉴">
            {[
              ["workspace", "워크스페이스"],
              ["chat", "믹스 대화"],
              ["library", "플러그인"],
              ["guide", "사용 가이드"],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setPage(id)}
                className={page === id ? "active" : ""}
                aria-current={page === id ? "page" : undefined}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="header-actions">
            <button
              className="icon-button saved-button"
              title="저장된 세션"
              aria-label={`저장된 세션 ${sessions.length}개`}
              onClick={() => setShowSessions(true)}
            >
              <FolderOpen size={20} />
              {sessions.length > 0 && (
                <span className="saved-count">{sessions.length}</span>
              )}
            </button>
            <button className="save-button" onClick={saveSession}>
              <Save size={15} />
              <span>세션 저장</span>
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {page === "workspace" ? (
          <>
            <section className="hero">
              <div className="hero-copy">
                <div className="hero-kicker">
                  <span className="status-dot" /> CUBASE 15 PRO{" "}
                  <span className="kicker-divider">/</span> MIXING COMPANION
                </div>
                <h1>
                  당신의 곡에,
                  <br />
                  <span>어울리는 사운드.</span>
                </h1>
                <p>
                  곡의 DNA를 알려주세요.
                  <br className="mobile-break" /> 믹스부터 마스터까지, 첫 세팅을
                  함께 잡아드릴게요.
                </p>
              </div>
              <div className="hero-session">
                <div className="hero-session-top">
                  <span>
                    <span className="status-dot" /> SESSION OVERVIEW
                  </span>
                  <Headphones size={17} />
                </div>
                <Waveform />
                <div className="hero-session-bottom">
                  <div>
                    <strong>{input.bpm || "—"}</strong>
                    <span>BPM</span>
                  </div>
                  <div>
                    <strong>
                      {input.key}
                      <small>{input.scale === "minor" ? "m" : ""}</small>
                    </strong>
                    <span>{input.scale === "minor" ? "MINOR" : "MAJOR"}</span>
                  </div>
                  <span className="hero-genre">
                    {inputGenre}
                    <ArrowUpRight size={15} />
                  </span>
                </div>
              </div>
            </section>

            <div className="workspace-grid">
              <aside className="input-column">
                <form className="input-panel" onSubmit={generate}>
                  <div className="panel-heading">
                    <div>
                      <span className="eyebrow">01 / TRACK DNA</span>
                      <h2>어떤 곡인가요?</h2>
                    </div>
                    <SlidersHorizontal size={20} />
                  </div>
                  <div className="input-body">
                    <div className="field">
                      <label htmlFor="song-title">
                        곡 제목<span>선택</span>
                      </label>
                      <input
                        id="song-title"
                        maxLength={80}
                        value={input.title}
                        onChange={(e) => update("title", e.target.value)}
                        placeholder="새로운 곡의 이름"
                      />
                    </div>
                    <fieldset className="field genre-field">
                      <legend>장르</legend>
                      <div className="genre-grid">
                        {Object.entries(genreProfiles).map(([id, genre]) => {
                          const Icon = genreIcons[id] || Music2;
                          return (
                            <button
                              type="button"
                              key={id}
                              aria-pressed={input.genre === id}
                              className={`genre-button ${input.genre === id ? "selected" : ""}`}
                              onClick={() => update("genre", id)}
                            >
                              <Icon size={16} />
                              <span>{genre.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>
                    <div className="field-row">
                      <div className="field">
                        <label htmlFor="song-key">키 / Key</label>
                        <div className="select-wrap">
                          <select
                            id="song-key"
                            value={input.key}
                            onChange={(e) => update("key", e.target.value)}
                          >
                            {keys.map((k) => (
                              <option key={k}>{k}</option>
                            ))}
                          </select>
                          <ChevronDown size={13} />
                        </div>
                      </div>
                      <div className="field">
                        <label htmlFor="song-scale">스케일</label>
                        <div className="select-wrap">
                          <select
                            id="song-scale"
                            value={input.scale}
                            onChange={(e) => update("scale", e.target.value)}
                          >
                            <option value="minor">Minor / 단조</option>
                            <option value="major">Major / 장조</option>
                          </select>
                          <ChevronDown size={13} />
                        </div>
                      </div>
                    </div>
                    <div className="field bpm-field">
                      <label htmlFor="song-bpm">
                        템포 / BPM
                        <span className="bpm-badge">{input.bpm || "—"}</span>
                      </label>
                      <div className="bpm-input-row">
                        <input
                          id="song-bpm-slider"
                          aria-label="BPM 슬라이더"
                          type="range"
                          min="40"
                          max="240"
                          value={input.bpm || 40}
                          onChange={(e) =>
                            update("bpm", Number(e.target.value))
                          }
                          style={{
                            "--range-progress": `${((Number(input.bpm) || 40) - 40) / 2}%`,
                          }}
                        />
                        <input
                          id="song-bpm"
                          aria-label="템포 BPM"
                          type="number"
                          min="40"
                          max="240"
                          step="0.1"
                          required
                          value={input.bpm}
                          onChange={(e) =>
                            update(
                              "bpm",
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                            )
                          }
                        />
                      </div>
                      <div className="range-labels">
                        <span>40 · SLOW</span>
                        <span>240 · FAST</span>
                      </div>
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label htmlFor="song-gender">보컬 구성</label>
                        <div className="select-wrap">
                          <select
                            id="song-gender"
                            value={input.gender}
                            onChange={(e) => update("gender", e.target.value)}
                          >
                            <option value="female">여성 보컬</option>
                            <option value="male">남성 보컬</option>
                            <option value="mixed">혼성 보컬</option>
                            <option value="instrumental">
                              악기곡 / 보컬 없음
                            </option>
                          </select>
                          <ChevronDown size={13} />
                        </div>
                      </div>
                      <div className="field">
                        <label htmlFor="song-range">실제 음역</label>
                        <div className="select-wrap">
                          <select
                            id="song-range"
                            disabled={input.gender === "instrumental"}
                            value={input.range}
                            onChange={(e) => update("range", e.target.value)}
                          >
                            <option value="low">낮은 음역</option>
                            <option value="mid">중간 음역</option>
                            <option value="high">높은 음역</option>
                          </select>
                          <ChevronDown size={13} />
                        </div>
                      </div>
                    </div>
                    <fieldset className="field mood-field">
                      <legend>곡의 분위기</legend>
                      <div className="mood-grid">
                        {Object.entries(moodProfiles).map(([id, mood]) => (
                          <button
                            type="button"
                            key={id}
                            onClick={() => update("mood", id)}
                            aria-pressed={input.mood === id}
                            className={`mood-chip ${input.mood === id ? "selected" : ""}`}
                          >
                            <span className={`mood-dot mood-${id}`} />
                            {mood.label}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                    <div className="lyrics-field">
                      <button
                        type="button"
                        className="lyrics-toggle"
                        aria-expanded={lyricsOpen}
                        onClick={() => setLyricsOpen(!lyricsOpen)}
                      >
                        <span>
                          <ListMusic size={15} />
                          가사 추가<span className="optional">선택</span>
                        </span>
                        {lyricsOpen ? (
                          <ChevronDown size={15} />
                        ) : (
                          <Plus size={15} />
                        )}
                      </button>
                      {lyricsOpen && (
                        <div className="lyrics-body">
                          <label className="sr-only" htmlFor="song-lyrics">
                            가사
                          </label>
                          <textarea
                            id="song-lyrics"
                            rows="5"
                            maxLength={4000}
                            value={input.lyrics}
                            onChange={(e) => update("lyrics", e.target.value)}
                            placeholder="한 줄에 한 구절씩 입력해 주세요.\n가사 밀도에 맞춰 딜레이와 잔향을 조정합니다."
                          />
                          <span className="field-hint lyrics-hint">
                            <span>가사는 외부 서버로 전송되지 않습니다.</span>
                            <span>
                              {input.lyrics.length.toLocaleString()} / 4,000
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="advanced-settings">
                      <div className="field">
                        <label htmlFor="song-intensity">튜닝 스타일</label>
                        <div className="select-wrap">
                          <select
                            id="song-intensity"
                            value={input.intensity}
                            onChange={(e) =>
                              update("intensity", e.target.value)
                            }
                          >
                            <option value="natural">자연스럽게</option>
                            <option value="balanced">균형 있게</option>
                            <option value="hard">선명한 튠 효과</option>
                          </select>
                          <ChevronDown size={13} />
                        </div>
                      </div>
                      <div className="field">
                        <label htmlFor="song-target">마스터 목표</label>
                        <div className="select-wrap">
                          <select
                            id="song-target"
                            value={input.target}
                            onChange={(e) => update("target", e.target.value)}
                          >
                            <option value="streaming">스트리밍</option>
                            <option value="club">클럽 / 강한 음압</option>
                            <option value="dynamic">다이내믹 보존</option>
                          </select>
                          <ChevronDown size={13} />
                        </div>
                      </div>
                    </div>
                    <details className="extra-tools" open>
                      <summary>
                        <span>
                          <Layers3 size={15} />
                          추가 플러그인
                        </span>
                        <ChevronDown size={14} />
                      </summary>
                      <div className="extra-tools-body">
                        <label className="tool-option" htmlFor="use-microshift">
                          <span>
                            <strong>Soundtoys MicroShift</strong>
                            <small>별도 FX Send로 보컬 폭 확장</small>
                          </span>
                          <input
                            id="use-microshift"
                            type="checkbox"
                            checked={input.useMicroShift}
                            disabled={input.gender === "instrumental"}
                            onChange={(e) =>
                              update("useMicroShift", e.target.checked)
                            }
                          />
                        </label>
                        <label className="tool-option" htmlFor="use-kilohearts">
                          <span>
                            <strong>kHs Filter</strong>
                            <small>리버브·딜레이 FX의 저역 정리</small>
                          </span>
                          <input
                            id="use-kilohearts"
                            type="checkbox"
                            checked={input.useKilohearts}
                            disabled={input.gender === "instrumental"}
                            onChange={(e) =>
                              update("useKilohearts", e.target.checked)
                            }
                          />
                        </label>
                        <div className="formant-settings">
                          <div className="field">
                            <label htmlFor="formant-engine">
                              포먼트 플러그인
                            </label>
                            <div className="select-wrap">
                              <select
                                id="formant-engine"
                                value={input.formantEngine}
                                disabled={input.gender === "instrumental"}
                                onChange={(e) =>
                                  update("formantEngine", e.target.value)
                                }
                              >
                                <option value="littlealterboy">
                                  Little AlterBoy
                                </option>
                                <option value="mautopitch">MAutoPitch</option>
                              </select>
                              <ChevronDown size={13} />
                            </div>
                          </div>
                          <div className="field">
                            <label htmlFor="formant-mode">음색 변화</label>
                            <div className="select-wrap">
                              <select
                                id="formant-mode"
                                value={input.formantMode}
                                disabled={input.gender === "instrumental"}
                                onChange={(e) =>
                                  update("formantMode", e.target.value)
                                }
                              >
                                <option value="off">사용 안 함</option>
                                <option value="lower">살짝 낮게 · −1</option>
                                <option value="higher">살짝 높게 · +1</option>
                              </select>
                              <ChevronDown size={13} />
                            </div>
                          </div>
                        </div>
                        <p className="formant-hint">
                          피치 보정은 Auto-Tune으로 유지합니다. MAutoPitch는
                          피치 보정을 끄고 포먼트에만 사용합니다.
                        </p>
                      </div>
                    </details>
                  </div>
                  <div className="input-panel-footer">
                    <button
                      className="generate-button"
                      type="submit"
                      disabled={busy}
                    >
                      {busy ? (
                        <Activity size={18} className="busy-icon" />
                      ) : (
                        <Sparkles size={18} />
                      )}
                      {busy ? "사운드 설계 중…" : "믹스 · 마스터 세팅 생성"}
                      {!busy && <ArrowRight size={18} />}
                    </button>
                    <button
                      type="button"
                      className="example-button"
                      onClick={useExample}
                    >
                      <Music2 size={13} />
                      예시 곡으로 둘러보기
                    </button>
                  </div>
                </form>
                <div className="privacy-note">
                  <ShieldCheck size={15} />
                  <span>
                    내 브라우저에서 만드는 세팅.
                    <br />
                    계정도, 오디오 업로드도 필요 없어요.
                  </span>
                </div>
              </aside>

              <section
                className="results-column"
                ref={resultRef}
                aria-label="추천 세팅"
              >
                <div className="results-title-row">
                  <div>
                    <span className="eyebrow">02 / YOUR SOUND BLUEPRINT</span>
                    <h2>
                      사운드 레시피{" "}
                      <span className={`result-status ${dirty ? "dirty" : ""}`}>
                        <span />
                        {dirty ? "입력 변경됨" : "READY"}
                      </span>
                    </h2>
                  </div>
                  <div className="result-actions">
                    <button
                      className="icon-button"
                      aria-label="전체 세팅 복사"
                      title="전체 세팅 복사"
                      onClick={() => handleCopy(recipe.exportText)}
                    >
                      <Copy size={17} />
                    </button>
                    <div className="export-control" ref={exportRef}>
                      <button
                        className="export-button"
                        onClick={() => setExportOpen(!exportOpen)}
                        aria-expanded={exportOpen}
                      >
                        <ArrowDownToLine size={15} />
                        <span>내보내기</span>
                        <ChevronDown size={12} />
                      </button>
                      {exportOpen && (
                        <div className="export-menu">
                          <button
                            onClick={() => {
                              downloadRecipe(recipe, "txt");
                              setExportOpen(false);
                              notify("텍스트 세팅 파일을 내려받았어요.");
                            }}
                          >
                            텍스트 파일 (.txt)
                          </button>
                          <button
                            onClick={() => {
                              downloadRecipe(recipe, "json");
                              setExportOpen(false);
                              notify("JSON 세팅 파일을 내려받았어요.");
                            }}
                          >
                            JSON 파일 (.json)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {dirty && (
                  <div className="dirty-notice">
                    <Info size={14} />
                    아래는 이전 입력의 결과예요. 세팅 생성으로 변경사항을
                    적용하세요.
                  </div>
                )}
                <article className="recipe-overview">
                  <div className="recipe-topline">
                    <span className="recipe-tag">
                      <span />
                      {outputGenre} SESSION
                    </span>
                    <span className="recipe-version">RECIPE / 001</span>
                  </div>
                  <div className="recipe-overview-main">
                    <div>
                      <h3>{recipe.input.title}</h3>
                      <p>{recipe.summary.description}</p>
                    </div>
                    <span className="recipe-art">
                      <Disc3 size={42} strokeWidth={1.15} />
                      <span />
                    </span>
                  </div>
                  <div className="recipe-tags">
                    {recipe.summary.tags.map((tag, i) => (
                      <span key={i}>{tag}</span>
                    ))}
                  </div>
                  <div className="recipe-metrics">
                    <div>
                      <span>TARGET LOUDNESS</span>
                      <strong>
                        {recipe.targets.lufs}
                        <small> LUFS</small>
                      </strong>
                    </div>
                    <div>
                      <span>TRUE PEAK</span>
                      <strong>
                        {recipe.targets.truePeak}
                        <small> dBTP</small>
                      </strong>
                    </div>
                    <div>
                      <span>CHAIN MODULES</span>
                      <strong>
                        {String(sectionCount).padStart(2, "0")}
                        <small> PLUGINS</small>
                      </strong>
                    </div>
                  </div>
                </article>
                <div
                  className="section-tabs"
                  role="tablist"
                  aria-label="세팅 체인"
                >
                  {recipe.sections.map((section) => {
                    const Icon = sectionIcons[section.id] || SlidersHorizontal;
                    return (
                      <button
                        role="tab"
                        aria-selected={currentSection.id === section.id}
                        aria-controls={`section-${section.id}`}
                        id={`tab-${section.id}`}
                        tabIndex={currentSection.id === section.id ? 0 : -1}
                        onClick={() => setSectionId(section.id)}
                        onKeyDown={(e) => {
                          if (
                            ["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                              e.key,
                            )
                          ) {
                            e.preventDefault();
                            const current = recipe.sections.findIndex(
                              (s) => s.id === currentSection.id,
                            );
                            const next =
                              e.key === "Home"
                                ? 0
                                : e.key === "End"
                                  ? recipe.sections.length - 1
                                  : (current +
                                      (e.key === "ArrowRight" ? 1 : -1) +
                                      recipe.sections.length) %
                                    recipe.sections.length;
                            setSectionId(recipe.sections[next].id);
                            document
                              .getElementById(`tab-${recipe.sections[next].id}`)
                              ?.focus();
                          }
                        }}
                        className={
                          currentSection.id === section.id ? "active" : ""
                        }
                        key={section.id}
                      >
                        <Icon size={16} />
                        <span>
                          {sectionLabels[section.id] || section.title}
                        </span>
                        <small>{section.steps.length}</small>
                      </button>
                    );
                  })}
                </div>
                <div
                  className="chain-section"
                  id={`section-${currentSection.id}`}
                  role="tabpanel"
                  aria-labelledby={`tab-${currentSection.id}`}
                >
                  <div className="chain-description">
                    <div>
                      <span className="chain-caption">SIGNAL FLOW</span>
                      <p>{currentSection.subtitle}</p>
                    </div>
                    <span className="chain-count">
                      {currentSection.steps.length} modules
                    </span>
                  </div>
                  {currentSection.orderReason && (
                    <details className="chain-order-note">
                      <summary>
                        이 순서를 추천한 이유 <ChevronDown size={12} />
                      </summary>
                      <p>{currentSection.orderReason}</p>
                    </details>
                  )}
                  {currentSection.steps.length > 0 ? (
                    <>
                      <SignalFlow steps={currentSection.steps} />
                      <div className="step-list">
                        {currentSection.steps.map((step, i) => (
                          <StepCard
                            key={`${recipe.input.title}-${currentSection.id}-${step.id}`}
                            step={step}
                            index={i}
                            onCopy={handleCopy}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="empty-chain">
                      <Music2 size={30} />
                      <h3>악기곡은 보컬 체인 없이</h3>
                      <p>
                        믹스 버스와 마스터링 탭에서 곡의 사운드를 완성하세요.
                      </p>
                      <button onClick={() => setSectionId("mix")}>
                        믹스 버스로 이동
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="timing-panel">
                  <div className="timing-heading">
                    <Clock3 size={16} />
                    <div>
                      <strong>템포에 맞는 공간감</strong>
                      <span>{recipe.input.bpm} BPM · 딜레이 타이밍</span>
                    </div>
                  </div>
                  <div className="timing-values">
                    {[
                      ["1/4", recipe.timing.quarter],
                      ["1/8", recipe.timing.eighth],
                      ["1/8 D", recipe.timing.dottedEighth],
                      ["1/16", recipe.timing.sixteenth],
                    ].map(([note, value]) => (
                      <div key={note}>
                        <span>{note}</span>
                        <strong>
                          {value}
                          <small> ms</small>
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
                {recipe.lyricAnalysis.hasLyrics && (
                  <div className="analysis-panel">
                    <button
                      onClick={() => setAnalysisOpen(!analysisOpen)}
                      aria-expanded={analysisOpen}
                    >
                      <span>
                        <ListMusic size={16} />
                        가사 길이에 따른 조정
                        <span className="small-pill">
                          {recipe.lyricAnalysis.label}
                        </span>
                      </span>
                      <ChevronDown
                        size={16}
                        className={analysisOpen ? "chevron-open" : ""}
                      />
                    </button>
                    {analysisOpen && (
                      <div>
                        <p>{recipe.lyricAnalysis.summary}</p>
                        <ul>
                          {recipe.lyricAnalysis.adjustments.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                        <small>{recipe.lyricAnalysis.method}</small>
                      </div>
                    )}
                  </div>
                )}
                <div className="listening-note">
                  <Headphones size={19} />
                  <div>
                    <strong>이제, 귀로 한 번 더.</strong>
                    <p>
                      이 값들은 음원을 측정하지 않은 시작점이에요. 컴프레서
                      감쇄량과 치찰음, 저역을 듣고 조절하세요. {recipe.notes[0]}
                    </p>
                    <details>
                      <summary>
                        적용 전 확인사항 <ChevronDown size={12} />
                      </summary>
                      <ul>
                        {[
                          ...recipe.summary.warnings,
                          ...recipe.notes.slice(1),
                        ].map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </details>
                  </div>
                </div>
              </section>
            </div>
          </>
        ) : page === "library" ? (
          <Library />
        ) : page === "guide" ? (
          <Guide />
        ) : null}
        <section
          className="chat-workspace"
          hidden={page !== "chat"}
          aria-label="믹스 대화 워크스페이스"
        >
          <div className="page-title chat-page-title">
            <span className="eyebrow">LET'S TALK ABOUT YOUR SOUND</span>
            <h1>믹스 얘기, 사진과 함께.</h1>
            <p>
              듣고 있는 문제를 말해 주세요. 플러그인 화면은 직접 촬영해 대화에
              첨부할 수 있어요.
            </p>
          </div>
          <div className="conversation-layout">
            <ChatPanel recipe={recipe} active={page === "chat"} />
            <aside className="conversation-context">
              <span className="eyebrow">CURRENT RECIPE</span>
              <div className="context-song">
                <Disc3 size={26} />
                <h3>{recipe.input.title}</h3>
              </div>
              <div className="recipe-tags">
                {recipe.summary.tags.slice(0, 4).map((tag, i) => (
                  <span key={i}>{tag}</span>
                ))}
              </div>
              <p className="context-description">
                현재 생성한 사운드 레시피를 바탕으로 대화합니다.
              </p>
              <button
                className="context-workspace-button"
                onClick={() => setPage("workspace")}
              >
                세팅 화면으로 이동
                <ArrowUpRight size={14} />
              </button>
              <div className="conversation-camera-note">
                <Mic2 size={19} />
                <strong>사진에서 보이는 것부터.</strong>
                <p>
                  플러그인 이름과 노브 값이 선명하게 보이도록 촬영하세요.
                  사진만으로 실제 소리나 음량을 측정할 수는 없습니다.
                </p>
              </div>
              <div className="conversation-camera-note">
                <ShieldCheck size={18} />
                <strong>갤러리 저장 없이 바로 첨부.</strong>
                <p>
                  사진은 이 대화의 메모리에만 보관합니다. 새로고침하면 사라지며,
                  AI가 연결되면 보내기를 눌렀을 때 분석 서비스로 전달합니다.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <footer className="app-footer">
        <span className="footer-brand">
          <AudioLines size={16} />
          MIX / MASTER
        </span>
        <span>Made for your next great mix.</span>
        <span className="footer-end">
          CUBASE 15 PRO <span>·</span> LOCAL WORKSPACE
        </span>
      </footer>
      {showSessions && (
        <Modal
          title="저장된 세션"
          subtitle="이 브라우저에 저장한 사운드 레시피입니다. 최대 20개까지 보관합니다."
          onClose={() => setShowSessions(false)}
        >
          {sessions.length ? (
            <div className="session-list">
              {sessions.map((entry) => (
                <div className="saved-session" key={entry.id}>
                  <button onClick={() => loadSession(entry)}>
                    <span className="saved-session-icon">
                      <Music2 size={19} />
                    </span>
                    <span>
                      <strong>{entry.title || "이름 없는 곡"}</strong>
                      <small>
                        {genreProfiles[entry.input.genre]?.label ||
                          entry.input.genre}{" "}
                        · {entry.input.bpm} BPM · {entry.input.key}{" "}
                        {entry.input.scale}
                        <br />
                        {new Date(entry.createdAt).toLocaleDateString("ko-KR")}
                      </small>
                    </span>
                    <ArrowUpRight size={17} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label={`${entry.title || "이름 없는 곡"} 세션 삭제`}
                    onClick={() => deleteSession(entry.id)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-sessions">
              <FolderOpen size={35} />
              <h3>아직 저장된 세션이 없어요.</h3>
              <p>세팅을 생성한 뒤 ‘세션 저장’을 눌러 보관하세요.</p>
              <button
                className="save-button"
                onClick={() => setShowSessions(false)}
              >
                워크스페이스로 돌아가기
                <ArrowRight size={15} />
              </button>
            </div>
          )}
        </Modal>
      )}
      {toast && (
        <div
          className={`toast ${toast.error ? "error" : ""}`}
          role={toast.error ? "alert" : "status"}
        >
          {toast.error ? <Info size={17} /> : <Check size={17} />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} aria-label="알림 닫기">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
