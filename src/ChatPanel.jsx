import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  Check,
  LoaderCircle,
  MessageSquare,
  RotateCcw,
  Send,
  Sparkles,
  SwitchCamera,
  Trash2,
  X,
} from "lucide-react";
import {
  MAX_PHOTO_BYTES,
  MAX_PHOTOS_PER_MESSAGE,
  explainCameraError,
  fitPhotoDimensions,
  photoDataBytes,
  stopCameraStream,
} from "./camera.js";
import "./chat.css";

const WELCOME = {
  id: "welcome",
  role: "assistant",
  content:
    "현재 곡의 설정을 바탕으로 믹스를 함께 점검해 드릴게요. 보컬이 묻히거나 치찰음이 강한 것처럼, 듣고 있는 문제를 편하게 적어 주세요. 플러그인 화면은 아래 카메라로 바로 촬영해 첨부할 수 있어요.",
};
const SUGGESTIONS = ["보컬이 묻혀요", "치찰음이 강해요", "마스터가 답답해요"];
let messageCounter = 0;

function createId() {
  return `message-${Date.now()}-${++messageCounter}`;
}

function DialogShell({ children, labelId, className, onClose }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const previousFocus = document.activeElement;
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => {
      dialog.close();
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialogRef}
      className={className}
      aria-labelledby={labelId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {children}
    </dialog>
  );
}

