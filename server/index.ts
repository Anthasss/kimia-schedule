import { config } from "dotenv";
config();

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dataRouter from "./routes/dataRoutes";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(dataRouter);

  if (process.env.NODE_ENV !== "production") {
    const clientRoot = path.join(__dirname, "../client");
    const vite = await createViteServer({
      root: clientRoot,
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "../client/dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`UniSched Admin server running on http://localhost:${PORT}`);
  });
}

startServer();
