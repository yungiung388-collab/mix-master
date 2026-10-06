import test from "node:test";
import assert from "node:assert/strict";
import {
  MAX_PHOTO_EDGE,
  explainCameraError,
  fitPhotoDimensions,
  photoDataBytes,
  stopCameraStream,
} from "../src/camera.js";

test("camera captures preserve portrait and landscape ratios without enlarging small frames", () => {
  assert.deepEqual(fitPhotoDimensions(4032, 3024), {
    width: MAX_PHOTO_EDGE,
    height: 1200,
  });
  assert.deepEqual(fitPhotoDimensions(1080, 1920), {
    width: 900,
    height: MAX_PHOTO_EDGE,
  });
  assert.deepEqual(fitPhotoDimensions(640, 480), { width: 640, height: 480 });
});

test("invalid camera dimensions cannot produce an attachment", () => {
  for (const [width, height] of [
    [0, 720],
    [1080, 0],
    [-1, 3],
    [NaN, 2],
    [1, Infinity],
  ]) {
    assert.throws(() => fitPhotoDimensions(width, height), /카메라 화면/);
  }
});

test("JPEG size guard counts decoded bytes including base64 padding", () => {
  assert.equal(photoDataBytes("data:image/jpeg;base64,AQ=="), 1);
  assert.equal(photoDataBytes("data:image/jpeg;base64,AQI="), 2);
  assert.equal(photoDataBytes("data:image/jpeg;base64,AQID"), 3);
  assert.throws(
    () => photoDataBytes("data:image/png;base64,AQ=="),
    /촬영 사진/,
  );
});

test("all camera tracks are stopped when the camera closes", () => {
  const stopped = [];
  stopCameraStream({
    getTracks: () =>
      [0, 1].map((index) => ({ stop: () => stopped.push(index) })),
  });
  assert.deepEqual(stopped, [0, 1]);
  assert.doesNotThrow(() => stopCameraStream(null));
});

test("camera permission and missing-device errors provide distinct recovery instructions", () => {
  assert.match(explainCameraError({ name: "NotAllowedError" }), /사이트 설정/);
  assert.match(explainCameraError({ name: "NotFoundError" }), /카메라를 찾지/);
  assert.match(explainCameraError({ name: "NotReadableError" }), /다른 앱/);
});
