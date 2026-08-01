import { config } from "dotenv";
config();

import express from "express";
import path from "path";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import dataRouter from "./routes/dataRoutes";

export function createApp() {
  const app = express();

  app.all("/api/auth/*", toNodeHandler(auth));
  app.use(express.json());
  app.use(dataRouter);

  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), "client/dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  return app;
}
