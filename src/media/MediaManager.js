import { Emitter } from "../utils/Emitter.js";
import { mediaConstraints } from "../config/media.config.js";

export class MediaManager extends Emitter {
  stream = null;
  micEnabled = true;
  cameraEnabled = true;

  async start(constraints = mediaConstraints) {
    if (this.stream) return this.stream;
    if (!globalThis.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      throw new Error("Mở bằng http://localhost hoặc HTTPS để truy cập camera/micro.");
    }
    // Chỉ gọi start một lần tại một thời điểm; demo khóa nút trong lúc chờ.
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    for (const track of stream.getAudioTracks()) track.enabled = this.micEnabled;
    for (const track of stream.getVideoTracks()) track.enabled = this.cameraEnabled;
    this.stream = stream;
    this.emit("local-stream", stream);
    return stream;
  }
  setMicEnabled(enabled) {
    this.micEnabled = Boolean(enabled);
    for (const track of this.stream?.getAudioTracks() ?? []) track.enabled = this.micEnabled;
    this.emit("media-state", this.getState());
  }
  setCameraEnabled(enabled) {
    this.cameraEnabled = Boolean(enabled);
    for (const track of this.stream?.getVideoTracks() ?? []) track.enabled = this.cameraEnabled;
    this.emit("media-state", this.getState());
  }
  getState() { return { micEnabled: this.micEnabled, cameraEnabled: this.cameraEnabled }; }
  stop() {
    for (const track of this.stream?.getTracks() ?? []) track.stop();
    this.stream = null;
    this.emit("local-stream", null);
  }
}
