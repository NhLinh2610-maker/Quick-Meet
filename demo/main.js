import { MediaManager, ScreenShareManager } from "../src/index.js";
const media = new MediaManager();
const screen = new ScreenShareManager();
const ids = ["start", "mic", "camera", "share", "stopShare", "leave"];
const buttons = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));
const status = document.getElementById("status");
let busy = false;
function refresh() {
  buttons.start.disabled = busy || Boolean(media.stream);
  for (const id of ["mic", "camera", "leave"]) buttons[id].disabled = busy || !media.stream;
  buttons.share.disabled = busy || !media.stream || Boolean(screen.stream);
  buttons.stopShare.disabled = busy || !screen.stream;
  buttons.mic.textContent = media.micEnabled ? "Tắt micro" : "Bật micro";
  buttons.camera.textContent = media.cameraEnabled ? "Tắt camera" : "Bật camera";
}
function action(id, fn) {
  buttons[id].addEventListener("click", async () => {
    busy = true; refresh();
    try {
      await fn();
      status.textContent = "Hoàn tất: " + buttons[id].textContent;
    } catch (error) {
      status.textContent = error.name + ": " + error.message;
    } finally { busy = false; refresh(); }
  });
}
media.on("local-stream", stream => { document.getElementById("local").srcObject = stream; });
screen.on("screen-stream", stream => {
  document.getElementById("screen").srcObject = stream;
  if (!stream) status.textContent = "Đã dừng chia sẻ màn hình.";
  refresh();
});
action("start", () => media.start());
action("mic", () => media.setMicEnabled(!media.micEnabled));
action("camera", () => media.setCameraEnabled(!media.cameraEnabled));
action("share", () => screen.start());
action("stopShare", () => screen.stop());
action("leave", () => { screen.stop(); media.stop(); });
window.addEventListener("pagehide", () => { screen.stop(); media.stop(); });
refresh();
