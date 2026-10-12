import { Emitter } from "../utils/Emitter.js";
import { displayConstraints } from "../config/media.config.js";

export class ScreenShareManager extends Emitter {
  stream = null;

  async start() {
    if (this.stream) return this.stream;
    if (!navigator.mediaDevices?.getDisplayMedia) {
      throw new Error("Trình duyệt chưa hỗ trợ chia sẻ màn hình trong ngữ cảnh này.");
    }
    // Gọi trực tiếp từ thao tác click; không xin quyền trong quá trình join tự động.
    const stream = await navigator.mediaDevices.getDisplayMedia(displayConstraints);
    this.stream = stream;
    stream.getVideoTracks()[0].addEventListener("ended", () => this.stop(), { once: true });
    this.emit("screen-stream", stream);
    return stream;
  }
  stop() {
    const stream = this.stream;
    if (!stream) return;
    this.stream = null;
    for (const track of stream.getTracks()) track.stop();
    this.emit("screen-stream", null);
  }
}
