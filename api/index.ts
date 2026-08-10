import { config } from "dotenv";
config();

import { createApp } from "../server/index.js";

let appPromise: Promise<Awaited<ReturnType<typeof createApp>>> | null = null;

export default async function handler(req: any, res: any) {
  appPromise ??= createApp();
  const app = await appPromise;
  app(req, res);
}
