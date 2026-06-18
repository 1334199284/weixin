import express from "express";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import wechatRoutes from "./server/wechat-routes";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 1234;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // Use cors middleware
  app.use(cors());
  
  app.use("/api", wechatRoutes);

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Prod static files - assuming dist/ exists
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
      });
  }
  
  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
}
startServer();
