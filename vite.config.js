import { defineConfig } from "vite";
import { createApiMiddleware } from "./server/chat.js";

export default defineConfig({
  plugins: [
    {
      name: "mix-master-conversation",
      configureServer(server) {
        server.middlewares.use(createApiMiddleware());
      },
      configurePreviewServer(server) {
        server.middlewares.use(createApiMiddleware());
      },
    },
  ],
});
