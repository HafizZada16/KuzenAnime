import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpg",
};

http
  .createServer((req, res) => {
    let filePath = req.url === "/" ? "/index.html" : req.url.split("?")[0];
    if (!path.extname(filePath)) filePath = "/index.html";

    let fullPath = path.join(__dirname, filePath);
    let extname = path.extname(fullPath);
    let contentType = MIME_TYPES[extname] || "application/octet-stream";

    fs.readFile(fullPath, (error, content) => {
      if (error) {
        res.writeHead(404);
        res.end("File Not Found");
      } else {
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content, "utf-8");
      }
    });
  })
  .listen(PORT, () => {
    console.log(`-------------------------------------------`);
    console.log(`🚀 KuzenAnime is live at http://localhost:${PORT}`);
    console.log(`-------------------------------------------`);
  });
