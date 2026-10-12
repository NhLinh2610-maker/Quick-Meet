import { readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
const root = fileURLToPath(new URL("../", import.meta.url));
let count = 0;
async function check(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await check(path);
    else if (/\.(js|mjs)$/.test(path)) {
      execFileSync(process.execPath, ["--check", path], { stdio: "inherit" });
      count++;
    }
  }
}
for (const directory of ["src", "demo", "scripts"]) await check(join(root, directory));
const core = await import("../src/index.js");
for (const name of ["MediaManager", "ScreenShareManager", "PeerConnection", "MeshClient", "SocketIoSignaling", "setVideoBitrate"]) {
  if (typeof core[name] !== "function") throw new Error("Thiếu export: " + name);
}
console.log("Đã kiểm tra cú pháp " + count + " file và các export. Chưa kiểm tra thiết bị/cuộc gọi.");
