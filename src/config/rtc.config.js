// Bản đầu chạy LAN. Điền STUN/TURN sau khi thống nhất với nhóm.
// Không đưa thông tin xác thực TURN dài hạn vào repository.
export const rtcConfiguration = {
  iceServers: [],
  iceTransportPolicy: "all"
};
// Đây là giới hạn video cho MỖI peer, không phải tổng upload.
export const defaultVideoBitrate = 800_000; // bit/giây
