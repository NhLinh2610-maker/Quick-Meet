# Lộ trình hoàn thiện

## 1. Xác nhận và chạy media local

Chạy demo, cấp quyền, thử deny quyền, kiểm tra indicator camera/micro tắt
sau khi giải phóng thiết bị. Đọc MediaManager và ScreenShareManager trước.
Code capture đã có; không coi syntax check là kiểm chứng phần cứng.

## 2. Chốt protocol với thành viên 1

Đối chiếu SIGNALING.md và server hiện tại. Cập nhật SocketIoSignaling;
tạo trang thử gọi 2 người sử dụng server đó. Chưa thêm chat/recording.

## 3. Hoàn thiện PeerConnection (P1, P2)

- Tạo pc từ rtcConfiguration, addTrack cho audio/video.
- Wire icecandidate, track, connectionstatechange và negotiationneeded.
- Perfect negotiation: makingOffer, ignoreOffer, polite,
  isSettingRemoteAnswerPending; serialize các xử lý signal cho mỗi peer.
- Send localDescription, xử lý remote SDP, tạo Answer; đệm và flush ICE.
- ontrack dùng event.streams[0] hoặc tự gom track khi streams rỗng.
- Close giải phóng pc, listeners và hàng đợi.

Đạt khi 2 máy gọi được hai chiều, log không có lỗi ICE/SDP,
và không duplicate video hay peer.

## 4. Hoàn thiện MeshClient (M1)

Map peerId → PeerConnection, join ACK, peers ban đầu, peer-joined,
peer-left, xử lý signaling disconnect, gỡ listener khi leave.
Giới hạn phòng do server enforce. Forward các event tới UI.

Đạt khi 3-5 người kết nối đủ; join/rời/đóng tab không còn peer rác;
rời rồi join lại không sinh listeners trùng.

## 5. Ghép chia sẻ màn hình (P3, M2)

Capture screen từ click. Giữ video sender tham chiếu ổn định.
replaceTrack trên toàn bộ peers, rollback các sender đã đổi nếu một peer lỗi.
Khôi phục camera khi ended. Người mới nhận active video track.
Serialize start/stop; xử lý leave trong lúc browser đang hỏi quyền capture.
Giữ audio mic và trạng thái camera đã mute; không stop camera chỉ vì đang share.

## 6. Băng thông và stats (M3)

Ghép setVideoBitrate, lưu trần cho peer mới và áp lại sau renegotiation.
Đo getStats, tốc độ gửi = 8 × delta(bytesSent) / delta(thời gian giây).
Kiểm tra trên mạng thật với bitrate thấp/cao; ghi bối cảnh và số peer.
Không sửa SDP bằng cách nối chuỗi để đặt bitrate ở bản đầu.

## 7. Tích hợp và bàn giao

Ghép API với UI của thành viên 3. Cấu hình STUN/TURN và HTTPS cùng nhóm.
Chạy TESTING.md; điền kết quả thực tế. Bàn giao src/, hợp đồng API,
protocol cuối cùng, hướng dẫn cấu hình và bằng chứng cuộc gọi 3-5 người.

Phần cần thống nhất thêm sau bản đầu: camera-only/audio-only fallback,
đổi thiết bị giữa cuộc gọi, ICE restart, tự động reconnect, xử lý capture
bị thiết bị khác chiếm dụng, và chiến lược chất lượng khi nhiều peer.
