export const MAX_PHOTOS_PER_MESSAGE = 3;
export const MAX_PHOTO_EDGE = 1600;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export function fitPhotoDimensions(width, height, maxEdge = MAX_PHOTO_EDGE) {
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    !Number.isFinite(maxEdge) ||
    width <= 0 ||
    height <= 0 ||
    maxEdge <= 0
  ) {
    throw new Error(
      "카메라 화면을 아직 읽을 수 없습니다. 잠시 후 다시 촬영해 주세요.",
    );
  }
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export function photoDataBytes(dataUrl) {
  if (
    typeof dataUrl !== "string" ||
    !/^data:image\/jpeg;base64,/.test(dataUrl)
  ) {
    throw new Error("촬영 사진을 만들지 못했습니다. 다시 촬영해 주세요.");
  }
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
}

export function stopCameraStream(stream) {
  stream?.getTracks().forEach((track) => track.stop());
}

export function explainCameraError(error) {
  switch (error?.name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return "카메라 사용 권한이 필요합니다. 브라우저의 사이트 설정에서 카메라를 허용한 뒤 다시 켜 주세요.";
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "사용할 카메라를 찾지 못했습니다. 카메라가 있는 기기에서 열거나 연결 상태를 확인해 주세요.";
    case "NotReadableError":
    case "TrackStartError":
      return "카메라를 켜지 못했습니다. 카메라를 사용하는 다른 앱을 닫은 뒤 다시 시도해 주세요.";
    case "OverconstrainedError":
      return "이 카메라는 요청한 촬영 모드를 지원하지 않습니다. 다른 카메라로 전환하거나 다시 시도해 주세요.";
    case "SecurityError":
      return "브라우저가 카메라 접근을 차단했습니다. HTTPS 주소로 열고 사이트의 카메라 권한을 확인해 주세요.";
    default:
      return "카메라 연결이 중단되었습니다. 연결과 권한을 확인한 뒤 다시 켜 주세요.";
  }
}
