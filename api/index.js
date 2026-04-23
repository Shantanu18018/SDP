import app from "../backend/src/server.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default (req, res) => {
  // Vercel strips the mounting path (/api) from req.url. Restore it so Express routes match correctly.
  if (!req.url.startsWith('/api')) {
    req.url = `/api${req.url === '/' ? '' : req.url}`;
  }
  return app(req, res);
};
