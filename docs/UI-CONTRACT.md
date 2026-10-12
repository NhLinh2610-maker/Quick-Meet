# Hợp đồng dự kiến với thành viên 3

API sau là mục tiêu triển khai; MeshClient hiện mới có bộ khung.
UI gọi facade thay vì trực tiếp đụng RTCPeerConnection.

| Method | Ý nghĩa |
| --- | --- |
| join({ roomId, displayName }) | Capture, join ACK, kết nối các peer |
| setMicEnabled(boolean) | Bật/tắt audio track local |
| setCameraEnabled(boolean) | Bật/tắt camera track local |
| startScreenShare() | Gọi từ click, đổi video track mọi peer |
| stopScreenShare() | Khôi phục camera ở mọi peer |
| setVideoBitrate(bitsPerSecond) | Giới hạn video sender mỗi peer |
| leave() | Báo server, đóng peer, stop thiết bị, gỡ listener |
| on(event, listener) | Đăng ký sự kiện; trả hàm unsubscribe |

| Event dự kiến của MeshClient | Payload | UI xử lý |
| --- | --- | --- |
| local-stream | MediaStream hoặc null | Preview muted |
| remote-stream | { peerId, stream } | Tạo/cập nhật ô video |
| peer-state | { peerId, connectionState } | Trạng thái kết nối |
| peer-left | { peerId } | Gỡ ô video |
| media-state | { micEnabled, cameraEnabled, screenSharing } | Đồng bộ nút |
| error | { code, message, peerId? } | Thông báo |

Mesh cần forward sự kiện của MediaManager/ScreenShareManager lên facade;
hiện chưa làm. local-stream preview giữ camera, screen-stream riêng có thể
được expose cho UI/recording khi thống nhất. Remote video đổi nội dung theo sender.

Với React, tạo client một lần bằng useRef và subscribe trong useEffect.
Cleanup effect gọi unsubscribe; khi thực sự rời phòng gọi leave.
Không khởi tạo socket hay PeerConnection ở mỗi render.
UI xử lý Promise rejection và khóa nút cho thao tác async để tránh double-click.
Không tự động xin share screen khi mount.

Camera off ở bản đầu chỉ tắt camera track. Khi đang share, màn hình vẫn được gửi.
Nút Dừng chia sẻ có ý nghĩa riêng; ghi rõ trên UI để người dùng hiểu.
Recording của thành viên 3 cần nhận đủ remote streams và mix audio/video riêng
nếu muốn ghi toàn cuộc họp; ghi một local stream không phải ghi cả cuộc họp.

Không truyền stream từ server: stream được tạo/nhận bằng API browser phía client.
Thông tin người tham gia, trạng thái mute từ xa cần protocol presence riêng,
không suy ra chỉ từ track.enabled phía nhận.
