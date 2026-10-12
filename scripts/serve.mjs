import http from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, relative, extname, sep } from "node:path";
const root = fileURLToPath(new URL("../", import.meta.url));
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    const pathname = decodeURIComponent(url.pathname === "/" ? "/demo/index.html" : url.pathname);
    const path = resolve(root, "." + pathname);
    const rel = relative(root, path);
    if (rel.startsWith(".." + sep) || rel === ".." || ![".html", ".js", ".css"].includes(extname(path))) {
      res.writeHead(403); res.end("Forbidden"); return;
    }
    const bytes = await readFile(path);
    res.writeHead(200, { "Content-Type": mime[extname(path)], "Cache-Control": "no-store" });
    res.end(bytes);
  } catch { res.writeHead(404); res.end("Not found"); }
});
server.listen(5173, "127.0.0.1", () => console.log("Media Lab: http://localhost:5173"));
