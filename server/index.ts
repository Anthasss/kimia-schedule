import { config } from "dotenv";
config();

import express from "express";
import path from "path";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import dataRouter from "./routes/dataRoutes.js";

export async function createApp() {
  const app = express();

  app.all("/api/auth/*", toNodeHandler(auth));
  app.use(express.json());
  app.use(dataRouter);

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const clientRoot = path.join(process.cwd(), "client");
    const vite = await createViteServer({
      root: clientRoot,
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "client/dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  return app;
}

if (!process.env.VERCEL) {
  const PORT = 3000;
  createApp().then((app) => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Admin server running on http://localhost:${PORT}`);
    });
  });
}
