// A local preview that applies the real `_headers` CSP, because the one thing
// worth checking here is whether the policy lets Paddle.js run — and a
// header-free preview answers the wrong question. Node only; no dependencies.
import http from "node:http";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = "out";
const headers = Object.fromEntries(
  readFileSync(join(ROOT, "_headers"), "utf8")
    .split("\n")
    .filter((l) => /^\s{2}\S/.test(l) && !l.trim().startsWith("#"))
    .map((l) => {
      const t = l.trim();
      const i = t.indexOf(":");
      return [t.slice(0, i), t.slice(i + 1).trim()];
    }),
);

http
  .createServer((req, res) => {
    const path = req.url.split("?")[0];
    const file = join(ROOT, path === "/" ? "index.html" : path);
    try {
      const body = readFileSync(file);
      for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
      res.setHeader(
        "Content-Type",
        file.endsWith(".html") ? "text/html; charset=utf-8" : "text/plain",
      );
      res.end(body);
    } catch {
      res.statusCode = 404;
      res.end("not found");
    }
  })
  .listen(3002, () =>
    console.log("pay → http://localhost:3002 (with the real CSP applied)"),
  );
