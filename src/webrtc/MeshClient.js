import { Emitter } from "../utils/Emitter.js";

// API facade dự kiến để thành viên 3 gọi.
// Chưa đăng ký listener signaling: hoàn thiện sau khi chốt docs/SIGNALING.md.
export class MeshClient extends Emitter {
  constructor({ signaling, media, screen, rtcConfiguration }) {
    super();
    Object.assign(this, { signaling, media, screen, rtcConfiguration });
    this.peers = new Map(); // peerId -> PeerConnection
    this.roomId = null;
    this.selfId = null;
  }
  async join({ roomId, displayName }) {
    void roomId; void displayName;
    // TODO M1: lấy local media, join bằng ACK, lưu selfId;
    // tạo một peer cho từng người có sẵn; xử lý peer-joined/left/signal.
    throw new Error("TODO M1: triển khai join và vòng đời Mesh.");
  }
  setMicEnabled(enabled) { this.media.setMicEnabled(enabled); }
  setCameraEnabled(enabled) { this.media.setCameraEnabled(enabled); }
  async startScreenShare() {
    // TODO M2: capture, replaceTrack toàn bộ peers, rollback nếu lỗi;
    // peer mới phải nhận screen track; ended phải khôi phục camera.
    throw new Error("TODO M2: chia sẻ màn hình tới các peer.");
  }
  async stopScreenShare() {
    throw new Error("TODO M2: khôi phục camera trên toàn bộ peer.");
  }
  async setVideoBitrate(bitsPerSecond) {
    void bitsPerSecond;
    throw new Error("TODO M3: áp dụng bitrate trên mọi video sender.");
  }
  leave() {
    // TODO M1: báo server và gỡ listener trước khi tái sử dụng client.
    for (const peer of this.peers.values()) peer.close();
    this.peers.clear();
    this.screen.stop();
    this.media.stop();
    this.roomId = null;
    this.selfId = null;
  }
}