function CameraDialog({ onClose, onUse }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const cameraRequestRef = useRef(0);
  const mountedRef = useRef(true);
  const [facing, setFacing] = useState("environment");
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState(null);

  const stopCamera = useCallback(() => {
    cameraRequestRef.current += 1;
    stopCameraStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startCamera = useCallback(
    async (nextFacing) => {
      stopCamera();
      const requestId = cameraRequestRef.current;
      setError("");
      setLoading(true);
      setReady(false);
      if (!window.isSecureContext) {
        setError(
          "모바일 카메라는 HTTPS 주소에서 사용할 수 있습니다. 이 앱을 HTTPS 주소로 열어 주세요. 개발용 localhost에서도 촬영할 수 있습니다.",
        );
        setLoading(false);
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(
          "이 브라우저는 직접 촬영을 지원하지 않습니다. 최신 Safari 또는 Chrome에서 HTTPS 주소로 열어 주세요.",
        );
        setLoading(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: nextFacing },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
        if (!mountedRef.current || requestId !== cameraRequestRef.current) {
          stopCameraStream(stream);
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) {
          stopCamera();
          return;
        }
        stream.getVideoTracks().forEach((track) => {
          track.addEventListener(
            "ended",
            () => {
              if (!mountedRef.current || requestId !== cameraRequestRef.current)
                return;
              stopCamera();
              setLoading(false);
              setReady(false);
              setError(
                "카메라 연결이 종료되었습니다. 다시 켜서 촬영을 이어갈 수 있어요.",
              );
            },
            { once: true },
          );
        });
        video.srcObject = stream;
        await video.play();
        if (!mountedRef.current || requestId !== cameraRequestRef.current)
          return;
        setLoading(false);
        setReady(video.videoWidth > 0 && video.videoHeight > 0);
      } catch (cameraError) {
        if (!mountedRef.current || requestId !== cameraRequestRef.current)
          return;
        stopCamera();
        setError(explainCameraError(cameraError));
        setLoading(false);
        setReady(false);
      }
    },
    [stopCamera],
  );

  useEffect(() => {
    mountedRef.current = true;
    startCamera(facing);
    const suspendCamera = () => {
      if (document.visibilityState !== "hidden") return;
      stopCamera();
      setReady(false);
      setLoading(false);
      setError(
        "화면을 떠나 카메라를 껐습니다. 다시 켜서 촬영을 이어갈 수 있어요.",
      );
    };
    const leavePage = () => stopCamera();
    document.addEventListener("visibilitychange", suspendCamera);
    window.addEventListener("pagehide", leavePage);
    return () => {
      mountedRef.current = false;
      stopCamera();
      document.removeEventListener("visibilitychange", suspendCamera);
      window.removeEventListener("pagehide", leavePage);
    };
  }, [facing, startCamera, stopCamera]);

  function close() {
    stopCamera();
    setPhoto(null);
    onClose();
  }

  function capture() {
    try {
      const video = videoRef.current;
      const dimensions = fitPhotoDimensions(
        video?.videoWidth,
        video?.videoHeight,
      );
      const canvas = document.createElement("canvas");
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      const context = canvas.getContext("2d");
      if (!context)
        throw new Error(
          "촬영 화면을 만들 수 없습니다. 브라우저를 다시 열어 주세요.",
        );
      context.drawImage(video, 0, 0, dimensions.width, dimensions.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
      canvas.width = 0;
      canvas.height = 0;
      if (photoDataBytes(dataUrl) > MAX_PHOTO_BYTES) {
        throw new Error(
          "사진이 5 MB를 넘습니다. 촬영 대상을 조정한 뒤 다시 촬영해 주세요.",
        );
      }
      stopCamera();
      setReady(false);
      setPhoto({ dataUrl, mimeType: "image/jpeg", ...dimensions });
    } catch (captureError) {
      setError(
        captureError.message ||
          "사진을 촬영하지 못했습니다. 다시 시도해 주세요.",
      );
    }
  }

  function retake() {
    setPhoto(null);
    startCamera(facing);
  }

  return (
    <DialogShell
      className="chat-camera-modal"
      labelId="chat-camera-title"
      onClose={close}
    >
      <div className="chat-camera-heading">
        <div>
          <span className="chat-eyebrow">LIVE CAMERA</span>
          <h2 id="chat-camera-title">
            {photo ? "촬영한 사진 확인" : "지금 촬영해서 첨부"}
          </h2>
        </div>
        <button
          type="button"
          className="chat-icon-button"
          aria-label="카메라 닫기"
          onClick={close}
        >
          <X size={20} />
        </button>
      </div>
      <div className="chat-camera-stage">
        <video
          ref={videoRef}
          className={`chat-camera-video${photo || error ? " chat-camera-video-hidden" : ""}`}
          autoPlay
          playsInline
          muted
          aria-label="실시간 카메라 화면"
          onLoadedMetadata={() => {
            if (streamRef.current && videoRef.current?.videoWidth > 0) {
              setReady(true);
              setLoading(false);
            }
          }}
        />
        {photo && (
          <img
            className="chat-captured-photo"
            src={photo.dataUrl}
            alt="방금 촬영한 사진 미리보기"
          />
        )}
        {!photo && loading && (
          <div className="chat-camera-overlay" role="status">
            <LoaderCircle className="chat-spin" size={28} />
            <p>카메라를 켜고 있어요…</p>
          </div>
        )}
        {!photo && error && (
          <div className="chat-camera-overlay chat-camera-error" role="alert">
            <Camera size={30} />
            <p>{error}</p>
            <button
              type="button"
              className="chat-secondary-button"
              onClick={() => startCamera(facing)}
            >
              <RotateCcw size={15} /> 카메라 다시 켜기
            </button>
          </div>
        )}
      </div>
      {photo && error && (
        <p className="chat-camera-inline-error" role="alert">
          {error}
        </p>
      )}
      <p className="chat-camera-privacy">
        사진은 기기의 갤러리에 저장하지 않고 대화에 바로 첨부합니다.
      </p>
      <div className="chat-camera-actions">
        {photo ? (
          <>
            <button
              type="button"
              className="chat-secondary-button"
              onClick={retake}
            >
              <RotateCcw size={17} /> 다시 촬영
            </button>
            <button
              type="button"
              className="chat-primary-button"
              onClick={() => {
                stopCamera();
                onUse(photo);
                setPhoto(null);
              }}
            >
              <Check size={17} /> 이 사진 첨부
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="chat-secondary-button"
              onClick={() => {
                stopCamera();
                setReady(false);
                setLoading(true);
                setFacing((current) =>
                  current === "environment" ? "user" : "environment",
                );
              }}
              disabled={loading}
            >
              <SwitchCamera size={18} /> 카메라 전환
            </button>
            <button
              type="button"
              className="chat-primary-button"
              onClick={capture}
              disabled={!ready || loading}
            >
              <Camera size={18} /> 촬영
            </button>
          </>
        )}
      </div>
    </DialogShell>
  );
}

function PhotoViewer({ photo, onClose }) {
  return (
    <DialogShell
      className="chat-photo-modal"
      labelId="chat-photo-title"
      onClose={onClose}
    >
      <div className="chat-camera-heading">
        <h2 id="chat-photo-title">대화에 첨부한 사진</h2>
        <button
          type="button"
          className="chat-icon-button"
          aria-label="사진 닫기"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      <img
        className="chat-viewer-image"
        src={photo.dataUrl}
        alt="대화에 첨부한 촬영 사진 확대"
      />
    </DialogShell>
  );
}

function ChatMessage({ message, onViewPhoto }) {
  const user = message.role === "user";
  return (
    <article
      className={`chat-message${user ? " chat-message-user" : ""}`}
      aria-label={user ? "내 메시지" : "스튜디오 답변"}
    >
      {!user && (
        <span className="chat-avatar" aria-hidden="true">
          <Sparkles size={15} />
        </span>
      )}
      <div className="chat-message-body">
        <span className="chat-message-author">
          {user ? "나" : "MIX / MASTER"}
        </span>
        {message.images?.length > 0 && (
          <div className="chat-message-images">
            {message.images.map((photo, index) => (
              <button
                type="button"
                key={`${message.id}-${index}`}
                className="chat-image-button"
                aria-label={`첨부 사진 ${index + 1} 크게 보기`}
                onClick={() => onViewPhoto(photo)}
              >
                <img
                  src={photo.dataUrl}
                  alt={`직접 촬영한 첨부 사진 ${index + 1}`}
                />
              </button>
            ))}
          </div>
        )}
        {message.content && (
          <p className="chat-message-text">{message.content}</p>
        )}
        {message.mode && (
          <span className="chat-message-mode">
            {message.mode === "ai"
              ? "AI와 함께 점검한 가이드"
              : "현재 설정 기반 기본 가이드"}
          </span>
        )}
      </div>
    </article>
  );
}

export default function ChatPanel({ recipe, active = true }) {
  const [messages, setMessages] = useState([WELCOME]);
  const [draft, setDraft] = useState("");
  const [photos, setPhotos] = useState([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState(null);
  const [status, setStatus] = useState(null);
  const [statusError, setStatusError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingMessage, setPendingMessage] = useState(null);
  const [error, setError] = useState("");
  const textareaRef = useRef(null);
  const endRef = useRef(null);
  const requestRef = useRef(null);
  const statusRequestRef = useRef(null);
  const mountedRef = useRef(true);
  const compositionRef = useRef(false);

  const checkStatus = useCallback(async () => {
    statusRequestRef.current?.abort();
    const controller = new AbortController();
    statusRequestRef.current = controller;
    setStatusError(false);
    try {
      const response = await fetch("/api/status", {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("status unavailable");
      const result = await response.json();
      if (typeof result.aiConfigured !== "boolean")
        throw new Error("invalid status");
      if (mountedRef.current) setStatus(result);
    } catch (statusFailure) {
      if (mountedRef.current && statusFailure.name !== "AbortError") {
        setStatus(null);
        setStatusError(true);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    checkStatus();
    return () => {
      mountedRef.current = false;
      requestRef.current?.abort();
      statusRequestRef.current?.abort();
    };
  }, [checkStatus]);

  useEffect(() => {
    if (!active) {
      setCameraOpen(false);
      setViewingPhoto(null);
    }
  }, [active]);

  useEffect(() => {
    if (active)
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, pendingMessage, loading, active]);

  async function sendMessage(event) {
    event?.preventDefault();
    if (requestRef.current || (!draft.trim() && photos.length === 0)) return;
    const userMessage = {
      id: createId(),
      role: "user",
      content: draft.trim() || "촬영한 화면을 함께 확인해 주세요.",
      ...(photos.length ? { images: [...photos] } : {}),
    };
    const controller = new AbortController();
    requestRef.current = controller;
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 90000);
    setLoading(true);
    setError("");
    setPendingMessage(userMessage);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: (() => {
            let imageBudget = 6;
            return [...messages, userMessage]
              .slice(-10)
              .reverse()
              .map(({ role, content, images }) => {
                const recentImages = images?.slice(-imageBudget) || [];
                const includedImages = imageBudget > 0 ? recentImages : [];
                imageBudget -= includedImages.length;
                return {
                  role,
                  content: content.slice(0, 4000),
                  ...(includedImages.length ? { images: includedImages } : {}),
                };
              })
              .reverse();
          })(),
          recipe,
        }),
      });
      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error(
          "대화 서버에서 응답을 받지 못했습니다. 연결을 확인한 뒤 다시 보내 주세요.",
        );
      }
      if (!response.ok) {
        if (response.status === 413) {
          throw new Error(
            "대화에 첨부한 사진 용량이 큽니다. 사진을 줄이거나 대화를 비운 뒤 다시 보내 주세요.",
          );
        }
        throw new Error(
          typeof result.error === "string" && result.error.length < 600
            ? result.error
            : "메시지를 보내지 못했습니다. 잠시 후 다시 보내 주세요.",
        );
      }
      if (typeof result.reply !== "string" || !result.reply.trim()) {
        throw new Error("답변이 비어 있습니다. 다시 보내 주세요.");
      }
      if (!mountedRef.current) return;
      const mode = result.mode === "ai" ? "ai" : "local";
      setMessages((current) => [
        ...current,
        userMessage,
        { id: createId(), role: "assistant", content: result.reply, mode },
      ]);
      setDraft("");
      setPhotos([]);
      setStatus((current) => ({
        ...(current || {}),
        aiConfigured: mode === "ai",
      }));
      setStatusError(false);
    } catch (sendError) {
      if (!mountedRef.current) return;
      setError(
        timedOut
          ? "답변이 늦어지고 있습니다. 작성한 메시지와 사진은 그대로 있으니 다시 보내 주세요."
          : sendError.name === "TypeError"
            ? "대화 서버에 연결하지 못했습니다. 네트워크와 서버 실행 상태를 확인한 뒤 다시 보내 주세요."
            : sendError.message ||
              "메시지를 보내지 못했습니다. 다시 보내 주세요.",
      );
    } finally {
      clearTimeout(timeout);
      if (requestRef.current === controller) requestRef.current = null;
      if (mountedRef.current) {
        setLoading(false);
        setPendingMessage(null);
      }
    }
  }

  function resetConversation() {
    if (loading) return;
    setMessages([WELCOME]);
    setDraft("");
    setPhotos([]);
    setViewingPhoto(null);
    setError("");
  }

  return (
    <section className="chat-panel" aria-labelledby="chat-panel-title">
      <div className="chat-panel-heading">
        <div className="chat-panel-title-group">
          <span className="chat-heading-icon">
            <MessageSquare size={21} />
          </span>
          <div>
            <h2 id="chat-panel-title">스튜디오 대화</h2>
            <p>촬영한 화면과 함께 믹스를 이어가세요.</p>
          </div>
        </div>
        <button
          type="button"
          className="chat-icon-button"
          aria-label="대화 비우기"
          title="대화 비우기"
          disabled={loading}
          onClick={resetConversation}
        >
          <Trash2 size={17} />
        </button>
      </div>
      <div className="chat-connection-status">
        <span
          className={`chat-status-dot${status?.aiConfigured ? " chat-status-ai" : ""}`}
        />
        <span>
          {status?.aiConfigured
            ? "AI 분석 요청 모드"
            : status
              ? "현재 설정 기반 기본 가이드"
              : statusError
                ? "대화 연결 확인 필요"
                : "대화 연결 확인 중…"}
        </span>
        {(statusError || status?.aiConfigured === false) && (
          <button type="button" onClick={checkStatus}>
            연결 다시 확인
          </button>
        )}
      </div>
      {status && !status.aiConfigured && (
        <p className="chat-local-notice">
          AI가 연결되지 않아 사진은 아직 분석할 수 없습니다. 기본 가이드는 현재
          세팅과 적어 주신 증상을 참고해요.
        </p>
      )}
      <div
        className="chat-thread"
        role="log"
        aria-label="믹스 마스터 대화"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onViewPhoto={setViewingPhoto}
          />
        ))}
        {pendingMessage && (
          <ChatMessage message={pendingMessage} onViewPhoto={setViewingPhoto} />
        )}
        {loading && (
          <div className="chat-thinking" role="status">
            <Sparkles size={16} /> <span>현재 설정을 함께 살펴보고 있어요</span>
            <LoaderCircle className="chat-spin" size={14} />
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="chat-suggestions" aria-label="대화 시작 예시">
        {SUGGESTIONS.map((suggestion) => (
          <button
            type="button"
            key={suggestion}
            disabled={loading}
            onClick={() => {
              setDraft(suggestion);
              setError("");
              textareaRef.current?.focus();
            }}
          >
            {suggestion}
          </button>
        ))}
      </div>
      <form className="chat-composer" onSubmit={sendMessage}>
        {photos.length > 0 && (
          <div className="chat-attachments" aria-label="보낼 촬영 사진">
            {photos.map((photo, index) => (
              <div className="chat-attachment" key={index}>
                <button
                  type="button"
                  className="chat-image-button"
                  aria-label={`보낼 사진 ${index + 1} 크게 보기`}
                  onClick={() => setViewingPhoto(photo)}
                >
                  <img
                    src={photo.dataUrl}
                    alt={`보낼 촬영 사진 ${index + 1}`}
                  />
                </button>
                <button
                  type="button"
                  className="chat-remove-photo"
                  aria-label={`첨부 사진 ${index + 1} 삭제`}
                  disabled={loading}
                  onClick={() =>
                    setPhotos((current) =>
                      current.filter((_, photoIndex) => photoIndex !== index),
                    )
                  }
                >
                  <X size={13} />
                </button>
              </div>
            ))}
            <span className="chat-attachment-count">
              {photos.length} / {MAX_PHOTOS_PER_MESSAGE}장
            </span>
          </div>
        )}
        <label className="sr-only" htmlFor="studio-chat-input">
          믹스 마스터 질문
        </label>
        <textarea
          ref={textareaRef}
          id="studio-chat-input"
          value={draft}
          rows={2}
          maxLength={4000}
          enterKeyHint="send"
          placeholder="어떤 부분을 더 다듬고 싶으세요?"
          disabled={loading}
          onChange={(event) => setDraft(event.target.value)}
          onCompositionStart={() => {
            compositionRef.current = true;
          }}
          onCompositionEnd={() => {
            compositionRef.current = false;
          }}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !compositionRef.current &&
              !event.nativeEvent.isComposing &&
              event.nativeEvent.keyCode !== 229
            ) {
              event.preventDefault();
              event.currentTarget.form.requestSubmit();
            }
          }}
        />
        <div className="chat-composer-bottom">
          <button
            type="button"
            className="chat-camera-button"
            onClick={() => setCameraOpen(true)}
            disabled={loading || photos.length >= MAX_PHOTOS_PER_MESSAGE}
            title={
              photos.length >= MAX_PHOTOS_PER_MESSAGE
                ? "한 메시지에 사진은 3장까지 첨부할 수 있습니다"
                : "카메라로 직접 촬영"
            }
          >
            <Camera size={19} /> <span>직접 촬영</span>
          </button>
          <span className="chat-enter-hint">
            Enter 전송 · Shift+Enter 줄바꿈
          </span>
          <button
            type="submit"
            className="chat-send-button"
            aria-label="메시지 보내기"
            disabled={loading || (!draft.trim() && photos.length === 0)}
          >
            {loading ? (
              <LoaderCircle className="chat-spin" size={18} />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </form>
      {error && (
        <div className="chat-send-error" role="alert">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={loading}
          >
            <RotateCcw size={14} /> 다시 보내기
          </button>
        </div>
      )}
      <p className="chat-privacy-note">
        촬영 사진은 기기의 갤러리에 저장하지 않습니다.
        {status?.aiConfigured &&
          " 사진과 메시지, 현재 믹스 설정은 보내기를 누르면 AI 서비스로 전달됩니다."}
      </p>
      {cameraOpen && active && (
        <CameraDialog
          onClose={() => setCameraOpen(false)}
          onUse={(photo) => {
            setPhotos((current) =>
              current.length < MAX_PHOTOS_PER_MESSAGE
                ? [...current, photo]
                : current,
            );
            setCameraOpen(false);
            setError("");
          }}
        />
      )}
      {viewingPhoto && active && (
        <PhotoViewer
          photo={viewingPhoto}
          onClose={() => setViewingPhoto(null)}
        />
      )}
    </section>
  );
}
