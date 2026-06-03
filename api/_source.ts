import { createApp } from "../server/app";

const initPromise = createApp();

export default async function handler(req: any, res: any) {
  const { app } = await initPromise;
  app(req, res);
}
