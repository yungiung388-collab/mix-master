import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { realpath, stat } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createApiMiddleware } from "./chat.js";

const DEFAULT_DIST = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../dist",
);
const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json",
};

function plainResponse(res, status, text) {
  res.statusCode = status;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(text);
}

export function createAppServer({ distDir = DEFAULT_DIST, apiOptions } = {}) {
  const api = createApiMiddleware(apiOptions);
  const publicRoot = resolve(distDir);
  async function serveStatic(req, res) {
    if (!["GET", "HEAD"].includes(req.method))
      return plainResponse(res, 405, "GET 또는 HEAD 요청만 지원합니다.");
    let pathname;
    try {
      pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
    } catch {
      return plainResponse(res, 400, "잘못된 경로입니다.");
    }
    if (pathname.includes("\0") || pathname.includes("\\"))
      return plainResponse(res, 400, "잘못된 경로입니다.");
    if (pathname.split("/").some((segment) => segment.startsWith(".")))
      return plainResponse(res, 403, "접근할 수 없는 경로입니다.");
    if (pathname.startsWith("/api/"))
      return plainResponse(res, 404, "API 경로를 찾을 수 없습니다.");
    const candidate = resolve(publicRoot, `.${pathname}`);
    if (
      candidate !== publicRoot &&
      !candidate.startsWith(`${publicRoot}${sep}`)
    )
      return plainResponse(res, 403, "접근할 수 없는 경로입니다.");
    let root;
    try {
      root = await realpath(publicRoot);
    } catch {
      return plainResponse(
        res,
        503,
        "빌드 결과가 없습니다. npm run build를 먼저 실행해 주세요.",
      );
    }
    async function resolvePublicFile(path) {
      const actual = await realpath(path);
      if (actual !== root && !actual.startsWith(`${root}${sep}`)) return null;
      const info = await stat(actual);
      if (info.isDirectory())
        return resolvePublicFile(resolve(actual, "index.html"));
      return info.isFile() ? { path: actual, size: info.size } : null;
    }
    let file;
    try {
      file = await resolvePublicFile(candidate);
    } catch {
      /* Missing static files may be application routes. */
    }
    if (
      !file &&
      String(req.headers.accept || "").includes("text/html") &&
      !extname(pathname)
    ) {
      try {
        file = await resolvePublicFile(resolve(root, "index.html"));
      } catch {
        /* Fall through to 404. */
      }
    }
    if (!file) return plainResponse(res, 404, "파일을 찾을 수 없습니다.");
    res.statusCode = 200;
    res.setHeader(
      "Content-Type",
      CONTENT_TYPES[extname(file.path).toLowerCase()] ||
        "application/octet-stream",
    );
    res.setHeader("Content-Length", file.size);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader(
      "Cache-Control",
      extname(file.path) === ".html" ? "no-cache" : "public, max-age=3600",
    );
    if (req.method === "HEAD") return res.end();
    const stream = createReadStream(file.path);
    stream.on("error", () => {
      if (!res.headersSent) plainResponse(res, 500, "파일을 읽지 못했습니다.");
      else res.destroy();
    });
    res.once("close", () => stream.destroy());
    stream.pipe(res);
  }
  return createServer((req, res) => {
    api(req, res, () => {
      serveStatic(req, res).catch(() => {
        if (!res.headersSent)
          plainResponse(res, 500, "요청을 처리하지 못했습니다.");
        else res.destroy();
      });
    });
  });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const port = Number(process.env.PORT) || 4173;
  const host = process.env.HOST || "0.0.0.0";
  const server = createAppServer();
  server.listen(port, host, () =>
    console.log(`Mix & Master: http://${host}:${port}`),
  );
  let closing = false;
  const shutDown = () => {
    if (closing) return;
    closing = true;
    server.close(() => process.exit(0));
    const timeout = setTimeout(() => {
      server.closeAllConnections();
      process.exit(0);
    }, 10000);
    timeout.unref();
  };
  process.once("SIGINT", shutDown);
  process.once("SIGTERM", shutDown);
}
