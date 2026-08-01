import { config } from "dotenv";
config();

import { createApp } from "../server/index";

let app: any;

export default async function handler(req: any, res: any) {
  app ??= await createApp();
  app(req, res);
}
