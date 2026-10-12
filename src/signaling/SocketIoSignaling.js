// Adapter nhận socket do thành viên 1/UI khởi tạo.
// Socket.IO có giao thức riêng, không thay bằng new WebSocket(url).
export class SocketIoSignaling {
  constructor(socket) { this.socket = socket; }
  on(event, handler) {
    this.socket.on(event, handler);
    return () => this.socket.off(event, handler);
  }
  joinRoom({ roomId, displayName }) {
    return this.socket.timeout(5000).emitWithAck("room:join", { roomId, displayName });
  }
  sendSignal({ roomId, to, payload }) {
    this.socket.emit("webrtc:signal", { roomId, to, payload });
  }
  leaveRoom(roomId) { this.socket.emit("room:leave", { roomId }); }
}
