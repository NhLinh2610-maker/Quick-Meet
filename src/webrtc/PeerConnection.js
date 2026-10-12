import { Emitter } from "../utils/Emitter.js";

// BỘ KHUNG: chưa thiết lập được cuộc gọi.
// Một instance tương ứng một người ở đầu bên kia.
export class PeerConnection extends Emitter {
  constructor({ peerId, polite, rtcConfiguration, sendSignal }) {
    super();
    this.peerId = peerId;
    this.polite = polite;
    this.rtcConfiguration = rtcConfiguration;
    this.sendSignal = sendSignal;
    this.pc = null;
    this.pendingCandidates = [];
    this.makingOffer = false;
    this.ignoreOffer = false;
    this.isSettingRemoteAnswerPending = false;
  }
  async initialize(localStream) {
    void localStream;
    // TODO P1: tạo RTCPeerConnection; addTrack; wire ontrack,
    // onicecandidate, onnegotiationneeded, onconnectionstatechange.
    throw new Error("TODO P1: triển khai PeerConnection.initialize()");
  }
  async handleSignal(payload) {
    void payload;
    // TODO P2: perfect negotiation, setRemoteDescription, answer;
    // xếp ICE vào hàng đợi khi remoteDescription chưa có.
    throw new Error("TODO P2: triển khai SDP/ICE và xử lý offer collision.");
  }
  async replaceVideoTrack(track) {
    void track;
    // TODO P3: lấy video sender và await sender.replaceTrack(track).
    throw new Error("TODO P3: triển khai hoán đổi track camera/màn hình.");
  }
  async getStats() {
    if (!this.pc) throw new Error("Peer chưa được khởi tạo.");
    return this.pc.getStats();
  }
  close() {
    this.pc?.close();
    this.pc = null;
    this.pendingCandidates.length = 0;
    this.clear();
  }
}
