import { createApp } from "../server/app";

const appPromise = createApp();

export default async function handler(req: any, res: any) {
  const { app } = await appPromise;
  app(req, res);
}
