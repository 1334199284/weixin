import express from "express";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import cors from "cors";
import wechatRoutes from "./server/wechat-routes";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

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
    // Prod static files - ensuring dist/ and dist/index.html exist
    const distPath = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(distPath)) {
        fs.mkdirSync(distPath);
    }
    const indexPath = path.join(distPath, 'index.html');
    if (!fs.existsSync(indexPath)) {
        fs.writeFileSync(indexPath, '<html><body>App Initializing...</body></html>');
    }
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        res.sendFile(indexPath);
    });
  }
  
  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
}
startServer();
